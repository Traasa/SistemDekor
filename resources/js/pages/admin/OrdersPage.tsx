import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrderFilters } from '../../components/admin/OrderFilters';
import { OrderStats } from '../../components/admin/OrderStats';
import { OrderTable } from '../../components/admin/OrderTable';
import { Order, orderService } from '../../services/apiService';

export const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchOrders();
    }, [filterStatus, currentPage]);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const params: any = { per_page: 10 };
            if (filterStatus !== 'all') params.status = filterStatus;
            if (searchTerm) params.search = searchTerm;

            const response = await orderService.getAll(params);
            setOrders(response.data.data);
            setTotalPages(Math.ceil(response.data.total / response.data.per_page));
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            alert('Gagal memuat data order');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchOrders();
    };

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        if (!confirm(`Ubah status order menjadi "${newStatus}"?`)) return;

        try {
            await orderService.updateStatus(orderId, newStatus);
            alert('Status order berhasil diupdate');
            fetchOrders();
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Gagal mengupdate status order');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus order ini?')) return;

        try {
            await orderService.delete(id);
            alert('Order berhasil dihapus');
            fetchOrders();
        } catch (error) {
            console.error('Failed to delete order:', error);
            alert('Gagal menghapus order');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manajemen Order</h1>
                    <p className="mt-1 text-sm text-gray-600">Kelola semua transaksi order wedding</p>
                </div>
                <Link
                    to="/admin/orders/create"
                    className="rounded-lg bg-pink-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-pink-600"
                >
                    ➕ Buat Order Baru
                </Link>
            </div>

            {/* Stats Component */}
            <OrderStats orders={orders} />

            {/* Filters Component */}
            <OrderFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                onSearch={handleSearch}
            />

            {/* Table Component */}
            <OrderTable orders={orders} isLoading={isLoading} onStatusChange={handleStatusChange} onDelete={handleDelete} />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between rounded-xl bg-white px-6 py-4 shadow-sm">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        ← Previous
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                        Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
};
