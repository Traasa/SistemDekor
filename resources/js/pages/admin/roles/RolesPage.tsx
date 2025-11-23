import { router } from '@inertiajs/react';
import { Edit, Plus, Shield, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';

interface Permission {
    id: number;
    name: string;
    display_name: string;
}

interface Role {
    id: number;
    name: string;
    display_name: string;
    permissions_count: number;
    permissions: string[];
    users_count: number;
    created_at: string;
}

interface Props {
    roles: Role[];
}

export default function RolesPage({ roles }: Props) {
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        router.delete(`/admin/roles/${id}`, {
            onSuccess: () => setDeleteConfirm(null),
        });
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
                        <p className="mt-1 text-sm text-gray-600">Manage user roles and permissions</p>
                    </div>
                    <button
                        onClick={() => router.visit('/admin/roles/create')}
                        className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700"
                    >
                        <Plus className="h-5 w-5" />
                        Create Role
                    </button>
                </div>

                {/* Roles Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {roles.map((role) => (
                        <div key={role.id} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                                        <Shield className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{role.display_name}</h3>
                                        <p className="text-sm text-gray-500">{role.name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="mb-4 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Permissions</span>
                                    <span className="font-semibold text-purple-600">{role.permissions_count}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Users</span>
                                    <span className="font-semibold text-gray-900">{role.users_count}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Created</span>
                                    <span className="text-gray-900">{role.created_at}</span>
                                </div>
                            </div>

                            {/* Permissions Preview */}
                            <div className="mb-4">
                                <p className="mb-2 text-xs text-gray-500">Sample Permissions:</p>
                                <div className="flex flex-wrap gap-1">
                                    {role.permissions.slice(0, 3).map((perm, idx) => (
                                        <span key={idx} className="rounded bg-purple-50 px-2 py-1 text-xs text-purple-700">
                                            {perm}
                                        </span>
                                    ))}
                                    {role.permissions.length > 3 && (
                                        <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                            +{role.permissions.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => router.visit(`/admin/roles/${role.id}/edit`)}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </button>
                                {role.name !== 'super_admin' && (
                                    <button
                                        onClick={() => setDeleteConfirm(role.id)}
                                        className="rounded-lg bg-red-50 px-4 py-2 font-medium text-red-600 transition-colors hover:bg-red-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {roles.length === 0 && (
                    <div className="rounded-xl border border-gray-200 bg-white py-12 text-center">
                        <Shield className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">No roles found</h3>
                        <p className="mb-4 text-gray-600">Create your first role to get started</p>
                        <button
                            onClick={() => router.visit('/admin/roles/create')}
                            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
                        >
                            <Plus className="h-5 w-5" />
                            Create Role
                        </button>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                        <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                            <h3 className="mb-2 text-xl font-bold text-gray-900">Delete Role</h3>
                            <p className="mb-6 text-gray-600">Are you sure you want to delete this role? This action cannot be undone.</p>
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
