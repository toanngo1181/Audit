import React, { useMemo, useState, useEffect } from 'react';
import { AuditSession, ChecklistItem, AuditStatus, InputType } from '../types';
import { SessionBar } from '../components/SessionBar'; 
import AuditCard from '../components/AuditCard'; 
import { Loader2, RefreshCw, AlertCircle, CheckCircle2, Filter } from 'lucide-react';

interface AuditPageProps {
  checklist: ChecklistItem[];
  session: AuditSession;
  setSession: React.Dispatch<React.SetStateAction<AuditSession>>;
  updateItem: (id: string, value: string | number | null, inputType: InputType) => void;
  onPhotoUpload: (id: string, file: File) => Promise<string>;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  farmOptions: string[];
  roleOptions: string[];
  onSubmit: () => void;
}

const AuditPage: React.FC<AuditPageProps> = ({
  checklist, session, setSession, updateItem, onPhotoUpload, loading, error, refresh, farmOptions, roleOptions, onSubmit
}) => {
  const availableModules = useMemo(() => {
    const map: Record<string, string[]> = {};
    checklist?.forEach(item => {
      if (!map[item.module]) map[item.module] = [];
      if (!map[item.module].includes(item.category)) map[item.module].push(item.category);
    });
    return map;
  }, [checklist]);

  const allCategories = useMemo(() => Object.values(availableModules).flat(), [availableModules]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (allCategories.length > 0 && selectedCategories.length === 0) setSelectedCategories(allCategories);
  }, [allCategories]);

  const handleToggleCategory = (category: string) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const handleToggleModule = (module: string, moduleCats: string[]) => {
    const isAllSelected = moduleCats.every(c => selectedCategories.includes(c));
    setSelectedCategories(prev => isAllSelected ? prev.filter(c => !moduleCats.includes(c)) : Array.from(new Set([...prev, ...moduleCats])));
  };

  const filteredChecklist = useMemo(() => checklist?.filter(item => selectedCategories.includes(item.category)) || [], [checklist, selectedCategories]);
  const progress = useMemo(() => {
    if (filteredChecklist.length === 0) return 0;
    const completed = filteredChecklist.filter(c => session.items[c.id]?.status && session.items[c.id]?.status !== AuditStatus.PENDING).length;
    return Math.round((completed / filteredChecklist.length) * 100);
  }, [filteredChecklist, session.items]);

  const groupedChecklist = useMemo(() => {
    const groups: { [key: string]: ChecklistItem[] } = {};
    filteredChecklist.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredChecklist]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
      <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Đang tải checklist...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <SessionBar 
         session={session} onUpdateSession={(u) => setSession(prev => ({ ...prev, ...u }))}
         farmOptions={farmOptions} roleOptions={roleOptions} progress={progress}
         onSave={onSubmit} isSaving={false} availableModules={availableModules}
         selectedCategories={selectedCategories} onToggleCategory={handleToggleCategory} onToggleModule={handleToggleModule}
      />

      <div className="space-y-8">
        {Object.entries(groupedChecklist).map(([category, items]) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{category}</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {items.map(item => (
                <AuditCard key={item.id} item={item} data={session.items[item.id]} onUpdate={updateItem} onPhotoUpload={onPhotoUpload} />
              ))}
            </div>
          </div>
        ))}
        
        {Object.keys(groupedChecklist).length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
            <Filter size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">Hãy chọn khu vực để bắt đầu</p>
          </div>
        )}
      </div>

      {/* Floating Action Button for Submit */}
      <div className="fixed bottom-24 left-0 right-0 px-6 z-40 pointer-events-none">
        <div className="max-w-md mx-auto flex justify-center pointer-events-auto">
          <button 
            onClick={onSubmit}
            className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-300 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
          >
            <CheckCircle2 size={24} />
            Gửi báo cáo ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditPage;