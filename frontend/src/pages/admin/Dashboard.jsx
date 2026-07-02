import { useState, useEffect } from 'react';
import { Users, ShoppingBag, FileText, Activity, Clock } from 'lucide-react';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal memuat statistik admin');
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header section */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ikhtisar Sistem</h1>
        <p className="text-sm text-gray-500 mt-1">Ringkasan operasional dan log aktivitas administrator.</p>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState onRetry={fetchStats} />
      ) : (
        <div className="space-y-8">
          
          {/* Key Metrics Grid - Utilitarian Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">Total Penduduk</h3>
                <Users size={16} className="text-gray-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 tracking-tight">{stats?.total_warga || 0}</span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Jiwa</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">UMKM Terdaftar</h3>
                <ShoppingBag size={16} className="text-gray-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 tracking-tight">{stats?.umkm_aktif || 0}</span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Aktif</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">Berita Publikasi</h3>
                <FileText size={16} className="text-gray-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 tracking-tight">{stats?.berita_publik || 0}</span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Artikel</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">Aktivitas Harian</h3>
                <Activity size={16} className="text-gray-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 tracking-tight">{stats?.aktivitas_hari_ini || 0}</span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</span>
              </div>
            </div>
            
          </div>

          {/* Activity Log - Timeline Design */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
              <h2 className="text-base font-bold text-gray-900 tracking-tight">Log Aktivitas Terbaru</h2>
            </div>
            
            <div className="p-6">
              {stats?.logs?.length === 0 ? (
                <EmptyState message="Belum ada aktivitas admin tercatat." />
              ) : (
                <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                  {stats?.logs?.map((log, index) => (
                    <div key={log.id} className="relative pl-6 group">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gray-300 ring-4 ring-white group-hover:bg-primary transition-colors"></span>
                      
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {log.nama_admin}
                        </p>
                        <time className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                          <Clock size={12} />
                          {new Date(log.timestamp).toLocaleString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </time>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        {log.deskripsi}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Dashboard;
