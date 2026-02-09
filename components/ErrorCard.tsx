
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { T } from '../constants/i18n';

interface ErrorCardProps {
  message?: string;
  onRetry: () => void;
}

const ErrorCard: React.FC<ErrorCardProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-rose-100 shadow-2xl shadow-rose-100/30 text-center space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="mx-auto w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center">
        <AlertCircle className="text-rose-500" size={40} />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
          {T.error.sync_interrupted}
        </h2>
        <p className="text-slate-500 font-medium max-w-sm mx-auto">
          {message || T.error.check_connection}
        </p>
      </div>

      <button 
        onClick={onRetry}
        className="flex items-center gap-3 mx-auto px-8 py-4 bg-rose-600 text-white rounded-[2rem] font-black text-sm hover:bg-rose-700 transition-all active:scale-95 shadow-xl shadow-rose-200"
      >
        <RefreshCw size={18} />
        {T.error.retry}
      </button>
    </div>
  );
};

export default ErrorCard;
