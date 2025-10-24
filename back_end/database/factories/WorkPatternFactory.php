<?php

namespace Database\Factories;

use App\Models\ShiftSchedule;
use App\Models\WorkPattern;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkPattern>
 */
class WorkPatternFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
       $type = $this->faker->randomElement(['fixed', 'floating']);
        $startTime = $type === 'fixed' ? $this->faker->time('H:i') : null;
        // اطمینان از اینکه زمان پایان بعد از زمان شروع است (برای نوع fixed)
        $endTime = null;
        if ($type === 'fixed' && $startTime) {
             // یک زمان رندوم بین ۱ تا ۱۲ ساعت بعد اضافه کن
             $endTimeCarbon = \Carbon\Carbon::createFromFormat('H:i', $startTime)->addHours($this->faker->numberBetween(1, 12));
             // اگر زمان پایان به روز بعد رفت، مدیریت کن (اینجا ساده در نظر گرفتیم)
             if ($endTimeCarbon->format('H:i') <= $startTime) {
                 $endTime = $endTimeCarbon->copy()->subHours(1)->format('H:i'); // یک ساعت کمتر برای جلوگیری از مساوی شدن
             } else {
                 $endTime = $endTimeCarbon->format('H:i');
             }
        }


        return [
            'name' => 'الگوی کاری ' . $this->faker->unique()->word() . ' ' . $this->faker->randomNumber(2),
            'type' => $type,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'work_duration_minutes' => $this->faker->numberBetween(240, 600), // بین ۴ تا ۱۰ ساعت
        ];
    }
    /**
     * حالت خاص برای الگوی ثابت
     */
    public function fixed(): static
    {
        return $this->state(function (array $attributes) {
            $startTime = $this->faker->time('H:i');
            $endTimeCarbon = \Carbon\Carbon::createFromFormat('H:i', $startTime)->addHours($this->faker->numberBetween(6, 10)); // مثلا ۶ تا ۱۰ ساعت
            $endTime = $endTimeCarbon->format('H:i');
             // ساده‌سازی: فرض می‌کنیم به روز بعد نمی‌رود
            if ($endTime <= $startTime) { $endTime = \Carbon\Carbon::createFromFormat('H:i', $startTime)->addHours(8)->format('H:i'); }

            return [
                'type' => 'fixed',
                'start_time' => $startTime,
                'end_time' => $endTime,
            ];
        });
    }

    /**
     * حالت خاص برای الگوی شناور
     */
    public function floating(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'floating',
            'start_time' => null,
            'end_time' => null,
        ]);
    }
}
