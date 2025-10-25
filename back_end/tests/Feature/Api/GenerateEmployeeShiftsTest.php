<?php

namespace Api;

use App\Jobs\GenerateEmployeeShifts;
use App\Models\EmployeeShift;
use App\Models\Employees;
use App\Models\Holiday;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\ScheduleSlot;
use App\Models\ShiftSchedule;
use App\Models\User;
use App\Models\WorkGroup;
use App\Models\WorkPattern;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class GenerateEmployeeShiftsTest extends TestCase
{
    use RefreshDatabase;
   protected function setUp(): void
    {
        parent::setUp();
        Log::shouldReceive('info')->andReturnNull();
    }
    /**
     * تست جامع عملکرد جاب GenerateEmployeeShifts
     */
    #[Test] public function it_generates_employee_shifts_correctly(): void
    {
        // --- ۱. آماده‌سازی داده‌های اولیه ---

        // الگوهای کاری مختلف
        $patternMorning = WorkPattern::factory()->create(['name' => 'شیفت صبح', 'start_time' => '08:00', 'end_time' => '16:00']);
        $patternEvening = WorkPattern::factory()->create(['name' => 'شیفت عصر', 'start_time' => '16:00', 'end_time' => '00:00']);
        $patternNight = WorkPattern::factory()->create(['name' => 'شیفت شب', 'start_time' => '00:00', 'end_time' => '08:00']);
        $patternOverride = WorkPattern::factory()->create(['name' => 'الگوی اختصاصی']); // برای تست override کارمند

        // برنامه شیفتی ۴ روزه (صبح، عصر، شب، استراحت)
        // تاریخ شروع چرخه را روی دوشنبه اول ماه جاری می‌گذاریم (برای سادگی محاسبه)
        $cycleStartDate = Carbon::now()->startOfMonth()->startOfWeek(Carbon::MONDAY)->format('Y-m-d');
        $schedule = ShiftSchedule::factory()->create([
            'name' => 'چرخش ۴ روزه تست',
            'cycle_length_days' => 4,
            'cycle_start_date' => $cycleStartDate,
        ]);

        // ویرایش اسلات‌های برنامه (فکتوری ShiftSchedule اسلات‌ها را می‌سازد)
        $schedule->slots()->where('day_in_cycle', 1)->update(['work_pattern_id' => $patternMorning->id]); // روز ۱: صبح
        $schedule->slots()->where('day_in_cycle', 2)->update(['work_pattern_id' => $patternEvening->id]); // روز ۲: عصر
        $schedule->slots()->where('day_in_cycle', 3)->update(['work_pattern_id' => $patternNight->id, 'override_start_time' => '01:00']); // روز ۳: شب (با override)
        $schedule->slots()->where('day_in_cycle', 4)->update(['work_pattern_id' => null]); // روز ۴: استراحت

        // گروه کاری متصل به این برنامه
        $workGroup = WorkGroup::factory()->create(['shift_schedule_id' => $schedule->id]);

        // کارمندان
        $employeeA = Employees::factory()->create(['work_group_id' => $workGroup->id, 'shift_offset' => 0]); // کارمند A، آفست ۰
        $employeeB = Employees::factory()->create(['work_group_id' => $workGroup->id, 'shift_offset' => 1]); // کارمند B، آفست ۱
        $employeeC = Employees::factory()->create(['work_group_id' => $workGroup->id, 'shift_schedule_id' => $schedule->id, 'shift_offset' => 2]); // کارمند C، اتصال مستقیم به برنامه، آفست ۲
        $employeeD = Employees::factory()->create(['work_group_id' => $workGroup->id, 'work_pattern_id' => $patternOverride->id]); // کارمند D، الگوی اختصاصی
        $employeeE = Employees::factory()->create(['work_group_id' => $workGroup->id, 'shift_offset' => 3]); // کارمند E، آفست ۳ (برای تست مرخصی و تعطیلی)

        // تعطیل رسمی (سه‌شنبه اول ماه)
        $holidayDate = Carbon::parse($cycleStartDate)->addDay(1)->format('Y-m-d'); // سه‌شنبه
        Holiday::factory()->create(['date' => $holidayDate, 'name' => 'تعطیلی تست']);

        // مرخصی برای کارمند E (چهارشنبه اول ماه)
        $leaveDate = Carbon::parse($cycleStartDate)->addDay(2)->format('Y-m-d'); // چهارشنبه
        $leaveType = LeaveType::factory()->create();
        LeaveRequest::factory()->approved()->create([
            'employee_id' => $employeeE->id,
            'leave_type_id' => $leaveType->id,
            'start_time' => $leaveDate,
            'end_time' => $leaveDate,
        ]);

        // جمعه اول ماه (برای تست جمعه)
        $fridayDate = Carbon::parse($cycleStartDate)->next(Carbon::FRIDAY)->format('Y-m-d');


        // --- ۲. اجرای جاب ---
        $startDate = Carbon::parse($cycleStartDate);
        $endDate = $startDate->copy()->addDays(6); // یک هفته کامل از دوشنبه تا یکشنبه

        // جاب را به صورت همزمان اجرا می‌کنیم تا بتوانیم نتیجه را فوراً چک کنیم
        (new GenerateEmployeeShifts($schedule->id, $startDate, $endDate))->handle();


        // --- ۳. بررسی نتایج (Assertions) ---

        // الف) بررسی تعطیلی (سه‌شنبه) - باید برای همه ثبت شده باشد
        $this->assertDatabaseHas('employee_shifts', [
            'date' => $holidayDate,
            'employee_id' => $employeeA->id,
            'is_off_day' => true,
            'source' => 'holiday',
        ]);
         $this->assertDatabaseHas('employee_shifts', [
            'date' => $holidayDate,
            'employee_id' => $employeeB->id,
            'is_off_day' => true,
            'source' => 'holiday',
        ]);
        // ... (برای C, D, E هم چک شود)


        // ب) بررسی مرخصی (چهارشنبه) - فقط برای کارمند E
        $this->assertDatabaseHas('employee_shifts', [
            'date' => $leaveDate,
            'employee_id' => $employeeE->id,
            'is_off_day' => true,
            'source' => 'leave',
        ]);
         // اطمینان از اینکه برای بقیه مرخصی ثبت نشده
        $this->assertDatabaseMissing('employee_shifts', [
            'date' => $leaveDate,
            'employee_id' => $employeeA->id,
            'source' => 'leave',
        ]);

        // ج) بررسی الگوی اختصاصی (کارمند D) - باید همیشه الگوی override باشد
         $this->assertDatabaseHas('employee_shifts', [
            'date' => $startDate->format('Y-m-d'), // دوشنبه
            'employee_id' => $employeeD->id,
            'work_pattern_id' => $patternOverride->id,
            'is_off_day' => false,
            'source' => 'manual', // یا 'manual_pattern' اگر در جاب تغییر دادید
        ]);
        // (بقیه روزهای کاری کارمند D هم چک شود)


         // د) بررسی شیفت‌های برنامه‌ریزی شده (روزهای غیر تعطیل/مرخصی)

        // کارمند A (offset=0), روز دوشنبه (روز اول چرخه -> صبح)
        $this->assertDatabaseHas('employee_shifts', [
            'date' => $startDate->format('Y-m-d'), // دوشنبه
            'employee_id' => $employeeA->id,
            'work_pattern_id' => $patternMorning->id,
            'is_off_day' => false,
            'source' => 'scheduled',
            'expected_start_time' => '08:00',
            'expected_end_time' => '16:00',
        ]);

        // کارمند B (offset=1), روز دوشنبه (روز دوم چرخه -> عصر)
        $this->assertDatabaseHas('employee_shifts', [
            'date' => $startDate->format('Y-m-d'), // دوشنبه
            'employee_id' => $employeeB->id,
            'work_pattern_id' => $patternEvening->id,
            'is_off_day' => false,
            'source' => 'scheduled',
            'expected_start_time' => '16:00',
            'expected_end_time' => '00:00',
        ]);

        // کارمند C (offset=2), روز دوشنبه (روز سوم چرخه -> شب با override)
        $this->assertDatabaseHas('employee_shifts', [
            'date' => $startDate->format('Y-m-d'), // دوشنبه
            'employee_id' => $employeeC->id,
            'work_pattern_id' => $patternNight->id,
            'is_off_day' => false,
            'source' => 'scheduled',
            'expected_start_time' => '01:00', // <-- زمان override شده
            'expected_end_time' => '08:00',
        ]);

         // کارمند A (offset=0), روز چهارشنبه (روز سوم چرخه -> شب با override)
         // (کارمند E در این روز مرخصی بود، پس باید برای A شیفت ثبت شده باشد)
        $this->assertDatabaseHas('employee_shifts', [
            'date' => $leaveDate, // چهارشنبه
            'employee_id' => $employeeA->id,
            'work_pattern_id' => $patternNight->id,
            'is_off_day' => false,
            'source' => 'scheduled',
            'expected_start_time' => '01:00',
            'expected_end_time' => '08:00',
        ]);


         // کارمند A (offset=0), روز پنجشنبه (روز چهارم چرخه -> استراحت)
        $thursdayDate = Carbon::parse($cycleStartDate)->addDay(3)->format('Y-m-d');
        $this->assertDatabaseHas('employee_shifts', [
            'date' => $thursdayDate,
            'employee_id' => $employeeA->id,
            'work_pattern_id' => null,
            'is_off_day' => true,
            'source' => 'scheduled',
             'expected_start_time' => null, // اطمینان از null بودن زمان‌ها
             'expected_end_time' => null,
        ]);


        // ه) بررسی تعطیلی جمعه
         $this->assertDatabaseHas('employee_shifts', [
            'date' => $fridayDate,
            'employee_id' => $employeeA->id,
            'is_off_day' => true,
            'source' => 'holiday', // جمعه هم holiday ثبت می‌شود
        ]);
         // ... (برای بقیه کارمندان در روز جمعه هم چک شود)


        // و) بررسی تعداد کل رکوردهای ایجاد شده
        // ۵ کارمند * ۷ روز = ۳۵ رکورد باید ایجاد شده باشد
        $this->assertEquals(35, EmployeeShift::count());

    }
}
