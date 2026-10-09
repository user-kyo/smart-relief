import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Sparkles,
  Layers,
  AlertTriangle,
  Menu,
  Settings,
  HelpCircle,
  Search,
  Moon,
  Sun,
  ChevronRight,
  X,
  Clock,
  Wifi,
  Plus,
  LogOut
} from "lucide-react";
import { useSmartRelief } from "../../context/SmartReliefContext";
import { UserRole } from "../../types";
import { StatusBadge } from "../common/StatusBadge";
import { AnimatePresence, motion } from "motion/react";

interface HeaderProps {
  title: string;
  activeTab?: string;
  onToggleSidebar?: () => void;
  onOpenAiModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, activeTab, onToggleSidebar, onOpenAiModal }) => {
  const {
    currentRole,
    currentUser,
    isGuest,
    users,
    alerts,
    logout
  } = useSmartRelief();

  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle theme effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live System Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // You can trigger your actual search logic here
      if (searchQuery) {
        console.log("Searching for:", searchQuery);
      }
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const activeAlerts = alerts.filter(a => a.active);

  const profileRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setShowAlertsDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const name = currentUser?.name || 'User';
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

  const formatRoleDisplay = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'System Administrator';
      case 'ADMIN': return 'LGU Administrator';
      case 'RESPONDER': return 'Field Responder';
      default: return 'Citizen';
    }
  };

  const getCategoryForTab = (tab: string) => {
    switch (tab) {
      case 'dashboard':
      case 'map':
      case 'ai-support':
        return 'Command & Control';
      case 'incidents':
      case 'requests':
      case 'resources':
      case 'evacuation':
      case 'responders':
      case 'lgus':
        return 'Emergency Response';
      case 'overview':
      case 'users':
      case 'roles':
      case 'reports':
      case 'audit':
      case 'settings':
        return 'System Administration';
      case 'field-dashboard':
      case 'tactical-map':
      case 'assignments':
      case 'field-report':
      case 'resource-requisition':
      case 'responder-schedule':
        return 'Field Operations';
      case 'citizen-home':
      case 'alerts':
      case 'report-incident':
      case 'request-assistance':
      case 'evacuation-centers':
      case 'track-requests':
        return 'Public Portal';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="relative h-[72px] border-b flex items-center justify-between px-4 sm:px-8 shrink-0 z-[100] transition-colors backdrop-blur-md bg-white/80 dark:bg-gray-950/80 sticky top-0" style={{ borderColor: 'var(--color-border)' }}>
      
      {/* LEFT: Context (Title & Breadcrumbs) */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 -ml-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 group relative z-0 hover:z-50"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
          <div className="absolute top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] flex flex-col items-center -translate-y-2 group-hover:translate-y-0 pointer-events-none left-1/2 -translate-x-1/2">
            <div className="w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-[#111827] mb-[-1px]"></div>
            <div className="bg-[#111827] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
              Expand / Collapse Navigation
            </div>
          </div>
        </button>
        
        {/* Page Title & Breadcrumbs */}
        <div className="flex items-center text-sm font-medium overflow-hidden">
          <span className="hidden sm:inline" style={{ color: 'var(--color-text-muted)' }}>{getCategoryForTab(activeTab || '')}</span>
          <ChevronRight className="hidden sm:inline w-4 h-4 mx-2" style={{ color: 'var(--color-text-faint)' }} />
          <h1 className="text-sm sm:text-base font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>{title}</h1>
        </div>
      </div>

      {/* CENTER: Discovery (Search Bar) - Removed */}
      <div className="hidden lg:flex flex-1 justify-center max-w-md"></div>
      
      {/* RIGHT: Auxiliary, Actions & Profile */}
      <div className="flex items-center justify-end gap-4 sm:gap-6 flex-1">

        {/* Live System Clock & Status (Hidden on Mobile) */}
        <div className="hidden xl:flex items-center gap-3 pr-4 border-r" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/5 dark:bg-white/5">
            <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-xs font-bold whitespace-nowrap" style={{ color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-default group relative z-0 hover:z-50">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-500 dark:text-emerald-400 whitespace-nowrap">{users.filter((u) => u.status === 'ACTIVE').length.toLocaleString()} Online</span>
            <div className="absolute top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] flex flex-col items-center -translate-y-2 group-hover:translate-y-0 pointer-events-none left-1/2 -translate-x-1/2">
              <div className="w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-[#111827] mb-[-1px]"></div>
              <div className="bg-[#111827] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                Platform Status: Healthy
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 pr-4 sm:pr-6 border-r" style={{ borderColor: 'var(--color-border)' }}>
            
            {['SUPER_ADMIN', 'ADMIN'].includes(currentRole) && (
              <button
                className="hidden sm:flex relative rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 group z-0 hover:z-[60]"
                aria-label="New Incident"
                onClick={() => window.dispatchEvent(new CustomEvent('open-new-incident-modal'))}
              >
                <Plus className="w-5 h-5 transition-colors" style={{ color: 'var(--color-text-secondary)' }} />
                <div className="absolute top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] flex flex-col items-center -translate-y-2 group-hover:translate-y-0 pointer-events-none left-1/2 -translate-x-1/2">
                  <div className="w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-[#111827] mb-[-1px]"></div>
                  <div className="bg-[#111827] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                    File New Incident Report
                  </div>
                </div>
              </button>
            )}
            
            {onOpenAiModal && (
              <button
                onClick={onOpenAiModal}
                className="hidden sm:flex relative rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 group z-0 hover:z-[60]"
                aria-label="Launch AI Support"
              >
                <Sparkles className="w-5 h-5 transition-colors" style={{ color: 'var(--color-text-secondary)' }} />
                
                <div className="absolute top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] flex flex-col items-center -translate-y-2 group-hover:translate-y-0 pointer-events-none left-1/2 -translate-x-1/2">
                  <div className="w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-[#111827] mb-[-1px]"></div>
                  <div className="bg-[#111827] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                    Launch AI Decision Support
                  </div>
                </div>
              </button>
            )}



            {/* Emergency Alerts */}
            <div className="relative" ref={alertsRef}>
              <button
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className="relative rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 group z-0 hover:z-[60]"
                style={{ color: activeAlerts.length > 0 ? '#EF4444' : 'var(--color-text-secondary)' }}
                aria-label="Emergency Alerts"
              >
                <AlertTriangle className="h-5 w-5" />
                {activeAlerts.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#EF4444] px-1 text-[0.625rem] font-black text-white">
                    {activeAlerts.length}
                  </span>
                )}
                <div className="absolute top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] flex flex-col items-center -translate-y-2 group-hover:translate-y-0 pointer-events-none left-1/2 -translate-x-1/2">
                  <div className="w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-[#111827] mb-[-1px]"></div>
                  <div className="bg-[#111827] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                    Review Active Emergency Alerts
                  </div>
                </div>
              </button>
              
              <AnimatePresence>
              {showAlertsDropdown && (
                <motion.div 
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={{
                    open: { opacity: 1, y: 0, scale: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
                    closed: { opacity: 0, y: 10, scale: 0.95, transition: { staggerChildren: 0.05, staggerDirection: -1 } }
                  }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 p-4 rounded-2xl shadow-2xl border z-50 origin-top-right backdrop-blur-xl bg-white/95 dark:bg-gray-900/95"
                  style={{ borderColor: 'var(--color-border)', willChange: 'transform, opacity' }}
                >
                  <motion.div variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: -10 } }} className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                      Emergency Alerts ({activeAlerts.length})
                    </span>
                    <button 
                      onClick={() => setShowAlertsDropdown(false)}
                      className="p-1 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                      aria-label="Close alerts"
                    >
                      <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    </button>
                  </motion.div>
                  <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                    {activeAlerts.length === 0 ? (
                      <motion.p variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 10 } }} className="text-xs text-center py-4 font-bold" style={{ color: 'var(--color-text-muted)' }}>No active emergency alerts at this time.</motion.p>
                    ) : (
                      activeAlerts.map(alt => (
                        <motion.div variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 10 } }} transition={{ type: "spring", stiffness: 300, damping: 24 }} key={alt.id} className="p-3 rounded-xl border space-y-1 bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30 shadow-sm transition-colors hover:shadow-md cursor-pointer hover:bg-red-100 dark:hover:bg-red-500/20">
                          <div className="font-bold text-red-600 dark:text-red-400 text-xs">{alt.title}</div>
                          <div className="text-xs font-medium leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{alt.instructions}</div>
                          <div className="text-[10px] font-bold pt-1 flex justify-between uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                            <span>Area: {alt.affectedArea}</span>
                            <span>By: {alt.issuedBy}</span>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>


            
          </div>

          {/* Profile Section */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-1 pl-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group relative z-0 hover:z-[60]"
            >
              <div className="hidden sm:flex flex-col items-end justify-center pr-1">
                {isGuest ? (
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">Guest Mode</span>
                ) : (
                  <p className="text-sm font-bold leading-tight whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>{currentUser.name}</p>
                )}
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mt-1 bg-blue-500/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                  {isGuest ? 'Guest Citizen' : formatRoleDisplay(currentRole)}
                </p>
              </div>
              
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={name} className="w-8 h-8 rounded-full border object-cover" style={{ borderColor: 'var(--color-border)' }} />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: 'var(--color-accent)' }}>
                  {initials}
                </div>
              )}
              
              {/* Profile Tooltip - Align Right */}
              <div className="absolute top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] flex flex-col items-end -translate-y-2 group-hover:translate-y-0 pointer-events-none right-0">
                <div className="w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-[#111827] mb-[-1px] mr-4"></div>
                <div className="bg-[#111827] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                  Manage Account & Settings
                </div>
              </div>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={{
                    open: { opacity: 1, y: 0, scale: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
                    closed: { opacity: 0, y: 10, scale: 0.95, transition: { staggerChildren: 0.05, staggerDirection: -1 } }
                  }}
                  className="absolute right-0 mt-2 w-56 p-2 rounded-xl shadow-xl z-[9999] border origin-top-right backdrop-blur-xl bg-white/90 dark:bg-gray-900/90"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <motion.div variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: -10 } }} className="px-3 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {isGuest ? 'Guest Citizen' : currentUser.name}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {isGuest ? 'No account — browsing as guest' : currentUser.email}
                  </p>
                  </motion.div>
                  
                  <motion.div variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: -10 } }} className="py-2">
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full text-left px-4 py-2 text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 rounded-lg" style={{ color: 'var(--color-text-primary)' }}>
                      {isDarkMode ? <Sun className="w-4 h-4 text-slate-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
                      Appearance: {isDarkMode ? 'Dark' : 'Light'}
                    </button>
                    <button className="w-full text-left px-4 py-2 text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 rounded-lg" style={{ color: 'var(--color-text-primary)' }}>
                      <Settings className="w-4 h-4 text-slate-400" />
                      Account Settings
                    </button>
                    <button className="w-full text-left px-4 py-2 text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 rounded-lg" style={{ color: 'var(--color-text-primary)' }}>
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      Help & Support
                    </button>
                  </motion.div>

                  <motion.div variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: -10 } }} className="border-t py-2" style={{ borderColor: 'var(--color-border)' }}>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowLogoutModal(true);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold transition-colors text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 flex items-center gap-2 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
        </div>
      </div>

      {/* Logout Confirmation Modal - Matching Sidebar & Mobile View Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowLogoutModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.25)] flex flex-col items-center text-center relative overflow-hidden z-10 border border-slate-100 dark:border-slate-800"
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
                className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight z-10"
              >
                Confirm Logout
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium px-2 z-10 leading-relaxed"
              >
                Are you sure you want to sign out of your account? You will need to log back in to access your dashboard.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="flex gap-3 w-full z-10"
              >
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3.5 px-4 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] rounded-xl transition-all focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    logout();
                  }}
                  className="flex-1 py-3.5 px-4 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 active:scale-[0.98] rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none"
                >
                  Log Out
                </button>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};
