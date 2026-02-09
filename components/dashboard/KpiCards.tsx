
import React from 'react';
import { Target, AlertCircle, Calendar, Image as ImageIcon } from 'lucide-react';
import { T } from '../../constants/i18n';

interface KpiCardsProps {
  data: {
    complianceRate: number;
    criticalIssues: number;
    auditsToday: number;
    totalPhotos: number;
  };
}

const KpiCards: React.FC<KpiCardsProps> = ({ data }) => {
  const cards = [
    {
      label: T.dash.compliance,
      value: `${data.complianceRate}%`,
      icon: Target,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100"
    },
    {
      label: T.dash.critical_fails,
      value: data.criticalIssues,
      icon: AlertCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-100"
    },
    {
      label: T.dash.audits_today,
      value: data.auditsToday,
      icon: Calendar,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100"
    },
    {
      label: T.dash.total_photos,
      value: data.totalPhotos,
      icon: ImageIcon,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card, i) => (
        <div 
          key={i} 
          className={`bg-white rounded-[2rem] p-6 border ${card.border} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
        >
          <div className={`${card.bg} ${card.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <card.icon size={24} />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KpiCards;
