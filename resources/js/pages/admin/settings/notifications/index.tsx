import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Bell, Mail, ShoppingBag, Calendar, Package, Save } from 'lucide-react';
import axios from 'axios';

interface NotificationSettings {
    email_notifications: boolean;
    order_notifications: boolean;
    payment_notifications: boolean;
    event_notifications: boolean;
    low_stock_notifications: boolean;
    admin_email: string;
    notification_emails: string[];
}

export default function NotificationSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<NotificationSettings>({
        email_notifications: true,
        order_notifications: true,
        payment_notifications: true,
        event_notifications: true,
        low_stock_notifications: true,
        admin_email: '',
        notification_emails: [],
    });
    const [newEmail, setNewEmail] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/settings-notifications');
            setSettings(response.data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await axios.post('/api/settings-notifications', settings);
            alert('Pengaturan notifikasi berhasil disimpan!');
        } catch (error) {
            alert('Gagal menyimpan pengaturan');
        } finally {
            setSaving(false);
        }
    };

    const addEmail = () => {
        if (newEmail && !settings.notification_emails.includes(newEmail)) {
            setSettings({
                ...settings,
                notification_emails: [...settings.notification_emails, newEmail],
            });
            setNewEmail('');
        }
    };

    const removeEmail = (email: string) => {
        setSettings({
            ...settings,
            notification_emails: settings.notification_emails.filter(e => e !== email),
        });
    };

    if (loading) {
        return (
            <AdminLayout>
                <Head title="Pengaturan Notifikasi" />
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
            <Head title="Pengaturan Notifikasi" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Pengaturan Notifikasi</h1>
                    <p className="text-gray-600 mt-1">Kelola notifikasi email dan alert sistem</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Settings */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-blue-600" />
                            Pengaturan Umum
                        </h2>
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.email_notifications}
                                    onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div>
                                    <p className="font-medium text-gray-900">Aktifkan Email Notifikasi</p>
                                    <p className="text-sm text-gray-600">Kirim notifikasi melalui email</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Notification Types */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Jenis Notifikasi</h2>
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.order_notifications}
                                    onChange={(e) => setSettings({ ...settings, order_notifications: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <ShoppingBag className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="font-medium text-gray-900">Notifikasi Order Baru</p>
                                    <p className="text-sm text-gray-600">Terima notifikasi saat ada order baru</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.payment_notifications}
                                    onChange={(e) => setSettings({ ...settings, payment_notifications: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <Mail className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="font-medium text-gray-900">Notifikasi Pembayaran</p>
                                    <p className="text-sm text-gray-600">Terima notifikasi untuk pembayaran baru</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.event_notifications}
                                    onChange={(e) => setSettings({ ...settings, event_notifications: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <Calendar className="w-5 h-5 text-purple-600" />
                                <div>
                                    <p className="font-medium text-gray-900">Notifikasi Event</p>
                                    <p className="text-sm text-gray-600">Reminder untuk event yang akan datang</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.low_stock_notifications}
                                    onChange={(e) => setSettings({ ...settings, low_stock_notifications: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <Package className="w-5 h-5 text-orange-600" />
                                <div>
                                    <p className="font-medium text-gray-900">Notifikasi Stok Rendah</p>
                                    <p className="text-sm text-gray-600">Alert saat stok item mencapai batas minimum</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Email Recipients */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-blue-600" />
                            Penerima Email
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Admin Utama *
                                </label>
                                <input
                                    type="email"
                                    value={settings.admin_email}
                                    onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Tambahan
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="Tambah email notifikasi..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={addEmail}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Tambah
                                    </button>
                                </div>
                                <div className="mt-3 space-y-2">
                                    {settings.notification_emails.map((email, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm text-gray-900">{email}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeEmail(email)}
                                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    ))}
                                </div>
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
