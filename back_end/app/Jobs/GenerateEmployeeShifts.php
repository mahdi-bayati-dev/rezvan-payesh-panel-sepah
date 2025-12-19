<?php

namespace App\Jobs;

use App\Events\ShiftGenerationCompleted;
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
        try
        {
            EmployeeShift::where("shift_schedule_id", $this->scheduleId)->delete();
        }
        catch (\Exception $e)
        {

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
                                'date' => $date->toDateString()
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
                            'date' => $date->toDateString()
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

                    $expectedStart = $dedicatedPattern->start_time
                        ? Carbon::parse("{$dateString} {$dedicatedPattern->start_time}")
                        : null;

                    $expectedEnd = $dedicatedPattern->end_time
                        ? Carbon::parse("{$dateString} {$dedicatedPattern->end_time}")
                        : null;

                    if ($expectedEnd && $expectedStart && $expectedEnd->lte($expectedStart)) {
                        $expectedEnd->addDay();
                    }

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
                                'shift_schedule_id' => null,
                                'source' => 'manual',
                                'expected_start_time' => $expectedStart,
                                'expected_end_time' => $expectedEnd,
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
                Log::info("Checking Date: {$dateString} | Cycle Start: {$schedule->cycle_start_date->toDateString()} | Diff: " . $schedule->cycle_start_date->startOfDay()->diffInDays($date) . " | DayInCycle Result: {$dayInCycle}");

                $slot = $schedule->slots->firstWhere('day_in_cycle', $dayInCycle);
                Log::info("Date: $dateString | DayInCycle: $dayInCycle | Slot Found: " . ($slot ? 'Yes' : 'No'));
                if (!$slot)
                {
                     Log::warning("اسلات برای روز {$dayInCycle} در برنامه {$schedule->id} یافت نشد. کارمند: {$employee->id}, تاریخ: {$dateString}");
                     continue;
                }
                $workPattern = $slot->workPattern;

                // ۱۰. ثبت شیفت

                $startTime = $slot->override_start_time
                    ? $slot->override_start_time->format('H:i')
                    : ($workPattern?->start_time ?? null);

                $expectedStart = $startTime
                    ? Carbon::parse("{$dateString} {$startTime}")
                    : null;

                $endTime = $slot->override_end_time
                    ? $slot->override_end_time->format('H:i')
                    : ($workPattern?->end_time ?? null);

                $expectedEnd = $endTime
                    ? Carbon::parse("{$dateString} {$endTime}")
                    : null;
                if ($expectedEnd && $expectedStart && $expectedEnd->lte($expectedStart))
                {
                    $expectedEnd->addDay();
                }

                $isOffDay = !$workPattern || $workPattern->type === 'off';

                EmployeeShift::updateOrCreate(
                    [
                        'employee_id' => $employee->id,
                        'date' => $date->toDateString()
                    ],
                    [
                        'work_pattern_id' => $slot->work_pattern_id,
                        'is_off_day' => $isOffDay,
                        'shift_schedule_id' => $schedule->id,
                        'expected_start_time' => $isOffDay ? null : $expectedStart,
                        'expected_end_time' => $isOffDay ? null : $expectedEnd,
                        'source' => 'scheduled',
                    ]
                );

            }
        }
        Log::info("پایان جاب GenerateEmployeeShifts برای برنامه ID: {$this->scheduleId}, دوره: " . $this->startDate->toDateString() . " تا " . $this->endDate->toDateString());

        ShiftGenerationCompleted::dispatch(
            $this->scheduleId,
            "فرآیند تولید شیفت‌ها برای برنامه با شناسه {$this->scheduleId} با موفقیت به پایان رسید."
        );
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
           $effectiveDay = (($diffInDays + $employeeOffset) % $cycleLength + $cycleLength) % $cycleLength;
        }

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
