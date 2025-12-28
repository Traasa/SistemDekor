import { Bell, CheckCheck, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface Notification {
    id: number;
    type: 'order' | 'payment' | 'user' | 'system';
    title: string;
    message: string;
    link?: string;
    read: boolean;
    created_at: string;
}

export const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            if (response.data.success) {
                setNotifications(response.data.data);
                setUnreadCount(response.data.data.filter((n: Notification) => !n.read).length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await api.post(`/notifications/${id}/read`);
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/notifications/read-all');
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            fetchNotifications(); // Refresh count
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'order':
                return '📋';
            case 'payment':
                return '💰';
            case 'user':
                return '👤';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'order':
                return 'bg-blue-50 border-blue-200';
            case 'payment':
                return 'bg-green-50 border-green-200';
            case 'user':
                return 'bg-purple-50 border-purple-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                    <div className="ring-opacity-5 absolute right-0 z-20 mt-2 w-96 rounded-lg bg-white shadow-xl ring-1 ring-black">
                        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                            <h3 className="text-lg font-semibold text-gray-900">Notifikasi</h3>
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="flex items-center text-sm text-[#D4AF37] hover:text-[#B8941F]">
                                    <CheckCheck className="mr-1 h-4 w-4" />
                                    Tandai Semua Dibaca
                                </button>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <Bell className="mx-auto h-12 w-12 text-gray-300" />
                                    <p className="mt-2 text-sm text-gray-500">Tidak ada notifikasi</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50 ${
                                            !notification.read ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <div className="flex items-start">
                                            <span className="mr-3 text-2xl">{getNotificationIcon(notification.type)}</span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                                                        <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                                                        <p className="mt-1 text-xs text-gray-400">
                                                            {new Date(notification.created_at).toLocaleString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteNotification(notification.id)}
                                                        className="ml-2 text-gray-400 hover:text-red-500"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                {notification.link && (
                                                    <a
                                                        href={notification.link}
                                                        className="mt-2 inline-block text-xs text-[#D4AF37] hover:text-[#B8941F]"
                                                    >
                                                        Lihat Detail →
                                                    </a>
                                                )}
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                                                    >
                                                        Tandai Dibaca
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="border-t border-gray-200 px-4 py-3 text-center">
                                <a href="/admin/notifications" className="text-sm text-[#D4AF37] hover:text-[#B8941F]">
                                    Lihat Semua Notifikasi
                                </a>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
