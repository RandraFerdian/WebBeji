import { useState, useEffect } from 'react';
import { Plus, Trash2, Mail, User, Shield } from 'lucide-react';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { useToast } from '../../components/ToastProvider';

const ManajemenAdmin = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { addToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '', username: '', password: '', nama_lengkap: '', role: 'admin'
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/manajemen`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal memuat data admin');
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
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus admin ini?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/manajemen/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        addToast('Berhasil menghapus admin', 'success');
        fetchData();
      } else {
        addToast(json.message || 'Gagal menghapus admin', 'error');
      }
    } catch (err) {
      addToast('Terjadi kesalahan saat menghapus', 'error');
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
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/manajemen`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        addToast('Berhasil menambah admin baru!', 'success');
        setIsModalOpen(false);
        setFormData({ email: '', username: '', password: '', nama_lengkap: '', role: 'admin' });
        fetchData();
      } else {
        addToast(json.message || 'Gagal menambah admin', 'error');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Admin</h1>
          <p className="text-gray-600">Kelola akun administrator sistem Dusun Beji.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Tambah Admin
        </button>
      </div>

      <div className="card p-6">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState onRetry={fetchData} />
        ) : data.length === 0 ? (
          <EmptyState message="Tidak ada admin ditemukan." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="py-3 px-4 font-semibold text-gray-600 rounded-tl-lg">Nama Lengkap</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Username</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Email</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Peran</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-right rounded-tr-lg">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-gray-900 font-medium">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        {item.nama_lengkap}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900">{item.username}</td>
                    <td className="py-4 px-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        {item.email || '-'}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900">
                      <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        <Shield size={12} />
                        {item.role || 'admin'}
                      </span>
                    </td>
                    <td className="py-4 px-4 flex gap-2 justify-end">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Admin Baru">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleInputChange} className="input-field" placeholder="Masukkan nama lengkap" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="input-field" placeholder="Masukkan username" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-field" placeholder="Masukkan alamat email" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="input-field" placeholder="Masukkan password" required minLength="6" />
          </div>
          
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Menyimpan...' : 'Simpan Admin'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManajemenAdmin;
