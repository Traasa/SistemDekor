<?php

namespace Database\Seeders;

use App\Models\CompanyProfile;
use App\Models\Service;
use App\Models\Package;
use App\Models\Portfolio;
use App\Models\Testimonial;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WebsiteContentSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Clear existing data
        echo "🔄 Clearing existing website content data...\n";
        Testimonial::truncate();
        Portfolio::truncate();
        Package::truncate();
        Service::truncate();
        CompanyProfile::truncate();

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        echo "🌐 Seeding Website Content data...\n";

        // Create company profile
        $this->createCompanyProfile();
        
        // Create services
        $this->createServices();
        
        // Create packages
        $this->createPackages();
        
        // Create portfolios
        $this->createPortfolios();
        
        // Create testimonials
        $this->createTestimonials();

        echo "✅ Website content seeding completed successfully!\n";
    }

    private function createCompanyProfile(): void
    {
        CompanyProfile::create([
            'company_name' => 'SistemDekor - Bali Wedding Organizer',
            'about' => "SistemDekor adalah wedding organizer terpercaya di Bali yang berdedikasi untuk mewujudkan pernikahan impian Anda. Dengan pengalaman lebih dari 10 tahun dalam industri wedding dan event, kami telah membantu ratusan pasangan menciptakan momen pernikahan yang tak terlupakan.\n\nKami menghadirkan layanan one-stop solution untuk segala kebutuhan pernikahan Anda, mulai dari perencanaan konsep, dekorasi, katering, dokumentasi, entertainment, hingga koordinasi acara. Tim profesional kami siap membantu Anda di setiap langkah, memastikan hari spesial Anda berjalan sempurna.\n\nDengan jaringan vendor terpercaya, venue eksklusif, dan desainer berpengalaman, kami menciptakan pernikahan yang sesuai dengan kepribadian dan budget Anda. Mari wujudkan pernikahan impian Anda bersama SistemDekor!",
            'services' => json_encode([
                'Wedding Planning & Coordination',
                'Event Decoration & Styling',
                'Catering & Food Service',
                'Photography & Videography',
                'Entertainment & Music',
                'Venue Booking & Management',
                'Bridal Make-up & Hair Styling',
                'Wedding Invitation Design',
                'Souvenir & Gift Arrangement',
                'Honeymoon Packages'
            ]),
            'gallery' => json_encode([
                'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
                'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
                'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
                'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800',
                'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
                'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800'
            ]),
            'phone' => '+62 361 123456',
            'email' => 'info@sistemdekor.com',
            'address' => 'Jl. Sunset Road No. 88, Kuta, Badung, Bali 80361',
            'website' => 'https://sistemdekor.com',
            'social_media' => json_encode([
                'instagram' => 'https://instagram.com/sistemdekor',
                'facebook' => 'https://facebook.com/sistemdekor',
                'whatsapp' => 'https://wa.me/62361123456',
                'youtube' => 'https://youtube.com/@sistemdekor',
                'tiktok' => 'https://tiktok.com/@sistemdekor'
            ])
        ]);

        echo "✓ Created company profile\n";
    }

    private function createServices(): void
    {
        $services = [
            // Wedding Services
            [
                'name' => 'Full Wedding Planning',
                'description' => 'Layanan perencanaan pernikahan lengkap dari konsep hingga eksekusi. Termasuk konsultasi, koordinasi vendor, timeline management, dan on-the-day coordination. Tim berpengalaman kami akan memastikan pernikahan Anda berjalan sempurna tanpa stress.',
                'price' => 25000000,
                'category' => 'Wedding Planning',
                'image' => 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500',
                'is_active' => true
            ],
            [
                'name' => 'Day of Coordination',
                'description' => 'Koordinasi acara di hari H untuk memastikan semua berjalan sesuai rencana. Kami mengatur timeline, koordinasi vendor, troubleshooting, dan memastikan Anda dapat menikmati hari spesial tanpa khawatir detail teknis.',
                'price' => 8000000,
                'category' => 'Wedding Planning',
                'image' => 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500',
                'is_active' => true
            ],
            [
                'name' => 'Partial Planning',
                'description' => 'Bantuan perencanaan untuk aspek-aspek tertentu dari pernikahan Anda. Cocok untuk Anda yang sudah memiliki beberapa vendor tapi membutuhkan bantuan profesional untuk area spesifik seperti dekorasi atau koordinasi.',
                'price' => 15000000,
                'category' => 'Wedding Planning',
                'image' => 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=500',
                'is_active' => true
            ],

            // Decoration Services
            [
                'name' => 'Grand Ballroom Decoration',
                'description' => 'Dekorasi lengkap untuk ballroom dengan kapasitas 500-1000 tamu. Termasuk stage decoration, backdrop, centerpiece, lighting, dan entrance decoration. Desain custom sesuai tema dan warna pilihan Anda.',
                'price' => 45000000,
                'category' => 'Decoration',
                'image' => 'https://images.unsplash.com/photo-1519167758481-83f29da8c8b0?w=500',
                'is_active' => true
            ],
            [
                'name' => 'Garden Wedding Decoration',
                'description' => 'Dekorasi outdoor dengan konsep natural dan romantic. Termasuk floral arrangements, arch decoration, aisle decoration, reception area setup, dan ambient lighting. Perfect untuk garden atau beach wedding.',
                'price' => 35000000,
                'category' => 'Decoration',
                'image' => 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=500',
                'is_active' => true
            ],
            [
                'name' => 'Traditional Javanese Decoration',
                'description' => 'Dekorasi pernikahan adat Jawa lengkap dengan ornamen tradisional, janur kuning, bleketepe, dan tata rias pelaminan. Memadukan unsur tradisi dengan sentuhan modern yang elegan.',
                'price' => 30000000,
                'category' => 'Decoration',
                'image' => 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=500',
                'is_active' => true
            ],
            [
                'name' => 'Minimalist Modern Decoration',
                'description' => 'Dekorasi dengan konsep minimalis modern yang clean dan sophisticated. Fokus pada simplicity, warna netral, dan detail yang refined. Cocok untuk venue indoor maupun outdoor.',
                'price' => 28000000,
                'category' => 'Decoration',
                'image' => 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=500',
                'is_active' => true
            ],

            // Catering Services
            [
                'name' => 'International Buffet Premium',
                'description' => 'Buffet internasional dengan 50+ menu pilihan. Termasuk appetizer, soup, salad bar, main course (Asian & Western), dessert station, dan live cooking station. Menu dapat disesuaikan dengan dietary requirements.',
                'price' => 350000, // per pax
                'category' => 'Catering',
                'image' => 'https://images.unsplash.com/photo-1555244162-803834f70033?w=500',
                'is_active' => true
            ],
            [
                'name' => 'Traditional Indonesian Buffet',
                'description' => 'Hidangan tradisional Indonesia dengan menu pilihan dari berbagai daerah. Nasi tumpeng, sate, gado-gado, rendang, dan berbagai menu autentik lainnya. Live station untuk masakan fresh.',
                'price' => 250000, // per pax
                'category' => 'Catering',
                'image' => 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=500',
                'is_active' => true
            ],
            [
                'name' => 'Premium Plated Dinner',
                'description' => 'Five-course plated dinner service dengan menu pilihan Western atau Asian Fusion. Termasuk amuse-bouche, appetizer, soup, main course, dan dessert. Professional table service included.',
                'price' => 450000, // per pax
                'category' => 'Catering',
                'image' => 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500',
                'is_active' => true
            ],

            // Photography & Videography
            [
                'name' => 'Full Day Photo & Video Coverage',
                'description' => 'Dokumentasi lengkap dari morning preparation hingga resepsi malam. Tim 2 fotografer + 2 videografer, drone coverage, same day edit, photo booth, dan album design. Hasil dalam bentuk digital + album premium.',
                'price' => 18000000,
                'category' => 'Documentation',
                'image' => 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=500',
                'is_active' => true
            ],
            [
                'name' => 'Pre-wedding Photoshoot',
                'description' => 'Sesi foto pre-wedding dengan 2 lokasi pilihan di Bali. Durasi 6 jam, 3 set outfit, professional make-up & hair styling, dan hasil edit 50+ foto. Free 1 photo album 20x30cm.',
                'price' => 8000000,
                'category' => 'Documentation',
                'image' => 'https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=500',
                'is_active' => true
            ],
            [
                'name' => 'Cinematic Wedding Video',
                'description' => 'Wedding video dengan gaya cinematic storytelling. Durasi video 10-15 menit dengan music scoring, color grading, dan slow motion shots. Termasuk behind the scenes dan full ceremony recording.',
                'price' => 12000000,
                'category' => 'Documentation',
                'image' => 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500',
                'is_active' => true
            ],

            // Entertainment
            [
                'name' => 'Live Band Performance',
                'description' => 'Live band 6-8 personel dengan repertoire lagu Indonesian hits dan international. Durasi 4 jam, sound system lengkap, dan dapat request lagu khusus. Perfect untuk reception dan after party.',
                'price' => 15000000,
                'category' => 'Entertainment',
                'image' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500',
                'is_active' => true
            ],
            [
                'name' => 'Professional DJ & Sound System',
                'description' => 'DJ profesional dengan sound system premium dan lighting setup. Music sesuai preferensi Anda, interaktif dengan tamu, dan dapat handle acara games & dance floor. Durasi 5 jam.',
                'price' => 8000000,
                'category' => 'Entertainment',
                'image' => 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500',
                'is_active' => true
            ],
            [
                'name' => 'Traditional Dance Performance',
                'description' => 'Pertunjukan tari tradisional Bali (Kecak, Legong, atau Barong) dengan penari profesional dan gamelan. Durasi 30-45 menit. Menambah nilai budaya dan pengalaman unik untuk tamu.',
                'price' => 6000000,
                'category' => 'Entertainment',
                'image' => 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=500',
                'is_active' => true
            ],

            // Additional Services
            [
                'name' => 'Bridal Make-up & Styling',
                'description' => 'Paket lengkap make-up dan styling untuk bride. Termasuk trial session, make-up akad/pemberkatan dan resepsi, hair styling, dan touch-up selama acara. Menggunakan produk premium dan teknik modern.',
                'price' => 5000000,
                'category' => 'Bridal',
                'image' => 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500',
                'is_active' => true
            ],
            [
                'name' => 'Wedding Invitation Design & Print',
                'description' => 'Desain custom undangan pernikahan (hardcover atau softcover) dengan pilihan material premium. Include design revision, printing 500 pcs, envelope, dan packaging. Digital invitation juga tersedia.',
                'price' => 4000000,
                'category' => 'Stationery',
                'image' => 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=500',
                'is_active' => true
            ],
            [
                'name' => 'Wedding Souvenir Package',
                'description' => 'Souvenir pernikahan custom untuk 500 pax. Pilihan produk: hampers, gift box, traditional items, atau modern gifts. Include packaging design, personalized tag, dan arrangement di venue.',
                'price' => 7500000,
                'category' => 'Souvenir',
                'image' => 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=500',
                'is_active' => true
            ],
            [
                'name' => 'Photo Booth with Props',
                'description' => 'Photo booth dengan backdrop custom, lighting setup, dan 100+ props lucu. Termasuk operator, instant print unlimited, dan digital copies. Tamu dapat langsung membawa pulang foto sebagai kenang-kenangan.',
                'price' => 3500000,
                'category' => 'Entertainment',
                'image' => 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500',
                'is_active' => true
            ]
        ];

        foreach ($services as $service) {
            Service::create($service);
        }

        echo "✓ Created " . count($services) . " services\n";
    }

    private function createPackages(): void
    {
        $packages = [
            [
                'name' => 'Intimate Wedding Package',
                'slug' => 'intimate-wedding-package',
                'description' => "Perfect untuk pernikahan intimate dengan 50-100 tamu. Paket ini mencakup:\n\n• Venue booking (4 jam)\n• Simple elegant decoration\n• Basic sound system & lighting\n• Professional MC\n• Catering for 100 pax (International buffet)\n• Photography (4 jam, 1 fotografer)\n• Basic videography\n• Wedding coordinator\n• Bridal make-up & hair styling\n• 100 invitation cards\n\nCocok untuk pasangan yang menginginkan pernikahan sederhana namun elegan dengan budget terjangkau.",
                'base_price' => 75000000,
                'image_url' => 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
                'is_active' => true
            ],
            [
                'name' => 'Classic Wedding Package',
                'slug' => 'classic-wedding-package',
                'description' => "Paket pernikahan klasik untuk 200-300 tamu yang mencakup:\n\n• Premium venue booking (6 jam)\n• Classic ballroom decoration dengan stage & backdrop\n• Complete sound system & stage lighting\n• Professional MC & live acoustic music\n• Premium catering for 250 pax (buffet international)\n• Full day photo & video coverage (2 photographer, 1 videographer)\n• Same day edit\n• Full wedding coordination\n• Bridal make-up for 2 sessions (akad & resepsi)\n• 300 premium invitation cards\n• Photo booth with props\n• Wedding souvenir for 250 pax\n\nPaket terlaris kami dengan fasilitas lengkap dan kualitas terjamin.",
                'base_price' => 150000000,
                'image_url' => 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
                'is_active' => true
            ],
            [
                'name' => 'Grand Wedding Package',
                'slug' => 'grand-wedding-package',
                'description' => "Paket pernikahan mewah untuk 400-500 tamu dengan semua kemewahan:\n\n• Luxury venue booking (8 jam)\n• Grand ballroom decoration dengan floral arrangements premium\n• State-of-the-art sound system & dynamic lighting\n• Professional MC & live band (8 personel)\n• Premium plated dinner for 450 pax\n• Full team photography & videography dengan drone\n• Cinematic wedding video\n• Pre-wedding photoshoot (1 day, 2 lokasi)\n• Complete wedding planning & coordination\n• Bridal make-up premium dengan trial session\n• 500 luxury invitation cards dengan box\n• Interactive photo booth & instant print\n• Premium wedding souvenir\n• Traditional dance performance\n• Honeymoon package (3D2N)\n\nPackage ultimate untuk pernikahan impian yang tak terlupakan!",
                'base_price' => 300000000,
                'image_url' => 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
                'is_active' => true
            ],
            [
                'name' => 'Garden Wedding Package',
                'slug' => 'garden-wedding-package',
                'description' => "Paket pernikahan outdoor dengan konsep natural & romantic untuk 150-200 tamu:\n\n• Garden venue with ocean/mountain view (5 jam)\n• Outdoor decoration dengan floral arch & aisle decoration\n• Portable sound system & ambient lighting\n• Professional MC & acoustic live music\n• Garden party catering for 180 pax\n• Full day photography & videography\n• Outdoor wedding coordination\n• Natural bridal make-up & hair styling\n• 200 rustic invitation cards\n• Dessert table setup\n• Souvenir for guests\n• Backup plan untuk cuaca (tenda)\n\nPerfect untuk pernikahan dengan suasana outdoor yang romantic dan Instagram-worthy!",
                'base_price' => 120000000,
                'image_url' => 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
                'is_active' => true
            ],
            [
                'name' => 'Beach Wedding Package',
                'slug' => 'beach-wedding-package',
                'description' => "Paket pernikahan di pantai Bali yang romantis untuk 100-150 tamu:\n\n• Beachfront venue booking (sunset time, 4 jam)\n• Beach ceremony setup dengan bamboo arch & white drapes\n• Beach reception decoration\n• Portable sound system\n• MC & beach music ensemble\n• Seafood BBQ buffet for 120 pax\n• Sunset photography & videography session\n• Beach wedding coordinator\n• Beach-theme bridal make-up\n• 150 beach-theme invitations\n• Welcome drinks & canapes\n• Bonfire setup\n• Transportation for guests\n• Sunset boat decoration (optional)\n\nWujudkan dream beach wedding di pulau dewata!",
                'base_price' => 95000000,
                'image_url' => 'https://images.unsplash.com/photo-1519167758481-83f29da8c8b0?w=800',
                'is_active' => true
            ],
            [
                'name' => 'Traditional Javanese Wedding',
                'slug' => 'traditional-javanese-wedding',
                'description' => "Paket pernikahan adat Jawa lengkap untuk 300-400 tamu:\n\n• Traditional venue setup (full day)\n• Complete Javanese decoration (pelaminan, janur kuning, etc)\n• Gamelan music & traditional MC\n• Traditional ceremony coordination (siraman, midodareni, akad, panggih)\n• Traditional & modern catering for 350 pax\n• Full documentation (photo & video)\n• Traditional costume rental (bride & groom)\n• Traditional make-up artist\n• Complete adat accessories\n• 400 traditional invitation cards\n• Souvenir dengan kemasan tradisional\n• Rias keluarga (4 orang)\n\nPernikahan adat Jawa yang sakral dan berkesan dengan bimbingan ahli!",
                'base_price' => 180000000,
                'image_url' => 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
                'is_active' => true
            ],
            [
                'name' => 'Modern Minimalist Wedding',
                'slug' => 'modern-minimalist-wedding',
                'description' => "Paket pernikahan modern minimalis yang sophisticated untuk 150-200 tamu:\n\n• Modern venue with architecture appeal (5 jam)\n• Minimalist decoration dengan clean lines & neutral colors\n• Premium sound & minimal lighting\n• Bilingual MC & jazz ensemble\n• Contemporary fusion catering for 180 pax\n• Artistic photography & videography\n• Wedding coordination\n• Modern bridal make-up & sleek hair styling\n• 200 minimalist invitation cards\n• Signature drinks bar\n• Modern souvenir packaging\n• LED backdrop display\n\nUntuk pasangan yang menyukai style modern, clean, dan timeless!",
                'base_price' => 135000000,
                'image_url' => 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800',
                'is_active' => true
            ],
            [
                'name' => 'Luxury Villa Wedding',
                'slug' => 'luxury-villa-wedding',
                'description' => "Paket pernikahan eksklusif di villa private untuk 80-120 tamu VIP:\n\n• Luxury villa rental dengan private pool & garden (full day)\n• Exclusive villa decoration\n• Premium sound & lighting setup\n• Professional MC & live music\n• Fine dining catering for 100 pax\n• Premium photography & cinematic videography\n• Pre-wedding shoot at villa\n• Personal wedding planner\n• Luxury bridal styling\n• 120 premium invitation cards with box\n• Welcome hampers for guests\n• Premium souvenir\n• Villa accommodation for 2 nights (bride & groom)\n• Spa & wellness session\n\nExclusive wedding experience di private villa dengan privacy maksimal!",
                'base_price' => 200000000,
                'image_url' => 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
                'is_active' => true
            ]
        ];

        foreach ($packages as $package) {
            Package::create($package);
        }

        echo "✓ Created " . count($packages) . " packages\n";
    }

    private function createPortfolios(): void
    {
        $portfolios = [
            // Wedding Portfolios
            [
                'title' => 'Andi & Sari - Grand Ballroom Wedding',
                'description' => 'Pernikahan megah di Grand Ballroom dengan 800 tamu. Tema classic gold & white dengan dekorasi mewah, live band performance, dan dinner buffet premium. Dokumentasi lengkap dari persiapan hingga after party.',
                'image_url' => 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
                'category' => 'Wedding',
                'is_featured' => true
            ],
            [
                'title' => 'Budi & Rina - Beach Wedding Sunset',
                'description' => 'Beach wedding romantis di pantai Jimbaran dengan latar sunset yang memukau. Intimate ceremony dengan 100 tamu, BBQ seafood dinner, dan bonfire party. Momen magical yang tak terlupakan.',
                'image_url' => 'https://images.unsplash.com/photo-1519167758481-83f29da8c8b0?w=800',
                'category' => 'Wedding',
                'is_featured' => true
            ],
            [
                'title' => 'Dimas & Maya - Traditional Javanese Wedding',
                'description' => 'Pernikahan adat Jawa lengkap dengan prosesi siraman, midodareni, akad nikah, dan resepsi panggih. Dekorasi pelaminan mewah dengan ornamen tradisional, gamelan music, dan hidangan nusantara untuk 500 tamu.',
                'image_url' => 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
                'category' => 'Wedding',
                'is_featured' => true
            ],
            [
                'title' => 'Eko & Putri - Garden Wedding Paradise',
                'description' => 'Garden wedding dengan pemandangan sawah dan gunung di Ubud. Dekorasi natural dengan banyak bunga tropis, wooden furniture, dan fairy lights. Intimate gathering untuk 150 tamu dengan farm-to-table catering.',
                'image_url' => 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
                'category' => 'Wedding',
                'is_featured' => false
            ],
            [
                'title' => 'Fajar & Lisa - Modern Minimalist Wedding',
                'description' => 'Pernikahan modern minimalis di venue kontemporer dengan konsep monochrome. Clean decoration, geometric shapes, dan ambient lighting. Intimate wedding untuk 120 tamu dengan plated dinner service.',
                'image_url' => 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800',
                'category' => 'Wedding',
                'is_featured' => false
            ],
            [
                'title' => 'Gede & Ayu - Balinese Traditional Wedding',
                'description' => 'Pernikahan adat Bali lengkap dengan upacara mepandes, ceremony di pura keluarga, dan resepsi dengan tari Legong. Dekorasi tradisional Bali dengan janur kuning dan penjor untuk 400 tamu.',
                'image_url' => 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
                'category' => 'Wedding',
                'is_featured' => false
            ],

            // Corporate Events
            [
                'title' => 'Annual Gala Dinner PT. Maju Bersama',
                'description' => 'Gala dinner perusahaan untuk 500 karyawan dengan tema "Future Vision". Stage lighting dinamis, LED screen, live band, dan awards ceremony. Dokumentasi profesional dan live streaming untuk cabang luar kota.',
                'image_url' => 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
                'category' => 'Corporate',
                'is_featured' => false
            ],
            [
                'title' => 'Product Launch - Tech Innovation 2025',
                'description' => 'Product launch event untuk brand teknologi dengan 300 undangan VIP. Interactive booth, hologram presentation, DJ performance, dan cocktail reception. Modern stage setup dengan LED wall.',
                'image_url' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
                'category' => 'Corporate',
                'is_featured' => false
            ],

            // Birthday Parties
            [
                'title' => 'Sweet Seventeen - Princess Theme',
                'description' => 'Birthday party tema princess untuk sweet seventeen dengan 200 tamu. Dekorasi ballroom pink & gold, photo booth, live band, dan dance floor. Ice cream bar dan dessert table yang Instagrammable.',
                'image_url' => 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
                'category' => 'Birthday',
                'is_featured' => false
            ],
            [
                'title' => 'Kids Birthday - Superhero Party',
                'description' => 'Birthday party anak tema superhero dengan games interaktif, face painting, magic show, dan character appearance. Outdoor setup dengan bouncy castle untuk 100 anak-anak.',
                'image_url' => 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
                'category' => 'Birthday',
                'is_featured' => false
            ],

            // Engagement
            [
                'title' => 'Hendra & Dinda - Romantic Engagement',
                'description' => 'Surprise engagement di rooftop restaurant dengan pemandangan sunset Bali. Dekorasi romantic dengan bunga dan candles, live acoustic music, dan intimate dinner untuk keluarga.',
                'image_url' => 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
                'category' => 'Engagement',
                'is_featured' => false
            ],
            [
                'title' => 'Irfan & Sari - Traditional Engagement Ceremony',
                'description' => 'Acara lamaran tradisional dengan 50 keluarga dari kedua belah pihak. Dekorasi pelaminan sederhana elegan, hidangan nusantara, dan dokumentasi moment sakral pertunangan.',
                'image_url' => 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
                'category' => 'Engagement',
                'is_featured' => false
            ],

            // Pre-wedding Shoots
            [
                'title' => 'Pre-wedding at Tegalalang Rice Terrace',
                'description' => 'Sesi foto pre-wedding di sawah terasering Tegalalang dengan sunrise. Konsep natural romantic dengan outfit casual & traditional Bali. Hasil foto yang breathtaking dengan landscape iconic Bali.',
                'image_url' => 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800',
                'category' => 'Pre-wedding',
                'is_featured' => false
            ],
            [
                'title' => 'Pre-wedding Beach & Villa Session',
                'description' => 'Pre-wedding photoshoot dengan 2 lokasi: beach session di Melasti Beach dan villa session di Uluwatu. Outfit formal & casual, golden hour photography, dan video cinematic.',
                'image_url' => 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
                'category' => 'Pre-wedding',
                'is_featured' => false
            ],
            [
                'title' => 'Pre-wedding at Handara Gate',
                'description' => 'Iconic pre-wedding shoot di Handara Golf & Resort dengan background gerbang traditional yang famous. Dramatic cloudy sky, misty mountain view, dan couple in elegant outfits.',
                'image_url' => 'https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=800',
                'category' => 'Pre-wedding',
                'is_featured' => false
            ]
        ];

        foreach ($portfolios as $portfolio) {
            Portfolio::create($portfolio);
        }

        echo "✓ Created " . count($portfolios) . " portfolios\n";
    }

    private function createTestimonials(): void
    {
        $testimonials = [
            [
                'client_name' => 'Andi & Sari',
                'event_type' => 'Wedding',
                'testimonial' => 'SistemDekor benar-benar wedding organizer terbaik! Dari awal konsultasi sampai hari H, semuanya perfect. Tim sangat profesional, responsif, dan detail. Dekorasi melebihi ekspektasi kami, vendor-vendor yang dipilih semua berkualitas. Hari pernikahan kami berjalan lancar tanpa ada masalah sedikitpun. Semua tamu memuji acara kami. Thank you so much SistemDekor team! Highly recommended! 💕',
                'rating' => 5,
                'photo_url' => 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200',
                'is_featured' => true
            ],
            [
                'client_name' => 'Budi & Rina',
                'event_type' => 'Beach Wedding',
                'testimonial' => 'Impian kami untuk wedding di beach dengan sunset view terwujud thanks to SistemDekor! Prosesnya mudah, tim sangat membantu dari pilih venue, dekorasi, sampai koordinasi hari H. Sunset ceremony nya magical banget, semua moment captured dengan sempurna. Catering enak, entertainment seru. Tamu-tamu pada bilang ini best wedding yang pernah mereka datangi. Worth it banget! Terima kasih banyak! 🌅',
                'rating' => 5,
                'photo_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
                'is_featured' => true
            ],
            [
                'client_name' => 'Dimas & Maya',
                'event_type' => 'Traditional Javanese Wedding',
                'testimonial' => 'Untuk pernikahan adat Jawa, SistemDekor adalah pilihan tepat! Mereka sangat paham prosesi adat dan menjalankannya dengan sempurna. Koordinator sangat membantu keluarga, dekorasi pelaminan cantik banget, gamelan dan penari profesional. Orang tua kami sangat puas dengan jalannya acara yang sakral dan khidmat. Dokumentasi juga bagus untuk kenangan. Terima kasih sudah mewujudkan pernikahan impian kami! 🙏',
                'rating' => 5,
                'photo_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
                'is_featured' => true
            ],
            [
                'client_name' => 'Eko & Putri',
                'event_type' => 'Garden Wedding',
                'testimonial' => 'Garden wedding kami di Ubud absolutely stunning! SistemDekor ngerti banget visi kami untuk intimate natural wedding. Dekorasi dengan bunga-bunga fresh dan setting outdoor yang cozy bikin suasana sangat romantic. Tim sangat helpful dan always ready kalau ada yang perlu. Photography team juga luar biasa, hasilnya banyak yang cinematic. We couldn\'t ask for more! Perfect wedding! 🌸',
                'rating' => 5,
                'photo_url' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
                'is_featured' => true
            ],
            [
                'client_name' => 'Fajar & Lisa',
                'event_type' => 'Modern Minimalist Wedding',
                'testimonial' => 'Kami sangat picky soal design dan details, dan SistemDekor deliver exactly what we want! Modern minimalist concept nya executed perfectly dengan clean lines, neutral colors, dan sophisticated touch. Venue selection, decoration, lighting, everything on point. Koordinator sangat organized dan timeline berjalan smooth. Vendor-vendor yang dipilih juga top quality. Hasil foto dan video nya elegant dan timeless. Love it! ✨',
                'rating' => 5,
                'photo_url' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
                'is_featured' => true
            ],
            [
                'client_name' => 'Gede & Ayu',
                'event_type' => 'Balinese Traditional Wedding',
                'testimonial' => 'Terima kasih SistemDekor untuk pernikahan adat Bali kami yang memorable! Prosesi upacara di pura berjalan khidmat, dekorasi traditional Bali nya authentic dan cantik. Tim sangat respectful dengan adat istiadat dan custom keluarga kami. Koordinasi dengan pemangku dan keluarga besar smooth banget. Dokumentasi lengkap dari mejejaitan sampai resepsi. Puas banget dengan hasilnya! Suksma! 🙏🏻',
                'rating' => 5,
                'photo_url' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
                'is_featured' => false
            ],
            [
                'client_name' => 'Hendra & Dinda',
                'event_type' => 'Engagement',
                'testimonial' => 'SistemDekor helped me create the perfect surprise engagement! Dari planning secret proposal sampai setup decoration di rooftop, semuanya executed flawlessly. Dinda totally surprised and said yes! 😍 Moment nya so romantic dengan sunset view, live music, dan intimate dinner setting. Photographer captured every precious moment. Couldn\'t have done it without you guys! Thank you! 💍',
                'rating' => 5,
                'photo_url' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
                'is_featured' => false
            ],
            [
                'client_name' => 'Irfan & Sari',
                'event_type' => 'Traditional Engagement',
                'testimonial' => 'Acara lamaran kami berjalan lancar dan meriah berkat bantuan SistemDekor. Dekorasi seserahan cantik, makanan enak, dan tata acara tertib. Koordinator membantu atur prosesi dengan baik sehingga kedua keluarga nyaman. Dokumentasi juga bagus untuk kenangan. Recommended untuk yang mau acara lamaran yang berkesan! 👍',
                'rating' => 5,
                'photo_url' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
                'is_featured' => false
            ],
            [
                'client_name' => 'Kevin & Angel',
                'event_type' => 'Pre-wedding Photoshoot',
                'testimonial' => 'Pre-wedding photoshoot dengan SistemDekor sangat menyenangkan! Photographer dan team super friendly dan professional. Lokasi yang dipilih bagus-bagus (Tegalalang & Melasti Beach), timing perfect untuk golden hour. Make-up artist bikin Angel cantik banget. Hasil foto nya beyond expectation - artistic, natural, dan romantic. Album nya juga bagus packaging nya. Love all the photos! 📸❤️',
                'rating' => 5,
                'photo_url' => 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200',
                'is_featured' => false
            ],
            [
                'client_name' => 'Linda & Rizki',
                'event_type' => 'Villa Wedding',
                'testimonial' => 'Exclusive wedding di villa private adalah keputusan terbaik! SistemDekor arrange everything perfectly - dari villa selection yang stunning, decoration yang elegant, sampai intimate dinner untuk close friends & family. Privacy terjaga, suasana cozy dan personal banget. Photography team juga memanfaatkan villa architecture dengan bagus. Unforgettable experience! Highly recommended for exclusive intimate wedding! 🏡✨',
                'rating' => 5,
                'photo_url' => 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200',
                'is_featured' => false
            ],
            [
                'client_name' => 'PT. Maju Bersama',
                'event_type' => 'Corporate Gala Dinner',
                'testimonial' => 'SistemDekor sangat profesional dalam menghandle corporate event kami. Gala dinner untuk 500 karyawan berjalan sukses dengan stage setup yang impressive, entertainment yang engaging, dan catering yang memuaskan. Koordinasi dengan tim internal kami juga smooth. Dokumentasi lengkap dan live streaming untuk cabang luar kota worked perfectly. Will definitely use their service again! 👔',
                'rating' => 5,
                'photo_url' => null,
                'is_featured' => false
            ],
            [
                'client_name' => 'Putri (Sweet Seventeen)',
                'event_type' => 'Birthday Party',
                'testimonial' => 'OMG my sweet seventeen party was AMAZING! 😍 SistemDekor totally understood my princess theme dream. Decoration was so pretty (pink & gold everywhere!), photo booth super cute, live band was lit, and all my friends had so much fun on the dance floor. The dessert table was Instagram goals! Best birthday ever! Thank you SistemDekor for making my day special! 💖👑',
                'rating' => 5,
                'photo_url' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
                'is_featured' => false
            ]
        ];

        foreach ($testimonials as $testimonial) {
            Testimonial::create($testimonial);
        }

        echo "✓ Created " . count($testimonials) . " testimonials\n";
    }
}
