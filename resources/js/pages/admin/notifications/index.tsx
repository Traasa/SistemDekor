import { AdminLayout } from '../../../layouts/AdminLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCheck, Trash2, RefreshCw } from 'lucide-react';

interface Notification {
    id: number;
    type: 'order' | 'inventory' | 'system';
    title: string;
    message: string;
    link?: string;
    read: boolean;
    created_at: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'order' | 'inventory'>('all');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/notifications');
            if (response.data.success) {
                setNotifications(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await axios.post(`/api/notifications/${id}/read`);
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/api/notifications/read-all');
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const deleteNotification = async (id: number) => {
        if (!confirm('Yakin ingin menghapus notifikasi ini?')) return;
        
        try {
            await axios.delete(`/api/notifications/${id}`);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'order':
                return '📋';
            case 'inventory':
                return '📦';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (type: string, read: boolean) => {
        const baseColor = read ? 'bg-gray-50' : 'bg-white';
        const borderColor = read ? 'border-gray-200' : (() => {
            switch (type) {
                case 'order':
                    return 'border-blue-300';
                case 'inventory':
                    return 'border-orange-300';
                default:
                    return 'border-gray-300';
            }
        })();
        return `${baseColor} ${borderColor}`;
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        return n.type === filter;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchNotifications}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                        >
                            <RefreshCw className="h-5 w-5" />
                            Refresh
                        </button>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <CheckCheck className="h-5 w-5" />
                                Tandai Semua Dibaca
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6 bg-white rounded-lg border border-gray-200 p-1 flex gap-1">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                            filter === 'all' 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Semua ({notifications.length})
                    </button>
                    <button
                        onClick={() => setFilter('order')}
                        className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                            filter === 'order' 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        📋 Order ({notifications.filter(n => n.type === 'order').length})
                    </button>
                    <button
                        onClick={() => setFilter('inventory')}
                        className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                            filter === 'inventory' 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        📦 Inventory ({notifications.filter(n => n.type === 'inventory').length})
                    </button>
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">Tidak ada notifikasi</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`border rounded-lg transition-all hover:shadow-md ${getNotificationColor(notification.type, notification.read)}`}
                            >
                                <div className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="text-3xl flex-shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <h3 className={`font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                                        {notification.title}
                                                    </h3>
                                                    <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {new Date(notification.created_at).toLocaleString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></span>
                                                )}
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                {notification.link && (
                                                    <a
                                                        href={notification.link}
                                                        onClick={() => !notification.read && markAsRead(notification.id)}
                                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                    >
                                                        Lihat Detail →
                                                    </a>
                                                )}
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-sm text-gray-600 hover:text-gray-700"
                                                    >
                                                        Tandai Dibaca
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="text-sm text-red-600 hover:text-red-700 ml-auto"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
