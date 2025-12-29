import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Database, Download, Upload, Trash2, RefreshCw, AlertTriangle, HardDrive, Server } from 'lucide-react';
import axios from 'axios';

interface Backup {
    filename: string;
    size: number;
    date: string;
    path: string;
}

interface SystemInfo {
    php_version: string;
    laravel_version: string;
    database: {
        driver: string;
        name: string;
    };
    server: {
        software: string;
        os: string;
    };
    storage: {
        total: number;
        free: number;
    };
    cache_driver: string;
    session_driver: string;
}

export default function BackupRestorePage() {
    const [loading, setLoading] = useState(true);
    const [backups, setBackups] = useState<Backup[]>([]);
    const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
    const [creating, setCreating] = useState(false);
    const [restoring, setRestoring] = useState(false);

    useEffect(() => {
        fetchBackups();
        fetchSystemInfo();
    }, []);

    const fetchBackups = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/settings-backups');
            setBackups(response.data);
        } catch (error) {
            console.error('Error fetching backups:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSystemInfo = async () => {
        try {
            const response = await axios.get('/api/settings-system-info');
            setSystemInfo(response.data);
        } catch (error) {
            console.error('Error fetching system info:', error);
        }
    };

    const createBackup = async () => {
        if (!confirm('Apakah Anda yakin ingin membuat backup database?')) return;

        setCreating(true);
        try {
            const response = await axios.post('/api/settings-backup-create');
            alert(`Backup berhasil dibuat: ${response.data.filename}`);
            fetchBackups();
        } catch (error) {
            alert('Gagal membuat backup');
        } finally {
            setCreating(false);
        }
    };

    const downloadBackup = async (filename: string) => {
        try {
            const response = await axios.get(`/api/settings-backup-download/${filename}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Gagal download backup');
        }
    };

    const deleteBackup = async (filename: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus backup: ${filename}?`)) return;

        try {
            await axios.delete(`/api/settings-backup-delete/${filename}`);
            alert('Backup berhasil dihapus');
            fetchBackups();
        } catch (error) {
            alert('Gagal menghapus backup');
        }
    };

    const restoreBackup = async (filename: string) => {
        if (!confirm(`⚠️ PERINGATAN: Restore akan mengganti semua data saat ini dengan backup ${filename}. Proses ini tidak bisa dibatalkan! Apakah Anda yakin?`)) return;

        setRestoring(true);
        try {
            await axios.post(`/api/settings-backup-restore/${filename}`);
            alert('Database berhasil direstore! Halaman akan dimuat ulang.');
            window.location.reload();
        } catch (error) {
            alert('Gagal restore database');
        } finally {
            setRestoring(false);
        }
    };

    const clearCache = async () => {
        if (!confirm('Bersihkan semua cache aplikasi?')) return;

        try {
            await axios.post('/api/settings-clear-cache');
            alert('Cache berhasil dibersihkan!');
        } catch (error) {
            alert('Gagal membersihkan cache');
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <AdminLayout>
            <Head title="Backup & Restore" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Backup & Restore</h1>
                    <p className="text-gray-600 mt-1">Kelola backup database dan system</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Backup Actions */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Database className="w-5 h-5 text-blue-600" />
                                Backup Database
                            </h2>
                            <button
                                onClick={createBackup}
                                disabled={creating}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {creating ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Membuat Backup...
                                    </>
                                ) : (
                                    <>
                                        <Database className="w-5 h-5" />
                                        Buat Backup Baru
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-gray-600 mt-2">
                                Backup akan menyimpan semua tabel database saat ini
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Server className="w-5 h-5 text-purple-600" />
                                System Maintenance
                            </h2>
                            <button
                                onClick={clearCache}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Clear Cache
                            </button>
                            <p className="text-xs text-gray-600 mt-2">
                                Membersihkan cache, config, route, dan view
                            </p>
                        </div>

                        {/* System Info */}
                        {systemInfo && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <HardDrive className="w-5 h-5 text-green-600" />
                                    System Info
                                </h2>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">PHP Version:</span>
                                        <span className="font-medium text-gray-900">{systemInfo.php_version}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Laravel:</span>
                                        <span className="font-medium text-gray-900">{systemInfo.laravel_version}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Database:</span>
                                        <span className="font-medium text-gray-900">{systemInfo.database.driver}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Cache:</span>
                                        <span className="font-medium text-gray-900">{systemInfo.cache_driver}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Storage Free:</span>
                                        <span className="font-medium text-gray-900">{formatBytes(systemInfo.storage.free)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Backup List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Database className="w-5 h-5 text-blue-600" />
                                    Daftar Backup
                                </h2>
                            </div>

                            {loading ? (
                                <div className="p-12 text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Memuat backup...</p>
                                </div>
                            ) : backups.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p>Belum ada backup</p>
                                    <p className="text-sm mt-1">Buat backup pertama Anda</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {backups.map((backup, index) => (
                                        <div key={index} className="p-4 hover:bg-gray-50 transition">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900">{backup.filename}</h3>
                                                    <div className="flex gap-4 mt-1 text-sm text-gray-600">
                                                        <span>{new Date(backup.date).toLocaleString('id-ID')}</span>
                                                        <span>{formatBytes(backup.size)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => downloadBackup(backup.filename)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Download"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => restoreBackup(backup.filename)}
                                                        disabled={restoring}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                                                        title="Restore"
                                                    >
                                                        <Upload className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteBackup(backup.filename)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Warning */}
                        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-medium mb-1">Peringatan Penting!</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Proses restore akan mengganti seluruh data database saat ini</li>
                                        <li>Pastikan membuat backup terbaru sebelum melakukan restore</li>
                                        <li>Proses restore tidak dapat dibatalkan</li>
                                        <li>Simpan file backup di lokasi aman sebagai cadangan</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
