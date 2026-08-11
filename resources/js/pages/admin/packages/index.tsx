import { AdminLayout } from '../../../layouts/AdminLayout';
import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X, Search } from 'lucide-react';
import { formatRupiah } from '@/utils/formatRupiah';

type CategoryGroup = 'catering' | 'dekor' | 'makeup' | 'sound' | 'lainnya';

interface InventoryItem {
    id: number;
    name: string;
    unit: string;
    quantity: number;
    category?: {
        id: number;
        name: string;
        category_group: CategoryGroup;
    };
}

interface PackageInventoryItem {
    id: number;
    name: string;
    unit: string;
    quantity: number;
    category?: {
        id: number;
        name: string;
        category_group: CategoryGroup;
    };
    pivot?: {
        quantity: number;
        notes?: string | null;
    };
}

interface Package {
    id: number;
    name: string;
    description: string;
    base_price: number;
    slug: string;
    image_url: string | null;
    is_active: boolean;
    includes_venue?: boolean;
    venue_id?: number | null;
    venue_price?: number;
    venue?: {
        id: number;
        name: string;
        city?: string;
    } | null;
    inventory_items?: PackageInventoryItem[];
}

interface Venue {
    id: number;
    name: string;
    city?: string;
    is_active?: boolean;
}

interface SelectedItemForm {
    inventory_item_id: number;
    quantity: number;
    notes: string;
}

const defaultForm = {
    name: '',
    description: '',
    base_price: '',
    includes_venue: false,
    venue_id: '',
    image: null as File | null,
    image_url: '',
    is_active: true,
    slug: '',
};

export default function PackagesPage() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchItem, setSearchItem] = useState('');
    const [groupFilter, setGroupFilter] = useState<CategoryGroup | 'all'>('all');
    const [selectedItems, setSelectedItems] = useState<SelectedItemForm[]>([]);

    const [formData, setFormData] = useState(defaultForm);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [packageResponse, inventoryResponse, venueResponse] = await Promise.all([
                axios.get('/api/packages?admin=1'),
                axios.get('/api/inventory-items'),
                axios.get('/api/venues?is_active=1'),
            ]);

            setPackages(packageResponse.data.data || []);
            setInventoryItems(inventoryResponse.data.data || []);
            setVenues(venueResponse.data.data || []);
        } catch (error) {
            console.error('Failed to fetch packages/inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredInventory = useMemo(() => {
        return inventoryItems.filter((item) => {
            if (groupFilter !== 'all' && item.category?.category_group !== groupFilter) {
                return false;
            }
            if (searchItem && !item.name.toLowerCase().includes(searchItem.toLowerCase())) {
                return false;
            }
            return true;
        });
    }, [inventoryItems, groupFilter, searchItem]);

    const openCreate = () => {
        setEditingId(null);
        setFormData(defaultForm);
        setSelectedItems([]);
        setSearchItem('');
        setGroupFilter('all');
        setShowModal(true);
    };

    const openEdit = (pkg: Package) => {
        setEditingId(pkg.id);
        setFormData({
            name: pkg.name,
            description: pkg.description,
            base_price: pkg.base_price.toString(),
            includes_venue: !!pkg.includes_venue,
            venue_id: pkg.venue_id?.toString() || '',
            slug: pkg.slug,
            image: null,
            image_url: pkg.image_url || '',
            is_active: pkg.is_active,
        });

        const mappedItems = (pkg.inventory_items || []).map((item) => ({
            inventory_item_id: item.id,
            quantity: item.pivot?.quantity || 1,
            notes: item.pivot?.notes || '',
        }));

        setSelectedItems(mappedItems);
        setSearchItem('');
        setGroupFilter('all');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData(defaultForm);
        setSelectedItems([]);
    };

    const toggleItem = (itemId: number) => {
        const exists = selectedItems.find((item) => item.inventory_item_id === itemId);
        if (exists) {
            setSelectedItems((prev) => prev.filter((item) => item.inventory_item_id !== itemId));
            return;
        }
        setSelectedItems((prev) => [...prev, { inventory_item_id: itemId, quantity: 1, notes: '' }]);
    };

    const updateSelectedItem = (itemId: number, field: 'quantity' | 'notes', value: string | number) => {
        setSelectedItems((prev) =>
            prev.map((item) => {
                if (item.inventory_item_id !== itemId) return item;
                return {
                    ...item,
                    [field]: field === 'quantity' ? Number(value) : value,
                };
            }),
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('description', formData.description);
            payload.append('base_price', formData.base_price);
            payload.append('includes_venue', formData.includes_venue ? '1' : '0');
            
            if (formData.includes_venue && formData.venue_id) {
                payload.append('venue_id', formData.venue_id);
            }
            
            if (formData.image) {
                payload.append('image', formData.image);
            }
            
            payload.append('is_active', formData.is_active ? '1' : '0');
            if (formData.slug) payload.append('slug', formData.slug);
            
            // Append inventory items as JSON string so backend can parse it, or as array
            const inventoryItems = selectedItems.map((item) => ({
                inventory_item_id: item.inventory_item_id,
                quantity: item.quantity,
                notes: item.notes || null,
            }));
            
            if (inventoryItems.length > 0) {
                payload.append('inventory_items_json', JSON.stringify(inventoryItems));
            }

            if (editingId) {
                payload.append('_method', 'PUT');
                await axios.post(`/api/packages/${editingId}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post('/api/packages', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            closeModal();
            await fetchInitialData();
            await window.showAlert('Paket berhasil disimpan');
        } catch (error: any) {
            await window.showAlert(error.response?.data?.message || 'Gagal menyimpan paket');
        }
    };

    const handleDelete = async (id: number) => {
        if (!await window.showConfirm('Yakin ingin menghapus paket ini?')) return;

        try {
            await axios.delete(`/api/packages/${id}`);
            fetchInitialData();
        } catch (error) {
            await window.showAlert('Gagal menghapus paket');
        }
    };

    const getGroupLabel = (group?: CategoryGroup) => {
        switch (group) {
            case 'catering':
                return 'Catering';
            case 'dekor':
                return 'Dekor';
            case 'makeup':
                return 'Makeup';
            case 'sound':
                return 'Sound';
            default:
                return 'Lainnya';
        }
    };

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Paket Wedding</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Kustomisasi item inventori per paket (khusus admin, tidak ditampilkan ke landing page).
                        </p>
                    </div>
                    <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        <Plus className="h-5 w-5" />
                        Tambah Paket
                    </button>
                </div>

                {loading ? (
                    <div className="py-12 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Paket</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Harga Dasar</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Item Inventori</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {packages.map((pkg) => (
                                    <tr key={pkg.id}>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900">{pkg.name}</div>
                                            <div className="text-xs text-gray-500">{pkg.description.substring(0, 80)}...</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{formatRupiah(pkg.base_price)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{pkg.inventory_items?.length || 0} item</td>
                                        <td className="px-6 py-4">
                                            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {pkg.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <button onClick={async () => openEdit(pkg)} className="mr-3 text-blue-600 hover:text-blue-800">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button onClick={async () => handleDelete(pkg.id)} className="text-red-600 hover:text-red-800">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-bold">{editingId ? 'Edit Paket' : 'Tambah Paket'}</h3>
                                <button onClick={closeModal}>
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Nama Paket *</label>
                                        <input type="text" required value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} className="w-full rounded-lg border px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Harga Dasar *</label>
                                        <input type="number" required value={formData.base_price} onChange={(e) => setFormData((prev) => ({ ...prev, base_price: e.target.value }))} className="w-full rounded-lg border px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
                                        <input type="text" value={formData.slug} onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))} className="w-full rounded-lg border px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Gambar Paket</label>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.files ? e.target.files[0] : null }))} 
                                            className="w-full rounded-lg border px-3 py-2 bg-white" 
                                        />
                                        {formData.image_url && !formData.image && (
                                            <p className="mt-1 text-xs text-gray-500">Gambar saat ini sudah tersimpan. Unggah baru untuk mengganti.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-lg border border-gray-200 p-4">
                                    <h4 className="mb-3 text-sm font-semibold text-gray-900">Pengaturan Venue</h4>
                                    <label className="mb-3 inline-flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={!!formData.includes_venue}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    includes_venue: e.target.checked,
                                                    venue_id: e.target.checked ? prev.venue_id : '',
                                                }))
                                            }
                                        />
                                        Paket termasuk venue
                                    </label>

                                    {formData.includes_venue && (
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Pilih Venue</label>
                                                <select
                                                    value={formData.venue_id}
                                                    onChange={(e) => setFormData((prev) => ({ ...prev, venue_id: e.target.value }))}
                                                    className="w-full rounded-lg border px-3 py-2"
                                                >
                                                    <option value="">Pilih venue</option>
                                                    {venues.map((venue) => (
                                                        <option key={venue.id} value={venue.id.toString()}>
                                                            {venue.name} {venue.city ? `(${venue.city})` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Deskripsi *</label>
                                    <textarea required rows={3} value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} className="w-full rounded-lg border px-3 py-2" />
                                </div>

                                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                    <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))} />
                                    Paket aktif
                                </label>

                                <div className="rounded-lg border border-gray-200 p-4">
                                    <h4 className="mb-3 text-sm font-semibold text-gray-900">Item Inventori untuk Paket</h4>

                                    <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                                        <div className="relative md:col-span-2">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                value={searchItem}
                                                onChange={(e) => setSearchItem(e.target.value)}
                                                placeholder="Cari nama barang..."
                                                className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm"
                                            />
                                        </div>
                                        <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value as CategoryGroup | 'all')} className="rounded-lg border px-3 py-2 text-sm">
                                            <option value="all">Semua Group</option>
                                            <option value="catering">Catering</option>
                                            <option value="dekor">Dekor</option>
                                            <option value="makeup">Makeup</option>
                                            <option value="sound">Sound</option>
                                            <option value="lainnya">Lainnya</option>
                                        </select>
                                    </div>

                                    <div className="max-h-72 overflow-y-auto rounded border border-gray-200">
                                        <table className="min-w-full divide-y divide-gray-100">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Pilih</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Item</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Group</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Qty Paket</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Catatan</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {filteredInventory.map((item) => {
                                                    const selected = selectedItems.find((x) => x.inventory_item_id === item.id);
                                                    return (
                                                        <tr key={item.id}>
                                                            <td className="px-3 py-2">
                                                                <input type="checkbox" checked={!!selected} onChange={() => toggleItem(item.id)} />
                                                            </td>
                                                            <td className="px-3 py-2 text-sm text-gray-900">
                                                                <div>{item.name}</div>
                                                                <div className="text-xs text-gray-500">Stok: {item.quantity} {item.unit}</div>
                                                            </td>
                                                            <td className="px-3 py-2 text-sm text-gray-700">{getGroupLabel(item.category?.category_group)}</td>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    type="number"
                                                                    min={1}
                                                                    disabled={!selected}
                                                                    value={selected?.quantity || 1}
                                                                    onChange={(e) => updateSelectedItem(item.id, 'quantity', Number(e.target.value))}
                                                                    className="w-24 rounded border px-2 py-1 text-sm disabled:bg-gray-100"
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    type="text"
                                                                    disabled={!selected}
                                                                    value={selected?.notes || ''}
                                                                    onChange={(e) => updateSelectedItem(item.id, 'notes', e.target.value)}
                                                                    className="w-full rounded border px-2 py-1 text-sm disabled:bg-gray-100"
                                                                    placeholder="opsional"
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                                    <button type="button" onClick={closeModal} className="rounded-lg border px-4 py-2">Batal</button>
                                    <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Simpan Paket</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
