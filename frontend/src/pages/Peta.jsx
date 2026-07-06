import { useState, useEffect } from 'react';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const Peta = () => {
  const [petaData, setPetaData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPeta = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/peta`);
      if (!res.ok) throw new Error('Gagal memuat peta');
      const json = await res.json();
      setPetaData(json.data || []);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPeta();
  }, []);

  return (
    <div className="space-y-8">
      <div data-aos="fade-down" className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Peta Wilayah</h1>
        <p className="text-gray-600 text-lg">Visualisasi peta infrastruktur dan batas wilayah Dukuh Beji Kadus 2.</p>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState onRetry={fetchPeta} />
      ) : petaData.length === 0 ? (
        <EmptyState message="Belum ada gambar peta yang diunggah oleh admin." />
      ) : (
        <div data-aos="fade-up" data-aos-delay="100" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {petaData.map((item, index) => {
            return (
              <div 
                key={item.id} 
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="rounded-xl border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow bg-white flex flex-col"
              >
                <div className="w-full h-64 bg-gray-100 relative overflow-hidden">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.judul} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">Tak Ada Gambar</div>
                  )}
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.judul}</h3>
                  <p className="text-gray-600 text-sm flex-grow">
                    {item.deskripsi || 'Tidak ada deskripsi'}
                  </p>
                  {item.image_url && (
                    <a 
                      href={item.image_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="mt-6 inline-flex items-center justify-center w-full btn-secondary"
                    >
                      Lihat Ukuran Penuh
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Peta;
