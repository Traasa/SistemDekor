import { router, useForm } from '@inertiajs/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';

interface Permission {
    id: number;
    name: string;
    display_name: string;
}

interface PermissionGroup {
    group: string;
    permissions: Permission[];
}

interface RoleData {
    id: number;
    name: string;
    display_name: string;
    permissions: string[];
}

interface Props {
    role: RoleData;
    permissions: PermissionGroup[];
}

export default function EditRolePage({ role, permissions }: Props) {
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        permissions: role.permissions,
    });

    const toggleGroup = (group: string) => {
        if (expandedGroups.includes(group)) {
            setExpandedGroups(expandedGroups.filter((g) => g !== group));
        } else {
            setExpandedGroups([...expandedGroups, group]);
        }
    };

    const togglePermission = (permName: string) => {
        if (data.permissions.includes(permName)) {
            setData(
                'permissions',
                data.permissions.filter((p) => p !== permName),
            );
        } else {
            setData('permissions', [...data.permissions, permName]);
        }
    };

    const toggleAllInGroup = (group: PermissionGroup) => {
        const groupPermNames = group.permissions.map((p) => p.name);
        const allSelected = groupPermNames.every((name) => data.permissions.includes(name));

        if (allSelected) {
            setData(
                'permissions',
                data.permissions.filter((p) => !groupPermNames.includes(p)),
            );
        } else {
            const newPerms = [...data.permissions];
            groupPermNames.forEach((name) => {
                if (!newPerms.includes(name)) {
                    newPerms.push(name);
                }
            });
            setData('permissions', newPerms);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/roles/${role.id}`);
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div>
                    <button onClick={() => router.visit('/admin/roles')} className="mb-2 text-gray-600 hover:text-gray-900">
                        ← Back to Roles
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Role: {role.display_name}</h1>
                    <p className="mt-1 text-sm text-gray-600">Update role name and permissions</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Role Name */}
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Role Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={role.name === 'super_admin'}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                        />
                        {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                        {role.name === 'super_admin' && <p className="mt-2 text-xs text-gray-500">Super admin role name cannot be changed</p>}
                    </div>

                    {/* Permissions */}
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="mb-4">
                            <h3 className="mb-1 text-lg font-bold text-gray-900">Permissions</h3>
                            <p className="text-sm text-gray-600">Update permissions for this role ({data.permissions.length} selected)</p>
                        </div>

                        {errors.permissions && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{errors.permissions}</div>
                        )}

                        <div className="space-y-3">
                            {permissions.map((group) => {
                                const isExpanded = expandedGroups.includes(group.group);
                                const groupPermNames = group.permissions.map((p) => p.name);
                                const selectedCount = groupPermNames.filter((name) => data.permissions.includes(name)).length;
                                const allSelected = selectedCount === group.permissions.length;

                                return (
                                    <div key={group.group} className="rounded-lg border border-gray-200">
                                        <div
                                            className="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50"
                                            onClick={() => toggleGroup(group.group)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={allSelected}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        toggleAllInGroup(group);
                                                    }}
                                                    className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500"
                                                />
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{group.group}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        {selectedCount}/{group.permissions.length} selected
                                                    </p>
                                                </div>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronUp className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-gray-400" />
                                            )}
                                        </div>

                                        {isExpanded && (
                                            <div className="space-y-2 border-t border-gray-100 p-4 pt-0">
                                                {group.permissions.map((perm) => (
                                                    <label
                                                        key={perm.id}
                                                        className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-purple-50"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={data.permissions.includes(perm.name)}
                                                            onChange={() => togglePermission(perm.name)}
                                                            className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500"
                                                        />
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-900">{perm.display_name}</span>
                                                            <p className="text-xs text-gray-500">{perm.name}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => router.visit('/admin/roles')}
                            className="flex-1 rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700 disabled:bg-gray-400"
                        >
                            {processing ? 'Updating...' : 'Update Role'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
