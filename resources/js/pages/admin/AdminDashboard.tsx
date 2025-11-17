import { Link, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { CompanyProfile, companyProfileService } from '../../services/companyProfileService';
import { Transaction, transactionService } from '../../services/transactionService';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'transactions' | 'profile'>('transactions');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [profile, setProfile] = useState<CompanyProfile | null>(null);
    const [users, setUsers] = useState<Array<{ id: number; name: string; email: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [error, setError] = useState('');

    const { auth } = usePage<{ auth: { user: { id: number; name: string; email: string; role: string } } }>().props;
    const user = auth?.user;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch transactions
            const transactionResponse = await transactionService.getTransactions();
            if (transactionResponse.success) {
                setTransactions(transactionResponse.data.data);
            }

            // Fetch users for transaction assignment
            const usersResponse = await transactionService.getUsers();
            if (usersResponse.success) {
                setUsers(usersResponse.data);
            }

            // Fetch company profile
            const profileResponse = await companyProfileService.getProfile();
            if (profileResponse.success) {
                setProfile(profileResponse.data);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setError('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTransaction = async (id: number) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            try {
                await transactionService.deleteTransaction(id);
                await fetchData(); // Refresh data
            } catch (error) {
                console.error('Failed to delete transaction:', error);
                setError('Failed to delete transaction');
            }
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-6">
                        <div className="flex items-center">
                            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        </div>
                        <nav className="flex items-center space-x-4">
                            <Link href="/" className="text-gray-700 hover:text-blue-600">
                                Home
                            </Link>
                            <span className="text-gray-700">Welcome, {user?.name}</span>
                            <button onClick={handleLogout} className="text-gray-700 hover:text-red-600">
                                Logout
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('transactions')}
                            className={`border-b-2 px-1 py-2 text-sm font-medium ${
                                activeTab === 'transactions'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            Transaction Management
                        </button>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`border-b-2 px-1 py-2 text-sm font-medium ${
                                activeTab === 'profile'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            Company Profile
                        </button>
                    </nav>
                </div>

                {error && <div className="mt-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-600">{error}</div>}

                {/* Transaction Management Tab */}
                {activeTab === 'transactions' && (
                    <div className="mt-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                                Create New Transaction
                            </button>
                        </div>

                        <div className="overflow-hidden bg-white shadow sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {transactions.map((transaction) => (
                                    <li key={transaction.id}>
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="truncate text-sm font-medium text-blue-600">{transaction.transaction_number}</p>
                                                        <div className="ml-2 flex flex-shrink-0">
                                                            <p
                                                                className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                                                                    transaction.status === 'selesai'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : transaction.status === 'pending'
                                                                          ? 'bg-yellow-100 text-yellow-800'
                                                                          : 'bg-red-100 text-red-800'
                                                                }`}
                                                            >
                                                                {transaction.status}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 sm:flex sm:justify-between">
                                                        <div className="sm:flex">
                                                            <p className="flex items-center text-sm text-gray-500">
                                                                Client: {transaction.client_name}
                                                            </p>
                                                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                                User: {transaction.user.name}
                                                            </p>
                                                        </div>
                                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                            <p>Rp {transaction.total_price.toLocaleString('id-ID')}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ml-4 flex space-x-2">
                                                    <button
                                                        onClick={() => setEditingTransaction(transaction)}
                                                        className="text-sm text-blue-600 hover:text-blue-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTransaction(transaction.id)}
                                                        className="text-sm text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Company Profile Tab */}
                {activeTab === 'profile' && profile && (
                    <div className="mt-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Company Profile</h2>
                            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Edit Profile</button>
                        </div>

                        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{profile.company_name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{profile.email}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{profile.phone}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Website</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{profile.website}</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">About</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{profile.about}</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Services</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            <ul className="list-inside list-disc">
                                                {profile.services.map((service, index) => (
                                                    <li key={index}>{service}</li>
                                                ))}
                                            </ul>
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Transaction Modal */}
            {(showCreateModal || editingTransaction) && (
                <TransactionModal
                    transaction={editingTransaction}
                    users={users}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingTransaction(null);
                    }}
                    onSuccess={() => {
                        fetchData();
                        setShowCreateModal(false);
                        setEditingTransaction(null);
                    }}
                />
            )}
        </div>
    );
};

// Transaction Modal Component
interface TransactionModalProps {
    transaction?: Transaction | null;
    users: Array<{ id: number; name: string; email: string }>;
    onClose: () => void;
    onSuccess: () => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ transaction, users, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        user_id: transaction?.user_id || '',
        client_name: transaction?.client_name || '',
        service_detail: transaction?.service_detail || '',
        transaction_date: transaction?.transaction_date || '',
        total_price: transaction?.total_price || '',
        status: transaction?.status || 'pending',
        notes: transaction?.notes || '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (transaction) {
                await transactionService.updateTransaction(transaction.id, {
                    ...formData,
                    user_id: Number(formData.user_id),
                    total_price: Number(formData.total_price),
                });
            } else {
                await transactionService.createTransaction({
                    ...formData,
                    user_id: Number(formData.user_id),
                    total_price: Number(formData.total_price),
                });
            }
            onSuccess();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Operation failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
            <div className="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
                <div className="mt-3">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">{transaction ? 'Edit Transaction' : 'Create New Transaction'}</h3>

                    {error && <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-600">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">User</label>
                            <select
                                name="user_id"
                                value={formData.user_id}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="">Select User</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Client Name</label>
                            <input
                                type="text"
                                name="client_name"
                                value={formData.client_name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Service Detail</label>
                            <textarea
                                name="service_detail"
                                value={formData.service_detail}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Transaction Date</label>
                            <input
                                type="date"
                                name="transaction_date"
                                value={formData.transaction_date}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Total Price</label>
                            <input
                                type="number"
                                name="total_price"
                                value={formData.total_price}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="pending">Pending</option>
                                <option value="selesai">Selesai</option>
                                <option value="dibatalkan">Dibatalkan</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={2}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isLoading ? 'Saving...' : transaction ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
