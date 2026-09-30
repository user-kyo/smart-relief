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
      case "ADMIN":
        setActiveTab("dashboard");
        break;
      case "RESPONDER":
      case "VOLUNTEER":
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
      case 'lgus': return 'Organizations';
      case 'overview': return 'Platform Status';
      case 'users': return 'User Management';
      case 'roles': return 'Access Control';
      case 'audit': return 'Audit Logs';
      case 'settings': return 'System Settings';
      case 'analytics': return 'Analytics & Reports';
      case 'field-dashboard': return 'Field Dashboard';
      case 'tactical-map': return 'Tactical Map';
      case 'assignments': return 'My Assignments';
      case 'field-report': return 'Submit Field Report';
      case 'resource-requisition': return 'Resource Requisition';
      case 'volunteer-tasks': return 'Available Tasks';
      case 'citizen-home': return 'Emergency Services';
      case 'alerts': return 'Public Alerts';
      case 'report-incident': return 'Report an Incident';
      case 'request-assistance': return 'Request Assistance';
      case 'evacuation-centers': return 'Find Shelters';
      case 'track-requests': return 'Track Requests';
      default: return 'Dashboard';
    }
  };
  const title = getPageTitle(activeTab, currentRole);

  const isMobileRole = currentRole === "RESPONDER" || currentRole === "VOLUNTEER" || currentRole === "CITIZEN";

  const renderContent = () => (
    <>
      {currentRole === "SUPER_ADMIN" && (
        ['overview', 'users', 'roles', 'lgus', 'audit', 'settings'].includes(activeTab)
          ? <SuperAdminPortal activeTab={activeTab} />
          : <AdminPortal activeTab={activeTab} onOpenAiModal={() => setIsAiModalOpen(true)} onNavigateTab={setActiveTab} />
      )}
      {currentRole === "ADMIN" && <AdminPortal activeTab={activeTab} onOpenAiModal={() => setIsAiModalOpen(true)} onNavigateTab={setActiveTab} />}
      {(currentRole === "RESPONDER" || currentRole === "VOLUNTEER") && <ResponderPortal activeTab={activeTab} />}
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
              contentClassName={activeTab === 'map' ? "h-full w-full" : "max-w-[1500px] mx-auto w-full"}
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
