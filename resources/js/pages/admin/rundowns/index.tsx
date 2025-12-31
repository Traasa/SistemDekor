import { AdminLayout } from '../../../layouts/AdminLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X, Clock, AlertTriangle, Calendar, ListOrdered } from 'lucide-react';

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
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

interface Event {
    id: number;
    name: string;
}

export default function RundownsPage() {
    const [rundowns, setRundowns] = useState<RundownItem[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        order: '1',
        time: '',
        duration: '30',
        activity: '',
        description: '',
        pic: '',
        notes: '',
        equipment_needed: '',
        is_critical: false,
        status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get('/api/events');
            setEvents(response.data.data);
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
            // Ensure equipment_needed is always an array
            const parsedData = data.map((item: any) => ({
                ...item,
                equipment_needed: typeof item.equipment_needed === 'string' 
                    ? JSON.parse(item.equipment_needed) 
                    : (item.equipment_needed || [])
            }));
            setRundowns(parsedData);
        } catch (error) {
            console.error('Failed to fetch rundowns:', error);
            setRundowns([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedEvent) {
            fetchRundowns(selectedEvent);
        } else {
            setRundowns([]);
        }
    }, [selectedEvent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvent) {
            alert('Pilih event terlebih dahulu');
            return;
        }

        try {
            const submitData = {
                ...formData,
                order: parseInt(formData.order),
                duration: parseInt(formData.duration),
                equipment_needed: formData.equipment_needed 
                    ? formData.equipment_needed.split(',').map(item => item.trim()).filter(Boolean)
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
            alert('Rundown berhasil disimpan!');
        } catch (error) {
            console.error('Failed to save rundown:', error);
            alert('Gagal menyimpan rundown');
        }
    };

    const handleEdit = (rundown: RundownItem) => {
        setEditingId(rundown.id);
        setFormData({
            order: rundown.order.toString(),
            time: rundown.time?.split('T')[1]?.substring(0, 5) || '',
            duration: rundown.duration.toString(),
            activity: rundown.activity,
            description: rundown.description || '',
            pic: rundown.pic || '',
            notes: rundown.notes || '',
            equipment_needed: Array.isArray(rundown.equipment_needed) 
                ? rundown.equipment_needed.join(', ') 
                : '',
            is_critical: rundown.is_critical,
            status: rundown.status,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus item rundown ini?')) return;
        if (!selectedEvent) return;
        
        try {
            await axios.delete(`/api/events/${selectedEvent}/rundown/${id}`);
            fetchRundowns(selectedEvent);
            alert('Rundown berhasil dihapus');
        } catch (error) {
            console.error('Failed to delete rundown:', error);
            alert('Gagal menghapus rundown');
        }
    };

    const resetForm = () => {
        setFormData({
            order: '1',
            time: '',
            duration: '30',
            activity: '',
            description: '',
            pic: '',
            notes: '',
            equipment_needed: '',
            is_critical: false,
            status: 'pending',
        });
        setEditingId(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-gray-100 text-gray-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Selesai';
            case 'in_progress': return 'Sedang Berlangsung';
            case 'pending': return 'Menunggu';
            case 'cancelled': return 'Dibatalkan';
            default: return status;
        }
    };

    const formatTime = (timeString: string | null) => {
        if (!timeString) return '-';
        try {
            const date = new Date(timeString);
            return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return timeString;
        }
    };

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Event Rundown Management</h1>
                        <p className="mt-1 text-sm text-gray-500">Kelola rundown acara sedang dalam pengembangan</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        disabled={!selectedEvent}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:bg-gray-400"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah Item Rundown
                    </button>
                </div>

                <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Event</label>
                    <select
                        value={selectedEvent || ''}
                        onChange={(e) => setSelectedEvent(e.target.value ? Number(e.target.value) : null)}
                        className="w-full md:w-96 px-3 py-2 border rounded-lg"
                    >
                        <option value="">-- Pilih Event --</option>
                        {events.map(event => (
                            <option key={event.id} value={event.id}>{event.name}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    </div>
                ) : selectedEvent ? (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urutan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktivitas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durasi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PIC</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {!rundowns || rundowns.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            Belum ada rundown untuk event ini
                                        </td>
                                    </tr>
                                ) : (
                                    rundowns.map((rundown) => (
                                        <tr key={rundown.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium text-gray-900">{rundown.order}</span>
                                                    {rundown.is_critical && (
                                                        <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatTime(rundown.time)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{rundown.activity}</div>
                                                {rundown.description && (
                                                    <div className="text-sm text-gray-500">{rundown.description.substring(0, 50)}...</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {rundown.duration} menit
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {rundown.pic || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rundown.status)}`}>
                                                    {getStatusLabel(rundown.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button onClick={() => handleEdit(rundown)} className="text-blue-600 hover:text-blue-900 mr-3">
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => handleDelete(rundown.id)} className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
                        <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p>Pilih event terlebih dahulu untuk melihat rundown</p>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">{editingId ? 'Edit Rundown' : 'Tambah Rundown'}</h3>
                                <button onClick={() => { setShowModal(false); resetForm(); }}>
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Urutan *</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={formData.order}
                                            onChange={(e) => setFormData({...formData, order: e.target.value})}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Waktu *</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.time}
                                            onChange={(e) => setFormData({...formData, time: e.target.value})}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Durasi (menit) *</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Aktivitas *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.activity}
                                        onChange={(e) => setFormData({...formData, activity: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="Nama aktivitas"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">PIC (Person In Charge)</label>
                                    <input
                                        type="text"
                                        value={formData.pic}
                                        onChange={(e) => setFormData({...formData, pic: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="Nama penanggung jawab"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Peralatan yang Dibutuhkan</label>
                                    <input
                                        type="text"
                                        value={formData.equipment_needed}
                                        onChange={(e) => setFormData({...formData, equipment_needed: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="Pisahkan dengan koma, contoh: Mikrofon, Proyektor, Sound System"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                                    <select
                                        required
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="pending">Menunggu</option>
                                        <option value="in_progress">Sedang Berlangsung</option>
                                        <option value="completed">Selesai</option>
                                        <option value="cancelled">Dibatalkan</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
                                    <textarea
                                        rows={2}
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_critical}
                                        onChange={(e) => setFormData({...formData, is_critical: e.target.checked})}
                                        className="mr-2"
                                    />
                                    <label className="text-sm text-gray-700">Tandai sebagai item kritis</label>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => { setShowModal(false); resetForm(); }}
                                        className="px-4 py-2 border rounded-lg"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
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
