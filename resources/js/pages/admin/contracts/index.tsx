import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Plus, Edit, Trash2, FileText, RefreshCw } from 'lucide-react';
import api from '@/services/api';

interface VendorContract {
  id: number;
  contract_number: string;
  vendor: { company_name: string };
  title: string;
  start_date: string;
  end_date: string;
  contract_value: number;
  payment_schedule: string;
  status: string;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<VendorContract[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<VendorContract | null>(null);

  const [formData, setFormData] = useState({
    vendor_id: '',
    title: '',
    start_date: '',
    end_date: '',
    contract_value: '',
    payment_schedule: 'monthly',
    status: 'draft'
  });

  useEffect(() => {
    fetchContracts();
    fetchVendors();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vendor-contracts');
      setContracts(response.data.data);
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
      if (selectedContract) {
        await api.put(`/vendor-contracts/${selectedContract.id}`, formData);
      } else {
        await api.post('/vendor-contracts', formData);
      }
      setShowModal(false);
      resetForm();
      fetchContracts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving contract');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this contract?')) return;
    try {
      await api.delete(`/vendor-contracts/${id}`);
      fetchContracts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting contract');
    }
  };

  const handleRenew = async (id: number) => {
    if (!confirm('Renew this contract?')) return;
    try {
      await api.post(`/vendor-contracts/${id}/renew`);
      fetchContracts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error renewing contract');
    }
  };

  const resetForm = () => {
    setFormData({
      vendor_id: '',
      title: '',
      start_date: '',
      end_date: '',
      contract_value: '',
      payment_schedule: 'monthly',
      status: 'draft'
    });
    setSelectedContract(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      terminated: 'bg-red-100 text-red-800',
      renewed: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || colors.draft;
  };

  return (
    <AdminLayout>
      <Head title="Kontrak Vendor" />
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Kontrak Vendor</h1>
            <p className="text-gray-600">Kelola kontrak dengan vendor</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Tambah Kontrak
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-4">
            {contracts.map((contract) => (
              <div key={contract.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 flex-1">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{contract.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded ${getStatusColor(contract.status)}`}>
                          {contract.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">No: <span className="font-medium">{contract.contract_number}</span></p>
                          <p className="text-gray-600">Vendor: <span className="font-medium">{contract.vendor.company_name}</span></p>
                          <p className="text-gray-600">Nilai: <span className="font-medium">{formatCurrency(contract.contract_value)}</span></p>
                        </div>
                        <div>
                          <p className="text-gray-600">Periode: <span className="font-medium">{contract.start_date} - {contract.end_date}</span></p>
                          <p className="text-gray-600">Pembayaran: <span className="font-medium">{contract.payment_schedule}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {contract.status === 'active' && (
                      <button onClick={() => handleRenew(contract.id)} className="p-2 text-green-600 hover:bg-green-50 rounded">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => { setSelectedContract(contract); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(contract.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
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
              <h2 className="text-xl font-bold mb-4">{selectedContract ? 'Edit' : 'Tambah'} Kontrak</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Vendor *</label>
                    <select value={formData.vendor_id} onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })} required className="w-full px-3 py-2 border rounded-lg">
                      <option value="">Pilih</option>
                      {vendors.map(v => <option key={v.id} value={v.id}>{v.company_name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Judul *</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tanggal Mulai *</label>
                    <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tanggal Selesai *</label>
                    <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} required className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nilai Kontrak *</label>
                    <input type="number" value={formData.contract_value} onChange={(e) => setFormData({ ...formData, contract_value: e.target.value })} required className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Pembayaran *</label>
                    <select value={formData.payment_schedule} onChange={(e) => setFormData({ ...formData, payment_schedule: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                      <option value="one_time">Sekali</option>
                      <option value="monthly">Bulanan</option>
                      <option value="quarterly">Per Kuartal</option>
                      <option value="per_project">Per Proyek</option>
                    </select>
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
