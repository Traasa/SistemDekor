import React from 'react';
import { User } from '../../services/apiService';

interface UserStatsProps {
    users: User[];
}

export const UserStats: React.FC<UserStatsProps> = ({ users }) => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.email_verified_at).length;
    const adminSalesCount = users.filter((u) => u.role === 'admin' || u.role === 'sales').length;

    return (
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-pink-100">Total Users</p>
                        <p className="mt-2 text-3xl font-bold text-white">{totalUsers}</p>
                    </div>
                    <div className="rounded-full bg-white/20 p-3">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="from-gold-500 to-gold-600 rounded-xl bg-gradient-to-br p-6 shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gold-100 text-sm font-medium">Active Users</p>
                        <p className="mt-2 text-3xl font-bold text-white">{activeUsers}</p>
                    </div>
                    <div className="rounded-full bg-white/20 p-3">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-purple-100">Admin & Sales</p>
                        <p className="mt-2 text-3xl font-bold text-white">{adminSalesCount}</p>
                    </div>
                    <div className="rounded-full bg-white/20 p-3">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};
