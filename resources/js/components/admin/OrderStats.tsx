import React from 'react';
import { Order } from '../../services/apiService';

interface OrderStatsProps {
    orders: Order[];
}

export const OrderStats: React.FC<OrderStatsProps> = ({ orders }) => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const completedOrders = orders.filter((o) => o.status === 'completed').length;
    const totalRevenue = orders.filter((o) => o.status === 'completed').reduce((sum, o) => sum + parseFloat(o.total_price.toString()), 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-100">Total Orders</p>
                        <p className="mt-2 text-3xl font-bold text-white">{totalOrders}</p>
                    </div>
                    <div className="rounded-full bg-white/20 p-3">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-yellow-100">Pending</p>
                        <p className="mt-2 text-3xl font-bold text-white">{pendingOrders}</p>
                    </div>
                    <div className="rounded-full bg-white/20 p-3">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-green-100">Completed</p>
                        <p className="mt-2 text-3xl font-bold text-white">{completedOrders}</p>
                    </div>
                    <div className="rounded-full bg-white/20 p-3">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-pink-100">Total Revenue</p>
                        <p className="mt-2 text-xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="rounded-full bg-white/20 p-3">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};
