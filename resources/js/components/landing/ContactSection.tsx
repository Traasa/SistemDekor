import React from 'react';
import { CompanyProfile } from '../../services/companyProfileService';

interface ContactSectionProps {
    profile: CompanyProfile | null;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ profile }) => {
    return (
        <section id="contact" className="relative overflow-hidden bg-gradient-to-br from-[#FFF8F0] via-[#F5F1E8] to-[#FFE4E6] py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <span className="inline-block rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] px-4 py-2 text-sm font-bold text-white">
                        HUBUNGI KAMI
                    </span>
                    <h2 className="mt-4 font-serif text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl">
                        Mari <span className="bg-gradient-to-r from-[#D4AF37] to-[#EC4899] bg-clip-text text-transparent">Berdiskusi</span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">Siap membantu mewujudkan pernikahan impian Anda</p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <div className="group text-center transition-transform duration-300 hover:-translate-y-2">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] text-3xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                            📞
                        </div>
                        <h3 className="mb-3 font-bold text-gray-900">Telepon</h3>
                        <p className="text-gray-600">{profile?.phone || '+62 812-3456-7890'}</p>
                        <p className="mt-2 text-sm text-gray-500">Senin - Sabtu</p>
                    </div>

                    <div className="group text-center transition-transform duration-300 hover:-translate-y-2">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#F472B6] text-3xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                            📧
                        </div>
                        <h3 className="mb-3 font-bold text-gray-900">Email</h3>
                        <p className="text-gray-600">{profile?.email || 'info@diamondweddings.com'}</p>
                        <p className="mt-2 text-sm text-gray-500">24/7 Response</p>
                    </div>

                    <div className="group text-center transition-transform duration-300 hover:-translate-y-2">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] text-3xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                            💬
                        </div>
                        <h3 className="mb-3 font-bold text-gray-900">WhatsApp</h3>
                        <p className="text-gray-600">{profile?.phone || '+62 812-3456-7890'}</p>
                        <p className="mt-2 text-sm text-gray-500">Chat Langsung</p>
                    </div>

                    <div className="group text-center transition-transform duration-300 hover:-translate-y-2">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] text-3xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                            📍
                        </div>
                        <h3 className="mb-3 font-bold text-gray-900">Lokasi</h3>
                        <p className="text-gray-600">{profile?.address || 'Jakarta, Indonesia'}</p>
                        <p className="mt-2 text-sm text-gray-500">Kunjungi Showroom</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
