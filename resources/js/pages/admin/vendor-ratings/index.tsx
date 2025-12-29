import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Plus, Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import api from '@/services/api';

interface VendorRating {
  id: number;
  vendor: { company_name: string };
  reviewer: { name: string };
  rating: number;
  quality_rating: number;
  timeliness_rating: number;
  professionalism_rating: number;
  value_rating: number;
  review: string | null;
  pros: string | null;
  cons: string | null;
  would_recommend: boolean;
  vendor_response: string | null;
  is_verified: boolean;
  created_at: string;
}

export default function VendorRatingsPage() {
  const [ratings, setRatings] = useState<VendorRating[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState<VendorRating | null>(null);
  const [responseText, setResponseText] = useState('');

  const [formData, setFormData] = useState({
    vendor_id: '',
    rating: 5,
    quality_rating: 5,
    timeliness_rating: 5,
    professionalism_rating: 5,
    value_rating: 5,
    review: '',
    pros: '',
    cons: '',
    would_recommend: true,
    is_verified: false
  });

  useEffect(() => {
    fetchRatings();
    fetchVendors();
  }, []);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vendor-ratings');
      setRatings(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await api.get('/vendors-active');
      setVendors(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/vendor-ratings', formData);
      setShowModal(false);
      resetForm();
      fetchRatings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving rating');
    }
  };

  const handleAddResponse = async () => {
    if (!selectedRating || !responseText.trim()) return;
    try {
      await api.post(`/vendor-ratings/${selectedRating.id}/response`, { vendor_response: responseText });
      setShowResponseModal(false);
      setResponseText('');
      setSelectedRating(null);
      fetchRatings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error adding response');
    }
  };

  const resetForm = () => {
    setFormData({
      vendor_id: '',
      rating: 5,
      quality_rating: 5,
      timeliness_rating: 5,
      professionalism_rating: 5,
      value_rating: 5,
      review: '',
      pros: '',
      cons: '',
      would_recommend: true,
      is_verified: false
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  return (
    <AdminLayout>
      <Head title="Rating & Review Vendor" />
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Rating & Review Vendor</h1>
            <p className="text-gray-600">Kelola rating dan review vendor</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Tambah Rating
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">{rating.vendor.company_name}</h3>
                      <span className="text-sm text-gray-500">oleh {rating.reviewer.name}</span>
                      {rating.is_verified && <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Verified</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(rating.rating)}</div>
                      <span className="text-sm text-gray-600">{new Date(rating.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded ${rating.would_recommend ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {rating.would_recommend ? '👍 Direkomendasikan' : '👎 Tidak Direkomendasikan'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Kualitas</p>
                    <div className="flex">{renderStars(rating.quality_rating)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Ketepatan Waktu</p>
                    <div className="flex">{renderStars(rating.timeliness_rating)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Profesionalisme</p>
                    <div className="flex">{renderStars(rating.professionalism_rating)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Value</p>
                    <div className="flex">{renderStars(rating.value_rating)}</div>
                  </div>
                </div>

                {rating.review && <p className="text-gray-700 mb-4">{rating.review}</p>}

                {(rating.pros || rating.cons) && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {rating.pros && (
                      <div>
                        <p className="text-sm font-semibold text-green-700 mb-1">👍 Kelebihan:</p>
                        <p className="text-sm text-gray-700">{rating.pros}</p>
                      </div>
                    )}
                    {rating.cons && (
                      <div>
                        <p className="text-sm font-semibold text-red-700 mb-1">👎 Kekurangan:</p>
                        <p className="text-sm text-gray-700">{rating.cons}</p>
                      </div>
                    )}
                  </div>
                )}

                {rating.vendor_response ? (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <p className="font-semibold text-blue-900">Respons Vendor</p>
                    </div>
                    <p className="text-sm text-gray-700">{rating.vendor_response}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => { setSelectedRating(rating); setShowResponseModal(true); }}
                    className="mt-4 flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Tambah Respons
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
              <h2 className="text-xl font-bold mb-4">Tambah Rating</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Vendor *</label>
                    <select value={formData.vendor_id} onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })} required className="w-full px-3 py-2 border rounded-lg">
                      <option value="">Pilih</option>
                      {vendors.map(v => <option key={v.id} value={v.id}>{v.company_name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Overall *</label>
                      <input type="number" min="1" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })} required className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Kualitas</label>
                      <input type="number" min="1" max="5" value={formData.quality_rating} onChange={(e) => setFormData({ ...formData, quality_rating: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Ketepatan</label>
                      <input type="number" min="1" max="5" value={formData.timeliness_rating} onChange={(e) => setFormData({ ...formData, timeliness_rating: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Professional</label>
                      <input type="number" min="1" max="5" value={formData.professionalism_rating} onChange={(e) => setFormData({ ...formData, professionalism_rating: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Value</label>
                      <input type="number" min="1" max="5" value={formData.value_rating} onChange={(e) => setFormData({ ...formData, value_rating: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Review</label>
                    <textarea value={formData.review} onChange={(e) => setFormData({ ...formData, review: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Kelebihan</label>
                      <textarea value={formData.pros} onChange={(e) => setFormData({ ...formData, pros: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Kekurangan</label>
                      <textarea value={formData.cons} onChange={(e) => setFormData({ ...formData, cons: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.would_recommend} onChange={(e) => setFormData({ ...formData, would_recommend: e.target.checked })} className="rounded" />
                      <span className="text-sm">Direkomendasikan</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.is_verified} onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })} className="rounded" />
                      <span className="text-sm">Terverifikasi</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showResponseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Tambah Respons Vendor</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Respons</label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={4}
                    placeholder="Tulis respons..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => { setShowResponseModal(false); setResponseText(''); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
                <button onClick={handleAddResponse} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
