<?php

namespace App\Models;

use GeneaLabs\LaravelModelCaching\Traits\Cachable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeShift extends Model
{
    use HasFactory,Cachable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'employee_id',
        'date',
        'work_pattern_id', // ID شیفتی که به این روز اختصاص داده شده
        'is_off_day',
        'shift_schedule_id',
        'source',
        'expected_start_time',
        'expected_end_time',
    ];

    protected $casts = [
        'date' => 'date',
        'is_off_day' => 'boolean',
        'expected_start_time' => 'datetime',
        'expected_end_time' => 'datetime',
    ];

    /**
     * Get the employee that owns the shift.
     * ارتباط با کارمند
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the work pattern assigned for this day (if any).
     * ارتباط با شیفت (WorkPattern)
     * این رابطه می‌تواند null باشد.
     */
    public function workPattern(): BelongsTo
    {
        return $this->belongsTo(WorkPattern::class);
    }

    /**
     * ارتباط با برنامه شیفتی (ShiftSchedule)
     * این رابطه می‌تواند null باشد.
     */
    public function shiftSchedule(): BelongsTo
    {
        return $this->belongsTo(ShiftSchedule::class);
    }
}
