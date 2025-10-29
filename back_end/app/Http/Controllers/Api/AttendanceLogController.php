<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Device;
use App\Models\Employees;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AttendanceLogController extends Controller
{
    public function handleAiRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'device_api_key' => ['required', 'string'],
            'personnel_code' => ['required', 'string', 'exists:employees,personnel_code'], // اطمینان از وجود کارمند
            'event_type' => ['required', 'string', Rule::in([AttendanceLog::TYPE_CHECK_IN, AttendanceLog::TYPE_CHECK_OUT])],
            'timestamp' => ['required', 'date_format:Y-m-d H:i:s'],
            'source_name'=> ['required', 'string'],
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
        if ($device->status != 'online')
        {
            return response()->json(['message' => 'Device is not active.'], 403);
        }

        $employee = Employees::where('personnel_code', $validated['personnel_code'])->first();

        $log = AttendanceLog::create([
            'employee_id' => $employee->id,
            'event_type' => $validated['event_type'],
            'timestamp' => $validated['timestamp'],
            'device_id' => $device->id,
            'source_name' => $validated['source_name'],
            'source_type' => AttendanceLog::SOURCE_DEVICE,
            'edited_by_user_id' => null,
            'remarks' => null,
        ]);

        return response()->json([
            'message' => 'Attendance log created successfully',
            'log_id' => $log->id
        ], 201);

    }
}
