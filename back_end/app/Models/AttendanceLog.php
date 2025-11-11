<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceLog extends Model
{
    use HasFactory;

    public const TYPE_CHECK_IN = 'check_in';
    public const TYPE_CHECK_OUT = 'check_out';

    public const SOURCE_DEVICE = 'auto';
    public const SOURCE_MANUAL_ADMIN = 'manual';
    public const SOURCE_MANUAL_ADMIN_EDIT = 'manual_edit';


    protected $fillable = [
        'employee_id',
        'event_type',
        'timestamp',
        'source_name',
        'source_type',
        'edited_by_user_id',
        'remarks',
        'device_id',
        'is_allowed',
        'lateness_minutes',
        'early_departure_minutes',
    ];


    /**
     * هر لاگ تردد به یک کارمند تعلق دارد.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * کاربری (ادمین) که این رکورد را دستی ویرایش کرده.
     */
    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'edited_by_user_id');
    }



    protected $casts = [
        'timestamp' => 'datetime',
    ];


    // --- --- ---
    //    Scopes
    // --- --- ---

    /**
     * Scope برای فیلتر کردن فقط لاگ‌های ورود
     *
     */
    public function scopeCheckIns($query)
    {
        return $query->where('event_type', self::TYPE_CHECK_IN);
    }

    /**
     * Scope برای فیلتر کردن فقط لاگ‌های خروج
     *
     */
    public function scopeCheckOuts($query)
    {
        return $query->where('event_type', self::TYPE_CHECK_OUT);
    }


}
