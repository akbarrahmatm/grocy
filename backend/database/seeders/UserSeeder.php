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
        \App\Models\User::updateOrCreate(
            ['email' => 'admin@grocy.test'],
            [
                'name' => 'Admin',
                'password' => 'admin123',
                'email_verified_at' => now(),
            ]
        );
    }
}
