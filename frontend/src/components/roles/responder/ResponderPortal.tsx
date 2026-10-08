import React, { useState } from "react";
import {
  CheckSquare,
  Radio,
  Compass,
  PackagePlus,
  Calendar,
  Navigation,
  Check,
  Clock,
  AlertTriangle,
  Upload,
  Send,
  LifeBuoy,
  ShieldAlert,
  MapPin,
  CheckCircle2
} from "lucide-react";
import { useSmartRelief } from "../../../context/SmartReliefContext";
import { KPICard } from "../../common/KPICard";
import { StatusBadge } from "../../common/StatusBadge";
import { Modal } from "../../common/Modal";
import { InteractiveGISMap } from "../../map/InteractiveGISMap";

interface ResponderPortalProps {
  activeTab: string;
}

export const ResponderPortal: React.FC<ResponderPortalProps> = ({ activeTab }) => {
  const {
    currentUser,
    incidents,
    updateIncidentStatus,
    addLog,
    createIncident
  } = useSmartRelief();

  const [dutyStatus, setDutyStatus] = useState<"AVAILABLE" | "ON_CALL" | "RESPONDING" | "OFF_DUTY">("RESPONDING");

  // Field Report Form State
  const [fieldReport, setFieldReport] = useState({
    incidentId: "INC-2025-001",
    statusUpdate: "ARRIVED_SCENE",
    victimsRescued: 4,
    medicalAttentionNeeded: true,
    notes: "Arrived at Barangay San Jose Sector 4 rooftop. Flood level is 1.8 meters. Rescued 4 residents including 1 elderly.",
    suppliesNeeded: "Requires 2 additional life vests and emergency blanket."
  });

  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  // Supply Requisition Form
  const [reqSupply, setReqSupply] = useState({
    item: "Inflatable Raft / Motorboat fuel",
    qty: 2,
    priority: "URGENT",
    destination: "Sector 4 Command Post"
  });

  const [isReqSubmitted, setIsReqSubmitted] = useState(false);

  // Tasks Roster
  const [tasks, setTasks] = useState([
    { id: "t1", title: "Conduct Search & Rescue in Sector 4 Rooftops", done: true, priority: "CRITICAL" },
    { id: "t2", title: "Assist Elderly Evacuation to Central Gym Shelter", done: false, priority: "HIGH" },
    { id: "t3", title: "Deliver 50 Water Packs to Barangay 659 Evacuation Post", done: false, priority: "MEDIUM" },
    { id: "t4", title: "Inspect Pasig River Stream Sensor Status", done: false, priority: "LOW" }
  ]);

  const assignedIncidents = incidents.filter(i => i.status === "ASSIGNED" || i.status === "RESPONDING" || i.assignedResponderIds.includes(currentUser.id));

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleFieldReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLog(`Field Report submitted for ${fieldReport.incidentId} by ${currentUser.name}`, "INFO");
    setIsSubmitSuccess(true);
    setTimeout(() => setIsSubmitSuccess(false), 4000);
  };

  const handleSupplyReqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLog(`Supply requisition requested by ${currentUser.name}: ${reqSupply.qty}x ${reqSupply.item}`, "INFO");
    setIsReqSubmitted(true);
    setTimeout(() => setIsReqSubmitted(false), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. FIELD DASHBOARD TAB */}
      {(activeTab === "field-dashboard" || activeTab === "assignments") && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Duty Status Bar */}
          <div className="p-5 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl flex flex-col gap-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center font-bold shadow-sm shadow-amber-500/20 shrink-0">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Field Responder</div>
                <h3 className="font-black text-slate-900 text-lg leading-tight">{currentUser.name}</h3>
              </div>
            </div>

            {/* Duty Status Switcher */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-slate-100/80 border border-slate-200/50 rounded-xl">
              {(["AVAILABLE", "ON_CALL", "RESPONDING", "OFF_DUTY"] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setDutyStatus(st)}
                  className={`py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${
                    dutyStatus === st
                      ? st === "RESPONDING" ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : st === "AVAILABLE" ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Active Assignment Card */}
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-amber-50 to-transparent">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Active Tactical Incident
              </span>
              <StatusBadge type="status" value={dutyStatus} size="sm" />
            </div>

            <div className="p-5">
              {assignedIncidents.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm font-medium">
                  No active incident assignments. Standby for dispatch.
                </div>
              ) : (
                assignedIncidents.map(inc => (
                  <div key={inc.id} className="space-y-5">
                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2.5">
                          <StatusBadge type="severity" value={inc.severity} size="sm" />
                          <span className="text-[10px] font-mono font-bold text-slate-400">{inc.id}</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 leading-tight">{inc.title}</h3>
                        <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed">{inc.description}</p>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Target Location</div>
                          <div className="text-sm font-black text-slate-900">{inc.locationName}</div>
                          <div className="text-[10px] text-emerald-600 font-bold mt-1 tracking-widest flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            GPS: 14.1134, 121.3938
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Operational Status Action Buttons */}
                    <div className="pt-5 mt-2 border-t border-slate-100 space-y-3">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Update Operational Phase</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          onClick={() => updateIncidentStatus(inc.id, "ASSIGNED")}
                          className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-black transition-colors"
                        >
                          1. Acknowledge
                        </button>
                        <button
                          onClick={() => updateIncidentStatus(inc.id, "RESPONDING")}
                          className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[11px] font-black transition-colors shadow-sm shadow-amber-500/20"
                        >
                          2. En Route
                        </button>
                        <button
                          onClick={() => updateIncidentStatus(inc.id, "RESPONDING")}
                          className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-black transition-colors shadow-sm shadow-blue-600/20"
                        >
                          3. Arrived Scene
                        </button>
                        <button
                          onClick={() => updateIncidentStatus(inc.id, "RESOLVED")}
                          className="py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[11px] font-black transition-colors shadow-sm shadow-emerald-500/20"
                        >
                          4. Resolve
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Responder Tasks List */}
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl space-y-4 shadow-sm overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-500" />
                Duty Checklist
              </h3>
              <span className="text-[10px] font-black tracking-widest text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">
                {tasks.filter(t => t.done).length} / {tasks.length} DONE
              </span>
            </div>

            <div className="p-5 pt-1 space-y-2">
              {tasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-300 flex items-center justify-between ${
                    t.done ? "bg-slate-50 border-slate-200 line-through opacity-60 text-slate-500" : "bg-white border-slate-200 shadow-sm text-slate-800 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-center gap-3 pr-4">
                    <div className={`w-5 h-5 shrink-0 rounded-md border flex items-center justify-center transition-colors ${
                      t.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 bg-slate-50"
                    }`}>
                      {t.done && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-[13px] font-bold leading-tight">{t.title}</span>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge type="severity" value={t.priority as any} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. TACTICAL FIELD MAP TAB */}
      {activeTab === "tactical-map" && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-slate-900">Tactical Field Navigation Map</h2>
            <p className="text-xs text-slate-500 mt-0.5">Field-optimized GIS view with route lines and nearest evacuation center markers</p>
          </div>
          <InteractiveGISMap mini />
        </div>
      )}

      {/* 3. FIELD INCIDENT REPORTER TAB */}
      {activeTab === "field-report" && (
        <div className="space-y-6 animate-in fade-in max-w-2xl mx-auto">
          <div>
            <h2 className="text-xl font-black text-slate-900">Field Incident & Situation Reporter</h2>
            <p className="text-xs text-slate-500 mt-0.5">Submit immediate situation reports, casualty counts, and supply requests from scene</p>
          </div>

          <form onSubmit={handleFieldReportSubmit} className="p-6 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl space-y-5 shadow-sm">
            {isSubmitSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[13px] font-bold flex items-center gap-3 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                Field Situation Report logged to LGU Operational Command Center.
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Target Incident ID</label>
              <select
                value={fieldReport.incidentId}
                onChange={e => setFieldReport({ ...fieldReport, incidentId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                {incidents.map(i => (
                  <option key={i.id} value={i.id}>{i.id} - {i.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">On-Scene Status Phase</label>
              <select
                value={fieldReport.statusUpdate}
                onChange={e => setFieldReport({ ...fieldReport, statusUpdate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="ARRIVED_SCENE">Arrived on Scene</option>
                <option value="RESCUE_IN_PROGRESS">Search & Rescue in Progress</option>
                <option value="EVACUATING_VICTIMS">Evacuating Victims to Shelter</option>
                <option value="INCIDENT_CONTAINED">Scene Contained / Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Victims Rescued on Scene</label>
              <input
                type="number"
                value={fieldReport.victimsRescued}
                onChange={e => setFieldReport({ ...fieldReport, victimsRescued: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Field Observation Notes</label>
              <textarea
                rows={3}
                value={fieldReport.notes}
                onChange={e => setFieldReport({ ...fieldReport, notes: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                <Send className="w-5 h-5" />
                Submit Field Situation Report
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. SUPPLY REQUISITION TAB */}
      {activeTab === "resource-requisition" && (
        <div className="space-y-6 animate-in fade-in max-w-2xl mx-auto">
          <div>
            <h2 className="text-xl font-black text-slate-900">Supply & Gear Requisition</h2>
            <p className="text-xs text-slate-500 mt-0.5">Request additional rescue equipment or medical supplies from central depot</p>
          </div>

          <form onSubmit={handleSupplyReqSubmit} className="p-6 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl space-y-5 shadow-sm">
            {isReqSubmitted && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[13px] font-bold flex items-center gap-3 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                Requisition order dispatched to Central Warehouse Depot.
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Requested Item / Supply</label>
              <input
                type="text"
                value={reqSupply.item}
                onChange={e => setReqSupply({ ...reqSupply, item: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Quantity Units</label>
              <input
                type="number"
                value={reqSupply.qty}
                onChange={e => setReqSupply({ ...reqSupply, qty: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all active:scale-[0.98]"
              >
                <PackagePlus className="w-5 h-5" />
                Dispatch Supply Requisition
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. RESPONDER TASKS TAB */}
      {activeTab === "responder-schedule" && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-slate-900">Responder Duty Schedule & Shift Roster</h2>
            <p className="text-xs text-slate-500 mt-0.5">Check shift assignment times and duty locations</p>
          </div>

          <div className="p-6 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl space-y-4 shadow-sm">
            <h3 className="font-black text-slate-900 text-sm">Active Duty Shift Roster</h3>
            
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-0.5">Assigned Shift</div>
                <div className="text-sm text-blue-700 font-black">06:00 AM - 06:00 PM (12-Hr Emergency Shift)</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-0.5">Command Post Location</div>
                <div className="text-sm text-slate-900 font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Barangay San Jose Sector 4 Forward Base
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
