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
            'timestamp' => ['required', 'date_format:Y-m-d H:i:s'],
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
        $dateOnly = $logTimestamp->toDateString();


        // end check
        $schedule = $employee->getWorkScheduleFor($logTimestamp);

        $lateness_minutes = 0;
        $early_departure_minutes = 0;

        // آیا لاگ قبلی برای امروز وجود داره؟
        $todaysLogs = AttendanceLog::where('employee_id', $employee->id)
            ->whereDate('timestamp', $dateOnly)
            ->orderBy('timestamp', 'desc')
            ->get();
        $lastLog = $todaysLogs->first();
        $hasPriorCheckIn = $todaysLogs->where('event_type', AttendanceLog::TYPE_CHECK_IN)->isNotEmpty();

        if ($schedule)
        {

            $floatingStart = $schedule->floating_start ?? 0;
            $floatingEnd = $schedule->floating_end ?? 0;


            $expectedStart = isset($schedule->expected_start) ? Carbon::parse($schedule->expected_start) : null;
            $expectedEnd = isset($schedule->expected_end) ? Carbon::parse($schedule->expected_end) : null;




            if ($validated['event_type'] == AttendanceLog::TYPE_CHECK_IN && $expectedStart)
            {
                // کارمند رفته بیرون و بعد برگشته سر کار
                if ($lastLog && $lastLog->event_type == AttendanceLog::TYPE_CHECK_OUT)
                {
                    // اگر کارمند زودتر جیم شده و یک تعجیل ثبت شده براش تعجیل را 0 میکنیم
                    if ($lastLog->early_departure_minutes > 0)
                    {
                        $lastLog->early_departure_minutes = 0;
                        $lastLog->save();
                    }
                    // فاصله گپ بین خروج کارمند و ورود دوباره اش محاسبه میشود
                    $lastExitTime = Carbon::parse($lastLog->timestamp);
                    $gapMinutes = $lastExitTime->diffInMinutes($logTimestamp);
                    $lateness_minutes = $gapMinutes;
                }
                elseif (!$hasPriorCheckIn && $logTimestamp->gt($expectedStart))
                {
                    $diffInMinutes = $expectedStart->diffInMinutes($logTimestamp);

                    if ($diffInMinutes > $floatingStart)
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

                    if ($diffInMinutes > $floatingEnd)
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