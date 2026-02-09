import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { T } from '../constants/i18n';

interface ErrorCardProps {
  message?: string;
  onRetry: () => void;
}

const ErrorCard: React.FC<ErrorCardProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-rose-100 shadow-2xl shadow-rose-200/20 text-center space-y-8 animate-in fade-in zoom-in duration-300 max-w-lg mx-auto">
      <div className="mx-auto w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center ring-8 ring-rose-50/50">
        <AlertCircle className="text-rose-500" size={48} />
      </div>
      
      <div className="space-y-3">
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
          {T.dash.sync_error}
        </h2>
        <p className="text-slate-500 font-bold text-lg leading-relaxed">
          {message || T.error.check_connection}
        </p>
      </div>

      <button 
        onClick={onRetry}
        className="flex items-center gap-3 mx-auto px-10 py-5 bg-rose-600 text-white rounded-3xl font-black text-sm hover:bg-rose-700 transition-all active:scale-95 shadow-2xl shadow-rose-200 uppercase tracking-widest"
      >
        <RefreshCw size={20} className="animate-hover-spin" />
        {T.error.retry}
      </button>
    </div>
  );
};

export default ErrorCard;