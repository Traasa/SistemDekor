import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { OrderFilters } from '../../components/admin/OrderFilters';
import { OrderStats } from '../../components/admin/OrderStats';
import { OrderTable } from '../../components/admin/OrderTable';
import { AdminLayout } from '../../layouts/AdminLayout';
import api from '../../services/api';
import { Order, orderService } from '../../services/apiService';

interface PaymentTransaction {
    id: number;
    order_id: number;
    order: {
        id: number;
        order_number: string;
        client: {
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

interface PaymentProof {
    id: number;
    order_id: number;
    order: {
        id: number;
        order_number: string;
        client: {
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

const OrdersPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'orders' | 'payments' | 'proofs'>('orders');
    const [orders, setOrders] = useState<Order[]>([]);
    const [payments, setPayments] = useState<PaymentTransaction[]>([]);
    const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        } else if (activeTab === 'payments') {
            fetchPayments();
        } else if (activeTab === 'proofs') {
            fetchPaymentProofs();
        }
    }, [filterStatus, currentPage, activeTab]);

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

    const fetchPayments = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (filterStatus !== 'all') params.append('status', filterStatus);
            if (searchTerm) params.append('search', searchTerm);
            params.append('page', currentPage.toString());

            const response = await api.get(`/payment-transactions?${params.toString()}`);
            if (response.data.success) {
                const data = Array.isArray(response.data.data) ? response.data.data : [];
                setPayments(data);
                setTotalPages(response.data.last_page || 1);
            } else {
                setPayments([]);
            }
        } catch (error) {
            console.error('Failed to fetch payments:', error);
            setPayments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPaymentProofs = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (filterStatus !== 'all') params.append('status', filterStatus);
            if (searchTerm) params.append('search', searchTerm);
            params.append('page', currentPage.toString());

            const response = await api.get(`/payment-proofs?${params.toString()}`);
            if (response.data.success) {
                const data = Array.isArray(response.data.data) ? response.data.data : [];
                setPaymentProofs(data);
                setTotalPages(response.data.last_page || 1);
            } else {
                setPaymentProofs([]);
            }
        } catch (error) {
            console.error('Failed to fetch payment proofs:', error);
            setPaymentProofs([]);
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

    const handleViewDetail = (orderId: number) => {
        router.visit(`/admin/orders/${orderId}`);
    };

    const handleVerifyProof = async (proofId: number) => {
        if (!confirm('Verifikasi bukti pembayaran ini?')) return;

        try {
            const response = await api.post(`/payment-proofs/${proofId}/verify`);
            if (response.data.success) {
                alert('Pembayaran berhasil diverifikasi!');
                fetchPaymentProofs();
            }
        } catch (error: any) {
            console.error('Verification error:', error);
            alert('Gagal verifikasi: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleRejectProof = async (proofId: number) => {
        const reason = prompt('Alasan penolakan:');
        if (!reason) return;

        try {
            const response = await api.post(`/payment-proofs/${proofId}/reject`, {
                rejection_reason: reason,
            });
            if (response.data.success) {
                alert('Pembayaran ditolak!');
                fetchPaymentProofs();
            }
        } catch (error: any) {
            alert('Gagal menolak: ' + (error.response?.data?.message || error.message));
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            verified: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            pending_confirmation: 'bg-blue-100 text-blue-800',
            negotiation: 'bg-purple-100 text-purple-800',
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
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Transaksi & Order Management</h1>
                        <p className="mt-1 text-sm text-gray-600">Kelola order, pembayaran, dan invoice dalam satu tempat</p>
                    </div>
                    <button
                        onClick={() => router.visit('/admin/orders/create')}
                        className="flex items-center space-x-2 rounded-lg bg-pink-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-pink-600"
                    >
                        <span>➕</span>
                        <span>Buat Order Baru</span>
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex space-x-1 rounded-xl bg-gray-100 p-1">
                    <button
                        onClick={() => {
                            setActiveTab('orders');
                            setCurrentPage(1);
                            setFilterStatus('all');
                            setSearchTerm('');
                        }}
                        className={`flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                            activeTab === 'orders' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        📋 Semua Order
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('proofs');
                            setCurrentPage(1);
                            setFilterStatus('all');
                            setSearchTerm('');
                        }}
                        className={`flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                            activeTab === 'proofs' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        💳 Bukti Pembayaran
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('payments');
                            setCurrentPage(1);
                            setFilterStatus('all');
                            setSearchTerm('');
                        }}
                        className={`flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                            activeTab === 'payments' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        🧾 Riwayat Pembayaran
                    </button>
                </div>

                {/* Stats Component - Only for Orders Tab */}
                {activeTab === 'orders' && <OrderStats orders={orders} />}

                {/* Filters Component */}
                <OrderFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    onSearch={handleSearch}
                />

                {/* Content based on active tab */}
                {activeTab === 'orders' && (
                    <OrderTable
                        orders={orders}
                        isLoading={isLoading}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                        onViewDetail={handleViewDetail}
                    />
                )}

                {activeTab === 'proofs' && (
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        {isLoading ? (
                            <div className="p-12 text-center text-gray-500">Loading...</div>
                        ) : paymentProofs.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">Belum ada bukti pembayaran</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Order</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Client</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Jumlah</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Tipe</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Tanggal Upload
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Bukti</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {paymentProofs.map((proof) => (
                                            <tr key={proof.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{proof.order.order_number}</div>
                                                    <div className="text-sm text-gray-500">Total: {formatCurrency(proof.order.final_price)}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{proof.order.client.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">{formatCurrency(proof.amount)}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPaymentTypeBadge(proof.payment_type)}`}
                                                    >
                                                        {proof.payment_type === 'dp' ? 'Down Payment' : 'Pelunasan'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(proof.status)}`}
                                                    >
                                                        {proof.status === 'pending'
                                                            ? 'Menunggu Verifikasi'
                                                            : proof.status === 'verified'
                                                              ? 'Terverifikasi'
                                                              : 'Ditolak'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{formatDate(proof.created_at)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <a
                                                        href={proof.proof_image}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-pink-600 hover:text-pink-700"
                                                    >
                                                        Lihat Bukti
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                    {proof.status === 'pending' && (
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleVerifyProof(proof.id)}
                                                                className="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
                                                            >
                                                                ✓ Verifikasi
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectProof(proof.id)}
                                                                className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                                                            >
                                                                ✕ Tolak
                                                            </button>
                                                        </div>
                                                    )}
                                                    {proof.status === 'verified' && <span className="text-green-600">Sudah diverifikasi</span>}
                                                    {proof.status === 'rejected' && <span className="text-red-600">Ditolak</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'payments' && (
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        {isLoading ? (
                            <div className="p-12 text-center text-gray-500">Loading...</div>
                        ) : payments.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">Belum ada riwayat pembayaran</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Order #
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Client</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Event</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Jumlah</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Tipe</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Metode</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Tanggal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {payments.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{payment.order.order_number}</div>
                                                    <div className="text-sm text-gray-500">Order Status: {payment.order.status}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{payment.order.client.name}</div>
                                                    <div className="text-sm text-gray-500">{payment.order.client.phone}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{payment.order.event_name}</div>
                                                    <div className="text-sm text-gray-500">{formatDate(payment.order.event_date)}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">{formatCurrency(payment.amount)}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPaymentTypeBadge(payment.payment_type)}`}
                                                    >
                                                        {payment.payment_type === 'dp'
                                                            ? 'Down Payment'
                                                            : payment.payment_type === 'full'
                                                              ? 'Pelunasan'
                                                              : 'Cicilan'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{payment.payment_method || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(payment.status)}`}
                                                    >
                                                        {payment.status === 'pending'
                                                            ? 'Pending'
                                                            : payment.status === 'verified'
                                                              ? 'Verified'
                                                              : 'Rejected'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                    {formatDate(payment.payment_date || payment.created_at)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

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
        </AdminLayout>
    );
};

export default OrdersPage;
