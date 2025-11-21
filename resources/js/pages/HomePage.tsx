import { Link, router, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { CompanyProfile, companyProfileService } from '../services/companyProfileService';

const HomePage: React.FC = () => {
    const [profile, setProfile] = useState<CompanyProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const { auth } = usePage<{ auth: { user: { id: number; name: string; email: string; role: string } } }>().props;
    const user = auth?.user;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await companyProfileService.getProfile();
                if (response.success) {
                    setProfile(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch company profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);

        // Auto-rotate testimonials
        const testimonialInterval = setInterval(() => {
            setActiveTestimonial((prev) => (prev + 1) % 3);
        }, 5000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(testimonialInterval);
        };
    }, []);

    const handleLogout = async () => {
        try {
            router.post('/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#FFF8F0] via-[#F5F1E8] to-[#FFE4E6]">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 animate-spin rounded-full border-t-4 border-b-4 border-[#D4AF37]"></div>
                    <p className="mt-6 font-serif text-xl text-gray-600">Loading Your Perfect Day...</p>
                </div>
            </div>
        );
    }

    const testimonials = [
        {
            name: 'Sarah & Michael',
            text: 'Pernikahan kami sempurna! Tim Diamond Weddings sangat profesional dan detail. Terima kasih sudah mewujudkan impian kami!',
            rating: 5,
            date: 'Juni 2024',
        },
        {
            name: 'Dinda & Arya',
            text: 'Pelayanan yang luar biasa! Dari konsultasi hingga hari H, semuanya berjalan lancar. Highly recommended!',
            rating: 5,
            date: 'Agustus 2024',
        },
        {
            name: 'Lisa & Ryan',
            text: 'Dekorasi yang indah dan tim yang sangat membantu. Wedding kami jadi memorable banget!',
            rating: 5,
            date: 'Oktober 2024',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#F5F1E8] to-[#FFE4E6]">
            {/* Header */}
            <header
                className={`fixed top-0 z-50 w-full transition-all duration-500 ${isScrolled ? 'bg-white/95 shadow-lg backdrop-blur-md' : 'bg-transparent'}`}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <Link href="/" className="group flex items-center space-x-3">
                            <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#F4D03F] to-[#EC4899] p-0.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                                    <span className="font-serif text-2xl font-bold text-[#D4AF37]">D</span>
                                </div>
                            </div>
                            <span
                                className={`font-serif text-2xl font-bold transition-colors duration-300 ${isScrolled ? 'text-gray-900' : 'text-white drop-shadow-lg'}`}
                            >
                                {profile?.company_name || 'Diamond Weddings'}
                            </span>
                        </Link>

                        <nav className="hidden items-center space-x-8 md:flex">
                            <a
                                href="#home"
                                className={`font-medium transition-all duration-300 ${isScrolled ? 'text-gray-700 hover:text-[#D4AF37]' : 'text-white drop-shadow hover:text-[#F4D03F]'} hover:scale-105`}
                            >
                                Beranda
                            </a>
                            <a
                                href="#about"
                                className={`font-medium transition-all duration-300 ${isScrolled ? 'text-gray-700 hover:text-[#D4AF37]' : 'text-white drop-shadow hover:text-[#F4D03F]'} hover:scale-105`}
                            >
                                Tentang
                            </a>
                            <Link
                                href="/packages"
                                className={`font-medium transition-all duration-300 ${isScrolled ? 'text-gray-700 hover:text-[#D4AF37]' : 'text-white drop-shadow hover:text-[#F4D03F]'} hover:scale-105`}
                            >
                                Paket Wedding
                            </Link>
                            <a
                                href="#services"
                                className={`font-medium transition-all duration-300 ${isScrolled ? 'text-gray-700 hover:text-[#D4AF37]' : 'text-white drop-shadow hover:text-[#F4D03F]'} hover:scale-105`}
                            >
                                Layanan
                            </a>
                            <a
                                href="#gallery"
                                className={`font-medium transition-all duration-300 ${isScrolled ? 'text-gray-700 hover:text-[#D4AF37]' : 'text-white drop-shadow hover:text-[#F4D03F]'} hover:scale-105`}
                            >
                                Galeri
                            </a>
                            <a
                                href="#contact"
                                className={`font-medium transition-all duration-300 ${isScrolled ? 'text-gray-700 hover:text-[#D4AF37]' : 'text-white drop-shadow hover:text-[#F4D03F]'} hover:scale-105`}
                            >
                                Kontak
                            </a>

                            {user ? (
                                <div className="flex items-center space-x-4">
                                    {user.role === 'admin' && (
                                        <Link
                                            href="/admin"
                                            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                        >
                                            <span className="relative z-10">Admin Panel</span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#B8941F] to-[#D4AF37] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                        </Link>
                                    )}
                                    {user.role === 'user' && (
                                        <Link
                                            href="/my-orders"
                                            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#EC4899] to-[#F472B6] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                        >
                                            <span className="relative z-10">My Orders</span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#DB2777] to-[#EC4899] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className={`text-sm font-medium transition-colors ${isScrolled ? 'text-gray-700 hover:text-red-600' : 'text-white drop-shadow hover:text-red-400'}`}
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href="/login"
                                        className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                    >
                                        <span className="relative z-10">Login</span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#B8941F] to-[#D4AF37] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                    </Link>
                                    <Link
                                        href="/register"
                                        className={`rounded-full border-2 px-6 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                                            isScrolled
                                                ? 'border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white'
                                                : 'border-white text-white hover:bg-white hover:text-[#D4AF37]'
                                        }`}
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section with Video Background */}
            <section id="home" className="relative min-h-screen overflow-hidden">
                {/* Animated Background with Gradient Overlay */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a]"></div>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMi4yMDktMS43OTEtNC00LTRzLTQgMS43OTEtNCA0IDEuNzkxIDQgNCA0IDQtMS43OTEgNC00em0wIDMwYzAtMi4yMDktMS43OTEtNC00LTRzLTQgMS43OTEtNCA0IDEuNzkxIDQgNCA0IDQtMS43OTEgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

                    {/* Animated Particles */}
                    <div className="absolute top-20 -left-20 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-[#D4AF37]/30 to-[#F4D03F]/20 blur-3xl"></div>
                    <div className="animation-delay-2000 absolute -right-20 bottom-20 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-[#EC4899]/30 to-[#D4AF37]/20 blur-3xl"></div>
                    <div className="animation-delay-4000 absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#F4D03F]/20 to-[#EC4899]/20 blur-3xl"></div>
                </div>

                <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-20">
                    <div className="animate-fade-in-up text-center">
                        {/* Main Heading */}
                        <div className="mb-6 overflow-hidden">
                            <h1 className="animate-slide-down font-serif text-6xl font-bold text-white drop-shadow-2xl sm:text-7xl md:text-8xl lg:text-9xl">
                                Your{' '}
                                <span className="bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#EC4899] bg-clip-text text-transparent">
                                    Perfect
                                </span>{' '}
                                Day
                            </h1>
                        </div>

                        <div className="mb-4 overflow-hidden">
                            <h2 className="animate-slide-up animation-delay-300 font-serif text-3xl font-light text-white/90 drop-shadow-lg sm:text-4xl md:text-5xl">
                                Starts Here
                            </h2>
                        </div>

                        <p className="animate-fade-in animation-delay-600 mx-auto mb-12 max-w-2xl px-4 text-lg text-white/80 drop-shadow-lg sm:text-xl">
                            Wujudkan pernikahan impian Anda dengan dekorasi eksklusif dan layanan terpadu dari Diamond Weddings
                        </p>

                        {/* CTA Buttons */}
                        <div className="animate-fade-in animation-delay-900 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link
                                href="/packages"
                                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#D4AF37] px-10 py-4 font-bold text-white shadow-2xl transition-all duration-500 hover:scale-110 hover:shadow-[#D4AF37]/50"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <span className="text-xl">💍</span>
                                    Lihat Paket Wedding
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#F4D03F] to-[#D4AF37] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                            </Link>

                            <a
                                href="#about"
                                className="group relative overflow-hidden rounded-full border-2 border-white/50 bg-white/10 px-10 py-4 font-bold text-white backdrop-blur-sm transition-all duration-500 hover:scale-110 hover:border-white hover:bg-white hover:text-gray-900"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <span className="text-xl">✨</span>
                                    Pelajari Lebih Lanjut
                                </span>
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="animate-fade-in animation-delay-1200 mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
                            <div className="group text-center transition-transform duration-300 hover:scale-110">
                                <div className="text-4xl font-bold text-white drop-shadow-lg sm:text-5xl">500+</div>
                                <div className="mt-2 text-sm text-white/70 sm:text-base">Klien Bahagia</div>
                            </div>
                            <div className="h-12 w-px bg-white/30"></div>
                            <div className="group text-center transition-transform duration-300 hover:scale-110">
                                <div className="text-4xl font-bold text-white drop-shadow-lg sm:text-5xl">10+</div>
                                <div className="mt-2 text-sm text-white/70 sm:text-base">Tahun Pengalaman</div>
                            </div>
                            <div className="h-12 w-px bg-white/30"></div>
                            <div className="group text-center transition-transform duration-300 hover:scale-110">
                                <div className="text-4xl font-bold text-white drop-shadow-lg sm:text-5xl">100%</div>
                                <div className="mt-2 text-sm text-white/70 sm:text-base">Kepuasan</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
                    <a href="#about" className="flex flex-col items-center gap-2 text-white/70 transition-colors hover:text-white">
                        <span className="text-sm font-medium">Scroll Down</span>
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </a>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/4 left-0 h-1 w-32 bg-gradient-to-r from-transparent to-[#D4AF37]/50"></div>
                <div className="absolute right-0 bottom-1/3 h-1 w-32 bg-gradient-to-l from-transparent to-[#EC4899]/50"></div>
            </section>

            {/* About Section */}
            <section id="about" className="relative overflow-hidden bg-gradient-to-br from-[#FFF8F0] via-[#F5F1E8] to-[#FFE4E6] py-24">
                {/* Decorative Background */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-transparent blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-gradient-to-tr from-[#EC4899]/20 to-transparent blur-3xl"></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        {/* Image Grid with Hover Effects */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="group hover:shadow-3xl relative aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/90 to-[#EC4899]/90"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center text-white">
                                        <div className="text-6xl font-bold">💐</div>
                                        <p className="mt-4 font-serif text-xl">Dekorasi Premium</p>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                            </div>

                            <div className="group hover:shadow-3xl relative mt-12 aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#F4D03F]/90 to-[#D4AF37]/90"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center text-white">
                                        <div className="text-6xl font-bold">🎊</div>
                                        <p className="mt-4 font-serif text-xl">Setup Profesional</p>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-6">
                            <div className="inline-block">
                                <span className="rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] px-4 py-2 text-sm font-bold text-white">
                                    TENTANG KAMI
                                </span>
                            </div>

                            <h2 className="font-serif text-4xl leading-tight font-bold text-gray-900 md:text-5xl lg:text-6xl">
                                Wujudkan Keindahan,
                                <br />
                                <span className="bg-gradient-to-r from-[#D4AF37] to-[#EC4899] bg-clip-text text-transparent">
                                    Abadikan Momen Cinta
                                </span>
                            </h2>

                            <p className="text-lg leading-relaxed text-gray-700">
                                Selamat datang di <span className="font-bold text-[#D4AF37]">Diamond Weddings</span>, event organizer yang berdedikasi
                                untuk mewujudkan pernikahan impian Anda dengan sempurna. Dengan pengalaman lebih dari 10 tahun, kami telah membantu
                                ratusan pasangan menciptakan momen tak terlupakan.
                            </p>

                            <div className="space-y-6">
                                <div className="group flex items-start space-x-4 transition-transform duration-300 hover:translate-x-2">
                                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] text-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                        ✨
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Kami Siap Mewujudkannya</h3>
                                        <p className="mt-1 text-gray-600">
                                            Tim profesional kami siap membantu mewujudkan pernikahan impian Anda dengan sempurna dari awal hingga
                                            akhir.
                                        </p>
                                    </div>
                                </div>

                                <div className="group flex items-start space-x-4 transition-transform duration-300 hover:translate-x-2">
                                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#F472B6] text-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                        💐
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Perencanaan Pribadi</h3>
                                        <p className="mt-1 text-gray-600">
                                            Setiap detail dirancang khusus sesuai dengan visi, harapan, dan budget Anda yang unik.
                                        </p>
                                    </div>
                                </div>

                                <div className="group flex items-start space-x-4 transition-transform duration-300 hover:translate-x-2">
                                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] text-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                        👥
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Koordinasi Vendor</h3>
                                        <p className="mt-1 text-gray-600">
                                            Kami bekerja sama dengan vendor terbaik untuk memastikan kualitas layanan premium di setiap aspek.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Link
                                    href="/packages"
                                    className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] px-8 py-4 font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                                >
                                    <span>Lihat Paket Lengkap</span>
                                    <svg
                                        className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="relative overflow-hidden bg-white py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <span className="inline-block rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] px-4 py-2 text-sm font-bold text-white">
                            LAYANAN KAMI
                        </span>
                        <h2 className="mt-4 font-serif text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl">
                            Layanan <span className="bg-gradient-to-r from-[#D4AF37] to-[#EC4899] bg-clip-text text-transparent">Premium</span>
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                            Berbagai layanan lengkap dan profesional untuk pernikahan impian Anda
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {/* Service Card 1 */}
                        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF8F0] to-[#FFE4E6] p-8 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-transparent blur-2xl"></div>
                            <div className="relative">
                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] text-4xl text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                                    🏛️
                                </div>
                                <h3 className="mb-3 font-serif text-2xl font-bold text-gray-900">Desain Acara</h3>
                                <p className="leading-relaxed text-gray-700">
                                    Tim desainer kami menciptakan konsep visual yang memukau untuk menghadirkan suasana pernikahan yang tak terlupakan
                                    di hari istimewa Anda.
                                </p>
                                <div className="mt-6 flex items-center gap-2 font-semibold text-[#D4AF37] transition-transform duration-300 group-hover:translate-x-2">
                                    <span>Pelajari Lebih Lanjut</span>
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Service Card 2 */}
                        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF0F6] to-[#FCE7F3] p-8 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#EC4899]/20 to-transparent blur-2xl"></div>
                            <div className="relative">
                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#F472B6] text-4xl text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                                    💐
                                </div>
                                <h3 className="mb-3 font-serif text-2xl font-bold text-gray-900">Dekorasi Premium</h3>
                                <p className="leading-relaxed text-gray-700">
                                    Bunga segar, lighting elegan, dan dekorasi mewah yang disesuaikan dengan tema pernikahan Anda untuk menciptakan
                                    atmosfer yang sempurna.
                                </p>
                                <div className="mt-6 flex items-center gap-2 font-semibold text-[#EC4899] transition-transform duration-300 group-hover:translate-x-2">
                                    <span>Pelajari Lebih Lanjut</span>
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Service Card 3 */}
                        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] p-8 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#8B5CF6]/20 to-transparent blur-2xl"></div>
                            <div className="relative">
                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] text-4xl text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                                    👥
                                </div>
                                <h3 className="mb-3 font-serif text-2xl font-bold text-gray-900">Koordinasi Vendor</h3>
                                <p className="leading-relaxed text-gray-700">
                                    Kami mengelola seluruh aspek acara dengan vendor terpercaya dan berpengalaman untuk memastikan hari H berjalan
                                    sempurna tanpa hambatan.
                                </p>
                                <div className="mt-6 flex items-center gap-2 font-semibold text-[#8B5CF6] transition-transform duration-300 group-hover:translate-x-2">
                                    <span>Pelajari Lebih Lanjut</span>
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Service Card 4 */}
                        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF8F0] to-[#FEFCE8] p-8 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#F59E0B]/20 to-transparent blur-2xl"></div>
                            <div className="relative">
                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] text-4xl text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                                    🎭
                                </div>
                                <h3 className="mb-3 font-serif text-2xl font-bold text-gray-900">Koordinasi Hari-H</h3>
                                <p className="leading-relaxed text-gray-700">
                                    Di hari spesial Anda, tim kami memastikan setiap jadwal dan alur acara berjalan lancar sesuai rencana, agar Anda
                                    dapat fokus menikmati momen berharga.
                                </p>
                                <div className="mt-6 flex items-center gap-2 font-semibold text-[#F59E0B] transition-transform duration-300 group-hover:translate-x-2">
                                    <span>Pelajari Lebih Lanjut</span>
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Service Card 5 */}
                        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5] p-8 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#10B981]/20 to-transparent blur-2xl"></div>
                            <div className="relative">
                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10B981] to-[#34D399] text-4xl text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                                    📋
                                </div>
                                <h3 className="mb-3 font-serif text-2xl font-bold text-gray-900">Desain Konsep</h3>
                                <p className="leading-relaxed text-gray-700">
                                    Dari desain undangan hingga konsep dekorasi, kami menghadirkan identitas visual yang kohesif dan memukau untuk
                                    keseluruhan acara Anda.
                                </p>
                                <div className="mt-6 flex items-center gap-2 font-semibold text-[#10B981] transition-transform duration-300 group-hover:translate-x-2">
                                    <span>Pelajari Lebih Lanjut</span>
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Service Card 6 */}
                        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] p-8 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#3B82F6]/20 to-transparent blur-2xl"></div>
                            <div className="relative">
                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] text-4xl text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                                    🎉
                                </div>
                                <h3 className="mb-3 font-serif text-2xl font-bold text-gray-900">Entertainment</h3>
                                <p className="leading-relaxed text-gray-700">
                                    Tim berpengalaman kami akan mengkoordinasikan seluruh rundown acara, memastikan semuanya berjalan sempurna sesuai
                                    jadwal yang telah direncanakan.
                                </p>
                                <div className="mt-6 flex items-center gap-2 font-semibold text-[#3B82F6] transition-transform duration-300 group-hover:translate-x-2">
                                    <span>Pelajari Lebih Lanjut</span>
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] py-24">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-[#D4AF37]/10 blur-3xl"></div>
                    <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-[#EC4899]/10 blur-3xl"></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <span className="inline-block rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] px-4 py-2 text-sm font-bold text-white">
                            TESTIMONI
                        </span>
                        <h2 className="mt-4 font-serif text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                            Kata <span className="bg-gradient-to-r from-[#D4AF37] to-[#EC4899] bg-clip-text text-transparent">Mereka</span>
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
                            Dengarkan cerita dari pasangan yang telah mempercayakan hari istimewa mereka kepada kami
                        </p>
                    </div>

                    <div className="relative">
                        <div className="overflow-hidden rounded-3xl bg-white/5 p-12 backdrop-blur-sm">
                            <div className="transition-all duration-500">
                                <div className="mb-8 flex justify-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] text-4xl text-white shadow-xl">
                                        ❝
                                    </div>
                                </div>
                                <p className="mb-8 text-center font-serif text-2xl leading-relaxed text-white md:text-3xl">
                                    {testimonials[activeTestimonial].text}
                                </p>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-[#D4AF37]">{testimonials[activeTestimonial].name}</p>
                                    <p className="mt-1 text-white/60">{testimonials[activeTestimonial].role}</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Dots */}
                        <div className="mt-8 flex justify-center gap-3">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTestimonial(index)}
                                    className={`h-3 rounded-full transition-all duration-300 ${
                                        index === activeTestimonial
                                            ? 'w-12 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F]'
                                            : 'w-3 bg-white/30 hover:bg-white/50'
                                    }`}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative overflow-hidden bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#EC4899] py-24">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAgMzBjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
                <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="font-serif text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                        Wujudkan Momen Bahagia yang Selalu Anda Impikan
                    </h2>
                    <p className="mt-6 text-xl text-white/90 md:text-2xl">Mari bersama kami ciptakan pernikahan yang tak terlupakan</p>
                    <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link
                            href="/packages"
                            className="group relative overflow-hidden rounded-full bg-white px-10 py-4 font-bold text-[#D4AF37] shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-white/50"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <span className="text-2xl">💍</span>
                                Lihat Paket Wedding
                            </span>
                        </Link>
                        <a
                            href="#contact"
                            className="group relative overflow-hidden rounded-full border-2 border-white bg-white/10 px-10 py-4 font-bold text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white hover:text-[#D4AF37]"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <span className="text-2xl">📞</span>
                                Hubungi Kami
                            </span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="relative overflow-hidden bg-gradient-to-br from-[#FFF8F0] via-[#F5F1E8] to-[#FFE4E6] py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <span className="inline-block rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] px-4 py-2 text-sm font-bold text-white">
                            HUBUNGI KAMI
                        </span>
                        <h2 className="mt-4 font-serif text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl">
                            Mari <span className="bg-gradient-to-r from-[#D4AF37] to-[#EC4899] bg-clip-text text-transparent">Berdiskusi</span>
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">Siap membantu mewujudkan pernikahan impian Anda</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        <div className="group text-center transition-transform duration-300 hover:-translate-y-2">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] text-3xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                📞
                            </div>
                            <h3 className="mb-3 font-bold text-gray-900">Telepon</h3>
                            <p className="text-gray-600">+62 812-3456-7890</p>
                            <p className="mt-2 text-sm text-gray-500">Senin - Sabtu</p>
                        </div>

                        <div className="group text-center transition-transform duration-300 hover:-translate-y-2">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#F472B6] text-3xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                📧
                            </div>
                            <h3 className="mb-3 font-bold text-gray-900">Email</h3>
                            <p className="text-gray-600">info@diamondweddings.com</p>
                            <p className="mt-2 text-sm text-gray-500">24/7 Response</p>
                        </div>

                        <div className="group text-center transition-transform duration-300 hover:-translate-y-2">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] text-3xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                💬
                            </div>
                            <h3 className="mb-3 font-bold text-gray-900">WhatsApp</h3>
                            <p className="text-gray-600">+62 812-3456-7890</p>
                            <p className="mt-2 text-sm text-gray-500">Chat Langsung</p>
                        </div>

                        <div className="group text-center transition-transform duration-300 hover:-translate-y-2">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] text-3xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                📍
                            </div>
                            <h3 className="mb-3 font-bold text-gray-900">Lokasi</h3>
                            <p className="text-gray-600">Jakarta, Indonesia</p>
                            <p className="mt-2 text-sm text-gray-500">Kunjungi Showroom</p>
                        </div>

                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EC4899]/10">
                                <span className="text-3xl">📧</span>
                            </div>
                            <h3 className="mb-2 font-semibold text-gray-900">Email</h3>
                            <p className="text-gray-600">{profile?.email || 'info@diamondweddings.com'}</p>
                        </div>

                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#8B5CF6]/10">
                                <span className="text-3xl">📍</span>
                            </div>
                            <h3 className="mb-2 font-semibold text-gray-900">Alamat</h3>
                            <p className="text-gray-600">{profile?.address || 'Jakarta, Indonesia'}</p>
                        </div>

                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#10B981]/10">
                                <span className="text-3xl">💬</span>
                            </div>
                            <h3 className="mb-2 font-semibold text-gray-900">WhatsApp</h3>
                            <p className="text-gray-600">{profile?.phone || '+62 812 3456 7890'}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gradient-to-br from-gray-900 to-black py-12 text-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                        {/* Brand */}
                        <div>
                            <div className="mb-4 flex items-center space-x-3">
                                <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#F4D03F] to-[#EC4899] p-0.5">
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-900">
                                        <span className="font-serif text-2xl font-bold text-[#D4AF37]">D</span>
                                    </div>
                                </div>
                                <span className="font-serif text-xl font-bold">Diamond Weddings</span>
                            </div>
                            <p className="text-sm text-gray-400">
                                Mewujudkan pernikahan impian Anda dengan layanan terpadu dan dekorasi eksklusif sejak 2014.
                            </p>
                            <div className="mt-6 flex gap-4">
                                <a
                                    href="#"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#F4D03F]"
                                >
                                    <span className="text-xl">📘</span>
                                </a>
                                <a
                                    href="#"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#F4D03F]"
                                >
                                    <span className="text-xl">📷</span>
                                </a>
                                <a
                                    href="#"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#F4D03F]"
                                >
                                    <span className="text-xl">🐦</span>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="mb-4 font-bold text-[#D4AF37]">Quick Links</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href="/" className="text-gray-400 transition-colors hover:text-[#D4AF37]">
                                        Beranda
                                    </Link>
                                </li>
                                <li>
                                    <a href="#about" className="text-gray-400 transition-colors hover:text-[#D4AF37]">
                                        Tentang Kami
                                    </a>
                                </li>
                                <li>
                                    <a href="#services" className="text-gray-400 transition-colors hover:text-[#D4AF37]">
                                        Layanan
                                    </a>
                                </li>
                                <li>
                                    <Link href="/packages" className="text-gray-400 transition-colors hover:text-[#D4AF37]">
                                        Paket Wedding
                                    </Link>
                                </li>
                                <li>
                                    <a href="#contact" className="text-gray-400 transition-colors hover:text-[#D4AF37]">
                                        Hubungi Kami
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Services */}
                        <div>
                            <h4 className="mb-4 font-bold text-[#D4AF37]">Layanan</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>Desain & Konsep Acara</li>
                                <li>Dekorasi Premium</li>
                                <li>Koordinasi Vendor</li>
                                <li>Koordinasi Hari-H</li>
                                <li>Undangan & Desain</li>
                                <li>Entertainment</li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h4 className="mb-4 font-bold text-[#D4AF37]">Kontak</h4>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li className="flex items-start gap-2">
                                    <span>📞</span>
                                    <span>+62 812-3456-7890</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>📧</span>
                                    <span>info@diamondweddings.com</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>📍</span>
                                    <span>Jakarta, Indonesia</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>⏰</span>
                                    <span>Sen - Sab: 09:00 - 18:00</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 border-t border-white/10 pt-8 text-center">
                        <p className="text-sm text-gray-400">© 2024 Diamond Weddings. All rights reserved. | Powered by Love & Dedication 💍</p>
                    </div>
                </div>
            </footer>

            {/* CSS Animations */}
            <style>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .animate-fade-in-up {
                    animation: fade-in-up 1s ease-out forwards;
                }

                .animate-slide-down {
                    animation: slide-down 1s ease-out forwards;
                }

                .animate-slide-up {
                    animation: slide-up 1s ease-out forwards;
                }

                .animate-fade-in {
                    animation: fade-in 1s ease-out forwards;
                }

                .animation-delay-300 {
                    animation-delay: 300ms;
                }

                .animation-delay-600 {
                    animation-delay: 600ms;
                }

                .animation-delay-900 {
                    animation-delay: 900ms;
                }

                .animation-delay-1200 {
                    animation-delay: 1200ms;
                }

                .animation-delay-2000 {
                    animation-delay: 2s;
                }

                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

export default HomePage;
