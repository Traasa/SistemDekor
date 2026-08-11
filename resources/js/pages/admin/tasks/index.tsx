import { AdminLayout } from '../../../layouts/AdminLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X, Calendar } from 'lucide-react';

interface ResourceRequirement {
    inventory_item_id: number;
    item_name: string;
    item_unit: string;
    requirement_type: 'equipment' | 'catering' | 'additional';
    quantity: number;
    notes?: string | null;
}

interface TaskAssignment {
    id: number;
    event_id: number;
    rundown_item_id: number | null;
    user_id: number;
    task_name: string;
    description: string | null;
    deadline: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
    notes: string | null;
    completed_at: string | null;
    resource_requirements?: ResourceRequirement[];
    user?: { id: number; name: string };
}

interface Event {
    id: number;
    event_name: string;
    event_code: string;
}

interface User {
    id: number;
    name: string;
}

interface InventoryItem {
    id: number;
    name: string;
    unit: string;
    quantity: number;
    category?: { id: number; name: string };
}

interface RequirementFormRow {
    inventory_item_id: string;
    requirement_type: 'equipment' | 'catering' | 'additional';
    quantity: string;
    notes: string;
}

const emptyRequirementRow: RequirementFormRow = {
    inventory_item_id: '',
    requirement_type: 'equipment',
    quantity: '1',
    notes: '',
};

export default function TasksPage() {
    const [tasks, setTasks] = useState<TaskAssignment[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
    const [requirements, setRequirements] = useState<RequirementFormRow[]>([emptyRequirementRow]);

    const [formData, setFormData] = useState({
        user_id: '',
        task_name: '',
        description: '',
        deadline: '',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
        status: 'assigned' as 'assigned' | 'in_progress' | 'completed' | 'cancelled',
        notes: '',
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedEvent) {
            fetchTasks(selectedEvent);
        } else {
            setTasks([]);
        }
    }, [selectedEvent]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [eventsRes, usersRes, inventoryRes] = await Promise.all([
                axios.get('/api/events'),
                axios.get('/api/users'),
                axios.get('/api/inventory-items'),
            ]);

            setEvents((eventsRes.data.data || []).map((event: any) => ({
                id: event.id,
                event_name: event.event_name,
                event_code: event.event_code,
            })));
            setUsers(usersRes.data.data || []);
            setInventoryItems(inventoryRes.data.data || []);
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
            setTasks(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const toPayloadRequirements = () => {
        return requirements
            .filter((row) => row.inventory_item_id && Number(row.quantity) > 0)
            .map((row) => ({
                inventory_item_id: Number(row.inventory_item_id),
                requirement_type: row.requirement_type,
                quantity: Number(row.quantity),
                notes: row.notes || null,
            }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvent) {
            await window.showAlert('Pilih event terlebih dahulu');
            return;
        }

        try {
            const payload = {
                ...formData,
                resource_requirements: toPayloadRequirements(),
            };

            if (editingId) {
                await axios.put(`/api/events/${selectedEvent}/tasks/${editingId}`, payload);
            } else {
                await axios.post(`/api/events/${selectedEvent}/tasks`, payload);
            }

            setShowModal(false);
            resetForm();
            fetchTasks(selectedEvent);
            await window.showAlert('Task berhasil disimpan');
        } catch (error: any) {
            await window.showAlert(error.response?.data?.message || 'Gagal menyimpan task');
        }
    };

    const handleEdit = async (task: TaskAssignment) => {
        setEditingId(task.id);
        setFormData({
            user_id: String(task.user_id),
            task_name: task.task_name,
            description: task.description || '',
            deadline: task.deadline ? task.deadline.split('T')[0] : '',
            priority: task.priority,
            status: task.status,
            notes: task.notes || '',
        });

        const existingRequirements = (task.resource_requirements || []).map((item) => ({
            inventory_item_id: String(item.inventory_item_id),
            requirement_type: item.requirement_type,
            quantity: String(item.quantity),
            notes: item.notes || '',
        }));

        setRequirements(existingRequirements.length > 0 ? existingRequirements : [emptyRequirementRow]);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!await window.showConfirm('Yakin ingin menghapus task ini?')) return;
        if (!selectedEvent) return;

        try {
            await axios.delete(`/api/events/${selectedEvent}/tasks/${id}`);
            fetchTasks(selectedEvent);
            await window.showAlert('Task berhasil dihapus');
        } catch (error) {
            await window.showAlert('Gagal menghapus task');
        }
    };

    const resetForm = () => {
        setFormData({
            user_id: '',
            task_name: '',
            description: '',
            deadline: '',
            priority: 'medium',
            status: 'assigned',
            notes: '',
        });
        setRequirements([emptyRequirementRow]);
        setEditingId(null);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-green-100 text-green-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'assigned':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-red-100 text-red-800';
        }
    };

    const getRequirementTypeLabel = (type: string) => {
        switch (type) {
            case 'equipment':
                return 'Barang';
            case 'catering':
                return 'Makanan/Catering';
            default:
                return 'Tambahan';
        }
    };

    const addRequirementRow = () => {
        setRequirements((prev) => [...prev, { ...emptyRequirementRow }]);
    };

    const removeRequirementRow = (index: number) => {
        setRequirements((prev) => {
            const next = prev.filter((_, idx) => idx !== index);
            return next.length === 0 ? [emptyRequirementRow] : next;
        });
    };

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Task Assignment Event</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Tugas event dengan daftar barang/catering/additional yang wajib berasal dari data inventaris.
                        </p>
                    </div>
                    <button
                        onClick={async () => setShowModal(true)}
                        disabled={!selectedEvent}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah Task
                    </button>
                </div>

                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Pilih Event</label>
                    <select
                        value={selectedEvent || ''}
                        onChange={(e) => setSelectedEvent(e.target.value ? Number(e.target.value) : null)}
                        className="w-full rounded-lg border px-3 py-2 md:w-96"
                    >
                        <option value="">-- Pilih Event --</option>
                        {events.map((event) => (
                            <option key={event.id} value={event.id}>
                                {event.event_code} - {event.event_name}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="py-12 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
                    </div>
                ) : selectedEvent ? (
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Task</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Kebutuhan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">PIC</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Deadline</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Prioritas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            Belum ada task untuk event ini
                                        </td>
                                    </tr>
                                ) : (
                                    tasks.map((task) => (
                                        <tr key={task.id}>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{task.task_name}</div>
                                                {task.description && <div className="text-sm text-gray-500">{task.description}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {(task.resource_requirements || []).length === 0 ? (
                                                    '-'
                                                ) : (
                                                    <div className="space-y-1">
                                                        {(task.resource_requirements || []).map((resource, idx) => (
                                                            <div key={`${task.id}-${idx}`} className="rounded bg-gray-50 px-2 py-1 text-xs">
                                                                {resource.item_name} ({resource.quantity} {resource.item_unit}) • {getRequirementTypeLabel(resource.requirement_type)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{task.user?.name || '-'}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {task.deadline ? new Date(task.deadline).toLocaleDateString('id-ID') : '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(task.status)}`}>{task.status}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                <button onClick={async () => handleEdit(task)} className="mr-3 text-blue-600 hover:text-blue-900">
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <button onClick={async () => handleDelete(task.id)} className="text-red-600 hover:text-red-900">
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
                    <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-gray-500">
                        <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <p>Pilih event terlebih dahulu untuk melihat task</p>
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="mx-4 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-bold">{editingId ? 'Edit Task' : 'Tambah Task'}</h3>
                                <button onClick={async () => { setShowModal(false); resetForm(); }}>
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Nama Task *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.task_name}
                                        onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                                        className="w-full rounded-lg border px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Deskripsi</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full rounded-lg border px-3 py-2"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">PIC (User) *</label>
                                        <select
                                            required
                                            value={formData.user_id}
                                            onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                                            className="w-full rounded-lg border px-3 py-2"
                                        >
                                            <option value="">-- Pilih User --</option>
                                            {users.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Deadline</label>
                                        <input
                                            type="date"
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                            className="w-full rounded-lg border px-3 py-2"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Prioritas *</label>
                                        <select
                                            required
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                            className="w-full rounded-lg border px-3 py-2"
                                        >
                                            <option value="low">Rendah</option>
                                            <option value="medium">Sedang</option>
                                            <option value="high">Tinggi</option>
                                            <option value="urgent">Mendesak</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Status *</label>
                                        <select
                                            required
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                            className="w-full rounded-lg border px-3 py-2"
                                        >
                                            <option value="assigned">Assigned</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Catatan Task</label>
                                    <textarea
                                        rows={2}
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full rounded-lg border px-3 py-2"
                                    />
                                </div>

                                <div className="rounded-lg border border-gray-200 p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h4 className="text-sm font-semibold text-gray-800">Daftar Barang/Makanan/Tambahan (dari Inventaris)</h4>
                                        <button
                                            type="button"
                                            onClick={addRequirementRow}
                                            className="rounded bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                                        >
                                            + Tambah Item
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {requirements.map((row, index) => (
                                            <div key={`req-${index}`} className="grid grid-cols-1 gap-2 rounded border border-gray-100 p-3 md:grid-cols-12">
                                                <select
                                                    value={row.inventory_item_id}
                                                    onChange={(e) => {
                                                        const next = [...requirements];
                                                        next[index].inventory_item_id = e.target.value;
                                                        setRequirements(next);
                                                    }}
                                                    className="rounded border px-2 py-1 text-sm md:col-span-4"
                                                >
                                                    <option value="">-- Pilih item inventaris --</option>
                                                    {inventoryItems.map((item) => (
                                                        <option key={item.id} value={item.id}>
                                                            {item.name} (stok: {item.quantity} {item.unit})
                                                        </option>
                                                    ))}
                                                </select>

                                                <select
                                                    value={row.requirement_type}
                                                    onChange={(e) => {
                                                        const next = [...requirements];
                                                        next[index].requirement_type = e.target.value as RequirementFormRow['requirement_type'];
                                                        setRequirements(next);
                                                    }}
                                                    className="rounded border px-2 py-1 text-sm md:col-span-3"
                                                >
                                                    <option value="equipment">Barang</option>
                                                    <option value="catering">Makanan/Catering</option>
                                                    <option value="additional">Tambahan</option>
                                                </select>

                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={row.quantity}
                                                    onChange={(e) => {
                                                        const next = [...requirements];
                                                        next[index].quantity = e.target.value;
                                                        setRequirements(next);
                                                    }}
                                                    className="rounded border px-2 py-1 text-sm md:col-span-2"
                                                    placeholder="Qty"
                                                />

                                                <input
                                                    value={row.notes}
                                                    onChange={(e) => {
                                                        const next = [...requirements];
                                                        next[index].notes = e.target.value;
                                                        setRequirements(next);
                                                    }}
                                                    className="rounded border px-2 py-1 text-sm md:col-span-2"
                                                    placeholder="Catatan"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={async () => removeRequirementRow(index)}
                                                    className="rounded border border-red-200 bg-red-50 px-2 py-1 text-red-600 hover:bg-red-100 md:col-span-1"
                                                >
                                                    <Trash2 className="mx-auto h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={async () => { setShowModal(false); resetForm(); }}
                                        className="rounded-lg border px-4 py-2"
                                    >
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
