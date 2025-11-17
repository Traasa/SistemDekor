import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import api from '../../../services/api';

interface Invoice {
    id: number;
    order_number: string;
    client: {
        name: string;
        email: string;
        phone: string;
    };
    event_name: string;
    event_date: string;
    total_price: number;
    dp_amount: number;
    status: string;
    created_at: string;
    payment_transactions: Array<{
        id: number;
        amount: number;
        payment_type: string;
        status: string;
        payment_date: string;
    }>;
}

const InvoicesPage: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        status: '',
        search: '',
    });

    useEffect(() => {
        fetchInvoices();
    }, [filter]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter.status) params.append('status', filter.status);
            if (filter.search) params.append('search', filter.search);

            const response = await api.get(`/orders?${params.toString()}`);
            console.log('Invoice API Response:', response.data);

            if (response.data.success) {
                const data = Array.isArray(response.data.data) ? response.data.data : [];
                setInvoices(data);
            } else {
                setInvoices([]);
            }
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    const calculatePaidAmount = (payments: Invoice['payment_transactions']) => {
        return payments.filter((p) => p.status === 'verified').reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
    };

    const calculateRemainingAmount = (invoice: Invoice) => {
        const paid = calculatePaidAmount(invoice.payment_transactions);
        return invoice.total_price - paid;
    };

    const getPaymentStatus = (invoice: Invoice) => {
        const paid = calculatePaidAmount(invoice.payment_transactions);
        if (paid === 0) return { label: 'Unpaid', color: 'bg-red-100 text-red-800' };
        if (paid >= invoice.total_price) return { label: 'Paid', color: 'bg-green-100 text-green-800' };
        return { label: 'Partially Paid', color: 'bg-yellow-100 text-yellow-800' };
    };

    const handleDownloadInvoice = async (orderId: number, orderNumber: string) => {
        try {
            const response = await api.get(`/orders/${orderId}/invoice`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${orderNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Gagal download invoice');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manajemen Invoice</h1>
                        <p className="mt-1 text-sm text-gray-600">Kelola invoice dan tracking pembayaran</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status Order</label>
                            <select
                                value={filter.status}
                                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                            >
                                <option value="">Semua Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Cari</label>
                            <input
                                type="text"
                                value={filter.search}
                                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                                placeholder="Cari order number, client, event..."
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Invoices Table */}
                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Invoice #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Client</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Event</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Paid</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Remaining</th>
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
                                ) : invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                            Tidak ada invoice ditemukan
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.map((invoice) => {
                                        const paymentStatus = getPaymentStatus(invoice);
                                        const remaining = calculateRemainingAmount(invoice);
                                        const paid = calculatePaidAmount(invoice.payment_transactions);

                                        return (
                                            <tr key={invoice.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{invoice.order_number}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(invoice.created_at).toLocaleDateString('id-ID')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{invoice.client.name}</div>
                                                    <div className="text-sm text-gray-500">{invoice.client.phone}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{invoice.event_name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(invoice.event_date).toLocaleDateString('id-ID')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                                                    Rp {invoice.total_price.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-green-600">
                                                    Rp {paid.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-red-600">
                                                    Rp {remaining.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${paymentStatus.color}`}
                                                    >
                                                        {paymentStatus.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => router.visit(`/admin/orders/${invoice.id}`)}
                                                            className="text-[#D4AF37] hover:text-[#B4941F]"
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownloadInvoice(invoice.id, invoice.order_number)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            Download
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-6 md:grid-cols-4">
                    <div className="rounded-xl bg-blue-50 p-6">
                        <div className="text-sm font-medium text-blue-600">Total Invoices</div>
                        <div className="mt-2 text-3xl font-bold text-blue-900">{invoices.length}</div>
                    </div>
                    <div className="rounded-xl bg-green-50 p-6">
                        <div className="text-sm font-medium text-green-600">Paid</div>
                        <div className="mt-2 text-3xl font-bold text-green-900">
                            {invoices.filter((inv) => calculateRemainingAmount(inv) === 0).length}
                        </div>
                    </div>
                    <div className="rounded-xl bg-yellow-50 p-6">
                        <div className="text-sm font-medium text-yellow-600">Partially Paid</div>
                        <div className="mt-2 text-3xl font-bold text-yellow-900">
                            {
                                invoices.filter((inv) => {
                                    const paid = calculatePaidAmount(inv.payment_transactions);
                                    return paid > 0 && paid < inv.total_price;
                                }).length
                            }
                        </div>
                    </div>
                    <div className="rounded-xl bg-red-50 p-6">
                        <div className="text-sm font-medium text-red-600">Unpaid</div>
                        <div className="mt-2 text-3xl font-bold text-red-900">
                            {invoices.filter((inv) => calculatePaidAmount(inv.payment_transactions) === 0).length}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default InvoicesPage;
