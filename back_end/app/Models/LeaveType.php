<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Staudenmeir\LaravelAdjacencyList\Eloquent\HasRecursiveRelationships;

class LeaveType extends Model
{
    use HasFactory,HasRecursiveRelationships;

    protected $fillable = [
        'name',
        'parent_id'
    ];

    /**
     * هر نوع مرخصی می‌تواند در درخواست‌های متعددی استفاده شود.
     */
    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }
}
