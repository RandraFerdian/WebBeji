import { useState, useEffect } from 'react';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { Link } from 'react-router-dom';
import { LayoutGrid, ArrowRight } from 'lucide-react';

const Sarpras = () => {
  const [sarpras, setSarpras] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchSarpras = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sarpras`);
      if (!res.ok) throw new Error('Gagal memuat sarpras');
      const json = await res.json();
      setSarpras(json.data || []);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSarpras();
  }, []);

  return (
    <div className="space-y-8">
      <div data-aos="fade-down" className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Sarana dan Prasarana</h1>
        <p className="text-gray-600 text-lg">Infrastruktur dan fasilitas yang tersedia di Dukuh Beji Kadus 2.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8"><LoadingState /><LoadingState /></div>
      ) : error ? (
        <ErrorState onRetry={fetchSarpras} />
      ) : sarpras.length === 0 ? (
        <EmptyState message="Belum ada data sarana prasarana." icon={LayoutGrid} />
      ) : (
        <div data-aos="fade-up" data-aos-delay="100" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sarpras.map((item, index) => (
            <Link 
              key={item.id} 
              data-aos="fade-up"
              data-aos-delay={index * 100}
              to={`/sarpras/${item.id}`}
              className="group flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="w-full h-56 bg-gray-100 relative overflow-hidden">
                {item.cover_url ? (
                  <img 
                    src={item.cover_url} 
                    alt={item.nama} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-400">
                     <LayoutGrid size={32} />
                   </div>
                )}
                {/* Badge Kategori */}
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    Infrastruktur
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-grow p-6">
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {item.nama}
                </h3>
                
                <p className="text-gray-600 line-clamp-3 mb-6 flex-grow text-sm leading-relaxed">
                  {item.deskripsi_singkat}
                </p>

                {/* Footer Action */}
                <div className="flex items-center text-primary font-semibold text-sm mt-auto group-hover:gap-2 transition-all">
                  Lihat Detail
                  <ArrowRight size={16} className="ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sarpras;
