import { Head, Link } from '@inertiajs/react';
import React, { useState } from 'react';

interface GalleryItem {
    id: number;
    title: string;
    category: string;
    image: string;
    description: string;
}

const GalleryPage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    const categories = [
        { id: 'all', name: 'Semua' },
        { id: 'wedding', name: 'Wedding' },
        { id: 'engagement', name: 'Engagement' },
        { id: 'decoration', name: 'Dekorasi' },
        { id: 'venue', name: 'Venue' },
    ];

    // Sample gallery data - replace with real data from API
    const galleryItems: GalleryItem[] = [
        {
            id: 1,
            title: 'Elegant Wedding Ceremony',
            category: 'wedding',
            image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
            description: 'Pernikahan elegant dengan tema classic white dan gold',
        },
        {
            id: 2,
            title: 'Garden Wedding Setup',
            category: 'wedding',
            image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
            description: 'Outdoor garden wedding dengan dekorasi natural',
        },
        {
            id: 3,
            title: 'Romantic Engagement',
            category: 'engagement',
            image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800',
            description: 'Moment engagement romantis dengan setup intimate',
        },
        {
            id: 4,
            title: 'Floral Decoration',
            category: 'decoration',
            image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
            description: 'Dekorasi floral mewah dengan bunga segar pilihan',
        },
        {
            id: 5,
            title: 'Luxury Venue',
            category: 'venue',
            image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800',
            description: 'Venue luxury dengan kapasitas besar dan modern',
        },
        {
            id: 6,
            title: 'Modern Wedding',
            category: 'wedding',
            image: 'https://images.unsplash.com/photo-1522413452208-996ff3f3e740?w=800',
            description: 'Konsep modern minimalis dengan sentuhan elegant',
        },
        {
            id: 7,
            title: 'Rustic Decoration',
            category: 'decoration',
            image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
            description: 'Dekorasi rustic dengan material kayu dan vintage',
        },
        {
            id: 8,
            title: 'Beach Wedding',
            category: 'wedding',
            image: 'https://images.unsplash.com/photo-1522413452208-996ff3f3e740?w=800',
            description: 'Beach wedding dengan sunset view yang memukau',
        },
        {
            id: 9,
            title: 'Ballroom Setup',
            category: 'venue',
            image: 'https://images.unsplash.com/photo-1519167758481-83f29da8c93f?w=800',
            description: 'Ballroom megah dengan chandelier mewah',
        },
    ];

    const filteredItems = selectedCategory === 'all' ? galleryItems : galleryItems.filter((item) => item.category === selectedCategory);

    return (
        <>
            <Head title="Gallery Portfolio - SistemDekor" />

            <div className="relative min-h-screen bg-black text-white">
                {/* Video Background */}
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <div className={`absolute inset-0 bg-black transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-60' : 'opacity-80'}`} />
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        onLoadedData={() => setIsVideoLoaded(true)}
                        className="h-full w-full object-cover opacity-40"
                    >
                        <source src="https://cdn.coverr.co/videos/coverr-wedding-ceremony-4069/1080p.mp4" type="video/mp4" />
                    </video>
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                    {/* Navigation Bar */}
                    <nav className="fixed top-0 right-0 left-0 z-50 bg-black/30 backdrop-blur-md">
                        <div className="container mx-auto px-6 py-4">
                            <div className="flex items-center justify-between">
                                <Link href="/" className="group flex items-center space-x-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-pink-500">
                                        <span className="text-xl font-bold text-white">S</span>
                                    </div>
                                    <span className="text-xl font-bold text-white transition-colors group-hover:text-yellow-400">SistemDekor</span>
                                </Link>

                                <div className="flex items-center space-x-6">
                                    <Link href="/" className="text-sm font-medium text-gray-300 transition-colors hover:text-white">
                                        Home
                                    </Link>
                                    <Link href="/packages" className="text-sm font-medium text-gray-300 transition-colors hover:text-white">
                                        Packages
                                    </Link>
                                    <Link href="/gallery" className="text-sm font-medium text-yellow-400">
                                        Gallery
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* Hero Section */}
                    <section className="px-6 pt-32 pb-12">
                        <div className="container mx-auto text-center">
                            <div className="animate-fade-in-up">
                                <h1 className="mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-6xl font-bold text-transparent md:text-7xl">
                                    Portfolio Gallery
                                </h1>
                                <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-300">
                                    Jelajahi koleksi karya terbaik kami dalam menciptakan momen pernikahan yang tak terlupakan
                                </p>
                                <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500" />
                            </div>
                        </div>
                    </section>

                    {/* Category Filter */}
                    <section className="px-6 pb-12">
                        <div className="container mx-auto">
                            <div className="flex flex-wrap justify-center gap-4">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`group relative overflow-hidden rounded-full px-8 py-3 font-semibold transition-all duration-300 ${
                                            selectedCategory === category.id
                                                ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-white shadow-lg shadow-pink-500/50'
                                                : 'border-2 border-white/30 text-white hover:border-yellow-400 hover:text-yellow-400'
                                        }`}
                                    >
                                        <span className="relative z-10">{category.name}</span>
                                        {selectedCategory !== category.id && (
                                            <div className="absolute inset-0 -z-0 bg-gradient-to-r from-yellow-400/20 to-pink-500/20 opacity-0 transition-opacity group-hover:opacity-100" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Gallery Grid */}
                    <section className="px-6 pb-20">
                        <div className="container mx-auto">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm"
                                        style={{
                                            animation: `fade-in-up 0.6s ease-out ${index * 0.1}s both`,
                                        }}
                                        onClick={() => setSelectedImage(item)}
                                    >
                                        {/* Image Container */}
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                            {/* Category Badge */}
                                            <div className="absolute top-4 right-4">
                                                <span className="rounded-full bg-white/20 px-4 py-1 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md">
                                                    {categories.find((c) => c.id === item.category)?.name}
                                                </span>
                                            </div>

                                            {/* Zoom Icon */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:opacity-100">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                                                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            <h3 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-yellow-400">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-gray-400">{item.description}</p>
                                        </div>

                                        {/* Shine Effect */}
                                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Call to Action */}
                    <section className="px-6 pb-20">
                        <div className="container mx-auto">
                            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-400/20 via-pink-500/20 to-purple-600/20 p-12 backdrop-blur-lg">
                                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-yellow-400/20 blur-3xl" />
                                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-pink-500/20 blur-3xl" />

                                <div className="relative text-center">
                                    <h2 className="mb-4 text-4xl font-bold text-white">Wujudkan Pernikahan Impian Anda</h2>
                                    <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300">
                                        Bergabunglah dengan ratusan pasangan yang telah mempercayai kami untuk menciptakan momen spesial mereka
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-4">
                                        <Link
                                            href="/packages"
                                            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 px-8 py-4 font-bold text-white shadow-xl shadow-pink-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/60"
                                        >
                                            <span className="relative z-10">Lihat Paket Wedding</span>
                                            <div className="absolute inset-0 -z-0 bg-gradient-to-r from-pink-500 to-purple-600 opacity-0 transition-opacity group-hover:opacity-100" />
                                        </Link>
                                        <a
                                            href="https://wa.me/6281234567890"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-green-400 hover:bg-green-400/20 hover:text-green-400"
                                        >
                                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                            </svg>
                                            Konsultasi via WhatsApp
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="border-t border-white/10 px-6 py-8">
                        <div className="container mx-auto text-center">
                            <p className="text-gray-400">&copy; 2025 SistemDekor. Made with ❤️ for your special day</p>
                        </div>
                    </footer>
                </div>

                {/* Lightbox Modal */}
                {selectedImage && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:rotate-90 hover:bg-white/20"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="animate-scale-in relative max-h-[90vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
                            <img src={selectedImage.image} alt={selectedImage.title} className="max-h-[80vh] w-auto rounded-2xl shadow-2xl" />
                            <div className="mt-6 rounded-2xl bg-white/10 p-6 backdrop-blur-md">
                                <h3 className="mb-2 text-2xl font-bold text-white">{selectedImage.title}</h3>
                                <p className="text-gray-300">{selectedImage.description}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Custom Animations */}
                <style>{`
                    @keyframes fade-in-up {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes scale-in {
                        from {
                            opacity: 0;
                            transform: scale(0.9);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }

                    .animate-fade-in-up {
                        animation: fade-in-up 1s ease-out;
                    }

                    .animate-scale-in {
                        animation: scale-in 0.3s ease-out;
                    }
                `}</style>
            </div>
        </>
    );
};

export default GalleryPage;
