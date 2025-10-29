<?php

namespace Database\Factories;

use App\Models\AttendanceLog;
use App\Models\Device;
use App\Models\Employees;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AttendanceLog>
 */
class AttendanceLogFactory extends Factory
{
    protected $model = AttendanceLog::class;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $device = Device::factory()->create();

        return [
            // فرض می‌کنیم EmployeesFactory هم دارید
            'employee_id' => Employees::factory(),
            'event_type' => fake()->randomElement([AttendanceLog::TYPE_CHECK_IN, AttendanceLog::TYPE_CHECK_OUT]),
            'timestamp' => fake()->dateTimeBetween('-30 days', 'now'), // لاگ در 30 روز گذشته

            // حالت پیش‌فرض: لاگ از دستگاه آمده
            'source_name' => 'section 1',
            'source_type' => AttendanceLog::SOURCE_DEVICE,
            'device_id' => $device->id,

            // این لاگ تمیز است و ویرایش نشده
            'edited_by_user_id' => null,
            'remarks' => null,
            'is_allowed'=>false,
        ];
    }
    /**
     * state برای لاگ‌هایی که توسط ادمین "ویرایش" شده‌اند
     */
    public function manuallyEdited(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'source_name' => 'Admin Panel',
                'source_type' => AttendanceLog::SOURCE_MANUAL_ADMIN_EDIT,
                'edited_by_user_id' => User::factory(), // یک ادمین (User) می‌سازد
                'remarks' => fake()->sentence(), // دلیلی برای ویرایش
            ];
        });
    }

    /**
     * state برای لاگ‌هایی که توسط ادمین "دستی ایجاد" شده‌اند
     */
    public function manuallyCreated(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'source_name' => 'Admin Panel',
                'source_type' => AttendanceLog::SOURCE_MANUAL_ADMIN,
                'edited_by_user_id' => User::factory(),
                'remarks' => 'Created manually by admin.',
                'device_id' => null, // ایجاد دستی دستگاهی ندارد
            ];
        });
    }
}
