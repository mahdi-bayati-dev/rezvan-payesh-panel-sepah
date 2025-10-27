<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employees extends Model
{
    use HasFactory,softDeletes;

    protected $fillable = [
        'user_id',
        'personnel_code',
        'position',
        'organization_id',
        'starting_job',
        'status',
        'first_name',
        'last_name',
        'father_name',
        'birth_date',
        'nationality_code',
        'gender',
        'is_married',
        'education_level',
        'phone_number',
        'house_number',
        'sos_number',
        'address',
        'work_group_id',
        'shift_schedule_id',
        'shift_offset',
        'week_pattern_id'
    ];

    protected $casts = [
        'is_married' => 'boolean',
        'birth_date' => 'date',
        'starting_job' => 'date',
    ];

    protected $appends = [
        'full_name',
    ];

    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn ($value, $attributes) => $attributes['first_name'] . ' ' . $attributes['last_name'],
        );
    }

    // --- --- --- --- --- ---
    //    روابط (Relationships)
    // --- --- --- --- --- ---

    /**
     * هر پروفایل کارمندی (Employee) به یک کاربر (User) تعلق دارد.
     * (رابطه یک-به-یک معکوس)
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * هر کارمند به یک واحد سازمانی (Organization) تعلق دارد.
     * (رابطه چند-به-یک معکوس)
     *
     * @return BelongsTo
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * هر کارمند می‌تواند درخواست‌های مرخصی متعددی داشته باشد.
     * 
     *
     * @return HasMany
     */
    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
        // نکته: باید مدل و میگریشن 'LeaveRequest' را بسازید
    }
    
    /**
     * هر کارمند، رکوردهای حضور و غیاب متعددی دارد.
     *
     * @return HasMany
     */
    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class);
        // نکته: باید مدل و میگریشن 'AttendanceLog' را بسازید
    }


    /**
     * هر کارمند به یک گروه کاری تعلق دارد.
     */
    public function workGroup(): BelongsTo
    {
        return $this->belongsTo(WorkGroup::class);
    }


    /**
     * برنامه کاری اختصاصی کارمند (اگر null باشد، از گروه ارث می‌برد)
     */
    public function shiftSchedule(): BelongsTo // <-- اضافه شد
    {
        return $this->belongsTo(ShiftSchedule::class);
    }

    public function weekPattern(): BelongsTo
    {
        return $this->belongsTo(WeekPattern::class);
    }

}
