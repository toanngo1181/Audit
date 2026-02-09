import React, { useState, useEffect } from "react";
// 👇 [MỚI] Import thêm HistoryRecord
import { View, AuditSession, ChecklistItem, AuditStatus, InputType, HistoryRecord } from "./types";
import Layout from "./components/Layout";
import AdminPage from "./pages/AdminPage";
import AuditPage from "./pages/AuditPage";
// 👇 [MỚI] Import 2 trang mới
import ReportPage from "./pages/ReportPage";
import HistoryPage from "./pages/HistoryPage";
import { auditApi as api } from "./services/api";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.AUDIT);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [farmOptions, setFarmOptions] = useState<string[]>([]);
  const [roleOptions, setRoleOptions] = useState<string[]>([]);
  
  // State lưu dữ liệu báo cáo (Điểm, Nhận xét AI)
  const [reportData, setReportData] = useState<{score: number; rating: string; aiComment: string} | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [session, setSession] = useState<AuditSession>({
    farm: '', role: 'AUDITOR', auditorName: '', startTime: new Date().toISOString(), items: {}
  });

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await api.getChecklist();
      if (Array.isArray(data) && data.length > 0) setChecklist(data);
    } catch (err) {}

    try {
      const settings = await api.getSettings();
      if (settings.farms) setFarmOptions(settings.farms);
      if (settings.roles) setRoleOptions(settings.roles);
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  // 1. XỬ LÝ NHẬP LIỆU
  const handleUpdateItem = (id: string, value: string | number | null, inputType: InputType) => {
    const itemConfig = checklist.find(c => c.id === id);
    if (!itemConfig) return;

    let status = AuditStatus.PASS;
    let autoComment = "Đạt";
    let finalValue = value;

    if (value !== null && value !== "") {
      // Logic cho SỐ
      if (inputType === 'number') {
        finalValue = value; 
        const numVal = parseFloat(value as string);
        
        if (!isNaN(numVal)) {
          const minStr = String(itemConfig.standardMin ?? "");
          const maxStr = String(itemConfig.standardMax ?? "");
          
          // Chỉ so sánh nếu có chuẩn
          if (minStr !== "" && maxStr !== "") {
             const min = parseFloat(minStr);
             const max = parseFloat(maxStr);
             if (numVal < min || numVal > max) {
               status = AuditStatus.FAIL;
               autoComment = `Ngoài chuẩn`;
             } else {
               status = AuditStatus.PASS;
               autoComment = "Đạt chuẩn";
             }
          }
        }
      } 
      // Logic cho YES/NO
      else if (inputType === 'yes_no') {
        if (Number(value) === 0) {
          status = AuditStatus.FAIL;
          autoComment = "Không đạt";
        }
      }
    } else {
      status = AuditStatus.PENDING;
      autoComment = "";
    }

    setSession(prev => ({
      ...prev,
      items: {
        ...prev.items,
        [id]: {
          ...prev.items[id],
          id, status, actualValue: finalValue, autoComment,
          evidenceUrl: prev.items[id]?.evidenceUrl || ""
        }
      }
    }));
  };

  // 2. XỬ LÝ UPLOAD ẢNH
  const handlePhotoUpload = async (id: string, file: File): Promise<string> => {
     try {
      const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
      const base64 = await toBase64(file);
      const url = await api.uploadImage(base64.split(',')[1], file.name);
      
      setSession(prev => ({
        ...prev,
        items: { 
          ...prev.items, 
          [id]: { 
            ...prev.items[id], 
            id: id, 
            evidenceUrl: url 
          } 
        } 
      }));
      return url;
    } catch (err) { return ""; }
  };

  // --- 3. [MỚI] HÀM GỬI BÁO CÁO (Chuyển hướng sang trang Report) ---
  const handleSubmit = async () => {
    if (!session.farm) { alert("⚠️ Chưa chọn Trại!"); return; }
    if (!session.auditorName) { alert("⚠️ Chưa nhập tên Auditor!"); return; }
    
    setLoading(true);
    
    // Tính điểm dự kiến ở Client (phòng khi server lỗi trả về)
    const totalItems = checklist.length;
    const passCount = Object.values(session.items).filter(i => i.status === AuditStatus.PASS).length;
    const clientScore = totalItems > 0 ? Math.round((passCount / totalItems) * 100) : 0;
    
    let clientRating = "Kém";
    if (clientScore >= 95) clientRating = "Xuất sắc";
    else if (clientScore >= 80) clientRating = "Tốt";
    else if (clientScore >= 60) clientRating = "Trung bình";
    else if (clientScore >= 40) clientRating = "Yếu";

    const payload = {
      farmId: session.farm,
      user: session.auditorName,
      role: session.role,
      comment: session.generalComment || "",
      gps: "N/A",
      details: Object.values(session.items).map(item => {
          const config = checklist.find(c => c.id === item.id);
          let standardSnapshot = "Yes/No";
          if (config?.inputType === 'number') {
             standardSnapshot = `${config.standardMin ?? '?'} - ${config.standardMax ?? '?'}`;
          }

          return { 
            ...item, 
            title: config?.title || item.id, 
            unit: config?.unit || "",
            inputType: config?.inputType || "text",
            standardSnapshot: standardSnapshot,
            score: item.status === AuditStatus.PASS ? 1 : 0 
          };
      })
    };

    const res = await api.saveAudit(payload);
    setLoading(false);
    
    if (res.success) {
      // 👇 LOGIC CHUYỂN HƯỚNG SANG TRANG REPORT 👇
      const finalScore = res.score !== undefined ? res.score : clientScore;
      const finalRating = res.rating || clientRating;
      const aiComment = (res as any).aiComment || session.generalComment || "Không có nhận xét.";

      setReportData({
        score: finalScore,
        rating: finalRating,
        aiComment: aiComment
      });

      setCurrentView(View.REPORT); // Chuyển View
    } else {
      alert("❌ Lỗi: " + res.message);
    }
  };

  // --- 4. [MỚI] HÀM XEM LẠI LỊCH SỬ (Tái tạo Session từ dữ liệu cũ) ---
  const handleViewHistoryReport = async (record: HistoryRecord) => {
     setLoading(true);
     try {
       // a. Lấy chi tiết câu trả lời từ Server
       const details = await api.getHistoryDetail(record.sessionId);
       
       // b. Tái tạo lại items của Session
       const reconstructedItems: any = {};
       
       checklist.forEach(c => {
          const found = details.find((d: any) => d.id === c.id);
          if (found) {
            reconstructedItems[c.id] = {
              id: c.id,
              status: found.status,
              actualValue: found.actualValue,
              evidenceUrl: found.evidenceUrl,
              autoComment: found.status === 'PASS' ? 'Đạt' : 'K.Đạt'
            };
          }
       });

       // c. Đổ dữ liệu vào Session
       setSession({
         farm: record.farmId,
         auditorName: record.user,
         role: 'VIEWER', // Chế độ xem
         startTime: record.timestamp,
         items: reconstructedItems,
         generalComment: record.generalComment
       });

       // d. Đổ dữ liệu vào ReportData
       setReportData({
         score: record.score,
         rating: record.rating,
         aiComment: record.generalComment // Dùng comment chung làm AI comment cho lịch sử
       });

       // e. Chuyển sang trang Report
       setCurrentView(View.REPORT);

     } catch (e) {
       console.error(e);
       alert("Lỗi tải chi tiết báo cáo!");
     } finally {
       setLoading(false);
     }
  };

  // --- RENDER GIAO DIỆN ---

  // 1. TRANG ADMIN
  if (currentView === View.ADMIN) {
    const AdminView = AdminPage as any;
    return (
      <AdminView 
        onBack={() => { setCurrentView(View.AUDIT); setTimeout(() => window.location.reload(), 100); }} 
        // Thêm nút chuyển sang lịch sử từ Admin (nếu bác muốn gắn vào)
        onHistory={() => setCurrentView(View.HISTORY)} 
      />
    );
  }

  // 2. [MỚI] TRANG LỊCH SỬ
  if (currentView === View.HISTORY) {
    return (
      <HistoryPage 
        onBack={() => setCurrentView(View.AUDIT)}
        onViewReport={handleViewHistoryReport}
      />
    );
  }

  // 3. [MỚI] TRANG BÁO CÁO (In PDF)
  if (currentView === View.REPORT && reportData) {
    return (
      <ReportPage 
        session={session}
        checklist={checklist}
        score={reportData.score}
        rating={reportData.rating}
        aiComment={reportData.aiComment}
        onBack={() => {
           // Reset form khi quay lại nhập liệu
           setSession({
             farm: '', role: 'AUDITOR', auditorName: '', startTime: new Date().toISOString(), items: {}, generalComment: ''
           });
           setReportData(null);
           setCurrentView(View.AUDIT);
           window.scrollTo(0,0);
        }}
      />
    );
  }

  // 4. TRANG NHẬP LIỆU (Mặc định)
  return (
    <Layout currentView={currentView} setView={setCurrentView}>
        <AuditPage
          checklist={checklist}
          session={session}
          setSession={setSession}
          updateItem={handleUpdateItem} 
          onPhotoUpload={handlePhotoUpload}
          loading={loading}
          error={error}
          refresh={refresh}
          farmOptions={farmOptions}
          roleOptions={roleOptions}
          onSubmit={handleSubmit}
        />
    </Layout>
  );
};

export default App;