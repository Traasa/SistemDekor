import { AdminLayout } from '../../../layouts/AdminLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X, CheckCircle, Clock, AlertCircle, Calendar, User, FileText } from 'lucide-react';

interface TaskAssignment {
    id: number;
    event_id: number;
    rundown_item_id: number | null;
    user_id: number;
    task_name: string;
    description: string | null;
    deadline: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    notes: string | null;
    completed_at: string | null;
    event?: { id: number; name: string };
    user?: { id: number; name: string };
    rundown_item?: { id: number; activity: string };
}

interface Event {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<TaskAssignment[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        event_id: '',
        user_id: '',
        task_name: '',
        description: '',
        deadline: '',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
        status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
        notes: '',
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [eventsRes, usersRes] = await Promise.all([
                axios.get('/api/events'),
                axios.get('/api/users'),
            ]);
            setEvents(eventsRes.data.data);
            setUsers(usersRes.data.data);
        } catch (error) {
            console.error('Failed to fetch initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async (eventId: number) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/events/${eventId}/tasks`);
            setTasks(response.data.data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedEvent) {
            fetchTasks(selectedEvent);
        } else {
            setTasks([]);
        }
    }, [selectedEvent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvent) {
            alert('Pilih event terlebih dahulu');
            return;
        }

        try {
            if (editingId) {
                await axios.put(`/api/events/${selectedEvent}/tasks/${editingId}`, formData);
            } else {
                await axios.post(`/api/events/${selectedEvent}/tasks`, {
                    ...formData,
                    event_id: selectedEvent,
                });
            }
            
            setShowModal(false);
            resetForm();
            fetchTasks(selectedEvent);
            alert('Task berhasil disimpan!');
        } catch (error) {
            console.error('Failed to save task:', error);
            alert('Gagal menyimpan task');
        }
    };

    const handleEdit = (task: TaskAssignment) => {
        setEditingId(task.id);
        setFormData({
            event_id: task.event_id.toString(),
            user_id: task.user_id.toString(),
            task_name: task.task_name,
            description: task.description || '',
            deadline: task.deadline?.split('T')[0] || '',
            priority: task.priority,
            status: task.status,
            notes: task.notes || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus task ini?')) return;
        if (!selectedEvent) return;
        
        try {
            await axios.delete(`/api/events/${selectedEvent}/tasks/${id}`);
            fetchTasks(selectedEvent);
            alert('Task berhasil dihapus');
        } catch (error) {
            console.error('Failed to delete task:', error);
            alert('Gagal menghapus task');
        }
    };

    const resetForm = () => {
        setFormData({
            event_id: '',
            user_id: '',
            task_name: '',
            description: '',
            deadline: '',
            priority: 'medium',
            status: 'pending',
            notes: '',
        });
        setEditingId(null);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
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

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'Mendesak';
            case 'high': return 'Tinggi';
            case 'medium': return 'Sedang';
            case 'low': return 'Rendah';
            default: return priority;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Selesai';
            case 'in_progress': return 'Sedang Dikerjakan';
            case 'pending': return 'Menunggu';
            case 'cancelled': return 'Dibatalkan';
            default: return status;
        }
    };

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Task Assignment</h1>
                        <p className="mt-1 text-sm text-gray-500">Kelola penugasan task untuk event</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        disabled={!selectedEvent}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:bg-gray-400"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah Task
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PIC</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioritas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            Belum ada task untuk event ini
                                        </td>
                                    </tr>
                                ) : (
                                    tasks.map((task) => (
                                        <tr key={task.id}>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{task.task_name}</div>
                                                {task.description && (
                                                    <div className="text-sm text-gray-500">{task.description.substring(0, 60)}...</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {task.user?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {task.deadline ? new Date(task.deadline).toLocaleDateString('id-ID') : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                                                    {getPriorityLabel(task.priority)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                                                    {getStatusLabel(task.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button onClick={() => handleEdit(task)} className="text-blue-600 hover:text-blue-900 mr-3">
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => handleDelete(task.id)} className="text-red-600 hover:text-red-900">
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
                        <p>Pilih event terlebih dahulu untuk melihat task</p>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">{editingId ? 'Edit Task' : 'Tambah Task'}</h3>
                                <button onClick={() => { setShowModal(false); resetForm(); }}>
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Task *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.task_name}
                                        onChange={(e) => setFormData({...formData, task_name: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">PIC (User) *</label>
                                    <select
                                        required
                                        value={formData.user_id}
                                        onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="">-- Pilih User --</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Deadline *</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Prioritas *</label>
                                        <select
                                            required
                                            value={formData.priority}
                                            onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        >
                                            <option value="low">Rendah</option>
                                            <option value="medium">Sedang</option>
                                            <option value="high">Tinggi</option>
                                            <option value="urgent">Mendesak</option>
                                        </select>
                                    </div>
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
                                        <option value="in_progress">Sedang Dikerjakan</option>
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
