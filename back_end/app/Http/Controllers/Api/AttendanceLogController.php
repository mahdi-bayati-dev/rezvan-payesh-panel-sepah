<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Device;
use App\Models\Employee;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AttendanceLogController extends Controller
{
    /**
     * هندل کردن درخواست‌های ارسالی از دستگاه‌های حضور و غیاب یا سرویس AI
     */
    public function handleAiRequest(Request $request)
    {
        // ۱. اعتبارسنجی ورودی
        $validator = Validator::make($request->all(), [
            'device_api_key' => ['required', 'string'],
            'personnel_code' => ['required', 'string', 'exists:employees,personnel_code'],
            'event_type' => ['required', 'string', Rule::in([AttendanceLog::TYPE_CHECK_IN, AttendanceLog::TYPE_CHECK_OUT])],
            'timestamp' => ['required', 'date_format:Y-m-d H:i:s'], // فرمت دقیق‌تر با ثانیه
            'source_name'=> ['nullable', 'string'], // شاید دستگاه اسم نفرستد
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();

        $device = Device::where('api_key', $validated['device_api_key'])->first();
        if (!$device) {
            return response()->json(['message' => 'Invalid API Key.'], 401);
        }
        if ($device->status !== 'online') { // معمولاً active استفاده می‌شود، نه online
            return response()->json(['message' => 'Device is not active.'], 403);
        }

        $employee = Employee::where('personnel_code', $validated['personnel_code'])->first();

        $logTimestamp = Carbon::parse($validated['timestamp']);

        $schedule = $employee->getWorkScheduleFor($logTimestamp);
        $lateness_minutes = 0;
        $early_departure_minutes = 0;


        if ($schedule) {
            if ($validated['event_type'] == AttendanceLog::TYPE_CHECK_IN) {

                if ($schedule->override_start_time && $logTimestamp->gt($schedule->override_start_time))
                {
                     $lateness_minutes = $logTimestamp->diffInMinutes($schedule->override_start_time);
                }
            }
            elseif ($validated['event_type'] == AttendanceLog::TYPE_CHECK_OUT)
            {
                if ($schedule->override_end_time && $logTimestamp->lt($schedule->override_end_time)) {
                    $early_departure_minutes = $schedule->override_end_time->diffInMinutes($logTimestamp);
                }
            }
        }

        $log = AttendanceLog::firstOrCreate(
            [
                'employee_id' => $employee->id,
                'timestamp' => $logTimestamp->toDateTimeString(),
                'event_type' => $validated['event_type'],
            ],
            [
                'device_id' => $device->id,
                'source_name' => $validated['source_name'] ?? $device->name,
                'source_type' => 'device',
                'lateness_minutes' => $lateness_minutes,
                'early_departure_minutes' => $early_departure_minutes,
                'remarks' => 'Auto-registered by Device/AI',
            ]
        );

        if (!$log->wasRecentlyCreated)
        {
            return response()->json([
                'message' => 'Duplicate attendance log. The log already exists.',
                'log_id' => $log->id,
            ], 409);
        }

        return response()->json([
            'message' => 'Attendance log created successfully',
            'log_id' => $log->id,
            'calculated_lateness' => $lateness_minutes,
            'calculated_early_departure' => $early_departure_minutes
        ], 201);
    }
}