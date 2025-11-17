import React, { useEffect, useState } from 'react';
import { UserFilters } from '../../components/admin/UserFilters';
import { UserModal } from '../../components/admin/UserModal';
import { UserStats } from '../../components/admin/UserStats';
import { UserTable } from '../../components/admin/UserTable';
import { AdminLayout } from '../../layouts/AdminLayout';
import { CreateUserData, User, userService } from '../../services/apiService';

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<CreateUserData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchUsers();
    }, [filterRole]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const params: any = {};
            if (filterRole !== 'all') params.role = filterRole;
            if (searchTerm) params.search = searchTerm;

            const response = await userService.getAll(params);
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            alert('Gagal memuat data user');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        fetchUsers();
    };

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                password_confirmation: '',
                role: user.role,
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                role: 'user',
            });
        }
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: 'user',
        });
        setFormErrors({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});

        // Validation
        const errors: Record<string, string> = {};
        if (!formData.name.trim()) errors.name = 'Nama wajib diisi';
        if (!formData.email.trim()) errors.email = 'Email wajib diisi';
        if (!editingUser && !formData.password) errors.password = 'Password wajib diisi';
        if (formData.password && formData.password !== formData.password_confirmation) {
            errors.password_confirmation = 'Password tidak cocok';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            if (editingUser) {
                const updateData: any = {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                };
                if (formData.password) {
                    updateData.password = formData.password;
                    updateData.password_confirmation = formData.password_confirmation;
                }
                await userService.update(editingUser.id, updateData);
                alert('User berhasil diupdate');
            } else {
                await userService.create(formData);
                alert('User berhasil ditambahkan');
            }
            handleCloseModal();
            fetchUsers();
        } catch (error: any) {
            console.error('Failed to save user:', error);
            if (error.response?.data?.errors) {
                setFormErrors(error.response.data.errors);
            } else {
                alert(error.response?.data?.message || 'Gagal menyimpan user');
            }
        }
    };

    const handleDelete = async (id: number) => {
        const user = users.find((u) => u.id === id);
        if (!user) return;
        if (!confirm(`Apakah Anda yakin ingin menghapus user "${user.name}"?`)) return;

        try {
            await userService.delete(id);
            alert('User berhasil dihapus');
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Gagal menghapus user');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manajemen User</h1>
                        <p className="mt-1 text-sm text-gray-600">Kelola semua user dan role mereka</p>
                    </div>
                </div>

                {/* Stats Component */}
                <UserStats users={users} />

                {/* Filters Component */}
                <UserFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterRole={filterRole}
                    setFilterRole={setFilterRole}
                    onSearch={handleSearch}
                    onAddNew={() => handleOpenModal()}
                />

                {/* Table Component */}
                <UserTable users={users} isLoading={isLoading} onEdit={handleOpenModal} onDelete={handleDelete} />

                {/* Modal Component */}
                <UserModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    editingUser={editingUser}
                    formData={formData}
                    setFormData={setFormData}
                    formErrors={formErrors}
                    onSubmit={handleSubmit}
                />
            </div>
        </AdminLayout>
    );
};

export default UsersPage;
