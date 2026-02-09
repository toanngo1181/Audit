import React from 'react';
import { View } from '../types';
import { ClipboardCheck, History, ShieldCheck, Bell } from 'lucide-react';

interface LayoutProps {
  currentView: View;
  setView: (view: View) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children }) => {
  const navItems = [
    { id: View.AUDIT, label: "Kiểm tra", icon: ClipboardCheck },
    { id: View.HISTORY, label: "Lịch sử", icon: History },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top Header - Mobile Optimized */}
      <header className="sticky top-0 z-50 glass-nav border-b border-slate-200/60 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg shadow-slate-200">
            <ShieldCheck size={20} />
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-tighter">
            PIGFARM <span className="text-indigo-600">PRO</span>
          </h1>
        </div>
        <button className="relative p-2 text-slate-400">
          <Bell size={22} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 px-4 pt-4 max-w-md mx-auto w-full">
        <div className="page-transition">
          {children}
        </div>
      </main>

      {/* Bottom Tab Bar - Ergonomic for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-slate-200/60 px-6 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center gap-1 group transition-all duration-300 ${
                isActive ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 ${
                isActive ? 'bg-indigo-50 shadow-inner' : 'group-active:scale-90'
              }`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${
                isActive ? 'opacity-100' : 'opacity-60'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;