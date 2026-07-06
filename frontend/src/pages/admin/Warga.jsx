import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import CustomSelect from '../../components/CustomSelect';
import CreatableSelect from '../../components/CreatableSelect';
import { useToast } from '../../components/ToastProvider';

const Warga = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  const [kategori, setKategori] = useState({ pendidikan: [], pekerjaan: [] });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nik: '', no_kk: '', tahun_terbit_kk: '', nama_lengkap: '', jenis_kelamin: 'L',
    tempat_lahir: '', tanggal_lahir: '', agama: 'Islam',
    golongan_darah: 'A', status_perkawinan: 'Belum Kawin',
    status_hubungan_keluarga: 'Kepala Keluarga',
    pendidikan_id: '', pekerjaan_id: ''
  });

  const openAddModal = () => {
    setIsEdit(false);
    setCurrentId(null);
    setFormData({
      nik: '', no_kk: '', tahun_terbit_kk: '', nama_lengkap: '', jenis_kelamin: 'L',
      tempat_lahir: '', tanggal_lahir: '', agama: 'Islam',
      golongan_darah: 'A', status_perkawinan: 'Belum Kawin',
      status_hubungan_keluarga: 'Kepala Keluarga',
      pendidikan_id: '', pekerjaan_id: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setCurrentId(item.id);
    const dateObj = new Date(item.tanggal_lahir);
    // Adjust for timezone to get YYYY-MM-DD
    const localDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    setFormData({
      nik: item.nik, no_kk: item.no_kk, tahun_terbit_kk: item.tahun_terbit_kk || '', nama_lengkap: item.nama_lengkap,
      jenis_kelamin: item.jenis_kelamin, tempat_lahir: item.tempat_lahir,
      tanggal_lahir: localDate, agama: item.agama,
      golongan_darah: item.golongan_darah, status_perkawinan: item.status_perkawinan,
      status_hubungan_keluarga: item.status_hubungan_keluarga,
      pendidikan_id: item.pendidikan_id || '', pekerjaan_id: item.pekerjaan_id || ''
    });
    setIsModalOpen(true);
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/warga?search=${searchTerm}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal memuat data warga');
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKategori = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/warga/kategori`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const json = await res.json();
      if (json.success) setKategori(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchKategori();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    if (isModalOpen) fetchKategori();
  }, [isModalOpen]);

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data warga ini?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/warga/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('Berhasil menghapus data warga', 'success');
        fetchData();
      } else {
        addToast('Gagal menghapus data', 'error');
      }
    } catch (err) {
      addToast('Terjadi kesalahan', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = isEdit ? `${import.meta.env.VITE_API_BASE_URL}/warga/${currentId}` : `${import.meta.env.VITE_API_BASE_URL}/warga`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        addToast(isEdit ? 'Berhasil mengubah data warga!' : 'Berhasil menambah data warga!', 'success');
        setIsModalOpen(false);
        fetchData();
      } else {
        addToast(json.message || 'Gagal menyimpan data', 'error');
      }
    } catch (err) {
      addToast('Terjadi kesalahan server', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    const includeSensitive = window.confirm('PENTING: Apakah Anda ingin menyertakan data sensitif (NIK, No. KK, dll) dalam file ekspor ini?\n\nKlik OK untuk menyertakan, atau Batal untuk format aman publik.');
    
    const exportData = data.map((item, index) => {
      const baseData = {
        'No': index + 1,
        'Nama Lengkap': item.nama_lengkap,
        'Jenis Kelamin': item.jenis_kelamin,
        'Tempat Lahir': item.tempat_lahir,
        'Tanggal Lahir': new Date(item.tanggal_lahir).toLocaleDateString('id-ID'),
        'Agama': item.agama,
        'Golongan Darah': item.golongan_darah || '-',
        'Status Perkawinan': item.status_perkawinan,
        'Hubungan Keluarga': item.status_hubungan_keluarga
      };

      if (includeSensitive) {
        return {
          'No': index + 1,
          'NIK': item.nik,
          'No KK': item.no_kk,
          ...baseData
        };
      }
      return baseData;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Warga");
    XLSX.writeFile(workbook, `Data_Warga_Beji_Kadus_2_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Warga</h1>
          <p className="text-gray-600">Kelola data kependudukan Dukuh Beji Kadus 2.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Tambah Warga
        </button>
      </div>

      <div className="card p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Cari NIK atau Nama..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
            <Download size={18} /> Export Excel
          </button>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState onRetry={fetchData} />
        ) : data.length === 0 ? (
          <EmptyState message="Tidak ada data warga ditemukan." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 font-semibold text-gray-600">No. KK</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">NIK</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Nama Lengkap</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">L/P</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-gray-900">
                      <div className="flex flex-col gap-1">
                        <span>{item.no_kk}</span>
                        {item.perlu_update_kk === 1 && (
                          <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full font-medium w-fit border border-yellow-200" title="Usia KK sudah >= 5 Tahun, disarankan update">
                            ⚠️ Memerlukan Pembaruan KK
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900">{item.nik}</td>
                    <td className="py-4 px-4 text-gray-900 font-medium">{item.nama_lengkap}</td>
                    <td className="py-4 px-4 text-gray-900">{item.jenis_kelamin}</td>
                    <td className="py-4 px-4 flex gap-2 justify-end">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors" title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> hingga <span className="font-medium">{Math.min(indexOfLastItem, data.length)}</span> dari{' '}
                      <span className="font-medium">{data.length}</span> data
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      
                      <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                        Halaman {currentPage} dari {totalPages}
                      </span>
                      
                      <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? "Ubah Data Warga" : "Tambah Data Warga Baru"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor KK</label>
              <input type="text" name="no_kk" value={formData.no_kk} onChange={handleInputChange} className="input-field" required maxLength="16" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Terbit KK</label>
              <input type="number" name="tahun_terbit_kk" value={formData.tahun_terbit_kk} onChange={handleInputChange} className="input-field" min="1900" max={new Date().getFullYear()} placeholder="Contoh: 2019" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
              <input type="text" name="nik" value={formData.nik} onChange={handleInputChange} className="input-field" required maxLength="16" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleInputChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
              <CustomSelect 
                name="jenis_kelamin" 
                value={formData.jenis_kelamin} 
                onChange={handleInputChange} 
                options={[
                  {value: 'L', label: 'Laki-Laki'},
                  {value: 'P', label: 'Perempuan'}
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agama</label>
              <CustomSelect 
                name="agama" 
                value={formData.agama} 
                onChange={handleInputChange} 
                options={[
                  {value: 'Islam', label: 'Islam'},
                  {value: 'Kristen', label: 'Kristen'},
                  {value: 'Katolik', label: 'Katolik'},
                  {value: 'Hindu', label: 'Hindu'},
                  {value: 'Buddha', label: 'Buddha'},
                  {value: 'Konghucu', label: 'Konghucu'}
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
              <input type="text" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleInputChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
              <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleInputChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Golongan Darah</label>
              <CustomSelect 
                name="golongan_darah" 
                value={formData.golongan_darah} 
                onChange={handleInputChange} 
                options={[
                  {value: 'A', label: 'A'},
                  {value: 'B', label: 'B'},
                  {value: 'AB', label: 'AB'},
                  {value: 'O', label: 'O'},
                  {value: '', label: 'Tidak Tahu'}
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Perkawinan</label>
              <CustomSelect 
                name="status_perkawinan" 
                value={formData.status_perkawinan} 
                onChange={handleInputChange} 
                options={[
                  {value: 'Belum Kawin', label: 'Belum Kawin'},
                  {value: 'Kawin', label: 'Kawin'},
                  {value: 'Cerai Hidup', label: 'Cerai Hidup'},
                  {value: 'Cerai Mati', label: 'Cerai Mati'}
                ]}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Hubungan Keluarga</label>
              <CustomSelect 
                name="status_hubungan_keluarga" 
                value={formData.status_hubungan_keluarga} 
                onChange={handleInputChange} 
                options={[
                  {value: 'Kepala Keluarga', label: 'Kepala Keluarga'},
                  {value: 'Istri', label: 'Istri'},
                  {value: 'Anak', label: 'Anak'},
                  {value: 'Cucu', label: 'Cucu'},
                  {value: 'Orang Tua', label: 'Orang Tua'},
                  {value: 'Mertua', label: 'Mertua'},
                  {value: 'Famili Lain', label: 'Famili Lain'}
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Pendidikan</label>
              <CreatableSelect 
                name="pendidikan_id" 
                value={formData.pendidikan_id} 
                onChange={handleInputChange} 
                options={kategori.pendidikan.map(k => ({ value: k.id, label: k.nama }))}
                placeholder="Pilih atau ketik baru..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan Utama</label>
              <CreatableSelect 
                name="pekerjaan_id" 
                value={formData.pekerjaan_id} 
                onChange={handleInputChange} 
                options={kategori.pekerjaan.map(k => ({ value: k.id, label: k.nama }))}
                placeholder="Pilih atau ketik baru..."
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Simpan Data Warga')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Warga;
