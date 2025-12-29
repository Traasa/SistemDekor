import { AdminLayout } from '../../../layouts/AdminLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, User, AlertCircle, CheckCircle, Clock, Filter, Plus } from 'lucide-react';

interface Task {
    id: number;
    task_name: string;
    description: string | null;
    deadline: string | null;
    priority: string;
    priority_label: string;
    status: string;
    status_label: string;
    event: {
        event_name: string;
        event_date: string;
    };
    user: {
        name: string;
    };
    rundown_item: {
        activity: string;
    } | null;
}

export default function TaskAssignmentPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');

    const fetchMyTasks = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/my-tasks');
            setTasks(response.data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const updateTaskStatus = async (taskId: number, newStatus: string) => {
        try {
            // Find task to get event_id
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            await axios.put(`/api/events/${task.event.event_date}/tasks/${taskId}`, {
                status: newStatus
            });
            fetchMyTasks();
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-blue-100 text-blue-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800',
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            assigned: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const filteredTasks = tasks.filter(task => {
        if (filterStatus !== 'all' && task.status !== filterStatus) return false;
        if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
        return true;
    });

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Tugas Saya</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Daftar tugas yang ditugaskan kepada Anda
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-6 flex gap-4">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="all">Semua Status</option>
                        <option value="assigned">Ditugaskan</option>
                        <option value="in_progress">Sedang Dikerjakan</option>
                        <option value="completed">Selesai</option>
                        <option value="cancelled">Dibatalkan</option>
                    </select>

                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="all">Semua Prioritas</option>
                        <option value="low">Rendah</option>
                        <option value="medium">Sedang</option>
                        <option value="high">Tinggi</option>
                        <option value="urgent">Mendesak</option>
                    </select>
                </div>

                {/* Stats */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="text-sm text-gray-500">Total Tugas</div>
                        <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="text-sm text-gray-500">Ditugaskan</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {tasks.filter(t => t.status === 'assigned').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="text-sm text-gray-500">Sedang Dikerjakan</div>
                        <div className="text-2xl font-bold text-yellow-600">
                            {tasks.filter(t => t.status === 'in_progress').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="text-sm text-gray-500">Selesai</div>
                        <div className="text-2xl font-bold text-green-600">
                            {tasks.filter(t => t.status === 'completed').length}
                        </div>
                    </div>
                </div>

                {/* Tasks List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="mt-2 text-sm text-gray-500">Memuat tugas...</p>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada tugas</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {filterStatus === 'all' 
                                ? 'Anda belum memiliki tugas yang ditugaskan'
                                : 'Tidak ada tugas dengan filter yang dipilih'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTasks.map((task) => (
                            <div
                                key={task.id}
                                className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {task.task_name}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                {task.priority_label}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                                {task.status_label}
                                            </span>
                                        </div>

                                        {task.description && (
                                            <p className="text-sm text-gray-600 mb-3">
                                                {task.description}
                                            </p>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <div className="text-gray-500">Event:</div>
                                                    <div className="font-medium text-gray-900">
                                                        {task.event.event_name}
                                                    </div>
                                                </div>
                                            </div>

                                            {task.deadline && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <div className="text-gray-500">Deadline:</div>
                                                        <div className="font-medium text-gray-900">
                                                            {formatDate(task.deadline)}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {task.rundown_item && (
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <div className="text-gray-500">Terkait:</div>
                                                        <div className="font-medium text-gray-900">
                                                            {task.rundown_item.activity}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ml-4 flex flex-col gap-2">
                                        {task.status === 'assigned' && (
                                            <button
                                                onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                            >
                                                Mulai Kerjakan
                                            </button>
                                        )}
                                        {task.status === 'in_progress' && (
                                            <button
                                                onClick={() => updateTaskStatus(task.id, 'completed')}
                                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                                            >
                                                Selesaikan
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
