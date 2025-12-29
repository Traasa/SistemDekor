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
        // Create Super Admin
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@sistemdekor.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);
        $superAdmin->assignRole('super_admin');

        // Create Admin
        $admin = User::create([
            'name' => 'Admin Wedding Organizer',
            'email' => 'admin@sistemdekor.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);
        $admin->assignRole('admin');

        // Create Manager
        $manager = User::create([
            'name' => 'Manager Operasional',
            'email' => 'manager@sistemdekor.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);
        $manager->assignRole('manager');

        // Create Staff users
        $staff1 = User::create([
            'name' => 'Staff Wedding Organizer',
            'email' => 'staff@sistemdekor.com', 
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);
        $staff1->assignRole('staff');

        $staff2 = User::create([
            'name' => 'Staff Koordinator',
            'email' => 'koordinator@sistemdekor.com', 
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);
        $staff2->assignRole('staff');

        // Create Employee users
        $employee1 = User::create([
            'name' => 'Budi Santoso - Dekorator',
            'email' => 'budi.dekorator@sistemdekor.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);
        $employee1->assignRole('employee');

        $employee2 = User::create([
            'name' => 'Siti Rahayu - Catering',
            'email' => 'siti.catering@sistemdekor.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);
        $employee2->assignRole('employee');

        // Create Client/Customer users
        $client1 = User::create([
            'name' => 'Andi & Sari',
            'email' => 'andi.sari@example.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);
        $client1->assignRole('client');

        $client2 = User::create([
            'name' => 'Budi & Rina',
            'email' => 'budi.rina@example.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);
        $client2->assignRole('client');

        $client3 = User::create([
            'name' => 'Doni & Maya',
            'email' => 'doni.maya@example.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);
        $client3->assignRole('client');

        $this->command->info('Users with roles seeded successfully!');
        $this->command->info('');
        $this->command->info('Login Credentials:');
        $this->command->info('Super Admin: superadmin@sistemdekor.com / password123');
        $this->command->info('Admin: admin@sistemdekor.com / password123');
        $this->command->info('Manager: manager@sistemdekor.com / password123');
        $this->command->info('Staff: staff@sistemdekor.com / password123');
        $this->command->info('Employee: budi.dekorator@sistemdekor.com / password123');
        $this->command->info('Client: andi.sari@example.com / password123');
    }
}
