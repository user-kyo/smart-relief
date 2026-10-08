import React, { useState, useMemo } from "react";
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
  CheckCircle
} from "lucide-react";
import { useSmartRelief } from "../../../context/SmartReliefContext";
import { KPICard } from "../../common/KPICard";
import { StatusBadge } from "../../common/StatusBadge";
import { Modal } from "../../common/Modal";
import { IncidentType, RequestType } from "../../../types";

interface CitizenPortalProps {
  activeTab: string;
  onSelectTab?: (tabId: string) => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({ activeTab, onSelectTab }) => {
  const {
    incidents,
    assistanceRequests,
    evacuationCenters,
    alerts,
    createIncident,
    createAssistanceRequest
  } = useSmartRelief();

  // Citizen Report State
  const [incWizardStep, setIncWizardStep] = useState(1);
  const [incForm, setIncForm] = useState({
    title: "",
    type: "FLOOD" as IncidentType,
    severity: "HIGH" as any,
    locationName: "Barangay San Jose, Sector 4",
    description: "",
    affectedCount: 2
  });

  const [createdIncId, setCreatedIncId] = useState<string | null>(null);

  // Assistance Request Form State
  const [reqForm, setReqForm] = useState({
    requestType: "RESCUE" as RequestType,
    peopleCount: 3,
    specialNeeds: "1 infant, 1 senior citizen requiring maintenance medicine",
    description: "Water level is waist-high inside ground floor. Need boat evacuation to shelter.",
    address: "House 12, Block 4, Barangay San Jose",
    contactPhone: "+63 917 123 4567"
  });

  const [createdReqId, setCreatedReqId] = useState<string | null>(null);

  // Search Centers
  const [centerSearch, setCenterSearch] = useState("");

  const activeAlerts = alerts.filter(a => a.active);

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incForm.title) return;
    const newInc = createIncident({
      title: incForm.title,
      type: incForm.type,
      severity: incForm.severity,
      locationName: incForm.locationName,
      description: incForm.description,
      affectedCount: incForm.affectedCount,
      reportedBy: "Public Citizen (App)"
    });
    setCreatedIncId(newInc.id);
    setIncWizardStep(4); // Success step
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq = createAssistanceRequest({
      citizenName: "Citizen Reporter",
      citizenPhone: reqForm.contactPhone,
      requestType: reqForm.requestType,
      peopleCount: reqForm.peopleCount,
      specialNeeds: reqForm.specialNeeds,
      description: reqForm.description,
      locationName: reqForm.address,
      barangay: "Barangay San Jose"
    });
    setCreatedReqId(newReq.id);
  };

  const filteredCenters = useMemo(() => evacuationCenters.filter(c =>
    c.name.toLowerCase().includes(centerSearch.toLowerCase()) ||
    c.barangay.toLowerCase().includes(centerSearch.toLowerCase())
  ), [evacuationCenters, centerSearch]);

  return (
    <div className="space-y-6">
      
      {/* 1. CITIZEN HOME TAB */}
      {(activeTab === "citizen-home" || !activeTab) && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Emergency Hero Action Header */}
          <div className="p-6 bg-slate-900 border rounded-2xl shadow-sm space-y-4" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Siren className="w-4 h-4 animate-pulse" />
                Emergency Citizen Portal
              </span>
              <span className="text-xs text-rose-200 font-semibold hidden sm:inline">LGU-DRRM 24/7 Hotline Sync</span>
            </div>

            <div className="max-w-2xl space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white">Do you need immediate emergency help or evacuation?</h1>
              <p className="text-xs sm:text-sm text-slate-200">
                Report disaster incidents, request rescue boats or food rations, or locate open emergency shelters near you.
              </p>
            </div>

            {/* Quick Large Action Grid Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => onSelectTab && onSelectTab("report-incident")}
                className="p-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-all shadow-xs flex flex-col items-start gap-2 group cursor-pointer"
              >
                <AlertOctagon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div>Report Incident</div>
                  <div className="text-[10px] text-rose-200 font-normal">Flood, Fire, Collapse</div>
                </div>
              </button>

              <button
                onClick={() => onSelectTab && onSelectTab("request-assistance")}
                className="p-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm transition-all shadow-xs flex flex-col items-start gap-2 group cursor-pointer"
              >
                <LifeBuoy className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div>Request Assistance</div>
                  <div className="text-[10px] text-amber-100 font-normal">Rescue, Water, Food</div>
                </div>
              </button>

              <button
                onClick={() => onSelectTab && onSelectTab("evacuation-centers")}
                className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-xs flex flex-col items-start gap-2 group cursor-pointer"
              >
                <Home className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div>Find Evacuation Shelter</div>
                  <div className="text-[10px] text-blue-100 font-normal">Check seats & route</div>
                </div>
              </button>
            </div>
          </div>

          {/* Active Broadcast Emergency Alerts */}
          {activeAlerts.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <Radio className="w-4 h-4 animate-pulse" />
                LGU Emergency Broadcast Directives
              </div>

              {activeAlerts.map(alt => (
                <div key={alt.id} className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-rose-900 text-sm">{alt.title}</h3>
                    <span className="text-[10px] font-mono text-rose-700 font-semibold">Issued by {alt.issuedBy}</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">{alt.instructions}</p>
                  <div className="text-[10px] text-slate-600 pt-1">
                    Affected Area: <span className="font-bold text-slate-900">{alt.affectedArea}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Evacuation Centers Nearby Preview */}
          <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Home className="w-4 h-4 text-blue-600" />
                Nearest Evacuation Centers Status
              </h3>
              <button
                onClick={() => onSelectTab && onSelectTab("evacuation-centers")}
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evacuationCenters.slice(0, 2).map(ec => (
                <div key={ec.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{ec.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ec.status === "OPEN" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800"
                    }`}>
                      {ec.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">{ec.address}</div>
                  <div className="text-xs text-slate-800 font-bold">
                    Occupancy: {ec.currentOccupants} / {ec.capacity} seats taken
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. REPORT INCIDENT WIZARD TAB */}
      {activeTab === "report-incident" && (
        <div className="space-y-6 animate-in fade-in max-w-2xl mx-auto">
          <div>
            <h2 className="text-xl font-black text-slate-900">Report an Emergency Incident</h2>
            <p className="text-xs text-slate-500 mt-0.5">Wizard to report disaster threats directly to LGU DRRM command</p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-6 shadow-xs">
            
            {/* Step Progress Bar */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-100 pb-3">
              <span className={incWizardStep >= 1 ? "text-rose-600" : ""}>1. Type</span>
              <span>→</span>
              <span className={incWizardStep >= 2 ? "text-rose-600" : ""}>2. Location</span>
              <span>→</span>
              <span className={incWizardStep >= 3 ? "text-rose-600" : ""}>3. Details</span>
              <span>→</span>
              <span className={incWizardStep >= 4 ? "text-emerald-600" : ""}>4. Reference ID</span>
            </div>

            {/* Step 1: Category Selection */}
            {incWizardStep === 1 && (
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700">Select Incident Category:</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "FLOOD", label: "Flood / Rising Waters", icon: "🌊" },
                    { id: "LANDSLIDE", label: "Landslide / Erosion", icon: "⛰️" },
                    { id: "FIRE", label: "Fire Emergency", icon: "🔥" },
                    { id: "STRUCTURE_COLLAPSE", label: "Structural Collapse", icon: "🏚️" },
                    { id: "MEDICAL", label: "Medical Emergency", icon: "🚑" }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setIncForm({ ...incForm, type: cat.id as IncidentType })}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                        incForm.type === cat.id ? "bg-rose-50 border-rose-300 text-rose-800 shadow-xs" : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setIncWizardStep(2)}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    Next: Location <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {incWizardStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Barangay / Street Location</label>
                  <input
                    type="text"
                    value={incForm.locationName}
                    onChange={e => setIncForm({ ...incForm, locationName: e.target.value })}
                    placeholder="Barangay San Jose Sector 4"
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Automatic GPS Coordinates:</span>
                  <span className="font-mono text-emerald-700 font-bold">14.1134° N, 121.3938° E</span>
                </div>

                <div className="pt-4 flex justify-between">
                  <button onClick={() => setIncWizardStep(1)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Back</button>
                  <button onClick={() => setIncWizardStep(3)} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">Next: Details <ArrowRight className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )}

            {/* Step 3: Description & Submit */}
            {incWizardStep === 3 && (
              <form onSubmit={handleIncidentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Incident Headline</label>
                  <input
                    type="text"
                    required
                    value={incForm.title}
                    onChange={e => setIncForm({ ...incForm, title: e.target.value })}
                    placeholder="e.g., Trapped on roof due to rising water"
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description & Situation</label>
                  <textarea
                    rows={3}
                    value={incForm.description}
                    onChange={e => setIncForm({ ...incForm, description: e.target.value })}
                    placeholder="Describe what is happening on scene..."
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl p-3 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Number of People Affected</label>
                  <input
                    type="number"
                    value={incForm.affectedCount}
                    onChange={e => setIncForm({ ...incForm, affectedCount: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="pt-4 flex justify-between">
                  <button type="button" onClick={() => setIncWizardStep(2)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Back</button>
                  <button type="submit" className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
                    <Send className="w-4 h-4" /> Submit Emergency Incident
                  </button>
                </div>
              </form>
            )}

            {/* Step 4: Success Reference ID */}
            {incWizardStep === 4 && (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Emergency Incident Submitted</h3>
                <p className="text-xs text-slate-600 font-medium">Your report has been assigned Reference ID:</p>
                <div className="text-2xl font-mono font-black text-blue-600 bg-slate-50 p-3 rounded-xl border border-slate-200 inline-block">
                  {createdIncId}
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  LGU DRRM Command Center will verify your incident and dispatch responder units immediately.
                </p>
                <div className="pt-2">
                  <button onClick={() => onSelectTab && onSelectTab("track-requests")} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs">
                    Track Incident Status
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. REQUEST ASSISTANCE TAB */}
      {activeTab === "request-assistance" && (
        <div className="space-y-6 animate-in fade-in max-w-2xl mx-auto">
          <div>
            <h2 className="text-xl font-black text-slate-900">Request Emergency Assistance</h2>
            <p className="text-xs text-slate-500 mt-0.5">Submit request for rescue boat, medical team, or relief supply packs</p>
          </div>

          <form onSubmit={handleRequestSubmit} className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
            {createdReqId && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Assistance request logged! Reference ID: <span className="font-mono text-blue-700">{createdReqId}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assistance Type Required</label>
              <select
                value={reqForm.requestType}
                onChange={e => setReqForm({ ...reqForm, requestType: e.target.value as RequestType })}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:bg-white focus:outline-none"
              >
                <option value="RESCUE">Rescue Boat / Evacuation</option>
                <option value="MEDICAL">Medical Emergency / Ambulance</option>
                <option value="FOOD_WATER">Emergency Food & Water Pack</option>
                <option value="SHELTER">Shelter & Blanket</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone Number</label>
              <input
                type="text"
                required
                value={reqForm.contactPhone}
                onChange={e => setReqForm({ ...reqForm, contactPhone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Number of Persons Needing Help</label>
              <input
                type="number"
                value={reqForm.peopleCount}
                onChange={e => setReqForm({ ...reqForm, peopleCount: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Special Needs (Infants, Senior Citizens, Disabled)</label>
              <input
                type="text"
                value={reqForm.specialNeeds}
                onChange={e => setReqForm({ ...reqForm, specialNeeds: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Street Address / Landmark</label>
              <textarea
                rows={2}
                value={reqForm.address}
                onChange={e => setReqForm({ ...reqForm, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl p-3 focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
            >
              <LifeBuoy className="w-4 h-4" />
              Submit Assistance Request
            </button>
          </form>
        </div>
      )}

      {/* 4. EVACUATION CENTERS FINDER TAB */}
      {activeTab === "evacuation-centers" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Find Emergency Evacuation Centers</h2>
              <p className="text-xs text-slate-500 mt-0.5">Locate open shelters with available seats and facilities</p>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={centerSearch}
                onChange={e => setCenterSearch(e.target.value)}
                placeholder="Search shelter by name or barangay..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCenters.map(ec => {
              const occPct = Math.round((ec.currentOccupants / ec.capacity) * 100);

              return (
                <div key={ec.id} className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{ec.name}</h3>
                      <p className="text-xs text-slate-500">{ec.address} • {ec.barangay}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                      ec.status === "OPEN" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800"
                    }`}>
                      {ec.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Available Seats:</span>
                      <span className="font-bold text-emerald-700">{ec.capacity - ec.currentOccupants} remaining</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                      <div className="bg-blue-600 h-full" style={{ width: `${occPct}%` }} />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Contact: <span className="text-slate-800 font-mono font-bold">{ec.contactPhone}</span></span>
                    <button
                      onClick={() => alert(`Navigating route to ${ec.name}. Distance: 1.2 km`)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Get Directions
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. TRACK MY REPORTS TAB */}
      {activeTab === "track-requests" && (
        <div className="space-y-6 animate-in fade-in max-w-3xl mx-auto">
          <div>
            <h2 className="text-xl font-black text-slate-900">Track My Emergency Reports & Requests</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time status progression from LGU verification to responder arrival</p>
          </div>

          <div className="space-y-4">
            {assistanceRequests.map(req => (
              <div key={req.id} className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-600">{req.id}</span>
                    <h3 className="font-bold text-slate-900 text-sm">{req.requestType} Assistance</h3>
                  </div>
                  <StatusBadge type="status" value={req.status} size="sm" />
                </div>

                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">{req.description}</p>

                {/* Progress Pipeline */}
                <div className="pt-2">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Live Incident Pipeline:</div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span className="text-emerald-700">1. Submitted</span>
                    <span>→</span>
                    <span className={req.status !== "SUBMITTED" ? "text-emerald-700" : ""}>2. Verified by LGU</span>
                    <span>→</span>
                    <span className={req.status === "ASSIGNED" || req.status === "RESOLVED" ? "text-blue-600" : ""}>3. Responder Unit En Route</span>
                  </div>
                  <div className={`flex items-center gap-2 ${req.status === "RESOLVED" ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className={req.status === "RESOLVED" ? "text-emerald-700" : ""}>4. Resolved</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
