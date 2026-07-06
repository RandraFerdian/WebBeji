import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { useToast } from '../../components/ToastProvider';

const PengaturanAdmin = () => {
  const [formData, setFormData] = useState({
    visi: '',
    misi: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const fetchPengaturan = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pengaturan`);
      if (!res.ok) throw new Error('Gagal memuat pengaturan');
      const json = await res.json();
      if (json.success && json.data) {
        setFormData({
          visi: json.data.visi || '',
          misi: json.data.misi || ''
        });
      }
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPengaturan();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pengaturan`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        addToast('Visi & Misi berhasil disimpan!', 'success');
      } else {
        addToast(json.message || 'Gagal menyimpan data', 'error');
      }
    } catch (err) {
      addToast('Terjadi kesalahan server', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState onRetry={fetchPengaturan} />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil Dukuh</h1>
        <p className="text-gray-600">Kelola informasi Visi dan Misi yang akan ditampilkan di halaman utama website.</p>
      </div>

      <div className="card p-6 md:p-8 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Visi Dukuh Beji</label>
            <textarea 
              name="visi" 
              value={formData.visi} 
              onChange={handleInputChange} 
              className="input-field min-h-[100px] text-gray-800" 
              placeholder="Contoh: Mewujudkan Dukuh Beji yang mandiri, sejahtera, dan berbudaya..."
            />
            <p className="text-xs text-gray-500 mt-2">Visi adalah tujuan utama atau cita-cita jangka panjang dukuh.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Misi Dukuh Beji</label>
            <textarea 
              name="misi" 
              value={formData.misi} 
              onChange={handleInputChange} 
              className="input-field min-h-[200px] text-gray-800 leading-relaxed" 
              placeholder="1. Meningkatkan kualitas pelayanan publik.&#10;2. Memberdayakan UMKM lokal.&#10;3. Menjaga kebersihan lingkungan."
            />
            <p className="text-xs text-gray-500 mt-2">Gunakan penomoran (1., 2., 3.) agar lebih rapi saat ditampilkan.</p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="btn-primary flex items-center gap-2 px-8 py-3"
            >
              <Save size={18} />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default PengaturanAdmin;
