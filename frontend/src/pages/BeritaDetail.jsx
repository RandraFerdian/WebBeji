import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import DOMPurify from 'dompurify';

const BeritaDetail = () => {
  const { slug } = useParams();
  const [berita, setBerita] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchBeritaDetail = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/berita/${slug}`);
      if (!res.ok) throw new Error('Gagal memuat detail berita');
      const json = await res.json();
      setBerita(json.data);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBeritaDetail();
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) return <div className="mt-12"><LoadingState /></div>;
  if (error || !berita) return <div className="mt-12"><ErrorState onRetry={fetchBeritaDetail} /></div>;

  return (
    <article data-aos="fade-up" className="max-w-4xl mx-auto py-8">
      <Link to="/berita" className="inline-flex items-center text-primary hover:text-primary/80 font-medium mb-8 transition-colors">
        <ArrowLeft size={20} className="mr-2" />
        Kembali ke Portal Berita
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {berita.judul}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 border-b border-gray-100 pb-8">
          <div className="flex items-center">
            <Calendar size={18} className="mr-2 text-primary" />
            <time>
              {new Date(berita.published_at || berita.created_at).toLocaleDateString('id-ID', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
              })}
            </time>
          </div>
          <div className="flex items-center">
            <User size={18} className="mr-2 text-primary" />
            <span>{berita.nama_penulis || 'Admin Desa'}</span>
          </div>
        </div>
      </header>

      {berita.thumbnail_url && (
        <figure className="mb-12 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50 flex flex-col">
          <img 
            src={berita.thumbnail_url} 
            alt={berita.judul} 
            className="w-full h-auto max-h-[600px] object-contain"
          />
          <figcaption className="p-4 text-center text-sm text-gray-500 italic border-t border-gray-100">
            {berita.judul}
          </figcaption>
        </figure>
      )}

      <div 
        className="prose prose-lg md:prose-xl max-w-none text-gray-700
          prose-headings:font-bold prose-headings:text-gray-900 
          prose-a:text-primary hover:prose-a:text-primary/80
          prose-img:rounded-xl prose-img:shadow-md prose-img:w-full prose-img:h-auto prose-img:object-contain prose-p:mb-6 prose-p:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(berita.konten.replace(/&nbsp;|\u00A0/g, ' ')) }}
      />
    </article>
  );
};

export default BeritaDetail;
