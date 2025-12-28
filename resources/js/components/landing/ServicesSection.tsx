import React from 'react';
import { images } from '../../config/theme';

const services = [
    {
        icon: '🏛️',
        title: 'Desain Acara',
        description: 'Tim desainer kami menciptakan konsep visual yang memukau untuk menghadirkan suasana pernikahan yang tak terlupakan.',
        image: images.services.planning,
        gradient: 'from-[#FFF8F0] to-[#FFE4E6]',
    },
    {
        icon: '💐',
        title: 'Dekorasi Premium',
        description: 'Bunga segar, lighting elegan, dan dekorasi mewah yang disesuaikan dengan tema pernikahan Anda.',
        image: images.services.decoration,
        gradient: 'from-[#FFF0F6] to-[#FCE7F3]',
    },
    {
        icon: '📸',
        title: 'Fotografi & Videografi',
        description: 'Abadikan setiap momen berharga dengan fotografer dan videografer profesional kami.',
        image: images.services.photography,
        gradient: 'from-[#F5F3FF] to-[#EDE9FE]',
    },
    {
        icon: '🍽️',
        title: 'Katering Premium',
        description: 'Hidangan lezat dan presentasi menarik dari chef berpengalaman untuk memanjakan tamu Anda.',
        image: images.services.catering,
        gradient: 'from-[#FFF8F0] to-[#FEFCE8]',
    },
    {
        icon: '🏰',
        title: 'Venue Selection',
        description: 'Bantu memilih dan mengatur venue yang sempurna sesuai konsep dan budget Anda.',
        image: images.services.venue,
        gradient: 'from-[#ECFDF5] to-[#D1FAE5]',
    },
    {
        icon: '🎵',
        title: 'Entertainment',
        description: 'Band, DJ, dan hiburan berkualitas untuk membuat acara Anda lebih meriah dan berkesan.',
        image: images.services.entertainment,
        gradient: 'from-[#EFF6FF] to-[#DBEAFE]',
    },
];

export const ServicesSection: React.FC = () => {
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
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="group relative overflow-hidden rounded-3xl bg-white shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                        >
                            {/* Image */}
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 text-6xl drop-shadow-lg">{service.icon}</div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="mb-3 font-serif text-2xl font-bold text-gray-900">{service.title}</h3>
                                <p className="leading-relaxed text-gray-700">{service.description}</p>
                                <div className="mt-6 flex items-center gap-2 font-semibold text-[#D4AF37] transition-transform duration-300 group-hover:translate-x-2">
                                    <span>Pelajari Lebih Lanjut</span>
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
