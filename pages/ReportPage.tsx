import React, { useState } from 'react';
import { AuditSession, ChecklistItem, AuditStatus } from '../types';
import { Download, ArrowLeft, CheckCircle2, XCircle, MapPin, User, Calendar, Bot, Loader2, FileCheck } from 'lucide-react';

interface ReportPageProps {
  session: AuditSession;
  checklist: ChecklistItem[];
  score: number;
  rating: string;
  aiComment: string;
  onBack: () => void;
}

const ReportPage: React.FC<ReportPageProps> = ({ session, checklist, score, rating, aiComment, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  // --- CẬP NHẬT LOGIC LỌC (QUAN TRỌNG) ---
  // Chỉ gom nhóm những mục ĐÃ CÓ KẾT QUẢ (Khác PENDING)
  // Các mục bác không chọn đánh giá sẽ tự động biến mất khỏi danh sách này
  const groupedItems = React.useMemo(() => {
    const groups: { [key: string]: ChecklistItem[] } = {};
    
    checklist.forEach(item => {
      // Lấy kết quả đánh giá thực tế từ session
      const result = session.items[item.id];

      // 👇 ĐIỀU KIỆN LỌC MỚI: Chỉ lấy nếu Status tồn tại và KHÁC PENDING
      if (result && result.status && result.status !== AuditStatus.PENDING) {
        if (!groups[item.category]) groups[item.category] = [];
        groups[item.category].push(item);
      }
    });
    
    return groups;
  }, [checklist, session.items]);

  // --- CẬP NHẬT LOGIC ẢNH ---
  // Chỉ lấy ảnh của những mục đã đánh giá (tránh trường hợp ảnh rác của mục chưa làm)
  const evidenceItems = Object.values(session.items).filter(i => 
    i.evidenceUrl && i.status && i.status !== AuditStatus.PENDING
  );

  // --- HÀM TẠO PDF THÔNG MINH (GIỮ NGUYÊN) ---
  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    setSuccess(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const w = window as any;
      if (!w.html2canvas || !w.jspdf) {
        throw new Error("Đang tải thư viện PDF... Vui lòng thử lại sau vài giây!");
      }

      const html2canvas = w.html2canvas;
      const { jsPDF } = w.jspdf;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10; 
      const contentWidth = pageWidth - (margin * 2); 
      
      let currentY = margin;

      // Logic này sẽ tự động chỉ chụp những section ĐƯỢC RENDER ra màn hình
      // Do groupedItems đã lọc ở trên, nên các bảng trống sẽ không tồn tại trong DOM
      // => PDF sẽ tự động gọn gàng.
      const sections = document.querySelectorAll('.report-section');

      if (sections.length === 0) {
        throw new Error("Không có nội dung nào được đánh giá để xuất báo cáo!");
      }

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        
        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * contentWidth) / canvas.width;

        if (currentY + imgHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.addImage(imgData, 'PNG', margin, currentY, contentWidth, imgHeight);
        currentY += imgHeight + 5;
      }

      const fileName = `BaoCao_${session.farm.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

    } catch (error: any) {
      console.error("Lỗi tạo PDF:", error);
      alert("❌ Lỗi xuất PDF: " + (error.message || error));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      
      {/* --- LAYER LOADING / SUCCESS --- */}
      {isGenerating && (
        <div className="fixed inset-0 bg-slate-900/80 z-[9999] flex flex-col items-center justify-center text-white backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-4 rounded-full mb-4 shadow-xl shadow-indigo-500/50">
             <Loader2 size={40} className="animate-spin text-indigo-600" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">ĐANG XỬ LÝ TRANG IN...</h2>
          <p className="text-slate-300 mt-2 font-medium">Đang sắp xếp bố cục từng trang A4</p>
        </div>
      )}

      {success && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[9999] flex items-center gap-3 animate-in slide-in-from-top-4 duration-500">
          <FileCheck size={24} />
          <span className="font-bold">Xuất PDF thành công!</span>
        </div>
      )}

      {/* --- THANH CÔNG CỤ --- */}
      <div className="max-w-[210mm] mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <button 
          onClick={onBack} 
          disabled={isGenerating}
          className="w-full md:w-auto flex items-center justify-center gap-2 text-slate-600 font-bold hover:text-slate-900 bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-200 disabled:opacity-50 transition-all"
        >
          <ArrowLeft size={20} /> Quay lại
        </button>
        
        <button 
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="w-full md:w-auto bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95 disabled:opacity-70 disabled:scale-100"
        >
          {isGenerating ? 'Đang xử lý...' : 'Tải Báo Cáo PDF'} <Download size={20} />
        </button>
      </div>

      {/* --- NỘI DUNG BÁO CÁO --- */}
      <div className="max-w-[210mm] mx-auto">
        
        {/* KHỐI 1: HEADER */}
        <div className="report-section bg-white p-8 mb-4 shadow-sm rounded-t-xl border-b-4 border-slate-900">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">BÁO CÁO ĐÁNH GIÁ</h1>
              <p className="text-slate-500 font-bold mt-2 text-sm tracking-widest uppercase">PIGFARM ARCHITECT SYSTEM</p>
            </div>
            <div className="text-right">
               <div className={`inline-block px-4 py-2 font-black text-xl text-white rounded-lg ${
                  score >= 80 ? 'bg-emerald-600' : score >= 60 ? 'bg-amber-500' : 'bg-rose-600'
               }`}>
                  {Number(score).toFixed(1)}/100
               </div>
               <div className="text-sm font-bold text-slate-900 mt-2 uppercase">{rating}</div>
            </div>
          </div>
        </div>

        {/* KHỐI 2: THÔNG TIN CHUNG */}
        <div className="report-section bg-white p-8 mb-4 shadow-sm border border-slate-100">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div className="grid grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase mb-1">
                  <MapPin size={12}/> Trại / Khu vực
                </div>
                <div className="font-bold text-lg text-slate-900">{session.farm || "---"}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase mb-1">
                  <Calendar size={12}/> Thời gian
                </div>
                <div className="font-bold text-lg text-slate-900">
                  {new Date(session.startTime).toLocaleDateString('vi-VN')}
                </div>
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase mb-1">
                  <User size={12}/> Người đánh giá
                </div>
                <div className="font-bold text-lg text-slate-900">{session.auditorName} <span className="text-sm font-normal text-slate-500">({session.role})</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* KHỐI 3: AI NHẬN XÉT (Nếu có) */}
        {aiComment && (
          <div className="report-section bg-white p-8 mb-4 shadow-sm border border-slate-100">
            <div className="bg-indigo-50/50 border-l-4 border-indigo-600 p-6 rounded-r-lg">
              <h3 className="text-indigo-700 font-bold uppercase text-sm mb-3 flex items-center gap-2">
                <Bot size={18}/> Nhận xét & Khuyến nghị của AI
              </h3>
              <p className="text-slate-800 text-justify leading-relaxed whitespace-pre-line text-sm font-medium">
                {aiComment}
              </p>
            </div>
          </div>
        )}

        {/* KHỐI 4...N: CHI TIẾT TỪNG PHẦN (CHỈ RENDER CÁC MỤC ĐÃ LỌC) */}
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="report-section bg-white p-8 mb-4 shadow-sm border border-slate-100">
            <div className="bg-slate-800 px-4 py-2 font-bold text-white text-xs uppercase mb-4 rounded inline-block">
              {category}
            </div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-slate-400 text-[10px] uppercase border-b-2 border-slate-100">
                  <th className="py-3 pl-2 w-[50%]">Tiêu chí</th>
                  <th className="py-3 w-[25%]">Thực tế</th>
                  <th className="py-3 w-[25%] text-right pr-2">Kết quả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => {
                  const result = session.items[item.id];
                  // Do đã lọc ở trên, nên chắc chắn status tồn tại và != PENDING
                  // Tuy nhiên vẫn để fallback cho an toàn
                  const status = result?.status || AuditStatus.PENDING; 
                  return (
                    <tr key={item.id}>
                      <td className="py-3 pl-2 font-medium text-slate-700 align-top">
                        {item.title}
                      </td>
                      <td className="py-3 text-slate-600 align-top text-xs font-semibold">
                        {result?.actualValue !== undefined && result.actualValue !== "" && result.actualValue !== null ? (
                            <span>{result.actualValue} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span></span>
                        ) : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-3 text-right pr-2 align-top">
                        {status === AuditStatus.PASS && <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-full"><CheckCircle2 size={12}/> Đạt</span>}
                        {status === AuditStatus.FAIL && <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-xs bg-rose-50 px-2 py-1 rounded-full"><XCircle size={12}/> K.Đạt</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

        {/* KHỐI: ẢNH (NẾU CÓ) */}
        {evidenceItems.length > 0 && (
          <div className="report-section bg-white p-8 mb-4 shadow-sm border border-slate-100">
            <h3 className="text-slate-900 font-bold uppercase text-sm mb-6 border-b border-slate-200 pb-2">Hình ảnh ghi nhận</h3>
            <div className="grid grid-cols-2 gap-6">
              {evidenceItems.map((item) => (
                <div key={item.id} className="border border-slate-200 p-2 rounded-lg bg-white shadow-sm break-inside-avoid">
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <img src={item.evidenceUrl} className="w-full h-48 object-cover rounded mb-2 bg-slate-50" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase text-center truncate px-2">
                     {checklist.find(c => c.id === item.id)?.title || item.id}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KHỐI: FOOTER */}
        <div className="report-section bg-white p-8 pb-12 shadow-sm rounded-b-xl border-t-2 border-slate-900">
          <div className="flex justify-between">
             <div className="text-center w-1/3">
               <p className="text-[10px] font-bold text-slate-400 uppercase mb-16">Người lập báo cáo</p>
               <p className="font-bold text-slate-900 text-sm uppercase">{session.auditorName}</p>
             </div>
             <div className="text-center w-1/3">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-16">Xác nhận của Trại</p>
                <p className="text-slate-300 italic text-xs">(Ký & Ghi rõ họ tên)</p>
             </div>
          </div>
          <div className="text-center mt-12 pt-6 border-t border-slate-100">
            <p className="text-[10px] text-slate-400">Báo cáo được tạo tự động bởi PigFarm Architect System vào lúc {new Date().toLocaleString('vi-VN')}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportPage;