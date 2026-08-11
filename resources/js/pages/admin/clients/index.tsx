import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Plus, Edit, Trash2, Users, Mail, Phone, MapPin, Search, ShoppingBag } from 'lucide-react';
import axios from 'axios';

interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    orders_count: number;
    created_at: string;
}

interface ClientTestimonial {
    id: number;
    rating: number;
    testimonial: string;
    event_type?: string | null;
    is_featured?: boolean;
}

interface Stats {
    total_clients: number;
    total_orders: number;
    clients_with_orders: number;
    clients_without_orders: number;
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [stats, setStats] = useState<Stats>({
        total_clients: 0,
        total_orders: 0,
        clients_with_orders: 0,
        clients_without_orders: 0,
    });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [testimonial, setTestimonial] = useState<ClientTestimonial | null>(null);
    const [testimonialForm, setTestimonialForm] = useState({
        rating: 5,
        testimonial: '',
        event_type: '',
        is_featured: true,
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    const [formErrors, setFormErrors] = useState<any>({});

    useEffect(() => {
        fetchClients();
        fetchStats();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/clients-list', {
                params: { search: searchTerm },
            });
            setClients(response.data.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/admin/clients-stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});

        try {
            let clientId = selectedClient?.id || null;
            if (selectedClient) {
                await axios.put(`/api/admin/clients/${selectedClient.id}`, formData);
                clientId = selectedClient.id;
                await window.showAlert('Client berhasil diupdate!');
            } else {
                const response = await axios.post('/api/admin/clients', formData);
                clientId = response.data?.client?.id || null;
                await window.showAlert('Client berhasil ditambahkan!');
            }

            if (clientId && testimonialForm.testimonial.trim()) {
                await axios.put(`/api/admin/clients/${clientId}/testimonial`, testimonialForm);
            }
            setShowModal(false);
            resetForm();
            fetchClients();
            fetchStats();
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setFormErrors(error.response.data.errors);
            } else {
                await window.showAlert(error.response?.data?.message || 'Error saving client');
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (!await window.showConfirm('Apakah Anda yakin ingin menghapus client ini?')) return;

        try {
            await axios.delete(`/api/admin/clients/${id}`);
            await window.showAlert('Client berhasil dihapus!');
            fetchClients();
            fetchStats();
        } catch (error: any) {
            await window.showAlert(error.response?.data?.message || 'Error deleting client');
        }
    };

    const handleEdit = async (client: Client) => {
        setSelectedClient(client);
        setFormData({
            name: client.name,
            email: client.email,
            phone: client.phone,
            address: client.address || '',
        });
        loadTestimonial(client.id);
        setShowModal(true);
    };

    const loadTestimonial = async (clientId: number) => {
        try {
            const response = await axios.get(`/api/admin/clients/${clientId}/testimonial`);
            const data = response.data?.data || null;
            setTestimonial(data);
            setTestimonialForm({
                rating: data?.rating || 5,
                testimonial: data?.testimonial || '',
                event_type: data?.event_type || '',
                is_featured: data?.is_featured ?? true,
            });
        } catch (error) {
            console.error('Failed to load testimonial', error);
            setTestimonial(null);
            setTestimonialForm({
                rating: 5,
                testimonial: '',
                event_type: '',
                is_featured: true,
            });
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
        });
        setSelectedClient(null);
        setFormErrors({});
        setTestimonial(null);
        setTestimonialForm({
            rating: 5,
            testimonial: '',
            event_type: '',
            is_featured: true,
        });
    };

    const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            fetchClients();
        }
    };

    return (
        <AdminLayout>
            <Head title="Daftar Client" />
            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Daftar Client</h1>
                        <p className="text-gray-600 mt-1">Kelola data client</p>
                    </div>
                    <button
                        onClick={async () => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah Client
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Client</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_clients}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Order</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_orders}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Client dengan Order</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.clients_with_orders}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Client tanpa Order</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.clients_without_orders}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Cari client berdasarkan nama, email, atau telepon..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleSearch}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Clients Table */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Memuat data...</p>
                    </div>
                ) : clients.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada client</h3>
                        <p className="text-gray-600 mb-4">Tambahkan client pertama Anda</p>
                        <button
                            onClick={async () => {
                                resetForm();
                                setShowModal(true);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Tambah Client
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Client
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kontak
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Alamat
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Order
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Terdaftar
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                        {client.name.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{client.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span>{client.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span>{client.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {client.address ? (
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                                        <span className="line-clamp-2">{client.address}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span
                                                className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                                                    client.orders_count > 0
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {client.orders_count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(client.created_at).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={async () => handleEdit(client)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                <Edit className="w-5 h-5 inline" />
                                            </button>
                                            <button
                                                onClick={async () => handleDelete(client.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="w-5 h-5 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    {selectedClient ? 'Edit Client' : 'Tambah Client Baru'}
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Lengkap <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                formErrors.name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            required
                                        />
                                        {formErrors.name && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.name[0]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                formErrors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            required
                                        />
                                        {formErrors.email && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.email[0]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nomor Telepon <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                formErrors.phone ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            required
                                        />
                                        {formErrors.phone && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.phone[0]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Alamat
                                        </label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="border-t border-gray-200 pt-4">
                                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Review Client</h3>
                                        <div className="grid gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                                <select
                                                    value={testimonialForm.rating}
                                                    onChange={(e) =>
                                                        setTestimonialForm((prev) => ({ ...prev, rating: Number(e.target.value) }))
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                >
                                                    {[5, 4, 3, 2, 1].map((value) => (
                                                        <option key={value} value={value}>
                                                            {value} Bintang
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Event</label>
                                                <input
                                                    type="text"
                                                    value={testimonialForm.event_type}
                                                    onChange={(e) =>
                                                        setTestimonialForm((prev) => ({ ...prev, event_type: e.target.value }))
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                                                <textarea
                                                    value={testimonialForm.testimonial}
                                                    onChange={(e) =>
                                                        setTestimonialForm((prev) => ({ ...prev, testimonial: e.target.value }))
                                                    }
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                />
                                            </div>
                                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    checked={testimonialForm.is_featured}
                                                    onChange={(e) =>
                                                        setTestimonialForm((prev) => ({ ...prev, is_featured: e.target.checked }))
                                                    }
                                                />
                                                Tampilkan di landing page
                                            </label>
                                            {testimonial && (
                                                <p className="text-xs text-gray-500">Review terakhir diperbarui sebelumnya.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                setShowModal(false);
                                                resetForm();
                                            }}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                        >
                                            {selectedClient ? 'Update' : 'Simpan'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
