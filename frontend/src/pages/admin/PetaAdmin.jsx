import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, Map as MapIcon } from 'lucide-react';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import CustomSelect from '../../components/CustomSelect';
import { useToast } from '../../components/ToastProvider';
import ImageUploader from '../../components/ImageUploader';

const PetaAdmin = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    image_url: '',
    deskripsi: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/peta`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal memuat peta');
      const json = await res.json();
      
      let fetchedData = json.data || [];
      if (searchTerm) {
        fetchedData = fetchedData.filter(item => 
          item.judul.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
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
  }, [searchTerm]);

  const openAddModal = () => {
    setIsEdit(false);
    setCurrentId(null);
    setFormData({
      judul: '',
      image_url: '',
      deskripsi: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setCurrentId(item.id);
    setFormData({
      judul: item.judul || '',
      image_url: item.image_url || '',
      deskripsi: item.deskripsi || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus peta ini?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/peta/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('Berhasil menghapus peta', 'success');
        fetchData();
      } else {
        addToast('Gagal menghapus peta', 'error');
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
      const url = isEdit ? `${import.meta.env.VITE_API_BASE_URL}/peta/${currentId}` : `${import.meta.env.VITE_API_BASE_URL}/peta`;
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
        addToast(isEdit ? 'Peta berhasil diubah!' : 'Peta berhasil ditambahkan!', 'success');
        setIsModalOpen(false);
        fetchData();
      } else {
        addToast(json.message || 'Gagal menyimpan peta', 'error');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Peta</h1>
          <p className="text-gray-600">Unggah dan kelola gambar peta wilayah dusun.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Tambah Peta Baru
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
              placeholder="Cari Judul Peta..."
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
          <EmptyState message="Belum ada peta yang diunggah." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 font-semibold text-gray-600 w-24">Gambar</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Judul Peta</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Deskripsi</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => {
                  return (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.judul} className="w-16 h-12 object-cover rounded-md border border-gray-200" />
                        ) : (
                          <div className="w-16 h-12 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">Tak Ada</div>
                        )}
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-900">{item.judul}</td>
                      <td className="py-4 px-4 text-gray-600 text-sm truncate max-w-xs">{item.deskripsi || '-'}</td>
                      <td className="py-4 px-4 flex gap-2 justify-end">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors" title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? "Edit Peta" : "Unggah Peta Baru"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Peta *</label>
              <input 
                type="text" 
                name="judul" 
                value={formData.judul} 
                onChange={handleInputChange} 
                className="input-field" 
                required 
                placeholder="Contoh: Peta Dusun Beji Kadus 2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Peta *</label>
              <ImageUploader 
                value={formData.image_url} 
                onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                placeholder="Klik untuk mengunggah gambar peta"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
              <textarea 
                name="deskripsi" 
                value={formData.deskripsi} 
                onChange={handleInputChange} 
                className="input-field min-h-[80px]" 
                placeholder="Keterangan mengenai peta ini..."
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Unggah Peta')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PetaAdmin;
