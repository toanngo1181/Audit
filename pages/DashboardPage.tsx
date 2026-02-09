
import React, { useMemo } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell
} from 'recharts';
import { 
  ShieldCheck, AlertTriangle, Zap, ArrowRight, ClipboardCheck, 
  Camera, Target, RefreshCw, AlertCircle, Clock
} from 'lucide-react';
import ErrorCard from '../components/ErrorCard';
import TopGapCard from '../components/dashboard/TopGapCard';
import { T } from '../constants/i18n';

const DashboardPage: React.FC = () => {
  const { data, loading, error, refresh, lastUpdated } = useDashboard();

  const analysis = useMemo(() => {
    if (!data || !data.summary) return null;
    
    const { summary, farmRanking = [], topFails = [], trend = [] } = data;
    const insights: string[] = [];
    const actions: { title: string; type: 'danger' | 'warning' | 'info' }[] = [];

    const compliance = summary.compliance ?? 0;
    const criticalFails = summary.criticalFails ?? 0;

    if (compliance === 0 && summary.totalAudits === 0) {
      insights.push("Hệ thống chưa ghi nhận dữ liệu kiểm tra nào từ Google Sheet.");
      actions.push({ title: "Bắt đầu lượt Audit đầu tiên để có số liệu phân tích", type: 'info' });
      return { insights, actions };
    }

    if (compliance < 70) {
      insights.push(`Độ tuân thủ hiện tại (${compliance}%) đang ở mức báo động.`);
      actions.push({ title: "Tổng kiểm tra toàn hệ thống ngay lập tức", type: 'danger' });
    } else if (compliance < 85) {
      insights.push(`Hiệu suất trung bình. Cần thắt chặt các quy trình vệ sinh.`);
      actions.push({ title: "Tăng tần suất kiểm tra đột xuất", type: 'warning' });
    } else {
      insights.push("Hệ thống vận hành an toàn với độ tuân thủ cao.");
    }

    if (criticalFails > 0) {
      insights.push(`Phát hiện ${criticalFails} vi phạm nghiêm trọng chưa được khắc phục.`);
      actions.push({ title: `Xử lý triệt để ${criticalFails} lỗi an toàn trong 24h`, type: 'danger' });
    }

    if (topFails.length > 0) {
      const topGap = topFails[0];
      insights.push(`Lỗ hổng lớn nhất là "${topGap.title || topGap.item_id}" với ${topGap.fails} lần lỗi.`);
      actions.push({ title: `Đào tạo lại SOP cho hạng mục: ${topGap.title || topGap.item_id}`, type: 'info' });
    }

    return { insights, actions };
  }, [data]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-6">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-bold animate-pulse uppercase text-xs tracking-[0.3em]">{T.dash.loading}</p>
    </div>
  );

  if (error || !data) return <ErrorCard message={error || T.dash.sync_error} onRetry={refresh} />;

  const { 
    summary = { compliance: 0, auditsToday: 0, criticalFails: 0, totalPhotos: 0, totalAudits: 0 }, 
    farmRanking = [], 
    trend = [], 
    topFails = [] 
  } = data;
  
  const maxFails = topFails.length > 0 ? Math.max(...topFails.map(f => f.fails || 0)) : 1;
  const hasData = summary.totalAudits > 0;

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-700">
      {/* Header & Control Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Zap size={20} fill="currentColor" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{T.dash.ai_vector}</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">{T.dash.title}</h1>
          <p className="text-slate-500 font-medium">{T.dash.subtitle}</p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          {lastUpdated && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Clock size={12} /> Cập nhật lần cuối: {lastUpdated}
            </div>
          )}
          <button 
            onClick={refresh} 
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 shadow-sm active:scale-95 transition-all"
          >
            <RefreshCw size={14} /> {T.dash.refresh}
          </button>
        </div>
      </div>

      {/* KPI GRID - Dữ liệu thật từ Sheet */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title={T.dash.compliance} value={`${summary.compliance}%`} icon={<ShieldCheck size={24} />} status={summary.compliance >= 90 ? 'success' : summary.compliance >= 70 ? 'warning' : 'danger'} />
        <KPICard title={T.dash.critical_fails} value={summary.criticalFails} icon={<AlertTriangle size={24} />} status={summary.criticalFails === 0 ? 'success' : 'danger'} />
        <KPICard title={T.dash.audits_today} value={summary.auditsToday} icon={<ClipboardCheck size={24} />} status="info" />
        <KPICard title={T.dash.total_photos} value={summary.totalPhotos} icon={<Camera size={24} />} status="info" />
        <KPICard title="Tổng lượt Audit" value={summary.totalAudits} icon={<Target size={24} />} status="info" />
      </div>

      {!hasData ? (
        <div className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-[3rem] p-20 text-center space-y-4">
          <Target className="mx-auto text-indigo-300" size={64} />
          <h2 className="text-2xl font-black text-indigo-900 uppercase">Chưa có dữ liệu vận hành</h2>
          <p className="text-indigo-600 font-medium max-w-md mx-auto">
            Hệ thống Google Sheet hiện đang trống. Vui lòng thực hiện Audit tại trang trại để bắt đầu thu thập số liệu phân tích.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AI Insights Panel */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400"><Zap size={20} /></div>
                  <h3 className="font-black text-sm uppercase tracking-widest">{T.dash.status_insight}</h3>
                </div>
                <ul className="space-y-4">
                  {analysis?.insights.map((insight, idx) => (
                    <li key={idx} className="flex gap-3 text-sm font-bold leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2"></div>{insight}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mb-10"></div>
            </div>

            {/* Strategic Action Panel */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600"><ArrowRight size={20} /></div>
                <h3 className="font-black text-sm uppercase tracking-widest text-slate-800">Đề xuất ưu tiên</h3>
              </div>
              <div className="space-y-3">
                {analysis?.actions.map((action, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-[1.02] ${action.type === 'danger' ? 'bg-rose-50 border-rose-100 text-rose-700' : action.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
                    <div className="flex items-center gap-3"><AlertCircle size={18} /><span className="text-[10px] font-black uppercase tracking-tight">{action.title}</span></div>
                    <ArrowRight size={14} className="opacity-50" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Fails Analysis Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-4">
              <div className="bg-rose-50 p-2 rounded-xl text-rose-500"><AlertCircle size={20} /></div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">{T.dash.gaps}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topFails.map((fail, idx) => (
                <TopGapCard key={idx} fail={fail} maxFails={maxFails} />
              ))}
              {topFails.length === 0 && (
                 <div className="col-span-full py-20 bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center">
                    <p className="text-slate-400 font-bold">Chưa ghi nhận lỗi nghiêm trọng nào từ Sheet.</p>
                 </div>
              )}
            </div>
          </div>

          {/* Charts Visualization Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Trend Chart */}
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{T.dash.trend}</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend}>
                    <defs><linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Farm Ranking Bar Chart */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{T.dash.ranking}</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={farmRanking} layout="vertical" margin={{ left: -20 }}>
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis dataKey="farm" type="category" axisLine={false} tickLine={false} tick={{fill: '#1e293b', fontSize: 11, fontWeight: 900}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px' }} />
                    <Bar dataKey="score" radius={[0, 10, 10, 0]} barSize={20}>
                      {farmRanking.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score >= 90 ? '#10b981' : entry.score >= 70 ? '#f59e0b' : '#f43f5e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const KPICard = ({ title, value, icon, status }: { title: string, value: any, icon: any, status: 'success' | 'warning' | 'danger' | 'info' }) => {
  const styles = {
    success: "bg-emerald-50 text-emerald-600 border-emerald-100",
    warning: "bg-amber-50 text-amber-600 border-amber-100",
    danger: "bg-rose-50 text-rose-600 border-rose-100",
    info: "bg-indigo-50 text-indigo-600 border-indigo-100"
  };
  return (
    <div className={`rounded-3xl p-6 border transition-all hover:scale-[1.05] hover:shadow-xl group ${styles[status]}`}>
      <div className="bg-white/60 w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:rotate-12 transition-transform">{icon}</div>
      <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1 leading-none">{title}</p>
      <h3 className="text-3xl font-black tracking-tighter">{value}</h3>
    </div>
  );
};

export default DashboardPage;
