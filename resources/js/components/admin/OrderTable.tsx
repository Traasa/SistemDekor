import React from 'react';
import { Order } from '../../services/apiService';

interface OrderTableProps {
    orders: Order[];
    isLoading: boolean;
    onStatusChange: (orderId: number, newStatus: string) => void;
    onDelete: (orderId: number) => void;
    onViewDetail?: (orderId: number) => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({ orders, isLoading, onStatusChange, onDelete, onViewDetail }) => {
    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'processing':
                return 'bg-purple-100 text-purple-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500"></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                <div className="mb-4 text-6xl">📋</div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Tidak ada data</h3>
                <p className="text-gray-600">Belum ada order yang terdaftar atau tidak ditemukan.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Client</th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Package</th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Event Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Total Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{order.client?.name || 'N/A'}</div>
                                    <div className="text-sm text-gray-500">{order.client?.email || ''}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{order.package?.name || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {new Date(order.event_date).toLocaleDateString('id-ID', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{order.event_location}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(parseFloat(order.total_price.toString()))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={order.status}
                                        onChange={(e) => onStatusChange(order.id, e.target.value)}
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeColor(order.status)} cursor-pointer border-0 focus:ring-2 focus:ring-pink-500 focus:outline-none`}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="processing">Processing</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="space-x-2 px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                    {onViewDetail && (
                                        <button onClick={() => onViewDetail(order.id)} className="font-medium text-blue-600 hover:text-blue-900">
                                            Detail
                                        </button>
                                    )}
                                    <button onClick={() => onDelete(order.id)} className="text-red-600 hover:text-red-900">
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
