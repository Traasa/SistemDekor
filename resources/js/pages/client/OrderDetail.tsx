import { Link, usePage } from '@inertiajs/react';
import React from 'react';

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

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending_confirmation: 'bg-blue-100 text-blue-800',
            awaiting_dp_payment: 'bg-yellow-100 text-yellow-800',
            dp_paid: 'bg-green-100 text-green-800',
            awaiting_full_payment: 'bg-orange-100 text-orange-800',
            paid: 'bg-green-100 text-green-800',
            confirmed: 'bg-green-100 text-green-800',
            processing: 'bg-purple-100 text-purple-800',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800',
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

    // Use total_paid from backend for consistency
    const totalPaid = order.total_paid || 0;
    const remainingAmount = order.remaining_amount || (order.final_price - totalPaid);

    const paymentProgress = order.final_price > 0 ? (totalPaid / order.final_price) * 100 : 0;

    // Timeline data
    const timeline = [
        {
            date: order.created_at,
            title: 'Pesanan Dibuat',
            description: 'Pesanan berhasil dibuat dan menunggu konfirmasi',
            status: 'completed',
            icon: '📝',
        },
        ...order.payment_transactions.map((payment) => ({
            date: payment.created_at,
            title: `Pembayaran ${getPaymentTypeLabel(payment.payment_type)}`,
            description: `${getPaymentMethodLabel(payment.payment_method)} - Rp ${(parseFloat(payment.amount.toString()) / 1000000).toFixed(2)}jt - ${payment.status === 'verified' ? 'Terverifikasi' : 'Menunggu Verifikasi'}`,
            status: payment.status === 'verified' ? 'completed' : 'pending',
            icon: payment.status === 'verified' ? '✅' : '⏳',
        })),
        {
            date: order.event_date,
            title: 'Hari Event',
            description: `Event berlangsung di ${order.event_location}`,
            status: new Date(order.event_date) < new Date() ? 'completed' : 'upcoming',
            icon: '🎉',
        },
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#F5F1E8] to-[#FFE4E6]">
            {/* Header */}
            <header className="bg-white/95 shadow-lg backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="group flex items-center space-x-3">
                            <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#F4D03F] to-[#EC4899] p-0.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                                    <span className="font-serif text-2xl font-bold text-[#D4AF37]">D</span>
                                </div>
                            </div>
                            <span className="font-serif text-2xl font-bold text-gray-900">Wedding Organizer</span>
                        </Link>

                        <nav className="flex items-center space-x-6">
                            <Link href="/" className="font-medium text-gray-700 hover:text-[#D4AF37]">
                                Beranda
                            </Link>
                            <Link href="/packages" className="font-medium text-gray-700 hover:text-[#D4AF37]">
                                Paket
                            </Link>
                            <Link href="/my-orders" className="font-medium text-gray-700 hover:text-[#D4AF37]">
                                Pesanan Saya
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    href="/my-orders"
                    className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-[#D4AF37]"
                >
                    <span className="text-xl">←</span>
                    <span className="font-medium">Kembali ke Pesanan Saya</span>
                </Link>

                {/* Order Header */}
                <div className="mb-8 overflow-hidden rounded-3xl bg-white p-8 shadow-xl">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div>
                            <h1 className="mb-2 font-serif text-4xl font-bold text-gray-900">{order.order_number}</h1>
                            <p className="mb-4 text-lg text-gray-600">{order.event_name}</p>
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
                            <p className="text-sm text-gray-500">Total Biaya</p>
                            <p className="mb-2 font-serif text-4xl font-bold text-[#D4AF37]">
                                Rp {(order.final_price / 1000000).toFixed(1)}jt
                            </p>
                            <p className="text-sm text-gray-600">
                                Terbayar: <span className="font-semibold text-green-600">Rp {(totalPaid / 1000000).toFixed(2)}jt</span>
                            </p>
                            {remainingAmount > 0 && (
                                <p className="text-sm text-gray-600">
                                    Sisa: <span className="font-semibold text-orange-600">Rp {(remainingAmount / 1000000).toFixed(2)}jt</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Payment Progress Bar */}
                    <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Progress Pembayaran</span>
                            <span className="text-sm font-semibold text-[#D4AF37]">{paymentProgress.toFixed(0)}%</span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] transition-all duration-500"
                                style={{ width: `${paymentProgress}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column - Main Info */}
                    <div className="space-y-8 lg:col-span-2">
                        {/* Event Details */}
                        <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-xl">
                            <h2 className="mb-6 flex items-center gap-2 font-serif text-2xl font-bold text-gray-900">
                                <span className="text-3xl">🎊</span>
                                Detail Event
                            </h2>
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="mb-1 text-sm font-medium text-gray-500">Nama Event</p>
                                        <p className="font-semibold text-gray-900">{order.event_name}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-sm font-medium text-gray-500">Jenis Event</p>
                                        <p className="font-semibold text-gray-900">{order.event_type}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-sm font-medium text-gray-500">Tanggal Event</p>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(order.event_date).toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-sm font-medium text-gray-500">Jumlah Tamu</p>
                                        <p className="font-semibold text-gray-900">{order.guest_count} orang</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="mb-1 text-sm font-medium text-gray-500">Lokasi</p>
                                        <p className="font-semibold text-gray-900">{order.event_location}</p>
                                        <p className="text-sm text-gray-600">{order.event_address}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="mb-1 text-sm font-medium text-gray-500">Tema</p>
                                        <p className="font-semibold text-gray-900">{order.event_theme}</p>
                                    </div>
                                </div>

                                {order.package && (
                                    <div className="mt-4 rounded-lg border-2 border-[#D4AF37]/20 bg-gradient-to-r from-[#D4AF37]/5 to-[#EC4899]/5 p-4">
                                        <p className="mb-1 text-sm font-medium text-gray-500">Paket Dipilih</p>
                                        <p className="mb-2 text-lg font-bold text-[#D4AF37]">{order.package.name}</p>
                                        <p className="text-sm text-gray-600">{order.package.description}</p>
                                    </div>
                                )}

                                {order.special_requests && (
                                    <div className="rounded-lg bg-blue-50 p-4">
                                        <p className="mb-1 text-sm font-medium text-blue-900">Permintaan Khusus</p>
                                        <p className="text-sm text-blue-800">{order.special_requests}</p>
                                    </div>
                                )}

                                {order.notes && (
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <p className="mb-1 text-sm font-medium text-gray-900">Catatan</p>
                                        <p className="text-sm text-gray-700">{order.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-xl">
                            <h2 className="mb-6 flex items-center gap-2 font-serif text-2xl font-bold text-gray-900">
                                <span className="text-3xl">⏱️</span>
                                Timeline Pesanan
                            </h2>
                            <div className="relative space-y-6">
                                {timeline.map((item, index) => (
                                    <div key={index} className="relative flex gap-4">
                                        {/* Timeline line */}
                                        {index < timeline.length - 1 && (
                                            <div className="absolute left-6 top-12 h-full w-0.5 bg-gray-200" />
                                        )}

                                        {/* Icon */}
                                        <div
                                            className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-2xl ${
                                                item.status === 'completed'
                                                    ? 'bg-green-100'
                                                    : item.status === 'pending'
                                                      ? 'bg-yellow-100'
                                                      : 'bg-blue-100'
                                            }`}
                                        >
                                            {item.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 pb-6">
                                            <p className="mb-1 font-semibold text-gray-900">{item.title}</p>
                                            <p className="mb-2 text-sm text-gray-600">{item.description}</p>
                                            <p className="text-xs text-gray-400">
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
                            <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-xl">
                                <h2 className="mb-6 flex items-center gap-2 font-serif text-2xl font-bold text-gray-900">
                                    <span className="text-3xl">📋</span>
                                    Rundown Event
                                </h2>
                                <div className="space-y-3">
                                    {order.event.rundown_items
                                        .sort((a, b) => a.order - b.order)
                                        .map((item) => (
                                            <div key={item.id} className="flex items-start gap-4 rounded-lg border-l-4 border-[#D4AF37] bg-gray-50 p-4">
                                                <div className="flex-shrink-0">
                                                    <p className="font-mono text-sm font-bold text-[#D4AF37]">{item.time}</p>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="mb-1 font-semibold text-gray-900">{item.activity}</p>
                                                    {item.description && <p className="mb-2 text-sm text-gray-600">{item.description}</p>}
                                                    {item.pic && (
                                                        <p className="text-xs text-gray-500">
                                                            PIC: <span className="font-medium">{item.pic}</span>
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            item.status === 'completed'
                                                                ? 'bg-green-100 text-green-800'
                                                                : item.status === 'in_progress'
                                                                  ? 'bg-blue-100 text-blue-800'
                                                                  : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        {item.status === 'completed'
                                                            ? 'Selesai'
                                                            : item.status === 'in_progress'
                                                              ? 'Berlangsung'
                                                              : 'Belum'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Item Details */}
                        {order.order_details && order.order_details.length > 0 && (
                            <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-xl">
                                <h2 className="mb-6 flex items-center gap-2 font-serif text-2xl font-bold text-gray-900">
                                    <span className="text-3xl">📦</span>
                                    Detail Item Pesanan
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b-2 border-gray-200">
                                                <th className="pb-3 text-left text-sm font-semibold text-gray-700">Item</th>
                                                <th className="pb-3 text-left text-sm font-semibold text-gray-700">Jenis</th>
                                                <th className="pb-3 text-center text-sm font-semibold text-gray-700">Qty</th>
                                                <th className="pb-3 text-right text-sm font-semibold text-gray-700">Harga</th>
                                                <th className="pb-3 text-right text-sm font-semibold text-gray-700">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {order.order_details.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="py-3 text-sm text-gray-900">{item.item_name}</td>
                                                    <td className="py-3 text-sm text-gray-600">{item.item_type}</td>
                                                    <td className="py-3 text-center text-sm text-gray-900">{item.quantity}</td>
                                                    <td className="py-3 text-right text-sm text-gray-900">
                                                        Rp {(item.price / 1000).toFixed(0)}k
                                                    </td>
                                                    <td className="py-3 text-right text-sm font-semibold text-gray-900">
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
                        <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-xl">
                            <h2 className="mb-6 flex items-center gap-2 font-serif text-2xl font-bold text-gray-900">
                                <span className="text-3xl">💳</span>
                                Riwayat Pembayaran
                            </h2>
                            {order.payment_transactions && order.payment_transactions.length > 0 ? (
                                <div className="space-y-4">
                                    {order.payment_transactions
                                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                        .map((payment) => (
                                            <div
                                                key={payment.id}
                                                className={`rounded-lg border-2 p-4 ${
                                                    payment.status === 'verified'
                                                        ? 'border-green-200 bg-green-50'
                                                        : payment.status === 'pending'
                                                          ? 'border-yellow-200 bg-yellow-50'
                                                          : 'border-red-200 bg-red-50'
                                                }`}
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            payment.status === 'verified'
                                                                ? 'bg-green-100 text-green-800'
                                                                : payment.status === 'pending'
                                                                  ? 'bg-yellow-100 text-yellow-800'
                                                                  : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {payment.status === 'verified'
                                                            ? '✓ Terverifikasi'
                                                            : payment.status === 'pending'
                                                              ? '⏳ Menunggu'
                                                              : '✗ Ditolak'}
                                                    </span>
                                                </div>
                                                <p className="mb-1 text-lg font-bold text-gray-900">
                                                    Rp {(parseFloat(payment.amount.toString()) / 1000000).toFixed(2)}jt
                                                </p>
                                                <p className="mb-1 text-sm text-gray-600">{getPaymentTypeLabel(payment.payment_type)}</p>
                                                <p className="mb-2 text-sm text-gray-600">{getPaymentMethodLabel(payment.payment_method)}</p>
                                                <p className="text-xs text-gray-400">
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
                                                        <p className="mb-1 text-xs font-semibold text-gray-600">Bukti Pembayaran</p>
                                                        <a
                                                            href={payment.proof_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block overflow-hidden rounded-lg border-2 border-gray-200 transition-all hover:border-[#D4AF37]"
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
                                                        <p className="mt-1 text-xs text-gray-500">Klik untuk memperbesar</p>
                                                    </div>
                                                )}
                                                {payment.notes && (
                                                    <p className="mt-2 text-xs italic text-gray-500">Catatan Admin: {payment.notes}</p>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="rounded-lg bg-gray-50 p-6 text-center">
                                    <p className="text-3xl">💰</p>
                                    <p className="mt-2 text-sm text-gray-600">Belum ada pembayaran</p>
                                </div>
                            )}
                        </div>

                        {/* Contact Section */}
                        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#D4AF37] to-[#EC4899] p-6 shadow-xl">
                            <h2 className="mb-4 flex items-center gap-2 font-serif text-2xl font-bold text-white">
                                <span className="text-3xl">📞</span>
                                Butuh Bantuan?
                            </h2>
                            <p className="mb-6 text-white/90">Tim kami siap membantu Anda 24/7</p>
                            <a
                                href={`https://wa.me/6281234567890?text=Halo, saya ingin menanyakan tentang pesanan ${order.order_number}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-[#D4AF37] shadow-lg transition-all hover:scale-105"
                            >
                                <span className="text-xl">💬</span>
                                Hubungi via WhatsApp
                            </a>
                        </div>

                        {/* Quick Actions */}
                        <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-xl">
                            <h2 className="mb-4 font-serif text-xl font-bold text-gray-900">Aksi Cepat</h2>
                            <div className="space-y-3">
                                {order.payment_status !== 'paid' && (
                                    <button className="w-full rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] px-4 py-3 font-semibold text-white shadow-md transition-all hover:scale-105">
                                        💰 Bayar Sekarang
                                    </button>
                                )}
                                <button className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-all hover:border-[#D4AF37] hover:bg-gray-50">
                                    🖨️ Download Invoice
                                </button>
                                <button className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-all hover:border-[#D4AF37] hover:bg-gray-50">
                                    📄 Download Kontrak
                                </button>
                            </div>
                        </div>

                        {/* Event Progress (if event exists) */}
                        {order.event && (
                            <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-xl">
                                <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-bold text-gray-900">
                                    <span className="text-2xl">🎯</span>
                                    Progress Event
                                </h2>
                                <div className="space-y-3">
                                    {order.event.task_assignments && order.event.task_assignments.length > 0 ? (
                                        order.event.task_assignments.map((task) => (
                                            <div key={task.id} className="rounded-lg border border-gray-200 p-3">
                                                <div className="mb-2 flex items-start justify-between">
                                                    <p className="font-semibold text-gray-900">{task.task_name}</p>
                                                    <span
                                                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                                            task.status === 'completed'
                                                                ? 'bg-green-100 text-green-800'
                                                                : task.status === 'in_progress'
                                                                  ? 'bg-blue-100 text-blue-800'
                                                                  : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        {task.status === 'completed' ? '✓' : task.status === 'in_progress' ? '⋯' : '○'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600">{task.task_description}</p>
                                                {task.assigned_to && (
                                                    <p className="mt-1 text-xs text-gray-500">PIC: {task.assigned_to}</p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-sm text-gray-500">Progress akan diupdate segera</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderDetail;
