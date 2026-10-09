import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building2,
  Activity,
  Settings,
  AlertOctagon,
  FileText,
  Boxes,
  Home,
  Users2,
  MapPin,
  Sparkles,
  BarChart3,
  Compass,
  CheckSquare,
  Radio,
  PackagePlus,
  Calendar,
  Siren,
  LifeBuoy,
  Search,
  Clock,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { useSmartRelief } from "../../context/SmartReliefContext";
import { UserRole } from "../../types";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onToggleSidebar?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose
}) => {
  const { currentRole, currentUser, incidents, assistanceRequests, resources, alerts, aiRecommendations, logout } = useSmartRelief();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isRetracted, setIsRetracted] = useState(() => {
    try {
      const saved = localStorage.getItem('smartrelief_sidebar_retracted');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsRetracted((prev: boolean) => {
      const next = !prev;
      localStorage.setItem('smartrelief_sidebar_retracted', JSON.stringify(next));
      return next;
    });
  };

  // Close retract when opening mobile drawer
  useEffect(() => {
    if (isOpen) setIsRetracted(false);
  }, [isOpen]);

  const pendingIncidents = incidents.filter(i => i.status === "REPORTED" || i.status === "VERIFIED").length;
  const pendingRequests = assistanceRequests.filter(r => r.status === "SUBMITTED" || r.status === "VERIFIED").length;
  const lowStockResources = resources.filter(r => r.stockStatus === "LOW_STOCK" || r.stockStatus === "DEPLETED").length;
  const pendingAiRecs = aiRecommendations.filter(r => r.status === "PENDING").length;

  const getRoleNavItems = (role: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return [
          { id: "div-intel", label: "Command & Control", isHeader: true, icon: LayoutDashboard },
          { id: "dashboard", label: "Command Center", icon: LayoutDashboard },
          { id: "map", label: "Live Map", icon: MapPin },
          { id: "ai-support", label: "AI Advisor", icon: Sparkles, badge: pendingAiRecs > 0 ? pendingAiRecs : undefined, badgeColor: "blue" },

          { id: "div-ops", label: "Emergency Response", isHeader: true, icon: LayoutDashboard },
          { id: "incidents", label: "Active Incidents", icon: AlertOctagon, badge: pendingIncidents > 0 ? pendingIncidents : undefined, badgeColor: "red" },
          { id: "requests", label: "Citizen Requests", icon: FileText, badge: pendingRequests > 0 ? pendingRequests : undefined, badgeColor: "amber" },
          { id: "resources", label: "Logistics & Inventory", icon: Boxes, badge: lowStockResources > 0 ? lowStockResources : undefined, badgeColor: "orange" },
          { id: "evacuation", label: "Evacuation Shelters", icon: Home },
          { id: "responders", label: "Field Responders", icon: Users2 },

          { id: "div-sys", label: "System Administration", isHeader: true, icon: LayoutDashboard },
          { id: "users", label: "Users", icon: Users },
          { id: "roles", label: "Access Control", icon: ShieldCheck },
          { id: "reports", label: "Reports", icon: FileText },
          { id: "audit", label: "Audit Trail", icon: Activity },
          { id: "settings", label: "Settings", icon: Settings }
        ];

      case "ADMIN":
        return [
          { id: "div-intel", label: "Command & Control", isHeader: true, icon: LayoutDashboard },
          { id: "dashboard", label: "Command Center", icon: LayoutDashboard },
          { id: "map", label: "Live Map", icon: MapPin },
          { id: "ai-support", label: "AI Advisor", icon: Sparkles, badge: pendingAiRecs > 0 ? pendingAiRecs : undefined, badgeColor: "blue" },

          { id: "div-ops", label: "Emergency Response", isHeader: true, icon: LayoutDashboard },
          { id: "incidents", label: "Active Incidents", icon: AlertOctagon, badge: pendingIncidents > 0 ? pendingIncidents : undefined, badgeColor: "red" },
          { id: "requests", label: "Citizen Requests", icon: FileText, badge: pendingRequests > 0 ? pendingRequests : undefined, badgeColor: "amber" },
          { id: "resources", label: "Logistics & Inventory", icon: Boxes, badge: lowStockResources > 0 ? lowStockResources : undefined, badgeColor: "orange" },
          { id: "evacuation", label: "Evacuation Shelters", icon: Home },
          { id: "responders", label: "Field Responders", icon: Users2 },

          { id: "div-sys", label: "System Administration", isHeader: true, icon: LayoutDashboard },
          { id: "reports", label: "Reports", icon: FileText }
        ];

      case "RESPONDER":
        return [
          { id: "field-dashboard", label: "Field Dashboard", icon: LayoutDashboard },
          { id: "tactical-map", label: "Tactical Map", icon: Compass },
          { id: "assignments", label: "Active Missions", icon: CheckSquare },
          { id: "field-report", label: "Submit Field Report", icon: Radio },
          { id: "resource-requisition", label: "Request Supplies", icon: PackagePlus },
          { id: "responder-schedule", label: "My Schedule", icon: Calendar }
        ];

      case "CITIZEN":
      default: {
        const activeAlertCount = alerts.filter(a => a.active).length;
        return [
          { id: "citizen-home", label: "Home", icon: Siren },
          { id: "alerts", label: "Live Alerts", icon: Bell, badge: activeAlertCount > 0 ? activeAlertCount : undefined, badgeColor: "red" },
          { id: "report-incident", label: "Report Emergency", icon: AlertOctagon },
          { id: "request-assistance", label: "Request Help", icon: LifeBuoy },
          { id: "evacuation-centers", label: "Find Shelter", icon: Search },
          { id: "track-requests", label: "My Requests", icon: Clock, badge: (pendingRequests + pendingIncidents) > 0 ? (pendingRequests + pendingIncidents) : undefined, badgeColor: "blue" }
        ];
      }
    }
  };

  const navItems = getRoleNavItems(currentRole);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#111827]/45 backdrop-blur-sm lg:hidden"
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width: isRetracted ? 80 : 256 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className={`fixed lg:relative z-50 h-[100dvh] lg:h-full border-r bg-white flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className={`py-6 flex-1 ${isRetracted ? "px-4" : "px-6"}`}>

          <div className={`flex items-center mb-8 overflow-hidden ${isRetracted ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 bg-[#111827] font-black text-lg">
              S
            </div>
            <AnimatePresence initial={false}>
              {!isRetracted && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    className="flex flex-col whitespace-nowrap overflow-hidden pl-2"
                  >
                  <span className="font-black text-base tracking-tight leading-none" style={{ color: 'var(--color-text-primary)' }}>
                    Smart Relief
                  </span>
                  <span className="text-[10px] font-bold mt-0.5 tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>Disaster Engine</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>



          {/* Nav Items Group */}
          <nav className="space-y-1 relative pb-20 lg:pb-0">
            {navItems.map(item => {
              if (item.isHeader) {
                return (
                  <motion.div
                    key={item.id}
                    initial={false}
                    animate={{ 
                      marginTop: isRetracted ? 24 : 32, 
                      marginBottom: isRetracted ? 24 : 8 
                    }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    className="relative flex items-center mx-3 overflow-hidden h-4"
                  >
                    <AnimatePresence initial={false}>
                      {!isRetracted && (
                        <motion.div
                          key="text"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                          className="absolute left-0 w-full text-[10px] uppercase font-bold tracking-widest text-slate-400 whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence initial={false}>
                      {isRetracted && (
                        <motion.div
                          key="line"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                          className="absolute left-0 w-full border-t" 
                          style={{ borderColor: 'var(--color-border)' }} 
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              }

              const Icon = item.icon;
              const isActive = activeTab === item.id;

              const getBadgeColorClass = (color: string = 'red') => {
                switch (color) {
                  case 'blue': return 'bg-blue-500';
                  case 'amber': return 'bg-amber-500';
                  case 'orange': return 'bg-orange-500';
                  case 'red':
                  default: return 'bg-red-500';
                }
              };

              const getBadgeSoftClass = (color: string = 'red') => {
                switch (color) {
                  case 'blue': return 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400';
                  case 'amber': return 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400';
                  case 'orange': return 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400';
                  case 'red':
                  default: return 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400';
                }
              };

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full flex items-center py-2 rounded-lg group relative z-0 hover:z-50 ${isRetracted ? "px-0 justify-center w-12 mx-auto" : "px-3 justify-between"
                    } ${isActive ? "" : "hover:bg-[#F3F4F6] hover:text-[#111827]"}`}
                  style={{ color: isActive ? 'var(--color-surface)' : 'var(--color-text-secondary)' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBackground"
                      className="absolute inset-0 rounded-lg -z-10"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                      initial={false}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  <div className={`flex items-center ${isRetracted ? "justify-center" : "gap-3.5"} min-w-0`}>
                    <Icon className="w-5 h-5 shrink-0" />

                    {isRetracted && item.badge !== undefined && (
                      <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 ${getBadgeColorClass((item as any).badgeColor)} rounded-full border-2 border-white dark:border-[#111827]`}></span>
                    )}

                    {/* Tooltip on hover (always show beside) */}
                    <div className="absolute left-full ml-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] flex items-center translate-x-2 group-hover:translate-x-0 pointer-events-none">
                      <div className="w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-[#111827] mr-[-1px]"></div>
                      <div className="bg-[#111827] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl flex items-center gap-2">
                        {item.label}
                        {item.badge !== undefined && (
                          <span className={`px-1.5 py-0.5 ${getBadgeColorClass((item as any).badgeColor)} text-white rounded-full text-[9px]`}>{item.badge}</span>
                        )}
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {!isRetracted && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                          className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {!isRetracted && (
                    <div className="flex items-center gap-3 ml-auto pl-3 shrink-0">
                      {item.badge !== undefined && (
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${isActive ? 'bg-white/20 text-white' : getBadgeSoftClass((item as any).badgeColor)
                          }`}>
                          {item.badge}
                        </span>
                      )}

                      {isActive && (
                        <motion.div layoutId="activeNav" className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info / Toggle */}
        <div className={`mt-auto border-t ${isRetracted ? 'p-4 space-y-4' : 'p-4 space-y-4'}`} style={{ borderColor: 'var(--color-border)' }}>
          <div className={isRetracted ? 'flex justify-center' : 'px-3'}>
            <div className={`flex items-center relative z-0 hover:z-50 group cursor-help w-full ${isRetracted ? 'justify-center' : 'gap-3'}`}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[0.625rem] font-bold border shrink-0"
                style={{ backgroundColor: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
              >
                {currentUser?.email?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
              
              <AnimatePresence initial={false}>
                {!isRetracted && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    className="min-w-0 overflow-hidden whitespace-nowrap"
                  >
                    <p className="text-xs font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>{currentUser?.email || 'admin@smartrelief.gov.ph'}</p>
                    <p className="text-[0.625rem] uppercase font-bold tracking-tighter truncate" style={{ color: 'var(--color-text-muted)' }}>{currentRole.replace('_', ' ')}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tooltip on hover (always show beside) */}
              <div className="absolute left-full ml-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] flex items-center translate-x-2 group-hover:translate-x-0 pointer-events-none">
                <div className="w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-[#111827] mr-[-1px]"></div>
                <div className="bg-[#111827] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl flex flex-col items-start">
                  <span className="truncate">{currentUser?.email}</span>
                  <span className="text-[0.5625rem] text-gray-400 font-bold uppercase tracking-wider">{currentRole.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`flex ${isRetracted ? 'flex-col items-center gap-4' : 'flex-row items-center gap-2 w-full'}`}>
            <button
              onClick={() => setShowLogoutModal(true)}
              className={`flex items-center text-[#EF4444] hover:bg-[#FEF2F2] transition-colors relative z-0 hover:z-50 group ${isRetracted ? 'p-2 justify-center mx-auto rounded-lg w-10 h-10' : 'flex-1 gap-3 px-3 py-2 rounded-lg text-left'
                }`}
            >
              <LogOut className="w-5 h-5 shrink-0" />

              {/* Tooltip on hover (always show beside) */}
              <div className="absolute left-full ml-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] flex items-center translate-x-2 group-hover:translate-x-0 pointer-events-none">
                <div className="w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-[#EF4444] mr-[-1px]"></div>
                <div className="bg-[#EF4444] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                  Log out
                </div>
              </div>

              <AnimatePresence initial={false}>
                {!isRetracted && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    Log out
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={toggleSidebar}
              className={`flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors rounded-lg hidden lg:flex relative z-0 hover:z-50 group ${isRetracted ? "w-10 h-10 p-2" : "w-10 h-10 shrink-0"
                }`}
              aria-label={isRetracted ? "Expand sidebar" : "Retract sidebar"}
            >
              {isRetracted ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              
              {/* Tooltip on hover */}
              <div className="absolute left-full ml-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] flex items-center translate-x-2 group-hover:translate-x-0 pointer-events-none">
                <div className="w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-[#111827] mr-[-1px]"></div>
                <div className="bg-[#111827] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                  {isRetracted ? "Expand Sidebar" : "Collapse Sidebar"}
                </div>
              </div>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowLogoutModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col items-center text-center relative overflow-hidden z-10"
            >
              {/* Decorative background glow */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none" />

              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.6, bounce: 0.5, delay: 0.1 }}
                className="w-20 h-20 bg-gradient-to-tr from-red-500 to-rose-400 rounded-2xl flex items-center justify-center mb-6 shadow-[0_10px_25px_rgba(239,68,68,0.3)] rotate-3 z-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
                >
                  <LogOut className="w-10 h-10 text-white ml-1" strokeWidth={2.5} />
                </motion.div>
              </motion.div>
              
              <motion.h3 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight z-10"
              >
                Confirm Logout
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-sm text-gray-500 mb-8 font-medium px-2 z-10"
              >
                Are you sure you want to sign out of your account? You will need to log back in to access your dashboard.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="flex gap-3 w-full z-10"
              >
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3.5 px-4 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={logout}
                  className="flex-1 py-3.5 px-4 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 active:scale-[0.98] rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Log Out
                </button>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
