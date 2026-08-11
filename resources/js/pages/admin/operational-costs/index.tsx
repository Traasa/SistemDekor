import { AdminLayout } from '../../../layouts/AdminLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, X, Trash2, Lock, Info } from 'lucide-react';

interface OperationalCost {
    id: number;
    cost_code: string;
    cost_type: 'production' | 'catering_raw_material' | 'other' | 'payroll';
    title: string;
    description?: string | null;
    amount: number;
    cost_date: string;
    reference_type?: string | null;
    reference_id?: number | null;
    notes?: string | null;
}

const defaultForm = {
    cost_type: 'production',
    title: '',
    description: '',
    amount: '0',
    cost_date: '',
    reference_type: '',
    reference_id: '',
    notes: '',
};

export default function OperationalCostsPage() {
    const [rows, setRows] = useState<OperationalCost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [costTypeFilter, setCostTypeFilter] = useState('');
    const [formData, setFormData] = useState(defaultForm);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (costTypeFilter) {
                params.append('cost_type', costTypeFilter);
            }
            const response = await axios.get(`/api/operational-costs?${params.toString()}`);
            setRows(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch operational costs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [costTypeFilter]);

    const openCreate = () => {
        setEditingId(null);
        setFormData(defaultForm);
        setShowModal(true);
    };

    const openEdit = async (row: OperationalCost) => {
        // Block editing payroll-managed entries
        if (row.cost_type === 'payroll' && row.reference_type === 'employee_payroll') {
            await window.showAlert('Biaya payroll dikelola otomatis melalui menu Payroll Karyawan. Silakan edit di halaman Payroll.');
            return;
        }

        setEditingId(row.id);
        setFormData({
            cost_type: row.cost_type,
            title: row.title,
            description: row.description || '',
            amount: String(row.amount || 0),
            cost_date: row.cost_date,
            reference_type: '',
            reference_id: '',
            notes: row.notes || '',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData(defaultForm);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const payload = {
                cost_type: formData.cost_type,
                title: formData.title,
                description: formData.description || null,
                amount: Number(formData.amount || 0),
                cost_date: formData.cost_date,
                reference_type: formData.reference_type || null,
                reference_id: formData.reference_id ? Number(formData.reference_id) : null,
                notes: formData.notes || null,
            };

            if (editingId) {
                await axios.put(`/api/operational-costs/${editingId}`, payload);
            } else {
                await axios.post('/api/operational-costs', payload);
            }

            closeModal();
            fetchData();
        } catch (error: any) {
            await window.showAlert(error.response?.data?.message || 'Gagal menyimpan biaya operasional');
        }
    };

    const handleDelete = async (id: number, row: OperationalCost) => {
        // Block deleting payroll-managed entries
        if (row.cost_type === 'payroll' && row.reference_type === 'employee_payroll') {
            await window.showAlert('Biaya payroll dikelola otomatis melalui menu Payroll Karyawan. Hapus dari halaman Payroll.');
            return;
        }

        if (!await window.showConfirm('Hapus data biaya ini?')) {
            return;
        }

        try {
            await axios.delete(`/api/operational-costs/${id}`);
            fetchData();
        } catch (error: any) {
            await window.showAlert(error.response?.data?.message || 'Gagal menghapus data');
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);

    const formatTypeLabel = (type: string) => {
        if (type === 'production') return 'Biaya Produksi';
        if (type === 'catering_raw_material') return 'Bahan Baku Catering';
        if (type === 'payroll') return 'Payroll Karyawan';
        return 'Biaya Lain-lain';
    };

    const getTypeBadgeColor = (type: string) => {
        if (type === 'production') return 'bg-blue-100 text-blue-800';
        if (type === 'catering_raw_material') return 'bg-orange-100 text-orange-800';
        if (type === 'payroll') return 'bg-purple-100 text-purple-800';
        return 'bg-gray-100 text-gray-800';
    };

    const isPayrollManaged = (row: OperationalCost) => {
        return row.cost_type === 'payroll' && row.reference_type === 'employee_payroll';
    };

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Biaya Operasional</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Catat biaya produksi, bahan baku catering, payroll karyawan, dan biaya lain-lain.
                        </p>
                    </div>
                    <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        <Plus className="h-5 w-5" /> Tambah Biaya
                    </button>
                </div>

                {/* Info Banner */}
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-purple-200 bg-purple-50 p-3">
                    <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-purple-800">
                        Data payroll karyawan otomatis tercatat di sini saat status payroll berubah menjadi <strong>Paid</strong>. 
                        Untuk mengedit data payroll, gunakan menu <strong>Payroll</strong> di sidebar.
                    </p>
                </div>

                <div className="mb-4 w-72">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Filter Tipe</label>
                    <select
                        value={costTypeFilter}
                        onChange={(e) => setCostTypeFilter(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2"
                    >
                        <option value="">Semua</option>
                        <option value="production">Biaya Produksi</option>
                        <option value="catering_raw_material">Bahan Baku Catering</option>
                        <option value="payroll">Payroll Karyawan</option>
                        <option value="other">Biaya Lain-lain</option>
                    </select>
                </div>

                {loading ? (
                    <div className="py-12 text-center">Memuat biaya operasional...</div>
                ) : (
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Kode</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Tipe</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Judul</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Tanggal</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Nominal</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {rows.map((row) => (
                                    <tr key={row.id} className={isPayrollManaged(row) ? 'bg-purple-50/30' : ''}>
                                        <td className="px-4 py-3 text-sm text-gray-900">{row.cost_code}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getTypeBadgeColor(row.cost_type)}`}>
                                                {isPayrollManaged(row) && <Lock className="h-3 w-3" />}
                                                {formatTypeLabel(row.cost_type)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{row.title}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{row.cost_date}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(row.amount)}</td>
                                        <td className="px-4 py-3 text-sm">
                                            {isPayrollManaged(row) ? (
                                                <span className="text-xs text-purple-600 font-medium flex items-center gap-1">
                                                    <Lock className="h-3 w-3" /> Auto
                                                </span>
                                            ) : (
                                                <>
                                                    <button onClick={async () => openEdit(row)} className="mr-2 text-blue-600 hover:text-blue-800">Edit</button>
                                                    <button onClick={async () => handleDelete(row.id, row)} className="text-red-600 hover:text-red-800">
                                                        <Trash2 className="inline h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-10 text-center text-sm text-gray-500" colSpan={6}>
                                            Belum ada data biaya operasional
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-2xl rounded-lg bg-white p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold">{editingId ? 'Edit Biaya Operasional' : 'Tambah Biaya Operasional'}</h2>
                                <button onClick={closeModal}>
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Tipe Biaya</label>
                                    <select value={formData.cost_type} onChange={(e) => setFormData((prev) => ({ ...prev, cost_type: e.target.value }))} className="w-full rounded-lg border px-3 py-2">
                                        <option value="production">Biaya Produksi</option>
                                        <option value="catering_raw_material">Bahan Baku Catering</option>
                                        <option value="other">Biaya Lain-lain</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Judul</label>
                                        <input type="text" required value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} className="w-full rounded-lg border px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal Biaya</label>
                                        <input type="date" required value={formData.cost_date} onChange={(e) => setFormData((prev) => ({ ...prev, cost_date: e.target.value }))} className="w-full rounded-lg border px-3 py-2" />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Nominal</label>
                                    <input type="number" min="0" required value={formData.amount} onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))} className="w-full rounded-lg border px-3 py-2" />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Deskripsi</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} rows={3} className="w-full rounded-lg border px-3 py-2" />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Catatan</label>
                                    <textarea value={formData.notes} onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))} rows={2} className="w-full rounded-lg border px-3 py-2" />
                                </div>

                                <div className="flex justify-end gap-3 pt-3">
                                    <button type="button" onClick={closeModal} className="rounded-lg border px-4 py-2">Batal</button>
                                    <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Simpan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
