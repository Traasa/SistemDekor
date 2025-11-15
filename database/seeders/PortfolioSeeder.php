<?php

namespace Database\Seeders;

use App\Models\Portfolio;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PortfolioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $portfolios = [
            [
                'title' => 'Pernikahan Andi & Sari - Garden Wedding',
                'description' => 'Dekorasi outdoor dengan tema garden party, menggunakan bunga segar dan lighting natural.',
                'image_url' => '/images/portfolio/wedding-1.jpg',
                'category' => 'wedding',
                'is_featured' => true,
            ],
            [
                'title' => 'Pernikahan Budi & Dewi - Modern Minimalist',
                'description' => 'Konsep modern minimalis dengan dominasi warna putih dan gold, cocok untuk venue indoor.',
                'image_url' => '/images/portfolio/wedding-2.jpg',
                'category' => 'wedding',
                'is_featured' => true,
            ],
            [
                'title' => 'Pernikahan Candra & Fitri - Traditional Javanese',
                'description' => 'Pernikahan adat Jawa dengan dekorasi tradisional yang anggun dan penuh makna.',
                'image_url' => '/images/portfolio/wedding-3.jpg',
                'category' => 'wedding',
                'is_featured' => true,
            ],
            [
                'title' => 'Tunangan Deni & Ella - Engagement Party',
                'description' => 'Acara pertunangan dengan dekorasi romantic dan intimate untuk keluarga.',
                'image_url' => '/images/portfolio/engagement-1.jpg',
                'category' => 'engagement',
                'is_featured' => false,
            ],
            [
                'title' => 'Pernikahan Fajar & Gita - Beach Wedding',
                'description' => 'Pernikahan di pantai dengan dekorasi tropical dan suasana santai namun elegant.',
                'image_url' => '/images/portfolio/wedding-4.jpg',
                'category' => 'wedding',
                'is_featured' => true,
            ],
            [
                'title' => 'Pernikahan Hendra & Indah - Luxury Ballroom',
                'description' => 'Grand wedding di ballroom hotel bintang 5 dengan dekorasi mewah dan megah.',
                'image_url' => '/images/portfolio/wedding-5.jpg',
                'category' => 'wedding',
                'is_featured' => false,
            ],
        ];

        foreach ($portfolios as $portfolio) {
            Portfolio::create($portfolio);
        }
    }
}
