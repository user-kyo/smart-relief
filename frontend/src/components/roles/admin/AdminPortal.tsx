import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Building2,
  Users,
  ShieldCheck,
  RefreshCcw,
  CheckCircle2,
  Clock,
  Activity,
  ChevronRight,
  ChevronDown,
  Minus,
  Undo
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
  CartesianGrid,
  Legend
} from "recharts";
import { useSmartRelief } from "../../../context/SmartReliefContext";
import { KPICard } from "../../common/KPICard";
import { StatusBadge } from "../../common/StatusBadge";
import { Modal } from "../../common/Modal";
import { InteractiveGISMap } from "../../map/InteractiveGISMap";
import { IncidentManagementTab } from "./IncidentManagementTab";
import { CitizenRequestsTab } from "./CitizenRequestsTab";
import { EvacuationManagementTab } from "./EvacuationManagementTab";
import { ResponderManagementTab } from "./ResponderManagementTab";
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
  ResourceCategory,
  AIRecommendation
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
    users,
    lgus,
    systemLogs,
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
    undoAIRecommendation,
    fetchAIRecommendations,
    createIncident,
    addEvacuationCenter,
    addResponder
  } = useSmartRelief();

  // Selected Items for Details Modals
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AssistanceRequest | null>(null);
  
  // Create Modal States
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState(false);
  const [isNewEvacCenterOpen, setIsNewEvacCenterOpen] = useState(false);
  const [isNewResponderOpen, setIsNewResponderOpen] = useState(false);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [isTransferResourceOpen, setIsTransferResourceOpen] = useState(false);
  const [pendingPinLocation, setPendingPinLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // Resource filters
  const [resourceSearch, setResourceSearch] = useState("");
  const [resourceCategoryFilter, setResourceCategoryFilter] = useState("ALL");
  
  // Custom Dropdown States
  const [isIncidentTypeDropdownOpen, setIsIncidentTypeDropdownOpen] = useState(false);
  const [isIncidentSeverityDropdownOpen, setIsIncidentSeverityDropdownOpen] = useState(false);
  const [isUnitTypeDropdownOpen, setIsUnitTypeDropdownOpen] = useState(false);
  const [expandedAICards, setExpandedAICards] = useState<Record<string, boolean>>({});

  // Form States
  const [exportModalState, setExportModalState] = useState<{
    isOpen: boolean;
    type: 'users' | 'logs' | 'incidents' | 'lgus' | null;
    dataPreview: any[];
  }>({ isOpen: false, type: null, dataPreview: [] });

  const openExportModal = (type: 'users' | 'logs' | 'incidents' | 'lgus') => {
    let preview: any[] = [];
    if (type === 'users') {
      preview = users.slice(0, 50).map(u => ({ Name: u.name, Email: u.email, Role: u.role, Status: u.status }));
    } else if (type === 'logs') {
      preview = systemLogs.slice(0, 50).map(l => ({ Time: new Date(l.timestamp).toLocaleString(), Action: l.action, User: l.userName, Role: l.userRole }));
    } else if (type === 'incidents') {
      preview = incidents.slice(0, 50).map(i => ({ Type: i.type, Location: i.locationName, Severity: i.severity, Status: i.status }));
    } else if (type === 'lgus') {
      preview = lgus.slice(0, 50).map(l => ({ Name: l.name, Region: l.region, Code: l.cityMunicipality, Status: l.status }));
    }
    setExportModalState({ isOpen: true, type, dataPreview: preview });
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    window.location.href = `http://localhost:5000/api/analytics/export/${exportModalState.type}?format=${format}`;
    setExportModalState({ isOpen: false, type: null, dataPreview: [] });
  };

  const [newIncData, setNewIncData] = useState<Partial<Incident>>({
    title: "",
    description: "",
    type: "FLOOD",
    severity: "HIGH",
    locationName: "Barangay San Jose Sector 4",
    barangay: "Barangay San Jose",
    affectedCount: 10,
    lat: 14.1134,
    lng: 121.3938,
  });

  const [newEvacCenterData, setNewEvacCenterData] = useState<Partial<EvacuationCenter>>({
    name: "",
    address: "",
    barangay: "",
    capacity: 100,
    currentOccupants: 0,
    contactPerson: "",
    contactPhone: "",
    lat: 14.1134,
    lng: 121.3938
  });

  const [newResponderData, setNewResponderData] = useState<Partial<Responder>>({
    name: "",
    codeName: "",
    roleType: "DISASTER_RESPONSE_TEAM",
    phone: "",
    teamSize: 1,
    lat: 14.1134,
    lng: 121.3938
  });

  // Skeleton Loading State
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500); // 500ms artificial delay for smooth skeleton animation
    return () => clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    const handleOpenIncidentModal = () => setIsNewIncidentOpen(true);
    window.addEventListener('open-new-incident-modal', handleOpenIncidentModal);
    return () => window.removeEventListener('open-new-incident-modal', handleOpenIncidentModal);
  }, []);

  // Auto-refresh AI Recommendations if they are the hardcoded ones
  useEffect(() => {
    if (aiRecommendations.some(r => r.id.includes('rec-fallback'))) {
      fetchAIRecommendations();
    }
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setPendingPinLocation({ lat, lng });
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
  const [timeRange, setTimeRange] = useState("24h");

  // Real Data Analytics Chart Data
  const trendData = useMemo(() => {
    const buckets: Record<string, { time: string, incidents: number, requests: number, resolved: number }> = {};
    
    // Group incidents by hour
    incidents.forEach(inc => {
      const date = new Date(inc.reportedAt);
      if (isNaN(date.getTime())) return;
      const hour = date.getHours().toString().padStart(2, '0') + ":00";
      if (!buckets[hour]) buckets[hour] = { time: hour, incidents: 0, requests: 0, resolved: 0 };
      buckets[hour].incidents += 1;
      if (inc.status === "RESOLVED" || inc.status === "CLOSED") buckets[hour].resolved += 1;
    });

    // Group requests by hour
    assistanceRequests.forEach(req => {
      const date = new Date(req.submittedAt);
      if (isNaN(date.getTime())) return;
      const hour = date.getHours().toString().padStart(2, '0') + ":00";
      if (!buckets[hour]) buckets[hour] = { time: hour, incidents: 0, requests: 0, resolved: 0 };
      buckets[hour].requests += 1;
      if (req.status === "RESOLVED") buckets[hour].resolved += 1;
    });

    // If no data, provide an empty state structure
    if (Object.keys(buckets).length === 0) {
      return [{ time: "00:00", incidents: 0, requests: 0, resolved: 0 }];
    }

    return Object.values(buckets).sort((a, b) => a.time.localeCompare(b.time));
  }, [incidents, assistanceRequests]);
  // Calculated Counters
  const activeIncidents = useMemo(() => incidents.filter(i => i.status !== "RESOLVED" && i.status !== "CLOSED"), [incidents]);
  const criticalIncidents = useMemo(() => incidents.filter(i => i.severity === "CRITICAL" && i.status !== "RESOLVED"), [incidents]);
  const pendingRequests = useMemo(() => assistanceRequests.filter(r => r.status === "SUBMITTED" || r.status === "VERIFIED"), [assistanceRequests]);
  const availableResponders = useMemo(() => responders.filter(r => r.status === "AVAILABLE"), [responders]);
  const lowStockResources = useMemo(() => resources.filter(r => r.stockStatus === "LOW_STOCK" || r.stockStatus === "DEPLETED"), [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const resName = res.name || "";
      const resId = res.id || "";
      const matchesSearch = resName.toLowerCase().includes(resourceSearch.toLowerCase()) || resId.toLowerCase().includes(resourceSearch.toLowerCase());
      const matchesCategory = resourceCategoryFilter === "ALL" || res.category === resourceCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [resources, resourceSearch, resourceCategoryFilter]);

  const categoryDistributionData = useMemo(() => {
    const normalizeKey = (k: string) => {
      const upper = k.toUpperCase();
      if (upper.includes("FLOOD")) return "FLOOD";
      if (upper.includes("LANDSLIDE") || upper.includes("MUD")) return "LANDSLIDE";
      if (upper.includes("MED")) return "MEDICAL";
      if (upper.includes("COLLAPSE")) return "STRUCTURE_COLLAPSE";
      if (upper.includes("FIRE")) return "FIRE";
      if (upper.includes("EARTHQUAKE") || upper.includes("QUAKE")) return "EARTHQUAKE";
      if (upper.includes("TYPHOON") || upper.includes("STORM")) return "TYPHOON";
      return "OTHER";
    };

    const counts = activeIncidents.reduce((acc, inc) => {
      const normKey = normalizeKey(inc.type || "");
      acc[normKey] = (acc[normKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const colors: Record<string, string> = {
      "FLOOD": "#f43f5e",
      "MEDICAL": "#38bdf8",
      "STRUCTURE_COLLAPSE": "#f59e0b",
      "FIRE": "#ef4444",
      "LANDSLIDE": "#a855f7",
      "EARTHQUAKE": "#6366f1",
      "TYPHOON": "#8b5cf6",
      "OTHER": "#10b981" // vibrant emerald
    };

    const labels: Record<string, string> = {
      "FLOOD": "Flood",
      "MEDICAL": "Medical",
      "STRUCTURE_COLLAPSE": "Collapse",
      "FIRE": "Fire",
      "LANDSLIDE": "Landslide",
      "EARTHQUAKE": "Earthquake",
      "TYPHOON": "Typhoon",
      "OTHER": "Other"
    };

    const data = Object.entries(counts).map(([key, value]) => ({
      name: labels[key] || key,
      value,
      color: colors[key] || "#94a3b8"
    }));

    // If no data, return placeholder
    if (data.length === 0) {
      return [{ name: "No Data", value: 1, color: "#cbd5e1" }];
    }

    return data;
  }, [activeIncidents]);

  const filteredIncidents = useMemo(() => incidents.filter(i => incFilterSeverity === "ALL" || i.severity === incFilterSeverity), [incidents, incFilterSeverity]);
  // const filteredRequests = useMemo(() => assistanceRequests.filter(r => reqFilterType === "ALL" || r.requestType === reqFilterType), [assistanceRequests, reqFilterType]);

  const handleNewIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncData.title) return;
    createIncident(newIncData);
    setIsNewIncidentOpen(false);
    setNewIncData({ title: "", description: "", type: "FLOOD", severity: "HIGH", locationName: "", barangay: "", affectedCount: 10 });
  };

  const handleNewEvacCenterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvacCenterData.name) return;
    addEvacuationCenter(newEvacCenterData);
    setIsNewEvacCenterOpen(false);
    setNewEvacCenterData({ name: "", address: "", barangay: "", capacity: 100, currentOccupants: 0, contactPerson: "", contactPhone: "" });
  };

  const handleNewResponderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResponderData.name) return;
    addResponder(newResponderData);
    setIsNewResponderOpen(false);
    setNewResponderData({ name: "", codeName: "", roleType: "DISASTER_RESPONSE_TEAM", phone: "", teamSize: 1 });
  };

  const handleAddResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResData.name) return;
    await addResource(newResData);
    setIsAddResourceOpen(false);
    setNewResData({ name: "", category: "FOOD_WATER", quantity: 500, unit: "packs", minThreshold: 100, location: "Central Warehouse Depot" });
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferData.id || transferData.qty <= 0) return;
    await transferResource(transferData.id, transferData.dest, transferData.qty);
    setIsTransferResourceOpen(false);
  };

  const renderSkeleton = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="relative p-6 rounded-2xl border bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 shadow-sm h-40 flex flex-col overflow-hidden animate-pulse">
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded uppercase" />
                    <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  </div>
                  <div className="flex items-end justify-between mt-auto">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Banner Skeleton */}
            <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-pulse h-28 sm:h-24">
              <div className="flex items-start sm:items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                <div className="space-y-3 w-full">
                  <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
              <div className="shrink-0 w-full sm:w-32 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>

            {/* Live Map & Sidebar Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-[500px] lg:h-[650px] rounded-2xl border bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden animate-pulse">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="w-48 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                </div>
                <div className="absolute top-20 right-4 flex flex-col gap-2">
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded shadow" />
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded shadow" />
                </div>
              </div>
              <div className="lg:col-span-1 h-[500px] lg:h-[650px] rounded-2xl border bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col animate-pulse">
                <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
                <div className="space-y-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                      <div className="space-y-3 flex-1 pt-1">
                        <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded" />
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
          <div className="flex flex-col h-[calc(100vh-160px)] lg:h-[calc(100vh-130px)] -mx-2 lg:mx-0">
            <div className="mb-4 shrink-0 px-2 lg:px-0 flex flex-col gap-2">
              <div className="h-6 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="flex-1 w-full relative z-0 bg-slate-100 dark:bg-slate-800/50 lg:border border-slate-200 dark:border-slate-800 lg:rounded-2xl overflow-hidden animate-pulse">
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg shadow-sm" />
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg shadow-sm" />
              </div>
              <div className="absolute top-4 left-4">
                 <div className="w-64 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl shadow-sm hidden sm:block" />
              </div>
              <div className="absolute top-1/3 left-1/4 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 ring-4 ring-slate-200 dark:ring-slate-700" />
              <div className="absolute top-1/2 right-1/3 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 ring-4 ring-slate-200 dark:ring-slate-700" />
              <div className="absolute bottom-1/4 left-1/2 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 ring-4 ring-slate-200 dark:ring-slate-700" />
            </div>
          </div>
        );
      case "ai-support":
        return (
          <div className="flex flex-col h-[calc(100vh-160px)] lg:h-[calc(100vh-130px)] -mx-2 lg:mx-0">
            <div className="mb-4 shrink-0 px-2 lg:px-0 flex flex-col gap-2">
              <div className="h-6 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="flex-1 min-h-0 flex overflow-x-auto gap-4 lg:gap-6 pb-4 px-2 lg:px-0">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-[85vw] sm:w-[320px] lg:flex-1 shrink-0 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 lg:p-4">
                  <div className="flex items-center justify-between mb-4 px-1 animate-pulse">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700" />
                      <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                    <div className="h-5 w-6 rounded-full bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="flex-1 space-y-3 lg:space-y-4 pr-1">
                    {[...Array(2)].map((_, j) => (
                      <div key={j} className="relative overflow-hidden p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[240px] animate-pulse">
                        <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 dark:bg-slate-700" />
                        <div className="flex items-center justify-between mb-3">
                          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                          <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                        <div className="flex-1 p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 mb-3 flex flex-col">
                          <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded mb-1.5" />
                          <div className="h-2 w-5/6 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                        <div className="h-8 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
                      </div>
                    ))}
                  </div>
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

  return (
    <div className="relative min-h-screen w-full">
      {/* Skeleton Layer - Fades out when loaded */}
      <div 
        className={`w-full transition-opacity duration-700 ease-in-out ${
          isLoading ? 'opacity-100 z-10 relative' : 'opacity-0 pointer-events-none absolute inset-0 -z-10'
        }`}
      >
        {renderSkeleton()}
      </div>

      {/* Actual Content Layer - Fades and slides in when loaded */}
      <div 
        className={`w-full transition-all duration-700 delay-100 ease-out transform ${
          isLoading ? 'opacity-0 translate-y-4 pointer-events-none absolute inset-0 -z-10' : 'opacity-100 translate-y-0 relative z-20'
        }`}
      >
        <div className="space-y-6">
      
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
              <div 
                onClick={() => onNavigateTab("ai-support")}
                className="group relative bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-900/20 dark:to-slate-900 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(79,70,229,0.12)] hover:border-indigo-400 dark:hover:border-indigo-500 hover:-translate-y-0.5"
              >
                {/* Ambient glow effect on hover */}
                <div className="absolute inset-0 bg-indigo-400/0 group-hover:bg-indigo-400/5 dark:group-hover:bg-indigo-500/10 transition-colors duration-300" />
                
                <div className="flex items-start sm:items-center gap-4 flex-1 relative z-10">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-indigo-950 dark:text-indigo-100 flex items-center gap-2">
                      <span className="bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase">Priority Action</span>
                      {aiRecommendations.find(r => r.status === "PENDING")?.title}
                    </h3>
                    <p className="text-xs mt-1.5 text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {aiRecommendations.find(r => r.status === "PENDING")?.reasoning}
                    </p>
                  </div>
                </div>
                
                {/* Hover Indicator & Navigation Button */}
                <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0 relative z-10 flex items-center justify-end">
                  <button
                    className="flex justify-center items-center gap-2 py-2.5 px-5 border border-indigo-200 dark:border-indigo-700 rounded-xl shadow-sm text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 group-hover:shadow-md transition-all duration-300"
                  >
                    Review Action
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
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
              <div 
                onClick={() => onNavigateTab && onNavigateTab('incidents')}
                className="lg:col-span-2 h-[350px] bg-white dark:bg-slate-900 border rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer group" 
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="p-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <h3 className="font-bold text-[0.875rem]" style={{ color: 'var(--color-text-primary)' }}>Response Velocity Trends</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden sm:block">24H Timeline</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-blue-500 transition-all duration-300" />
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
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                      <Line type="monotone" dataKey="incidents" stroke="#f43f5e" strokeWidth={3} name="Reported Incidents" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="requests" stroke="#f59e0b" strokeWidth={3} name="Requests" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} name="Resolved" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Breakdown (1 column) */}
              <div 
                onClick={() => onNavigateTab && onNavigateTab('incidents')}
                className="lg:col-span-1 h-[350px] bg-white dark:bg-slate-900 border rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer group" 
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="p-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <h3 className="font-bold text-[0.875rem]" style={{ color: 'var(--color-text-primary)' }}>Incident Types</h3>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-blue-500 transition-all duration-300" />
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
              <div 
                onClick={() => onNavigateTab && onNavigateTab('incidents')}
                className="lg:col-span-1 h-[350px] bg-white dark:bg-slate-900 border rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer group" 
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="p-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <h3 className="font-bold text-[0.875rem]" style={{ color: 'var(--color-text-primary)' }}>Critical Incidents</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 hidden sm:block">{criticalIncidents.length} Active</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-blue-500 transition-all duration-300" />
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
                          <span className="text-[10px] font-mono whitespace-nowrap text-slate-400">{new Date(inc.reportedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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
        <div className="animate-in fade-in">
          <CitizenRequestsTab />
        </div>
      )}

      {/* 4. RESOURCE INVENTORY TAB */}
      {activeTab === "resources" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-6 h-6 text-indigo-500" />
                Logistics & Inventory Command
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Enterprise inventory tracking, distribution logging, and low-stock alerts</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTransferResourceOpen(true)}
                className="px-4 py-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" /> Transfer Stock
              </button>

              <button
                onClick={() => setIsAddResourceOpen(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Supply Item</span>
              </button>
            </div>
          </div>

          {/* Logistics KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard 
              title="Total Inventory Items" 
              value={resources.length.toString()} 
              icon={Boxes} 
              trend={{ value: "+12% this week", isUp: true }}
              variant="indigo"
            />
            <KPICard 
              title="Low Stock Alerts" 
              value={resources.filter(r => r.stockStatus === "LOW_STOCK" || r.stockStatus === "DEPLETED" || r.stockStatus === "CRITICAL").length.toString()} 
              icon={AlertTriangle} 
              trend={{ value: "Requires attention", isUp: false }}
              variant="rose"
            />
            <KPICard 
              title="Total Distributed" 
              value={resources.reduce((acc, curr) => acc + curr.distributedQuantity, 0).toLocaleString()} 
              icon={Send} 
              trend={{ value: "Across all centers", isUp: true }}
              variant="emerald"
            />
            <KPICard 
              title="Categories Tracked" 
              value={new Set(resources.map(r => r.category)).size.toString()} 
              icon={Filter} 
              trend={{ value: "Standardized", isUp: true }}
              variant="amber"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search inventory by name, ID, or description..."
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm dark:text-white"
              />
            </div>
            <select 
              value={resourceCategoryFilter}
              onChange={(e) => setResourceCategoryFilter(e.target.value)}
              className="py-2.5 px-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-700 dark:text-slate-300 min-w-[180px]"
            >
              <option value="ALL">All Categories</option>
              <option value="FOOD_WATER">Food & Water</option>
              <option value="MEDICAL">Medical</option>
              <option value="SHELTER">Shelter</option>
              <option value="EQUIPMENT">Equipment</option>
              <option value="VEHICLE">Vehicle</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResources.map(res => {
              const occPct = Math.min(100, (res.availableQuantity / res.quantity) * 100);
              const isLow = occPct < 25;
              const isOut = occPct === 0;

              return (
                <div key={res.id} className="group relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-transparent dark:from-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  <div className="p-5 flex-1 space-y-4 relative z-10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md inline-block mb-1">{res.id}</span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base truncate">{res.name || "Unnamed Resource"}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{((res.category as string) || "").replace("_", " ")}</p>
                      </div>
                      <div className="shrink-0">
                        <StatusBadge type="stock" value={res.stockStatus} size="sm" />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-end justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Stock</span>
                          <span className={`text-2xl font-black ${isOut ? 'text-rose-600 dark:text-rose-400' : isLow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                            {res.availableQuantity} <span className="text-xs font-bold text-slate-500">{res.unit}</span>
                          </span>
                        </div>
                        <div className="text-right flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Distributed</span>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {res.distributedQuantity}
                          </span>
                        </div>
                      </div>

                      {/* Premium Stock Bar Meter */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50 relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${occPct}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`absolute top-0 left-0 h-full rounded-full ${
                            isOut ? "bg-rose-500" : isLow ? "bg-amber-500" : "bg-emerald-500"
                          } ${isLow && !isOut ? "animate-pulse" : ""}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between gap-3 relative z-20">
                    <button
                      onClick={() => updateResourceStock(res.id, -50)}
                      disabled={res.availableQuantity < 50}
                      className="flex-1 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Minus className="w-3.5 h-3.5" /> 50 {res.unit}
                    </button>
                    <button
                      onClick={() => updateResourceStock(res.id, 100)}
                      className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> 100 {res.unit}
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredResources.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <Boxes className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="font-bold text-sm">No inventory items found.</p>
                <p className="text-xs font-medium mt-1">Try adjusting your search or add a new supply item.</p>
              </div>
            )}
          </div>
        </div>

      )}

      {/* 5. EVACUATION CENTER MANAGEMENT TAB */}
      {activeTab === "evacuation" && (
        <EvacuationManagementTab />
      )}

      {/* 5.5 RESPONDER MANAGEMENT TAB */}
      {activeTab === "responders" && (
        <ResponderManagementTab />
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
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                key={rec.id}
                className={`relative overflow-hidden p-5 rounded-2xl border group flex flex-col min-h-[240px] ${
                  rec.status === "ACCEPTED"
                    ? "bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-900/10 dark:to-slate-900 border-emerald-200 dark:border-emerald-500/20 shadow-sm"
                    : rec.status === "REJECTED"
                    ? "bg-gradient-to-br from-rose-50/30 to-slate-50/30 dark:from-rose-900/5 dark:to-slate-900/10 border-rose-100 dark:border-rose-900/20 opacity-80 grayscale-[0.2]"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300/50 dark:hover:border-blue-500/30"
                }`}
              >
                {/* Top Status Bar - thinner for kanban */}
                <div className={`absolute top-0 left-0 w-full h-1 ${
                  rec.status === 'ACCEPTED' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                  rec.status === 'REJECTED' ? 'bg-gradient-to-r from-rose-400 to-rose-500' :
                  'bg-gradient-to-r from-blue-400 to-indigo-500'
                }`} />

                {/* Badges Row */}
                <div className="flex items-center justify-between mb-3">
                  <StatusBadge type="severity" value={rec.severity} size="sm" />
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 border border-blue-200/50 dark:border-blue-500/30">
                    <Activity className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-[10px] font-black text-blue-700 dark:text-blue-300">
                      {rec.impactScore} Impact
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className={`font-extrabold text-[14px] leading-snug mb-3 flex-shrink-0 ${
                  rec.status === 'REJECTED' ? 'text-slate-600 dark:text-slate-400' : 'bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent'
                }`}>
                  {rec.title}
                </h3>

                {/* Recommended Action */}
                <div className={`flex-1 text-[11px] p-3 rounded-xl border relative overflow-hidden mb-3 flex flex-col ${
                  rec.status === 'ACCEPTED' ? 'bg-emerald-50/50 border-emerald-100/50 dark:bg-emerald-900/10 dark:border-emerald-500/20 text-slate-700 dark:text-slate-300' :
                  rec.status === 'REJECTED' ? 'bg-rose-50/50 border-rose-100/50 dark:bg-rose-900/10 dark:border-rose-500/20 text-slate-500 dark:text-slate-400 line-through decoration-rose-500/50' :
                  'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  <span className={`font-extrabold uppercase tracking-wide block mb-1.5 ${
                    rec.status === 'ACCEPTED' ? 'text-emerald-600 dark:text-emerald-400' :
                    rec.status === 'REJECTED' ? 'text-rose-600 dark:text-rose-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`}>
                    {rec.status === 'ACCEPTED' ? 'Executed Action' :
                     rec.status === 'REJECTED' ? 'Dismissed Action' :
                     'Task'}
                  </span>
                  <p className="leading-relaxed">{rec.recommendedAction}</p>
                </div>

                {/* Footer Logic & Actions */}
                <div className="mt-auto flex-shrink-0">
                  <div className="mb-4">
                    <button 
                      onClick={() => setExpandedAICards(prev => ({...prev, [rec.id]: !prev[rec.id]}))}
                      className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-blue-500 flex items-center gap-1 transition-colors select-none w-full text-left"
                    >
                      <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${expandedAICards[rec.id] ? 'rotate-90 text-blue-500' : ''}`} /> 
                      AI Logic Breakdown
                    </button>
                    <AnimatePresence>
                      {expandedAICards[rec.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                          animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
                          exit={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pl-4 border-l-2 border-blue-200 dark:border-blue-900/50 space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
                            <p><span className="font-bold text-slate-800 dark:text-slate-200">Context:</span> {rec.reasoning}</p>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Confidence: 94%
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              Resource Check Verified
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {rec.status === "PENDING" && (
                    <div className="grid grid-cols-2 gap-3 relative z-10">
                      <button 
                        onClick={() => rejectAIRecommendation(rec.id)} 
                        className="flex justify-center items-center gap-1.5 py-2.5 px-4 border border-[#E2E8F0] dark:border-slate-700 rounded-xl shadow-sm text-xs font-bold text-[#64748B] dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-[#F8FAFC] dark:hover:bg-slate-700 hover:text-[#0F172A] dark:hover:text-white transition-colors active:scale-[0.98]"
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={2.5} /> Reject
                      </button>
                      <button 
                        onClick={() => acceptAIRecommendation(rec.id)} 
                        className="flex justify-center items-center gap-1.5 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-[#111827] hover:bg-[#1f2937] dark:bg-blue-600 dark:hover:bg-blue-700 hover:shadow-md transition-colors active:scale-[0.98]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} /> Execute
                      </button>
                    </div>
                  )}

                  {rec.status !== "PENDING" && (
                    <div className="mt-2 relative z-10">
                      <button 
                        onClick={() => undoAIRecommendation(rec.id)} 
                        className="w-full flex justify-center items-center gap-1.5 py-2.5 px-4 border border-[#E2E8F0] dark:border-slate-700 rounded-xl shadow-sm text-xs font-bold text-[#64748B] dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-[#F8FAFC] dark:hover:bg-slate-700 hover:text-[#0F172A] dark:hover:text-white transition-colors active:scale-[0.98]"
                      >
                        <Undo className="w-3.5 h-3.5" strokeWidth={2.5} /> Undo Action
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );

            return (
              <div className="flex-1 w-full min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden px-2 lg:px-0">
                {/* Pending Column */}
                <div className="flex flex-col bg-gradient-to-b from-slate-50/80 to-slate-100/50 dark:from-slate-800/40 dark:to-slate-900/40 backdrop-blur-md rounded-2xl p-5 border border-white/60 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-80" />
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-5 flex items-center justify-between relative z-10">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Pending Action
                    </span>
                    <span className="bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                      {aiRecommendations.filter(r => r.status === "PENDING").length}
                    </span>
                  </h3>
                  <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar relative z-10">
                    <AnimatePresence mode="popLayout">
                      {aiRecommendations.filter(r => r.status === "PENDING").map(renderAICard)}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Accepted Column */}
                <div className="flex flex-col bg-gradient-to-b from-emerald-50/60 to-emerald-100/30 dark:from-emerald-900/10 dark:to-slate-900/40 backdrop-blur-md rounded-2xl p-5 border border-emerald-100/60 dark:border-emerald-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-80" />
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-400 mb-5 flex items-center justify-between relative z-10">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Executed
                    </span>
                    <span className="bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                      {aiRecommendations.filter(r => r.status === "ACCEPTED").length}
                    </span>
                  </h3>
                  <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar relative z-10">
                    <AnimatePresence mode="popLayout">
                      {aiRecommendations.filter(r => r.status === "ACCEPTED").map(renderAICard)}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Rejected Column */}
                <div className="flex flex-col bg-gradient-to-b from-rose-50/60 to-rose-100/30 dark:from-rose-900/10 dark:to-slate-900/40 backdrop-blur-md rounded-2xl p-5 border border-rose-100/60 dark:border-rose-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-pink-500 opacity-80" />
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-400/10 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <h3 className="text-xs font-black uppercase tracking-widest text-rose-800 dark:text-rose-400 mb-5 flex items-center justify-between relative z-10">
                    <span className="flex items-center gap-2">
                      <X className="w-4 h-4 text-rose-500" />
                      Rejected
                    </span>
                    <span className="bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-400 shadow-sm border border-rose-100 dark:border-rose-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                      {aiRecommendations.filter(r => r.status === "REJECTED").length}
                    </span>
                  </h3>
                  <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar relative z-10">
                    <AnimatePresence mode="popLayout">
                      {aiRecommendations.filter(r => r.status === "REJECTED").map(renderAICard)}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}



      {/* 8. ANALYTICS & REPORTS TAB */}
      {activeTab === "reports" && (
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="reports-skeleton"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="space-y-6 animate-in fade-in"
            >
              <div className="space-y-2">
                <div className="h-7 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                <div className="h-4 w-72 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-[236px] rounded-3xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="reports-content"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="space-y-6 animate-in fade-in"
            >
          <div>
            <h2 className="text-xl font-black text-slate-900">Reports</h2>
            <p className="text-xs text-slate-500 mt-0.5">Export platform data and download systemic reports</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Incidents Report */}
            <div className="group bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col items-center text-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center gap-3 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">Disaster Incidents Export</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed px-2">Download a comprehensive report of all disaster incidents and statuses.</p>
                </div>
              </div>
              <button 
                onClick={() => openExportModal('incidents')}
                className="relative z-10 px-5 py-2.5 flex items-center justify-center gap-2 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors w-full mt-2"
              >
                <Download className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                Export Report
              </button>
            </div>

            {/* LGUs Report */}
            <div className="group bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col items-center text-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center gap-3 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">LGU Registry Export</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed px-2">Download data on all registered Local Government Units (LGUs) and regions.</p>
                </div>
              </div>
              <button 
                onClick={() => openExportModal('lgus')}
                className="relative z-10 px-5 py-2.5 flex items-center justify-center gap-2 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors w-full mt-2"
              >
                <Download className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                Export Report
              </button>
            </div>
            
            {/* User Registry Report */}
            <div className="group bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col items-center text-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center gap-3 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">User Registry Export</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed px-2">Download a complete CSV of all registered users across the platform.</p>
                </div>
              </div>
              <button 
                onClick={() => openExportModal('users')}
                className="relative z-10 px-5 py-2.5 flex items-center justify-center gap-2 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors w-full mt-2"
              >
                <Download className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                Export Report
              </button>
            </div>

            {/* Audit Trail Report */}
            <div className="group bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col items-center text-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center gap-3 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">Audit Trail Export</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed px-2">Download system security logs, admin actions, and modifications.</p>
                </div>
              </div>
              <button 
                onClick={() => openExportModal('logs')}
                className="relative z-10 px-5 py-2.5 flex items-center justify-center gap-2 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors w-full mt-2"
              >
                <Download className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                Export Report
              </button>
            </div>

          </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <Modal
        isOpen={exportModalState.isOpen}
        onClose={() => setExportModalState({ isOpen: false, type: null, dataPreview: [] })}
        title={`Export Preview: ${exportModalState.type === 'users' ? 'User Registry' : exportModalState.type === 'logs' ? 'Audit Trail' : exportModalState.type === 'incidents' ? 'Disaster Incidents' : 'LGU Registry'}`}
        subtitle="Review the data preview before downloading"
        maxWidth="4xl"
      >
        <div className="flex flex-col h-[65vh] min-h-[500px]">
          <div className="flex-1 overflow-auto border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 sticky top-0 z-10 shadow-sm">
                <tr>
                  {Object.keys(exportModalState.dataPreview[0] || {}).map(key => (
                    <th key={key} className="p-4 font-semibold">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {exportModalState.dataPreview.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="p-4 text-slate-700 dark:text-slate-300">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-slate-500 italic mt-3 mb-4 shrink-0">Showing up to 50 records as preview.</div>
          
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <button 
              onClick={() => handleExport('xlsx')}
              className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-100 rounded-xl text-sm font-bold transition-colors"
            >
              Download Excel (.xlsx)
            </button>
            <button 
              onClick={() => handleExport('csv')}
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-xl text-sm font-bold transition-colors"
            >
              Download CSV
            </button>
          </div>
        </div>
      </Modal>

      {/* Select Pin Type Modal */}
      <Modal isOpen={pendingPinLocation !== null} onClose={() => setPendingPinLocation(null)} title="Select Pin Type">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4">
          <button
            onClick={() => {
              if (pendingPinLocation) setNewIncData(prev => ({ ...prev, lat: pendingPinLocation.lat, lng: pendingPinLocation.lng }));
              setPendingPinLocation(null);
              setIsNewIncidentOpen(true);
            }}
            className="flex flex-col items-center justify-center p-5 border border-slate-200 rounded-2xl hover:border-rose-500 hover:bg-rose-50 transition-all gap-4 group shadow-sm hover:shadow-md"
          >
            <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <span className="text-sm font-extrabold text-slate-800">Incident</span>
          </button>

          <button
            onClick={() => {
              if (pendingPinLocation) setNewEvacCenterData(prev => ({ ...prev, lat: pendingPinLocation.lat, lng: pendingPinLocation.lng }));
              setPendingPinLocation(null);
              setIsNewEvacCenterOpen(true);
            }}
            className="flex flex-col items-center justify-center p-5 border border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all gap-4 group shadow-sm hover:shadow-md"
          >
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
              <Home className="w-7 h-7" />
            </div>
            <span className="text-sm font-extrabold text-slate-800 text-center">Evacuation Center</span>
          </button>

          <button
            onClick={() => {
              if (pendingPinLocation) setNewResponderData(prev => ({ ...prev, lat: pendingPinLocation.lat, lng: pendingPinLocation.lng }));
              setPendingPinLocation(null);
              setIsNewResponderOpen(true);
            }}
            className="flex flex-col items-center justify-center p-5 border border-slate-200 rounded-2xl hover:border-amber-500 hover:bg-amber-50 transition-all gap-4 group shadow-sm hover:shadow-md"
          >
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
              <Users2 className="w-7 h-7" />
            </div>
            <span className="text-sm font-extrabold text-slate-800">Field Unit</span>
          </button>
        </div>
      </Modal>

      {/* Modal 1: Report Incident Form */}
      <Modal isOpen={isNewIncidentOpen} onClose={() => setIsNewIncidentOpen(false)} title="Report New Field Incident" maxWidth="2xl">
        <form onSubmit={handleNewIncidentSubmit} className="flex flex-col gap-5">
          {/* Details Section */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-500" /> Incident Details
            </h4>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Incident Title</label>
              <input
                type="text"
                required
                value={newIncData.title}
                onChange={e => setNewIncData({ ...newIncData, title: e.target.value })}
                placeholder="e.g., Trapped Rooftop Residents - Flood Sector 4"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative z-50">
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <div className="relative">
                  <Activity className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 transition-colors ${isIncidentTypeDropdownOpen ? 'text-blue-500' : 'text-[#94A3B8]'}`} />
                  
                  <button
                    type="button"
                    onClick={() => setIsIncidentTypeDropdownOpen(!isIncidentTypeDropdownOpen)}
                    className="block w-full pl-10 pr-10 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all text-left text-[#0F172A]"
                  >
                    {
                      [
                        { value: "FLOOD", label: "Flood" },
                        { value: "LANDSLIDE", label: "Landslide" },
                        { value: "FIRE", label: "Fire" },
                        { value: "STRUCTURE_COLLAPSE", label: "Structural Collapse" },
                        { value: "MEDICAL", label: "Medical" }
                      ].find(opt => opt.value === newIncData.type)?.label || "Select Category"
                    }
                  </button>

                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none z-10">
                    <motion.svg 
                      animate={{ rotate: isIncidentTypeDropdownOpen ? 180 : 0 }}
                      className="h-4 w-4 text-[#94A3B8]" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </div>

                  <AnimatePresence>
                    {isIncidentTypeDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md border border-[#E2E8F0]/80 rounded-xl shadow-xl z-50 overflow-hidden"
                      >
                        {[
                          { value: "FLOOD", label: "Flood" },
                          { value: "LANDSLIDE", label: "Landslide" },
                          { value: "FIRE", label: "Fire" },
                          { value: "STRUCTURE_COLLAPSE", label: "Structural Collapse" },
                          { value: "MEDICAL", label: "Medical" }
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setNewIncData({ ...newIncData, type: option.value as IncidentType });
                              setIsIncidentTypeDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-[#F8FAFC]/50 transition-colors ${newIncData.type === option.value ? 'bg-[#EFF6FF] text-[#3b82f6]' : 'text-[#0F172A]'}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="relative z-40">
                <label className="block text-xs font-bold text-slate-700 mb-1">Severity Level</label>
                <div className="relative">
                  <AlertTriangle className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 transition-colors ${isIncidentSeverityDropdownOpen ? 'text-rose-500' : 'text-[#94A3B8]'}`} />
                  
                  <button
                    type="button"
                    onClick={() => setIsIncidentSeverityDropdownOpen(!isIncidentSeverityDropdownOpen)}
                    className="block w-full pl-10 pr-10 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all text-left text-[#0F172A]"
                  >
                    {
                      [
                        { value: "CRITICAL", label: "Critical" },
                        { value: "HIGH", label: "High" },
                        { value: "MEDIUM", label: "Medium" },
                        { value: "LOW", label: "Low" }
                      ].find(opt => opt.value === newIncData.severity)?.label || "Select Severity"
                    }
                  </button>

                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none z-10">
                    <motion.svg 
                      animate={{ rotate: isIncidentSeverityDropdownOpen ? 180 : 0 }}
                      className="h-4 w-4 text-[#94A3B8]" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </div>

                  <AnimatePresence>
                    {isIncidentSeverityDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md border border-[#E2E8F0]/80 rounded-xl shadow-xl z-50 overflow-hidden"
                      >
                        {[
                          { value: "CRITICAL", label: "Critical" },
                          { value: "HIGH", label: "High" },
                          { value: "MEDIUM", label: "Medium" },
                          { value: "LOW", label: "Low" }
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setNewIncData({ ...newIncData, severity: option.value as IncidentSeverity });
                              setIsIncidentSeverityDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-[#F8FAFC]/50 transition-colors ${newIncData.severity === option.value ? 'bg-[#EFF6FF] text-[#3b82f6]' : 'text-[#0F172A]'}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Est. Affected</label>
                <div className="relative group">
                  <Users2 className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 group-hover:text-blue-500 transition-colors pointer-events-none z-10" />
                  <input
                    type="number"
                    min="1"
                    value={newIncData.affectedCount}
                    onChange={e => setNewIncData({ ...newIncData, affectedCount: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#0F172A] font-medium rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                required
                rows={2}
                value={newIncData.description}
                onChange={e => setNewIncData({ ...newIncData, description: e.target.value })}
                placeholder="Provide specific details about the incident..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#0F172A] font-medium rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all resize-none"
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-rose-500" /> Location Data
            </h4>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Barangay / Landmark</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={newIncData.locationName}
                  onChange={e => setNewIncData({ ...newIncData, locationName: e.target.value, barangay: e.target.value })}
                  placeholder="e.g. Pauli 2, Rizal"
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={newIncData.lat || ""}
                  onChange={e => setNewIncData({ ...newIncData, lat: parseFloat(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={newIncData.lng || ""}
                  onChange={e => setNewIncData({ ...newIncData, lng: parseFloat(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>
            
            <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> You can click on the tactical map to auto-fill GPS coordinates.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 mt-2">
            <button type="button" onClick={() => setIsNewIncidentOpen(false)} className="px-5 py-2.5 flex justify-center items-center gap-1.5 border border-[#E2E8F0] dark:border-slate-700 rounded-xl shadow-sm text-sm font-bold text-[#64748B] dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-[#F8FAFC] dark:hover:bg-slate-700 hover:text-[#0F172A] dark:hover:text-white transition-colors active:scale-[0.98]">Cancel</button>
            <button type="submit" className="px-5 py-2.5 flex justify-center items-center gap-2 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#111827] hover:bg-[#1f2937] hover:shadow-md transition-colors active:scale-[0.98]">
              <Send className="w-4 h-4" /> Submit Report
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: New Evacuation Center Form */}
      <Modal isOpen={isNewEvacCenterOpen} onClose={() => setIsNewEvacCenterOpen(false)} title="Register Evacuation Center" maxWidth="2xl">
        <form onSubmit={handleNewEvacCenterSubmit} className="flex flex-col gap-5">
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-2">
              <Home className="w-4 h-4 text-blue-500" /> Center Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Center Name</label>
                <input required type="text" value={newEvacCenterData.name || ""} onChange={(e) => setNewEvacCenterData({ ...newEvacCenterData, name: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" placeholder="e.g. San Jose Elementary School" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Address / Location Name</label>
                <input required type="text" value={newEvacCenterData.address || ""} onChange={(e) => setNewEvacCenterData({ ...newEvacCenterData, address: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" placeholder="e.g. Main St., Brgy San Jose" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Capacity</label>
                <input required type="number" value={newEvacCenterData.capacity || ""} onChange={(e) => setNewEvacCenterData({ ...newEvacCenterData, capacity: parseInt(e.target.value) })} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" placeholder="0" min="1" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Current Occupants</label>
                <input required type="number" value={newEvacCenterData.currentOccupants || 0} onChange={(e) => setNewEvacCenterData({ ...newEvacCenterData, currentOccupants: parseInt(e.target.value) })} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" placeholder="0" min="0" />
              </div>
            </div>
          </div>

          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-2">
              <Users2 className="w-4 h-4 text-blue-500" /> Contact Info
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Contact Person</label>
                <input required type="text" value={newEvacCenterData.contactPerson || ""} onChange={(e) => setNewEvacCenterData({ ...newEvacCenterData, contactPerson: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" placeholder="e.g. Juan Dela Cruz" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Phone Number</label>
                <input required type="text" value={newEvacCenterData.contactPhone || ""} onChange={(e) => setNewEvacCenterData({ ...newEvacCenterData, contactPhone: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" placeholder="09XX XXX XXXX" />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 mt-2">
            <button type="button" onClick={() => setIsNewEvacCenterOpen(false)} className="px-5 py-2.5 flex justify-center items-center gap-1.5 border border-[#E2E8F0] dark:border-slate-700 rounded-xl shadow-sm text-sm font-bold text-[#64748B] dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-[#F8FAFC] dark:hover:bg-slate-700 hover:text-[#0F172A] dark:hover:text-white transition-colors active:scale-[0.98]">Cancel</button>
            <button type="submit" className="px-5 py-2.5 flex justify-center items-center gap-2 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#111827] hover:bg-[#1f2937] hover:shadow-md transition-colors active:scale-[0.98]">
              <Home className="w-4 h-4" /> Add Center
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: New Responder Form */}
      <Modal isOpen={isNewResponderOpen} onClose={() => setIsNewResponderOpen(false)} title="Deploy Field Unit" maxWidth="2xl">
        <form onSubmit={handleNewResponderSubmit} className="flex flex-col gap-5">
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-2">
              <Users2 className="w-4 h-4 text-amber-500" /> Unit Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Team Name</label>
                <input required type="text" value={newResponderData.name || ""} onChange={(e) => setNewResponderData({ ...newResponderData, name: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium" placeholder="e.g. Alpha Rescue Team" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Code Name</label>
                <input required type="text" value={newResponderData.codeName || ""} onChange={(e) => setNewResponderData({ ...newResponderData, codeName: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium" placeholder="e.g. ALPHA-1" />
              </div>
              
              <div className="space-y-1.5 sm:col-span-2 relative z-50">
                <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  Unit Type
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUnitTypeDropdownOpen(!isUnitTypeDropdownOpen)}
                    className="block w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-left text-slate-700 shadow-sm"
                  >
                    {
                      [
                        { value: "DISASTER_RESPONSE_TEAM", label: "Disaster Response" },
                        { value: "PARAMEDIC", label: "Paramedic" },
                        { value: "FIRE_RESCUE", label: "Fire Rescue" },
                        { value: "POLICE_ENFORCEMENT", label: "Police" }
                      ].find(opt => opt.value === (newResponderData.roleType || "DISASTER_RESPONSE_TEAM"))?.label
                    }
                  </button>

                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none z-10">
                    <motion.svg 
                      animate={{ rotate: isUnitTypeDropdownOpen ? 180 : 0 }}
                      className="h-4 w-4 text-slate-400" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </div>

                  <AnimatePresence>
                    {isUnitTypeDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md border border-[#E2E8F0]/80 rounded-xl shadow-xl z-50 overflow-hidden"
                      >
                        {[
                          { value: "DISASTER_RESPONSE_TEAM", label: "Disaster Response" },
                          { value: "PARAMEDIC", label: "Paramedic" },
                          { value: "FIRE_RESCUE", label: "Fire Rescue" },
                          { value: "POLICE_ENFORCEMENT", label: "Police" }
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setNewResponderData({ ...newResponderData, roleType: option.value as Responder["roleType"] });
                              setIsUnitTypeDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50 transition-colors ${(newResponderData.roleType || "DISASTER_RESPONSE_TEAM") === option.value ? 'bg-amber-50 text-amber-600' : 'text-slate-700'}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Phone / Radio Freq</label>
                <input required type="text" value={newResponderData.phone || ""} onChange={(e) => setNewResponderData({ ...newResponderData, phone: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium" placeholder="09XX or VHF Channel" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Team Size</label>
                <input required type="number" value={newResponderData.teamSize || 1} onChange={(e) => setNewResponderData({ ...newResponderData, teamSize: parseInt(e.target.value) })} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium" placeholder="1" min="1" />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 mt-2">
            <button type="button" onClick={() => setIsNewResponderOpen(false)} className="px-5 py-2.5 flex justify-center items-center gap-1.5 border border-[#E2E8F0] dark:border-slate-700 rounded-xl shadow-sm text-sm font-bold text-[#64748B] dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-[#F8FAFC] dark:hover:bg-slate-700 hover:text-[#0F172A] dark:hover:text-white transition-colors active:scale-[0.98]">Cancel</button>
            <button type="submit" className="px-5 py-2.5 flex justify-center items-center gap-2 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#111827] hover:bg-[#1f2937] hover:shadow-md transition-colors active:scale-[0.98]">
              <Users2 className="w-4 h-4" /> Deploy Unit
            </button>
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
            <button type="button" onClick={() => setIsAddResourceOpen(false)} className="px-4 py-2.5 flex justify-center items-center gap-1.5 border border-[#E2E8F0] dark:border-slate-700 rounded-xl shadow-sm text-xs font-bold text-[#64748B] dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-[#F8FAFC] dark:hover:bg-slate-700 hover:text-[#0F172A] dark:hover:text-white transition-colors active:scale-[0.98]">Cancel</button>
            <button type="submit" className="px-4 py-2.5 flex justify-center items-center gap-1.5 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-[#111827] hover:bg-[#1f2937] hover:shadow-md transition-colors active:scale-[0.98]">Add Supply Item</button>
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
            <button type="button" onClick={() => setIsTransferResourceOpen(false)} className="px-4 py-2.5 flex justify-center items-center gap-1.5 border border-[#E2E8F0] dark:border-slate-700 rounded-xl shadow-sm text-xs font-bold text-[#64748B] dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-[#F8FAFC] dark:hover:bg-slate-700 hover:text-[#0F172A] dark:hover:text-white transition-colors active:scale-[0.98]">Cancel</button>
            <button type="submit" className="px-4 py-2.5 flex justify-center items-center gap-1.5 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-[#111827] hover:bg-[#1f2937] hover:shadow-md transition-colors active:scale-[0.98]">Authorize Transfer</button>
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
      </div>
    </div>
  );
};
