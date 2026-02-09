
import React, { useEffect, useState } from 'react';
import { auditApi as api } from '../services/api'; 
import { ChecklistItem, ModuleConfig, ScoringConfig } from '../types';
import { ChecklistTable } from '../components/admin/ChecklistTable';
import { ScoringConfigPanel } from '../components/admin/ScoringConfigPanel';
import { DEFAULT_SCORING_CONFIG } from '../services/scoring';
import { T } from '../constants/i18n';
import { 
  Loader2, ShieldCheck, Settings2, Table as TableIcon, 
  Cpu, Database, LayoutGrid, Info, Zap
} from 'lucide-react';

const AdminPage: React.FC = () => {
  const [tab, setTab] = useState<'checklist' | 'logic'>('logic');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [moduleConfigs, setModuleConfigs] = useState<ModuleConfig[]>([]);
  const [scoringConfig, setScoringConfig] = useState<ScoringConfig>(DEFAULT_SCORING_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getChecklist()
    .then((checklistItems) => {
      setItems(checklistItems);
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, []);

  const handleSaveChecklist = async (newItems: ChecklistItem[]) => {
    // Fix: Cast the response to any or typed object to access success property
    const res = await api.saveAudit({ action: 'saveChecklist', items: newItems }) as { success: boolean };
    if (res.success) {
      setItems(newItems);
      alert(T.admin.master_synced);
    }
  };

  const handleSaveScoring = async (modules: ModuleConfig[], scoring: ScoringConfig) => {
    setModuleConfigs(modules);
    setScoringConfig(scoring);
    alert(T.admin.logic_updated);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-8">
      <div className="relative">
        <Loader2 className="w-20 h-20 text-indigo-600 animate-spin" />
        <Cpu className="absolute inset-0 m-auto text-indigo-400 opacity-30 animate-pulse" size={32} />
      </div>
      <p className="text-slate-400 font-black uppercase text-xs tracking-[0.4em] animate-pulse">{T.admin.securing}</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Admin Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-indigo-600">
            <div className="bg-indigo-600/10 p-2.5 rounded-2xl">
              <ShieldCheck size={28} />
            </div>
            <span className="font-black uppercase text-sm tracking-[0.3em]">{T.admin.console}</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none">{T.admin.title}</h1>
          <p className="text-slate-500 font-bold text-lg">Cấu hình tham số lõi và quản trị dữ liệu vận hành.</p>
        </div>

        <div className="bg-white p-3 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 flex gap-2 self-start lg:self-auto">
          <button 
            onClick={() => setTab('logic')}
            className={`flex items-center gap-3 px-10 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all duration-300 ${
              tab === 'logic' 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Settings2 size={18} /> {T.admin.logic_tab}
          </button>
          <button 
            onClick={() => setTab('checklist')}
            className={`flex items-center gap-3 px-10 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all duration-300 ${
              tab === 'checklist' 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <TableIcon size={18} /> {T.admin.checklist_tab}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 shadow-sm group hover:border-indigo-100 transition-colors">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
            <LayoutGrid size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Tổng hạng mục</p>
            <p className="text-3xl font-black text-slate-900">{items.length}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 shadow-sm group hover:border-emerald-100 transition-colors">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <Database size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Trạng thái Google</p>
            <p className="text-3xl font-black text-slate-900 uppercase">Synced</p>
          </div>
        </div>
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-xl shadow-indigo-200 group hover:bg-indigo-700 transition-colors overflow-hidden relative">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white relative z-10 group-hover:scale-110 transition-transform">
            <Zap size={24} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none mb-2">Tình trạng logic</p>
            <p className="text-3xl font-black text-white">OPTIMIZED</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>

      <div className="transition-all duration-500 bg-slate-50/50 p-1 rounded-[3.5rem] border border-slate-100 min-h-[600px]">
        {tab === 'checklist' ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
             <ChecklistTable items={items} onSave={handleSaveChecklist} />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
             <ScoringConfigPanel 
               checklist={items} 
               moduleConfigs={moduleConfigs} 
               scoringConfig={scoringConfig} 
               onSave={handleSaveScoring} 
             />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 px-8 text-slate-400">
        <Info size={16} />
        <p className="text-[10px] font-bold uppercase tracking-widest">
          Phiên bản hệ thống v2.4.0 • Mọi thay đổi logic sẽ được đồng bộ ngay lập tức tới tất cả thiết bị hiện trường.
        </p>
      </div>
    </div>
  );
};

export default AdminPage;
