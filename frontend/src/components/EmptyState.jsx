import { Inbox } from 'lucide-react';

const EmptyState = ({ message = "Belum ada data saat ini." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50/50 rounded-2xl border border-gray-100">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
        <Inbox size={32} />
      </div>
      <p className="text-gray-500 font-medium">{message}</p>
    </div>
  );
};

export default EmptyState;
