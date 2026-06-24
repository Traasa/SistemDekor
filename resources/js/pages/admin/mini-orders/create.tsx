import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import api from '../../../services/api';
import { miniOrderService } from '../../../services/apiService';
import { formatRupiah } from '@/utils/formatRupiah';

interface VendorClient {
    id: number;
    name: string;
    company_name?: string | null;
    email?: string | null;
    phone: string;
    address?: string | null;
}

const CreateMiniOrderPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [vendorClients, setVendorClients] = useState<VendorClient[]>([]);
    const [showNewVendorForm, setShowNewVendorForm] = useState(false);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        vendor_client_id: '',
        event_name: '',
        event_type: 'mini',
        event_date: '',
        event_address: '',
        event_location: '',
        total_price: '',
        notes: '',
        special_requests: '',
    });

    const [newVendor, setNewVendor] = useState({
        name: '',
        company_name: '',
        email: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        fetchVendorClients();
    }, []);

    const fetchVendorClients = async () => {
        try {
            const response = await api.get('/vendor-clients');
            if (response.data.success) {
                setVendorClients(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch vendor clients:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNewVendorSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/vendor-clients', newVendor);
            if (response.data.success) {
                alert('Vendor client berhasil ditambahkan!');
                fetchVendorClients();
                setFormData((prev) => ({ ...prev, vendor_client_id: response.data.data.id.toString() }));
                setShowNewVendorForm(false);
                setNewVendor({ name: '', company_name: '', email: '', phone: '', address: '' });
            }
        } catch (error: any) {
            alert('Gagal menambahkan vendor client: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles: File[] = [];
        const previews: string[] = [];

        files.forEach((file) => {
            if (file.size > 3 * 1024 * 1024) {
                alert(`Ukuran file ${file.name} melebihi 3MB.`);
                return;
            }
            validFiles.push(file);
            previews.push(URL.createObjectURL(file));
        });

        setSelectedImages(validFiles);
        setImagePreviews(previews);
    };

    const removeSelectedImage = (index: number) => {
        const updatedFiles = selectedImages.filter((_, i) => i !== index);
        const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
        const removed = imagePreviews[index];
        if (removed) {
            URL.revokeObjectURL(removed);
        }
        setSelectedImages(updatedFiles);
        setImagePreviews(updatedPreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const submitData = {
            ...formData,
            notes: formData.notes === '' ? null : formData.notes,
            special_requests: formData.special_requests === '' ? null : formData.special_requests,
            event_location: formData.event_location === '' ? null : formData.event_location,
            total_price: formData.total_price === '' ? null : Math.round(Number(formData.total_price)),
        };

        try {
            const response = await api.post('/mini-orders', submitData);
            if (response.data.success) {
                const orderId = response.data.data.id;
                if (selectedImages.length > 0) {
                    await miniOrderService.uploadImages(orderId, selectedImages);
                }
                alert('Mini order berhasil dibuat!');
                router.visit('/admin/mini-orders');
            }
        } catch (error: any) {
            const errors = error.response?.data?.errors;
            if (errors) {
                const errorMessages = Object.entries(errors)
                    .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                    .join('\n');
                alert('Validation errors:\n' + errorMessages);
            } else {
                alert('Gagal membuat mini order: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Buat Mini Order Baru</h1>
                        <p className="mt-1 text-sm text-gray-600">Tambahkan mini order baru untuk vendor/WO lain</p>
                    </div>
                    <button
                        onClick={() => router.visit('/admin/mini-orders')}
                        className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                    >
                        ← Kembali
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Informasi Vendor Client</h2>
                            <button
                                type="button"
                                onClick={() => setShowNewVendorForm(!showNewVendorForm)}
                                className="text-sm font-medium text-[#D4AF37] hover:underline"
                            >
                                {showNewVendorForm ? '✕ Batal' : '+ Vendor Client Baru'}
                            </button>
                        </div>

                        {showNewVendorForm ? (
                            <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nama *</label>
                                        <input
                                            type="text"
                                            value={newVendor.name}
                                            onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                                            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                            placeholder="Nama PIC"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nama Perusahaan</label>
                                        <input
                                            type="text"
                                            value={newVendor.company_name}
                                            onChange={(e) => setNewVendor({ ...newVendor, company_name: e.target.value })}
                                            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                            placeholder="Nama perusahaan"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            value={newVendor.email}
                                            onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                                            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Telepon *</label>
                                        <input
                                            type="tel"
                                            value={newVendor.phone}
                                            onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                                            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                            placeholder="08123456789"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Alamat</label>
                                        <input
                                            type="text"
                                            value={newVendor.address}
                                            onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                                            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                            placeholder="Alamat lengkap"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleNewVendorSubmit}
                                    className="w-full rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B8941F]"
                                >
                                    Simpan Vendor Client Baru
                                </button>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pilih Vendor Client *</label>
                                <select
                                    name="vendor_client_id"
                                    value={formData.vendor_client_id}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                >
                                    <option value="">-- Pilih Vendor Client --</option>
                                    {vendorClients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name} {client.company_name ? `- ${client.company_name}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-gray-900">Informasi Layanan</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Layanan *</label>
                                <input
                                    type="text"
                                    name="event_name"
                                    value={formData.event_name}
                                    onChange={handleInputChange}
                                    placeholder="Contoh: Dekorasi Pelaminan"
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipe Layanan *</label>
                                <select
                                    name="event_type"
                                    value={formData.event_type}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                >
                                    <option value="mini">Mini Order</option>
                                    <option value="decoration">Dekorasi</option>
                                    <option value="catering">Catering</option>
                                    <option value="documentation">Dokumentasi</option>
                                    <option value="other">Lainnya</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tanggal Pelaksanaan *</label>
                                <input
                                    type="date"
                                    name="event_date"
                                    value={formData.event_date}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Lokasi *</label>
                                <input
                                    type="text"
                                    name="event_location"
                                    value={formData.event_location}
                                    onChange={handleInputChange}
                                    placeholder="Contoh: Jakarta Selatan"
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Alamat Lengkap *</label>
                                <textarea
                                    name="event_address"
                                    value={formData.event_address}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Alamat lengkap lokasi"
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Estimasi Biaya</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    name="total_price"
                                    value={formData.total_price}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setFormData((prev) => ({ ...prev, total_price: val }));
                                    }}
                                    placeholder="Contoh: 15000000"
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                />
                                {formData.total_price && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        = {formatRupiah(Number(formData.total_price))}
                                    </p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">Bisa dikosongkan jika akan dinegosiasikan saat finalisasi.</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-gray-900">Catatan</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Catatan Internal</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Catatan internal"
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Permintaan Khusus</label>
                                <textarea
                                    name="special_requests"
                                    value={formData.special_requests}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Permintaan khusus vendor"
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-gray-900">Referensi Gambar</h2>
                        <div className="space-y-4">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900"
                            />
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={preview} className="relative overflow-hidden rounded-lg border">
                                            <img src={preview} alt={`Preview ${index + 1}`} className="h-32 w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeSelectedImage(index)}
                                                className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-gray-500">Maks 3MB per file. Bisa upload lebih dari satu gambar.</p>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => router.visit('/admin/mini-orders')}
                            className="rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-300"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-[#D4AF37] px-6 py-3 font-semibold text-white hover:bg-[#B8941F] disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : '✓ Buat Mini Order'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default CreateMiniOrderPage;
