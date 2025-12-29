<?php

namespace Database\Seeders;

use App\Models\Vendor;
use App\Models\VendorCategory;
use App\Models\VendorContract;
use App\Models\VendorRating;
use App\Models\VendorPerformance;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VendorSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Clear existing data
        echo "🔄 Clearing existing vendor data...\n";
        DB::table('vendor_performance')->truncate();
        VendorRating::truncate();
        VendorContract::truncate();
        Vendor::truncate();
        VendorCategory::truncate();

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        echo "🏢 Seeding Vendor data...\n";

        // Create vendor categories
        $categories = $this->createVendorCategories();
        
        // Create vendors
        $vendors = $this->createVendors($categories);
        
        // Create vendor contracts
        $this->createVendorContracts($vendors);
        
        // Create vendor ratings
        $this->createVendorRatings($vendors);
        
        // Create vendor performance metrics
        $this->createVendorPerformance($vendors);

        echo "✅ Vendor seeding completed successfully!\n";
    }

    private function createVendorCategories()
    {
        $categories = [
            [
                'name' => 'Catering',
                'slug' => 'catering',
                'description' => 'Food and beverage catering services',
                'icon' => '🍽️',
                'is_active' => true
            ],
            [
                'name' => 'Photography',
                'slug' => 'photography',
                'description' => 'Professional photography and videography services',
                'icon' => '📸',
                'is_active' => true
            ],
            [
                'name' => 'Decoration',
                'slug' => 'decoration',
                'description' => 'Event decoration and floral arrangements',
                'icon' => '🎨',
                'is_active' => true
            ],
            [
                'name' => 'Entertainment',
                'slug' => 'entertainment',
                'description' => 'Music, MC, and entertainment services',
                'icon' => '🎤',
                'is_active' => true
            ],
            [
                'name' => 'Venue',
                'slug' => 'venue',
                'description' => 'Event venues and spaces',
                'icon' => '🏛️',
                'is_active' => true
            ],
            [
                'name' => 'Equipment Rental',
                'slug' => 'equipment-rental',
                'description' => 'Sound system, lighting, and other equipment',
                'icon' => '🎚️',
                'is_active' => true
            ],
            [
                'name' => 'Transportation',
                'slug' => 'transportation',
                'description' => 'Vehicle and transportation services',
                'icon' => '🚗',
                'is_active' => true
            ],
            [
                'name' => 'Souvenir',
                'slug' => 'souvenir',
                'description' => 'Wedding favors and souvenir suppliers',
                'icon' => '🎁',
                'is_active' => true
            ]
        ];

        foreach ($categories as $category) {
            VendorCategory::create($category);
        }

        echo "✓ Created " . count($categories) . " vendor categories\n";

        return VendorCategory::all();
    }

    private function createVendors($categories)
    {
        $cateringCat = $categories->where('slug', 'catering')->first();
        $photographyCat = $categories->where('slug', 'photography')->first();
        $decorationCat = $categories->where('slug', 'decoration')->first();
        $entertainmentCat = $categories->where('slug', 'entertainment')->first();
        $venueCat = $categories->where('slug', 'venue')->first();
        $equipmentCat = $categories->where('slug', 'equipment-rental')->first();
        $transportationCat = $categories->where('slug', 'transportation')->first();
        $souvenirCat = $categories->where('slug', 'souvenir')->first();

        $vendors = [
            // Catering Vendors
            [
                'category_id' => $cateringCat->id,
                'company_name' => 'Royal Catering Bali',
                'contact_person' => 'Wayan Sudirman',
                'email' => 'info@royalcateringbali.com',
                'phone' => '0361-123456',
                'alternative_phone' => '0812-3456-7890',
                'address' => 'Jl. Sunset Road No. 123',
                'city' => 'Denpasar',
                'province' => 'Bali',
                'postal_code' => '80361',
                'status' => 'active',
                'rating_level' => 'platinum',
                'services_offered' => json_encode(['Indonesian Cuisine', 'Western Cuisine', 'Buffet', 'Plated Service', 'Live Station']),
                'minimum_order' => 3000000,
                'payment_terms_days' => 30,
                'bank_name' => 'Bank BCA',
                'bank_account_number' => '1234567890',
                'bank_account_holder' => 'Royal Catering Bali',
                'tax_id' => '01.234.567.8-901.000',
                'business_license' => 'NIB-1234567890',
                'notes' => 'Premium catering service with 15 years experience'
            ],
            [
                'category_id' => $cateringCat->id,
                'company_name' => 'Boga Kitchen',
                'contact_person' => 'Siti Nurhaliza',
                'email' => 'contact@bogakitchen.id',
                'phone' => '0361-234567',
                'alternative_phone' => '0813-4567-8901',
                'address' => 'Jl. Teuku Umar No. 45',
                'city' => 'Denpasar',
                'province' => 'Bali',
                'postal_code' => '80114',
                'status' => 'active',
                'rating_level' => 'gold',
                'services_offered' => json_encode(['Traditional Catering', 'Modern Fusion', 'Vegetarian Options', 'Dessert Bar']),
                'minimum_order' => 2000000,
                'payment_terms_days' => 14,
                'bank_name' => 'Bank Mandiri',
                'bank_account_number' => '1234567891',
                'bank_account_holder' => 'PT Boga Kitchen Indonesia',
                'tax_id' => '01.234.567.8-902.000',
                'business_license' => 'NIB-1234567891',
                'notes' => 'Specializes in traditional Indonesian cuisine'
            ],
            [
                'category_id' => $cateringCat->id,
                'company_name' => 'Spice Garden Catering',
                'contact_person' => 'Made Wirawan',
                'email' => 'info@spicegarden.co.id',
                'phone' => '0361-345678',
                'alternative_phone' => null,
                'address' => 'Jl. Bypass Ngurah Rai No. 88',
                'city' => 'Denpasar',
                'province' => 'Bali',
                'postal_code' => '80222',
                'status' => 'active',
                'rating_level' => 'silver',
                'services_offered' => json_encode(['Asian Cuisine', 'BBQ Station', 'Cocktail Snacks']),
                'minimum_order' => 1500000,
                'payment_terms_days' => 7,
                'bank_name' => 'Bank BRI',
                'bank_account_number' => '1234567892',
                'bank_account_holder' => 'CV Spice Garden',
                'tax_id' => '01.234.567.8-903.000',
                'business_license' => 'NIB-1234567892',
                'notes' => 'Good for medium-sized events'
            ],

            // Photography Vendors
            [
                'category_id' => $photographyCat->id,
                'company_name' => 'Bali Frame Photography',
                'contact_person' => 'Rizki Ananda',
                'email' => 'hello@baliframe.com',
                'phone' => '0361-456789',
                'alternative_phone' => '0814-5678-9012',
                'address' => 'Jl. Raya Seminyak No. 77',
                'city' => 'Badung',
                'province' => 'Bali',
                'postal_code' => '80361',
                'status' => 'active',
                'rating_level' => 'platinum',
                'services_offered' => json_encode(['Wedding Photography', 'Videography', 'Pre-wedding', 'Drone Shot', 'Same Day Edit']),
                'minimum_order' => 5000000,
                'payment_terms_days' => 0,
                'bank_name' => 'Bank BCA',
                'bank_account_number' => '2234567890',
                'bank_account_holder' => 'Bali Frame Photography',
                'tax_id' => '01.234.567.8-904.000',
                'business_license' => 'NIB-2234567890',
                'notes' => 'Award-winning photography team'
            ],
            [
                'category_id' => $photographyCat->id,
                'company_name' => 'Moment Capture Studio',
                'contact_person' => 'Denny Pratama',
                'email' => 'booking@momentcapture.id',
                'phone' => '0361-567890',
                'alternative_phone' => '0815-6789-0123',
                'address' => 'Jl. Gatot Subroto No. 99',
                'city' => 'Denpasar',
                'province' => 'Bali',
                'postal_code' => '80117',
                'status' => 'active',
                'rating_level' => 'gold',
                'services_offered' => json_encode(['Photography', 'Cinematic Video', 'Photo Booth', 'Album Design']),
                'minimum_order' => 3500000,
                'payment_terms_days' => 0,
                'bank_name' => 'Bank Mandiri',
                'bank_account_number' => '2234567891',
                'bank_account_holder' => 'CV Moment Capture',
                'tax_id' => '01.234.567.8-905.000',
                'business_license' => 'NIB-2234567891',
                'notes' => 'Specializes in cinematic style videos'
            ],

            // Decoration Vendors
            [
                'category_id' => $decorationCat->id,
                'company_name' => 'Bali Blooms Decoration',
                'contact_person' => 'Luh Putu Ayu',
                'email' => 'info@baliblooms.com',
                'phone' => '0361-678901',
                'alternative_phone' => '0816-7890-1234',
                'address' => 'Jl. Raya Ubud No. 44',
                'city' => 'Gianyar',
                'province' => 'Bali',
                'postal_code' => '80571',
                'status' => 'active',
                'rating_level' => 'platinum',
                'services_offered' => json_encode(['Floral Arrangements', 'Stage Decoration', 'Table Setting', 'Backdrop Design', 'Lighting Setup']),
                'minimum_order' => 4000000,
                'payment_terms_days' => 14,
                'bank_name' => 'Bank BCA',
                'bank_account_number' => '3234567890',
                'bank_account_holder' => 'PT Bali Blooms',
                'tax_id' => '01.234.567.8-906.000',
                'business_license' => 'NIB-3234567890',
                'notes' => 'Premium floral decoration specialist'
            ],
            [
                'category_id' => $decorationCat->id,
                'company_name' => 'Elegant Decor',
                'contact_person' => 'Indah Permatasari',
                'email' => 'contact@elegantdecor.id',
                'phone' => '0361-789012',
                'alternative_phone' => null,
                'address' => 'Jl. Raya Kuta No. 155',
                'city' => 'Badung',
                'province' => 'Bali',
                'postal_code' => '80361',
                'status' => 'active',
                'rating_level' => 'gold',
                'services_offered' => json_encode(['Modern Decoration', 'Minimalist Style', 'Rustic Theme', 'Garden Setup']),
                'minimum_order' => 2500000,
                'payment_terms_days' => 7,
                'bank_name' => 'Bank Mandiri',
                'bank_account_number' => '3234567891',
                'bank_account_holder' => 'CV Elegant Decor',
                'tax_id' => '01.234.567.8-907.000',
                'business_license' => 'NIB-3234567891',
                'notes' => 'Specializes in modern minimalist designs'
            ],

            // Entertainment Vendors
            [
                'category_id' => $entertainmentCat->id,
                'company_name' => 'Bali Entertainment Group',
                'contact_person' => 'Komang Arya',
                'email' => 'booking@balientertainment.com',
                'phone' => '0361-890123',
                'alternative_phone' => '0817-8901-2345',
                'address' => 'Jl. Sunset Road No. 200',
                'city' => 'Denpasar',
                'province' => 'Bali',
                'postal_code' => '80361',
                'status' => 'active',
                'rating_level' => 'platinum',
                'services_offered' => json_encode(['Live Band', 'DJ Service', 'Traditional Dance', 'MC Professional', 'Singer']),
                'minimum_order' => 3000000,
                'payment_terms_days' => 0,
                'bank_name' => 'Bank BCA',
                'bank_account_number' => '4234567890',
                'bank_account_holder' => 'PT Bali Entertainment',
                'tax_id' => '01.234.567.8-908.000',
                'business_license' => 'NIB-4234567890',
                'notes' => 'Full entertainment package provider'
            ],
            [
                'category_id' => $entertainmentCat->id,
                'company_name' => 'Harmony Music',
                'contact_person' => 'Agus Setiawan',
                'email' => 'info@harmonymusic.id',
                'phone' => '0361-901234',
                'alternative_phone' => '0818-9012-3456',
                'address' => 'Jl. Gatot Subroto No. 66',
                'city' => 'Denpasar',
                'province' => 'Bali',
                'postal_code' => '80117',
                'status' => 'active',
                'rating_level' => 'gold',
                'services_offered' => json_encode(['Acoustic Band', 'Wedding Singer', 'Jazz Band', 'Background Music']),
                'minimum_order' => 2000000,
                'payment_terms_days' => 0,
                'bank_name' => 'Bank Mandiri',
                'bank_account_number' => '4234567891',
                'bank_account_holder' => 'CV Harmony Music',
                'tax_id' => '01.234.567.8-909.000',
                'business_license' => 'NIB-4234567891',
                'notes' => 'Specializes in acoustic and jazz music'
            ],

            // Venue Vendors
            [
                'category_id' => $venueCat->id,
                'company_name' => 'Grand Ballroom Bali',
                'contact_person' => 'I Made Suarta',
                'email' => 'reservation@grandballroombali.com',
                'phone' => '0361-012345',
                'alternative_phone' => '0819-0123-4567',
                'address' => 'Jl. Bypass Ngurah Rai No. 500',
                'city' => 'Denpasar',
                'province' => 'Bali',
                'postal_code' => '80222',
                'status' => 'active',
                'rating_level' => 'platinum',
                'services_offered' => json_encode(['Indoor Ballroom', 'Outdoor Garden', 'Parking Area', 'VIP Room', 'Bridal Room']),
                'minimum_order' => 10000000,
                'payment_terms_days' => 30,
                'bank_name' => 'Bank BCA',
                'bank_account_number' => '5234567890',
                'bank_account_holder' => 'PT Grand Ballroom Bali',
                'tax_id' => '01.234.567.8-910.000',
                'business_license' => 'NIB-5234567890',
                'notes' => 'Premium venue with capacity up to 1000 guests'
            ],

            // Equipment Rental Vendors
            [
                'category_id' => $equipmentCat->id,
                'company_name' => 'Pro Sound & Light',
                'contact_person' => 'Budi Hartono',
                'email' => 'rental@prosoundlight.id',
                'phone' => '0361-123098',
                'alternative_phone' => '0820-1230-9876',
                'address' => 'Jl. Imam Bonjol No. 88',
                'city' => 'Denpasar',
                'province' => 'Bali',
                'postal_code' => '80117',
                'status' => 'active',
                'rating_level' => 'gold',
                'services_offered' => json_encode(['Sound System', 'Lighting Equipment', 'LED Screen', 'Stage Setup', 'Projector']),
                'minimum_order' => 1500000,
                'payment_terms_days' => 7,
                'bank_name' => 'Bank BRI',
                'bank_account_number' => '6234567890',
                'bank_account_holder' => 'CV Pro Sound Light',
                'tax_id' => '01.234.567.8-911.000',
                'business_license' => 'NIB-6234567890',
                'notes' => 'Complete audio visual equipment rental'
            ],
            [
                'category_id' => $equipmentCat->id,
                'company_name' => 'Event Equipment Supply',
                'contact_person' => 'Eko Prasetyo',
                'email' => 'order@eventequipmentsupply.com',
                'phone' => '0361-234109',
                'alternative_phone' => null,
                'address' => 'Jl. Teuku Umar No. 123',
                'city' => 'Denpasar',
                'province' => 'Bali',
                'postal_code' => '80114',
                'status' => 'active',
                'rating_level' => 'silver',
                'services_offered' => json_encode(['Tables & Chairs', 'Tents', 'Red Carpet', 'Backdrop Stand', 'Podium']),
                'minimum_order' => 1000000,
                'payment_terms_days' => 7,
                'bank_name' => 'Bank BNI',
                'bank_account_number' => '6234567891',
                'bank_account_holder' => 'Event Equipment Supply',
                'tax_id' => '01.234.567.8-912.000',
                'business_license' => 'NIB-6234567891',
                'notes' => 'Furniture and basic equipment rental'
            ],

            // Transportation Vendors
            [
                'category_id' => $transportationCat->id,
                'company_name' => 'Bali Luxury Transport',
                'contact_person' => 'Ketut Suardana',
                'email' => 'booking@baliluxurytransport.com',
                'phone' => '0361-345210',
                'alternative_phone' => '0821-3452-1098',
                'address' => 'Jl. Raya Sanur No. 55',
                'city' => 'Denpasar',
                'province' => 'Bali',
                'postal_code' => '80227',
                'status' => 'active',
                'rating_level' => 'platinum',
                'services_offered' => json_encode(['Luxury Car', 'Wedding Car', 'Bus Charter', 'Driver Service', 'Airport Transfer']),
                'minimum_order' => 2000000,
                'payment_terms_days' => 0,
                'bank_name' => 'Bank BCA',
                'bank_account_number' => '7234567890',
                'bank_account_holder' => 'PT Bali Luxury Transport',
                'tax_id' => '01.234.567.8-913.000',
                'business_license' => 'NIB-7234567890',
                'notes' => 'Premium transportation with professional drivers'
            ],
            [
                'category_id' => $transportationCat->id,
                'company_name' => 'Island Wheels Rental',
                'contact_person' => 'Putu Agus',
                'email' => 'info@islandwheels.id',
                'phone' => '0361-456321',
                'alternative_phone' => null,
                'address' => 'Jl. Raya Kuta No. 88',
                'city' => 'Badung',
                'province' => 'Bali',
                'postal_code' => '80361',
                'status' => 'active',
                'rating_level' => 'gold',
                'services_offered' => json_encode(['Car Rental', 'Van Rental', 'Minibus', 'Guest Shuttle']),
                'minimum_order' => 1000000,
                'payment_terms_days' => 0,
                'bank_name' => 'Bank Mandiri',
                'bank_account_number' => '7234567891',
                'bank_account_holder' => 'CV Island Wheels',
                'tax_id' => '01.234.567.8-914.000',
                'business_license' => 'NIB-7234567891',
                'notes' => 'Reliable vehicle rental for events'
            ],

            // Souvenir Vendors
            [
                'category_id' => $souvenirCat->id,
                'company_name' => 'Bali Souvenir House',
                'contact_person' => 'Ni Made Ayu',
                'email' => 'order@balisouvenirhouse.com',
                'phone' => '0361-567432',
                'alternative_phone' => '0822-5674-3210',
                'address' => 'Jl. Raya Ubud No. 77',
                'city' => 'Gianyar',
                'province' => 'Bali',
                'postal_code' => '80571',
                'status' => 'active',
                'rating_level' => 'gold',
                'services_offered' => json_encode(['Wedding Favors', 'Custom Gifts', 'Packaging Design', 'Bulk Orders', 'Corporate Gifts']),
                'minimum_order' => 500000,
                'payment_terms_days' => 14,
                'bank_name' => 'Bank BRI',
                'bank_account_number' => '8234567890',
                'bank_account_holder' => 'CV Bali Souvenir House',
                'tax_id' => '01.234.567.8-915.000',
                'business_license' => 'NIB-8234567890',
                'notes' => 'Custom souvenir and gift specialist'
            ],
            [
                'category_id' => $souvenirCat->id,
                'company_name' => 'Gift Box Indonesia',
                'contact_person' => 'Sari Wulandari',
                'email' => 'hello@giftboxid.com',
                'phone' => '0361-678543',
                'alternative_phone' => null,
                'address' => 'Jl. Sunset Road No. 150',
                'city' => 'Denpasar',
                'province' => 'Bali',
                'postal_code' => '80361',
                'status' => 'active',
                'rating_level' => 'silver',
                'services_offered' => json_encode(['Hampers', 'Gift Sets', 'Premium Packaging', 'Personalized Gifts']),
                'minimum_order' => 750000,
                'payment_terms_days' => 7,
                'bank_name' => 'Bank BCA',
                'bank_account_number' => '8234567891',
                'bank_account_holder' => 'Gift Box Indonesia',
                'tax_id' => '01.234.567.8-916.000',
                'business_license' => 'NIB-8234567891',
                'notes' => 'Premium gift box and hampers'
            ],

            // Inactive/Blacklisted Vendor (for testing)
            [
                'category_id' => $cateringCat->id,
                'company_name' => 'Unreliable Catering',
                'contact_person' => 'John Doe',
                'email' => 'contact@unreliablecatering.com',
                'phone' => '0361-999999',
                'alternative_phone' => null,
                'address' => 'Jl. Example No. 1',
                'city' => 'Denpasar',
                'province' => 'Bali',
                'postal_code' => '80000',
                'status' => 'blacklisted',
                'rating_level' => 'bronze',
                'services_offered' => json_encode(['Basic Catering']),
                'minimum_order' => 1000000,
                'payment_terms_days' => 0,
                'bank_name' => 'Bank BRI',
                'bank_account_number' => '9999999999',
                'bank_account_holder' => 'Unreliable Catering',
                'tax_id' => '01.999.999.9-999.000',
                'business_license' => 'NIB-9999999999',
                'notes' => 'Blacklisted due to multiple complaints and contract violations'
            ]
        ];

        foreach ($vendors as $vendor) {
            Vendor::create($vendor);
        }

        echo "✓ Created " . count($vendors) . " vendors\n";

        return Vendor::all();
    }

    private function createVendorContracts($vendors): void
    {
        $users = User::whereIn('email', ['superadmin@sistemdekor.com', 'manager@sistemdekor.com'])->get();
        
        if ($users->isEmpty()) {
            echo "No admin users found for vendor contracts\n";
            return;
        }

        $superAdmin = $users->where('email', 'superadmin@sistemdekor.com')->first();
        $manager = $users->where('email', 'manager@sistemdekor.com')->first();
        $createdBy = $superAdmin ? $superAdmin->id : $users->first()->id;

        $contracts = [];
        $contractNumber = 1;

        foreach ($vendors as $vendor) {
            // Skip blacklisted vendors
            if ($vendor->status === 'blacklisted') {
                continue;
            }

            // Create 1-2 contracts per vendor
            $numContracts = rand(1, 2);
            
            for ($i = 0; $i < $numContracts; $i++) {
                $startDate = Carbon::now()->subMonths(rand(1, 12));
                $duration = rand(6, 24); // 6-24 months
                $endDate = $startDate->copy()->addMonths($duration);
                
                $isExpired = $endDate->isPast();
                $isActive = $startDate->isPast() && $endDate->isFuture();
                
                $status = 'draft';
                if ($isActive) {
                    $status = 'active';
                } elseif ($isExpired) {
                    $status = rand(0, 1) ? 'expired' : 'renewed';
                }

                $contractValue = match($vendor->category->slug) {
                    'catering' => rand(50, 200) * 1000000,
                    'photography' => rand(30, 100) * 1000000,
                    'decoration' => rand(40, 150) * 1000000,
                    'entertainment' => rand(25, 80) * 1000000,
                    'venue' => rand(100, 500) * 1000000,
                    'equipment-rental' => rand(20, 100) * 1000000,
                    'transportation' => rand(30, 120) * 1000000,
                    'souvenir' => rand(10, 50) * 1000000,
                    default => rand(20, 100) * 1000000,
                };

                $paymentSchedule = match($vendor->category->slug) {
                    'venue' => 'monthly',
                    'equipment-rental' => 'per_project',
                    'catering' => 'per_project',
                    default => rand(0, 1) ? 'per_project' : 'monthly',
                };

                $deliverables = match($vendor->category->slug) {
                    'catering' => ['Menu planning', 'Food preparation', 'Service staff', 'Equipment', 'Cleanup'],
                    'photography' => ['Pre-wedding shoot', 'Wedding day coverage', 'Photo editing', 'Album design', 'Digital files'],
                    'decoration' => ['Design consultation', 'Material procurement', 'Setup installation', 'Event day support', 'Teardown'],
                    'entertainment' => ['Rehearsal session', 'Event performance', 'Sound check', 'Equipment setup'],
                    'venue' => ['Venue access', 'Setup time', 'Teardown time', 'Parking management', 'Security'],
                    'equipment-rental' => ['Equipment delivery', 'Setup assistance', 'Technical support', 'Pickup service'],
                    'transportation' => ['Vehicle provision', 'Professional drivers', 'Fuel', 'Insurance', 'Cleaning'],
                    'souvenir' => ['Design consultation', 'Sample approval', 'Production', 'Quality check', 'Delivery'],
                    default => ['Service delivery', 'Quality assurance', 'Customer support'],
                };

                $contracts[] = [
                    'contract_number' => 'CNT-' . date('Y') . '-' . str_pad($contractNumber++, 5, '0', STR_PAD_LEFT),
                    'vendor_id' => $vendor->id,
                    'title' => 'Service Agreement - ' . $vendor->company_name,
                    'description' => 'Annual service contract for ' . $vendor->category->name . ' services',
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                    'contract_value' => $contractValue,
                    'payment_schedule' => $paymentSchedule,
                    'status' => $status,
                    'terms_conditions' => "1. Service quality must meet agreed standards\n2. Timely delivery as per schedule\n3. Professional conduct required\n4. Cancellation policy applies\n5. Insurance coverage required",
                    'deliverables' => json_encode($deliverables),
                    'signed_by_vendor' => $vendor->contact_person,
                    'signed_by_company' => $manager ? $manager->name : 'Company Manager',
                    'signed_date' => $status === 'draft' ? null : $startDate->format('Y-m-d'),
                    'contract_file' => $status === 'draft' ? null : 'contracts/contract-' . $vendor->vendor_code . '-' . $i . '.pdf',
                    'notes' => $status === 'active' ? 'Active contract in good standing' : null,
                    'created_by' => $createdBy
                ];
            }
        }

        foreach ($contracts as $contract) {
            VendorContract::create($contract);
        }

        echo "✓ Created " . count($contracts) . " vendor contracts\n";
    }

    private function createVendorRatings($vendors): void
    {
        $users = User::whereIn('email', ['superadmin@sistemdekor.com', 'manager@sistemdekor.com', 'admin@sistemdekor.com'])->get();
        $orders = Order::whereIn('status', ['completed', 'cancelled'])->get();

        if ($users->isEmpty()) {
            echo "No users found for vendor ratings\n";
            return;
        }

        $ratings = [];

        foreach ($vendors as $vendor) {
            // Skip blacklisted vendors or create negative ratings
            if ($vendor->status === 'blacklisted') {
                // Create 2-3 negative ratings for blacklisted vendor
                for ($i = 0; $i < rand(2, 3); $i++) {
                    $rating = rand(1, 2);
                    $ratings[] = [
                        'vendor_id' => $vendor->id,
                        'order_id' => $orders->isNotEmpty() ? $orders->random()->id : null,
                        'reviewed_by' => $users->random()->id,
                        'rating' => $rating,
                        'quality_rating' => rand(1, 2),
                        'timeliness_rating' => rand(1, 2),
                        'professionalism_rating' => rand(1, 2),
                        'value_rating' => rand(1, 3),
                        'review' => 'Very disappointing service. Would not recommend.',
                        'pros' => null,
                        'cons' => 'Poor quality, late delivery, unprofessional staff, not worth the money',
                        'would_recommend' => false,
                        'vendor_response' => null,
                        'responded_at' => null,
                        'is_verified' => true,
                        'created_at' => Carbon::now()->subDays(rand(10, 60))
                    ];
                }
                continue;
            }

            // Create 3-8 ratings per active vendor
            $numRatings = rand(3, 8);
            
            for ($i = 0; $i < $numRatings; $i++) {
                // Rating distribution based on vendor level
                $baseRating = match($vendor->rating_level) {
                    'platinum' => rand(4, 5),
                    'gold' => rand(3, 5),
                    'silver' => rand(3, 4),
                    'bronze' => rand(2, 4),
                    default => rand(2, 4),
                };

                $qualityRating = max(1, min(5, $baseRating + rand(-1, 1)));
                $timelinessRating = max(1, min(5, $baseRating + rand(-1, 1)));
                $professionalismRating = max(1, min(5, $baseRating + rand(-1, 1)));
                $valueRating = max(1, min(5, $baseRating + rand(-1, 1)));

                $reviews = [
                    5 => [
                        'Exceptional service! Exceeded all expectations. Highly professional and detail-oriented.',
                        'Outstanding quality and service. The team was amazing from start to finish.',
                        'Absolutely perfect! Could not ask for better service. Will definitely use again.',
                        'Five stars all around! Professional, timely, and high quality work.'
                    ],
                    4 => [
                        'Great service overall. Very satisfied with the results.',
                        'Good quality work. Minor issues but nothing major. Would recommend.',
                        'Professional and reliable service. Met our expectations well.',
                        'Very good experience. The team was responsive and skilled.'
                    ],
                    3 => [
                        'Decent service. Met basic requirements but nothing exceptional.',
                        'Average experience. Some good points, some areas for improvement.',
                        'Okay service. Got the job done but could be better.',
                        'Acceptable quality. Service was fine but not outstanding.'
                    ],
                    2 => [
                        'Below expectations. Several issues with quality and timing.',
                        'Not satisfied. Had to follow up multiple times.',
                        'Disappointing service. Would not use again.',
                        'Poor communication and quality issues.'
                    ],
                    1 => [
                        'Terrible experience. Very unprofessional.',
                        'Completely unsatisfied. Waste of money.',
                        'Awful service. Do not recommend.',
                        'Worst vendor experience ever.'
                    ]
                ];

                $pros = match($baseRating) {
                    5 => 'Excellent quality, professional staff, on-time delivery, great communication, attention to detail',
                    4 => 'Good quality, reliable service, professional approach, reasonable pricing',
                    3 => 'Acceptable quality, completed the work, basic service',
                    2 => 'Some aspects were okay',
                    1 => null,
                    default => 'Basic service provided'
                };

                $cons = match($baseRating) {
                    5 => null,
                    4 => 'Minor delays, small communication gaps',
                    3 => 'Average quality, room for improvement in service',
                    2 => 'Poor communication, quality issues, delays',
                    1 => 'Everything - poor quality, late, unprofessional, overpriced',
                    default => 'Some room for improvement'
                };

                $wouldRecommend = $baseRating >= 3;
                $hasVendorResponse = $baseRating <= 3 && rand(0, 1);

                $vendorResponse = null;
                $respondedAt = null;
                
                if ($hasVendorResponse) {
                    $vendorResponse = match($baseRating) {
                        3 => 'Thank you for your feedback. We appreciate your business and will work to improve our service.',
                        2 => 'We apologize for not meeting your expectations. We take your feedback seriously and are working to improve.',
                        1 => 'We sincerely apologize for your experience. This is not our standard. Please contact us to resolve this matter.',
                        default => 'Thank you for your feedback.'
                    };
                    $respondedAt = Carbon::now()->subDays(rand(1, 30));
                }

                $ratings[] = [
                    'vendor_id' => $vendor->id,
                    'order_id' => $orders->isNotEmpty() && rand(0, 1) ? $orders->random()->id : null,
                    'reviewed_by' => $users->random()->id,
                    'rating' => $baseRating,
                    'quality_rating' => $qualityRating,
                    'timeliness_rating' => $timelinessRating,
                    'professionalism_rating' => $professionalismRating,
                    'value_rating' => $valueRating,
                    'review' => $reviews[$baseRating][array_rand($reviews[$baseRating])],
                    'pros' => $pros,
                    'cons' => $cons,
                    'would_recommend' => $wouldRecommend,
                    'vendor_response' => $vendorResponse,
                    'responded_at' => $respondedAt,
                    'is_verified' => rand(0, 1) ? true : false,
                    'created_at' => Carbon::now()->subDays(rand(1, 90))
                ];
            }
        }

        foreach ($ratings as $rating) {
            VendorRating::create($rating);
        }

        // Update vendor average ratings and total reviews
        foreach ($vendors as $vendor) {
            $vendorRatings = VendorRating::where('vendor_id', $vendor->id)->get();
            
            if ($vendorRatings->isNotEmpty()) {
                $vendor->average_rating = $vendorRatings->avg('rating');
                $vendor->total_reviews = $vendorRatings->count();
                $vendor->save();
            }
        }

        echo "✓ Created " . count($ratings) . " vendor ratings\n";
    }

    private function createVendorPerformance($vendors): void
    {
        $performance = [];

        foreach ($vendors as $vendor) {
            // Skip blacklisted vendors
            if ($vendor->status === 'blacklisted') {
                continue;
            }

            // Create performance data for last 6 months
            for ($monthsAgo = 5; $monthsAgo >= 0; $monthsAgo--) {
                $date = Carbon::now()->subMonths($monthsAgo);
                $year = $date->year;
                $month = $date->month;

                // Performance varies by vendor level
                $baseOrders = match($vendor->rating_level) {
                    'platinum' => rand(8, 15),
                    'gold' => rand(5, 10),
                    'silver' => rand(3, 7),
                    'bronze' => rand(1, 4),
                    default => rand(2, 5),
                };

                $totalOrders = $baseOrders;
                $completedOrders = (int)($totalOrders * (rand(85, 98) / 100));
                $cancelledOrders = $totalOrders - $completedOrders;

                // Revenue per order varies by category
                $avgOrderValue = match($vendor->category->slug) {
                    'catering' => rand(3000, 8000) * 1000,
                    'photography' => rand(4000, 10000) * 1000,
                    'decoration' => rand(3000, 9000) * 1000,
                    'entertainment' => rand(2000, 6000) * 1000,
                    'venue' => rand(8000, 20000) * 1000,
                    'equipment-rental' => rand(1500, 5000) * 1000,
                    'transportation' => rand(2000, 5000) * 1000,
                    'souvenir' => rand(500, 2000) * 1000,
                    default => rand(2000, 6000) * 1000,
                };

                $totalRevenue = $completedOrders * $avgOrderValue;

                // Delivery performance
                $avgDeliveryTime = match($vendor->rating_level) {
                    'platinum' => rand(1, 3) + (rand(0, 99) / 100),
                    'gold' => rand(2, 5) + (rand(0, 99) / 100),
                    'silver' => rand(3, 7) + (rand(0, 99) / 100),
                    default => rand(5, 10) + (rand(0, 99) / 100),
                };

                $onTimeDeliveries = (int)($completedOrders * (rand(85, 98) / 100));
                $lateDeliveries = $completedOrders - $onTimeDeliveries;

                $performance[] = [
                    'vendor_id' => $vendor->id,
                    'year' => $year,
                    'month' => $month,
                    'total_orders' => $totalOrders,
                    'completed_orders' => $completedOrders,
                    'cancelled_orders' => $cancelledOrders,
                    'total_revenue' => $totalRevenue,
                    'average_delivery_time' => $avgDeliveryTime,
                    'on_time_deliveries' => $onTimeDeliveries,
                    'late_deliveries' => $lateDeliveries,
                    'average_rating' => $vendor->average_rating,
                    'created_at' => $date,
                    'updated_at' => $date
                ];
            }
        }

        foreach ($performance as $perf) {
            VendorPerformance::create($perf);
        }

        echo "✓ Created " . count($performance) . " vendor performance records\n";
    }
}
