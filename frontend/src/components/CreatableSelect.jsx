import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

const CreatableSelect = ({ options, value, onChange, name, placeholder = "Ketik atau pilih..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Detect outside click to close dropdown and reset input if needed
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        const selected = options.find(opt => String(opt.value) === String(value) || opt.label === value);
        if (selected) {
          setSearch(selected.label);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, options]);

  // Sync search input with value prop (when it changes externally)
  useEffect(() => {
    const selected = options.find(opt => String(opt.value) === String(value) || opt.label === value);
    if (selected) {
      setSearch(selected.label);
    } else {
      setSearch(value); // It's a custom typed value that hasn't been saved yet
    }
  }, [value, options]);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );
  
  const isExactMatch = options.some(opt => opt.label.toLowerCase() === search.toLowerCase());

  return (
    <div className="relative" ref={dropdownRef}>
      <div className={`input-field flex items-center justify-between transition-shadow bg-white ${isOpen ? 'ring-2 ring-primary border-transparent' : ''}`}>
        <input 
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            // We pass the string value itself during typing, backend will handle insertion
            onChange({ target: { name, value: e.target.value } });
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full outline-none bg-transparent text-gray-900"
        />
        <ChevronDown 
          size={18} 
          className={`text-gray-400 transition-transform duration-300 cursor-pointer hover:text-gray-600 ${isOpen ? 'rotate-180' : ''}`} 
          onClick={() => setIsOpen(!isOpen)} 
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-xl shadow-xl shadow-blue-900/10 py-2 max-h-56 overflow-y-auto animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                className="px-4 py-2.5 cursor-pointer text-gray-700 hover:bg-primary/5 hover:text-primary font-medium transition-colors flex items-center gap-2"
                onClick={() => {
                  onChange({ target: { name, value: opt.value } });
                  setSearch(opt.label);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))
          ) : (
            search === '' && <div className="px-4 py-2 text-sm text-gray-400 italic">Ketik untuk mencari...</div>
          )}
          
          {search && !isExactMatch && (
            <div 
              className="px-4 py-2.5 cursor-pointer text-primary font-bold hover:bg-primary/5 transition-colors flex items-center gap-2 border-t border-gray-50 mt-1 pt-2"
              onClick={() => {
                onChange({ target: { name, value: search } });
                setIsOpen(false);
              }}
            >
              <Plus size={16} /> Tambahkan "{search}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreatableSelect;
