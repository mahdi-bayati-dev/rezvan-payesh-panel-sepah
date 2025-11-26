<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceLogResource;
use App\Models\AttendanceLog;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AdminAttendanceLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', AttendanceLog::class);

        $query = AttendanceLog::with(['employee.user', 'editor','employee.images']);
        if ($request->has('employee_id'))
        {
            $query->where('employee_id', $request->employee_id);
        }
        if ($request->has('date_from'))
        {
            $query->where('timestamp', '>=', $request->date_from);
        }
        if ($request->has('date_to'))
        {
            $query->where('timestamp', '<=', $request->date_to);
        }
        $perPage = (int) $request->input('per_page', 20);
        if ($perPage > 100)
        {
            $perPage = 100;
        }
        $logs = $query->latest('timestamp')->paginate($perPage);
        return AttendanceLogResource::collection($logs);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', AttendanceLog::class);

        $validator = Validator::make($request->all(), [
            'employee_id' => ['required', 'exists:employees,id'],
            'event_type' => ['required', 'string', Rule::in([AttendanceLog::TYPE_CHECK_IN, AttendanceLog::TYPE_CHECK_OUT])],
            'timestamp' => ['required', 'date_format:Y-m-d H:i:s'],
            'remarks' => ['nullable', 'string', 'max:500'],
        ]);

        if ($validator->fails())
        {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $employee = Employee::findOrFail($data['employee_id']);

        $metrics = $this->calculateAttendanceMetrics($employee, $data['timestamp'], $data['event_type']);

        $log = AttendanceLog::create([
            'employee_id' => $data['employee_id'],
            'event_type' => $data['event_type'],
            'timestamp' => $data['timestamp'],
            'device_id' => null,
            'source_name' => 'Admin Panel (' . Auth::user()->name . ')',
            'source_type' => AttendanceLog::SOURCE_MANUAL_ADMIN,
            'remarks' => $data['remarks'],
            'edited_by_user_id' => Auth::id(),
            'lateness_minutes' => $metrics['lateness'],
            'early_departure_minutes' => $metrics['early_departure'],
        ]);

        return new AttendanceLogResource($log->load(['employee', 'editor']));
    }


     /**
     * Display the specified resource.
     */
    public function show(AttendanceLog $attendanceLog)
    {
        $this->authorize('view', $attendanceLog);
        return new AttendanceLogResource($attendanceLog->load(['employee', 'editor','employee.images']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AttendanceLog $attendanceLog)
    {
        $this->authorize('update', $attendanceLog);

        $validator = Validator::make($request->all(), [
            'event_type' => ['sometimes', 'required', 'string', Rule::in([AttendanceLog::TYPE_CHECK_IN, AttendanceLog::TYPE_CHECK_OUT])],
            'timestamp' => ['sometimes', 'required', 'date_format:Y-m-d H:i:s'],
            'remarks' => ['required', 'string', 'max:500'], // دلیل ویرایش همیشه الزامی است
        ]);

        if ($validator->fails())
        {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $dataToUpdate = $validator->validated();

        if (isset($dataToUpdate['timestamp']) || isset($dataToUpdate['event_type']))
        {
            $employee = $attendanceLog->employee;
            $timestamp = $dataToUpdate['timestamp'] ?? $attendanceLog->timestamp;
            $eventType = $dataToUpdate['event_type'] ?? $attendanceLog->event_type;

            $metrics = $this->calculateAttendanceMetrics($employee, $timestamp, $eventType);

            $dataToUpdate['lateness_minutes'] = $metrics['lateness'];
            $dataToUpdate['early_departure_minutes'] = $metrics['early_departure'];
        }

        $dataToUpdate['edited_by_user_id'] = $request->user()->id;
        $dataToUpdate['source_type'] = AttendanceLog::SOURCE_MANUAL_ADMIN_EDIT;

        $attendanceLog->update($dataToUpdate);

        return new AttendanceLogResource($attendanceLog->load(['employee', 'editor']));
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AttendanceLog $attendanceLog)
    {
        $this->authorize('delete', $attendanceLog);
        $attendanceLog->update([
             'edited_by_user_id' => Auth::id(),
            'is_allowed' => true
         ]);
        return new AttendanceLogResource($attendanceLog->load(['employee', 'editor']));
    }

    /**
     * تابع کمکی برای محاسبه تاخیر و تعجیل با منطق شناوری (Threshold Logic)
     */
    private function calculateAttendanceMetrics(Employee $employee, string $timestampString, string $eventType): array
    {
        $logTimestamp = Carbon::parse($timestampString);

        $schedule = $employee->getWorkScheduleFor($logTimestamp);

        $lateness = 0;
        $earlyDeparture = 0;

        if ($schedule)
        {
            $floatingStart = $schedule->floating_start ?? 0;
            $floatingEnd = $schedule->floating_end ?? 0;

            $expectedStart = isset($schedule->expected_start) ? Carbon::parse($schedule->expected_start) : null;
            $expectedEnd = isset($schedule->expected_end) ? Carbon::parse($schedule->expected_end) : null;

            if ($eventType == AttendanceLog::TYPE_CHECK_IN && $expectedStart)
            {
                if ($logTimestamp->gt($expectedStart))
                {
                    $diffInMinutes = $expectedStart->diffInMinutes($logTimestamp);


                    if ($diffInMinutes > $floatingStart) {
                        $lateness = $diffInMinutes;
                    }
                }
            }
            elseif ($eventType == AttendanceLog::TYPE_CHECK_OUT && $expectedEnd)
            {
                if ($logTimestamp->lt($expectedEnd))
                {
                    $diffInMinutes = $expectedEnd->diffInMinutes($logTimestamp);

                    if ($diffInMinutes > $floatingEnd) {
                        $earlyDeparture = $diffInMinutes;
                    }
                }
            }
        }

        return [
            'lateness' => $lateness,
            'early_departure' => $earlyDeparture
        ];
    }
}
