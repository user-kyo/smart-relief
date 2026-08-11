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

function MainContent() {
  const { currentRole } = useSmartRelief();

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

  // Determine page title based on active tab and role
  let title = "Dashboard";
  if (currentRole === "CITIZEN") title = "Emergency Services";
  else if (currentRole === "RESPONDER") title = "Field Command";
  else if (activeTab === "incidents") title = "Incident Management";
  else if (activeTab === "requests") title = "Assistance Requests";
  else if (activeTab === "resources") title = "Resource Inventory";
  else if (activeTab === "map") title = "GIS Operations Map";
  else if (activeTab === "analytics") title = "Analytics & Reports";

  const isMobileRole = currentRole === "RESPONDER" || currentRole === "VOLUNTEER" || currentRole === "CITIZEN";

  const renderContent = () => (
    <>
      {currentRole === "SUPER_ADMIN" && (
        ['overview', 'users', 'roles', 'lgus', 'audit', 'settings'].includes(activeTab)
          ? <SuperAdminPortal activeTab={activeTab} />
          : <AdminPortal activeTab={activeTab} onOpenAiModal={() => setIsAiModalOpen(true)} />
      )}
      {currentRole === "ADMIN" && <AdminPortal activeTab={activeTab} onOpenAiModal={() => setIsAiModalOpen(true)} />}
      {(currentRole === "RESPONDER" || currentRole === "VOLUNTEER") && <ResponderPortal activeTab={activeTab} />}
      {currentRole === "CITIZEN" && <CitizenPortal activeTab={activeTab} onSelectTab={tabId => setActiveTab(tabId)} />}
    </>
  );

  return (
    <>
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
          contentClassName={activeTab === 'map' ? "h-full w-full" : "max-w-6xl mx-auto w-full"}
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
    </>
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
