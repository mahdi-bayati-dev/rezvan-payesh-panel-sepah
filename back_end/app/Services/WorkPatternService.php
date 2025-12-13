<?php

namespace App\Services;

use App\Models\WorkPattern;
use Illuminate\Support\Carbon;

class WorkPatternService
{
    /**
     * یک الگوی کاری (شیفت) را بر اساس زمان شروع و پایان پیدا یا ایجاد می‌کند.
     * اگر الگوی قبلی وجود داشته باشد، اطلاعات آن (مخصوصاً مدت زمان) را به‌روزرسانی می‌کند.
     *
     * @param array $attributes آرایه‌ای شامل 'start_time', 'end_time', 'name', و اختیاری 'work_duration_minutes'
     * @return WorkPattern
     */
    public function findOrCreatePattern(array $attributes): WorkPattern
    {

        $startTimeStr = Carbon::parse($attributes['start_time'])->format('H:i:s');
        $endTimeStr = Carbon::parse($attributes['end_time'])->format('H:i:s');


        if (isset($attributes['work_duration_minutes'])) {

            $workDuration = $attributes['work_duration_minutes'];
        }
        else {

            $start = Carbon::parse($startTimeStr);
            $end = Carbon::parse($endTimeStr);


            if ($end->lt($start)) {
                $end->addDay();
            }

            $workDuration = $end->diffInMinutes($start);
        }


        $workDuration = abs($workDuration);

        $workPattern = WorkPattern::firstOrNew([
            'start_time' => $startTimeStr,
            'end_time' => $endTimeStr,
        ]);


        $workPattern->name = $attributes['name'];
        $workPattern->type = $attributes['type'] ?? 'fixed';
        $workPattern->work_duration_minutes = $workDuration;

        $workPattern->save();

        return $workPattern;
    }
}