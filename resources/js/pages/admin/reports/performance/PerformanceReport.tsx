import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Users, Award, Calendar, TrendingUp, Download, RefreshCw, Star } from 'lucide-react';
import axios from 'axios';

export default function PerformanceReportPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(1);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/reports-performance-data', {
                params: { start_date: startDate, end_date: endDate },
            });
            setData(response.data);
        } catch (error) {
            console.error('Error fetching performance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.post('/api/reports-export-csv', {
                type: 'performance',
                start_date: startDate,
                end_date: endDate,
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `performance_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Gagal export data');
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <Head title="Laporan Kinerja" />
                <div className="p-6">
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Memuat data...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Head title="Laporan Kinerja" />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Laporan Kinerja</h1>
                        <p className="text-gray-600 mt-1">Evaluasi performa karyawan & vendor</p>
                    </div>
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <Download className="w-5 h-5" />Export CSV
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div className="flex items-end">
                            <button onClick={fetchData} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                                <RefreshCw className="w-5 h-5" />Terapkan
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Event</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{data?.summary.total_events || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Event Selesai</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{data?.summary.completed_events || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Award className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Event Mendatang</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{data?.summary.upcoming_events || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Completion Rate</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{data?.summary.completion_rate || 0}%</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Employee Performance */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-bold text-gray-900">Performa Karyawan</h3>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posisi</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Assignment</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Completed</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rate</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data?.employee_performance.map((emp: any) => (
                                <tr key={emp.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.position}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center"><span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">{emp.total_assignments}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center"><span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">{emp.completed_assignments}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">{emp.completion_rate}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Vendor Performance */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-bold text-gray-900">Performa Vendor</h3>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rating</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Review</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Level</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data?.vendor_performance.map((vendor: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vendor.vendor_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span className="font-bold text-gray-900">{vendor.average_rating}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">{vendor.total_ratings}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            vendor.rating_level === 'platinum' ? 'bg-gray-800 text-white' :
                                            vendor.rating_level === 'gold' ? 'bg-yellow-500 text-white' :
                                            vendor.rating_level === 'silver' ? 'bg-gray-400 text-white' :
                                            'bg-gray-300 text-gray-800'
                                        }`}>
                                            {vendor.rating_level.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
