import { AdminLayout } from '../../../layouts/AdminLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Mail, Phone, Globe, Save, MapPin } from 'lucide-react';

interface CompanyProfile {
    id: number;
    company_name: string;
    about: string;
    services: string[];
    phone: string | null;
    email: string | null;
    address: string | null;
    website: string | null;
    social_media: {
        instagram?: string;
        facebook?: string;
        whatsapp?: string;
    } | null;
}

export default function CompanyProfilePage() {
    const [profile, setProfile] = useState<CompanyProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        company_name: '',
        about: '',
        services: '',
        phone: '',
        email: '',
        address: '',
        website: '',
        instagram: '',
        facebook: '',
        whatsapp: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get('/api/company-profile');
            const data = response.data.data;
            setProfile(data);
            setFormData({
                company_name: data.company_name || '',
                about: data.about || '',
                services: data.services?.join('\n') || '',
                phone: data.phone || '',
                email: data.email || '',
                address: data.address || '',
                website: data.website || '',
                instagram: data.social_media?.instagram || '',
                facebook: data.social_media?.facebook || '',
                whatsapp: data.social_media?.whatsapp || '',
            });
        } catch (error) {
            console.error('Failed to fetch company profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const submitData = {
                company_name: formData.company_name,
                about: formData.about,
                services: formData.services.split('\n').filter(s => s.trim()),
                phone: formData.phone || null,
                email: formData.email || null,
                address: formData.address || null,
                website: formData.website || null,
                social_media: {
                    instagram: formData.instagram || undefined,
                    facebook: formData.facebook || undefined,
                    whatsapp: formData.whatsapp || undefined,
                },
            };

            if (profile) {
                await axios.put(`/api/company-profiles/${profile.id}`, submitData);
            } else {
                await axios.post('/api/company-profiles', submitData);
            }

            alert('Profil perusahaan berhasil disimpan!');
            fetchProfile();
        } catch (error) {
            console.error('Failed to save profile:', error);
            alert('Gagal menyimpan profil perusahaan');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Profil Perusahaan</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Kelola informasi perusahaan yang ditampilkan di website
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Building2 className="inline h-4 w-4 mr-1" />
                                    Nama Perusahaan *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.company_name}
                                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="PT Wedding Organizer Indonesia"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tentang Perusahaan *
                                </label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.about}
                                    onChange={(e) => setFormData({...formData, about: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ceritakan tentang perusahaan Anda..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Layanan (satu per baris) *
                                </label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.services}
                                    onChange={(e) => setFormData({...formData, services: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Dekorasi Pernikahan&#10;Catering Premium&#10;Photography & Videography"
                                />
                                <p className="mt-1 text-sm text-gray-500">Tulis setiap layanan di baris baru</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Kontak</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Phone className="inline h-4 w-4 mr-1" />
                                    Nomor Telepon
                                </label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="+62 812 3456 7890"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Mail className="inline h-4 w-4 mr-1" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="info@company.com"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="inline h-4 w-4 mr-1" />
                                    Alamat
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Jl. Example No. 123, Jakarta"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Globe className="inline h-4 w-4 mr-1" />
                                    Website
                                </label>
                                <input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://www.company.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Media Sosial</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Instagram
                                </label>
                                <input
                                    type="text"
                                    value={formData.instagram}
                                    onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="@username atau https://instagram.com/username"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Facebook
                                </label>
                                <input
                                    type="text"
                                    value={formData.facebook}
                                    onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://facebook.com/pagename"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    WhatsApp
                                </label>
                                <input
                                    type="text"
                                    value={formData.whatsapp}
                                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="+62 812 3456 7890"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                        >
                            <Save className="h-5 w-5" />
                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
