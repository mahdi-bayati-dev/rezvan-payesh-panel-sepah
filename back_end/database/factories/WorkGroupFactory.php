<?php

namespace Database\Factories;

use App\Models\ShiftSchedule;
use App\Models\WeekPattern;
use App\Models\WorkGroup;
use App\Models\WorkPattern;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorkGroup>
 */
class WorkGroupFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $hasWeekPattern = $this->faker->boolean(70);
        return [
            'name' => 'گروه کاری ' . $this->faker->companySuffix() . ' ' . $this->faker->randomNumber(2),

             'week_pattern_id' => $hasWeekPattern
                                     ? WeekPattern::factory()
                                     : null,
            'shift_schedule_id' => !$hasWeekPattern
                ? ShiftSchedule::factory()
                : null,
        ];
    }

    /**
      * حالت خاص برای اتصال به یک الگوی کاری مشخص
      */
     public function withWeekPattern(WeekPattern $pattern = null): static
     {
         return $this->state(fn (array $attributes) => [
             'week_pattern_id' => $pattern?->id ?? WeekPattern::factory(),
             'shift_schedule_id' => null,
         ]);
     }

     /**
      * حالت خاص برای اتصال به یک برنامه شیفتی مشخص
      * (اصلاح شده)
      */
      public function withShiftSchedule(ShiftSchedule $schedule = null): static
      {
          return $this->state(fn (array $attributes) => [
              'shift_schedule_id' => $schedule?->id ?? ShiftSchedule::factory(),
              'week_pattern_id' => null,
          ]);
      }


}
