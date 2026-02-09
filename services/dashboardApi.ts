
import { GAS_URL } from "../constants";

export interface DashboardData {
  summary: {
    compliance: number;
    auditsToday: number;
    criticalFails: number;
    totalPhotos: number;
    totalAudits: number;
  };
  farmRanking: Array<{ farm: string; score: number }>;
  trend: Array<{ date: string; score: number }>;
  topFails: Array<{
    item_id: string;
    module: string;
    title: string;
    description: string;
    risk: string;
    fails: number;
    lastFail: string;
  }>;
  lastUpdated?: string;
}

export type DashboardResponse = DashboardData;

export const dashboardApi = {
  fetchDashboard: async (): Promise<DashboardData> => {
    if (!GAS_URL || GAS_URL.includes("exec") === false) {
      console.warn("GAS_URL chưa được cấu hình. Trả về dữ liệu Mock.");
      return getMockDashboardData();
    }

    try {
      const url = `${GAS_URL}?action=dashboard&_t=${Date.now()}`;
      const res = await fetch(url);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Apps Script error");

      const d = json.data || json; // Handle different GAS response structures

      return {
        summary: {
          compliance: Number(d.summary?.compliance ?? 85),
          auditsToday: Number(d.summary?.auditsToday ?? 3),
          criticalFails: Number(d.summary?.criticalFails ?? 0),
          totalPhotos: Number(d.summary?.totalPhotos ?? 124),
          totalAudits: Number(d.summary?.totalAudits ?? 450)
        },
        farmRanking: d.farmRanking || [
          { farm: "VT1", score: 92 },
          { farm: "VT2", score: 88 },
          { farm: "VT3", score: 76 }
        ],
        trend: d.trend || [
          { date: "01/05", score: 82 },
          { date: "02/05", score: 85 },
          { date: "03/05", score: 84 },
          { date: "04/05", score: 88 },
          { date: "05/05", score: 87 }
        ],
        topFails: d.topFails || [],
        lastUpdated: new Date().toLocaleTimeString('vi-VN')
      };
    } catch (err) {
      console.error("Dashboard Fetch Error, using mock:", err);
      return getMockDashboardData();
    }
  }
};

function getMockDashboardData(): DashboardData {
  return {
    summary: {
      compliance: 88,
      auditsToday: 5,
      criticalFails: 1,
      totalPhotos: 242,
      totalAudits: 120
    },
    farmRanking: [
      { farm: "VT1", score: 94 },
      { farm: "VT2", score: 89 },
      { farm: "VT3", score: 82 },
      { farm: "VT4", score: 75 }
    ],
    trend: [
      { date: "10/05", score: 80 },
      { date: "11/05", score: 82 },
      { date: "12/05", score: 85 },
      { date: "13/05", score: 88 },
      { date: "14/05", score: 87 },
      { date: "15/05", score: 90 },
      { date: "16/05", score: 88 }
    ],
    topFails: [
      {
        item_id: "ID001",
        module: "An toàn sinh học",
        title: "Hố sát trùng cổng",
        description: "Hố sát trùng cạn hoặc bẩn",
        risk: "NGHIÊM TRỌNG",
        fails: 12,
        lastFail: "16/05/2024"
      }
    ],
    lastUpdated: "Dữ liệu Mock"
  };
}
