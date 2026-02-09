import React from 'react';
import { ChecklistItem, AuditItemState, AuditStatus, InputType } from '../types';
import { Camera, Check, X, AlertTriangle, Image as ImageIcon } from 'lucide-react';

interface AuditCardProps {
  item: ChecklistItem;
  data?: AuditItemState; 
  onUpdate: (id: string, value: string | number | null, inputType: InputType) => void;
  onPhotoUpload: (id: string, file: File) => Promise<string>;
}

const AuditCard: React.FC<AuditCardProps> = ({ 
  item, 
  data, 
  onUpdate, 
  onPhotoUpload 
}) => {
  // Lấy giá trị hiện tại (Chuyển về chuỗi để hiển thị trên Input)
  const actualValue = data?.actualValue !== undefined && data?.actualValue !== null ? data.actualValue : "";
  const status = data?.status || AuditStatus.PENDING;
  const hasEvidence = !!data?.evidenceUrl;

  // Chuẩn hóa loại câu hỏi
  const rawType = (item.inputType || "").toString().toLowerCase().trim();
  const isNumberInput = rawType === 'number';

  // Xử lý khi nhập số (QUAN TRỌNG: Phải cho phép nhập dấu chấm thập phân)
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onUpdate(item.id, val, 'number');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await onPhotoUpload(item.id, e.target.files[0]);
    }
  };

  // Tạo chuỗi hiển thị chuẩn (VD: 24 - 26)
  const minStr = String(item.standardMin ?? "");
  const maxStr = String(item.standardMax ?? "");
  
  const standardDisplay = (minStr !== "" && maxStr !== "") 
    ? `${minStr} - ${maxStr}`
    : "N/A";

  return (
    <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
      status === AuditStatus.FAIL ? 'border-rose-100 bg-rose-50/50' : 
      status === AuditStatus.PASS ? 'border-emerald-100 bg-emerald-50/50' : 
      'border-slate-100 bg-slate-50'
    }`}>
      {/* 1. TIÊU ĐỀ & TIÊU CHUẨN */}
      <div className="mb-4">
        <div className="flex justify-between items-start">
           <h4 className="font-bold text-slate-800 text-lg leading-snug flex-1">{item.title}</h4>
           {/* Hiển thị tiêu chuẩn ngay góc phải */}
           {isNumberInput && (
             <div className="ml-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 text-xs font-bold whitespace-nowrap">
               🎯 Chuẩn: {standardDisplay}
             </div>
           )}
        </div>

        {item.description && <p className="text-slate-500 text-sm mt-1 italic">{item.description}</p>}
      </div>

      {/* 2. KHU VỰC NHẬP LIỆU */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        
        {/* TRƯỜNG HỢP NHẬP SỐ */}
        {isNumberInput ? (
          <div className="flex-1 w-full">
            <div className="relative flex items-center">
              <input
                type="number"
                step="0.01" // Cho phép nhập số lẻ
                value={actualValue}
                onChange={handleNumberChange}
                placeholder={`Nhập kết quả (${item.unit || ''})...`}
                className={`w-full p-4 rounded-xl border-2 font-bold text-xl outline-none transition-colors ${
                  status === AuditStatus.FAIL ? 'border-rose-300 text-rose-600 bg-white' :
                  status === AuditStatus.PASS ? 'border-emerald-300 text-emerald-600 bg-white' :
                  'border-slate-200 text-slate-800 bg-white focus:border-indigo-400'
                }`}
              />
              {item.unit && <span className="absolute right-4 text-slate-400 font-bold text-sm">{item.unit}</span>}
            </div>
            
            {/* Logic báo lỗi/đạt */}
            {actualValue !== "" && (
               <div className={`mt-2 text-xs font-bold flex items-center ${status === AuditStatus.FAIL ? 'text-rose-500' : 'text-emerald-500'}`}>
                 {status === AuditStatus.FAIL ? (
                   <><AlertTriangle size={14} className="mr-1"/> Ngoài khoảng chuẩn ({standardDisplay})</>
                 ) : (
                   <><Check size={14} className="mr-1"/> Đạt chuẩn</>
                 )}
               </div>
            )}
          </div>
        ) : (
          /* TRƯỜNG HỢP NÚT BẤM (YES/NO) */
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => onUpdate(item.id, 1, 'yes_no')}
              className={`flex-1 md:flex-none px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                Number(actualValue) === 1 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-105 ring-2 ring-emerald-300' 
                  : 'bg-white border-2 border-slate-200 text-slate-400 hover:border-emerald-200 hover:text-emerald-500'
              }`}
            >
              <Check size={20} /> ĐẠT
            </button>
            <button
              onClick={() => onUpdate(item.id, 0, 'yes_no')}
              className={`flex-1 md:flex-none px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                actualValue !== "" && Number(actualValue) === 0 
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 scale-105 ring-2 ring-rose-300' 
                  : 'bg-white border-2 border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-500'
              }`}
            >
              <X size={20} /> K.ĐẠT
            </button>
          </div>
        )}

        {/* NÚT CHỤP ẢNH */}
        <label className={`cursor-pointer p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all whitespace-nowrap select-none ${
          hasEvidence ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-slate-200 text-slate-400 hover:bg-slate-50'
        }`}>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {hasEvidence ? <ImageIcon size={24} /> : <Camera size={24} />}
          <span className="font-bold text-sm hidden md:inline">{hasEvidence ? "Đã có ảnh" : "Chụp ảnh"}</span>
        </label>
      </div>
    </div>
  );
};

export default AuditCard;