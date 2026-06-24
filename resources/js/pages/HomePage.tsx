import { Head, Link } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { PublicLayout } from '../layouts/PublicLayout';
import { CompanyProfile, companyProfileService } from '../services/companyProfileService';
import {
    LandingGalleryItem,
    LandingPortfolioItem,
    LandingServiceItem,
    LandingTestimonialItem,
    websiteContentService,
} from '../services/websiteContentService';

const LANDING_STATS = [
    { label: 'Couple', value: '50+' },
    { label: 'Weddings', value: '99+' },
    { label: 'Decorations', value: '150+' },
    { label: 'Locations', value: '30+' },
];

const DUMMY_IMAGES = [
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1200&q=80',
];

const HERO_SIDE_IMAGE = 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1400&q=80';
const ABOUT_GALLERY_FALLBACKS = [
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1200&q=80',
];

const resolveImagePath = (value?: string | null) => {
    if (!value) return null;
    if (value.startsWith('http') || value.startsWith('/')) return value;
    return `/storage/${value}`;
};

const pickImage = (preferred?: string | null, fallbackIndex = 0) => {
    if (preferred && preferred.trim().length > 0) return preferred;
    return DUMMY_IMAGES[fallbackIndex % DUMMY_IMAGES.length];
};

const isPlaceholderText = (value?: string | null) => {
    const normalized = (value || '').toLowerCase();
    return ['asdf', 'lorem', 'dummy', 'sample', 'test'].some((token) => normalized.includes(token));
};

const HomePage: React.FC = () => {
    const [profile, setProfile] = useState<CompanyProfile | null>(null);
    const [services, setServices] = useState<LandingServiceItem[]>([]);
    const [testimonials, setTestimonials] = useState<LandingTestimonialItem[]>([]);
    const [galleries, setGalleries] = useState<LandingGalleryItem[]>([]);
    const [portfolios, setPortfolios] = useState<LandingPortfolioItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTestimonial, setActiveTestimonial] = useState(0);

    useEffect(() => {
        const fetchHomepageContent = async () => {
            try {
                const [profileResponse, servicesData, testimonialsData, galleryData, portfolioData] = await Promise.all([
                    companyProfileService.getProfile(),
                    websiteContentService.getServices(),
                    websiteContentService.getTestimonials(),
                    websiteContentService.getGalleryItems(),
                    websiteContentService.getPortfolios(),
                ]);

                if (profileResponse.success) setProfile(profileResponse.data);
                setServices(servicesData || []);
                setTestimonials(testimonialsData || []);
                setGalleries(galleryData || []);
                setPortfolios(portfolioData || []);
            } catch (error) {
                console.error('Failed to fetch homepage content:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHomepageContent();
    }, []);

    useEffect(() => {
        if (testimonials.length <= 1) return;
        const timer = setInterval(() => {
            setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [testimonials.length]);

    useEffect(() => {
        if (activeTestimonial >= testimonials.length && testimonials.length > 0) {
            setActiveTestimonial(0);
        }
    }, [activeTestimonial, testimonials.length]);

    if (isLoading && !profile && services.length === 0 && testimonials.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F6EFE6]">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-[#B98A6E]" />
                    <p className="mt-6 text-xl text-[#7B604D]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                        Loading Your Luxury Experience...
                    </p>
                </div>
            </div>
        );
    }

    const heroImage = pickImage(
        resolveImagePath(profile?.hero_image) || galleries[0]?.image_path || portfolios[0]?.image_url,
        0,
    );
    const sideImage = pickImage(
        resolveImagePath(profile?.hero_side_image) || galleries[1]?.image_path || portfolios[1]?.image_url || HERO_SIDE_IMAGE,
        1,
    );
    const aboutGalleryOverrides = (profile?.about_gallery_images || [])
        .map((value) => resolveImagePath(value))
        .filter(Boolean) as string[];
    const portfolioOverrides = (profile?.portfolio_highlight_images || [])
        .map((value) => resolveImagePath(value))
        .filter(Boolean) as string[];
    const brandName = profile?.company_name || 'Ade Decoration';

    const featuredPortfolio = (portfolios.length > 0
        ? portfolios.slice(0, 4)
        : [
              { id: 1, title: 'Wedding Package Premium', description: null, image_url: null, category: 'Wedding', is_featured: true },
              { id: 2, title: 'Grand Ballroom Wedding', description: null, image_url: null, category: 'Wedding', is_featured: true },
              { id: 3, title: 'Beach Wedding Sunset', description: null, image_url: null, category: 'Wedding', is_featured: true },
              { id: 4, title: 'Traditional Javanese Wedding', description: null, image_url: null, category: 'Wedding', is_featured: true },
          ]).map((item, idx) => ({ ...item, image_url: pickImage(item.image_url, idx + 2) }));

    const featuredGallery = (galleries.length > 0
        ? galleries.slice(0, 2)
        : [
              { id: 1, title: 'Gallery One', description: null, image_path: null as unknown as string, category: 'Wedding', is_featured: true },
              { id: 2, title: 'Gallery Two', description: null, image_path: null as unknown as string, category: 'Wedding', is_featured: true },
          ]).map((item, idx) => ({ ...item, image_path: pickImage(item.image_path, idx + 4) }));

    const cleanedServices = services.filter(
        (service) => !isPlaceholderText(service.name) && !isPlaceholderText(service.description) && (service.name || '').trim().length > 0,
    );

    const featuredServices = cleanedServices.length > 0
        ? cleanedServices.slice(0, 6)
        : [
              {
                  id: 1,
                  name: 'Luxury Wedding Planning',
                  description: 'Perencanaan menyeluruh dari konsep, vendor, timeline, hingga eksekusi hari H.',
                  price: 15000000,
                  category: 'Wedding Planning',
                  image: null,
                  is_active: true,
              },
              {
                  id: 2,
                  name: 'Premium Decoration',
                  description: 'Dekorasi artistik dengan line style elegan, bunga segar, dan penataan ruang eksklusif.',
                  price: 12000000,
                  category: 'Decoration',
                  image: null,
                  is_active: true,
              },
              {
                  id: 3,
                  name: 'On-site Coordination',
                  description: 'Koordinasi vendor dan operasional di lokasi agar acara berjalan rapi tanpa stres.',
                  price: 8000000,
                  category: 'Coordination',
                  image: null,
                  is_active: true,
              },
          ];

    const activeItem = testimonials[activeTestimonial];

    return (
        <>
            <Head title="Luxury Wedding Planner">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <PublicLayout active="home" wrapperClassName="min-h-screen bg-[#F7EFE6]">
                <main>
                    <section id="home" className="px-4 pb-14 pt-8 sm:px-8 lg:px-12 2xl:px-16">
                            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                                <div className="relative overflow-hidden rounded-[28px] border border-[#E4D1C1]">
                                    <img src={heroImage} alt="Luxury wedding hero" className="h-[520px] w-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#2a1a11]/80 via-[#2a1a11]/55 to-transparent" />

                                    <div className="absolute left-6 top-1/2 max-w-xl -translate-y-1/2 text-white sm:left-10">
                                        <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-[#EADCCD] uppercase" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                            We are professional wedding planner
                                        </p>
                                        <h1 className="text-4xl leading-tight sm:text-6xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                                            International Luxury
                                            <br />
                                            Wedding Planners
                                        </h1>
                                        <p className="mt-4 text-sm leading-relaxed text-[#E9D8C9] sm:text-base" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                            We craft elegant celebrations with refined visuals, premium coordination,
                                            and warm hospitality for your once-in-a-lifetime moment.
                                        </p>

                                        <div className="mt-7 flex flex-wrap gap-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                            <Link href="/packages" className="rounded-lg bg-[#B48E75] px-5 py-3 text-sm font-semibold text-white hover:bg-[#9D7A63]">
                                                Contact Us +
                                            </Link>
                                            <a href="#portfolio" className="rounded-lg border border-[#E9D7C8] px-5 py-3 text-sm font-semibold text-[#F6ECE2] hover:bg-white/10">
                                                See Works +
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                                    <div className="flex h-[250px] items-center justify-center overflow-hidden rounded-[28px] border border-[#E4D1C1] bg-[#F3E8DD]">
                                        <img
                                            src={sideImage}
                                            alt="Wedding side visual"
                                            className="h-full w-full object-cover"
                                            onError={(event) => {
                                                event.currentTarget.src = HERO_SIDE_IMAGE;
                                            }}
                                        />
                                    </div>
                                    <div className="rounded-[28px] border border-[#E4D1C1] bg-[#EFE0D2] p-6 text-center">
                                        <p className="text-xs font-semibold tracking-[0.18em] text-[#A28572] uppercase" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                            Trusted By
                                        </p>
                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                            {LANDING_STATS.map((item) => (
                                                <div key={item.label}>
                                                    <p className="text-3xl text-[#8B6850]" style={{ fontFamily: 'Playfair Display, serif' }}>{item.value}</p>
                                                    <p className="text-xs font-medium text-[#7A5F4E]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{item.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section id="about" className="px-4 pb-14 sm:px-8 lg:px-12 2xl:px-16">
                            <div className="grid items-center gap-10 lg:grid-cols-2">
                                <div>
                                    <h2 className="mt-3 text-4xl leading-tight text-[#664B3A] sm:text-5xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                                        Exclusive Service
                                        <br />
                                        For Your Wedding Party
                                    </h2>
                                    <p className="mt-5 text-base leading-relaxed text-[#775E4E]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                        {profile?.about || profile?.description ||
                                            'Ade Decoration adalah perusahaan penyedia jasa dekorasi dan event organizer profesional yang siap mewujudkan acara impian Anda. Kami berdedikasi untuk memberikan pelayanan terbaik dengan dekorasi yang indah dan profesional.'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 items-stretch gap-4">
                                    <img
                                        src={aboutGalleryOverrides[0] || featuredGallery[0].image_path}
                                        alt="Wedding gallery one"
                                        className="h-56 w-full rounded-3xl object-cover sm:h-64"
                                        onError={(event) => {
                                            event.currentTarget.src = ABOUT_GALLERY_FALLBACKS[0];
                                        }}
                                    />
                                    <img
                                        src={aboutGalleryOverrides[1] || featuredGallery[1].image_path}
                                        alt="Wedding gallery two"
                                        className="h-56 w-full rounded-3xl object-cover sm:h-64"
                                        onError={(event) => {
                                            event.currentTarget.src = ABOUT_GALLERY_FALLBACKS[1];
                                        }}
                                    />
                                </div>
                            </div>
                        </section>

                        <section id="service" className="px-4 pb-14 sm:px-8 lg:px-12 2xl:px-16">
                            <p className="text-xs font-semibold tracking-[0.18em] text-[#A48673] uppercase" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                Our Services
                            </p>
                            <h3 className="mt-2 text-4xl text-[#624837]" style={{ fontFamily: 'Playfair Display, serif' }}>
                                Crafted for Premium Celebrations
                            </h3>

                            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {featuredServices.map((service) => (
                                    <article key={service.id} className="rounded-2xl border border-[#E4D2C3] bg-[#FBF5EF] p-5">
                                        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#A68774] uppercase" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                            {service.category || 'Wedding'}
                                        </p>
                                        <h4 className="mt-1 text-2xl text-[#5F4636]" style={{ fontFamily: 'Playfair Display, serif' }}>{service.name}</h4>
                                        <p className="mt-2 text-sm leading-relaxed text-[#7C6353]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{service.description}</p>
                                        <p className="mt-3 text-sm font-semibold text-[#926D55]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                            Start from Rp {Number(service.price || 0).toLocaleString('id-ID')}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <section id="portfolio" className="px-4 pb-14 sm:px-8 lg:px-12 2xl:px-16">
                            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.18em] text-[#A48673] uppercase" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                        Our Latest Projects
                                    </p>
                                    <h3 className="mt-2 text-4xl text-[#624837]" style={{ fontFamily: 'Playfair Display, serif' }}>
                                        Portfolio Highlights
                                    </h3>
                                </div>
                                <Link href="/gallery" className="rounded-lg border border-[#D9C4B4] px-4 py-2 text-sm font-semibold text-[#7B6150]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                    Explore Gallery
                                </Link>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {featuredPortfolio.map((item, idx) => (
                                    <article key={item.id} className="overflow-hidden rounded-2xl border border-[#E4D2C3] bg-white">
                                        <img
                                            src={portfolioOverrides[idx] || item.image_url || pickImage(null, idx + 2)}
                                            alt={item.title}
                                            className="h-56 w-full object-cover"
                                            onError={(event) => {
                                                event.currentTarget.src = pickImage(null, idx + 2);
                                            }}
                                        />
                                        <div className="p-4">
                                            <p className="text-[11px] font-semibold tracking-[0.12em] text-[#A58773] uppercase" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                                {item.category || 'Wedding'}
                                            </p>
                                            <h4 className="mt-1 text-2xl text-[#5D4434]" style={{ fontFamily: 'Playfair Display, serif' }}>{item.title}</h4>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <section className="px-4 pb-14 sm:px-8 lg:px-12 2xl:px-16">
                            <div className="rounded-2xl border border-[#E4D2C3] bg-[#FBF5EF] p-6 sm:p-8">
                                <p className="text-xs font-semibold tracking-[0.18em] text-[#A48673] uppercase" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                    Testimonials
                                </p>
                                <h3 className="mt-2 text-4xl text-[#624837]" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    What Our Couples Say
                                </h3>
                                <p className="mt-4 text-base leading-relaxed text-[#705646]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                    {activeItem?.testimonial ||
                                        'Ade Decoration benar-benar wedding organizer terbaik! Dari awal konsultasi sampai hari H semuanya profesional, rapi, dan responsif. Dekorasi melebihi ekspektasi kami dan semua tamu memuji hasilnya.'}
                                </p>
                                {activeItem?.rating && (
                                    <div className="mt-3 flex gap-1 text-[#B08A56]">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <span key={index}>{index < activeItem.rating ? '★' : '☆'}</span>
                                        ))}
                                    </div>
                                )}
                                <p className="mt-4 text-sm font-semibold text-[#86634C]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                    {activeItem?.client_name || 'Andi & Sari'} - {activeItem?.event_type || 'Wedding'}
                                </p>

                                <div className="mt-5 flex gap-2">
                                    {(testimonials.length > 0 ? testimonials.slice(0, 5) : [1, 2, 3]).map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveTestimonial(idx)}
                                            className={`h-2.5 rounded-full transition ${idx === activeTestimonial ? 'w-10 bg-[#A47B62]' : 'w-2.5 bg-[#D5BFAA]'}`}
                                            aria-label={`show testimonial ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section id="contact" className="px-4 pb-14 sm:px-8 lg:px-12 2xl:px-16">
                            <div className="rounded-2xl bg-[#6C4D3B] p-8 text-[#F6EDE3] sm:p-10">
                                <h3 className="text-4xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    Let&apos;s Plan Your Next Event Together
                                </h3>
                                <p className="mt-3 text-sm text-[#E6D8CB]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                    {profile?.address || 'Jl. Merdeka No. 123, Jakarta Pusat, Indonesia'}
                                </p>

                                <div className="mt-6 flex flex-wrap gap-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                    <a
                                        href="https://wa.me/6281234567890"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-lg bg-[#E7D8C8] px-5 py-3 text-sm font-semibold text-[#6C4D3B]"
                                    >
                                        Schedule Consultation
                                    </a>
                                    <Link href="/packages" className="rounded-lg border border-[#D8C2B0] px-5 py-3 text-sm font-semibold text-[#F4E8DE]">
                                        View Packages
                                    </Link>
                                </div>
                            </div>
                        </section>
                </main>

            </PublicLayout>
        </>
    );
};

export default HomePage;
