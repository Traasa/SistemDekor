import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Head } from '@inertiajs/react';
import { CheckCircle2, Clock } from 'lucide-react';

interface Client {
    id: number;
    name: string;
    phone: string;
    email: string;
}

interface Package {
    id: number;
    name: string;
    base_price: number;
}

interface OrderDetail {
    id: number;
    item_name: string;
    item_description: string;
    cost: number;
    quantity: number;
}

interface PaymentTransaction {
    id: number;
    amount: number;
    payment_type: 'DP' | 'Pelunasan';
    payment_date: string;
    status: 'pending' | 'verified';
}

interface Order {
    id: number;
    event_date: string;
    event_address: string;
    total_price: number;
    status: string;
    notes: string;
    client: Client;
    package: Package | null;
    order_details: OrderDetail[];
    payment_transactions: PaymentTransaction[];
}

interface PaymentSummary {
    total_price: number;
    total_paid: number;
    remaining_payment: number;
    dp_status: 'paid' | 'unpaid';
    dp_amount: number;
    dp_date: string | null;
    pelunasan_status: 'paid' | 'unpaid';
    pelunasan_amount: number;
    pelunasan_date: string | null;
}

interface OrderStatusProps {
    order: Order;
    paymentSummary: PaymentSummary;
}

export default function OrderStatus({ order, paymentSummary }: OrderStatusProps) {
    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
            pending: { variant: 'outline', label: 'Menunggu Konfirmasi' },
            confirmed: { variant: 'default', label: 'Terkonfirmasi' },
            completed: { variant: 'secondary', label: 'Selesai' },
            cancelled: { variant: 'destructive', label: 'Dibatalkan' },
        };
        return variants[status] || variants.pending;
    };

    const statusBadge = getStatusBadge(order.status);

    return (
        <>
            <Head title={`Status Pesanan - ${order.client.name}`} />

            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12">
                <div className="container mx-auto max-w-4xl px-4">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-4xl font-bold text-gray-900">Status Pesanan Anda</h1>
                        <p className="text-gray-600">Lihat detail pesanan dan status pembayaran secara real-time</p>
                    </div>

                    {/* Order Info Card */}
                    <Card className="mb-6">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl">Order #{order.id}</CardTitle>
                                    <CardDescription>Atas nama: {order.client.name}</CardDescription>
                                </div>
                                <Badge variant={statusBadge.variant} className="text-sm">
                                    {statusBadge.label}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <p className="mb-1 text-sm text-gray-600">Tanggal Acara</p>
                                    <p className="font-medium">
                                        {new Date(order.event_date).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm text-gray-600">Lokasi Acara</p>
                                    <p className="font-medium">{order.event_address}</p>
                                </div>
                                {order.package && (
                                    <div>
                                        <p className="mb-1 text-sm text-gray-600">Paket</p>
                                        <p className="font-medium">{order.package.name}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="mb-1 text-sm text-gray-600">Kontak</p>
                                    <p className="font-medium">{order.client.phone}</p>
                                </div>
                            </div>
                            {order.notes && (
                                <div className="mt-4">
                                    <p className="mb-1 text-sm text-gray-600">Catatan</p>
                                    <p className="text-gray-700">{order.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Summary Card */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Ringkasan Pembayaran</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Total Price */}
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Total Harga</span>
                                    <span className="text-xl font-bold">Rp {paymentSummary.total_price.toLocaleString('id-ID')}</span>
                                </div>

                                <Separator />

                                {/* DP Status */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {paymentSummary.dp_status === 'paid' ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <Clock className="h-5 w-5 text-yellow-600" />
                                        )}
                                        <span>DP (Uang Muka)</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">
                                            {paymentSummary.dp_status === 'paid'
                                                ? `Rp ${paymentSummary.dp_amount.toLocaleString('id-ID')}`
                                                : 'Belum Dibayar'}
                                        </p>
                                        {paymentSummary.dp_date && (
                                            <p className="text-sm text-gray-500">{new Date(paymentSummary.dp_date).toLocaleDateString('id-ID')}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Pelunasan Status */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {paymentSummary.pelunasan_status === 'paid' ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <Clock className="h-5 w-5 text-yellow-600" />
                                        )}
                                        <span>Pelunasan</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">
                                            {paymentSummary.pelunasan_status === 'paid'
                                                ? `Rp ${paymentSummary.pelunasan_amount.toLocaleString('id-ID')}`
                                                : 'Belum Dibayar'}
                                        </p>
                                        {paymentSummary.pelunasan_date && (
                                            <p className="text-sm text-gray-500">
                                                {new Date(paymentSummary.pelunasan_date).toLocaleDateString('id-ID')}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                {/* Remaining Payment */}
                                <div className="flex items-center justify-between text-lg">
                                    <span className="font-semibold">Sisa Pembayaran</span>
                                    <span className={`font-bold ${paymentSummary.remaining_payment > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        Rp {paymentSummary.remaining_payment.toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Details Card */}
                    {order.order_details && order.order_details.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Detail Pesanan</CardTitle>
                                <CardDescription>Rincian layanan dan kustomisasi</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {order.order_details.map((detail) => (
                                        <div key={detail.id} className="flex items-start justify-between border-b py-2 last:border-b-0">
                                            <div className="flex-1">
                                                <p className="font-medium">{detail.item_name}</p>
                                                {detail.item_description && <p className="text-sm text-gray-600">{detail.item_description}</p>}
                                                <p className="text-sm text-gray-500">Qty: {detail.quantity}</p>
                                            </div>
                                            <div className="ml-4 text-right">
                                                <p className="font-semibold">Rp {(detail.cost * detail.quantity).toLocaleString('id-ID')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment History */}
                    {order.payment_transactions && order.payment_transactions.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Riwayat Pembayaran</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {order.payment_transactions.map((transaction) => (
                                        <div key={transaction.id} className="flex items-center justify-between border-b py-2 last:border-b-0">
                                            <div>
                                                <p className="font-medium">{transaction.payment_type}</p>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(transaction.payment_date).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">Rp {transaction.amount.toLocaleString('id-ID')}</p>
                                                <Badge variant={transaction.status === 'verified' ? 'default' : 'outline'} className="text-xs">
                                                    {transaction.status === 'verified' ? 'Terverifikasi' : 'Pending'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Footer Note */}
                    <div className="mt-8 text-center text-sm text-gray-600">
                        <p>Halaman ini di-update secara otomatis ketika ada perubahan status pembayaran.</p>
                        <p className="mt-2">Jika ada pertanyaan, silakan hubungi tim kami.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
