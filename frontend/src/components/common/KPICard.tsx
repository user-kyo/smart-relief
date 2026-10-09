import React from "react";
import { LucideIcon, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";

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
  const t = {
    blue: {
      bg: "from-blue-50/50 to-white dark:from-blue-900/20 dark:to-slate-900",
      glow: "group-hover:bg-blue-400/5 dark:group-hover:bg-blue-500/10",
      border: "border-blue-200/50 dark:border-blue-800/30 group-hover:border-blue-400 dark:group-hover:border-blue-500",
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
      iconText: "text-blue-600 dark:text-blue-400",
      trendBg: "bg-blue-100/50 dark:bg-blue-900/40",
      trendText: "text-blue-700 dark:text-blue-400",
      watermark: "text-blue-50 dark:text-blue-900/10",
      shadow: "hover:shadow-[0_8px_30px_rgb(59,130,246,0.12)]",
      pulse: "bg-blue-500 shadow-blue-500/50"
    },
    amber: {
      bg: "from-amber-50/50 to-white dark:from-amber-900/20 dark:to-slate-900",
      glow: "group-hover:bg-amber-400/5 dark:group-hover:bg-amber-500/10",
      border: "border-amber-200/50 dark:border-amber-800/30 group-hover:border-amber-400 dark:group-hover:border-amber-500",
      iconBg: "bg-amber-100 dark:bg-amber-900/50",
      iconText: "text-amber-600 dark:text-amber-400",
      trendBg: "bg-amber-100/50 dark:bg-amber-900/40",
      trendText: "text-amber-700 dark:text-amber-400",
      watermark: "text-amber-50 dark:text-amber-900/10",
      shadow: "hover:shadow-[0_8px_30px_rgb(245,158,11,0.12)]",
      pulse: "bg-amber-500 shadow-amber-500/50"
    },
    emerald: {
      bg: "from-emerald-50/50 to-white dark:from-emerald-900/20 dark:to-slate-900",
      glow: "group-hover:bg-emerald-400/5 dark:group-hover:bg-emerald-500/10",
      border: "border-emerald-200/50 dark:border-emerald-800/30 group-hover:border-emerald-400 dark:group-hover:border-emerald-500",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
      iconText: "text-emerald-600 dark:text-emerald-400",
      trendBg: "bg-emerald-100/50 dark:bg-emerald-900/40",
      trendText: "text-emerald-700 dark:text-emerald-400",
      watermark: "text-emerald-50 dark:text-emerald-900/10",
      shadow: "hover:shadow-[0_8px_30px_rgb(16,185,129,0.12)]",
      pulse: "bg-emerald-500 shadow-emerald-500/50"
    },
    rose: {
      bg: "from-rose-50/50 to-white dark:from-rose-900/20 dark:to-slate-900",
      glow: "group-hover:bg-rose-400/5 dark:group-hover:bg-rose-500/10",
      border: "border-rose-200/50 dark:border-rose-800/30 group-hover:border-rose-400 dark:group-hover:border-rose-500",
      iconBg: "bg-rose-100 dark:bg-rose-900/50",
      iconText: "text-rose-600 dark:text-rose-400",
      trendBg: "bg-rose-100/50 dark:bg-rose-900/40",
      trendText: "text-rose-700 dark:text-rose-400",
      watermark: "text-rose-50 dark:text-rose-900/10",
      shadow: "hover:shadow-[0_8px_30px_rgb(244,63,94,0.12)]",
      pulse: "bg-rose-500 shadow-rose-500/50"
    },
    indigo: {
      bg: "from-indigo-50/50 to-white dark:from-indigo-900/20 dark:to-slate-900",
      glow: "group-hover:bg-indigo-400/5 dark:group-hover:bg-indigo-500/10",
      border: "border-indigo-200/50 dark:border-indigo-800/30 group-hover:border-indigo-400 dark:group-hover:border-indigo-500",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/50",
      iconText: "text-indigo-600 dark:text-indigo-400",
      trendBg: "bg-indigo-100/50 dark:bg-indigo-900/40",
      trendText: "text-indigo-700 dark:text-indigo-400",
      watermark: "text-indigo-50 dark:text-indigo-900/10",
      shadow: "hover:shadow-[0_8px_30px_rgb(99,102,241,0.12)]",
      pulse: "bg-indigo-500 shadow-indigo-500/50"
    },
    slate: {
      bg: "from-slate-50/50 to-white dark:from-slate-900/20 dark:to-slate-900",
      glow: "group-hover:bg-slate-400/5 dark:group-hover:bg-slate-500/10",
      border: "border-slate-200/50 dark:border-slate-700/30 group-hover:border-slate-400 dark:group-hover:border-slate-500",
      iconBg: "bg-slate-100 dark:bg-slate-800",
      iconText: "text-slate-600 dark:text-slate-400",
      trendBg: "bg-slate-100/50 dark:bg-slate-800/50",
      trendText: "text-slate-700 dark:text-slate-400",
      watermark: "text-slate-50 dark:text-slate-800/20",
      shadow: "hover:shadow-[0_8px_30px_rgb(100,116,139,0.12)]",
      pulse: "bg-slate-500 shadow-slate-500/50"
    }
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`group relative p-6 rounded-2xl border bg-gradient-to-br ${t.bg} ${t.border} ${t.shadow} transition-all duration-500 hover:-translate-y-1 overflow-hidden ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {/* Ambient Glow */}
      <div className={`absolute inset-0 bg-transparent ${t.glow} transition-colors duration-500`} />
      
      {/* Huge subtle watermark icon */}
      <div className={`absolute -right-6 -bottom-6 opacity-40 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 ease-out z-0 ${t.watermark}`}>
        <Icon className="w-40 h-40" strokeWidth={1} />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Top Header: Title & Indicator */}
        <div className="flex justify-between items-start mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-100 dark:border-slate-700">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${t.pulse}`} />
            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 tracking-wider">LIVE</span>
          </div>
        </div>

        {/* Content Group: Big Value, Icon, Trend */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white transition-transform duration-300 group-hover:scale-105 origin-left">
                {value}
              </h3>
              {trend && (
                <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-md transition-transform duration-300 group-hover:translate-x-1 ${t.trendBg} ${t.trendText}`}>
                  {trend.isUp ? <TrendingUp className="w-3.5 h-3.5 mr-0.5"/> : <TrendingDown className="w-3.5 h-3.5 mr-0.5"/>}
                  {trend.value}
                </span>
              )}
            </div>
            
            {subtext && (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[80%]">
                {subtext}
              </p>
            )}
          </div>

          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${t.iconBg} ${t.iconText}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>

        {/* Nav Indicator (Optional) */}
        {onClick && (
          <div className="absolute top-6 right-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 z-10 hidden">
            <div className={`p-1 rounded-full ${t.iconBg} ${t.iconText}`}>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
