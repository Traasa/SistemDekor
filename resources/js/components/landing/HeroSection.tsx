import { Link } from '@inertiajs/react';
import React from 'react';

export const HeroSection: React.FC = () => {
    return (
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
                            <span className="bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#EC4899] bg-clip-text text-transparent">Perfect</span>{' '}
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
    );
};
