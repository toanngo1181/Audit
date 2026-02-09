
import React from 'react';
import { ShieldCheck } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            PIGFARM <span className="text-indigo-600 uppercase">Pro</span>
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Hệ thống đang trực tuyến
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
