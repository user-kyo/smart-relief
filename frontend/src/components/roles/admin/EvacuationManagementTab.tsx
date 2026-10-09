import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building, Users, AlertTriangle, CheckCircle2, MapPin, 
  BatteryCharging, HeartPulse, Droplet, Wifi, 
  Minus, Plus, TrendingUp, Search
} from "lucide-react";
import { useSmartRelief } from "../../../context/SmartReliefContext";
import { KPICard } from "../../common/KPICard";
import { EvacuationCenter } from "../../../types";
import { Modal } from "../../common/Modal";

export const EvacuationManagementTab = () => {
  const { evacuationCenters, updateEvacuationOccupancy, updateEvacuationStatus, addEvacuationCenter } = useSmartRelief();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [newShelter, setNewShelter] = useState<Partial<EvacuationCenter>>({
    name: "", address: "", barangay: "", capacity: 100, currentOccupants: 0,
    facilities: { powerGenerator: false, medicalStation: false, sanitation: false, wifiComm: false, communityKitchen: false, waterPurifier: false },
    status: "STANDBY", contactPerson: "", contactPhone: ""
  });

  const handleAddShelter = (e: React.FormEvent) => {
    e.preventDefault();
    addEvacuationCenter(newShelter);
    setIsAddModalOpen(false);
    setIsSuccessModalOpen(true);
    setNewShelter({
      name: "", address: "", barangay: "", capacity: 100, currentOccupants: 0,
      facilities: { powerGenerator: false, medicalStation: false, sanitation: false, wifiComm: false, communityKitchen: false, waterPurifier: false },
      status: "STANDBY", contactPerson: "", contactPhone: ""
    });
  };

  const filteredCenters = useMemo(() => {
    if (!searchTerm) return evacuationCenters;
    return evacuationCenters.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.barangay.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [evacuationCenters, searchTerm]);

  const totalCapacity = evacuationCenters.reduce((sum, ec) => sum + ec.capacity, 0);
  const totalOccupants = evacuationCenters.reduce((sum, ec) => sum + ec.currentOccupants, 0);
  const averageOccupancy = totalCapacity === 0 ? 0 : Math.round((totalOccupants / totalCapacity) * 100);
  const criticalCenters = evacuationCenters.filter(ec => (ec.currentOccupants / ec.capacity) >= 0.9).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      className="space-y-6"
    >
      <div className="group relative z-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-transparent dark:from-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-indigo-500" />
            Evacuation Center Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Capacity tracking, facility equipment checklist & real-time occupancy monitoring</p>
        </div>

        <div className="relative z-10 flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search centers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs font-medium dark:text-white transition-all hover:bg-white dark:hover:bg-slate-800"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 flex justify-center items-center gap-1.5 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-[#111827] hover:bg-[#1f2937] hover:shadow-md transition-colors active:scale-[0.98] shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Shelter</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Evacuees" 
          value={totalOccupants.toLocaleString()} 
          icon={Users} 
          trend={{ value: `${totalCapacity - totalOccupants} capacity remaining`, isUp: true }}
          variant="indigo"
        />
        <KPICard 
          title="Average Occupancy" 
          value={`${averageOccupancy}%`} 
          icon={TrendingUp} 
          trend={{ value: "Across all centers", isUp: averageOccupancy < 80 }}
          variant={averageOccupancy >= 90 ? "rose" : averageOccupancy >= 75 ? "amber" : "emerald"}
        />
        <KPICard 
          title="Critical Centers" 
          value={criticalCenters.toString()} 
          subtext="Over 90% capacity"
          icon={AlertTriangle} 
          trend={{ value: "Requires action", isUp: false }}
          variant={criticalCenters > 0 ? "rose" : "slate"}
        />
        <KPICard 
          title="Active Shelters" 
          value={evacuationCenters.filter(c => c.status === "OPEN").length.toString()} 
          icon={CheckCircle2} 
          trend={{ value: `${evacuationCenters.length} Total Facilities`, isUp: true }}
          variant="emerald"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredCenters.map(ec => {
          const occupancyPct = Math.round((ec.currentOccupants / ec.capacity) * 100);
          const isCritical = occupancyPct >= 90;
          const isWarning = occupancyPct >= 75 && !isCritical;
          const isGood = !isCritical && !isWarning;

          return (
            <div key={ec.id} className="group relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                <div className={`absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </div>
              
              <div className="p-5 flex-1 relative z-10 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md inline-block uppercase
                        ${ec.status === "OPEN" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}
                      `}>
                        {ec.status}
                      </span>
                      {isCritical && (
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-md animate-pulse">
                          CRITICAL CAPACITY
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-white text-lg truncate">{ec.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {ec.address} • {ec.barangay}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => updateEvacuationStatus(ec.id, ec.status === "OPEN" ? "CLOSED" : "OPEN")}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      ec.status === "OPEN" 
                        ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30 dark:hover:bg-rose-500/20'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 dark:hover:bg-emerald-500/20'
                    }`}
                  >
                    {ec.status === "OPEN" ? "Close Facility" : "Open Facility"}
                  </button>
                </div>

                {/* Occupancy Meter */}
                <div className="bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wide">Occupancy</span>
                    <span className="font-black text-slate-900 dark:text-white">{ec.currentOccupants.toLocaleString()} <span className="text-slate-500 font-medium">/ {ec.capacity.toLocaleString()}</span></span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700/50 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 relative ${
                        isCritical ? "bg-gradient-to-r from-rose-500 to-rose-600" : 
                        isWarning ? "bg-gradient-to-r from-amber-400 to-amber-500" : 
                        "bg-gradient-to-r from-emerald-400 to-emerald-500"
                      }`}
                      style={{ width: `${Math.min(occupancyPct, 100)}%` }}
                    >
                      {isCritical && (
                        <div className="absolute inset-0 bg-white/20 animate-[stripes_1s_linear_infinite] bg-[length:20px_20px]" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)'}} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Facilities Checklist */}
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-2.5 tracking-wider">Operational Facilities</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <FacilityTag active={ec.facilities?.powerGenerator} icon={BatteryCharging} label="Power" />
                    <FacilityTag active={ec.facilities?.medicalStation} icon={HeartPulse} label="Medical" />
                    <FacilityTag active={ec.facilities?.waterPurifier} icon={Droplet} label="Water" />
                    <FacilityTag active={ec.facilities?.wifiComm} icon={Wifi} label="Wi-Fi" />
                  </div>
                </div>
              </div>

              {/* Quick Update Bar */}
              <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between gap-3 relative z-20">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Modify Headcount
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateEvacuationOccupancy(ec.id, Math.max(0, ec.currentOccupants - 50))}
                    disabled={ec.currentOccupants === 0}
                    className="p-2 w-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold disabled:opacity-50 transition-all flex justify-center shadow-sm"
                    title="-50 Occupants"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateEvacuationOccupancy(ec.id, ec.currentOccupants + 50)}
                    disabled={ec.status !== "OPEN" || isCritical}
                    className="p-2 w-14 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-lg font-bold disabled:opacity-50 transition-all flex justify-center shadow-sm"
                    title="+50 Occupants"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCenters.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Building className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
            <p className="font-bold text-sm">No evacuation centers found.</p>
            <p className="text-xs font-medium mt-1">Check your search filter.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Evacuation Shelter">
        <form onSubmit={handleAddShelter} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Shelter Name</label>
              <input type="text" required value={newShelter.name} onChange={e => setNewShelter({...newShelter, name: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" placeholder="e.g. San Jose Elementary School" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Barangay</label>
                <input type="text" required value={newShelter.barangay} onChange={e => setNewShelter({...newShelter, barangay: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" placeholder="e.g. San Jose" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Capacity</label>
                <input type="number" min="1" required value={newShelter.capacity} onChange={e => setNewShelter({...newShelter, capacity: parseInt(e.target.value) || 0})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Address</label>
              <input type="text" required value={newShelter.address} onChange={e => setNewShelter({...newShelter, address: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" placeholder="Complete address details" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Available Facilities</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'powerGenerator', label: 'Power Generator' },
                  { id: 'medicalStation', label: 'Medical Station' },
                  { id: 'sanitation', label: 'Sanitation/Toilets' },
                  { id: 'wifiComm', label: 'Wi-Fi/Comms' },
                  { id: 'communityKitchen', label: 'Community Kitchen' },
                  { id: 'waterPurifier', label: 'Water Purifier' }
                ].map((facility) => (
                  <label key={facility.id} className="flex items-center gap-2 p-2 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={newShelter.facilities?.[facility.id as keyof typeof newShelter.facilities] || false}
                      onChange={e => setNewShelter({
                        ...newShelter, 
                        facilities: { ...newShelter.facilities!, [facility.id]: e.target.checked }
                      })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-xs font-medium dark:text-slate-300">{facility.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
                <input type="text" required value={newShelter.contactPerson} onChange={e => setNewShelter({...newShelter, contactPerson: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" placeholder="Name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                <input type="text" required value={newShelter.contactPhone} onChange={e => setNewShelter({...newShelter, contactPhone: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" placeholder="Phone number" />
              </div>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 mt-6 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 flex justify-center items-center gap-1.5 border border-[#E2E8F0] dark:border-slate-700 rounded-xl shadow-sm text-sm font-bold text-[#64748B] dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-[#F8FAFC] dark:hover:bg-slate-700 hover:text-[#0F172A] dark:hover:text-white transition-colors active:scale-[0.98]">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 flex justify-center items-center gap-2 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#111827] hover:bg-[#1f2937] hover:shadow-md transition-colors active:scale-[0.98]">
              Add Shelter
            </button>
          </div>
        </form>
      </Modal>


      {/* SUCCESS MODAL */}
      <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} title="" maxWidth="sm">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Shelter Added Successfully</h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 px-4">
            The new evacuation center has been added to the system and is now available for deployment.
          </p>
          <button
            onClick={() => setIsSuccessModalOpen(false)}
            className="w-full px-5 py-2.5 flex justify-center items-center gap-2 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#111827] hover:bg-[#1f2937] hover:shadow-md transition-colors active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </Modal>
    </motion.div>
  );
};

const FacilityTag = ({ active, icon: Icon, label }: { active: boolean | undefined, icon: any, label: string }) => {
  return (
    <div className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all
      ${active 
        ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 shadow-sm" 
        : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-400 dark:text-slate-500"
      }
    `}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );
};
