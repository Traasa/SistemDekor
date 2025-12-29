import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Clock,
  MapPin,
  User,
  AlertCircle
} from 'lucide-react';
import api from '@/services/api';

interface Venue {
  id: number;
  name: string;
  code: string;
}

interface VenueAvailability {
  id: number;
  venue_id: number;
  date: string;
  is_available: boolean;
  unavailable_reason: string | null;
  available_from: string | null;
  available_until: string | null;
}

interface VenueBooking {
  id: number;
  booking_number: string;
  venue_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  client_name: string;
  venue?: Venue;
}

interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
  availability?: VenueAvailability;
  bookings: VenueBooking[];
}

export default function VenueAvailability() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  const [formData, setFormData] = useState({
    is_available: true,
    unavailable_reason: '',
    available_from: '',
    available_until: ''
  });

  const [bulkData, setBulkData] = useState({
    start_date: '',
    end_date: '',
    is_available: true,
    unavailable_reason: ''
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    if (selectedVenue) {
      fetchAvailability();
    }
  }, [selectedVenue, currentDate]);

  const fetchVenues = async () => {
    try {
      const response = await api.get('/venues', { params: { is_active: true } });
      const venueData = response.data.data || response.data || [];
      setVenues(venueData);
      if (venueData.length > 0) {
        setSelectedVenue(venueData[0].id);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
  };

  const fetchAvailability = async () => {
    if (!selectedVenue) return;

    try {
      setLoading(true);
      
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const response = await api.get('/venue-availability', {
        params: {
          venue_id: selectedVenue,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        }
      });

      const data = response.data.data || response.data || {};
      const availabilityMap = new Map<string, VenueAvailability>();
      const bookingsMap = new Map<string, VenueBooking[]>();

      // Map availability data
      if (data.availability && Array.isArray(data.availability)) {
        data.availability.forEach((avail: VenueAvailability) => {
          availabilityMap.set(avail.date, avail);
        });
      }

      // Map bookings data
      if (data.bookings && Array.isArray(data.bookings)) {
        data.bookings.forEach((booking: VenueBooking) => {
          const bookingDate = booking.booking_date.split(' ')[0];
          if (!bookingsMap.has(bookingDate)) {
            bookingsMap.set(bookingDate, []);
          }
          bookingsMap.get(bookingDate)!.push(booking);
        });
      }

      // Generate calendar
      const calendarDays = generateCalendar(year, month, availabilityMap, bookingsMap);
      setCalendar(calendarDays);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendar = (
    year: number,
    month: number,
    availabilityMap: Map<string, VenueAvailability>,
    bookingsMap: Map<string, VenueBooking[]>
  ): CalendarDay[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];

    // Add previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: date.toISOString().split('T')[0],
        isCurrentMonth: false,
        bookings: []
      });
    }

    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        isCurrentMonth: true,
        availability: availabilityMap.get(dateStr),
        bookings: bookingsMap.get(dateStr) || []
      });
    }

    // Add next month days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date: date.toISOString().split('T')[0],
        isCurrentMonth: false,
        bookings: []
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return;
    
    setSelectedDate(day.date);
    if (day.availability) {
      setFormData({
        is_available: day.availability.is_available,
        unavailable_reason: day.availability.unavailable_reason || '',
        available_from: day.availability.available_from || '',
        available_until: day.availability.available_until || ''
      });
    } else {
      setFormData({
        is_available: true,
        unavailable_reason: '',
        available_from: '',
        available_until: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVenue) return;

    try {
      await api.post('/venue-availability', {
        venue_id: selectedVenue,
        date: selectedDate,
        ...formData
      });

      fetchAvailability();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Gagal menyimpan ketersediaan');
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVenue) return;

    try {
      await api.post('/venue-availability/bulk', {
        venue_id: selectedVenue,
        ...bulkData
      });

      fetchAvailability();
      setShowBulkModal(false);
      setBulkData({
        start_date: '',
        end_date: '',
        is_available: true,
        unavailable_reason: ''
      });
    } catch (error) {
      console.error('Error saving bulk availability:', error);
      alert('Gagal menyimpan ketersediaan massal');
    }
  };

  const getDayStatus = (day: CalendarDay): string => {
    if (!day.isCurrentMonth) return 'text-gray-300';
    
    if (day.bookings.length > 0) {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    
    if (day.availability) {
      if (!day.availability.is_available) {
        return 'bg-red-100 text-red-800 border-red-300';
      }
      return 'bg-green-100 text-green-800 border-green-300';
    }
    
    return 'hover:bg-gray-50';
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ketersediaan Venue</h1>
            <p className="text-gray-600 mt-1">Kelola jadwal dan ketersediaan venue</p>
          </div>
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <CalendarIcon className="w-5 h-5" />
            Atur Ketersediaan Massal
          </button>
        </div>

        {/* Venue Selector */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Pilih Venue
          </label>
          <select
            value={selectedVenue || ''}
            onChange={(e) => setSelectedVenue(parseInt(e.target.value))}
            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {venues.map(venue => (
              <option key={venue.id} value={venue.id}>
                {venue.name} ({venue.code})
              </option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 border-2 border-green-300 rounded"></div>
              <span className="text-sm text-gray-700">Tersedia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-100 border-2 border-red-300 rounded"></div>
              <span className="text-sm text-gray-700">Tidak Tersedia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 border-2 border-blue-300 rounded"></div>
              <span className="text-sm text-gray-700">Ada Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded"></div>
              <span className="text-sm text-gray-700">Belum Diatur</span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Calendar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevMonth}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={handleToday}
                  className="mt-1 text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Hari Ini
                </button>
              </div>
              
              <button
                onClick={handleNextMonth}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {dayNames.map(day => (
                  <div key={day} className="text-center font-semibold text-gray-700 py-2">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {calendar.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => handleDayClick(day)}
                    disabled={!day.isCurrentMonth}
                    className={`
                      min-h-[100px] p-2 border-2 rounded-lg transition-all
                      ${getDayStatus(day)}
                      ${day.isCurrentMonth ? 'cursor-pointer' : 'cursor-not-allowed'}
                      ${day.isCurrentMonth && day.date === new Date().toISOString().split('T')[0] 
                        ? 'ring-2 ring-indigo-500' 
                        : ''}
                    `}
                  >
                    <div className="flex flex-col h-full">
                      <span className="text-sm font-semibold">
                        {new Date(day.date).getDate()}
                      </span>
                      
                      {day.isCurrentMonth && (
                        <div className="mt-1 space-y-1 flex-1">
                          {day.bookings.length > 0 && (
                            <div className="text-xs">
                              {day.bookings.length} booking
                            </div>
                          )}
                          
                          {day.availability && !day.availability.is_available && (
                            <div className="text-xs">
                              <X className="w-3 h-3 inline" /> Tutup
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Single Date Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Atur Ketersediaan - {new Date(selectedDate).toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Show bookings for this date */}
              {calendar.find(d => d.date === selectedDate)?.bookings.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">Booking pada tanggal ini:</p>
                      <div className="mt-2 space-y-2">
                        {calendar.find(d => d.date === selectedDate)?.bookings.map(booking => (
                          <div key={booking.id} className="text-sm text-blue-800">
                            • {booking.booking_number} - {booking.client_name} 
                            ({formatTime(booking.start_time)} - {formatTime(booking.end_time)})
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getStatusBadge(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Venue Tersedia</span>
                </label>
              </div>

              {!formData.is_available && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alasan Tidak Tersedia
                  </label>
                  <textarea
                    value={formData.unavailable_reason}
                    onChange={(e) => setFormData({ ...formData, unavailable_reason: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                    placeholder="Misal: Renovasi, Pemeliharaan, dll"
                  />
                </div>
              )}

              {formData.is_available && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tersedia Dari
                    </label>
                    <input
                      type="time"
                      value={formData.available_from}
                      onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tersedia Sampai
                    </label>
                    <input
                      type="time"
                      value={formData.available_until}
                      onChange={(e) => setFormData({ ...formData, available_until: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Atur Ketersediaan Massal</h2>
            </div>

            <form onSubmit={handleBulkSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    value={bulkData.start_date}
                    onChange={(e) => setBulkData({ ...bulkData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Selesai *
                  </label>
                  <input
                    type="date"
                    value={bulkData.end_date}
                    onChange={(e) => setBulkData({ ...bulkData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkData.is_available}
                    onChange={(e) => setBulkData({ ...bulkData, is_available: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Venue Tersedia</span>
                </label>
              </div>

              {!bulkData.is_available && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alasan Tidak Tersedia
                  </label>
                  <textarea
                    value={bulkData.unavailable_reason}
                    onChange={(e) => setBulkData({ ...bulkData, unavailable_reason: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                    placeholder="Misal: Renovasi, Pemeliharaan, dll"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkData({
                      start_date: '',
                      end_date: '',
                      is_available: true,
                      unavailable_reason: ''
                    });
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
