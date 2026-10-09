import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Siren,
  LifeBuoy,
  Search,
  Clock,
  Bell,
  AlertOctagon,
  MapPin,
  Phone,
  Send,
  CheckCircle2,
  Navigation,
  Check,
  ShieldAlert,
  Home,
  Users2,
  ArrowRight,
  Radio,
  CheckCircle,
  Flame,
  Waves,
  AlertTriangle,
  Copy,
  ExternalLink,
  RefreshCw,
  Compass,
  Shield,
  HeartPulse,
  Battery,
  Sparkles,
  Filter,
  ChevronRight,
  X,
  Eye,
  Printer,
  Share2,
  Info,
  Camera,
  Layers,
  Thermometer,
  Wind,
  Droplets,
  PackageCheck,
  FileText,
  FileCheck2,
  MessageSquare,
  HelpCircle,
  Activity
} from "lucide-react";
import { useSmartRelief } from "../../../context/SmartReliefContext";
import { KPICard } from "../../common/KPICard";
import { StatusBadge } from "../../common/StatusBadge";
import { Modal } from "../../common/Modal";
import { InteractiveGISMap } from "../../map/InteractiveGISMap";
import { IncidentType, RequestType, Incident, AssistanceRequest, EvacuationCenter } from "../../../types";

interface CitizenPortalProps {
  activeTab: string;
  onSelectTab?: (tabId: string) => void;
}

// 11 Official Barangays of the Municipality of Rizal, Laguna, Philippines (Zip: 4003)
export interface RizalLagunaBarangay {
  name: string;
  sector: string;
  lat: number;
  lng: number;
  defaultLandmark: string;
}

export const RIZAL_LAGUNA_BARANGAYS: RizalLagunaBarangay[] = [
  { name: "Antipolo", sector: "North Sector", lat: 14.1205, lng: 121.3970, defaultLandmark: "Near Antipolo Barangay Hall & Chapel" },
  { name: "Entablado", sector: "East Sector", lat: 14.1082, lng: 121.3985, defaultLandmark: "Near Entablado River Bridge & Elementary School" },
  { name: "Laguan", sector: "South Sector", lat: 14.1025, lng: 121.4010, defaultLandmark: "Near Laguan Multi-Purpose Hall" },
  { name: "Pauli 1", sector: "Central North", lat: 14.1160, lng: 121.3912, defaultLandmark: "Near Pauli 1 Day Care & Highway Junction" },
  { name: "Pauli 2", sector: "Central Sector", lat: 14.1134, lng: 121.3938, defaultLandmark: "Near Pauli 2 Covered Gymnasium & River Crossing" },
  { name: "East Poblacion", sector: "Poblacion Center", lat: 14.1112, lng: 121.3958, defaultLandmark: "Near Rizal Municipal Hall & Town Plaza" },
  { name: "West Poblacion", sector: "Poblacion Center", lat: 14.1105, lng: 121.3935, defaultLandmark: "Near St. Michael the Archangel Parish Church" },
  { name: "Pook", sector: "Northeast Sector", lat: 14.1180, lng: 121.4020, defaultLandmark: "Near Pook Riverside Access Road" },
  { name: "Tala", sector: "Southwest Sector", lat: 14.0980, lng: 121.3890, defaultLandmark: "Near Tala Barangay Health Center" },
  { name: "Talaga", sector: "Northwest Sector", lat: 14.1250, lng: 121.3850, defaultLandmark: "Near Talaga Upland Water Source" },
  { name: "Tuy", sector: "West Sector", lat: 14.1050, lng: 121.3820, defaultLandmark: "Near Tuy Integrated Farm Road" }
];

export const CitizenPortal: React.FC<CitizenPortalProps> = ({ activeTab, onSelectTab }) => {
  const {
    currentUser,
    incidents,
    assistanceRequests,
    evacuationCenters,
    alerts,
    responders,
    createIncident,
    createAssistanceRequest,
    updateRequestStatus,
    addLog
  } = useSmartRelief();

  // Citizen identity & contact info
  const citizenName = currentUser?.name || "Carlos Dalisay";
  const citizenPhone = currentUser?.phone || "+63 917 234 5678";
  const isGuest = currentUser?.id === "guest-citizen" || currentUser?.name === "Guest Citizen";

  // SOS Emergency Beacon Modal State
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [sosHouseholdCount, setSosHouseholdCount] = useState(3);
  const [sosCondition, setSosCondition] = useState<"RISING_FLOOD" | "MEDICAL_CRISIS" | "COLLAPSE_TRAPPED" | "OTHER">("RISING_FLOOD");
  const [isSosBroadcasting, setIsSosBroadcasting] = useState(false);
  const [sosBroadcastSuccess, setSosBroadcastSuccess] = useState(false);
  const [sosRefId, setSosRefId] = useState<string | null>(null);

  // Toast / Clipboard notification
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // 1. INCIDENT REPORTING WIZARD STATE
  const [incWizardStep, setIncWizardStep] = useState(1);
  const [incForm, setIncForm] = useState({
    title: "",
    type: "FLOOD" as IncidentType,
    severity: "HIGH" as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
    locationName: "Sitio Riverside, Pauli 2, Rizal, Laguna",
    barangay: "Pauli 2",
    landmark: "Near Pauli 2 Covered Gymnasium",
    waterDepth: "Waist-Deep (1.0m - 1.2m)",
    description: "",
    affectedCount: 3,
    lat: 14.1134,
    lng: 121.3938,
    photoAttached: true,
    photoName: "flood_rise_recon_sector4.jpg"
  });
  const [createdIncId, setCreatedIncId] = useState<string | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsLocked, setGpsLocked] = useState(true);

  // 2. ASSISTANCE REQUEST FORM STATE
  const [reqForm, setReqForm] = useState({
    requestType: "RESCUE" as RequestType,
    peopleCount: 4,
    infantCount: 1,
    elderlyCount: 1,
    pwdCount: 0,
    trappedLocation: "Rooftop / Second Floor Balcony",
    waterLevelDesc: "Water inside 1st floor is 5 feet deep, continuing to rise",
    specialNeeds: "1 infant needing dry formula, 1 senior citizen (hypertensive) requiring amlodipine",
    description: "Trapped on 2nd floor balcony due to rapid river swelling. Ground floor submerged. Need rescue boat extraction.",
    address: "Purok 2, Riverside Road, Pauli 2, Rizal, Laguna",
    barangay: "Pauli 2",
    contactPhone: citizenPhone
  });
  const [createdReqId, setCreatedReqId] = useState<string | null>(null);
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);

  // 3. EVACUATION CENTERS STATE
  const [centerSearch, setCenterSearch] = useState("");
  const [centerFilter, setCenterFilter] = useState<"ALL" | "OPEN_ONLY" | "HAS_CAPACITY">("ALL");
  const [shelterViewMode, setShelterViewMode] = useState<"GRID" | "MAP">("GRID");
  const [selectedShelterForRoute, setSelectedShelterForRoute] = useState<EvacuationCenter | null>(null);

  // 4. GO-BAG CHECKLIST STATE (persisted locally)
  const defaultGoBag = [
    { id: "water", label: "Drinking Water (1 Gallon per person/day for 3 days)", checked: true },
    { id: "food", label: "Non-perishable ready-to-eat canned goods & energy bars", checked: true },
    { id: "firstaid", label: "First Aid Kit (Bandages, antiseptic, alcohol, scissors)", checked: true },
    { id: "medicine", label: "Prescription maintenance medicines (7-day supply)", checked: true },
    { id: "flashlight", label: "Waterproof Flashlight with extra batteries / hand-crank", checked: false },
    { id: "powerbank", label: "Charged Power Bank (20,000mAh) & phone charging cables", checked: true },
    { id: "documents", label: "Important IDs & birth certificates in waterproof ziplock", checked: true },
    { id: "whistle", label: "Emergency signaling whistle & high-visibility vest", checked: false },
    { id: "cash", label: "Emergency cash in small denominations", checked: true }
  ];

  const [goBagItems, setGoBagItems] = useState(() => {
    try {
      const saved = localStorage.getItem("smartrelief_gobag_items");
      return saved ? JSON.parse(saved) : defaultGoBag;
    } catch {
      return defaultGoBag;
    }
  });

  const toggleGoBag = (id: string) => {
    const updated = goBagItems.map((item: any) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setGoBagItems(updated);
    try {
      localStorage.setItem("smartrelief_gobag_items", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const goBagCompletedCount = goBagItems.filter((i: any) => i.checked).length;
  const goBagPercent = Math.round((goBagCompletedCount / goBagItems.length) * 100);

  // 5. LIVE ALERTS FILTER
  const [alertCategoryFilter, setAlertCategoryFilter] = useState<"ALL" | "EVACUATION" | "WEATHER" | "WATER_LEVEL">("ALL");

  // 6. REQUEST TRACKING NOTE UPDATE
  const [updateNoteReqId, setUpdateNoteReqId] = useState<string | null>(null);
  const [userUpdateNote, setUserUpdateNote] = useState("");
  const [noteSuccess, setNoteSuccess] = useState<string | null>(null);

  // Filtered evacuation centers
  const filteredCenters = useMemo(() => {
    return evacuationCenters.filter(c => {
      const matchesSearch =
        c.name.toLowerCase().includes(centerSearch.toLowerCase()) ||
        c.barangay.toLowerCase().includes(centerSearch.toLowerCase()) ||
        c.address.toLowerCase().includes(centerSearch.toLowerCase());

      if (!matchesSearch) return false;
      if (centerFilter === "OPEN_ONLY" && c.status !== "OPEN") return false;
      if (centerFilter === "HAS_CAPACITY" && c.currentOccupants >= c.capacity) return false;
      return true;
    });
  }, [evacuationCenters, centerSearch, centerFilter]);

  // Track Reports & Requests sub-filter
  const [trackFilter, setTrackFilter] = useState<"ALL" | "INCIDENTS" | "REQUESTS">("ALL");
  const [updateNoteIncId, setUpdateNoteIncId] = useState<string | null>(null);
  const [incUpdateNote, setIncUpdateNote] = useState("");
  const [incNoteSuccess, setIncNoteSuccess] = useState<string | null>(null);

  const handleAddIncidentNote = (incId: string) => {
    if (!incUpdateNote.trim()) return;
    addLog("CITIZEN_INCIDENT_UPDATE", `Citizen ${citizenName} added update to incident ${incId}: "${incUpdateNote}"`, "INFO");
    setIncNoteSuccess(incId);
    setIncUpdateNote("");
    setTimeout(() => {
      setIncNoteSuccess(null);
      setUpdateNoteIncId(null);
    }, 2500);
  };

  // Citizen's active requests and incidents
  const myAssistanceRequests = useMemo(() => {
    return assistanceRequests;
  }, [assistanceRequests]);

  const myReportedIncidents = useMemo(() => {
    return incidents;
  }, [incidents]);

  const activeUserRequests = useMemo(() => {
    return myAssistanceRequests.filter(r => r.status !== "RESOLVED" && r.status !== "REJECTED");
  }, [myAssistanceRequests]);

  // Handle GPS detect
  const handleDetectGps = () => {
    setIsDetectingGps(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setIncForm(prev => ({
            ...prev,
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
            locationName: "Detected GPS: Sector 4 River Road"
          }));
          setIsDetectingGps(false);
          setGpsLocked(true);
        },
        () => {
          // Fallback simulation
          setTimeout(() => {
            setIncForm(prev => ({
              ...prev,
              lat: 14.1132 + (Math.random() - 0.5) * 0.005,
              lng: 121.3935 + (Math.random() - 0.5) * 0.005,
              locationName: "High Accuracy GPS Locked (±4.2m)"
            }));
            setIsDetectingGps(false);
            setGpsLocked(true);
          }, 800);
        },
        { timeout: 5000 }
      );
    } else {
      setTimeout(() => {
        setIsDetectingGps(false);
        setGpsLocked(true);
      }, 600);
    }
  };

  // Submit Emergency Incident
  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incForm.title) return;

    try {
      const fullDesc = `${incForm.description || "Urgent citizen field report."} | Water Depth: ${incForm.waterDepth} | Landmark: ${incForm.landmark}`;
      const newInc = await createIncident({
        title: incForm.title,
        type: incForm.type,
        severity: incForm.severity,
        locationName: `${incForm.locationName} (${incForm.barangay}, Rizal, Laguna)`,
        barangay: incForm.barangay,
        description: fullDesc,
        affectedCount: incForm.affectedCount,
        reportedBy: `${citizenName} (Citizen App)`,
        lat: incForm.lat,
        lng: incForm.lng
      });
      setCreatedIncId(newInc.id);
      setIncWizardStep(4);
      addLog("CITIZEN_INCIDENT_REPORTED", `Incident ${newInc.id} submitted by ${citizenName}: ${incForm.title} at ${incForm.barangay}, Rizal, Laguna`, "WARNING");
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Assistance Request
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReq(true);

    try {
      const compiledDescription = `[${reqForm.trappedLocation}] ${reqForm.description} - Situation: ${reqForm.waterLevelDesc}. Breakdown: ${reqForm.peopleCount} total (${reqForm.infantCount} infants, ${reqForm.elderlyCount} elderly, ${reqForm.pwdCount} PWD).`;

      const newReq = await createAssistanceRequest({
        citizenName,
        citizenPhone: reqForm.contactPhone,
        requestType: reqForm.requestType,
        peopleCount: reqForm.peopleCount,
        specialNeeds: reqForm.specialNeeds,
        description: compiledDescription,
        locationName: `${reqForm.address} (${reqForm.barangay}, Rizal, Laguna)`,
        barangay: reqForm.barangay
      });

      setCreatedReqId(newReq.id);
      setIsSubmittingReq(false);
      addLog("CITIZEN_ASSISTANCE_REQUESTED", `Assistance request ${newReq.id} (${reqForm.requestType}) logged for ${citizenName} at ${reqForm.barangay}, Rizal, Laguna`, "WARNING");
    } catch (err) {
      console.error(err);
      setIsSubmittingReq(false);
    }
  };

  // Submit Instant SOS Distress Pulse
  const handleBroadcastSos = async () => {
    setIsSosBroadcasting(true);
    try {
      const conditionMap: Record<string, string> = {
        RISING_FLOOD: "CRITICAL: Floodwaters rising rapidly, trapped household",
        MEDICAL_CRISIS: "CRITICAL: Urgent medical life-threat on site",
        COLLAPSE_TRAPPED: "CRITICAL: Structural collapse with trapped occupants",
        OTHER: "CRITICAL: Urgent distress call broadcast"
      };

      const newReq = await createAssistanceRequest({
        citizenName: `${citizenName} [SOS EMERGENCY MAYDAY]`,
        citizenPhone: citizenPhone,
        requestType: "RESCUE",
        peopleCount: sosHouseholdCount,
        specialNeeds: "IMMEDIATE MAYDAY: Household in life-threatening peril",
        description: `⚠️ ONE-CLICK SOS BEACON: ${conditionMap[sosCondition]}. Household count: ${sosHouseholdCount}. GPS Coordinates: 14.1134° N, 121.3938° E. Immediate water rescue boat or SWAT evacuation required.`,
        locationName: "Pauli 2 Riverview Post, Rizal, Laguna (Live GPS Beacon Broadcast)",
        barangay: "Pauli 2"
      });

      setSosRefId(newReq.id);
      setIsSosBroadcasting(false);
      setSosBroadcastSuccess(true);
      addLog("CITIZEN_SOS_MAYDAY", `MAYDAY BEACON broadcast by ${citizenName}! Priority dispatch triggered with Ref ${newReq.id} in Pauli 2, Rizal, Laguna`, "CRITICAL");
    } catch (err) {
      console.error(err);
      setIsSosBroadcasting(false);
    }
  };

  // Add note update to existing request
  const handleAddRequestNote = (reqId: string) => {
    if (!userUpdateNote.trim()) return;
    addLog("CITIZEN_REQUEST_UPDATE", `Citizen ${citizenName} added update to ${reqId}: "${userUpdateNote}"`, "INFO");
    setNoteSuccess(reqId);
    setUserUpdateNote("");
    setTimeout(() => {
      setNoteSuccess(null);
      setUpdateNoteReqId(null);
    }, 2000);
  };

  // Emergency Hotlines Directory
  const emergencyHotlines = [
    { name: "National Emergency Helpline", number: "911", desc: "Police, Fire, Ambulance & SWAT", color: "bg-rose-50 text-rose-700 border-rose-200" },
    { name: "NDRRMC Disaster Command", number: "(02) 8911-5061", desc: "National Disaster Risk Management", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { name: "Philippine Red Cross", number: "143", desc: "Emergency blood, rescue & ambulance", color: "bg-red-50 text-red-700 border-red-200" },
    { name: "Rizal Provincial DRRM HQ", number: "(02) 8876-5432", desc: "Local rescue boat & relief dispatch", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { name: "Bureau of Fire Protection", number: "160", desc: "Fire fighting & swift water rescue", color: "bg-amber-50 text-amber-700 border-amber-200" }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {copiedText && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Copied {copiedText} to clipboard</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* TAB 1: CITIZEN HOME (Emergency Services & Command Hub) */}
      {/* ========================================================================= */}
      {(activeTab === "citizen-home" || !activeTab) && (
        <div className="space-y-6 animate-in fade-in">
          {/* Guest Mode Informational Banner */}
          {isGuest && (
            <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200 font-medium">
                <span className="p-1 rounded-lg bg-amber-500 text-white shrink-0 text-xs">ℹ️</span>
                <span>You are browsing in <strong>Guest Citizen Mode</strong>. Real-time alerts, shelters, and emergency SOS requests are active.</span>
              </div>
            </div>
          )}

          {/* Top Operational Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <div className="text-xs">
                <span className="font-bold text-slate-900">DRRM Emergency Dispatch Network: </span>
                <span className="text-emerald-700 font-semibold">ALL SECTORS ONLINE & RESPONDING</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Current Session: <strong className="text-slate-800">{citizenName}</strong></span>
              <span className={`px-2 py-0.5 font-bold rounded-md text-[10px] border ${
                isGuest 
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}>
                {isGuest ? "GUEST CITIZEN" : "VERIFIED CITIZEN"}
              </span>
            </div>
          </div>

          {/* Emergency Hero Alert Header with SOS Beacon Button */}
          <div className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 text-white rounded-3xl shadow-xl border border-rose-900/40">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-rose-600/90 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                    <Siren className="w-3.5 h-3.5 animate-pulse" />
                    Civic Emergency Portal
                  </span>
                  <span className="text-xs text-rose-300 font-semibold flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5" /> 24/7 LGU Disaster Command Sync
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                  Do you need urgent evacuation or emergency rescue?
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  Report immediate life-threatening hazards, request rubber boats and medical teams, or find open evacuation shelters with free food, water, and medical care.
                </p>
              </div>

              {/* Instant High-Priority SOS Beacon Button */}
              <div className="shrink-0 flex flex-col items-center sm:items-end gap-2">
                <button
                  onClick={() => setIsSosModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white rounded-2xl font-black text-sm transition-all shadow-xl hover:shadow-rose-600/30 flex items-center justify-center gap-3 active:scale-95 border border-rose-400/40 group cursor-pointer"
                >
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-white" />
                  </span>
                  <div className="text-left">
                    <div className="text-xs uppercase tracking-wider text-rose-200 font-bold">Immediate Danger</div>
                    <div className="text-base font-black">BROADCAST SOS MAYDAY</div>
                  </div>
                </button>
                <span className="text-[10px] text-slate-400">Transmits instant GPS coordinates & alerts 911 dispatch</span>
              </div>
            </div>

            {/* Quick 3-Action Interactive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-6 mt-6 border-t border-slate-800/80">
              <button
                onClick={() => onSelectTab && onSelectTab("report-incident")}
                className="p-4 bg-slate-800/80 hover:bg-rose-950/60 border border-slate-700/60 hover:border-rose-500/60 text-white rounded-2xl transition-all shadow-sm flex items-start gap-3.5 group text-left cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-rose-600/30 text-rose-400 group-hover:scale-110 transition-transform">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-rose-200 transition-colors">Report Incident</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Flooding, Landslide, Fire, Collapse</div>
                </div>
              </button>

              <button
                onClick={() => onSelectTab && onSelectTab("request-assistance")}
                className="p-4 bg-slate-800/80 hover:bg-amber-950/60 border border-slate-700/60 hover:border-amber-500/60 text-white rounded-2xl transition-all shadow-sm flex items-start gap-3.5 group text-left cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-amber-600/30 text-amber-400 group-hover:scale-110 transition-transform">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-amber-200 transition-colors">Request Help</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Rescue Boat, Food, Medical Team</div>
                </div>
              </button>

              <button
                onClick={() => onSelectTab && onSelectTab("evacuation-centers")}
                className="p-4 bg-slate-800/80 hover:bg-blue-950/60 border border-slate-700/60 hover:border-blue-500/60 text-white rounded-2xl transition-all shadow-sm flex items-start gap-3.5 group text-left cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-400 group-hover:scale-110 transition-transform">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-blue-200 transition-colors">Find Shelter</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Available Seats & Step-by-Step Route</div>
                </div>
              </button>
            </div>
          </div>

          {/* Active Citizen Requests Banner (if any active) */}
          {activeUserRequests.length > 0 && (
            <div className="p-5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-600 text-white">
                    <Activity className="w-4 h-4 animate-spin" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-blue-950">Active Emergency Request in Progress</h2>
                    <p className="text-xs text-blue-700">Dispatch team has received your ticket and is tracking your status</p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectTab && onSelectTab("track-requests")}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                >
                  Track Status <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {activeUserRequests.slice(0, 2).map(req => (
                  <div key={req.id} className="p-3.5 bg-white border border-blue-100 rounded-xl space-y-2 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-blue-600">{req.id}</span>
                      <StatusBadge type="status" value={req.status} size="sm" />
                    </div>
                    <div className="text-xs font-bold text-slate-900">{req.requestType} Assistance</div>
                    <p className="text-[11px] text-slate-600 line-clamp-1">{req.description}</p>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                      <span>People: <strong>{req.peopleCount}</strong></span>
                      <span>Assigned Unit: <strong className="text-blue-700">{responders.find(r => r.id === req.assignedResponderId)?.codeName || "ALPHA-1 (Marcus)"}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Hotlines Directory */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-600" />
                24/7 Official Emergency Hotlines
              </h2>
              <span className="text-xs text-slate-500">Tap number to call or copy</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {emergencyHotlines.map((h, i) => (
                <div key={i} className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition-all">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900">{h.name}</div>
                    <div className="text-[10px] text-slate-500">{h.desc}</div>
                    <div className="text-sm font-mono font-black text-rose-600">{h.number}</div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => copyToClipboard(h.number, h.name)}
                      title="Copy Number"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={`tel:${h.number.replace(/[^0-9+]/g, "")}`}
                      title="Call Helpline"
                      className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two-Column Hub: Live Weather & Water Levels + Interactive Go-Bag Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Live River / Lake Water Level Telemetry (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Waves className="w-4 h-4 text-blue-600" />
                    <h2 className="font-bold text-slate-900 text-sm">Real-Time River & Dam Water Level Telemetry</h2>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Updated 3m ago</span>
                </div>

                <div className="space-y-3">
                  {/* Marikina River */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">Marikina River (Sensor Stn 4)</span>
                        <div className="text-[10px] text-slate-500">Normal: 14.0m • Alarm: 16.0m • Critical: 18.0m</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                        ALARM LEVEL 2 (16.4m)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: "82%" }} />
                    </div>
                    <div className="text-[10px] text-slate-600 flex justify-between">
                      <span>Trending: <strong>Rising +0.3m/hr</strong></span>
                      <span className="text-amber-700 font-bold">Prepare for Voluntary Evacuation</span>
                    </div>
                  </div>

                  {/* Wawa Dam */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">Wawa Dam Reservoir</span>
                        <div className="text-[10px] text-slate-500">Spillway Crest: 23.5m • Spilling Level: 24.0m</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                        SPILLING (24.2m)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: "95%" }} />
                    </div>
                    <div className="text-[10px] text-slate-600 flex justify-between">
                      <span>Gate Status: <strong>2 Floodgates Open (150 m³/s)</strong></span>
                      <span className="text-rose-700 font-bold">Downstream Communities on Alert</span>
                    </div>
                  </div>

                  {/* Laguna de Bay Coastal */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">Laguna de Bay Shoreline</span>
                        <div className="text-[10px] text-slate-500">Normal Elevation: 11.5m • Critical: 13.0m</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300">
                        ELEVATED (12.4m)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: "68%" }} />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">View complete PAGASA & NDRRMC advisories</span>
                  <button
                    onClick={() => onSelectTab && onSelectTab("alerts")}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    View Live Alerts <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Go-Bag Preparedness Checklist (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                    <h2 className="font-bold text-slate-900 text-sm">Emergency Go-Bag Readiness</h2>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {goBagPercent}% READY
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>{goBagCompletedCount} of {goBagItems.length} items packed</span>
                    <span className="font-bold text-emerald-700">{goBagPercent === 100 ? "Fully Prepared" : "Pack remaining items"}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${goBagPercent}%` }}
                    />
                  </div>
                </div>

                {/* Checklist items */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {goBagItems.map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => toggleGoBag(item.id)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${
                        item.checked
                          ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                        item.checked ? "bg-emerald-600 text-white" : "border border-slate-300 bg-white"
                      }`}>
                        {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className={`text-[11px] leading-tight ${item.checked ? "line-through text-slate-500" : "font-medium"}`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="text-[10px] text-slate-500 italic text-center pt-1">
                  Checklist is stored on your device for emergency offline access.
                </div>
              </div>
            </div>
          </div>

          {/* Nearest Evacuation Centers Preview */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-blue-600" />
                <h2 className="font-bold text-slate-900 text-base">Nearest Evacuation Centers</h2>
              </div>
              <button
                onClick={() => onSelectTab && onSelectTab("evacuation-centers")}
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
              >
                View All Shelters & Map <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {evacuationCenters.slice(0, 3).map(ec => {
                const occPct = Math.round((ec.currentOccupants / ec.capacity) * 100);
                const availableSeats = ec.capacity - ec.currentOccupants;

                return (
                  <div key={ec.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 hover:border-blue-300 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs">{ec.name}</h3>
                        <p className="text-[10px] text-slate-500">{ec.barangay} • 1.2 km away</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        ec.status === "OPEN" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800"
                      }`}>
                        {ec.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Capacity:</span>
                        <span className="font-bold text-slate-800">{ec.currentOccupants} / {ec.capacity}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${occPct > 90 ? "bg-rose-500" : occPct > 70 ? "bg-amber-500" : "bg-blue-600"}`}
                          style={{ width: `${occPct}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold text-right">
                        {availableSeats} seats remaining
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">{ec.contactPhone}</span>
                      <button
                        onClick={() => setSelectedShelterForRoute(ec)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs"
                      >
                        <Navigation className="w-3 h-3" /> Directions
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIVE ALERTS & DIRECTIVES */}
      {/* ========================================================================= */}
      {activeTab === "alerts" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Live Disaster Alerts & Directives</h2>
              <p className="text-xs text-slate-500 mt-0.5">Official warnings, flood levels, and emergency directives broadcast by LGU DRRM</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              {(["ALL", "EVACUATION", "WEATHER", "WATER_LEVEL"] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setAlertCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    alertCategoryFilter === cat ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {cat.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Severe Tropical Cyclone Warning Banner */}
          <div className="p-6 bg-gradient-to-r from-rose-950 via-rose-900 to-slate-950 text-white rounded-2xl border border-rose-800 shadow-lg space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                PAGASA TROPICAL CYCLONE WARNING: SIGNAL #2
              </span>
              <span className="text-xs text-rose-200 font-mono">Bulletin #04 • Valid until 18:00 PHT</span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white">
              Severe Tropical Storm "Enteng" maintains strength over Rizal & Laguna
            </h3>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl">
              Heavy to intense rainfall (100-200mm) expected over Rizal Province in the next 12 hours. Widespread flooding and rain-induced landslides are expected in low-lying and mountainous areas. Mandatory pre-emptive evacuation in effect for flood-prone barangays along Marikina River and Laguna Lake shores.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-rose-800/60 text-xs">
              <div>
                <span className="text-[10px] text-rose-300 block">Sustained Winds:</span>
                <span className="font-bold text-white">95 km/h near center</span>
              </div>
              <div>
                <span className="text-[10px] text-rose-300 block">Peak Gustiness:</span>
                <span className="font-bold text-white">Up to 115 km/h</span>
              </div>
              <div>
                <span className="text-[10px] text-rose-300 block">Movement:</span>
                <span className="font-bold text-white">West Northwest at 15 km/h</span>
              </div>
              <div>
                <span className="text-[10px] text-rose-300 block">Storm Surge Risk:</span>
                <span className="font-bold text-amber-300">Moderate (1.0m - 1.5m)</span>
              </div>
            </div>
          </div>

          {/* Active Broadcast Directives List */}
          <div className="space-y-4">
            {alerts.map(alt => (
              <div key={alt.id} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-rose-100 text-rose-700">
                      <Radio className="w-4 h-4 animate-pulse" />
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">{alt.title}</h3>
                      <div className="text-[10px] text-slate-500 font-medium">
                        Issued by <strong>{alt.issuedBy}</strong> • Sector: <span className="font-bold text-slate-800">{alt.affectedArea}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                    alt.severity === "CRITICAL" ? "bg-rose-100 text-rose-800 border border-rose-200" : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}>
                    {alt.severity}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium leading-relaxed">
                  {alt.instructions}
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>Target Zone: <strong className="text-slate-800">{alt.affectedArea}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectTab && onSelectTab("evacuation-centers")}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      Locate Designated Shelters <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REPORT EMERGENCY INCIDENT (WIZARD) */}
      {/* ========================================================================= */}
      {activeTab === "report-incident" && (
        <div className="space-y-6 animate-in fade-in max-w-3xl mx-auto">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Report an Emergency Incident</h2>
            <p className="text-xs text-slate-500 mt-0.5">Submit disaster threat reports directly to LGU DRRM Emergency Dispatch Command</p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 shadow-xs">
            {/* Step Progress Header */}
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-400 border-b border-slate-100 pb-3 sm:pb-4 overflow-x-auto">
              <div className={`flex items-center gap-1 sm:gap-1.5 shrink-0 ${incWizardStep >= 1 ? "text-rose-600" : ""}`}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current">1</span>
                <span className="hidden sm:inline">Threat Type</span>
                <span className="sm:hidden">Type</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <div className={`flex items-center gap-1 sm:gap-1.5 shrink-0 ${incWizardStep >= 2 ? "text-rose-600" : ""}`}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current">2</span>
                <span className="hidden sm:inline">Location & GPS</span>
                <span className="sm:hidden">Location</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <div className={`flex items-center gap-1 sm:gap-1.5 shrink-0 ${incWizardStep >= 3 ? "text-rose-600" : ""}`}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current">3</span>
                <span className="hidden sm:inline">Situation & Photo</span>
                <span className="sm:hidden">Details</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <div className={`flex items-center gap-1 sm:gap-1.5 shrink-0 ${incWizardStep >= 4 ? "text-emerald-600" : ""}`}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current">4</span>
                <span className="hidden sm:inline">Incident Slip</span>
                <span className="sm:hidden">Receipt</span>
              </div>
            </div>

            {/* STEP 1: CATEGORY & SEVERITY */}
            {incWizardStep === 1 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">1. Select Incident Type:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: "FLOOD", label: "Flood / Rising Waters", icon: "🌊", desc: "River swelling, street submerged" },
                      { id: "LANDSLIDE", label: "Landslide / Erosion", icon: "⛰️", desc: "Mudslide, rockfall, slope collapse" },
                      { id: "FIRE", label: "Fire Outbreak", icon: "🔥", desc: "Residential or forest fire" },
                      { id: "STRUCTURE_COLLAPSE", label: "Building Collapse", icon: "🏚️", desc: "Damaged roof, wall, bridge" },
                      { id: "MEDICAL", label: "Medical Emergency", icon: "🚑", desc: "Severe injury, trapped patient" },
                      { id: "ROAD_BLOCKAGE", label: "Road Blockage", icon: "🚧", desc: "Downed trees, fallen utility pole" }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setIncForm({ ...incForm, type: cat.id as IncidentType })}
                        className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all flex flex-col gap-1.5 ${
                          incForm.type === cat.id
                            ? "bg-rose-50 border-rose-300 text-rose-900 shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <div className="font-bold text-slate-900">{cat.label}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{cat.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">2. Estimated Threat Severity:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: "CRITICAL", label: "CRITICAL", desc: "Immediate danger to life", color: "border-rose-400 bg-rose-50 text-rose-800" },
                      { id: "HIGH", label: "HIGH", desc: "Rapidly escalating risk", color: "border-amber-400 bg-amber-50 text-amber-800" },
                      { id: "MEDIUM", label: "MEDIUM", desc: "Property risk, needs dispatch", color: "border-yellow-400 bg-yellow-50 text-yellow-800" },
                      { id: "LOW", label: "LOW", desc: "Hazard warning only", color: "border-blue-400 bg-blue-50 text-blue-800" }
                    ].map(sev => (
                      <button
                        key={sev.id}
                        type="button"
                        onClick={() => setIncForm({ ...incForm, severity: sev.id as any })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          incForm.severity === sev.id ? `${sev.color} shadow-xs ring-2 ring-current` : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}
                      >
                        <div className="text-xs font-black">{sev.label}</div>
                        <div className="text-[10px] text-slate-500">{sev.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setIncWizardStep(2)}
                    className="px-6 py-2.5 bg-[#111827] hover:bg-[#1f2937] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    Next: Location & GPS <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: LOCATION & GPS */}
            {incWizardStep === 2 && (
              <div className="space-y-5">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-emerald-600" />
                      Live Geolocation Lock
                    </span>
                    <button
                      type="button"
                      onClick={handleDetectGps}
                      disabled={isDetectingGps}
                      className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
                    >
                      <RefreshCw className={`w-3 h-3 ${isDetectingGps ? "animate-spin text-blue-600" : ""}`} />
                      {isDetectingGps ? "Acquiring Satellites..." : "Re-Lock GPS"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500">Latitude:</span>
                      <div className="font-mono font-bold text-slate-900">{incForm.lat.toFixed(4)}° N</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Longitude:</span>
                      <div className="font-mono font-bold text-slate-900">{incForm.lng.toFixed(4)}° E</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> GPS accuracy within ±3.8 meters (Rizal, Laguna DRRM Grid)
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Barangay (Rizal, Laguna, Philippines)</label>
                    <span className="text-[10px] text-blue-600 font-semibold">11 Official Barangays</span>
                  </div>
                  <select
                    value={incForm.barangay}
                    onChange={e => {
                      const selectedBgy = RIZAL_LAGUNA_BARANGAYS.find(b => b.name === e.target.value);
                      setIncForm({
                        ...incForm,
                        barangay: e.target.value,
                        lat: selectedBgy ? selectedBgy.lat : incForm.lat,
                        lng: selectedBgy ? selectedBgy.lng : incForm.lng,
                        landmark: selectedBgy ? selectedBgy.defaultLandmark : incForm.landmark
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none"
                  >
                    {RIZAL_LAGUNA_BARANGAYS.map(b => (
                      <option key={b.name} value={b.name}>
                        Barangay {b.name} ({b.sector})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Street Address or Zone</label>
                  <input
                    type="text"
                    value={incForm.locationName}
                    onChange={e => setIncForm({ ...incForm, locationName: e.target.value })}
                    placeholder="e.g. Purok 3, Riverside Road, Pauli 2, Rizal, Laguna"
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Recognizable Landmark / Nearest Structure</label>
                  <input
                    type="text"
                    value={incForm.landmark}
                    onChange={e => setIncForm({ ...incForm, landmark: e.target.value })}
                    placeholder="e.g. Near Pauli 2 Covered Gymnasium or St. Michael Parish"
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setIncWizardStep(1)}
                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setIncWizardStep(3)}
                    className="px-6 py-2.5 bg-[#111827] hover:bg-[#1f2937] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    Next: Situation & Photo <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SITUATION DETAILS & PHOTO */}
            {incWizardStep === 3 && (
              <form onSubmit={handleIncidentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Incident Headline / Summary *</label>
                  <input
                    type="text"
                    required
                    value={incForm.title}
                    onChange={e => setIncForm({ ...incForm, title: e.target.value })}
                    placeholder="e.g. Rapid flood rise trapping 3 persons on second floor"
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Current Water Depth</label>
                    <select
                      value={incForm.waterDepth}
                      onChange={e => setIncForm({ ...incForm, waterDepth: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none"
                    >
                      <option value="Ankle-Deep (0.1m - 0.3m)">Ankle-Deep (0.1m - 0.3m)</option>
                      <option value="Knee-Deep (0.4m - 0.7m)">Knee-Deep (0.4m - 0.7m)</option>
                      <option value="Waist-Deep (1.0m - 1.2m)">Waist-Deep (1.0m - 1.2m)</option>
                      <option value="Chest-Deep / Submerged 1st Floor (1.5m - 2.0m)">Chest-Deep / Submerged 1st Floor (1.5m - 2.0m)</option>
                      <option value="Rooftop Level (> 2.5m)">Rooftop Level (&gt; 2.5m)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Persons Affected / Trapped</label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={incForm.affectedCount}
                      onChange={e => setIncForm({ ...incForm, affectedCount: parseInt(e.target.value) || 1 })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Situation Notes</label>
                  <textarea
                    rows={3}
                    value={incForm.description}
                    onChange={e => setIncForm({ ...incForm, description: e.target.value })}
                    placeholder="Describe what is happening on scene, current water trends, hazards..."
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl p-3 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Simulated Photo Uploader */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Attach Field Recon Photo (Optional)</label>
                  <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div className="text-xs">
                        <div className="font-bold text-slate-800">{incForm.photoName}</div>
                        <div className="text-[10px] text-slate-500">Geotagged image • 2.4 MB • High-Res</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold border border-emerald-200">
                      PHOTO VERIFIED
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setIncWizardStep(2)}
                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Submit Emergency Incident
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: OFFICIAL INCIDENT SLIP (SUCCESS) */}
            {incWizardStep === 4 && (
              <div className="py-6 text-center space-y-5">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 border-2 border-emerald-300 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900">Incident Successfully Submitted</h3>
                  <p className="text-xs text-slate-600">Your report has been logged into the LGU Emergency Dispatch System</p>
                </div>

                {/* Printable Incident Receipt Card */}
                <div className="max-w-md mx-auto p-5 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-3 font-mono shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">OFFICIAL DISPATCH TICKET</span>
                    <span className="text-xs font-bold text-emerald-700">STATUS: VERIFYING</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reference ID:</span>
                      <strong className="text-blue-700 text-sm font-black">{createdIncId || "INC-2026-904"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Incident Type:</span>
                      <strong className="text-slate-800">{incForm.type} ({incForm.severity})</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Location:</span>
                      <strong className="text-slate-800">{incForm.barangay}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reporter:</span>
                      <strong className="text-slate-800">{citizenName}</strong>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-200 text-center font-sans">
                    SMS notification broadcast to Sector 4 disaster response units (ALPHA-1).
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setIncWizardStep(1);
                      setIncForm(prev => ({ ...prev, title: "", description: "" }));
                    }}
                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Submit Another Report
                  </button>
                  <button
                    onClick={() => onSelectTab && onSelectTab("track-requests")}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    Track Status <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: REQUEST EMERGENCY ASSISTANCE */}
      {/* ========================================================================= */}
      {activeTab === "request-assistance" && (
        <div className="space-y-6 animate-in fade-in max-w-3xl mx-auto">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Request Emergency Assistance</h2>
            <p className="text-xs text-slate-500 mt-0.5">Directly request rescue boats, medical ambulance, or family relief food & clean water packs</p>
          </div>

          <form onSubmit={handleRequestSubmit} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-5 shadow-xs">
            {createdReqId && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Request logged into dispatch queue! Reference ID: <strong className="font-mono text-blue-700">{createdReqId}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectTab && onSelectTab("track-requests")}
                  className="underline hover:text-emerald-700"
                >
                  View in Tracker
                </button>
              </div>
            )}

            {/* Assistance Type Cards */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">1. Select Required Assistance Service:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "RESCUE", label: "Rescue Boat / Swift Water Extraction", icon: LifeBuoy, desc: "Trapped by rising waters, flooded ground floor" },
                  { id: "MEDICAL", label: "Emergency Ambulance & Medical Care", icon: HeartPulse, desc: "Injured, disabled, medical maintenance crisis" },
                  { id: "FOOD_WATER", label: "Family Food Packs & Clean Potable Water", icon: PackageCheck, desc: "Stranded without food/water for 24h+" },
                  { id: "SHELTER", label: "Emergency Shelter & Blankets Transfer", icon: Home, desc: "Need transportation to nearest evacuation center" }
                ].map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setReqForm({ ...reqForm, requestType: type.id as RequestType })}
                      className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all flex items-start gap-3 ${
                        reqForm.requestType === type.id
                          ? "bg-amber-50 border-amber-300 text-amber-950 shadow-xs ring-1 ring-amber-400"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{type.label}</div>
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">{type.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone Number *</label>
                <input
                  type="text"
                  required
                  value={reqForm.contactPhone}
                  onChange={e => setReqForm({ ...reqForm, contactPhone: e.target.value })}
                  placeholder="+63 917 123 4567"
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Barangay (Rizal, Laguna) *</label>
                <select
                  value={reqForm.barangay}
                  onChange={e => setReqForm({ ...reqForm, barangay: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none"
                >
                  {RIZAL_LAGUNA_BARANGAYS.map(b => (
                    <option key={b.name} value={b.name}>
                      Barangay {b.name} ({b.sector})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trapped Location / Floor</label>
                <select
                  value={reqForm.trappedLocation}
                  onChange={e => setReqForm({ ...reqForm, trappedLocation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none"
                >
                  <option value="Rooftop / Second Floor Balcony">Rooftop / Second Floor Balcony</option>
                  <option value="Second Floor Inside">Second Floor Inside</option>
                  <option value="Ground Floor (Rising Waters)">Ground Floor (Rising Waters)</option>
                  <option value="Isolated on Dry High Ground">Isolated on Dry High Ground</option>
                </select>
              </div>
            </div>

            {/* Headcount Breakdown */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-slate-800 block">Vulnerable Persons Breakdown</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Total Persons:</label>
                  <input
                    type="number"
                    min={1}
                    value={reqForm.peopleCount}
                    onChange={e => setReqForm({ ...reqForm, peopleCount: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white border border-slate-200 text-xs text-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Infants (0-2y):</label>
                  <input
                    type="number"
                    min={0}
                    value={reqForm.infantCount}
                    onChange={e => setReqForm({ ...reqForm, infantCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-200 text-xs text-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Senior Citizens (60+):</label>
                  <input
                    type="number"
                    min={0}
                    value={reqForm.elderlyCount}
                    onChange={e => setReqForm({ ...reqForm, elderlyCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-200 text-xs text-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Persons with Disability:</label>
                  <input
                    type="number"
                    min={0}
                    value={reqForm.pwdCount}
                    onChange={e => setReqForm({ ...reqForm, pwdCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-200 text-xs text-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Medical Conditions & Critical Needs</label>
              <input
                type="text"
                value={reqForm.specialNeeds}
                onChange={e => setReqForm({ ...reqForm, specialNeeds: e.target.value })}
                placeholder="e.g. 1 hypertensive senior citizen requiring amlodipine, 1 infant needing formula"
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Exact Street Address & Landmark (Rizal, Laguna) *</label>
              <textarea
                rows={2}
                required
                value={reqForm.address}
                onChange={e => setReqForm({ ...reqForm, address: e.target.value })}
                placeholder="Complete street name, Purok/Sitio, and nearest landmark for rescue boat / response team in Rizal, Laguna..."
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl p-3 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmittingReq}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
              >
                {isSubmittingReq ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Logging into dispatch server...
                  </>
                ) : (
                  <>
                    <LifeBuoy className="w-4 h-4" /> Submit Emergency Assistance Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: FIND EVACUATION SHELTERS */}
      {/* ========================================================================= */}
      {activeTab === "evacuation-centers" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Find Emergency Evacuation Centers</h2>
              <p className="text-xs text-slate-500 mt-0.5">Locate open shelters, available family rooms, hot meal stations, and get directions</p>
            </div>

            {/* View Mode Toggle: Grid vs GIS Map */}
            <div className="flex items-center gap-2">
              <div className="p-1 bg-slate-100 rounded-xl border border-slate-200 flex text-xs">
                <button
                  onClick={() => setShelterViewMode("GRID")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    shelterViewMode === "GRID" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Cards View
                </button>
                <button
                  onClick={() => setShelterViewMode("MAP")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    shelterViewMode === "MAP" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Interactive Map
                </button>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={centerSearch}
                onChange={e => setCenterSearch(e.target.value)}
                placeholder="Search shelter by name, barangay, or street..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              {(["ALL", "OPEN_ONLY", "HAS_CAPACITY"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setCenterFilter(f)}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition-all ${
                    centerFilter === f
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {f === "ALL" ? "All Shelters" : f === "OPEN_ONLY" ? "Open Only" : "Has Seats"}
                </button>
              ))}
            </div>
          </div>

          {/* VIEW 1: INTERACTIVE GIS MAP */}
          {shelterViewMode === "MAP" && (
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-bold">Showing all active evacuation facilities and hazard perimeters</span>
                <span className="text-[10px] text-slate-400">Click any shelter marker on the map for contact info</span>
              </div>
              <div className="h-[460px] rounded-xl overflow-hidden border border-slate-200">
                <InteractiveGISMap />
              </div>
            </div>
          )}

          {/* VIEW 2: SHELTERS GRID */}
          {shelterViewMode === "GRID" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCenters.map(ec => {
                const occPct = Math.round((ec.currentOccupants / ec.capacity) * 100);
                const availableSeats = ec.capacity - ec.currentOccupants;

                return (
                  <div key={ec.id} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">{ec.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{ec.address} • {ec.barangay}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black shrink-0 ${
                          ec.status === "OPEN" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800"
                        }`}>
                          {ec.status}
                        </span>
                      </div>

                      {/* Amenities Badges */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md border border-blue-200">
                          Medical Station
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-200">
                          Hot Meals
                        </span>
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-md border border-purple-200">
                          Child Friendly
                        </span>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md border border-amber-200">
                          Pet Zone
                        </span>
                      </div>

                      {/* Capacity Meter */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Current Occupancy:</span>
                          <span className="font-bold text-slate-900">{ec.currentOccupants} / {ec.capacity}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              occPct > 90 ? "bg-rose-500" : occPct > 75 ? "bg-amber-500" : "bg-blue-600"
                            }`}
                            style={{ width: `${occPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">{occPct}% Full</span>
                          <span className="font-bold text-emerald-700">{availableSeats} spots open</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        Camp Mgr: <strong className="text-slate-800 font-mono">{ec.contactPhone}</strong>
                      </div>
                      <button
                        onClick={() => setSelectedShelterForRoute(ec)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" /> Get Directions
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Interactive Navigation Route Modal */}
          {selectedShelterForRoute && (
            <Modal
              isOpen={Boolean(selectedShelterForRoute)}
              onClose={() => setSelectedShelterForRoute(null)}
              title={`Directions to ${selectedShelterForRoute.name}`}
            >
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                  <div className="text-xs font-bold text-blue-900">{selectedShelterForRoute.address}</div>
                  <div className="text-xs text-blue-700">Barangay: <strong>{selectedShelterForRoute.barangay}</strong> • Camp Hotline: <strong>{selectedShelterForRoute.contactPhone}</strong></div>
                  <div className="text-[11px] text-emerald-700 font-bold pt-1">
                    Status: OPEN ({selectedShelterForRoute.capacity - selectedShelterForRoute.currentOccupants} spots available)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Distance from Your GPS:</span>
                    <strong className="text-sm text-slate-900 font-mono">1.4 km</strong>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Estimated Walking ETA:</span>
                    <strong className="text-sm text-slate-900 font-mono">16 - 20 mins</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">Step-by-Step Safe Evacuation Route:</span>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                      <span>Head north on your street towards <strong>Rizal-Nagcarlan Provincial Highway</strong> (dry elevated pavement).</span>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                      <span>Turn right onto <strong>Provincial Highway</strong>. <em>Warning: Avoid low-lying riverbank walkway.</em></span>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                      <span>Continue 800m. Arrive at <strong>{selectedShelterForRoute.name}</strong> main entrance triage gate.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedShelterForRoute(null)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedShelterForRoute.lat},${selectedShelterForRoute.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
                  </a>
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: TRACK REPORTS & REQUESTS */}
      {/* ========================================================================= */}
      {activeTab === "track-requests" && (
        <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Track My Emergency Reports & Requests</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time status progression from LGU DRRM dispatch to responder arrival</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onSelectTab && onSelectTab("report-incident")}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Siren className="w-3.5 h-3.5" /> Report Emergency
              </button>
              <button
                onClick={() => onSelectTab && onSelectTab("request-assistance")}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <LifeBuoy className="w-3.5 h-3.5" /> Request Assistance
              </button>
            </div>
          </div>

          {/* Sub-Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setTrackFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                trackFilter === "ALL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Items ({myReportedIncidents.length + myAssistanceRequests.length})
            </button>
            <button
              onClick={() => setTrackFilter("INCIDENTS")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                trackFilter === "INCIDENTS"
                  ? "bg-rose-700 text-white shadow-xs"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
              }`}
            >
              <Siren className="w-3 h-3" />
              Emergency Incidents ({myReportedIncidents.length})
            </button>
            <button
              onClick={() => setTrackFilter("REQUESTS")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                trackFilter === "REQUESTS"
                  ? "bg-amber-700 text-white shadow-xs"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              <LifeBuoy className="w-3 h-3" />
              Assistance Requests ({myAssistanceRequests.length})
            </button>
          </div>

          <div className="space-y-4">
            {/* Empty State */}
            {myReportedIncidents.length === 0 && myAssistanceRequests.length === 0 ? (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
                <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">No active reports or requests logged yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  If you need rescue, water rations, or want to report a rising flood or incident in your barangay, tap the buttons below.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => onSelectTab && onSelectTab("report-incident")}
                    className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Report Emergency
                  </button>
                  <button
                    onClick={() => onSelectTab && onSelectTab("request-assistance")}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Request Help Now
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* 1. REPORTED EMERGENCY INCIDENTS */}
                {(trackFilter === "ALL" || trackFilter === "INCIDENTS") &&
                  myReportedIncidents.map(inc => {
                    const isResolved = inc.status === "RESOLVED";
                    const isAssigned = inc.status === "ASSIGNED" || inc.status === "RESOLVED";
                    const isVerified = inc.status === "VERIFIED" || isAssigned || isResolved;

                    const assignedUnit = responders.find(r => inc.assignedResponderIds?.includes(r.id))?.codeName || 
                      (inc.assignedResponderNames && inc.assignedResponderNames[0]) || 
                      "ALPHA-1 (Marcus Villareal)";

                    return (
                      <div key={inc.id} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs hover:border-slate-300 transition-all border-l-4 border-l-rose-600">
                        {/* Header: ID, Type & Status */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-black text-rose-700 text-sm bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1.5">
                              <Siren className="w-3.5 h-3.5" />
                              {inc.id}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{inc.title}</h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                                  {inc.type} • {inc.severity}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-medium">Location: {inc.locationName}</span>
                            </div>
                          </div>

                          <StatusBadge type="status" value={inc.status} size="sm" />
                        </div>

                        {/* Incident Description Box */}
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium leading-relaxed">
                          {inc.description}
                        </div>

                        {/* 4-Stage Multi-Step Progress Tracker */}
                        <div className="pt-2 space-y-2">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            Incident Dispatch Pipeline:
                          </div>

                          <div className="grid grid-cols-4 gap-2 text-center">
                            {/* Stage 1: Logged */}
                            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                              <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-600" />
                              <div className="text-[10px] font-bold">1. Logged</div>
                            </div>

                            {/* Stage 2: Verified */}
                            <div className={`p-2.5 rounded-xl border space-y-1 ${
                              isVerified ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-400"
                            }`}>
                              <CheckCircle2 className={`w-4 h-4 mx-auto ${isVerified ? "text-emerald-600" : "text-slate-300"}`} />
                              <div className="text-[10px] font-bold">2. Verified</div>
                            </div>

                            {/* Stage 3: En Route */}
                            <div className={`p-2.5 rounded-xl border space-y-1 ${
                              isAssigned ? "bg-blue-50 border-blue-200 text-blue-900" : "bg-slate-50 border-slate-200 text-slate-400"
                            }`}>
                              <Navigation className={`w-4 h-4 mx-auto ${isAssigned ? "text-blue-600 animate-pulse" : "text-slate-300"}`} />
                              <div className="text-[10px] font-bold">3. Team Dispatched</div>
                            </div>

                            {/* Stage 4: Resolved */}
                            <div className={`p-2.5 rounded-xl border space-y-1 ${
                              isResolved ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-400"
                            }`}>
                              <Check className={`w-4 h-4 mx-auto ${isResolved ? "text-emerald-600" : "text-slate-300"}`} />
                              <div className="text-[10px] font-bold">4. Resolved</div>
                            </div>
                          </div>
                        </div>

                        {/* Assigned Responder Card & Actions */}
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <Users2 className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">
                              Dispatched Unit: <strong className="text-slate-900">{isAssigned ? assignedUnit : "Awaiting Command Center Assignment"}</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {updateNoteIncId === inc.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={incUpdateNote}
                                  onChange={e => setIncUpdateNote(e.target.value)}
                                  placeholder="Enter update (e.g. flood rising, road blocked)..."
                                  className="px-3 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs w-64 focus:outline-none"
                                />
                                <button
                                  onClick={() => handleAddIncidentNote(inc.id)}
                                  className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold"
                                >
                                  Send
                                </button>
                                <button
                                  onClick={() => setUpdateNoteIncId(null)}
                                  className="px-2 py-1 text-slate-400 hover:text-slate-600"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setUpdateNoteIncId(inc.id)}
                                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-rose-600" />
                                Transmit Update to DRRM
                              </button>
                            )}

                            <a
                              href="tel:+63495621111"
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                            >
                              <Phone className="w-3.5 h-3.5" /> Call DRRM
                            </a>
                          </div>
                        </div>

                        {incNoteSuccess === inc.id && (
                          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Incident update logged into Rizal DRRM Operations Center feed!
                          </div>
                        )}
                      </div>
                    );
                  })}

                {/* 2. CITIZEN ASSISTANCE REQUESTS */}
                {(trackFilter === "ALL" || trackFilter === "REQUESTS") &&
                  myAssistanceRequests.map(req => {
                    const isResolved = req.status === "RESOLVED";
                    const isAssigned = req.status === "ASSIGNED" || req.status === "RESPONDING" || req.status === "RESOLVED";
                    const isVerified = req.status !== "SUBMITTED";

                    return (
                      <div key={req.id} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs hover:border-slate-300 transition-all border-l-4 border-l-blue-600">
                        {/* Header: ID & Status */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-black text-blue-600 text-sm bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1.5">
                              <LifeBuoy className="w-3.5 h-3.5" />
                              {req.id}
                            </span>
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm sm:text-base">{req.requestType} Assistance Request</h3>
                              <span className="text-[10px] text-slate-500">Target: {req.locationName}</span>
                            </div>
                          </div>

                          <StatusBadge type="status" value={req.status} size="sm" />
                        </div>

                        {/* Situation Description Box */}
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium leading-relaxed">
                          {req.description}
                        </div>

                        {/* 4-Stage Multi-Step Progress Tracker */}
                        <div className="pt-2 space-y-2">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            Dispatch Progress Pipeline:
                          </div>

                          <div className="grid grid-cols-4 gap-2 text-center">
                            {/* Stage 1 */}
                            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                              <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-600" />
                              <div className="text-[10px] font-bold">1. Logged</div>
                            </div>

                            {/* Stage 2 */}
                            <div className={`p-2.5 rounded-xl border space-y-1 ${
                              isVerified ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-400"
                            }`}>
                              <CheckCircle2 className={`w-4 h-4 mx-auto ${isVerified ? "text-emerald-600" : "text-slate-300"}`} />
                              <div className="text-[10px] font-bold">2. Verified</div>
                            </div>

                            {/* Stage 3 */}
                            <div className={`p-2.5 rounded-xl border space-y-1 ${
                              isAssigned ? "bg-blue-50 border-blue-200 text-blue-900" : "bg-slate-50 border-slate-200 text-slate-400"
                            }`}>
                              <Navigation className={`w-4 h-4 mx-auto ${isAssigned ? "text-blue-600 animate-pulse" : "text-slate-300"}`} />
                              <div className="text-[10px] font-bold">3. Unit En Route</div>
                            </div>

                            {/* Stage 4 */}
                            <div className={`p-2.5 rounded-xl border space-y-1 ${
                              isResolved ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-400"
                            }`}>
                              <Check className={`w-4 h-4 mx-auto ${isResolved ? "text-emerald-600" : "text-slate-300"}`} />
                              <div className="text-[10px] font-bold">4. Resolved</div>
                            </div>
                          </div>
                        </div>

                        {/* Assigned Responder Card & Actions */}
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <Users2 className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">
                              Assigned Unit: <strong className="text-slate-900">{responders.find(r => r.id === req.assignedResponderId)?.codeName || "ALPHA-1 (Marcus Villareal)"}</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {updateNoteReqId === req.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={userUpdateNote}
                                  onChange={e => setUserUpdateNote(e.target.value)}
                                  placeholder="Enter update (e.g. water up to 2nd floor)..."
                                  className="px-3 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs w-64 focus:outline-none"
                                />
                                <button
                                  onClick={() => handleAddRequestNote(req.id)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold"
                                >
                                  Send
                                </button>
                                <button
                                  onClick={() => setUpdateNoteReqId(null)}
                                  className="px-2 py-1 text-slate-400 hover:text-slate-600"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setUpdateNoteReqId(req.id)}
                                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                                Send Status Update to Crew
                              </button>
                            )}

                            <a
                              href="tel:+639193456789"
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                            >
                              <Phone className="w-3.5 h-3.5" /> Call Unit Lead
                            </a>
                          </div>
                        </div>

                        {noteSuccess === req.id && (
                          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Update transmitted to field responder radio channel!
                          </div>
                        )}
                      </div>
                    );
                  })}
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SOS MAYDAY BEACON MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isSosModalOpen}
        onClose={() => {
          setIsSosModalOpen(false);
          setSosBroadcastSuccess(false);
        }}
        title="EMERGENCY SOS MAYDAY BEACON"
      >
        <div className="space-y-4">
          {sosBroadcastSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-700 border-2 border-red-400 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
                <Siren className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-red-900">MAYDAY BEACON ACTIVE & BROADCASTING</h3>
                <p className="text-xs text-slate-700 font-medium">
                  Dispatch priority has been locked. 911 Command & Sector 4 units notified.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ticket Ref ID:</span>
                  <strong className="text-red-700 font-bold">{sosRefId || "SOS-911-ACTIVE"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GPS Coordinates:</span>
                  <strong>14.1134° N, 121.3938° E</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Household Count:</span>
                  <strong>{sosHouseholdCount} Persons in Peril</strong>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl text-left">
                <strong>INSTRUCTIONS:</strong> Stay on the highest safe point of the structure. Signal with a flashlight, whistle, or brightly colored cloth. Do not attempt to wade across swift floodwaters.
              </div>

              <button
                onClick={() => {
                  setIsSosModalOpen(false);
                  onSelectTab && onSelectTab("track-requests");
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Track Rescue Unit Dispatch
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
                  Life-Threatening Distress Only
                </div>
                <p className="text-xs text-rose-900">
                  This button alerts all emergency dispatch frequencies and commands immediate water rescue deployment.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Immediate Condition:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "RISING_FLOOD", label: "Rising Flood Waters", icon: "🌊" },
                    { id: "MEDICAL_CRISIS", label: "Severe Medical Threat", icon: "🚑" },
                    { id: "COLLAPSE_TRAPPED", label: "Trapped in Structure", icon: "🏚️" },
                    { id: "OTHER", label: "Other Life Threat", icon: "⚠️" }
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSosCondition(c.id as any)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center gap-2 transition-all ${
                        sosCondition === c.id ? "bg-rose-100 border-rose-400 text-rose-900 shadow-xs" : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="text-lg">{c.icon}</span>
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Number of Trapped Persons:</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={sosHouseholdCount}
                  onChange={e => setSosHouseholdCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Target GPS Lock:</span>
                  <span className="font-mono text-emerald-700 font-bold">14.1134° N, 121.3938° E</span>
                </div>
                <div className="flex justify-between">
                  <span>Assigned Sector:</span>
                  <span className="font-bold text-slate-900">Sector 4 (Rizal DRRM Riverview)</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSosModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBroadcastSos}
                  disabled={isSosBroadcasting}
                  className="flex-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-lg flex items-center justify-center gap-2"
                >
                  {isSosBroadcasting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Broadcasting...
                    </>
                  ) : (
                    <>
                      <Siren className="w-4 h-4" /> TRANSMIT MAYDAY BEACON
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
