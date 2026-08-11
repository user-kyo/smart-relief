import React from "react";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  variant?: "blue" | "amber" | "emerald" | "rose" | "indigo" | "slate";
  trend?: {
    value: string;
    isUp: boolean;
  };
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = "blue",
  trend,
  onClick
}) => {
  const iconColors = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    rose: "bg-red-50 text-red-600 border-red-200",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200"
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-xl border bg-white border-slate-200 shadow-sm transition-all duration-200 ${
        onClick ? "cursor-pointer hover:border-slate-300 hover:shadow-md" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg border ${iconColors[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtext && <span className="text-slate-500 font-medium">{subtext}</span>}
          {trend && (
            <span
              className={`font-semibold flex items-center gap-0.5 ${
                trend.isUp ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {trend.isUp ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
