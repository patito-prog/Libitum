<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        Permission::create(['name' => 'ver usuario']);
        Permission::create(['name' => 'crear usuario']);
        Permission::create(['name' => 'editar usuario']);
        Permission::create(['name' => 'borrar usuario']);

        Permission::create(['name' => 'ver perfil']);
        Permission::create(['name' => 'crear perfil']);
        Permission::create(['name' => 'editar perfil']);
        Permission::create(['name' => 'borrar perfil']);

        Permission::create(['name' => 'ver evento']);
        Permission::create(['name' => 'crear evento']);
        Permission::create(['name' => 'editar evento']);
        Permission::create(['name' => 'borrar evento']);
    }
}
