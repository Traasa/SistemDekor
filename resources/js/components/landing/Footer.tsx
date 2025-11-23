import { Link } from '@inertiajs/react';
import React from 'react';

export const Footer: React.FC = () => {
    return (
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
                                <Link href="/gallery" className="text-gray-400 transition-colors hover:text-[#D4AF37]">
                                    Gallery
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
    );
};
