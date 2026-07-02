import { useState, useEffect } from 'react';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { Users, Component, Fingerprint, Map, BookOpen, Briefcase, Network, Activity, User, UserPlus, Users2 } from 'lucide-react';

const Statistik = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/statistik`);
      if (!res.ok) throw new Error('Gagal memuat statistik');
      const json = await res.json();
      setStats(json.data);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const ProgressBar = ({ label, value, max }) => {
    const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
      <div className="mb-5 group">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <div className="text-sm">
            <span className="font-bold text-gray-900">{value}</span>
            <span className="text-gray-400 font-mono ml-2 text-xs">{percentage}%</span>
          </div>
        </div>
        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-out group-hover:bg-blue-700" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const StatSection = ({ title, icon: Icon, data, max }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
          <Icon size={20} />
        </div>
        <h3 className="text-base font-bold text-gray-900 tracking-tight">{title}</h3>
      </div>
      <div className="space-y-1">
        {data?.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Data belum tersedia.</p>
        ) : (
          data?.map(item => (
            <ProgressBar key={item.nama} label={item.nama} value={item.count} max={max} />
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16 px-4 md:px-0">
      
      {/* Structural Header */}
      <div data-aos="fade-down" className="border-b border-gray-200 pb-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Data Demografi Warga</h1>
            <p className="text-gray-500 mt-2 max-w-2xl">
              Ringkasan statistik kependudukan Dusun Beji Kadus 2 berdasarkan basis data sistem terpadu.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-100 px-3 py-1.5 rounded-md self-start md:self-auto">
            <Activity size={14} className="text-primary" /> Real-time Sinkronisasi
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState onRetry={fetchStats} />
      ) : (
        <div className="space-y-8">
          
          {/* Main Key Metrics - Utilitarian Grid */}
          <div data-aos="fade-up" className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 text-primary group-hover:scale-110 transition-transform duration-300">
                <Users size={80} />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Total Jiwa</p>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className="text-4xl font-bold text-gray-900 tracking-tight">{stats.total_warga}</span>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 text-primary group-hover:scale-110 transition-transform duration-300">
                <Network size={80} />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Kepala Keluarga</p>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className="text-4xl font-bold text-gray-900 tracking-tight">{stats.total_kk}</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 text-primary group-hover:scale-110 transition-transform duration-300">
                <User size={80} />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Laki-Laki</p>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className="text-4xl font-bold text-gray-900 tracking-tight">{stats.laki_laki}</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 text-primary group-hover:scale-110 transition-transform duration-300">
                <UserPlus size={80} />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Perempuan</p>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className="text-4xl font-bold text-gray-900 tracking-tight">{stats.perempuan}</span>
              </div>
            </div>
          </div>
          
          {/* Detailed Statistics - Masonry/Grid Layout */}
          <div data-aos="fade-up" data-aos-delay="200" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatSection 
              title="Kelompok Umur" 
              icon={Users} 
              data={stats.kelompok_umur?.filter(item => item.count > 0)} 
              max={stats.total_warga} 
            />
            
            <StatSection 
              title="Status Perkawinan" 
              icon={Network} 
              data={stats.status_perkawinan?.filter(item => item.count > 0)} 
              max={stats.total_warga} 
            />

            <StatSection 
              title="Kepercayaan & Agama" 
              icon={Map} 
              data={stats.agama?.filter(item => item.count > 0)} 
              max={stats.total_warga} 
            />

            <StatSection 
              title="Tingkat Pendidikan" 
              icon={BookOpen} 
              data={stats.pendidikan?.filter(item => item.count > 0)} 
              max={stats.total_warga} 
            />

            <StatSection 
              title="Mata Pencaharian" 
              icon={Briefcase} 
              data={stats.pekerjaan?.filter(item => item.count > 0)} 
              max={stats.total_warga} 
            />

            <StatSection 
              title="Golongan Darah" 
              icon={Fingerprint} 
              data={stats.golongan_darah?.filter(item => item.count > 0)} 
              max={stats.total_warga} 
            />
          </div>

        </div>
      )}
    </div>
  );
};

export default Statistik;
