import { useState, useRef } from 'react';
import { Upload, X, Loader2, Plus } from 'lucide-react';
import { useToast } from './ToastProvider';
import ImageUploader from './ImageUploader';

const MultiImageUploader = ({ value = [], onChange, placeholder = "Klik untuk unggah gambar" }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // validate
    const validFiles = [];
    for (let file of files) {
      if (!file.mimetype?.startsWith('image/') && !file.type.startsWith('image/')) {
        addToast(`File ${file.name} bukan gambar yang valid`, 'error');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        addToast(`Ukuran gambar ${file.name} melebihi 5MB`, 'error');
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      const token = localStorage.getItem('token');
      const uploadedUrls = [];

      // Upload sequentially to avoid overloading the server/network
      for (let file of validFiles) {
        const formData = new FormData();
        formData.append('image', file);
        
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const json = await res.json();
        if (res.ok && json.success) {
          uploadedUrls.push(json.url);
        } else {
          addToast(json.message || `Gagal mengunggah ${file.name}`, 'error');
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls]);
        addToast(`${uploadedUrls.length} gambar berhasil diunggah`, 'success');
      }
    } catch (err) {
      addToast('Terjadi kesalahan server saat mengunggah', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (indexToRemove) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {value.map((url, index) => (
          <div key={index} className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 aspect-video flex items-center justify-center group">
            <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                type="button" 
                onClick={() => handleRemove(index)}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                title="Hapus Gambar"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
        
        {/* Upload Button */}
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed ${isUploading ? 'border-gray-300 bg-gray-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-primary/50 cursor-pointer'} aspect-video flex flex-col items-center justify-center transition-all`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center text-primary">
              <Loader2 size={24} className="animate-spin mb-2" />
              <span className="text-xs font-medium">Mengunggah...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-500">
              <Plus size={24} className="text-gray-400 mb-2" />
              <span className="text-xs font-medium text-gray-700">Tambah Foto</span>
            </div>
          )}
        </div>
      </div>

      <input 
        type="file" 
        accept="image/*" 
        multiple
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />
    </div>
  );
};

export default MultiImageUploader;
