import React, { useState, useEffect } from "react";
import { SmartReliefProvider, useSmartRelief } from "./context/SmartReliefContext";
import { PageLayout } from "./components/layout/PageLayout";
import { MobileLayout } from "./components/layout/MobileLayout";
import { SuperAdminPortal } from "./components/roles/superadmin/SuperAdminPortal";
import { AdminPortal } from "./components/roles/admin/AdminPortal";
import { ResponderPortal } from "./components/roles/responder/ResponderPortal";
import { CitizenPortal } from "./components/roles/citizen/CitizenPortal";
import { AIDecisionSupportModal } from "./components/ai/AIDecisionSupportModal";
import { GlobalNotifications } from "./components/common/GlobalNotifications";
import { LoginPage } from "./components/auth/LoginPage";
import { motion, AnimatePresence } from "motion/react";

function MainContent() {
  const { currentRole, isAuthenticated } = useSmartRelief();

  // Tab State
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Automatically update default active tab when role changes
  useEffect(() => {
    switch (currentRole) {
      case "SUPER_ADMIN":
        setActiveTab("users");
        break;
      case "ADMIN":
        setActiveTab("dashboard");
        break;
      case "RESPONDER":
        setActiveTab("field-dashboard");
        break;
      case "CITIZEN":
      default:
        setActiveTab("citizen-home");
        break;
    }
  }, [currentRole]);

  // Determine page title based on active tab
  const getPageTitle = (tab: string, role: string) => {
    switch(tab) {
      case 'dashboard': return 'Command Center';
      case 'map': return 'Live Map';
      case 'ai-support': return 'AI Advisor';
      case 'incidents': return 'Active Incidents';
      case 'requests': return 'Citizen Requests';
      case 'resources': return 'Logistics & Inventory';
      case 'evacuation': return 'Evacuation Shelters';
      case 'responders': return 'Field Responders';
      case 'users': return 'User Management';
      case 'roles': return 'Access Control';
      case 'audit': return 'Audit Logs';
      case 'settings': return 'System Settings';
      case 'reports': return 'Reports';
      case 'field-dashboard': return 'Tactical Field Terminal';
      case 'tactical-map': return 'Tactical GIS Map';
      case 'assignments': return 'Active Missions & Duty Checklist';
      case 'field-report': return 'Field Situation Report (SitRep)';
      case 'resource-requisition': return 'Logistics & Requisition';
      case 'responder-schedule': return 'Shift Schedule & Crew Roster';
      case 'citizen-home': return 'Citizen Emergency Command';
      case 'alerts': return 'Live Disaster Alerts & Directives';
      case 'report-incident': return 'Report Emergency Incident';
      case 'request-assistance': return 'Request Emergency Assistance';
      case 'evacuation-centers': return 'Find Evacuation Shelters';
      case 'track-requests': return 'Track Reports & Requests';
      default: return 'Dashboard';
    }
  };
  const title = getPageTitle(activeTab, currentRole);

  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Use native-styled MobileLayout with BottomNav on mobile/tablet viewports for Citizen & Responder
  const isMobileRole = isMobileScreen && (currentRole === "CITIZEN" || currentRole === "RESPONDER");

  const renderContent = () => (
    <>
      {currentRole === "SUPER_ADMIN" && (
        ['users', 'roles', 'audit', 'settings', 'reports'].includes(activeTab)
          ? <SuperAdminPortal activeTab={activeTab} />
          : <AdminPortal activeTab={activeTab} onOpenAiModal={() => setIsAiModalOpen(true)} onNavigateTab={setActiveTab} />
      )}
      {currentRole === "ADMIN" && <AdminPortal activeTab={activeTab} onOpenAiModal={() => setIsAiModalOpen(true)} onNavigateTab={setActiveTab} />}
      {currentRole === "RESPONDER" && <ResponderPortal activeTab={activeTab} onSelectTab={tabId => setActiveTab(tabId)} />}
      {currentRole === "CITIZEN" && <CitizenPortal activeTab={activeTab} onSelectTab={tabId => setActiveTab(tabId)} />}
    </>
  );

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        <motion.div
          key="login"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full min-h-screen flex flex-col"
        >
          <LoginPage />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full min-h-screen flex flex-col"
        >
          {isMobileRole ? (
            <MobileLayout
              activeTab={activeTab}
              onSelectTab={(tabId) => setActiveTab(tabId)}
              onOpenAiModal={() => setIsAiModalOpen(true)}
            >
              {renderContent()}
            </MobileLayout>
          ) : (
            <PageLayout
              title={title}
              activeTab={activeTab}
              onSelectTab={(tabId) => setActiveTab(tabId)}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              onCloseSidebar={() => setIsSidebarOpen(false)}
              onOpenAiModal={() => setIsAiModalOpen(true)}
              contentClassName={activeTab === 'map' ? "h-full w-full" : "max-w-[1500px] mx-auto w-full h-full flex flex-col"}
            >
              {renderContent()}
            </PageLayout>
          )}

          {/* Global AI Decision Support Modal */}
          <AIDecisionSupportModal
            isOpen={isAiModalOpen}
            onClose={() => setIsAiModalOpen(false)}
          />

          <GlobalNotifications />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function App() {
  return (
    <SmartReliefProvider>
      <MainContent />
    </SmartReliefProvider>
  );
}

export default App;
