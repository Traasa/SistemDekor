import { AdminLayout } from '../../../layouts/AdminLayout';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Plus, X, Trash2 } from 'lucide-react';

interface Employee {
    id: number;
    employee_code: string;
    name: string;
    employment_type: 'full_time' | 'part_time' | 'freelance' | 'intern';
}

interface Payroll {
    id: number;
    payroll_code: string;
    period_type: 'weekly' | 'monthly';
    period_start: string;
    period_end: string;
    base_amount: number;
    bonuses: number;
    deductions: number;
    adjustments: number;
    total_amount: number;
    payment_date?: string | null;
    status: 'pending' | 'paid' | 'cancelled';
    notes?: string | null;
    employee: Employee;
}

const defaultForm = {
    employee_id: '',
    period_start: '',
    period_end: '',
    base_amount: '0',
    bonuses: '0',
    deductions: '0',
    adjustments: '0',
    payment_date: '',
    status: 'pending',
    notes: '',
};

export default function PayrollPage() {
    const [rows, setRows] = useState<Payroll[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState(defaultForm);

    const selectedEmployee = useMemo(
        () => employees.find((employee) => employee.id === Number(formData.employee_id)),
        [employees, formData.employee_id],
    );

    const expectedPeriodType = useMemo(() => {
        if (!selectedEmployee) {
            return '-';
        }

        if (selectedEmployee.employment_type === 'full_time') {
            return 'Bulanan';
        }

        if (selectedEmployee.employment_type === 'part_time' || selectedEmployee.employment_type === 'freelance') {
            return 'Mingguan';
        }

        return 'Mingguan';
    }, [selectedEmployee]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [payrollResponse, employeeResponse] = await Promise.all([
                axios.get('/api/employee-payrolls'),
                axios.get('/api/employees?status=active'),
            ]);

            setRows(payrollResponse.data.data || []);
            setEmployees(employeeResponse.data.data || []);
        } catch (error) {
            console.error('Failed to fetch payroll data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setFormData(defaultForm);
        setShowModal(true);
    };

    const openEdit = (row: Payroll) => {
        setEditingId(row.id);
        setFormData({
            employee_id: String(row.employee.id),
            period_start: row.period_start,
            period_end: row.period_end,
            base_amount: String(row.base_amount || 0),
            bonuses: String(row.bonuses || 0),
            deductions: String(row.deductions || 0),
            adjustments: String(row.adjustments || 0),
            payment_date: row.payment_date || '',
            status: row.status,
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
                employee_id: Number(formData.employee_id),
                period_start: formData.period_start,
                period_end: formData.period_end,
                base_amount: Number(formData.base_amount || 0),
                bonuses: Number(formData.bonuses || 0),
                deductions: Number(formData.deductions || 0),
                adjustments: Number(formData.adjustments || 0),
                payment_date: formData.payment_date || null,
                status: formData.status,
                notes: formData.notes || null,
            };

            if (editingId) {
                await axios.put(`/api/employee-payrolls/${editingId}`, payload);
            } else {
                await axios.post('/api/employee-payrolls', payload);
            }

            closeModal();
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Gagal menyimpan payroll');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus data payroll ini?')) {
            return;
        }

        try {
            await axios.delete(`/api/employee-payrolls/${id}`);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Gagal menghapus payroll');
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Payroll Karyawan</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Fulltime dibayar bulanan, part time dan freelance dibayar mingguan.
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        <Plus className="h-5 w-5" /> Tambah Payroll
                    </button>
                </div>

                {loading ? (
                    <div className="py-12 text-center">Memuat data payroll...</div>
                ) : (
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Kode</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Karyawan</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Periode</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Tipe</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Total</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {rows.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 text-sm text-gray-900">{row.payroll_code}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {row.employee.name}
                                            <div className="text-xs text-gray-500">{row.employee.employee_code}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {row.period_start} s/d {row.period_end}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{row.period_type}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(row.total_amount)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{row.status}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <button onClick={() => openEdit(row)} className="mr-2 text-blue-600 hover:text-blue-800">Edit</button>
                                            <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-800">
                                                <Trash2 className="inline h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-10 text-center text-sm text-gray-500" colSpan={7}>
                                            Belum ada data payroll
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
                                <h2 className="text-lg font-bold">{editingId ? 'Edit Payroll' : 'Tambah Payroll'}</h2>
                                <button onClick={closeModal}>
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Karyawan</label>
                                    <select
                                        required
                                        value={formData.employee_id}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, employee_id: e.target.value }))}
                                        disabled={Boolean(editingId)}
                                        className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-100"
                                    >
                                        <option value="">Pilih karyawan</option>
                                        {employees.map((employee) => (
                                            <option key={employee.id} value={employee.id}>
                                                {employee.name} ({employee.employment_type})
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">Skema terdeteksi otomatis: {expectedPeriodType}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Periode Mulai</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.period_start}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, period_start: e.target.value }))}
                                            className="w-full rounded-lg border px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Periode Selesai</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.period_end}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, period_end: e.target.value }))}
                                            className="w-full rounded-lg border px-3 py-2"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Gaji Pokok</label>
                                        <input type="number" min="0" required value={formData.base_amount} onChange={(e) => setFormData((prev) => ({ ...prev, base_amount: e.target.value }))} className="w-full rounded-lg border px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Bonus</label>
                                        <input type="number" min="0" value={formData.bonuses} onChange={(e) => setFormData((prev) => ({ ...prev, bonuses: e.target.value }))} className="w-full rounded-lg border px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Potongan</label>
                                        <input type="number" min="0" value={formData.deductions} onChange={(e) => setFormData((prev) => ({ ...prev, deductions: e.target.value }))} className="w-full rounded-lg border px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Penyesuaian (+/-)</label>
                                        <input type="number" value={formData.adjustments} onChange={(e) => setFormData((prev) => ({ ...prev, adjustments: e.target.value }))} className="w-full rounded-lg border px-3 py-2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal Pembayaran</label>
                                        <input type="date" value={formData.payment_date} onChange={(e) => setFormData((prev) => ({ ...prev, payment_date: e.target.value }))} className="w-full rounded-lg border px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                                        <select value={formData.status} onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))} className="w-full rounded-lg border px-3 py-2">
                                            <option value="pending">pending</option>
                                            <option value="paid">paid</option>
                                            <option value="cancelled">cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Catatan</label>
                                    <textarea value={formData.notes} onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))} rows={3} className="w-full rounded-lg border px-3 py-2" />
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
