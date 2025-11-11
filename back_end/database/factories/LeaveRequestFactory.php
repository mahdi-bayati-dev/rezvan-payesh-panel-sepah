<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LeaveRequest>
 */
class LeaveRequestFactory extends Factory
{
    protected $model = LeaveRequest::class;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('-1 month', '+1 month');
        $endDate = $this->faker->dateTimeBetween($startDate, Carbon::parse($startDate)->addDays(rand(0, 5))); // مرخصی بین ۰ تا ۵ روز

        return [
            'employee_id' => Employee::factory(), // به طور پیش‌فرض یک کارمند جدید می‌سازد
            'leave_type_id' => LeaveType::factory(), // به طور پیش‌فرض یک نوع مرخصی جدید می‌سازد
            'start_time' => $startDate,
            'end_time' => $endDate,
            'reason' => $this->faker->sentence(), // دلیل مرخصی
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']), // وضعیت تصادفی
            'processed_by_user_id' => function (array $attributes) {
                // فقط اگر وضعیت 'approved' یا 'rejected' بود، یک تایید کننده بده
                return in_array($attributes['status'], ['approved', 'rejected'])
                    ? User::factory() // یا User::inRandomOrder()->first()?->id
                    : null;
            },
            'rejection_reason' => function (array $attributes) {
                // فقط اگر وضعیت 'rejected' بود، دلیل رد بده
                return $attributes['status'] === 'rejected'
                    ? $this->faker->sentence()
                    : null;
            },
        ];
    }
    /**
     * حالت خاص برای درخواست تایید شده
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'processed_by_user_id' => User::factory(), // یا User::inRandomOrder()->first()?->id
            'rejection_reason' => null,
        ]);
    }

    /**
     * حالت خاص برای درخواست رد شده
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'processed_by_user_id' => User::factory(), // یا User::inRandomOrder()->first()?->id
            'rejection_reason' => $this->faker->sentence(),
        ]);
    }

    /**
     * حالت خاص برای درخواست در انتظار
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'processed_by_user_id' => null,
            'rejection_reason' => null,
        ]);
    }
}
