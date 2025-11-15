<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user for Wedding Organizer
        User::create([
            'name' => 'Admin Wedding Organizer',
            'email' => 'admin@weddingorganizer.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // Create sample staff user
        User::create([
            'name' => 'Staff Wedding Organizer',
            'email' => 'staff@weddingorganizer.com', 
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);

        // Create sample customer users
        User::create([
            'name' => 'Andi & Sari',
            'email' => 'andi.sari@example.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);

        User::create([
            'name' => 'Budi & Rina',
            'email' => 'budi.rina@example.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);
    }
}
