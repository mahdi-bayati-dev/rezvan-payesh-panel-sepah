<?php

namespace App\Services;

use App\Models\WorkPattern;
use Illuminate\Support\Carbon;

class WorkPatternService
{
    /**
     * یک الگوی کاری (شیفت) را بر اساس زمان شروع و پایان پیدا یا ایجاد می‌کند.
     *
     * @param array $attributes آرایه‌ای شامل 'start_time', 'end_time', و 'name'
     * @return WorkPattern
     */
    public function findOrCreatePattern(array $attributes): WorkPattern
    {
        $startTime = Carbon::parse($attributes['start_time'])->format('H:i:s');
        $endTime = Carbon::parse($attributes['end_time'])->format('H:i:s');

        $workDuration = Carbon::parse($startTime)->diffInMinutes(Carbon::parse($endTime));

        $workPattern = WorkPattern::firstOrCreate(
            [
                'start_time' => $startTime,
                'end_time' => $endTime,
            ],
            [
                'name' => $attributes['name'],
                'type' => $attributes['type'] ?? 'fixed',
                'work_duration_minutes' => $workDuration,
            ]
        );

        return $workPattern;
    }
}