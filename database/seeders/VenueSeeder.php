<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Venue;
use App\Models\VenuePricing;
use App\Models\VenueBooking;
use App\Models\VenueAvailability;
use Carbon\Carbon;

class VenueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🔄 Clearing existing venue data...');
        
        // Clear existing data - order matters due to foreign keys
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        VenueAvailability::truncate();
        VenueBooking::truncate();
        VenuePricing::truncate();
        Venue::truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('🏛️ Seeding Venue data...');

        // Create Venues
        $venues = $this->createVenues();
        $this->command->info('✓ Created ' . count($venues) . ' venues');

        // Create Venue Pricing
        $pricings = $this->createVenuePricing($venues);
        $this->command->info('✓ Created ' . count($pricings) . ' pricing rules');

        // Create Venue Availability
        $availabilities = $this->createVenueAvailability($venues);
        $this->command->info('✓ Created ' . count($availabilities) . ' availability records');

        // Create Venue Bookings
        $bookings = $this->createVenueBookings($venues);
        $this->command->info('✓ Created ' . count($bookings) . ' venue bookings');

        $this->command->info('✅ Venue seeding completed successfully!');
    }

    private function createVenues()
    {
        $venuesData = [
            [
                'name' => 'Grand Ballroom Imperial',
                'code' => 'VNU-001',
                'description' => 'Ballroom mewah dengan kapasitas besar, dilengkapi dengan fasilitas premium untuk acara wedding dan corporate event skala besar.',
                'address' => 'Jl. Sudirman No. 123, Gedung Imperial Tower Lt. 5',
                'city' => 'Jakarta Selatan',
                'province' => 'DKI Jakarta',
                'postal_code' => '12190',
                'latitude' => -6.2088,
                'longitude' => 106.8456,
                'capacity' => 500,
                'min_capacity' => 200,
                'venue_type' => 'ballroom',
                'facilities' => json_encode([
                    'AC Central',
                    'Sound System Premium',
                    'LED Screen 10m x 5m',
                    'Lighting Professional',
                    'Stage 8m x 6m',
                    'Parking 200 mobil',
                    'WiFi High Speed',
                    'Ruang Ganti Pengantin',
                    'Toilet VIP',
                    'Pantry',
                    'Generator Backup'
                ]),
                'images' => json_encode([
                    'venues/grand-ballroom-1.jpg',
                    'venues/grand-ballroom-2.jpg',
                    'venues/grand-ballroom-3.jpg',
                ]),
                'contact_person' => 'Budi Santoso',
                'contact_phone' => '021-5551234',
                'contact_email' => 'ballroom@imperial.com',
                'is_active' => true,
                'terms_conditions' => 'Booking minimal 3 bulan sebelum acara. DP 50% saat booking. Pelunasan H-14. Pembatalan H-30 akan dikenakan penalty 30%.',
                'notes' => 'Venue premium untuk wedding dan corporate event',
            ],
            [
                'name' => 'Garden Pavilion Paradise',
                'code' => 'VNU-002',
                'description' => 'Venue outdoor dengan konsep taman tropis yang asri, cocok untuk acara garden wedding atau outdoor party dengan suasana natural.',
                'address' => 'Jl. Pulo Mas Raya No. 88, Kompleks Paradise Garden',
                'city' => 'Jakarta Timur',
                'province' => 'DKI Jakarta',
                'postal_code' => '13210',
                'latitude' => -6.1944,
                'longitude' => 106.8794,
                'capacity' => 300,
                'min_capacity' => 100,
                'venue_type' => 'garden',
                'facilities' => json_encode([
                    'Taman Luas 2000m²',
                    'Gazebo Utama',
                    'Water Fountain',
                    'Portable AC',
                    'Sound System Outdoor',
                    'Lighting Garden',
                    'Parking 100 mobil',
                    'WiFi',
                    'Toilet Modern',
                    'Tenda Cadangan',
                    'Ruang Bridal'
                ]),
                'images' => json_encode([
                    'venues/garden-pavilion-1.jpg',
                    'venues/garden-pavilion-2.jpg',
                    'venues/garden-pavilion-3.jpg',
                ]),
                'contact_person' => 'Siti Nurhaliza',
                'contact_phone' => '021-8887766',
                'contact_email' => 'info@paradisegarden.com',
                'is_active' => true,
                'terms_conditions' => 'Booking minimal 2 bulan sebelum acara. DP 40%. Jika hujan disediakan tenda darurat. Pembatalan H-45 penalty 20%.',
                'notes' => 'Perfect untuk garden wedding dan outdoor event',
            ],
            [
                'name' => 'Skyview Rooftop Lounge',
                'code' => 'VNU-003',
                'description' => 'Rooftop venue dengan pemandangan kota yang menakjubkan, ideal untuk acara intimate wedding, cocktail party, atau engagement.',
                'address' => 'Jl. HR Rasuna Said Kav. C-22, Rooftop Skyline Building Lt. 25',
                'city' => 'Jakarta Selatan',
                'province' => 'DKI Jakarta',
                'postal_code' => '12940',
                'latitude' => -6.2241,
                'longitude' => 106.8413,
                'capacity' => 150,
                'min_capacity' => 50,
                'venue_type' => 'rooftop',
                'facilities' => json_encode([
                    'Rooftop 800m²',
                    'City View 360°',
                    'Bar Counter',
                    'Lounge Area',
                    'AC Outdoor',
                    'Sound System',
                    'LED Mood Lighting',
                    'Parking Basement',
                    'WiFi',
                    'Toilet Premium',
                    'Lift Express'
                ]),
                'images' => json_encode([
                    'venues/skyview-rooftop-1.jpg',
                    'venues/skyview-rooftop-2.jpg',
                    'venues/skyview-rooftop-3.jpg',
                ]),
                'contact_person' => 'Andi Wijaya',
                'contact_phone' => '021-7779988',
                'contact_email' => 'booking@skyviewlounge.com',
                'is_active' => true,
                'terms_conditions' => 'Booking minimal 1 bulan sebelum acara. DP 50%. Tidak ada acara saat cuaca ekstrem. Pembatalan H-21 penalty 25%.',
                'notes' => 'Best view untuk sunset party dan intimate wedding',
            ],
            [
                'name' => 'Heritage Hall Museum',
                'code' => 'VNU-004',
                'description' => 'Gedung bersejarah dengan arsitektur klasik kolonial, memberikan nuansa elegant dan timeless untuk acara wedding klasik.',
                'address' => 'Jl. Veteran No. 45, Kawasan Kota Tua',
                'city' => 'Jakarta Barat',
                'province' => 'DKI Jakarta',
                'postal_code' => '11110',
                'latitude' => -6.1376,
                'longitude' => 106.8130,
                'capacity' => 200,
                'min_capacity' => 80,
                'venue_type' => 'indoor',
                'facilities' => json_encode([
                    'Heritage Building',
                    'High Ceiling 8m',
                    'Classic Interior',
                    'AC Central',
                    'Sound System',
                    'Stage Classic',
                    'Chandelier Antique',
                    'Parking 80 mobil',
                    'WiFi',
                    'Toilet Heritage',
                    'Museum Tour (optional)'
                ]),
                'images' => json_encode([
                    'venues/heritage-hall-1.jpg',
                    'venues/heritage-hall-2.jpg',
                    'venues/heritage-hall-3.jpg',
                ]),
                'contact_person' => 'Rini Kusuma',
                'contact_phone' => '021-6669900',
                'contact_email' => 'event@heritagehall.com',
                'is_active' => true,
                'terms_conditions' => 'Booking minimal 4 bulan sebelum acara. DP 60%. Tidak boleh merusak properti heritage. Pembatalan H-60 penalty 40%.',
                'notes' => 'Venue unik dengan nilai sejarah dan arsitektur klasik',
            ],
            [
                'name' => 'Beachside Villa Ancol',
                'code' => 'VNU-005',
                'description' => 'Villa tepi pantai dengan pemandangan laut, sempurna untuk beach wedding atau tropical party dengan suasana santai.',
                'address' => 'Jl. Lodan Raya No. 7, Pantai Ancol',
                'city' => 'Jakarta Utara',
                'province' => 'DKI Jakarta',
                'postal_code' => '14430',
                'latitude' => -6.1205,
                'longitude' => 106.8442,
                'capacity' => 250,
                'min_capacity' => 80,
                'venue_type' => 'beach',
                'facilities' => json_encode([
                    'Private Beach',
                    'Villa 2 Lantai',
                    'Ocean View',
                    'Outdoor Deck',
                    'Portable AC',
                    'Sound System',
                    'Beach Lighting',
                    'Parking 120 mobil',
                    'WiFi',
                    'Toilet & Shower',
                    'BBQ Area',
                    'Swimming Pool'
                ]),
                'images' => json_encode([
                    'venues/beachside-villa-1.jpg',
                    'venues/beachside-villa-2.jpg',
                    'venues/beachside-villa-3.jpg',
                ]),
                'contact_person' => 'Made Suryadi',
                'contact_phone' => '021-6431122',
                'contact_email' => 'info@beachsidevilla.com',
                'is_active' => true,
                'terms_conditions' => 'Booking minimal 2 bulan sebelum acara. DP 40%. Tergantung cuaca dan pasang surut. Pembatalan H-30 penalty 30%.',
                'notes' => 'Tropical beach wedding venue dengan sunset view',
            ],
            [
                'name' => 'Modern Loft Studio',
                'code' => 'VNU-006',
                'description' => 'Studio loft industrial-modern dengan konsep minimalis, cocok untuk intimate wedding, pre-wedding shoot, atau private event.',
                'address' => 'Jl. Kemang Raya No. 12B, South Quarter',
                'city' => 'Jakarta Selatan',
                'province' => 'DKI Jakarta',
                'postal_code' => '12730',
                'latitude' => -6.2615,
                'longitude' => 106.8167,
                'capacity' => 100,
                'min_capacity' => 30,
                'venue_type' => 'loft',
                'facilities' => json_encode([
                    'Industrial Design',
                    'High Ceiling',
                    'Natural Light',
                    'AC',
                    'Sound System',
                    'LED Ambient',
                    'Parking 50 mobil',
                    'WiFi',
                    'Toilet Modern',
                    'Kitchen Area',
                    'Photo Studio'
                ]),
                'images' => json_encode([
                    'venues/modern-loft-1.jpg',
                    'venues/modern-loft-2.jpg',
                    'venues/modern-loft-3.jpg',
                ]),
                'contact_person' => 'Kevin Tanuwijaya',
                'contact_phone' => '021-7199888',
                'contact_email' => 'hello@modernloft.com',
                'is_active' => true,
                'terms_conditions' => 'Booking minimal 3 minggu sebelum acara. DP 50%. Session based booking. Pembatalan H-14 penalty 20%.',
                'notes' => 'Perfect untuk intimate event dan photoshoot',
            ],
            [
                'name' => 'Crystal Convention Center',
                'code' => 'VNU-007',
                'description' => 'Convention center dengan multiple halls dan fasilitas modern lengkap, ideal untuk exhibition, conference, dan large scale events.',
                'address' => 'Jl. Jenderal Gatot Subroto Kav. 52-53',
                'city' => 'Jakarta Selatan',
                'province' => 'DKI Jakarta',
                'postal_code' => '12950',
                'latitude' => -6.2297,
                'longitude' => 106.8125,
                'capacity' => 1000,
                'min_capacity' => 300,
                'venue_type' => 'convention_center',
                'facilities' => json_encode([
                    'Main Hall 2000m²',
                    'Breakout Rooms 5',
                    'AC Central',
                    'Sound System Pro',
                    'LED Wall 15m x 8m',
                    'Professional Lighting',
                    'Stage Modular',
                    'Parking 500 mobil',
                    'WiFi Enterprise',
                    'Food Court',
                    'Registration Area',
                    'VIP Lounge'
                ]),
                'images' => json_encode([
                    'venues/crystal-convention-1.jpg',
                    'venues/crystal-convention-2.jpg',
                    'venues/crystal-convention-3.jpg',
                ]),
                'contact_person' => 'Diana Sutanto',
                'contact_phone' => '021-5227700',
                'contact_email' => 'events@crystalconvention.com',
                'is_active' => true,
                'terms_conditions' => 'Booking minimal 6 bulan sebelum acara. DP 50%. Contract agreement required. Pembatalan H-90 penalty 50%.',
                'notes' => 'Large scale event venue for corporate and exhibition',
            ],
            [
                'name' => 'Rustic Barn Countryside',
                'code' => 'VNU-008',
                'description' => 'Barn dengan konsep rustic countryside di area perbukitan, memberikan nuansa pedesaan yang hangat dan natural.',
                'address' => 'Jl. Raya Puncak KM 87, Desa Tugu Selatan',
                'city' => 'Bogor',
                'province' => 'Jawa Barat',
                'postal_code' => '16750',
                'latitude' => -6.6944,
                'longitude' => 106.9757,
                'capacity' => 180,
                'min_capacity' => 60,
                'venue_type' => 'barn',
                'facilities' => json_encode([
                    'Wooden Barn',
                    'Mountain View',
                    'Open Air Space',
                    'Heater (if needed)',
                    'Sound System',
                    'Rustic Lighting',
                    'Parking 100 mobil',
                    'Toilet',
                    'Kitchen Prep Area',
                    'Fire Pit',
                    'Photo Spots'
                ]),
                'images' => json_encode([
                    'venues/rustic-barn-1.jpg',
                    'venues/rustic-barn-2.jpg',
                    'venues/rustic-barn-3.jpg',
                ]),
                'contact_person' => 'Ahmad Yani',
                'contact_phone' => '0251-8242300',
                'contact_email' => 'info@rusticbarn.com',
                'is_active' => true,
                'terms_conditions' => 'Booking minimal 2 bulan sebelum acara. DP 40%. Akses jalan menanjak. Pembatalan H-30 penalty 25%.',
                'notes' => 'Rustic countryside venue with mountain view',
            ],
        ];

        $venues = [];
        foreach ($venuesData as $data) {
            $venues[] = Venue::create($data);
        }

        return $venues;
    }

    private function createVenuePricing($venues)
    {
        $pricings = [];
        
        // Pricing untuk setiap venue berdasarkan hari dan sesi
        $pricingStructures = [
            // Grand Ballroom Imperial (Premium)
            $venues[0]->id => [
                ['day_type' => 'weekday', 'session_type' => 'full_day', 'base_price' => 85000000, 'additional_hour_price' => 5000000, 'min_hours' => 8, 'max_hours' => 12, 'overtime_price' => 6000000, 'cleaning_fee' => 3000000, 'security_deposit' => 10000000],
                ['day_type' => 'weekday', 'session_type' => 'morning', 'base_price' => 45000000, 'additional_hour_price' => 4000000, 'min_hours' => 4, 'max_hours' => 6, 'overtime_price' => 5000000, 'cleaning_fee' => 1500000, 'security_deposit' => 10000000],
                ['day_type' => 'weekday', 'session_type' => 'evening', 'base_price' => 50000000, 'additional_hour_price' => 4500000, 'min_hours' => 4, 'max_hours' => 6, 'overtime_price' => 5500000, 'cleaning_fee' => 1500000, 'security_deposit' => 10000000],
                ['day_type' => 'weekend', 'session_type' => 'full_day', 'base_price' => 120000000, 'additional_hour_price' => 7000000, 'min_hours' => 8, 'max_hours' => 12, 'overtime_price' => 8000000, 'cleaning_fee' => 3000000, 'security_deposit' => 15000000],
                ['day_type' => 'weekend', 'session_type' => 'morning', 'base_price' => 60000000, 'additional_hour_price' => 5500000, 'min_hours' => 4, 'max_hours' => 6, 'overtime_price' => 6500000, 'cleaning_fee' => 1500000, 'security_deposit' => 15000000],
                ['day_type' => 'weekend', 'session_type' => 'evening', 'base_price' => 70000000, 'additional_hour_price' => 6000000, 'min_hours' => 4, 'max_hours' => 6, 'overtime_price' => 7000000, 'cleaning_fee' => 1500000, 'security_deposit' => 15000000],
            ],
            
            // Garden Pavilion Paradise (Mid-High)
            $venues[1]->id => [
                ['day_type' => 'weekday', 'session_type' => 'full_day', 'base_price' => 45000000, 'additional_hour_price' => 3000000, 'min_hours' => 6, 'max_hours' => 10, 'overtime_price' => 3500000, 'cleaning_fee' => 2000000, 'security_deposit' => 5000000],
                ['day_type' => 'weekday', 'session_type' => 'afternoon', 'base_price' => 28000000, 'additional_hour_price' => 2500000, 'min_hours' => 4, 'max_hours' => 6, 'overtime_price' => 3000000, 'cleaning_fee' => 1000000, 'security_deposit' => 5000000],
                ['day_type' => 'weekend', 'session_type' => 'full_day', 'base_price' => 65000000, 'additional_hour_price' => 4000000, 'min_hours' => 6, 'max_hours' => 10, 'overtime_price' => 4500000, 'cleaning_fee' => 2000000, 'security_deposit' => 7000000],
                ['day_type' => 'weekend', 'session_type' => 'afternoon', 'base_price' => 38000000, 'additional_hour_price' => 3500000, 'min_hours' => 4, 'max_hours' => 6, 'overtime_price' => 4000000, 'cleaning_fee' => 1000000, 'security_deposit' => 7000000],
            ],
            
            // Skyview Rooftop Lounge (Mid)
            $venues[2]->id => [
                ['day_type' => 'weekday', 'session_type' => 'full_day', 'base_price' => 35000000, 'additional_hour_price' => 2500000, 'min_hours' => 5, 'max_hours' => 8, 'overtime_price' => 3000000, 'cleaning_fee' => 1500000, 'security_deposit' => 4000000],
                ['day_type' => 'weekday', 'session_type' => 'evening', 'base_price' => 25000000, 'additional_hour_price' => 2000000, 'min_hours' => 4, 'max_hours' => 6, 'overtime_price' => 2500000, 'cleaning_fee' => 800000, 'security_deposit' => 4000000],
                ['day_type' => 'weekend', 'session_type' => 'full_day', 'base_price' => 48000000, 'additional_hour_price' => 3500000, 'min_hours' => 5, 'max_hours' => 8, 'overtime_price' => 4000000, 'cleaning_fee' => 1500000, 'security_deposit' => 6000000],
                ['day_type' => 'weekend', 'session_type' => 'evening', 'base_price' => 35000000, 'additional_hour_price' => 3000000, 'min_hours' => 4, 'max_hours' => 6, 'overtime_price' => 3500000, 'cleaning_fee' => 800000, 'security_deposit' => 6000000],
            ],
            
            // Heritage Hall Museum (Mid-High)
            $venues[3]->id => [
                ['day_type' => 'weekday', 'session_type' => 'full_day', 'base_price' => 40000000, 'additional_hour_price' => 3000000, 'min_hours' => 6, 'max_hours' => 10, 'overtime_price' => 3500000, 'cleaning_fee' => 1800000, 'security_deposit' => 8000000],
                ['day_type' => 'weekend', 'session_type' => 'full_day', 'base_price' => 55000000, 'additional_hour_price' => 4000000, 'min_hours' => 6, 'max_hours' => 10, 'overtime_price' => 4500000, 'cleaning_fee' => 1800000, 'security_deposit' => 10000000],
            ],
            
            // Beachside Villa Ancol (Mid)
            $venues[4]->id => [
                ['day_type' => 'weekday', 'session_type' => 'full_day', 'base_price' => 38000000, 'additional_hour_price' => 2800000, 'min_hours' => 6, 'max_hours' => 10, 'overtime_price' => 3200000, 'cleaning_fee' => 2000000, 'security_deposit' => 5000000],
                ['day_type' => 'weekend', 'session_type' => 'full_day', 'base_price' => 52000000, 'additional_hour_price' => 3800000, 'min_hours' => 6, 'max_hours' => 10, 'overtime_price' => 4200000, 'cleaning_fee' => 2000000, 'security_deposit' => 7000000],
            ],
            
            // Modern Loft Studio (Budget-Mid)
            $venues[5]->id => [
                ['day_type' => 'weekday', 'session_type' => 'morning', 'base_price' => 12000000, 'additional_hour_price' => 1500000, 'min_hours' => 4, 'max_hours' => 6, 'overtime_price' => 1800000, 'cleaning_fee' => 500000, 'security_deposit' => 2000000],
                ['day_type' => 'weekday', 'session_type' => 'afternoon', 'base_price' => 12000000, 'additional_hour_price' => 1500000, 'min_hours' => 4, 'max_hours' => 6, 'overtime_price' => 1800000, 'cleaning_fee' => 500000, 'security_deposit' => 2000000],
                ['day_type' => 'weekday', 'session_type' => 'evening', 'base_price' => 15000000, 'additional_hour_price' => 1800000, 'min_hours' => 4, 'max_hours' => 6, 'overtime_price' => 2000000, 'cleaning_fee' => 500000, 'security_deposit' => 2000000],
                ['day_type' => 'weekend', 'session_type' => 'morning', 'base_price' => 15000000, 'additional_hour_price' => 2000000, 'min_hours' => 4, 'max_hours' => 6, 'overtime_price' => 2500000, 'cleaning_fee' => 500000, 'security_deposit' => 3000000],
                ['day_type' => 'weekend', 'session_type' => 'afternoon', 'base_price' => 15000000, 'additional_hour_price' => 2000000, 'min_hours' => 4, 'max_hours' => 6, 'overtime_price' => 2500000, 'cleaning_fee' => 500000, 'security_deposit' => 3000000],
                ['day_type' => 'weekend', 'session_type' => 'evening', 'base_price' => 18000000, 'additional_hour_price' => 2200000, 'min_hours' => 4, 'max_hours' => 6, 'overtime_price' => 2800000, 'cleaning_fee' => 500000, 'security_deposit' => 3000000],
            ],
            
            // Crystal Convention Center (High)
            $venues[6]->id => [
                ['day_type' => 'weekday', 'session_type' => 'full_day', 'base_price' => 150000000, 'additional_hour_price' => 10000000, 'min_hours' => 8, 'max_hours' => 12, 'overtime_price' => 12000000, 'cleaning_fee' => 5000000, 'security_deposit' => 20000000],
                ['day_type' => 'weekend', 'session_type' => 'full_day', 'base_price' => 200000000, 'additional_hour_price' => 15000000, 'min_hours' => 8, 'max_hours' => 12, 'overtime_price' => 18000000, 'cleaning_fee' => 5000000, 'security_deposit' => 30000000],
            ],
            
            // Rustic Barn Countryside (Mid)
            $venues[7]->id => [
                ['day_type' => 'weekday', 'session_type' => 'full_day', 'base_price' => 32000000, 'additional_hour_price' => 2500000, 'min_hours' => 6, 'max_hours' => 10, 'overtime_price' => 3000000, 'cleaning_fee' => 1500000, 'security_deposit' => 4000000],
                ['day_type' => 'weekend', 'session_type' => 'full_day', 'base_price' => 45000000, 'additional_hour_price' => 3500000, 'min_hours' => 6, 'max_hours' => 10, 'overtime_price' => 4000000, 'cleaning_fee' => 1500000, 'security_deposit' => 5000000],
            ],
        ];

        foreach ($pricingStructures as $venueId => $priceList) {
            foreach ($priceList as $price) {
                $pricings[] = VenuePricing::create([
                    'venue_id' => $venueId,
                    'day_type' => $price['day_type'],
                    'session_type' => $price['session_type'],
                    'base_price' => $price['base_price'],
                    'additional_hour_price' => $price['additional_hour_price'],
                    'min_hours' => $price['min_hours'],
                    'max_hours' => $price['max_hours'] ?? null,
                    'overtime_price' => $price['overtime_price'],
                    'cleaning_fee' => $price['cleaning_fee'],
                    'security_deposit' => $price['security_deposit'],
                    'is_active' => true,
                ]);
            }
        }

        return $pricings;
    }

    private function createVenueAvailability($venues)
    {
        $availabilities = [];
        $today = Carbon::today();
        
        // Create availability for next 90 days
        for ($i = 0; $i < 90; $i++) {
            $date = $today->copy()->addDays($i);
            
            foreach ($venues as $venue) {
                // Most days are available
                $isAvailable = true;
                $reason = null;
                $availableFrom = '08:00:00';
                $availableUntil = '23:00:00';
                
                // Random unavailability (10% chance)
                if (rand(1, 10) == 1) {
                    $isAvailable = false;
                    $reasons = ['maintenance', 'private_event', 'renovation', 'holiday'];
                    $reason = $reasons[array_rand($reasons)];
                }
                
                // Maintenance untuk venue tertentu
                if ($venue->id == $venues[0]->id && $date->day == 1) {
                    $isAvailable = false;
                    $reason = 'maintenance';
                }
                
                $availabilities[] = VenueAvailability::create([
                    'venue_id' => $venue->id,
                    'date' => $date->format('Y-m-d'),
                    'is_available' => $isAvailable,
                    'unavailable_reason' => $reason,
                    'available_from' => $isAvailable ? $availableFrom : null,
                    'available_until' => $isAvailable ? $availableUntil : null,
                    'notes' => $isAvailable ? null : 'Not available for booking',
                ]);
            }
        }

        return $availabilities;
    }

    private function createVenueBookings($venues)
    {
        $bookings = [];
        
        // Sample bookings data
        $bookingsData = [
            // Past bookings (completed)
            [
                'venue' => $venues[0],
                'days_ago' => 60,
                'status' => 'completed',
                'client_name' => 'Andi Wijaya & Sarah Putri',
                'client_phone' => '081234567890',
                'client_email' => 'andi.wijaya@email.com',
                'event_type' => 'Wedding Reception',
                'guest_count' => 450,
                'price' => 120000000,
                'start_time' => '18:00:00',
                'end_time' => '23:00:00',
            ],
            [
                'venue' => $venues[1],
                'days_ago' => 45,
                'status' => 'completed',
                'client_name' => 'Budi Santoso & Rina Kusuma',
                'client_phone' => '081234567891',
                'client_email' => 'budi.santoso@email.com',
                'event_type' => 'Garden Wedding',
                'guest_count' => 280,
                'price' => 65000000,
                'start_time' => '16:00:00',
                'end_time' => '22:00:00',
            ],
            [
                'venue' => $venues[2],
                'days_ago' => 30,
                'status' => 'completed',
                'client_name' => 'Citra Dewi & Doni Pratama',
                'client_phone' => '081234567892',
                'client_email' => 'citra.dewi@email.com',
                'event_type' => 'Engagement Party',
                'guest_count' => 120,
                'price' => 35000000,
                'start_time' => '19:00:00',
                'end_time' => '23:00:00',
            ],
            
            // Recent completed
            [
                'venue' => $venues[3],
                'days_ago' => 15,
                'status' => 'completed',
                'client_name' => 'Erik Tan & Fitri Handayani',
                'client_phone' => '081234567893',
                'client_email' => 'erik.tan@email.com',
                'event_type' => 'Wedding Reception',
                'guest_count' => 180,
                'price' => 55000000,
                'start_time' => '17:00:00',
                'end_time' => '22:00:00',
            ],
            [
                'venue' => $venues[4],
                'days_ago' => 10,
                'status' => 'completed',
                'client_name' => 'Gani Permana & Hesti Lestari',
                'client_phone' => '081234567894',
                'client_email' => 'gani.permana@email.com',
                'event_type' => 'Beach Wedding',
                'guest_count' => 200,
                'price' => 52000000,
                'start_time' => '16:00:00',
                'end_time' => '21:00:00',
            ],
            
            // Confirmed upcoming bookings
            [
                'venue' => $venues[0],
                'days_from_now' => 15,
                'status' => 'confirmed',
                'client_name' => 'Ivan Setiawan & Julia Kartika',
                'client_phone' => '081234567895',
                'client_email' => 'ivan.setiawan@email.com',
                'event_type' => 'Wedding Reception',
                'guest_count' => 480,
                'price' => 120000000,
                'start_time' => '18:00:00',
                'end_time' => '23:00:00',
            ],
            [
                'venue' => $venues[1],
                'days_from_now' => 20,
                'status' => 'confirmed',
                'client_name' => 'Kevin Wijaya & Lisa Anggraeni',
                'client_phone' => '081234567896',
                'client_email' => 'kevin.wijaya@email.com',
                'event_type' => 'Garden Wedding',
                'guest_count' => 250,
                'price' => 65000000,
                'start_time' => '17:00:00',
                'end_time' => '22:00:00',
            ],
            [
                'venue' => $venues[2],
                'days_from_now' => 25,
                'status' => 'confirmed',
                'client_name' => 'Michael Chen & Nina Pratiwi',
                'client_phone' => '081234567897',
                'client_email' => 'michael.chen@email.com',
                'event_type' => 'Birthday Party',
                'guest_count' => 100,
                'price' => 35000000,
                'start_time' => '19:00:00',
                'end_time' => '23:00:00',
            ],
            [
                'venue' => $venues[5],
                'days_from_now' => 30,
                'status' => 'confirmed',
                'client_name' => 'Oscar Ramadhan & Putri Ayu',
                'client_phone' => '081234567898',
                'client_email' => 'oscar.ramadhan@email.com',
                'event_type' => 'Intimate Wedding',
                'guest_count' => 80,
                'price' => 18000000,
                'start_time' => '18:00:00',
                'end_time' => '22:00:00',
            ],
            [
                'venue' => $venues[6],
                'days_from_now' => 45,
                'status' => 'confirmed',
                'client_name' => 'PT. Global Technology Indonesia',
                'client_phone' => '021-5551234',
                'client_email' => 'events@globaltech.com',
                'event_type' => 'Corporate Conference',
                'guest_count' => 800,
                'price' => 200000000,
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
            ],
            
            // Pending bookings
            [
                'venue' => $venues[3],
                'days_from_now' => 60,
                'status' => 'pending',
                'client_name' => 'Raden Arif & Sinta Maharani',
                'client_phone' => '081234567899',
                'client_email' => 'raden.arif@email.com',
                'event_type' => 'Wedding Reception',
                'guest_count' => 190,
                'price' => 55000000,
                'start_time' => '17:00:00',
                'end_time' => '22:00:00',
            ],
            [
                'venue' => $venues[7],
                'days_from_now' => 70,
                'status' => 'pending',
                'client_name' => 'Taufik Hidayat & Ulfa Rahmawati',
                'client_phone' => '081234567800',
                'client_email' => 'taufik.hidayat@email.com',
                'event_type' => 'Rustic Wedding',
                'guest_count' => 150,
                'price' => 45000000,
                'start_time' => '15:00:00',
                'end_time' => '21:00:00',
            ],
            
            // Cancelled booking
            [
                'venue' => $venues[4],
                'days_ago' => 20,
                'status' => 'cancelled',
                'client_name' => 'Vincent Gunawan & Wulan Sari',
                'client_phone' => '081234567801',
                'client_email' => 'vincent.gunawan@email.com',
                'event_type' => 'Beach Wedding',
                'guest_count' => 220,
                'price' => 52000000,
                'start_time' => '16:00:00',
                'end_time' => '21:00:00',
                'cancelled_reason' => 'Client request - venue tidak sesuai ekspektasi',
            ],
        ];

        foreach ($bookingsData as $data) {
            if (isset($data['days_ago'])) {
                $bookingDate = Carbon::now()->subDays($data['days_ago']);
            } else {
                $bookingDate = Carbon::now()->addDays($data['days_from_now']);
            }
            
            $confirmedAt = null;
            $cancelledAt = null;
            
            if ($data['status'] == 'confirmed' || $data['status'] == 'completed') {
                $confirmedAt = $bookingDate->copy()->subDays(30);
            }
            
            if ($data['status'] == 'cancelled') {
                $cancelledAt = $bookingDate->copy()->subDays(5);
            }
            
            $bookings[] = VenueBooking::create([
                'venue_id' => $data['venue']->id,
                'order_id' => null,
                'booking_number' => 'VB-' . $bookingDate->format('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
                'booking_date' => $bookingDate->format('Y-m-d'),
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'status' => $data['status'],
                'client_name' => $data['client_name'],
                'client_phone' => $data['client_phone'],
                'client_email' => $data['client_email'],
                'event_type' => $data['event_type'],
                'guest_count' => $data['guest_count'],
                'total_price' => $data['price'],
                'special_requests' => $data['event_type'] == 'Wedding Reception' ? 'Minta tambahan dekorasi bunga di entrance, meja VIP untuk orang tua, dan ruang ganti yang nyaman' : null,
                'notes' => null,
                'confirmed_at' => $confirmedAt,
                'cancelled_at' => $cancelledAt,
                'cancelled_reason' => $data['cancelled_reason'] ?? null,
            ]);
        }

        return $bookings;
    }
}
