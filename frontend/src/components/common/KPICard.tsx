import React from "react";
import { LucideIcon, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";

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
  const iconStyle = {
    blue: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
    amber: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
    emerald: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
    rose: "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400",
    indigo: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
    slate: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
  };

  const pulseColor = {
    blue: "bg-blue-500 shadow-blue-500/50",
    amber: "bg-amber-500 shadow-amber-500/50",
    emerald: "bg-emerald-500 shadow-emerald-500/50",
    rose: "bg-rose-500 shadow-rose-500/50",
    indigo: "bg-indigo-500 shadow-indigo-500/50",
    slate: "bg-slate-500 shadow-slate-500/50"
  };

  const borderHover = {
    blue: "hover:border-blue-300 dark:hover:border-blue-700/50",
    amber: "hover:border-amber-300 dark:hover:border-amber-700/50",
    emerald: "hover:border-emerald-300 dark:hover:border-emerald-700/50",
    rose: "hover:border-rose-300 dark:hover:border-rose-700/50",
    indigo: "hover:border-indigo-300 dark:hover:border-indigo-700/50",
    slate: "hover:border-slate-300 dark:hover:border-slate-700/50"
  };

  return (
    <div
      onClick={onClick}
      className={`p-5 md:p-6 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 h-full flex flex-col justify-between overflow-hidden group ${
        onClick ? "cursor-pointer" : ""
      } ${borderHover[variant]}`}
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Top Row: Icon, Title, and Live indicator */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${iconStyle[variant]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{title}</p>
        </div>
        
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
          <span className={`w-1.5 h-1.5 rounded-full shadow-sm animate-pulse ${pulseColor[variant]}`} />
          <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Main Value */}
      <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-4" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </h3>

      {/* Footer: Trend & Subtext */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          {trend && (
            <span className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-1 rounded-md ${
              trend.isUp 
                ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' 
                : 'text-rose-700 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400'
            }`}>
              {trend.isUp ? <TrendingUp className="w-3 h-3 mr-0.5"/> : <TrendingDown className="w-3 h-3 mr-0.5"/>}
              {trend.value}
            </span>
          )}
          {subtext && (
            <span className="text-[10px] font-medium truncate" style={{ color: 'var(--color-text-secondary)' }}>
              {subtext}
            </span>
          )}
        </div>

        {onClick && (
          <div className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
};
