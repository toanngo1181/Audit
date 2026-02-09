import React from 'react';
import { ChecklistItem, AuditItemState, AuditStatus, InputType } from '../types';
import { Camera, Check, X, AlertTriangle, Image as ImageIcon, Info } from 'lucide-react';

interface AuditCardProps {
  item: ChecklistItem;
  data?: AuditItemState; 
  onUpdate: (id: string, value: string | number | null, inputType: InputType) => void;
  onPhotoUpload: (id: string, file: File) => Promise<string>;
}

const AuditCard: React.FC<AuditCardProps> = ({ item, data, onUpdate, onPhotoUpload }) => {
  const actualValue = data?.actualValue ?? "";
  const status = data?.status || AuditStatus.PENDING;
  const hasEvidence = !!data?.evidenceUrl;
  const isNumberInput = (item.inputType || "").toString().toLowerCase() === 'number';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await onPhotoUpload(item.id, e.target.files[0]);
    }
  };

  const minStr = String(item.standardMin ?? "");
  const maxStr = String(item.standardMax ?? "");
  const standardDisplay = (minStr !== "" && maxStr !== "") ? `${minStr}-${maxStr}` : "N/A";

  return (
    <div className={`relative p-5 rounded-[1.75rem] border-2 transition-all duration-300 overflow-hidden ${
      status === AuditStatus.FAIL ? 'border-rose-100 bg-white shadow-lg shadow-rose-100/20' : 
      status === AuditStatus.PASS ? 'border-emerald-100 bg-white shadow-lg shadow-emerald-100/20' : 
      'border-white bg-white shadow-sm'
    }`}>
      {/* Header Hạng mục */}
      <div className="flex justify-between items-start gap-4 mb-5">
        <div className="space-y-1">
          <h4 className="font-extrabold text-slate-800 text-base leading-tight">{item.title}</h4>
          {item.description && <p className="text-slate-400 text-[11px] font-medium leading-relaxed">{item.description}</p>}
        </div>
        {isNumberInput && (
          <div className="shrink-0 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
            <span className="block text-[8px] font-black text-slate-400 uppercase leading-none mb-0.5">Chuẩn</span>
            <span className="text-[10px] font-bold text-slate-700 leading-none">{standardDisplay}</span>
          </div>
        )}
      </div>

      {/* Inputs - Thao tác chính */}
      <div className="flex flex-col gap-4">
        {isNumberInput ? (
          <div className="relative group">
            <input
              type="number"
              step="0.01"
              value={actualValue}
              onChange={(e) => onUpdate(item.id, e.target.value, 'number')}
              placeholder="0.0"
              className={`w-full h-14 px-5 rounded-2xl border-2 font-black text-2xl outline-none transition-all ${
                status === AuditStatus.FAIL ? 'border-rose-200 text-rose-600 focus:border-rose-400' :
                status === AuditStatus.PASS ? 'border-emerald-200 text-emerald-600 focus:border-emerald-400' :
                'border-slate-100 bg-slate-50 text-slate-900 focus:border-indigo-300 focus:bg-white'
              }`}
            />
            {item.unit && <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{item.unit}</span>}
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => onUpdate(item.id, 1, 'yes_no')}
              className={`flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
                Number(actualValue) === 1 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 ring-4 ring-emerald-50' 
                  : 'bg-slate-50 text-slate-400 border border-slate-100'
              }`}
            >
              <Check size={18} strokeWidth={3} /> Đạt
            </button>
            <button
              onClick={() => onUpdate(item.id, 0, 'yes_no')}
              className={`flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
                actualValue !== "" && Number(actualValue) === 0 
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 ring-4 ring-rose-50' 
                  : 'bg-slate-50 text-slate-400 border border-slate-100'
              }`}
            >
              <X size={18} strokeWidth={3} /> Không
            </button>
          </div>
        )}

        {/* Action Bar (Photo & Feedback) */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <label className={`flex-1 h-12 rounded-xl border-2 flex items-center justify-center gap-2 transition-all active:scale-95 ${
            hasEvidence ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-transparent text-slate-400'
          }`}>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            {hasEvidence ? <ImageIcon size={18} /> : <Camera size={18} />}
            <span className="text-[11px] font-black uppercase tracking-wider">{hasEvidence ? "Đã có ảnh" : "Chụp bằng chứng"}</span>
          </label>
          
          {data?.autoComment && (
            <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
              status === AuditStatus.FAIL ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
            }`}>
              <Info size={18} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditCard;