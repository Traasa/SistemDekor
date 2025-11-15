<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Gallery;

class GallerySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $galleries = [
            [
                'title' => 'Pernikahan Premium di Ballroom Hotel',
                'description' => 'Acara pernikahan mewah dengan dekorasi eksklusif di ballroom hotel berbintang.',
                'image_path' => '/images/gallery/premium-ballroom.jpg',
                'category' => 'premium_wedding',
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'title' => 'Garden Wedding Romantis',
                'description' => 'Pernikahan outdoor di taman dengan konsep natural dan romantis.',
                'image_path' => '/images/gallery/garden-wedding.jpg',
                'category' => 'outdoor_wedding',
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'title' => 'Dekorasi Pelaminan Tradisional Jawa',
                'description' => 'Pelaminan dengan nuansa tradisional Jawa yang elegan dan bermakna.',
                'image_path' => '/images/gallery/traditional-javanese.jpg',
                'category' => 'traditional',
                'is_featured' => true,
                'sort_order' => 3,
            ],
            [
                'title' => 'Pernikahan Modern Minimalis',
                'description' => 'Konsep pernikahan modern dengan dekorasi minimalis yang elegan.',
                'image_path' => '/images/gallery/modern-minimalist.jpg',
                'category' => 'modern_wedding',
                'is_featured' => false,
                'sort_order' => 4,
            ],
            [
                'title' => 'Intimate Wedding di Villa',
                'description' => 'Pernikahan intimate dengan keluarga dekat di villa pribadi.',
                'image_path' => '/images/gallery/intimate-villa.jpg',
                'category' => 'intimate_wedding',
                'is_featured' => false,
                'sort_order' => 5,
            ],
            [
                'title' => 'Rustic Wedding di Barn',
                'description' => 'Pernikahan dengan tema rustic di venue barn yang unik.',
                'image_path' => '/images/gallery/rustic-barn.jpg',
                'category' => 'rustic_wedding',
                'is_featured' => false,
                'sort_order' => 6,
            ],
            [
                'title' => 'Beach Wedding Sunset',
                'description' => 'Pernikahan pantai dengan latar belakang sunset yang memukau.',
                'image_path' => '/images/gallery/beach-sunset.jpg',
                'category' => 'beach_wedding',
                'is_featured' => true,
                'sort_order' => 7,
            ],
            [
                'title' => 'Wedding Reception Hall',
                'description' => 'Resepsi pernikahan di hall dengan dekorasi mewah dan lighting dramatis.',
                'image_path' => '/images/gallery/reception-hall.jpg',
                'category' => 'reception',
                'is_featured' => false,
                'sort_order' => 8,
            ],
            [
                'title' => 'Engagement Party Outdoor',
                'description' => 'Acara lamaran outdoor dengan dekorasi bunga dan lighting romantis.',
                'image_path' => '/images/gallery/engagement-outdoor.jpg',
                'category' => 'engagement',
                'is_featured' => false,
                'sort_order' => 9,
            ],
            [
                'title' => 'Wedding Cake & Dessert Table',
                'description' => 'Meja dessert dengan wedding cake bertingkat dan berbagai kue manis.',
                'image_path' => '/images/gallery/dessert-table.jpg',
                'category' => 'catering',
                'is_featured' => false,
                'sort_order' => 10,
            ],
            [
                'title' => 'Bridal Photoshoot',
                'description' => 'Sesi foto pengantin dengan makeup dan busana yang menawan.',
                'image_path' => '/images/gallery/bridal-photoshoot.jpg',
                'category' => 'photography',
                'is_featured' => false,
                'sort_order' => 11,
            ],
            [
                'title' => 'Wedding Car Decoration',
                'description' => 'Dekorasi mobil pengantin dengan bunga dan pita yang elegan.',
                'image_path' => '/images/gallery/car-decoration.jpg',
                'category' => 'decoration',
                'is_featured' => false,
                'sort_order' => 12,
            ],
        ];

        foreach ($galleries as $gallery) {
            Gallery::create($gallery);
        }
    }
}
