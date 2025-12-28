import { router } from '@inertiajs/react';
import axios from 'axios';
import React, { useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';

interface OrderDetail {
    id: number;
    order_number: string;
    order_code: string;
    client: {
        id: number;
        name: string;
        email: string;
        phone: string;
        address: string;
    };
    event_name: string;
    event_type: string;
    event_date: string;
    event_date_formatted: string;
    event_address: string;
    event_location: string;
    event_theme: string;
    guest_count: number;
    total_price: number;
    discount: number;
    final_price: number;
    dp_amount: number;
    deposit_amount: number;
    remaining_amount: number;
    status: string;
    payment_status: string;
    notes: string;
    special_requests: string;
    package: {
        id: number;
        name: string;
        price: number;
    } | null;
    package_details?: any;
    custom_items?: Array<{
        name: string;
        price: number;
        quantity: number;
        subtotal: number;
    }>;
    additional_costs?: number;
    negotiation_notes?: string;
    is_negotiable?: boolean;
    negotiated_at?: string | null;
    payment_proofs: PaymentProof[];
    payment_link_active: boolean;
    payment_link_expires_at: string | null;
    created_at: string;
    updated_at: string;
}

interface PaymentProof {
    id: number;
    amount: number;
    payment_type: 'dp' | 'full';
    proof_image_url: string;
    status: 'pending' | 'verified' | 'rejected';
    verified_by: string | null;
    verified_at: string | null;
    admin_notes: string | null;
    created_at: string;
}

interface Props {
    order: OrderDetail;
}

const OrderDetailPage: React.FC<Props> = ({ order }) => {
    const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
    const [paymentLink, setPaymentLink] = useState('');
    const [generatingLink, setGeneratingLink] = useState(false);
    const [linkError, setLinkError] = useState('');
    const [verifyingProof, setVerifyingProof] = useState<number | null>(null);
    const [confirmingOrder, setConfirmingOrder] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'pending':
            case 'pending_confirmation':
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

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'partial':
                return 'bg-yellow-100 text-yellow-800';
            case 'unpaid':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const contactWhatsApp = (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
        const message = `Halo ${order.client.name}, kami dari SistemDekor ingin menghubungi Anda terkait order *${order.order_code}* untuk acara ${order.event_name}.`;
        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const generatePaymentLink = async (paymentType?: 'dp' | 'full') => {
        setGeneratingLink(true);
        setLinkError('');

        try {
            const response = await axios.post(`/admin/orders/${order.id}/generate-payment-link`, {
                hours_valid: 48,
                payment_type: paymentType, // Send payment type if specified
            });

            setPaymentLink(response.data.link);
            setShowPaymentLinkModal(true);

            // Show success message with payment type
            if (response.data.payment_type) {
                alert(`Payment link for ${response.data.payment_type.toUpperCase()} generated successfully!`);
            }
        } catch (error: any) {
            if (error.response?.data?.link) {
                // Already has active link
                setPaymentLink(error.response.data.link);
                setShowPaymentLinkModal(true);
                alert(error.response.data.message || 'Using existing payment link');
            } else {
                setLinkError(error.response?.data?.message || 'Failed to generate payment link');
                alert(error.response?.data?.message || 'Failed to generate payment link');
            }
        } finally {
            setGeneratingLink(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(paymentLink);
        alert('Payment link copied to clipboard!');
    };

    const sendPaymentLinkViaWhatsApp = () => {
        const cleanPhone = order.client.phone.replace(/\D/g, '');
        const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
        const message = `Halo ${order.client.name}, berikut adalah link untuk upload bukti pembayaran order *${order.order_code}*:\n\n${paymentLink}\n\nLink ini berlaku selama 48 jam. Silakan upload bukti pembayaran DP atau lunas melalui link tersebut. Terima kasih!`;
        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const verifyPayment = async (proofId: number) => {
        if (!confirm('Apakah Anda yakin ingin memverifikasi pembayaran ini?')) {
            return;
        }

        setVerifyingProof(proofId);

        try {
            await axios.post(`/admin/payment-proofs/${proofId}/verify`);
            alert('Payment verified successfully!');
            router.reload();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to verify payment');
        } finally {
            setVerifyingProof(null);
        }
    };

    const rejectPayment = async (proofId: number) => {
        const reason = prompt('Masukkan alasan penolakan:');
        if (!reason) return;

        setVerifyingProof(proofId);

        try {
            await axios.post(`/admin/payment-proofs/${proofId}/reject`, {
                admin_notes: reason,
            });
            alert('Payment rejected. Payment link has been reactivated.');
            router.reload();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to reject payment');
        } finally {
            setVerifyingProof(null);
        }
    };

    const getProofStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const confirmOrder = async () => {
        if (!confirm('Apakah Anda yakin ingin mengkonfirmasi order ini? Order akan siap diproses setelah dikonfirmasi.')) {
            return;
        }

        setConfirmingOrder(true);

        try {
            await axios.post(`/admin/orders/${order.id}/confirm`);
            alert('Order berhasil dikonfirmasi! Order siap diproses.');
            router.reload();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Gagal mengkonfirmasi order');
        } finally {
            setConfirmingOrder(false);
        }
    };

    const updateOrderStatus = async (newStatus: string) => {
        const statusLabels = {
            processing: 'Sedang Diproses',
            completed: 'Selesai',
            cancelled: 'Dibatalkan',
        };

        const confirmMessage = `Apakah Anda yakin ingin mengubah status order menjadi "${statusLabels[newStatus as keyof typeof statusLabels]}"?`;

        if (!confirm(confirmMessage)) {
            return;
        }

        const notes = prompt('Catatan (opsional):');

        setUpdatingStatus(true);

        try {
            await axios.post(`/admin/orders/${order.id}/update-status`, {
                status: newStatus,
                notes: notes,
            });
            alert('Status order berhasil diupdate!');
            router.reload();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Gagal mengupdate status order');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const getOrderStatusInfo = (status: string) => {
        const statusInfo = {
            pending_confirmation: { label: 'Menunggu Konfirmasi', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
            negotiation: { label: 'Negosiasi', color: 'bg-blue-100 text-blue-800', icon: '💬' },
            awaiting_dp_payment: { label: 'Menunggu Pembayaran DP', color: 'bg-orange-100 text-orange-800', icon: '💳' },
            dp_paid: { label: 'DP Dibayar', color: 'bg-green-100 text-green-800', icon: '✓' },
            awaiting_full_payment: { label: 'Menunggu Pelunasan', color: 'bg-orange-100 text-orange-800', icon: '💳' },
            paid: { label: 'Lunas', color: 'bg-green-100 text-green-800', icon: '✓' },
            confirmed: { label: 'Terkonfirmasi', color: 'bg-blue-100 text-blue-800', icon: '✓' },
            processing: { label: 'Sedang Diproses', color: 'bg-purple-100 text-purple-800', icon: '⚙️' },
            completed: { label: 'Selesai', color: 'bg-green-100 text-green-800', icon: '✅' },
            cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800', icon: '✕' },
        };

        return statusInfo[status as keyof typeof statusInfo] || { label: status, color: 'bg-gray-100 text-gray-800', icon: '•' };
    };

    const getPaymentProgress = () => {
        const verifiedProofs = order.payment_proofs.filter((p: PaymentProof) => p.status === 'verified');
        const totalPaid = verifiedProofs.reduce((sum: number, p: PaymentProof) => sum + p.amount, 0);
        const percentage = Math.min((totalPaid / order.final_price) * 100, 100);

        return {
            totalPaid,
            percentage,
            hasDP: verifiedProofs.some((p: PaymentProof) => p.payment_type === 'dp'),
            hasFull: verifiedProofs.some((p: PaymentProof) => p.payment_type === 'full'),
        };
    };

    const paymentProgress = getPaymentProgress();

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <button onClick={() => router.visit('/admin/orders')} className="mb-2 flex items-center text-gray-600 hover:text-gray-900">
                            ← Kembali ke Daftar Order
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Detail Order: {order.order_code}</h1>
                        <p className="mt-1 text-sm text-gray-600">Dibuat: {order.created_at}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => contactWhatsApp(order.client.phone)}
                            className="flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600"
                        >
                            <span>📱</span>
                            <span>Hubungi via WhatsApp</span>
                        </button>
                        {order.is_negotiable && (
                            <button
                                onClick={() => router.visit(`/admin/orders/${order.id}/edit`)}
                                className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600"
                            >
                                <span>✏️</span>
                                <span>Edit Order</span>
                            </button>
                        )}
                        <button
                            onClick={() => {
                                // Auto-determine payment type based on status
                                if (order.payment_status === 'unpaid' || order.payment_status === 'dp_pending') {
                                    generatePaymentLink('dp');
                                } else if (order.payment_status === 'dp_paid' && order.remaining_amount > 0) {
                                    generatePaymentLink('full');
                                } else {
                                    generatePaymentLink();
                                }
                            }}
                            disabled={generatingLink || order.is_negotiable}
                            className="flex items-center gap-2 rounded-lg bg-purple-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-600 disabled:bg-gray-400"
                            title={order.is_negotiable ? 'Finalize order before generating payment link' : ''}
                        >
                            <span>🔗</span>
                            <span>
                                {generatingLink
                                    ? 'Generating...'
                                    : order.payment_status === 'dp_paid' && order.remaining_amount > 0
                                      ? 'Generate Pelunasan Link'
                                      : 'Generate Payment Link'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {linkError && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{linkError}</div>}

                {/* Payment Link Modal */}
                {showPaymentLinkModal && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                        <div className="mx-4 w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
                            <h2 className="mb-4 text-2xl font-bold text-gray-900">Payment Link Generated</h2>

                            <div className="mb-6">
                                <p className="mb-3 text-gray-600">Share this link with the client to upload payment proof:</p>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 break-all">
                                    <code className="text-sm text-purple-600">{paymentLink}</code>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={copyToClipboard}
                                    className="flex-1 rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                                >
                                    📋 Copy Link
                                </button>
                                <button
                                    onClick={sendPaymentLinkViaWhatsApp}
                                    className="flex-1 rounded-lg bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600"
                                >
                                    📱 Send via WhatsApp
                                </button>
                                <button
                                    onClick={() => setShowPaymentLinkModal(false)}
                                    className="rounded-lg bg-purple-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-600"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="mb-2 text-sm text-gray-600">Status Order</div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{getOrderStatusInfo(order.status).icon}</span>
                            <span className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${getOrderStatusInfo(order.status).color}`}>
                                {getOrderStatusInfo(order.status).label}
                            </span>
                        </div>
                    </div>
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="mb-2 text-sm text-gray-600">Status Pembayaran</div>
                        <span className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${getPaymentStatusColor(order.payment_status)}`}>
                            {order.payment_status.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="mb-2 text-sm text-gray-600">Progress Pembayaran</div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                                        style={{ width: `${paymentProgress.percentage}%` }}
                                    />
                                </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{Math.round(paymentProgress.percentage)}%</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                            Terbayar: {formatCurrency(paymentProgress.totalPaid)} / {formatCurrency(order.final_price)}
                        </div>
                    </div>
                </div>

                {/* Action Buttons - Conditional based on Order Status */}
                <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                        <span>🎯</span>
                        <span>Langkah Selanjutnya</span>
                    </h3>

                    <div className="space-y-3">
                        {/* Step 1: Negosiasi */}
                        {order.is_negotiable && (
                            <div className="flex items-start gap-4 rounded-lg border-l-4 border-blue-500 bg-white p-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                                    1
                                </div>
                                <div className="flex-1">
                                    <h4 className="mb-1 font-semibold text-gray-900">Finalisasi Order</h4>
                                    <p className="mb-3 text-sm text-gray-600">
                                        Order masih dalam tahap negosiasi. Edit dan finalisasi order sebelum generate payment link.
                                    </p>
                                    <button
                                        onClick={() => router.visit(`/admin/orders/${order.id}/edit`)}
                                        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                                    >
                                        ✏️ Edit & Finalisasi Order
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Generate Payment Link for DP */}
                        {!order.is_negotiable &&
                            (order.payment_status === 'unpaid' || order.payment_status === 'dp_pending') &&
                            !order.payment_link_active && (
                                <div className="flex items-start gap-4 rounded-lg border-l-4 border-purple-500 bg-white p-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-600">
                                        2
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="mb-1 font-semibold text-gray-900">Generate Payment Link - DP</h4>
                                        <p className="mb-3 text-sm text-gray-600">
                                            Order sudah difinalisasi. Generate link pembayaran DP dan kirim ke client.
                                        </p>
                                        <button
                                            onClick={() => generatePaymentLink('dp')}
                                            disabled={generatingLink}
                                            className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600 disabled:bg-gray-400"
                                        >
                                            {generatingLink ? 'Generating...' : '🔗 Generate DP Payment Link'}
                                        </button>
                                    </div>
                                </div>
                            )}

                        {/* Step 2b: Generate Payment Link for Full Payment (after DP paid) */}
                        {!order.is_negotiable && order.payment_status === 'dp_paid' && order.remaining_amount > 0 && !order.payment_link_active && (
                            <div className="flex items-start gap-4 rounded-lg border-l-4 border-purple-500 bg-white p-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-600">
                                    2b
                                </div>
                                <div className="flex-1">
                                    <h4 className="mb-1 font-semibold text-gray-900">Generate Payment Link - Pelunasan</h4>
                                    <p className="mb-3 text-sm text-gray-600">
                                        DP sudah dibayar. Generate link pelunasan (Rp {order.remaining_amount?.toLocaleString('id-ID')}) dan kirim ke
                                        client.
                                    </p>
                                    <button
                                        onClick={() => generatePaymentLink('full')}
                                        disabled={generatingLink}
                                        className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600 disabled:bg-gray-400"
                                    >
                                        {generatingLink ? 'Generating...' : '🔗 Generate Pelunasan Payment Link'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Verify Payment */}
                        {order.payment_proofs.some((p: PaymentProof) => p.status === 'pending') && (
                            <div className="flex items-start gap-4 rounded-lg border-l-4 border-orange-500 bg-white p-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                                    3
                                </div>
                                <div className="flex-1">
                                    <h4 className="mb-1 font-semibold text-gray-900">Verifikasi Pembayaran</h4>
                                    <p className="mb-3 text-sm text-gray-600">
                                        Ada bukti pembayaran yang menunggu verifikasi. Lihat dan verifikasi di bagian "Bukti Pembayaran" di bawah.
                                    </p>
                                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600">
                                        <span className="animate-pulse">●</span>
                                        {order.payment_proofs.filter((p: PaymentProof) => p.status === 'pending').length} Pembayaran Menunggu
                                        Verifikasi
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Confirm Order */}
                        {(order.status === 'dp_paid' || order.status === 'paid') && order.status !== 'confirmed' && (
                            <div className="flex items-start gap-4 rounded-lg border-l-4 border-green-500 bg-white p-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-600">
                                    4
                                </div>
                                <div className="flex-1">
                                    <h4 className="mb-1 font-semibold text-gray-900">Konfirmasi Order</h4>
                                    <p className="mb-3 text-sm text-gray-600">
                                        {order.status === 'paid'
                                            ? 'Pembayaran LUNAS terverifikasi. Konfirmasi order untuk mulai proses.'
                                            : 'Pembayaran DP terverifikasi. Konfirmasi order untuk mulai proses (pelunasan bisa dilakukan kemudian).'}
                                    </p>
                                    <button
                                        onClick={confirmOrder}
                                        disabled={confirmingOrder}
                                        className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:bg-gray-400"
                                    >
                                        {confirmingOrder ? 'Konfirmasi...' : '✅ Konfirmasi Order'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Process Order */}
                        {order.status === 'confirmed' && (
                            <div className="flex items-start gap-4 rounded-lg border-l-4 border-indigo-500 bg-white p-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                                    5
                                </div>
                                <div className="flex-1">
                                    <h4 className="mb-1 font-semibold text-gray-900">Mulai Proses Order</h4>
                                    <p className="mb-3 text-sm text-gray-600">
                                        Order sudah dikonfirmasi. Ubah status ke "Sedang Diproses" untuk mulai pengerjaan.
                                    </p>
                                    <button
                                        onClick={() => updateOrderStatus('processing')}
                                        disabled={updatingStatus}
                                        className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:bg-gray-400"
                                    >
                                        {updatingStatus ? 'Updating...' : '⚙️ Mulai Proses'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 6: Complete Order */}
                        {order.status === 'processing' && (
                            <div className="flex items-start gap-4 rounded-lg border-l-4 border-emerald-500 bg-white p-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-600">
                                    6
                                </div>
                                <div className="flex-1">
                                    <h4 className="mb-1 font-semibold text-gray-900">Selesaikan Order</h4>
                                    <p className="mb-3 text-sm text-gray-600">
                                        Order sedang diproses. Tandai sebagai selesai setelah acara berlangsung.
                                    </p>
                                    <button
                                        onClick={() => updateOrderStatus('completed')}
                                        disabled={updatingStatus}
                                        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:bg-gray-400"
                                    >
                                        {updatingStatus ? 'Updating...' : '✅ Tandai Selesai'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Completed Status */}
                        {order.status === 'completed' && (
                            <div className="flex items-center justify-center gap-3 rounded-lg border-2 border-green-500 bg-white p-6">
                                <span className="text-4xl">🎉</span>
                                <div>
                                    <h4 className="text-lg font-bold text-green-600">Order Selesai!</h4>
                                    <p className="text-sm text-gray-600">Terima kasih telah menyelesaikan order ini.</p>
                                </div>
                            </div>
                        )}

                        {/* Cancel Option */}
                        {!['completed', 'cancelled'].includes(order.status) && (
                            <div className="border-t pt-3">
                                <button
                                    onClick={() => updateOrderStatus('cancelled')}
                                    disabled={updatingStatus}
                                    className="text-sm font-medium text-red-600 hover:text-red-700"
                                >
                                    ✕ Batalkan Order
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Cards - OLD VERSION REMOVED */}
                <div className="hidden grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="mb-2 text-sm text-gray-600">Status Order</div>
                        <span className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${getStatusBadgeColor(order.status)}`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="mb-2 text-sm text-gray-600">Status Pembayaran</div>
                        <span className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${getPaymentStatusColor(order.payment_status)}`}>
                            {order.payment_status.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Client Information */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold text-gray-900">Informasi Client</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <div className="text-sm text-gray-600">Nama</div>
                            <div className="mt-1 font-semibold text-gray-900">{order.client.name}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Email</div>
                            <div className="mt-1 font-semibold text-gray-900">{order.client.email}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Telepon</div>
                            <div className="mt-1 font-semibold text-gray-900">{order.client.phone}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Alamat</div>
                            <div className="mt-1 font-semibold text-gray-900">{order.client.address}</div>
                        </div>
                    </div>
                </div>

                {/* Event Information */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold text-gray-900">Detail Acara</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <div className="text-sm text-gray-600">Nama Acara</div>
                            <div className="mt-1 font-semibold text-gray-900">{order.event_name}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Jenis Acara</div>
                            <div className="mt-1 font-semibold text-gray-900">{order.event_type}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Tanggal Acara</div>
                            <div className="mt-1 font-semibold text-gray-900">{order.event_date_formatted}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Jumlah Tamu</div>
                            <div className="mt-1 font-semibold text-gray-900">{order.guest_count} orang</div>
                        </div>
                        <div className="md:col-span-2">
                            <div className="text-sm text-gray-600">Lokasi Acara</div>
                            <div className="mt-1 font-semibold text-gray-900">{order.event_location}</div>
                        </div>
                        <div className="md:col-span-2">
                            <div className="text-sm text-gray-600">Alamat Lengkap</div>
                            <div className="mt-1 font-semibold text-gray-900">{order.event_address}</div>
                        </div>
                        {order.event_theme && (
                            <div className="md:col-span-2">
                                <div className="text-sm text-gray-600">Tema Acara</div>
                                <div className="mt-1 font-semibold text-gray-900">{order.event_theme}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Package Information */}
                {order.package && (
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">Paket Dipilih</h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-lg font-semibold text-gray-900">{order.package.name}</div>
                                <div className="mt-1 text-sm text-gray-600">Harga Paket</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-pink-600">{formatCurrency(order.package.price)}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Custom Items */}
                {order.custom_items && order.custom_items.length > 0 && (
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">Item Tambahan (Custom)</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="pb-2 text-left text-sm font-semibold text-gray-700">Nama Item</th>
                                        <th className="pb-2 text-right text-sm font-semibold text-gray-700">Harga</th>
                                        <th className="pb-2 text-center text-sm font-semibold text-gray-700">Qty</th>
                                        <th className="pb-2 text-right text-sm font-semibold text-gray-700">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.custom_items.map((item, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="py-3 text-gray-900">{item.name}</td>
                                            <td className="py-3 text-right text-gray-900">{formatCurrency(item.price)}</td>
                                            <td className="py-3 text-center text-gray-900">{item.quantity}</td>
                                            <td className="py-3 text-right font-semibold text-gray-900">{formatCurrency(item.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Negotiation Notes */}
                {order.negotiation_notes && (
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">Catatan Negosiasi</h2>
                        <div className="rounded-lg bg-blue-50 p-4 text-gray-900">
                            <div className="whitespace-pre-wrap">{order.negotiation_notes}</div>
                        </div>
                        {order.negotiated_at && <div className="mt-3 text-sm text-gray-600">Dinegosiasikan pada: {order.negotiated_at}</div>}
                    </div>
                )}

                {/* Additional Costs */}
                {order.additional_costs && order.additional_costs > 0 && (
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">Biaya Tambahan</h2>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Biaya tambahan (transportasi, overtime, dll)</span>
                            <span className="text-xl font-bold text-orange-600">{formatCurrency(order.additional_costs)}</span>
                        </div>
                    </div>
                )}

                {/* Pricing Information */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold text-gray-900">Rincian Harga</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-gray-600">Total Harga</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(order.total_price)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-gray-600">Diskon</span>
                                <span className="font-semibold text-red-600">-{formatCurrency(order.discount)}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between border-b border-gray-300 pb-2">
                            <span className="text-lg font-semibold text-gray-900">Harga Final</span>
                            <span className="text-2xl font-bold text-pink-600">{formatCurrency(order.final_price)}</span>
                        </div>
                        {order.deposit_amount > 0 && (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">DP Dibayar</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(order.deposit_amount)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Sisa Pembayaran</span>
                                    <span className="font-semibold text-orange-600">{formatCurrency(order.remaining_amount)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Notes & Special Requests */}
                {(order.notes || order.special_requests) && (
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">Catatan & Permintaan Khusus</h2>
                        <div className="space-y-4">
                            {order.notes && (
                                <div>
                                    <div className="text-sm text-gray-600">Catatan</div>
                                    <div className="mt-1 rounded-lg bg-gray-50 p-4 text-gray-900">{order.notes}</div>
                                </div>
                            )}
                            {order.special_requests && (
                                <div>
                                    <div className="text-sm text-gray-600">Permintaan Khusus</div>
                                    <div className="mt-1 rounded-lg bg-gray-50 p-4 text-gray-900">{order.special_requests}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Payment Proofs Section */}
                {order.payment_proofs && order.payment_proofs.length > 0 && (
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">Bukti Pembayaran</h2>
                        <div className="space-y-4">
                            {order.payment_proofs.map((proof) => (
                                <div key={proof.id} className="rounded-lg border border-gray-200 p-4">
                                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <div className="mb-2 text-sm text-gray-600">Bukti Pembayaran</div>
                                            <a href={proof.proof_image_url} target="_blank" rel="noopener noreferrer" className="inline-block">
                                                <img
                                                    src={proof.proof_image_url}
                                                    alt="Payment Proof"
                                                    className="h-auto max-h-64 max-w-full rounded-lg border border-gray-300 transition-opacity hover:opacity-80"
                                                />
                                            </a>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-sm text-gray-600">Jumlah</div>
                                                <div className="text-lg font-bold text-gray-900">{formatCurrency(proof.amount)}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">Tipe Pembayaran</div>
                                                <div className="font-semibold text-gray-900">
                                                    {proof.payment_type === 'dp' ? 'Down Payment (DP)' : 'Pelunasan'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">Status</div>
                                                <span
                                                    className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getProofStatusBadge(proof.status)}`}
                                                >
                                                    {proof.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">Tanggal Upload</div>
                                                <div className="text-gray-900">{proof.created_at}</div>
                                            </div>
                                            {proof.verified_at && (
                                                <div>
                                                    <div className="text-sm text-gray-600">Diverifikasi</div>
                                                    <div className="text-gray-900">
                                                        {proof.verified_at} oleh {proof.verified_by}
                                                    </div>
                                                </div>
                                            )}
                                            {proof.admin_notes && (
                                                <div>
                                                    <div className="text-sm text-gray-600">Catatan Admin</div>
                                                    <div className="rounded bg-gray-50 p-2 text-gray-900">{proof.admin_notes}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {proof.status === 'pending' && (
                                        <div className="flex gap-3 border-t border-gray-200 pt-4">
                                            <button
                                                onClick={() => verifyPayment(proof.id)}
                                                disabled={verifyingProof === proof.id}
                                                className="flex-1 rounded-lg bg-green-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-600 disabled:bg-gray-400"
                                            >
                                                ✓ Verifikasi Pembayaran
                                            </button>
                                            <button
                                                onClick={() => rejectPayment(proof.id)}
                                                disabled={verifyingProof === proof.id}
                                                className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-600 disabled:bg-gray-400"
                                            >
                                                ✗ Tolak Pembayaran
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => router.visit('/admin/orders')}
                        className="flex-1 rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-300"
                    >
                        Kembali
                    </button>
                    <button
                        onClick={() => contactWhatsApp(order.client.phone)}
                        className="flex-1 rounded-lg bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600"
                    >
                        Hubungi Client
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default OrderDetailPage;
