import React, { useEffect, useState } from 'react';
import { HistoryRecord } from '../types';
import { auditApi } from '../services/api';
import { Calendar, User, MapPin, Eye, ArrowLeft, Loader2, FileText } from 'lucide-react';

interface HistoryPageProps {
  onBack: () => void;
  onViewReport: (record: HistoryRecord) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onBack, onViewReport }) => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await auditApi.getHistory();
        if (Array.isArray(data)) {
           setHistory(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Hàm định dạng ngày tháng an toàn
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      // Kiểm tra nếu ngày lỗi thì trả về chuỗi gốc
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Hàm xử lý điểm số an toàn (Chống lỗi NaN và số lẻ dài)
  const formatScore = (val: any) => {
    // 1. Nếu không có giá trị
    if (val === null || val === undefined || val === '') return 0;
    
    // 2. Chuyển hết về chuỗi để xử lý
    let strVal = String(val);
    
    // 3. Thay thế dấu phẩy (,) thành dấu chấm (.) để máy tính hiểu
    // Ví dụ: "57,1" -> "57.1"
    strVal = strVal.replace(',', '.');
    
    // 4. Chuyển sang số thực
    let numVal = parseFloat(strVal);
    
    // 5. Nếu vẫn lỗi (NaN) thì trả về 0
    if (isNaN(numVal)) return 0;
    
    // 6. Làm tròn 1 số lẻ
    return numVal.toFixed(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 pb-20">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack} 
            className="p-3 bg-white rounded-xl shadow-sm text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Lịch sử đánh giá</h1>
            <p className="text-slate-500 font-medium">Xem lại và in báo cáo các lần kiểm tra trước</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center pt-20 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <span className="text-slate-400 font-bold animate-pulse">Đang tải dữ liệu từ Google Sheet...</span>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <FileText size={32} />
                 </div>
                 <p className="text-slate-400 font-bold uppercase">Chưa có dữ liệu lịch sử</p>
               </div>
            ) : (
               history.map((record, index) => (
                 <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all group">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     
                     {/* Cột 1: Thông tin Trại & Thời gian */}
                     <div className="flex-1">
                       <div className="flex items-center gap-2 text-indigo-600 font-black text-lg mb-1">
                          <MapPin size={20}/> {record.farmId}
                       </div>
                       <div className="text-sm text-slate-400 font-bold flex items-center gap-2">
                          <Calendar size={14}/> {formatDate(record.timestamp)}
                       </div>
                     </div>

                     {/* Cột 2: Điểm số (ĐÃ SỬA LỖI HIỂN THỊ) */}
                     <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-2xl font-black ${
                            Number(formatScore(record.score)) >= 80 ? 'text-emerald-600' :
                            Number(formatScore(record.score)) >= 60 ? 'text-amber-500' : 'text-rose-600'
                          }`}>
                            {/* 👇 QUAN TRỌNG: Làm tròn 1 số thập phân */}
                            {formatScore(record.score)}
                          </div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{record.rating}</div>
                        </div>
                     </div>
                     
                     {/* Cột 3: Nút bấm */}
                     <button 
                        onClick={() => onViewReport(record)}
                        className="w-full md:w-auto bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <Eye size={18}/> Xem Báo Cáo
                      </button>
                   </div>
                   
                   {/* Footer nhỏ: Người kiểm tra */}
                   <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs font-bold text-slate-400">
                      <User size={12}/> Người kiểm tra: <span className="text-slate-600">{record.user}</span>
                   </div>
                 </div>
               ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;