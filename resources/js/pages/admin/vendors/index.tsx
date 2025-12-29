import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Plus, Edit, Trash2, Building2, Star, Search } from 'lucide-react';
import api from '@/services/api';

interface Vendor {
  id: number;
  vendor_code: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  city: string;
  status: string;
  rating_level: string;
  average_rating: number;
  total_reviews: number;
  category: { name: string };
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    category_id: '',
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    status: 'active',
    rating_level: 'standard'
  });

  useEffect(() => {
    fetchVendors();
    fetchCategories();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vendors', { params: { search: searchTerm } });
      setVendors(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/vendor-categories-active');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedVendor) {
        await api.put(`/vendors/${selectedVendor.id}`, formData);
      } else {
        await api.post('/vendors', formData);
      }
      setShowModal(false);
      resetForm();
      fetchVendors();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving vendor');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this vendor?')) return;
    try {
      await api.delete(`/vendors/${id}`);
      fetchVendors();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting vendor');
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: '',
      company_name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      province: '',
      status: 'active',
      rating_level: 'standard'
    });
    setSelectedVendor(null);
  };

  const getLevelColor = (level: string) => {
    const colors: any = { platinum: 'bg-gray-800', gold: 'bg-yellow-500', silver: 'bg-gray-400', bronze: 'bg-orange-600', standard: 'bg-gray-300' };
    return colors[level] || 'bg-gray-300';
  };

  return (
    <AdminLayout>
      <Head title="Daftar Vendor" />
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Daftar Vendor</h1>
            <p className="text-gray-600">Kelola data vendor</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Tambah Vendor
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyUp={fetchVendors}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-4">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 flex-1">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{vendor.company_name}</h3>
                        <span className={`px-2 py-1 text-xs text-white rounded ${getLevelColor(vendor.rating_level)}`}>
                          {vendor.rating_level.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${vendor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                          {vendor.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Code: <span className="font-medium">{vendor.vendor_code}</span></p>
                          <p className="text-gray-600">Kategori: <span className="font-medium">{vendor.category.name}</span></p>
                          <p className="text-gray-600">Kontak: <span className="font-medium">{vendor.contact_person}</span></p>
                        </div>
                        <div>
                          <p className="text-gray-600">Email: <span className="font-medium">{vendor.email}</span></p>
                          <p className="text-gray-600">Phone: <span className="font-medium">{vendor.phone}</span></p>
                          <p className="text-gray-600">Kota: <span className="font-medium">{vendor.city}</span></p>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">{vendor.average_rating.toFixed(1)}</span>
                          <span className="text-gray-600 text-sm">({vendor.total_reviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedVendor(vendor); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(vendor.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
              <h2 className="text-xl font-bold mb-4">{selectedVendor ? 'Edit' : 'Tambah'} Vendor</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Kategori *</label>
                    <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} required className="w-full px-3 py-2 border rounded-lg">
                      <option value="">Pilih</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama Perusahaan *</label>
                    <input type="text" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} required className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Kontak Person *</label>
                    <input type="text" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} required className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone *</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Kota *</label>
                    <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Provinsi *</label>
                    <input type="text" value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value })} required className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Alamat *</label>
                    <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required className="w-full px-3 py-2 border rounded-lg" rows={2} />
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
      </div>
    </AdminLayout>
  );
}
