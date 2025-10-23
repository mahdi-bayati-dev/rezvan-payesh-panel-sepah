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
        'work_pattern_id',
    ];

    public function workPattern(): BelongsTo
    {
        return $this->belongsTo(WorkPattern::class);
    }

    public function employee() : HasMany
    {
        return $this->hasMany(Employees::class);
    }
}
