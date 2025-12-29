<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class, // Run first to create roles
            AdminSeeder::class,
            CompanyProfileSeeder::class,
            ServiceSeeder::class,
            GallerySeeder::class,
            PackageSeeder::class,
            PortfolioSeeder::class,
            InventorySeeder::class,
        ]);
    }
}
