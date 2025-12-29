import { AdminLayout } from '../../../layouts/AdminLayout';
import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { Calendar, MapPin, Users, Clock, Search, Plus } from 'lucide-react';

interface Event {
    id: number;
    event_code: string;
    event_name: string;
    event_type: string;
    event_type_label: string;
    event_date: string;
    start_time: string;
    end_time: string;
    venue_name: string;
    guest_count: number;
    status: string;
    status_label: string;
    client: {
        name: string;
        phone: string;
    };
    order: {
        order_number: string;
    };
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
    });

    const fetchEvents = async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: pagination.per_page.toString(),
            });

            if (search) params.append('search', search);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (typeFilter !== 'all') params.append('event_type', typeFilter);

            const response = await axios.get(`/api/events?${params.toString()}`);
            setEvents(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                per_page: response.data.per_page,
                total: response.data.total,
            });
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [search, statusFilter, typeFilter]);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            planning: 'bg-gray-100 text-gray-800',
            confirmed: 'bg-blue-100 text-blue-800',
            preparation: 'bg-yellow-100 text-yellow-800',
            ongoing: 'bg-green-100 text-green-800',
            completed: 'bg-purple-100 text-purple-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            wedding: 'bg-pink-100 text-pink-800',
            birthday: 'bg-blue-100 text-blue-800',
            corporate: 'bg-indigo-100 text-indigo-800',
            engagement: 'bg-purple-100 text-purple-800',
            anniversary: 'bg-red-100 text-red-800',
            graduation: 'bg-green-100 text-green-800',
            other: 'bg-gray-100 text-gray-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        return new Date(timeString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Daftar Event</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Kelola semua event yang telah dikonfirmasi
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[300px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari event, venue, atau kode..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="all">Semua Status</option>
                        <option value="planning">Perencanaan</option>
                        <option value="confirmed">Terkonfirmasi</option>
                        <option value="preparation">Persiapan</option>
                        <option value="ongoing">Berlangsung</option>
                        <option value="completed">Selesai</option>
                        <option value="cancelled">Dibatalkan</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="all">Semua Jenis</option>
                        <option value="wedding">Pernikahan</option>
                        <option value="birthday">Ulang Tahun</option>
                        <option value="corporate">Corporate</option>
                        <option value="engagement">Lamaran</option>
                        <option value="anniversary">Anniversary</option>
                        <option value="graduation">Wisuda</option>
                        <option value="other">Lainnya</option>
                    </select>
                </div>

                {/* Stats */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="text-sm text-gray-500">Total Event</div>
                        <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="text-sm text-gray-500">Akan Datang</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {events.filter(e => ['confirmed', 'preparation'].includes(e.status)).length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="text-sm text-gray-500">Sedang Berlangsung</div>
                        <div className="text-2xl font-bold text-green-600">
                            {events.filter(e => e.status === 'ongoing').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="text-sm text-gray-500">Selesai Bulan Ini</div>
                        <div className="text-2xl font-bold text-purple-600">
                            {events.filter(e => e.status === 'completed').length}
                        </div>
                    </div>
                </div>

                {/* Events List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="mt-2 text-sm text-gray-500">Memuat event...</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada event</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Event akan otomatis dibuat ketika order dilunasi
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {events.map((event) => (
                            <Link
                                key={event.id}
                                href={`/admin/events/${event.id}/rundown`}
                                className="block bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {event.event_name}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(event.event_type)}`}>
                                                {event.event_type_label}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                                                {event.status_label}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500 mb-3">
                                            Kode: {event.event_code} • Order: {event.order.order_number}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-700">{formatDate(event.event_date)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-700">
                                                    {formatTime(event.start_time)} - {formatTime(event.end_time)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-700">{event.venue_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-700">
                                                    {event.guest_count || 0} tamu
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-3 text-sm text-gray-600">
                                            <strong>Client:</strong> {event.client.name} • {event.client.phone}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <button
                            onClick={() => fetchEvents(pagination.current_page - 1)}
                            disabled={pagination.current_page === 1}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sebelumnya
                        </button>
                        <span className="px-4 py-2 text-sm text-gray-700">
                            Halaman {pagination.current_page} dari {pagination.last_page}
                        </span>
                        <button
                            onClick={() => fetchEvents(pagination.current_page + 1)}
                            disabled={pagination.current_page === pagination.last_page}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Selanjutnya
                        </button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

