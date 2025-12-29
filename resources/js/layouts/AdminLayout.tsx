import { Link, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';

interface AdminLayoutProps {
    children: React.ReactNode;
    header?: React.ReactNode;
}

interface MenuItem {
    name: string;
    icon: string;
    path?: string;
    badge?: string;
    children?: MenuItem[];
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, header }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [openMenus, setOpenMenus] = useState<string[]>(['dashboard']);
    const { auth, url } = usePage<{ auth: { user: { id: number; name: string; email: string; role: string } }; url: string }>().props;
    const user = auth?.user;
    const currentPath = url;

    const menuItems: MenuItem[] = [
        {
            name: 'Dashboard',
            icon: '📊',
            path: '/admin',
        },
        {
            name: 'Manajemen User',
            icon: '👥',
            children: [
                { name: 'Daftar User', icon: '📋', path: '/admin/users' },
                { name: 'Role & Permission', icon: '🔐', path: '/admin/roles' },
                { name: 'User Activity', icon: '📈', path: '/admin/user-activity' },
            ],
        },
        {
            name: 'Website Content',
            icon: '🌐',
            children: [
                { name: 'Company Profile', icon: '🏢', path: '/admin/company-profile' },
                { name: 'Services', icon: '⚙️', path: '/admin/services' },
                { name: 'Gallery', icon: '🖼️', path: '/admin/gallery' },
                { name: 'Testimonials', icon: '💬', path: '/admin/testimonials' },
                { name: 'Packages', icon: '📦', path: '/admin/packages' },
                { name: 'Portfolio', icon: '🎨', path: '/admin/portfolio' },
            ],
        },
        {
            name: 'Inventaris',
            icon: '📦',
            badge: '12',
            children: [
                { name: 'Kategori', icon: '🗂️', path: '/admin/inventory/categories' },
                { name: 'Daftar Barang', icon: '📋', path: '/admin/inventory/items' },
                { name: 'Stock In/Out', icon: '📊', path: '/admin/inventory/transactions' },
                { name: 'Low Stock Alert', icon: '⚠️', path: '/admin/inventory/alerts', badge: '5' },
            ],
        },
        {
            name: 'Transaksi & Order',
            icon: '💰',
            children: [
                { name: 'Semua Order', icon: '📋', path: '/admin/orders' },
                { name: 'Laporan Keuangan', icon: '📊', path: '/admin/financial-reports' },
            ],
        },
        {
            name: 'Event & Rundown',
            icon: '🎉',
            children: [
                { name: 'Daftar Event', icon: '📅', path: '/admin/events' },
                { name: 'Rundown Acara', icon: '📝', path: '/admin/rundowns' },
                { name: 'Task Assignment', icon: '✅', path: '/admin/tasks' },
                { name: 'Kalender Event', icon: '📆', path: '/admin/calendar' },
            ],
        },
        {
            name: 'Venue',
            icon: '🏛️',
            children: [
                { name: 'Daftar Venue', icon: '📋', path: '/admin/venues' },
                { name: 'Ketersediaan', icon: '📅', path: '/admin/venues/availability' },
                { name: 'Pricing', icon: '💵', path: '/admin/venues/pricing' },
            ],
        },
        {
            name: 'Karyawan',
            icon: '👔',
            children: [
                { name: 'Daftar Karyawan', icon: '📋', path: '/admin/employees' },
                { name: 'Jadwal Kerja', icon: '🕐', path: '/admin/employees/schedules' },
                { name: 'Penugasan', icon: '📌', path: '/admin/employees/assignments' },
                { name: 'Absensi', icon: '✓', path: '/admin/employees/attendance' },
            ],
        },
        {
            name: 'Vendor',
            icon: '🤝',
            children: [
                { name: 'Daftar Vendor', icon: '📋', path: '/admin/vendors' },
                { name: 'Kategori Vendor', icon: '🗂️', path: '/admin/vendor-categories' },
                { name: 'Kontrak', icon: '📄', path: '/admin/contracts' },
                { name: 'Rating & Review', icon: '⭐', path: '/admin/vendor-ratings' },
            ],
        },
        {
            name: 'Clients',
            icon: '👰',
            children: [
                { name: 'Daftar Client', icon: '📋', path: '/admin/clients' },
                { name: 'Verifikasi Order', icon: '🔍', path: '/admin/client-verification' },
            ],
        },
        {
            name: 'Laporan',
            icon: '📊',
            children: [
                { name: 'Laporan Penjualan', icon: '💰', path: '/admin/reports/sales' },
                { name: 'Laporan Inventaris', icon: '📦', path: '/admin/reports/inventory' },
                { name: 'Laporan Kinerja', icon: '📈', path: '/admin/reports/performance' },
                { name: 'Export Data', icon: '📥', path: '/admin/reports/export' },
            ],
        },
        {
            name: 'Pengaturan',
            icon: '⚙️',
            children: [
                { name: 'Pengaturan Umum', icon: '🔧', path: '/admin/settings/general' },
                { name: 'Notifikasi', icon: '🔔', path: '/admin/settings/notifications' },
                { name: 'Email Templates', icon: '📧', path: '/admin/settings/email-templates' },
                { name: 'Backup & Restore', icon: '💾', path: '/admin/settings/backup' },
            ],
        },
    ];

    const toggleMenu = (menuName: string) => {
        setOpenMenus((prev) => (prev.includes(menuName) ? prev.filter((m) => m !== menuName) : [...prev, menuName]));
    };

    const handleLogout = async () => {
        try {
            router.post('/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const isActive = (path?: string) => {
        if (!path) return false;
        return currentPath === path;
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className={`bg-gray-900 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
                {/* Logo */}
                <div className="flex items-center justify-between border-b border-gray-800 p-4">
                    {isSidebarOpen && (
                        <div className="flex items-center space-x-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#EC4899]">
                                <span className="font-serif text-sm font-bold">W</span>
                            </div>
                            <span className="font-serif text-lg font-bold">Wedding Admin</span>
                        </div>
                    )}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="rounded p-1 hover:bg-gray-800">
                        <span className="text-xl">{isSidebarOpen ? '◀' : '▶'}</span>
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto p-2">
                    {menuItems.map((item) => (
                        <div key={item.name} className="mb-1">
                            {item.path ? (
                                // Single menu item
                                <Link
                                    href={item.path}
                                    className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                                        isActive(item.path) ? 'bg-[#D4AF37] text-white' : 'text-gray-300 hover:bg-gray-800'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-xl">{item.icon}</span>
                                        {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                                    </div>
                                    {isSidebarOpen && item.badge && (
                                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold">{item.badge}</span>
                                    )}
                                </Link>
                            ) : (
                                // Menu with children
                                <>
                                    <button
                                        onClick={() => toggleMenu(item.name)}
                                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-gray-300 transition-colors hover:bg-gray-800"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xl">{item.icon}</span>
                                            {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                                        </div>
                                        {isSidebarOpen && (
                                            <div className="flex items-center space-x-2">
                                                {item.badge && (
                                                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold">{item.badge}</span>
                                                )}
                                                <span className="text-xs">{openMenus.includes(item.name) ? '▼' : '▶'}</span>
                                            </div>
                                        )}
                                    </button>

                                    {/* Submenu */}
                                    {isSidebarOpen && openMenus.includes(item.name) && item.children && (
                                        <div className="mt-1 ml-4 space-y-1">
                                            {item.children.map((child) => (
                                                <Link
                                                    key={child.name}
                                                    href={child.path || '#'}
                                                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                                                        isActive(child.path)
                                                            ? 'bg-[#D4AF37] text-white'
                                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <span>{child.icon}</span>
                                                        <span>{child.name}</span>
                                                    </div>
                                                    {child.badge && (
                                                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold">
                                                            {child.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </nav>

                {/* User Profile */}
                {isSidebarOpen && (
                    <div className="border-t border-gray-800 p-4">
                        <div className="mb-2 flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37] font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">{user?.name}</p>
                                <p className="text-xs text-gray-400">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium transition-colors hover:bg-red-700"
                        >
                            <span>🚪</span>
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top Header */}
                <header className="bg-white shadow-sm">
                    <div className="px-6 py-4">
                        {header ? (
                            header
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Wedding Admin Dashboard</h1>
                                    <p className="text-sm text-gray-600">Selamat Datang, {user?.name}!</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    {/* Profile */}
                                    <div className="flex items-center space-x-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#EC4899] font-bold text-white">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-100 p-6">{children}</main>
            </div>
        </div>
    );
};
