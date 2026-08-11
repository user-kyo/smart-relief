import React from "react";
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
  Bell
} from "lucide-react";
import { useSmartRelief } from "../../context/SmartReliefContext";
import { UserRole } from "../../types";

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose
}) => {
  const { currentRole, incidents, assistanceRequests, resources, aiRecommendations } = useSmartRelief();

  // Badges
  const pendingIncidents = incidents.filter(i => i.status === "REPORTED" || i.status === "VERIFIED").length;
  const pendingRequests = assistanceRequests.filter(r => r.status === "SUBMITTED" || r.status === "VERIFIED").length;
  const lowStockResources = resources.filter(r => r.stockStatus === "LOW_STOCK" || r.stockStatus === "DEPLETED").length;
  const pendingAiRecs = aiRecommendations.filter(r => r.status === "PENDING").length;

  const getRoleNavItems = (role: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return [
          { id: "overview", label: "System Overview", icon: LayoutDashboard },
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
          className="fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 z-30 w-64 h-[calc(100vh-4rem)] bg-[#0F172A] border-r border-slate-800 text-slate-300 flex flex-col justify-between transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          
          {/* Active Portal Indicator Banner */}
          <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Active View Portal</div>
            <div className="text-sm font-extrabold text-white mt-0.5 flex items-center justify-between">
              <span>{currentRole.replace("_", " ")}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* Nav Items Group */}
          <nav className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-2 pb-2">
              Core Operations
            </div>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-blue-600/10 text-blue-400 border border-blue-600/20 font-bold"
                      : "hover:bg-slate-800/50 text-slate-300 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-red-500/20 border border-red-500/30 text-red-400 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-[#0F172A] text-slate-400 text-[11px] space-y-1">
          <div className="flex items-center justify-between">
            <span>Server Sync</span>
            <span className="text-emerald-400 font-mono font-semibold">● ONLINE</span>
          </div>
          <div className="text-[10px] text-slate-500">SmartRelief LGU-DRRM Engine</div>
        </div>
      </aside>
    </>
  );
};
