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
  Layers,
  X
} from "lucide-react";
import { useSmartRelief } from "../../context/SmartReliefContext";
import { UserRole } from "../../types";
import { StatusBadge } from "../common/StatusBadge";
import { AnimatePresence, motion } from "motion/react";

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenAiModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenAiModal }) => {
  const {
    currentRole,
    setRole,
    currentUser,
    isGuest,
    alerts,
    systemLogs,
    resetToDefaultData
  } = useSmartRelief();

  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const activeAlerts = alerts.filter(a => a.active);

  const roles: { id: UserRole; label: string; desc: string }[] = [
    { id: "SUPER_ADMIN", label: "Super Admin", desc: "Platform administration & system governance" },
    { id: "ADMIN", label: "Admin / LGU-DRRM", desc: "Operational incident command" },
    { id: "RESPONDER", label: "Responder", desc: "Field-optimized action deployment" },
    { id: "CITIZEN", label: "Citizen", desc: "Public reporting & assistance" }
  ];

  const name = currentUser?.name || 'User';
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

  return (
    <header className="h-16 border-b flex items-center justify-between px-4 sm:px-8 z-40 sticky top-0 transition-colors" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      
      <div className="flex items-center gap-4">
        {/* Mobile Toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Brand */}
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-lg italic shrink-0" style={{ backgroundColor: 'var(--color-accent)' }}>
              S
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>SmartRelief</h1>
              <p className="text-[10px] font-bold" style={{ color: 'var(--color-text-muted)' }}>Disaster Engine</p>
            </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* Role Switcher */}
        <div className="relative hidden md:flex items-center p-1 border rounded-xl" style={{ backgroundColor: 'var(--color-surface-secondary)', borderColor: 'var(--color-border)' }}>
          {roles.map(r => {
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                  isActive
                    ? "shadow-sm"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                style={isActive ? { backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' } : { color: 'var(--color-text-secondary)' }}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Role Switcher Dropdown */}
        <div className="relative md:hidden">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="px-2.5 py-1.5 border rounded-lg text-xs font-bold flex items-center gap-1.5"
            style={{ backgroundColor: 'var(--color-surface-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          >
            <Layers className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
            <span>{roles.find(r => r.id === currentRole)?.label}</span>
          </button>
          
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 p-2 rounded-xl border shadow-xl z-50" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    setRole(r.id);
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg transition-colors mb-1 last:mb-0"
                  style={currentRole === r.id ? { backgroundColor: 'var(--color-surface-secondary)' } : {}}
                >
                  <div className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{r.label}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{r.desc}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 pr-4 sm:pr-6 border-r" style={{ borderColor: 'var(--color-border)' }}>
            
            {onOpenAiModal && (
              <button
                onClick={onOpenAiModal}
                className="hidden sm:flex px-3 py-1.5 rounded-lg border text-xs font-bold items-center gap-2 transition-all hover:brightness-95"
                style={{ backgroundColor: 'var(--color-surface-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                title="Open AI Decision Support Advisor"
              >
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>AI Advisor</span>
              </button>
            )}

            {/* Alerts */}
            <div className="relative">
              <button
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className="relative rounded-full p-2 transition-colors"
                style={{ color: activeAlerts.length > 0 ? '#EF4444' : 'var(--color-text-secondary)' }}
                aria-label="Emergency Alerts"
              >
                <AlertTriangle className="h-5 w-5" />
                {activeAlerts.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#EF4444] px-1 text-[0.625rem] font-black text-white">
                    {activeAlerts.length}
                  </span>
                )}
              </button>
              
              <AnimatePresence>
              {showAlertsDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 p-4 rounded-xl shadow-2xl border z-50"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                      Emergency Alerts ({activeAlerts.length})
                    </span>
                  </div>
                  <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                    {activeAlerts.length === 0 ? (
                      <p className="text-xs text-center py-4 font-bold" style={{ color: 'var(--color-text-muted)' }}>No active emergency alerts at this time.</p>
                    ) : (
                      activeAlerts.map(alt => (
                        <div key={alt.id} className="p-3 rounded-xl border space-y-1 bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30">
                          <div className="font-bold text-red-600 dark:text-red-400 text-xs">{alt.title}</div>
                          <div className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{alt.instructions}</div>
                          <div className="text-[10px] font-bold pt-1 flex justify-between" style={{ color: 'var(--color-text-muted)' }}>
                            <span>Area: {alt.affectedArea}</span>
                            <span>By: {alt.issuedBy}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>

            {/* Logs */}
            <button
              onClick={() => setShowLogsDrawer(!showLogsDrawer)}
              className="relative rounded-full p-2 transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              title="System Audit & Activity Log"
            >
              <Activity className="w-5 h-5" />
            </button>
            
            <button
              onClick={resetToDefaultData}
              className="relative rounded-full p-2 transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              title="Reset System Demo State"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
          </div>

          {/* Profile Section */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              {isGuest ? (
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">Guest Mode</p>
              ) : (
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{currentUser.name}</p>
              )}
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                {isGuest ? 'Guest Citizen' : (currentUser.lguName || currentRole.replace('_', ' '))}
              </p>
            </div>
            
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={name} className="w-8 h-8 rounded-full border object-cover" style={{ borderColor: 'var(--color-border)' }} />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: 'var(--color-accent)' }}>
                {initials}
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* System Activity Drawer Modal */}
      <AnimatePresence>
      {showLogsDrawer && (
        <motion.div 
          className="fixed inset-0 z-50 bg-[#111827]/30 backdrop-blur-sm flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="w-full max-w-md h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl border-l"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <h3 className="text-base font-black flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                  <Activity className="w-5 h-5 text-blue-500" />
                  Audit Trail
                </h3>
                <button onClick={() => setShowLogsDrawer(false)} className="rounded-lg p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ color: 'var(--color-text-faint)' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {systemLogs.map(log => (
                  <div key={log.id} className="p-4 rounded-xl border text-xs space-y-1.5" style={{ backgroundColor: 'var(--color-surface-secondary)', borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-500">{log.action}</span>
                      <span className="font-bold text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{log.details}</div>
                    <div className="pt-2 mt-2 flex justify-between items-center border-t border-black/5 dark:border-white/5">
                      <span className="font-bold text-[10px] uppercase" style={{ color: 'var(--color-text-muted)' }}>{log.userName} ({log.userRole})</span>
                      <StatusBadge type="simple" value={log.severity} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </header>
  );
};
