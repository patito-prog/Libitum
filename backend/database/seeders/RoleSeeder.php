<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
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

        $admin->givePermissionTo(Permission::all());

        $artist->givePermissionTo([
            'ver artistas', 'seguir artistas', 'editar perfil artista', 'ver mis seguidores',
            'ver usuario','editar usuario',
            'ver perfil','crear perfil','editar perfil','borrar perfil',
            'ver evento','crear evento','editar evento','borrar evento',
        ]);

        $spectator->givePermissionTo([
            'ver artistas','seguir artistas',
            'ver usuario','editar usuario',
            'ver perfil',
            'ver evento',
        ]);
    }
}
