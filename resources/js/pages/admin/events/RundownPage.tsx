import { AdminLayout } from '../../../layouts/AdminLayout';
import { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { Calendar, Clock, ArrowLeft, Plus, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface RundownItem {
    id: number;
    order: number;
    time: string;
    duration: number;
    activity: string;
    description: string | null;
    pic: string | null;
    notes: string | null;
    equipment_needed: string[] | null;
    is_critical: boolean;
    status: string;
    status_label: string;
    end_time: string;
}

interface Event {
    id: number;
    event_code: string;
    event_name: string;
    event_type_label: string;
    event_date: string;
    venue_name: string;
    status_label: string;
}

export default function RundownAcaraPage({ eventId }: { eventId: string }) {
    const [event, setEvent] = useState<Event | null>(null);
    const [rundownItems, setRundownItems] = useState<RundownItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        time: '',
        duration: 30,
        activity: '',
        description: '',
        pic: '',
        notes: '',
        equipment_needed: '',
        is_critical: false,
    });

    const fetchEventAndRundown = async () => {
        try {
            setLoading(true);
            const [eventRes, rundownRes] = await Promise.all([
                axios.get(`/api/events/${eventId}`),
                axios.get(`/api/events/${eventId}/rundown`)
            ]);
            setEvent(eventRes.data);
            setRundownItems(rundownRes.data);
        } catch (error) {
            console.error('Failed to fetch event and rundown:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEventAndRundown();
    }, [eventId]);

    const updateStatus = async (itemId: number, newStatus: string) => {
        try {
            await axios.put(`/api/events/${eventId}/rundown/${itemId}`, { status: newStatus });
            fetchEventAndRundown();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const deleteItem = async (itemId: number) => {
        if (!confirm('Yakin ingin menghapus item rundown ini?')) return;
        
        try {
            await axios.delete(`/api/events/${eventId}/rundown/${itemId}`);
            fetchEventAndRundown();
        } catch (error) {
            console.error('Failed to delete item:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                equipment_needed: formData.equipment_needed 
                    ? formData.equipment_needed.split(',').map(s => s.trim()).filter(Boolean)
                    : [],
            };

            if (editingId) {
                await axios.put(`/api/events/${eventId}/rundown/${editingId}`, submitData);
            } else {
                await axios.post(`/api/events/${eventId}/rundown`, submitData);
            }
            
            setShowAddForm(false);
            setEditingId(null);
            setFormData({
                time: '',
                duration: 30,
                activity: '',
                description: '',
                pic: '',
                notes: '',
                equipment_needed: '',
                is_critical: false,
            });
            fetchEventAndRundown();
        } catch (error) {
            console.error('Failed to save rundown item:', error);
            alert('Gagal menyimpan item rundown');
        }
    };

    const startEdit = (item: RundownItem) => {
        setEditingId(item.id);
        setFormData({
            time: new Date(item.time).toTimeString().slice(0, 5),
            duration: item.duration,
            activity: item.activity,
            description: item.description || '',
            pic: item.pic || '',
            notes: item.notes || '',
            equipment_needed: item.equipment_needed?.join(', ') || '',
            is_critical: item.is_critical,
        });
        setShowAddForm(true);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setShowAddForm(false);
        setFormData({
            time: '',
            duration: 30,
            activity: '',
            description: '',
            pic: '',
            notes: '',
            equipment_needed: '',
            is_critical: false,
        });
    };

    const formatTime = (timeString: string) => {
        return new Date(timeString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-gray-100 text-gray-800',
            in_progress: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            skipped: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-screen">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/admin/events"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Daftar Event
                    </Link>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{event?.event_name}</h1>
                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {event && formatDate(event.event_date)}
                                </span>
                                <span>•</span>
                                <span>{event?.venue_name}</span>
                                <span>•</span>
                                <span className="font-medium">{event?.status_label}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Item Rundown
                        </button>
                    </div>
                </div>

                {/* Add/Edit Form Modal */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {editingId ? 'Edit Item Rundown' : 'Tambah Item Rundown'}
                                </h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Waktu Mulai *
                                            </label>
                                            <input
                                                type="time"
                                                required
                                                value={formData.time}
                                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Durasi (menit) *
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={formData.duration}
                                                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Aktivitas *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.activity}
                                            onChange={(e) => setFormData({...formData, activity: e.target.value})}
                                            placeholder="Contoh: Akad Nikah"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Deskripsi
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            rows={3}
                                            placeholder="Detail aktivitas..."
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Penanggung Jawab (PIC)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.pic}
                                            onChange={(e) => setFormData({...formData, pic: e.target.value})}
                                            placeholder="Nama PIC"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Peralatan Dibutuhkan
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.equipment_needed}
                                            onChange={(e) => setFormData({...formData, equipment_needed: e.target.value})}
                                            placeholder="Pisahkan dengan koma: Mic, Speaker, Proyektor"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Catatan
                                        </label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                            rows={2}
                                            placeholder="Catatan tambahan..."
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is_critical"
                                            checked={formData.is_critical}
                                            onChange={(e) => setFormData({...formData, is_critical: e.target.checked})}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="is_critical" className="text-sm text-gray-700">
                                            Acara Penting (tidak boleh telat)
                                        </label>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t">
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                        >
                                            {editingId ? 'Update' : 'Tambah'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Timeline */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Timeline Acara</h2>

                    {rundownItems.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada rundown</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Tambahkan item rundown untuk mengatur jadwal acara
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {rundownItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`flex gap-4 p-4 rounded-lg border-2 ${
                                        item.is_critical
                                            ? 'border-red-200 bg-red-50'
                                            : 'border-gray-200 bg-white'
                                    }`}
                                >
                                    {/* Time & Status */}
                                    <div className="flex-shrink-0 w-32">
                                        <div className="font-semibold text-gray-900">
                                            {formatTime(item.time)}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {item.duration} menit
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            s/d {formatTime(item.end_time)}
                                        </div>
                                        <div className="mt-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                {item.status_label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Activity Details */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {index + 1}. {item.activity}
                                                    </h3>
                                                    {item.is_critical && (
                                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                                    )}
                                                </div>
                                                {item.description && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {item.description}
                                                    </p>
                                                )}
                                                {item.pic && (
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        <strong>PIC:</strong> {item.pic}
                                                    </p>
                                                )}
                                                {item.equipment_needed && item.equipment_needed.length > 0 && (
                                                    <div className="mt-2">
                                                        <p className="text-xs font-medium text-gray-700">
                                                            Peralatan dibutuhkan:
                                                        </p>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {item.equipment_needed.map((eq, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                                                >
                                                                    {eq}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {item.notes && (
                                                    <p className="text-xs text-gray-500 mt-2 italic">
                                                        Catatan: {item.notes}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                {item.status === 'pending' && (
                                                    <button
                                                        onClick={() => updateStatus(item.id, 'in_progress')}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                        title="Mulai"
                                                    >
                                                        <Clock className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {item.status === 'in_progress' && (
                                                    <button
                                                        onClick={() => updateStatus(item.id, 'completed')}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                        title="Selesai"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => startEdit(item)}
                                                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteItem(item.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="text-sm text-gray-500">Total Item</div>
                        <div className="text-2xl font-bold text-gray-900">{rundownItems.length}</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="text-sm text-gray-500">Menunggu</div>
                        <div className="text-2xl font-bold text-gray-600">
                            {rundownItems.filter(i => i.status === 'pending').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="text-sm text-gray-500">Sedang Berlangsung</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {rundownItems.filter(i => i.status === 'in_progress').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="text-sm text-gray-500">Selesai</div>
                        <div className="text-2xl font-bold text-green-600">
                            {rundownItems.filter(i => i.status === 'completed').length}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
