import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import api from '../../../services/api';

interface Order {
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
    dp_amount: number;
    status: string;
}

interface PaymentTransaction {
    id: number;
    order_id: number;
    order: Order;
    amount: number;
    payment_type: string;
    payment_method: string;
    payment_date: string;
    status: string;
    proof_url: string | null;
    notes: string | null;
    created_at: string;
}

const PaymentsPage: React.FC = () => {
    const [payments, setPayments] = useState<PaymentTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        status: '',
        payment_type: '',
        search: '',
    });

    useEffect(() => {
        fetchPayments();
    }, [filter]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter.status) params.append('status', filter.status);
            if (filter.payment_type) params.append('payment_type', filter.payment_type);
            if (filter.search) params.append('search', filter.search);

            const response = await api.get(`/payment-transactions?${params.toString()}`);
            console.log('Payment API Response:', response.data);

            if (response.data.success) {
                const data = Array.isArray(response.data.data) ? response.data.data : [];
                setPayments(data);
            } else {
                setPayments([]);
            }
        } catch (error) {
            console.error('Failed to fetch payments:', error);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id: number) => {
        if (!confirm('Verifikasi pembayaran ini?')) return;

        try {
            const response = await api.post(`/payment-transactions/${id}/verify`);
            if (response.data.success) {
                alert('Pembayaran berhasil diverifikasi!');
                fetchPayments();
            }
        } catch (error: any) {
            alert('Gagal verifikasi: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleReject = async (id: number) => {
        const reason = prompt('Alasan penolakan:');
        if (!reason) return;

        try {
            const response = await api.put(`/payment-transactions/${id}`, {
                status: 'rejected',
                notes: reason,
            });
            if (response.data.success) {
                alert('Pembayaran ditolak!');
                fetchPayments();
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

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pembayaran</h1>
                        <p className="mt-1 text-sm text-gray-600">Kelola dan verifikasi pembayaran dari client</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                value={filter.status}
                                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                            >
                                <option value="">Semua Status</option>
                                <option value="pending">Pending</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipe Pembayaran</label>
                            <select
                                value={filter.payment_type}
                                onChange={(e) => setFilter({ ...filter, payment_type: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                            >
                                <option value="">Semua Tipe</option>
                                <option value="dp">DP</option>
                                <option value="full">Full Payment</option>
                                <option value="installment">Installment</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Cari</label>
                            <input
                                type="text"
                                value={filter.search}
                                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                                placeholder="Cari order number, client..."
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Order</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Client</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Tipe</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Metode</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Jumlah</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Tanggal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                            Tidak ada pembayaran ditemukan
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{payment.order.order_number}</div>
                                                <div className="text-sm text-gray-500">{payment.order.event_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{payment.order.client.name}</div>
                                                <div className="text-sm text-gray-500">{payment.order.client.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPaymentTypeBadge(payment.payment_type)}`}
                                                >
                                                    {payment.payment_type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 capitalize">
                                                {payment.payment_method.replace('_', ' ')}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                                                Rp {payment.amount.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                {new Date(payment.payment_date).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(payment.status)}`}
                                                >
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => router.visit(`/admin/payments/${payment.id}`)}
                                                        className="text-[#D4AF37] hover:text-[#B4941F]"
                                                    >
                                                        Detail
                                                    </button>
                                                    {payment.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleVerify(payment.id)}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Verifikasi
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(payment.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Tolak
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-xl bg-yellow-50 p-6">
                        <div className="text-sm font-medium text-yellow-600">Pending</div>
                        <div className="mt-2 text-3xl font-bold text-yellow-900">{payments.filter((p) => p.status === 'pending').length}</div>
                    </div>
                    <div className="rounded-xl bg-green-50 p-6">
                        <div className="text-sm font-medium text-green-600">Verified</div>
                        <div className="mt-2 text-3xl font-bold text-green-900">{payments.filter((p) => p.status === 'verified').length}</div>
                    </div>
                    <div className="rounded-xl bg-red-50 p-6">
                        <div className="text-sm font-medium text-red-600">Rejected</div>
                        <div className="mt-2 text-3xl font-bold text-red-900">{payments.filter((p) => p.status === 'rejected').length}</div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default PaymentsPage;
