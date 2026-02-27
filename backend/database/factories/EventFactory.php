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
            'location' => fake()->streetAddress() . ', ' . fake()->city(),
            'event_date' => fake()->dateTimeBetween('now', '+1 month'),
            'price' => fake()->randomFloat(2, 0, 50),
            'status' => 'published',
            'cover_image' => 'https://picsum.photos/seed/' . fake()->uuid() . '/800/600',
        ];
    }
}
