import { useState, useEffect } from 'react';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import DOMPurify from 'dompurify';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';

const Berita = () => {
  const [berita, setBerita] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchBerita = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/berita?status=published`);
      if (!res.ok) throw new Error('Gagal memuat berita');
      const json = await res.json();
      setBerita(json.data || []);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBerita();
  }, []);

  return (
    <div className="space-y-8">
      <div data-aos="fade-down" className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Portal Berita</h1>
        <p className="text-gray-600 text-lg">Kabar terbaru dan pengumuman dari Dusun Beji Kadus 2.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8"><LoadingState /><LoadingState /></div>
      ) : error ? (
        <ErrorState onRetry={fetchBerita} />
      ) : berita.length === 0 ? (
        <EmptyState message="Belum ada berita yang dipublikasikan saat ini." />
      ) : (
        <div data-aos="fade-up" data-aos-delay="100" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {berita.map((item, index) => (
            <Link 
              key={item.id} 
              data-aos="fade-up"
              data-aos-delay={index * 100}
              to={`/berita/${item.slug}`}
              className="group flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="w-full h-56 bg-gray-100 relative overflow-hidden">
                {item.thumbnail_url ? (
                  <img 
                    src={item.thumbnail_url} 
                    alt={item.judul} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-400">
                     <span className="text-sm">Tak Ada Gambar</span>
                   </div>
                )}
                {/* Badge Status / Kategori (opsional, ditaruh diatas gambar) */}
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    Kabar Desa
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-grow p-6">
                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <Calendar size={14} className="mr-2" />
                  <time>
                    {new Date(item.published_at || item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </time>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {item.judul}
                </h3>
                
                <p className="text-gray-600 line-clamp-3 mb-6 flex-grow text-sm leading-relaxed">
                  {(new DOMParser().parseFromString(DOMPurify.sanitize(item.konten), 'text/html').body.textContent || '').replace(/\u00A0/g, ' ')}
                </p>

                {/* Footer Action */}
                <div className="flex items-center text-primary font-semibold text-sm mt-auto group-hover:gap-2 transition-all">
                  Baca Selengkapnya
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

export default Berita;
