<?php

namespace App\Enums;

/**
 * وضعیت‌های نهایی در جدول خلاصه حضور و غیاب روزانه
 */
enum DailySummaryStatus: string
{
    case PRESENT = 'present';
    case PRESENT_WITH_LEAVE = 'present_with_leave';
    case ABSENT = 'absent';
    case ON_LEAVE = 'on_leave';
    case OFF_DAY = 'off_day';
    case HOLIDAY = 'holiday';
}