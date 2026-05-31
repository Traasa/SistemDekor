import { AdminLayout } from '../../../layouts/AdminLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Globe, Mail, MapPin, Phone } from 'lucide-react';

interface CompanyProfileView {
    company_name: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    social_media?: {
        instagram?: string;
        facebook?: string;
        twitter?: string;
        whatsapp?: string;
    };
}

export default function CompanyProfilePage() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<CompanyProfileView | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('/api/settings-general');
                const data = response.data || {};
                setProfile({
                    company_name: data.company_name || '-',
                    description: data.description || data.about || '-',
                    email: data.email || '-',
                    phone: data.phone || '-',
                    address: data.address || '-',
                    website: data.website || '-',
                    social_media: data.social_media || {},
                });
            } catch (error) {
                console.error('Failed to fetch company profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    if (!profile) {
        return (
            <AdminLayout>
                <div className="p-6">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">
                        Data profil perusahaan belum tersedia.
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Profil Perusahaan</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Data utama dikelola di Pengaturan Umum untuk mencegah duplikasi.
                    </p>
                    <button
                        onClick={() => window.location.assign('/admin/settings/general')}
                        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        Kelola di Pengaturan Umum
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            Informasi Perusahaan
                        </h2>
                        <div className="space-y-2 text-sm text-gray-700">
                            <div><span className="font-semibold">Nama:</span> {profile.company_name}</div>
                            <div><span className="font-semibold">Deskripsi:</span> {profile.description}</div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Phone className="h-5 w-5 text-blue-600" />
                            Kontak
                        </h2>
                        <div className="space-y-2 text-sm text-gray-700">
                            <div><span className="font-semibold">Telepon:</span> {profile.phone}</div>
                            <div><span className="font-semibold">Email:</span> {profile.email}</div>
                            <div><span className="font-semibold">Alamat:</span> {profile.address}</div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-blue-600" />
                            Website & Sosial
                        </h2>
                        <div className="space-y-2 text-sm text-gray-700">
                            <div><span className="font-semibold">Website:</span> {profile.website}</div>
                            <div><span className="font-semibold">Instagram:</span> {profile.social_media?.instagram || '-'}</div>
                            <div><span className="font-semibold">Facebook:</span> {profile.social_media?.facebook || '-'}</div>
                            <div><span className="font-semibold">WhatsApp:</span> {profile.social_media?.whatsapp || '-'}</div>
                            <div><span className="font-semibold">Twitter:</span> {profile.social_media?.twitter || '-'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
