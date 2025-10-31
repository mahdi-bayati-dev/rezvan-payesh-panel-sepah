<?php

namespace Database\Seeders;

use App\Models\Employees;
use App\Models\User;
use App\Models\WeekPattern;
use App\Models\WorkGroup;
use App\Models\WorkPattern; // برای ایجاد الگوهای اتمی
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EmployeeWorkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $workPattern8_16 = WorkPattern::firstOrCreate(
            ['type' => 'fixed', 'start_time' => '08:00', 'end_time' => '16:00', 'work_duration_minutes' => 480],
            ['name' => 'شیفت ثابت 08:00-16:00 (480 دقیقه)']
        );

        $workPattern8_12 = WorkPattern::firstOrCreate(
            ['type' => 'fixed', 'start_time' => '08:00', 'end_time' => '12:00', 'work_duration_minutes' => 240],
            ['name' => 'شیفت ثابت 08:00-12:00 (240 دقیقه)']
        );

        $restPattern = WorkPattern::firstOrCreate(
            ['type' => 'fixed', 'start_time' => null, 'end_time' => null, 'work_duration_minutes' => 0],
            ['name' => 'روز استراحت']
        );

        // --- ۲. ساخت الگوهای کاری هفتگی (Week Patterns) ---

        // الگوی اداری استاندارد
        $adminWeekPattern = WeekPattern::factory()->create([
            'name' => 'برنامه اداری استاندارد',
            'saturday_pattern_id' => $workPattern8_16->id,
            'sunday_pattern_id' => $workPattern8_16->id,
            'monday_pattern_id' => $workPattern8_16->id,
            'tuesday_pattern_id' => $workPattern8_16->id,
            'wednesday_pattern_id' => $workPattern8_16->id,
            'thursday_pattern_id' => $workPattern8_12->id, // پنجشنبه نیمه‌وقت
            'friday_pattern_id' => $restPattern->id,      // جمعه تعطیل
        ]);

        // الگوی تمام وقت (بدون پنجشنبه نیمه‌وقت)
        $fullTimeWeekPattern = WeekPattern::factory()->create([
            'name' => 'برنامه تمام وقت',
            'saturday_pattern_id' => $workPattern8_16->id,
            'sunday_pattern_id' => $workPattern8_16->id,
            'monday_pattern_id' => $workPattern8_16->id,
            'tuesday_pattern_id' => $workPattern8_16->id,
            'wednesday_pattern_id' => $workPattern8_16->id,
            'thursday_pattern_id' => $workPattern8_16->id, // پنجشنبه تمام‌وقت
            'friday_pattern_id' => $restPattern->id,
        ]);

        // --- ۳. ساخت گروه‌های کاری (Work Groups) ---

        $adminGroup = WorkGroup::factory()->create([
            'name' => 'گروه اداری',
            'week_pattern_id' => $adminWeekPattern->id, // برنامه پیش‌فرض گروه
            'shift_schedule_id' => null, // این گروه برنامه چرخشی ندارد
        ]);

        $productionGroup = WorkGroup::factory()->create([
            'name' => 'گروه تولید',
            'week_pattern_id' => $fullTimeWeekPattern->id, // برنامه پیش‌فرض گروه
            'shift_schedule_id' => null,
        ]);

        // --- ۴. ساخت کارمندان (Employees) ---

        // کارمند ۱: در گروه اداری، برنامه را از گروه ارث می‌برد
        $user1 = User::factory()->create(['email' => 'employee1@example.com']);
        Employees::factory()->create([
            'user_id' => $user1->id,
            'first_name' => 'علی',
            'last_name' => 'رضایی',
            'work_group_id' => $adminGroup->id,
            'week_pattern_id' => null, // برنامه را از گروه ارث می‌برد
            'shift_schedule_id' => null,
            'shift_offset' => 0,
        ]);


        // کارمند ۲: در گروه تولید، برنامه را از گروه ارث می‌برد
        $user2 = User::factory()->create(['email' => 'employee2@example.com']);
        Employees::factory()->create([
            'user_id' => $user2->id,
            'first_name' => 'زهرا',
            'last_name' => 'احمدی',
            'work_group_id' => $productionGroup->id,
            'week_pattern_id' => null, // برنامه را از گروه ارث می‌برد
            'shift_schedule_id' => null,
            'shift_offset' => 0,

        ]);

        // کارمند ۳: در گروه اداری، اما برنامه اختصاصی تمام‌وقت دارد (override)
        $user3 = User::factory()->create(['email' => 'employee3@example.com']);
        Employees::factory()->create([
            'user_id' => $user3->id,
            'first_name' => 'محمد',
            'last_name' => 'حسینی',
            'work_group_id' => $adminGroup->id, // عضو گروه اداری است
            'week_pattern_id' => $fullTimeWeekPattern->id, // اما برنامه تمام‌وقت دارد
            'shift_schedule_id' => null,
            'shift_offset' => 0,
            // ... سایر فیلدها
        ]);
        $user1->assignRole("user");
        $user2->assignRole("user");
        $user3->assignRole("user");
        // می‌توانید کارمندان بیشتری با فکتوری بسازید
        $otherUsers = User::factory()->count(10)->create();
        $otherUsers->each(function ($user) use ($adminGroup, $productionGroup) {
            Employees::factory()->create([
                'user_id' => $user->id,

                'work_group_id' => fake()->randomElement([$adminGroup->id, $productionGroup->id]),
                'week_pattern_id' => null,
                'shift_schedule_id' => null,
            ]);
            $user->assignRole("user");
        });
    }
}