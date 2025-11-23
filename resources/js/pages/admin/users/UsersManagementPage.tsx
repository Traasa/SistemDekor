import { router } from '@inertiajs/react';
import { CheckCircle, Edit, Plus, Shield, Trash2, Users, XCircle } from 'lucide-react';
import { useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    roles: string[];
    role_names: string;
    is_active: boolean;
    permissions_count: number;
    created_at: string;
}

interface Props {
    users: User[];
}

export default function UsersManagementPage({ users }: Props) {
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [filter, setFilter] = useState('all');

    const handleDelete = (id: number) => {
        router.delete(`/admin/users/${id}`, {
            onSuccess: () => setDeleteConfirm(null),
        });
    };

    const handleToggleStatus = (id: number) => {
        router.post(`/admin/users/${id}/toggle-status`);
    };

    const filteredUsers = users.filter((user) => {
        if (filter === 'all') return true;
        if (filter === 'active') return user.is_active;
        if (filter === 'inactive') return !user.is_active;
        return user.roles.includes(filter);
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="mt-1 text-sm text-gray-600">Manage users and assign roles ({users.length} total users)</p>
                    </div>
                    <button
                        onClick={() => router.visit('/admin/users/create')}
                        className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700"
                    >
                        <Plus className="h-5 w-5" />
                        Add User
                    </button>
                </div>

                {/* Filters */}
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap gap-2">
                        {['all', 'active', 'inactive', 'super_admin', 'admin', 'manager', 'staff', 'client'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                                    filter === f ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {f.replace('_', ' ').toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Users Table */}
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Roles</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Permissions</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="transition-colors hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-semibold text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.map((role, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700"
                                                    >
                                                        {role.replace('_', ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">{user.permissions_count} permissions</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleStatus(user.id)}
                                                className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                                    user.is_active
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                }`}
                                            >
                                                {user.is_active ? (
                                                    <>
                                                        <CheckCircle className="h-3 w-3" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-3 w-3" />
                                                        Inactive
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{user.created_at}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => router.visit(`/admin/users/${user.id}/edit`)}
                                                    className="rounded-lg bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200"
                                                    title="Edit User"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(user.id)}
                                                    className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="py-12 text-center">
                            <Users className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">No users found</h3>
                            <p className="text-gray-600">Try adjusting your filter</p>
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                        <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                            <h3 className="mb-2 text-xl font-bold text-gray-900">Delete User</h3>
                            <p className="mb-6 text-gray-600">Are you sure you want to delete this user? This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
