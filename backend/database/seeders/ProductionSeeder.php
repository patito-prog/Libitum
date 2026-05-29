<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Seeder de PRODUCCIÓN: mete solo lo imprescindible para que la app
 * arranque vacía pero funcional. NADA de datos falsos (ni artistas
 * inventados, ni eventos de prueba, ni Mozart).
 *
 * Lo que crea:
 *  - Estados de evento (draft, published, live, finished, cancelled).
 *  - Permisos y roles de Spatie (sin roles el registro no funciona).
 *  - Categorías reales (Rock, Jazz, Pop...).
 *  - UN usuario admin, con la contraseña sacada de la variable de entorno
 *    ADMIN_PASSWORD (nunca hardcodeada).
 *
 * EJECUCIÓN (una sola vez tras desplegar):
 *      php artisan db:seed --class=ProductionSeeder --force
 *
 * Es idempotente: si lo lanzas dos veces no duplica ni revienta.
 */
class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        // Limpiamos la caché de permisos antes de tocar roles/permisos.
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Estados: el StatusSeeder ya usa updateOrCreate, así que es seguro.
        $this->call(StatusSeeder::class);

        // Permisos y roles: solo si todavía no existen los roles, para que
        // relanzar el seeder no pete con "role already exists".
        if (Role::count() === 0) {
            $this->call([
                PermissionSeeder::class,
                RoleSeeder::class,
            ]);
        }

        // Categorías reales con nombre/slug fijos (no aleatorios).
        $categorias = [
            ['name' => 'Rock',    'icon' => 'Music', 'color' => '#e2574c'],
            ['name' => 'Jazz',    'icon' => 'Music', 'color' => '#7e57c2'],
            ['name' => 'Pop',     'icon' => 'Star',  'color' => '#ff8a5b'],
            ['name' => 'Clásica', 'icon' => 'Music', 'color' => '#1a7d82'],
            ['name' => 'Magia',   'icon' => 'Star',  'color' => '#f2b705'],
            ['name' => 'Teatro',  'icon' => 'Mic',   'color' => '#c2185b'],
            ['name' => 'Danza',   'icon' => 'Heart', 'color' => '#3949ab'],
            ['name' => 'Circo',   'icon' => 'Star',  'color' => '#43a047'],
            ['name' => 'Otro',    'icon' => 'Star',  'color' => '#64748b'],
        ];

        foreach ($categorias as $cat) {
            Category::updateOrCreate(
                ['slug' => Str::slug($cat['name'])],
                [
                    'name'  => $cat['name'],
                    'slug'  => Str::slug($cat['name']),
                    'icon'  => $cat['icon'],
                    'color' => $cat['color'],
                ]
            );
        }

        // Usuario admin. La contraseña sale de ADMIN_PASSWORD (env). Si no
        // está definida, abortamos para no crear un admin con clave débil.
        $adminEmail    = env('ADMIN_EMAIL', 'libitum.project@gmail.com');
        $adminPassword = env('ADMIN_PASSWORD');

        if (! $adminPassword) {
            $this->command->warn(
                'No se ha definido ADMIN_PASSWORD: se omite la creación del admin. '
                . 'Añade ADMIN_PASSWORD (y opcionalmente ADMIN_EMAIL) y vuelve a lanzar el seeder.'
            );
            return;
        }

        $admin = User::firstOrCreate(
            ['email' => $adminEmail],
            [
                'name'              => env('ADMIN_NAME', 'Admin'),
                'password'          => Hash::make($adminPassword),
                // El admin ya viene verificado: no tiene que confirmar nada.
                'email_verified_at' => now(),
            ]
        );

        if (! $admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }
    }
}
