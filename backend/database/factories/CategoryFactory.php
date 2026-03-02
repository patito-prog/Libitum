<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->randomElement(['Rock', 'Jazz', 'Pop', 'Clásica', 'Magia', 'Teatro', 'Danza', 'Circo']);
        return [
            'name' => $name,
            'slug' => \Illuminate\Support\Str::slug($name),
            'icon' => fake()->randomElement(['Music', 'Mic', 'Star', 'Heart']),
            'color' => fake()->hexColor(),
        ];
    }
}
