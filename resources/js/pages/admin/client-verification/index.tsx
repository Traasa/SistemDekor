import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { 
    CheckCircle, 
    XCircle, 
    Clock, 
    Search, 
    Eye, 
    FileText,
    AlertCircle,
    CreditCard,
    User,
    Calendar,
    DollarSign
} from 'lucide-react';
import axios from 'axios';

interface PaymentTransaction {
    id: number;
    payment_type: string;
    amount: number;
    status: string;
    payment_date: string;
    proof_image: string;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    total_price: number;
    final_price: number;
    event_name: string;
    event_date: string;
    created_at: string;
    client: {
        name: string;
        email: string;
        phone: string;
    };
    package: {
        name: string;
    };
    payment_transactions: PaymentTransaction[];
}

interface Stats {
    pending_orders: number;
    pending_payments: number;
    awaiting_dp: number;
    today_orders: number;
}

export default function ClientVerificationPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<Stats>({
        pending_orders: 0,
        pending_payments: 0,
        awaiting_dp: 0,
        today_orders: 0,
    });
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchOrders();
        fetchStats();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/client-verification-list', {
                params: { search: searchTerm },
            });
            setOrders(response.data.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/admin/verification-stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleApproveOrder = async (orderId: number) => {
        if (!confirm('Apakah Anda yakin ingin menyetujui order ini?')) return;

        try {
            await axios.post(`/api/admin/orders/${orderId}/approve`);
            alert('Order berhasil diverifikasi!');
            setShowOrderModal(false);
            fetchOrders();
            fetchStats();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error approving order');
        }
    };

    const handleRejectOrder = async (orderId: number) => {
        if (!rejectionReason.trim()) {
            alert('Harap masukkan alasan penolakan');
            return;
        }

        try {
            await axios.post(`/api/admin/orders/${orderId}/reject`, {
                rejection_reason: rejectionReason,
            });
            alert('Order berhasil ditolak!');
            setShowOrderModal(false);
            setRejectionReason('');
            fetchOrders();
            fetchStats();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error rejecting order');
        }
    };

    const handleApprovePayment = async () => {
        if (!selectedOrder || !selectedPayment) return;
        if (!confirm('Apakah Anda yakin ingin menyetujui pembayaran ini?')) return;

        try {
            await axios.post(
                `/api/admin/orders/${selectedOrder.id}/payments/${selectedPayment.id}/approve`
            );
            alert('Pembayaran berhasil diverifikasi!');
            setShowPaymentModal(false);
            fetchOrders();
            fetchStats();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error approving payment');
        }
    };

    const handleRejectPayment = async () => {
        if (!selectedOrder || !selectedPayment) return;
        if (!rejectionReason.trim()) {
            alert('Harap masukkan alasan penolakan');
            return;
        }

        try {
            await axios.post(
                `/api/admin/orders/${selectedOrder.id}/payments/${selectedPayment.id}/reject`,
                { rejection_reason: rejectionReason }
            );
            alert('Pembayaran ditolak!');
            setShowPaymentModal(false);
            setRejectionReason('');
            fetchOrders();
            fetchStats();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error rejecting payment');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: any = {
            pending_confirmation: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
            negotiation: { label: 'Negosiasi', color: 'bg-blue-100 text-blue-800' },
            awaiting_dp_payment: { label: 'Menunggu DP', color: 'bg-orange-100 text-orange-800' },
            confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800' },
        };
        const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>;
    };

    const getPaymentStatusBadge = (status: string) => {
        const statusMap: any = {
            pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
            verified: { label: 'Verified', color: 'bg-green-100 text-green-800' },
            rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
        };
        const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>;
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            fetchOrders();
        }
    };

    return (
        <AdminLayout>
            <Head title="Verifikasi Order Client" />
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Verifikasi Order Client</h1>
                    <p className="text-gray-600 mt-1">Kelola dan verifikasi order & pembayaran client</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Order Pending</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending_orders}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Pembayaran Pending</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending_payments}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Menunggu DP</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.awaiting_dp}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Order Hari Ini</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.today_orders}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nomor order atau nama client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleSearch}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Memuat data...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Semua Terverifikasi!</h3>
                        <p className="text-gray-600">Tidak ada order atau pembayaran yang perlu diverifikasi</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-lg font-bold text-gray-900">{order.order_number}</h3>
                                            {getStatusBadge(order.status)}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{order.client.name}</p>
                                                        <p className="text-gray-600 text-xs">{order.client.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{order.event_name}</p>
                                                        <p className="text-gray-600 text-xs">{order.package.name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {new Date(order.event_date).toLocaleDateString('id-ID')}
                                                        </p>
                                                        <p className="text-gray-600 text-xs">
                                                            Order: {new Date(order.created_at).toLocaleDateString('id-ID')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <div>
                                                <p className="text-sm text-gray-600">Total</p>
                                                <p className="text-xl font-bold text-gray-900">
                                                    Rp {order.final_price.toLocaleString('id-ID')}
                                                </p>
                                            </div>

                                            {order.payment_transactions.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {order.payment_transactions
                                                        .filter((p) => p.status === 'pending')
                                                        .map((payment) => (
                                                            <button
                                                                key={payment.id}
                                                                onClick={() => {
                                                                    setSelectedOrder(order);
                                                                    setSelectedPayment(payment);
                                                                    setShowPaymentModal(true);
                                                                }}
                                                                className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                                                            >
                                                                <AlertCircle className="w-4 h-4" />
                                                                <span className="text-sm font-medium">
                                                                    {payment.payment_type} Pending
                                                                </span>
                                                            </button>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setShowOrderModal(true);
                                        }}
                                        className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Order Detail Modal */}
                {showOrderModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Detail Order</h2>
                                
                                <div className="space-y-4 mb-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Order Number</p>
                                            <p className="font-semibold">{selectedOrder.order_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Status</p>
                                            {getStatusBadge(selectedOrder.status)}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Client</p>
                                            <p className="font-semibold">{selectedOrder.client.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Event</p>
                                            <p className="font-semibold">{selectedOrder.event_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Package</p>
                                            <p className="font-semibold">{selectedOrder.package.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Total</p>
                                            <p className="font-semibold">Rp {selectedOrder.final_price.toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                </div>

                                {selectedOrder.status === 'pending_confirmation' && (
                                    <div className="space-y-3">
                                        <textarea
                                            placeholder="Alasan penolakan (jika ditolak)"
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                        
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleRejectOrder(selectedOrder.id)}
                                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="w-5 h-5" />
                                                Tolak Order
                                            </button>
                                            <button
                                                onClick={() => handleApproveOrder(selectedOrder.id)}
                                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                                Setujui Order
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        setShowOrderModal(false);
                                        setRejectionReason('');
                                    }}
                                    className="mt-4 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Modal */}
                {showPaymentModal && selectedPayment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Verifikasi Pembayaran</h2>
                                
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-600">Jenis Pembayaran</p>
                                        <p className="font-semibold">{selectedPayment.payment_type}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Jumlah</p>
                                        <p className="font-semibold text-xl">Rp {selectedPayment.amount.toLocaleString('id-ID')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Tanggal Transfer</p>
                                        <p className="font-semibold">
                                            {new Date(selectedPayment.payment_date).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                    {selectedPayment.proof_image && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">Bukti Transfer</p>
                                            <img
                                                src={selectedPayment.proof_image}
                                                alt="Bukti Transfer"
                                                className="w-full rounded-lg border"
                                            />
                                        </div>
                                    )}
                                </div>

                                <textarea
                                    placeholder="Alasan penolakan (jika ditolak)"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
                                />

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleRejectPayment}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                    >
                                        <XCircle className="w-5 h-5 inline mr-2" />
                                        Tolak
                                    </button>
                                    <button
                                        onClick={handleApprovePayment}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                    >
                                        <CheckCircle className="w-5 h-5 inline mr-2" />
                                        Setujui
                                    </button>
                                </div>

                                <button
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setRejectionReason('');
                                    }}
                                    className="mt-3 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
