import { Link, router, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import {
    Archive,
    ArrowLeftRight,
    BadgeCheck,
    Bell,
    Briefcase,
    Building2,
    Calendar,
    CalendarCheck2,
    CheckSquare,
    ChevronDown,
    ChevronRight,
    ClipboardList,
    Database,
    DollarSign,
    Download,
    FileSpreadsheet,
    FolderKanban,
    Gauge,
    Globe,
    HardDrive,
    Image,
    LayoutDashboard,
    List,
    LogOut,
    Mail,
    MapPin,
    Menu,
    Moon,
    Package,
    PencilRuler,
    Scale,
    Settings,
    Shield,
    Star,
    Sun,
    UserCircle2,
    UserRound,
    Users,
    Wrench,
} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
    header?: React.ReactNode;
}

interface MenuItem {
    name: string;
    icon: React.ReactNode;
    path?: string;
    badge?: string;
    children?: MenuItem[];
    roles?: string[]; // Roles yang bisa melihat menu ini
}

const ALL_ADMIN_ROLES = ['super_admin', 'admin'];
const ALL_PANEL_ROLES = ['super_admin', 'admin', 'marketing'];

const formatRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
        super_admin: 'Owner',
        admin: 'Admin',
        marketing: 'Marketing',
        user: 'User',
        client: 'Client',
        sales: 'Sales',
        manager: 'Manager',
        staff: 'Staff',
    };
    return labels[role] || role;
};

type ThemeMode = 'light' | 'dark';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, header }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [openMenus, setOpenMenus] = useState<string[]>(['dashboard']);
    const [themeMode, setThemeMode] = useState<ThemeMode>('light');
    const { auth, url } = usePage<{ auth: { user: { id: number; name: string; email: string; role: string } }; url: string }>().props;
    const user = auth?.user;
    const currentPath = url;

    useEffect(() => {
        const savedTheme = (localStorage.getItem('admin-theme-mode') as ThemeMode | null) || 'light';
        setThemeMode(savedTheme);
    }, []);

    useEffect(() => {
        localStorage.setItem('admin-theme-mode', themeMode);
    }, [themeMode]);

    const toggleTheme = () => {
        setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const allMenuItems: MenuItem[] = [
        {
            name: 'Dashboard',
            icon: <LayoutDashboard className="h-4 w-4" />,
            path: '/admin',
            roles: ALL_PANEL_ROLES,
        },
        {
            name: 'Manajemen User',
            icon: <Users className="h-4 w-4" />,
            roles: ALL_ADMIN_ROLES,
            children: [
                { name: 'Daftar User', icon: <List className="h-4 w-4" />, path: '/admin/users' },
                { name: 'Role & Permission', icon: <Shield className="h-4 w-4" />, path: '/admin/roles' },
                { name: 'Notifikasi', icon: <Bell className="h-4 w-4" />, path: '/admin/notifications' },
                { name: 'User Activity', icon: <Gauge className="h-4 w-4" />, path: '/admin/user-activity' },
            ],
        },
        {
            name: 'Website Content',
            icon: <Globe className="h-4 w-4" />,
            roles: ALL_PANEL_ROLES,
            children: [
                { name: 'Pengaturan Umum', icon: <Wrench className="h-4 w-4" />, path: '/admin/settings/general' },
                { name: 'Company Profile', icon: <Building2 className="h-4 w-4" />, path: '/admin/company-profile' },
                { name: 'Services', icon: <Wrench className="h-4 w-4" />, path: '/admin/services' },
                { name: 'Gallery', icon: <Image className="h-4 w-4" />, path: '/admin/gallery' },
                { name: 'Testimonials', icon: <BadgeCheck className="h-4 w-4" />, path: '/admin/testimonials' },
                { name: 'Packages', icon: <Package className="h-4 w-4" />, path: '/admin/packages' },
                { name: 'Portfolio', icon: <PencilRuler className="h-4 w-4" />, path: '/admin/portfolio' },
            ],
        },
        {
            name: 'Inventaris',
            icon: <Archive className="h-4 w-4" />,
            badge: '12',
            roles: ALL_ADMIN_ROLES,
            children: [
                { name: 'Kategori', icon: <FolderKanban className="h-4 w-4" />, path: '/admin/inventory/categories' },
                { name: 'Daftar Barang', icon: <ClipboardList className="h-4 w-4" />, path: '/admin/inventory/items' },
                { name: 'Stock In/Out', icon: <ArrowLeftRight className="h-4 w-4" />, path: '/admin/inventory/transactions' },
                { name: 'Low Stock Alert', icon: <Bell className="h-4 w-4" />, path: '/admin/inventory/alerts', badge: '5' },
            ],
        },
        {
            name: 'Transaksi & Order',
            icon: <DollarSign className="h-4 w-4" />,
            roles: ALL_ADMIN_ROLES,
            children: [
                { name: 'Wedding Order', icon: <ClipboardList className="h-4 w-4" />, path: '/admin/orders' },
                { name: 'Mini Order', icon: <ClipboardList className="h-4 w-4" />, path: '/admin/mini-orders' },
                { name: 'Laporan Keuangan', icon: <FileSpreadsheet className="h-4 w-4" />, path: '/admin/financial-reports' },
            ],
        },
        {
            name: 'Event & Rundown',
            icon: <CalendarCheck2 className="h-4 w-4" />,
            roles: ALL_ADMIN_ROLES,
            children: [
                { name: 'Daftar Event', icon: <Calendar className="h-4 w-4" />, path: '/admin/events' },
                { name: 'Rundown Acara', icon: <List className="h-4 w-4" />, path: '/admin/rundowns' },
                { name: 'Task Assignment', icon: <CheckSquare className="h-4 w-4" />, path: '/admin/tasks' },
                { name: 'Kalender Event', icon: <CalendarCheck2 className="h-4 w-4" />, path: '/admin/calendar' },
            ],
        },
        {
            name: 'Venue',
            icon: <MapPin className="h-4 w-4" />,
            roles: ALL_ADMIN_ROLES,
            children: [
                { name: 'Daftar Venue', icon: <ClipboardList className="h-4 w-4" />, path: '/admin/venues' },
                { name: 'Pricing', icon: <DollarSign className="h-4 w-4" />, path: '/admin/venues/pricing' },
            ],
        },
        {
            name: 'Karyawan',
            icon: <UserRound className="h-4 w-4" />,
            roles: ALL_ADMIN_ROLES,
            children: [
                { name: 'Daftar Karyawan', icon: <ClipboardList className="h-4 w-4" />, path: '/admin/employees' },
                { name: 'Jadwal Kerja', icon: <Calendar className="h-4 w-4" />, path: '/admin/employees/schedules' },
                { name: 'Payroll', icon: <Scale className="h-4 w-4" />, path: '/admin/payroll' },
            ],
        },
        {
            name: 'Biaya Operasional',
            icon: <Database className="h-4 w-4" />,
            roles: ALL_ADMIN_ROLES,
            children: [
                { name: 'Produksi & Bahan Baku', icon: <Briefcase className="h-4 w-4" />, path: '/admin/operational-costs' },
            ],
        },
        {
            name: 'Vendor',
            icon: <Building2 className="h-4 w-4" />,
            roles: ALL_ADMIN_ROLES,
            children: [
                { name: 'Daftar Vendor', icon: <ClipboardList className="h-4 w-4" />, path: '/admin/vendors' },
                { name: 'Kategori Vendor', icon: <FolderKanban className="h-4 w-4" />, path: '/admin/vendor-categories' },
                { name: 'Kontrak', icon: <FileSpreadsheet className="h-4 w-4" />, path: '/admin/contracts' },
                { name: 'Rating & Review', icon: <Star className="h-4 w-4" />, path: '/admin/vendor-ratings' },
            ],
        },
        {
            name: 'Clients',
            icon: <UserCircle2 className="h-4 w-4" />,
            roles: ALL_ADMIN_ROLES,
            children: [
                { name: 'Daftar Client', icon: <ClipboardList className="h-4 w-4" />, path: '/admin/clients' },
                { name: 'Verifikasi Order', icon: <BadgeCheck className="h-4 w-4" />, path: '/admin/client-verification' },
            ],
        },
        {
            name: 'Laporan',
            icon: <FileSpreadsheet className="h-4 w-4" />,
            roles: ALL_ADMIN_ROLES,
            children: [
                { name: 'Laporan Penjualan', icon: <DollarSign className="h-4 w-4" />, path: '/admin/reports/sales' },
                { name: 'Laporan Inventaris', icon: <Archive className="h-4 w-4" />, path: '/admin/reports/inventory' },
                { name: 'Laporan Kinerja', icon: <Gauge className="h-4 w-4" />, path: '/admin/reports/performance' },
                { name: 'Export Data', icon: <Download className="h-4 w-4" />, path: '/admin/reports/export' },
            ],
        },
        {
            name: 'Pengaturan',
            icon: <Settings className="h-4 w-4" />,
            roles: ALL_ADMIN_ROLES,
            children: [
                { name: 'Notifikasi', icon: <Bell className="h-4 w-4" />, path: '/admin/settings/notifications' },
                { name: 'Email Templates', icon: <Mail className="h-4 w-4" />, path: '/admin/settings/email-templates' },
                { name: 'Backup & Restore', icon: <HardDrive className="h-4 w-4" />, path: '/admin/settings/backup' },
            ],
        },
    ];

    // Filter menu berdasarkan role user
    const menuItems = allMenuItems.filter((item) => {
        if (!item.roles) return true;
        return user?.role && item.roles.includes(user.role);
    });

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
        <div className={`admin-theme ${themeMode} flex h-screen bg-[var(--admin-bg)] text-[var(--admin-text)]`}>
            {/* Sidebar */}
            <aside
                className={`border-r border-[var(--admin-border)] bg-[var(--admin-sidebar-bg)] text-[var(--admin-sidebar-text)] transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between border-b border-[var(--admin-border)] p-4">
                    {isSidebarOpen && (
                        <div className="flex items-center space-x-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--admin-accent)] text-[var(--admin-accent-contrast)]">
                                <span className="text-sm font-semibold">SD</span>
                            </div>
                            <span className="text-lg font-semibold">SistemDekor Admin</span>
                        </div>
                    )}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="rounded p-1 hover:bg-[var(--admin-hover)]">
                        {isSidebarOpen ? <ChevronRight className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
                                        isActive(item.path)
                                            ? 'bg-[var(--admin-accent)] text-[var(--admin-accent-contrast)]'
                                            : 'text-[var(--admin-sidebar-text)] hover:bg-[var(--admin-hover)]'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span>{item.icon}</span>
                                        {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                                    </div>
                                    {isSidebarOpen && item.badge && (
                                        <span className="rounded-full bg-[var(--admin-accent)] px-2 py-0.5 text-xs font-semibold text-[var(--admin-accent-contrast)]">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            ) : (
                                // Menu with children
                                <>
                                    <button
                                        onClick={() => toggleMenu(item.name)}
                                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[var(--admin-sidebar-text)] transition-colors hover:bg-[var(--admin-hover)]"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span>{item.icon}</span>
                                            {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                                        </div>
                                        {isSidebarOpen && (
                                            <div className="flex items-center space-x-2">
                                                {item.badge && (
                                                    <span className="rounded-full bg-[var(--admin-accent)] px-2 py-0.5 text-xs font-semibold text-[var(--admin-accent-contrast)]">
                                                        {item.badge}
                                                    </span>
                                                )}
                                                {openMenus.includes(item.name) ? (
                                                    <ChevronDown className="h-3 w-3" />
                                                ) : (
                                                    <ChevronRight className="h-3 w-3" />
                                                )}
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
                                                            ? 'bg-[var(--admin-accent)] text-[var(--admin-accent-contrast)]'
                                                            : 'text-[var(--admin-sidebar-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-sidebar-text)]'
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <span>{child.icon}</span>
                                                        <span>{child.name}</span>
                                                    </div>
                                                    {child.badge && (
                                                        <span className="rounded-full bg-[var(--admin-accent)] px-2 py-0.5 text-xs font-semibold text-[var(--admin-accent-contrast)]">
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
                    <div className="border-t border-[var(--admin-border)] p-4">
                        <div className="mb-2 flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--admin-accent)] font-bold text-[var(--admin-accent-contrast)]">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">{user?.name}</p>
                                <p className="text-xs text-[var(--admin-sidebar-muted)]">{user?.role ? formatRoleLabel(user.role) : ''}</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--admin-border)] px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--admin-hover)]"
                        >
                            {themeMode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            <span>{themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-[var(--admin-accent)] px-3 py-2 text-sm font-medium text-[var(--admin-accent-contrast)] transition-colors hover:opacity-90"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top Header */}
                <header className="border-b border-[var(--admin-border)] bg-[var(--admin-surface)]">
                    <div className="px-6 py-4">
                        {header ? (
                            header
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-[var(--admin-text)]">Dashboard Admin</h1>
                                    <p className="text-sm text-[var(--admin-muted)]">Selamat Datang, {user?.name}!</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={toggleTheme}
                                        className="inline-flex items-center gap-2 rounded-lg border border-[var(--admin-border)] px-3 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-hover)]"
                                    >
                                        {themeMode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                        <span>{themeMode === 'dark' ? 'Light' : 'Dark'}</span>
                                    </button>
                                    {/* Profile */}
                                    <div className="flex items-center space-x-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--admin-accent)] font-bold text-[var(--admin-accent-contrast)]">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-[var(--admin-bg)] p-6">{children}</main>
            </div>
        </div>
    );
};
