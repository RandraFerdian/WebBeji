import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import CustomSelect from '../../components/CustomSelect';
import ImageUploader from '../../components/ImageUploader';
import { useToast } from '../../components/ToastProvider';

const UmkmAdmin = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [wargaOptions, setWargaOptions] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    pemilik_id: '',
    nama_usaha: '',
    deskripsi: '',
    nomor_wa: '',
    link_gmaps: '',
    status: 'aktif',
    foto_url: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/umkm?search=${searchTerm}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal memuat UMKM');
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWargaOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/warga?search=&limit=10000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        const options = json.data.map(w => ({ value: w.id, label: `${w.nik} - ${w.nama_lengkap}` }));
        options.unshift({ value: '', label: 'Tanpa Pemilik (UMKM Umum)' });
        setWargaOptions(options);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    if (isModalOpen) {
      fetchWargaOptions();
    }
  }, [isModalOpen]);

  const openAddModal = () => {
    setIsEdit(false);
    setCurrentId(null);
    setFormData({
      pemilik_id: '',
      nama_usaha: '',
      deskripsi: '',
      nomor_wa: '',
      link_gmaps: '',
      status: 'aktif',
      foto_url: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setCurrentId(item.id);
    setFormData({
      pemilik_id: item.pemilik_id || '',
      nama_usaha: item.nama_usaha || '',
      deskripsi: item.deskripsi || '',
      nomor_wa: item.nomor_wa || '',
      link_gmaps: item.link_gmaps || '',
      status: item.status || 'aktif',
      foto_url: (item.fotos && item.fotos.length > 0) ? item.fotos[0].url : ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data UMKM ini?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/umkm/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('Berhasil menghapus UMKM', 'success');
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
      const url = isEdit ? `${import.meta.env.VITE_API_BASE_URL}/umkm/${currentId}` : `${import.meta.env.VITE_API_BASE_URL}/umkm`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const submitData = { ...formData };
      if (!submitData.pemilik_id) submitData.pemilik_id = null; // Backend handles null

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(submitData)
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        addToast(isEdit ? 'Berhasil mengubah data UMKM!' : 'Berhasil menambah UMKM!', 'success');
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data UMKM</h1>
          <p className="text-gray-600">Kelola direktori UMKM Dukuh Beji Kadus 2.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Tambah UMKM
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
              placeholder="Cari Nama Usaha atau Deskripsi..."
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
          <EmptyState message="Tidak ada data UMKM ditemukan." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 font-semibold text-gray-600">Nama Usaha</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Nama Pemilik</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">No. WhatsApp</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-gray-900 font-medium">{item.nama_usaha}</td>
                    <td className="py-4 px-4 text-gray-900">{item.nama_pemilik || '-'}</td>
                    <td className="py-4 px-4 text-gray-900">{item.nomor_wa || '-'}</td>
                    <td className="py-4 px-4 text-center">
                      {item.status === 'aktif' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={12} /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle size={12} /> Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 flex gap-2 justify-end">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? "Ubah Data UMKM" : "Tambah UMKM Baru"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Usaha *</label>
              <input 
                type="text" 
                name="nama_usaha" 
                value={formData.nama_usaha} 
                onChange={handleInputChange} 
                className="input-field" 
                required 
                placeholder="Contoh: Warung Makan Barokah"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pemilik Usaha (Warga)</label>
              <CustomSelect 
                name="pemilik_id" 
                value={formData.pemilik_id} 
                onChange={handleInputChange} 
                options={wargaOptions}
                placeholder="Pilih pemilik (Opsional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat *</label>
              <textarea 
                name="deskripsi" 
                value={formData.deskripsi} 
                onChange={handleInputChange} 
                className="input-field min-h-[100px]" 
                required 
                placeholder="Jelaskan produk atau jasa yang ditawarkan..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto UMKM</label>
              <ImageUploader 
                value={formData.foto_url} 
                onChange={(url) => setFormData(prev => ({ ...prev, foto_url: url }))}
                placeholder="Klik untuk unggah foto UMKM"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp</label>
                <input 
                  type="text" 
                  name="nomor_wa" 
                  value={formData.nomor_wa} 
                  onChange={handleInputChange} 
                  className="input-field" 
                  placeholder="Contoh: 08123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Google Maps</label>
                <input 
                  type="text" 
                  name="link_gmaps" 
                  value={formData.link_gmaps} 
                  onChange={handleInputChange} 
                  className="input-field" 
                  placeholder="Contoh: https://maps.app.goo.gl/..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Usaha</label>
              <CustomSelect 
                name="status" 
                value={formData.status} 
                onChange={handleInputChange} 
                options={[
                  {value: 'aktif', label: 'Aktif Buka'},
                  {value: 'nonaktif', label: 'Nonaktif / Tutup Sementara'}
                ]}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Simpan Data UMKM')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UmkmAdmin;
