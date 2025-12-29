import { AdminLayout } from '../../../layouts/AdminLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface Portfolio {
    id: number;
    title: string;
    description: string | null;
    image_url: string;
    category: string | null;
    is_featured: boolean;
}

export default function PortfolioPage() {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image_url: '',
        category: '',
        is_featured: false,
    });

    useEffect(() => {
        fetchPortfolios();
    }, []);

    const fetchPortfolios = async () => {
        try {
            const response = await axios.get('/api/portfolios');
            setPortfolios(response.data.data);
        } catch (error) {
            console.error('Failed to fetch portfolios:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/api/portfolios/${editingId}`, formData);
            } else {
                await axios.post('/api/portfolios', formData);
            }
            
            setShowModal(false);
            resetForm();
            fetchPortfolios();
            alert('Portfolio berhasil disimpan!');
        } catch (error) {
            console.error('Failed to save portfolio:', error);
            alert('Gagal menyimpan portfolio');
        }
    };

    const handleEdit = (portfolio: Portfolio) => {
        setEditingId(portfolio.id);
        setFormData({
            title: portfolio.title,
            description: portfolio.description || '',
            image_url: portfolio.image_url,
            category: portfolio.category || '',
            is_featured: portfolio.is_featured,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus portfolio ini?')) return;
        
        try {
            await axios.delete(`/api/portfolios/${id}`);
            fetchPortfolios();
            alert('Portfolio berhasil dihapus');
        } catch (error) {
            console.error('Failed to delete portfolio:', error);
            alert('Gagal menghapus portfolio');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            image_url: '',
            category: '',
            is_featured: false,
        });
        setEditingId(null);
    };

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
                        <p className="mt-1 text-sm text-gray-500">Kelola portfolio project</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah Portfolio
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {portfolios.map((portfolio) => (
                                    <tr key={portfolio.id}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {portfolio.image_url && (
                                                    <img 
                                                        src={portfolio.image_url} 
                                                        alt={portfolio.title}
                                                        className="h-10 w-10 rounded object-cover mr-3"
                                                    />
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{portfolio.title}</div>
                                                    {portfolio.description && (
                                                        <div className="text-sm text-gray-500">
                                                            {portfolio.description.substring(0, 50)}
                                                            {portfolio.description.length > 50 && '...'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {portfolio.category || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                portfolio.is_featured 
                                                    ? 'bg-yellow-100 text-yellow-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {portfolio.is_featured ? 'Featured' : 'Regular'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button 
                                                onClick={() => handleEdit(portfolio)} 
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(portfolio.id)} 
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {portfolios.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                Belum ada portfolio. Klik "Tambah Portfolio" untuk menambahkan.
                            </div>
                        )}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">
                                    {editingId ? 'Edit Portfolio' : 'Tambah Portfolio'}
                                </h3>
                                <button 
                                    onClick={() => { 
                                        setShowModal(false); 
                                        resetForm(); 
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter portfolio title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter portfolio description"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Image URL *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="/images/portfolio/example.jpg"
                                    />
                                    {formData.image_url && (
                                        <div className="mt-2">
                                            <img 
                                                src={formData.image_url} 
                                                alt="Preview"
                                                className="h-32 w-auto rounded border"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Wedding, Corporate Event, Birthday"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_featured"
                                        checked={formData.is_featured}
                                        onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700">
                                        Mark as Featured
                                    </label>
                                </div>

                                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => { 
                                            setShowModal(false); 
                                            resetForm(); 
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        {editingId ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
