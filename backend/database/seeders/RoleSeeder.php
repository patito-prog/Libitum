<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //Creamos los roles
        $admin = Role::create(['name' => 'admin']);
        $artist = Role::create(['name' => 'artist']);
        $spectator = Role::create(['name' => 'spectator']);

        //Asignamos los permisos a cada rol (Como en el vídeo)
        $admin->givePermissionTo([
            'ver artistas', 'seguir artistas', 'editar perfil artista', 'ver mis seguidores', 'gestionar usuarios', 'banear usuarios'
        ]);

        $artist->givePermissionTo([
            'ver artistas', 'seguir artistas', 'editar perfil artista', 'ver mis seguidores'
        ]);

        $spectator->givePermissionTo([
            'ver artistas', 'seguir artistas'
        ]);
    }
}
