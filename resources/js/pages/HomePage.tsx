import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CompanyProfile, companyProfileService } from '../services/companyProfileService';

export const HomePage: React.FC = () => {
    const [profile, setProfile] = useState<CompanyProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, logout } = useAuth();

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
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F5F1E8]">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#D4AF37]"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F1E8]">
            {/* Header */}
            <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#EC4899] p-0.5">
                                <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                                    <span className="font-serif text-xl font-bold text-[#D4AF37]">D</span>
                                </div>
                            </div>
                            <span className={`font-serif text-2xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                                {profile?.company_name || 'Diamond Weddings'}
                            </span>
                        </Link>

                        <nav className="hidden items-center space-x-8 md:flex">
                            <a
                                href="#home"
                                className={`transition-colors ${isScrolled ? 'text-gray-700 hover:text-[#D4AF37]' : 'text-white hover:text-[#D4AF37]'}`}
                            >
                                Beranda
                            </a>
                            <a
                                href="#about"
                                className={`transition-colors ${isScrolled ? 'text-gray-700 hover:text-[#D4AF37]' : 'text-white hover:text-[#D4AF37]'}`}
                            >
                                Tentang
                            </a>
                            <a
                                href="#services"
                                className={`transition-colors ${isScrolled ? 'text-gray-700 hover:text-[#D4AF37]' : 'text-white hover:text-[#D4AF37]'}`}
                            >
                                Layanan
                            </a>
                            <a
                                href="#gallery"
                                className={`transition-colors ${isScrolled ? 'text-gray-700 hover:text-[#D4AF37]' : 'text-white hover:text-[#D4AF37]'}`}
                            >
                                Galeri
                            </a>
                            <a
                                href="#contact"
                                className={`transition-colors ${isScrolled ? 'text-gray-700 hover:text-[#D4AF37]' : 'text-white hover:text-[#D4AF37]'}`}
                            >
                                Kontak
                            </a>

                            {user ? (
                                <div className="flex items-center space-x-4">
                                    {user.role === 'admin' && (
                                        <Link
                                            to="/admin"
                                            className="rounded-full bg-[#D4AF37] px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-[#B8941F]"
                                        >
                                            Admin Panel
                                        </Link>
                                    )}
                                    {user.role === 'user' && (
                                        <Link
                                            to="/my-transactions"
                                            className="rounded-full bg-[#EC4899] px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-[#DB2777]"
                                        >
                                            My Orders
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className={`text-sm ${isScrolled ? 'text-gray-700 hover:text-red-600' : 'text-white hover:text-red-400'}`}
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="rounded-full bg-[#D4AF37] px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-[#B8941F]"
                                >
                                    Hubungi Kami
                                </Link>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section id="home" className="relative min-h-screen">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            'url(\'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"%3E%3Crect fill="%23E8D5C4" width="1920" height="1080"/%3E%3C/svg%3E\')',
                    }}
                >
                    <div className="hero-gradient absolute inset-0"></div>
                </div>

                <div className="relative flex min-h-screen items-center justify-center px-4 pt-20">
                    <div className="text-center">
                        <h1 className="text-shadow font-serif text-5xl font-bold text-white sm:text-6xl md:text-7xl lg:text-8xl">Diamond Weddings</h1>
                        <p className="text-shadow mt-4 font-serif text-xl text-white sm:text-2xl md:text-3xl">One Stop Wedding Services</p>
                        <div className="mt-8">
                            <a
                                href="#about"
                                className="inline-block rounded-full bg-white px-8 py-3 font-semibold text-gray-900 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                            >
                                Pelajari Lebih Lanjut
                            </a>
                        </div>
                    </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full border-4 border-white/30"></div>
                <div className="absolute top-1/3 right-1/4 h-48 w-48 rounded-full border-4 border-white/30"></div>
                <div className="absolute bottom-1/4 left-1/3 h-40 w-40 rounded-full border-4 border-white/30"></div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        {/* Image Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="aspect-[3/4] overflow-hidden rounded-3xl bg-[#E8D5C4]">
                                <img
                                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'%3E%3Crect fill='%23E8D5C4' width='400' height='500'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23fff' font-size='20' font-family='Arial'%3EWedding Decor%3C/text%3E%3C/svg%3E"
                                    alt="Wedding decoration"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="mt-8 aspect-[3/4] overflow-hidden rounded-3xl bg-[#E8D5C4]">
                                <img
                                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'%3E%3Crect fill='%23E8D5C4' width='400' height='500'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23fff' font-size='20' font-family='Arial'%3EFloral Setup%3C/text%3E%3C/svg%3E"
                                    alt="Floral decoration"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <h2 className="font-serif text-4xl font-bold text-gray-900 md:text-5xl">
                                Wujudkan Keindahan,
                                <br />
                                <span className="text-[#D4AF37]">Abadikan Momen Cinta</span>
                            </h2>
                            <p className="mt-6 text-lg leading-relaxed text-gray-700">
                                Selamat datang di Diamond Weddings, event organizer yang berdedikasi untuk mewujudkan pernikahan impian Anda dengan
                                sempurna.
                            </p>
                            <div className="mt-8 space-y-4">
                                <div className="flex items-start space-x-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/10">
                                        <span className="text-2xl">✨</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Kami Siap Mewujudkannya</h3>
                                        <p className="text-gray-600">
                                            Tim profesional kami siap membantu mewujudkan pernikahan impian Anda dengan sempurna.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#EC4899]/10">
                                        <span className="text-2xl">💐</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Perencanaan Pribadi</h3>
                                        <p className="text-gray-600">Setiap detail dirancang khusus sesuai dengan visi dan harapan Anda.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#8B5CF6]/10">
                                        <span className="text-2xl">👥</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Koordinasi Vendor</h3>
                                        <p className="text-gray-600">
                                            Kami bekerja sama dengan vendor terbaik untuk memastikan kualitas layanan terbaik.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="bg-white py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="font-serif text-4xl font-bold text-gray-900 md:text-5xl">Layanan Kami</h2>
                        <p className="mt-4 text-lg text-gray-600">Berbagai layanan lengkap untuk pernikahan impian Anda</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {/* Service Card 1 */}
                        <div className="group overflow-hidden rounded-3xl bg-[#F5F1E8] p-8 transition-all hover:shadow-xl">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8941F] text-3xl text-white">
                                🏛️
                            </div>
                            <h3 className="mb-3 font-serif text-2xl font-bold text-gray-900">Desain Acara</h3>
                            <p className="text-gray-700">
                                Tim desainer kami menciptakan konsep visual yang memukau untuk menghadirkan suasana pernikahan yang tak terlupakan
                                hari istimewa Anda.
                            </p>
                        </div>

                        {/* Service Card 2 */}
                        <div className="group overflow-hidden rounded-3xl bg-[#F5F1E8] p-8 transition-all hover:shadow-xl">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#DB2777] text-3xl text-white">
                                💐
                            </div>
                            <h3 className="mb-3 font-serif text-2xl font-bold text-gray-900">Perencanaan Pribadi</h3>
                            <p className="text-gray-700">
                                Setiap layak cinta itu berbeda. Kami membantu Anda merencanakan setiap detail dengan via koi meja, lokasi, hingga
                                dekorasi terbaik sesuai tema impian.
                            </p>
                        </div>

                        {/* Service Card 3 */}
                        <div className="group overflow-hidden rounded-3xl bg-[#F5F1E8] p-8 transition-all hover:shadow-xl">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-3xl text-white">
                                👥
                            </div>
                            <h3 className="mb-3 font-serif text-2xl font-bold text-gray-900">Koordinasi Vendor</h3>
                            <p className="text-gray-700">
                                Kami mengelola seluruh aspek acara dengan vendor terpercaya dan berpengalaman untuk memastikan hari H berjalan
                                sempurna tanpa hambatan.
                            </p>
                        </div>

                        {/* Service Card 4 */}
                        <div className="group overflow-hidden rounded-3xl bg-[#F5F1E8] p-8 transition-all hover:shadow-xl">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-3xl text-white">
                                🎭
                            </div>
                            <h3 className="mb-3 font-serif text-2xl font-bold text-gray-900">Koordinasi Hari-H</h3>
                            <p className="text-gray-700">
                                Di hari spesial Anda, tim kami memastikan setiap jadwal dan alur acara berjalan lancar sesuai rencana, agar Anda dapat
                                fokus menikmati momen berharga.
                            </p>
                        </div>

                        {/* Service Card 5 */}
                        <div className="group overflow-hidden rounded-3xl bg-[#F5F1E8] p-8 transition-all hover:shadow-xl">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] text-3xl text-white">
                                📋
                            </div>
                            <h3 className="mb-3 font-serif text-2xl font-bold text-gray-900">Desain Konsep</h3>
                            <p className="text-gray-700">
                                Dari desain undangan hingga konsep dekorasi, kami menghadirkan identitas visual yang kohesif dan memukau untuk
                                keseluruhan acara Anda.
                            </p>
                        </div>

                        {/* Service Card 6 */}
                        <div className="group overflow-hidden rounded-3xl bg-[#F5F1E8] p-8 transition-all hover:shadow-xl">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-3xl text-white">
                                🎉
                            </div>
                            <h3 className="mb-3 font-serif text-2xl font-bold text-gray-900">Koordinasi Hari-H</h3>
                            <p className="text-gray-700">
                                Tim berpengalaman kami akan mengkoordinasikan seluruh rundown acara, memastikan semuanya berjalan sempurna sesuai
                                jadwal yang telah direncanakan.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative overflow-hidden bg-gradient-to-r from-[#D4AF37] to-[#EC4899] py-20">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="font-serif text-4xl font-bold text-white md:text-5xl">Wujudkan Momen Bahagia yang Selalu Anda Impikan...</h2>
                    <p className="mt-6 text-xl text-white/90">Mari bersama kami ciptakan pernikahan yang tak terlupakan</p>
                    <div className="mt-8">
                        <a
                            href="#contact"
                            className="inline-block rounded-full bg-white px-8 py-4 font-semibold text-gray-900 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                        >
                            Hubungi Kami Sekarang
                        </a>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="bg-white py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="font-serif text-4xl font-bold text-gray-900 md:text-5xl">Hubungi Kami</h2>
                        <p className="mt-4 text-lg text-gray-600">Siap membantu mewujudkan pernikahan impian Anda</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]/10">
                                <span className="text-3xl">📞</span>
                            </div>
                            <h3 className="mb-2 font-semibold text-gray-900">Jam Kerja</h3>
                            <p className="text-gray-600">• Senin - Sabtu 09.00 - 18.00</p>
                            <p className="text-gray-600">• Minggu 10.00 - 16.00, dengan by janji</p>
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
            <footer className="bg-gray-900 py-12 text-white">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h3 className="font-serif text-2xl font-bold text-[#D4AF37]">{profile?.company_name || 'Diamond Weddings'}</h3>
                        <p className="mt-2 text-gray-400">One Stop Wedding Services</p>
                    </div>
                    <div className="border-t border-gray-800 pt-6">
                        <p className="text-gray-400">&copy; 2025 All Rights Reserved</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
