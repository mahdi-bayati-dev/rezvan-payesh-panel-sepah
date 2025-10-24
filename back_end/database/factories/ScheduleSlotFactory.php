<?php

namespace Database\Factories;

use App\Models\ScheduleSlot;
use App\Models\ShiftSchedule;
use App\Models\WorkPattern;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ScheduleSlot>
 */
class ScheduleSlotFactory extends Factory
{
    protected $model = ScheduleSlot::class;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // مقادیر پیش‌فرض - اینها معمولاً توسط ShiftScheduleFactory بازنویسی می‌شوند
            'shift_schedule_id' => ShiftSchedule::factory(), // به طور پیش‌فرض یک برنامه جدید می‌سازد
            'day_in_cycle' => $this->faker->numberBetween(1, 7), // یک روز تصادفی (که بازنویسی می‌شود)

            // با احتمال ۸۰٪ یک الگوی کاری بده، وگرنه روز استراحت (null)
            'work_pattern_id' => $this->faker->boolean(80)
                                    ? WorkPattern::factory()
                                    : null,
        ];
    }
}
