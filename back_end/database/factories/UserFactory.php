<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
          'user_name' => $this->faker->unique()->userName(),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'status' => 'active',
        ];
    }

    public function withRole(string $role): static
    {
        return $this->state([
            // اگر فیلدهای خاصی برای roleهای مختلف دارید
            'status' => 'active',
        ]);
    }


    public function forRole(string $role): static
    {
        $position = match($role) {
            'org-admin-l2' => 'Organization Admin Level 2',
            'org-admin-l3' => 'Organization Admin Level 3',
            'user' => 'Regular Employee',
            default => 'user'
        };

        return $this->state([
            'position' => $position,
        ]);
    }


}
