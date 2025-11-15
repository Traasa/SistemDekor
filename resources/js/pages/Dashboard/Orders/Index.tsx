import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Plus, Search } from 'lucide-react';
import React from 'react';

interface Client {
    id: number;
    name: string;
    phone: string;
}

interface Package {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
}

interface Order {
    id: number;
    event_date: string;
    total_price: number;
    status: string;
    client: Client;
    package: Package | null;
    user: User;
    created_at: string;
}

interface Pagination {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface IndexProps {
    orders: Pagination;
    filters: {
        status?: string;
        search?: string;
    };
}

export default function Index({ orders, filters }: IndexProps) {
    const [search, setSearch] = React.useState(filters.search || '');
    const [status, setStatus] = React.useState(filters.status || '');

    const handleFilter = () => {
        router.get(
            '/orders',
            { search, status },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
            pending: { variant: 'outline', label: 'Pending' },
            confirmed: { variant: 'default', label: 'Terkonfirmasi' },
            completed: { variant: 'secondary', label: 'Selesai' },
            cancelled: { variant: 'destructive', label: 'Dibatalkan' },
        };
        return variants[status] || variants.pending;
    };

    return (
        <AppLayout>
            <Head title="Manajemen Orders" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl">Manajemen Orders</CardTitle>
                                <Link href={route('orders.create')}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Buat Order Baru
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Filters */}
                            <div className="mb-6 flex gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Cari nama klien..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    />
                                </div>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Filter Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Semua Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Terkonfirmasi</SelectItem>
                                        <SelectItem value="completed">Selesai</SelectItem>
                                        <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleFilter}>
                                    <Search className="mr-2 h-4 w-4" />
                                    Filter
                                </Button>
                            </div>

                            {/* Table */}
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Klien</TableHead>
                                            <TableHead>Paket</TableHead>
                                            <TableHead>Tanggal Acara</TableHead>
                                            <TableHead>Total Harga</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Sales</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="py-8 text-center text-gray-500">
                                                    Tidak ada data order
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            orders.data.map((order) => {
                                                const statusBadge = getStatusBadge(order.status);
                                                return (
                                                    <TableRow key={order.id}>
                                                        <TableCell className="font-medium">#{order.id}</TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-medium">{order.client.name}</p>
                                                                <p className="text-sm text-gray-500">{order.client.phone}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{order.package?.name || '-'}</TableCell>
                                                        <TableCell>{new Date(order.event_date).toLocaleDateString('id-ID')}</TableCell>
                                                        <TableCell>Rp {order.total_price.toLocaleString('id-ID')}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                                                        </TableCell>
                                                        <TableCell>{order.user.name}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Link href={route('orders.show', order.id)}>
                                                                <Button variant="ghost" size="sm">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {orders.last_page > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <p className="text-sm text-gray-600">
                                        Menampilkan {orders.data.length} dari {orders.total} orders
                                    </p>
                                    <div className="flex gap-2">
                                        {orders.current_page > 1 && (
                                            <Link href={route('orders.index', { ...filters, page: orders.current_page - 1 })} preserveState>
                                                <Button variant="outline" size="sm">
                                                    Previous
                                                </Button>
                                            </Link>
                                        )}
                                        {orders.current_page < orders.last_page && (
                                            <Link href={route('orders.index', { ...filters, page: orders.current_page + 1 })} preserveState>
                                                <Button variant="outline" size="sm">
                                                    Next
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
