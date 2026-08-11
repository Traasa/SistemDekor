import { router } from '@inertiajs/react';
import axios from 'axios';
import React, { useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { formatRupiah } from '@/utils/formatRupiah';

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
    payment_link_token: string | null;
    payment_link_expires_at: string | null;
    payment_link_type?: 'booking' | 'dp' | 'installment' | 'full' | null;
    payment_link_amount?: number | null;
    created_at: string;
    updated_at: string;
    booking_amount?: number;
    initial_payment_type?: 'booking' | 'dp' | null;
}

interface PaymentProof {
    id: number;
    amount: number;
    payment_type: 'booking' | 'dp' | 'installment' | 'full';
    proof_image_url: string | null;
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
    const [installmentAmount, setInstallmentAmount] = useState('');
    const [verifyingProof, setVerifyingProof] = useState<number | null>(null);
    const [confirmingOrder, setConfirmingOrder] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const formatCurrency = (amount: number) => {
        return formatRupiah(amount);
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

    const generatePaymentLink = async (paymentType?: 'booking' | 'dp' | 'installment' | 'full', paymentAmount?: number) => {
        setGeneratingLink(true);
        setLinkError('');

        try {
            const response = await axios.post(`/admin/orders/${order.id}/generate-payment-link`, {
                hours_valid: 48,
                payment_type: paymentType, // Send payment type if specified
                payment_amount: paymentAmount,
            });

            setPaymentLink(response.data.link);
            setShowPaymentLinkModal(true);

            // Show success message with payment type
            if (response.data.payment_type) {
                await window.showAlert(`Payment link for ${response.data.payment_type.toUpperCase()} generated successfully!`);
            }
        } catch (error: any) {
            if (error.response?.data?.link) {
                // Already has active link
                setPaymentLink(error.response.data.link);
                setShowPaymentLinkModal(true);
                await window.showAlert(error.response.data.message || 'Using existing payment link');
            } else {
                setLinkError(error.response?.data?.message || 'Failed to generate payment link');
                await window.showAlert(error.response?.data?.message || 'Failed to generate payment link');
            }
        } finally {
            setGeneratingLink(false);
        }
    };

    const copyToClipboard = async (linkToCopy?: string) => {
        const textToCopy = linkToCopy || paymentLink;
        if (!textToCopy) {
            await window.showAlert('Link pembayaran tidak tersedia.');
            return;
        }
        navigator.clipboard.writeText(textToCopy);
        await window.showAlert('Payment link copied to clipboard!');
    };

    const cancelPaymentLink = async () => {
        if (!await window.showConfirm('Apakah Anda yakin ingin membatalkan link pembayaran yang aktif ini?')) {
            return;
        }

        try {
            await axios.post(`/admin/orders/${order.id}/cancel-payment-link`);
            await window.showAlert('Link pembayaran berhasil dibatalkan.');
            router.reload();
        } catch (error: any) {
            await window.showAlert(error.response?.data?.message || 'Gagal membatalkan link pembayaran');
        }
    };

    const downloadDocument = (type: 'invoice' | 'contract') => {
        window.open(`/admin/orders/${order.id}/${type}`, '_blank');
    };

    const sendPaymentLinkViaWhatsApp = () => {
        const cleanPhone = order.client.phone.replace(/\D/g, '');
        const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

        let paymentPurpose = 'Pembayaran';
        let amountToPay = 0;

        if (order.payment_link_active && order.payment_link_type) {
            if (order.payment_link_type === 'booking') paymentPurpose = 'Booking Fee';
            else if (order.payment_link_type === 'dp') paymentPurpose = 'DP (Down Payment)';
            else if (order.payment_link_type === 'installment') paymentPurpose = 'Cicilan';
            else if (order.payment_link_type === 'full') paymentPurpose = 'Pelunasan';

            amountToPay = order.payment_link_amount || order.final_price;
        } else {
            const hasVerifiedBooking = order.payment_proofs?.some((p: PaymentProof) => p.payment_type === 'booking' && p.status === 'verified');
            const hasVerifiedDP = order.payment_proofs?.some((p: PaymentProof) => p.payment_type === 'dp' && p.status === 'verified');

            if (order.initial_payment_type === 'booking' && !hasVerifiedBooking) {
                paymentPurpose = 'Booking Fee';
                amountToPay = (order.booking_amount ?? 0) > 0 ? Number(order.booking_amount) : order.final_price;
            } else if (!hasVerifiedDP) {
                paymentPurpose = 'DP (Down Payment)';
                amountToPay = (order.dp_amount ?? 0) > 0 ? Number(order.dp_amount) : order.final_price;
            } else {
                paymentPurpose = 'Pelunasan / Cicilan';
                amountToPay = (order.remaining_amount ?? 0) > 0 ? Number(order.remaining_amount) : order.final_price;
            }
        }

        const message = `Halo ${order.client.name},

Berikut adalah rincian untuk pembayaran order ${order.order_code} (${order.event_name}):

Total Biaya : ${formatRupiah(order.final_price)}
Tujuan Pembayaran : ${paymentPurpose}
Jumlah yang harus dibayar saat ini : ${formatRupiah(amountToPay)}

TATA CARA PEMBAYARAN (TRANSFER BANK):
Bank: BCA
No. Rekening: 7180 1918 90
Atas Nama: SUSILOWATI

Langkah-langkah:
1. Lakukan transfer sesuai nominal "Jumlah yang harus dibayar saat ini" ke rekening BCA yang tertera.
2. Simpan struk/bukti transfer Anda.
3. Buka link berikut untuk mengunggah (upload) bukti transfer:
${paymentLink}

Link upload berlaku selama 48 jam. Terima kasih!`;

        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const verifyPayment = async (proofId: number) => {
        if (!await window.showConfirm('Apakah Anda yakin ingin memverifikasi pembayaran ini?')) {
            return;
        }

        setVerifyingProof(proofId);

        try {
            await axios.post(`/admin/payment-proofs/${proofId}/verify`);
            await window.showAlert('Payment verified successfully!');
            router.reload();
        } catch (error: any) {
            await window.showAlert(error.response?.data?.message || 'Failed to verify payment');
        } finally {
            setVerifyingProof(null);
        }
    };

    const rejectPayment = async (proofId: number) => {
        const reason = prompt('Masukkan alasan penolakan:');
        if (!reason) return;

        setVerifyingProof(proofId);

        try {
            const response = await axios.post(`/admin/payment-proofs/${proofId}/reject`, {
                admin_notes: reason,
            });
            
            const newLink = response.data.new_link;
            const cleanPhone = order.client.phone.replace(/\D/g, '');
            const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
            
            const message = `Halo ${order.client.name},

Mohon maaf, bukti pembayaran Anda untuk order ${order.order_code} (${order.event_name}) telah *DITOLAK* oleh Admin.

*Alasan Penolakan*: 
${reason}

Silakan lakukan pembayaran ulang dan unggah (upload) kembali bukti transfer yang benar melalui link pembayaran baru berikut ini:
${newLink}

Link berlaku selama 48 jam. Terima kasih!`;

            window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');

            await window.showAlert('Payment rejected. New payment link has been generated and sent via WhatsApp.');
            router.reload();
        } catch (error: any) {
            await window.showAlert(error.response?.data?.message || 'Failed to reject payment');
        } finally {
            setVerifyingProof(null);
        }
    };

    const directConfirmPayment = async (paymentType: 'booking' | 'dp' | 'full') => {
        const defaultAmount = paymentType === 'full' ? order.remaining_amount : paymentType === 'dp' ? order.dp_amount : order.booking_amount || 0;
        const normalizedDefault = Math.max(Math.round(defaultAmount || 0), 0);
        const amountInput = prompt(
            `Masukkan nominal pembayaran ${paymentType.toUpperCase()} (Rp). Contoh: 1500000`,
            String(normalizedDefault),
        );

        if (!amountInput) {
            return;
        }

        const normalizedInput = amountInput.replace(/[^\d]/g, '');
        const amount = Number(normalizedInput);
        if (Number.isNaN(amount) || amount <= 0) {
            await window.showAlert('Nominal pembayaran tidak valid.');
            return;
        }

        const notes = prompt('Catatan admin (opsional):', 'Pembayaran langsung saat pertemuan dengan client.') || undefined;

        if (!await window.showConfirm(`Konfirmasi pembayaran ${paymentType.toUpperCase()} sebesar ${formatCurrency(amount)} sekarang?`)) {
            return;
        }

        try {
            await axios.post(`/admin/orders/${order.id}/direct-payment-confirm`, {
                payment_type: paymentType,
                amount,
                admin_notes: notes,
                auto_confirm_order: true,
            });

            await window.showAlert('Pembayaran onsite berhasil dikonfirmasi.');
            router.reload();
        } catch (error: any) {
            await window.showAlert(error.response?.data?.message || 'Gagal mengonfirmasi pembayaran onsite.');
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
        if (!await window.showConfirm('Apakah Anda yakin ingin mengkonfirmasi order ini? Order akan siap diproses setelah dikonfirmasi.')) {
            return;
        }

        setConfirmingOrder(true);

        try {
            await axios.post(`/admin/orders/${order.id}/confirm`);
            await window.showAlert('Order berhasil dikonfirmasi! Order siap diproses.');
            router.reload();
        } catch (error: any) {
            await window.showAlert(error.response?.data?.message || 'Gagal mengkonfirmasi order');
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

        if (!await window.showConfirm(confirmMessage)) {
            return;
        }

        const notes = prompt('Catatan (opsional):');

        setUpdatingStatus(true);

        try {
            await axios.post(`/admin/orders/${order.id}/update-status`, {
                status: newStatus,
                notes: notes,
            });
            await window.showAlert('Status order berhasil diupdate!');
            router.reload();
        } catch (error: any) {
            await window.showAlert(error.response?.data?.message || 'Gagal mengupdate status order');
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
        const totalPaid = verifiedProofs.reduce((sum: number, p: PaymentProof) => sum + Number(p.amount || 0), 0);
        const finalPrice = Number(order.final_price || 0);
        const percentage = finalPrice > 0 ? Math.min((totalPaid / finalPrice) * 100, 100) : 0;

        return {
            totalPaid,
            percentage,
            hasBooking: verifiedProofs.some((p: PaymentProof) => p.payment_type === 'booking'),
            hasDP: verifiedProofs.some((p: PaymentProof) => p.payment_type === 'dp'),
            hasFull: verifiedProofs.some((p: PaymentProof) => p.payment_type === 'full'),
        };
    };

    const paymentProgress = getPaymentProgress();
    const initialPaymentType = order.initial_payment_type
        ? order.initial_payment_type
        : Number(order.booking_amount || 0) > 0
            ? 'booking'
            : 'dp';
    const initialPaymentLabel = initialPaymentType === 'dp' ? 'DP' : 'Booking';
    const initialPaymentAmount = initialPaymentType === 'dp' ? order.dp_amount : Number(order.booking_amount || 0);

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <button onClick={async () => router.visit('/admin/orders')} className="mb-2 flex items-center text-gray-600 hover:text-gray-900">
                            ← Kembali ke Wedding Order
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Detail Wedding Order: {order.order_code}</h1>
                        <p className="mt-1 text-sm text-gray-600">Dibuat: {order.created_at}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={async () => contactWhatsApp(order.client.phone)}
                            className="flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600"
                        >
                            <span>📱</span>
                            <span>Hubungi via WhatsApp</span>
                        </button>
                        <button
                            onClick={async () => downloadDocument('invoice')}
                            className="flex items-center gap-2 rounded-lg bg-slate-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                        >
                            🖨️ Invoice
                        </button>
                        <button
                            onClick={async () => downloadDocument('contract')}
                            className="flex items-center gap-2 rounded-lg bg-slate-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                        >
                            📄 Kontrak
                        </button>
                        {order.payment_status === 'unpaid' && (
                            <button
                                onClick={async () => router.visit(`/admin/orders/${order.id}/edit`)}
                                className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600"
                            >
                                <span>✏️</span>
                                <span>Edit Wedding Order</span>
                            </button>
                        )}
                        <button
                            onClick={async () => {
                                // Auto-determine payment type based on status
                                if (order.payment_status === 'unpaid' || order.payment_status === 'booking_pending') {
                                    generatePaymentLink(initialPaymentType);
                                } else if (order.payment_status === 'booked' || order.payment_status === 'dp_pending') {
                                    generatePaymentLink('dp');
                                } else if ((order.payment_status === 'dp_paid' || order.payment_status === 'partial') && order.remaining_amount > 0) {
                                    generatePaymentLink('installment');
                                } else {
                                    generatePaymentLink();
                                }
                            }}
                            disabled={generatingLink || order.is_negotiable || order.payment_link_active}
                            className={`flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-colors ${
                                order.is_negotiable || order.payment_link_active ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'
                            }`}
                            title={order.is_negotiable ? 'Finalize order before generating payment link' : order.payment_link_active ? 'Payment link is currently active' : ''}
                        >
                            <span>🔗</span>
                            <span>
                                {generatingLink ? 'Generating...' : 'Generate Payment Link'}
                            </span>
                        </button>
                        {!order.is_negotiable && order.remaining_amount > 0 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={async () => directConfirmPayment('booking')}
                                    className="rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                                >
                                    ⚡ Booking Langsung
                                </button>
                                <button
                                    onClick={async () => directConfirmPayment('dp')}
                                    className="rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
                                >
                                    ⚡ DP Langsung
                                </button>
                                <button
                                    onClick={async () => directConfirmPayment('full')}
                                    className="rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
                                >
                                    ⚡ Lunas Langsung
                                </button>
                            </div>
                        )}
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
                                    onClick={async () => setShowPaymentLinkModal(false)}
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
                {order.status !== 'cancelled' && (
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                            <span>🎯</span>
                            <span>Langkah Selanjutnya</span>
                        </h3>

                        <div className="space-y-3">
                            {/* Step 1: Negosiasi */}
                            {order.is_negotiable && (
                                <div className="flex items-start gap-4 rounded-lg border-l-4 border-blue-500 bg-gray-50 p-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                                        1
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="mb-1 font-semibold text-gray-900">Finalisasi Order</h4>
                                        <p className="mb-3 text-sm text-gray-600">
                                            Order masih dalam tahap negosiasi. Edit dan finalisasi order sebelum generate payment link.
                                        </p>
                                        <button
                                            onClick={async () => router.visit(`/admin/orders/${order.id}/edit`)}
                                            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                                        >
                                            ✏️ Edit & Finalisasi Order
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step: Active Payment Link */}
                            {!order.is_negotiable && order.payment_link_active && !order.payment_proofs.some((p: PaymentProof) => p.status === 'pending') && (
                                <div className="flex items-start gap-4 rounded-lg border-l-4 border-blue-500 bg-gray-50 p-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                                        ⏳
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="mb-1 font-semibold text-gray-900">Menunggu Pembayaran</h4>
                                        <p className="mb-3 text-sm text-gray-600">
                                            Link pembayaran {order.payment_link_type?.toUpperCase()} telah dibuat dan sedang menunggu client.
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={sendPaymentLinkViaWhatsApp}
                                                className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
                                            >
                                                📱 Kirim via WhatsApp
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(`${window.location.origin}/payment/${order.payment_link_token}`)}
                                                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 border border-gray-300"
                                            >
                                                📋 Copy Link
                                            </button>
                                            <button
                                                onClick={cancelPaymentLink}
                                                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                                            >
                                                ✕ Batalkan Link
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Generate Payment Link for Initial Payment */}
                            {!order.is_negotiable &&
                                paymentProgress.totalPaid === 0 &&
                                !order.payment_link_active &&
                                !order.payment_proofs.some((p: PaymentProof) => p.status === 'pending') && (
                                    <div className="flex items-start gap-4 rounded-lg border-l-4 border-purple-500 bg-gray-50 p-4">
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-600">
                                            2
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="mb-1 font-semibold text-gray-900">Generate Payment Link - {initialPaymentLabel}</h4>
                                            <p className="mb-2 text-sm text-gray-600">
                                                Order sudah difinalisasi. Generate link pembayaran {initialPaymentLabel.toLowerCase()} untuk tahap awal.
                                            </p>
                                            <p className="mb-3 text-xs text-gray-500">
                                                Nominal {initialPaymentLabel}: {formatCurrency(initialPaymentAmount)}
                                            </p>
                                            <button
                                                onClick={async () => generatePaymentLink(initialPaymentType)}
                                                disabled={
                                                    generatingLink ||
                                                    (initialPaymentType === 'booking' && initialPaymentAmount <= 0) ||
                                                    (initialPaymentType === 'dp' && initialPaymentAmount <= 0)
                                                }
                                                className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600 disabled:bg-gray-400"
                                            >
                                                {generatingLink ? 'Generating...' : `🔗 Generate ${initialPaymentLabel} Link`}
                                            </button>
                                        </div>
                                    </div>
                                )}

                            {/* Step 2b: Generate Payment Link for Subsequent Payments (Custom DP/Cicilan/Pelunasan) */}
                            {!order.is_negotiable && paymentProgress.totalPaid > 0 && !paymentProgress.hasFull && order.remaining_amount > 0 && !order.payment_link_active && !order.payment_proofs.some((p: PaymentProof) => p.status === 'pending') && (
                                <div className="flex items-start gap-4 rounded-lg border-l-4 border-purple-500 bg-gray-50 p-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-600">
                                        2b
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="mb-1 font-semibold text-gray-900">Generate Payment Link - Pembayaran Selanjutnya</h4>
                                        <p className="mb-3 text-sm text-gray-600">
                                            Generate link pembayaran custom (DP Lanjutan / Cicilan) atau langsung Pelunasan untuk sisa tagihan {formatRupiah(order.remaining_amount || 0)}.
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <div className="min-w-[220px]">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={installmentAmount ? Number(installmentAmount).toLocaleString('id-ID') : ''}
                                                    onChange={(e) => setInstallmentAmount(e.target.value.replace(/\D/g, ''))}
                                                    placeholder="Nominal Pembayaran"
                                                    className="w-full rounded-lg border border-purple-200 px-3 py-2 text-sm"
                                                />
                                            </div>
                                            <button
                                                onClick={async () => generatePaymentLink('installment', Number(installmentAmount || 0))}
                                                disabled={generatingLink || Number(installmentAmount || 0) <= 0}
                                                className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600 disabled:bg-gray-400"
                                            >
                                                {generatingLink ? 'Generating...' : '🔗 Generate Link Pembayaran'}
                                            </button>
                                            <button
                                                onClick={async () => generatePaymentLink('full')}
                                                disabled={generatingLink}
                                                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:bg-gray-400"
                                            >
                                                {generatingLink ? 'Generating...' : '🔗 Generate Pelunasan Link'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Verify Payment */}
                            {order.payment_proofs.some((p: PaymentProof) => p.status === 'pending') && (
                                <div className="flex items-start gap-4 rounded-lg border-l-4 border-orange-500 bg-gray-50 p-4">
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
                            {(paymentProgress.hasDP || paymentProgress.hasBooking || paymentProgress.hasFull) && !['confirmed', 'processing', 'completed'].includes(order.status) && (
                                <div className="flex items-start gap-4 rounded-lg border-l-4 border-green-500 bg-gray-50 p-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-600">
                                        4
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="mb-1 font-semibold text-gray-900">Konfirmasi Order</h4>
                                        <p className="mb-3 text-sm text-gray-600">
                                            {paymentProgress.hasFull
                                                ? 'Pembayaran LUNAS terverifikasi. Konfirmasi order untuk mulai proses.'
                                                : `Pembayaran ${paymentProgress.hasDP ? 'DP' : 'Booking'} terverifikasi. Konfirmasi order untuk mulai proses (pelunasan bisa dilakukan kemudian).`}
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
                                <div className="flex items-start gap-4 rounded-lg border-l-4 border-indigo-500 bg-gray-50 p-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                                        5
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="mb-1 font-semibold text-gray-900">Mulai Proses Order</h4>
                                        <p className="mb-3 text-sm text-gray-600">
                                            Order sudah dikonfirmasi. Ubah status ke "Sedang Diproses" untuk mulai pengerjaan.
                                        </p>
                                        <button
                                            onClick={async () => updateOrderStatus('processing')}
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
                                <div className="flex items-start gap-4 rounded-lg border-l-4 border-emerald-500 bg-gray-50 p-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-600">
                                        6
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="mb-1 font-semibold text-gray-900">Selesaikan Order</h4>
                                        <p className="mb-3 text-sm text-gray-600">
                                            Order sedang diproses. Tandai sebagai selesai setelah acara berlangsung.
                                        </p>
                                        <button
                                            onClick={async () => updateOrderStatus('completed')}
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
                                <div className="flex items-center justify-center gap-3 rounded-lg border-2 border-green-500 bg-gray-50 p-6">
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
                                        onClick={async () => updateOrderStatus('cancelled')}
                                        disabled={updatingStatus}
                                        className="text-sm font-medium text-red-600 hover:text-red-700"
                                    >
                                        ✕ Batalkan Order
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

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
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold text-gray-900">Bukti Pembayaran</h2>
                    {order.payment_proofs && order.payment_proofs.length > 0 ? (
                        <div className="space-y-4">
                            {order.payment_proofs.map((proof) => (
                                <div key={proof.id} className="rounded-lg border border-gray-200 p-4">
                                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <div className="mb-2 text-sm text-gray-600">Bukti Pembayaran</div>
                                            {proof.proof_image_url ? (
                                                <a href={proof.proof_image_url} target="_blank" rel="noopener noreferrer" className="inline-block">
                                                    <img
                                                        src={proof.proof_image_url}
                                                        alt="Payment Proof"
                                                        className="h-auto max-h-64 max-w-full rounded-lg border border-gray-300 transition-opacity hover:opacity-80"
                                                    />
                                                </a>
                                            ) : (
                                                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-600">
                                                    Pembayaran langsung onsite (tanpa upload bukti file)
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-sm text-gray-600">Jumlah</div>
                                                <div className="text-lg font-bold text-gray-900">{formatCurrency(proof.amount)}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">Tipe Pembayaran</div>
                                                <div className="font-semibold text-gray-900">
                                                    {proof.payment_type === 'booking'
                                                        ? 'Booking (Reservasi Tanggal)'
                                                        : proof.payment_type === 'dp'
                                                            ? 'Down Payment (DP)'
                                                            : proof.payment_type === 'installment'
                                                                ? 'Cicilan'
                                                                : 'Pelunasan'}
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
                                                onClick={async () => verifyPayment(proof.id)}
                                                disabled={verifyingProof === proof.id}
                                                className="flex-1 rounded-lg bg-green-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-600 disabled:bg-gray-400"
                                            >
                                                ✓ Verifikasi Pembayaran
                                            </button>
                                            <button
                                                onClick={async () => rejectPayment(proof.id)}
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
                    ) : (
                        <div className="text-sm text-gray-500">Belum ada pembayaran tercatat.</div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={async () => router.visit('/admin/orders')}
                        className="flex-1 rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-300"
                    >
                        Kembali
                    </button>
                    <button
                        onClick={async () => contactWhatsApp(order.client.phone)}
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
