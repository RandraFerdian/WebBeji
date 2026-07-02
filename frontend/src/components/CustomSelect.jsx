import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const CustomSelect = ({ options, value, onChange, name, placeholder = "Pilih salah satu" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Tutup dropdown jika klik di luar komponen
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => String(opt.value) === String(value));
  const showSearch = options.length > 5;
  const filteredOptions = showSearch 
    ? options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className={`input-field flex items-center justify-between cursor-pointer select-none transition-shadow bg-white ${isOpen ? 'ring-2 ring-primary border-transparent' : ''}`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) setSearchTerm('');
        }}
      >
        <span className={selectedOption ? "text-gray-900 truncate pr-4" : "text-gray-400 truncate pr-4"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={18} className={`text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-xl shadow-xl shadow-blue-900/10 flex flex-col animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
          
          {showSearch && (
            <div className="p-2 border-b border-gray-100/50 sticky top-0 rounded-t-xl z-10">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-gray-800"
                  placeholder="Ketik untuk mencari..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()} // Mencegah dropdown tertutup saat klik input
                  autoFocus
                />
              </div>
            </div>
          )}
          
          <div className="overflow-y-auto py-1 max-h-52">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`px-4 py-2.5 cursor-pointer transition-colors flex items-center gap-2 ${
                    String(opt.value) === String(value) 
                      ? 'bg-primary/5 text-primary font-bold' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => {
                    onChange({ target: { name, value: opt.value } });
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <span className={`w-1.5 h-1.5 shrink-0 rounded-full ${String(opt.value) === String(value) ? 'bg-primary' : 'bg-transparent'}`}></span>
                  <span className="truncate">{opt.label}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-4 text-sm text-center text-gray-500 italic">
                Data tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
