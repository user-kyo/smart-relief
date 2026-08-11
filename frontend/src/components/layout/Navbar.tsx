import React, { useState } from "react";
import {
  ShieldAlert,
  Bell,
  Search,
  UserCheck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  AlertTriangle,
  Menu,
  Activity,
  Layers
} from "lucide-react";
import { useSmartRelief } from "../../context/SmartReliefContext";
import { UserRole } from "../../types";
import { StatusBadge } from "../common/StatusBadge";

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenAiModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenAiModal }) => {
  const {
    currentRole,
    setRole,
    currentUser,
    alerts,
    systemLogs,
    resetToDefaultData
  } = useSmartRelief();

  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const activeAlerts = alerts.filter(a => a.active);

  const roles: { id: UserRole; label: string; desc: string; iconColor: string }[] = [
    {
      id: "SUPER_ADMIN",
      label: "Super Admin",
      desc: "Platform administration & system governance",
      iconColor: "text-purple-400"
    },
    {
      id: "ADMIN",
      label: "Admin / LGU-DRRM",
      desc: "Operational incident command & AI decision support",
      iconColor: "text-blue-400"
    },
    {
      id: "RESPONDER",
      label: "Responder / Volunteer",
      desc: "Field-optimized action & task deployment",
      iconColor: "text-amber-400"
    },
    {
      id: "CITIZEN",
      label: "Citizen",
      desc: "Public reporting, assistance & evacuation search",
      iconColor: "text-emerald-400"
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-lg italic shadow-sm">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-xl text-slate-900">SmartRelief</span>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                  System Stable
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                AI Disaster Resource Coordination System
              </p>
            </div>
          </div>
        </div>

        {/* Center: Role Switcher Pill Bar */}
        <div className="relative hidden md:flex items-center bg-slate-100 p-1 border border-slate-200 rounded-xl">
          {roles.map(r => {
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? "bg-blue-600 animate-pulse" : "bg-slate-400"}`} />
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Role Switcher Dropdown */}
        <div className="relative md:hidden">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>{roles.find(r => r.id === currentRole)?.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50">
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    setRole(r.id);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    currentRole === r.id ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="font-bold text-slate-800">{r.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Controls: AI Assistant, Alerts, System Logs & User Profile */}
        <div className="flex items-center gap-2">
          
          {/* AI Decision Support Button */}
          {onOpenAiModal && (
            <button
              onClick={onOpenAiModal}
              className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
              title="Open AI Decision Support Advisor"
            >
              <Sparkles className="w-4 h-4 text-blue-600 animate-spin-slow" />
              <span className="hidden sm:inline">AI Decision Support</span>
            </button>
          )}

          {/* Active Emergency Alert Button */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
              className={`p-2 rounded-lg border transition-all relative flex items-center gap-1.5 text-xs font-bold ${
                activeAlerts.length > 0
                  ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                  : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
              title="Emergency Alerts Broadcast"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">SOS ALERTS ({activeAlerts.length})</span>
              {activeAlerts.length > 0 && (
                <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
              )}
            </button>

            {showAlertsDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 z-50 text-slate-800">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Active Emergency Alerts ({activeAlerts.length})
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">Live LGU Broadcast</span>
                </div>
                <div className="mt-3 space-y-3 max-h-72 overflow-y-auto pr-1">
                  {activeAlerts.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No active emergency alerts at this time.</p>
                  ) : (
                    activeAlerts.map(alt => (
                      <div key={alt.id} className="p-3 bg-red-50/60 border border-red-200/80 rounded-xl text-xs space-y-1">
                        <div className="font-bold text-red-900">{alt.title}</div>
                        <div className="text-slate-700">{alt.instructions}</div>
                        <div className="text-[10px] text-slate-500 pt-1 flex justify-between">
                          <span>Area: {alt.affectedArea}</span>
                          <span>Issued by {alt.issuedBy}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Activity Log Drawer Toggle */}
          <button
            onClick={() => setShowLogsDrawer(!showLogsDrawer)}
            className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors relative"
            title="System Audit & Activity Log"
          >
            <Activity className="w-4 h-4" />
          </button>

          {/* User Profile */}
          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-700">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser.name.charAt(0)
              )}
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500">{currentUser.lguName || currentRole}</div>
            </div>
          </div>

          {/* Reset Demo State Button */}
          <button
            onClick={resetToDefaultData}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset system state to demonstration default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* System Activity Drawer Modal */}
      {showLogsDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white border-l border-slate-200 h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Real-Time Audit Trail
                </h3>
                <button onClick={() => setShowLogsDrawer(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">
                  Close ✕
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {systemLogs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-mono font-semibold text-blue-600">{log.action}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-slate-800 font-medium">{log.details}</div>
                    <div className="text-[10px] text-slate-500 pt-1 flex justify-between items-center">
                      <span>User: {log.userName} ({log.userRole})</span>
                      <StatusBadge type="simple" value={log.severity} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
              SmartRelief Immutable Disaster System Audit Engine
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
