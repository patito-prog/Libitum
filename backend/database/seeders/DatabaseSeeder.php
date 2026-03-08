<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use \App\Models\Category;
use \Spatie\Permission\PermissionRegistrar;
use \App\Models\Event;
use App\Models\ArtistProfile;
class DatabaseSeeder extends Seeder
{
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
        //Borramos la caché de permisos para evitar problemas al ejecutar los seeders.
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        $this->call([
            StatusSeeder::class,
            PermissionSeeder::class,
            RoleSeeder::class,
        ]);

        //Creamos 8 categorías de los eventos (Rock, Indie, Pop...)
        $categories = Category::factory(8)-> create();
        //Creamos 10 Artistas y sus Eventos.
        User::factory(10)->create()->each(function ($artist) use ($categories) {
            $artist->assignRole('artist');
            //Creamos su perfil de artista vacío.
            ArtistProfile::create([
                'user_id' => $artist->id
            ]);
            //Para cada artista crea entre 1 y 3 eventos...
            Event::factory(rand(1, 3))->create([
                'user_id' => $artist->id
            ])->each(function ($event) use ($categories) {
                //Cada evento vamos a asignarle entre 1 o 2 categorías aleatorias.
                $event->categories()->attach($categories->random(rand(1, 3))->pluck('id'));
            });
        });

        //Creamos 20 Espectadores que asisten a eventos aleatorios.
        User::factory(20)->create()->each(function ($spectator){
            $spectator->assignRole('spectator');
            $events = Event::inRandomOrder()->take(rand(1, 3))->pluck('id');
            $spectator->events()->attach($events);
        });

        $adminUser = User::create([
            'name' => 'Jefe',
            'email' => 'admin@libitum.com',
            'password' => Hash::make('123456'),

        ]);
        $adminUser->assignRole('admin');

        $artistUser = User::create([
            'name' => 'Mozart',
            'surname' => 'Wolfgang',
            'email' => 'mozart@libitum.com',
            'password' => Hash::make('123456'),
        ]);
        $artistUser->assignRole('artist');
        ArtistProfile::create([
            'user_id' => $artistUser->id
        ]);
    }
}
