import { Link, router, usePage } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';

type MenuKey = 'home' | 'about' | 'packages' | 'gallery' | 'contact' | 'orders';

interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface HeaderProps {
    active?: MenuKey;
    companyName?: string;
    logoUrl?: string;
}

interface NavItem {
    key: MenuKey;
    label: string;
    href: string;
}

export const SiteHeader: React.FC<HeaderProps> = ({ active = 'home', companyName = 'SistemDekor', logoUrl }) => {
    const { auth } = usePage<{ auth?: { user?: AuthUser } }>().props;
    const user = auth?.user;
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = useMemo<NavItem[]>(
        () => [
            { key: 'home', label: 'Beranda', href: '/' },
            { key: 'about', label: 'Tentang', href: '/#about' },
            { key: 'packages', label: 'Paket', href: '/packages' },
            { key: 'gallery', label: 'Gallery', href: '/gallery' },
            { key: 'contact', label: 'Kontak', href: '/#contact' },
            { key: 'orders', label: 'Status Order', href: user ? '/my-orders' : '/login' },
        ],
        [user],
    );

    const handleLogout = () => {
        router.post('/logout');
    };

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        const isHomePage = typeof window !== 'undefined' && window.location.pathname === '/';
        
        if (isHomePage && (href.startsWith('/#') || href.startsWith('#'))) {
            e.preventDefault();
            
            // Extract the ID ('about' or 'contact')
            const targetId = href.replace('/#', '').replace('#', '');
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
            setMobileOpen(false);
        }
    };

    return (
        <header className="sticky top-0 z-50 border-b border-[#D4AF37]/20 bg-[#FCF8F1]/95 backdrop-blur-xl">
            <div className="w-full px-4 sm:px-8 2xl:px-16">
                <div className="flex h-20 items-center justify-between">
                    <Link href="/" className="group flex items-center gap-3">
                        {logoUrl ? (
                            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[#D4AF37]/30 bg-white shadow-lg shadow-[#D4AF37]/20">
                                <img src={logoUrl} alt={companyName} className="h-full w-full object-contain" />
                            </div>
                        ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8A6A4F] text-lg font-bold text-white shadow-lg shadow-[#D4AF37]/20 transition-transform duration-300 group-hover:scale-105">
                                {companyName.slice(0, 1).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="font-serif text-xl font-bold text-slate-900">{companyName}</p>
                            <p className="text-xs tracking-[0.2em] text-slate-500 uppercase">Wedding Organizer</p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-2 lg:flex">
                        {navItems.map((item) => (
                            <a
                                key={item.key}
                                href={item.href}
                                onClick={(e) => handleNavClick(e, item.href)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                    active === item.key
                                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#8A6A4F] text-white shadow-md'
                                        : 'text-slate-700 hover:bg-[#F9F2E7] hover:text-[#B88321]'
                                }`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-3 lg:flex">
                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <Link
                                        href="/admin"
                                        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#D4AF37] hover:text-[#B88321]"
                                    >
                                        Admin
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#D4AF37] hover:text-[#B88321]"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-full bg-gradient-to-r from-[#D4AF37] to-[#8A6A4F] px-4 py-2 text-sm font-semibold text-white shadow-md"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setMobileOpen((prev) => !prev)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 lg:hidden"
                        aria-label="Toggle menu"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {mobileOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {mobileOpen && (
                    <div className="space-y-2 border-t border-slate-100 py-4 lg:hidden">
                        {navItems.map((item) => (
                            <a
                                key={item.key}
                                href={item.href}
                                onClick={(e) => handleNavClick(e, item.href)}
                                className={`block rounded-xl px-4 py-2 text-sm font-semibold ${
                                    active === item.key ? 'bg-[#F9F2E7] text-[#B88321]' : 'text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                {item.label}
                            </a>
                        ))}

                        <div className="mt-2 flex flex-wrap gap-2 pt-2">
                            {user ? (
                                <>
                                    {user.role === 'admin' && (
                                        <Link href="/admin" className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700">
                                            Admin
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700">
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="rounded-full bg-gradient-to-r from-[#D4AF37] to-[#8A6A4F] px-4 py-2 text-sm text-white"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};
