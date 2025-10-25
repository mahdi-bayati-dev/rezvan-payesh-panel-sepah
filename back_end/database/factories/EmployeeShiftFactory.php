<?php

namespace Database\Factories;

use App\Models\Employees;
use App\Models\EmployeeShift;
use App\Models\ShiftSchedule;
use App\Models\WorkPattern;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EmployeeShift>
 */
class EmployeeShiftFactory extends Factory
{
    protected $model = EmployeeShift::class;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $isWorkingDay = $this->faker->boolean(85); // ۸۵٪ روز کاری
        $source = $isWorkingDay ? 'scheduled' : $this->faker->randomElement(['holiday', 'leave']);

        $workPattern = $isWorkingDay ? WorkPattern::factory()->create() : null; // اگر روز کاری است الگو بساز
        $startTime = $workPattern ? Carbon::parse($workPattern->start_time) : null;
        $endTime = $workPattern ? Carbon::parse($workPattern->end_time) : null;


        return [
            'employee_id' => Employees::factory(),
            'date' => $this->faker->dateTimeBetween('-1 month', '+1 month')->format('Y-m-d'),
            'work_pattern_id' => $workPattern?->id,
            'is_off_day' => !$isWorkingDay,
            'shift_schedule_id' => $isWorkingDay ? $this->faker->optional(0.7)->randomElement(ShiftSchedule::pluck('id')->all()) : null,
            'source' => $source,
            'expected_start_time' => $startTime?->format('H:i'),
            'expected_end_time' => $endTime?->format('H:i'),
        ];
    }
    /**
     * حالت خاص برای شیفت برنامه‌ریزی شده (روز کاری)
     */
    public function scheduled(WorkPattern $workPattern = null, ShiftSchedule $schedule = null): static
    {
        $workPattern = $workPattern ?? WorkPattern::factory()->create();
        $startTime = Carbon::parse($workPattern->start_time);
        $endTime = Carbon::parse($workPattern->end_time);

        return $this->state(fn (array $attributes) => [
            'work_pattern_id' => $workPattern->id,
            'is_off_day' => false,
            'shift_schedule_id' => $schedule?->id ?? ShiftSchedule::factory()->create()->id, // اگر برنامه داده نشد یکی بساز
            'source' => 'scheduled',
            'expected_start_time' => $startTime?->format('H:i'),
            'expected_end_time' => $endTime?->format('H:i'),
        ]);
    }

    /**
     * حالت خاص برای روز مرخصی
     */
    public function onLeave(): static
    {
        return $this->state(fn (array $attributes) => [
            'work_pattern_id' => null,
            'is_off_day' => true,
            'shift_schedule_id' => null,
            'source' => 'leave',
            'expected_start_time' => null,
            'expected_end_time' => null,
        ]);
    }

    /**
     * حالت خاص برای روز تعطیل رسمی
     */
    public function holiday(): static
    {
        return $this->state(fn (array $attributes) => [
            'work_pattern_id' => null,
            'is_off_day' => true,
            'shift_schedule_id' => null,
            'source' => 'holiday',
            'expected_start_time' => null,
            'expected_end_time' => null,
        ]);
    }

     /**
     * حالت خاص برای روز استراحت برنامه‌ریزی شده
     */
    public function scheduledOffDay(ShiftSchedule $schedule = null): static
    {
        return $this->state(fn (array $attributes) => [
            'work_pattern_id' => null,
            'is_off_day' => true,
             // روز استراحت برنامه‌ریزی شده معمولا از یک برنامه می‌آید
            'shift_schedule_id' => $schedule?->id ?? ShiftSchedule::factory()->create()->id,
            'source' => 'scheduled',
            'expected_start_time' => null,
            'expected_end_time' => null,
        ]);
    }
}
