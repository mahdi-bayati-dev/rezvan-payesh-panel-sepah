<?php

namespace App\Jobs;

use App\Models\Employees;
use App\Models\ScheduleSlot;
use App\Models\WeekPattern;
use App\Models\WorkPattern;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PruneOrphanWorkPatterns implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     * این جاب الگوهای کاری اتمی (WorkPattern) را که
     * در هیچ کجا استفاده نشده‌اند، پاکسازی می‌کند.
     */
    public function handle(): void
    {
        try {
            $usedInWeekPatterns = WeekPattern::query()
                ->select([
                    'saturday_pattern_id', 'sunday_pattern_id', 'monday_pattern_id',
                    'tuesday_pattern_id', 'wednesday_pattern_id', 'thursday_pattern_id', 'friday_pattern_id'
                ])
                ->get()
                ->flatMap(function ($row) {
                    return $row->toArray();
                })
                ->unique()
                ->filter();


            $usedInSlots = ScheduleSlot::query()
                ->distinct()
                ->whereNotNull('work_pattern_id')
                ->pluck('work_pattern_id');


            $usedInEmployees = Employees::query()
                ->distinct()
                ->whereNotNull('work_pattern_id')
                ->pluck('work_pattern_id');

            $allUsedIds = $usedInWeekPatterns
                ->merge($usedInSlots)
                ->merge($usedInEmployees)
                ->unique();

            $deletedCount = WorkPattern::query()
                ->whereNotIn('id', $allUsedIds)
                ->delete();

            if ($deletedCount > 0) {
                Log::info("[PruneOrphanWorkPatterns] Successfully pruned {$deletedCount} orphan work patterns.");
            } else {
                Log::info("[PruneOrphanWorkPatterns] No orphan work patterns found to prune.");
            }

        } catch (\Exception $e) {
            Log::error("[PruneOrphanWorkPatterns] Failed to prune work patterns: " . $e->getMessage());
        }
    }
}
