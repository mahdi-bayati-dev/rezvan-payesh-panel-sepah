<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\ShiftSchedule;
use App\Models\User;
use App\Models\WorkGroup;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Arr;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Employees>
 */
class EmployeesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
       $gender = $this->faker->randomElement(['male', 'female']);
        $firstName = $gender === 'male' ? $this->faker->firstNameMale() : $this->faker->firstNameFemale();
        $lastName = $this->faker->lastName();

        return [
            // ایجاد یک کاربر جدید برای هر پروفایل کارمندی
            'user_id' => User::factory(),
            'personnel_code' => $this->faker->unique()->numerify('EMP#####'), // کد پرسنلی یکتا
            'position' => $this->faker->jobTitle(), // سمت شغلی

            // اتصال به یک سازمان (یا بساز یا از موجود استفاده کن)
            'organization_id' => Organization::factory(),

            'starting_job' => $this->faker->dateTimeBetween('-5 years', '-1 month')->format('Y-m-d'), // تاریخ شروع کار
            // 'status' => 'active', // اگر فیلد status در Employees داری
            'first_name' => $firstName,
            'last_name' => $lastName,
            'father_name' => $this->faker->firstNameMale(), // نام پدر
            'birth_date' => $this->faker->dateTimeBetween('-50 years', '-20 years')->format('Y-m-d'), // تاریخ تولد
            'nationality_code' => $this->faker->unique()->numerify('##########'), // کد ملی یکتا
            'gender' => $gender,
            'is_married' => $this->faker->boolean(40), // با احتمال ۴۰ درصد متاهل
            'education_level' => Arr::random(['diploma','advanced_diploma', 'bachelor', 'master','doctorate','post_doctorate']), // سطح تحصیلات تصادفی
            'phone_number' => $this->faker->unique()->numerify('09#########'), // شماره موبایل یکتا
            'house_number' => $this->faker->numerify('021########'), // تلفن ثابت
            'sos_number' => $this->faker->numerify('09#########'), // شماره اضطراری
            'address' => $this->faker->address(), // آدرس

            // اتصال به گروه کاری (اختیاری)
            'work_group_id' => $this->faker->boolean(80) ? WorkGroup::factory() : null, // با احتمال ۸۰ درصد عضو یک گروه باشد

            // برنامه شیفتی اختصاصی (معمولا null، از گروه ارث می‌برد)
            'shift_schedule_id' => null,

            // آفست شیفت (پیش‌فرض صفر)
            'shift_offset' => 0,
        ];
    }


    public function forRole(string $role): static
    {
        $position = match($role) {
            'org-admin-l2' => 'Organization Admin Level 2',
            'org-admin-l3' => 'Organization Admin Level 3',
            'user' => 'Regular Employee',
            default => 'user'
        };

        return $this->state([
            'position' => $position,
        ]);
    }
    /**
     * حالت خاص برای اتصال کارمند به یک گروه کاری مشخص
     */
    public function forWorkGroup(WorkGroup $workGroup): static
    {
        return $this->state(fn (array $attributes) => [
            'work_group_id' => $workGroup->id,
        ]);
    }

    /**
     * حالت خاص برای تنظیم برنامه شیفتی اختصاصی
     */
    public function withShiftSchedule(ShiftSchedule $schedule, int $offset = 0): static
    {
        return $this->state(fn (array $attributes) => [
            'shift_schedule_id' => $schedule->id,
            'shift_offset' => $offset,
        ]);
    }

    /**
      * حالت خاص برای تنظیم آفست شیفت
      */
     public function withShiftOffset(int $offset): static
     {
         return $this->state(fn (array $attributes) => [
             'shift_offset' => $offset,
         ]);
     }

    public function forOrganization(int $organizationId): static
    {
        return $this->state([
            'organization_id' => $organizationId,
        ]);
    }

    public function withRequiredFields(): static
    {
        return $this->state([
            'gender' => 'male',
            'is_married' => false,
        ]);
    }

}
