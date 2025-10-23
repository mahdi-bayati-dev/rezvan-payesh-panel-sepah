<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShiftSchedule extends Model
{
    use HasFactory;
    protected $fillable =
        [
            'name',
            'cycle_length_days',
            'cycle_start_date'
        ];
    protected $casts =
        [
            'cycle_start_date' => 'date'
        ];

    public function slots(): HasMany
    {
        return $this->hasMany(ScheduleSlot::class);
    }
}
