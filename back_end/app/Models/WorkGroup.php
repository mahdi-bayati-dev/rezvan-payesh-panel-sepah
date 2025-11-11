<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkGroup extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'week_pattern_id',
        'shift_schedule_id',
    ];

    public function weekPattern(): BelongsTo
    {
        return $this->belongsTo(WeekPattern::class);
    }


    public function shiftSchedule(): BelongsTo
    {
        return $this->belongsTo(ShiftSchedule::class);
    }

    public function employee() : HasMany
    {
        return $this->hasMany(Employee::class);
    }
}
