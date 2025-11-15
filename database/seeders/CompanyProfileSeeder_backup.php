<?php

namespace Database\Seeders;

u            ],
            'phone' => '+62 21 8765 4321',
            'email' => 'info@elegantweddingorganizer.com',
            'address' => 'Jl. Wedding Paradise No. 456, Jakarta Pusat, DKI Jakarta 10270',
            'website' => 'https://www.elegantweddingorganizer.com',
            'social_media' => [
                'instagram' => 'https://instagram.com/elegantweddingorganizer',
                'facebook' => 'https://facebook.com/elegantweddingorganizer',
                'whatsapp' => 'https://wa.me/6281234567890',
                'youtube' => 'https://youtube.com/@elegantweddingorganizer'
            ]
        ]);
    }Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\CompanyProfile;

class CompanyProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CompanyProfile::create([
            'company_name' => 'Elegant Wedding Organizer',
            'about' => 'Elegant Wedding Organizer adalah wedding organizer profesional yang mengkhususkan diri dalam merencanakan dan mengorganisir pernikahan impian Anda. Dengan pengalaman lebih dari 8 tahun dan tim yang berpengalaman, kami telah membantu ratusan pasangan mewujudkan hari bahagia mereka dengan sempurna. Kami menyediakan layanan lengkap mulai dari konsultasi, perencanaan, dekorasi, hingga eksekusi acara pernikahan yang tak terlupakan.',
            'services' => [
                'Paket Pernikahan Premium',
                'Paket Pernikahan Standar', 
                'Paket Pernikahan Simple',
                'Dekorasi Pelaminan',
                'Katering Pernikahan',
                'Dokumentasi Foto & Video',
                'Makeup & Busana Pengantin',
                'Sound System & Lighting',
                'Master of Ceremony (MC)',
                'Paket Engagement'
            ],
            'gallery' => [
                '/images/gallery/premium-ballroom.jpg',
                '/images/gallery/garden-wedding.jpg',
                '/images/gallery/traditional-javanese.jpg',
                '/images/gallery/modern-minimalist.jpg',
                '/images/gallery/beach-sunset.jpg',
                '/images/gallery/reception-hall.jpg'
            ],
                '/images/gallery/project4.jpg'
            ],
            'phone' => '+62 21 1234 5678',
            'email' => 'info@sistemdekor.com',
            'address' => 'Jl. Dekorasi Indah No. 123, Jakarta Selatan, DKI Jakarta 12345',
            'website' => 'https://www.sistemdekor.com',
            'social_media' => [
                'instagram' => 'https://instagram.com/sistemdekor',
                'facebook' => 'https://facebook.com/sistemdekor',
                'whatsapp' => '+6282112345678'
            ]
        ]);
    }
}
