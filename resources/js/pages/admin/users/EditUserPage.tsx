import { router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';

interface Role {
    id: number;
    name: string;
    display_name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
    is_active: boolean;
}

interface Props {
    user: User;
    roles: Role[];
}

export default function EditUserPage({ user, roles }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        roles: user.roles,
        is_active: user.is_active,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`);
    };

    const toggleRole = (roleName: string) => {
        if (data.roles.includes(roleName)) {
            setData('roles', data.roles.filter((r) => r !== roleName));
        } else {
            setData('roles', [...data.roles, roleName]);
        }
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-3xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.visit('/admin/users')}
                        className="rounded-lg bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
                        <p className="mt-1 text-sm text-gray-600">Update user information and roles</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-900">Name</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                required
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-900">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                required
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-900">
                                Password <span className="font-normal text-gray-500">(Leave blank to keep current password)</span>
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        {/* Password Confirmation */}
                        {data.password && (
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-900">Confirm Password</label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>
                        )}

                        {/* Roles */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-900">Roles</label>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                {roles.map((role) => (
                                    <label
                                        key={role.id}
                                        className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                                            data.roles.includes(role.name)
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={data.roles.includes(role.name)}
                                            onChange={() => toggleRole(role.name)}
                                            className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
                                        />
                                        <span className="text-sm font-medium text-gray-900">{role.display_name}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.roles && <p className="mt-1 text-sm text-red-600">{errors.roles}</p>}
                        </div>

                        {/* Active Status */}
                        <div>
                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
                                />
                                <span className="text-sm font-semibold text-gray-900">Active User</span>
                            </label>
                            <p className="ml-8 mt-1 text-sm text-gray-500">Inactive users cannot log in to the system</p>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-3 border-t border-gray-200 pt-6">
                            <button
                                type="button"
                                onClick={() => router.visit('/admin/users')}
                                className="flex-1 rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                                disabled={processing}
                            >
                                <Save className="h-5 w-5" />
                                {processing ? 'Updating...' : 'Update User'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
