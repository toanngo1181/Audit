import { GAS_URL } from "../constants";

export interface DashboardResponse {
  ok: boolean;
  summary: {
    compliance: number;
    auditsToday: number;
    criticalFails: number;
    totalPhotos: number;
  };
  farmRanking: Array<{ farm: string; score: number }>;
  moduleScores: Array<{ module: string; score: number }>;
  trend: Array<{ date: string; score: number }>;
  topFails: Array<{ item: string; fails: number }>;
  error?: string;
}

export const dashboardApi = {
  fetchDashboard: async (): Promise<DashboardResponse> => {
    try {
      // Đảm bảo action=dashboard được gửi chính xác đến GAS
      const url = `${GAS_URL}?action=dashboard`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`Lỗi mạng: ${res.status}`);
      }

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Phản hồi không hợp lệ từ máy chủ (JSON Error)");
      }

      if (data.ok === false || data.error) {
        throw new Error(data.error || "Lỗi không xác định từ máy chủ");
      }

      return data;
    } catch (err: any) {
      console.error("Dashboard API Error:", err);
      throw err;
    }
  }
};