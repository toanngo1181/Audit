
import { useState, useEffect, useCallback } from 'react';
import { 
  ChecklistItem, 
  AuditSession, 
  AuditItemState, 
  AuditStatus, 
  SubmitPayload,
  SubmitDetailItem,
} from '../types';
// Fix: Import auditApi as apiService instead of everything as apiService
import { auditApi as apiService } from '../services/api';

// Giá trị khởi tạo cho một phiên Audit mới
const initialSession: AuditSession = {
  farm: 'VT1', // Mặc định, có thể sửa logic để chọn farm
  role: 'Auditor',
  auditorName: 'Dr. Toàn',
  startTime: new Date().toISOString(),
  items: {}
};

export const useChecklist = () => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [session, setSession] = useState<AuditSession>(initialSession);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Load danh sách câu hỏi từ Google Sheet khi mở App
  const loadChecklist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fix: apiService is now the auditApi object
      const data = await apiService.getChecklist();
      setChecklist(data);
    } catch (err) {
      setError('Không thể tải dữ liệu câu hỏi. Vui lòng kiểm tra mạng.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChecklist();
  }, [loadChecklist]);

  // 2. Hàm update Logic (Tự động chấm điểm)
  // CẬP NHẬT: Signature phù hợp với AuditPage (id, updates)
  const updateItem = (
    itemId: string, 
    updates: Partial<AuditItemState>
  ) => {
    const itemConfig = checklist.find(c => c.id === itemId);
    if (!itemConfig) return;

    setSession(prev => {
      const currentState = prev.items[itemId] || {
        id: itemId,
        status: AuditStatus.PENDING,
        actualValue: null,
        notes: '',
        autoComment: '',
        photos: [],
        standardSnapshot: ''
      };

      const nextState = { ...currentState, ...updates };

      // Nếu có cập nhật giá trị thực tế, chạy logic chấm điểm tự động
      if ('actualValue' in updates) {
        const value = updates.actualValue;
        let status: AuditStatus = AuditStatus.PASS; 
        let autoComment = 'Đạt chuẩn';
        let finalValue = value;

        if (itemConfig.inputType === 'number') {
          const numVal = typeof value === 'string' ? parseFloat(value) : (value as number);
          finalValue = numVal;

          if (isNaN(numVal)) {
            status = AuditStatus.FAIL;
            autoComment = 'Dữ liệu không hợp lệ';
          } else {
            // Fix: Parse standardMin and standardMax to numbers to ensure type safety during comparison
            const parseToNumber = (val: any, defaultVal: number): number => {
              if (val === undefined || val === null || val === '') return defaultVal;
              const n = typeof val === 'string' ? parseFloat(val) : Number(val);
              return isNaN(n) ? defaultVal : n;
            };
            
            const min = parseToNumber(itemConfig.standardMin, -Infinity);
            const max = parseToNumber(itemConfig.standardMax, Infinity);

            if (numVal < min || numVal > max) {
              status = AuditStatus.FAIL;
              autoComment = itemConfig.failMessage || `Ngoài vùng cho phép (${min}-${max})`;
            }
          }
        } else if (itemConfig.inputType === 'yes_no') {
          if (Number(value) !== 1) {
             status = AuditStatus.FAIL;
             autoComment = itemConfig.failMessage || 'Không đạt yêu cầu';
          }
        }
        
        nextState.status = status;
        nextState.autoComment = autoComment;
        nextState.actualValue = finalValue;
        
        if (!nextState.standardSnapshot) {
           nextState.standardSnapshot = itemConfig.inputType === 'number' 
              ? `${itemConfig.standardMin}-${itemConfig.standardMax}`
              : 'Chuẩn';
        }
      }

      return {
        ...prev,
        items: {
          ...prev.items,
          [itemId]: nextState
        }
      };
    });
  };

  // 3. Hàm Upload Ảnh
  const uploadPhoto = async (file: File): Promise<string> => {
    try {
      // Convert file sang Base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Lấy phần data sau dấu phẩy (bỏ prefix data:image/jpeg;base64,)
            const result = reader.result as string;
            resolve(result.split(',')[1]); 
        };
        reader.onerror = error => reject(error);
      });

      // Gọi API upload - Fix: it returns string directly as configured in api.ts
      const url = await apiService.uploadImage(base64, file.name);
      return url; // Trả về link Drive
    } catch (err) {
      console.error("Upload failed", err);
      throw new Error("Lỗi upload ảnh");
    }
  };

  // 4. Hàm Gửi Dữ liệu (Submit Audit)
  const submitAudit = async () => {
    setLoading(true);
    try {
      // Chuyển đổi từ Session State sang Payload chuẩn gửi đi
      const details: SubmitDetailItem[] = Object.values(session.items).map(itemState => {
        const config = checklist.find(c => c.id === itemState.id);
        return {
          id: itemState.id,
          title: config?.title || '',
          inputType: config?.inputType || 'text',
          standardSnapshot: itemState.standardSnapshot,
          actualValue: itemState.actualValue ?? '',
          unit: config?.unit,
          status: itemState.status,
          score: itemState.status === AuditStatus.PASS ? (config?.weight || 0) : 0,
          reason: itemState.notes,
          autoComment: itemState.autoComment,
          evidenceUrl: itemState.evidenceUrl,
          weight: config?.weight || 0
        };
      });

      const payload: SubmitPayload = {
        farmId: session.farm,
        user: session.auditorName,
        gps: session.gpsLocation || '', 
        details
      };

      // Fix: Use submitAuditResult alias
      await apiService.submitAuditResult(payload);
      
      // Reset sau khi thành công
      alert("Đã lưu thành công!");
      setSession(initialSession); 

    } catch (err) {
      setError('Lỗi khi lưu dữ liệu. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    checklist,
    session,
    setSession,
    updateItem,
    submitAudit,
    uploadPhoto,
    loading,
    error,
    refresh: loadChecklist
  };
};
