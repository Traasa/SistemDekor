import { Head, Link, usePage } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';
import { PublicLayout } from '../../layouts/PublicLayout';
import { formatRupiah } from '../../utils/formatRupiah';

interface Order {
    id: number;
    order_code: string;
    event_date: string;
    event_location: string;
    event_theme: string;
    guest_count: number;
    final_price: number;
    payment_status: string;
    status: string;
    notes: string;
    created_at: string;
}

interface Props {
    orders: Order[];
}

interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

const statusLabel: Record<string, string> = {
    pending: 'Menunggu',
    pending_confirmation: 'Menunggu Konfirmasi',
    confirmed: 'Terkonfirmasi',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

const paymentLabel: Record<string, string> = {
    unpaid: 'Belum Bayar',
    partial: 'Bayar Sebagian',
    paid: 'Lunas',
};

const MyOrders: React.FC<Props> = ({ orders = [] }) => {
    const { auth } = usePage<{ auth?: { user?: AuthUser } }>().props;
    const user = auth?.user;
    const [filter, setFilter] = useState<string>('all');

    const filteredOrders = useMemo(() => {
        if (filter === 'all') {
            return orders;
        }

        return orders.filter((order) => order.status === filter);
    }, [orders, filter]);

    return (
        <>
            <Head title="Status Order" />
            <PublicLayout active="orders" wrapperClassName="min-h-screen bg-[#F6F1EA] text-[#2A2420]">
                <main className="w-full px-4 py-14 font-sans sm:px-8 2xl:px-16">
                    <section className="mb-8 rounded-[28px] border border-[#E7DCCB] bg-[#FFF9F1] p-8 shadow-[0_18px_45px_-35px_rgba(27,36,48,0.65)] sm:p-10">
                        <p className="text-xs font-semibold tracking-[0.28em] text-[#B08A56] uppercase">Status Order</p>
                        <h1 className="mt-3 font-serif text-4xl font-bold text-[#2A2420] sm:text-5xl">Tracking Pesanan Anda</h1>
                        <p className="mt-3 text-[#5B4A3C]">
                            Halo {user?.name || 'Pelanggan'}, pantau progres order dari tahap konfirmasi hingga pelunasan dalam satu halaman.
                        </p>
                    </section>

                    <section className="mb-8 flex flex-wrap gap-2">
                        {['all', 'pending_confirmation', 'confirmed', 'completed', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                                    filter === status
                                        ? 'bg-gradient-to-r from-[#B08A56] to-[#7A5C44] text-white shadow-md'
                                        : 'bg-[#FFFBF6] text-[#5B4A3C] hover:bg-[#F2E7D8]'
                                }`}
                            >
                                {status === 'all' ? 'Semua' : statusLabel[status] || status}
                            </button>
                        ))}
                    </section>

                    {filteredOrders.length === 0 ? (
                        <section className="rounded-3xl border border-[#E7DCCB] bg-[#FFFBF6] p-10 text-center shadow-[0_16px_35px_-30px_rgba(27,36,48,0.6)]">
                            <h2 className="text-2xl font-bold text-[#2A2420]">Belum ada order</h2>
                            <p className="mt-2 text-[#5B4A3C]">Anda bisa mulai dari halaman paket untuk membuat order baru.</p>
                            <Link
                                href="/packages"
                                className="mt-5 inline-block rounded-full bg-gradient-to-r from-[#B08A56] to-[#7A5C44] px-5 py-3 text-sm font-semibold text-white"
                            >
                                Pilih Paket
                            </Link>
                        </section>
                    ) : (
                        <section className="space-y-5">
                            {filteredOrders.map((order) => (
                                <article key={order.id} className="rounded-3xl border border-[#E7DCCB] bg-[#FFFBF6] p-6 shadow-[0_14px_30px_-26px_rgba(27,36,48,0.6)]">
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="font-serif text-2xl font-bold text-[#2A2420]">{order.order_code}</h2>
                                                <span className="rounded-full bg-[#F2E6D6] px-3 py-1 text-xs font-semibold text-[#7A5C44]">
                                                    {statusLabel[order.status] || order.status}
                                                </span>
                                                <span className="rounded-full bg-[#E8EEF5] px-3 py-1 text-xs font-semibold text-[#1B2430]">
                                                    {paymentLabel[order.payment_status] || order.payment_status}
                                                </span>
                                            </div>

                                            <div className="mt-4 grid gap-2 text-sm text-[#5B4A3C] sm:grid-cols-2">
                                                <p>Tema: {order.event_theme || '-'}</p>
                                                <p>Lokasi: {order.event_location || '-'}</p>
                                                <p>Tanggal: {new Date(order.event_date).toLocaleDateString('id-ID')}</p>
                                                <p>Tamu: {order.guest_count || 0}</p>
                                            </div>

                                            {order.notes && (
                                                <p className="mt-3 rounded-xl bg-[#F3E9DC] px-4 py-3 text-sm text-[#5B4A3C]">
                                                    {order.notes}
                                                </p>
                                            )}
                                        </div>

                                        <div className="min-w-[220px] rounded-2xl border border-[#E7DCCB] bg-[#F8F1E8] p-4">
                                            <p className="text-xs font-semibold tracking-widest text-[#7A5C44] uppercase">Nilai Order</p>
                                            <div className="mt-2 text-2xl font-bold text-[#B08A56]">
                                                {formatRupiah(order.final_price)}
                                            </div>
                                            <Link
                                                href={`/my-orders/${order.id}`}
                                                className="mt-4 inline-block w-full rounded-xl bg-gradient-to-r from-[#B08A56] to-[#7A5C44] px-4 py-2 text-center text-sm font-semibold text-white"
                                            >
                                                Lihat Detail
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </section>
                    )}
                </main>

            </PublicLayout>
        </>
    );
};

export default MyOrders;
