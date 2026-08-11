import React from "react";
import {
  LayoutDashboard,
  Compass,
  Radio,
  PackagePlus,
  Calendar,
  CheckSquare,
  Siren,
  AlertOctagon,
  LifeBuoy,
  Search,
  Clock,
  Bell
} from "lucide-react";
import { useSmartRelief } from "../../context/SmartReliefContext";
import { UserRole } from "../../types";

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const { currentRole } = useSmartRelief();

  const getRoleNavItems = (role: UserRole) => {
    switch (role) {
      case "RESPONDER":
      case "VOLUNTEER":
        return [
          { id: "field-dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "assignments", label: "Tasks", icon: CheckSquare },
          { id: "tactical-map", label: "Map", icon: Compass },
          { id: "field-report", label: "Report", icon: Radio },
          { id: "resource-requisition", label: "Request", icon: PackagePlus }
        ];

      case "CITIZEN":
      default:
        return [
          { id: "citizen-home", label: "Home", icon: Siren },
          { id: "report-incident", label: "Report", icon: AlertOctagon },
          { id: "request-assistance", label: "Request", icon: LifeBuoy },
          { id: "evacuation-centers", label: "Shelter", icon: Search },
          { id: "track-requests", label: "Track", icon: Clock }
        ];
    }
  };

  const navItems = getRoleNavItems(currentRole);

  return (
    <nav className="absolute bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] pb-safe z-50">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[64px] transition-all duration-200 ${
                isActive ? "text-blue-600 scale-110" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className={`p-1.5 rounded-full ${isActive ? "bg-blue-50" : ""}`}>
                <Icon className={`w-5 h-5 ${isActive ? "fill-blue-600/20" : ""}`} />
              </div>
              <span className={`text-[10px] mt-1 font-semibold ${isActive ? "text-blue-700" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
