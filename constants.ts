
/**
 * CONFIGURATION PANEL
 * Thay thế các giá trị dưới đây bằng thông tin từ Google của bạn
 */

// 1) URL Web App (Deploy Apps Script) - PHẢI kết thúc bằng /exec
export const GAS_URL = "https://script.google.com/macros/s/AKfycbxwU6jxgIVwoNiXevA8tloeK4hQ6-SJdWCM2RiVgKtOZrugn4bD2No0pnRvBHgeM0Nn/exec";

// 2) ID Google Sheet (tham chiếu)
export const SPREADSHEET_ID = "1bPUC0qgAxYSajx27Z21qM8OvhFwVReSLEab8JZZ9_6Y";

// 3) ID thư mục Drive ảnh minh chứng
export const DRIVE_FOLDER_ID = "1VnTe7O7Ho3-ZC2RI7g5RpOtAzEmEag4x";

// Gợi ý UI
export const FARMS = ["VT1", "VT2", "VT3", "VT4"];
export const ROLES = ["ALL", "Admin", "Vet", "Supervisor", "Manager", "External Auditor", "General Staff"];

/**
 * Chuẩn hóa risk label để UI tô màu đúng
 */
export const RISK_COLORS: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
  "NHỎ": "bg-blue-100 text-blue-800",
  "LỚN": "bg-orange-100 text-orange-800",
  "NGHIÊM TRỌNG": "bg-red-100 text-red-800",
};

export function normalizeRisk(risk?: string) {
  const r = String(risk || "").trim().toUpperCase();
  if (r === "NHO" || r === "NHỎ") return "NHỎ";
  if (r === "LON" || r === "LỚN") return "LỚN";
  if (r === "NGHIEM TRONG" || r === "NGHIÊM TRỌNG") return "NGHIÊM TRỌNG";
  if (r === "LOW") return "LOW";
  if (r === "MEDIUM") return "MEDIUM";
  if (r === "HIGH") return "HIGH";
  if (r === "CRITICAL") return "CRITICAL";
  return String(risk || "").trim();
}
