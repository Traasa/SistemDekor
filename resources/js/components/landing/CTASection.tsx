import { Link } from '@inertiajs/react';
import React from 'react';

export const CTASection: React.FC = () => {
    return (
        <section className="relative overflow-hidden bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#EC4899] py-24">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAgMzBjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                <h2 className="font-serif text-4xl font-bold text-white md:text-5xl lg:text-6xl">Wujudkan Momen Bahagia yang Selalu Anda Impikan</h2>
                <p className="mt-6 text-xl text-white/90 md:text-2xl">Mari bersama kami ciptakan pernikahan yang tak terlupakan</p>
                <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                        href="/packages"
                        className="group relative overflow-hidden rounded-full bg-white px-10 py-4 font-bold text-[#D4AF37] shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-white/50"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <span className="text-2xl">💍</span>
                            Lihat Paket Wedding
                        </span>
                    </Link>
                    <a
                        href="#contact"
                        className="group relative overflow-hidden rounded-full border-2 border-white bg-white/10 px-10 py-4 font-bold text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white hover:text-[#D4AF37]"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <span className="text-2xl">📞</span>
                            Hubungi Kami
                        </span>
                    </a>
                </div>
            </div>
        </section>
    );
};
