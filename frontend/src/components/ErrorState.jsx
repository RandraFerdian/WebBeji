import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({ message = "Gagal memuat data. Silakan coba lagi.", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-red-50/50 rounded-2xl border border-red-100">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
        <AlertCircle size={32} />
      </div>
      <p className="text-red-700 font-medium mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} />
          Muat Ulang
        </button>
      )}
    </div>
  );
};

export default ErrorState;
