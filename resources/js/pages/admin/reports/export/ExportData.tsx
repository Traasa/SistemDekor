import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { FileText, Download, Calendar, TrendingUp, Package, Users } from 'lucide-react';
import axios from 'axios';

export default function ExportDataPage() {
    const [exportType, setExportType] = useState('sales');
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(1);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    const handleExport = async (type: string) => {
        try {
            setLoading(true);
            const response = await axios.post('/api/reports-export-csv', {
                type,
                start_date: startDate,
                end_date: endDate,
            }, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            alert('Data berhasil di-export!');
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Gagal export data');
        } finally {
            setLoading(false);
        }
    };

    const exportOptions = [
        {
            type: 'sales',
            title: 'Laporan Penjualan',
            description: 'Export data order, revenue, dan pembayaran',
            icon: TrendingUp,
            color: 'blue',
        },
        {
            type: 'inventory',
            title: 'Laporan Inventaris',
            description: 'Export data stok, transaksi inventaris',
            icon: Package,
            color: 'green',
        },
        {
            type: 'performance',
            title: 'Laporan Kinerja',
            description: 'Export data performa karyawan dan vendor',
            icon: Users,
            color: 'purple',
        },
    ];

    return (
        <AdminLayout>
            <Head title="Export Data" />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
                    <p className="text-gray-600 mt-1">Download laporan dalam format CSV</p>
                </div>

                {/* Date Range Selection */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Pilih Periode Data
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tanggal Mulai
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tanggal Akhir
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Export Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {exportOptions.map((option) => {
                        const IconComponent = option.icon;
                        const colorClass = {
                            blue: 'bg-blue-100 text-blue-600',
                            green: 'bg-green-100 text-green-600',
                            purple: 'bg-purple-100 text-purple-600',
                        }[option.color];

                        return (
                            <div
                                key={option.type}
                                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer border-2 border-transparent hover:border-blue-500"
                            >
                                <div className={`w-16 h-16 ${colorClass} rounded-lg flex items-center justify-center mb-4`}>
                                    <IconComponent className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{option.title}</h3>
                                <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                                <button
                                    onClick={() => handleExport(option.type)}
                                    disabled={loading}
                                    className={`w-full px-4 py-2 bg-${option.color}-600 text-white rounded-lg hover:bg-${option.color}-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <Download className="w-5 h-5" />
                                    {loading ? 'Exporting...' : 'Export CSV'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Export Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                        <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-blue-900 mb-2">Informasi Export</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Data akan di-export dalam format CSV yang dapat dibuka dengan Excel atau Google Sheets</li>
                                <li>• Pastikan range tanggal sudah sesuai sebelum melakukan export</li>
                                <li>• File akan otomatis ter-download setelah proses export selesai</li>
                                <li>• Untuk laporan inventaris, data mencakup seluruh periode (tidak terbatas tanggal)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Quick Export Buttons */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Export - Periode Populer</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => {
                                const today = new Date();
                                setStartDate(today.toISOString().split('T')[0]);
                                setEndDate(today.toISOString().split('T')[0]);
                            }}
                            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 transition"
                        >
                            Hari Ini
                        </button>
                        <button
                            onClick={() => {
                                const today = new Date();
                                const weekAgo = new Date(today);
                                weekAgo.setDate(weekAgo.getDate() - 7);
                                setStartDate(weekAgo.toISOString().split('T')[0]);
                                setEndDate(today.toISOString().split('T')[0]);
                            }}
                            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 transition"
                        >
                            7 Hari Terakhir
                        </button>
                        <button
                            onClick={() => {
                                const today = new Date();
                                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                setStartDate(firstDay.toISOString().split('T')[0]);
                                setEndDate(today.toISOString().split('T')[0]);
                            }}
                            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 transition"
                        >
                            Bulan Ini
                        </button>
                        <button
                            onClick={() => {
                                const today = new Date();
                                const monthAgo = new Date(today);
                                monthAgo.setMonth(monthAgo.getMonth() - 1);
                                setStartDate(monthAgo.toISOString().split('T')[0]);
                                setEndDate(today.toISOString().split('T')[0]);
                            }}
                            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 transition"
                        >
                            30 Hari Terakhir
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
