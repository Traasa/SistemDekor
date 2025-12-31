<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Client;
use App\Models\Service;
use App\Models\Package;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\PaymentTransaction;
use App\Models\PaymentProof;
use App\Models\Event;
use App\Models\RundownItem;
use App\Models\Employee;
use App\Models\EmployeeAssignment;
use App\Models\TaskAssignment;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\Vendor;
use App\Models\VendorCategory;
use App\Models\Gallery;
use App\Models\Portfolio;
use App\Models\Testimonial;
use App\Models\CompanyProfile;
use App\Models\Venue;
use App\Models\VenuePricing;
use App\Models\UserActivity;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🚀 Starting Demo Data Seeder...');

        // 1. Create Admin User
        $this->command->info('👤 Creating admin user...');
        $admin = User::firstOrCreate(
            ['email' => 'admin@sistemdekor.com'],
            [
                'name' => 'Admin System',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '081234567890',
                'address' => 'Jakarta, Indonesia',
            ]
        );

        // 2. Company Profile
        $this->command->info('🏢 Creating company profile...');
        CompanyProfile::updateOrCreate(
            ['id' => 1],
            [
                'company_name' => 'Sistem Dekor',
                'about' => 'Sistem Dekor adalah perusahaan penyedia jasa dekorasi dan event organizer profesional yang siap mewujudkan acara impian Anda. Kami berdedikasi untuk memberikan pelayanan terbaik dengan dekorasi yang indah dan profesional.',
                'services' => json_encode([
                    'Wedding Decoration',
                    'Birthday Party Decoration',
                    'Corporate Event Management',
                    'Event Planning & Consultation'
                ]),
                'gallery' => json_encode([
                    '/storage/gallery/img1.jpg',
                    '/storage/gallery/img2.jpg',
                    '/storage/gallery/img3.jpg',
                ]),
                'phone' => '021-12345678',
                'email' => 'info@sistemdekor.com',
                'address' => 'Jl. Merdeka No. 123, Jakarta Pusat, Indonesia',
                'website' => 'https://sistemdekor.com',
                'social_media' => json_encode([
                    'instagram' => '@sistemdekor',
                    'facebook' => 'SistemDekor',
                    'youtube' => 'SistemDekorID',
                    'whatsapp' => '6281234567890'
                ]),
            ]
        );

        // 3. Services
        $this->command->info('⚙️ Creating services...');
        $services = [
            [
                'name' => 'Wedding Decoration',
                'description' => 'Dekorasi pernikahan lengkap dengan konsep modern dan elegan',
                'price' => 15000000,
                'category' => 'Wedding',
                'is_active' => true,
            ],
            [
                'name' => 'Birthday Party',
                'description' => 'Dekorasi ulang tahun untuk segala usia dengan tema custom',
                'price' => 5000000,
                'category' => 'Birthday',
                'is_active' => true,
            ],
            [
                'name' => 'Corporate Event',
                'description' => 'Dekorasi untuk acara perusahaan, seminar, dan gathering',
                'price' => 8000000,
                'category' => 'Corporate',
                'is_active' => true,
            ],
            [
                'name' => 'Engagement Party',
                'description' => 'Dekorasi acara lamaran dan pertunangan',
                'price' => 8000000,
                'category' => 'Wedding',
                'is_active' => true,
            ],
        ];

        foreach ($services as $service) {
            Service::firstOrCreate(['name' => $service['name']], $service);
        }

        // 4. Packages
        $this->command->info('📦 Creating packages...');
        $packages = [
            [
                'name' => 'Silver Package',
                'slug' => 'silver-package',
                'description' => 'Paket basic untuk pernikahan intimate dengan dekorasi pelaminan, backdrop photo booth, lighting dasar, fresh flowers, dan standing flowers (4 pcs).',
                'base_price' => 15000000,
                'is_active' => true,
            ],
            [
                'name' => 'Gold Package',
                'slug' => 'gold-package',
                'description' => 'Paket premium dengan dekorasi pelaminan premium, photo booth + props, lighting advanced, fresh flowers premium, standing flowers (8 pcs), karpet red carpet, dan backdrop video mapping.',
                'base_price' => 25000000,
                'is_active' => true,
            ],
            [
                'name' => 'Platinum Package',
                'slug' => 'platinum-package',
                'description' => 'Paket all-in luxury wedding dengan full venue decoration, luxury pelaminan, photo booth + videographer, LED wall backdrop, premium lighting + effects, fresh & artificial flowers unlimited, standing flowers (15 pcs), red carpet premium, dan sound system.',
                'base_price' => 50000000,
                'is_active' => true,
            ],
        ];

        foreach ($packages as $package) {
            Package::firstOrCreate(
                ['name' => $package['name']],
                $package
            );
        }

        // 5. Clients
        $this->command->info('👥 Creating clients...');
        $clients = [
            [
                'name' => 'Budi Santoso',
                'email' => 'budi.santoso@email.com',
                'phone' => '081234567891',
                'address' => 'Jakarta Selatan',
            ],
            [
                'name' => 'Siti Nurhaliza',
                'email' => 'siti.nur@email.com',
                'phone' => '081234567892',
                'address' => 'Tangerang',
            ],
            [
                'name' => 'PT Digital Indonesia',
                'email' => 'contact@digitalindo.com',
                'phone' => '021-87654321',
                'address' => 'Jakarta Pusat',
            ],
        ];

        $clientModels = [];
        foreach ($clients as $client) {
            $clientModels[] = Client::firstOrCreate(['email' => $client['email']], $client);
        }

        // 6. Employees
        $this->command->info('👷 Creating employees...');
        $employees = [
            [
                'employee_code' => 'EMP-001',
                'name' => 'Ahmad Kurniawan',
                'email' => 'ahmad@sistemdekor.com',
                'phone' => '081234567893',
                'position' => 'manager',
                'department' => 'Operations',
                'join_date' => '2024-01-15',
                'employment_type' => 'full_time',
                'salary' => 8000000,
                'status' => 'active',
            ],
            [
                'employee_code' => 'EMP-002',
                'name' => 'Rina Melati',
                'email' => 'rina@sistemdekor.com',
                'phone' => '081234567894',
                'position' => 'decorator',
                'department' => 'Production',
                'join_date' => '2024-03-20',
                'employment_type' => 'full_time',
                'salary' => 6000000,
                'status' => 'active',
            ],
            [
                'employee_code' => 'EMP-003',
                'name' => 'Dedi Gunawan',
                'email' => 'dedi@sistemdekor.com',
                'phone' => '081234567895',
                'position' => 'lighting_technician',
                'department' => 'Technical',
                'join_date' => '2024-02-10',
                'employment_type' => 'full_time',
                'salary' => 5500000,
                'status' => 'active',
            ],
        ];

        $employeeModels = [];
        foreach ($employees as $employee) {
            $employeeModels[] = Employee::firstOrCreate(
                ['employee_code' => $employee['employee_code']], 
                $employee
            );
        }

        // 7. Inventory Categories & Items
        $this->command->info('📦 Creating inventory...');
        $categories = [
            [
                'name' => 'Lighting Equipment', 
                'code' => 'LIGHT',
                'description' => 'Peralatan pencahayaan',
                'color' => '#FFD700',
            ],
            [
                'name' => 'Decoration Items', 
                'code' => 'DECO',
                'description' => 'Item dekorasi',
                'color' => '#FF69B4',
            ],
            [
                'name' => 'Audio Equipment', 
                'code' => 'AUDIO',
                'description' => 'Peralatan audio',
                'color' => '#4169E1',
            ],
        ];

        $categoryModels = [];
        foreach ($categories as $category) {
            $categoryModels[] = InventoryCategory::firstOrCreate(
                ['code' => $category['code']], 
                $category
            );
        }

        $items = [
            [
                'category_id' => $categoryModels[0]->id,
                'name' => 'LED Par Light',
                'code' => 'LIGHT-PAR-001',
                'description' => 'LED Par Light untuk pencahayaan panggung',
                'quantity' => 20,
                'unit' => 'pcs',
                'purchase_price' => 1200000,
                'selling_price' => 1500000,
                'minimum_stock' => 5,
                'location' => 'Gudang A',
                'condition' => 'good',
            ],
            [
                'category_id' => $categoryModels[1]->id,
                'name' => 'Standing Flowers Premium',
                'code' => 'DECO-SF-001',
                'description' => 'Standing Flowers Premium untuk dekorasi',
                'quantity' => 15,
                'unit' => 'pcs',
                'purchase_price' => 600000,
                'selling_price' => 800000,
                'minimum_stock' => 3,
                'location' => 'Gudang B',
                'condition' => 'good',
            ],
            [
                'category_id' => $categoryModels[2]->id,
                'name' => 'Wireless Microphone',
                'code' => 'AUDIO-MIC-001',
                'description' => 'Wireless Microphone untuk MC dan speaker',
                'quantity' => 10,
                'unit' => 'pcs',
                'purchase_price' => 1800000,
                'selling_price' => 2000000,
                'minimum_stock' => 2,
                'location' => 'Gudang A',
                'condition' => 'good',
            ],
        ];

        foreach ($items as $item) {
            InventoryItem::firstOrCreate(['code' => $item['code']], $item);
        }

        // 8. Vendors
        $this->command->info('🏪 Creating vendors...');
        $vendorCategory = VendorCategory::firstOrCreate(
            ['slug' => 'catering'],
            [
                'name' => 'Catering',
                'description' => 'Vendor katering dan layanan makanan',
            ]
        );

        $vendors = [
            [
                'vendor_code' => 'VEN-001',
                'category_id' => $vendorCategory->id,
                'company_name' => 'Catering Bahagia',
                'contact_person' => 'Ibu Sari',
                'email' => 'info@cateringbahagia.com',
                'phone' => '081234567896',
                'address' => 'Jl. Raya Katering No. 123',
                'city' => 'Jakarta Barat',
                'province' => 'DKI Jakarta',
                'status' => 'active',
                'rating_level' => 'gold',
                'average_rating' => 4.5,
            ],
        ];

        foreach ($vendors as $vendor) {
            Vendor::firstOrCreate(['vendor_code' => $vendor['vendor_code']], $vendor);
        }

        // 9. Venues
        $this->command->info('🏛️ Creating venues...');
        $venue = Venue::firstOrCreate(
            ['code' => 'VEN-GM-001'],
            [
                'name' => 'Grand Ballroom Mulia',
                'description' => 'Ballroom mewah untuk acara besar dengan fasilitas lengkap',
                'address' => 'Jl. Sudirman No. 45',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'postal_code' => '12190',
                'capacity' => 500,
                'min_capacity' => 100,
                'venue_type' => 'ballroom',
                'facilities' => json_encode(['AC', 'Parking', 'Sound System', 'Lighting', 'Stage', 'LED Screen']),
                'contact_person' => 'Manager Grand Mulia',
                'contact_phone' => '021-12345678',
                'contact_email' => 'info@grandmulia.com',
                'is_active' => true,
            ]
        );

        VenuePricing::firstOrCreate(
            [
                'venue_id' => $venue->id, 
                'day_type' => 'weekday',
                'session_type' => 'full_day'
            ],
            [
                'base_price' => 20000000,
                'additional_hour_price' => 2000000,
                'min_hours' => 4,
                'max_hours' => 12,
                'overtime_price' => 2500000,
                'cleaning_fee' => 1000000,
                'security_deposit' => 10000000,
                'is_active' => true,
            ]
        );

        // 10. Gallery & Portfolio
        $this->command->info('🖼️ Creating gallery & portfolio...');
        $galleries = [
            [
                'title' => 'Wedding Budi & Siti',
                'description' => 'Dekorasi pernikahan elegant di Grand Ballroom',
                'image_path' => '/storage/gallery/wedding1.jpg',
                'category' => 'Wedding',
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'title' => 'Birthday Party Kids',
                'description' => 'Pesta ulang tahun tema princess',
                'image_path' => '/storage/gallery/birthday1.jpg',
                'category' => 'Birthday',
                'is_featured' => false,
                'sort_order' => 2,
            ],
        ];

        foreach ($galleries as $gallery) {
            Gallery::firstOrCreate(['title' => $gallery['title']], $gallery);
        }

        Portfolio::firstOrCreate(
            ['title' => 'Wedding Package Premium'],
            [
                'description' => 'Dekorasi pernikahan dengan tema modern rustic untuk Budi & Siti di tanggal 15 Juni 2025. Full venue decoration dengan luxury pelaminan, photo booth, LED wall backdrop, dan premium lighting effects.',
                'image_url' => '/storage/portfolio/wedding-premium.jpg',
                'category' => 'Wedding',
                'is_featured' => true,
            ]
        );

        // 11. Testimonials
        $this->command->info('💬 Creating testimonials...');
        Testimonial::firstOrCreate(
            ['client_name' => 'Budi Santoso'],
            [
                'testimonial' => 'Pelayanan sangat profesional! Dekorasi wedding kami sangat indah dan sesuai harapan. Highly recommended!',
                'rating' => 5,
                'event_type' => 'Wedding',
                'is_featured' => true,
            ]
        );

        // 12. CREATE COMPLETE ORDER WORKFLOW
        $this->command->info('📋 Creating complete order workflow...');
        
        $goldPackage = Package::where('name', 'Gold Package')->first();
        
        // Order 1: Confirmed order dengan event upcoming
        $order1 = Order::firstOrCreate(
            ['verification_token' => 'demo-order-001'],
            [
                'client_id' => $clientModels[0]->id,
                'package_id' => $goldPackage->id,
                'user_id' => $admin->id,
                'event_name' => 'Wedding Budi & Siti',
                'event_type' => 'wedding',
                'event_date' => Carbon::now()->addDays(7),
                'event_address' => 'Grand Ballroom Mulia, Jl. Sudirman No. 45, Jakarta',
                'guest_count' => 300,
                'total_price' => 25000000,
                'discount' => 0,
                'final_price' => 25000000,
                'dp_amount' => 12500000,
                'deposit_amount' => 12500000,
                'remaining_amount' => 12500000,
                'status' => 'confirmed',
                'payment_status' => 'partial',
                'notes' => 'Tema: Modern Elegant, Warna: Gold & White',
            ]
        );

        // Event untuk Order 1
        $event1 = Event::firstOrCreate(
            ['order_id' => $order1->id],
            [
                'client_id' => $clientModels[0]->id,
                'event_name' => 'Wedding Budi & Siti',
                'event_type' => 'wedding',
                'event_date' => Carbon::now()->addDays(7)->setTime(18, 0),
                'start_time' => '16:00:00',
                'end_time' => '22:00:00',
                'venue_name' => $venue->name,
                'venue_address' => $venue->address . ', ' . $venue->city,
                'guest_count' => 300,
                'status' => 'confirmed',
                'notes' => 'Pernikahan dengan tema Modern Elegant',
            ]
        );

        // Rundown Items untuk Event 1
        $rundownItems = [
            [
                'event_id' => $event1->id,
                'order' => 1,
                'time' => Carbon::now()->addDays(7)->setTime(16, 0),
                'duration' => 60,
                'activity' => 'Setup & Preparation',
                'description' => 'Setup dekorasi pelaminan dan lighting',
                'pic' => 'Rina Melati',
                'equipment_needed' => json_encode(['Lighting equipment', 'Decoration items']),
                'is_critical' => true,
                'status' => 'pending',
            ],
            [
                'event_id' => $event1->id,
                'order' => 2,
                'time' => Carbon::now()->addDays(7)->setTime(17, 0),
                'duration' => 30,
                'activity' => 'Guest Registration',
                'description' => 'Penerimaan tamu dan check-in',
                'pic' => 'Ahmad Kurniawan',
                'equipment_needed' => json_encode(['Registration desk', 'Name tags']),
                'is_critical' => false,
                'status' => 'pending',
            ],
            [
                'event_id' => $event1->id,
                'order' => 3,
                'time' => Carbon::now()->addDays(7)->setTime(18, 0),
                'duration' => 120,
                'activity' => 'Wedding Ceremony',
                'description' => 'Akad nikah dan resepsi',
                'pic' => 'Ahmad Kurniawan',
                'equipment_needed' => json_encode(['Sound system', 'Microphone', 'Lighting']),
                'is_critical' => true,
                'status' => 'pending',
            ],
            [
                'event_id' => $event1->id,
                'order' => 4,
                'time' => Carbon::now()->addDays(7)->setTime(20, 0),
                'duration' => 90,
                'activity' => 'Dinner & Entertainment',
                'description' => 'Makan malam dan hiburan',
                'pic' => 'Ahmad Kurniawan',
                'equipment_needed' => json_encode(['Catering setup', 'Music system']),
                'is_critical' => false,
                'status' => 'pending',
            ],
            [
                'event_id' => $event1->id,
                'order' => 5,
                'time' => Carbon::now()->addDays(7)->setTime(21, 30),
                'duration' => 30,
                'activity' => 'Cleanup & Breakdown',
                'description' => 'Pembersihan dan pembongkaran dekorasi',
                'pic' => 'Dedi Gunawan',
                'equipment_needed' => json_encode(['Cleaning supplies', 'Storage boxes']),
                'is_critical' => true,
                'status' => 'pending',
            ],
        ];

        foreach ($rundownItems as $rundown) {
            RundownItem::firstOrCreate(
                ['event_id' => $rundown['event_id'], 'order' => $rundown['order']],
                $rundown
            );
        }

        // Employee Assignment untuk Order 1
        foreach ($employeeModels as $employee) {
            EmployeeAssignment::firstOrCreate(
                ['order_id' => $order1->id, 'employee_id' => $employee->id],
                [
                    'role' => $employee->position,
                    'assignment_date' => Carbon::now()->addDays(7),
                    'start_time' => '16:00:00',
                    'end_time' => '22:00:00',
                    'status' => 'assigned',
                    'notes' => 'Assigned for ' . $employee->position . ' at Wedding Budi & Siti',
                ]
            );
        }

        // Task Assignments untuk Event 1
        $tasks = [
            [
                'event_id' => $event1->id,
                'user_id' => $admin->id,
                'task_name' => 'Confirm venue booking',
                'description' => 'Konfirmasi booking venue dengan management',
                'deadline' => Carbon::now()->addDays(5),
                'priority' => 'high',
                'status' => 'in_progress',
            ],
            [
                'event_id' => $event1->id,
                'user_id' => $admin->id,
                'task_name' => 'Prepare decoration materials',
                'description' => 'Persiapkan semua material dekorasi',
                'deadline' => Carbon::now()->addDays(6),
                'priority' => 'urgent',
                'status' => 'assigned',
            ],
            [
                'event_id' => $event1->id,
                'user_id' => $admin->id,
                'task_name' => 'Final venue check',
                'description' => 'Pengecekan akhir venue sebelum hari H',
                'deadline' => Carbon::now()->addDays(6)->setTime(14, 0),
                'priority' => 'high',
                'status' => 'assigned',
            ],
        ];

        foreach ($tasks as $task) {
            TaskAssignment::firstOrCreate(
                [
                    'event_id' => $task['event_id'],
                    'user_id' => $task['user_id'],
                    'task_name' => $task['task_name']
                ],
                $task
            );
        }

        // Create user activity logs
        UserActivity::create([
            'user_id' => $admin->id,
            'activity_type' => 'order_create',
            'description' => 'Demo order created for Wedding Budi & Siti',
            'subject_type' => 'Order',
            'subject_id' => $order1->id,
        ]);

        UserActivity::create([
            'user_id' => $admin->id,
            'activity_type' => 'event_create',
            'description' => 'Event created for Wedding Budi & Siti',
            'subject_type' => 'Event',
            'subject_id' => $event1->id,
        ]);

        $this->command->newLine();
        $this->command->info('✅ Demo data seeding completed successfully!');
        $this->command->newLine();
        $this->command->table(
            ['Item', 'Count'],
            [
                ['Users', User::count()],
                ['Clients', Client::count()],
                ['Orders', Order::count()],
                ['Events', Event::count()],
                ['Services', Service::count()],
                ['Packages', Package::count()],
                ['Employees', Employee::count()],
                ['Inventory Items', InventoryItem::count()],
                ['Vendors', Vendor::count()],
                ['Venues', Venue::count()],
                ['Gallery', Gallery::count()],
                ['Portfolio', Portfolio::count()],
                ['Testimonials', Testimonial::count()],
                ['Task Assignments', TaskAssignment::count()],
                ['Rundown Items', RundownItem::count()],
            ]
        );
    }
}
