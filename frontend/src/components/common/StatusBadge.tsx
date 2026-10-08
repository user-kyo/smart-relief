import React from "react";
import { IncidentSeverity, IncidentStatus, RequestStatus, StockStatus, UserRole } from "../../types";

interface StatusBadgeProps {
  type: "severity" | "status" | "stock" | "role" | "simple";
  value: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  value,
  label,
  size = "md"
}) => {
  const displayLabel = label || value.replace(/_/g, " ");

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] font-semibold tracking-wide",
    md: "px-2.5 py-1 text-xs font-semibold tracking-wide",
    lg: "px-3 py-1.5 text-sm font-semibold tracking-wide"
  };

  let colorStyle = "bg-slate-100 text-slate-700 border-slate-200";

  if (type === "severity") {
    switch (value as IncidentSeverity) {
      case "CRITICAL":
        colorStyle = "bg-red-100 text-red-700 border-red-200";
        break;
      case "HIGH":
        colorStyle = "bg-orange-100 text-orange-700 border-orange-200";
        break;
      case "MEDIUM":
        colorStyle = "bg-amber-100 text-amber-800 border-amber-200";
        break;
      case "LOW":
        colorStyle = "bg-slate-100 text-slate-700 border-slate-200";
        break;
    }
  } else if (type === "status") {
    const s = value as string;
    if (s === "REPORTED" || s === "SUBMITTED") {
      colorStyle = "bg-amber-100 text-amber-800 border-amber-200";
    } else if (s === "VERIFIED") {
      colorStyle = "bg-blue-100 text-blue-700 border-blue-200";
    } else if (s === "ASSIGNED" || s === "EN_ROUTE") {
      colorStyle = "bg-indigo-100 text-indigo-700 border-indigo-200";
    } else if (s === "RESPONDING" || s === "ON_SCENE") {
      colorStyle = "bg-purple-100 text-purple-700 border-purple-200";
    } else if (s === "RESOLVED" || s === "CLOSED") {
      colorStyle = "bg-emerald-100 text-emerald-700 border-emerald-200";
    } else if (s === "REJECTED") {
      colorStyle = "bg-slate-100 text-slate-500 border-slate-200 line-through";
    }
  } else if (type === "stock") {
    switch (value as StockStatus) {
      case "NORMAL":
        colorStyle = "bg-emerald-100 text-emerald-700 border-emerald-200";
        break;
      case "LOW_STOCK":
        colorStyle = "bg-amber-100 text-amber-800 border-amber-200";
        break;
      case "DEPLETED":
      case "CRITICAL":
        colorStyle = "bg-red-100 text-red-700 border-red-200";
        break;
    }
  } else if (type === "role") {
    switch (value as UserRole) {
      case "SUPER_ADMIN":
        colorStyle = "bg-purple-100 text-purple-700 border-purple-200";
        break;
      case "ADMIN":
        colorStyle = "bg-blue-100 text-blue-700 border-blue-200";
        break;
      case "RESPONDER":
        colorStyle = "bg-amber-100 text-amber-800 border-amber-200";
        break;

      case "CITIZEN":
        colorStyle = "bg-slate-100 text-slate-700 border-slate-200";
        break;
    }
  }

  return (
    <span className={`inline-flex items-center rounded-full border ${sizeClasses[size]} ${colorStyle}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {displayLabel}
    </span>
  );
};
