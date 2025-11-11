<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Staudenmeir\LaravelAdjacencyList\Eloquent\HasRecursiveRelationships;

class LeaveType extends Model
{
    use HasFactory,HasRecursiveRelationships;

    protected $fillable = [
        'name',
        'parent_id',
        'description',
    ];


    /**
     * رابطه‌ی بازگشتی: والد این نوع مرخصی
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class, 'parent_id');
    }

    /**
     * رابطه‌ی بازگشتی: فرزندان مستقیم این نوع مرخصی
     */

    public function children(): HasMany
    {
        return $this->hasMany(LeaveType::class, 'parent_id');
    }

    /**
     * رابطه‌ی بازگشتی تودرتو: برای دریافت تمام فرزندان و نوه‌ها و...
     * این متد برای ساختن درخت در خروجی JSON استفاده می‌شود.
     */
    public function allChildren(): HasMany
    {
        // این رابطه به صورت بازگشتی تمام فرزندان را load می‌کند
        return $this->children()->with('allChildren');
    }

    /**
     * هر نوع مرخصی می‌تواند در درخواست‌های متعددی استفاده شود.
     */
    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }
}
