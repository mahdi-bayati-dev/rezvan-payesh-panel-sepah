<?php

namespace App\Jobs;

use App\Models\Employee;
use App\Models\EmployeeShift;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ClearFutureShiftsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(protected int $workGroupId,
        protected int $oldScheduleId,
        protected Carbon $startDate
    )
    {

    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info("شروع فرآیند پاکسازی شیفت‌های آینده برای گروه {$this->workGroupId} از برنامه {$this->oldScheduleId}");
        $employeeIds = Employee::where('work_group_id', $this->workGroupId)
            ->whereNull('shift_schedule_id')
            ->pluck('id');
        if ($employeeIds->isEmpty())
        {
            Log::info("کارمندی برای پاکسازی یافت نشد.");
            return;
        }
        $deletedCount = EmployeeShift::whereIn('employee_id', $employeeIds)
            ->where('date', '>=', $this->startDate->startOfDay())
            ->where('source', 'scheduled')
            ->where('shift_schedule_id', $this->oldScheduleId)
            ->delete();

        Log::info("پاکسازی کامل شد. تعداد {$deletedCount} شیفت پاک شد.");

    }
}
