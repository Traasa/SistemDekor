import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
    loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color, loading = false }) => {
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        purple: 'bg-purple-500',
        red: 'bg-red-500',
    };

    const bgColorClasses = {
        blue: 'bg-blue-50',
        green: 'bg-green-50',
        yellow: 'bg-yellow-50',
        purple: 'bg-purple-50',
        red: 'bg-red-50',
    };

    if (loading) {
        return (
            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="p-6">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                    <div className="mt-2 h-8 w-32 animate-pulse rounded bg-gray-200"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="group overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md">
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                        {trend && (
                            <div className="mt-2 flex items-center text-sm">
                                {trend.isPositive ? (
                                    <>
                                        <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                                        <span className="font-medium text-green-600">+{trend.value}%</span>
                                    </>
                                ) : trend.value === 0 ? (
                                    <>
                                        <Minus className="mr-1 h-4 w-4 text-gray-500" />
                                        <span className="font-medium text-gray-600">{trend.value}%</span>
                                    </>
                                ) : (
                                    <>
                                        <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                                        <span className="font-medium text-red-600">{trend.value}%</span>
                                    </>
                                )}
                                <span className="ml-1 text-gray-500">dari bulan lalu</span>
                            </div>
                        )}
                    </div>
                    <div
                        className={`flex h-14 w-14 items-center justify-center rounded-full ${bgColorClasses[color]} text-white transition-transform group-hover:scale-110`}
                    >
                        <div className={`${colorClasses[color]} rounded-full p-3`}>{icon}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
