import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import React, { useState } from 'react';
import { PublicLayout } from '../../layouts/PublicLayout';

interface OrderDetail {
    id: number;
    order_number: string;
    event_name: string;
    event_type: string;
    event_date: string;
    event_location: string;
    event_address: string;
    event_theme: string;
    guest_count: number;
    total_price: number;
    final_price: number;
    dp_amount: number;
    total_paid: number;
    remaining_amount: number;
    status: string;
    payment_status: string;
    notes: string;
    special_requests: string;
    created_at: string;
    updated_at: string;
    package: {
        name: string;
        description: string;
    } | null;
    client: {
        name: string;
        email: string;
        phone: string;
    };
    payment_transactions: PaymentTransaction[];
    event: EventDetail | null;
    order_details: OrderItem[];
    testimonial?: {
        id: number;
        rating: number;
        testimonial: string;
        event_type?: string | null;
    } | null;
}

interface PaymentTransaction {
    id: number;
    amount: number;
    payment_type: string;
    payment_method: string;
    payment_date: string;
    status: string;
    proof_url: string | null;
    notes: string | null;
    created_at: string;
}

interface EventDetail {
    id: number;
    event_code: string;
    status: string;
    venue_name: string;
    start_time: string;
    end_time: string;
    rundown_items: RundownItem[];
    task_assignments: TaskAssignment[];
}

interface RundownItem {
    id: number;
    time: string;
    activity: string;
    description: string;
    pic: string;
    status: string;
    order: number;
}

interface TaskAssignment {
    id: number;
    task_name: string;
    task_description: string;
    assigned_to: string;
    status: string;
    due_date: string;
    completed_at: string | null;
}

interface OrderItem {
    id: number;
    item_type: string;
    item_name: string;
    quantity: number;
    price: number;
    subtotal: number;
}

interface Props {
    order: OrderDetail;
}

const OrderDetail: React.FC<Props> = ({ order }) => {
    const { auth } = usePage<{ auth: { user: { id: number; name: string; email: string; role: string } } }>().props;
    const user = auth?.user;
    const [reviewRating, setReviewRating] = useState(order.testimonial?.rating || 0);
    const [reviewText, setReviewText] = useState(order.testimonial?.testimonial || '');
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewMessage, setReviewMessage] = useState('');

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending_confirmation: 'bg-[#F2E6D6] text-[#7A5C44]',
            awaiting_dp_payment: 'bg-[#F2E6D6] text-[#7A5C44]',
            dp_paid: 'bg-[#E6F0E4] text-[#3F6A4A]',
            awaiting_full_payment: 'bg-[#F2E6D6] text-[#7A5C44]',
            paid: 'bg-[#E6F0E4] text-[#3F6A4A]',
            confirmed: 'bg-[#E6F0E4] text-[#3F6A4A]',
            processing: 'bg-[#E8EEF5] text-[#1B2430]',
            completed: 'bg-[#E8EEF5] text-[#1B2430]',
            cancelled: 'bg-[#F3E7E2] text-[#8A4E3A]',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending_confirmation: 'Menunggu Konfirmasi',
            awaiting_dp_payment: 'Menunggu DP',
            dp_paid: 'DP Dibayar',
            awaiting_full_payment: 'Menunggu Pelunasan',
            paid: 'Lunas',
            confirmed: 'Terkonfirmasi',
            processing: 'Sedang Diproses',
            completed: 'Selesai',
            cancelled: 'Dibatalkan',
        };
        return labels[status] || status;
    };

    const getPaymentTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            dp: 'DP (Uang Muka)',
            full: 'Pelunasan',
            installment: 'Cicilan',
        };
        return labels[type] || type;
    };

    const getPaymentMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            transfer: 'Transfer Bank',
            cash: 'Tunai',
            credit_card: 'Kartu Kredit',
            qris: 'QRIS',
        };
        return labels[method] || method;
    };

    const formatRundownTime = (value: string) => {
        if (!value) return '-';
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        }
        return value;
    };

    const getRundownStatusLabel = (status: string) => {
        if (status === 'completed') return 'Selesai';
        if (status === 'in_progress') return 'Berlangsung';
        if (status === 'skipped') return 'Dilewati';
        return 'Belum';
    };

    const getTaskStatusLabel = (status: string) => {
        if (status === 'completed') return 'Selesai';
        if (status === 'in_progress') return 'Berlangsung';
        if (status === 'pending') return 'Menunggu';
        return 'Belum';
    };

    // Use total_paid from backend for consistency
    const totalPaid = order.total_paid || 0;
    const remainingAmount = order.remaining_amount || (order.final_price - totalPaid);

    const paymentProgress = order.final_price > 0 ? (totalPaid / order.final_price) * 100 : 0;
    const showQuickActions = ['confirmed', 'processing', 'completed'].includes(order.status);
    const canReview = order.status === 'completed';

    // Group payments by type to avoid duplicate steps in timeline
    const relevantPayments = Object.values((order.payment_transactions || []).reduce((acc: any, payment: any) => {
        const type = payment.payment_type;
        if (!acc[type]) {
            acc[type] = payment;
        } else {
            if (payment.status === 'verified') {
                acc[type] = payment;
            } else if (payment.status === 'pending' && acc[type].status === 'rejected') {
                acc[type] = payment;
            } else if (payment.status === acc[type].status && new Date(payment.created_at) > new Date(acc[type].created_at)) {
                acc[type] = payment;
            }
        }
        return acc;
    }, {}));

    // Timeline data
    const timeline = [
        {
            date: order.created_at,
            title: 'Pesanan Dibuat',
            description: 'Pesanan berhasil dibuat dan menunggu konfirmasi',
            status: 'completed',
            icon: '📝',
        },
        ...relevantPayments.map((payment: any) => {
            let descStatus = 'Menunggu Verifikasi';
            let timelineStatus = 'pending';
            let icon = '⏳';
            if (payment.status === 'verified') {
                descStatus = 'Terverifikasi';
                timelineStatus = 'completed';
                icon = '✅';
            } else if (payment.status === 'rejected') {
                descStatus = 'Ditolak';
                timelineStatus = 'pending';
                icon = '❌';
            }

            return {
                date: payment.created_at,
                title: `Pembayaran ${getPaymentTypeLabel(payment.payment_type)}`,
                description: `${getPaymentMethodLabel(payment.payment_method)} - Rp ${(payment.amount / 1000000).toFixed(2)}jt - ${descStatus}`,
                status: timelineStatus,
                icon: icon,
            };
        }),
        {
            date: order.event_date,
            title: 'Hari Event',
            description: `Event berlangsung di ${order.event_location}`,
            status: new Date(order.event_date) < new Date() ? 'completed' : 'upcoming',
            icon: '🎉',
        },
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const handleSubmitReview = async () => {
        if (!reviewRating || reviewRating < 1) {
            setReviewMessage('Rating wajib dipilih.');
            return;
        }
        if (!reviewText.trim()) {
            setReviewMessage('Review tidak boleh kosong.');
            return;
        }

        try {
            setReviewLoading(true);
            setReviewMessage('');
            const response = await axios.post(`/api/client/orders/${order.id}/review`, {
                rating: reviewRating,
                testimonial: reviewText,
            });

            if (response.data?.success) {
                setReviewMessage('Terima kasih! Review Anda berhasil dikirim.');
            }
        } catch (error: any) {
            setReviewMessage(error.response?.data?.message || 'Gagal mengirim review.');
        } finally {
            setReviewLoading(false);
        }
    };

    return (
        <PublicLayout active="orders" wrapperClassName="min-h-screen bg-[#F6F1EA] text-[#2A2420]">
            {/* Main Content */}
            <main className="w-full px-4 py-8 font-sans sm:px-8 2xl:px-16">
                {/* Back Button */}
                <Link
                    href="/my-orders"
                    className="mb-6 inline-flex items-center gap-2 text-[#7A5C44] transition-colors hover:text-[#5B4636]"
                >
                    <span className="text-xl">←</span>
                    <span className="font-medium">Kembali ke Pesanan Saya</span>
                </Link>

                {/* Order Header */}
                <div className="mb-8 overflow-hidden rounded-3xl border border-[#E7DCCB] bg-[#FFFBF6] p-8 shadow-[0_18px_45px_-35px_rgba(27,36,48,0.65)]">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div>
                            <h1 className="mb-2 font-serif text-4xl font-bold text-[#2A2420]">{order.order_number}</h1>
                            <p className="mb-4 text-lg text-[#5B4A3C]">{order.event_name}</p>
                            <div className="flex flex-wrap gap-2">
                                <span className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(order.status)}`}>
                                    {getStatusLabel(order.status)}
                                </span>
                                <span className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(order.payment_status)}`}>
                                    {order.payment_status === 'paid' ? '💰 Lunas' : '⏳ Belum Lunas'}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-[#7A5C44]">Total Biaya</p>
                            <p className="mb-2 font-serif text-4xl font-bold text-[#B08A56]">
                                Rp {(order.final_price / 1000000).toFixed(1)}jt
                            </p>
                            <p className="text-sm text-[#5B4A3C]">
                                Terbayar: <span className="font-semibold text-[#3F6A4A]">Rp {(totalPaid / 1000000).toFixed(2)}jt</span>
                            </p>
                            {remainingAmount > 0 && (
                                <p className="text-sm text-[#5B4A3C]">
                                    Sisa: <span className="font-semibold text-[#8A4E3A]">Rp {(remainingAmount / 1000000).toFixed(2)}jt</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Payment Progress Bar */}
                    <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-[#5B4A3C]">Progress Pembayaran</span>
                            <span className="text-sm font-semibold text-[#B08A56]">{paymentProgress.toFixed(0)}%</span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-[#E3D7C7]">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-[#B08A56] to-[#7A5C44] transition-all duration-500"
                                style={{ width: `${paymentProgress}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column - Main Info */}
                    <div className="space-y-8 lg:col-span-2">
                        {canReview && (
                            <div className="overflow-hidden rounded-3xl border border-[#E7DCCB] bg-[#FFFBF6] p-6 shadow-[0_16px_35px_-30px_rgba(27,36,48,0.6)]">
                                <h2 className="mb-4 flex items-center gap-2 font-serif text-2xl font-bold text-[#2A2420]">
                                    <span className="text-3xl">⭐</span>
                                    Rating & Review
                                </h2>
                                <p className="mb-4 text-sm text-[#5B4A3C]">
                                    Bagikan pengalaman Anda bersama tim kami.
                                </p>

                                <div className="mb-4 flex gap-2">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setReviewRating(value)}
                                            className={`text-2xl transition ${reviewRating >= value ? 'text-[#B08A56]' : 'text-[#D9C8B8]'}`}
                                            aria-label={`rating ${value}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    value={reviewText}
                                    onChange={(event) => setReviewText(event.target.value)}
                                    rows={4}
                                    placeholder="Tulis review Anda di sini..."
                                    className="w-full rounded-xl border border-[#E7DCCB] bg-white px-4 py-3 text-sm text-[#2A2420]"
                                />

                                {reviewMessage && (
                                    <p className="mt-3 text-sm text-[#8A4E3A]">{reviewMessage}</p>
                                )}

                                <button
                                    type="button"
                                    onClick={handleSubmitReview}
                                    disabled={reviewLoading}
                                    className="mt-4 rounded-xl bg-gradient-to-r from-[#B08A56] to-[#7A5C44] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {reviewLoading ? 'Mengirim...' : 'Kirim Review'}
                                </button>
                            </div>
                        )}
                        {/* Event Details */}
                        <div className="overflow-hidden rounded-3xl border border-[#E7DCCB] bg-[#FFFBF6] p-6 shadow-[0_16px_35px_-30px_rgba(27,36,48,0.6)]">
                            <h2 className="mb-6 flex items-center gap-2 font-serif text-2xl font-bold text-[#2A2420]">
                                <span className="text-3xl">🎊</span>
                                Detail Event
                            </h2>
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="mb-1 text-sm font-medium text-[#7A5C44]">Nama Event</p>
                                        <p className="font-semibold text-[#2A2420]">{order.event_name}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-sm font-medium text-[#7A5C44]">Jenis Event</p>
                                        <p className="font-semibold text-[#2A2420]">{order.event_type}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-sm font-medium text-[#7A5C44]">Tanggal Event</p>
                                        <p className="font-semibold text-[#2A2420]">
                                            {new Date(order.event_date).toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-sm font-medium text-[#7A5C44]">Jumlah Tamu</p>
                                        <p className="font-semibold text-[#2A2420]">{order.guest_count} orang</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="mb-1 text-sm font-medium text-[#7A5C44]">Lokasi</p>
                                        <p className="font-semibold text-[#2A2420]">{order.event_location}</p>
                                        <p className="text-sm text-[#5B4A3C]">{order.event_address}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="mb-1 text-sm font-medium text-[#7A5C44]">Tema</p>
                                        <p className="font-semibold text-[#2A2420]">{order.event_theme}</p>
                                    </div>
                                </div>

                                {order.package && (
                                    <div className="mt-4 rounded-lg border border-[#E7DCCB] bg-[#F8F1E8] p-4">
                                        <p className="mb-1 text-sm font-medium text-[#7A5C44]">Paket Dipilih</p>
                                        <p className="mb-2 text-lg font-bold text-[#B08A56]">{order.package.name}</p>
                                        <p className="text-sm text-[#5B4A3C]">{order.package.description}</p>
                                    </div>
                                )}

                                {order.special_requests && (
                                    <div className="rounded-lg border border-[#E7DCCB] bg-[#F4EBDD] p-4">
                                        <p className="mb-1 text-sm font-medium text-[#7A5C44]">Permintaan Khusus</p>
                                        <p className="text-sm text-[#5B4A3C]">{order.special_requests}</p>
                                    </div>
                                )}

                                {order.notes && (
                                    <div className="rounded-lg border border-[#E7DCCB] bg-[#F8F1E8] p-4">
                                        <p className="mb-1 text-sm font-medium text-[#2A2420]">Catatan</p>
                                        <p className="text-sm text-[#5B4A3C]">{order.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="overflow-hidden rounded-3xl border border-[#E7DCCB] bg-[#FFFBF6] p-6 shadow-[0_16px_35px_-30px_rgba(27,36,48,0.6)]">
                            <h2 className="mb-6 flex items-center gap-2 font-serif text-2xl font-bold text-[#2A2420]">
                                <span className="text-3xl">⏱️</span>
                                Timeline Pesanan
                            </h2>
                            <div className="relative space-y-6">
                                {timeline.map((item) => (
                                    <div key={`timeline-${item.date}-${item.title}`} className="relative flex gap-4">
                                        {/* Timeline line */}
                                        {timeline.indexOf(item) < timeline.length - 1 && (
                                            <div className="absolute left-6 top-12 h-full w-0.5 bg-[#E3D7C7]" />
                                        )}

                                        {/* Icon */}
                                        <div
                                            className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-2xl ${
                                                item.status === 'completed'
                                                    ? 'bg-[#E6F0E4]'
                                                    : item.status === 'pending'
                                                      ? 'bg-[#F2E6D6]'
                                                      : 'bg-[#E8EEF5]'
                                            }`}
                                        >
                                            {item.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 pb-6">
                                            <p className="mb-1 font-semibold text-[#2A2420]">{item.title}</p>
                                            <p className="mb-2 text-sm text-[#5B4A3C]">{item.description}</p>
                                            <p className="text-xs text-[#9A8773]">
                                                {new Date(item.date).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rundown Event (if available) */}
                        {order.event && order.event.rundown_items && order.event.rundown_items.length > 0 && (
                            <div className="overflow-hidden rounded-3xl border border-[#E7DCCB] bg-[#FFFBF6] p-6 shadow-[0_16px_35px_-30px_rgba(27,36,48,0.6)]">
                                <h2 className="mb-6 flex items-center gap-2 font-serif text-2xl font-bold text-[#2A2420]">
                                    <span className="text-3xl">📋</span>
                                    Rundown Event
                                </h2>
                                <div className="space-y-3">
                                    {order.event.rundown_items
                                        .sort((a, b) => a.order - b.order)
                                        .map((item) => (
                                            <div key={item.id} className="flex items-start gap-4 rounded-lg border-l-4 border-[#B08A56] bg-[#F8F1E8] p-4">
                                                <div className="flex-shrink-0">
                                                    <p className="font-mono text-sm font-bold text-[#B08A56]">{formatRundownTime(item.time)}</p>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="mb-1 font-semibold text-[#2A2420]">{item.activity}</p>
                                                    {item.description && <p className="mb-2 text-sm text-[#5B4A3C]">{item.description}</p>}
                                                    {item.pic && (
                                                        <p className="text-xs text-[#8D7A67]">
                                                            PIC: <span className="font-medium">{item.pic}</span>
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            item.status === 'completed'
                                                                ? 'bg-[#E6F0E4] text-[#3F6A4A]'
                                                                : item.status === 'in_progress'
                                                                  ? 'bg-[#E8EEF5] text-[#1B2430]'
                                                                  : 'bg-[#F2E6D6] text-[#7A5C44]'
                                                        }`}
                                                    >
                                                        {getRundownStatusLabel(item.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Item Details */}
                        {order.order_details && order.order_details.length > 0 && (
                            <div className="overflow-hidden rounded-3xl border border-[#E7DCCB] bg-[#FFFBF6] p-6 shadow-[0_16px_35px_-30px_rgba(27,36,48,0.6)]">
                                <h2 className="mb-6 flex items-center gap-2 font-serif text-2xl font-bold text-[#2A2420]">
                                    <span className="text-3xl">📦</span>
                                    Detail Item Pesanan
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b-2 border-[#E3D7C7]">
                                                <th className="pb-3 text-left text-sm font-semibold text-[#7A5C44]">Item</th>
                                                <th className="pb-3 text-left text-sm font-semibold text-[#7A5C44]">Jenis</th>
                                                <th className="pb-3 text-center text-sm font-semibold text-[#7A5C44]">Qty</th>
                                                <th className="pb-3 text-right text-sm font-semibold text-[#7A5C44]">Harga</th>
                                                <th className="pb-3 text-right text-sm font-semibold text-[#7A5C44]">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#EFE4D6]">
                                            {order.order_details.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="py-3 text-sm text-[#2A2420]">{item.item_name}</td>
                                                    <td className="py-3 text-sm text-[#5B4A3C]">{item.item_type}</td>
                                                    <td className="py-3 text-center text-sm text-[#2A2420]">{item.quantity}</td>
                                                    <td className="py-3 text-right text-sm text-[#2A2420]">
                                                        Rp {(item.price / 1000).toFixed(0)}k
                                                    </td>
                                                    <td className="py-3 text-right text-sm font-semibold text-[#2A2420]">
                                                        Rp {(item.subtotal / 1000).toFixed(0)}k
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Payment & Contact */}
                    <div className="space-y-8">
                        {/* Payment History */}
                        <div className="overflow-hidden rounded-3xl border border-[#E7DCCB] bg-[#FFFBF6] p-6 shadow-[0_16px_35px_-30px_rgba(27,36,48,0.6)]">
                            <h2 className="mb-6 flex items-center gap-2 font-serif text-2xl font-bold text-[#2A2420]">
                                <span className="text-3xl">💳</span>
                                Riwayat Pembayaran
                            </h2>
                            {order.payment_transactions && order.payment_transactions.length > 0 ? (
                                <div className="max-h-[500px] space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                                    {order.payment_transactions
                                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                        .map((payment) => (
                                            <div
                                                key={payment.id}
                                                className={`rounded-lg border-2 p-4 ${
                                                    payment.status === 'verified'
                                                        ? 'border-[#D7E8D4] bg-[#F1F7EF]'
                                                        : payment.status === 'pending'
                                                          ? 'border-[#E9DCCB] bg-[#F8F1E8]'
                                                          : 'border-[#F0DAD2] bg-[#F7ECE7]'
                                                }`}
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            payment.status === 'verified'
                                                                ? 'bg-[#E6F0E4] text-[#3F6A4A]'
                                                                : payment.status === 'pending'
                                                                  ? 'bg-[#F2E6D6] text-[#7A5C44]'
                                                                  : 'bg-[#F3E7E2] text-[#8A4E3A]'
                                                        }`}
                                                    >
                                                        {payment.status === 'verified'
                                                            ? '✓ Terverifikasi'
                                                            : payment.status === 'pending'
                                                              ? '⏳ Menunggu'
                                                              : '✗ Ditolak'}
                                                    </span>
                                                </div>
                                                <p className="mb-1 text-lg font-bold text-[#2A2420]">
                                                    Rp {(payment.amount / 1000000).toFixed(2)}jt
                                                </p>
                                                <p className="mb-1 text-sm text-[#5B4A3C]">{getPaymentTypeLabel(payment.payment_type)}</p>
                                                <p className="mb-2 text-sm text-[#5B4A3C]">{getPaymentMethodLabel(payment.payment_method)}</p>
                                                <p className="text-xs text-[#9A8773]">
                                                    Tanggal Upload: {new Date(payment.created_at).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                                {payment.proof_url && (
                                                    <div className="mt-3">
                                                        <p className="mb-1 text-xs font-semibold text-[#7A5C44]">Bukti Pembayaran</p>
                                                        <a
                                                            href={payment.proof_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block overflow-hidden rounded-lg border-2 border-[#E7DCCB] transition-all hover:border-[#7A5C44]"
                                                        >
                                                            <img
                                                                src={payment.proof_url}
                                                                alt="Bukti Pembayaran"
                                                                className="h-32 w-full object-cover"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.onerror = null; // Prevent infinite loop
                                                                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="128" viewBox="0 0 200 128"%3E%3Crect fill="%23f3f4f6" width="200" height="128"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%239ca3af"%3EGambar tidak dapat dimuat%3C/text%3E%3C/svg%3E';
                                                                }}
                                                            />
                                                        </a>
                                                        <p className="mt-1 text-xs text-[#9A8773]">Klik untuk memperbesar</p>
                                                    </div>
                                                )}
                                                {payment.notes && (
                                                    <p className="mt-2 text-xs italic text-[#9A8773]">Catatan Admin: {payment.notes}</p>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-[#E7DCCB] bg-[#F8F1E8] p-6 text-center">
                                    <p className="text-3xl">💰</p>
                                    <p className="mt-2 text-sm text-[#5B4A3C]">Belum ada pembayaran</p>
                                </div>
                            )}
                        </div>

                        {/* Contact Section */}
                        <div className="overflow-hidden rounded-3xl bg-[#1B2430] p-6 shadow-xl">
                            <h2 className="mb-4 flex items-center gap-2 font-serif text-2xl font-bold text-[#F6F1EA]">
                                <span className="text-3xl">📞</span>
                                Butuh Bantuan?
                            </h2>
                            <p className="mb-6 text-[#C8B8A3]">Tim kami siap membantu Anda 24/7</p>
                            <a
                                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '6281234567890'}?text=Halo, saya ingin menanyakan tentang pesanan ${order.order_number}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#F6F1EA] px-6 py-3 font-bold text-[#7A5C44] shadow-lg transition-all hover:scale-105"
                            >
                                <span className="text-xl">💬</span>
                                Hubungi via WhatsApp
                            </a>
                        </div>

                        {showQuickActions && (
                            <div className="overflow-hidden rounded-3xl border border-[#E7DCCB] bg-[#FFFBF6] p-6 shadow-[0_16px_35px_-30px_rgba(27,36,48,0.6)]">
                                <h2 className="mb-4 font-serif text-xl font-bold text-[#2A2420]">Aksi Cepat</h2>
                                <div className="space-y-3">
                                    {order.payment_status !== 'paid' && (
                                        <button className="w-full rounded-lg bg-gradient-to-r from-[#B08A56] to-[#7A5C44] px-4 py-3 font-semibold text-white shadow-md transition-all hover:scale-105">
                                            💰 Bayar Sekarang
                                        </button>
                                    )}
                                    <a
                                        href={`/my-orders/${order.id}/invoice`}
                                        className="w-full rounded-lg border-2 border-[#E7DCCB] bg-white px-4 py-3 text-center font-semibold text-[#5B4A3C] transition-all hover:border-[#B08A56] hover:bg-[#F8F1E8]"
                                    >
                                        🖨️ Download Invoice
                                    </a>
                                    <a
                                        href={`/my-orders/${order.id}/contract`}
                                        className="w-full rounded-lg border-2 border-[#E7DCCB] bg-white px-4 py-3 text-center font-semibold text-[#5B4A3C] transition-all hover:border-[#B08A56] hover:bg-[#F8F1E8]"
                                    >
                                        📄 Download Kontrak
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Event Progress (if event exists) */}
                        {order.event && (
                            <div className="overflow-hidden rounded-3xl border border-[#E7DCCB] bg-[#FFFBF6] p-6 shadow-[0_16px_35px_-30px_rgba(27,36,48,0.6)]">
                                <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-bold text-[#2A2420]">
                                    <span className="text-2xl">🎯</span>
                                    Progress Event
                                </h2>
                                <div className="space-y-3">
                                    {order.event.task_assignments && order.event.task_assignments.length > 0 ? (
                                        order.event.task_assignments.map((task) => (
                                            <div key={task.id} className="rounded-lg border border-[#E7DCCB] p-3">
                                                <div className="mb-2 flex items-start justify-between">
                                                    <p className="font-semibold text-[#2A2420]">{task.task_name}</p>
                                                    <span
                                                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                                            task.status === 'completed'
                                                                ? 'bg-[#E6F0E4] text-[#3F6A4A]'
                                                                : task.status === 'in_progress'
                                                                  ? 'bg-[#E8EEF5] text-[#1B2430]'
                                                                  : 'bg-[#F2E6D6] text-[#7A5C44]'
                                                        }`}
                                                    >
                                                        {getTaskStatusLabel(task.status)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-[#5B4A3C]">{task.task_description}</p>
                                                {task.assigned_to && (
                                                    <p className="mt-1 text-xs text-[#8D7A67]">PIC: {task.assigned_to}</p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-sm text-[#8D7A67]">Progress akan diupdate segera</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

        </PublicLayout>
    );
};

export default OrderDetail;
