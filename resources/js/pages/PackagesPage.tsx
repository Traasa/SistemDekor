import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface Package {
    id: number;
    name: string;
    price: string;
    features: string[];
    popular?: boolean;
    color: string;
}

interface CheckoutForm {
    package_name: string;
    package_price: number;
    client_name: string;
    client_email: string;
    client_phone: string;
    event_date: string;
    event_location: string;
    guest_count: string;
    notes: string;
}

const PackagesPage: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const { auth } = usePage<{ auth: { user: { id: number; name: string; email: string; role: string } } }>().props;
    const user = auth?.user;

    const [formData, setFormData] = useState<CheckoutForm>({
        package_name: '',
        package_price: 0,
        client_name: user?.name || '',
        client_email: user?.email || '',
        client_phone: '',
        event_date: '',
        event_location: '',
        guest_count: '',
        notes: '',
    });

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                client_name: user.name,
                client_email: user.email,
            }));
        }
    }, [user]);

    const handleLogout = async () => {
        try {
            router.post('/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleOrderClick = (pkg: Package) => {
        if (!user) {
            router.visit('/login');
            return;
        }

        setSelectedPackage(pkg);
        setFormData((prev) => ({
            ...prev,
            package_name: pkg.name,
            package_price: parseFloat(pkg.price.replace(/\./g, '')),
        }));
        setShowCheckoutModal(true);
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await axios.post('/api/client/orders', formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token,
                },
            });

            if (response.data.success) {
                setSuccessMessage(response.data.message);
                setTimeout(() => {
                    setShowCheckoutModal(false);
                    router.visit('/my-orders');
                }, 2000);
            }
        } catch (error: any) {
            console.error('Order submission error:', error);
            setErrorMessage(error.response?.data?.message || 'Terjadi kesalahan saat membuat pesanan');
        } finally {
            setIsSubmitting(false);
        }
    };

    const packages: Package[] = [
        {
            id: 1,
            name: 'Silver Package',
            price: '50.000.000',
            color: 'from-gray-300 to-gray-500',
            features: [
                'Dekorasi Pelaminan Eksklusif',
                'Backdrop Foto 3x4 meter',
                'Bunga Fresh 100 tangkai',
                'Lighting 8 titik',
                'Karpet Gang 25 meter',
                'Meja Akad/Pemberkatan',
                'Janur & Pagar Dekor',
                'Setup & Crew 4 orang',
                'Konsultasi Design',
                'Free 1x Revisi Design',
            ],
        },
        {
            id: 2,
            name: 'Gold Package',
            price: '100.000.000',
            color: 'from-[#F4D03F] to-[#D4AF37]',
            popular: true,
            features: [
                'Semua Benefit Silver Package',
                'Dekorasi Pelaminan Premium',
                'Backdrop Foto 5x6 meter',
                'Bunga Fresh 200 tangkai',
                'Lighting 15 titik + LED',
                'Karpet Gang 50 meter',
                'Dekorasi Photo Booth',
                'Dekorasi Meja Tamu',
                'Table Setting untuk 50 pax',
                'Setup & Crew 8 orang',
                'Free 3x Revisi Design',
                'Wedding Coordinator',
                'Dokumentasi Pre-Wedding',
            ],
        },
        {
            id: 3,
            name: 'Platinum Package',
            price: '150.000.000',
            color: 'from-cyan-400 to-blue-600',
            features: [
                'Semua Benefit Gold Package',
                'Dekorasi Pelaminan Super Premium',
                'Backdrop Foto 7x8 meter',
                'Bunga Fresh 350 tangkai',
                'Lighting 25 titik + LED Moving',
                'Karpet Gang 100 meter',
                'Dekorasi Photo Booth Premium',
                'Dekorasi Meja Tamu & Welcome Gate',
                'Table Setting untuk 100 pax',
                'Dessert Table Decoration',
                'Setup & Crew 12 orang',
                'Free Unlimited Revisi',
                'Wedding Coordinator Team',
                'MC Professional',
                'Dokumentasi Full Day',
            ],
        },
        {
            id: 4,
            name: 'Diamond Package',
            price: '200.000.000',
            color: 'from-purple-400 to-pink-600',
            features: [
                'Semua Benefit Platinum Package',
                'Dekorasi Pelaminan Ultra Luxury',
                'Backdrop Foto 10x10 meter + 3D',
                'Bunga Fresh 500 tangkai + Import',
                'Lighting 40 titik + Laser Show',
                'Karpet Gang Full Venue',
                'Photo Booth Luxe + Props',
                'Welcome Gate & Garden Decoration',
                'Table Setting untuk 200 pax',
                'Dessert Table + Candy Corner',
                'VIP Lounge Decoration',
                'Setup & Crew 20 orang',
                'Unlimited Revisi & Konsultasi',
                'Wedding Coordinator Expert Team',
                'MC & Singer Professional',
                'Dokumentasi Pre-Wedding + Full Day',
                'Cinematic Video',
                'Drone Coverage',
                'Same Day Edit',
            ],
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
                                Diamond Weddings
                            </span>
                        </Link>

                        <nav className="hidden items-center space-x-8 md:flex">
                            <Link
                                href="/"
                                className={`font-medium transition-all duration-300 ${isScrolled ? 'text-gray-700 hover:text-[#D4AF37]' : 'text-white drop-shadow hover:text-[#F4D03F]'} hover:scale-105`}
                            >
                                Beranda
                            </Link>
                            <Link
                                href="/packages"
                                className={`font-medium transition-all duration-300 ${isScrolled ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]' : 'border-b-2 border-[#F4D03F] text-[#F4D03F] drop-shadow'}`}
                            >
                                Paket Wedding
                            </Link>

                            {user ? (
                                <div className="flex items-center space-x-4">
                                    {user.role === 'admin' && (
                                        <Link
                                            href="/admin"
                                            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                        >
                                            <span className="relative z-10">Admin Panel</span>
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
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative min-h-[60vh] overflow-hidden pt-24">
                {/* Animated Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 via-transparent to-[#EC4899]/20"></div>
                    <div className="absolute top-20 -left-20 h-72 w-72 animate-pulse rounded-full bg-[#D4AF37]/30 blur-3xl"></div>
                    <div className="animation-delay-2000 absolute top-40 -right-20 h-96 w-96 animate-pulse rounded-full bg-[#EC4899]/30 blur-3xl"></div>
                    <div className="animation-delay-4000 absolute bottom-20 left-1/2 h-64 w-64 animate-pulse rounded-full bg-[#F4D03F]/30 blur-3xl"></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
                    <div className="animate-fade-in-up">
                        <h1 className="font-serif text-5xl font-bold text-gray-900 md:text-7xl">
                            Paket <span className="bg-gradient-to-r from-[#D4AF37] to-[#EC4899] bg-clip-text text-transparent">Wedding</span>{' '}
                            Eksklusif
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
                            Pilih paket yang sempurna untuk hari istimewa Anda. Dari dekorasi elegan hingga layanan premium.
                        </p>
                        <div className="mt-8 flex justify-center gap-4">
                            <div className="flex items-center gap-2 rounded-full bg-white/80 px-6 py-3 shadow-lg backdrop-blur">
                                <span className="text-2xl">💐</span>
                                <span className="font-medium text-gray-700">Dekorasi Premium</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-full bg-white/80 px-6 py-3 shadow-lg backdrop-blur">
                                <span className="text-2xl">✨</span>
                                <span className="font-medium text-gray-700">Setup Profesional</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-full bg-white/80 px-6 py-3 shadow-lg backdrop-blur">
                                <span className="text-2xl">🎊</span>
                                <span className="font-medium text-gray-700">All-Inclusive</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Packages Grid */}
            <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
                    {packages.map((pkg, index) => (
                        <div
                            key={pkg.id}
                            className={`group animate-fade-in-up hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white p-8 shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                                pkg.popular ? 'ring-4 ring-[#D4AF37] ring-offset-4' : ''
                            }`}
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            {/* Popular Badge */}
                            {pkg.popular && (
                                <div className="absolute top-8 right-8 z-20">
                                    <div className="animate-bounce rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] px-4 py-2 text-sm font-bold text-white shadow-lg">
                                        ⭐ PALING POPULER
                                    </div>
                                </div>
                            )}

                            {/* Gradient Header */}
                            <div
                                className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-br ${pkg.color} opacity-10 transition-opacity duration-500 group-hover:opacity-20`}
                            ></div>

                            {/* Content */}
                            <div className="relative z-10">
                                <h3 className={`mb-2 bg-gradient-to-r font-serif text-3xl font-bold ${pkg.color} bg-clip-text text-transparent`}>
                                    {pkg.name}
                                </h3>
                                <div className="mb-6 flex items-baseline">
                                    <span className="text-5xl font-bold text-gray-900">Rp {pkg.price.split('.')[0]}</span>
                                    <span className="ml-2 text-xl text-gray-500">juta</span>
                                </div>

                                <ul className="mb-8 space-y-3">
                                    {pkg.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-gray-700">
                                            <span
                                                className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r ${pkg.color} text-xs text-white`}
                                            >
                                                ✓
                                            </span>
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={user ? '/my-transactions' : '/login'}
                                    onClick={(e) => {
                                        if (user) {
                                            e.preventDefault();
                                            handleOrderClick(pkg);
                                        }
                                    }}
                                    className={`group/btn relative block w-full overflow-hidden rounded-xl bg-gradient-to-r ${pkg.color} py-4 text-center font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                                >
                                    <span className="relative z-10">{user ? 'Pesan Sekarang' : 'Login untuk Pesan'}</span>
                                    <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"></div>
                                </Link>

                                <p className="mt-4 text-center text-xs text-gray-500">*Harga dapat disesuaikan dengan kebutuhan</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#EC4899] p-12 text-center shadow-2xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAgMzBjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
                    <div className="relative z-10">
                        <h2 className="font-serif text-4xl font-bold text-white md:text-5xl">Butuh Paket Custom?</h2>
                        <p className="mx-auto mt-4 max-w-2xl text-xl text-white/90">
                            Kami siap membantu menyesuaikan paket sesuai budget dan kebutuhan Anda
                        </p>
                        <div className="mt-8 flex justify-center gap-4">
                            <a
                                href="https://wa.me/6281234567890"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative overflow-hidden rounded-full bg-white px-8 py-4 font-bold text-[#D4AF37] shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <span className="text-2xl">📱</span>
                                    Hubungi via WhatsApp
                                </span>
                            </a>
                            <Link
                                href="/"
                                className="group relative overflow-hidden rounded-full border-2 border-white px-8 py-4 font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-white hover:text-[#D4AF37]"
                            >
                                Kembali ke Beranda
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 bg-gray-900/90 py-8 text-white backdrop-blur">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <p className="text-sm text-gray-400">© 2024 Diamond Weddings. All rights reserved.</p>
                </div>
            </footer>

            {/* Checkout Modal */}
            {showCheckoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="animate-fade-in-up relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowCheckoutModal(false)}
                            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
                        >
                            ✕
                        </button>

                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="font-serif text-3xl font-bold text-gray-900">
                                Pesan{' '}
                                <span className={`bg-gradient-to-r ${selectedPackage?.color} bg-clip-text text-transparent`}>
                                    {selectedPackage?.name}
                                </span>
                            </h2>
                            <p className="mt-2 text-gray-600">
                                Isi form di bawah ini untuk membuat pesanan. Tim kami akan menghubungi Anda via WhatsApp untuk konfirmasi.
                            </p>
                        </div>

                        {/* Success Message */}
                        {successMessage && (
                            <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-800">
                                <p className="flex items-center gap-2">
                                    <span className="text-2xl">✅</span>
                                    {successMessage}
                                </p>
                            </div>
                        )}

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
                                <p className="flex items-center gap-2">
                                    <span className="text-2xl">❌</span>
                                    {errorMessage}
                                </p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmitOrder} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Client Name */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="client_name"
                                        value={formData.client_name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                        placeholder="Masukkan nama lengkap"
                                    />
                                </div>

                                {/* Client Email */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="client_email"
                                        value={formData.client_email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                        placeholder="email@example.com"
                                    />
                                </div>

                                {/* Client Phone */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        No. WhatsApp <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="client_phone"
                                        value={formData.client_phone}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                        placeholder="08123456789"
                                    />
                                </div>

                                {/* Event Date */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Tanggal Acara <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="event_date"
                                        value={formData.event_date}
                                        onChange={handleInputChange}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Event Location */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Lokasi Acara <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="event_location"
                                    value={formData.event_location}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    placeholder="Contoh: Gedung Pernikahan ABC, Jakarta"
                                />
                            </div>

                            {/* Guest Count */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Estimasi Jumlah Tamu</label>
                                <input
                                    type="number"
                                    name="guest_count"
                                    value={formData.guest_count}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    placeholder="Contoh: 200"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Catatan Khusus / Request</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    placeholder="Tuliskan request khusus Anda di sini..."
                                />
                            </div>

                            {/* Price Summary */}
                            <div className="rounded-lg bg-gradient-to-r from-[#FFF8F0] to-[#FFE4E6] p-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold text-gray-700">Total Harga:</span>
                                    <span className="font-serif text-3xl font-bold text-[#D4AF37]">Rp {selectedPackage?.price}</span>
                                </div>
                                <p className="mt-2 text-sm text-gray-600">*Harga dapat disesuaikan setelah konsultasi dengan tim kami</p>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCheckoutModal(false)}
                                    className="flex-1 rounded-xl border-2 border-gray-300 px-6 py-3 font-bold text-gray-700 transition-all hover:bg-gray-50"
                                    disabled={isSubmitting}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex-1 rounded-xl bg-gradient-to-r ${selectedPackage?.color} px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Memproses...
                                        </span>
                                    ) : (
                                        'Kirim Pesanan'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
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

export default PackagesPage;
