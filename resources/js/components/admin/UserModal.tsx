import React from 'react';
import { CreateUserData, User } from '../../services/apiService';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingUser: User | null;
    formData: CreateUserData;
    setFormData: (data: CreateUserData) => void;
    formErrors: Record<string, string>;
    onSubmit: (e: React.FormEvent) => void;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, editingUser, formData, setFormData, formErrors, onSubmit }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">{editingUser ? 'Edit User' : 'Tambah User Baru'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Nama</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none"
                        />
                        {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none"
                        />
                        {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Password {editingUser && '(Kosongkan jika tidak ingin mengubah)'}
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none"
                        />
                        {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Konfirmasi Password</label>
                        <input
                            type="password"
                            value={formData.password_confirmation}
                            onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'sales' | 'user' })}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none"
                        >
                            <option value="user">User</option>
                            <option value="sales">Sales</option>
                            <option value="admin">Admin</option>
                        </select>
                        {formErrors.role && <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button type="submit" className="rounded-lg bg-pink-500 px-4 py-2 font-medium text-white hover:bg-pink-600">
                            {editingUser ? 'Update' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
