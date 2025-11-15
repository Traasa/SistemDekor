import React from 'react';
import { User } from '../../services/apiService';

interface UserTableProps {
    users: User[];
    isLoading: boolean;
    onEdit: (user: User) => void;
    onDelete: (userId: number) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ users, isLoading, onEdit, onDelete }) => {
    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'sales':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500"></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                <div className="mb-4 text-6xl">👥</div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Tidak ada data</h3>
                <p className="text-gray-600">Belum ada user yang terdaftar atau tidak ditemukan.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Terdaftar</th>
                            <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-pink-600 font-semibold text-white">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.email_verified_at ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Terverifikasi
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Belum Verifikasi
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                    {new Date(user.created_at).toLocaleDateString('id-ID', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                    <button onClick={() => onEdit(user)} className="text-gold-600 hover:text-gold-900 mr-3">
                                        Edit
                                    </button>
                                    <button onClick={() => onDelete(user.id)} className="text-red-600 hover:text-red-900">
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
