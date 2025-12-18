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
     * Handle attendance log request from AI devices.
     * Calculates lateness and early departure considering approved leaves.
     */
    public function handleAiRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'device_api_key' => ['required', 'string'],
            'personnel_code' => ['required', 'string', 'exists:employees,personnel_code'],
            'event_type' => ['required', 'string', Rule::in([AttendanceLog::TYPE_CHECK_IN, AttendanceLog::TYPE_CHECK_OUT])],
            'timestamp' => ['required', 'date_format:Y-m-d H:i:s'],
            'source_name'=> ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();

        $device = Device::where('api_key', $validated['device_api_key'])->first();
        if (!$device) {
            return response()->json(['message' => 'Invalid API Key.'], 401);
        }
        if ($device->status !== 'online') {
            return response()->json(['message' => 'Device is not active.'], 403);
        }

        $employee = Employee::where('personnel_code', $validated['personnel_code'])->first();
        if (!$employee) {
            return response()->json(['message' => 'Invalid User personnel_code.'], 401);
        }

        $logTimestamp = Carbon::parse($validated['timestamp']);

        // Determine the correct shift (Today vs Yesterday for night shifts)
        $scheduleToday = $employee->getWorkScheduleFor($logTimestamp);
        $scheduleYesterday = $employee->getWorkScheduleFor($logTimestamp->copy()->subDay());

        $diffToday = 999999;
        $diffYesterday = 999999;

        if ($validated['event_type'] == AttendanceLog::TYPE_CHECK_IN) {
            if ($scheduleToday && $scheduleToday->expected_start) {
                $diffToday = abs($logTimestamp->diffInMinutes($scheduleToday->expected_start));
            }
            if ($scheduleYesterday && $scheduleYesterday->expected_start) {
                $diffYesterday = abs($logTimestamp->diffInMinutes($scheduleYesterday->expected_start));
            }
        } else {
            if ($scheduleToday && $scheduleToday->expected_end) {
                $diffToday = abs($logTimestamp->diffInMinutes($scheduleToday->expected_end));
            }
            if ($scheduleYesterday && $scheduleYesterday->expected_end) {
                $diffYesterday = abs($logTimestamp->diffInMinutes($scheduleYesterday->expected_end));
            }
        }

        // Assign schedule based on time proximity
        $schedule = ($diffYesterday < $diffToday) ? $scheduleYesterday : $scheduleToday;

        // Retrieve last log to check for re-entry logic
        $lastLog = AttendanceLog::where('employee_id', $employee->id)
            ->where('timestamp', '<', $logTimestamp)
            ->orderBy('timestamp', 'desc')
            ->first();

        $hasPriorCheckIn = false;
        if ($schedule && $schedule->expected_start) {
             // Check if there is any check-in within the current shift's window
             $hasPriorCheckIn = AttendanceLog::where('employee_id', $employee->id)
                ->where('timestamp', '>=', $schedule->expected_start->copy()->subHours(4))
                ->where('timestamp', '<', $logTimestamp)
                ->where('event_type', AttendanceLog::TYPE_CHECK_IN)
                ->exists();
        }

        $lateness_minutes = 0;
        $early_departure_minutes = 0;

        if ($schedule) {
            $expectedStart = $schedule->expected_start;
            $expectedEnd = $schedule->expected_end;
            $floatingStart = $schedule->floating_start ?? 0;
            $floatingEnd = $schedule->floating_end ?? 0;

            if ($validated['event_type'] == AttendanceLog::TYPE_CHECK_IN && $expectedStart) {
                // Scenario 1: Returning to work (Re-entry after temporary exit)
                if ($lastLog && $lastLog->event_type == AttendanceLog::TYPE_CHECK_OUT) {
                    // Reset previous early departure since employee returned
                    if ($lastLog->early_departure_minutes > 0) {
                        $lastLog->early_departure_minutes = 0;
                        $lastLog->save();
                    }

                    $lastExitTime = Carbon::parse($lastLog->timestamp);
                    $gapMinutes = $lastExitTime->diffInMinutes($logTimestamp);

                    // Deduct approved leave minutes from the gap
                    $approvedLeaveMinutes = $this->calculateApprovedLeaveMinutes(
                        $employee->id,
                        $lastExitTime,
                        $logTimestamp
                    );

                    $lateness_minutes = max(0, $gapMinutes - $approvedLeaveMinutes);
                }
                // Scenario 2: First check-in of the shift
                elseif (!$hasPriorCheckIn) {
                    if ($logTimestamp->gt($expectedStart)) {
                        $diffInMinutes = $expectedStart->diffInMinutes($logTimestamp);

                        if ($diffInMinutes > $floatingStart) {
                            // Deduct approved leave from the start of the shift
                            $approvedLeaveMinutes = $this->calculateApprovedLeaveMinutes(
                                $employee->id,
                                $expectedStart,
                                $logTimestamp
                            );

                            $lateness_minutes = max(0, $diffInMinutes - $approvedLeaveMinutes);
                        }
                    }
                }
            } elseif ($validated['event_type'] == AttendanceLog::TYPE_CHECK_OUT && $expectedEnd) {
                // Scenario 3: Early Departure
                if ($logTimestamp->lt($expectedEnd)) {
                    $diffInMinutes = abs($expectedEnd->diffInMinutes($logTimestamp));

                    if ($diffInMinutes > $floatingEnd) {
                        // Deduct approved leave from the end of the shift
                        $approvedLeaveMinutes = $this->calculateApprovedLeaveMinutes(
                            $employee->id,
                            $logTimestamp,
                            $expectedEnd
                        );

                        $early_departure_minutes = max(0, $diffInMinutes - $approvedLeaveMinutes);
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
            'calculated_early_departure' => $early_departure_minutes,
            'matched_schedule_start' => $schedule ? $schedule->expected_start->toDateTimeString() : null
        ], 201);
    }

    /**
     * Calculates the exact minutes of approved leave overlapping with a specific time interval.
     *
     * @param int $employeeId
     * @param Carbon $startInterval Start of the calculation window (e.g., shift start)
     * @param Carbon $endInterval End of the calculation window (e.g., check-in time)
     * @return int Minutes covered by approved leave
     */
    private function calculateApprovedLeaveMinutes(int $employeeId, Carbon $startInterval, Carbon $endInterval): int
    {
        $leaves = LeaveRequest::where('employee_id', $employeeId)
            ->where('status', LeaveRequest::STATUS_APPROVED)
            ->where(function ($query) use ($startInterval, $endInterval) {
                $query->where(function ($q) use ($startInterval, $endInterval) {
                    // Leave starts within the interval
                    $q->where('start_time', '>=', $startInterval)
                      ->where('start_time', '<', $endInterval);
                })
                ->orWhere(function ($q) use ($startInterval, $endInterval) {
                    // Leave ends within the interval
                    $q->where('end_time', '>', $startInterval)
                      ->where('end_time', '<=', $endInterval);
                })
                ->orWhere(function ($q) use ($startInterval, $endInterval) {
                    // Leave fully covers the interval
                    $q->where('start_time', '<=', $startInterval)
                      ->where('end_time', '>=', $endInterval);
                });
            })
            ->get();

        $totalCoveredMinutes = 0;

        foreach ($leaves as $leave) {
            // Calculate intersection
            $effectiveStart = $startInterval->max($leave->start_time);
            $effectiveEnd = $endInterval->min($leave->end_time);

            if ($effectiveStart->lt($effectiveEnd)) {
                $totalCoveredMinutes += $effectiveStart->diffInMinutes($effectiveEnd);
            }
        }

        return $totalCoveredMinutes;
    }
}