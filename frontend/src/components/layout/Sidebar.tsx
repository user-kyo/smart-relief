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
  const { currentRole, currentUser, incidents, assistanceRequests, resources, aiRecommendations } = useSmartRelief();
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
          { id: "dashboard", label: "Operational Command", icon: LayoutDashboard },
          { id: "incidents", label: "Incident Management", icon: AlertOctagon, badge: pendingIncidents > 0 ? pendingIncidents : undefined },
          { id: "requests", label: "Assistance Requests", icon: FileText, badge: pendingRequests > 0 ? pendingRequests : undefined },
          { id: "resources", label: "Resource Inventory", icon: Boxes, badge: lowStockResources > 0 ? lowStockResources : undefined },
          { id: "evacuation", label: "Evacuation Centers", icon: Home },
          { id: "responders", label: "Responder Management", icon: Users2 },
          { id: "map", label: "GIS Operations Map", icon: MapPin },
          { id: "ai-support", label: "AI Decision Support", icon: Sparkles, badge: pendingAiRecs > 0 ? pendingAiRecs : undefined },
          { id: "analytics", label: "Analytics & Reports", icon: BarChart3 },
          { id: "sys-div", label: "System Administration", isHeader: true, icon: LayoutDashboard },
          { id: "overview", label: "System Overview", icon: Settings },
          { id: "users", label: "User Management", icon: Users },
          { id: "roles", label: "Role & Permissions", icon: ShieldCheck },
          { id: "lgus", label: "LGU & Organizations", icon: Building2 },
          { id: "audit", label: "System Audit Logs", icon: Activity },
          { id: "settings", label: "System Configuration", icon: Settings }
        ];

      case "ADMIN":
        return [
          { id: "dashboard", label: "Operational Command", icon: LayoutDashboard },
          { id: "incidents", label: "Incident Management", icon: AlertOctagon, badge: pendingIncidents > 0 ? pendingIncidents : undefined },
          { id: "requests", label: "Assistance Requests", icon: FileText, badge: pendingRequests > 0 ? pendingRequests : undefined },
          { id: "resources", label: "Resource Inventory", icon: Boxes, badge: lowStockResources > 0 ? lowStockResources : undefined },
          { id: "evacuation", label: "Evacuation Centers", icon: Home },
          { id: "responders", label: "Responder Management", icon: Users2 },
          { id: "map", label: "GIS Operations Map", icon: MapPin },
          { id: "ai-support", label: "AI Decision Support", icon: Sparkles, badge: pendingAiRecs > 0 ? pendingAiRecs : undefined },
          { id: "analytics", label: "Analytics & Reports", icon: BarChart3 }
        ];

      case "RESPONDER":
      case "VOLUNTEER":
        return [
          { id: "field-dashboard", label: "Field Command", icon: LayoutDashboard },
          { id: "assignments", label: "My Assignments", icon: CheckSquare },
          { id: "tactical-map", label: "Tactical Field Map", icon: Compass },
          { id: "field-report", label: "Field Incident Reporter", icon: Radio },
          { id: "resource-requisition", label: "Supply Requisition", icon: PackagePlus },
          { id: "volunteer-tasks", label: "Schedule & Tasks", icon: Calendar }
        ];

      case "CITIZEN":
      default:
        return [
          { id: "citizen-home", label: "Emergency Home", icon: Siren },
          { id: "report-incident", label: "Report an Incident", icon: AlertOctagon },
          { id: "request-assistance", label: "Request Assistance", icon: LifeBuoy },
          { id: "evacuation-centers", label: "Find Evacuation Center", icon: Search },
          { id: "track-requests", label: "Track My Reports", icon: Clock },
          { id: "alerts", label: "Emergency Alerts", icon: Bell }
        ];
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

      <aside
        className={`fixed lg:relative z-50 h-[100dvh] lg:h-full border-r bg-white flex flex-col shrink-0 transition-all duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isRetracted ? "w-20" : "w-64"}`}
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className={`py-6 overflow-y-auto flex-1 ${isRetracted ? "px-4" : "px-6"}`}>
          
          <div className={`flex items-center mb-8 overflow-hidden ${isRetracted ? "justify-center" : "gap-3"}`}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-lg italic shrink-0" style={{ backgroundColor: 'var(--color-accent)' }}>
              S
            </div>
            <AnimatePresence initial={false}>
              {!isRetracted && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex flex-col whitespace-nowrap overflow-hidden"
                >
                  <span className="font-black text-base tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                    SmartRelief
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: 'var(--color-text-muted)' }}>Disaster Engine</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          </div>

          {/* Nav Items Group */}
          <nav className="space-y-1 relative pb-20 lg:pb-0">
            {navItems.map(item => {
              if (item.isHeader) {
                return !isRetracted ? (
                  <div key={item.id} className="mt-8 mb-2 px-3 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    {item.label}
                  </div>
                ) : <div key={item.id} className="my-6 border-t mx-3" style={{ borderColor: 'var(--color-border)' }} />;
              }

              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full flex items-center justify-between py-2 rounded-lg group relative z-0 ${
                    isRetracted ? "px-0 justify-center w-12 mx-auto" : "px-3"
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
                  
                  <div className={`flex items-center ${isRetracted ? "justify-center" : "gap-3"}`}>
                    <Icon className="w-5 h-5 shrink-0" />
                    
                    {isRetracted && (
                      <div className="absolute left-full ml-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] flex items-center translate-x-2 group-hover:translate-x-0 pointer-events-none">
                        <div className="w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-[#111827] mr-[-1px]"></div>
                        <div className="bg-[#111827] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl flex items-center gap-2">
                          {item.label}
                          {item.badge !== undefined && (
                            <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px]">{item.badge}</span>
                          )}
                        </div>
                      </div>
                    )}

                    <AnimatePresence initial={false}>
                      {!isRetracted && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="text-sm font-medium whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {!isRetracted && item.badge !== undefined && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  
                  {!isRetracted && isActive && item.badge === undefined && (
                    <motion.div layoutId="activeNav" className="w-1.5 h-1.5 rounded-full bg-white mr-2 shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info / Toggle */}
        <div className={`mt-auto border-t ${isRetracted ? 'p-4 space-y-4' : 'p-4 space-y-4'}`} style={{ borderColor: 'var(--color-border)' }}>
          <div className={isRetracted ? 'flex justify-center' : 'px-3'}>
            <div className={`flex items-center ${isRetracted ? 'justify-center' : 'gap-3'}`}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[0.625rem] font-bold border shrink-0 relative group cursor-help"
                style={{ backgroundColor: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
              >
                {currentUser?.email?.substring(0, 2).toUpperCase() || 'AD'}

                {isRetracted && (
                  <div className="absolute left-full ml-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] flex items-center translate-x-2 group-hover:translate-x-0 pointer-events-none">
                    <div className="w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-[#111827] mr-[-1px]"></div>
                    <div className="bg-[#111827] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl flex flex-col items-start">
                      <span className="truncate">{currentUser?.email}</span>
                      <span className="text-[0.5625rem] text-gray-400 font-bold uppercase tracking-wider">{currentRole.replace('_', ' ')}</span>
                    </div>
                  </div>
                )}
              </div>
              <AnimatePresence initial={false}>
                {!isRetracted && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="min-w-0 overflow-hidden"
                  >
                    <p className="text-xs font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>{currentUser?.email || 'admin@smartrelief.gov.ph'}</p>
                    <p className="text-[0.625rem] uppercase font-bold tracking-tighter truncate" style={{ color: 'var(--color-text-muted)' }}>{currentRole.replace('_', ' ')}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className={`flex ${isRetracted ? 'flex-col items-center gap-4' : 'flex-row items-center gap-2 w-full'}`}>
            <button
              onClick={() => {}}
              className={`flex items-center text-[#EF4444] hover:bg-[#FEF2F2] transition-colors relative group ${
                isRetracted ? 'p-2 justify-center mx-auto rounded-lg w-10 h-10' : 'flex-1 gap-3 px-3 py-2 rounded-lg text-left'
              }`}
            >
              <LogOut className="w-5 h-5 shrink-0" />

              {isRetracted && (
                <div className="absolute left-full ml-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] flex items-center translate-x-2 group-hover:translate-x-0 pointer-events-none">
                  <div className="w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-[#EF4444] mr-[-1px]"></div>
                  <div className="bg-[#EF4444] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                    Log out
                  </div>
                </div>
              )}

              <AnimatePresence initial={false}>
                {!isRetracted && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    Log out
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={toggleSidebar}
              className={`flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors rounded-lg hidden lg:flex ${
                isRetracted ? "w-10 h-10 p-2" : "w-10 h-10 shrink-0"
              }`}
              aria-label={isRetracted ? "Expand sidebar" : "Retract sidebar"}
            >
              {isRetracted ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
