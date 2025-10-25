<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Holiday>
 */
class HolidayFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'date' => $this->faker->unique()->dateTimeBetween('-1 year', '+1 year')->format('Y-m-d'),
            'name' => 'تعطیلی ' . $this->faker->word() . ' ' . $this->faker->randomNumber(2),
            'is_official' => true,
        ];
    }

    /**
     * حالت خاص برای تعطیلات غیررسمی (اضافه شده توسط ادمین)
     */
    public function nonOfficial(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_official' => false,
            'name' => 'تعطیلی دستی ' . $this->faker->randomNumber(3),
        ]);
    }
}
