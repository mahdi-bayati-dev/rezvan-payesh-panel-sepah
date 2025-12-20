<?php

namespace App\Models;

use DateTimeInterface;
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
            'cycle_start_date',
            'ignore_holidays',
            'floating_start',
            'floating_end',
        ];
    protected $casts =
        [
            'cycle_start_date' => 'date',
            'ignore_holidays'=> 'boolean'
        ];
    protected function serializeDate(DateTimeInterface $date): string
    {
        return $date->format('Y-m-d H:i:s');
    }

    public function slots(): HasMany
    {
        return $this->hasMany(ScheduleSlot::class);
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    public function workGroups(): HasMany
    {
        return $this->hasMany(WorkGroup::class);
    }
}
