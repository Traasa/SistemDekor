import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../../../layouts/AdminLayout';
import api from '../../../../services/api';
import { AlertCircle, Package, AlertTriangle } from 'lucide-react';

interface LowStockItem {
    id: number;
    name: string;
    code: string;
    quantity: number;
    minimum_stock: number;
    category?: { name: string; color: string; };
    location: string | null;
    last_transaction?: { transaction_date: string; };
}

export default function LowStockAlerts() {
    const [items, setItems] = useState<LowStockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLowStockItems();
    }, []);

    const fetchLowStockItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/inventory-items-low-stock');
            // Sort by quantity ascending (most critical first)
            const items = response.data.data || [];
            const sortedItems = items.sort((a: LowStockItem, b: LowStockItem) => 
                a.quantity - b.quantity
            );
            setItems(sortedItems);
        } catch (err) {
            setError('Failed to load low stock items');
            console.error('Error fetching low stock items:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOrderStock = (item: LowStockItem) => {
        alert(`Order stock for: ${item.name} (${item.code})\nCurrent: ${item.quantity}\nMinimum: ${item.minimum_stock}\nShortage: ${item.minimum_stock - item.quantity}`);
    };

    const criticalItemsCount = items.filter(item => item.quantity === 0).length;

    const getPriorityBadge = (item: LowStockItem) => {
        if (item.quantity === 0) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Out of Stock
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Low Stock
            </span>
        );
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <AdminLayout
            title="Low Stock Alerts"
            description="Monitor inventory items with low or out of stock status"
        >
            <div className="space-y-6">
                {/* Critical Alert Banner */}
                {criticalItemsCount > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                        <div className="flex items-center">
                            <AlertCircle className="h-6 w-6 text-red-400 mr-3" />
                            <div>
                                <h3 className="text-sm font-medium text-red-800">
                                    Critical Stock Alert
                                </h3>
                                <p className="text-sm text-red-700 mt-1">
                                    {criticalItemsCount} {criticalItemsCount === 1 ? 'item is' : 'items are'} completely out of stock and require immediate attention.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                                <p className="text-2xl font-semibold text-gray-900">{criticalItemsCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                                <p className="text-2xl font-semibold text-gray-900">{items.length - criticalItemsCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Alerts</p>
                                <p className="text-2xl font-semibold text-gray-900">{items.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Low Stock Items</h2>
                        <p className="text-sm text-gray-500 mt-1">Items requiring stock replenishment</p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="px-6 py-12 text-center">
                            <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Data</h3>
                            <p className="mt-1 text-sm text-gray-500">{error}</p>
                            <button
                                onClick={fetchLowStockItems}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Retry
                            </button>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <Package className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">All stock levels are healthy</h3>
                            <p className="mt-1 text-sm text-gray-500">No items are currently low on stock.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Item
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Current Stock
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Minimum Stock
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Shortage
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Last Transaction
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {items.map((item) => {
                                        const shortage = item.minimum_stock - item.quantity;
                                        return (
                                            <tr 
                                                key={item.id}
                                                className={item.quantity === 0 ? 'bg-red-50' : ''}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getPriorityBadge(item)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {item.code}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {item.category ? (
                                                        <span
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                            style={{
                                                                backgroundColor: item.category.color + '20',
                                                                color: item.category.color
                                                            }}
                                                        >
                                                            {item.category.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">No category</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`text-sm font-semibold ${
                                                        item.quantity === 0 
                                                            ? 'text-red-600' 
                                                            : 'text-yellow-600'
                                                    }`}>
                                                        {item.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.minimum_stock}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`text-sm font-semibold ${
                                                        item.quantity === 0 
                                                            ? 'text-red-600' 
                                                            : 'text-yellow-600'
                                                    }`}>
                                                        {shortage > 0 ? shortage : 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.location || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(item.last_transaction?.transaction_date)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        onClick={() => handleOrderStock(item)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        <Package className="w-3 h-3 mr-1" />
                                                        Order Stock
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
