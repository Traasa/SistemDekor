import { Link } from '@inertiajs/react';
import React from 'react';

export const AboutSection: React.FC = () => {
    return (
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
                            <span className="bg-gradient-to-r from-[#D4AF37] to-[#EC4899] bg-clip-text text-transparent">Abadikan Momen Cinta</span>
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
                                        Tim profesional kami siap membantu mewujudkan pernikahan impian Anda dengan sempurna dari awal hingga akhir.
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
    );
};
