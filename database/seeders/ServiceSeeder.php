<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Service;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            [
                'name' => 'Paket Pernikahan Premium',
                'description' => 'Paket lengkap untuk pernikahan mewah dengan dekorasi eksklusif, katering premium, dan dokumentasi profesional. Termasuk pelaminan, bunga, lighting, sound system, dan MC berpengalaman.',
                'price' => 50000000,
                'category' => 'wedding_package',
                'image' => '/images/services/premium-wedding.jpg',
                'is_active' => true,
            ],
            [
                'name' => 'Paket Pernikahan Standar',
                'description' => 'Paket pernikahan dengan dekorasi elegan dan fasilitas lengkap untuk acara yang berkesan. Cocok untuk budget menengah dengan kualitas terjamin.',
                'price' => 25000000,
                'category' => 'wedding_package',
                'image' => '/images/services/standard-wedding.jpg',
                'is_active' => true,
            ],
            [
                'name' => 'Paket Pernikahan Simple',
                'description' => 'Paket pernikahan sederhana namun tetap indah dan berkesan. Ideal untuk pasangan yang menginginkan acara intimate dengan budget terbatas.',
                'price' => 15000000,
                'category' => 'wedding_package',
                'image' => '/images/services/simple-wedding.jpg',
                'is_active' => true,
            ],
            [
                'name' => 'Dekorasi Pelaminan',
                'description' => 'Dekorasi pelaminan yang indah dan elegan dengan berbagai pilihan tema dan warna sesuai keinginan pengantin.',
                'price' => 5000000,
                'category' => 'decoration',
                'image' => '/images/services/decoration.jpg',
                'is_active' => true,
            ],
            [
                'name' => 'Katering Pernikahan',
                'description' => 'Layanan katering untuk acara pernikahan dengan menu lengkap dan cita rasa yang lezat. Tersedia paket untuk 100-500 tamu.',
                'price' => 150000,
                'category' => 'catering',
                'image' => '/images/services/catering.jpg',
                'is_active' => true,
            ],
            [
                'name' => 'Dokumentasi Foto & Video',
                'description' => 'Dokumentasi profesional untuk mengabadikan momen spesial pernikahan Anda. Termasuk pre-wedding, akad, dan resepsi.',
                'price' => 8000000,
                'category' => 'documentation',
                'image' => '/images/services/photography.jpg',
                'is_active' => true,
            ],
            [
                'name' => 'Makeup & Busana Pengantin',
                'description' => 'Layanan makeup dan busana pengantin dengan MUA profesional dan koleksi gaun/jas pengantin terbaru.',
                'price' => 3000000,
                'category' => 'makeup_fashion',
                'image' => '/images/services/makeup.jpg',
                'is_active' => true,
            ],
            [
                'name' => 'Sound System & Lighting',
                'description' => 'Penyewaan sound system dan lighting profesional untuk acara pernikahan yang meriah dan berkesan.',
                'price' => 2000000,
                'category' => 'equipment',
                'image' => '/images/services/sound-lighting.jpg',
                'is_active' => true,
            ],
            [
                'name' => 'Master of Ceremony (MC)',
                'description' => 'Jasa MC profesional yang akan memandu acara pernikahan Anda dengan santun dan menghibur.',
                'price' => 1500000,
                'category' => 'entertainment',
                'image' => '/images/services/mc.jpg',
                'is_active' => true,
            ],
            [
                'name' => 'Paket Engagement',
                'description' => 'Paket lengkap untuk acara lamaran/tunangan dengan dekorasi romantis dan dokumentasi indah.',
                'price' => 8000000,
                'category' => 'engagement',
                'image' => '/images/services/engagement.jpg',
                'is_active' => true,
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}
