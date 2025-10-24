<?php

namespace Database\Factories;

use App\Models\ScheduleSlot;
use App\Models\ShiftSchedule;
use App\Models\WorkPattern;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ShiftSchedule>
 */
class ShiftScheduleFactory extends Factory
{
    protected $model = ShiftSchedule::class;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $cycleLength = $this->faker->randomElement([4, 7, 14]);
        return [
            'name' => 'برنامه شیفتی ' . $cycleLength . ' روزه ' . $this->faker->randomNumber(2),
            'cycle_length_days' => $cycleLength,
            'cycle_start_date' => $this->faker->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (ShiftSchedule $schedule) {
            // به تعداد روزهای چرخه، اسلات بساز
            for ($day = 1; $day <= $schedule->cycle_length_days; $day++) {
                ScheduleSlot::factory()->create([
                    'shift_schedule_id' => $schedule->id,
                    'day_in_cycle' => $day,
                    'work_pattern_id' => $this->faker->boolean(80)
                        ? WorkPattern::factory()
                        : null,
                ]);
            }
        });
    }
}
