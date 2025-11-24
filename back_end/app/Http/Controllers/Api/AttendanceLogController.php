<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Device;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AttendanceLogController extends Controller
{
    public function handleAiRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'device_api_key' => ['required', 'string'],
            'personnel_code' => ['required', 'string', 'exists:employees,personnel_code'],
            'event_type' => ['required', 'string', Rule::in([AttendanceLog::TYPE_CHECK_IN, AttendanceLog::TYPE_CHECK_OUT])],
            'timestamp' => ['required', 'date_format:Y-m-d H:i'],
            'source_name'=> ['nullable', 'string'],
        ]);

        if ($validator->fails())
        {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();


        $device = Device::where('api_key', $validated['device_api_key'])->first();
        if (!$device)
        {
            return response()->json(['message' => 'Invalid API Key.'], 401);
        }
        if ($device->status !== 'online')
        {
            return response()->json(['message' => 'Device is not active.'], 403);
        }

        $employee = Employee::where('personnel_code', $validated['personnel_code'])->first();
        $logTimestamp = Carbon::parse($validated['timestamp']);


        // end check
        $schedule = $employee->getWorkScheduleFor($logTimestamp);

        $lateness_minutes = 0;
        $early_departure_minutes = 0;

        if ($schedule)
        {

            $floatingStart = 0;
            $floatingEnd = 0;

            if ($schedule->shiftSchedule)
            {
                $floatingStart = (int) $schedule->shiftSchedule->floating_start;
                $floatingEnd = (int) $schedule->shiftSchedule->floating_end;
            }
            elseif ($employee->weekPattern)
            {
                $floatingStart = (int) $employee->weekPattern->floating_start;
                $floatingEnd = (int) $employee->weekPattern->floating_end;
            }

            $expectedStart = $schedule->expected_start_time ? Carbon::parse($schedule->expected_start_time) : null;
            $expectedEnd = $schedule->expected_end_time ? Carbon::parse($schedule->expected_end_time) : null;

            if ($validated['event_type'] == AttendanceLog::TYPE_CHECK_IN && $expectedStart) {

                if ($logTimestamp->gt($expectedStart))
                {
                    $diffInMinutes = $expectedStart->diffInMinutes($logTimestamp);

                    if ($diffInMinutes <= $floatingStart)
                    {
                        $lateness_minutes = 0;
                    }
                    else
                    {
                        $lateness_minutes = $diffInMinutes;
                    }
                }
            }

            elseif ($validated['event_type'] == AttendanceLog::TYPE_CHECK_OUT && $expectedEnd)
            {

                if ($logTimestamp->lt($expectedEnd))
                {
                    $diffInMinutes = $expectedEnd->diffInMinutes($logTimestamp);

                    if ($diffInMinutes <= $floatingEnd)
                    {
                        $early_departure_minutes = 0;
                    }
                    else
                    {
                        $early_departure_minutes = $diffInMinutes;
                    }
                }
            }
        }

        $log = AttendanceLog::create([
            'employee_id' => $employee->id,
            'timestamp' => $logTimestamp->toDateTimeString(),
            'event_type' => $validated['event_type'],
            'device_id' => $device->id,
            'source_name' => $validated['source_name'] ?? $device->name,
            'source_type' => 'auto',
            'lateness_minutes' => $lateness_minutes,
            'early_departure_minutes' => $early_departure_minutes,
            'remarks' => $validated['source_name'],
        ]);

        return response()->json([
            'message' => 'Attendance log created successfully',
            'log_id' => $log->id,
            'calculated_lateness' => $lateness_minutes,
            'calculated_early_departure' => $early_departure_minutes
        ], 201);
    }
}