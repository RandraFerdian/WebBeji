import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, LayoutGrid } from 'lucide-react';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import ImageUploader from '../../components/ImageUploader';
import MultiImageUploader from '../../components/MultiImageUploader';
import { useToast } from '../../components/ToastProvider';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const SarprasAdmin = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
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
    nama: '',
    deskripsi_singkat: '',
    deskripsi_detail: '',
    cover_url: '',
    fotos: []
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sarpras${searchTerm ? `?search=${searchTerm}` : ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal memuat sarpras');
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const openAddModal = () => {
    setIsEdit(false);
    setCurrentId(null);
    setFormData({
      nama: '',
      deskripsi_singkat: '',
      deskripsi_detail: '',
      cover_url: '',
      fotos: []
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setCurrentId(item.id);
    
    setFormData({
      nama: item.nama || '',
      deskripsi_singkat: item.deskripsi_singkat || '',
      deskripsi_detail: item.deskripsi_detail || '',
      cover_url: item.cover_url || '',
      fotos: item.fotos ? item.fotos.map(f => f.url) : []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus sarana prasarana ini?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sarpras/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('Data sarpras berhasil dihapus', 'success');
        fetchData();
      } else {
        addToast('Gagal menghapus data', 'error');
      }
    } catch (err) {
      addToast('Terjadi kesalahan', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = isEdit ? `${import.meta.env.VITE_API_BASE_URL}/sarpras/${currentId}` : `${import.meta.env.VITE_API_BASE_URL}/sarpras`;
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
        addToast(isEdit ? 'Sarpras berhasil diubah!' : 'Sarpras berhasil ditambah!', 'success');
        setIsModalOpen(false);
        fetchData();
      } else {
        addToast(json.message || 'Gagal menyimpan data', 'error');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sarana & Prasarana</h1>
          <p className="text-gray-600">Kelola data sarana dan prasarana desa.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Tambah Sarpras
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
              placeholder="Cari Sarpras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState onRetry={fetchData} />
        ) : data.length === 0 ? (
          <EmptyState message="Belum ada data sarana prasarana." icon={LayoutGrid} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 font-semibold text-gray-600">Cover</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Nama Sarpras</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Deskripsi Singkat</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-center">Jml Foto</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 w-24">
                      {item.cover_url ? (
                        <img src={item.cover_url} alt={item.nama} className="w-16 h-12 object-cover rounded-md" />
                      ) : (
                        <div className="w-16 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                          <LayoutGrid size={20} />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{item.nama}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 max-w-xs truncate">
                      {item.deskripsi_singkat}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.fotos?.length || 0} Foto
                      </span>
                    </td>
                    <td className="py-4 px-4 flex gap-2 justify-end items-center h-full">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? "Edit Sarpras" : "Tambah Sarpras"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sarpras *</label>
              <input 
                type="text" 
                name="nama" 
                value={formData.nama} 
                onChange={handleInputChange} 
                className="input-field" 
                required 
                placeholder="Contoh: Balai Desa"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat *</label>
              <textarea 
                name="deskripsi_singkat" 
                value={formData.deskripsi_singkat} 
                onChange={handleInputChange} 
                className="input-field" 
                rows="2"
                required 
                placeholder="Penjelasan singkat untuk card (maks. 255 karakter)"
                maxLength={255}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto Cover (Thumbnail) *</label>
              <ImageUploader 
                value={formData.cover_url} 
                onChange={(url) => setFormData(prev => ({ ...prev, cover_url: url }))}
                placeholder="Klik untuk unggah cover (Wajib)"
              />
            </div>

            <div className="pb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Detail *</label>
              <div className="bg-white">
                <ReactQuill 
                  theme="snow" 
                  value={formData.deskripsi_detail} 
                  onChange={(content) => setFormData(prev => ({ ...prev, deskripsi_detail: content }))}
                  modules={quillModules}
                  className="min-h-[200px]"
                  placeholder="Penjelasan detail tentang sarana prasarana..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Galeri Foto Detail (Opsional)</label>
              <MultiImageUploader 
                value={formData.fotos} 
                onChange={(urls) => setFormData(prev => ({ ...prev, fotos: urls }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={isSubmitting || !formData.cover_url || !formData.deskripsi_detail} className="btn-primary">
              {isSubmitting ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Simpan Sarpras')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SarprasAdmin;
