import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Mail, Save, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

interface EmailTemplate {
    subject: string;
    content: string;
    enabled: boolean;
}

interface EmailTemplates {
    order_confirmation: EmailTemplate;
    payment_confirmation: EmailTemplate;
    event_reminder: EmailTemplate;
    low_stock_alert: EmailTemplate;
    welcome_email: EmailTemplate;
}

export default function EmailTemplatesPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [templates, setTemplates] = useState<EmailTemplates | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('order_confirmation');
    const [editData, setEditData] = useState<EmailTemplate>({
        subject: '',
        content: '',
        enabled: true,
    });

    const templateLabels: Record<string, string> = {
        order_confirmation: 'Konfirmasi Order',
        payment_confirmation: 'Konfirmasi Pembayaran',
        event_reminder: 'Reminder Event',
        low_stock_alert: 'Alert Stok Rendah',
        welcome_email: 'Email Selamat Datang',
    };

    const availableVariables: Record<string, string[]> = {
        order_confirmation: ['{client_name}', '{order_number}', '{package_name}', '{total_price}', '{company_name}'],
        payment_confirmation: ['{client_name}', '{order_number}', '{amount}', '{date}', '{company_name}'],
        event_reminder: ['{client_name}', '{event_name}', '{event_date}', '{venue}', '{company_name}'],
        low_stock_alert: ['{item_name}', '{current_stock}', '{minimum_stock}'],
        welcome_email: ['{client_name}', '{company_name}'],
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    useEffect(() => {
        if (templates && selectedTemplate) {
            setEditData(templates[selectedTemplate as keyof EmailTemplates]);
        }
    }, [selectedTemplate, templates]);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/settings-email-templates');
            setTemplates(response.data);
            if (response.data.order_confirmation) {
                setEditData(response.data.order_confirmation);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await axios.post('/api/settings-email-templates', {
                type: selectedTemplate,
                ...editData,
            });
            alert('Template berhasil disimpan!');
            fetchTemplates();
        } catch (error) {
            alert('Gagal menyimpan template');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <Head title="Email Templates" />
                <div className="p-6">
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Memuat template...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Head title="Email Templates" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
                    <p className="text-gray-600 mt-1">Kelola template email otomatis</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Template List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-4">
                            <h3 className="font-bold text-gray-900 mb-3">Pilih Template</h3>
                            <div className="space-y-2">
                                {Object.keys(templateLabels).map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedTemplate(key)}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition ${
                                            selectedTemplate === key
                                                ? 'bg-blue-100 text-blue-700 font-medium'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {templateLabels[key]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Template Editor */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                        {templateLabels[selectedTemplate]}
                                    </h2>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editData.enabled}
                                            onChange={(e) => setEditData({ ...editData, enabled: e.target.checked })}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            {editData.enabled ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </label>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Subject Email *
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.subject}
                                            onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Isi Email *
                                        </label>
                                        <textarea
                                            value={editData.content}
                                            onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                                            rows={12}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-blue-900 mb-2">Variabel yang Tersedia:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {availableVariables[selectedTemplate]?.map((variable) => (
                                                <code key={variable} className="px-2 py-1 bg-white rounded text-sm text-blue-700">
                                                    {variable}
                                                </code>
                                            ))}
                                        </div>
                                        <p className="text-xs text-blue-700 mt-2">
                                            Gunakan variabel di atas dalam subject atau content untuk menampilkan data dinamis
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Preview</h3>
                                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                    <div className="mb-3">
                                        <span className="text-sm font-medium text-gray-700">Subject: </span>
                                        <span className="text-sm text-gray-900">{editData.subject}</span>
                                    </div>
                                    <hr className="mb-3" />
                                    <div className="text-sm text-gray-900 whitespace-pre-wrap">
                                        {editData.content}
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
                                    {saving ? 'Menyimpan...' : 'Simpan Template'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
