// Link Web App của bác
const API_URL = 'https://script.google.com/macros/s/AKfycbxR0sXA7XiyBMC3ckSzGpvwPSpoEOasyBNolNyn296V-DMUenUfQ8sFneWGFrm8nAMg/exec'; 

export const auditApi = {
  // 1. Hàm lấy câu hỏi
  getChecklist: async () => {
    try {
      const response = await fetch(`${API_URL}?action=getChecklist`, {
        method: 'GET',
        credentials: 'omit', // Quan trọng: Chặn Cookie gây lỗi
        redirect: 'follow'
      });
      const text = await response.text();
      // Chặn lỗi nếu server trả về HTML lỗi
      if (text.trim().startsWith("<")) throw new Error("Server trả về HTML lỗi");
      return JSON.parse(text);
    } catch (error) {
      console.error("Lỗi lấy checklist:", error);
      return [];
    }
  },

  // 2. Hàm upload ảnh
  uploadImage: async (base64: string, filename: string): Promise<string> => {
    try {
      const body = JSON.stringify({ action: 'uploadImage', base64, filename });
      
      const response = await fetch(API_URL, {
        method: 'POST',
        credentials: 'omit',
        body: body,
        headers: { "Content-Type": "text/plain;charset=utf-8" },
      });
      
      const json = await response.json();
      return json.url || "";
    } catch (error) {
      console.error("Lỗi upload:", error);
      return "Error_Upload_Failed";
    }
  },

  // 3. Hàm Gửi Báo Cáo (Trả về Điểm số + Xếp loại + AI Comment)
  saveAudit: async (payload: any): Promise<{ success: boolean; message?: string; score?: number; rating?: string; aiComment?: string }> => {
    const body = payload.action ? JSON.stringify(payload) : JSON.stringify({
      action: 'submitAudit',
      payload: payload
    });

    console.log("🚀 Đang gửi dữ liệu:", payload);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        credentials: 'omit',
        body: body,
        headers: { "Content-Type": "text/plain;charset=utf-8" },
      });
      const text = await response.text();
      
      try {
         const json = JSON.parse(text);
         if (json.success || json.ok) {
           return { 
             success: true, 
             message: "Đã lưu thành công",
             score: json.score,   // Nhận điểm
             rating: json.rating, // Nhận xếp loại
             aiComment: json.aiComment // Nhận lời khuyên AI
           };
         } else {
           return { success: false, message: "Lỗi Server: " + (json.message || "Unknown") };
         }
      } catch (e) {
         return { success: true, message: "Đã gửi (Phản hồi lạ)" };
      }
    } catch (err) {
      console.error("❌ Lỗi mạng/CORS:", err);
      return { success: false, message: "Lỗi kết nối. Vui lòng thử lại!" };
    }
  },

  submitAuditResult: async (payload: any) => {
    return auditApi.saveAudit(payload);
  },

  // 4. Hàm lấy danh sách Trại/Role (Cho Admin & Dropdown)
  getSettings: async () => {
    try {
      const response = await fetch(`${API_URL}?action=getSettings`, {
        method: 'GET',
        credentials: 'omit', 
        redirect: 'follow'
      });
      
      const text = await response.text();
      return JSON.parse(text); 
    } catch (error) {
      console.error("Lỗi lấy settings:", error);
      return { farms: [], roles: [] };
    }
  },

  // 5. Hàm lưu danh sách mới (Cho Admin)
  saveSettings: async (farms: string[], roles: string[]) => {
    const body = JSON.stringify({
      action: 'saveSettings',
      payload: { farms, roles }
    });
    
    return new Promise((resolve) => {
      fetch(API_URL, {
        method: 'POST',
        credentials: 'omit',
        body: body,
        headers: { "Content-Type": "text/plain;charset=utf-8" },
      })
      .then(() => resolve({ success: true }))
      .catch(() => resolve({ success: false }));
    });
  },

  // 6. Lấy danh sách lịch sử báo cáo (MỚI)
  getHistory: async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        credentials: 'omit',
        body: JSON.stringify({ action: 'getHistory', payload: {} }),
        headers: { "Content-Type": "text/plain;charset=utf-8" },
      });
      const json = await response.json();
      return Array.isArray(json) ? json : [];
    } catch (error) {
      console.error("Lỗi lấy lịch sử:", error);
      return [];
    }
  },

  // 7. Lấy chi tiết 1 bài đánh giá cũ (MỚI)
  getHistoryDetail: async (sessionId: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        credentials: 'omit',
        body: JSON.stringify({ action: 'getHistoryDetail', payload: { sessionId } }),
        headers: { "Content-Type": "text/plain;charset=utf-8" },
      });
      return await response.json();
    } catch (error) {
      console.error("Lỗi lấy chi tiết lịch sử:", error);
      return [];
    }
  }
};