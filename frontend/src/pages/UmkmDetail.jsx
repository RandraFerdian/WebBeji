import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, User, ArrowLeft, Share2, CheckCircle, XCircle } from 'lucide-react';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { useToast } from '../components/ToastProvider';

const UmkmDetail = () => {
  const { id } = useParams();
  const [umkm, setUmkm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchUmkmDetail = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/umkm/${id}`);
        if (!res.ok) throw new Error('Gagal memuat detail UMKM');
        const json = await res.json();
        setUmkm(json.data);
      } catch (err) {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUmkmDetail();
  }, [id]);

  const handleWhatsAppClick = () => {
    if (!umkm) return;
    const text = encodeURIComponent(`Halo, saya melihat profil usaha Anda (${umkm.nama_usaha}) di Website Dusun Beji Kadus 2. Saya ingin bertanya...`);
    let waNumber = umkm.nomor_wa;
    if (waNumber.startsWith('0')) {
      waNumber = '62' + waNumber.substring(1);
    }
    window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: umkm?.nama_usaha,
        text: `Lihat profil UMKM ${umkm?.nama_usaha} di Dusun Beji Kadus 2!`,
        url: window.location.href,
      }).catch((err) => console.log('Share failed:', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link berhasil disalin ke clipboard!', 'success');
    }
  };

  if (isLoading) return <LoadingState />;
  if (error || !umkm) return <ErrorState onRetry={() => window.location.reload()} />;

  const fotoUtama = umkm.fotos && umkm.fotos.length > 0 ? umkm.fotos[0].url : null;

  return (
    <div data-aos="fade-up" className="max-w-5xl mx-auto space-y-8">
      <Link to="/umkm" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium">
        <ArrowLeft size={18} />
        Kembali ke Katalog
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        {/* Hero Image */}
        <div className="w-full h-64 md:h-80 bg-gray-50 relative border-b border-gray-100">
          {fotoUtama ? (
            <img 
              src={fotoUtama} 
              alt={umkm.nama_usaha} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <span className="font-medium text-sm">Belum Ada Foto</span>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4 bg-white/95 px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
            {umkm.status === 'aktif' ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 uppercase tracking-wider">
                <CheckCircle size={14} /> Aktif Buka
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 uppercase tracking-wider">
                <XCircle size={14} /> Tutup
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">{umkm.nama_usaha}</h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-600">
                {umkm.nama_pemilik && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User size={16} />
                    <span>Dikelola oleh <span className="font-medium text-gray-900">{umkm.nama_pemilik}</span></span>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors text-sm"
            >
              <Share2 size={16} />
              Bagikan
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Profil Usaha</h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {umkm.deskripsi}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
                <h3 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wider">Informasi Kontak</h3>
                
                <div className="space-y-4">
                  {umkm.nomor_wa && (
                    <button 
                      onClick={handleWhatsAppClick}
                      className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                    >
                      <Phone size={18} />
                      WhatsApp Sekarang
                    </button>
                  )}

                  {umkm.link_gmaps && (
                    <a 
                      href={umkm.link_gmaps} 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-colors border border-gray-200"
                    >
                      <MapPin size={18} />
                      Buka di Google Maps
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UmkmDetail;
