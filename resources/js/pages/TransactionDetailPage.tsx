import { Link } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { Transaction, transactionService } from '../services/transactionService';

const TransactionDetailPage: React.FC<{ transactionId: number }> = ({ transactionId }) => {
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (transactionId) {
            fetchTransaction(transactionId);
        }
    }, [transactionId]);

    const fetchTransaction = async (transactionId: number) => {
        setIsLoading(true);
        try {
            const response = await transactionService.getTransaction(transactionId);
            if (response.success) {
                setTransaction(response.data as Transaction);
            }
        } catch (error: any) {
            console.error('Failed to fetch transaction:', error);
            setError(error.response?.data?.message || 'Failed to load transaction');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportPdf = async () => {
        if (!transaction) return;

        try {
            const blob = await transactionService.exportPdf(transaction.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `transaction-${transaction.transaction_number}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export PDF:', error);
            setError('Failed to export PDF');
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading transaction...</p>
                </div>
            </div>
        );
    }

    if (error || !transaction) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-8 text-center shadow">
                        <div className="text-red-500">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.083 14.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Transaction Not Found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {error || 'The transaction you are looking for does not exist or you do not have permission to view it.'}
                            </p>
                            <div className="mt-6">
                                <Link href="/" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                    Go Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 overflow-hidden rounded-lg bg-white shadow">
                    <div className="bg-blue-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Transaction Details</h1>
                                <p className="text-blue-100">{transaction.transaction_number}</p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleExportPdf}
                                    className="rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-gray-50"
                                >
                                    Download PDF
                                </button>
                                <Link href="/" className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400">
                                    Back to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction Info */}
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium text-gray-900">Transaction Information</h2>
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
                        </div>
                    </div>

                    <div className="px-6 py-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Transaction Number</dt>
                                <dd className="mt-1 font-mono text-sm text-gray-900">{transaction.transaction_number}</dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Transaction Date</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {new Date(transaction.transaction_date).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Client Name</dt>
                                <dd className="mt-1 text-sm text-gray-900">{transaction.client_name}</dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Handled By</dt>
                                <dd className="mt-1 text-sm text-gray-900">{transaction.user.name}</dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Total Price</dt>
                                <dd className="mt-1 text-lg font-semibold text-gray-900">Rp {transaction.total_price.toLocaleString('id-ID')}</dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Status</dt>
                                <dd className="mt-1">
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                                            transaction.status === 'selesai'
                                                ? 'bg-green-100 text-green-800'
                                                : transaction.status === 'pending'
                                                  ? 'bg-yellow-100 text-yellow-800'
                                                  : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                    </span>
                                </dd>
                            </div>

                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Service Details</dt>
                                <dd className="mt-1 text-sm whitespace-pre-wrap text-gray-900">{transaction.service_detail}</dd>
                            </div>

                            {transaction.notes && (
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                                    <dd className="mt-1 text-sm whitespace-pre-wrap text-gray-900">{transaction.notes}</dd>
                                </div>
                            )}

                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-center space-x-4">
                    <button
                        onClick={() => {
                            const shareUrl = window.location.href;
                            navigator.clipboard.writeText(shareUrl);
                            alert('Share link copied to clipboard!');
                        }}
                        className="rounded-md bg-gray-600 px-6 py-2 text-white hover:bg-gray-700"
                    >
                        Copy Share Link
                    </button>
                    <button onClick={handleExportPdf} className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
                        Download PDF
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>SistemDekor - Professional Decoration Services</p>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailPage;
