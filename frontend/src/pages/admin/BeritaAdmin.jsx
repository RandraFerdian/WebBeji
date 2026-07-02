import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, Globe, FileEdit } from 'lucide-react';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import CustomSelect from '../../components/CustomSelect';
import ImageUploader from '../../components/ImageUploader';
import { useToast } from '../../components/ToastProvider';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const BeritaAdmin = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    slug: '',
    konten: '',
    thumbnail_url: '',
    status: 'draft'
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const token = localStorage.getItem('token');
      // If backend doesn't support search yet, we just pass status
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/berita?status=${statusFilter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal memuat berita');
      const json = await res.json();
      
      let fetchedData = json.data || [];
      // Client-side search since backend might not have ?search parameter implemented
      if (searchTerm) {
        fetchedData = fetchedData.filter(item => 
          item.judul.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setData(fetchedData);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchTerm]);

  const openAddModal = () => {
    setIsEdit(false);
    setCurrentId(null);
    setFormData({
      judul: '',
      slug: '',
      konten: '',
      thumbnail_url: '',
      status: 'draft'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setCurrentId(item.id);
    setFormData({
      judul: item.judul || '',
      slug: item.slug || '',
      konten: item.konten || '',
      thumbnail_url: item.thumbnail_url || '',
      status: item.status || 'draft'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus berita ini?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/berita/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('Berita berhasil dihapus', 'success');
        fetchData();
      } else {
        addToast('Gagal menghapus berita', 'error');
      }
    } catch (err) {
      addToast('Terjadi kesalahan', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleJudulChange = (e) => {
    const val = e.target.value;
    if (!isEdit) {
      setFormData(prev => ({
        ...prev,
        judul: val,
        slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }));
    } else {
      setFormData(prev => ({ ...prev, judul: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = isEdit ? `${import.meta.env.VITE_API_BASE_URL}/berita/${currentId}` : `${import.meta.env.VITE_API_BASE_URL}/berita`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        addToast(isEdit ? 'Berita berhasil diubah!' : 'Berita berhasil dibuat!', 'success');
        setIsModalOpen(false);
        fetchData();
      } else {
        addToast(json.message || 'Gagal menyimpan berita', 'error');
      }
    } catch (err) {
      addToast('Terjadi kesalahan server', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portal Berita</h1>
          <p className="text-gray-600">Kelola artikel dan pengumuman untuk warga.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Tulis Berita
        </button>
      </div>

      <div className="card p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Cari Judul Berita..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <CustomSelect 
              name="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'Semua Status' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' }
              ]}
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState onRetry={fetchData} />
        ) : data.length === 0 ? (
          <EmptyState message="Belum ada berita." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 font-semibold text-gray-600">Judul Berita</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Penulis</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Tanggal</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900 truncate max-w-[200px] md:max-w-xs">{item.judul}</div>
                      <div className="text-sm text-gray-500 mt-1">/{item.slug}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-900">{item.nama_penulis}</td>
                    <td className="py-4 px-4 text-gray-900">
                      {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {item.status === 'published' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Globe size={12} /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <FileEdit size={12} /> Draft
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 flex gap-2 justify-end">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors" title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? "Edit Berita" : "Tulis Berita Baru"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Berita *</label>
              <input 
                type="text" 
                name="judul" 
                value={formData.judul} 
                onChange={handleJudulChange} 
                className="input-field" 
                required 
                placeholder="Contoh: Gotong Royong Membersihkan Balai Desa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug URL *</label>
              <input 
                type="text" 
                name="slug" 
                value={formData.slug} 
                onChange={handleInputChange} 
                className="input-field bg-gray-50 text-gray-500" 
                required 
                placeholder="gotong-royong-desa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto / Gambar (Opsional)</label>
              <ImageUploader 
                value={formData.thumbnail_url} 
                onChange={(url) => setFormData(prev => ({ ...prev, thumbnail_url: url }))}
                placeholder="Klik untuk unggah foto berita"
              />
            </div>
            <div className="pb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Konten Berita *</label>
              <div className="bg-white">
                <ReactQuill 
                  theme="snow" 
                  value={formData.konten} 
                  onChange={(content) => setFormData(prev => ({ ...prev, konten: content }))}
                  modules={quillModules}
                  className="min-h-[200px]"
                  placeholder="Ketik isi berita selengkapnya di sini..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Publikasi</label>
              <CustomSelect 
                name="status" 
                value={formData.status} 
                onChange={handleInputChange} 
                options={[
                  {value: 'draft', label: 'Simpan sebagai Draft'},
                  {value: 'published', label: 'Langsung Terbitkan (Published)'}
                ]}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Simpan Berita')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BeritaAdmin;
