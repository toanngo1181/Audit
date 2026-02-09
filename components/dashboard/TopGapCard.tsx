import React from "react";
import { AlertTriangle, Calendar } from "lucide-react";

const riskColor = (risk: string) => {
  switch (risk) {
    case "NGHIÊM TRỌNG":
      return "bg-rose-100 text-rose-600";
    case "NGUY CƠ":
      return "bg-amber-100 text-amber-600";
    default:
      return "bg-yellow-100 text-yellow-600";
  }
};

export default function TopGapCard({ fail }: any) {
  if (!fail) return null;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-3 hover:shadow-lg transition">

      {/* Risk badge */}
      <span className={`text-[10px] font-black px-3 py-1 rounded-full ${riskColor(fail.risk)}`}>
        {fail.risk || "RỦI RO"}
      </span>

      {/* Title */}
      <h3 className="text-sm font-black text-slate-900">
        {fail.title || fail.item_id}
      </h3>

      {/* Module */}
      <p className="text-xs text-slate-500 font-semibold uppercase">
        {fail.module}
      </p>

      {/* Description */}
      <p className="text-xs text-slate-400 line-clamp-2">
        {fail.description}
      </p>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 flex justify-between text-xs font-bold">

        <span className="text-rose-600 flex items-center gap-1">
          <AlertTriangle size={14} />
          {fail.fails} lần
        </span>

        <span className="text-slate-400 flex items-center gap-1">
          <Calendar size={14} />
          {fail.lastFail}
        </span>

      </div>
    </div>
  );
}
