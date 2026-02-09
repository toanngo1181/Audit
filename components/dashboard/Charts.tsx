
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { T } from '../../constants/i18n';

interface ChartsProps {
  farmPerformance: Array<{ farm: string; score: number }>;
  issuesByModule: Array<{ name: string; value: number }>;
  complianceTrend: Array<{ date: string; score: number }>;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

export const Charts: React.FC<ChartsProps> = ({ farmPerformance, issuesByModule, complianceTrend }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Farm Performance Bar Chart */}
      <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-xl font-black text-slate-800 tracking-tight px-2">{T.dash.ranking}</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={farmPerformance} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="farm" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                dy={10}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar 
                dataKey="score" 
                fill="#4f46e5" 
                radius={[10, 10, 10, 10]} 
                barSize={40} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Module Compliance Pie Chart */}
      <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-xl font-black text-slate-800 tracking-tight px-2">{T.dash.adherence}</h3>
        <div className="h-[300px] w-full flex flex-col md:flex-row items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={issuesByModule}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
              >
                {issuesByModule.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap md:flex-col gap-3 px-4 shrink-0">
            {issuesByModule.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Trend Area Chart */}
      <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-xl font-black text-slate-800 tracking-tight">{T.dash.trend}</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={complianceTrend}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                dy={10}
              />
              <YAxis domain={[0, 100]} hide />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#4f46e5" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorScore)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
