import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import api from '../../../services/api';
import { formatRupiah } from '@/utils/formatRupiah';

interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
}

interface Package {
    id: number;
    name: string;
    base_price: number;
    description: string;
}

interface Venue {
    id: number;
    name: string;
    address: string;
    city: string;
    province: string;
    capacity: number;
    venue_type: string;
    is_active: boolean;
    pricing: VenuePricing[];
}

interface VenuePricing {
    id: number;
    venue_id: number;
    day_type: string;
    session_type: string;
    base_price: string | number;
    is_active: boolean;
}

const formatCurrency = (amount: number) => formatRupiah(amount);

const CreateOrderPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [showNewClientForm, setShowNewClientForm] = useState(false);
    const [useWoVenue, setUseWoVenue] = useState(false);
    const [selectedVenueId, setSelectedVenueId] = useState('');
    const [selectedVenuePricingId, setSelectedVenuePricingId] = useState('');
    const [venuePrice, setVenuePrice] = useState(0);

    // Form state
    const [formData, setFormData] = useState({
        client_id: '',
        package_id: '',
        event_name: '',
        event_type: 'wedding',
        event_date: '',
        event_address: '',
        guest_count: '1',
        notes: '',
        special_requests: '',
        venue_id: '',
    });

    // New client form state
    const [newClient, setNewClient] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        fetchClients();
        fetchPackages();
        fetchVenues();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await api.get('/clients');
            if (response.data.success) {
                setClients(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        }
    };

    const fetchPackages = async () => {
        try {
            const response = await api.get('/packages-list');
            if (response.data.success) {
                setPackages(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch packages:', error);
        }
    };

    const fetchVenues = async () => {
        try {
            const response = await api.get('/venues?is_active=1');
            if (response.data.success) {
                setVenues(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch venues:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleVenueToggle = (checked: boolean) => {
        setUseWoVenue(checked);
        if (!checked) {
            // User wants to type their own address
            setSelectedVenueId('');
            setSelectedVenuePricingId('');
            setVenuePrice(0);
            setFormData((prev) => ({ ...prev, event_address: '', venue_id: '' }));
        }
    };

    const handleVenueSelect = async (venueId: string) => {
        setSelectedVenueId(venueId);
        setSelectedVenuePricingId('');
        setVenuePrice(0);

        if (!venueId) {
            setFormData((prev) => ({ ...prev, event_address: '', venue_id: '' }));
            return;
        }

        // Load venue detail with pricing
        try {
            const response = await api.get(`/venues/${venueId}`);
            if (response.data.success) {
                const venue: Venue = response.data.data;
                const fullAddress = [venue.name, venue.address, venue.city, venue.province]
                    .filter(Boolean)
                    .join(', ');

                setFormData((prev) => ({
                    ...prev,
                    event_address: fullAddress,
                    venue_id: venueId,
                }));

                // Update venues with pricing data
                setVenues((prev) =>
                    prev.map((v) => (v.id === venue.id ? { ...v, pricing: venue.pricing || [] } : v))
                );

                // Auto-select first active pricing if available
                const activePricing = (venue.pricing || []).filter((p: VenuePricing) => p.is_active);
                if (activePricing.length === 1) {
                    setSelectedVenuePricingId(String(activePricing[0].id));
                    setVenuePrice(Math.round(Number(activePricing[0].base_price) || 0));
                }
            }
        } catch (error) {
            console.error('Failed to fetch venue detail:', error);
        }
    };

    const handleVenuePricingSelect = (pricingId: string) => {
        setSelectedVenuePricingId(pricingId);
        const venue = venues.find((v) => String(v.id) === selectedVenueId);
        if (venue && venue.pricing) {
            const pricing = venue.pricing.find((p) => String(p.id) === pricingId);
            setVenuePrice(pricing ? Math.round(Number(pricing.base_price) || 0) : 0);
        } else {
            setVenuePrice(0);
        }
    };

    // Calculate total price
    const selectedPackage = packages.find((p) => String(p.id) === formData.package_id);
    const packagePrice = selectedPackage?.base_price || 0;
    const totalPrice = packagePrice + venuePrice;

    const handleNewClientSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/clients', newClient);
            if (response.data.success) {
                alert('Client berhasil ditambahkan!');
                fetchClients();
                setFormData((prev) => ({ ...prev, client_id: response.data.data.id.toString() }));
                setShowNewClientForm(false);
                setNewClient({ name: '', email: '', phone: '', address: '' });
            }
        } catch (error: any) {
            alert('Gagal menambahkan client: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Clean data: convert empty strings to null for nullable fields
        const submitData = {
            ...formData,
            package_id: formData.package_id === '' ? null : formData.package_id,
            notes: formData.notes === '' ? null : formData.notes,
            special_requests: formData.special_requests === '' ? null : formData.special_requests,
            venue_id: formData.venue_id === '' ? null : formData.venue_id,
            venue_price: venuePrice > 0 ? venuePrice : null,
        };

        // Debug: Log form data before submit
        console.log('Form Data being sent:', submitData);

        try {
            const response = await api.post('/orders', submitData);
            if (response.data.success) {
                alert('Order berhasil dibuat!');
                router.visit('/admin/orders');
            }
        } catch (error: any) {
            console.error('Order submission error:', error.response?.data);
            const errors = error.response?.data?.errors;
            if (errors) {
                const errorMessages = Object.entries(errors)
                    .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                    .join('\n');
                alert('Validation errors:\n' + errorMessages);
            } else {
                alert('Gagal membuat order: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    // Get currently selected venue and its pricing
    const currentVenue = venues.find((v) => String(v.id) === selectedVenueId);
    const currentVenuePricing = currentVenue?.pricing?.filter((p) => p.is_active) || [];

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Buat Wedding Order Baru</h1>
                        <p className="mt-1 text-sm text-gray-600">Tambahkan wedding order baru untuk client</p>
                    </div>
                    <button
                        onClick={() => router.visit('/admin/orders')}
                        className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                    >
                        ← Kembali
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Client Information */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Informasi Client</h2>
                            <button
                                type="button"
                                onClick={() => setShowNewClientForm(!showNewClientForm)}
                                className="text-sm font-medium text-[#D4AF37] hover:underline"
                            >
                                {showNewClientForm ? '✕ Batal' : '+ Client Baru'}
                            </button>
                        </div>

                        {showNewClientForm ? (
                            <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nama *</label>
                                        <input
                                            type="text"
                                            value={newClient.name}
                                            onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                            placeholder="Nama lengkap client"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email *</label>
                                        <input
                                            type="email"
                                            value={newClient.email}
                                            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                            placeholder="email@example.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Telepon *</label>
                                        <input
                                            type="tel"
                                            value={newClient.phone}
                                            onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                            placeholder="08123456789"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Alamat</label>
                                        <input
                                            type="text"
                                            value={newClient.address}
                                            onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                                            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                            placeholder="Alamat lengkap"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleNewClientSubmit}
                                    className="w-full rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B8941F]"
                                >
                                    Simpan Client Baru
                                </button>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pilih Client *</label>
                                <select
                                    name="client_id"
                                    value={formData.client_id}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                >
                                    <option value="">-- Pilih Client --</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name} - {client.phone}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Event Information */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-gray-900">Informasi Event</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Event *</label>
                                <input
                                    type="text"
                                    name="event_name"
                                    value={formData.event_name}
                                    onChange={handleInputChange}
                                    placeholder="Contoh: Pernikahan Budi & Ani"
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipe Event *</label>
                                <select
                                    name="event_type"
                                    value={formData.event_type}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                >
                                    <option value="wedding">Pernikahan</option>
                                    <option value="engagement">Engagement</option>
                                    <option value="birthday">Ulang Tahun</option>
                                    <option value="corporate">Corporate Event</option>
                                    <option value="other">Lainnya</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tanggal Event *</label>
                                <input
                                    type="date"
                                    name="event_date"
                                    value={formData.event_date}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jumlah Tamu *</label>
                                <input
                                    type="number"
                                    name="guest_count"
                                    value={formData.guest_count}
                                    onChange={handleInputChange}
                                    min="1"
                                    step="1"
                                    placeholder="200"
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                />
                            </div>

                            {/* Venue Toggle */}
                            <div className="md:col-span-2">
                                <label className="flex items-center gap-3 cursor-pointer mb-3">
                                    <input
                                        type="checkbox"
                                        checked={useWoVenue}
                                        onChange={(e) => handleVenueToggle(e.target.checked)}
                                        className="h-5 w-5 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        🏛️ Tambahkan Venue dari WO
                                    </span>
                                </label>

                                {useWoVenue && (
                                    <div className="space-y-3 rounded-lg border border-[#D4AF37]/30 bg-[#FDF8E8] p-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Pilih Venue *</label>
                                            <select
                                                value={selectedVenueId}
                                                onChange={(e) => handleVenueSelect(e.target.value)}
                                                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                                required
                                            >
                                                <option value="">-- Pilih Venue --</option>
                                                {venues.map((venue) => (
                                                    <option key={venue.id} value={venue.id}>
                                                        {venue.name} — {venue.city}, Kap. {venue.capacity} orang
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Venue pricing selection */}
                                        {currentVenuePricing.length > 0 && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Pilih Paket Harga Venue</label>
                                                <select
                                                    value={selectedVenuePricingId}
                                                    onChange={(e) => handleVenuePricingSelect(e.target.value)}
                                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                                >
                                                    <option value="">-- Pilih Paket Harga --</option>
                                                    {currentVenuePricing.map((pricing) => (
                                                        <option key={pricing.id} value={pricing.id}>
                                                            {pricing.day_type} / {pricing.session_type} — {formatCurrency(Math.round(Number(pricing.base_price) || 0))}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {venuePrice > 0 && (
                                            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-2">
                                                <span className="text-sm text-green-700">✓ Harga venue yang ditambahkan:</span>
                                                <span className="text-sm font-bold text-green-800">{formatCurrency(venuePrice)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Alamat Event *</label>
                                <textarea
                                    name="event_address"
                                    value={formData.event_address}
                                    onChange={useWoVenue ? undefined : handleInputChange}
                                    readOnly={useWoVenue}
                                    rows={3}
                                    placeholder={useWoVenue ? 'Alamat otomatis terisi dari venue yang dipilih' : 'Alamat lengkap venue (Jalan, Kota, Provinsi)'}
                                    className={`mt-1 w-full rounded-lg border px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none ${
                                        useWoVenue
                                            ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                                            : 'border-gray-300 bg-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20'
                                    }`}
                                    required
                                />
                                {useWoVenue && (
                                    <p className="mt-1 text-xs text-[#B8941F]">
                                        📍 Alamat terisi otomatis dari venue yang dipilih
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Package & Pricing */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-gray-900">Package & Harga</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Pilih Package (Opsional)</label>
                                <select
                                    name="package_id"
                                    value={formData.package_id}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                >
                                    <option value="">-- Custom / Tanpa Package --</option>
                                    {packages.map((pkg) => (
                                        <option key={pkg.id} value={pkg.id}>
                                            {pkg.name} - {formatRupiah(pkg.base_price || 0)}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    Pilih package atau lanjutkan dengan custom pricing yang akan dinegosiasikan
                                </p>
                            </div>
                        </div>

                        {/* Price Summary */}
                        {(packagePrice > 0 || venuePrice > 0) && (
                            <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Estimasi Harga</h3>
                                <div className="space-y-1 text-sm text-gray-600">
                                    {packagePrice > 0 && (
                                        <div className="flex justify-between">
                                            <span>Package: {selectedPackage?.name}</span>
                                            <span>{formatCurrency(packagePrice)}</span>
                                        </div>
                                    )}
                                    {venuePrice > 0 && (
                                        <div className="flex justify-between">
                                            <span>Venue: {currentVenue?.name}</span>
                                            <span>{formatCurrency(venuePrice)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t border-gray-300 pt-2 font-bold text-gray-900">
                                        <span>Total Estimasi</span>
                                        <span className="text-[#D4AF37]">{formatCurrency(totalPrice)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {totalPrice === 0 && (
                            <p className="mt-2 text-xs text-gray-500">Harga dan pembayaran akan dinegosiasikan setelah order dibuat</p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-gray-900">Catatan & Permintaan Khusus</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Catatan Order</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Catatan internal untuk order ini (tidak terlihat oleh client)"
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Permintaan Khusus Client</label>
                                <textarea
                                    name="special_requests"
                                    value={formData.special_requests}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Permintaan khusus dari client (dekorasi tema, menu khusus, warna dominan, dll)"
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => router.visit('/admin/orders')}
                            className="rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-300"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-[#D4AF37] px-6 py-3 font-semibold text-white hover:bg-[#B8941F] disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : '✓ Buat Wedding Order'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default CreateOrderPage;
