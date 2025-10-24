<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveRequest extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'employee_id',
        'leave_type_id',
        'start_time',
        'end_time',
        'status',
        'processed_by_user_id',
        'processed_at',
        'reason',
        'rejection_reason',

    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'processed_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employees::class);
    }

    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }

    /**
     * هر درخواست توسط یک کاربر (مدیر) پردازش شده است.
     *
     * @return BelongsTo
     */
    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by_user_id');
    }

    // --- --- --- --- --- ---
    //    Scope ها (Scopes)
    // --- --- --- --- --- ---

    /**
     * Scope برای فیلتر کردن درخواست‌های در انتظار.
     * (مثال: LeaveRequest::pending()->get())
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }


    /**
     * Scope برای فیلتر کردن درخواست‌های تایید شده.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    /**
     * Scope برای فیلتر کردن درخواست‌های رد شده.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    // --- --- --- --- --- ---
    //    متدهای کمکی (Helpers)
    // --- --- --- --- --- ---

    /**
     * محاسبه مدت زمان مرخصی به صورت خوانا.
     * (این یک مثال است و می‌تواند پیچیده‌تر شود)
     *
     * @return string
     */
    public function getDurationForHumansAttribute(): string
    {
        // از متدهای Carbon برای محاسبه اختلاف استفاده می‌کنیم
        return $this->start_time->diffForHumans($this->end_time, true); // مثلا: "2 days" or "3 hours"
    }

    /**
     * بررسی اینکه آیا درخواست هنوز در انتظار است یا خیر.
     *
     * @return bool
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }



}
