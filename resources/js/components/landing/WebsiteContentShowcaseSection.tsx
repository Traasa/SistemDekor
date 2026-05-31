import { Link } from '@inertiajs/react';
import React from 'react';
import { LandingGalleryItem, LandingPortfolioItem } from '../../services/websiteContentService';

interface WebsiteContentShowcaseSectionProps {
    galleries: LandingGalleryItem[];
    portfolios: LandingPortfolioItem[];
}

export const WebsiteContentShowcaseSection: React.FC<WebsiteContentShowcaseSectionProps> = ({ galleries, portfolios }) => {
    return (
        <section className="bg-white py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <span className="inline-block rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] px-4 py-2 text-sm font-bold text-white">
                        KARYA TERBARU
                    </span>
                    <h2 className="mt-4 font-serif text-4xl font-bold text-gray-900 md:text-5xl">
                        Gallery & <span className="bg-gradient-to-r from-[#D4AF37] to-[#EC4899] bg-clip-text text-transparent">Portfolio</span>
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-gray-600">
                        Seluruh konten di bawah ini berasal dari pengaturan admin menu Website Content.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-serif text-2xl font-bold text-gray-900">Gallery Featured</h3>
                            <Link href="/gallery" className="text-sm font-semibold text-[#B88321] hover:underline">
                                Lihat semua gallery
                            </Link>
                        </div>

                        {galleries.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-gray-300 bg-[#FFF8F0] p-6 text-sm text-gray-600">
                                Belum ada gallery featured dari admin.
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {galleries.slice(0, 4).map((item) => (
                                    <article key={item.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                        <img src={item.image_path} alt={item.title} className="h-40 w-full object-cover" loading="lazy" />
                                        <div className="p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#B88321]">{item.category || 'Gallery'}</p>
                                            <h4 className="mt-1 line-clamp-1 font-semibold text-gray-900">{item.title}</h4>
                                            {item.description && <p className="mt-1 line-clamp-2 text-sm text-gray-600">{item.description}</p>}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-serif text-2xl font-bold text-gray-900">Portfolio Featured</h3>
                            <Link href="/gallery" className="text-sm font-semibold text-[#B88321] hover:underline">
                                Jelajahi karya
                            </Link>
                        </div>

                        {portfolios.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-gray-300 bg-[#FFF8F0] p-6 text-sm text-gray-600">
                                Belum ada portfolio featured dari admin.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {portfolios.slice(0, 4).map((item) => (
                                    <article key={item.id} className="flex gap-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                                        <img src={item.image_url} alt={item.title} className="h-24 w-28 rounded-xl object-cover" loading="lazy" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#B88321]">{item.category || 'Portfolio'}</p>
                                            <h4 className="line-clamp-1 font-semibold text-gray-900">{item.title}</h4>
                                            {item.description && <p className="mt-1 line-clamp-2 text-sm text-gray-600">{item.description}</p>}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
