import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/AdminLayout';
import {
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Calendar,
    Package,
    Download,
    Filter,
    RefreshCw,
} from 'lucide-react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface SalesData {
    summary: {
        total_orders: number;
        total_revenue: number;
        pending_orders: number;
        completed_orders: number;
        revenue_growth: number;
    };
    revenue_by_package: Array<{
        package_name: string;
        total_orders: number;
        total_revenue: number;
    }>;
    daily_revenue: Array<{
        date: string;
        revenue: number;
        orders: number;
    }>;
    payment_summary: {
        total_paid: number;
        pending_payments: number;
        dp_payments: number;
    };
    orders: any[];
}

export default function SalesReportPage() {
    const [data, setData] = useState<SalesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(1);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/reports-sales-data', {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    status: statusFilter,
                },
            });
            setData(response.data);
        } catch (error) {
            console.error('Error fetching sales data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.post('/api/reports-export-csv', {
                type: 'sales',
                start_date: startDate,
                end_date: endDate,
            }, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Gagal export data');
        }
    };

    // Chart Data
    const revenueChartData = {
        labels: data?.daily_revenue.map(d => new Date(d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })) || [],
        datasets: [
            {
                label: 'Revenue (Rp)',
                data: data?.daily_revenue.map(d => d.revenue) || [],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
            },
        ],
    };

    const packageChartData = {
        labels: data?.revenue_by_package.map(p => p.package_name) || [],
        datasets: [
            {
                label: 'Revenue',
                data: data?.revenue_by_package.map(p => p.total_revenue) || [],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                ],
            },
        ],
    };

    if (loading) {
        return (
            <AdminLayout>
                <Head title="Laporan Penjualan" />
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
            <Head title="Laporan Penjualan" />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Laporan Penjualan</h1>
                        <p className="text-gray-600 mt-1">Analisis penjualan dan revenue</p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                        <Download className="w-5 h-5" />
                        Export CSV
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Semua Status</option>
                                <option value="pending_confirmation">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="paid">Paid</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={fetchData}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Terapkan Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    Rp {(data?.summary.total_revenue || 0).toLocaleString('id-ID')}
                                </p>
                                {data?.summary.revenue_growth !== undefined && (
                                    <p className={`text-sm mt-1 flex items-center gap-1 ${
                                        data.summary.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        <TrendingUp className="w-4 h-4" />
                                        {data.summary.revenue_growth.toFixed(2)}% dari bulan lalu
                                    </p>
                                )}
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Order</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {data?.summary.total_orders || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Order Selesai</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {data?.summary.completed_orders || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Order Pending</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {data?.summary.pending_orders || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Tren Revenue Harian</h3>
                        <Line data={revenueChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue per Package</h3>
                        <Bar data={packageChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Ringkasan Pembayaran</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="border-l-4 border-green-500 pl-4">
                            <p className="text-sm text-gray-600">Total Terbayar</p>
                            <p className="text-2xl font-bold text-gray-900">
                                Rp {(data?.payment_summary.total_paid || 0).toLocaleString('id-ID')}
                            </p>
                        </div>
                        <div className="border-l-4 border-yellow-500 pl-4">
                            <p className="text-sm text-gray-600">Pembayaran Pending</p>
                            <p className="text-2xl font-bold text-gray-900">
                                Rp {(data?.payment_summary.pending_payments || 0).toLocaleString('id-ID')}
                            </p>
                        </div>
                        <div className="border-l-4 border-blue-500 pl-4">
                            <p className="text-sm text-gray-600">Total DP</p>
                            <p className="text-2xl font-bold text-gray-900">
                                Rp {(data?.payment_summary.dp_payments || 0).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Package Performance Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-bold text-gray-900">Performa Package</h3>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Package
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                    Total Order
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Total Revenue
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Avg Order Value
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data?.revenue_by_package.map((pkg, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{pkg.package_name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {pkg.total_orders}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                                        Rp {pkg.total_revenue.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                        Rp {Math.round(pkg.total_revenue / pkg.total_orders).toLocaleString('id-ID')}
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
