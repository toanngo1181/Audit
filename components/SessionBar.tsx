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
  // Props cho bộ lọc khu vực
  availableModules: Record<string, string[]>;
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  onToggleModule: (module: string, allCategories: string[]) => void;
}

export const SessionBar: React.FC<SessionBarProps> = ({ 
  session,
  onUpdateSession,
  farmOptions,
  roleOptions,
  progress, 
  onSave, 
  isSaving,
  availableModules,
  selectedCategories,
  onToggleCategory,
  onToggleModule
}) => {
  const [showFilter, setShowFilter] = useState(false);

  // Tính toán số lượng đang chọn
  const totalSelected = selectedCategories.length;
  const totalAvailable = Object.values(availableModules).reduce((acc, val) => acc + val.length, 0);

  return (
    <>
      {/* --- THANH SESSION BAR CHÍNH --- */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* NHÓM 1: THÔNG TIN ĐÁNH GIÁ (INPUTS) */}
            <div className="flex flex-1 items-start md:items-center gap-3 w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full md:w-auto flex-1">
                
                {/* 1. Chọn Trại */}
                <div className="relative group">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" />
                  <select 
                    value={session.farm}
                    onChange={(e) => onUpdateSession({ farm: e.target.value })}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled>-- Chọn Trại --</option>
                    {farmOptions.map(farm => (
                      <option key={farm} value={farm}>{farm}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* 2. Nhập Tên */}
                <div className="relative group">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" />
                  <input 
                    type="text"
                    value={session.auditorName}
                    onChange={(e) => onUpdateSession({ auditorName: e.target.value })}
                    placeholder="Tên người đánh giá"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder:text-slate-400"
                  />
                </div>

                {/* 3. Chọn Chức Vụ */}
                <div className="relative group">
                  <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" />
                  <select 
                    value={session.role}
                    onChange={(e) => onUpdateSession({ role: e.target.value })}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled>-- Chức vụ --</option>
                    {roleOptions.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

              </div>
            </div>

            {/* NHÓM 2: CÔNG CỤ (LỌC & LƯU) */}
            <div className="flex items-center gap-2 justify-end">
              
              {/* Nút Lọc Khu Vực */}
              <button 
                onClick={() => setShowFilter(true)}
                className={`px-3 py-2 rounded-lg border flex items-center gap-2 transition-all active:scale-95 ${
                  totalSelected < totalAvailable 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter size={18} />
                <span className="text-sm font-medium">
                  {totalSelected < totalAvailable ? `Khu vực (${totalSelected})` : 'Tất cả'}
                </span>
              </button>

              {/* Nút Lưu */}
              <button 
                onClick={onSave}
                disabled={isSaving}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-200 active:scale-95"
              >
                {isSaving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Save size={18} />
                )}
                <span className="hidden sm:inline">Lưu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Thanh tiến độ */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* --- MODAL CHỌN KHU VỰC (POPUP) --- */}
      {showFilter && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex justify-end md:justify-center md:items-center animate-in fade-in duration-200">
          
          <div className="bg-white w-full md:w-[600px] h-full md:h-[80vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right md:slide-in-from-bottom duration-300">
            
            {/* Header Modal */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Chọn phạm vi đánh giá</h3>
                <p className="text-xs text-slate-500">Chỉ hiện những khu vực bạn chọn</p>
              </div>
              <button onClick={() => setShowFilter(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                <X size={20} />
              </button>
            </div>

            {/* Body: Danh sách Module & Category */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
              {Object.entries(availableModules).map(([moduleName, categories]) => {
                const checkedCount = categories.filter(c => selectedCategories.includes(c)).length;
                const isFull = checkedCount === categories.length;
                const isPartial = checkedCount > 0 && !isFull;

                return (
                  <div key={moduleName} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    {/* Header Module */}
                    <div 
                      onClick={() => onToggleModule(moduleName, categories)}
                      className="flex items-center justify-between p-3 bg-slate-100/50 cursor-pointer hover:bg-slate-100 border-b border-slate-100"
                    >
                      <span className="font-bold text-slate-800 text-sm uppercase tracking-wider">{moduleName}</span>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isFull ? 'bg-indigo-600 border-indigo-600' : 
                        isPartial ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'
                      }`}>
                         {isFull && <CheckSquare size={14} className="text-white" />}
                         {isPartial && <div className="w-2.5 h-0.5 bg-white rounded-full" />} 
                      </div>
                    </div>

                    {/* List Categories */}
                    <div className="p-2 grid grid-cols-1 gap-1">
                      {categories.map(cat => {
                        const isChecked = selectedCategories.includes(cat);
                        return (
                          <div 
                            key={cat} 
                            onClick={() => onToggleCategory(cat)}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                              isChecked ? 'bg-indigo-50 text-indigo-900' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                              isChecked ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'
                            }`}>
                              {isChecked && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <span className="text-sm font-medium">{cat}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center gap-4">
               <div className="text-sm text-slate-500 font-medium">
                 Đã chọn: <b className="text-indigo-600">{totalSelected}</b> khu vực
               </div>
               <button 
                 onClick={() => setShowFilter(false)}
                 className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex-1 shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
               >
                 Xác nhận
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};