import React, { useState, useEffect } from "react";
import { SmartReliefProvider, useSmartRelief } from "./context/SmartReliefContext";
import { Navbar } from "./components/layout/Navbar";
import { Sidebar } from "./components/layout/Sidebar";
import { SuperAdminPortal } from "./components/roles/superadmin/SuperAdminPortal";
import { AdminPortal } from "./components/roles/admin/AdminPortal";
import { ResponderPortal } from "./components/roles/responder/ResponderPortal";
import { CitizenPortal } from "./components/roles/citizen/CitizenPortal";
import { AIDecisionSupportModal } from "./components/ai/AIDecisionSupportModal";

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
        setActiveTab("overview");
        break;
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

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
      />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={tabId => setActiveTab(tabId)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Center Main Stage Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {currentRole === "SUPER_ADMIN" && <SuperAdminPortal activeTab={activeTab} />}
          {currentRole === "ADMIN" && <AdminPortal activeTab={activeTab} onOpenAiModal={() => setIsAiModalOpen(true)} />}
          {(currentRole === "RESPONDER" || currentRole === "VOLUNTEER") && <ResponderPortal activeTab={activeTab} />}
          {currentRole === "CITIZEN" && <CitizenPortal activeTab={activeTab} onSelectTab={tabId => setActiveTab(tabId)} />}
        </main>
      </div>

      {/* Global AI Decision Support Modal */}
      <AIDecisionSupportModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
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
