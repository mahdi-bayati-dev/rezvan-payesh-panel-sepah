<?php

namespace Database\Factories;

use App\Models\WeekPattern;
use App\Models\WorkPattern;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WeekPattern>
 */
class WeekPatternFactory extends Factory
{
    protected $model = WeekPattern::class;

    public function definition(): array
    {

        // ۱. الگوی اداری (شنبه تا چهارشنبه)
        $workPatternSatToWed = WorkPattern::factory()->create([
            'name' => 'اداری (۸ الی ۱۶)',
            'type' => 'fixed',
            'start_time' => '08:00',
            'end_time' => '16:00',
            'work_duration_minutes' => 480,
        ]);

        // ۲. الگوی پنجشنبه
        $workPatternThu = WorkPattern::factory()->create([
            'name' => 'اداری پنجشنبه (۸ الی ۱۲)',
            'type' => 'fixed',
            'start_time' => '08:00',
            'end_time' => '12:00',
            'work_duration_minutes' => 240,
        ]);

        // ۳. الگوی استراحت (جمعه)
        $workPatternFri = WorkPattern::factory()->create([
            'name' => 'روز استراحت',
            'type' => 'fixed',
            'start_time' => null,
            'end_time' => null,
            'work_duration_minutes' => 0,
        ]);

        return [
            'name' => $this->faker->unique()->text(50),
            'saturday_pattern_id' => $workPatternSatToWed->id,
            'sunday_pattern_id' => $workPatternSatToWed->id,
            'monday_pattern_id' => $workPatternSatToWed->id,
            'tuesday_pattern_id' => $workPatternSatToWed->id,
            'wednesday_pattern_id' => $workPatternSatToWed->id,
            'thursday_pattern_id' => $workPatternThu->id,
            'friday_pattern_id' => $workPatternFri->id,
        ];
    }
}
