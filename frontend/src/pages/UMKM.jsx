import { useState, useEffect } from 'react';
import { Search, MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const UMKM = () => {
  const [umkm, setUmkm] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchUmkm = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/umkm?status=aktif&search=${search}`);
      if (!res.ok) throw new Error('Gagal memuat UMKM');
      const json = await res.json();
      setUmkm(json.data || []);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUmkm();
  }, [search]); // Search will debounce in real-world, but simple approach here

  const handleWhatsAppClick = (e, nomorWa, namaUsaha) => {
    e.stopPropagation();
    const text = encodeURIComponent(`Halo, saya melihat usaha Anda (${namaUsaha}) di website Dukuh Beji Kadus 2.`);
    let waNumber = nomorWa;
    if (waNumber.startsWith('0')) {
      waNumber = '62' + waNumber.substring(1);
    }
    window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
  };

  const handleMapClick = (e, link) => {
    e.stopPropagation();
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-8">
      <div data-aos="fade-down" className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Katalog UMKM</h1>
          <p className="text-gray-600 text-lg">Dukung pengusaha lokal Dukuh Beji Kadus 2.</p>
        </div>
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Cari UMKM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><LoadingState /><LoadingState /><LoadingState /></div>
      ) : error ? (
        <ErrorState onRetry={fetchUmkm} />
      ) : umkm.length === 0 ? (
        <EmptyState message="Belum ada data UMKM yang ditemukan." />
      ) : (
        <div data-aos="fade-up" data-aos-delay="100" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {umkm.map((item, index) => (
            <div 
              key={item.id} 
              data-aos="fade-up"
              data-aos-delay={index * 100}
              onClick={() => navigate(`/umkm/${item.id}`)}
              className="group cursor-pointer flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-48 bg-gray-100 w-full relative overflow-hidden">
                {item.fotos && item.fotos.length > 0 ? (
                  <img src={item.fotos[0].url} alt={item.nama_usaha} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400 font-medium">Tanpa Foto</div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.nama_usaha}</h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
                  {item.deskripsi || 'Tidak ada deskripsi'}
                </p>
                {item.link_gmaps && (
                   <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
                     <MapPin size={16} className="text-gray-400" />
                     <button 
                       onClick={(e) => handleMapClick(e, item.link_gmaps)}
                       className="hover:text-primary transition-colors truncate"
                     >
                       Lihat Lokasi
                     </button>
                   </div>
                )}
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => handleWhatsAppClick(e, item.nomor_wa, item.nama_usaha)}
                    className="flex-1 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium transition-colors text-sm"
                  >
                    Hubungi
                  </button>
                  <button 
                    className="flex-1 py-2.5 px-4 bg-primary text-white hover:bg-primary/90 rounded-xl font-medium transition-colors text-sm"
                  >
                    Profil Lengkap
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UMKM;
