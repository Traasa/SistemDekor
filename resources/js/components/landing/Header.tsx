import { Link, router, usePage } from '@inertiajs/react';
import React from 'react';

interface HeaderProps {
    isScrolled: boolean;
    companyName: string;
}

export const Header: React.FC<HeaderProps> = ({ isScrolled, companyName }) => {
    const { auth } = usePage<{ auth: { user: { id: number; name: string; email: string; role: string } } }>().props;
    const user = auth?.user;

    const handleLogout = async () => {
        try {
            router.post('/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
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
                            {companyName}
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
                            Paket
                        </Link>
                        <Link
                            href="/gallery"
                            className={`font-medium transition-all duration-300 ${isScrolled ? 'text-gray-700 hover:text-[#D4AF37]' : 'text-white drop-shadow hover:text-[#F4D03F]'} hover:scale-105`}
                        >
                            Gallery
                        </Link>
                        <a
                            href="#services"
                            className={`font-medium transition-all duration-300 ${isScrolled ? 'text-gray-700 hover:text-[#D4AF37]' : 'text-white drop-shadow hover:text-[#F4D03F]'} hover:scale-105`}
                        >
                            Layanan
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
    );
};
