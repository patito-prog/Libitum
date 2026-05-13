<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(3);
        return [
            'user_id' => \App\Models\User::factory(), // Crea un usuario si no se le pasa uno
            'title' => $title,
            'slug' => \Illuminate\Support\Str::slug($title),
            'description' => fake()->paragraphs(3, true),
            'location' => fake()->streetAddress() . ', ' . fake()->city() . ', ' . fake()->country(),
            'latitude' => fake()->latitude(-60, 60),
            'longitude' => fake()->longitude(-120, 120),
            'event_date' => fake()->dateTimeBetween('now', '+1 month'),
            'max_capacity' => fake()->optional(0.7)->numberBetween(50, 5000),
            'price' => fake()->randomFloat(2, 0, 50),
            'status_id' => \App\Models\Status::inRandomOrder()->first()->id ?? 1,
            'cover_image' => 'https://picsum.photos/seed/' . fake()->uuid() . '/800/600',
        ];
    }
}
