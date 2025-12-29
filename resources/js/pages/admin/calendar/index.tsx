import { AdminLayout } from '../../../layouts/AdminLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface Event {
    id: number;
    event_code: string;
    event_name: string;
    event_type: string;
    event_type_label: string;
    event_date: string;
    start_time: string;
    end_time: string;
    venue: string;
    status: string;
    status_label: string;
}

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const fetchEvents = async (date: Date) => {
        try {
            setLoading(true);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const response = await axios.get(`/api/events-calendar?year=${year}&month=${month}`);
            setEvents(response.data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents(currentDate);
    }, [currentDate]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const getEventsForDate = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(event => event.event_date === dateStr);
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    const getEventTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            wedding: 'bg-pink-500',
            birthday: 'bg-blue-500',
            corporate: 'bg-purple-500',
            meeting: 'bg-orange-500',
            other: 'bg-gray-500',
        };
        return colors[type] || 'bg-gray-500';
    };

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Kalender Event</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Jadwal event yang akan datang
                        </p>
                    </div>
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                    >
                        Hari Ini
                    </button>
                </div>

                {/* Calendar Header */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <button
                            onClick={() => navigateMonth('prev')}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-600" />
                        </button>

                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">{monthName}</h2>
                        </div>

                        <button
                            onClick={() => navigateMonth('next')}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ChevronRight className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Day Names */}
                    <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-7">
                            {/* Empty cells before month starts */}
                            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                                <div key={`empty-${i}`} className="min-h-[120px] border border-gray-200 bg-gray-50" />
                            ))}

                            {/* Days of month */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dayEvents = getEventsForDate(day);
                                const isToday = 
                                    new Date().toDateString() === 
                                    new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                                return (
                                    <div
                                        key={day}
                                        className={`min-h-[120px] border border-gray-200 p-2 ${
                                            isToday ? 'bg-blue-50' : 'bg-white'
                                        } hover:bg-gray-50`}
                                    >
                                        <div className={`text-sm font-medium mb-2 ${
                                            isToday ? 'text-blue-600' : 'text-gray-900'
                                        }`}>
                                            {day}
                                        </div>

                                        <div className="space-y-1">
                                            {dayEvents.map((event) => (
                                                <button
                                                    key={event.id}
                                                    onClick={() => setSelectedEvent(event)}
                                                    className={`w-full text-left px-2 py-1 rounded text-xs text-white hover:opacity-80 ${getEventTypeColor(event.event_type)}`}
                                                >
                                                    <div className="font-medium truncate">
                                                        {event.event_name}
                                                    </div>
                                                    <div className="text-[10px] opacity-90">
                                                        {event.start_time?.substring(0, 5)}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Jenis Event:</h3>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-pink-500"></div>
                            <span className="text-sm text-gray-700">Pernikahan</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-blue-500"></div>
                            <span className="text-sm text-gray-700">Ulang Tahun</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-purple-500"></div>
                            <span className="text-sm text-gray-700">Corporate</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-orange-500"></div>
                            <span className="text-sm text-gray-700">Rapat</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-gray-500"></div>
                            <span className="text-sm text-gray-700">Lainnya</span>
                        </div>
                    </div>
                </div>

                {/* Event Detail Modal */}
                {selectedEvent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                {selectedEvent.event_name}
                            </h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Kode Event:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {selectedEvent.event_code}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Jenis:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(selectedEvent.event_type)} text-white`}>
                                        {selectedEvent.event_type_label}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Tanggal:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {new Date(selectedEvent.event_date).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Waktu:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {selectedEvent.start_time} - {selectedEvent.end_time}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Lokasi:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {selectedEvent.venue}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Status:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {selectedEvent.status_label}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <a
                                    href={`/admin/events/${selectedEvent.id}/rundown`}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 text-center"
                                >
                                    Lihat Rundown
                                </a>
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
