import React from 'react';

interface SiteFooterProps {
    companyName?: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
    whatsapp?: string;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({
    companyName = 'SistemDekor',
    description = 'Perencana dan dekorator pernikahan yang fokus pada detail, estetika, dan pengalaman tamu.',
    phone = '+62 812-3456-7890',
    email = 'halo@sistemdekor.com',
    address = 'Jakarta, Indonesia',
    whatsapp,
}) => {
    const whatsappLink = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : 'https://wa.me/6281234567890';

    return (
        <footer className="border-t border-[#D4AF37]/20 bg-slate-950 py-12 text-white">
            <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:gap-10 2xl:max-w-6xl 2xl:px-16">
                <div>
                    <p className="font-serif text-2xl font-bold">{companyName}</p>
                    <p className="mt-3 text-sm text-slate-300">{description}</p>
                </div>

                <div>
                    <p className="text-sm font-semibold tracking-wider text-[#D4AF37] uppercase">Navigasi</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-300">
                        <li><a href="/">Beranda</a></li>
                        <li><a href="/#about">Tentang</a></li>
                        <li><a href="/packages">Paket</a></li>
                        <li><a href="/gallery">Gallery</a></li>
                        <li><a href="/my-orders">Status Order</a></li>
                    </ul>
                </div>

                <div>
                    <p className="text-sm font-semibold tracking-wider text-[#D4AF37] uppercase">Kontak</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-300">
                        <li>{phone}</li>
                        <li>{email}</li>
                        <li>{address}</li>
                    </ul>
                </div>

                <div>
                    <p className="text-sm font-semibold tracking-wider text-[#D4AF37] uppercase">Jam Operasional</p>
                    <p className="mt-3 text-sm text-slate-300">Senin - Sabtu</p>
                    <p className="text-sm text-slate-300">09:00 - 18:00</p>
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-block rounded-full bg-gradient-to-r from-[#D4AF37] to-[#8A6A4F] px-4 py-2 text-sm font-semibold text-white"
                    >
                        Chat WhatsApp
                    </a>
                </div>
            </div>

            <div className="mx-auto mt-10 w-full max-w-6xl border-t border-slate-800 px-4 pt-6 text-center text-xs text-slate-400 sm:px-8 2xl:px-16">
                © {new Date().getFullYear()} SistemDekor. All rights reserved.
            </div>
        </footer>
    );
};
