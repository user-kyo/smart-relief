import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNav } from './BottomNav';
import { useSmartRelief } from '../../context/SmartReliefContext';
import { UserRole } from '../../types';
import { Bell, LogOut, Sparkles, User, ShieldCheck, ChevronRight, Menu, X, MapPin, UserCheck } from 'lucide-react';

interface MobileLayoutProps {
  children: ReactNode;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenAiModal?: () => void;
}

export function MobileLayout({
  children,
  activeTab,
  onSelectTab,
  onOpenAiModal
}: MobileLayoutProps) {
  const { currentRole, setRole, currentUser, isGuest, alerts, logout } = useSmartRelief();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDrawerMenu, setShowDrawerMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const activeAlertsCount = alerts.filter(a => a.active).length;

  const roles: { id: UserRole; label: string; desc: string }[] = [
    { id: "SUPER_ADMIN", label: "Super Admin", desc: "Platform governance" },
    { id: "ADMIN", label: "Admin", desc: "Command & dispatch" },
    { id: "RESPONDER", label: "Responder", desc: "Field tactical unit" },
    { id: "CITIZEN", label: "Citizen", desc: "Public assistance" }
  ];

  // Role-specific full tabs menu for drawer
  const getDrawerTabs = () => {
    switch (currentRole) {
      case "RESPONDER":
        return [
          { id: "field-dashboard", label: "Tactical Dashboard" },
          { id: "assignments", label: "Active Missions & Tasks" },
          { id: "tactical-map", label: "Tactical GIS Map" },
          { id: "field-report", label: "Submit Field SitRep" },
          { id: "resource-requisition", label: "Logistics Requisition" },
          { id: "responder-schedule", label: "Shift Schedule & Crew" }
        ];
      case "SUPER_ADMIN":
      case "ADMIN":
        return [
          { id: "dashboard", label: "Command Center" },
          { id: "incidents", label: "Active Incidents" },
          { id: "requests", label: "Citizen Requests" },
          { id: "resources", label: "Logistics & Inventory" },
          { id: "evacuation", label: "Evacuation Shelters" },
          { id: "responders", label: "Field Responders" },
          { id: "reports", label: "SitRep Reports" }
        ];
      case "CITIZEN":
      default:
        return [
          { id: "citizen-home", label: "Emergency Home Hub" },
          { id: "alerts", label: "Live Disaster Alerts & Directives" },
          { id: "report-incident", label: "Report Emergency Incident" },
          { id: "request-assistance", label: "Request Rescue / Aid" },
          { id: "evacuation-centers", label: "Find Evacuation Shelters" },
          { id: "track-requests", label: "Track My Reports & Requests" }
        ];
    }
  };

  return (
    <div className="relative w-full h-[100dvh] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Ambient Background matching system aesthetic */}
      <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[70%] rounded-full bg-blue-400/15 blur-[90px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[70%] rounded-full bg-rose-400/10 blur-[90px] pointer-events-none z-0" />
      
      {/* Streamlined Mobile Top Header */}
      <header className="relative z-40 flex items-center justify-between px-3.5 py-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          {/* Quick Menu Drawer Button */}
          <button
            onClick={() => setShowDrawerMenu(true)}
            className="p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => onSelectTab(currentRole === "RESPONDER" ? "field-dashboard" : currentRole === "ADMIN" ? "dashboard" : "citizen-home")}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white italic shrink-0 shadow-sm text-sm">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xs tracking-tight text-slate-900 dark:text-white leading-none">
                SmartRelief
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-[8.5px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded-md ${
                  isGuest 
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                    : currentRole === "RESPONDER"
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                }`}>
                  {isGuest ? "GUEST CITIZEN" : currentRole.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Disaster Alerts Button with Active Count */}
          <button
            onClick={() => onSelectTab("alerts")}
            className="p-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="View alerts"
          >
            <Bell className="w-4 h-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center animate-pulse">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* AI Decision Support - Exclusive to Command/Admin dispatch */}
          {['SUPER_ADMIN', 'ADMIN'].includes(currentRole) && onOpenAiModal && (
            <button 
              onClick={onOpenAiModal} 
              className="p-1.5 flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
              aria-label="Open AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
          
          {/* User Profile Avatar & Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-white dark:border-slate-800 shadow-xs cursor-pointer"
            >
              <img 
                src={currentUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || "User")}&background=0284c7&color=fff`} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-black/20"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 p-2 rounded-2xl shadow-2xl z-50 border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  >
                    {/* User Header Info */}
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {isGuest
                            ? 'Guest Citizen'
                            : currentUser?.name || (currentRole === "RESPONDER" ? "Field Responder" : "Citizen")}
                        </div>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                          isGuest
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                            : currentRole === "RESPONDER"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                        }`}>
                          {isGuest ? "Guest" : currentRole === "RESPONDER" ? "Responder" : "Citizen"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {isGuest ? 'No account — browsing as guest' : currentUser?.email || 'citizen@smartrelief.gov.ph'}
                      </div>
                    </div>

                    {/* Verified LGU Jurisdiction & Connection Status */}
                    <div className="mx-1 px-2.5 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 mb-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span className="truncate">Rizal, Laguna, Philippines</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span>System Live • Connected</span>
                      </div>
                    </div>

                    {/* Quick Portal Shortcuts */}
                    <div className="space-y-0.5 mb-1.5">
                      {currentRole === "CITIZEN" ? (
                        <>
                          <button
                            onClick={() => {
                              onSelectTab("track-requests");
                              setShowProfileMenu(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-xl transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                          >
                            <span>My Reports & Requests</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                          <button
                            onClick={() => {
                              onSelectTab("alerts");
                              setShowProfileMenu(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-xl transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                          >
                            <span>Emergency Alerts</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        </>
                      ) : currentRole === "RESPONDER" ? (
                        <>
                          <button
                            onClick={() => {
                              onSelectTab("assignments");
                              setShowProfileMenu(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-xl transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                          >
                            <span>My Active Missions</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                          <button
                            onClick={() => {
                              onSelectTab("field-report");
                              setShowProfileMenu(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-xl transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                          >
                            <span>Submit Tactical SitRep</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        </>
                      ) : (
                        <div className="pt-1">
                          <p className="px-2 pb-1 text-[9px] font-black uppercase tracking-wider text-slate-400">Portal View</p>
                          {roles.map(r => (
                            <button
                              key={r.id}
                              onClick={() => {
                                setRole(r.id);
                                setShowProfileMenu(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors text-xs font-bold flex items-center justify-between ${
                                currentRole === r.id 
                                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              <span>{r.label}</span>
                              {currentRole === r.id && <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Account Actions */}
                    <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-1.5 space-y-0.5">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowLogoutModal(true);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl transition-colors text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                        <span>Switch Account</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowLogoutModal(true);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl transition-colors text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{isGuest ? "Exit Guest Mode" : "Sign Out"}</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Drawer for Extra Tabs */}
      <AnimatePresence>
        {showDrawerMenu && (
          <div className="fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs"
              onClick={() => setShowDrawerMenu(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="relative w-72 max-w-[80vw] h-full bg-white dark:bg-slate-900 shadow-2xl z-10 flex flex-col p-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-xs">S</div>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">All Navigation</span>
                </div>
                <button 
                  onClick={() => setShowDrawerMenu(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-1">
                {getDrawerTabs().map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onSelectTab(tab.id);
                      setShowDrawerMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setShowDrawerMenu(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isGuest ? "Exit Guest Mode" : "Log Out"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-4 pb-24 relative z-10 overscroll-contain">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Anchored Bottom Navigation */}
      <BottomNav activeTab={activeTab} onSelectTab={onSelectTab} />

      {/* Logout Confirmation Modal - Matching Desktop View Modal */}
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
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.25)] flex flex-col items-center text-center relative overflow-hidden z-10 border border-slate-100 dark:border-slate-800"
            >
              {/* Decorative background glow */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none" />

              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.6, bounce: 0.5, delay: 0.1 }}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-red-500 to-rose-400 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 shadow-[0_10px_25px_rgba(239,68,68,0.3)] rotate-3 z-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
                >
                  <LogOut className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-0.5" strokeWidth={2.5} />
                </motion.div>
              </motion.div>
              
              <motion.h3 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight z-10"
              >
                {isGuest ? "Exit Guest Mode" : "Confirm Logout"}
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 font-medium px-2 z-10 leading-relaxed"
              >
                {isGuest
                  ? "Are you sure you want to exit guest mode? You will return to the authentication screen."
                  : "Are you sure you want to sign out of your account? You will need to log back in to access your dashboard."}
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="flex gap-3 w-full z-10"
              >
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 px-4 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] rounded-xl transition-all focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    logout();
                  }}
                  className="flex-1 py-3 px-4 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 active:scale-[0.98] rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none"
                >
                  {isGuest ? "Exit" : "Log Out"}
                </button>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
