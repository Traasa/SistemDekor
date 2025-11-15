import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';

interface Package {
    id: number;
    name: string;
    slug: string;
    description: string;
    base_price: number;
    image_url: string;
}

interface Portfolio {
    id: number;
    title: string;
    description: string;
    image_url: string;
    category: string;
}

interface HomeProps {
    portfolios: Portfolio[];
    packages: Package[];
}

export default function Home({ portfolios, packages }: HomeProps) {
    return (
        <>
            <Head title="Home - Wedding Organizer" />

            {/* Hero Section */}
            <section className="relative flex h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-7xl">Wujudkan Pernikahan Impian Anda</h1>
                    <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 md:text-2xl">
                        Wedding Organizer profesional dengan pengalaman lebih dari 10 tahun. Kami siap membantu mewujudkan pernikahan impian Anda
                        dengan sempurna.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/services">
                            <Button size="lg" className="text-lg">
                                Lihat Paket Kami
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button size="lg" variant="outline" className="text-lg">
                                Konsultasi Gratis
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Packages Section */}
            <section className="bg-white py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-gray-900">Paket Wedding Kami</h2>
                        <p className="mx-auto max-w-2xl text-xl text-gray-600">Pilih paket yang sesuai dengan kebutuhan dan budget Anda</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {packages.map((pkg) => (
                            <Card key={pkg.id} className="transition-shadow hover:shadow-lg">
                                <CardHeader>
                                    <div className="mb-4 aspect-video overflow-hidden rounded-md bg-gray-200">
                                        {pkg.image_url ? (
                                            <img src={pkg.image_url} alt={pkg.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-400">No Image</div>
                                        )}
                                    </div>
                                    <CardTitle>{pkg.name}</CardTitle>
                                    <CardDescription className="line-clamp-2">{pkg.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-4 text-2xl font-bold text-pink-600">
                                        {pkg.base_price > 0 ? `Rp ${pkg.base_price.toLocaleString('id-ID')}` : 'Custom Price'}
                                    </p>
                                    <Link href={`/packages/${pkg.slug}`}>
                                        <Button className="w-full">Lihat Detail</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/services">
                            <Button size="lg" variant="outline">
                                Lihat Semua Paket
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Portfolio Section */}
            <section className="bg-gray-50 py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-gray-900">Portofolio Kami</h2>
                        <p className="mx-auto max-w-2xl text-xl text-gray-600">
                            Lihat hasil karya kami dalam mengorganisir berbagai acara pernikahan
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {portfolios.map((portfolio) => (
                            <Card key={portfolio.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                                <div className="aspect-video overflow-hidden bg-gray-200">
                                    {portfolio.image_url ? (
                                        <img
                                            src={portfolio.image_url}
                                            alt={portfolio.title}
                                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-gray-400">No Image</div>
                                    )}
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-lg">{portfolio.title}</CardTitle>
                                    <CardDescription className="line-clamp-2">{portfolio.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/gallery">
                            <Button size="lg" variant="outline">
                                Lihat Semua Galeri
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-pink-500 to-purple-600 py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="mb-6 text-4xl font-bold">Siap Memulai Perjalanan Menuju Pernikahan Impian?</h2>
                    <p className="mx-auto mb-8 max-w-2xl text-xl">Hubungi kami sekarang untuk konsultasi gratis dan dapatkan penawaran terbaik</p>
                    <Link href="/contact">
                        <Button size="lg" variant="secondary" className="text-lg">
                            Hubungi Kami Sekarang
                        </Button>
                    </Link>
                </div>
            </section>
        </>
    );
}
