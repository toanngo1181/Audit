
import { useState, useEffect, useCallback } from 'react';
import { dashboardApi, DashboardResponse } from '../services/dashboardApi';

export function useDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardApi.fetchDashboard();
      setData(result);
      setLastUpdated(result.lastUpdated || null);
    } catch (err: any) {
      setError(err.message || "Không thể đồng bộ dữ liệu báo cáo từ Google Sheet");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refresh: loadData, lastUpdated };
}
