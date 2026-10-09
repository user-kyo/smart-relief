import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Users2, Search, Radio, UserCheck, UserMinus, ShieldAlert,
  Phone, Users, MapPin, CheckCircle2, Shield, Flame, Stethoscope, Activity, Truck
} from "lucide-react";
import { useSmartRelief } from "../../../context/SmartReliefContext";
import { KPICard } from "../../common/KPICard";

const ROLE_ICONS = {
  DISASTER_RESPONSE_TEAM: ShieldAlert,
  MEDICAL_TEAM: Stethoscope,
  FIRE_RESCUE: Flame,
  POLICE_ENFORCEMENT: Shield,
  VOLUNTEER: Users,
  LOGISTICS: Truck
} as const;

const ROLE_COLORS = {
  DISASTER_RESPONSE_TEAM: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  MEDICAL_TEAM: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  FIRE_RESCUE: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  POLICE_ENFORCEMENT: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  VOLUNTEER: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  LOGISTICS: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
};

const ROLE_LABELS = {
  DISASTER_RESPONSE_TEAM: "Disaster Response",
  MEDICAL_TEAM: "Medical Team",
  FIRE_RESCUE: "Fire & Rescue",
  POLICE_ENFORCEMENT: "Police Enforcement",
  VOLUNTEER: "Volunteer Corp",
  LOGISTICS: "Logistics Unit",
};

export const ResponderManagementTab = () => {
  const { responders, updateResponderStatus } = useSmartRelief();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");

  const filteredResponders = useMemo(() => {
    return responders.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            r.codeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "ALL" || r.roleType === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [responders, searchTerm, filterRole]);

  const totalResponders = responders.length;
  const availableCount = responders.filter(r => r.status === "AVAILABLE").length;
  const dispatchedCount = responders.filter(r => r.status === "EN_ROUTE" || r.status === "ON_SCENE").length;
  const restCount = responders.filter(r => r.status === "OFFLINE").length;
  const totalPersonnel = responders.reduce((sum, r) => sum + r.teamSize, 0);


  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      className="space-y-6"
    >
      {/* HEADER SECTION */}
      <div className="group relative z-40 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-transparent dark:from-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users2 className="w-6 h-6 text-indigo-500" />
            Field Unit Responders
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Manage deployment, track availability, and coordinate tactical response units.</p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search units or codename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-56 pl-9 pr-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs font-medium dark:text-white transition-all hover:bg-white dark:hover:bg-slate-800"
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full sm:w-40 px-3 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            {Object.entries(ROLE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Personnel" 
          value={totalPersonnel.toLocaleString()} 
          icon={Users2} 
          trend={{ value: `${totalResponders} active units`, isUp: true }}
          variant="indigo"
        />
        <KPICard 
          title="Available to Deploy" 
          value={availableCount.toString()} 
          icon={UserCheck} 
          trend={{ value: "Ready for immediate dispatch", isUp: availableCount > 0 }}
          variant="emerald"
        />
        <KPICard 
          title="Active on Field" 
          value={dispatchedCount.toString()} 
          icon={Activity} 
          trend={{ value: "Currently resolving incidents", isUp: true }}
          variant="amber"
        />
        <KPICard 
          title="Resting / Off-Duty" 
          value={restCount.toString()} 
          icon={UserMinus} 
          trend={{ value: "Recovering units", isUp: false }}
          variant="slate"
        />
      </div>

      {/* RESPONDERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredResponders.map(unit => {
          const Icon = ROLE_ICONS[unit.roleType as keyof typeof ROLE_ICONS] || Users;
          const roleColor = ROLE_COLORS[unit.roleType as keyof typeof ROLE_COLORS] || "bg-slate-100 text-slate-700";
          const roleLabel = ROLE_LABELS[unit.roleType as keyof typeof ROLE_LABELS] || unit.roleType;
          
          return (
            <div key={unit.id} className="group relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                <div className={`absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </div>
              
              <div className="p-5 flex-1 relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0 flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${roleColor} shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded uppercase">
                          {unit.codeName}
                        </span>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                          unit.status === "AVAILABLE" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                          (unit.status === "EN_ROUTE" || unit.status === "ON_SCENE") ? "bg-amber-50 text-amber-600 border-amber-200" :
                          "bg-slate-50 text-slate-500 border-slate-200"
                        }`}>
                          {unit.status}
                        </span>
                      </div>
                      <h3 className="font-black text-slate-900 dark:text-white text-base truncate leading-tight">{unit.name}</h3>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Role Type</div>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{roleLabel}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Team Size</div>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {unit.teamSize} Personnel
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/50 pt-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    {unit.phone || "No contact info"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" />
                    GPS Active
                  </div>
                </div>

                {/* Status Toggle Actions */}
                <div className="grid grid-cols-3 gap-2 mt-auto">
                  <button
                    onClick={() => updateResponderStatus(unit.id, "AVAILABLE")}
                    disabled={unit.status === "AVAILABLE"}
                    className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                      unit.status === "AVAILABLE" 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 opacity-100 cursor-default' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700'
                    }`}
                  >
                    Available
                  </button>
                  <button
                    onClick={() => updateResponderStatus(unit.id, "BUSY")}
                    disabled={unit.status === "BUSY"}
                    className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                      unit.status === "BUSY" 
                        ? 'bg-blue-50 border-blue-200 text-blue-700 opacity-100 cursor-default' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700'
                    }`}
                  >
                    Busy
                  </button>
                  <button
                    onClick={() => updateResponderStatus(unit.id, "OFFLINE")}
                    disabled={unit.status === "OFFLINE"}
                    className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                      unit.status === "OFFLINE" 
                        ? 'bg-slate-100 border-slate-300 text-slate-600 opacity-100 cursor-default dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-700'
                    }`}
                  >
                    Offline
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredResponders.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Users2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
            <p className="font-bold text-sm">No field units found.</p>
            <p className="text-xs font-medium mt-1">Check your search filter or add a new unit.</p>
          </div>
        )}
      </div>

    </motion.div>
  );
};
