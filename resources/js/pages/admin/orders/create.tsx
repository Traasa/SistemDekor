import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import api from '../../../services/api';

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

const CreateOrderPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    const [showNewClientForm, setShowNewClientForm] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        client_id: '',
        package_id: '',
        event_name: '',
        event_type: 'wedding',
        event_date: '',
        event_address: '',
        guest_count: '1',
        total_price: '',
        dp_amount: '',
        notes: '',
        special_requests: '',
        payment_type: 'dp',
        payment_method: 'transfer',
        payment_amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_notes: '',
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Auto-calculate DP amount (30% of total)
        if (name === 'total_price') {
            const totalPrice = parseFloat(value) || 0;
            if (totalPrice > 0) {
                const dpAmount = Math.round(totalPrice * 0.3).toString();
                setFormData((prev) => ({
                    ...prev,
                    dp_amount: dpAmount,
                    payment_amount: prev.payment_type === 'dp' ? dpAmount : value,
                }));
            }
        }

        // Update payment amount based on type
        if (name === 'payment_type') {
            if (value === 'dp') {
                setFormData((prev) => ({ ...prev, payment_amount: prev.dp_amount || '' }));
            } else if (value === 'full') {
                setFormData((prev) => ({ ...prev, payment_amount: prev.total_price || '' }));
            }
        }

        // Auto-fill from package
        if (name === 'package_id') {
            if (value === '') {
                // Reset to empty when "Custom" is selected
                setFormData((prev) => ({
                    ...prev,
                    total_price: '',
                    dp_amount: '',
                    payment_amount: '',
                }));
            } else {
                const selectedPackage = packages.find((p) => p.id === parseInt(value));
                if (selectedPackage && selectedPackage.base_price !== undefined) {
                    const price = selectedPackage.base_price || 0;
                    const dpAmount = Math.round(price * 0.3).toString();
                    setFormData((prev) => ({
                        ...prev,
                        total_price: price.toString(),
                        dp_amount: dpAmount,
                        payment_amount: prev.payment_type === 'dp' ? dpAmount : price.toString(),
                    }));
                }
            }
        }
    };

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
            payment_notes: formData.payment_notes === '' ? null : formData.payment_notes,
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

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Buat Order Baru</h1>
                        <p className="mt-1 text-sm text-gray-600">Tambahkan order baru untuk client</p>
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
                                    placeholder="200"
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Alamat Event *</label>
                                <textarea
                                    name="event_address"
                                    value={formData.event_address}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Alamat lengkap venue (Jalan, Kota, Provinsi)"
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                />
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
                                            {pkg.name} - Rp {(pkg.base_price || 0).toLocaleString('id-ID')}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">Pilih package atau masukkan harga custom di bawah</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Total Harga *</label>
                                <div className="relative mt-1">
                                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500">Rp</span>
                                    <input
                                        type="number"
                                        name="total_price"
                                        value={formData.total_price}
                                        onChange={handleInputChange}
                                        min="1"
                                        placeholder="5000000"
                                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">DP Amount (30%) *</label>
                                <div className="relative mt-1">
                                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500">Rp</span>
                                    <input
                                        type="number"
                                        name="dp_amount"
                                        value={formData.dp_amount}
                                        onChange={handleInputChange}
                                        min="0"
                                        placeholder="1500000"
                                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                        required
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Auto-calculate 30% dari total harga</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-gray-900">Informasi Pembayaran Awal</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipe Pembayaran *</label>
                                <select
                                    name="payment_type"
                                    value={formData.payment_type}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                >
                                    <option value="dp">DP (Down Payment)</option>
                                    <option value="full">Full Payment</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Metode Pembayaran *</label>
                                <select
                                    name="payment_method"
                                    value={formData.payment_method}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                >
                                    <option value="cash">💵 Cash</option>
                                    <option value="transfer">🏦 Transfer Bank</option>
                                    <option value="credit_card">💳 Credit Card</option>
                                    <option value="debit_card">💳 Debit Card</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jumlah Pembayaran *</label>
                                <div className="relative mt-1">
                                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500">Rp</span>
                                    <input
                                        type="number"
                                        name="payment_amount"
                                        value={formData.payment_amount}
                                        onChange={handleInputChange}
                                        min="1"
                                        placeholder="1500000"
                                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                        required
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Otomatis terisi sesuai tipe pembayaran</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tanggal Pembayaran *</label>
                                <input
                                    type="date"
                                    name="payment_date"
                                    value={formData.payment_date}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Catatan Pembayaran</label>
                                <textarea
                                    name="payment_notes"
                                    value={formData.payment_notes}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Catatan tambahan untuk pembayaran (opsional)"
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                />
                            </div>
                        </div>
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
                            {loading ? 'Menyimpan...' : '✓ Buat Order'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default CreateOrderPage;
