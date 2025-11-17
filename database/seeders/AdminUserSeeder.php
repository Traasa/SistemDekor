<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin user
        User::updateOrCreate(
            ['email' => 'admin@sistemdekor.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Create Sales user
        User::updateOrCreate(
            ['email' => 'sales@sistemdekor.com'],
            [
                'name' => 'Sales User',
                'password' => Hash::make('password'),
                'role' => 'sales',
                'email_verified_at' => now(),
            ]
        );

        // Create Regular user
        User::updateOrCreate(
            ['email' => 'user@sistemdekor.com'],
            [
                'name' => 'Regular User',
                'password' => Hash::make('password'),
                'role' => 'user',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✅ Admin users created successfully!');
        $this->command->info('📧 Admin: admin@sistemdekor.com / password');
        $this->command->info('📧 Sales: sales@sistemdekor.com / password');
        $this->command->info('📧 User: user@sistemdekor.com / password');
    }
}

