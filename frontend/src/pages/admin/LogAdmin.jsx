import { useState, useEffect } from 'react';
import { Search, Clock, Activity, AlertCircle } from 'lucide-react';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';

const LogAdmin = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/log?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal memuat log');
      const json = await res.json();
      setLogs(json.data || []);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.nama_admin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.aksi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionBadge = (aksi) => {
    switch(aksi?.toUpperCase()) {
      case 'TAMBAH': return <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">TAMBAH</span>;
      case 'UBAH': return <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-700">UBAH</span>;
      case 'HAPUS': return <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700">HAPUS</span>;
      default: return <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-700">{aksi}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity size={24} className="text-primary" /> Riwayat Aktivitas
          </h1>
          <p className="text-sm text-gray-500 mt-1">Catatan seluruh perubahan data yang dilakukan oleh administrator.</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle size={20} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-800">
          Demi keamanan dan transparansi, seluruh aktivitas terekam permanen dan tidak dapat dihapus atau diubah dari sistem.
        </p>
      </div>

      <div className="card p-6">
        <div className="mb-6 relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Cari admin, aksi, atau deskripsi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState onRetry={fetchLogs} />
        ) : filteredLogs.length === 0 ? (
          <EmptyState message="Tidak ada catatan aktivitas yang ditemukan." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 font-semibold text-gray-600 w-48">Waktu (WIB)</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 w-32">Admin</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 w-24">Aksi</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Deskripsi Detail</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-600 flex items-center gap-1.5 whitespace-nowrap">
                      <Clock size={14} className="text-gray-400" />
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{log.nama_admin}</td>
                    <td className="py-3 px-4">{getActionBadge(log.aksi)}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{log.deskripsi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogAdmin;
