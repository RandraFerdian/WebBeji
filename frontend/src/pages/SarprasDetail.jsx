import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import DOMPurify from 'dompurify';

const SarprasDetail = () => {
  const { id } = useParams();
  const [sarpras, setSarpras] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fetchSarprasDetail = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sarpras/${id}`);
      if (!res.ok) throw new Error('Gagal memuat detail sarpras');
      const json = await res.json();
      setSarpras(json.data);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSarprasDetail();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) return <div className="mt-12"><LoadingState /></div>;
  if (error || !sarpras) return <div className="mt-12"><ErrorState onRetry={fetchSarprasDetail} /></div>;

  return (
    <article data-aos="fade-up" className="max-w-5xl mx-auto py-8">
      <Link to="/sarpras" className="inline-flex items-center text-primary hover:text-primary/80 font-medium mb-8 transition-colors">
        <ArrowLeft size={20} className="mr-2" />
        Kembali ke Data Sarpras
      </Link>

      <header className="mb-10 text-center">
        <div className="inline-flex items-center justify-center gap-2 mb-4">
          <span className="bg-primary/10 text-primary text-sm font-bold px-4 py-1.5 rounded-full">
            Sarana & Prasarana
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {sarpras.nama}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {sarpras.deskripsi_singkat}
        </p>
      </header>

      {/* Main Cover */}
      {sarpras.cover_url && (
        <figure className="mb-12 rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-gray-50 flex flex-col">
          <img 
            src={sarpras.cover_url} 
            alt={sarpras.nama} 
            className="w-full h-auto max-h-[500px] object-cover"
          />
        </figure>
      )}

      {/* Detail Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Detail Informasi</h2>
        <div 
          className="prose prose-lg max-w-none text-gray-700
            prose-headings:font-bold prose-headings:text-gray-900 
            prose-a:text-primary hover:prose-a:text-primary/80
            prose-p:mb-6 prose-p:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(sarpras.deskripsi_detail.replace(/&nbsp;|\u00A0/g, ' ')) }}
        />
      </div>

      {/* Gallery */}
      {sarpras.fotos && sarpras.fotos.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            Galeri Foto <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{sarpras.fotos.length} Foto</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sarpras.fotos.map((foto, index) => (
              <div 
                key={foto.id || index} 
                className="rounded-xl overflow-hidden shadow-sm border border-gray-100 aspect-square cursor-pointer group relative"
                onClick={() => setSelectedPhoto(foto.url)}
              >
                <img 
                  src={foto.url} 
                  alt={`${sarpras.nama} - Foto ${index + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedPhoto(null)}
        >
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white hover:text-gray-300 bg-black/50 p-2 rounded-full"
            onClick={() => setSelectedPhoto(null)}
          >
            <ArrowLeft size={24} className="rotate-180 md:hidden" />
            <span className="hidden md:inline font-medium">Tutup (X)</span>
          </button>
          <img 
            src={selectedPhoto} 
            alt="Diperbesar" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
          />
        </div>
      )}
    </article>
  );
};

export default SarprasDetail;
