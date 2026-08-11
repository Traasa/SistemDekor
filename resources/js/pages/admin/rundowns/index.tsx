import { AdminLayout } from '../../../layouts/AdminLayout';
import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Plus, Edit, Trash2, X, AlertTriangle, Calendar, ExternalLink, Sparkles } from 'lucide-react';

interface RundownItem {
    id: number;
    event_id: number;
    order: number;
    time: string;
    duration: number;
    activity: string;
    description: string | null;
    pic: string | null;
    notes: string | null;
    equipment_needed: string[] | null;
    is_critical: boolean;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
}

interface EventOption {
    id: number;
    event_code: string;
    event_name: string;
    event_date: string;
    status: string;
}

const defaultForm = {
    order: '1',
    time: '',
    duration: '30',
    activity: '',
    description: '',
    pic: '',
    notes: '',
    equipment_needed: '',
    is_critical: false,
    status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'skipped',
};

export default function RundownsPage() {
    const [rundowns, setRundowns] = useState<RundownItem[]>([]);
    const [events, setEvents] = useState<EventOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
    const [formData, setFormData] = useState(defaultForm);

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedEvent) {
            fetchRundowns(selectedEvent);
        } else {
            setRundowns([]);
        }
    }, [selectedEvent]);

    const selectedEventObject = useMemo(() => events.find((event) => event.id === selectedEvent) || null, [events, selectedEvent]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/events?per_page=100');
            const eventRows = response.data.data || [];
            setEvents(
                eventRows.map((event: any) => ({
                    id: event.id,
                    event_code: event.event_code,
                    event_name: event.event_name,
                    event_date: event.event_date,
                    status: event.status,
                })),
            );
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRundowns = async (eventId: number) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/events/${eventId}/rundown`);
            const data = response.data.data || response.data || [];
            const parsedData = data.map((item: any) => ({
                ...item,
                equipment_needed:
                    typeof item.equipment_needed === 'string' ? JSON.parse(item.equipment_needed) : (item.equipment_needed || []),
            }));
            setRundowns(parsedData);
        } catch (error) {
            console.error('Failed to fetch rundowns:', error);
            setRundowns([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvent) {
            await window.showAlert('Pilih event terlebih dahulu');
            return;
        }

        try {
            const submitData = {
                ...formData,
                order: parseInt(formData.order),
                duration: parseInt(formData.duration),
                equipment_needed: formData.equipment_needed
                    ? formData.equipment_needed
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean)
                    : [],
            };

            if (editingId) {
                await axios.put(`/api/events/${selectedEvent}/rundown/${editingId}`, submitData);
            } else {
                await axios.post(`/api/events/${selectedEvent}/rundown`, submitData);
            }

            setShowModal(false);
            resetForm();
            fetchRundowns(selectedEvent);
            await window.showAlert('Rundown berhasil disimpan');
        } catch (error) {
            console.error('Failed to save rundown:', error);
            await window.showAlert('Gagal menyimpan rundown');
        }
    };

    const handleEdit = async (rundown: RundownItem) => {
        setEditingId(rundown.id);
        setFormData({
            order: String(rundown.order),
            time: rundown.time ? rundown.time.split('T')[1]?.substring(0, 5) || rundown.time.substring(0, 5) : '',
            duration: String(rundown.duration),
            activity: rundown.activity,
            description: rundown.description || '',
            pic: rundown.pic || '',
            notes: rundown.notes || '',
            equipment_needed: Array.isArray(rundown.equipment_needed) ? rundown.equipment_needed.join(', ') : '',
            is_critical: rundown.is_critical,
            status: rundown.status,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!await window.showConfirm('Yakin ingin menghapus item rundown ini?')) return;
        if (!selectedEvent) return;

        try {
            await axios.delete(`/api/events/${selectedEvent}/rundown/${id}`);
            fetchRundowns(selectedEvent);
            await window.showAlert('Rundown berhasil dihapus');
        } catch (error) {
            console.error('Failed to delete rundown:', error);
            await window.showAlert('Gagal menghapus rundown');
        }
    };

    const resetForm = () => {
        setFormData(defaultForm);
        setEditingId(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-red-100 text-red-800';
        }
    };

    const formatDate = (value: string) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('id-ID', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const openEventRundownPage = () => {
        if (!selectedEvent) return;
        router.visit(`/admin/events/${selectedEvent}/rundown`);
    };

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Rundown Acara</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Halaman ini khusus urutan acara saat berlangsung. Template umum wedding akan otomatis dibuat saat rundown masih kosong.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={openEventRundownPage}
                            disabled={!selectedEvent}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Buka Rundown Acara
                        </button>
                        <button
                            onClick={async () => setShowModal(true)}
                            disabled={!selectedEvent}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Item
                        </button>
                    </div>
                </div>

                <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Pilih Event</label>
                    <select
                        value={selectedEvent || ''}
                        onChange={(e) => setSelectedEvent(e.target.value ? Number(e.target.value) : null)}
                        className="w-full rounded-lg border px-3 py-2 md:max-w-2xl"
                    >
                        <option value="">-- Pilih Event --</option>
                        {events.map((event) => (
                            <option key={event.id} value={event.id}>
                                {event.event_code} - {event.event_name} ({formatDate(event.event_date)})
                            </option>
                        ))}
                    </select>

                    {selectedEventObject && (
                        <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                            Event aktif: {selectedEventObject.event_code} • {selectedEventObject.event_name}
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="py-12 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
                    </div>
                ) : selectedEvent ? (
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        {rundowns.length === 0 ? (
                            <div className="p-10 text-center">
                                <Sparkles className="mx-auto mb-3 h-12 w-12 text-amber-500" />
                                <h3 className="text-lg font-semibold text-gray-900">Rundown otomatis sedang disiapkan</h3>
                                <p className="mt-1 text-sm text-gray-500">Refresh sebentar lagi jika belum muncul, template default wedding akan dibuat otomatis.</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Urutan</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Waktu</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Aktivitas</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">PIC</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {rundowns.map((rundown) => (
                                        <tr key={rundown.id}>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">#{rundown.order}</span>
                                                    {rundown.is_critical && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{rundown.time?.slice(0, 5) || '-'}</td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-semibold text-gray-900">{rundown.activity}</p>
                                                <p className="text-xs text-gray-500">{rundown.duration} menit</p>
                                                {rundown.description && <p className="mt-1 text-xs text-gray-500">{rundown.description}</p>}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{rundown.pic || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(rundown.status)}`}>
                                                    {rundown.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <button onClick={async () => handleEdit(rundown)} className="mr-2 text-blue-600 hover:text-blue-800">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button onClick={async () => handleDelete(rundown.id)} className="text-red-600 hover:text-red-800">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : (
                    <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500">
                        <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <p>Pilih event terlebih dahulu untuk melihat rundown</p>
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-bold">{editingId ? 'Edit Item Rundown' : 'Tambah Item Rundown'}</h3>
                                <button onClick={async () => { setShowModal(false); resetForm(); }}>
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Urutan *</label>
                                        <input type="number" min="1" required value={formData.order} onChange={(e) => setFormData({ ...formData, order: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Waktu *</label>
                                        <input type="time" required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Durasi (menit) *</label>
                                        <input type="number" min="1" required value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Aktivitas *</label>
                                    <input type="text" required value={formData.activity} onChange={(e) => setFormData({ ...formData, activity: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Deskripsi</label>
                                    <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">PIC</label>
                                        <input type="text" value={formData.pic} onChange={(e) => setFormData({ ...formData, pic: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full rounded-lg border px-3 py-2">
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="skipped">Skipped</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Peralatan (pisahkan koma)</label>
                                    <input type="text" value={formData.equipment_needed} onChange={(e) => setFormData({ ...formData, equipment_needed: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Catatan</label>
                                    <textarea rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
                                </div>

                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input type="checkbox" checked={formData.is_critical} onChange={(e) => setFormData({ ...formData, is_critical: e.target.checked })} />
                                    Tandai sebagai aktivitas critical
                                </label>

                                <div className="mt-5 flex justify-end gap-3 border-t pt-4">
                                    <button type="button" onClick={async () => { setShowModal(false); resetForm(); }} className="rounded-lg border px-4 py-2">
                                        Batal
                                    </button>
                                    <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
