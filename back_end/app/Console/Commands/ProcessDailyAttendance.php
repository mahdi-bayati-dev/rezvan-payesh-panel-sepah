<?php

namespace App\Console\Commands;

use App\Models\AttendanceLog;
use App\Models\DailyAttendanceSummary;
use App\Models\Employee;
use App\Models\Holiday;
use App\Models\LeaveRequest;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class ProcessDailyAttendance extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:reconcile {--date=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Calculates and saves the final attendance status for all employees for the previous day.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $date = $this->option('date') ? Carbon::parse($this->option('date')) : Carbon::yesterday();
        $this->info("Processing attendance for shifts starting on: " . $date->toDateString());

        $isHoliday = Holiday::where('date', $date->toDateString())->exists();

        $employees = Employee::all();
        $this->info("Found " . $employees->count() . " employees...");

        foreach ($employees as $employee)
        {

            if ($isHoliday)
            {
                $this->createSummary($employee, $date, 'holiday');
                continue;
            }

            $schedule = $employee->getWorkScheduleFor($date);

            if (!$schedule)
            {
                $this->createSummary($employee, $date, 'off_day');
                continue;
            }

            $approvedLeaves = $employee->leaveRequests()
                ->where('status', LeaveRequest::STATUS_APPROVED)
                ->where('start_time', '<', $schedule->expected_end)
                ->where('end_time', '>', $schedule->expected_start)
                ->orderBy('start_time', 'asc')
                ->get();

            $adjustedStart = $schedule->expected_start->copy();
            $adjustedEnd = $schedule->expected_end->copy();
            $isFullDayLeave = false;

            foreach ($approvedLeaves as $leave)
            {

                if ($leave->start_time <= $schedule->expected_start && $leave->end_time >= $schedule->expected_end)
                {
                    $isFullDayLeave = true;
                    break;
                }

                if ($leave->start_time <= $adjustedStart && $leave->end_time > $adjustedStart)
                {
                    $adjustedStart = $leave->end_time;
                }

                if ($leave->end_time >= $adjustedEnd && $leave->start_time < $adjustedEnd)
                {
                    $adjustedEnd = $leave->start_time;
                }

            }

            if ($isFullDayLeave)
            {
                $this->createSummary($employee, $date, 'on_leave', $schedule, $approvedLeaves->first());
                continue;
            }

            $logs = $employee->attendanceLogs()
                ->whereBetween('timestamp', [$schedule->expected_start, $schedule->expected_end])
                ->orderBy('timestamp', 'asc')
                ->get();

            $firstCheckIn = $logs->firstWhere('event_type', AttendanceLog::TYPE_CHECK_IN);
            $lastCheckOut = $logs->lastWhere('event_type', AttendanceLog::TYPE_CHECK_OUT);

            if ($firstCheckIn)
            {

                $lateness = max(0, $firstCheckIn->timestamp->diffInMinutes($adjustedStart));
                $earlyDeparture = null;

                if ($lastCheckOut)
                {

                    $earlyDeparture = max(0, $adjustedEnd->diffInMinutes($lastCheckOut->timestamp));
                }

                $status = $approvedLeaves->isNotEmpty() ? 'present_with_leave' : 'present';

                $this->createSummary($employee, $date, $status, $schedule, $approvedLeaves->first(), $firstCheckIn, $lastCheckOut, $lateness, $earlyDeparture);

            }
            else
            {

                $this->createSummary($employee, $date, 'absent', $schedule, $approvedLeaves->first());
            }
        }

        $this->info("Attendance reconciliation complete.");
        return 0;
    }

    /**
     * متد کمکی برای ایجاد یا به‌روزرسانی رکورد خلاصه
     */
    private function createSummary(Employee $employee, Carbon $date, string $status, ?object $schedule = null, ?LeaveRequest $leave = null, ?AttendanceLog $in = null, ?AttendanceLog $out = null, ?int $lateness = null, ?int $early = null)
    {
        DailyAttendanceSummary::updateOrCreate(
            [
                'employee_id' => $employee->id,
                'date' => $date->toDateString(),
            ],
            [
                'status' => $status,
                'expected_start_time' => $schedule?->expected_start->toTimeString(),
                'expected_end_time' => $schedule?->expected_end->toTimeString(),
                'actual_check_in' => $in?->timestamp,
                'actual_check_out' => $out?->timestamp,
                'lateness_minutes' => $lateness,
                'early_departure_minutes' => $early,
                'leave_request_id' => $leave?->id,
                'remarks' => $status == 'absent' ? 'Employee did not check in on their shift.' : null,
            ]
        );
    }
}
