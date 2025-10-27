<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WeekPattern extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'saturday_pattern_id',
        'sunday_pattern_id',
        'monday_pattern_id',
        'tuesday_pattern_id',
        'wednesday_pattern_id',
        'thursday_pattern_id',
        'friday_pattern_id',
    ];


    /**
     * دریافت الگوی کاری (اتمی) برای روز شنبه.
     */
    public function saturdayPattern(): BelongsTo
    {
        return $this->belongsTo(WorkPattern::class, 'saturday_pattern_id');
    }

    /**
     * دریافت الگوی کاری (اتمی) برای روز یکشنبه.
     */
    public function sundayPattern(): BelongsTo
    {
        return $this->belongsTo(WorkPattern::class, 'sunday_pattern_id');
    }

    /**
     * دریافت الگوی کاری (اتمی) برای روز دوشنبه.
     */
    public function mondayPattern(): BelongsTo
    {
        return $this->belongsTo(WorkPattern::class, 'monday_pattern_id');
    }

    /**
     * دریافت الگوی کاری (اتمی) برای روز سه‌شنبه.
     */
    public function tuesdayPattern(): BelongsTo
    {
        return $this->belongsTo(WorkPattern::class, 'tuesday_pattern_id');
    }

    /**
     * دریافت الگوی کاری (اتمی) برای روز چهارشنبه.
     */
    public function wednesdayPattern(): BelongsTo
    {
        return $this->belongsTo(WorkPattern::class, 'wednesday_pattern_id');
    }

    /**
     * دریافت الگوی کاری (اتمی) برای روز پنجشنبه.
     */
    public function thursdayPattern(): BelongsTo
    {
        return $this->belongsTo(WorkPattern::class, 'thursday_pattern_id');
    }

    /**
     * دریافت الگوی کاری (اتمی) برای روز جمعه.
     */
    public function fridayPattern(): BelongsTo
    {
        return $this->belongsTo(WorkPattern::class, 'friday_pattern_id');
    }

    /**
     * یک الگوی هفتگی می‌تواند به چندین گروه کاری اختصاص داده شود.
     */
    public function workGroups(): HasMany // <-- اضافه کنید
    {
        return $this->hasMany(WorkGroup::class);
    }

    /**
     * یک الگوی هفتگی می‌تواند مستقیماً به چندین کارمند اختصاص داده شود.
     */
    public function employees(): HasMany // <-- اضافه کنید
    {
        return $this->hasMany(Employees::class);
    }

}
