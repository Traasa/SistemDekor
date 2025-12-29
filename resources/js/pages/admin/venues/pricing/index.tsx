import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { 
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Calendar,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Filter,
  X
} from 'lucide-react';
import api from '@/services/api';

interface Venue {
  id: number;
  name: string;
  code: string;
}

interface VenuePricing {
  id: number;
  venue_id: number;
  day_type: 'weekday' | 'weekend' | 'holiday';
  session_type: 'full_day' | 'morning' | 'afternoon' | 'evening';
  base_price: string;
  additional_hour_price: string;
  cleaning_fee: string;
  security_deposit: string;
  is_active: boolean;
  venue?: Venue;
}

export default function VenuePricing() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [pricings, setPricings] = useState<VenuePricing[]>([]);
  const [filteredPricings, setFilteredPricings] = useState<VenuePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPricing, setEditingPricing] = useState<VenuePricing | null>(null);
  
  const [filterVenue, setFilterVenue] = useState<number | ''>('');
  const [filterDayType, setFilterDayType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const [formData, setFormData] = useState({
    venue_id: '',
    day_type: 'weekday' as 'weekday' | 'weekend' | 'holiday',
    session_type: 'full_day' as 'full_day' | 'morning' | 'afternoon' | 'evening',
    base_price: '',
    additional_hour_price: '',
    cleaning_fee: '',
    security_deposit: '',
    is_active: true
  });

  const dayTypes = [
    { value: 'weekday', label: 'Hari Kerja', icon: Sun },
    { value: 'weekend', label: 'Akhir Pekan', icon: Calendar },
    { value: 'holiday', label: 'Hari Libur', icon: Moon }
  ];

  const sessionTypes = [
    { value: 'full_day', label: 'Full Day', icon: Sun, time: '08:00 - 22:00' },
    { value: 'morning', label: 'Pagi', icon: Sunrise, time: '08:00 - 12:00' },
    { value: 'afternoon', label: 'Siang', icon: Sun, time: '13:00 - 17:00' },
    { value: 'evening', label: 'Malam', icon: Sunset, time: '18:00 - 22:00' }
  ];

  useEffect(() => {
    fetchVenues();
    fetchPricings();
  }, []);

  useEffect(() => {
    filterPricingData();
  }, [pricings, filterVenue, filterDayType, filterStatus]);

  const fetchVenues = async () => {
    try {
      const response = await api.get('/venues', { params: { is_active: true } });
      const venueData = response.data.data || response.data || [];
      setVenues(venueData);
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
  };

  const fetchPricings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/venue-pricing');
      const pricingData = response.data.data || response.data || [];
      setPricings(pricingData);
    } catch (error) {
      console.error('Error fetching pricings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPricingData = () => {
    let filtered = [...pricings];

    if (filterVenue) {
      filtered = filtered.filter(p => p.venue_id === filterVenue);
    }

    if (filterDayType) {
      filtered = filtered.filter(p => p.day_type === filterDayType);
    }

    if (filterStatus !== '') {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter(p => p.is_active === isActive);
    }

    setFilteredPricings(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        venue_id: parseInt(formData.venue_id),
        base_price: parseFloat(formData.base_price) || 0,
        additional_hour_price: parseFloat(formData.additional_hour_price) || 0,
        cleaning_fee: parseFloat(formData.cleaning_fee) || 0,
        security_deposit: parseFloat(formData.security_deposit) || 0
      };

      if (editingPricing) {
        await api.put(`/venue-pricing/${editingPricing.id}`, submitData);
      } else {
        await api.post('/venue-pricing', submitData);
      }

      fetchPricings();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving pricing:', error);
      alert('Gagal menyimpan pricing');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus pricing ini?')) return;

    try {
      await api.delete(`/venue-pricing/${id}`);
      fetchPricings();
    } catch (error) {
      console.error('Error deleting pricing:', error);
      alert('Gagal menghapus pricing');
    }
  };

  const handleEdit = (pricing: VenuePricing) => {
    setEditingPricing(pricing);
    setFormData({
      venue_id: pricing.venue_id.toString(),
      day_type: pricing.day_type,
      session_type: pricing.session_type,
      base_price: pricing.base_price,
      additional_hour_price: pricing.additional_hour_price,
      cleaning_fee: pricing.cleaning_fee,
      security_deposit: pricing.security_deposit,
      is_active: pricing.is_active
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPricing(null);
    setFormData({
      venue_id: '',
      day_type: 'weekday',
      session_type: 'full_day',
      base_price: '',
      additional_hour_price: '',
      cleaning_fee: '',
      security_deposit: '',
      is_active: true
    });
  };

  const clearFilters = () => {
    setFilterVenue('');
    setFilterDayType('');
    setFilterStatus('');
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const getDayTypeIcon = (dayType: string) => {
    const type = dayTypes.find(t => t.value === dayType);
    return type ? type.icon : Sun;
  };

  const getDayTypeLabel = (dayType: string) => {
    const type = dayTypes.find(t => t.value === dayType);
    return type ? type.label : dayType;
  };

  const getSessionTypeIcon = (sessionType: string) => {
    const type = sessionTypes.find(t => t.value === sessionType);
    return type ? type.icon : Clock;
  };

  const getSessionTypeLabel = (sessionType: string) => {
    const type = sessionTypes.find(t => t.value === sessionType);
    return type ? type.label : sessionType;
  };

  const getSessionTime = (sessionType: string) => {
    const type = sessionTypes.find(t => t.value === sessionType);
    return type ? type.time : '';
  };

  // Group pricings by venue
  const groupedPricings = filteredPricings.reduce((acc, pricing) => {
    const venueId = pricing.venue_id;
    if (!acc[venueId]) {
      acc[venueId] = [];
    }
    acc[venueId].push(pricing);
    return acc;
  }, {} as Record<number, VenuePricing[]>);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pricing Venue</h1>
            <p className="text-gray-600 mt-1">Kelola harga sewa venue berdasarkan tipe hari dan sesi</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tambah Pricing
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Venue
              </label>
              <select
                value={filterVenue}
                onChange={(e) => setFilterVenue(e.target.value ? parseInt(e.target.value) : '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Semua Venue</option>
                {venues.map(venue => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Tipe Hari
              </label>
              <select
                value={filterDayType}
                onChange={(e) => setFilterDayType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Semua Tipe</option>
                {dayTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>

            <div className="flex items-end">
              {(filterVenue || filterDayType || filterStatus) && (
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : Object.keys(groupedPricings).length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada pricing yang ditambahkan</p>
            </div>
          ) : (
            Object.entries(groupedPricings).map(([venueId, venuePricings]) => {
              const venue = venues.find(v => v.id === parseInt(venueId)) || venuePricings[0].venue;
              
              return (
                <div key={venueId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-700">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <MapPin className="w-6 h-6" />
                      {venue?.name}
                    </h3>
                    <p className="text-indigo-100 mt-1">{venue?.code}</p>
                  </div>

                  <div className="p-6">
                    {/* Group by day_type */}
                    {['weekday', 'weekend', 'holiday'].map(dayType => {
                      const dayPricings = venuePricings.filter(p => p.day_type === dayType);
                      if (dayPricings.length === 0) return null;

                      const DayIcon = getDayTypeIcon(dayType);

                      return (
                        <div key={dayType} className="mb-6 last:mb-0">
                          <div className="flex items-center gap-2 mb-4">
                            <DayIcon className="w-5 h-5 text-indigo-600" />
                            <h4 className="text-lg font-semibold text-gray-900">
                              {getDayTypeLabel(dayType)}
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {dayPricings.map(pricing => {
                              const SessionIcon = getSessionTypeIcon(pricing.session_type);

                              return (
                                <div 
                                  key={pricing.id}
                                  className={`
                                    border-2 rounded-lg p-4 transition-all
                                    ${pricing.is_active 
                                      ? 'border-indigo-200 bg-indigo-50' 
                                      : 'border-gray-200 bg-gray-50 opacity-60'}
                                  `}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <SessionIcon className="w-5 h-5 text-indigo-600" />
                                      <div>
                                        <h5 className="font-semibold text-gray-900">
                                          {getSessionTypeLabel(pricing.session_type)}
                                        </h5>
                                        <p className="text-xs text-gray-600">
                                          {getSessionTime(pricing.session_type)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => handleEdit(pricing)}
                                        className="p-1 text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
                                        title="Edit"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(pricing.id)}
                                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                        title="Hapus"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-xs text-gray-600">Harga Dasar</p>
                                      <p className="text-lg font-bold text-indigo-600">
                                        {formatCurrency(pricing.base_price)}
                                      </p>
                                    </div>
                                    
                                    <div className="pt-2 border-t border-gray-200 space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">Tambahan/Jam</span>
                                        <span className="font-semibold text-gray-900">
                                          {formatCurrency(pricing.additional_hour_price)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">Biaya Bersih</span>
                                        <span className="font-semibold text-gray-900">
                                          {formatCurrency(pricing.cleaning_fee)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">Deposit</span>
                                        <span className="font-semibold text-gray-900">
                                          {formatCurrency(pricing.security_deposit)}
                                        </span>
                                      </div>
                                    </div>

                                    {!pricing.is_active && (
                                      <div className="pt-2">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                          Tidak Aktif
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPricing ? 'Edit Pricing' : 'Tambah Pricing Baru'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue *
                  </label>
                  <select
                    value={formData.venue_id}
                    onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                    disabled={!!editingPricing}
                  >
                    <option value="">Pilih Venue</option>
                    {venues.map(venue => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name} ({venue.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Hari *
                  </label>
                  <select
                    value={formData.day_type}
                    onChange={(e) => setFormData({ ...formData, day_type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    {dayTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Sesi *
                  </label>
                  <select
                    value={formData.session_type}
                    onChange={(e) => setFormData({ ...formData, session_type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    {sessionTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} ({type.time})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Dasar (IDR) *
                  </label>
                  <input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                    min="0"
                    step="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Tambahan per Jam (IDR) *
                  </label>
                  <input
                    type="number"
                    value={formData.additional_hour_price}
                    onChange={(e) => setFormData({ ...formData, additional_hour_price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                    min="0"
                    step="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biaya Bersih-bersih (IDR) *
                  </label>
                  <input
                    type="number"
                    value={formData.cleaning_fee}
                    onChange={(e) => setFormData({ ...formData, cleaning_fee: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                    min="0"
                    step="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deposit Keamanan (IDR) *
                  </label>
                  <input
                    type="number"
                    value={formData.security_deposit}
                    onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                    min="0"
                    step="1000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Pricing Aktif</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingPricing ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
