import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from './ToastProvider';

const ImageUploader = ({ value, onChange, placeholder = "Klik untuk unggah gambar" }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.mimetype?.startsWith('image/') && !file.type.startsWith('image/')) {
      addToast('Hanya file gambar yang diizinkan', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Ukuran gambar maksimal 5MB', 'error');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const json = await res.json();
      if (res.ok && json.success) {
        // Cloudinary returns an absolute URL (https://res.cloudinary.com/...)
        // so we don't need to append a baseUrl
        onChange(json.url);
        addToast('Gambar berhasil diunggah', 'success');
      } else {
        addToast(json.message || 'Gagal mengunggah gambar', 'error');
      }
    } catch (err) {
      addToast('Terjadi kesalahan server saat mengunggah', 'error');
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be uploaded again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="w-full">
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />
      
      {value ? (
        <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 aspect-video md:aspect-[21/9] flex items-center justify-center group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              type="button" 
              onClick={handleRemove}
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
              title="Hapus Gambar"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed ${isUploading ? 'border-gray-300 bg-gray-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-primary/50 cursor-pointer'} aspect-video md:aspect-[21/9] flex flex-col items-center justify-center transition-all`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center text-primary">
              <Loader2 size={28} className="animate-spin mb-2" />
              <span className="text-sm font-medium">Mengunggah...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-500">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                <Upload size={20} className="text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-700">{placeholder}</span>
              <span className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG (Maks. 5MB)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
