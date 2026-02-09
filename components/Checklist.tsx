
import React from 'react';
import { ChecklistItem, AuditItemState, AuditStatus, InputType } from '../types';
import { T } from '../constants/i18n';
import AuditCard from './AuditCard';

interface ChecklistProps {
  items: ChecklistItem[];
  itemStates: Record<string, AuditItemState>;
  // Fix: Corrected signature to match AuditCard's expectations
  onItemUpdate: (id: string, value: string | number | null, inputType: InputType) => void;
  // Fix: Corrected signature to match AuditCard's expectations
  onPhotoUpload: (id: string, file: File) => Promise<string>;
}

const Checklist: React.FC<ChecklistProps> = ({ items, itemStates, onItemUpdate, onPhotoUpload }) => {
  const modules = Array.from(new Set(items.map(item => item.module)));

  return (
    <div className="space-y-12 pb-40">
      {modules.map(moduleName => (
        <section key={moduleName} className="space-y-6">
          <div className="flex items-center gap-6 px-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">{moduleName}</h2>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items
              .filter(item => item.module === moduleName)
              .map(item => (
                <div key={item.id} className="animate-in fade-in zoom-in duration-500">
                  <AuditCard
                    item={item}
                    // Fix: Renamed 'state' to 'data' to match AuditCardProps
                    data={itemStates[item.id] || { 
                      id: item.id, 
                      status: AuditStatus.PENDING, 
                      notes: '', 
                      actualValue: null,
                      autoComment: '',
                      standardSnapshot: ''
                    }}
                    onUpdate={onItemUpdate}
                    onPhotoUpload={onPhotoUpload}
                  />
                </div>
              ))}
          </div>
        </section>
      ))}

      {items.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center gap-4">
          <p className="text-slate-400 font-black uppercase text-xs tracking-widest">{T.audit.no_items}</p>
          <p className="text-slate-300 text-sm font-medium">{T.audit.select_farm}</p>
        </div>
      )}
    </div>
  );
};

export default Checklist;
