import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { motion, AnimatePresence } from 'motion/react';
import { useSmartRelief } from '../../context/SmartReliefContext';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onCloseSidebar: () => void;
  contentClassName?: string;
  onOpenAiModal?: () => void;
}

export function PageLayout({ 
  children, 
  title, 
  activeTab,
  onSelectTab,
  isSidebarOpen,
  onToggleSidebar,
  onCloseSidebar,
  contentClassName = 'max-w-6xl mx-auto w-full',
  onOpenAiModal
}: PageLayoutProps) {
  
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden relative" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Natural ambient background lighting (from EIMS) */}
      <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-400/10 blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-blue-300/10 blur-[140px] pointer-events-none z-0" />
      
      <div className="relative z-10 flex h-full w-full">
        <Sidebar 
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          isOpen={isSidebarOpen}
          onClose={onCloseSidebar}
          onToggleSidebar={onToggleSidebar}
        />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header title={title} activeTab={activeTab} onOpenAiModal={onOpenAiModal} onToggleSidebar={onToggleSidebar} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab} // Animate on tab change
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={contentClassName}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
