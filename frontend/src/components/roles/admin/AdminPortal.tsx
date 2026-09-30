import React, { useState, useEffect, useMemo } from "react";
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
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Download,
  Building,
  RefreshCcw,
  CheckCircle2,
  Clock,
  Activity,
  ChevronRight
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
  onNavigateTab?: (tabId: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ activeTab, onOpenAiModal, onNavigateTab }) => {
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
    affectedCount: 10,
    lat: 14.0720,
    lng: 121.3250,
  });

  // Skeleton Loading State
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500); // 500ms artificial delay for smooth skeleton animation
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleMapClick = (lat: number, lng: number) => {
    setNewIncData(prev => ({ ...prev, lat, lng }));
    setIsNewIncidentOpen(true);
  };

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
  const activeIncidents = useMemo(() => incidents.filter(i => i.status !== "RESOLVED" && i.status !== "CLOSED"), [incidents]);
  const criticalIncidents = useMemo(() => incidents.filter(i => i.severity === "CRITICAL" && i.status !== "RESOLVED"), [incidents]);
  const pendingRequests = useMemo(() => assistanceRequests.filter(r => r.status === "SUBMITTED" || r.status === "VERIFIED"), [assistanceRequests]);
  const availableResponders = useMemo(() => responders.filter(r => r.status === "AVAILABLE"), [responders]);
  const lowStockResources = useMemo(() => resources.filter(r => r.stockStatus === "LOW_STOCK" || r.stockStatus === "DEPLETED"), [resources]);

  const filteredIncidents = useMemo(() => incidents.filter(i => incFilterSeverity === "ALL" || i.severity === incFilterSeverity), [incidents, incFilterSeverity]);
  const filteredRequests = useMemo(() => assistanceRequests.filter(r => reqFilterType === "ALL" || r.requestType === reqFilterType), [assistanceRequests, reqFilterType]);

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

  const renderSkeleton = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-5 md:p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm h-32 flex flex-col justify-between overflow-hidden animate-pulse">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
                      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="w-12 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded mt-auto" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-[500px] rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden animate-pulse">
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded shadow" />
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded shadow" />
                </div>
              </div>
              <div className="lg:col-span-1 h-[500px] rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col animate-pulse">
                <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case "map":
        return (
          <div className="h-[calc(100vh-140px)] w-full rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden animate-pulse">
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded shadow" />
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded shadow" />
            </div>
            <div className="absolute top-1/3 left-1/4 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="absolute top-1/2 right-1/3 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="absolute bottom-1/4 left-1/2 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>
        );
      case "ai-support":
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="h-8 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex items-center gap-2 mb-4 animate-pulse">
                    <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="p-5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-5 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
                      </div>
                      <div className="h-8 w-full bg-slate-200 dark:bg-slate-800 rounded-lg mt-4" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      case "incidents":
      case "requests":
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 w-full">
                      <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "resources":
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm h-24 flex flex-col justify-center animate-pulse">
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              ))}
            </div>
            <div className="rounded-2xl border bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 animate-pulse overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
                <div className="h-5 w-1/4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-4 flex gap-4 items-center">
                    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "users":
      default:
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="h-12 w-full max-w-sm bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="rounded-2xl border bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 animate-pulse overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
                <div className="h-5 w-1/4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-4 flex gap-4 items-center">
                    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  if (isLoading) {
    return renderSkeleton();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. OPERATIONAL DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-in fade-in">

          <div className="space-y-4">
            
            {/* 1. KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard 
                title="Active Incidents" 
                value={activeIncidents.length} 
                icon={AlertOctagon} 
                variant="rose" 
                trend={{ value: "+2 in 1h", isUp: true }}
                subtext={criticalIncidents.length > 0 ? `${criticalIncidents.length} Critical Events` : "All monitored"}
                onClick={() => onNavigateTab && onNavigateTab("incidents")}
              />
              <KPICard 
                title="Pending Requests" 
                value={pendingRequests.length} 
                icon={FileText} 
                variant="amber"
                trend={{ value: "-4 in 24h", isUp: false }}
                subtext="Waiting for resource allocation" 
                onClick={() => onNavigateTab && onNavigateTab("requests")}
              />
              <KPICard 
                title="Available Field Units" 
                value={availableResponders.length} 
                icon={Users2} 
                variant="emerald" 
                trend={{ value: "+12 total", isUp: true }}
                subtext="Ready for immediate dispatch"
                onClick={() => onNavigateTab && onNavigateTab("map")}
              />
              <KPICard 
                title="Critical Resources" 
                value={lowStockResources.length} 
                icon={Boxes} 
                variant="indigo" 
                trend={{ value: "2 depleted", isUp: false }}
                subtext="Requires urgent resupply"
                onClick={() => onNavigateTab && onNavigateTab("resources")}
              />
            </div>

            {/* 2. AI Recommendation Banner (if active) */}
            {aiRecommendations.filter(r => r.status === "PENDING").length > 0 && (
              <div className="bg-white dark:bg-slate-900 border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  <Sparkles className="w-5 h-5 text-blue-500 shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      AI Priority Action: {aiRecommendations.find(r => r.status === "PENDING")?.title}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {aiRecommendations.find(r => r.status === "PENDING")?.reasoning}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => acceptAIRecommendation(aiRecommendations.find(r => r.status === "PENDING")!.id)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Execute Action
                  </button>
                </div>
              </div>
            )}

            {/* 3. Live Map (Full Width, Larger) */}
            <div className="h-[500px] lg:h-[650px] bg-white dark:bg-slate-900 border rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700" style={{ borderColor: 'var(--color-border)' }}>
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <h3 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>Live Spatial Tactical Map</h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> LIVE FEED
                  </span>
                  <button 
                    onClick={() => onNavigateTab && onNavigateTab('map')}
                    className="hidden sm:flex text-[11px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 items-center gap-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Open Full Map <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 w-full relative z-0 min-h-0">
                <InteractiveGISMap 
                  mini={false}
                  hideLegend={true}
                  className="h-full bg-slate-900 overflow-hidden"
                  onSelectIncident={inc => setSelectedIncident(inc)}
                  onSelectRequest={req => setSelectedRequest(req)}
                  onMapClick={handleMapClick}
                />
              </div>
              <div className="p-4 border-t flex flex-wrap items-center justify-between gap-4 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-4 font-medium flex-wrap text-[10px] sm:text-xs">
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Critical
                  </span>
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Responder
                  </span>
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Evacuation
                  </span>
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Request
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-medium hidden md:block" style={{ color: 'var(--color-text-secondary)' }}>Synced with field units</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">System Operational</span>
                </div>
              </div>
            </div>

            {/* 4. Secondary Analytics & Lists (4 Columns Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              
              {/* Response Velocity Trends (2 columns) */}
              <div className="lg:col-span-2 h-[350px] bg-white dark:bg-slate-900 border rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700" style={{ borderColor: 'var(--color-border)' }}>
                <div className="p-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    <h3 className="font-bold text-[0.875rem]" style={{ color: 'var(--color-text-primary)' }}>Response Velocity Trends</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden sm:block">24H Timeline</span>
                    <button onClick={() => onNavigateTab && onNavigateTab('incidents')} className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer">
                      Full Report <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 w-full min-h-0 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="time" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: "12px", fontSize: "12px", color: "var(--color-text-primary)", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} 
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Line type="monotone" dataKey="incidents" stroke="#f43f5e" strokeWidth={3} name="Active Incidents" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="requests" stroke="#f59e0b" strokeWidth={3} name="Requests" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} name="Resolved" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Breakdown (1 column) */}
              <div className="lg:col-span-1 h-[350px] bg-white dark:bg-slate-900 border rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700" style={{ borderColor: 'var(--color-border)' }}>
                <div className="p-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-slate-400" />
                    <h3 className="font-bold text-[0.875rem]" style={{ color: 'var(--color-text-primary)' }}>Incident Types</h3>
                  </div>
                  <button onClick={() => onNavigateTab && onNavigateTab('incidents')} className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer">
                    Manage <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1 w-full min-h-0 flex flex-col p-4">
                  <div className="flex-1 w-full min-h-0 flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryDistributionData} cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" paddingAngle={5} dataKey="value" stroke="none">
                        {categoryDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: "12px", fontSize: "12px", color: "var(--color-text-primary)", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} 
                        itemStyle={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center text for donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
                    <span className="text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>{activeIncidents.length}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Total</span>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-2.5 shrink-0">
                  {categoryDistributionData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                        {item.name} <span className="text-slate-400">({item.value})</span>
                      </span>
                    </div>
                  ))}
                </div>
                </div>
              </div>

              {/* Recent Critical Incidents (1 column) */}
              <div className="lg:col-span-1 h-[350px] bg-white dark:bg-slate-900 border rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700" style={{ borderColor: 'var(--color-border)' }}>
                <div className="p-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-slate-400" />
                    <h3 className="font-bold text-[0.875rem]" style={{ color: 'var(--color-text-primary)' }}>Critical Incidents</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 hidden sm:block">{criticalIncidents.length} Active</span>
                    <button onClick={() => onNavigateTab && onNavigateTab('incidents')} className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer">
                      View All <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 w-full overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {criticalIncidents.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                      No critical incidents at this time.
                    </div>
                  ) : (
                    criticalIncidents.map(inc => (
                      <div key={inc.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 border rounded-xl flex flex-col gap-1.5 transition-colors" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="flex items-start justify-between gap-4">
                          <span className="font-bold text-xs tracking-tight" style={{ color: 'var(--color-text-primary)' }}>{inc.title}</span>
                          <span className="text-[10px] font-mono whitespace-nowrap text-slate-400">{new Date(inc.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 rounded">Critical</span>
                          <span className="text-[10px] font-medium truncate" style={{ color: 'var(--color-text-muted)' }}>{inc.locationName}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

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
        <div className="flex flex-col h-[calc(100vh-160px)] lg:h-[calc(100vh-130px)] animate-in fade-in -mx-2 lg:mx-0">
          <div className="mb-4 shrink-0 px-2 lg:px-0">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Live Tactical Operations Map</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time geographic visualization of critical incidents, active field units, and dynamic hazard zones.</p>
          </div>
          <div className="flex-1 w-full min-h-0 relative z-0">
            <InteractiveGISMap 
              onMapClick={handleMapClick}
              className="h-full w-full bg-slate-900 lg:border border-slate-200 dark:border-slate-700 lg:rounded-2xl overflow-hidden shadow-sm" 
            />
          </div>
        </div>
      )}

      {/* 7. AI DECISION SUPPORT TAB */}
      {activeTab === "ai-support" && (
        <div className="flex flex-col h-[calc(100vh-160px)] lg:h-[calc(100vh-130px)] animate-in fade-in -mx-2 lg:mx-0">
          <div className="mb-4 shrink-0 px-2 lg:px-0">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" /> AI Tactical Advisor
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Automated situation analysis and intelligent operational routing</p>
          </div>

          {(() => {
            const renderAICard = (rec: AIRecommendation) => (
              <div key={rec.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-3 group">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-[13px] leading-tight">{rec.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge type="severity" value={rec.severity} size="sm" />
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                        <Activity className="w-3 h-3 text-blue-500" />
                        Impact: {rec.impactScore}/100
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                  <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">Recommended Action:</span>
                  {rec.recommendedAction}
                </div>

                <details className="group/details">
                  <summary className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-blue-500 cursor-pointer flex items-center gap-1 transition-colors select-none list-none [&::-webkit-details-marker]:hidden">
                    <ChevronRight className="w-3 h-3 group-open/details:rotate-90 transition-transform" /> 
                    AI Logic Breakdown
                  </summary>
                  <div className="mt-2 pl-4 border-l-2 border-blue-200 dark:border-blue-900/50 space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <p><span className="font-bold text-slate-800 dark:text-slate-200">Context:</span> {rec.reasoning}</p>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Confidence: 94% - based on DRRM historical trends
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Resource Check: Availability Verified
                    </div>
                  </div>
                </details>

                {rec.status === "PENDING" && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 mt-auto">
                    <button onClick={() => rejectAIRecommendation(rec.id)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold transition-colors">Reject</button>
                    <button onClick={() => acceptAIRecommendation(rec.id)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Execute
                    </button>
                  </div>
                )}
              </div>
            );

            return (
              <div className="flex-1 w-full min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden px-2 lg:px-0">
                {/* Pending Column */}
                <div className="flex flex-col bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/60 overflow-hidden">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-4 flex items-center justify-between">
                    <span>Pending Action</span>
                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 px-2 py-0.5 rounded-full text-[10px]">
                      {aiRecommendations.filter(r => r.status === "PENDING").length}
                    </span>
                  </h3>
                  <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
                    {aiRecommendations.filter(r => r.status === "PENDING").map(renderAICard)}
                  </div>
                </div>

                {/* Accepted Column */}
                <div className="flex flex-col bg-emerald-50/30 dark:bg-emerald-900/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/20 overflow-hidden">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-500 mb-4 flex items-center justify-between">
                    <span>Executed</span>
                    <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px]">
                      {aiRecommendations.filter(r => r.status === "ACCEPTED").length}
                    </span>
                  </h3>
                  <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
                    {aiRecommendations.filter(r => r.status === "ACCEPTED").map(renderAICard)}
                  </div>
                </div>

                {/* Rejected Column */}
                <div className="flex flex-col bg-rose-50/30 dark:bg-rose-900/10 rounded-2xl p-4 border border-rose-100 dark:border-rose-900/20 overflow-hidden">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-500 mb-4 flex items-center justify-between">
                    <span>Rejected</span>
                    <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400 px-2 py-0.5 rounded-full text-[10px]">
                      {aiRecommendations.filter(r => r.status === "REJECTED").length}
                    </span>
                  </h3>
                  <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
                    {aiRecommendations.filter(r => r.status === "REJECTED").map(renderAICard)}
                  </div>
                </div>
              </div>
            );
          })()}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={newIncData.lat || ""}
                onChange={e => setNewIncData({ ...newIncData, lat: parseFloat(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={newIncData.lng || ""}
                onChange={e => setNewIncData({ ...newIncData, lng: parseFloat(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
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
