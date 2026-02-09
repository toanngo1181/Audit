import React, { useState } from 'react';
import { Save, Filter, CheckSquare, X, ChevronDown, User, MapPin, Briefcase } from 'lucide-react';
import { AuditSession } from '../types';

interface SessionBarProps {
  session: AuditSession;
  onUpdateSession: (updates: Partial<AuditSession>) => void;
  farmOptions: string[];
  roleOptions: string[];
  progress: number;
  onSave: () => void;
  isSaving: boolean;
  availableModules: Record<string, string[]>;
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  onToggleModule: (module: string, allCategories: string[]) => void;
}

export const SessionBar: React.FC<SessionBarProps> = ({ 
  session, onUpdateSession, farmOptions, roleOptions, progress, onSave, isSaving,
  availableModules, selectedCategories, onToggleCategory, onToggleModule
}) => {
  const [showFilter, setShowFilter] = useState(false);
  const totalSelected = selectedCategories.length;
  const totalAvailable = Object.values(availableModules).reduce((acc, val) => acc + val.length, 0);

  return (
    <div className="space-y-4 mb-6">
      {/* Compact Info Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
          <MapPin size={16} className="text-indigo-500" />
          <select 
            value={session.farm}
            onChange={(e) => onUpdateSession({ farm: e.target.value })}
            className="flex-1 bg-transparent text-xs font-bold text-slate-700 focus:outline-none appearance-none"
          >
            <option value="" disabled>Trại</option>
            {farmOptions.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
          <User size={16} className="text-indigo-500" />
          <input 
            type="text"
            value={session.auditorName}
            onChange={(e) => onUpdateSession({ auditorName: e.target.value })}
            placeholder="Tên..."
            className="flex-1 bg-transparent text-xs font-bold text-slate-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Progress & Tools */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-white h-12 rounded-2xl border border-slate-100 shadow-sm flex items-center px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-50 opacity-50"></div>
          <div 
            className="absolute left-0 top-0 bottom-0 bg-indigo-500/10 border-r border-indigo-200 transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
          <span className="relative text-[11px] font-black text-indigo-700 uppercase tracking-widest">Tiến độ: {progress}%</span>
        </div>
        
        <button 
          onClick={() => setShowFilter(true)}
          className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
            totalSelected < totalAvailable ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-100'
          }`}
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Mobile Drawer Filter */}
      {showFilter && (
        <div className="fixed inset-0 z-[100] animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowFilter(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] shadow-2xl p-6 pb-12 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6"></div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Khu vực kiểm tra</h3>
            <p className="text-sm text-slate-400 font-medium mb-6">Chọn các phân khu cần đánh giá hôm nay.</p>
            
            <div className="space-y-4 max-h-[50vh] overflow-y-auto hide-scrollbar">
              {Object.entries(availableModules).map(([module, cats]) => (
                <div key={module} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <button 
                    onClick={() => onToggleModule(module, cats)}
                    className="w-full flex justify-between items-center mb-3"
                  >
                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{module}</span>
                    <div className="w-5 h-5 rounded-lg border border-slate-300 bg-white"></div>
                  </button>
                  <div className="grid grid-cols-1 gap-2">
                    {cats.map(cat => (
                      <label key={cat} className="flex items-center gap-3 py-1">
                        <input 
                          type="checkbox" 
                          checked={selectedCategories.includes(cat)}
                          onChange={() => onToggleCategory(cat)}
                          className="w-4 h-4 accent-indigo-600"
                        />
                        <span className="text-sm font-bold text-slate-600">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setShowFilter(false)}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black mt-6 shadow-xl active:scale-95"
            >
              HOÀN TẤT ({totalSelected})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};