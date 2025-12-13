<?php

namespace App\Models;

use GeneaLabs\LaravelModelCaching\Traits\Cachable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Carbon;

class WorkPattern extends Model
{
    use HasFactory,Cachable;

    protected $fillable = [
        'name',
        'type',
        'start_time',
        'end_time',
        'work_duration_minutes',
    ];

    protected $casts = [
        'type' => 'string',
    ];

    /**
     * فرمت کردن start_time به H:i
     */
    protected function startTime(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? Carbon::parse($value)->format('H:i') : null,
            set: fn ($value) => $value ? Carbon::parse($value)->format('H:i:s') : null
        );
    }

    /**
     * فرمت کردن end_time به H:i
     */
    protected function endTime(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? Carbon::parse($value)->format('H:i') : null,
            set: fn ($value) => $value ? Carbon::parse($value)->format('H:i:s') : null
        );
    }

    public function workGroups(): HasMany
    {
        return $this->hasMany(WorkGroup::class);
    }
}
