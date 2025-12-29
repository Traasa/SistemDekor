import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import api from '../../services/api';
import { Search, Filter, Package, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Plus, Edit, Trash2 } from 'lucide-react';

interface InventoryItem {
    id: number;
    category_id: number;
    name: string;
    code: string;
    description: string | null;
    unit: string;
    quantity: number;
    minimum_stock: number;
    purchase_price: number;
    selling_price: number;
    location: string | null;
    condition: 'good' | 'fair' | 'poor';
    image_url: string | null;
    is_active: boolean;
    category?: { id: number; name: string; };
}

interface InventoryCategory {
    id: number;
    name: string;
}

interface ItemFormData {
    category_id: string;
    name: string;
    code: string;
    description: string;
    unit: string;
    quantity: string;
    minimum_stock: string;
    purchase_price: string;
    selling_price: string;
    location: string;
    condition: 'good' | 'fair' | 'poor';
    is_active: boolean;
}

interface StockFormData {
    quantity: string;
    notes: string;
}

const InventoryItemsPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [categories, setCategories] = useState<InventoryCategory[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    // Modals
    const [showItemModal, setShowItemModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [stockOperation, setStockOperation] = useState<'in' | 'out'>('in');
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    
    // Form data
    const [itemForm, setItemForm] = useState<ItemFormData>({
        category_id: '',
        name: '',
        code: '',
        description: '',
        unit: '',
        quantity: '0',
        minimum_stock: '0',
        purchase_price: '0',
        selling_price: '0',
        location: '',
        condition: 'good',
        is_active: true,
    });
    
    const [stockForm, setStockForm] = useState<StockFormData>({
        quantity: '',
        notes: '',
    });

    // Stats
    const [stats, setStats] = useState({
        totalItems: 0,
        totalStock: 0,
        lowStock: 0,
        totalValue: 0,
    });

    useEffect(() => {
        loadData();
    }, [categoryFilter, statusFilter, searchQuery]);

    const loadData = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (categoryFilter) params.category_id = categoryFilter;
            if (statusFilter) params.status = statusFilter;
            if (searchQuery) params.search = searchQuery;

            const [itemsRes, categoriesRes] = await Promise.all([
                api.get('/inventory-items', { params }),
                api.get('/inventory-categories'),
            ]);

            const itemsData = itemsRes.data.data || itemsRes.data || [];
            const categoriesData = categoriesRes.data.data || categoriesRes.data || [];
            
            setItems(itemsData);
            setCategories(categoriesData);

            // Calculate stats
            const totalItems = itemsData.length;
            const totalStock = itemsData.reduce((sum: number, item: InventoryItem) => sum + item.quantity, 0);
            const lowStock = itemsData.filter((item: InventoryItem) => item.quantity <= item.minimum_stock).length;
            const totalValue = itemsData.reduce((sum: number, item: InventoryItem) => sum + (item.selling_price * item.quantity), 0);

            setStats({ totalItems, totalStock, lowStock, totalValue });
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setItemForm({
            category_id: '',
            name: '',
            code: '',
            description: '',
            unit: '',
            quantity: '0',
            minimum_stock: '0',
            purchase_price: '0',
            selling_price: '0',
            location: '',
            condition: 'good',
            is_active: true,
        });
        setShowItemModal(true);
    };

    const openEditModal = (item: InventoryItem) => {
        setEditingItem(item);
        setItemForm({
            category_id: item.category_id.toString(),
            name: item.name,
            code: item.code,
            description: item.description || '',
            unit: item.unit,
            quantity: item.quantity.toString(),
            minimum_stock: item.minimum_stock.toString(),
            purchase_price: item.purchase_price.toString(),
            selling_price: item.selling_price.toString(),
            location: item.location || '',
            condition: item.condition,
            is_active: item.is_active,
        });
        setShowItemModal(true);
    };

    const handleSaveItem = async () => {
        try {
            const data = {
                ...itemForm,
                category_id: parseInt(itemForm.category_id),
                quantity: parseInt(itemForm.quantity),
                minimum_stock: parseInt(itemForm.minimum_stock),
                purchase_price: parseFloat(itemForm.purchase_price),
                selling_price: parseFloat(itemForm.selling_price),
            };

            if (editingItem) {
                await api.put(`/inventory-items/${editingItem.id}`, data);
            } else {
                await api.post('/inventory-items', data);
            }

            setShowItemModal(false);
            loadData();
            alert(editingItem ? 'Item berhasil diupdate' : 'Item berhasil ditambahkan');
        } catch (error: any) {
            console.error('Error saving item:', error);
            alert(error.response?.data?.message || 'Gagal menyimpan item');
        }
    };

    const handleDeleteItem = async (id: number) => {
        if (!confirm('Yakin ingin menghapus item ini?')) return;

        try {
            await api.delete(`/inventory-items/${id}`);
            loadData();
            alert('Item berhasil dihapus');
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Gagal menghapus item');
        }
    };

    const openStockModal = (item: InventoryItem, operation: 'in' | 'out') => {
        setSelectedItem(item);
        setStockOperation(operation);
        setStockForm({ quantity: '', notes: '' });
        setShowStockModal(true);
    };

    const handleStockOperation = async () => {
        if (!selectedItem) return;

        try {
            const data = {
                quantity: parseInt(stockForm.quantity),
                notes: stockForm.notes,
            };

            const endpoint = stockOperation === 'in' 
                ? `/inventory-items/${selectedItem.id}/add-stock`
                : `/inventory-items/${selectedItem.id}/remove-stock`;

            await api.post(endpoint, data);

            setShowStockModal(false);
            loadData();
            alert(`Stock ${stockOperation === 'in' ? 'masuk' : 'keluar'} berhasil`);
        } catch (error: any) {
            console.error('Error updating stock:', error);
            alert(error.response?.data?.message || 'Gagal update stock');
        }
    };

    const getStockStatus = (quantity: number, minStock: number) => {
        if (quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
        if (quantity <= minStock) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
        return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
    };

    const getConditionColor = (condition: string) => {
        switch (condition) {
            case 'good': return 'text-green-600';
            case 'fair': return 'text-yellow-600';
            case 'poor': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Inventaris Barang</h1>
                        <p className="mt-1 text-sm text-gray-600">Kelola semua barang dan stok perusahaan</p>
                    </div>
                    <button 
                        onClick={openCreateModal}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Tambah Barang
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-white p-5 shadow border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Items</p>
                                <p className="mt-2 text-2xl font-bold text-gray-900">{stats.totalItems}</p>
                            </div>
                            <div className="rounded-full bg-blue-100 p-3">
                                <Package className="text-blue-600" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-5 shadow border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Stock</p>
                                <p className="mt-2 text-2xl font-bold text-green-600">{stats.totalStock.toLocaleString()}</p>
                            </div>
                            <div className="rounded-full bg-green-100 p-3">
                                <TrendingUp className="text-green-600" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-5 shadow border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                                <p className="mt-2 text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
                            </div>
                            <div className="rounded-full bg-yellow-100 p-3">
                                <AlertTriangle className="text-yellow-600" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-5 shadow border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Value</p>
                                <p className="mt-2 text-2xl font-bold text-indigo-600">
                                    {stats.totalValue >= 1000000000 
                                        ? `${(stats.totalValue / 1000000000).toFixed(1)}B`
                                        : stats.totalValue >= 1000000
                                        ? `${(stats.totalValue / 1000000).toFixed(1)}M`
                                        : formatCurrency(stats.totalValue)}
                                </p>
                            </div>
                            <div className="rounded-full bg-indigo-100 p-3">
                                <DollarSign className="text-indigo-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="rounded-lg bg-white p-6 shadow border border-gray-200">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-1 flex-col gap-4 md:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Cari nama atau kode barang..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <select 
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="rounded-lg border border-gray-300 pl-10 pr-8 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none appearance-none bg-white"
                                    >
                                        <option value="">Semua Kategori</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="in-stock">In Stock</option>
                                    <option value="low-stock">Low Stock</option>
                                    <option value="out-of-stock">Out of Stock</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`rounded-lg px-4 py-2.5 font-medium transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`rounded-lg px-4 py-2.5 font-medium transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                List
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="rounded-lg bg-white p-12 text-center shadow border border-gray-200">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Memuat data...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-lg bg-white p-12 text-center shadow border border-gray-200">
                        <Package className="mx-auto text-gray-400" size={48} />
                        <p className="mt-4 text-gray-500 font-medium">Tidak ada data barang</p>
                        <p className="mt-1 text-sm text-gray-400">Klik tombol "Tambah Barang" untuk menambahkan data</p>
                    </div>
                ) : (
                <>
                    {/* Items Grid/List */}
                    {viewMode === 'grid' ? (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map((item) => {
                                const stockStatus = getStockStatus(item.quantity, item.minimum_stock);
                                return (
                                    <div key={item.id} className="overflow-hidden rounded-lg bg-white shadow border border-gray-200 transition-all hover:shadow-lg">
                                        <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <Package className="text-gray-300" size={64} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <div className="mb-3 flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 text-base">{item.name}</h3>
                                                    <p className="text-sm text-gray-500">{item.code}</p>
                                                    {item.category && (
                                                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                                            {item.category.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stockStatus.color}`}>
                                                    {stockStatus.label}
                                                </span>
                                            </div>
                                            <div className="mb-3 flex items-center justify-between text-sm border-t border-gray-100 pt-3">
                                                <span className="text-gray-600">
                                                    Stock: <span className="font-semibold text-gray-900">{item.quantity} {item.unit}</span>
                                                </span>
                                                <span className={`font-medium capitalize ${getConditionColor(item.condition)}`}>
                                                    {item.condition}
                                                </span>
                                            </div>
                                            <div className="mb-4 text-sm text-gray-600 border-t border-gray-100 pt-3">
                                                {item.location && <p>📍 {item.location}</p>}
                                                <p className="mt-1 font-bold text-lg text-blue-600">{formatCurrency(item.selling_price)}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => openEditModal(item)}
                                                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                                                >
                                                    <Edit size={16} />
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => openStockModal(item, 'in')}
                                                    className="rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700 transition-colors"
                                                    title="Stock In"
                                                >
                                                    <TrendingUp size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => openStockModal(item, 'out')}
                                                    className="rounded-lg bg-orange-600 px-3 py-2 text-white hover:bg-orange-700 transition-colors"
                                                    title="Stock Out"
                                                >
                                                    <TrendingDown size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Item</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Stock</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Condition</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Location</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Price</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {items.map((item) => {
                                            const stockStatus = getStockStatus(item.quantity, item.minimum_stock);
                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-2xl">
                                                                {item.image_url ? (
                                                                    <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded object-cover" />
                                                                ) : '📦'}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="font-medium text-gray-900">{item.name}</div>
                                                                <div className="text-sm text-gray-500">{item.code}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                        {item.category?.name || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-semibold text-gray-900">{item.quantity} {item.unit}</span>
                                                            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${stockStatus.color}`}>
                                                                {stockStatus.label}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`text-sm font-semibold capitalize ${getConditionColor(item.condition)}`}>
                                                            {item.condition}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{item.location || '-'}</td>
                                                    <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap text-blue-600">
                                                        {formatCurrency(item.selling_price)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                onClick={() => openEditModal(item)}
                                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900"
                                                                title="Edit"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => openStockModal(item, 'in')}
                                                                className="inline-flex items-center gap-1 text-green-600 hover:text-green-900"
                                                                title="Stock In"
                                                            >
                                                                <TrendingUp size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => openStockModal(item, 'out')}
                                                                className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-900"
                                                                title="Stock Out"
                                                            >
                                                                <TrendingDown size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteItem(item.id)}
                                                                className="inline-flex items-center gap-1 text-red-600 hover:text-red-900"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Item Modal (Create/Edit) */}
            {showItemModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6">
                        <h2 className="mb-6 text-2xl font-bold text-gray-900">
                            {editingItem ? 'Edit Item' : 'Tambah Item Baru'}
                        </h2>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori *</label>
                                <select
                                    value={itemForm.category_id}
                                    onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Item *</label>
                                <input
                                    type="text"
                                    value={itemForm.name}
                                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Kode Item *</label>
                                <input
                                    type="text"
                                    value={itemForm.code}
                                    onChange={(e) => setItemForm({ ...itemForm, code: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                                <input
                                    type="text"
                                    value={itemForm.unit}
                                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                                    placeholder="pcs, unit, set, dll"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                                <input
                                    type="number"
                                    value={itemForm.quantity}
                                    onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Stock *</label>
                                <input
                                    type="number"
                                    value={itemForm.minimum_stock}
                                    onChange={(e) => setItemForm({ ...itemForm, minimum_stock: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Harga Beli *</label>
                                <input
                                    type="number"
                                    value={itemForm.purchase_price}
                                    onChange={(e) => setItemForm({ ...itemForm, purchase_price: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Harga Jual *</label>
                                <input
                                    type="number"
                                    value={itemForm.selling_price}
                                    onChange={(e) => setItemForm({ ...itemForm, selling_price: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Kondisi *</label>
                                <select
                                    value={itemForm.condition}
                                    onChange={(e) => setItemForm({ ...itemForm, condition: e.target.value as 'good' | 'fair' | 'poor' })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                >
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                    <option value="poor">Poor</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi</label>
                                <input
                                    type="text"
                                    value={itemForm.location}
                                    onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
                                    placeholder="Gudang A - Rak 1"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                                <textarea
                                    value={itemForm.description}
                                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={itemForm.is_active}
                                        onChange={(e) => setItemForm({ ...itemForm, is_active: e.target.checked })}
                                        className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Item Aktif</span>
                                </label>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowItemModal(false)}
                                className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSaveItem}
                                className="rounded-lg bg-[#D4AF37] px-6 py-2 font-semibold text-white hover:bg-[#B8941F]"
                            >
                                {editingItem ? 'Update' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stock In/Out Modal */}
            {showStockModal && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6">
                        <h2 className="mb-6 text-2xl font-bold text-gray-900">
                            Stock {stockOperation === 'in' ? 'Masuk' : 'Keluar'} - {selectedItem.name}
                        </h2>
                        
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">Stock Saat Ini: <span className="font-bold text-gray-900">{selectedItem.quantity} {selectedItem.unit}</span></p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah *</label>
                                <input
                                    type="number"
                                    value={stockForm.quantity}
                                    onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    required
                                    min="1"
                                    placeholder={`Masukkan jumlah ${stockOperation === 'in' ? 'masuk' : 'keluar'}`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
                                <textarea
                                    value={stockForm.notes}
                                    onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                    placeholder="Tambahkan catatan (opsional)"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowStockModal(false)}
                                className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleStockOperation}
                                className={`rounded-lg px-6 py-2 font-semibold text-white ${
                                    stockOperation === 'in' 
                                        ? 'bg-green-600 hover:bg-green-700' 
                                        : 'bg-orange-600 hover:bg-orange-700'
                                }`}
                            >
                                {stockOperation === 'in' ? 'Stock In' : 'Stock Out'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </AdminLayout>
    );
};

export default InventoryItemsPage;
