import React, { useState } from "react";
import {
  Bell,
  Sparkles,
  Layers,
  AlertTriangle,
  Menu,
  Activity,
  RotateCcw,
  X
} from "lucide-react";
import { useSmartRelief } from "../../context/SmartReliefContext";
import { UserRole } from "../../types";
import { StatusBadge } from "../common/StatusBadge";
import { AnimatePresence, motion } from "motion/react";

interface HeaderProps {
  title: string;
  onToggleSidebar?: () => void;
  onOpenAiModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onToggleSidebar, onOpenAiModal }) => {
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
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const activeAlerts = alerts.filter(a => a.active);

  const roles: { id: UserRole; label: string; desc: string }[] = [
    { id: "SUPER_ADMIN", label: "Super Admin", desc: "Platform administration & system governance" },
    { id: "ADMIN", label: "Admin", desc: "Operational incident command" },
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
    <header className="relative h-16 border-b flex items-center justify-between px-4 sm:px-8 shrink-0 z-40 transition-colors" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      
      <div className="flex items-center gap-4">
        {/* Mobile Toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 -ml-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Page Title */}
        <h1 className="text-lg font-semibold hidden sm:block" style={{ color: 'var(--color-text-primary)' }}>{title}</h1>
      </div>
      
      <div className="flex items-center gap-4 sm:gap-6">
        


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
                className="relative rounded-full p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
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
              className="relative rounded-full p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: 'var(--color-text-secondary)' }}
              title="System Audit & Activity Log"
            >
              <Activity className="w-5 h-5" />
            </button>
            
            <button
              onClick={resetToDefaultData}
              className="relative rounded-full p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: 'var(--color-text-secondary)' }}
              title="Reset System Demo State"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
          </div>

          {/* Profile Section with Role Switcher */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
            >
              <div className="hidden sm:block">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{currentUser.name}</p>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{currentUser.lguName || currentRole.replace('_', ' ')}</p>
              </div>
              
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={name} className="w-8 h-8 rounded-full border object-cover" style={{ borderColor: 'var(--color-border)' }} />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: 'var(--color-accent)' }}>
                  {initials}
                </div>
              )}
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 p-2 rounded-xl shadow-xl z-50 border"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <div className="px-3 py-2 border-b mb-2" style={{ borderColor: 'var(--color-border)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Switch Role (Testing)</p>
                  </div>
                  {roles.map(r => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setRole(r.id);
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg transition-colors mb-1 last:mb-0 hover:bg-black/5 dark:hover:bg-white/5"
                      style={currentRole === r.id ? { backgroundColor: 'var(--color-surface-secondary)' } : {}}
                    >
                      <div className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{r.label}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{r.desc}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
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
