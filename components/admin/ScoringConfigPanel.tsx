
import React, { useState } from 'react';
import { ModuleConfig, ScoringConfig, ChecklistItem } from '../../types';
import { T } from '../../constants/i18n';
import { ShieldAlert, Weight, Save, Settings2 } from 'lucide-react';

interface ScoringConfigPanelProps {
  checklist: ChecklistItem[];
  moduleConfigs: ModuleConfig[];
  scoringConfig: ScoringConfig;
  onSave: (modules: ModuleConfig[], scoring: ScoringConfig) => Promise<void>;
}

export const ScoringConfigPanel: React.FC<ScoringConfigPanelProps> = ({ 
  checklist, moduleConfigs: initialModules, scoringConfig: initialScoring, onSave 
}) => {
  const [moduleConfigs, setModuleConfigs] = useState(initialModules);
  const [scoring, setScoring] = useState(initialScoring);
  const [saving, setSaving] = useState(false);

  const modules = Array.from(new Set(checklist.map(item => item.module)));

  React.useEffect(() => {
    setModuleConfigs(prev => {
      const existing = prev.map(p => p.module);
      const missing = modules.filter(m => !existing.includes(m)).map(m => ({ module: m, module_weight: 1 }));
      return [...prev, ...missing];
    });
  }, [checklist]);

  const handleModuleWeightChange = (mod: string, weight: number) => {
    setModuleConfigs(prev => prev.map(p => p.module === mod ? { ...p, module_weight: weight } : p));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Weight className="text-indigo-600" size={24} />
            <h3 className="text-xl font-black text-slate-800">{T.admin.module_importance}</h3>
          </div>
          <p className="text-slate-500 text-sm">{T.admin.assign_weights}</p>
          
          <div className="space-y-4">
            {moduleConfigs.map(mc => (
              <div key={mc.module} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-700 text-sm">{mc.module}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase">{T.admin.weight}</span>
                  <input 
                    type="number"
                    className="w-16 bg-white border border-slate-200 rounded-lg py-1 px-2 text-center text-sm font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                    value={mc.module_weight}
                    min={1}
                    max={10}
                    onChange={(e) => handleModuleWeightChange(mc.module, parseInt(e.target.value))}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-8">
          <div className="flex items-center gap-3">
            <Settings2 className="text-indigo-600" size={24} />
            <h3 className="text-xl font-black text-slate-800">{T.admin.logic_settings}</h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-rose-50 rounded-3xl border border-rose-100">
              <div className="flex items-center gap-4">
                <ShieldAlert className="text-rose-500" size={32} />
                <div>
                  <h4 className="font-black text-rose-900 text-sm">{T.admin.critical_override}</h4>
                  <p className="text-rose-700 text-[10px] max-w-[150px]">{T.admin.critical_desc}</p>
                </div>
              </div>
              <button 
                onClick={() => setScoring(prev => ({ ...prev, criticalRuleEnabled: !prev.criticalRuleEnabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${scoring.criticalRuleEnabled ? 'bg-rose-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${scoring.criticalRuleEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="space-y-4">
               <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest ml-2">{T.admin.score_caps}</h4>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{T.admin.critical_cap}</span>
                    <input 
                      type="number"
                      className="w-full bg-transparent font-black text-xl text-rose-600 border-none focus:ring-0"
                      value={scoring.criticalLimit}
                      onChange={(e) => setScoring(prev => ({ ...prev, criticalLimit: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{T.admin.green_threshold}</span>
                    <input 
                      type="number"
                      className="w-full bg-transparent font-black text-xl text-emerald-600 border-none focus:ring-0"
                      value={scoring.thresholds.green}
                      onChange={(e) => setScoring(prev => ({ ...prev, thresholds: { ...prev.thresholds, green: parseInt(e.target.value) } }))}
                    />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={() => { setSaving(true); onSave(moduleConfigs, scoring).finally(() => setSaving(false)); }}
          disabled={saving}
          className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 disabled:opacity-50"
        >
          {saving ? T.admin.updating : <><Save size={20} /> {T.admin.sync_logic}</>}
        </button>
      </div>
    </div>
  );
};
