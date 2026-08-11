import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Building2, Mail, Phone, MapPin, Globe, Save, Upload, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

interface CompanyProfile {
    id?: number;
    company_name: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    description: string;
    logo: string | null;
    favicon: string | null;
    hero_image: string | null;
    hero_side_image: string | null;
    about_gallery_images: string[];
    portfolio_highlight_images: string[];
    social_media: {
        facebook: string;
        instagram: string;
        twitter: string;
        whatsapp: string;
    };
}

export default function GeneralSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<CompanyProfile>({
        company_name: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        description: '',
        logo: null,
        favicon: null,
        hero_image: null,
        hero_side_image: null,
        about_gallery_images: [],
        portfolio_highlight_images: [],
        social_media: {
            facebook: '',
            instagram: '',
            twitter: '',
            whatsapp: '',
        },
    });
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
    const [heroPreview, setHeroPreview] = useState<string | null>(null);
    const [heroSidePreview, setHeroSidePreview] = useState<string | null>(null);
    const [aboutGalleryPreviews, setAboutGalleryPreviews] = useState<string[]>([]);
    const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([]);
    const [errors, setErrors] = useState<any>({});

    const normalizeStringArray = (value: unknown): string[] => {
        if (Array.isArray(value)) {
            return value.map((item) => String(item)).filter(Boolean);
        }

        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed) return [];

            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed.map((item) => String(item)).filter(Boolean);
                }
            } catch {
                return [];
            }
        }

        return [];
    };

    const normalizeSettings = (data: Partial<CompanyProfile>): CompanyProfile => {
        const social = data.social_media || {
            facebook: '',
            instagram: '',
            twitter: '',
            whatsapp: '',
        };

        return {
            company_name: data.company_name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            website: data.website || '',
            description: data.description || '',
            logo: data.logo ?? null,
            favicon: data.favicon ?? null,
            hero_image: data.hero_image ?? null,
            hero_side_image: data.hero_side_image ?? null,
            about_gallery_images: normalizeStringArray(data.about_gallery_images),
            portfolio_highlight_images: normalizeStringArray(data.portfolio_highlight_images),
            social_media: {
                facebook: social.facebook || '',
                instagram: social.instagram || '',
                twitter: social.twitter || '',
                whatsapp: social.whatsapp || '',
            },
        };
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/settings-general');
            setSettings(normalizeSettings(response.data));
            if (response.data.logo) {
                setLogoPreview(`/storage/${response.data.logo}`);
            }
            if (response.data.favicon) {
                setFaviconPreview(`/storage/${response.data.favicon}`);
            }
            if (response.data.hero_image) {
                setHeroPreview(`/storage/${response.data.hero_image}`);
            }
            if (response.data.hero_side_image) {
                setHeroSidePreview(`/storage/${response.data.hero_side_image}`);
            }
            setAboutGalleryPreviews(
                normalizeStringArray(response.data.about_gallery_images).map((path) => `/storage/${path}`),
            );
            setPortfolioPreviews(
                normalizeStringArray(response.data.portfolio_highlight_images).map((path) => `/storage/${path}`),
            );
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFaviconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFaviconPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleHeroChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setHeroPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleHeroSideChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setHeroSidePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAboutGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            Promise.all(
                files.map(
                    (file) =>
                        new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result as string);
                            reader.readAsDataURL(file);
                        }),
                ),
            ).then((previews) => setAboutGalleryPreviews(previews));
        }
    };

    const handlePortfolioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            Promise.all(
                files.map(
                    (file) =>
                        new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result as string);
                            reader.readAsDataURL(file);
                        }),
                ),
            ).then((previews) => setPortfolioPreviews(previews));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            const formData = new FormData();
            formData.append('company_name', settings.company_name);
            formData.append('email', settings.email);
            formData.append('phone', settings.phone);
            formData.append('address', settings.address);
            formData.append('website', settings.website || '');
            formData.append('description', settings.description || '');
            const socialMedia = settings.social_media || { facebook: '', instagram: '', twitter: '', whatsapp: '' };
            formData.append('social_media[facebook]', socialMedia.facebook || '');
            formData.append('social_media[instagram]', socialMedia.instagram || '');
            formData.append('social_media[twitter]', socialMedia.twitter || '');
            formData.append('social_media[whatsapp]', socialMedia.whatsapp || '');

            const logoInput = document.getElementById('logo') as HTMLInputElement;
            if (logoInput?.files?.[0]) {
                formData.append('logo', logoInput.files[0]);
            }

            const faviconInput = document.getElementById('favicon') as HTMLInputElement;
            if (faviconInput?.files?.[0]) {
                formData.append('favicon', faviconInput.files[0]);
            }

            const heroInput = document.getElementById('hero_image') as HTMLInputElement;
            if (heroInput?.files?.[0]) {
                formData.append('hero_image', heroInput.files[0]);
            }

            const heroSideInput = document.getElementById('hero_side_image') as HTMLInputElement;
            if (heroSideInput?.files?.[0]) {
                formData.append('hero_side_image', heroSideInput.files[0]);
            }

            const aboutGalleryInput = document.getElementById('about_gallery_images') as HTMLInputElement;
            if (aboutGalleryInput?.files?.length) {
                Array.from(aboutGalleryInput.files).forEach((file) => {
                    formData.append('about_gallery_images[]', file);
                });
            }

            const portfolioInput = document.getElementById('portfolio_highlight_images') as HTMLInputElement;
            if (portfolioInput?.files?.length) {
                Array.from(portfolioInput.files).forEach((file) => {
                    formData.append('portfolio_highlight_images[]', file);
                });
            }

            const response = await axios.post('/api/settings-general', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            await window.showAlert('Pengaturan berhasil disimpan!');
            fetchSettings();
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            await window.showAlert('Gagal menyimpan pengaturan');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <Head title="Pengaturan Umum" />
                <div className="p-6">
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Memuat pengaturan...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Head title="Pengaturan Umum" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Pengaturan Umum</h1>
                    <p className="text-gray-600 mt-1">Kelola informasi perusahaan dan website</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Company Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            Informasi Perusahaan
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Perusahaan *
                                </label>
                                <input
                                    type="text"
                                    value={settings.company_name}
                                    onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors.company_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.company_name[0]}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={settings.email}
                                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Telepon
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={settings.phone}
                                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Alamat
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={settings.address}
                                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Website
                                </label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="url"
                                        value={settings.website}
                                        onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="https://www.example.com"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Deskripsi Perusahaan
                                </label>
                                <textarea
                                    value={settings.description}
                                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Branding */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-blue-600" />
                            Branding
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Logo (Max 2MB)
                                </label>
                                {logoPreview && (
                                    <div className="mb-3 p-4 bg-gray-50 rounded-lg">
                                        <img src={logoPreview} alt="Logo" className="h-20 object-contain mx-auto" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    id="logo"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.logo && (
                                    <p className="text-red-500 text-sm mt-1">{errors.logo[0]}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Favicon (Max 512KB)
                                </label>
                                {faviconPreview && (
                                    <div className="mb-3 p-4 bg-gray-50 rounded-lg">
                                        <img src={faviconPreview} alt="Favicon" className="h-12 object-contain mx-auto" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    id="favicon"
                                    accept="image/*"
                                    onChange={handleFaviconChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.favicon && (
                                    <p className="text-red-500 text-sm mt-1">{errors.favicon[0]}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Homepage Images */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-blue-600" />
                            Gambar Homepage
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hero Utama (Max 4MB)
                                </label>
                                {heroPreview && (
                                    <div className="mb-3 overflow-hidden rounded-lg border border-gray-200">
                                        <img src={heroPreview} alt="Hero" className="h-36 w-full object-cover" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    id="hero_image"
                                    accept="image/*"
                                    onChange={handleHeroChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.hero_image && (
                                    <p className="text-red-500 text-sm mt-1">{errors.hero_image[0]}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hero Side (Max 4MB)
                                </label>
                                {heroSidePreview && (
                                    <div className="mb-3 overflow-hidden rounded-lg border border-gray-200">
                                        <img src={heroSidePreview} alt="Hero side" className="h-36 w-full object-cover" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    id="hero_side_image"
                                    accept="image/*"
                                    onChange={handleHeroSideChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.hero_side_image && (
                                    <p className="text-red-500 text-sm mt-1">{errors.hero_side_image[0]}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gallery Kecil (2 Foto)
                                </label>
                                {aboutGalleryPreviews.length > 0 && (
                                    <div className="mb-3 grid grid-cols-2 gap-2">
                                        {aboutGalleryPreviews.slice(0, 2).map((src, idx) => (
                                            <img key={idx} src={src} alt={`Gallery ${idx + 1}`} className="h-24 w-full rounded-lg object-cover" />
                                        ))}
                                    </div>
                                )}
                                <input
                                    type="file"
                                    id="about_gallery_images"
                                    accept="image/*"
                                    multiple
                                    onChange={handleAboutGalleryChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.about_gallery_images && (
                                    <p className="text-red-500 text-sm mt-1">{errors.about_gallery_images[0]}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Portfolio Highlight (4 Foto)
                                </label>
                                {portfolioPreviews.length > 0 && (
                                    <div className="mb-3 grid grid-cols-2 gap-2">
                                        {portfolioPreviews.slice(0, 4).map((src, idx) => (
                                            <img key={idx} src={src} alt={`Portfolio ${idx + 1}`} className="h-24 w-full rounded-lg object-cover" />
                                        ))}
                                    </div>
                                )}
                                <input
                                    type="file"
                                    id="portfolio_highlight_images"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePortfolioChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.portfolio_highlight_images && (
                                    <p className="text-red-500 text-sm mt-1">{errors.portfolio_highlight_images[0]}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-blue-600" />
                            Social Media
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Facebook URL
                                </label>
                                <input
                                    type="url"
                                    value={settings.social_media.facebook}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        social_media: { ...settings.social_media, facebook: e.target.value }
                                    })}
                                    placeholder="https://facebook.com/..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Instagram URL
                                </label>
                                <input
                                    type="url"
                                    value={settings.social_media.instagram}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        social_media: { ...settings.social_media, instagram: e.target.value }
                                    })}
                                    placeholder="https://instagram.com/..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Twitter URL
                                </label>
                                <input
                                    type="url"
                                    value={settings.social_media.twitter}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        social_media: { ...settings.social_media, twitter: e.target.value }
                                    })}
                                    placeholder="https://twitter.com/..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    WhatsApp
                                </label>
                                <input
                                    type="text"
                                    value={settings.social_media.whatsapp}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        social_media: { ...settings.social_media, whatsapp: e.target.value }
                                    })}
                                    placeholder="+62..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
