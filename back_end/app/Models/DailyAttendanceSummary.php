<?php

namespace App\Models;

use App\Enums\DailySummaryStatus;
use GeneaLabs\LaravelModelCaching\Traits\Cachable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyAttendanceSummary extends Model
{
    use HasFactory,Cachable;

    protected $fillable = [
        'employee_id',
        'date',
        'status',
        'expected_start_time',
        'expected_end_time',
        'actual_check_in',
        'actual_check_out',
        'lateness_minutes',
        'early_departure_minutes',
        'work_duration_minutes',
        'source_schedule_type',
        'remarks',
        'leave_request_id',
    ];

    protected $casts = [
        'date' => 'date',
        'actual_check_in' => 'datetime',
        'actual_check_out' => 'datetime',
        'status' => DailySummaryStatus::class,
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function leaveRequest(): BelongsTo
    {
        return $this->belongsTo(LeaveRequest::class);
    }
}
