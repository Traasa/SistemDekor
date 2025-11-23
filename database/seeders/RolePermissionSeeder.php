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
            
            // Order Management
            'view orders',
            'create orders',
            'edit orders',
            'delete orders',
            'confirm orders',
            
            // Payment Management
            'view payments',
            'verify payments',
            'reject payments',
            'generate payment links',
            
            // Client Management
            'view clients',
            'create clients',
            'edit clients',
            'delete clients',
            
            // Package Management
            'view packages',
            'create packages',
            'edit packages',
            'delete packages',
            
            // Inventory Management
            'view inventory',
            'create inventory',
            'edit inventory',
            'delete inventory',
            
            // Gallery Management
            'view gallery',
            'create gallery',
            'edit gallery',
            'delete gallery',
            
            // Report Management
            'view reports',
            'export reports',
            
            // Settings Management
            'view settings',
            'edit settings',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions

        // Super Admin - has all permissions
        $superAdmin = Role::create(['name' => 'super_admin']);
        $superAdmin->givePermissionTo(Permission::all());

        // Admin - has most permissions except user/role management
        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo([
            'view orders', 'create orders', 'edit orders', 'confirm orders',
            'view payments', 'verify payments', 'reject payments', 'generate payment links',
            'view clients', 'create clients', 'edit clients',
            'view packages', 'create packages', 'edit packages',
            'view inventory', 'create inventory', 'edit inventory',
            'view gallery', 'create gallery', 'edit gallery',
            'view reports',
        ]);

        // Manager - can view and manage orders, clients, inventory
        $manager = Role::create(['name' => 'manager']);
        $manager->givePermissionTo([
            'view orders', 'create orders', 'edit orders',
            'view payments',
            'view clients', 'create clients', 'edit clients',
            'view inventory', 'create inventory', 'edit inventory',
            'view reports',
        ]);

        // Staff - can view and create basic data
        $staff = Role::create(['name' => 'staff']);
        $staff->givePermissionTo([
            'view orders',
            'view clients',
            'view inventory',
            'view gallery',
        ]);

        // Client - customer role with limited access
        $client = Role::create(['name' => 'client']);
        $client->givePermissionTo([
            'view orders', // only their own orders
        ]);

        $this->command->info('Roles and Permissions created successfully!');
    }
}
