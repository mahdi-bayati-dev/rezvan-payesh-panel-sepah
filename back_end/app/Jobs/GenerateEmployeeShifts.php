<?php

namespace App\Jobs;

use App\Models\Employee;
use App\Models\EmployeeShift;
use App\Models\Holiday;
use App\Models\LeaveRequest;
use App\Models\ShiftSchedule;
use App\Models\WorkGroup;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class GenerateEmployeeShifts implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Carbon $startDate;
    protected Carbon $endDate;


    /**
     * Create a new job instance.
     */
    public function __construct(protected int $scheduleId, Carbon $startDate, Carbon $endDate)
    {
        $this->startDate = $startDate->startOfDay();
        $this->endDate = $endDate->endOfDay();
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info("شروع جاب GenerateEmployeeShifts برای برنامه ID: {$this->scheduleId}, دوره: " . $this->startDate->toDateString() . " تا " . $this->endDate->toDateString());

        // ۱. گرفتن تمام برنامه‌های شیفتی فعال

        $schedule = ShiftSchedule::with(['slots.workPattern'])->find($this->scheduleId);

        if (!$schedule)
        {
            Log::error("برنامه شیفتی با ID {$this->scheduleId} یافت نشد.");
            return;
        }

        if (!$schedule->cycle_start_date)
        {
            Log::error("برنامه شیفتی با ID {$this->scheduleId} تاریخ شروع چرخه ندارد.");
            return;
        }

        $holidays = Holiday::whereBetween('date', [$this->startDate, $this->endDate])
            ->get()
            ->keyBy(fn($holiday) => $holiday->date->toDateString());

        $approvedLeaves = LeaveRequest::approved()
            ->where(function($query)
            {
                $query->whereBetween('start_time', [$this->startDate, $this->endDate])
                    ->orWhereBetween('end_time', [$this->startDate, $this->endDate])
                    ->orWhere(function ($q) {
                        $q->where('start_time', '<', $this->startDate)
                            ->where('end_time', '>', $this->endDate);
                    });
            })
            ->get(['employee_id', 'start_time', 'end_time']);

        $leaveMap = $this->buildLeaveMap($approvedLeaves);


        // ۳. پیدا کردن تمام کارمندانی که باید از این برنامه پیروی کنند

        $employees = $this->getEmployeesForSchedule($schedule);
        $employees->load([
            'weekPattern' => function ($query) {
                $query->with([
                    'saturdayPattern', 'sundayPattern', 'mondayPattern',
                    'tuesdayPattern', 'wednesdayPattern', 'thursdayPattern', 'fridayPattern'
                ]);
            }
        ]);


        // ۴. حلقه روی هر روز در دوره زمانی مشخص شده

        $period = CarbonPeriod::create($this->startDate, $this->endDate);

        foreach ($period as $date) {
            $dateString = $date->toDateString();



            if($schedule->ignore_holidays === false)
            {
                $isWeekend = ($date->dayOfWeek === Carbon::FRIDAY);
                $holiday = $holidays[$dateString] ?? null;
                // ۵. بررسی تعطیل رسمی

                if ($holiday || $isWeekend)
                {
                    foreach ($employees as $employee) {
                        EmployeeShift::updateOrCreate(
                            [
                                'employee_id' => $employee->id,
                                'date' => $date
                            ],
                            [
                                'work_pattern_id' => null,
                                'is_off_day' => true,
                                'shift_schedule_id' => $schedule->id,
                                'source' => 'holiday',
                                'expected_start_time' => null,
                                'expected_end_time' => null,
                            ]
                        );
                    }
                    continue; // برو به روز بعد
                }
            }


            // ۶. حلقه روی کارمندان این برنامه
            foreach ($employees as $employee) {

                // ۷. بررسی مرخصی
                if (isset($leaveMap[$employee->id][$dateString]))
                {
                    EmployeeShift::updateOrCreate(
                        [
                            'employee_id' => $employee->id,
                            'date' => $date
                        ],
                        [
                            'work_pattern_id' => null,
                            'is_off_day' => true,
                            'shift_schedule_id' => $schedule->id,
                            'source' => 'leave',
                            'expected_start_time' => null,
                            'expected_end_time' => null,
                        ]
                    );
                    continue;
                }

                if ($employee->week_pattern_id  && $employee->weekPattern)
                {
                    $dayOfWeekName = strtolower($date->format('l'));
                    $relationName = $dayOfWeekName . 'Pattern';
                    $dedicatedPattern = $employee->weekPattern->{$relationName};
                    if ($dedicatedPattern)
                    {
                        EmployeeShift::updateOrCreate(
                            [
                                'employee_id' => $employee->id,
                                'date' => $dateString
                            ],
                            [
                                'work_pattern_id' => $dedicatedPattern->id,
                                // بررسی اینکه آیا نوع الگو 'off' است یا خیر
                                'is_off_day' => ($dedicatedPattern->type === 'off'),
                                'shift_schedule_id' => null, // چون از برنامه چرخشی نیست
                                'source' => 'manual', // منبع: الگوی اختصاصی کارمند
                                'expected_start_time' => $dedicatedPattern->start_time,
                                'expected_end_time' => $dedicatedPattern->end_time,
                            ]
                        );
                    }
                     else
                     {
                        // اگر الگوی هفتگی، برای این روز الگوی کاری (WorkPattern) تعریف نکرده بود
                        // (مثلاً null بود)، آن را به عنوان روز استراحت در نظر می‌گیریم
                        EmployeeShift::updateOrCreate(
                            [
                                'employee_id' => $employee->id,
                                'date' => $dateString
                            ],
                            [
                                'work_pattern_id' => null,
                                'is_off_day' => true,
                                'shift_schedule_id' => null,
                                'source' => 'manual',
                                'expected_start_time' => null,
                                'expected_end_time' => null,
                            ]
                        );
                    }
                    continue;
                }

                // ۸. محاسبه روز در چرخه

                try
                {
                    $dayInCycle = $this->calculateDayInCycle($date, $schedule->cycle_start_date, $schedule->cycle_length_days, $employee->shift_offset ?? 0);
                }
                catch (\Exception $exception)
                {
                    Log::error("خطا در محاسبه روز چرخه برای کارمند {$employee->id} در تاریخ {$dateString} برای برنامه {$schedule->id}: " . $exception->getMessage());
                     continue;
                }

                // ۹. پیدا کردن اسلات

                $slot = $schedule->slots->firstWhere('day_in_cycle', $dayInCycle);
                if (!$slot)
                {
                     Log::warning("اسلات برای روز {$dayInCycle} در برنامه {$schedule->id} یافت نشد. کارمند: {$employee->id}, تاریخ: {$dateString}");
                     continue;
                }
                $workPattern = $slot->workPattern;

                // ۱۰. ثبت شیفت
                if ($workPattern)
                {

                    $rawStartTime = $slot->override_start_time ?? $workPattern->start_time;
                    $rawEndTime = $slot->override_end_time ?? $workPattern->end_time;

                    $formattedStartTime = $rawStartTime ? Carbon::parse($rawStartTime)->format('H:i') : null;
                    $formattedEndTime = $rawEndTime ? Carbon::parse($rawEndTime)->format('H:i') : null;


                    EmployeeShift::updateOrCreate(
                        [
                            'employee_id' => $employee->id,
                            'date' => $date
                        ],
                        [
                            'work_pattern_id' => $slot->work_pattern_id,
                            'is_off_day' => is_null($slot->work_pattern_id),
                            'shift_schedule_id' => $schedule->id,
                            'expected_start_time' => $formattedStartTime,
                            'expected_end_time' => $formattedEndTime,
                            'source' => 'scheduled',
                        ]
                    );
                }
                else
                {
                    EmployeeShift::updateOrCreate(
                        [
                            'employee_id' => $employee->id,
                            'date' => $dateString
                        ],
                        [
                            'work_pattern_id' => null,
                            'is_off_day' => true,
                            'shift_schedule_id' => $schedule->id,
                            'source' => 'scheduled',
                            'expected_start_time' => null,
                            'expected_end_time' => null,
                        ]
                    );
                }
            }
        }
        Log::info("پایان جاب GenerateEmployeeShifts برای برنامه ID: {$this->scheduleId}, دوره: " . $this->startDate->toDateString() . " تا " . $this->endDate->toDateString());
    }

    protected function getEmployeesForSchedule(ShiftSchedule $schedule): Collection
    {
        // کارمندانی که مستقیما به این schedule وصل هستند
        $directEmployees = Employee::where('shift_schedule_id', $schedule->id)->get();

        // گروه‌هایی که به این schedule وصل هستند
        $groupIds = WorkGroup::where('shift_schedule_id', $schedule->id)->pluck('id');

        // کارمندان اون گروه‌ها که برنامه اختصاصی ندارن
        $groupEmployees = Employee::whereIn('work_group_id', $groupIds)
                                   ->whereNull('shift_schedule_id')
                                   ->get();

        // ترکیب دو لیست و حذف موارد تکراری
        return $directEmployees->merge($groupEmployees)->unique('id');
    }
    /**
     * محاسبه شماره روز در چرخه بر اساس تاریخ، تاریخ شروع چرخه، طول چرخه و آفست کارمند
     */
    protected function calculateDayInCycle(Carbon $date, Carbon $cycleStartDate, int $cycleLength, int $employeeOffset): int
    {
        if ($cycleLength <= 0)
        {
             throw new \InvalidArgumentException("طول چرخه باید بزرگتر از صفر باشد.");
        }
        $normalizedCycleStartDate = $cycleStartDate->copy()->startOfDay();
        if ($date->lt($normalizedCycleStartDate)) {

            throw new \InvalidArgumentException(
            "تاریخ مورد نظر ({$date->toDateString()}) قبل از تاریخ شروع چرخه ({$normalizedCycleStartDate->toDateString()}) است."
            );
        }
        else
        {
            $diffInDays = $normalizedCycleStartDate->diffInDays($date);
            // محاسبه روز موثر با آفست
           $effectiveDay = ($diffInDays + $employeeOffset) % $cycleLength;
        }

        // شماره روز از 1 شروع می‌شود
        return $effectiveDay + 1;
    }


    /**
     * ساخت مپ برای دسترسی سریع به مرخصی‌ها
     */
    protected function buildLeaveMap($leaves): array
    {
        $map = [];
        foreach ($leaves as $leave) {
            $period = CarbonPeriod::create($leave->start_time, $leave->end_time);
            foreach ($period as $date) {
                $map[$leave->employee_id][$date->toDateString()] = true;
            }
        }
        return $map;
    }
}
