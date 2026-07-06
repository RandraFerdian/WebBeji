import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import ImageUploader from '../../components/ImageUploader';
import { useToast } from '../../components/ToastProvider';

const PerangkatAdmin = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { addToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    jabatan: '',
    foto_url: '',
    urutan: 0,
    nomor_hp: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/perangkat`);
      if (!res.ok) throw new Error('Gagal memuat Aparatur Desa');
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
  }, []);

  const openAddModal = () => {
    setIsEdit(false);
    setCurrentId(null);
    setFormData({ nama: '', jabatan: '', foto_url: '', urutan: 0, nomor_hp: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setCurrentId(item.id);
    setFormData({
      nama: item.nama || '',
      jabatan: item.jabatan || '',
      foto_url: item.foto_url || '',
      urutan: item.urutan || 0,
      nomor_hp: item.nomor_hp || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data aparatur ini?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/perangkat/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('Berhasil menghapus aparatur', 'success');
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
      const url = isEdit ? `${import.meta.env.VITE_API_BASE_URL}/perangkat/${currentId}` : `${import.meta.env.VITE_API_BASE_URL}/perangkat`;
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
        addToast(isEdit ? 'Berhasil mengubah aparatur!' : 'Berhasil menambah aparatur!', 'success');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Aparatur Desa</h1>
          <p className="text-gray-600">Kelola profil struktur organisasi pemerintah Dukuh Beji.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Tambah Aparatur
        </button>
      </div>

      <div className="card p-6">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState onRetry={fetchData} />
        ) : data.length === 0 ? (
          <EmptyState message="Tidak ada data aparatur desa yang ditemukan." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.map((item) => (
              <div key={item.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col">
                <div className="h-48 bg-gray-100 relative group">
                  {item.foto_url ? (
                    <img src={item.foto_url} alt={item.nama} className="w-full h-full object-cover object-top" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Tanpa Foto</div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(item)} className="p-2 bg-white/90 rounded-lg text-primary hover:bg-white shadow-sm">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/90 rounded-lg text-red-600 hover:bg-white shadow-sm">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-gray-900 line-clamp-1">{item.nama}</h3>
                  <p className="text-sm text-gray-500 font-medium">{item.jabatan}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? "Ubah Data Aparatur" : "Tambah Aparatur Baru"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
            <input 
              type="text" 
              name="nama" 
              value={formData.nama} 
              onChange={handleInputChange} 
              className="input-field" 
              required 
              placeholder="Contoh: Budi Santoso"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan *</label>
            <input 
              type="text" 
              name="jabatan" 
              value={formData.jabatan} 
              onChange={handleInputChange} 
              className="input-field" 
              required 
              placeholder="Contoh: Kepala Dukuh"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp (Opsional)</label>
            <input 
              type="text" 
              name="nomor_hp" 
              value={formData.nomor_hp} 
              onChange={handleInputChange} 
              className="input-field" 
              placeholder="Contoh: 08123456789"
            />
            <p className="text-xs text-gray-500 mt-1">Gunakan untuk dihubungi warga secara langsung.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Urut Tampil (Opsional)</label>
            <input 
              type="number" 
              name="urutan" 
              value={formData.urutan} 
              onChange={handleInputChange} 
              className="input-field" 
              placeholder="Contoh: 1"
            />
            <p className="text-xs text-gray-500 mt-1">Gunakan angka kecil (1, 2, 3) untuk menempatkan di awal struktur.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto Formal (Opsional)</label>
            <ImageUploader 
              value={formData.foto_url} 
              onChange={(url) => setFormData(prev => ({ ...prev, foto_url: url }))}
              placeholder="Klik untuk unggah foto"
            />
          </div>
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Simpan Data')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PerangkatAdmin;
