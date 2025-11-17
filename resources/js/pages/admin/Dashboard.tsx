import { Link } from '@inertiajs/react';
import React from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';

const Dashboard: React.FC = () => {
    const stats = [
        {
            name: 'Total Order',
            value: '145',
            change: '+12%',
            icon: '📋',
            color: 'from-blue-500 to-blue-600',
            path: '/admin/orders',
        },
        {
            name: 'Revenue Bulan Ini',
            value: 'Rp 245M',
            change: '+8%',
            icon: '💰',
            color: 'from-green-500 to-green-600',
            path: '/admin/financial-reports',
        },
        {
            name: 'Active Events',
            value: '28',
            change: '+5%',
            icon: '🎉',
            color: 'from-purple-500 to-purple-600',
            path: '/admin/events',
        },
        {
            name: 'Low Stock Items',
            value: '12',
            change: '-3',
            icon: '⚠️',
            color: 'from-red-500 to-red-600',
            path: '/admin/inventory/alerts',
        },
    ];

    const recentOrders = [
        { id: 'ORD-001', client: 'Budi & Siti', event: 'Pernikahan', date: '2025-12-01', status: 'confirmed', amount: 'Rp 25,000,000' },
        { id: 'ORD-002', client: 'Andi & Rina', event: 'Engagement', date: '2025-11-25', status: 'pending', amount: 'Rp 15,000,000' },
        { id: 'ORD-003', client: 'Dedi & Lina', event: 'Pernikahan', date: '2025-12-10', status: 'confirmed', amount: 'Rp 35,000,000' },
        { id: 'ORD-004', client: 'Eko & Maya', event: 'Birthday', date: '2025-11-28', status: 'processing', amount: 'Rp 8,000,000' },
    ];

    const upcomingEvents = [
        { name: 'Pernikahan Budi & Siti', date: '2025-12-01', time: '10:00', venue: 'Grand Ballroom', status: 'Preparation' },
        { name: 'Engagement Andi & Rina', date: '2025-11-25', time: '18:00', venue: 'Garden Hall', status: 'Confirmed' },
        { name: 'Birthday Eko & Maya', date: '2025-11-28', time: '19:00', venue: 'Sky Lounge', status: 'Planning' },
    ];

    const quickActions = [
        { name: 'Buat Order Baru', icon: '➕', path: '/admin/orders/create', color: 'bg-blue-500 hover:bg-blue-600' },
        { name: 'Tambah Client', icon: '👰', path: '/admin/clients/create', color: 'bg-purple-500 hover:bg-purple-600' },
        { name: 'Stock In', icon: '📦', path: '/admin/inventory/stock-in', color: 'bg-green-500 hover:bg-green-600' },
        { name: 'Lihat Laporan', icon: '📊', path: '/admin/reports/sales', color: 'bg-orange-500 hover:bg-orange-600' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Link key={stat.name} href={stat.path} className="group">
                            <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                        <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                                        <p className={`mt-1 text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                            {stat.change} dari bulan lalu
                                        </p>
                                    </div>
                                    <div
                                        className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${stat.color} text-3xl text-white shadow-lg`}
                                    >
                                        {stat.icon}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-gray-900">Quick Actions</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {quickActions.map((action) => (
                            <Link
                                key={action.name}
                                href={action.path}
                                className={`flex items-center space-x-3 rounded-lg ${action.color} p-4 text-white transition-all hover:scale-105`}
                            >
                                <span className="text-2xl">{action.icon}</span>
                                <span className="font-semibold">{action.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Orders */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                            <Link href="/admin/orders" className="text-sm font-medium text-[#D4AF37] hover:underline">
                                Lihat Semua →
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-gray-900">{order.client}</p>
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-600">
                                            {order.event} • {order.date}
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-[#D4AF37]">{order.amount}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Upcoming Events</h2>
                            <Link href="/admin/events" className="text-sm font-medium text-[#D4AF37] hover:underline">
                                Lihat Kalender →
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {upcomingEvents.map((event, index) => (
                                <div key={index} className="rounded-lg border-l-4 border-[#D4AF37] bg-gray-50 p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{event.name}</p>
                                            <p className="mt-1 text-sm text-gray-600">
                                                📅 {event.date} • 🕐 {event.time}
                                            </p>
                                            <p className="mt-1 text-sm text-gray-600">📍 {event.venue}</p>
                                        </div>
                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">{event.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Additional Info Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Inventory Alert */}
                    <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium opacity-90">Low Stock Alert</p>
                                <p className="mt-2 text-3xl font-bold">12 Items</p>
                                <Link href="/admin/inventory/alerts" className="mt-3 inline-block text-sm font-semibold underline">
                                    Cek Sekarang →
                                </Link>
                            </div>
                            <span className="text-5xl">⚠️</span>
                        </div>
                    </div>

                    {/* Pending Payments */}
                    <div className="rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium opacity-90">Pending Payments</p>
                                <p className="mt-2 text-3xl font-bold">8 Orders</p>
                                <Link href="/admin/payments" className="mt-3 inline-block text-sm font-semibold underline">
                                    Review →
                                </Link>
                            </div>
                            <span className="text-5xl">💳</span>
                        </div>
                    </div>

                    {/* Active Vendors */}
                    <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium opacity-90">Active Vendors</p>
                                <p className="mt-2 text-3xl font-bold">24</p>
                                <Link href="/admin/vendors" className="mt-3 inline-block text-sm font-semibold underline">
                                    Manage →
                                </Link>
                            </div>
                            <span className="text-5xl">🤝</span>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
