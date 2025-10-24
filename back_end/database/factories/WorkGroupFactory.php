<?php

namespace Database\Factories;

use App\Models\ShiftSchedule;
use App\Models\WorkPattern;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkGroup>
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
        return [
            'name' => 'گروه کاری ' . $this->faker->unique()->companySuffix() . ' ' . $this->faker->randomNumber(2),

             'work_pattern_id' => $this->faker->boolean(70)
                                     ? WorkPattern::factory()
                                     : null,
//            'shift_schedule_id' => $this->faker->boolean(30);
            //                         ? ShiftSchedule::factory()
            //                         : null,

              'shift_schedule_id' => null,
        ];
    }

    /**
      * حالت خاص برای اتصال به یک الگوی کاری مشخص
      */
     public function withWorkPattern(WorkPattern $pattern = null): static
     {
         return $this->state(fn (array $attributes) => [
             'work_pattern_id' => $pattern?->id ?? WorkPattern::factory(),
             'shift_schedule_id' => null, // اگر الگوی ثابت دارد، برنامه چرخشی نداشته باشد
         ]);
     }

     /**
      * حالت خاص برای اتصال به یک برنامه شیفتی مشخص
      */
      public function withShiftSchedule(ShiftSchedule $schedule = null): static
      {
          return $this->state(fn (array $attributes) => [
              'shift_schedule_id' => $schedule?->id ?? ShiftSchedule::factory(),
              'work_pattern_id' => null,
          ]);
      }
}
