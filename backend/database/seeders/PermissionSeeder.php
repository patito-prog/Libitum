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
    public function run(): void
    {
        // Permisos generales
        Permission::create(['name' => 'ver artistas']);
        Permission::create(['name' => 'seguir artistas']);
        
        // Permisos de artista
        Permission::create(['name' => 'editar perfil artista']);
        Permission::create(['name' => 'ver mis seguidores']);
        
        // Permisos de administrador
        Permission::create(['name' => 'gestionar usuarios']);
        Permission::create(['name' => 'banear usuarios']);
    }
}
