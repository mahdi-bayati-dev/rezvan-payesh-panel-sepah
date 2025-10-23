<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkPattern extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'start_time',
        'end_time',
        'work_duration_minutes',
    ];

    protected $casts = [
        'type' => 'string',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
    ];

    public function workGroups(): HasMany
    {
        return $this->hasMany(WorkGroup::class);
    }
}
