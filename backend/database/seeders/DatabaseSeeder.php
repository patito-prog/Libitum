<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * EJECUCIÓN DEL SEEDER:
     * A. Limpiar tod0 y empezar de cero (Borra las tablas y vuelve a crear con los datos nuevos.)
     *      - ./vendor/bin/sail artisan migrate:fresh --seed
     *
     * B. Solo ejecuta el seeder (si ya tenemos las tablas y no queremos borrarlas.)
     *      - ./vendor/bin/sail artisan db:seed
     *
     */
    public function run(): void
    {
        // Creamos 8 categorías de los eventos (Rock, Indie, Pop...)
        $categories = \App\Models\Category::factory(8)-> create();
        // Creamos 10 Artistas y sus Eventos.
        \App\Models\User::factory(10)->create(['role' => 'artist'])->each(function ($artist) use ($categories) {
            //Para cada artista crea entre 1 y 3 eventos...
            \App\Models\Event::factory(rand(1, 3))->create([
                'user_id' => $artist->id
            ])->each(function ($event) use ($categories) {
                // Cada evento vamos a asignarle entre 1 o 2 categorías aleatorias.
                $event->categories()->attach($categories->random(rand(1, 3))->pluck('id'));
            });
        });

        //Creamos 20 Espectadores que asisten a eventos aleatorios.
        \App\Models\User::factory(20)->create(['role' => 'spectator'])->each(function ($spectator){
            $events = \App\Models\Event::inRandomOrder()->take(rand(1, 3))->pluck('id');
            $spectator->events()->attach($events);
        });
    }
}
