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
  Plus
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
    alerts,
    logout
  } = useSmartRelief();

  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
      case 'SUPER_ADMIN': return 'National Command';
      case 'ADMIN': return 'BDRRMC (Manila)';
      case 'RESPONDER': return 'Field Unit Alpha';

      default: return 'Public Guest';
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
      case 'analytics':
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
    <header className="relative h-[72px] border-b flex items-center justify-between px-4 sm:px-8 shrink-0 z-40 transition-colors backdrop-blur-md bg-white/80 dark:bg-gray-950/80 sticky top-0" style={{ borderColor: 'var(--color-border)' }}>
      
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
        <div className="hidden sm:flex items-center text-sm font-medium">
          <span style={{ color: 'var(--color-text-muted)' }}>{getCategoryForTab(activeTab || '')}</span>
          <ChevronRight className="w-4 h-4 mx-2" style={{ color: 'var(--color-text-faint)' }} />
          <h1 className="text-base font-bold whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>{title}</h1>
        </div>
      </div>

      {/* CENTER: Discovery (Search Bar) */}
      <div className="hidden lg:flex flex-1 justify-center max-w-md">
        <div className="flex items-center w-full max-w-sm bg-black/5 dark:bg-white/5 border rounded-xl px-3 py-1.5 transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:max-w-md hover:bg-black/10 dark:hover:bg-white/10 shadow-inner" style={{ borderColor: 'var(--color-border)' }}>
          <Search className="w-4 h-4 mr-2" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-medium w-full transition-all"
            style={{ color: 'var(--color-text-primary)' }}
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={() => setSearchQuery("")}
                className="ml-1 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex-shrink-0"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
      
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
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-500 dark:text-emerald-400">1,204 Online</span>
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
                <p className="text-sm font-bold leading-tight whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>{currentUser.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mt-1 bg-blue-500/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                  {formatRoleDisplay(currentRole)}
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
                  className="absolute right-0 mt-2 w-56 p-2 rounded-xl shadow-xl z-50 border origin-top-right backdrop-blur-xl bg-white/90 dark:bg-gray-900/90"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <motion.div variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: -10 } }} className="px-3 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <p className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{currentUser.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{currentUser.email}</p>
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
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold transition-colors text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 flex items-center gap-2 rounded-lg"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
        </div>
      </div>


    </header>
  );
};
