import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`flex items-center gap-3 px-5 py-3.5 bg-white rounded-xl shadow-xl border-l-4 animate-fade-in-up transition-all transform ${
              toast.type === 'success' ? 'border-green-500' : 'border-red-500'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle size={22} className="text-green-500 shrink-0" />
            ) : (
              <XCircle size={22} className="text-red-500 shrink-0" />
            )}
            <p className="text-gray-800 font-bold text-sm">{toast.message}</p>
            <button 
              onClick={() => removeToast(toast.id)}
              className="ml-6 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
