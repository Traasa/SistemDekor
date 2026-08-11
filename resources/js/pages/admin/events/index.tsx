import { AdminLayout } from '../../../layouts/AdminLayout';
import { useEffect, useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { Calendar, MapPin, Users, Clock, Search, X, Plus, Save, Trash2 } from 'lucide-react';

interface EventOutlineItem {
    id: number;
    order: number;
    title: string;
    description: string | null;
    planned_time: string | null;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    is_default: boolean;
}

interface EventItem {
    id: number;
    source?: 'order' | 'mini';
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
    calendar_note?: string | null;
    client: {
        name: string;
        phone: string;
    };
    order?: {
        order_number: string;
    };
    event_outline_items?: EventOutlineItem[];
}

interface EventDetailResponse extends EventItem {
    notes?: string | null;
    special_requests?: string | null;
    event_outline_items: EventOutlineItem[];
}

const emptyNewOutline = {
    title: '',
    description: '',
    planned_time: '',
};

export default function EventsPage() {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedEvent, setSelectedEvent] = useState<EventDetailResponse | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [calendarNote, setCalendarNote] = useState('');
    const [newOutline, setNewOutline] = useState(emptyNewOutline);
    const [savingDetail, setSavingDetail] = useState(false);

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
            setEvents(response.data.data || []);
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

    const openEventDetail = async (eventId: number, source?: 'order' | 'mini') => {
        if (source === 'mini') {
            window.location.href = `/admin/mini-orders/${eventId}`;
            return;
        }
        try {
            const response = await axios.get(`/api/events/${eventId}`);
            const data: EventDetailResponse = response.data;
            setSelectedEvent(data);
            setCalendarNote(data.calendar_note || '');
            setShowDetailModal(true);
        } catch (error) {
            console.error('Failed to load event detail:', error);
            await window.showAlert('Gagal memuat detail event');
        }
    };

    const refreshSelectedEvent = async () => {
        if (!selectedEvent) return;
        const response = await axios.get(`/api/events/${selectedEvent.id}`);
        setSelectedEvent(response.data);
    };

    const saveCalendarNote = async () => {
        if (!selectedEvent) return;

        try {
            setSavingDetail(true);
            await axios.put(`/api/events/${selectedEvent.id}`, {
                calendar_note: calendarNote,
            });
            await refreshSelectedEvent();
            await fetchEvents(pagination.current_page);
            await window.showAlert('Catatan kalender event berhasil disimpan');
        } catch (error: any) {
            await window.showAlert(error.response?.data?.message || 'Gagal menyimpan catatan kalender');
        } finally {
            setSavingDetail(false);
        }
    };

    const addOutline = async () => {
        if (!selectedEvent) return;
        if (!newOutline.title.trim()) {
            await window.showAlert('Judul outline wajib diisi');
            return;
        }

        try {
            await axios.post(`/api/events/${selectedEvent.id}/outlines`, {
                title: newOutline.title,
                description: newOutline.description || null,
                planned_time: newOutline.planned_time || null,
            });
            setNewOutline(emptyNewOutline);
            await refreshSelectedEvent();
            await fetchEvents(pagination.current_page);
        } catch (error: any) {
            await window.showAlert(error.response?.data?.message || 'Gagal menambah outline');
        }
    };

    const updateOutline = async (outlineId: number, payload: Partial<EventOutlineItem>) => {
        if (!selectedEvent) return;

        try {
            await axios.put(`/api/events/${selectedEvent.id}/outlines/${outlineId}`, payload);
            await refreshSelectedEvent();
            await fetchEvents(pagination.current_page);
        } catch (error: any) {
            await window.showAlert(error.response?.data?.message || 'Gagal mengubah outline');
        }
    };

    const deleteOutline = async (outlineId: number) => {
        if (!selectedEvent) return;
        if (!await window.showConfirm('Hapus outline ini?')) return;

        try {
            await axios.delete(`/api/events/${selectedEvent.id}/outlines/${outlineId}`);
            await refreshSelectedEvent();
            await fetchEvents(pagination.current_page);
        } catch (error: any) {
            await window.showAlert(error.response?.data?.message || 'Gagal menghapus outline');
        }
    };

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
        if (!timeString) return '-';
        const normalized = timeString.length >= 5 ? timeString.substring(0, 5) : timeString;
        return normalized;
    };

    const outlinePreviewCount = useMemo(() => 3, []);

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Daftar Event</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Detail event (outline) otomatis tersedia dan dapat dikustomisasi terpisah dari rundown acara.
                        </p>
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap gap-4">
                    <div className="min-w-[300px] flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari event, venue, atau kode..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
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
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
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

                {loading ? (
                    <div className="py-12 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
                    </div>
                ) : events.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada event</h3>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {events.map((event) => (
                            <div key={event.id} className="rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-md">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-3">
                                            <h3 className="text-lg font-semibold text-gray-900">{event.event_name}</h3>
                                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(event.event_type)}`}>
                                                {event.event_type_label}
                                            </span>
                                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(event.status)}`}>
                                                {event.status_label}
                                            </span>
                                        </div>

                                        <div className="mb-3 text-sm text-gray-500">
                                            Kode: {event.event_code} • Order: {event.source === 'mini' ? event.event_code : event.order?.order_number}
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-700">{formatDate(event.event_date)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-700">{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-700">{event.venue_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-700">{event.guest_count || 0} tamu</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 rounded-lg bg-slate-50 p-3">
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Detail Event Outline (otomatis)</p>
                                            {event.source === 'mini' ? (
                                                <div className="text-sm text-slate-600">Mini order tidak memiliki outline event.</div>
                                            ) : (
                                                <>
                                                    <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
                                                        {(event.event_outline_items || []).slice(0, outlinePreviewCount).map((outline) => (
                                                            <li key={outline.id}>
                                                                {outline.title}
                                                                {outline.planned_time ? ` (${formatTime(outline.planned_time)})` : ''}
                                                            </li>
                                                        ))}
                                                    </ol>
                                                    {(event.event_outline_items || []).length > outlinePreviewCount && (
                                                        <p className="mt-1 text-xs text-slate-500">+ {(event.event_outline_items || []).length - outlinePreviewCount} langkah lainnya</p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 lg:min-w-[220px]">
                                        {event.source === 'mini' ? (
                                            <button
                                                onClick={async () => openEventDetail(event.id, 'mini')}
                                                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                                            >
                                                Buka Mini Order
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={async () => openEventDetail(event.id, 'order')}
                                                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                                                >
                                                    Detail Event Outline
                                                </button>
                                                <Link
                                                    href={`/admin/events/${event.id}/rundown`}
                                                    className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
                                                >
                                                    Buka Rundown Acara
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {pagination.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <button
                            onClick={async () => fetchEvents(pagination.current_page - 1)}
                            disabled={pagination.current_page === 1}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Sebelumnya
                        </button>
                        <span className="px-4 py-2 text-sm text-gray-700">Halaman {pagination.current_page} dari {pagination.last_page}</span>
                        <button
                            onClick={async () => fetchEvents(pagination.current_page + 1)}
                            disabled={pagination.current_page === pagination.last_page}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Selanjutnya
                        </button>
                    </div>
                )}

                {showDetailModal && selectedEvent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6">
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{selectedEvent.event_name}</h2>
                                    <p className="text-sm text-gray-500">Detail Event terpisah dari Rundown Acara</p>
                                </div>
                                <button onClick={async () => setShowDetailModal(false)} className="rounded-md border p-2 hover:bg-gray-50">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mb-6 rounded-lg border border-gray-200 p-4">
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Catatan pada Kalender Event</label>
                                <textarea
                                    rows={3}
                                    value={calendarNote}
                                    onChange={(e) => setCalendarNote(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    placeholder="Contoh: Bawa tambahan bunga fresh dan siapkan backup genset."
                                />
                                <div className="mt-3">
                                    <button
                                        onClick={saveCalendarNote}
                                        disabled={savingDetail}
                                        className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                                    >
                                        <Save className="h-4 w-4" />
                                        Simpan Catatan Kalender
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Outline Detail Event</h3>
                                <p className="text-sm text-gray-500">Tahapan umum event (preparation, start, hingga cleanup), dapat dikustomisasi.</p>
                            </div>

                            <div className="space-y-3">
                                {(selectedEvent.event_outline_items || []).map((outline) => (
                                    <div key={outline.id} className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 p-3 md:grid-cols-12">
                                        <input
                                            value={outline.title}
                                            onChange={(e) => {
                                                setSelectedEvent((prev) => {
                                                    if (!prev) return prev;
                                                    return {
                                                        ...prev,
                                                        event_outline_items: prev.event_outline_items.map((x) =>
                                                            x.id === outline.id ? { ...x, title: e.target.value } : x,
                                                        ),
                                                    };
                                                });
                                            }}
                                            onBlur={(e) => updateOutline(outline.id, { title: e.target.value })}
                                            className="rounded-md border border-gray-300 px-3 py-2 text-sm md:col-span-3"
                                        />
                                        <input
                                            type="time"
                                            value={outline.planned_time ? formatTime(outline.planned_time) : ''}
                                            onChange={(e) => updateOutline(outline.id, { planned_time: e.target.value || null })}
                                            className="rounded-md border border-gray-300 px-3 py-2 text-sm md:col-span-2"
                                        />
                                        <select
                                            value={outline.status}
                                            onChange={(e) => updateOutline(outline.id, { status: e.target.value as EventOutlineItem['status'] })}
                                            className="rounded-md border border-gray-300 px-3 py-2 text-sm md:col-span-2"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="skipped">Skipped</option>
                                        </select>
                                        <input
                                            value={outline.description || ''}
                                            onChange={(e) => {
                                                setSelectedEvent((prev) => {
                                                    if (!prev) return prev;
                                                    return {
                                                        ...prev,
                                                        event_outline_items: prev.event_outline_items.map((x) =>
                                                            x.id === outline.id ? { ...x, description: e.target.value } : x,
                                                        ),
                                                    };
                                                });
                                            }}
                                            onBlur={(e) => updateOutline(outline.id, { description: e.target.value || null })}
                                            className="rounded-md border border-gray-300 px-3 py-2 text-sm md:col-span-4"
                                            placeholder="Deskripsi langkah"
                                        />
                                        <button
                                            onClick={async () => deleteOutline(outline.id)}
                                            className="inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100 md:col-span-1"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-4">
                                <h4 className="mb-3 text-sm font-semibold text-gray-700">Tambah Langkah Outline</h4>
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                                    <input
                                        value={newOutline.title}
                                        onChange={(e) => setNewOutline((prev) => ({ ...prev, title: e.target.value }))}
                                        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                                        placeholder="Judul langkah"
                                    />
                                    <input
                                        type="time"
                                        value={newOutline.planned_time}
                                        onChange={(e) => setNewOutline((prev) => ({ ...prev, planned_time: e.target.value }))}
                                        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />
                                    <input
                                        value={newOutline.description}
                                        onChange={(e) => setNewOutline((prev) => ({ ...prev, description: e.target.value }))}
                                        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                                        placeholder="Deskripsi"
                                    />
                                    <button onClick={addOutline} className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                                        <Plus className="h-4 w-4" /> Tambah
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
