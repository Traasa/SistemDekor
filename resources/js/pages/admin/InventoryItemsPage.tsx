import React, { useState } from 'react';

export const InventoryItemsPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const items = [
        {
            id: 1,
            name: 'Standing Flower',
            code: 'DKR-001',
            category: 'Dekorasi',
            quantity: 20,
            minStock: 5,
            condition: 'good',
            location: 'Gudang A - Rak 1',
            price: 250000,
        },
        {
            id: 2,
            name: 'Kursi Tiffany Putih',
            code: 'FRN-001',
            category: 'Furnitur',
            quantity: 200,
            minStock: 50,
            condition: 'good',
            location: 'Gudang B',
            price: 50000,
        },
        {
            id: 3,
            name: 'LED Par Light',
            code: 'LGT-001',
            category: 'Lighting',
            quantity: 30,
            minStock: 10,
            condition: 'good',
            location: 'Gudang C - Rak 2',
            price: 350000,
        },
        {
            id: 4,
            name: 'Backdrop Kain',
            code: 'DKR-002',
            category: 'Dekorasi',
            quantity: 3,
            minStock: 5,
            condition: 'fair',
            location: 'Gudang A - Rak 2',
            price: 500000,
        },
        {
            id: 5,
            name: 'Sound System',
            code: 'AVS-001',
            category: 'Audio Visual',
            quantity: 8,
            minStock: 3,
            condition: 'good',
            location: 'Gudang C',
            price: 1500000,
        },
        {
            id: 6,
            name: 'Chafing Dish',
            code: 'CTR-001',
            category: 'Catering',
            quantity: 40,
            minStock: 20,
            condition: 'good',
            location: 'Gudang D',
            price: 150000,
        },
    ];

    const getStockStatus = (quantity: number, minStock: number) => {
        if (quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
        if (quantity <= minStock) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
        return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
    };

    const getConditionColor = (condition: string) => {
        switch (condition) {
            case 'good':
                return 'text-green-600';
            case 'fair':
                return 'text-yellow-600';
            case 'poor':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Inventaris Barang</h1>
                    <p className="mt-1 text-sm text-gray-600">Kelola semua barang perusahaan</p>
                </div>
                <div className="flex space-x-3">
                    <button className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700">
                        📥 Stock In
                    </button>
                    <button className="rounded-lg bg-[#D4AF37] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#B8941F]">
                        ➕ Tambah Barang
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">156</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-600">Total Stock</p>
                    <p className="mt-2 text-3xl font-bold text-blue-600">4,523</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-600">Low Stock</p>
                    <p className="mt-2 text-3xl font-bold text-yellow-600">12</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="mt-2 text-3xl font-bold text-green-600">1.2B</p>
                </div>
            </div>

            {/* Filters & View Mode */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 gap-4">
                        <input
                            type="text"
                            placeholder="Cari nama atau kode barang..."
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                        />
                        <select className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none">
                            <option value="">Semua Kategori</option>
                            <option value="dekorasi">Dekorasi</option>
                            <option value="furnitur">Furnitur</option>
                            <option value="lighting">Lighting</option>
                            <option value="audio-visual">Audio Visual</option>
                            <option value="catering">Catering</option>
                        </select>
                        <select className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none">
                            <option value="">Semua Status</option>
                            <option value="in-stock">In Stock</option>
                            <option value="low-stock">Low Stock</option>
                            <option value="out-of-stock">Out of Stock</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`rounded-lg px-4 py-2 ${viewMode === 'grid' ? 'bg-[#D4AF37] text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            ⊞ Grid
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`rounded-lg px-4 py-2 ${viewMode === 'list' ? 'bg-[#D4AF37] text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            ☰ List
                        </button>
                    </div>
                </div>
            </div>

            {/* Items Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => {
                        const stockStatus = getStockStatus(item.quantity, item.minStock);
                        return (
                            <div key={item.id} className="overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-lg">
                                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                                    <div className="flex h-full items-center justify-center text-6xl">📦</div>
                                </div>
                                <div className="p-6">
                                    <div className="mb-2 flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900">{item.name}</h3>
                                            <p className="text-sm text-gray-500">{item.code}</p>
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stockStatus.color}`}>
                                            {stockStatus.label}
                                        </span>
                                    </div>
                                    <div className="mb-4 flex items-center justify-between text-sm">
                                        <span className="text-gray-600">
                                            Stock: {item.quantity} {item.code.startsWith('FRN') ? 'pcs' : 'unit'}
                                        </span>
                                        <span className={`font-semibold ${getConditionColor(item.condition)}`}>{item.condition}</span>
                                    </div>
                                    <div className="mb-4 text-sm text-gray-600">
                                        <p>📍 {item.location}</p>
                                        <p className="mt-1 font-semibold text-[#D4AF37]">Rp {item.price.toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                                            Detail
                                        </button>
                                        <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
                                            📥
                                        </button>
                                        <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                                            📤
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
                                    const stockStatus = getStockStatus(item.quantity, item.minStock);
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-2xl">📦</div>
                                                    <div className="ml-4">
                                                        <div className="font-medium text-gray-900">{item.name}</div>
                                                        <div className="text-sm text-gray-500">{item.code}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{item.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-gray-900">{item.quantity}</span>
                                                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${stockStatus.color}`}>
                                                        {stockStatus.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-sm font-semibold ${getConditionColor(item.condition)}`}>{item.condition}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{item.location}</td>
                                            <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap text-[#D4AF37]">
                                                Rp {item.price.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                <button className="mr-2 text-blue-600 hover:text-blue-900">Detail</button>
                                                <button className="mr-2 text-green-600 hover:text-green-900">In</button>
                                                <button className="text-red-600 hover:text-red-900">Out</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
