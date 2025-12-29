<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Dashboard
            'view dashboard',
            
            // User Management
            'view users',
            'create users',
            'edit users',
            'delete users',
            
            // Role Management
            'view roles',
            'create roles',
            'edit roles',
            'delete roles',
            'manage permissions',
            
            // Order Management
            'view orders',
            'create orders',
            'edit orders',
            'delete orders',
            'confirm orders',
            'approve orders',
            
            // Payment Management
            'view payments',
            'verify payments',
            'reject payments',
            'manage payments',
            
            // Client Management
            'view clients',
            'create clients',
            'edit clients',
            'delete clients',
            'verify clients',
            
            // Package Management
            'view packages',
            'create packages',
            'edit packages',
            'delete packages',
            
            // Services Management
            'view services',
            'create services',
            'edit services',
            'delete services',
            
            // Events Management
            'view events',
            'create events',
            'edit events',
            'delete events',
            
            // Inventory Management
            'view inventory',
            'create inventory',
            'edit inventory',
            'delete inventory',
            'manage inventory transactions',
            
            // Employee Management
            'view employees',
            'create employees',
            'edit employees',
            'delete employees',
            'manage employee schedules',
            'manage employee assignments',
            'manage employee attendance',
            
            // Vendor Management
            'view vendors',
            'create vendors',
            'edit vendors',
            'delete vendors',
            'manage vendor contracts',
            'manage vendor ratings',
            
            // Venue Management
            'view venues',
            'create venues',
            'edit venues',
            'delete venues',
            'manage venue bookings',
            
            // Gallery Management
            'view gallery',
            'create gallery',
            'edit gallery',
            'delete gallery',
            
            // Portfolio Management
            'view portfolio',
            'create portfolio',
            'edit portfolio',
            'delete portfolio',
            
            // Testimonials Management
            'view testimonials',
            'create testimonials',
            'edit testimonials',
            'delete testimonials',
            
            // Report Management
            'view reports',
            'view sales report',
            'view inventory report',
            'view performance report',
            'export reports',
            
            // Settings Management
            'view settings',
            'manage general settings',
            'manage notifications',
            'manage email templates',
            'manage backup restore',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions

        // Super Admin - has all permissions
        $superAdmin = Role::create(['name' => 'super_admin']);
        $superAdmin->givePermissionTo(Permission::all());

        // Admin - has most permissions
        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo([
            'view dashboard',
            // Orders & Payments
            'view orders', 'create orders', 'edit orders', 'delete orders', 'approve orders',
            'view payments', 'verify payments', 'reject payments', 'manage payments',
            // Clients
            'view clients', 'create clients', 'edit clients', 'delete clients', 'verify clients',
            // Packages & Services
            'view packages', 'create packages', 'edit packages', 'delete packages',
            'view services', 'create services', 'edit services', 'delete services',
            // Events
            'view events', 'create events', 'edit events', 'delete events',
            // Inventory
            'view inventory', 'create inventory', 'edit inventory', 'delete inventory', 'manage inventory transactions',
            // Employees
            'view employees', 'create employees', 'edit employees', 'delete employees',
            'manage employee schedules', 'manage employee assignments', 'manage employee attendance',
            // Vendors
            'view vendors', 'create vendors', 'edit vendors', 'delete vendors',
            'manage vendor contracts', 'manage vendor ratings',
            // Venues
            'view venues', 'create venues', 'edit venues', 'delete venues', 'manage venue bookings',
            // Gallery & Portfolio
            'view gallery', 'create gallery', 'edit gallery', 'delete gallery',
            'view portfolio', 'create portfolio', 'edit portfolio', 'delete portfolio',
            // Testimonials
            'view testimonials', 'create testimonials', 'edit testimonials', 'delete testimonials',
            // Reports
            'view reports', 'view sales report', 'view inventory report', 'view performance report', 'export reports',
            // Settings
            'view settings', 'manage general settings', 'manage notifications', 'manage email templates', 'manage backup restore',
            // Users
            'view users', 'create users', 'edit users',
        ]);

        // Manager - can view and manage operations
        $manager = Role::create(['name' => 'manager']);
        $manager->givePermissionTo([
            'view dashboard',
            // Orders & Payments
            'view orders', 'create orders', 'edit orders', 'approve orders',
            'view payments', 'verify payments',
            // Clients
            'view clients', 'create clients', 'edit clients', 'verify clients',
            // Packages & Services
            'view packages', 'view services',
            // Events
            'view events', 'create events', 'edit events',
            // Inventory
            'view inventory', 'edit inventory', 'manage inventory transactions',
            // Employees
            'view employees', 'manage employee schedules', 'manage employee assignments', 'manage employee attendance',
            // Vendors
            'view vendors', 'manage vendor ratings',
            // Venues
            'view venues', 'manage venue bookings',
            // Gallery & Portfolio
            'view gallery', 'view portfolio',
            // Testimonials
            'view testimonials',
            // Reports
            'view reports', 'view sales report', 'view inventory report', 'view performance report',
        ]);

        // Staff - basic operations
        $staff = Role::create(['name' => 'staff']);
        $staff->givePermissionTo([
            'view dashboard',
            'view orders', 'create orders', 'edit orders',
            'view payments',
            'view clients', 'create clients', 'edit clients',
            'view packages', 'view services',
            'view events',
            'view inventory',
            'view employees',
            'view vendors',
            'view venues',
            'view gallery', 'view portfolio',
            'view testimonials',
        ]);

        // Employee - self management
        $employee = Role::create(['name' => 'employee']);
        $employee->givePermissionTo([
            'view dashboard',
            'manage employee schedules',
            'manage employee assignments',
            'manage employee attendance',
        ]);

        // Client - customer role with limited access
        $client = Role::create(['name' => 'client']);
        $client->givePermissionTo([
            'view packages',
            'view services',
            'view gallery',
            'view portfolio',
            'view testimonials',
            'create orders',
            'view orders', // only their own
        ]);

        $this->command->info('Roles and Permissions created successfully!');
        $this->command->info('');
        $this->command->info('Created Roles:');
        $this->command->info('- super_admin (Full Access)');
        $this->command->info('- admin (Admin Access)');
        $this->command->info('- manager (Manager Access)');
        $this->command->info('- staff (Staff Access)');
        $this->command->info('- employee (Employee Access)');
        $this->command->info('- client (Customer Access)');
    }
}
