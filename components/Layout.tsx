
import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { T } from '../constants/i18n';
import { 
  ClipboardCheck, 
  ShieldCheck, 
  ChevronLeft, 
  Menu,
  Bell,
  UserCircle,
  History
} from 'lucide-react';

interface LayoutProps {
  currentView: View;
  setView: (view: View) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Chỉ giữ lại trang Kiểm tra và Lịch sử theo yêu cầu
  const navItems = [
    { id: View.AUDIT, label: T.nav.audit || "Kiểm tra", icon: ClipboardCheck },
    { id: View.HISTORY, label: "Lịch sử", icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar - Desktop & Tablet */}
      {!isMobile && (
        <aside 
          className={`fixed left-0 top-0 h-full bg-slate-900 z-50 transition-all duration-300 ease-in-out flex flex-col shadow-2xl ${
            isCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Logo Section */}
          <div className="p-6 flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shrink-0 shadow-lg shadow-indigo-500/20">
              <ShieldCheck size={24} />
            </div>
            {!isCollapsed && (
              <h1 className="text-xl font-black text-white tracking-tighter whitespace-nowrap animate-in fade-in duration-500">
                PIGFARM <span className="text-indigo-400 uppercase">Pro</span>
              </h1>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 mt-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={22} className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                  {!isCollapsed && (
                    <span className="font-bold text-sm tracking-wide animate-in slide-in-from-left-2 duration-300">
                      {item.label}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute right-2 w-1.5 h-6 bg-white/30 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Collapse Toggle */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="m-4 p-3 bg-slate-800 text-slate-400 rounded-2xl hover:text-white hover:bg-slate-700 transition-colors flex justify-center"
          >
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </aside>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${!isMobile ? (isCollapsed ? 'ml-20' : 'ml-64') : ''}`}>
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
              {navItems.find(i => i.id === currentView)?.label || "Ứng dụng"}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-wider">{T.nav.live_sync || "LIVE SYNC"}</span>
            </div>
            <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
              <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                <Bell size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-slate-900 leading-none uppercase">Admin User</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Manager</p>
                </div>
                <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <UserCircle size={24} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Nav - Chỉ hiện trên màn hình nhỏ */}
      {isMobile && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] bg-slate-900/95 backdrop-blur-lg rounded-[2.5rem] shadow-2xl px-8 py-4 flex justify-between items-center z-50 border border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex flex-col items-center gap-1 transition-all ${
                  isActive ? 'text-white scale-110' : 'text-slate-500'
                }`}
              >
                <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-indigo-600 shadow-lg' : ''}`}>
                  <Icon size={24} />
                </div>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default Layout;
