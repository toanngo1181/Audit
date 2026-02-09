// ==========================================
// 1. ENUMS & CONSTANTS
// ==========================================

export enum View {
  DASHBOARD = 'DASHBOARD',
  AUDIT = 'AUDIT',
  ADMIN = 'ADMIN',
  REPORT = 'REPORT',  // Đã có
  HISTORY = 'HISTORY' // Đã có
}

export enum RiskLevel {
  LOW = 'NHỎ',
  MEDIUM = 'VỪA',
  HIGH = 'LỚN',
  CRITICAL = 'NGHIÊM TRỌNG'
}

export enum AuditStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  PENDING = 'PENDING'
}

// Định nghĩa kiểu nhập liệu
export type InputType = 'number' | 'yes_no' | 'photo' | 'scale' | 'text';

// Quy tắc chụp ảnh
export type PhotoRule = 'always' | 'on_fail' | 'none';

// ==========================================
// 2. MASTER DATA (Cấu trúc câu hỏi từ Sheet Master)
// ==========================================

export interface ChecklistItem {
  id: string;          // Col A
  module: string;      // Col B
  category: string;    // Col C
  title: string;       // Col D
  description: string; // Col E
  
  // --- Các trường thông minh ---
  inputType: InputType;      // Col F
  standardMin?: number | string;      // Col G
  standardMax?: number | string;      // Col H
  unit?: string;             // Col I
  photoRule: PhotoRule;      // Col J
  
  risk: string;        // Col K
  weight: number;      // L
  
  failMessage?: string;      // Col M
  remediationGuide?: string; // Col N
}

// ==========================================
// 3. AUDIT STATE (Trạng thái câu trả lời trên App)
// ==========================================

export interface AuditItemState {
  id: string;
  status: AuditStatus;
  
  // Dữ liệu thực tế nhập vào
  actualValue: string | number | null; 
  
  // Ghi chú & Nhận xét
  notes: string;          
  autoComment: string;    // Máy tự chấm
  
  // Ảnh minh chứng
  evidenceUrl?: string;   
  photos?: string[];

  // Snapshot chuẩn
  standardSnapshot: string; 
}

export interface AuditSession {
  farm: string;
  role: string;
  auditorName: string; 
  gpsLocation?: string;
  startTime: string;
  
  // Map ID câu hỏi -> Trạng thái trả lời
  items: Record<string, AuditItemState>;
  generalComment?: string;
}

// ==========================================
// 4. API PAYLOAD (Gói tin gửi về Backend)
// ==========================================

export interface SubmitDetailItem {
  id: string;
  title: string;
  inputType: InputType;
  standardSnapshot: string;
  actualValue: string | number;
  unit?: string;
  status: AuditStatus;
  score: number;
  reason?: string;
  autoComment?: string;
  evidenceUrl?: string;
  weight: number;
}

export interface SubmitPayload {
  farmId: string;
  user: string;
  gps: string;
  details: SubmitDetailItem[];
}

// ==========================================
// 5. CONFIG & SCORING
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  sessionId?: string;
}

export interface ModuleConfig {
  module: string;
  module_weight: number;
}

export interface ScoringConfig {
  criticalRuleEnabled: boolean;
  criticalLimit: number;
  thresholds: {
    green: number;
    yellow: number;
    orange: number;
  };
}

export interface ModuleScore {
  module: string;
  score: number;
  totalWeight: number;
  earnedWeight: number;
  moduleWeight: number;
}

export interface FarmAuditResult {
  finalScore: number;
  moduleScores: ModuleScore[];
  criticalFail: boolean;
  totalItems: number;
  completedItems: number;
}

// ==========================================
// 6. HISTORY DATA (PHẦN BỔ SUNG MỚI)
// ==========================================

// 👇👇👇 ĐÂY LÀ PHẦN QUAN TRỌNG ĐANG THIẾU 👇👇👇
export interface HistoryRecord {
  sessionId: string;
  timestamp: string;
  farmId: string;
  user: string;
  score: number;
  rating: string;
  generalComment: string;
}