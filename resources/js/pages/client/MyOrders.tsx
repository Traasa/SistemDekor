import { Link, usePage } from '@inertiajs/react';
import React, { useState } from 'react';

interface Order {
    id: number;
    order_code: string;
    event_date: string;
    event_location: string;
    event_theme: string;
    guest_count: number;
    total_price: number;
    final_price: number;
    status: string;
    payment_status: string;
    notes: string;
    created_at: string;
}

interface Props {
    orders: Order[];
}

const MyOrders: React.FC<Props> = ({ orders = [] }) => {
    const { auth } = usePage<{ auth: { user: { id: number; name: string; email: string; role: string } } }>().props;
    const user = auth?.user;

    const [filter, setFilter] = useState<string>('all');

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
            pending: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800' },
            pending_confirmation: { label: 'Menunggu Konfirmasi', className: 'bg-blue-100 text-blue-800' },
            confirmed: { label: 'Terkonfirmasi', className: 'bg-green-100 text-green-800' },
            completed: { label: 'Selesai', className: 'bg-gray-100 text-gray-800' },
            cancelled: { label: 'Dibatalkan', className: 'bg-red-100 text-red-800' },
        };

        const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
        return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}>{config.label}</span>;
    };

    const getPaymentStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
            unpaid: { label: 'Belum Bayar', className: 'bg-red-100 text-red-800' },
            partial: { label: 'Bayar Sebagian', className: 'bg-yellow-100 text-yellow-800' },
            paid: { label: 'Lunas', className: 'bg-green-100 text-green-800' },
        };

        const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
        return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}>{config.label}</span>;
    };

    const filteredOrders = filter === 'all' ? orders : orders.filter((order) => order.status === filter);

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
                            <span className="font-serif text-2xl font-bold text-gray-900">Diamond Weddings</span>
                        </Link>

                        <nav className="flex items-center space-x-6">
                            <Link href="/" className="font-medium text-gray-700 hover:text-[#D4AF37]">
                                Beranda
                            </Link>
                            <Link href="/packages" className="font-medium text-gray-700 hover:text-[#D4AF37]">
                                Paket
                            </Link>
                            <Link href="/my-orders" className="border-b-2 border-[#D4AF37] font-medium text-[#D4AF37]">
                                Pesanan Saya
                            </Link>
                            {user?.role === 'admin' && (
                                <Link
                                    href="/admin"
                                    className="rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] px-6 py-2 text-sm font-semibold text-white shadow-lg hover:scale-105"
                                >
                                    Admin Panel
                                </Link>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="font-serif text-4xl font-bold text-gray-900 md:text-5xl">
                        Pesanan <span className="bg-gradient-to-r from-[#D4AF37] to-[#EC4899] bg-clip-text text-transparent">Saya</span>
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">Kelola dan pantau status pesanan wedding Anda</p>
                </div>

                {/* Filter Tabs */}
                <div className="mb-8 flex flex-wrap gap-2">
                    {['all', 'pending_confirmation', 'confirmed', 'completed', 'cancelled'].map((statusFilter) => (
                        <button
                            key={statusFilter}
                            onClick={() => setFilter(statusFilter)}
                            className={`rounded-full px-6 py-2 font-medium transition-all ${
                                filter === statusFilter
                                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-white shadow-lg'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {statusFilter === 'all' && 'Semua'}
                            {statusFilter === 'pending_confirmation' && 'Menunggu Konfirmasi'}
                            {statusFilter === 'confirmed' && 'Terkonfirmasi'}
                            {statusFilter === 'completed' && 'Selesai'}
                            {statusFilter === 'cancelled' && 'Dibatalkan'}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="rounded-3xl bg-white p-12 text-center shadow-xl">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#EC4899]/20">
                            <span className="text-5xl">📋</span>
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-gray-900">Belum Ada Pesanan</h3>
                        <p className="mb-6 text-gray-600">Anda belum memiliki pesanan. Yuk, pilih paket wedding impian Anda!</p>
                        <Link
                            href="/packages"
                            className="inline-block rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] px-8 py-3 font-bold text-white shadow-lg transition-all hover:scale-105"
                        >
                            Lihat Paket Wedding
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className="group overflow-hidden rounded-3xl bg-white p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                            >
                                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                    {/* Order Info */}
                                    <div className="flex-1">
                                        <div className="mb-3 flex flex-wrap items-center gap-3">
                                            <h3 className="font-serif text-2xl font-bold text-gray-900">{order.order_code}</h3>
                                            {getStatusBadge(order.status)}
                                            {getPaymentStatusBadge(order.payment_status)}
                                        </div>

                                        <div className="space-y-2 text-gray-600">
                                            <p className="flex items-center gap-2">
                                                <span className="text-xl">💍</span>
                                                <span className="font-semibold">{order.event_theme}</span>
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <span className="text-xl">📅</span>
                                                <span>
                                                    {new Date(order.event_date).toLocaleDateString('id-ID', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <span className="text-xl">📍</span>
                                                <span>{order.event_location}</span>
                                            </p>
                                            {order.guest_count > 0 && (
                                                <p className="flex items-center gap-2">
                                                    <span className="text-xl">👥</span>
                                                    <span>{order.guest_count} tamu</span>
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-500">Dipesan pada: {order.created_at}</p>
                                        </div>

                                        {order.notes && (
                                            <div className="mt-3 rounded-lg bg-gray-50 p-3">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Catatan:</span> {order.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Price & Action */}
                                    <div className="flex flex-col items-end gap-4">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Total Harga</p>
                                            <p className="font-serif text-3xl font-bold text-[#D4AF37]">
                                                Rp {(order.final_price / 1000000).toFixed(0)}jt
                                            </p>
                                        </div>

                                        {order.status === 'pending_confirmation' && (
                                            <div className="rounded-lg bg-blue-50 p-3 text-center">
                                                <p className="text-sm font-semibold text-blue-800">💬 Tim kami akan menghubungi Anda segera</p>
                                            </div>
                                        )}

                                        <a
                                            href={`https://wa.me/6281234567890?text=Halo, saya ingin menanyakan tentang pesanan ${order.order_code}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105"
                                        >
                                            <span className="text-xl">💬</span>
                                            Hubungi via WhatsApp
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyOrders;
