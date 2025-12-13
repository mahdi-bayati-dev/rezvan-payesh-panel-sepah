<?php

namespace App\Observers;

use App\Jobs\ClearFutureShiftsJob;
use App\Jobs\GenerateEmployeeShifts;
use App\Models\WorkGroup;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class WorkGroupObserver
{
    /**
     * Handle the WorkGroup "created" event.
     */
    public function created(WorkGroup $workGroup): void
    {
        //
    }

    /**
     * Handle the WorkGroup "updated" event.
     */
    public function updated(WorkGroup $workGroup): void
    {
        if ($workGroup->isDirty('shift_schedule_id'))
        {
            $newScheduleId = $workGroup->shift_schedule_id;
            $oldScheduleId = $workGroup->getOriginal('shift_schedule_id');
            if ($newScheduleId)
            {
                Log::info("برنامه شیفتی گروه {$workGroup->id} تغییر کرد. شروع بازآرایی آفست‌ها...");

                $schedule = $workGroup->shiftSchedule;

                if ($schedule && $schedule->cycle_length_days > 0)
                {
                    $cycleLength = $schedule->cycle_length_days;
                    $employees = $workGroup->employee()
                        ->whereNull('shift_schedule_id')
                        ->orderBy('id')
                        ->get();
                    foreach ($employees as $index => $employee)
                    {
                        $newOffset = $index % $cycleLength;
                        $employee->shift_offset = $newOffset;
                        $employee->saveQuietly();
                    }
                    Log::info("پایان بازآرایی آفست‌ها برای {$employees->count()} کارمند.");
                }
                GenerateEmployeeShifts::dispatch(
                    $newScheduleId,
                    Carbon::today(),
                    Carbon::today()->addDays(30)
                );
            }
            elseif($oldScheduleId)
            {
                Log::info("برنامه شیفتی {$oldScheduleId} از گروه {$workGroup->id} حذف شد.");
                ClearFutureShiftsJob::dispatch(
                    $workGroup->id,
                    $oldScheduleId,
                    Carbon::today()
                );
            }
        }
    }

    /**
     * Handle the WorkGroup "deleted" event.
     */
    public function deleted(WorkGroup $workGroup): void
    {
        //
    }

    /**
     * Handle the WorkGroup "restored" event.
     */
    public function restored(WorkGroup $workGroup): void
    {
        //
    }

    /**
     * Handle the WorkGroup "force deleted" event.
     */
    public function forceDeleted(WorkGroup $workGroup): void
    {
        //
    }
}
