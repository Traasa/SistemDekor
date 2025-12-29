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
    description: string;
    logo: string | null;
    favicon: string | null;
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
        description: '',
        logo: null,
        favicon: null,
        social_media: {
            facebook: '',
            instagram: '',
            twitter: '',
            whatsapp: '',
        },
    });
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/settings-general');
            setSettings(response.data);
            if (response.data.logo) {
                setLogoPreview(`/storage/${response.data.logo}`);
            }
            if (response.data.favicon) {
                setFaviconPreview(`/storage/${response.data.favicon}`);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFaviconPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
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
            formData.append('description', settings.description);
            formData.append('social_media', JSON.stringify(settings.social_media));

            const logoInput = document.getElementById('logo') as HTMLInputElement;
            if (logoInput?.files?.[0]) {
                formData.append('logo', logoInput.files[0]);
            }

            const faviconInput = document.getElementById('favicon') as HTMLInputElement;
            if (faviconInput?.files?.[0]) {
                formData.append('favicon', faviconInput.files[0]);
            }

            const response = await axios.post('/api/settings-general', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            alert('Pengaturan berhasil disimpan!');
            fetchSettings();
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            alert('Gagal menyimpan pengaturan');
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
