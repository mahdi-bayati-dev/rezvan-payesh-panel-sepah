<?php

namespace App\Observers;

use App\Models\Employees;
use App\Models\ShiftSchedule;
use Illuminate\Support\Facades\DB;

class EmployeeObserver
{

    public function saving(Employees $employee)
    {
        if ($employee->isDirty('shift_schedule_id') || $employee->isDirty('work_group_id')) {

            $scheduleId = $employee->shift_schedule_id ?? $employee->workGroup?->shift_schedule_id;

            if ($scheduleId) {
                $employee->shift_offset = $this->findOptimalOffset($scheduleId);
            } else {
                $employee->shift_offset = 0;
            }
        }
    }

    private function findOptimalOffset($scheduleId)
    {
        $schedule = ShiftSchedule::find($scheduleId);
        if (!$schedule || $schedule->cycle_length_days <= 0) {
            return 0;
        }
        $cycleLength = $schedule->cycle_length_days;

        $counts = Employees::query()->where(function ($query) use ($scheduleId) {
                $query->where('shift_schedule_id', $scheduleId)->orWhereHas('workGroup', function ($q) use ($scheduleId) {
                        $q->where('shift_schedule_id', $scheduleId);
                    })->whereNull('shift_schedule_id');
            })->select('shift_offset', DB::raw('COUNT(*) as count'))->groupBy('shift_offset')->pluck('count', 'shift_offset');
        $minCount = PHP_INT_MAX;
        $optimalOffset = 0;
        for ($offset = 0; $offset < $cycleLength; $offset++) {
            $currentCount = $counts[$offset] ?? 0;

            if ($currentCount < $minCount) {
                $minCount = $currentCount;
                $optimalOffset = $offset;
            }
        }
        return $optimalOffset;
    }

    /**
     * Handle the Employees "created" event.
     */
    public function created(Employees $employees): void
    {
        //
    }

    /**
     * Handle the Employees "updated" event.
     */
    public function updated(Employees $employees): void
    {
        //
    }

    /**
     * Handle the Employees "deleted" event.
     */
    public function deleted(Employees $employees): void
    {
        //
    }

    /**
     * Handle the Employees "restored" event.
     */
    public function restored(Employees $employees): void
    {
        //
    }

    /**
     * Handle the Employees "force deleted" event.
     */
    public function forceDeleted(Employees $employees): void
    {
        //
    }
}
