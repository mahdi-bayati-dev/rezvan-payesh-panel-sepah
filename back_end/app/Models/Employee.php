<?php

namespace App\Models;

use GeneaLabs\LaravelModelCaching\Traits\Cachable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class Employee extends Model implements Auditable
{
    use HasFactory,softDeletes,Cachable,AuditableTrait;

    protected $auditEvents = [
        'updated',
        'deleted',
    ];

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


    public function images(): HasMany
    {
        return $this->hasMany(EmployeeImage::class);
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
    }
    
    /**
     * هر کارمند، رکوردهای حضور و غیاب متعددی دارد.
     *
     * @return HasMany
     */
    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class);
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
    public function shiftSchedule(): BelongsTo
    {
        return $this->belongsTo(ShiftSchedule::class);
    }

    public function weekPattern(): BelongsTo
    {
        return $this->belongsTo(WeekPattern::class);
    }
    public function employeeShifts(): HasMany
    {
        return $this->hasMany(EmployeeShift::class);
    }

    public function getWorkScheduleFor(Carbon $datetime): ?object
    {
        $date = $datetime->toDateString();


        $isHoliday = Holiday::where('date', $date)->exists();
        if ($isHoliday)
        {
            return null;
        }

        $specificShift = $this->employeeShifts()->where('date', $date)->first();

        if ($specificShift && $specificShift->scheduleSlot)
        {
            $slot = $specificShift->scheduleSlot;

            $startTime = Carbon::parse($date . ' ' . $slot->start_time);
            $endTime = Carbon::parse($date . ' ' . $slot->end_time);

            if ($endTime->lessThanOrEqualTo($startTime))
            {
                $endTime->addDay();
            }


            return (object) [
                'expected_start' => $startTime,
                'expected_end'   => $endTime,
                'floating_start' => 0, // مقدار پیش‌فرض
                'floating_end'   => 0, // مقدار پیش‌فرض
            ];
        }

        $this->loadMissing(['weekPattern', 'workGroup.weekPattern']);
        $weekPattern = $this->weekPattern;

        if (!$weekPattern && $this->workGroup) {
            $weekPattern = $this->workGroup->weekPattern;
        }

        if (!$weekPattern) {
            return null;
        }

        $dayOfWeekName = $datetime->format('l');
        $relationName = strtolower($dayOfWeekName) . 'Pattern';

        $weekPattern->loadMissing([$relationName]);

        $workPatternForDay = $weekPattern->{$relationName};

        if (!$workPatternForDay)
        {
            return null;
        }

        if ($workPatternForDay->type === 'off' || !$workPatternForDay->start_time || !$workPatternForDay->end_time) {
            return null;
        }

        $startTime = Carbon::parse($date . ' ' . $workPatternForDay->start_time);
        $endTime = Carbon::parse($date . ' ' . $workPatternForDay->end_time);

        if ($endTime->lessThanOrEqualTo($startTime)) {
            $endTime->addDay();
        }

        return (object) [
            'expected_start' => $startTime,
            'expected_end'   => $endTime,
            'floating_start' => (int) $weekPattern->floating_start,
            'floating_end'   => (int) $weekPattern->floating_end,
        ];
    }

}
