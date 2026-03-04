<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = \App\Models\Category::all();
        $spectators = \App\Models\User::where('role', 'spectator')->get();

        // Creamos 10 Artistas y sus Eventos
        \App\Models\User::factory(10)->create(['role' => 'artist'])->each(function ($artist) use ($categories) {

            // Para cada artista crea entre 1 y 3 eventos
            \App\Models\Event::factory(rand(1, 3))->create([
                'user_id' => $artist->id
            ])->each(function ($event) use ($categories) {
                // Asignar categorías aleatorias
                $event->categories()->attach(
                    $categories->random(rand(1, 3))->pluck('id')
                );
            });
        });

        // Hacer que los espectadores se apunten a eventos aleatorios
        $allEvents = \App\Models\Event::all();
        foreach ($spectators as $spectator) {
            $eventsToJoin = $allEvents->random(rand(1, 3))->pluck('id');
            $spectator->events()->attach($eventsToJoin);
        }
    }
}
