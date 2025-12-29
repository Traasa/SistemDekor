<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use Carbon\Carbon;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🔄 Clearing existing inventory data...');
        
        // Clear existing data - order matters due to foreign keys
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        InventoryTransaction::truncate();
        InventoryItem::truncate();
        InventoryCategory::truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('📦 Seeding Inventory data...');

        // Create Categories
        $categories = $this->createCategories();
        $this->command->info('✓ Created ' . count($categories) . ' inventory categories');

        // Create Items
        $items = $this->createItems($categories);
        $this->command->info('✓ Created ' . count($items) . ' inventory items');

        // Create Transactions
        $transactions = $this->createTransactions($items);
        $this->command->info('✓ Created ' . count($transactions) . ' inventory transactions');

        $this->command->info('✅ Inventory seeding completed successfully!');
    }

    private function createCategories()
    {
        $categoriesData = [
            [
                'name' => 'Dekorasi',
                'code' => 'DKR',
                'description' => 'Perlengkapan dekorasi acara wedding dan event',
                'color' => '#EC4899',
            ],
            [
                'name' => 'Furniture',
                'code' => 'FRN',
                'description' => 'Kursi, meja, dan furniture untuk acara',
                'color' => '#8B5CF6',
            ],
            [
                'name' => 'Lighting',
                'code' => 'LGT',
                'description' => 'Lampu dan perlengkapan pencahayaan',
                'color' => '#F59E0B',
            ],
            [
                'name' => 'Sound System',
                'code' => 'SND',
                'description' => 'Peralatan audio dan sound system',
                'color' => '#3B82F6',
            ],
            [
                'name' => 'Catering Equipment',
                'code' => 'CTR',
                'description' => 'Perlengkapan katering dan makanan',
                'color' => '#10B981',
            ],
            [
                'name' => 'Backdrop & Panggung',
                'code' => 'BDP',
                'description' => 'Backdrop, panggung, dan properti photo booth',
                'color' => '#EF4444',
            ],
            [
                'name' => 'Kain & Textile',
                'code' => 'TXT',
                'description' => 'Kain, textile, dan perlengkapan kain',
                'color' => '#06B6D4',
            ],
            [
                'name' => 'Peralatan Teknis',
                'code' => 'TKS',
                'description' => 'Peralatan teknis dan instalasi',
                'color' => '#6B7280',
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $data) {
            $categories[] = InventoryCategory::create($data);
        }

        return $categories;
    }

    private function createItems($categories)
    {
        $itemsData = [
            // Dekorasi
            [
                'category_id' => $categories[0]->id,
                'code' => 'DKR-001',
                'name' => 'Bunga Artificial Rose Premium',
                'description' => 'Bunga mawar artificial kualitas premium untuk dekorasi meja',
                'unit' => 'tangkai',
                'quantity' => 250,
                'minimum_stock' => 50,
                'purchase_price' => 25000,
                'selling_price' => 50000,
                'location' => 'Gudang A - Rak 1',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[0]->id,
                'code' => 'DKR-002',
                'name' => 'Rangkaian Bunga Standing',
                'description' => 'Standing flower untuk dekorasi entrance',
                'unit' => 'set',
                'quantity' => 15,
                'minimum_stock' => 5,
                'purchase_price' => 350000,
                'selling_price' => 600000,
                'location' => 'Gudang A - Rak 2',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[0]->id,
                'code' => 'DKR-003',
                'name' => 'Balon Latex Warna Gold',
                'description' => 'Balon latex metallic gold untuk dekorasi',
                'unit' => 'pack',
                'quantity' => 80,
                'minimum_stock' => 20,
                'purchase_price' => 15000,
                'selling_price' => 30000,
                'location' => 'Gudang A - Rak 3',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[0]->id,
                'code' => 'DKR-004',
                'name' => 'Pom Pom Paper Tissue',
                'description' => 'Pom pom kertas tissue berbagai warna',
                'unit' => 'pcs',
                'quantity' => 45,
                'minimum_stock' => 30,
                'purchase_price' => 8000,
                'selling_price' => 15000,
                'location' => 'Gudang A - Rak 3',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[0]->id,
                'code' => 'DKR-005',
                'name' => 'Ribbon Satin Merah',
                'description' => 'Pita satin merah lebar 5cm',
                'unit' => 'roll',
                'quantity' => 8,
                'minimum_stock' => 20,
                'purchase_price' => 35000,
                'selling_price' => 60000,
                'location' => 'Gudang A - Rak 4',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[0]->id,
                'code' => 'DKR-006',
                'name' => 'Buket Bunga Tangan',
                'description' => 'Buket bunga artificial untuk tangan',
                'unit' => 'pcs',
                'quantity' => 0,
                'minimum_stock' => 10,
                'purchase_price' => 85000,
                'selling_price' => 150000,
                'location' => 'Gudang A - Rak 5',
                'condition' => 'good',
            ],

            // Furniture
            [
                'category_id' => $categories[1]->id,
                'code' => 'FRN-001',
                'name' => 'Kursi Tiffany Putih',
                'description' => 'Kursi tiffany warna putih untuk acara wedding',
                'unit' => 'pcs',
                'quantity' => 200,
                'minimum_stock' => 100,
                'purchase_price' => 150000,
                'selling_price' => 20000,
                'location' => 'Gudang B - Area 1',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[1]->id,
                'code' => 'FRN-002',
                'name' => 'Meja Bundar Diameter 120cm',
                'description' => 'Meja bundar untuk tamu 8 orang',
                'unit' => 'pcs',
                'quantity' => 30,
                'minimum_stock' => 15,
                'purchase_price' => 250000,
                'selling_price' => 75000,
                'location' => 'Gudang B - Area 1',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[1]->id,
                'code' => 'FRN-003',
                'name' => 'Sofa Pelaminan 3 Seater',
                'description' => 'Sofa pelaminan elegant untuk pengantin',
                'unit' => 'set',
                'quantity' => 8,
                'minimum_stock' => 3,
                'purchase_price' => 1500000,
                'selling_price' => 2000000,
                'location' => 'Gudang B - Area 2',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[1]->id,
                'code' => 'FRN-004',
                'name' => 'Kursi Futura Hitam',
                'description' => 'Kursi futura untuk acara corporate',
                'unit' => 'pcs',
                'quantity' => 150,
                'minimum_stock' => 80,
                'purchase_price' => 35000,
                'selling_price' => 10000,
                'location' => 'Gudang B - Area 3',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[1]->id,
                'code' => 'FRN-005',
                'name' => 'Meja Koktail Standing',
                'description' => 'Meja koktail tinggi untuk standing party',
                'unit' => 'pcs',
                'quantity' => 4,
                'minimum_stock' => 10,
                'purchase_price' => 180000,
                'selling_price' => 50000,
                'location' => 'Gudang B - Area 4',
                'condition' => 'good',
            ],

            // Lighting
            [
                'category_id' => $categories[2]->id,
                'code' => 'LGT-001',
                'name' => 'LED Par Light RGB',
                'description' => 'Lampu par LED RGB untuk lighting efek',
                'unit' => 'pcs',
                'quantity' => 24,
                'minimum_stock' => 12,
                'purchase_price' => 850000,
                'selling_price' => 200000,
                'location' => 'Gudang C - Box 1',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[2]->id,
                'code' => 'LGT-002',
                'name' => 'Spotlight Follow',
                'description' => 'Follow spot untuk sorot panggung',
                'unit' => 'pcs',
                'quantity' => 6,
                'minimum_stock' => 3,
                'purchase_price' => 3500000,
                'selling_price' => 1000000,
                'location' => 'Gudang C - Box 2',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[2]->id,
                'code' => 'LGT-003',
                'name' => 'Lampu Hias String Light',
                'description' => 'Lampu hias string light warm white 10 meter',
                'unit' => 'roll',
                'quantity' => 35,
                'minimum_stock' => 15,
                'purchase_price' => 125000,
                'selling_price' => 100000,
                'location' => 'Gudang C - Box 3',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[2]->id,
                'code' => 'LGT-004',
                'name' => 'Laser Light Effect',
                'description' => 'Laser light untuk efek cahaya',
                'unit' => 'pcs',
                'quantity' => 1,
                'minimum_stock' => 3,
                'purchase_price' => 2800000,
                'selling_price' => 800000,
                'location' => 'Gudang C - Box 4',
                'condition' => 'good',
            ],

            // Sound System
            [
                'category_id' => $categories[3]->id,
                'code' => 'SND-001',
                'name' => 'Speaker Active 15 inch',
                'description' => 'Speaker active 15 inch 1000 watt',
                'unit' => 'pcs',
                'quantity' => 12,
                'minimum_stock' => 6,
                'purchase_price' => 4500000,
                'selling_price' => 1500000,
                'location' => 'Gudang C - Sound Area',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[3]->id,
                'code' => 'SND-002',
                'name' => 'Wireless Microphone',
                'description' => 'Mic wireless dual channel profesional',
                'unit' => 'set',
                'quantity' => 8,
                'minimum_stock' => 4,
                'purchase_price' => 1800000,
                'selling_price' => 500000,
                'location' => 'Gudang C - Sound Area',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[3]->id,
                'code' => 'SND-003',
                'name' => 'Mixer Audio 16 Channel',
                'description' => 'Mixer audio 16 channel dengan USB',
                'unit' => 'pcs',
                'quantity' => 5,
                'minimum_stock' => 2,
                'purchase_price' => 6500000,
                'selling_price' => 2000000,
                'location' => 'Gudang C - Sound Area',
                'condition' => 'good',
            ],

            // Catering Equipment
            [
                'category_id' => $categories[4]->id,
                'code' => 'CTR-001',
                'name' => 'Chafing Dish Round',
                'description' => 'Chafing dish bundar stainless steel',
                'unit' => 'pcs',
                'quantity' => 40,
                'minimum_stock' => 20,
                'purchase_price' => 450000,
                'selling_price' => 100000,
                'location' => 'Gudang D - Catering',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[4]->id,
                'code' => 'CTR-002',
                'name' => 'Piring Keramik Putih',
                'description' => 'Piring keramik putih diameter 25cm',
                'unit' => 'lusin',
                'quantity' => 50,
                'minimum_stock' => 25,
                'purchase_price' => 180000,
                'selling_price' => 30000,
                'location' => 'Gudang D - Catering',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[4]->id,
                'code' => 'CTR-003',
                'name' => 'Gelas Wine Crystal',
                'description' => 'Gelas wine crystal elegan',
                'unit' => 'lusin',
                'quantity' => 30,
                'minimum_stock' => 15,
                'purchase_price' => 240000,
                'selling_price' => 50000,
                'location' => 'Gudang D - Catering',
                'condition' => 'good',
            ],

            // Backdrop & Panggung
            [
                'category_id' => $categories[5]->id,
                'code' => 'BDP-001',
                'name' => 'Backdrop Flower Wall 3x2.5m',
                'description' => 'Backdrop flower wall artificial premium',
                'unit' => 'set',
                'quantity' => 6,
                'minimum_stock' => 2,
                'purchase_price' => 2500000,
                'selling_price' => 3500000,
                'location' => 'Gudang E - Backdrop',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[5]->id,
                'code' => 'BDP-002',
                'name' => 'Panggung Portable 4x6m',
                'description' => 'Panggung portable modular dengan kaki adjustable',
                'unit' => 'set',
                'quantity' => 3,
                'minimum_stock' => 1,
                'purchase_price' => 8500000,
                'selling_price' => 5000000,
                'location' => 'Gudang E - Panggung',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[5]->id,
                'code' => 'BDP-003',
                'name' => 'Frame Photo Booth',
                'description' => 'Frame photo booth berbagai tema',
                'unit' => 'pcs',
                'quantity' => 12,
                'minimum_stock' => 5,
                'purchase_price' => 450000,
                'selling_price' => 300000,
                'location' => 'Gudang E - Props',
                'condition' => 'good',
            ],

            // Kain & Textile
            [
                'category_id' => $categories[6]->id,
                'code' => 'TXT-001',
                'name' => 'Kain Satin Silk Putih',
                'description' => 'Kain satin silk putih lebar 150cm',
                'unit' => 'meter',
                'quantity' => 180,
                'minimum_stock' => 50,
                'purchase_price' => 45000,
                'selling_price' => 30000,
                'location' => 'Gudang F - Textile',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[6]->id,
                'code' => 'TXT-002',
                'name' => 'Taplak Meja Damask',
                'description' => 'Taplak meja damask ukuran 3x3m',
                'unit' => 'pcs',
                'quantity' => 60,
                'minimum_stock' => 30,
                'purchase_price' => 185000,
                'selling_price' => 75000,
                'location' => 'Gudang F - Textile',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[6]->id,
                'code' => 'TXT-003',
                'name' => 'Sarung Kursi Spandex',
                'description' => 'Sarung kursi spandex putih elastis',
                'unit' => 'pcs',
                'quantity' => 250,
                'minimum_stock' => 100,
                'purchase_price' => 15000,
                'selling_price' => 5000,
                'location' => 'Gudang F - Textile',
                'condition' => 'good',
            ],

            // Peralatan Teknis
            [
                'category_id' => $categories[7]->id,
                'code' => 'TKS-001',
                'name' => 'Kabel Roll 50 Meter',
                'description' => 'Kabel roll listrik 50 meter dengan grounding',
                'unit' => 'pcs',
                'quantity' => 15,
                'minimum_stock' => 8,
                'purchase_price' => 350000,
                'selling_price' => 200000,
                'location' => 'Gudang G - Teknis',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[7]->id,
                'code' => 'TKS-002',
                'name' => 'Generator 5000 Watt',
                'description' => 'Generator listrik portable 5000 watt',
                'unit' => 'pcs',
                'quantity' => 4,
                'minimum_stock' => 2,
                'purchase_price' => 12000000,
                'selling_price' => 3000000,
                'location' => 'Gudang G - Teknis',
                'condition' => 'good',
            ],
            [
                'category_id' => $categories[7]->id,
                'code' => 'TKS-003',
                'name' => 'Tangga Lipat Aluminium 3m',
                'description' => 'Tangga lipat aluminium tinggi 3 meter',
                'unit' => 'pcs',
                'quantity' => 8,
                'minimum_stock' => 4,
                'purchase_price' => 750000,
                'selling_price' => 150000,
                'location' => 'Gudang G - Teknis',
                'condition' => 'good',
            ],
        ];

        $items = [];
        foreach ($itemsData as $data) {
            $items[] = InventoryItem::create($data);
        }

        return $items;
    }

    private function createTransactions($items)
    {
        $transactions = [];
        
        // Get first user for transactions
        $adminUser = \App\Models\User::first();
        if (!$adminUser) {
            $this->command->warn('No users found. Skipping transactions.');
            return $transactions;
        }

        // Stock In transactions (pembelian/restok)
        $stockInData = [
            ['item' => $items[0], 'qty' => 100, 'price' => 25000, 'days_ago' => 90, 'notes' => 'Pembelian awal stok bunga artificial'],
            ['item' => $items[0], 'qty' => 150, 'price' => 25000, 'days_ago' => 45, 'notes' => 'Restock bunga rose premium'],
            ['item' => $items[1], 'qty' => 10, 'price' => 350000, 'days_ago' => 75, 'notes' => 'Pembelian standing flower set'],
            ['item' => $items[2], 'qty' => 50, 'price' => 15000, 'days_ago' => 60, 'notes' => 'Stok balon gold untuk event'],
            ['item' => $items[2], 'qty' => 30, 'price' => 15000, 'days_ago' => 15, 'notes' => 'Restock balon latex'],
            ['item' => $items[6], 'qty' => 200, 'price' => 150000, 'days_ago' => 90, 'notes' => 'Pembelian kursi tiffany batch 1'],
            ['item' => $items[7], 'qty' => 30, 'price' => 250000, 'days_ago' => 80, 'notes' => 'Pembelian meja bundar'],
            ['item' => $items[11], 'qty' => 12, 'price' => 850000, 'days_ago' => 70, 'notes' => 'Pembelian LED par light'],
            ['item' => $items[11], 'qty' => 12, 'price' => 850000, 'days_ago' => 25, 'notes' => 'Tambahan stock LED lighting'],
            ['item' => $items[15], 'qty' => 10, 'price' => 4500000, 'days_ago' => 85, 'notes' => 'Pembelian speaker active'],
            ['item' => $items[18], 'qty' => 30, 'price' => 450000, 'days_ago' => 65, 'notes' => 'Stok chafing dish'],
            ['item' => $items[18], 'qty' => 10, 'price' => 450000, 'days_ago' => 20, 'notes' => 'Restock chafing dish'],
            ['item' => $items[24], 'qty' => 100, 'price' => 45000, 'days_ago' => 75, 'notes' => 'Pembelian kain satin silk'],
            ['item' => $items[24], 'qty' => 80, 'price' => 45000, 'days_ago' => 30, 'notes' => 'Restock kain satin putih'],
        ];

        foreach ($stockInData as $data) {
            $date = Carbon::now()->subDays($data['days_ago']);
            $currentStock = $data['item']->quantity;
            $stockBefore = max(0, $currentStock - $data['qty']);
            
            $transactions[] = InventoryTransaction::create([
                'inventory_item_id' => $data['item']->id,
                'user_id' => $adminUser->id,
                'order_id' => null,
                'type' => 'in',
                'quantity' => $data['qty'],
                'stock_before' => $stockBefore,
                'stock_after' => $currentStock,
                'transaction_date' => $date,
                'notes' => $data['notes'],
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }

        // Stock Out transactions (penggunaan untuk event)
        $stockOutData = [
            ['item' => $items[0], 'qty' => 50, 'days_ago' => 40, 'event' => 'Wedding Andi & Sari'],
            ['item' => $items[0], 'qty' => 30, 'days_ago' => 20, 'event' => 'Wedding Budi & Rina'],
            ['item' => $items[1], 'qty' => 4, 'days_ago' => 35, 'event' => 'Wedding Doni & Maya'],
            ['item' => $items[1], 'qty' => 3, 'days_ago' => 18, 'event' => 'Corporate Event PT ABC'],
            ['item' => $items[2], 'qty' => 20, 'days_ago' => 25, 'event' => 'Birthday Party Sinta'],
            ['item' => $items[6], 'qty' => 100, 'days_ago' => 50, 'event' => 'Wedding Grand Ballroom'],
            ['item' => $items[6], 'qty' => 80, 'days_ago' => 30, 'event' => 'Wedding Outdoor Garden'],
            ['item' => $items[7], 'qty' => 15, 'days_ago' => 45, 'event' => 'Wedding Reception Hotel'],
            ['item' => $items[11], 'qty' => 8, 'days_ago' => 28, 'event' => 'Concert Mini Event'],
            ['item' => $items[15], 'qty' => 6, 'days_ago' => 32, 'event' => 'Wedding Sound System'],
            ['item' => $items[18], 'qty' => 15, 'days_ago' => 22, 'event' => 'Catering Wedding 200 pax'],
            ['item' => $items[24], 'qty' => 50, 'days_ago' => 27, 'event' => 'Dekorasi Backdrop Wedding'],
            ['item' => $items[25], 'qty' => 40, 'days_ago' => 24, 'event' => 'Taplak Meja Wedding'],
        ];

        foreach ($stockOutData as $data) {
            $date = Carbon::now()->subDays($data['days_ago']);
            $currentStock = $data['item']->quantity;
            $stockBefore = $currentStock + $data['qty'];
            
            $transactions[] = InventoryTransaction::create([
                'inventory_item_id' => $data['item']->id,
                'user_id' => $adminUser->id,
                'order_id' => null,
                'type' => 'out',
                'quantity' => $data['qty'],
                'stock_before' => $stockBefore,
                'stock_after' => $currentStock,
                'transaction_date' => $date,
                'notes' => 'Digunakan untuk event: ' . $data['event'],
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }

        // Return transactions (pengembalian setelah event)
        $returnData = [
            ['item' => $items[0], 'qty' => 45, 'days_ago' => 39, 'event' => 'Return dari Wedding Andi & Sari'],
            ['item' => $items[1], 'qty' => 4, 'days_ago' => 34, 'event' => 'Return dari Wedding Doni & Maya'],
            ['item' => $items[6], 'qty' => 95, 'days_ago' => 49, 'event' => 'Return kursi Wedding Grand Ballroom'],
            ['item' => $items[11], 'qty' => 8, 'days_ago' => 27, 'event' => 'Return LED Concert Mini Event'],
            ['item' => $items[15], 'qty' => 6, 'days_ago' => 31, 'event' => 'Return speaker wedding'],
        ];

        foreach ($returnData as $data) {
            $date = Carbon::now()->subDays($data['days_ago']);
            $currentStock = $data['item']->quantity;
            $stockBefore = max(0, $currentStock - $data['qty']);
            
            $transactions[] = InventoryTransaction::create([
                'inventory_item_id' => $data['item']->id,
                'user_id' => $adminUser->id,
                'order_id' => null,
                'type' => 'in',
                'quantity' => $data['qty'],
                'stock_before' => $stockBefore,
                'stock_after' => $currentStock,
                'transaction_date' => $date,
                'notes' => $data['event'],
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }

        // Adjustment transactions (penyesuaian stok)
        $adjustmentData = [
            ['item' => $items[0], 'qty' => 5, 'days_ago' => 10, 'reason' => 'Rusak/patah'],
            ['item' => $items[6], 'qty' => 5, 'days_ago' => 15, 'reason' => 'Kursi rusak tidak dapat digunakan'],
            ['item' => $items[26], 'qty' => 10, 'days_ago' => 12, 'reason' => 'Sarung kursi robek'],
        ];

        foreach ($adjustmentData as $data) {
            $date = Carbon::now()->subDays($data['days_ago']);
            $currentStock = $data['item']->quantity;
            $stockBefore = $currentStock + $data['qty'];
            
            $transactions[] = InventoryTransaction::create([
                'inventory_item_id' => $data['item']->id,
                'user_id' => $adminUser->id,
                'order_id' => null,
                'type' => 'adjustment',
                'quantity' => $data['qty'],
                'stock_before' => $stockBefore,
                'stock_after' => $currentStock,
                'transaction_date' => $date,
                'notes' => 'Stock adjustment: ' . $data['reason'],
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }

        return $transactions;
    }
}
