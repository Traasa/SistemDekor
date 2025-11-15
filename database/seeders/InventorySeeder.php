<?php

namespace Database\Seeders;

use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create categories
        $categories = [
            [
                'name' => 'Dekorasi',
                'code' => 'DKR',
                'description' => 'Perlengkapan dekorasi pernikahan',
                'color' => '#EC4899',
            ],
            [
                'name' => 'Furnitur',
                'code' => 'FRN',
                'description' => 'Meja, kursi, dan furnitur lainnya',
                'color' => '#8B5CF6',
            ],
            [
                'name' => 'Lighting',
                'code' => 'LGT',
                'description' => 'Perlengkapan pencahayaan',
                'color' => '#F59E0B',
            ],
            [
                'name' => 'Audio Visual',
                'code' => 'AVS',
                'description' => 'Sound system dan peralatan AV',
                'color' => '#3B82F6',
            ],
            [
                'name' => 'Catering Equipment',
                'code' => 'CTR',
                'description' => 'Peralatan katering dan makanan',
                'color' => '#10B981',
            ],
        ];

        foreach ($categories as $category) {
            InventoryCategory::create($category);
        }

        // Create sample items
        $items = [
            // Dekorasi
            [
                'category_id' => 1,
                'name' => 'Standing Flower',
                'code' => 'DKR-001',
                'description' => 'Standing flower bunga segar mix',
                'unit' => 'pcs',
                'quantity' => 20,
                'minimum_stock' => 5,
                'purchase_price' => 150000,
                'selling_price' => 250000,
                'location' => 'Gudang A - Rak 1',
                'condition' => 'good',
            ],
            [
                'category_id' => 1,
                'name' => 'Backdrop Kain',
                'code' => 'DKR-002',
                'description' => 'Backdrop kain satin 3x4 meter',
                'unit' => 'pcs',
                'quantity' => 15,
                'minimum_stock' => 3,
                'purchase_price' => 500000,
                'selling_price' => 800000,
                'location' => 'Gudang A - Rak 2',
                'condition' => 'good',
            ],
            [
                'category_id' => 1,
                'name' => 'Bunga Artificial',
                'code' => 'DKR-003',
                'description' => 'Bunga artificial premium mix',
                'unit' => 'set',
                'quantity' => 50,
                'minimum_stock' => 10,
                'purchase_price' => 75000,
                'selling_price' => 150000,
                'location' => 'Gudang A - Rak 3',
                'condition' => 'good',
            ],
            
            // Furnitur
            [
                'category_id' => 2,
                'name' => 'Kursi Tiffany Putih',
                'code' => 'FRN-001',
                'description' => 'Kursi tiffany warna putih',
                'unit' => 'pcs',
                'quantity' => 200,
                'minimum_stock' => 50,
                'purchase_price' => 75000,
                'selling_price' => 15000,
                'location' => 'Gudang B - Area 1',
                'condition' => 'good',
            ],
            [
                'category_id' => 2,
                'name' => 'Meja Bulat Diameter 120cm',
                'code' => 'FRN-002',
                'description' => 'Meja bulat untuk 8-10 orang',
                'unit' => 'pcs',
                'quantity' => 50,
                'minimum_stock' => 10,
                'purchase_price' => 200000,
                'selling_price' => 50000,
                'location' => 'Gudang B - Area 2',
                'condition' => 'good',
            ],
            [
                'category_id' => 2,
                'name' => 'Sofa Pelaminan',
                'code' => 'FRN-003',
                'description' => 'Sofa pelaminan gold/silver',
                'unit' => 'set',
                'quantity' => 5,
                'minimum_stock' => 2,
                'purchase_price' => 3000000,
                'selling_price' => 1500000,
                'location' => 'Gudang B - Area 3',
                'condition' => 'good',
            ],
            
            // Lighting
            [
                'category_id' => 3,
                'name' => 'LED Par Light',
                'code' => 'LGT-001',
                'description' => 'LED Par Light RGB 54pcs',
                'unit' => 'pcs',
                'quantity' => 30,
                'minimum_stock' => 10,
                'purchase_price' => 500000,
                'selling_price' => 150000,
                'location' => 'Gudang C - Rak 1',
                'condition' => 'good',
            ],
            [
                'category_id' => 3,
                'name' => 'Moving Head Light',
                'code' => 'LGT-002',
                'description' => 'Moving head beam 230W',
                'unit' => 'pcs',
                'quantity' => 10,
                'minimum_stock' => 3,
                'purchase_price' => 5000000,
                'selling_price' => 1000000,
                'location' => 'Gudang C - Rak 2',
                'condition' => 'good',
            ],
            
            // Audio Visual
            [
                'category_id' => 4,
                'name' => 'Sound System Portable',
                'code' => 'AVS-001',
                'description' => 'Sound system portable 15 inch',
                'unit' => 'set',
                'quantity' => 8,
                'minimum_stock' => 2,
                'purchase_price' => 3000000,
                'selling_price' => 800000,
                'location' => 'Gudang C - Area AV',
                'condition' => 'good',
            ],
            [
                'category_id' => 4,
                'name' => 'Wireless Microphone',
                'code' => 'AVS-002',
                'description' => 'Wireless mic dual channel',
                'unit' => 'set',
                'quantity' => 12,
                'minimum_stock' => 3,
                'purchase_price' => 1500000,
                'selling_price' => 350000,
                'location' => 'Gudang C - Area AV',
                'condition' => 'good',
            ],
            
            // Catering Equipment
            [
                'category_id' => 5,
                'name' => 'Chafing Dish',
                'code' => 'CTR-001',
                'description' => 'Chafing dish stainless steel',
                'unit' => 'pcs',
                'quantity' => 40,
                'minimum_stock' => 10,
                'purchase_price' => 300000,
                'selling_price' => 75000,
                'location' => 'Gudang D - Rak 1',
                'condition' => 'good',
            ],
            [
                'category_id' => 5,
                'name' => 'Piring Keramik',
                'code' => 'CTR-002',
                'description' => 'Piring keramik putih diameter 25cm',
                'unit' => 'pcs',
                'quantity' => 500,
                'minimum_stock' => 100,
                'purchase_price' => 15000,
                'selling_price' => 5000,
                'location' => 'Gudang D - Rak 2',
                'condition' => 'good',
            ],
        ];

        foreach ($items as $item) {
            InventoryItem::create($item);
        }
    }
}
