import React from 'react';
import { formatRupiah } from '../../utils/formatRupiah';
import { images } from '../../config/theme';
import { LandingServiceItem } from '../../services/websiteContentService';

interface ServicesSectionProps {
    services: LandingServiceItem[];
}

const fallbackImages = [
    images.services.planning,
    images.services.decoration,
    images.services.photography,
    images.services.catering,
    images.services.venue,
    images.services.entertainment,
];

const getServiceIcon = (category: string | null) => {
    const value = (category || '').toLowerCase();

    if (value.includes('dekor')) return '💐';
    if (value.includes('photo') || value.includes('video')) return '📸';
    if (value.includes('cater') || value.includes('makan')) return '🍽️';
    if (value.includes('venue') || value.includes('lokasi')) return '🏰';
    if (value.includes('sound') || value.includes('music') || value.includes('entertain')) return '🎵';
    return '✨';
};

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services }) => {
    return (
        <section id="services" className="relative overflow-hidden bg-white py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <span className="inline-block rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] px-4 py-2 text-sm font-bold text-white">
                        LAYANAN KAMI
                    </span>
                    <h2 className="mt-4 font-serif text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl">
                        Layanan <span className="bg-gradient-to-r from-[#D4AF37] to-[#EC4899] bg-clip-text text-transparent">Premium</span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                        Berbagai layanan lengkap dan profesional untuk pernikahan impian Anda
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {services.length === 0 && (
                        <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-[#FFF8F0] p-6 text-center text-sm text-gray-600">
                            Belum ada layanan aktif dari admin.
                        </div>
                    )}

                    {services.map((service, index) => (
                        <div
                            key={service.id}
                            className="group relative overflow-hidden rounded-3xl bg-white shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                        >
                            {/* Image */}
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={service.image || fallbackImages[index % fallbackImages.length]}
                                    alt={service.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 text-6xl drop-shadow-lg">{getServiceIcon(service.category)}</div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="mb-2 font-serif text-2xl font-bold text-gray-900">{service.name}</h3>
                                {service.category && <p className="mb-3 text-xs font-semibold tracking-widest text-[#B88321] uppercase">{service.category}</p>}
                                <p className="leading-relaxed text-gray-700">{service.description}</p>
                                <div className="mt-5 flex items-center justify-between">
                                    <p className="text-sm text-gray-500">Harga mulai</p>
                                    <p className="font-semibold text-[#B88321]">{formatRupiah(service.price)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
