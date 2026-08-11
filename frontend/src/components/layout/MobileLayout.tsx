import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNav } from './BottomNav';
import { useSmartRelief } from '../../context/SmartReliefContext';
import { UserRole } from '../../types';

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
  const { currentRole, setRole, currentUser } = useSmartRelief();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const roles: { id: UserRole; label: string; desc: string }[] = [
    { id: "SUPER_ADMIN", label: "Super Admin", desc: "Platform administration & system governance" },
    { id: "ADMIN", label: "Admin", desc: "Operational incident command" },
    { id: "RESPONDER", label: "Responder", desc: "Field-optimized action deployment" },
    { id: "CITIZEN", label: "Citizen", desc: "Public reporting & assistance" }
  ];

  return (
    <div className="relative w-full h-[100dvh] flex flex-col overflow-hidden bg-slate-50">
        {/* Ambient Background matching EIMS */}
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-400/20 blur-[80px] pointer-events-none z-0" />
        
        {/* Minimal Mobile Header */}
        <header className="relative z-50 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white italic shrink-0 shadow-sm">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight text-slate-900">
                SmartRelief
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{currentRole.replace("_", " ")}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {onOpenAiModal && (
              <button onClick={onOpenAiModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
                <span className="text-sm">✨</span>
              </button>
            )}
            
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm"
              >
                <img src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.name}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 p-2 rounded-xl shadow-xl z-50 border bg-white border-slate-200"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Switch Role (Testing)</p>
                    </div>
                    {roles.map(r => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setRole(r.id);
                          setShowProfileMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors mb-1 last:mb-0 ${currentRole === r.id ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                      >
                        <div className="text-xs font-bold text-slate-900">{r.label}</div>
                        <div className="text-[10px] mt-0.5 text-slate-500">{r.desc}</div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onSelectTab={onSelectTab} />
    </div>
  );
}
