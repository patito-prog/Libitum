<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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
        $this->call([
            PermissionSeeder::class,
            CategorySeeder::class,
            UserSeeder::class,
            EventSeeder::class,
        ]);
    }
}
