import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { MiniOrderTable } from '../../components/admin/MiniOrderTable';
import { OrderFilters } from '../../components/admin/OrderFilters';
import { AdminLayout } from '../../layouts/AdminLayout';
import { MiniOrder, miniOrderService } from '../../services/apiService';

interface MiniPaymentTransaction {
    id: number;
    mini_order_id: number;
    order: {
        id: number;
        order_number: string;
        vendor_client: {
            id: number;
            name: string;
            phone: string;
        };
        event_name: string;
        event_date: string;
        total_price: number;
        final_price: number;
        deposit_amount: number;
        status: string;
    };
    amount: number;
    payment_type: string;
    payment_method: string;
    payment_date: string;
    status: string;
    proof_url: string | null;
    notes: string | null;
    created_at: string;
}

interface MiniPaymentProof {
    id: number;
    mini_order_id: number;
    order: {
        id: number;
        order_number: string;
        vendor_client: {
            name: string;
        };
        final_price: number;
        deposit_amount: number;
        payment_status: string;
    };
    amount: number;
    payment_type: string;
    proof_image: string;
    notes: string | null;
    status: string;
    verified_at: string | null;
    verified_by: number | null;
    created_at: string;
}

const MiniOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<MiniOrder[]>([]);
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

            const response = await miniOrderService.getAll(params);
            setOrders(response.data.data);
            setTotalPages(Math.ceil(response.data.total / response.data.per_page));
        } catch (error) {
            console.error('Failed to fetch mini orders:', error);
            await window.showAlert('Gagal memuat data mini order');
        } finally {
            setIsLoading(false);
        }
    };




    const handleSearch = async () => {
        setCurrentPage(1);
        fetchOrders();
    };

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        if (!await window.showConfirm(`Ubah status mini order menjadi "${newStatus}"?`)) return;

        try {
            await miniOrderService.updateStatus(orderId, newStatus);
            await window.showAlert('Status mini order berhasil diupdate');
            fetchOrders();
        } catch (error) {
            console.error('Failed to update mini order status:', error);
            await window.showAlert('Gagal mengupdate status mini order');
        }
    };

    const handleDelete = async (id: number) => {
        if (!await window.showConfirm('Apakah Anda yakin ingin menghapus mini order ini?')) return;

        try {
            await miniOrderService.delete(id);
            await window.showAlert('Mini order berhasil dihapus');
            fetchOrders();
        } catch (error) {
            console.error('Failed to delete mini order:', error);
            await window.showAlert('Gagal menghapus mini order');
        }
    };

    const handleViewDetail = async (orderId: number) => {
        router.visit(`/admin/mini-orders/${orderId}`);
    };


    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            verified: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            pending_confirmation: 'bg-blue-100 text-blue-800',
            negotiation: 'bg-purple-100 text-purple-800',
            awaiting_booking_payment: 'bg-orange-100 text-orange-800',
            booked: 'bg-green-100 text-green-800',
            awaiting_dp_payment: 'bg-orange-100 text-orange-800',
            dp_paid: 'bg-teal-100 text-teal-800',
            awaiting_full_payment: 'bg-orange-100 text-orange-800',
            paid: 'bg-green-100 text-green-800',
            confirmed: 'bg-blue-100 text-blue-800',
            processing: 'bg-indigo-100 text-indigo-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentTypeBadge = (type: string) => {
        const badges: Record<string, string> = {
            dp: 'bg-blue-100 text-blue-800',
            full: 'bg-purple-100 text-purple-800',
            installment: 'bg-indigo-100 text-indigo-800',
            booking: 'bg-amber-100 text-amber-800',
        };
        return badges[type] || 'bg-gray-100 text-gray-800';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mini Order Management</h1>
                        <p className="mt-1 text-sm text-gray-600">Kelola mini order vendor, pembayaran, dan invoice dalam satu tempat</p>
                    </div>
                    <button
                        onClick={async () => router.visit('/admin/mini-orders/create')}
                        className="flex items-center space-x-2 rounded-lg bg-pink-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-pink-600"
                    >
                        <span>➕</span>
                        <span>Buat Mini Order Baru</span>
                    </button>
                </div>




                <OrderFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    onSearch={handleSearch}
                />

                <MiniOrderTable
                    orders={orders}
                    isLoading={isLoading}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onViewDetail={handleViewDetail}
                />


                {totalPages > 1 && (
                    <div className="flex items-center justify-between rounded-xl bg-white px-6 py-4 shadow-sm">
                        <button
                            onClick={async () => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                        >
                            Sebelumnya
                        </button>
                        <div className="text-sm text-gray-600">
                            Halaman {currentPage} dari {totalPages}
                        </div>
                        <button
                            onClick={async () => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                        >
                            Berikutnya
                        </button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default MiniOrdersPage;
