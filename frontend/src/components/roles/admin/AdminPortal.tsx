import React, { useState } from "react";
import {
  AlertOctagon,
  FileText,
  Boxes,
  Home,
  Users2,
  MapPin,
  Sparkles,
  BarChart3,
  Plus,
  Check,
  X,
  Search,
  Filter,
  Send,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Download,
  Building,
  RefreshCcw,
  CheckCircle2,
  Clock
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import { useSmartRelief } from "../../../context/SmartReliefContext";
import { KPICard } from "../../common/KPICard";
import { StatusBadge } from "../../common/StatusBadge";
import { Modal } from "../../common/Modal";
import { InteractiveGISMap } from "../../map/InteractiveGISMap";
import { IncidentManagementTab } from "./IncidentManagementTab";
import {
  Incident,
  AssistanceRequest,
  ResourceItem,
  EvacuationCenter,
  Responder,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  RequestType,
  ResourceCategory
} from "../../../types";

interface AdminPortalProps {
  activeTab: string;
  onOpenAiModal?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ activeTab, onOpenAiModal }) => {
  const {
    incidents,
    assistanceRequests,
    resources,
    evacuationCenters,
    responders,
    aiRecommendations,
    verifyIncident,
    assignResponderToIncident,
    updateIncidentStatus,
    updateRequestStatus,
    addResource,
    updateResourceStock,
    transferResource,
    updateEvacuationOccupancy,
    acceptAIRecommendation,
    rejectAIRecommendation,
    createIncident
  } = useSmartRelief();

  // Selected Items for Details Modals
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AssistanceRequest | null>(null);
  
  // Create Modal States
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState(false);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [isTransferResourceOpen, setIsTransferResourceOpen] = useState(false);

  // Form States
  const [newIncData, setNewIncData] = useState<Partial<Incident>>({
    title: "",
    description: "",
    type: "FLOOD",
    severity: "HIGH",
    locationName: "Barangay San Jose Sector 4",
    barangay: "Barangay San Jose",
    affectedCount: 10
  });

  const [newResData, setNewResData] = useState<Partial<ResourceItem>>({
    name: "",
    category: "FOOD_WATER",
    quantity: 500,
    unit: "packs",
    minThreshold: 100,
    location: "Central Warehouse Depot"
  });

  const [transferData, setTransferData] = useState<{ id: string; qty: number; dest: string }>({
    id: resources[0]?.id || "",
    qty: 50,
    dest: "Central Gym Evacuation Center"
  });

  // Filter States
  const [incFilterSeverity, setIncFilterSeverity] = useState("ALL");
  const [reqFilterType, setReqFilterType] = useState("ALL");

  // Analytics Mock Chart Data
  const trendData = [
    { time: "00:00", incidents: 1, requests: 2, resolved: 0 },
    { time: "02:00", incidents: 3, requests: 5, resolved: 1 },
    { time: "04:00", incidents: 6, requests: 12, resolved: 3 },
    { time: "06:00", incidents: 12, requests: 24, resolved: 8 },
    { time: "08:00", incidents: 15, requests: 31, resolved: 14 }
  ];

  const categoryDistributionData = [
    { name: "Flood", value: 18, color: "#f43f5e" },
    { name: "Medical", value: 8, color: "#38bdf8" },
    { name: "Collapse", value: 4, color: "#f59e0b" },
    { name: "Landslide", value: 6, color: "#a855f7" }
  ];

  // Calculated Counters
  const activeIncidents = incidents.filter(i => i.status !== "RESOLVED" && i.status !== "CLOSED");
  const criticalIncidents = incidents.filter(i => i.severity === "CRITICAL" && i.status !== "RESOLVED");
  const pendingRequests = assistanceRequests.filter(r => r.status === "SUBMITTED" || r.status === "VERIFIED");
  const availableResponders = responders.filter(r => r.status === "AVAILABLE");
  const lowStockResources = resources.filter(r => r.stockStatus === "LOW_STOCK" || r.stockStatus === "DEPLETED");

  const filteredIncidents = incidents.filter(i => incFilterSeverity === "ALL" || i.severity === incFilterSeverity);
  const filteredRequests = assistanceRequests.filter(r => reqFilterType === "ALL" || r.requestType === reqFilterType);

  const handleNewIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncData.title) return;
    createIncident(newIncData);
    setIsNewIncidentOpen(false);
    setNewIncData({ title: "", description: "", type: "FLOOD", severity: "HIGH", locationName: "", barangay: "", affectedCount: 10 });
  };

  const handleAddResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResData.name) return;
    addResource(newResData);
    setIsAddResourceOpen(false);
    setNewResData({ name: "", category: "FOOD_WATER", quantity: 500, unit: "packs", minThreshold: 100, location: "Central Warehouse Depot" });
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferData.id || transferData.qty <= 0) return;
    transferResource(transferData.id, transferData.dest, transferData.qty);
    setIsTransferResourceOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. OPERATIONAL DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">LGU-DRRM Operational Command Center</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time disaster resource coordination, incident triage & responder telemetry</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsNewIncidentOpen(true)}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Report Emergency Incident</span>
              </button>

              {onOpenAiModal && (
                <button
                  onClick={onOpenAiModal}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Decision Support</span>
                </button>
              )}
            </div>
          </div>

          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Active Incidents" value={activeIncidents.length} subtext={`${criticalIncidents.length} Critical Level`} icon={AlertOctagon} variant="rose" />
            <KPICard title="Pending Assistance Requests" value={pendingRequests.length} subtext="Citizens waiting for dispatch" icon={FileText} variant="amber" />
            <KPICard title="Available Responders" value={availableResponders.length} subtext={`${responders.length} Total Units`} icon={Users2} variant="emerald" />
            <KPICard title="Low-Stock Supplies" value={lowStockResources.length} subtext="Items below minimum threshold" icon={Boxes} variant="indigo" />
          </div>

          {/* AI Decision Support Priority Banner */}
          {aiRecommendations.filter(r => r.status === "PENDING").length > 0 && (
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 shadow-md text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
                  <Sparkles className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      AI Priority Recommendation: {aiRecommendations.find(r => r.status === "PENDING")?.title}
                    </span>
                    <StatusBadge type="severity" value={aiRecommendations.find(r => r.status === "PENDING")?.severity || "HIGH"} size="sm" />
                  </div>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                    <span className="text-amber-400 font-semibold">Why suggested: </span>
                    {aiRecommendations.find(r => r.status === "PENDING")?.reasoning}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => acceptAIRecommendation(aiRecommendations.find(r => r.status === "PENDING")!.id)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Accept & Execute Action
                </button>
              </div>
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Disaster Incident & Response Velocity Trends
                </h3>
                <span className="text-xs text-slate-500 font-mono">24-Hour Timeline</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", fontSize: "12px", color: "#0f172a" }} />
                    <Line type="monotone" dataKey="incidents" stroke="#f43f5e" strokeWidth={2.5} name="Active Incidents" />
                    <Line type="monotone" dataKey="requests" stroke="#f59e0b" strokeWidth={2} name="Requests" />
                    <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Incident Category Breakdown
                </h3>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryDistributionData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                      {categoryDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", fontSize: "12px", color: "#0f172a" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Embedded GIS Map */}
          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Live Spatial Tactical Map
              </h3>
            </div>
            <InteractiveGISMap
              mini
              onSelectIncident={inc => setSelectedIncident(inc)}
              onSelectRequest={req => setSelectedRequest(req)}
            />
          </div>
        </div>
      )}

      {/* 2. INCIDENT MANAGEMENT TAB */}
      {activeTab === "incidents" && (
        <IncidentManagementTab
          incidents={incidents}
          responders={responders}
          verifyIncident={verifyIncident}
          assignResponderToIncident={assignResponderToIncident}
          setIsNewIncidentOpen={setIsNewIncidentOpen}
          setSelectedIncident={setSelectedIncident}
        />
      )}

      {/* 3. ASSISTANCE REQUESTS TAB */}
      {activeTab === "requests" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Citizen Assistance Requests Queue</h2>
              <p className="text-xs text-slate-500 mt-0.5">Triage rescue, medical, and food supply requests submitted by the public</p>
            </div>

            <select
              value={reqFilterType}
              onChange={e => setReqFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold rounded-xl px-3 py-2 focus:outline-none focus:bg-white"
            >
              <option value="ALL">All Assistance Types</option>
              <option value="RESCUE">Boat / Heavy Rescue</option>
              <option value="MEDICAL">Medical Emergency</option>
              <option value="FOOD_WATER">Food & Potable Water</option>
              <option value="SHELTER">Shelter Assistance</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRequests.map(req => (
              <div key={req.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-600">{req.id}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{req.citizenName}</h4>
                    <p className="text-[10px] text-slate-500">{req.citizenPhone}</p>
                  </div>
                  <StatusBadge type="status" value={req.status} size="sm" />
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-amber-700 uppercase text-[10px]">{req.requestType} • {req.peopleCount} People Affected</div>
                  <p className="text-slate-700 font-medium">{req.description}</p>
                  {req.specialNeeds && (
                    <div className="text-[10px] text-rose-700 font-semibold pt-1">
                      ⚠️ Special Needs: {req.specialNeeds}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-100">
                  <span className="text-slate-500 text-[10px] font-medium">{req.barangay}</span>
                  <select
                    onChange={e => updateRequestStatus(req.id, "ASSIGNED", e.target.value)}
                    defaultValue={req.assignedResponderId || ""}
                    className="bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-700 rounded px-2 py-1"
                  >
                    <option value="" disabled>Assign Unit...</option>
                    {responders.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. RESOURCE INVENTORY TAB */}
      {activeTab === "resources" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Resource & Emergency Supply Inventory</h2>
              <p className="text-xs text-slate-500 mt-0.5">Enterprise inventory tracking, distribution logging, and low-stock alerts</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTransferResourceOpen(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Transfer / Allocate Stock
              </button>

              <button
                onClick={() => setIsAddResourceOpen(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Supply Item</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map(res => (
              <div key={res.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">{res.id}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{res.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">{res.category.replace("_", " ")}</p>
                  </div>
                  <StatusBadge type="stock" value={res.stockStatus} size="sm" />
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Available:</span>
                    <span className="font-extrabold text-slate-900 text-base">
                      {res.availableQuantity} <span className="text-xs font-normal text-slate-500">{res.unit}</span>
                    </span>
                  </div>

                  {/* Stock Bar Meter */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full transition-all ${
                        res.stockStatus === "NORMAL" ? "bg-emerald-500" : res.stockStatus === "LOW_STOCK" ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(100, (res.availableQuantity / res.quantity) * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-medium">
                    <span>Total Stock: {res.quantity}</span>
                    <span>Distributed: {res.distributedQuantity}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => updateResourceStock(res.id, -50)}
                    className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded text-[10px] font-bold"
                  >
                    -50 Distribute
                  </button>
                  <button
                    onClick={() => updateResourceStock(res.id, 100)}
                    className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-bold"
                  >
                    +100 Restock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. EVACUATION CENTER MANAGEMENT TAB */}
      {activeTab === "evacuation" && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-slate-900">Evacuation Center Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">Capacity tracking, facility equipment checklist & real-time occupancy monitoring</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {evacuationCenters.map(ec => {
              const occupancyPct = Math.round((ec.currentOccupants / ec.capacity) * 100);

              return (
                <div key={ec.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{ec.name}</h3>
                      <p className="text-xs text-slate-500">{ec.address} • {ec.barangay}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                      ec.status === "OPEN" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}>
                      {ec.status} ({occupancyPct}%)
                    </span>
                  </div>

                  {/* Occupancy Bar Meter */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Current Occupants:</span>
                      <span className="font-bold text-slate-900">{ec.currentOccupants} / {ec.capacity} capacity</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full transition-all ${
                          occupancyPct >= 90 ? "bg-rose-500" : occupancyPct >= 75 ? "bg-amber-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Facilities Checklist */}
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Available Facilities:</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <span className={`p-1.5 rounded-lg border flex items-center gap-1 font-semibold ${ec.facilities.powerGenerator ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                        ⚡ Generator
                      </span>
                      <span className={`p-1.5 rounded-lg border flex items-center gap-1 font-semibold ${ec.facilities.medicalStation ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                        🏥 Medical Unit
                      </span>
                      <span className={`p-1.5 rounded-lg border flex items-center gap-1 font-semibold ${ec.facilities.waterPurifier ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                        💧 Water Purifier
                      </span>
                      <span className={`p-1.5 rounded-lg border flex items-center gap-1 font-semibold ${ec.facilities.wifiComm ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                        📡 Comm Wi-Fi
                      </span>
                    </div>
                  </div>

                  {/* Quick Update Occupancy Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Update Occupants:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateEvacuationOccupancy(ec.id, ec.currentOccupants - 20)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold"
                      >
                        -20
                      </button>
                      <button
                        onClick={() => updateEvacuationOccupancy(ec.id, ec.currentOccupants + 20)}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
                      >
                        +20
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. GIS MAP TAB */}
      {activeTab === "map" && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-slate-900">Full-Screen GIS Operations Map</h2>
            <p className="text-xs text-slate-500 mt-0.5">Geographic disaster situation map with real-time responder pin tracking and risk circles</p>
          </div>
          <InteractiveGISMap />
        </div>
      )}

      {/* 7. AI DECISION SUPPORT TAB */}
      {activeTab === "ai-support" && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-slate-900">AI Decision Support Engine</h2>
            <p className="text-xs text-slate-500 mt-0.5">Automated situation analysis explaining rationale behind tactical recommendations</p>
          </div>

          <div className="space-y-4">
            {aiRecommendations.map(rec => (
              <div key={rec.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge type="severity" value={rec.severity} size="sm" />
                      <span className="text-xs font-bold text-blue-600">Impact Score: {rec.impactScore}/100</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{rec.title}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                    rec.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {rec.status}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-amber-700 uppercase text-[10px]">WHY THIS WAS SUGGESTED:</div>
                  <p className="text-slate-700 leading-relaxed font-medium">{rec.reasoning}</p>
                </div>

                <div className="text-xs text-slate-800">
                  <span className="font-bold text-blue-600">Recommended Action: </span>
                  {rec.recommendedAction}
                </div>

                {rec.status === "PENDING" && (
                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                    <button onClick={() => rejectAIRecommendation(rec.id)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold">Reject</button>
                    <button onClick={() => acceptAIRecommendation(rec.id)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold">Accept & Execute</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. ANALYTICS & REPORTS TAB */}
      {activeTab === "analytics" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Disaster Analytics & Export Reports</h2>
              <p className="text-xs text-slate-500 mt-0.5">Post-disaster analytics, response times, and LGU reporting</p>
            </div>
            <button
              onClick={() => alert("SmartRelief PDF & CSV Disaster Report exported successfully.")}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export DRRM PDF Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Response Time Metrics</h3>
              <p className="text-xs text-slate-500">Average time from citizen report to responder arrival on scene</p>
              <div className="text-3xl font-black text-emerald-600">11.4 Minutes</div>
              <div className="text-xs text-slate-500">22% faster than regional DRRM baseline standard.</div>
              
              <div className="h-48 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", fontSize: "12px", color: "#0f172a" }} />
                    <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} name="Resolved Cases" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Total Citizens Evacuated & Rescued</h3>
              <p className="text-xs text-slate-500">Total lives saved across active operations</p>
              <div className="text-3xl font-black text-blue-600">1,050 Evacuees</div>
              <div className="text-xs text-slate-500">Spread across 4 active shelter facilities.</div>
              
              <div className="h-48 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", fontSize: "12px", color: "#0f172a" }} />
                    <Line type="step" dataKey="requests" stroke="#3b82f6" strokeWidth={3} name="Total Evacuees" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Report Incident Form */}
      <Modal isOpen={isNewIncidentOpen} onClose={() => setIsNewIncidentOpen(false)} title="Report New Field Incident">
        <form onSubmit={handleNewIncidentSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Incident Title</label>
            <input
              type="text"
              required
              value={newIncData.title}
              onChange={e => setNewIncData({ ...newIncData, title: e.target.value })}
              placeholder="e.g., Trapped Rooftop Residents - Flood Sector 4"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Incident Category</label>
            <select
              value={newIncData.type}
              onChange={e => setNewIncData({ ...newIncData, type: e.target.value as IncidentType })}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="FLOOD">Flood / Flash Flood</option>
              <option value="LANDSLIDE">Landslide</option>
              <option value="FIRE">Fire Emergency</option>
              <option value="STRUCTURE_COLLAPSE">Structural Collapse</option>
              <option value="MEDICAL">Medical Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Severity Level</label>
            <select
              value={newIncData.severity}
              onChange={e => setNewIncData({ ...newIncData, severity: e.target.value as IncidentSeverity })}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="CRITICAL">Critical (Life Threatening)</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Barangay Location</label>
            <input
              type="text"
              value={newIncData.locationName}
              onChange={e => setNewIncData({ ...newIncData, locationName: e.target.value, barangay: e.target.value })}
              placeholder="Barangay San Jose"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Estimated People Affected</label>
            <input
              type="number"
              value={newIncData.affectedCount}
              onChange={e => setNewIncData({ ...newIncData, affectedCount: parseInt(e.target.value) || 1 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsNewIncidentOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold">Submit Incident Report</button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Add Supply Item */}
      <Modal isOpen={isAddResourceOpen} onClose={() => setIsAddResourceOpen(false)} title="Add Supply Inventory Item">
        <form onSubmit={handleAddResourceSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Resource Item Name</label>
            <input
              type="text"
              required
              value={newResData.name}
              onChange={e => setNewResData({ ...newResData, name: e.target.value })}
              placeholder="e.g., Inflatable Life Vests"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select
              value={newResData.category}
              onChange={e => setNewResData({ ...newResData, category: e.target.value as ResourceCategory })}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="FOOD_WATER">Food & Potable Water</option>
              <option value="MEDICAL_SUPPLIES">Medical Supplies</option>
              <option value="RESCUE_GEAR">Rescue Gear</option>
              <option value="POWER_COMM">Power & Communications</option>
              <option value="HYGIENE_KITS">Hygiene Kits</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Initial Quantity</label>
            <input
              type="number"
              value={newResData.quantity}
              onChange={e => setNewResData({ ...newResData, quantity: parseInt(e.target.value) || 0, availableQuantity: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddResourceOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold">Add Supply Item</button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Transfer Supply */}
      <Modal isOpen={isTransferResourceOpen} onClose={() => setIsTransferResourceOpen(false)} title="Transfer / Reallocate Supply">
        <form onSubmit={handleTransferSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Supply Item</label>
            <select
              value={transferData.id}
              onChange={e => setTransferData({ ...transferData, id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              {resources.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.availableQuantity} available)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quantity to Transfer</label>
            <input
              type="number"
              value={transferData.qty}
              onChange={e => setTransferData({ ...transferData, qty: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Destination Facility</label>
            <input
              type="text"
              value={transferData.dest}
              onChange={e => setTransferData({ ...transferData, dest: e.target.value })}
              placeholder="e.g., Central Gym Evacuation Center"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsTransferResourceOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold">Authorize Transfer</button>
          </div>
        </form>
      </Modal>

      {/* Incident Detail Drawer Modal */}
      {selectedIncident && (
        <Modal isOpen={!!selectedIncident} onClose={() => setSelectedIncident(null)} title={`Incident ${selectedIncident.id}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">{selectedIncident.title}</h3>
              <StatusBadge type="severity" value={selectedIncident.severity} size="sm" />
            </div>

            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">{selectedIncident.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500">
              <div>Location: <span className="text-slate-900 font-bold">{selectedIncident.locationName}</span></div>
              <div>People Affected: <span className="text-slate-900 font-bold">{selectedIncident.affectedCount}</span></div>
              <div>Reported By: <span className="text-slate-900 font-bold">{selectedIncident.reportedBy}</span></div>
              <div>Status: <StatusBadge type="status" value={selectedIncident.status} size="sm" /></div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h4 className="font-bold text-slate-900 text-xs mb-2">Operational Incident Timeline</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedIncident.timeline.map((item, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-0.5">
                    <div className="text-[10px] text-blue-600 font-bold">{item.timestamp} • {item.performedBy}</div>
                    <div className="text-slate-700 font-medium">{item.action}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
