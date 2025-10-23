<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduleSlot extends Model
{
    use HasFactory;

    protected $fillable =
        [
            'shift_schedule_id',
            'day_in_cycle',
            'work_pattern_id'
        ];


    public function schedule(): BelongsTo
    {
        return $this->belongsTo(ShiftSchedule::class);
    }

    public function workPattern(): BelongsTo
    {
        return $this->belongsTo(WorkPattern::class);
    }

}
