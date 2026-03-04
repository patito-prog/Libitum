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
        Role::create(['name' => 'spectator']);
        Role::create(['name' => 'artist']);
        Role::create(['name' => 'admin']);

        $admin = Role::findPermissionTo('admin');
        $admin->givePermissionTo(Permission::all());

        $artist = Role::findPermissionTo('artist');
        $artist->givePermissionTo([
            'ver usuario',
            'crear usuario',
            'editar usuario',

        ]);
    }
}
