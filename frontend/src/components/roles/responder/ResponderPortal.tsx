import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LifeBuoy,
  AlertTriangle,
  MapPin,
  Navigation,
  CheckCircle2,
  CheckSquare,
  Radio,
  PackagePlus,
  Calendar,
  Send,
  Clock,
  Shield,
  ShieldAlert,
  Phone,
  Users,
  Compass,
  Battery,
  Wifi,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  RefreshCw,
  Camera,
  Layers,
  Thermometer,
  Wind,
  Droplets,
  AlertOctagon,
  FileText,
  Boxes,
  Home,
  Check,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { useSmartRelief } from "../../../context/SmartReliefContext";
import { KPICard } from "../../common/KPICard";
import { StatusBadge } from "../../common/StatusBadge";
import { Modal } from "../../common/Modal";
import { InteractiveGISMap } from "../../map/InteractiveGISMap";
import { Incident, AssistanceRequest, ResourceItem } from "../../../types";

interface ResponderPortalProps {
  activeTab: string;
  onSelectTab?: (tabId: string) => void;
}

interface SitRepHistoryItem {
  id: string;
  incidentTitle: string;
  phase: string;
  victimsRescued: number;
  notes: string;
  timestamp: string;
  photoPreview?: string;
}

interface SupplyRequisitionItem {
  id: string;
  item: string;
  qty: number;
  priority: "CRITICAL" | "URGENT" | "STANDARD";
  destination: string;
  status: "DISPATCHED" | "APPROVED" | "PENDING";
  requestedAt: string;
}

export const ResponderPortal: React.FC<ResponderPortalProps> = ({ activeTab }) => {
  const {
    currentUser,
    incidents,
    assistanceRequests,
    resources,
    evacuationCenters,
    responders,
    updateIncidentStatus,
    updateRequestStatus,
    addLog,
    createIncident
  } = useSmartRelief();

  // Find linked responder profile or fallback
  const myProfile = useMemo(() => {
    return responders.find(r => 
      r.name.toLowerCase().includes(currentUser.name.toLowerCase()) || 
      r.id === currentUser.id
    ) || responders[0] || {
      id: "resp-001",
      name: currentUser.name || "Marcus Villareal",
      codeName: "ALPHA-1",
      roleType: "DISASTER_RESPONSE_TEAM",
      status: "AVAILABLE",
      lguName: "Rizal DRRM",
      locationName: "Sector 4 Riverview Post",
      lat: 14.1132,
      lng: 121.3935,
      phone: currentUser.phone || "+63 919 345 6789",
      teamSize: 6,
      skills: ["Water Rescue", "First Aid", "Swift Water Rescue"],
      equipment: ["Rubber Boat", "Life Vests (15)", "Medical Trauma Kit"],
      lastPing: "Just now"
    };
  }, [responders, currentUser]);

  // Operational Duty Status
  const [dutyStatus, setDutyStatus] = useState<"AVAILABLE" | "EN_ROUTE" | "ON_SCENE" | "BUSY" | "OFF_DUTY">(
    (myProfile.status as any) || "AVAILABLE"
  );

  // Live GPS telemetry
  const [gpsLocation, setGpsLocation] = useState({
    lat: myProfile.lat || 14.1132,
    lng: myProfile.lng || 121.3935,
    lastUpdated: "Just now",
    accuracy: 3.8
  });
  const [isUpdatingGps, setIsUpdatingGps] = useState(false);

  // SOS Emergency Beacon Modal
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  // Tasks List
  const [tasks, setTasks] = useState([
    { id: "t1", title: "Verify river flood depth gauge at Sector 4 crossing", done: true, priority: "CRITICAL", category: "RECON" },
    { id: "t2", title: "Extract trapped elderly resident (Carlos Dalisay household)", done: false, priority: "CRITICAL", category: "RESCUE" },
    { id: "t3", title: "Deliver cold-chain insulin to Pauli 2 Medical Outpost", done: false, priority: "HIGH", category: "MEDICAL" },
    { id: "t4", title: "Escort 15 evacuees to Pauli 2 Covered Gymnasium", done: false, priority: "HIGH", category: "EVACUATION" },
    { id: "t5", title: "Inspect hull seal on Inflatable Motorboat Unit 2", done: true, priority: "MEDIUM", category: "MAINTENANCE" },
    { id: "t6", title: "Radio comms hourly beacon check with Central DRRM", done: false, priority: "LOW", category: "COMMS" }
  ]);
  const [taskFilter, setTaskFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"CRITICAL" | "HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Field Situation Report Form
  const [fieldReport, setFieldReport] = useState({
    incidentId: incidents[0]?.id || "",
    statusUpdate: "RESCUE_IN_PROGRESS",
    victimsRescued: 4,
    triageLevel: "HIGH",
    waterDepth: "1.8 meters (Chest-high)",
    hazardNotes: "Submerged barbed fencing and strong downstream undertow. Motorboat navigation required.",
    suppliesNeeded: "2 adult life vests and 1 pediatric thermal blanket."
  });
  const [reportPhoto, setReportPhoto] = useState<string | null>(null);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [sitRepHistory, setSitRepHistory] = useState<SitRepHistoryItem[]>([
    {
      id: "sitrep-101",
      incidentTitle: "Severe Flooding along Riverview Sector",
      phase: "Search & Rescue in Progress",
      victimsRescued: 4,
      notes: "Arrived at Block 7 rooftops. Extricated family of 4 including 1 infant. En route to dry landing.",
      timestamp: "25 mins ago"
    }
  ]);

  // Supply Requisition Form
  const [reqSupply, setReqSupply] = useState({
    resourceId: resources[0]?.id || "",
    customItem: "",
    qty: 2,
    priority: "URGENT" as "CRITICAL" | "URGENT" | "STANDARD",
    destination: "Pauli 2 Riverview Command Staging Post"
  });
  const [isReqSubmitted, setIsReqSubmitted] = useState(false);
  const [requisitionHistory, setRequisitionHistory] = useState<SupplyRequisitionItem[]>([
    {
      id: "req-ord-01",
      item: "Heavy-Duty Inflatable Raft (8-Person)",
      qty: 1,
      priority: "CRITICAL",
      destination: "Riverview Sector 4 Staging Point",
      status: "DISPATCHED",
      requestedAt: "40 mins ago"
    },
    {
      id: "req-ord-02",
      item: "Certified Life Vests (Adult)",
      qty: 10,
      priority: "URGENT",
      destination: "Pauli 2 Command Depot",
      status: "APPROVED",
      requestedAt: "1 hour ago"
    }
  ]);

  // Equipment Inspection Checklist
  const [equipmentChecklist, setEquipmentChecklist] = useState([
    { id: "eq1", name: "Inflatable Rescue Motorboat (Outboard Engine & 20L Fuel)", checked: true, ready: "OPTIMAL" },
    { id: "eq2", name: "Emergency Trauma Bag & Portable Defibrillator (AED)", checked: true, ready: "OPTIMAL" },
    { id: "eq3", name: "Water Rescue PFDs & Throw Bags (20 Sets)", checked: true, ready: "OPTIMAL" },
    { id: "eq4", name: "VHF Tactical Handheld Radios (Ch. 14 Disaster Link)", checked: true, ready: "OPTIMAL" },
    { id: "eq5", name: "High-Lumen Tactical Searchlights & Backup Batteries", checked: false, ready: "CHARGING" },
    { id: "eq6", name: "Swift-Water Extraction Harness & Carabiners", checked: true, ready: "OPTIMAL" }
  ]);

  // Active missions
  const activeMissions = useMemo(() => {
    return incidents.filter(i => 
      i.status !== "RESOLVED" && i.status !== "CLOSED"
    );
  }, [incidents]);

  const activeCitizenRequests = useMemo(() => {
    return assistanceRequests.filter(r => 
      r.status !== "RESOLVED" && r.status !== "REJECTED"
    );
  }, [assistanceRequests]);

  // Handlers
  const handleUpdateDutyStatus = (newStatus: "AVAILABLE" | "EN_ROUTE" | "ON_SCENE" | "BUSY" | "OFF_DUTY") => {
    setDutyStatus(newStatus);
    addLog("RESPONDER_STATUS_UPDATE", `${currentUser.name} (${myProfile.codeName}) switched status to ${newStatus}.`, "INFO");
  };

  const handleRefreshGps = () => {
    setIsUpdatingGps(true);
    setTimeout(() => {
      // Simulate minor accurate telemetry variance
      const varianceLat = (Math.random() - 0.5) * 0.0004;
      const varianceLng = (Math.random() - 0.5) * 0.0004;
      setGpsLocation({
        lat: Number((14.1132 + varianceLat).toFixed(4)),
        lng: Number((121.3935 + varianceLng).toFixed(4)),
        lastUpdated: "Just now",
        accuracy: Number((2.8 + Math.random() * 1.5).toFixed(1))
      });
      setIsUpdatingGps(false);
      addLog("GPS_TELEMETRY_PING", `Updated tactical coordinates for unit ${myProfile.codeName}`, "INFO");
    }, 600);
  };

  const handleTriggerSos = () => {
    setSosSent(true);
    setDutyStatus("BUSY");
    addLog(
      "SOS_MAYDAY_BEACON", 
      `TACTICAL MAYDAY: Unit ${myProfile.codeName} (${currentUser.name}) activated Emergency SOS Beacon at [${gpsLocation.lat}, ${gpsLocation.lng}]`, 
      "CRITICAL"
    );
    setTimeout(() => {
      setSosSent(false);
      setIsSosModalOpen(false);
    }, 2500);
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      done: false,
      priority: newTaskPriority,
      category: "FIELD"
    };
    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle("");
    setIsAddingTask(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleFieldReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inc = incidents.find(i => i.id === fieldReport.incidentId) || incidents[0];
    
    // Add real timeline entry
    if (inc) {
      updateIncidentStatus(inc.id, fieldReport.statusUpdate === "INCIDENT_CONTAINED" ? "RESOLVED" : "RESPONDING", fieldReport.hazardNotes);
    }

    const newSitRep: SitRepHistoryItem = {
      id: `sitrep-${Date.now()}`,
      incidentTitle: inc?.title || "Operational Sector Mission",
      phase: fieldReport.statusUpdate.replace(/_/g, " "),
      victimsRescued: fieldReport.victimsRescued,
      notes: fieldReport.hazardNotes,
      timestamp: "Just now",
      photoPreview: reportPhoto || undefined
    };

    setSitRepHistory(prev => [newSitRep, ...prev]);
    setIsSubmitSuccess(true);
    addLog(
      "FIELD_SITREP_LOGGED", 
      `Unit ${myProfile.codeName} logged SitRep for incident ${inc?.id}: ${fieldReport.victimsRescued} rescued.`, 
      "INFO"
    );
    setTimeout(() => setIsSubmitSuccess(false), 4000);
  };

  const handleSupplyReqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenResource = resources.find(r => r.id === reqSupply.resourceId);
    const itemName = reqSupply.customItem || chosenResource?.name || "Emergency Rescue Assets";

    const newReq: SupplyRequisitionItem = {
      id: `req-${Date.now().toString().slice(-4)}`,
      item: itemName,
      qty: reqSupply.qty,
      priority: reqSupply.priority,
      destination: reqSupply.destination,
      status: "DISPATCHED",
      requestedAt: "Just now"
    };

    setRequisitionHistory(prev => [newReq, ...prev]);
    setIsReqSubmitted(true);
    addLog(
      "RESOURCE_REQUISITION_DISPATCHED", 
      `Unit ${myProfile.codeName} requested ${reqSupply.qty}x ${itemName} to ${reqSupply.destination}`, 
      "WARNING"
    );
    setTimeout(() => setIsReqSubmitted(false), 4000);
  };

  const toggleEquipmentItem = (id: string) => {
    setEquipmentChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (taskFilter === "ACTIVE") return tasks.filter(t => !t.done);
    if (taskFilter === "COMPLETED") return tasks.filter(t => t.done);
    return tasks;
  }, [tasks, taskFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* TACTICAL HEADER & TELEMETRY HUD */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white p-5 lg:p-6 shadow-xl">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Identity & Callsign */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/25 border border-blue-400/30">
                <LifeBuoy className="w-8 h-8 text-white" />
              </div>
              <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                dutyStatus === "AVAILABLE" ? "bg-emerald-500 animate-pulse" :
                dutyStatus === "EN_ROUTE" ? "bg-amber-500 animate-pulse" :
                dutyStatus === "ON_SCENE" ? "bg-blue-500" :
                dutyStatus === "BUSY" ? "bg-purple-500" : "bg-slate-500"
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-500/20 border border-blue-400/30 text-blue-300">
                  {myProfile.codeName}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  {myProfile.roleType.replace(/_/g, " ")}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                {currentUser.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  {myProfile.locationName}
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 font-medium text-emerald-400">
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  Team Size: {myProfile.teamSize} Personnel
                </span>
              </div>
            </div>
          </div>

          {/* Telemetry Chips & SOS Action */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            
            {/* GPS Telemetry Widget */}
            <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-inner">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                  GPS Fixed ({gpsLocation.accuracy}m)
                  <button 
                    onClick={handleRefreshGps}
                    disabled={isUpdatingGps}
                    className="hover:text-blue-300 transition-colors"
                    title="Ping GPS"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${isUpdatingGps ? "animate-spin text-blue-400" : ""}`} />
                  </button>
                </div>
                <div className="text-xs font-mono font-bold text-slate-200">
                  {gpsLocation.lat.toFixed(4)}° N, {gpsLocation.lng.toFixed(4)}° E
                </div>
              </div>
            </div>

            {/* Radio Comms Status */}
            <div className="hidden md:flex bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-2xl px-4 py-2.5 items-center gap-3 shadow-inner">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                  Comms Channel 14
                </div>
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Encrypted 99%
                </div>
              </div>
            </div>

            {/* Tactical Distress SOS Button */}
            <button
              onClick={() => setIsSosModalOpen(true)}
              className="px-4 py-3 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <AlertOctagon className="w-4 h-4 animate-bounce" />
              Mayday SOS
            </button>
          </div>
        </div>

        {/* Duty Status Switcher Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            Set Operational Readiness:
          </span>

          <div className="flex flex-wrap sm:grid sm:grid-cols-5 gap-1 sm:gap-1.5 p-1 bg-slate-950/70 border border-slate-800 rounded-xl">
            {(
              [
                { id: "AVAILABLE", label: "Available", color: "bg-emerald-500 text-white shadow-emerald-500/20" },
                { id: "EN_ROUTE", label: "En Route", color: "bg-amber-500 text-white shadow-amber-500/20" },
                { id: "ON_SCENE", label: "On Scene", color: "bg-blue-600 text-white shadow-blue-500/20" },
                { id: "BUSY", label: "Busy / Triage", color: "bg-purple-600 text-white shadow-purple-500/20" },
                { id: "OFF_DUTY", label: "Off Duty", color: "bg-slate-700 text-slate-200" }
              ] as const
            ).map(st => (
              <button
                key={st.id}
                onClick={() => handleUpdateDutyStatus(st.id)}
                className={`py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg text-[9.5px] sm:text-[10px] font-black tracking-wider uppercase transition-all duration-200 cursor-pointer flex-1 sm:flex-initial text-center ${
                  dutyStatus === st.id
                    ? `${st.color} shadow-md`
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TAB 1 & 3: FIELD DASHBOARD & ACTIVE MISSIONS */}
      {(activeTab === "field-dashboard" || activeTab === "assignments") && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* KPI Metrics Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Active Missions"
              value={activeMissions.length}
              icon={AlertOctagon}
              variant="rose"
              subtext="Priority dispatch calls"
            />
            <KPICard
              title="Citizen Help Queue"
              value={activeCitizenRequests.length}
              icon={LifeBuoy}
              variant="amber"
              subtext="Awaiting extraction/aid"
            />
            <KPICard
              title="Tasks Pending"
              value={tasks.filter(t => !t.done).length}
              icon={CheckSquare}
              variant="blue"
              subtext={`${tasks.filter(t => t.done).length} completed today`}
            />
            <KPICard
              title="Assigned Gear Units"
              value={myProfile.equipment.length}
              icon={Boxes}
              variant="emerald"
              subtext="Inspected & ready"
            />
          </div>

          {/* PRIMARY TACTICAL MISSION CARD */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                Assigned Operational Missions ({activeMissions.length})
              </h2>
              <span className="text-xs font-bold text-slate-500">Live LGU Command Stream</span>
            </div>

            {activeMissions.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-black text-slate-800 dark:text-slate-200">All Assigned Incidents Resolved</h3>
                <p className="text-xs text-slate-500 mt-1">Standby on Channel 14 for next emergency dispatch broadcast.</p>
              </div>
            ) : (
              activeMissions.map((inc, idx) => (
                <div
                  key={inc.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 lg:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  {/* Priority border highlight */}
                  <div className={`absolute top-0 left-0 w-2 h-full ${
                    inc.severity === "CRITICAL" ? "bg-rose-500" :
                    inc.severity === "HIGH" ? "bg-amber-500" : "bg-blue-500"
                  }`} />

                  <div className="pl-3 space-y-5">
                    
                    {/* Mission Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <StatusBadge type="severity" value={inc.severity} size="sm" />
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {inc.type}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 font-bold">{inc.id}</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                          {inc.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <StatusBadge type="status" value={inc.status} size="sm" />
                      </div>
                    </div>

                    {/* Mission Details & Location */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {inc.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">Location</span>
                        <span className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          {inc.locationName}
                        </span>
                        <span className="text-[10px] text-slate-500">{inc.barangay}, {inc.lguName}</span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">Affected Population</span>
                        <span className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          {inc.affectedCount || 10}+ Citizens at risk
                        </span>
                        <span className="text-[10px] text-slate-500">Extrication team required</span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">Reporter / Contact</span>
                        <span className="font-black text-slate-900 dark:text-slate-100">
                          {inc.reportedBy}
                        </span>
                        {inc.reportedByPhone && (
                          <a href={`tel:${inc.reportedByPhone}`} className="text-[11px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 hover:underline">
                            <Phone className="w-3 h-3" /> {inc.reportedByPhone}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* 4-Stage Operational Lifecycle Switcher */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500">
                        <span>Operational Mission Progression:</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">Phase: {inc.status}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          onClick={() => {
                            updateIncidentStatus(inc.id, "ASSIGNED", "Acknowledged by field team");
                            addLog("MISSION_ACKNOWLEDGED", `Unit ${myProfile.codeName} acknowledged dispatch to ${inc.id}`, "INFO");
                          }}
                          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            inc.status === "ASSIGNED"
                              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          1. Acknowledge
                        </button>

                        <button
                          onClick={() => {
                            updateIncidentStatus(inc.id, "RESPONDING", "Squad dispatched en route");
                            setDutyStatus("EN_ROUTE");
                            addLog("EN_ROUTE", `Unit ${myProfile.codeName} en route to ${inc.locationName}`, "INFO");
                          }}
                          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            dutyStatus === "EN_ROUTE"
                              ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                              : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 hover:bg-amber-200"
                          }`}
                        >
                          2. En Route
                        </button>

                        <button
                          onClick={() => {
                            updateIncidentStatus(inc.id, "RESPONDING", "Arrived on scene, assessing victims");
                            setDutyStatus("ON_SCENE");
                            addLog("ARRIVED_ON_SCENE", `Unit ${myProfile.codeName} on scene at ${inc.locationName}`, "INFO");
                          }}
                          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            dutyStatus === "ON_SCENE"
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200"
                          }`}
                        >
                          3. Arrived On Scene
                        </button>

                        <button
                          onClick={() => {
                            updateIncidentStatus(inc.id, "RESOLVED", "All victims extricated, area secured");
                            setDutyStatus("AVAILABLE");
                            addLog("MISSION_RESOLVED", `Unit ${myProfile.codeName} completed and resolved ${inc.id}`, "INFO");
                          }}
                          className="py-2.5 px-3 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                        >
                          4. Declare Resolved
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* CITIZEN RESCUE & MEDICAL QUEUE */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-amber-500" />
                Sector Citizen Assistance Calls ({activeCitizenRequests.length})
              </h2>
              <span className="text-xs text-slate-500 font-bold">Direct Citizen Requests</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeCitizenRequests.map(req => (
                <div
                  key={req.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusBadge type="severity" value={req.severity} size="sm" />
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                        {req.requestType.replace(/_/g, " ")}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">{req.id}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      {req.citizenName}
                      <span className="text-[11px] font-bold text-slate-400">({req.peopleCount} people)</span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                      {req.description}
                    </p>
                    {req.specialNeeds && (
                      <div className="mt-2 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800/40">
                        ⚠️ Special Needs: {req.specialNeeds}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      {req.locationName}
                    </span>

                    <div className="flex items-center gap-2">
                      {req.citizenPhone && (
                        <a
                          href={`tel:${req.citizenPhone}`}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                          title="Call Citizen"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          updateRequestStatus(req.id, "RESPONDING", myProfile.id);
                          addLog("REQUEST_ACCEPTED", `Unit ${myProfile.codeName} accepted assistance request ${req.id}`, "INFO");
                        }}
                        className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
                      >
                        Accept Mission
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INTERACTIVE DUTY CHECKLIST & TASKS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 lg:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-500" />
                  Tactical Shift Checklist & Action Items
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Essential operational steps required for standard DRRM field protocol</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[10px] font-bold">
                  {(["ALL", "ACTIVE", "COMPLETED"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setTaskFilter(f)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        taskFilter === f ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsAddingTask(!isAddingTask)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-sm shadow-blue-500/20 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </button>
              </div>
            </div>

            {/* Add Task Form Modal / Expansion */}
            {isAddingTask && (
              <form onSubmit={handleAddTask} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Enter tactical task description..."
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value as any)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="CRITICAL">Critical Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 font-bold hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 text-white font-black text-xs rounded-xl shadow"
                  >
                    Save Action Item
                  </button>
                </div>
              </form>
            )}

            {/* Task Items List */}
            <div className="space-y-2">
              {filteredTasks.map(t => (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    t.done
                      ? "bg-slate-50/80 dark:bg-slate-850/40 border-slate-200 dark:border-slate-800 opacity-60"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm"
                  }`}
                >
                  <div 
                    onClick={() => handleToggleTask(t.id)}
                    className="flex items-center gap-3 flex-1 cursor-pointer select-none"
                  >
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                      t.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
                    }`}>
                      {t.done && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-xs font-bold leading-snug ${
                      t.done ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-100"
                    }`}>
                      {t.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge type="severity" value={t.priority as any} size="sm" />
                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TACTICAL FIELD MAP */}
      {activeTab === "tactical-map" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-500" />
                Live Spatial Tactical Field Map
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time GPS tracking with plotted disaster hotspots, shelters, and supply depots</p>
            </div>

            <button
              onClick={handleRefreshGps}
              className="self-start sm:self-auto px-3.5 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingGps ? "animate-spin" : ""}`} />
              Re-Ping Live GPS Position
            </button>
          </div>

          {/* Nearest Waypoint Quick Telemetry HUD */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Nearest Critical Hazard</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">Riverview Sector 4</span>
                <span className="text-[10px] text-rose-500 font-bold block mt-0.5">380m Away (2 mins dispatch)</span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Nearest Evacuation Hub</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">Pauli 2 Covered Gym</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">650m Away (380/500 Capacity)</span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Nearest Logistics Depot</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">Pauli 2 Central Depot</span>
                <span className="text-[10px] text-blue-600 font-bold block mt-0.5">920m Away (Food & Rafts on hand)</span>
              </div>
            </div>
          </div>

          <div className="h-[520px] lg:h-[620px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
            <InteractiveGISMap mini={false} hideLegend={false} />
          </div>
        </div>
      )}

      {/* TAB 4: FIELD SITUATION REPORTER (SITREP) */}
      {activeTab === "field-report" && (
        <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-blue-500" />
              Field Situation Report (SitRep Terminal)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Submit ground telemetry, verified casualty counts, and hazard updates directly to Command</p>
          </div>

          <form onSubmit={handleFieldReportSubmit} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-5 shadow-sm">
            {isSubmitSuccess && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-sm animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>SitRep broadcast verified and logged to LGU DRRM Central Command timeline!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Target Emergency Incident
                </label>
                <select
                  value={fieldReport.incidentId}
                  onChange={e => setFieldReport({ ...fieldReport, incidentId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                >
                  {incidents.map(i => (
                    <option key={i.id} value={i.id}>{i.id} - {i.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Operational Situation Phase
                </label>
                <select
                  value={fieldReport.statusUpdate}
                  onChange={e => setFieldReport({ ...fieldReport, statusUpdate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ARRIVED_SCENE">Phase 1: Arrived on Scene</option>
                  <option value="RESCUE_IN_PROGRESS">Phase 2: Search & Rescue in Progress</option>
                  <option value="EVACUATING_VICTIMS">Phase 3: Evacuating Victims to Shelter</option>
                  <option value="INCIDENT_CONTAINED">Phase 4: Scene Contained / Area Cleared</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Extricated / Rescued Victims
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFieldReport(prev => ({ ...prev, victimsRescued: Math.max(0, prev.victimsRescued - 1) }))}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-base flex items-center justify-center hover:bg-slate-200"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={fieldReport.victimsRescued}
                    onChange={e => setFieldReport({ ...fieldReport, victimsRescued: parseInt(e.target.value) || 0 })}
                    className="flex-1 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white rounded-xl py-2.5"
                  />
                  <button
                    type="button"
                    onClick={() => setFieldReport(prev => ({ ...prev, victimsRescued: prev.victimsRescued + 1 }))}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-base flex items-center justify-center hover:bg-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Estimated Hazard Water Depth
                </label>
                <input
                  type="text"
                  value={fieldReport.waterDepth}
                  onChange={e => setFieldReport({ ...fieldReport, waterDepth: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white rounded-xl px-4 py-3"
                  placeholder="e.g. 1.8m (Chest-high)"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Medical Triage Priority
                </label>
                <select
                  value={fieldReport.triageLevel}
                  onChange={e => setFieldReport({ ...fieldReport, triageLevel: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white rounded-xl px-4 py-3"
                >
                  <option value="CRITICAL">Critical Trauma / Immediate Medevac</option>
                  <option value="HIGH">Urgent Care (Wounded / Elderly)</option>
                  <option value="MEDIUM">Moderate Exposure / Stable</option>
                  <option value="LOW">Minor / Ambulatory</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                Ground Observations & Tactical Hazards
              </label>
              <textarea
                rows={3}
                value={fieldReport.hazardNotes}
                onChange={e => setFieldReport({ ...fieldReport, hazardNotes: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white rounded-xl px-4 py-3 resize-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe current terrain hazards, road accessibility, downed powerlines..."
              />
            </div>

            {/* Photo Attachment Simulation */}
            <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
              <Camera className="w-8 h-8 text-slate-400" />
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Attach Geo-Tagged Tactical Photo (Simulated)
              </div>
              <p className="text-[10px] text-slate-400">Captures timestamp and GPS watermark on upload</p>
              <button
                type="button"
                onClick={() => setReportPhoto("https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80")}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-black hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {reportPhoto ? "Photo Attached (Click to Change)" : "Select Field Photo"}
              </button>
              {reportPhoto && (
                <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200 w-36 h-24">
                  <img src={reportPhoto} alt="Field preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] font-mono px-1 rounded">GPS: 14.1132, 121.3935</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.99] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Transmit SitRep to Central Operations
              </button>
            </div>
          </form>

          {/* RECENT SITREPS HISTORY */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider text-slate-500">
              Recent Ground Transmissions Log
            </h3>
            <div className="space-y-3">
              {sitRepHistory.map(rep => (
                <div
                  key={rep.id}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 dark:text-white">{rep.incidentTitle}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        {rep.phase}
                      </span>
                    </div>
                    <p className="text-slate-500 leading-relaxed">{rep.notes}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-emerald-600 dark:text-emerald-400 block">{rep.victimsRescued} Rescued</span>
                    <span className="text-[10px] text-slate-400 font-mono">{rep.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SUPPLY REQUISITION */}
      {activeTab === "resource-requisition" && (
        <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-amber-500" />
              Tactical Supply & Gear Requisition
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Request additional rescue watercraft, medical kits, and rations from Central Warehouse Depot</p>
          </div>

          {/* Depot Live Stocks Glance */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {resources.slice(0, 4).map(res => (
              <div key={res.id} className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">{res.name}</span>
                <div className="text-base font-black text-slate-900 dark:text-white">{res.availableQuantity} <span className="text-xs font-normal text-slate-500">{res.unit}</span></div>
                <StatusBadge type="stock" value={res.stockStatus} size="sm" />
              </div>
            ))}
          </div>

          <form onSubmit={handleSupplyReqSubmit} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-5 shadow-sm">
            {isReqSubmitted && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-sm animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Requisition order dispatched to Central Logistics Coordinator. Priority delivery underway!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Select Registered Inventory Asset
                </label>
                <select
                  value={reqSupply.resourceId}
                  onChange={e => setReqSupply({ ...reqSupply, resourceId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white rounded-xl px-4 py-3"
                >
                  {resources.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.availableQuantity} {r.unit} in depot)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Quantity Required
                </label>
                <input
                  type="number"
                  min={1}
                  value={reqSupply.qty}
                  onChange={e => setReqSupply({ ...reqSupply, qty: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white rounded-xl px-4 py-3"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Mission Urgency Classification
                </label>
                <select
                  value={reqSupply.priority}
                  onChange={e => setReqSupply({ ...reqSupply, priority: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white rounded-xl px-4 py-3"
                >
                  <option value="CRITICAL">Critical (Immediate Life-Saving Extraction)</option>
                  <option value="URGENT">Urgent (Operational Sustenance / Medical)</option>
                  <option value="STANDARD">Standard Resupply Replenishment</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Forward Delivery Drop Point
                </label>
                <input
                  type="text"
                  value={reqSupply.destination}
                  onChange={e => setReqSupply({ ...reqSupply, destination: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white rounded-xl px-4 py-3"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-[0.99] cursor-pointer"
              >
                <PackagePlus className="w-5 h-5" />
                Dispatch Logistics Requisition Order
              </button>
            </div>
          </form>

          {/* ACTIVE REQUISITION ORDERS */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider text-slate-500">
              Active Requisitions History
            </h3>
            <div className="space-y-3">
              {requisitionHistory.map(ord => (
                <div
                  key={ord.id}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-black text-slate-900 dark:text-white text-sm block">
                      {ord.qty}x {ord.item}
                    </span>
                    <span className="text-[11px] text-slate-500">Destination: {ord.destination}</span>
                  </div>

                  <div className="text-right">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider inline-block ${
                      ord.status === "DISPATCHED" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {ord.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">{ord.requestedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MY SCHEDULE & SQUAD READINESS */}
      {activeTab === "responder-schedule" && (
        <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Responder Duty Roster & Unit Readiness
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Active shift countdown, personnel squad roster, and equipment inspection validation</p>
          </div>

          {/* Active Shift Card */}
          <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Active 12-Hour Emergency Shift
                </span>
                <h3 className="text-xl font-black mt-2">06:00 AM — 06:00 PM (Emergency Surge Duty)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Assigned Sector: Sector 4 Riverview & Pauli 2 Flood Zone</p>
              </div>

              <div className="text-left sm:text-right p-4 bg-white/5 border border-white/10 rounded-2xl shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Shift Time Remaining</span>
                <span className="text-2xl font-black font-mono text-emerald-400">07h 38m</span>
              </div>
            </div>
          </div>

          {/* Squad Personnel Roster */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Tactical Unit Crew Members ({myProfile.teamSize} Personnel)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { name: `${currentUser.name} (${myProfile.codeName})`, role: "Mission Squad Commander", cert: "Master Water Rescue" },
                { name: "Sgt. Dave Santos", role: "Watercraft Pilot / Navigator", cert: "Marine Vessel Cert" },
                { name: "Theresa Ramos", role: "Tactical Paramedic Lead", cert: "ACLS Trauma Specialist" },
                { name: "PO2 Ramon Cruz", role: "Submerged Extraction Diver", cert: "PADI Public Safety Diver" },
                { name: "Officer Leo Garcia", role: "Tactical Comms & Drone Scout", cert: "UAV Telemetry Pilot" },
                { name: "K9 Unit Buster", role: "Scent Location Specialist", cert: "K9 Search & Rescue" }
              ].slice(0, myProfile.teamSize).map((member, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-black text-slate-900 dark:text-white block">{member.name}</span>
                    <span className="text-[10px] text-slate-500">{member.role}</span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                    {member.cert}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Unit Equipment Inspection Checklist */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-500" />
                Pre-Deployment Equipment Safety Checklist
              </h3>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md">
                {equipmentChecklist.filter(e => e.checked).length} / {equipmentChecklist.length} Verified
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {equipmentChecklist.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleEquipmentItem(item.id)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      item.checked ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"
                    }`}>
                      {item.checked && <Check className="w-3 h-3" />}
                    </div>
                    <span className={`font-bold ${item.checked ? "text-slate-800 dark:text-slate-200" : "text-slate-500"}`}>
                      {item.name}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.ready === "OPTIMAL" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {item.ready}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SOS MAYDAY DISTRESS MODAL */}
      <Modal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        title="EMERGENCY DISTRESS BEACON (MAYDAY)"
      >
        <div className="space-y-5 text-center p-2">
          {sosSent ? (
            <div className="py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto animate-ping">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-rose-700">MAYDAY SIGNAL BROADCASTED</h3>
              <p className="text-xs text-slate-600">
                LGU Central Command and neighboring tactical units have received your coordinates [ {gpsLocation.lat}, {gpsLocation.lng} ]. Hold your position.
              </p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-rose-600" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">Confirm Tactical Distress Beacon?</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Triggering this alarm broadcasts an immediate highest-priority Mayday to DRRM Central Command and scrambles backup teams to your GPS coordinates:
                  <span className="font-mono font-bold block mt-1 text-slate-900">
                    {gpsLocation.lat}° N, {gpsLocation.lng}° E
                  </span>
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSosModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTriggerSos}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                >
                  BROADCAST MAYDAY NOW
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

    </div>
  );
};
