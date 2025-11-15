import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Transaction, transactionService } from '../../services/transactionService';

export const MyTransactionsPage: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const { user, logout } = useAuth();

    useEffect(() => {
        fetchTransactions();
    }, [filter, searchTerm]);

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (filter !== 'all') {
                params.status = filter;
            }
            if (searchTerm) {
                params.search = searchTerm;
            }

            const response = await transactionService.getTransactions(params);
            if (response.success) {
                setTransactions(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            setError('Failed to load transactions');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportPdf = async (transactionId: number, transactionNumber: string) => {
        try {
            const blob = await transactionService.exportPdf(transactionId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `transaction-${transactionNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export PDF:', error);
            setError('Failed to export PDF');
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const filteredTransactions = transactions.filter((transaction) => {
        if (filter !== 'all' && transaction.status !== filter) return false;
        if (
            searchTerm &&
            !transaction.transaction_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !transaction.client_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
            return false;
        return true;
    });

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading transactions...</p>
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
                            <h1 className="text-3xl font-bold text-gray-900">My Transactions</h1>
                        </div>
                        <nav className="flex items-center space-x-4">
                            <Link to="/" className="text-gray-700 hover:text-blue-600">
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

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {error && <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-600">{error}</div>}

                {/* Filters */}
                <div className="mb-6 rounded-lg bg-white p-4 shadow">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="flex-1">
                            <label htmlFor="search" className="mb-1 block text-sm font-medium text-gray-700">
                                Search Transactions
                            </label>
                            <input
                                type="text"
                                id="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by transaction number or client name..."
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="filter" className="mb-1 block text-sm font-medium text-gray-700">
                                Filter by Status
                            </label>
                            <select
                                id="filter"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="selesai">Selesai</option>
                                <option value="dibatalkan">Dibatalkan</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Transactions List */}
                {filteredTransactions.length === 0 ? (
                    <div className="rounded-lg bg-white p-8 text-center shadow">
                        <div className="text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || filter !== 'all'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : "You don't have any transactions yet."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredTransactions.map((transaction) => (
                            <div key={transaction.id} className="overflow-hidden rounded-lg bg-white shadow">
                                <div className="p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-blue-600">{transaction.transaction_number}</h3>
                                            <p className="text-sm text-gray-500">
                                                {new Date(transaction.transaction_date).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span
                                                className={`rounded-full px-3 py-1 text-sm font-medium ${
                                                    transaction.status === 'selesai'
                                                        ? 'bg-green-100 text-green-800'
                                                        : transaction.status === 'pending'
                                                          ? 'bg-yellow-100 text-yellow-800'
                                                          : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                            </span>
                                            <button
                                                onClick={() => handleExportPdf(transaction.id, transaction.transaction_number)}
                                                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                                            >
                                                Export PDF
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <h4 className="mb-2 text-sm font-medium text-gray-700">Transaction Details</h4>
                                            <div className="space-y-1 text-sm text-gray-600">
                                                <p>
                                                    <strong>Client:</strong> {transaction.client_name}
                                                </p>
                                                <p>
                                                    <strong>Total Price:</strong> Rp {transaction.total_price.toLocaleString('id-ID')}
                                                </p>
                                                <p>
                                                    <strong>Status:</strong> {transaction.status}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="mb-2 text-sm font-medium text-gray-700">Service Details</h4>
                                            <p className="line-clamp-3 text-sm text-gray-600">{transaction.service_detail}</p>
                                        </div>
                                    </div>

                                    {transaction.notes && (
                                        <div className="mt-4 border-t border-gray-200 pt-4">
                                            <h4 className="mb-2 text-sm font-medium text-gray-700">Notes</h4>
                                            <p className="text-sm text-gray-600">{transaction.notes}</p>
                                        </div>
                                    )}

                                    {/* Share Link */}
                                    <div className="mt-4 border-t border-gray-200 pt-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium text-gray-700">Share Transaction</h4>
                                            <button
                                                onClick={() => {
                                                    const shareUrl = `${window.location.origin}/transaction/${transaction.id}`;
                                                    navigator.clipboard.writeText(shareUrl);
                                                    alert('Share link copied to clipboard!');
                                                }}
                                                className="text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                Copy Share Link
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
