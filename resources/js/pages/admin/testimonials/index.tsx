import { AdminLayout } from '../../../layouts/AdminLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X, Star } from 'lucide-react';

interface Testimonial {
    id: number;
    client_name: string;
    event_type: string | null;
    testimonial: string;
    rating: number;
    photo_url: string | null;
    is_featured: boolean;
}

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        client_name: '',
        event_type: '',
        testimonial: '',
        rating: 5,
        photo_url: '',
        is_featured: false,
    });

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const response = await axios.get('/api/testimonials');
            setTestimonials(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to fetch testimonials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                rating: parseInt(formData.rating.toString()),
                event_type: formData.event_type || null,
                photo_url: formData.photo_url || null,
            };

            if (editingId) {
                await axios.put(`/api/testimonials/${editingId}`, submitData);
            } else {
                await axios.post('/api/testimonials', submitData);
            }
            
            setShowModal(false);
            resetForm();
            fetchTestimonials();
            alert('Testimonial berhasil disimpan!');
        } catch (error) {
            console.error('Failed to save testimonial:', error);
            alert('Gagal menyimpan testimonial');
        }
    };

    const handleEdit = (testimonial: Testimonial) => {
        setEditingId(testimonial.id);
        setFormData({
            client_name: testimonial.client_name,
            event_type: testimonial.event_type || '',
            testimonial: testimonial.testimonial,
            rating: testimonial.rating,
            photo_url: testimonial.photo_url || '',
            is_featured: testimonial.is_featured,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus testimonial ini?')) return;
        
        try {
            await axios.delete(`/api/testimonials/${id}`);
            fetchTestimonials();
            alert('Testimonial berhasil dihapus');
        } catch (error) {
            console.error('Failed to delete testimonial:', error);
            alert('Gagal menghapus testimonial');
        }
    };

    const resetForm = () => {
        setFormData({
            client_name: '',
            event_type: '',
            testimonial: '',
            rating: 5,
            photo_url: '',
            is_featured: false,
        });
        setEditingId(null);
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${
                            star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
                        <p className="mt-1 text-sm text-gray-500">Kelola testimonial pelanggan</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah Testimonial
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Klien</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe Event</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {testimonials.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Tidak ada testimonial
                                        </td>
                                    </tr>
                                ) : (
                                    testimonials.map((testimonial) => (
                                        <tr key={testimonial.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{testimonial.client_name}</div>
                                                <div className="text-sm text-gray-500">{testimonial.testimonial.substring(0, 50)}...</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{testimonial.event_type || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {renderStars(testimonial.rating)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${testimonial.is_featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {testimonial.is_featured ? 'Featured' : 'Standard'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button onClick={() => handleEdit(testimonial)} className="text-blue-600 hover:text-blue-900 mr-3">
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => handleDelete(testimonial.id)} className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">{editingId ? 'Edit Testimonial' : 'Tambah Testimonial'}</h3>
                                <button onClick={() => { setShowModal(false); resetForm(); }}>
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Klien *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.client_name}
                                        onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Event</label>
                                    <input
                                        type="text"
                                        value={formData.event_type}
                                        onChange={(e) => setFormData({...formData, event_type: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Testimonial *</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.testimonial}
                                        onChange={(e) => setFormData({...formData, testimonial: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="5"
                                        value={formData.rating}
                                        onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">URL Foto</label>
                                    <input
                                        type="text"
                                        value={formData.photo_url}
                                        onChange={(e) => setFormData({...formData, photo_url: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="/images/testimonials/example.jpg"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_featured}
                                        onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                                        className="mr-2"
                                    />
                                    <label className="text-sm text-gray-700">Featured</label>
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
