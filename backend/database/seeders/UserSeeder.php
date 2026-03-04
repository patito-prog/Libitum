<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Usuarios Fijos
        \App\Models\User::factory()->create([
            'name' => 'Jefe',
            'email' => 'admin@libitum.com',
            'password' => \Illuminate\Support\Facades\Hash::make('123456'),
            'role' => 'admin',
        ]);

        \App\Models\User::factory()->create([
            'name' => 'Mozart',
            'email' => 'mozart@libitum.com',
            'password' => \Illuminate\Support\Facades\Hash::make('123456'),
            'role' => 'artist',
        ]);

        // 20 Espectadores aleatorios
        \App\Models\User::factory(20)->create(['role' => 'spectator']);
    }
}
