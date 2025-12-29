import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../../layouts/AdminLayout';
import api from '../../../../services/api';
import { Filter, Calendar } from 'lucide-react';

interface Transaction {
    id: number;
    inventory_item_id: number;
    user_id: number;
    order_id: number | null;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    stock_before: number;
    stock_after: number;
    notes: string | null;
    transaction_date: string;
    inventory_item?: { name: string; code: string; };
    user?: { name: string; };
    order?: { id: number; };
}

interface InventoryItem {
    id: number;
    name: string;
    code: string;
}

interface Stats {
    totalIn: number;
    totalOut: number;
    netChange: number;
}

const TransactionsPage: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats>({ totalIn: 0, totalOut: 0, netChange: 0 });
    
    // Filter states
    const [filterItemId, setFilterItemId] = useState<string>('');
    const [filterType, setFilterType] = useState<string>('');
    const [filterDateFrom, setFilterDateFrom] = useState<string>('');
    const [filterDateTo, setFilterDateTo] = useState<string>('');

    useEffect(() => {
        fetchItems();
        fetchTransactions();
    }, [filterItemId, filterType, filterDateFrom, filterDateTo]);

    const fetchItems = async () => {
        try {
            const response = await api.get('/inventory-items');
            const itemsData = response.data.data || response.data || [];
            setItems(itemsData);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filterItemId) params.item_id = filterItemId;
            if (filterType) params.type = filterType;
            if (filterDateFrom) params.date_from = filterDateFrom;
            if (filterDateTo) params.date_to = filterDateTo;

            const response = await api.get('/inventory-transactions', { params });
            const transactionsData = response.data.data || response.data || [];
            setTransactions(transactionsData);
            calculateStats(transactionsData);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data: Transaction[]) => {
        const totalIn = data.filter(t => t.type === 'in').reduce((sum, t) => sum + t.quantity, 0);
        const totalOut = data.filter(t => t.type === 'out').reduce((sum, t) => sum + Math.abs(t.quantity), 0);
        const netChange = totalIn - totalOut;
        setStats({ totalIn, totalOut, netChange });
    };

    const getTypeBadge = (type: string) => {
        const colors = {
            in: 'bg-green-100 text-green-800',
            out: 'bg-red-100 text-red-800',
            adjustment: 'bg-blue-100 text-blue-800',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[type as keyof typeof colors]}`}>
                {type.toUpperCase()}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const resetFilters = () => {
        setFilterItemId('');
        setFilterType('');
        setFilterDateFrom('');
        setFilterDateTo('');
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inventory Transaction History</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        View all inventory transactions (system-generated only)
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="text-sm font-medium text-green-600">Total IN</div>
                        <div className="mt-2 text-3xl font-bold text-green-900">{stats.totalIn}</div>
                        <div className="mt-1 text-xs text-green-600">Items added to stock</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="text-sm font-medium text-red-600">Total OUT</div>
                        <div className="mt-2 text-3xl font-bold text-red-900">{stats.totalOut}</div>
                        <div className="mt-1 text-xs text-red-600">Items removed from stock</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="text-sm font-medium text-blue-600">Net Stock Change</div>
                        <div className={`mt-2 text-3xl font-bold ${stats.netChange >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                            {stats.netChange > 0 ? '+' : ''}{stats.netChange}
                        </div>
                        <div className="mt-1 text-xs text-blue-600">Overall change in inventory</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-gray-500" />
                        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Item
                            </label>
                            <select
                                value={filterItemId}
                                onChange={(e) => setFilterItemId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Items</option>
                                {items.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} ({item.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type
                            </label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Types</option>
                                <option value="in">IN</option>
                                <option value="out">OUT</option>
                                <option value="adjustment">ADJUSTMENT</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="inline h-4 w-4 mr-1" />
                                Date From
                            </label>
                            <input
                                type="date"
                                value={filterDateFrom}
                                onChange={(e) => setFilterDateFrom(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="inline h-4 w-4 mr-1" />
                                Date To
                            </label>
                            <input
                                type="date"
                                value={filterDateTo}
                                onChange={(e) => setFilterDateTo(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    {(filterItemId || filterType || filterDateFrom || filterDateTo) && (
                        <div className="mt-4">
                            <button
                                onClick={resetFilters}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date & Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Item
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Quantity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock Change
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Notes
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No transactions found
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(transaction.transaction_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="font-medium">{transaction.inventory_item?.name}</div>
                                                <div className="text-xs text-gray-500">{transaction.inventory_item?.code}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {getTypeBadge(transaction.type)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className={transaction.quantity >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className="font-mono">
                                                    {transaction.stock_before} → {transaction.stock_after}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {transaction.user?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                {transaction.notes || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info Footer */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Transactions are system-generated automatically when inventory items are added, 
                        used in orders, or adjusted. Manual creation, editing, or deletion is not available.
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
};

export default TransactionsPage;
