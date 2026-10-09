import React from "react";
import {
  LayoutDashboard,
  Compass,
  Radio,
  PackagePlus,
  CheckSquare,
  Siren,
  AlertOctagon,
  LifeBuoy,
  Search,
  Clock,
  Home,
  Users2
} from "lucide-react";
import { useSmartRelief } from "../../context/SmartReliefContext";
import { UserRole } from "../../types";

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const { currentRole, assistanceRequests, incidents } = useSmartRelief();

  const activeRequestCount = assistanceRequests.filter(
    r => r.status !== "RESOLVED" && r.status !== "REJECTED"
  ).length;

  const activeIncidentCount = incidents.filter(
    i => i.status !== "RESOLVED" && i.status !== "CLOSED"
  ).length;

  const getRoleNavItems = (role: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
      case "ADMIN":
        return [
          { id: "dashboard", label: "Command", icon: LayoutDashboard },
          { id: "incidents", label: "Incidents", icon: AlertOctagon, badge: activeIncidentCount > 0 ? activeIncidentCount : undefined },
          { id: "requests", label: "Requests", icon: LifeBuoy, badge: activeRequestCount > 0 ? activeRequestCount : undefined },
          { id: "evacuation", label: "Shelters", icon: Home },
          { id: "responders", label: "Units", icon: Users2 }
        ];

      case "RESPONDER":
        return [
          { id: "field-dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "assignments", label: "Missions", icon: CheckSquare, badge: activeIncidentCount > 0 ? activeIncidentCount : undefined },
          { id: "tactical-map", label: "Map", icon: Compass },
          { id: "field-report", label: "Report", icon: Radio },
          { id: "resource-requisition", label: "Supplies", icon: PackagePlus }
        ];

      case "CITIZEN":
      default:
        return [
          { id: "citizen-home", label: "Home", icon: Siren },
          { id: "report-incident", label: "Report", icon: AlertOctagon },
          { id: "request-assistance", label: "Help", icon: LifeBuoy },
          { id: "evacuation-centers", label: "Shelter", icon: Search },
          { id: "track-requests", label: "My Requests", icon: Clock, badge: (activeRequestCount + activeIncidentCount) > 0 ? (activeRequestCount + activeIncidentCount) : undefined }
        ];
    }
  };

  const navItems = getRoleNavItems(currentRole);

  return (
    <nav className="fixed bottom-0 inset-x-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_25px_-5px_rgba(0,0,0,0.08)] z-50 pt-2 pb-[max(env(safe-area-inset-bottom),0.6rem)]">
      <div className="flex items-center justify-around px-2 max-w-lg mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 relative group cursor-pointer ${
                isActive ? "text-blue-600 dark:text-blue-400 scale-105" : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all relative ${isActive ? "bg-blue-50 dark:bg-blue-900/30" : ""}`}>
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[16px] h-4 text-[9px] font-black rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 font-bold tracking-tight ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
