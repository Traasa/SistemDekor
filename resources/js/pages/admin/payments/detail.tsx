import { router } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import api from '../../../services/api';

interface PaymentDetail {
    id: number;
    order_id: number;
    amount: number;
    payment_type: string;
    payment_method: string;
    payment_date: string;
    status: string;
    proof_url: string | null;
    notes: string | null;
    created_at: string;
    order: {
        id: number;
        order_number: string;
        client: {
            id: number;
            name: string;
            email: string;
            phone: string;
            address: string;
        };
        package: {
            id: number;
            name: string;
            base_price: number;
        } | null;
        event_name: string;
        event_type: string;
        event_date: string;
        event_address: string;
        guest_count: number;
        total_price: number;
        dp_amount: number;
        status: string;
        notes: string | null;
        special_requests: string | null;
    };
}

const PaymentDetailPage: React.FC<{ id: string }> = ({ id }) => {
    const [payment, setPayment] = useState<PaymentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchPaymentDetail();
    }, [id]);

    const fetchPaymentDetail = async () => {
        try {
            const response = await api.get(`/payment-transactions/${id}`);
            if (response.data.success) {
                setPayment(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch payment:', error);
            alert('Gagal memuat data pembayaran');
            router.visit('/admin/payments');
        } finally {
            setLoading(false);
        }
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    const handleDownloadInvoice = async () => {
        try {
            const response = await api.get(`/payment-transactions/${id}/invoice`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${payment?.order.order_number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Gagal download invoice');
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex h-64 items-center justify-center">
                    <div className="text-lg text-gray-500">Loading...</div>
                </div>
            </AdminLayout>
        );
    }

    if (!payment) {
        return (
            <AdminLayout>
                <div className="flex h-64 items-center justify-center">
                    <div className="text-lg text-gray-500">Payment not found</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between print:hidden">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Detail Pembayaran</h1>
                        <p className="mt-1 text-sm text-gray-600">#{payment.order.order_number}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.visit('/admin/payments')}
                            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                        >
                            ← Kembali
                        </button>
                        <button
                            onClick={handlePrintInvoice}
                            className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-medium text-white hover:bg-[#B4941F]"
                        >
                            🖨️ Print Invoice
                        </button>
                        <button
                            onClick={handleDownloadInvoice}
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                            📥 Download PDF
                        </button>
                    </div>
                </div>

                {/* Invoice */}
                <div ref={invoiceRef} className="rounded-xl bg-white p-8 shadow-sm print:shadow-none">
                    {/* Invoice Header */}
                    <div className="mb-8 flex items-start justify-between border-b pb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-[#D4AF37]">INVOICE</h2>
                            <p className="mt-2 text-sm text-gray-600">SistemDekor</p>
                            <p className="text-sm text-gray-600">Wedding & Event Decoration</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-600">Invoice Number</div>
                            <div className="text-lg font-bold text-gray-900">{payment.order.order_number}</div>
                            <div className="mt-2 text-sm text-gray-600">Date: {new Date(payment.created_at).toLocaleDateString('id-ID')}</div>
                        </div>
                    </div>

                    {/* Client Info */}
                    <div className="mb-8 grid gap-8 md:grid-cols-2">
                        <div>
                            <div className="mb-2 text-sm font-semibold text-gray-500 uppercase">Bill To:</div>
                            <div className="font-semibold text-gray-900">{payment.order.client.name}</div>
                            <div className="text-sm text-gray-600">{payment.order.client.email}</div>
                            <div className="text-sm text-gray-600">{payment.order.client.phone}</div>
                            <div className="text-sm text-gray-600">{payment.order.client.address}</div>
                        </div>
                        <div>
                            <div className="mb-2 text-sm font-semibold text-gray-500 uppercase">Event Details:</div>
                            <div className="font-semibold text-gray-900">{payment.order.event_name}</div>
                            <div className="text-sm text-gray-600">Type: {payment.order.event_type}</div>
                            <div className="text-sm text-gray-600">Date: {new Date(payment.order.event_date).toLocaleDateString('id-ID')}</div>
                            <div className="text-sm text-gray-600">Guests: {payment.order.guest_count}</div>
                            <div className="text-sm text-gray-600">Location: {payment.order.event_address}</div>
                        </div>
                    </div>

                    {/* Package Info */}
                    {payment.order.package && (
                        <div className="mb-8">
                            <div className="mb-2 text-sm font-semibold text-gray-500 uppercase">Package:</div>
                            <div className="rounded-lg bg-gray-50 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="font-semibold text-gray-900">{payment.order.package.name}</div>
                                    <div className="font-semibold text-gray-900">Rp {payment.order.package.base_price.toLocaleString('id-ID')}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Details */}
                    <div className="mb-8">
                        <table className="w-full">
                            <thead className="border-b-2 border-gray-300">
                                <tr>
                                    <th className="py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                                    <th className="py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="py-4 text-gray-900">Total Package/Service Price</td>
                                    <td className="py-4 text-right font-semibold text-gray-900">
                                        Rp {payment.order.total_price.toLocaleString('id-ID')}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 text-gray-900">Down Payment (DP) Required</td>
                                    <td className="py-4 text-right font-semibold text-gray-900">
                                        Rp {payment.order.dp_amount.toLocaleString('id-ID')}
                                    </td>
                                </tr>
                                <tr className="bg-[#D4AF37]/10">
                                    <td className="py-4 font-semibold text-gray-900">
                                        {payment.payment_type === 'dp' ? 'Payment (DP)' : 'Full Payment'}
                                    </td>
                                    <td className="py-4 text-right text-xl font-bold text-[#D4AF37]">Rp {payment.amount.toLocaleString('id-ID')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Payment Info */}
                    <div className="mb-8 rounded-lg bg-gray-50 p-6">
                        <div className="mb-3 font-semibold text-gray-900">Payment Information</div>
                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <div className="text-sm text-gray-600">Payment Method:</div>
                                <div className="font-medium text-gray-900 capitalize">{payment.payment_method.replace('_', ' ')}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Payment Date:</div>
                                <div className="font-medium text-gray-900">{new Date(payment.payment_date).toLocaleDateString('id-ID')}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Status:</div>
                                <div
                                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                        payment.status === 'verified'
                                            ? 'bg-green-100 text-green-800'
                                            : payment.status === 'pending'
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {payment.status.toUpperCase()}
                                </div>
                            </div>
                        </div>
                        {payment.notes && (
                            <div className="mt-4">
                                <div className="text-sm text-gray-600">Notes:</div>
                                <div className="text-gray-900">{payment.notes}</div>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    {(payment.order.notes || payment.order.special_requests) && (
                        <div className="mb-8 border-t pt-6">
                            {payment.order.notes && (
                                <div className="mb-4">
                                    <div className="mb-2 text-sm font-semibold text-gray-500 uppercase">Order Notes:</div>
                                    <div className="text-sm text-gray-700">{payment.order.notes}</div>
                                </div>
                            )}
                            {payment.order.special_requests && (
                                <div>
                                    <div className="mb-2 text-sm font-semibold text-gray-500 uppercase">Special Requests:</div>
                                    <div className="text-sm text-gray-700">{payment.order.special_requests}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="border-t pt-6 text-center text-sm text-gray-600">
                        <p>Thank you for your business!</p>
                        <p className="mt-2">Untuk pertanyaan lebih lanjut, hubungi kami di sistemdekor@email.com</p>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>
        </AdminLayout>
    );
};

export default PaymentDetailPage;
