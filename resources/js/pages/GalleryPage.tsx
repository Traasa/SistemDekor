import { Head, Link } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';
import { PublicLayout } from '../layouts/PublicLayout';
import { LandingGalleryItem, LandingPortfolioItem, websiteContentService } from '../services/websiteContentService';

interface GalleryItem {
    id: number;
    title: string;
    category: string;
    image: string;
    description: string;
    source: 'gallery' | 'portfolio';
}

const GalleryPage: React.FC = () => {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
    const [visibleItems, setVisibleItems] = useState(9);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const [galleryRows, portfolioRows] = await Promise.all([
                    websiteContentService.getAllGalleryItems(),
                    websiteContentService.getAllPortfolios(),
                ]);

                const galleryItems = (galleryRows || []).map((item: LandingGalleryItem) => ({
                    id: item.id,
                    title: item.title,
                    category: item.category || 'lainnya',
                    image: item.image_path,
                    description: item.description || 'Dokumentasi karya dari tim kami.',
                    source: 'gallery' as const,
                    sort_order: item.sort_order || 0,
                }));

                const portfolioItems = (portfolioRows || []).map((item: LandingPortfolioItem) => ({
                    id: 100000 + item.id,
                    title: item.title,
                    category: item.category || 'portfolio',
                    image: item.image_url,
                    description: item.description || 'Portofolio event dari tim kami.',
                    source: 'portfolio' as const,
                    sort_order: 999,
                }));

                const merged = [...galleryItems, ...portfolioItems].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
                setItems(merged);
            } catch (error) {
                console.error('Failed to fetch gallery content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    useEffect(() => {
        setVisibleItems(9);
    }, [selectedCategory]);

    const categories = useMemo(() => {
        const uniqueCategories = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));
        return [
            { id: 'all', name: 'Semua' },
            ...uniqueCategories.map((category) => ({ id: category, name: category })),
        ];
    }, [items]);

    const filteredItems = useMemo(() => {
        if (selectedCategory === 'all') {
            return items;
        }

        return items.filter((item) => item.category === selectedCategory);
    }, [items, selectedCategory]);

    const visibleGalleryItems = useMemo(() => filteredItems.slice(0, visibleItems), [filteredItems, visibleItems]);

    return (
        <>
            <Head title="Gallery" />
            <PublicLayout active="gallery" wrapperClassName="min-h-screen bg-[#F6F1EA] text-[#2A2420]">
                <main className="w-full px-4 py-14 font-sans sm:px-8 2xl:px-16">
                    <section className="mb-8 rounded-[28px] border border-[#E7DCCB] bg-[#FFF9F1] p-8 shadow-[0_18px_45px_-35px_rgba(27,36,48,0.65)] sm:p-10">
                        <p className="text-xs font-semibold tracking-[0.28em] text-[#B08A56] uppercase">Gallery</p>
                        <h1 className="mt-3 font-serif text-4xl font-bold text-[#2A2420] sm:text-5xl">Portofolio Event Kami</h1>
                        <p className="mt-3 max-w-3xl text-[#5B4A3C]">
                            Koleksi visual ini menunjukkan kualitas styling, tata ruang, dan pengalaman event yang kami kerjakan untuk klien.
                        </p>
                    </section>

                    <section className="mb-8 flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                                    selectedCategory === category.id
                                        ? 'bg-gradient-to-r from-[#B08A56] to-[#7A5C44] text-white shadow-md'
                                        : 'bg-[#FFFBF6] text-[#5B4A3C] hover:bg-[#F2E7D8]'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </section>

                    {loading ? (
                        <section className="rounded-3xl border border-[#E7DCCB] bg-[#FFFBF6] p-8 text-center text-[#5B4A3C] shadow-[0_16px_35px_-30px_rgba(27,36,48,0.6)]">
                            Memuat gallery...
                        </section>
                    ) : (
                        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {visibleGalleryItems.map((item) => (
                                <article
                                    key={item.id}
                                    className="group cursor-pointer overflow-hidden rounded-3xl border border-[#E7DCCB] bg-[#FFFBF6] shadow-[0_14px_30px_-26px_rgba(27,36,48,0.6)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_-30px_rgba(27,36,48,0.7)]"
                                    onClick={() => setSelectedImage(item)}
                                >
                                    <div className="aspect-[4/3] overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-5">
                                        <p className="text-xs font-semibold tracking-widest text-[#B08A56] uppercase">
                                            {item.source === 'portfolio' ? 'Portfolio' : item.category}
                                        </p>
                                        <h2 className="mt-2 text-xl font-bold text-[#2A2420]">{item.title}</h2>
                                        <p className="mt-2 text-sm text-[#5B4A3C]">{item.description}</p>
                                    </div>
                                </article>
                            ))}
                            {filteredItems.length === 0 && (
                                <div className="col-span-full rounded-3xl border border-dashed border-[#E7DCCB] bg-[#FFFBF6] p-8 text-center text-[#5B4A3C]">
                                    Belum ada item pada kategori ini.
                                </div>
                            )}
                        </section>
                    )}

                    {!loading && filteredItems.length > visibleItems && (
                        <div className="mt-8 flex justify-center">
                            <button
                                type="button"
                                onClick={() => setVisibleItems((prev) => prev + 9)}
                                className="rounded-full border border-[#D7C3A8] bg-[#FFFBF6] px-6 py-3 text-sm font-semibold text-[#7A5C44] shadow-[0_12px_25px_-20px_rgba(27,36,48,0.5)] transition hover:bg-[#F2E7D8]"
                            >
                                Tampilkan lebih banyak
                            </button>
                        </div>
                    )}

                    <section className="mt-10 rounded-3xl bg-[#1B2430] p-8 text-[#F6F1EA] sm:p-10">
                        <h3 className="font-serif text-3xl font-bold">Ingin Acara Dengan Vibe Serupa?</h3>
                        <p className="mt-2 text-[#C8B8A3]">Lanjutkan ke halaman paket atau langsung konsultasi agar tim kami siapkan proposal visual Anda.</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href="/packages" className="rounded-full bg-gradient-to-r from-[#B08A56] to-[#7A5C44] px-5 py-3 text-sm font-semibold text-white">
                                Lihat Paket
                            </Link>
                            <Link href="/my-orders" className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white">
                                Cek Status Order
                            </Link>
                        </div>
                    </section>
                </main>

                {selectedImage && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#1B2430]/80 p-4" onClick={() => setSelectedImage(null)}>
                        <div className="w-full max-w-4xl rounded-3xl border border-[#E7DCCB] bg-[#FFFBF6] p-4 shadow-2xl sm:p-6" onClick={(e) => e.stopPropagation()}>
                            <img src={selectedImage.image} alt={selectedImage.title} className="max-h-[70vh] w-full rounded-2xl object-cover" />
                            <h3 className="mt-4 font-serif text-2xl font-bold text-[#2A2420]">{selectedImage.title}</h3>
                            <p className="mt-2 text-[#5B4A3C]">{selectedImage.description}</p>
                        </div>
                    </div>
                )}
            </PublicLayout>
        </>
    );
};

export default GalleryPage;
