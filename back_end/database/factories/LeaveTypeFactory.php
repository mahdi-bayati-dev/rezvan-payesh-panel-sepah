<?php

namespace Database\Factories;

use App\Models\LeaveType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LeaveType>
 */
class LeaveTypeFactory extends Factory
{
    protected $model = LeaveType::class;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'مرخصی ' . $this->faker->unique()->word(),
            'parent_id' => null,
        ];
    }
    /**
     * حالت خاص برای ساختن نوع مرخصی زیرمجموعه
     */
    public function childOf(LeaveType $parent): static
    {
        return $this->state(fn(array $attributes) => [
            'parent_id' => $parent->id,
        ]);
    }
}
