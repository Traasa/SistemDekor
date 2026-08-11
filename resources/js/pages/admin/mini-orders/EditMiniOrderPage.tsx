import { AdminLayout } from '@/layouts/AdminLayout';
import { router, useForm } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { miniOrderService } from '../../../services/apiService';
import { formatRupiah } from '../../../utils/formatRupiah';

interface CustomItem {
    name: string;
    price: string;
    quantity: string;
    subtotal: number;
}

interface VendorClient {
    id: number;
    name: string;
    company_name?: string | null;
    email?: string | null;
    phone: string;
    address?: string | null;
}

interface Order {
    id: number;
    order_number: string;
    vendor_client: VendorClient;
    event_name: string;
    event_type: string;
    event_date: string;
    event_location: string;
    event_address?: string;
    custom_items: CustomItem[];
    additional_costs: number;
    discount: number;
    total_price: number;
    final_price: number;
    dp_amount: number;
    remaining_amount: number;
    booking_amount?: number;
    initial_payment_type?: 'dp' | null;
    negotiation_notes?: string;
    is_negotiable: boolean;
    images?: Array<{ id: number; image_url: string }>;
}

interface Props {
    order: Order;
}

interface PriceCalculation {
    total_price: number;
    discount: number;
    final_price: number;
    dp_amount: number;
    remaining_amount: number;
}

export default function EditMiniOrderPage({ order }: Props) {
    const initialDpPercent = order.final_price > 0 ? Math.round((order.dp_amount / order.final_price) * 100) : 30;
    const normalizedDpPercent = Number.isFinite(initialDpPercent) ? Math.min(Math.max(initialDpPercent, 0), 100) : 30;

    const { data, setData, put } = useForm({
        event_name: order.event_name || '',
        event_type: order.event_type || 'mini',
        event_date: order.event_date || '',
        event_location: order.event_location || '',
        event_address: order.event_address || '',
        custom_items: order.custom_items || [],
        additional_costs: order.additional_costs?.toString() || '0',
        discount: order.discount?.toString() || '0',
        dp_type: 'percent',
        dp_value: normalizedDpPercent.toString(),
        initial_payment_type: 'dp',
        booking_amount: '0',
        negotiation_notes: order.negotiation_notes || '',
    });

    const [customItems, setCustomItems] = useState<CustomItem[]>(order.custom_items || []);
    const [existingImages, setExistingImages] = useState<Array<{ id: number; image_url: string }>>(order.images || []);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [calculation, setCalculation] = useState<PriceCalculation>({
        total_price: order.total_price || 0,
        discount: order.discount || 0,
        final_price: order.final_price || 0,
        dp_amount: order.dp_amount || 0,
        remaining_amount: order.remaining_amount || 0,
    });
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            recalculatePrices();
        }, 500);

        return () => clearTimeout(timer);
    }, [customItems, data.additional_costs, data.discount, data.dp_type, data.dp_value]);

    const recalculatePrices = async () => {
        setIsCalculating(true);
        try {
            const response = await axios.post(`/admin/mini-orders/${order.id}/recalculate`, {
                custom_items: customItems,
                additional_costs: Math.round(parseFloat(data.additional_costs) || 0),
                discount: Math.round(parseFloat(data.discount) || 0),
                dp_type: data.dp_type,
                dp_value: parseFloat(data.dp_value) || 0,
                initial_payment_type: data.initial_payment_type,
                booking_amount: 0,
            });

            if (response.data) {
                setCalculation(response.data);
            }
        } catch (error) {
            console.error('Failed to recalculate prices:', error);
        } finally {
            setIsCalculating(false);
        }
    };

    const addCustomItem = () => {
        const newItem: CustomItem = {
            name: '',
            price: '0',
            quantity: '1',
            subtotal: 0,
        };
        const updatedItems = [...customItems, newItem];
        setCustomItems(updatedItems);
        setData('custom_items', updatedItems);
    };

    const updateCustomItem = (index: number, field: keyof CustomItem, value: string) => {
        const updatedItems = [...customItems];
        updatedItems[index] = { ...updatedItems[index], [field]: value };

        const price = Math.round(parseFloat(updatedItems[index].price) || 0);
        const quantity = Math.round(parseFloat(updatedItems[index].quantity) || 0);
        updatedItems[index].subtotal = price * quantity;

        setCustomItems(updatedItems);
        setData('custom_items', updatedItems);
    };

    const removeCustomItem = (index: number) => {
        const updatedItems = customItems.filter((_, i) => i !== index);
        setCustomItems(updatedItems);
        setData('custom_items', updatedItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validCustomItems = customItems.filter((item) => item.name && item.price && item.quantity);
        data.custom_items = validCustomItems;

        put(`/admin/mini-orders/${order.id}`, {
            onSuccess: async () => {
                if (selectedImages.length > 0) {
                    await miniOrderService.uploadImages(order.id, selectedImages);
                }
                router.visit(`/admin/mini-orders/${order.id}`);
            },
            onError: async (errors) => {
                console.error('Validation errors:', errors);
                await window.showAlert('Gagal menyimpan mini order. Periksa input Anda.');
            },
        });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles: File[] = [];
        const previews: string[] = [];

        files.forEach(async (file) => {
            if (file.size > 3 * 1024 * 1024) {
                await window.showAlert(`Ukuran file ${file.name} melebihi 3MB.`);
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

    const removeExistingImage = async (imageId: number) => {
        if (!await window.showConfirm('Hapus gambar ini?')) return;
        await miniOrderService.deleteImage(order.id, imageId);
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Finalisasi Mini Order</h1>
                        <p className="mt-1 text-sm text-gray-600">Atur detail layanan dan skema pembayaran</p>
                    </div>
                    <button
                        onClick={async () => router.visit(`/admin/mini-orders/${order.id}`)}
                        className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                    >
                        ← Kembali
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-gray-900">Informasi Layanan</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Layanan *</label>
                                <input
                                    type="text"
                                    value={data.event_name}
                                    onChange={(e) => setData('event_name', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipe Layanan *</label>
                                <input
                                    type="text"
                                    value={data.event_type}
                                    onChange={(e) => setData('event_type', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tanggal *</label>
                                <input
                                    type="date"
                                    value={data.event_date}
                                    onChange={(e) => setData('event_date', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Lokasi *</label>
                                <input
                                    type="text"
                                    value={data.event_location}
                                    onChange={(e) => setData('event_location', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Alamat *</label>
                                <textarea
                                    value={data.event_address}
                                    onChange={(e) => setData('event_address', e.target.value)}
                                    rows={3}
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Detail Item</h2>
                            <button
                                type="button"
                                onClick={addCustomItem}
                                className="rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                            >
                                + Tambah Item
                            </button>
                        </div>

                        <div className="space-y-4">
                            {customItems.length === 0 && (
                                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
                                    Belum ada item layanan
                                </div>
                            )}
                            {customItems.map((item, index) => (
                                <div key={index} className="grid gap-3 rounded-lg border border-gray-200 p-4 md:grid-cols-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-600">Nama Item</label>
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => updateCustomItem(index, 'name', e.target.value)}
                                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600">Harga</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={item.price}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                updateCustomItem(index, 'price', val);
                                            }}
                                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600">Qty</label>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateCustomItem(index, 'quantity', e.target.value)}
                                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-4 flex items-center justify-between">
                                        <div className="text-sm text-gray-600">Subtotal: {formatRupiah(item.subtotal)}</div>
                                        <button
                                            type="button"
                                            onClick={async () => removeCustomItem(index)}
                                            className="text-sm text-red-600 hover:text-red-700"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-gray-900">Harga & Pembayaran</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Biaya Tambahan</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={data.additional_costs}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setData('additional_costs', val);
                                    }}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Diskon</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={data.discount}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setData('discount', val);
                                    }}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                        <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                            <div>Total Harga: {formatRupiah(calculation.total_price)}</div>
                            <div>Diskon: {formatRupiah(calculation.discount)}</div>
                            <div className="font-semibold">Harga Final: {formatRupiah(calculation.final_price)}</div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-gray-900">Skema Pembayaran</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipe DP</label>
                                <select
                                    value={data.dp_type}
                                    onChange={(e) => setData('dp_type', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                >
                                    <option value="percent">Persentase</option>
                                    <option value="amount">Nominal</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nilai DP</label>
                                <input
                                    type="number"
                                    value={data.dp_value}
                                    onChange={(e) => setData('dp_value', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Initial Payment</label>
                                <input
                                    type="text"
                                    value="DP"
                                    readOnly
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                        <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                            <div>DP: {formatRupiah(calculation.dp_amount)}</div>
                            <div>Sisa Tagihan: {formatRupiah(calculation.remaining_amount)}</div>
                            {isCalculating && <div className="text-xs text-gray-500">Menghitung ulang...</div>}
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-gray-900">Catatan Negosiasi</h2>
                        <textarea
                            value={data.negotiation_notes}
                            onChange={(e) => setData('negotiation_notes', e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-gray-900">Referensi Gambar</h2>
                        <div className="space-y-4">
                            {existingImages.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                    {existingImages.map((image) => (
                                        <div key={image.id} className="relative overflow-hidden rounded-lg border">
                                            <img src={image.image_url} alt="Referensi" className="h-32 w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={async () => removeExistingImage(image.id)}
                                                className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                                onClick={async () => removeSelectedImage(index)}
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
                            onClick={async () => router.visit(`/admin/mini-orders/${order.id}`)}
                            className="rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-300"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-[#D4AF37] px-6 py-3 font-semibold text-white hover:bg-[#B8941F]"
                        >
                            ✓ Simpan Mini Order
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
