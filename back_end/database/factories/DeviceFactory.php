<?php

namespace Database\Factories;

use App\Models\Device;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Arr;

/**
 * @extends Factory<Device>
 */
class DeviceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
       $type = Arr::random(['ai_service', 'camera', 'manual_kiosk']);

        $status = Arr::random(['online', 'offline', 'maintenance']);

        return [
            'name' => 'دستگاه ' . $this->faker->unique()->word() . ' ' . $this->faker->randomNumber(2),
            'registration_area' => 'ناحیه ' . $this->faker->citySuffix() . ' ' . $this->faker->buildingNumber(),
            'type' => $type,
            'status' => $status,
            // آخرین زمان فعالیت رو تصادفی در یک ساعت گذشته در نظر می‌گیریم (اگر آنلاین بود)
            'last_heartbeat_at' => $status === 'online' ? $this->faker->dateTimeBetween('-1 hour', 'now') : null,
            // آخرین IP شناخته شده (اگر آنلاین بود)
            'last_known_ip' => $status === 'online' ? $this->faker->ipv4() : null,
            // 'api_key' به صورت خودکار توسط متد boot مدل ساخته می‌شه، نیازی به تعریف اینجا نیست
        ];
    }

    /**
     * حالت خاص برای دستگاه آنلاین
     */
    public function online(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'online',
            'last_heartbeat_at' => now(),
            'last_known_ip' => $this->faker->ipv4(),
        ]);
    }

    /**
     * حالت خاص برای دستگاه آفلاین
     */
    public function offline(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'offline',
            'last_heartbeat_at' => $this->faker->dateTimeBetween('-1 week', '-1 hour'), // آخرین فعالیت قدیمی‌تر
            'last_known_ip' => $this->faker->ipv4(), // IP ممکن است هنوز وجود داشته باشد
        ]);
    }

     /**
      * حالت خاص برای نوع سرویس AI
      */
     public function aiService(): static
     {
         return $this->state(fn (array $attributes) => [
             'type' => 'ai_service',
         ]);
     }
}
