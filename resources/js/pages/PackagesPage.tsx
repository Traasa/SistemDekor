import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
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
    is_active?: boolean;
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

    return (
        <>
            <Head title="Paket Wedding" />
            <PublicLayout active="packages" wrapperClassName="min-h-screen bg-[#F6F1EA] text-[#2A2420]">
                <main className="w-full px-4 py-14 font-sans sm:px-8 2xl:px-16">
                    <section className="mb-10 rounded-[28px] border border-[#E7DCCB] bg-[#FFF9F1] p-8 shadow-[0_18px_45px_-35px_rgba(27,36,48,0.65)] sm:p-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#B08A56]">Paket Wedding</p>
                        <h1 className="mt-3 font-serif text-4xl font-bold text-[#2A2420] sm:text-5xl">Pilih Paket Sesuai Skala Acara Anda</h1>
                        <p className="mt-3 max-w-2xl text-[#5B4A3C]">
                            Seluruh paket dapat dikustomisasi. Venue bisa dipilih opsional: Anda bisa serahkan ke WO, atau gunakan venue sendiri.
                        </p>
                    </section>

                    <section className="mb-12 grid gap-6 lg:grid-cols-3">
                        {FEATURED_TIERS.map((tier) => (
                            <article key={tier.key} className="group overflow-hidden rounded-3xl border border-[#E7DCCB] bg-[#FFFBF6] shadow-[0_16px_40px_-28px_rgba(27,36,48,0.6)]">
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
                            </article>
                        ))}
                    </section>

                    {loading ? (
                        <section className="rounded-3xl border border-[#E7DCCB] bg-[#FFFBF6] p-10 text-center shadow-[0_16px_35px_-30px_rgba(27,36,48,0.6)]">
                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#B08A56] border-r-transparent" />
                        </section>
                    ) : (
                        <section id="packages-list" className="grid gap-6 md:grid-cols-2">
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
                        </section>
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

                    <section className="mt-10 rounded-3xl bg-[#1B2430] p-8 text-[#F6F1EA] sm:p-10">
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
                    </section>
                </main>

                {showCheckoutModal && selectedPackage && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4">
                        <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
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
                                    <input
                                        type="date"
                                        name="event_date"
                                        value={formData.event_date}
                                        onChange={handleInputChange}
                                        required
                                        className="rounded-xl border border-slate-300 px-4 py-3"
                                    />
                                </div>

                                <input
                                    name="event_location"
                                    value={formData.event_location}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Lokasi acara"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
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
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <select name="venue_id" value={formData.venue_id} onChange={handleInputChange} className="rounded-xl border border-slate-300 px-4 py-3">
                                                <option value="">Pilih venue</option>
                                                {venues.map((venue) => (
                                                    <option key={venue.id} value={venue.id.toString()}>
                                                        {venue.name} {venue.city ? `(${venue.city})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                name="venue_price"
                                                min={0}
                                                value={formData.venue_price}
                                                onChange={handleInputChange}
                                                placeholder="Harga venue"
                                                className="rounded-xl border border-slate-300 px-4 py-3"
                                            />
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
                        </div>
                    </div>
                )}
            </PublicLayout>
        </>
    );
};

export default PackagesPage;
