import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { Activity, Filter, Trash2, Eye, Calendar, User, Search, Download } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface ActivityLog {
    id: number;
    user: User | null;
    activity_type: string;
    description: string;
    subject_type: string | null;
    subject_id: number | null;
    properties: any;
    ip_address: string;
    user_agent: string;
    method: string;
    url: string;
    icon: string;
    color: string;
    created_at: string;
    created_at_human: string;
}

interface Props {
    activities: {
        data: ActivityLog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    users: User[];
    activityTypes: Record<string, string>;
    stats: {
        total_today: number;
        total_week: number;
        total_month: number;
        unique_users_today: number;
    };
    filters: {
        user_id?: number;
        activity_type?: string;
        start_date?: string;
        end_date?: string;
        search?: string;
    };
}

export default function UserActivityPage({ activities, users, activityTypes, stats, filters }: Props) {
    const [showFilters, setShowFilters] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [clearDays, setClearDays] = useState<number>(30);
    const [showClearModal, setShowClearModal] = useState(false);

    const [localFilters, setLocalFilters] = useState({
        user_id: filters.user_id || '',
        activity_type: filters.activity_type || '',
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        search: filters.search || '',
    });

    const handleFilter = () => {
        const params = Object.fromEntries(
            Object.entries(localFilters).filter(([_, value]) => value !== '')
        );
        router.get('/admin/user-activity', params, { preserveState: true });
    };

    const handleClearFilters = () => {
        setLocalFilters({
            user_id: '',
            activity_type: '',
            start_date: '',
            end_date: '',
            search: '',
        });
        router.get('/admin/user-activity');
    };

    const handleDelete = (id: number) => {
        router.delete(`/admin/user-activity/${id}`, {
            onSuccess: () => setDeleteConfirm(null),
        });
    };

    const handleClearLogs = () => {
        router.post('/admin/user-activity/clear', { days: clearDays }, {
            onSuccess: () => setShowClearModal(false),
        });
    };

    const getColorClass = (color: string) => {
        const colors: Record<string, string> = {
            green: 'bg-green-100 text-green-700',
            blue: 'bg-blue-100 text-blue-700',
            yellow: 'bg-yellow-100 text-yellow-700',
            red: 'bg-red-100 text-red-700',
            purple: 'bg-purple-100 text-purple-700',
            gray: 'bg-gray-100 text-gray-700',
            indigo: 'bg-indigo-100 text-indigo-700',
            cyan: 'bg-cyan-100 text-cyan-700',
        };
        return colors[color] || colors.gray;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Activity Logs</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Monitor all user activities and system events
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>
                        <button
                            onClick={() => setShowClearModal(true)}
                            className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 font-medium text-red-600 hover:bg-red-100 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear Old Logs
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-600 mb-1">Today</div>
                        <div className="text-3xl font-bold text-gray-900">{stats.total_today}</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-600 mb-1">This Week</div>
                        <div className="text-3xl font-bold text-gray-900">{stats.total_week}</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-600 mb-1">This Month</div>
                        <div className="text-3xl font-bold text-gray-900">{stats.total_month}</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-600 mb-1">Active Users Today</div>
                        <div className="text-3xl font-bold text-gray-900">{stats.unique_users_today}</div>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
                                <select
                                    value={localFilters.user_id}
                                    onChange={(e) => setLocalFilters({ ...localFilters, user_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="">All Users</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                                <select
                                    value={localFilters.activity_type}
                                    onChange={(e) => setLocalFilters({ ...localFilters, activity_type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="">All Types</option>
                                    {Object.entries(activityTypes).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                <input
                                    type="text"
                                    value={localFilters.search}
                                    onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                                    placeholder="Search description..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    value={localFilters.start_date}
                                    onChange={(e) => setLocalFilters({ ...localFilters, start_date: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={localFilters.end_date}
                                    onChange={(e) => setLocalFilters({ ...localFilters, end_date: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleFilter}
                                className="px-6 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={handleClearFilters}
                                className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Activities List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Activity</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">IP Address</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Time</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {activities.data.map((activity) => (
                                    <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl">{activity.icon}</span>
                                                <div>
                                                    <div className="font-medium text-gray-900">{activity.description}</div>
                                                    {activity.subject_type && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {activity.subject_type} #{activity.subject_id}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {activity.user?.name || 'System'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {activity.user?.email || 'system@example.com'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getColorClass(activity.color)}`}>
                                                {activity.activity_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 font-mono">{activity.ip_address}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">{activity.created_at_human}</div>
                                            <div className="text-xs text-gray-400">{activity.created_at}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => router.visit(`/admin/user-activity/${activity.id}`)}
                                                    className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(activity.id)}
                                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {activities.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing {activities.data.length} of {activities.total} activities
                            </div>
                            <div className="flex gap-2">
                                {Array.from({ length: activities.last_page }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => router.get(`/admin/user-activity?page=${page}`, filters)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            page === activities.current_page
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activities.data.length === 0 && (
                        <div className="text-center py-12">
                            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities found</h3>
                            <p className="text-gray-600">Try adjusting your filters</p>
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Activity Log</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this activity log? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 py-3 px-6 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 py-3 px-6 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Clear Logs Modal */}
                {showClearModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Clear Old Activity Logs</h3>
                            <p className="text-gray-600 mb-4">
                                Delete activity logs older than specified days.
                            </p>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Days to Keep</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={clearDays}
                                    onChange={(e) => setClearDays(parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Logs older than {clearDays} days will be permanently deleted
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowClearModal(false)}
                                    className="flex-1 py-3 px-6 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClearLogs}
                                    className="flex-1 py-3 px-6 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                                >
                                    Clear Logs
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
