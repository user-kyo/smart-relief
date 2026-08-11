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
          <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center font-bold">
                🚑
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Field Responder Profile</div>
                <h3 className="font-extrabold text-slate-900 text-sm">{currentUser.name} ({currentUser.role})</h3>
              </div>
            </div>

            {/* Duty Status Switcher */}
            <div className="flex items-center gap-2 bg-slate-50 p-1 border border-slate-200 rounded-xl">
              {(["AVAILABLE", "ON_CALL", "RESPONDING", "OFF_DUTY"] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setDutyStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    dutyStatus === st
                      ? st === "RESPONDING" ? "bg-rose-600 text-white shadow-xs" : st === "AVAILABLE" ? "bg-emerald-600 text-white shadow-xs" : "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Active Assignment Card */}
          <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 animate-bounce text-amber-600" />
                Active Tactical Incident Assignment
              </span>
              <StatusBadge type="status" value={dutyStatus} size="sm" />
            </div>

            {assignedIncidents.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No active incident assignments. Standby for dispatch.
              </div>
            ) : (
              assignedIncidents.map(inc => (
                <div key={inc.id} className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge type="severity" value={inc.severity} size="sm" />
                        <span className="text-xs font-mono font-bold text-blue-600">{inc.id}</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900">{inc.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 font-medium">{inc.description}</p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-right">
                      <div className="text-[10px] text-slate-500 font-medium">Target Location</div>
                      <div className="text-xs font-bold text-slate-900">{inc.locationName}</div>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-1">GPS: 14.5995, 120.9842</div>
                    </div>
                  </div>

                  {/* Operational Status Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 font-medium">Update Operational Phase:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => updateIncidentStatus(inc.id, "ASSIGNED")}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                      >
                        1. Acknowledge
                      </button>
                      <button
                        onClick={() => updateIncidentStatus(inc.id, "RESPONDING")}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                      >
                        2. En Route
                      </button>
                      <button
                        onClick={() => updateIncidentStatus(inc.id, "RESPONDING")}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                      >
                        3. Arrived Scene
                      </button>
                      <button
                        onClick={() => updateIncidentStatus(inc.id, "RESOLVED")}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                      >
                        4. Resolve Incident
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Responder Tasks List */}
          <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                Duty Checklist & Task Execution
              </h3>
              <span className="text-xs font-bold text-emerald-700">
                {tasks.filter(t => t.done).length} / {tasks.length} Completed
              </span>
            </div>

            <div className="space-y-2">
              {tasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    t.done ? "bg-slate-50/80 border-slate-200 line-through opacity-60 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      t.done ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
                    }`}>
                      {t.done && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-semibold">{t.title}</span>
                  </div>
                  <StatusBadge type="severity" value={t.priority as any} size="sm" />
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
          <InteractiveGISMap />
        </div>
      )}

      {/* 3. FIELD INCIDENT REPORTER TAB */}
      {activeTab === "field-report" && (
        <div className="space-y-6 animate-in fade-in max-w-2xl mx-auto">
          <div>
            <h2 className="text-xl font-black text-slate-900">Field Incident & Situation Reporter</h2>
            <p className="text-xs text-slate-500 mt-0.5">Submit immediate situation reports, casualty counts, and supply requests from scene</p>
          </div>

          <form onSubmit={handleFieldReportSubmit} className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
            {isSubmitSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Field Situation Report logged to LGU Operational Command Center.
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Incident ID</label>
              <select
                value={fieldReport.incidentId}
                onChange={e => setFieldReport({ ...fieldReport, incidentId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:bg-white focus:outline-none"
              >
                {incidents.map(i => (
                  <option key={i.id} value={i.id}>{i.id} - {i.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">On-Scene Status Phase</label>
              <select
                value={fieldReport.statusUpdate}
                onChange={e => setFieldReport({ ...fieldReport, statusUpdate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:bg-white focus:outline-none"
              >
                <option value="ARRIVED_SCENE">Arrived on Scene</option>
                <option value="RESCUE_IN_PROGRESS">Search & Rescue in Progress</option>
                <option value="EVACUATING_VICTIMS">Evacuating Victims to Shelter</option>
                <option value="INCIDENT_CONTAINED">Scene Contained / Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Victims Rescued on Scene</label>
              <input
                type="number"
                value={fieldReport.victimsRescued}
                onChange={e => setFieldReport({ ...fieldReport, victimsRescued: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Field Observation Notes</label>
              <textarea
                rows={3}
                value={fieldReport.notes}
                onChange={e => setFieldReport({ ...fieldReport, notes: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl p-3 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send className="w-4 h-4" />
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

          <form onSubmit={handleSupplyReqSubmit} className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
            {isReqSubmitted && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Requisition order dispatched to Central Warehouse Depot.
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Requested Item / Supply</label>
              <input
                type="text"
                value={reqSupply.item}
                onChange={e => setReqSupply({ ...reqSupply, item: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantity Units</label>
              <input
                type="number"
                value={reqSupply.qty}
                onChange={e => setReqSupply({ ...reqSupply, qty: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
            >
              <PackagePlus className="w-4 h-4" />
              Dispatch Supply Requisition
            </button>
          </form>
        </div>
      )}

      {/* 5. VOLUNTEER TASKS TAB */}
      {activeTab === "volunteer-tasks" && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-slate-900">Volunteer Duty Schedule & Shift Roster</h2>
            <p className="text-xs text-slate-500 mt-0.5">Check shift assignment times and duty locations</p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm">Active Duty Shift Roster</h3>
            <div className="text-xs text-slate-600">
              Shift: <span className="text-blue-600 font-bold">06:00 AM - 06:00 PM (12-Hr Emergency Shift)</span>
            </div>
            <div className="text-xs text-slate-600">
              Command Post: <span className="text-slate-900 font-bold">Barangay San Jose Sector 4 Forward Base</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
