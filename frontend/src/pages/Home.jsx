import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Map as MapIcon, ShoppingBag, ArrowRight, Activity, Newspaper, User, Phone, Target, Flag } from 'lucide-react';
import LoadingState from '../components/LoadingState';
import CountUp from '../components/CountUp';
import DOMPurify from 'dompurify';

const Home = () => {
  const [stats, setStats] = useState(null);
  const [latestBerita, setLatestBerita] = useState([]);
  const [perangkat, setPerangkat] = useState([]);
  const [pengaturan, setPengaturan] = useState({ visi: '', misi: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [statsRes, beritaRes, perangkatRes, pengaturanRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/statistik`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/berita?status=published`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/perangkat`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/pengaturan`)
        ]);
        
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          setStats(statsJson.data);
        }
        
        if (beritaRes.ok) {
          const beritaJson = await beritaRes.json();
          setLatestBerita((beritaJson.data || []).slice(0, 3)); // Ambil 3 terbaru
        }
        
        if (perangkatRes.ok) {
          const perangkatJson = await perangkatRes.json();
          setPerangkat(perangkatJson.data || []);
        }

        if (pengaturanRes.ok) {
          const pengaturanJson = await pengaturanRes.json();
          if (pengaturanJson.success && pengaturanJson.data) {
            setPengaturan(pengaturanJson.data);
          }
        }
      } catch (error) {
        console.error("Gagal memuat data beranda", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-16 overflow-hidden">
      
      {/* 1. Hero Section */}
      <section data-aos="fade-up" className="relative pt-16 pb-20 mt-4 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col items-center justify-center text-center">
        {/* Subtle Decorative Background */}
        <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-blue-50/30 to-transparent pointer-events-none"></div>

        <div className="relative z-10 px-6 max-w-4xl mx-auto">
          <div data-aos="fade-down" data-aos-delay="100" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 mb-8 border border-blue-100">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-sm font-semibold tracking-wide">Portal Informasi Desa</span>
          </div>
          
          <h1 data-aos="fade-up" data-aos-delay="200" className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            Selamat Datang di <br />
            <span className="text-primary">Dukuh Beji Kadus 2</span>
          </h1>
          
          <p data-aos="fade-up" data-aos-delay="300" className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Menyajikan transparansi data kependudukan, peta wilayah dukuh yang interaktif, serta mendukung penuh pemberdayaan ekonomi UMKM lokal.
          </p>
          
          <div data-aos="fade-up" data-aos-delay="400" className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/statistik" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors">
              <Users size={20} />
              Lihat Statistik Warga
            </Link>
            <Link to="/umkm" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              <ShoppingBag size={20} className="text-gray-500" />
              Jelajahi UMKM
            </Link>
          </div>

          {/* Quick Metrics Overlay */}
          {!isLoading && stats && (
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fade-in-up">
              <div className="bg-white/80 backdrop-blur-xl border border-white p-5 rounded-xl shadow-sm">
                <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1"><CountUp end={stats.total_warga} /></p>
                <p className="text-xs md:text-sm font-medium text-gray-500">Total Warga</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xl border border-white p-5 rounded-xl shadow-sm">
                <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1"><CountUp end={stats.total_kk} /></p>
                <p className="text-xs md:text-sm font-medium text-gray-500">Kepala Keluarga</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xl border border-white p-5 rounded-xl shadow-sm">
                <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1"><CountUp end={stats.laki_laki} /></p>
                <p className="text-xs md:text-sm font-medium text-gray-500">Laki-laki</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xl border border-white p-5 rounded-xl shadow-sm">
                <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1"><CountUp end={stats.perempuan} /></p>
                <p className="text-xs md:text-sm font-medium text-gray-500">Perempuan</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Visi & Misi Section */}
      {!isLoading && (pengaturan.visi || pengaturan.misi) && (
        <section data-aos="fade-up" className="max-w-5xl mx-auto px-4 pt-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Visi & Misi</h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-4"></div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
            {/* Visi Side */}
            {pengaturan.visi && (
              <div className="md:w-5/12 bg-primary p-8 md:p-10 flex flex-col justify-center">
                <div className="w-12 h-12 bg-white/20 text-white rounded-xl flex items-center justify-center mb-6 shadow-sm backdrop-blur-sm">
                  <Target size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Visi</h3>
                <p className="text-blue-50 text-lg md:text-xl font-medium leading-relaxed italic">
                  "{pengaturan.visi}"
                </p>
              </div>
            )}

            {/* Misi Side */}
            {pengaturan.misi && (
              <div className="md:w-7/12 p-8 md:p-10 bg-white">
                <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center mb-6 shadow-sm">
                  <Flag size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Misi</h3>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  {pengaturan.misi.split('\n').map((item, idx) => {
                    const cleanItem = item.replace(/^\d+\.\s*/, '').trim();
                    return cleanItem ? (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-blue-50 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold">{idx + 1}</span>
                        </div>
                        <p className="text-gray-600 md:text-lg">{cleanItem}</p>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. Layanan Informasi Section */}
      <section data-aos="fade-up" className="relative z-20 max-w-6xl mx-auto px-4 pt-12 border-t border-gray-100">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Layanan Informasi</h2>
          <p className="text-gray-600">Akses cepat ke berbagai informasi penting di dukuh kami.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/statistik" className="group p-6 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
              <Activity size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">Data Penduduk</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
              Transparansi data kependudukan, mencakup jumlah warga, sebaran jenis kelamin, dan statistik keluarga secara *real-time*.
            </p>
            <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
              Lihat Statistik <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          
          <Link to="/peta" className="group p-6 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
              <MapIcon size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-amber-600 transition-colors">Peta Dukuh</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
              Visualisasi batas wilayah, letak fasilitas umum, dan jalan desa untuk mempermudah pencarian lokasi.
            </p>
            <div className="flex items-center gap-2 text-amber-600 font-medium text-sm">
              Buka Peta <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link to="/umkm" className="group p-6 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-5">
              <ShoppingBag size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-green-600 transition-colors">Katalog UMKM</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
              Mendukung pengusaha lokal dengan menampilkan produk, jasa, dan kontak langsung warga Dukuh Beji.
            </p>
            <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
              Cari UMKM <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Aparatur Desa Section */}
      {!isLoading && perangkat.length > 0 && (
        <section data-aos="fade-up" className="max-w-6xl mx-auto px-4 pt-12 border-t border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Aparatur Pemerintahan</h2>
            <p className="text-gray-600">Mengenal lebih dekat struktur pemerintahan Dukuh Beji Kadus 2.</p>
          </div>
          <div className="flex overflow-x-auto pb-8 snap-x snap-mandatory gap-6 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {perangkat.map(p => (
              <div key={p.id} className="min-w-[180px] md:min-w-[200px] flex-shrink-0 snap-center">
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                  <div className="h-48 md:h-56 bg-gray-100 relative overflow-hidden flex items-center justify-center border-b border-gray-50">
                    {p.foto_url ? (
                      <img src={p.foto_url} alt={p.nama} className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <User size={64} strokeWidth={1.5} className="mt-8 opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 md:p-5 text-center flex flex-col flex-grow">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{p.nama}</h3>
                    <p className="text-xs text-primary font-medium mt-1 mb-4">{p.jabatan}</p>
                    
                    {p.nomor_hp && (
                      <a 
                        href={`https://wa.me/${p.nomor_hp.startsWith('0') ? '62' + p.nomor_hp.substring(1) : p.nomor_hp}?text=Halo%20Bapak/Ibu%20${encodeURIComponent(p.nama)},%20saya%20warga%20Dukuh%20Beji%20ingin%20bertanya...`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-auto flex items-center justify-center gap-2 w-full py-2 bg-gray-50 border border-gray-200 text-gray-700 hover:bg-green-50 hover:text-green-600 hover:border-green-200 rounded-lg text-xs md:text-sm font-medium transition-colors"
                      >
                        <Phone size={14} />
                        Hubungi via WA
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Latest News Section */}
      <section data-aos="fade-up" className="max-w-6xl mx-auto px-4 pt-12 border-t border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Newspaper className="text-primary" size={24} />
              <h2 className="text-3xl font-bold text-gray-900">Kabar Terbaru</h2>
            </div>
            <p className="text-gray-600">Berita dan pengumuman terkini seputar Dukuh Beji Kadus 2.</p>
          </div>
          <Link to="/berita" className="btn-secondary flex items-center gap-2">
            Lihat Semua Berita <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LoadingState /><LoadingState /><LoadingState />
          </div>
        ) : latestBerita.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-12 text-center text-gray-500 border border-gray-100">
            Belum ada berita yang dipublikasikan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestBerita.map((item) => (
              <Link to="/berita" key={item.id} className="group flex flex-col h-full bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-100 overflow-hidden">
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.judul} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      Tanpa Gambar
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider mb-3 block">
                    {new Date(item.published_at || item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {item.judul}
                  </h3>
                  <div 
                    className="text-gray-600 text-sm line-clamp-3 mb-6"
                  >
                    {(new DOMParser().parseFromString(DOMPurify.sanitize(item.konten), 'text/html').body.textContent || '').replace(/\u00A0/g, ' ')}
                  </div>
                  <div className="mt-auto text-primary text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Baca Selengkapnya <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default Home;
