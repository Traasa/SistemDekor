import { AdminLayout } from '../../../layouts/AdminLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface Gallery {
    id: number;
    title: string;
    description: string | null;
    image_path: string;
    category: string | null;
    is_featured: boolean;
    display_order: number;
}

export default function GalleryPage() {
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image_path: '',
        category: '',
        is_featured: false,
        display_order: '0',
    });

    useEffect(() => {
        fetchGalleries();
    }, []);

    const fetchGalleries = async () => {
        try {
            const response = await axios.get('/api/gallery');
            setGalleries(response.data.data);
        } catch (error) {
            console.error('Failed to fetch galleries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                display_order: parseInt(formData.display_order),
            };

            if (editingId) {
                await axios.put(`/api/gallery/${editingId}`, submitData);
            } else {
                await axios.post('/api/gallery', submitData);
            }
            
            setShowModal(false);
            resetForm();
            fetchGalleries();
            alert('Galeri berhasil disimpan!');
        } catch (error) {
            console.error('Failed to save gallery:', error);
            alert('Gagal menyimpan galeri');
        }
    };

    const handleEdit = (gallery: Gallery) => {
        setEditingId(gallery.id);
        setFormData({
            title: gallery.title,
            description: gallery.description || '',
            image_path: gallery.image_path,
            category: gallery.category || '',
            is_featured: gallery.is_featured,
            display_order: gallery.display_order.toString(),
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus item galeri ini?')) return;
        
        try {
            await axios.delete(`/api/gallery/${id}`);
            fetchGalleries();
            alert('Galeri berhasil dihapus');
        } catch (error) {
            console.error('Failed to delete gallery:', error);
            alert('Gagal menghapus galeri');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            image_path: '',
            category: '',
            is_featured: false,
            display_order: '0',
        });
        setEditingId(null);
    };

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Galeri</h1>
                        <p className="mt-1 text-sm text-gray-500">Kelola galeri foto dan karya</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah Galeri
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urutan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {galleries.map((gallery) => (
                                    <tr key={gallery.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {gallery.image_path && (
                                                    <img 
                                                        src={gallery.image_path} 
                                                        alt={gallery.title} 
                                                        className="h-10 w-10 rounded object-cover mr-3"
                                                    />
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{gallery.title}</div>
                                                    {gallery.description && (
                                                        <div className="text-sm text-gray-500">{gallery.description.substring(0, 50)}...</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gallery.category || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${gallery.is_featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {gallery.is_featured ? 'Ya' : 'Tidak'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gallery.display_order}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onClick={() => handleEdit(gallery)} className="text-blue-600 hover:text-blue-900 mr-3">
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => handleDelete(gallery.id)} className="text-red-600 hover:text-red-900">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">{editingId ? 'Edit Galeri' : 'Tambah Galeri'}</h3>
                                <button onClick={() => { setShowModal(false); resetForm(); }}>
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Judul *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Path Gambar *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.image_path}
                                        onChange={(e) => setFormData({...formData, image_path: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="/images/gallery/example.jpg"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                                        <input
                                            type="text"
                                            value={formData.category}
                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Urutan Tampilan</label>
                                        <input
                                            type="number"
                                            value={formData.display_order}
                                            onChange={(e) => setFormData({...formData, display_order: e.target.value})}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_featured}
                                        onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                                        className="mr-2"
                                    />
                                    <label className="text-sm text-gray-700">Tampilkan sebagai Featured</label>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => { setShowModal(false); resetForm(); }}
                                        className="px-4 py-2 border rounded-lg"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Simpan
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
