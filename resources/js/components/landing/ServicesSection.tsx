import React from 'react';

const services = [
    {
        icon: '🏛️',
        title: 'Desain Acara',
        description:
            'Tim desainer kami menciptakan konsep visual yang memukau untuk menghadirkan suasana pernikahan yang tak terlupakan di hari istimewa Anda.',
        gradient: 'from-[#FFF8F0] to-[#FFE4E6]',
        iconGradient: 'from-[#D4AF37] to-[#F4D03F]',
        color: 'text-[#D4AF37]',
    },
    {
        icon: '💐',
        title: 'Dekorasi Premium',
        description:
            'Bunga segar, lighting elegan, dan dekorasi mewah yang disesuaikan dengan tema pernikahan Anda untuk menciptakan atmosfer yang sempurna.',
        gradient: 'from-[#FFF0F6] to-[#FCE7F3]',
        iconGradient: 'from-[#EC4899] to-[#F472B6]',
        color: 'text-[#EC4899]',
    },
    {
        icon: '👥',
        title: 'Koordinasi Vendor',
        description:
            'Kami mengelola seluruh aspek acara dengan vendor terpercaya dan berpengalaman untuk memastikan hari H berjalan sempurna tanpa hambatan.',
        gradient: 'from-[#F5F3FF] to-[#EDE9FE]',
        iconGradient: 'from-[#8B5CF6] to-[#A78BFA]',
        color: 'text-[#8B5CF6]',
    },
    {
        icon: '🎭',
        title: 'Koordinasi Hari-H',
        description:
            'Di hari spesial Anda, tim kami memastikan setiap jadwal dan alur acara berjalan lancar sesuai rencana, agar Anda dapat fokus menikmati momen berharga.',
        gradient: 'from-[#FFF8F0] to-[#FEFCE8]',
        iconGradient: 'from-[#F59E0B] to-[#FBBF24]',
        color: 'text-[#F59E0B]',
    },
    {
        icon: '📋',
        title: 'Desain Konsep',
        description:
            'Dari desain undangan hingga konsep dekorasi, kami menghadirkan identitas visual yang kohesif dan memukau untuk keseluruhan acara Anda.',
        gradient: 'from-[#ECFDF5] to-[#D1FAE5]',
        iconGradient: 'from-[#10B981] to-[#34D399]',
        color: 'text-[#10B981]',
    },
    {
        icon: '🎉',
        title: 'Entertainment',
        description:
            'Tim berpengalaman kami akan mengkoordinasikan seluruh rundown acara, memastikan semuanya berjalan sempurna sesuai jadwal yang telah direncanakan.',
        gradient: 'from-[#EFF6FF] to-[#DBEAFE]',
        iconGradient: 'from-[#3B82F6] to-[#60A5FA]',
        color: 'text-[#3B82F6]',
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
                            className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${service.gradient} p-8 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl`}
                        >
                            <div
                                className={`absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br ${service.iconGradient}/20 blur-2xl`}
                            ></div>
                            <div className="relative">
                                <div
                                    className={`mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${service.iconGradient} text-4xl text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}
                                >
                                    {service.icon}
                                </div>
                                <h3 className="mb-3 font-serif text-2xl font-bold text-gray-900">{service.title}</h3>
                                <p className="leading-relaxed text-gray-700">{service.description}</p>
                                <div
                                    className={`mt-6 flex items-center gap-2 font-semibold ${service.color} transition-transform duration-300 group-hover:translate-x-2`}
                                >
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
