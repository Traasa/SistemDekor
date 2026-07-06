import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PublicLayout } from '../layouts/PublicLayout';
import { images } from '../config/theme';

interface Package {
    id: number;
    name: string;
    description: string;
    base_price: number;
    includes_venue?: boolean;
    venue_id?: number | null;
    venue_price?: number;
    is_active?: boolean;
}

interface Venue {
    id: number;
    name: string;
    city?: string;
    address?: string;
    is_active?: boolean;
    pricing?: Array<{
        base_price: number;
        is_active: boolean;
    }>;
}

interface CheckoutForm {
    package_id: string;
    package_name: string;
    package_price: number;
    client_name: string;
    client_email: string;
    client_phone: string;
    event_date: string;
    event_location: string;
    is_venue_included: boolean;
    venue_id: string;
    venue_price: string;
    guest_count: string;
    notes: string;
}

interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);

const parseFeatureList = (description: string) => {
    const normalized = description
        .split(/\n|\.|,/)
        .map((item) => item.trim())
        .filter(Boolean);

    if (normalized.length > 0) {
        return normalized.slice(0, 4);
    }

    return ['Paket dapat dikustomisasi sesuai kebutuhan acara'];
};

const FEATURED_TIERS = [
    {
        key: 'silver',
        name: 'Silver',
        tagline: 'Pilihan elegan untuk intimate wedding yang rapi dan hangat.',
        price: 'Mulai Rp 18.000.000',
        highlight: 'Ideal 100-200 tamu',
        image: images.packages.silver,
    },
    {
        key: 'gold',
        name: 'Gold',
        tagline: 'Keseimbangan dekorasi premium dan koordinasi menyeluruh.',
        price: 'Mulai Rp 28.000.000',
        highlight: 'Ideal 200-400 tamu',
        image: images.packages.gold,
    },
    {
        key: 'platinum',
        name: 'Platinum',
        tagline: 'Full service luxury dengan detail artistik yang dominan.',
        price: 'Mulai Rp 42.000.000',
        highlight: 'Ideal 400+ tamu',
        image: images.packages.platinum,
    },
];

const WEEKDAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const pad2 = (value: number) => String(value).padStart(2, '0');

const toDateKey = (date: Date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const formatDisplayDate = (value: string) => {
    if (!value) return '';
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

const buildCalendarDays = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const leadingBlanks = firstDay.getDay();
    const days: Array<Date | null> = [];

    for (let i = 0; i < leadingBlanks; i += 1) {
        days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
        days.push(new Date(year, month, day));
    }

    while (days.length % 7 !== 0) {
        days.push(null);
    }

    return days;
};

const PackagesPage: React.FC = () => {
    const { auth } = usePage<{ auth?: { user?: AuthUser } }>().props;
    const user = auth?.user;

    const [packageList, setPackageList] = useState<Package[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [visiblePackages, setVisiblePackages] = useState(6);
    const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set());
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [isDatesLoading, setIsDatesLoading] = useState(false);

    const [formData, setFormData] = useState<CheckoutForm>({
        package_id: '',
        package_name: '',
        package_price: 0,
        client_name: user?.name || '',
        client_email: user?.email || '',
        client_phone: '',
        event_date: '',
        event_location: '',
        is_venue_included: false,
        venue_id: '',
        venue_price: '0',
        guest_count: '',
        notes: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [packageResponse, venueResponse] = await Promise.all([
                    axios.get('/api/packages'),
                    axios.get('/api/venues?is_active=1'),
                ]);

                setPackageList(packageResponse.data?.data || []);
                setVenues(venueResponse.data?.data || []);
            } catch (error) {
                console.error('Failed to load packages/venues', error);
                setErrorMessage('Gagal memuat data paket. Silakan refresh halaman.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!showCheckoutModal) {
            setIsDatePickerOpen(false);
            return;
        }

        const now = new Date();
        setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));

        const fetchUnavailableDates = async () => {
            try {
                setIsDatesLoading(true);
                const from = toDateKey(now);
                const toDate = new Date(now.getFullYear(), now.getMonth() + 12, now.getDate());
                const response = await axios.get('/api/unavailable-dates', {
                    params: {
                        from,
                        to: toDateKey(toDate),
                    },
                });

                const dates = Array.isArray(response.data?.data) ? response.data.data : [];
                setUnavailableDates(new Set(dates));
            } catch (error) {
                console.error('Failed to load unavailable dates', error);
                setUnavailableDates(new Set());
            } finally {
                setIsDatesLoading(false);
            }
        };

        fetchUnavailableDates();
    }, [showCheckoutModal]);

    useEffect(() => {
        if (!formData.event_date) return;
        if (unavailableDates.has(formData.event_date)) {
            setFormData((prev) => ({ ...prev, event_date: '' }));
            setErrorMessage('Tanggal tersebut sudah dibooking. Silakan pilih tanggal lain.');
        }
    }, [formData.event_date, unavailableDates]);

    useEffect(() => {
        if (!user) return;

        setFormData((prev) => ({
            ...prev,
            client_name: user.name,
            client_email: user.email,
        }));
    }, [user]);

    const totalPrice = useMemo(() => {
        const packagePrice = selectedPackage?.base_price || 0;
        const venuePrice = formData.is_venue_included ? Number(formData.venue_price || 0) : 0;
        return packagePrice + venuePrice;
    }, [selectedPackage, formData.is_venue_included, formData.venue_price]);

    const handleOrderClick = (pkg: Package) => {
        if (!user) {
            router.visit('/login');
            return;
        }

        setSelectedPackage(pkg);
        setFormData((prev) => ({
            ...prev,
            package_id: pkg.id.toString(),
            package_name: pkg.name,
            package_price: pkg.base_price,
            is_venue_included: !!pkg.includes_venue,
            venue_id: pkg.venue_id ? pkg.venue_id.toString() : '',
            venue_price: (pkg.venue_price || 0).toString(),
        }));
        setShowCheckoutModal(true);
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.event_date) {
            setErrorMessage('Tanggal acara wajib dipilih.');
            return;
        }

        if (unavailableDates.has(formData.event_date)) {
            setErrorMessage('Tanggal tersebut sudah dibooking. Silakan pilih tanggal lain.');
            return;
        }

        const minDate = new Date();
        minDate.setHours(0, 0, 0, 0);
        minDate.setDate(minDate.getDate() + 1);
        const selectedDate = new Date(`${formData.event_date}T00:00:00`);
        if (selectedDate < minDate) {
            setErrorMessage('Tanggal acara minimal H+1 dari hari ini.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const payload = {
                ...formData,
                package_id: formData.package_id ? Number(formData.package_id) : null,
                package_name: selectedPackage?.name || formData.package_name,
                package_price: totalPrice,
                is_venue_included: !!formData.is_venue_included,
                venue_id: formData.is_venue_included && formData.venue_id ? Number(formData.venue_id) : null,
                venue_price: formData.is_venue_included ? Number(formData.venue_price || 0) : 0,
            };

            const response = await axios.post('/api/client/orders', payload, {
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
                }, 1200);
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data?.message || 'Terjadi kesalahan saat membuat pesanan');
            } else {
                setErrorMessage('Terjadi kesalahan saat membuat pesanan');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const minSelectableDate = (() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 1);
        return date;
    })();

    const calendarDays = buildCalendarDays(calendarMonth);

    const isDateBlocked = (date: Date) => {
        if (date < minSelectableDate) return true;
        return unavailableDates.has(toDateKey(date));
    };

    return (
        <>
            <Head title="Paket Wedding" />
            <PublicLayout active="packages" wrapperClassName="min-h-screen bg-[#F6F1EA] text-[#2A2420]">
                <main className="w-full px-4 py-14 font-sans sm:px-8 2xl:px-16">
                    <motion.section 
                        className="mb-10 rounded-[28px] border border-[#E7DCCB] bg-[#FFF9F1] p-8 shadow-[0_18px_45px_-35px_rgba(27,36,48,0.65)] sm:p-10"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#B08A56]">Paket Wedding</p>
                        <h1 className="mt-3 font-serif text-4xl font-bold text-[#2A2420] sm:text-5xl">Pilih Paket Sesuai Skala Acara Anda</h1>
                        <p className="mt-3 max-w-2xl text-[#5B4A3C]">
                            Seluruh paket dapat dikustomisasi. Venue bisa dipilih opsional: Anda bisa serahkan ke WO, atau gunakan venue sendiri.
                        </p>
                    </motion.section>

                    <motion.section 
                        className="mb-12 grid gap-6 lg:grid-cols-3"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                        }}
                    >
                        {FEATURED_TIERS.map((tier) => (
                            <motion.article 
                                key={tier.key} 
                                className="group overflow-hidden rounded-3xl border border-[#E7DCCB] bg-[#FFFBF6] shadow-[0_16px_40px_-28px_rgba(27,36,48,0.6)]"
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                            >
                                <div className="relative h-56 overflow-hidden">
                                    <img src={tier.image} alt={`${tier.name} package`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B2430]/75 via-[#1B2430]/20 to-transparent" />
                                    <span className="absolute left-5 top-5 rounded-full bg-[#F3E6D6]/95 px-4 py-1 text-xs font-semibold uppercase text-[#7A5C44]">
                                        {tier.name}
                                    </span>
                                </div>
                                <div className="space-y-3 p-6">
                                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#B08A56]">Signature Tier</p>
                                    <h3 className="font-serif text-2xl font-bold text-[#2A2420]">{tier.highlight}</h3>
                                    <p className="text-sm text-[#5B4A3C]">{tier.tagline}</p>
                                    <p className="text-lg font-semibold text-[#8A6A4F]">{tier.price}</p>
                                    <Link
                                        href="#packages-list"
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A5C44] hover:text-[#5B4636]"
                                    >
                                        Lihat detail paket
                                        <span aria-hidden="true">→</span>
                                    </Link>
                                </div>
                            </motion.article>
                        ))}
                    </motion.section>

                    {loading ? (
                        <section className="rounded-3xl border border-[#E7DCCB] bg-[#FFFBF6] p-10 text-center shadow-[0_16px_35px_-30px_rgba(27,36,48,0.6)]">
                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#B08A56] border-r-transparent" />
                        </section>
                    ) : (
                        <motion.section 
                            id="packages-list" 
                            className="grid gap-6 md:grid-cols-2"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                        >
                            {packageList.slice(0, visiblePackages).map((pkg) => {
                                const features = parseFeatureList(pkg.description || '');
                                return (
                                    <article key={pkg.id} className="rounded-3xl border border-[#E7DCCB] bg-[#FFFBF6] p-7 shadow-[0_14px_30px_-26px_rgba(27,36,48,0.6)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_-30px_rgba(27,36,48,0.7)]">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h2 className="font-serif text-3xl font-bold text-[#2A2420]">{pkg.name}</h2>
                                                <p className="mt-2 text-3xl font-bold text-[#B08A56]">{formatCurrency(pkg.base_price)}</p>
                                            </div>
                                            {pkg.includes_venue && (
                                                <span className="rounded-full bg-[#7A5C44] px-3 py-1 text-xs font-semibold uppercase text-white">Include venue</span>
                                            )}
                                        </div>

                                        <ul className="mt-6 space-y-2 text-sm text-[#5B4A3C]">
                                            {features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-2">
                                                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#C8A46A]" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => handleOrderClick(pkg)}
                                            className="mt-7 w-full rounded-2xl bg-gradient-to-r from-[#B08A56] to-[#7A5C44] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_-18px_rgba(122,92,68,0.7)] transition hover:brightness-95"
                                        >
                                            {user ? 'Pesan Sekarang' : 'Login untuk Pesan'}
                                        </button>
                                    </article>
                                );
                            })}
                        </motion.section>
                    )}

                    {!loading && packageList.length > visiblePackages && (
                        <div className="mt-8 flex justify-center">
                            <button
                                type="button"
                                onClick={() => setVisiblePackages((prev) => prev + 6)}
                                className="rounded-full border border-[#D7C3A8] bg-[#FFFBF6] px-6 py-3 text-sm font-semibold text-[#7A5C44] shadow-[0_12px_25px_-20px_rgba(27,36,48,0.5)] transition hover:bg-[#F2E7D8]"
                            >
                                Tampilkan lebih banyak
                            </button>
                        </div>
                    )}

                    <motion.section 
                        className="mt-10 rounded-3xl bg-[#1B2430] p-8 text-[#F6F1EA] sm:p-10"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <h3 className="font-serif text-3xl font-bold">Butuh Paket Custom?</h3>
                        <p className="mt-2 text-[#C8B8A3]">Tim kami akan bantu hitung kebutuhan dekorasi, vendor, rundown acara, hingga venue.</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <a
                                href="https://wa.me/6281234567890"
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full bg-gradient-to-r from-[#B08A56] to-[#7A5C44] px-5 py-3 text-sm font-semibold text-white"
                            >
                                Konsultasi via WhatsApp
                            </a>
                            <Link href="/my-orders" className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white">
                                Lihat Status Order
                            </Link>
                        </div>
                    </motion.section>
                </main>

                {showCheckoutModal && selectedPackage && (
                    <motion.div 
                        className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="font-serif text-3xl font-bold text-slate-900">Pesan {selectedPackage.name}</h2>
                                    <p className="mt-1 text-sm text-slate-600">Isi data agar tim kami bisa menindaklanjuti order Anda.</p>
                                </div>
                                <button onClick={() => setShowCheckoutModal(false)} className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">
                                    Tutup
                                </button>
                            </div>

                            {successMessage && <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</div>}
                            {errorMessage && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div>}

                            <form onSubmit={handleSubmitOrder} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <input
                                        name="client_name"
                                        value={formData.client_name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Nama lengkap"
                                        className="rounded-xl border border-slate-300 px-4 py-3"
                                    />
                                    <input
                                        type="email"
                                        name="client_email"
                                        value={formData.client_email}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Email"
                                        className="rounded-xl border border-slate-300 px-4 py-3"
                                    />
                                    <input
                                        name="client_phone"
                                        value={formData.client_phone}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Nomor WhatsApp"
                                        className="rounded-xl border border-slate-300 px-4 py-3"
                                    />
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsDatePickerOpen((prev) => !prev)}
                                            className="flex w-full items-center justify-between rounded-xl border border-slate-300 px-4 py-3 text-left text-sm text-slate-700"
                                            aria-haspopup="dialog"
                                            aria-expanded={isDatePickerOpen}
                                        >
                                            <span>
                                                {formData.event_date
                                                    ? formatDisplayDate(formData.event_date)
                                                    : 'Pilih tanggal acara'}
                                            </span>
                                            <span className="text-xs text-slate-400">📅</span>
                                        </button>
                                        <input type="hidden" name="event_date" value={formData.event_date} />

                                        {isDatePickerOpen && (
                                            <div className="absolute z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                                                <div className="flex items-center justify-between">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setCalendarMonth(
                                                                (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                                                            )
                                                        }
                                                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600"
                                                    >
                                                        ‹
                                                    </button>
                                                    <p className="text-sm font-semibold text-slate-700">
                                                        {calendarMonth.toLocaleDateString('id-ID', {
                                                            month: 'long',
                                                            year: 'numeric',
                                                        })}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setCalendarMonth(
                                                                (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                                                            )
                                                        }
                                                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600"
                                                    >
                                                        ›
                                                    </button>
                                                </div>

                                                <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-slate-400">
                                                    {WEEKDAY_LABELS.map((label) => (
                                                        <span key={label}>{label}</span>
                                                    ))}
                                                </div>

                                                <div className="mt-2 grid grid-cols-7 gap-1 text-center text-sm">
                                                    {calendarDays.map((date, index) => {
                                                        if (!date) {
                                                            return <div key={`empty-${index}`} className="h-9" />;
                                                        }

                                                        const dateKey = toDateKey(date);
                                                        const isSelected = formData.event_date === dateKey;
                                                        const isBlocked = isDateBlocked(date);

                                                        return (
                                                            <button
                                                                type="button"
                                                                key={dateKey}
                                                                disabled={isBlocked}
                                                                onClick={() => {
                                                                    setFormData((prev) => ({ ...prev, event_date: dateKey }));
                                                                    setErrorMessage('');
                                                                    setIsDatePickerOpen(false);
                                                                }}
                                                                className={`h-9 w-9 rounded-full text-sm transition ${
                                                                    isSelected
                                                                        ? 'bg-[#B08A56] text-white'
                                                                        : isBlocked
                                                                          ? 'cursor-not-allowed bg-slate-100 text-slate-300'
                                                                          : 'text-slate-700 hover:bg-slate-100'
                                                                }`}
                                                            >
                                                                {date.getDate()}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                <div className="mt-3 text-xs text-slate-500">
                                                    {isDatesLoading ? 'Memuat jadwal...' : 'Tanggal abu-abu sudah dibooking.'}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <input
                                    name="event_location"
                                    value={formData.event_location}
                                    onChange={formData.is_venue_included ? undefined : handleInputChange}
                                    readOnly={formData.is_venue_included}
                                    required
                                    placeholder={formData.is_venue_included ? "Lokasi otomatis terisi dari venue" : "Lokasi acara"}
                                    className={`w-full rounded-xl border px-4 py-3 ${formData.is_venue_included ? 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-500' : 'bg-white border-slate-300'}`}
                                />

                                <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={!!formData.is_venue_included}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    is_venue_included: checked,
                                                    venue_id: checked ? prev.venue_id : '',
                                                    venue_price: checked ? prev.venue_price : '0',
                                                }));
                                            }}
                                        />
                                        Tambahkan venue dari WO
                                    </label>

                                    {formData.is_venue_included ? (
                                        <div className="grid gap-3 sm:grid-cols-1">
                                            <select 
                                                name="venue_id" 
                                                value={formData.venue_id} 
                                                onChange={(e) => {
                                                    const venueId = e.target.value;
                                                    const venue = venues.find(v => v.id.toString() === venueId);
                                                    const pricing = venue?.pricing?.[0]; // Get first active pricing
                                                    const price = pricing ? pricing.base_price : 0;
                                                    const address = venue ? [venue.name, venue.address, venue.city].filter(Boolean).join(', ') : '';
                                                    
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        venue_id: venueId,
                                                        venue_price: price.toString(),
                                                        event_location: address || prev.event_location
                                                    }));
                                                }} 
                                                className="rounded-xl border border-slate-300 px-4 py-3"
                                            >
                                                <option value="">Pilih venue</option>
                                                {venues.map((venue) => (
                                                    <option key={venue.id} value={venue.id.toString()}>
                                                        {venue.name} {venue.city ? `(${venue.city})` : ''}
                                                        {venue.pricing?.[0] ? ` - ${formatCurrency(venue.pricing[0].base_price)}` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500">Venue bisa Anda urus sendiri. Harga paket tidak ditambah biaya venue.</p>
                                    )}
                                </div>

                                <input
                                    type="number"
                                    name="guest_count"
                                    value={formData.guest_count}
                                    onChange={handleInputChange}
                                    placeholder="Estimasi tamu"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                                />

                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Catatan khusus"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                                />

                                <div className="space-y-1 rounded-xl bg-[#F9F2E7] px-4 py-3 text-sm text-slate-700">
                                    <div className="flex items-center justify-between">
                                        <span>Harga paket</span>
                                        <span className="font-semibold">{formatCurrency(selectedPackage.base_price)}</span>
                                    </div>
                                    {formData.is_venue_included && (
                                        <div className="flex items-center justify-between">
                                            <span>Harga venue</span>
                                            <span className="font-semibold">{formatCurrency(Number(formData.venue_price || 0))}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between border-t border-[#e7d9bf] pt-2 text-base font-bold text-[#B88321]">
                                        <span>Total</span>
                                        <span>{formatCurrency(totalPrice)}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full rounded-xl bg-gradient-to-r from-[#B08A56] to-[#7A5C44] px-5 py-3 font-semibold text-white disabled:opacity-60"
                                >
                                    {isSubmitting ? 'Memproses...' : 'Kirim Pesanan'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </PublicLayout>
        </>
    );
};

export default PackagesPage;
