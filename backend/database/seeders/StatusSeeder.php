<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            ['name' => 'draft' , 'color' => 'gray'],
            ['name' => 'published', 'color' => 'green'],
            ['name' => 'live', 'color' => 'orange'],
            ['name' => 'finished', 'color' => 'gray'],
            ['name' => 'cancelled', 'color' => 'red'],
        ];

        foreach ($statuses as $status) {
            \App\Models\Status::updateOrCreate(['name' => $status['name']], $status);
        }
    }
}
