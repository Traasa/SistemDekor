<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Paket Silver',
                'slug' => 'paket-silver',
                'description' => 'Paket pernikahan basic dengan dekorasi sederhana dan elegan. Cocok untuk acara intimate dengan budget terbatas.',
                'base_price' => 15000000,
                'image_url' => '/images/packages/silver.jpg',
                'is_active' => true,
            ],
            [
                'name' => 'Paket Gold',
                'slug' => 'paket-gold',
                'description' => 'Paket pernikahan premium dengan dekorasi mewah, lighting profesional, dan dokumentasi lengkap. Pilihan terbaik untuk acara menengah.',
                'base_price' => 30000000,
                'image_url' => '/images/packages/gold.jpg',
                'is_active' => true,
            ],
            [
                'name' => 'Paket Platinum',
                'slug' => 'paket-platinum',
                'description' => 'Paket pernikahan super premium all-in dengan dekorasi eksklusif, catering premium, entertainment, dan full documentation. Untuk acara grand wedding.',
                'base_price' => 50000000,
                'image_url' => '/images/packages/platinum.jpg',
                'is_active' => true,
            ],
            [
                'name' => 'Paket Custom',
                'slug' => 'paket-custom',
                'description' => 'Paket pernikahan dengan kustomisasi penuh sesuai keinginan Anda. Hubungi sales kami untuk konsultasi detail.',
                'base_price' => 0,
                'image_url' => '/images/packages/custom.jpg',
                'is_active' => true,
            ],
        ];

        foreach ($packages as $package) {
            Package::create($package);
        }
    }
}
