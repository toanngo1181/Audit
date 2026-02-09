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
  checklist,
  session,
  setSession,
  updateItem,
  onPhotoUpload,
  loading,
  error,
  refresh,
  farmOptions,
  roleOptions,
  onSubmit
}) => {

  // --- 1. LOGIC PHÂN TÍCH MODULE & CATEGORY ---
  // Tạo danh sách Module và Category từ Checklist gốc
  const availableModules = useMemo(() => {
    const map: Record<string, string[]> = {};
    if (checklist) {
      checklist.forEach(item => {
        if (!map[item.module]) {
          map[item.module] = [];
        }
        if (!map[item.module].includes(item.category)) {
          map[item.module].push(item.category);
        }
      });
    }
    return map;
  }, [checklist]);

  // Lấy danh sách tất cả Category ID để mặc định chọn hết
  const allCategories = useMemo(() => 
    Object.values(availableModules).flat(), 
  [availableModules]);

  // --- 2. STATE QUẢN LÝ BỘ LỌC ---
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Tự động chọn TẤT CẢ khi dữ liệu vừa tải xong
  useEffect(() => {
    if (allCategories.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories(allCategories);
    }
  }, [allCategories]);

  // --- 3. CÁC HÀM XỬ LÝ LỌC ---
  const handleToggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category); // Bỏ chọn
      } else {
        return [...prev, category]; // Chọn thêm
      }
    });
  };

  const handleToggleModule = (module: string, moduleCats: string[]) => {
    const isAllSelected = moduleCats.every(c => selectedCategories.includes(c));
    if (isAllSelected) {
      // Bỏ chọn cả Module
      setSelectedCategories(prev => prev.filter(c => !moduleCats.includes(c)));
    } else {
      // Chọn cả Module (giữ lại các cái khác)
      const otherCats = selectedCategories.filter(c => !moduleCats.includes(c));
      setSelectedCategories([...otherCats, ...moduleCats]);
    }
  };

  // --- 4. LỌC CHECKLIST THEO LỰA CHỌN ---
  const filteredChecklist = useMemo(() => {
    if (!checklist) return [];
    // Chỉ lấy những item thuộc category đang được chọn
    return checklist.filter(item => selectedCategories.includes(item.category));
  }, [checklist, selectedCategories]);

  // --- 5. TÍNH TOÁN TIẾN ĐỘ (Dựa trên danh sách ĐÃ LỌC) ---
  const progress = useMemo(() => {
    if (!filteredChecklist || filteredChecklist.length === 0) return 0;
    const completed = filteredChecklist.filter(c => 
      session.items[c.id]?.status && session.items[c.id]?.status !== AuditStatus.PENDING
    ).length;
    return Math.round((completed / filteredChecklist.length) * 100);
  }, [filteredChecklist, session.items]);

  // --- 6. GOM NHÓM ĐỂ HIỂN THỊ (Dựa trên danh sách ĐÃ LỌC) ---
  const groupedChecklist = useMemo(() => {
    const groups: { [key: string]: ChecklistItem[] } = {};
    filteredChecklist.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredChecklist]);

  // --- RENDER ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pt-10 px-4">
        <div className="rounded-[2rem] border border-rose-100 bg-rose-50 p-8 text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
          <p className="text-lg text-rose-700 font-bold">{error}</p>
          <button onClick={refresh} className="px-8 py-3 bg-white border border-rose-200 text-rose-700 font-bold rounded-xl shadow-sm">
            <RefreshCw className="inline mr-2" /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-40 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* THANH SESSION BAR (Đã có đủ Input + Filter) */}
      <SessionBar 
         session={session}
         onUpdateSession={(updates) => setSession(prev => ({ ...prev, ...updates }))}
         farmOptions={farmOptions}
         roleOptions={roleOptions}
         progress={progress}
         onSave={onSubmit}
         isSaving={false}
         // Props cho bộ lọc
         availableModules={availableModules}
         selectedCategories={selectedCategories}
         onToggleCategory={handleToggleCategory}
         onToggleModule={handleToggleModule}
      />

      {/* NỘI DUNG ĐÁNH GIÁ */}
      <div className="space-y-10 px-1">
        {Object.keys(groupedChecklist).length > 0 ? (
          // Trường hợp CÓ dữ liệu
          Object.entries(groupedChecklist).map(([category, items], idx) => (
            <div key={category} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-50">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg shadow-inner">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">{category}</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {items.map(item => (
                  <AuditCard
                    key={item.id}
                    item={item}
                    data={session.items[item.id]}
                    onUpdate={updateItem}
                    onPhotoUpload={onPhotoUpload}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          // Trường hợp KHÔNG chọn khu vực nào
          <div className="text-center py-20">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Filter size={32} />
            </div>
            <p className="text-slate-500 font-medium text-lg">Bạn chưa chọn khu vực nào.</p>
            <p className="text-slate-400 text-sm mt-2">Hãy bấm vào nút <b>"Khu vực"</b> trên thanh công cụ để chọn.</p>
          </div>
        )}
      </div>

      {/* KHU VỰC NHẬN XÉT */}
      {filteredChecklist.length > 0 && (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mx-1 mb-32">
          <h3 className="text-lg font-bold text-slate-800 uppercase mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">✍️</span>
            Nhận xét & Kết luận
          </h3>
          <textarea
            value={session.generalComment || ""}
            onChange={(e) => setSession(prev => ({ ...prev, generalComment: e.target.value }))}
            placeholder="Nhập nhận xét tổng quan về đợt kiểm tra này (Ví dụ: Trại vệ sinh tốt, cần khắc phục mái che...)"
            className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none min-h-[120px] text-slate-700 font-medium transition-all"
          />
        </div>
      )}

      {/* THANH GỬI BÁO CÁO (Footer) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white/95 backdrop-blur-xl border-t border-slate-200 z-[40] flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col pl-2">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TIẾN ĐỘ</span>
           <div className="flex items-baseline gap-2">
             <span className="text-2xl font-black text-slate-900 leading-none">{progress}%</span>
             {progress > 0 && (
               <span className={`text-xs font-bold px-2 py-1 rounded ${
                 progress >= 80 ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
               }`}>
                 {progress >= 95 ? "Xuất sắc" : progress >= 80 ? "Tốt" : "Đang làm"}
               </span>
             )}
           </div>
        </div>
        
        <button 
          onClick={onSubmit}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200/50 flex items-center gap-3 hover:bg-indigo-600 transition-all active:scale-95"
        >
          <CheckCircle2 className="w-6 h-6" />
          <span>Gửi báo cáo</span>
        </button>
      </div>
    </div>
  );
};

export default AuditPage;