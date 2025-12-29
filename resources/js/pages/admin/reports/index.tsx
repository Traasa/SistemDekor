import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import api from '../../../services/api';
import { 
    DollarSign, 
    TrendingUp, 
    TrendingDown, 
    Calendar, 
    FileText,
    Package,
    CreditCard,
    BarChart3,
    Download,
    Filter
} from 'lucide-react';

interface CashFlowData {
    period: { start: string; end: string };
    income: number;
    expenses: {
        inventory: number;
        other: number;
        total: number;
    };
    net_profit: number;
    profit_margin: number;
}

interface EventReportData {
    summary: {
        total_events: number;
        total_revenue: number;
        total_down_payment: number;
        total_remaining: number;
        by_status: any;
        by_month: any;
    };
    details: any[];
}

interface InventoryReportData {
    summary: {
        total_items: number;
        current_stock_value: number;
        period_purchases: number;
        period_usage: number;
        net_inventory_change: number;
    };
    items: any[];
}

interface IncomeStatementData {
    period: { start: string; end: string };
    revenue: {
        orders: number;
        total: number;
    };
    cost_of_goods_sold: number;
    gross_profit: number;
    gross_margin_percentage: number;
    operating_expenses: number;
    operating_income: number;
    net_income: number;
    net_margin_percentage: number;
}

interface PaymentReportData {
    summary: {
        total_receivable: number;
        total_received: number;
        total_outstanding: number;
        fully_paid_count: number;
        partial_paid_count: number;
        unpaid_count: number;
    };
    details: any[];
}

interface MonthlyComparisonData {
    year: number;
    monthly_data: any[];
    annual_summary: {
        total_revenue: number;
        total_expenses: number;
        total_profit: number;
        average_monthly_revenue: number;
        average_monthly_profit: number;
    };
}

const FinancialReportsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'cashflow' | 'events' | 'inventory' | 'income' | 'payments' | 'comparison'>('cashflow');
    const [loading, setLoading] = useState(false);
    
    // Date filters
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [year, setYear] = useState(new Date().getFullYear());

    // Report data
    const [cashFlowData, setCashFlowData] = useState<CashFlowData | null>(null);
    const [eventData, setEventData] = useState<EventReportData | null>(null);
    const [inventoryData, setInventoryData] = useState<InventoryReportData | null>(null);
    const [incomeData, setIncomeData] = useState<IncomeStatementData | null>(null);
    const [paymentData, setPaymentData] = useState<PaymentReportData | null>(null);
    const [comparisonData, setComparisonData] = useState<MonthlyComparisonData | null>(null);

    useEffect(() => {
        loadReportData();
    }, [activeTab, startDate, endDate, year]);

    const loadReportData = async () => {
        setLoading(true);
        try {
            const params = { start_date: startDate, end_date: endDate };
            
            switch (activeTab) {
                case 'cashflow':
                    const cashFlowRes = await api.get('/reports/cash-flow', { params });
                    setCashFlowData(cashFlowRes.data.data);
                    break;
                case 'events':
                    const eventRes = await api.get('/reports/events', { params });
                    setEventData(eventRes.data.data);
                    break;
                case 'inventory':
                    const inventoryRes = await api.get('/reports/inventory', { params });
                    setInventoryData(inventoryRes.data.data);
                    break;
                case 'income':
                    const incomeRes = await api.get('/reports/income-statement', { params });
                    setIncomeData(incomeRes.data.data);
                    break;
                case 'payments':
                    const paymentRes = await api.get('/reports/payments', { params });
                    setPaymentData(paymentRes.data.data);
                    break;
                case 'comparison':
                    const comparisonRes = await api.get('/reports/monthly-comparison', { params: { year } });
                    setComparisonData(comparisonRes.data.data);
                    break;
            }
        } catch (error) {
            console.error('Error loading report:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const tabs = [
        { id: 'cashflow', label: 'Cash Flow', icon: TrendingUp },
        { id: 'events', label: 'Laporan Event', icon: Calendar },
        { id: 'inventory', label: 'Laporan Barang', icon: Package },
        { id: 'income', label: 'Laba Rugi', icon: FileText },
        { id: 'payments', label: 'Pembayaran', icon: CreditCard },
        { id: 'comparison', label: 'Perbandingan Bulanan', icon: BarChart3 },
    ];

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
                        <p className="mt-1 text-sm text-gray-600">Analisis lengkap keuangan perusahaan</p>
                    </div>
                    <button className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors">
                        <Download size={20} />
                        Export PDF
                    </button>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="flex overflow-x-auto border-b border-gray-200">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap border-b-2 transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-blue-600 text-blue-600 bg-blue-50'
                                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon size={20} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Filters */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex flex-wrap items-center gap-4">
                            {activeTab !== 'comparison' ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={18} className="text-gray-500" />
                                        <label className="text-sm font-medium text-gray-700">Dari:</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium text-gray-700">Sampai:</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Calendar size={18} className="text-gray-500" />
                                    <label className="text-sm font-medium text-gray-700">Tahun:</label>
                                    <select
                                        value={year}
                                        onChange={(e) => setYear(parseInt(e.target.value))}
                                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                    >
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <button
                                onClick={loadReportData}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
                            >
                                <Filter size={18} />
                                Terapkan Filter
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                <p className="mt-4 text-gray-600">Memuat data laporan...</p>
                            </div>
                        ) : (
                            <>
                                {/* Cash Flow Report */}
                                {activeTab === 'cashflow' && cashFlowData && (
                                    <div className="space-y-6">
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                            <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-5 border border-green-200">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-green-700">Total Pemasukan</p>
                                                        <p className="mt-2 text-2xl font-bold text-green-900">
                                                            {formatCurrency(cashFlowData.income)}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-full bg-green-200 p-3">
                                                        <TrendingUp className="text-green-700" size={24} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-lg bg-gradient-to-br from-red-50 to-red-100 p-5 border border-red-200">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-red-700">Total Pengeluaran</p>
                                                        <p className="mt-2 text-2xl font-bold text-red-900">
                                                            {formatCurrency(cashFlowData.expenses.total)}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-full bg-red-200 p-3">
                                                        <TrendingDown className="text-red-700" size={24} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-5 border border-blue-200">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-blue-700">Laba Bersih</p>
                                                        <p className="mt-2 text-2xl font-bold text-blue-900">
                                                            {formatCurrency(cashFlowData.net_profit)}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-full bg-blue-200 p-3">
                                                        <DollarSign className="text-blue-700" size={24} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-5 border border-purple-200">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-purple-700">Margin Keuntungan</p>
                                                        <p className="mt-2 text-2xl font-bold text-purple-900">
                                                            {cashFlowData.profit_margin.toFixed(2)}%
                                                        </p>
                                                    </div>
                                                    <div className="rounded-full bg-purple-200 p-3">
                                                        <BarChart3 className="text-purple-700" size={24} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-lg bg-white border border-gray-200">
                                            <div className="p-4 border-b border-gray-200">
                                                <h3 className="font-semibold text-gray-900">Detail Pengeluaran</h3>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <span className="text-gray-700">Pembelian Inventaris</span>
                                                    <span className="font-semibold text-gray-900">
                                                        {formatCurrency(cashFlowData.expenses.inventory)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <span className="text-gray-700">Pengeluaran Lainnya</span>
                                                    <span className="font-semibold text-gray-900">
                                                        {formatCurrency(cashFlowData.expenses.other)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Event Report */}
                                {activeTab === 'events' && eventData && (
                                    <div className="space-y-6">
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                            <div className="rounded-lg bg-white p-5 border border-gray-200 shadow-sm">
                                                <p className="text-sm font-medium text-gray-600">Total Event</p>
                                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                                    {eventData.summary.total_events}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-white p-5 border border-gray-200 shadow-sm">
                                                <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                                                <p className="mt-2 text-2xl font-bold text-green-600">
                                                    {formatCurrency(eventData.summary.total_revenue)}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-white p-5 border border-gray-200 shadow-sm">
                                                <p className="text-sm font-medium text-gray-600">DP Diterima</p>
                                                <p className="mt-2 text-2xl font-bold text-blue-600">
                                                    {formatCurrency(eventData.summary.total_down_payment)}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-white p-5 border border-gray-200 shadow-sm">
                                                <p className="text-sm font-medium text-gray-600">Sisa Tagihan</p>
                                                <p className="mt-2 text-2xl font-bold text-orange-600">
                                                    {formatCurrency(eventData.summary.total_remaining)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-lg bg-white border border-gray-200 overflow-hidden">
                                            <div className="p-4 border-b border-gray-200">
                                                <h3 className="font-semibold text-gray-900">Detail Event</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Event</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">DP</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sisa</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {eventData.details.map((event: any) => (
                                                            <tr key={event.id} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                                    {event.order_number}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                                    {event.client_name}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                                    {formatDate(event.event_date)}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                                    {event.event_type}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                        event.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                        event.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                        {event.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                                                                    {formatCurrency(event.total_price)}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-right text-blue-600">
                                                                    {formatCurrency(event.down_payment)}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-right text-orange-600">
                                                                    {formatCurrency(event.remaining)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Inventory Report */}
                                {activeTab === 'inventory' && inventoryData && (
                                    <div className="space-y-6">
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                            <div className="rounded-lg bg-white p-5 border border-gray-200 shadow-sm">
                                                <p className="text-sm font-medium text-gray-600">Total Item</p>
                                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                                    {inventoryData.summary.total_items}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-white p-5 border border-gray-200 shadow-sm">
                                                <p className="text-sm font-medium text-gray-600">Nilai Stok</p>
                                                <p className="mt-2 text-xl font-bold text-blue-600">
                                                    {formatCurrency(inventoryData.summary.current_stock_value)}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-white p-5 border border-gray-200 shadow-sm">
                                                <p className="text-sm font-medium text-gray-600">Pembelian</p>
                                                <p className="mt-2 text-xl font-bold text-green-600">
                                                    {formatCurrency(inventoryData.summary.period_purchases)}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-white p-5 border border-gray-200 shadow-sm">
                                                <p className="text-sm font-medium text-gray-600">Pemakaian</p>
                                                <p className="mt-2 text-xl font-bold text-red-600">
                                                    {formatCurrency(inventoryData.summary.period_usage)}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-white p-5 border border-gray-200 shadow-sm">
                                                <p className="text-sm font-medium text-gray-600">Perubahan</p>
                                                <p className={`mt-2 text-xl font-bold ${
                                                    inventoryData.summary.net_inventory_change >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {formatCurrency(inventoryData.summary.net_inventory_change)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-lg bg-white border border-gray-200 overflow-hidden">
                                            <div className="p-4 border-b border-gray-200">
                                                <h3 className="font-semibold text-gray-900">Detail Barang</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stok</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Nilai Stok</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pembelian</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pemakaian</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {inventoryData.items.map((item: any) => (
                                                            <tr key={item.id} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                                    {item.code}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                                    {item.name}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                                    {item.category}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-right text-gray-900">
                                                                    {item.current_stock} {item.unit}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">
                                                                    {formatCurrency(item.stock_value)}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-right text-green-600">
                                                                    {formatCurrency(item.period_purchase_value)}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-right text-red-600">
                                                                    {formatCurrency(item.period_usage_value)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Income Statement */}
                                {activeTab === 'income' && incomeData && (
                                    <div className="space-y-6">
                                        <div className="rounded-lg bg-white border border-gray-200">
                                            <div className="p-4 border-b border-gray-200 bg-blue-50">
                                                <h3 className="font-bold text-lg text-blue-900">Laporan Laba Rugi</h3>
                                                <p className="text-sm text-blue-700">
                                                    Periode: {formatDate(incomeData.period.start)} - {formatDate(incomeData.period.end)}
                                                </p>
                                            </div>
                                            <div className="p-6 space-y-4">
                                                {/* Revenue */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                                        <span className="font-semibold text-green-900">Pendapatan</span>
                                                        <span className="font-bold text-xl text-green-700">
                                                            {formatCurrency(incomeData.revenue.total)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* COGS */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                        <span className="text-gray-700">Harga Pokok Penjualan (HPP)</span>
                                                        <span className="font-semibold text-gray-900">
                                                            ({formatCurrency(incomeData.cost_of_goods_sold)})
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Gross Profit */}
                                                <div className="space-y-2 border-t-2 border-gray-300 pt-4">
                                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                                        <div>
                                                            <span className="font-semibold text-blue-900">Laba Kotor</span>
                                                            <span className="ml-2 text-xs text-blue-600">
                                                                (Margin: {incomeData.gross_margin_percentage.toFixed(2)}%)
                                                            </span>
                                                        </div>
                                                        <span className="font-bold text-xl text-blue-700">
                                                            {formatCurrency(incomeData.gross_profit)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Operating Expenses */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                        <span className="text-gray-700">Biaya Operasional</span>
                                                        <span className="font-semibold text-gray-900">
                                                            ({formatCurrency(incomeData.operating_expenses)})
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Net Income */}
                                                <div className="space-y-2 border-t-2 border-gray-300 pt-4">
                                                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-100 to-green-50 rounded-lg border-2 border-green-300">
                                                        <div>
                                                            <span className="font-bold text-lg text-green-900">Laba Bersih</span>
                                                            <span className="ml-2 text-sm text-green-700">
                                                                (Margin: {incomeData.net_margin_percentage.toFixed(2)}%)
                                                            </span>
                                                        </div>
                                                        <span className="font-bold text-2xl text-green-700">
                                                            {formatCurrency(incomeData.net_income)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Payment Report */}
                                {activeTab === 'payments' && paymentData && (
                                    <div className="space-y-6">
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            <div className="rounded-lg bg-white p-5 border border-gray-200 shadow-sm">
                                                <p className="text-sm font-medium text-gray-600">Total Tagihan</p>
                                                <p className="mt-2 text-2xl font-bold text-gray-900">
                                                    {formatCurrency(paymentData.summary.total_receivable)}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-white p-5 border border-gray-200 shadow-sm">
                                                <p className="text-sm font-medium text-gray-600">Sudah Dibayar</p>
                                                <p className="mt-2 text-2xl font-bold text-green-600">
                                                    {formatCurrency(paymentData.summary.total_received)}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-white p-5 border border-gray-200 shadow-sm">
                                                <p className="text-sm font-medium text-gray-600">Belum Dibayar</p>
                                                <p className="mt-2 text-2xl font-bold text-orange-600">
                                                    {formatCurrency(paymentData.summary.total_outstanding)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                                                <p className="text-sm text-green-700">Lunas</p>
                                                <p className="text-2xl font-bold text-green-900">
                                                    {paymentData.summary.fully_paid_count}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
                                                <p className="text-sm text-yellow-700">Parsial</p>
                                                <p className="text-2xl font-bold text-yellow-900">
                                                    {paymentData.summary.partial_paid_count}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                                                <p className="text-sm text-red-700">Belum Dibayar</p>
                                                <p className="text-2xl font-bold text-red-900">
                                                    {paymentData.summary.unpaid_count}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-lg bg-white border border-gray-200 overflow-hidden">
                                            <div className="p-4 border-b border-gray-200">
                                                <h3 className="font-semibold text-gray-900">Detail Pembayaran</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Dibayar</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sisa</th>
                                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Progress</th>
                                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {paymentData.details.map((payment: any) => (
                                                            <tr key={payment.id} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                                    {payment.order_number}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                                    {payment.client_name}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                                                                    {formatCurrency(payment.total_amount)}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-right text-green-600">
                                                                    {formatCurrency(payment.paid_amount)}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-right text-orange-600">
                                                                    {formatCurrency(payment.outstanding_amount)}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                                        <div
                                                                            className={`h-2 rounded-full ${
                                                                                payment.payment_percentage === 100 ? 'bg-green-600' :
                                                                                payment.payment_percentage > 0 ? 'bg-yellow-600' :
                                                                                'bg-red-600'
                                                                            }`}
                                                                            style={{ width: `${payment.payment_percentage}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <p className="text-xs text-center mt-1 text-gray-600">
                                                                        {payment.payment_percentage.toFixed(0)}%
                                                                    </p>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                        payment.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                                                        payment.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-red-100 text-red-800'
                                                                    }`}>
                                                                        {payment.payment_status === 'paid' ? 'Lunas' :
                                                                         payment.payment_status === 'partial' ? 'Parsial' : 'Belum'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Monthly Comparison */}
                                {activeTab === 'comparison' && comparisonData && (
                                    <div className="space-y-6">
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                            <div className="rounded-lg bg-white p-5 border border-gray-200 shadow-sm">
                                                <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                                                <p className="mt-2 text-2xl font-bold text-green-600">
                                                    {formatCurrency(comparisonData.annual_summary.total_revenue)}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-white p-5 border border-gray-200 shadow-sm">
                                                <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
                                                <p className="mt-2 text-2xl font-bold text-red-600">
                                                    {formatCurrency(comparisonData.annual_summary.total_expenses)}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-white p-5 border border-gray-200 shadow-sm">
                                                <p className="text-sm font-medium text-gray-600">Total Laba</p>
                                                <p className="mt-2 text-2xl font-bold text-blue-600">
                                                    {formatCurrency(comparisonData.annual_summary.total_profit)}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-white p-5 border border-gray-200 shadow-sm">
                                                <p className="text-sm font-medium text-gray-600">Rata-rata/Bulan</p>
                                                <p className="mt-2 text-2xl font-bold text-purple-600">
                                                    {formatCurrency(comparisonData.annual_summary.average_monthly_profit)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-lg bg-white border border-gray-200 overflow-hidden">
                                            <div className="p-4 border-b border-gray-200">
                                                <h3 className="font-semibold text-gray-900">Perbandingan Bulanan {comparisonData.year}</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bulan</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pendapatan</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pengeluaran</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Laba</th>
                                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Jumlah Order</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {comparisonData.monthly_data.map((month: any) => (
                                                            <tr key={month.month} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                                    {month.month_name}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                                                                    {formatCurrency(month.revenue)}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-right text-red-600">
                                                                    {formatCurrency(month.expenses)}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-right font-bold text-blue-600">
                                                                    {formatCurrency(month.profit)}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-center text-gray-900">
                                                                    {month.order_count}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default FinancialReportsPage;
