import { router } from '@inertiajs/react';
import { AlertCircle, Calendar, CheckCircle, Clock, DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { NotificationBell } from '../../components/admin/NotificationBell';
import { StatCard } from '../../components/admin/StatCard';
import { AdminLayout } from '../../layouts/AdminLayout';
import api from '../../services/api';

interface DashboardStats {
    total_orders: { value: number; trend: number };
    total_revenue: { value: number; trend: number };
    pending_orders: number;
    active_orders: number;
    pending_payments: number;
    total_clients: { value: number; trend: number };
}

interface RecentOrder {
    id: number;
    order_number: string;
    client_name: string;
    event_name: string;
    event_date: string;
    final_price: number;
    status: string;
    payment_status: string;
    created_at: string;
}

interface MonthlyRevenue {
    month: string;
    revenue: number;
}

const NewAdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();

        // Refresh every 60 seconds
        const interval = setInterval(fetchDashboardData, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/dashboard/statistics');
            if (response.data.success) {
                setStats(response.data.data.stats);
                setRecentOrders(response.data.data.recent_orders);
                setMonthlyRevenue(response.data.data.monthly_revenue);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
            pending_confirmation: {
                label: 'Pending',
                color: 'text-yellow-700',
                bgColor: 'bg-yellow-100',
            },
            negotiation: {
                label: 'Negosiasi',
                color: 'text-blue-700',
                bgColor: 'bg-blue-100',
            },
            awaiting_dp_payment: {
                label: 'Menunggu DP',
                color: 'text-orange-700',
                bgColor: 'bg-orange-100',
            },
            dp_paid: {
                label: 'DP Dibayar',
                color: 'text-green-700',
                bgColor: 'bg-green-100',
            },
            awaiting_full_payment: {
                label: 'Menunggu Pelunasan',
                color: 'text-purple-700',
                bgColor: 'bg-purple-100',
            },
            paid: {
                label: 'Lunas',
                color: 'text-green-700',
                bgColor: 'bg-green-100',
            },
            confirmed: {
                label: 'Dikonfirmasi',
                color: 'text-blue-700',
                bgColor: 'bg-blue-100',
            },
            processing: {
                label: 'Diproses',
                color: 'text-indigo-700',
                bgColor: 'bg-indigo-100',
            },
            completed: {
                label: 'Selesai',
                color: 'text-green-700',
                bgColor: 'bg-green-100',
            },
            cancelled: {
                label: 'Dibatalkan',
                color: 'text-red-700',
                bgColor: 'bg-red-100',
            },
        };

        const config = statusConfig[status] || {
            label: status,
            color: 'text-gray-700',
            bgColor: 'bg-gray-100',
        };

        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-600">Ringkasan bisnis dan aktivitas terkini</p>
                    </div>
                    <NotificationBell />
                </div>
            }
        >
            <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <StatCard
                        title="Total Order"
                        value={stats?.total_orders.value || 0}
                        icon={<ShoppingCart className="h-6 w-6" />}
                        trend={{
                            value: stats?.total_orders.trend || 0,
                            isPositive: (stats?.total_orders.trend || 0) >= 0,
                        }}
                        color="blue"
                        loading={loading}
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`Rp ${((stats?.total_revenue.value || 0) / 1000000).toFixed(1)}jt`}
                        icon={<DollarSign className="h-6 w-6" />}
                        trend={{
                            value: stats?.total_revenue.trend || 0,
                            isPositive: (stats?.total_revenue.trend || 0) >= 0,
                        }}
                        color="green"
                        loading={loading}
                    />
                    <StatCard
                        title="Pending Order"
                        value={stats?.pending_orders || 0}
                        icon={<Clock className="h-6 w-6" />}
                        color="yellow"
                        loading={loading}
                    />
                    <StatCard
                        title="Active Order"
                        value={stats?.active_orders || 0}
                        icon={<CheckCircle className="h-6 w-6" />}
                        color="purple"
                        loading={loading}
                    />
                    <StatCard
                        title="Pending Payment"
                        value={stats?.pending_payments || 0}
                        icon={<AlertCircle className="h-6 w-6" />}
                        color="red"
                        loading={loading}
                    />
                    <StatCard
                        title="Total Client"
                        value={stats?.total_clients.value || 0}
                        icon={<Users className="h-6 w-6" />}
                        trend={{
                            value: stats?.total_clients.trend || 0,
                            isPositive: (stats?.total_clients.trend || 0) >= 0,
                        }}
                        color="blue"
                        loading={loading}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Monthly Revenue Chart */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Revenue 6 Bulan Terakhir</h2>
                                <TrendingUp className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                        <div className="p-6">
                            {loading ? (
                                <div className="h-64 animate-pulse rounded bg-gray-200"></div>
                            ) : (
                                <div className="space-y-4">
                                    {monthlyRevenue.map((item, index) => (
                                        <div key={`${item.month}-${index}`}>
                                            <div className="mb-1 flex items-center justify-between text-sm">
                                                <span className="font-medium text-gray-700">{item.month}</span>
                                                <span className="font-semibold text-gray-900">Rp {(item.revenue / 1000000).toFixed(1)}jt</span>
                                            </div>
                                            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8941F] transition-all duration-500"
                                                    style={{
                                                        width: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Order Terbaru</h2>
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {loading ? (
                                <div className="space-y-3 p-6">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="h-16 animate-pulse rounded bg-gray-200"></div>
                                    ))}
                                </div>
                            ) : recentOrders.length === 0 ? (
                                <div className="py-12 text-center">
                                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
                                    <p className="mt-2 text-sm text-gray-500">Belum ada order</p>
                                </div>
                            ) : (
                                recentOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        onClick={() => router.visit(`/admin/orders/${order.id}`)}
                                        className="cursor-pointer p-4 transition-colors hover:bg-gray-50"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900">{order.order_number}</p>
                                                <p className="mt-1 truncate text-sm text-gray-600">
                                                    {order.client_name} - {order.event_name}
                                                </p>
                                                <div className="mt-2 flex items-center space-x-2">
                                                    {getStatusBadge(order.status)}
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(order.event_date).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-shrink-0 text-right">
                                                <p className="text-sm font-semibold text-gray-900">Rp {(order.final_price / 1000000).toFixed(1)}jt</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {recentOrders.length > 0 && (
                            <div className="border-t border-gray-200 p-4 text-center">
                                <button
                                    onClick={() => router.visit('/admin/orders')}
                                    className="text-sm font-medium text-[#D4AF37] hover:text-[#B8941F]"
                                >
                                    Lihat Semua Order →
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <button
                        onClick={() => router.visit('/admin/orders/create')}
                        className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-[#D4AF37] hover:bg-gray-50"
                    >
                        <div>
                            <ShoppingCart className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-2 text-sm font-medium text-gray-900">Buat Order Baru</p>
                        </div>
                    </button>
                    <button
                        onClick={() => router.visit('/admin/orders')}
                        className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-[#D4AF37] hover:bg-gray-50"
                    >
                        <div>
                            <AlertCircle className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-2 text-sm font-medium text-gray-900">Lihat Pending Payment</p>
                        </div>
                    </button>
                    <button
                        onClick={() => router.visit('/admin/clients')}
                        className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-[#D4AF37] hover:bg-gray-50"
                    >
                        <div>
                            <Users className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-2 text-sm font-medium text-gray-900">Kelola Client</p>
                        </div>
                    </button>
                    <button
                        onClick={() => router.visit('/admin/packages')}
                        className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-[#D4AF37] hover:bg-gray-50"
                    >
                        <div>
                            <CheckCircle className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-2 text-sm font-medium text-gray-900">Kelola Package</p>
                        </div>
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default NewAdminDashboard;
