import React, { useState } from "react";
import {
  MapPin,
  AlertOctagon,
  Users2,
  Home,
  LifeBuoy,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  Eye,
  EyeOff,
  Phone,
  Shield,
  Send
} from "lucide-react";
import { useSmartRelief } from "../../context/SmartReliefContext";
import { Incident, EvacuationCenter, Responder, AssistanceRequest } from "../../types";
import { StatusBadge } from "../common/StatusBadge";

interface GISMapProps {
  onSelectIncident?: (incident: Incident) => void;
  onSelectRequest?: (request: AssistanceRequest) => void;
}

export const InteractiveGISMap: React.FC<GISMapProps> = ({
  onSelectIncident,
  onSelectRequest
}) => {
  const {
    incidents,
    evacuationCenters,
    responders,
    assistanceRequests,
    assignResponderToIncident
  } = useSmartRelief();

  // Layer Toggles
  const [showIncidents, setShowIncidents] = useState(true);
  const [showResponders, setShowResponders] = useState(true);
  const [showEvacuation, setShowEvacuation] = useState(true);
  const [showRequests, setShowRequests] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Selected Pin for Popover Detail
  const [selectedPin, setSelectedPin] = useState<{
    type: "INCIDENT" | "RESPONDER" | "EVACUATION" | "REQUEST";
    data: any;
  } | null>(null);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [assigningResponderForIncId, setAssigningResponderForIncId] = useState<string | null>(null);

  // Bounds mapping helper for lat/lng to SVG canvas percentage
  // Metro Manila area lat ~14.58 to 14.62, lng ~120.97 to 121.01
  const mapCoords = (lat: number, lng: number) => {
    const minLat = 14.575;
    const maxLat = 14.625;
    const minLng = 120.965;
    const maxLng = 121.015;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100; // inverted Y

    return {
      x: Math.min(95, Math.max(5, x)),
      y: Math.min(95, Math.max(5, y))
    };
  };

  return (
    <div className="relative w-full h-[650px] bg-slate-900 border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
      
      {/* Top Map Toolbar Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Layer Toggle Bar */}
        <div className="pointer-events-auto bg-white/95 border border-slate-200 backdrop-blur-md p-1.5 rounded-xl shadow-md flex items-center gap-1 overflow-x-auto max-w-full">
          <div className="text-[11px] font-bold text-slate-700 px-2 border-r border-slate-200 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">GIS Layers</span>
          </div>

          <button
            onClick={() => setShowIncidents(!showIncidents)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              showIncidents ? "bg-rose-50 text-rose-800 border border-rose-200" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>Incidents ({incidents.length})</span>
          </button>

          <button
            onClick={() => setShowResponders(!showResponders)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              showResponders ? "bg-amber-50 text-amber-800 border border-amber-200" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Responders ({responders.length})</span>
          </button>

          <button
            onClick={() => setShowEvacuation(!showEvacuation)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              showEvacuation ? "bg-blue-50 text-blue-800 border border-blue-200" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Home className="w-3.5 h-3.5 text-blue-600" />
            <span>Evacuation ({evacuationCenters.length})</span>
          </button>

          <button
            onClick={() => setShowRequests(!showRequests)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              showRequests ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5 text-emerald-600" />
            <span>Requests ({assistanceRequests.length})</span>
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
              showHeatmap ? "bg-purple-50 text-purple-800 border border-purple-200" : "text-slate-600 hover:text-slate-900"
            }`}
            title="Toggle Hazard Zone Heatmap Overlay"
          >
            {showHeatmap ? <Eye className="w-3.5 h-3.5 text-purple-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden md:inline">Heatmap</span>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="pointer-events-auto bg-white/95 border border-slate-200 backdrop-blur-md p-1 rounded-xl flex items-center gap-1 shadow-md">
          <button
            onClick={() => setZoomLevel(prev => Math.min(1.8, prev + 0.2))}
            className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.2))}
            className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Reset Map View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Vector Map Stage */}
      <div
        className="w-full h-full relative overflow-hidden transition-transform duration-300 ease-out"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
      >
        {/* SVG Tactical Map Canvas Background */}
        <svg className="w-full h-full absolute inset-0 pointer-events-none select-none opacity-40">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
            </pattern>
            {/* Flood Heatmap Radial Gradients */}
            <radialGradient id="floodRisk1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="landslideRisk" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid lines */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Pasig Riverway Path Vector */}
          <path
            d="M 10 90 Q 30 70, 50 60 T 90 20"
            fill="none"
            stroke="#0284c7"
            strokeWidth="12"
            strokeLinecap="round"
            className="opacity-60"
          />
          <path
            d="M 10 90 Q 30 70, 50 60 T 90 20"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="animate-pulse opacity-80"
          />

          {/* Secondary Streams */}
          <path d="M 50 60 Q 65 80, 85 95" fill="none" stroke="#0284c7" strokeWidth="6" className="opacity-40" />

          {/* Barangay District Boundaries */}
          <rect x="15%" y="15%" width="30%" height="35%" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />
          <text x="17%" y="19%" fill="#64748b" fontSize="10" fontWeight="bold">BARANGAY SAN JOSE (SECTOR 4)</text>

          <rect x="52%" y="10%" width="38%" height="45%" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />
          <text x="54%" y="14%" fill="#64748b" fontSize="10" fontWeight="bold">BARANGAY CENTRAL</text>

          <rect x="20%" y="58%" width="40%" height="32%" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />
          <text x="22%" y="62%" fill="#64748b" fontSize="10" fontWeight="bold">BARANGAY 659 EVACUATION ZONE</text>

          {/* Hazard Heatmap Circles */}
          {showHeatmap && (
            <>
              <circle cx="48%" cy="52%" r="120" fill="url(#floodRisk1)" />
              <circle cx="82%" cy="22%" r="80" fill="url(#landslideRisk)" />
            </>
          )}

          {/* Dispatch Active Route Lines */}
          {incidents.filter(i => i.status === "ASSIGNED" || i.status === "RESPONDING").map(inc => {
            const incPos = mapCoords(inc.lat, inc.lng);
            // find assigned responder
            const resp = responders.find(r => inc.assignedResponderIds.includes(r.id));
            if (!resp) return null;
            const respPos = mapCoords(resp.lat, resp.lng);

            return (
              <g key={`route-${inc.id}`}>
                <line
                  x1={`${respPos.x}%`}
                  y1={`${respPos.y}%`}
                  x2={`${incPos.x}%`}
                  y2={`${incPos.y}%`}
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="5 5"
                  className="animate-dash"
                />
              </g>
            );
          })}
        </svg>

        {/* Dynamic Map Pin Markers */}

        {/* 1. Incident Pins */}
        {showIncidents &&
          incidents.map(inc => {
            const pos = mapCoords(inc.lat, inc.lng);
            const isCritical = inc.severity === "CRITICAL";

            return (
              <button
                key={inc.id}
                onClick={() => setSelectedPin({ type: "INCIDENT", data: inc })}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group transition-transform hover:scale-125 focus:outline-none"
              >
                <div className="relative">
                  {isCritical && (
                    <span className="absolute -inset-2 rounded-full bg-rose-500/40 animate-ping" />
                  )}
                  <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-rose-500 shadow-xl flex items-center justify-center text-rose-400 group-hover:border-rose-300">
                    <AlertOctagon className="w-4 h-4" />
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-slate-100 text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
                  {inc.title}
                </div>
              </button>
            );
          })}

        {/* 2. Responder Pins */}
        {showResponders &&
          responders.map(resp => {
            const pos = mapCoords(resp.lat, resp.lng);

            return (
              <button
                key={resp.id}
                onClick={() => setSelectedPin({ type: "RESPONDER", data: resp })}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group transition-transform hover:scale-125 focus:outline-none"
              >
                <div className="relative">
                  <span className="absolute -inset-1 rounded-full bg-amber-400/30 animate-pulse" />
                  <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-amber-400 shadow-xl flex items-center justify-center text-amber-300">
                    <Users2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-slate-100 text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
                  {resp.name} ({resp.status})
                </div>
              </button>
            );
          })}

        {/* 3. Evacuation Center Pins */}
        {showEvacuation &&
          evacuationCenters.map(ec => {
            const pos = mapCoords(ec.lat, ec.lng);
            const isFull = ec.status === "FULL";

            return (
              <button
                key={ec.id}
                onClick={() => setSelectedPin({ type: "EVACUATION", data: ec })}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group transition-transform hover:scale-125 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-blue-400 shadow-xl flex items-center justify-center text-blue-300">
                  <Home className="w-4 h-4" />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-slate-100 text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
                  {ec.name} ({ec.currentOccupants}/{ec.capacity})
                </div>
              </button>
            );
          })}

        {/* 4. Assistance Request Pins */}
        {showRequests &&
          assistanceRequests.map(req => {
            const pos = mapCoords(req.lat, req.lng);

            return (
              <button
                key={req.id}
                onClick={() => setSelectedPin({ type: "REQUEST", data: req })}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group transition-transform hover:scale-125 focus:outline-none"
              >
                <div className="w-7 h-7 rounded-full bg-slate-950 border-2 border-emerald-400 shadow-xl flex items-center justify-center text-emerald-300">
                  <LifeBuoy className="w-3.5 h-3.5" />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-slate-100 text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
                  Request #{req.id} ({req.citizenName})
                </div>
              </button>
            );
          })}
      </div>

      {/* Pin Detail Overlay Popover Card */}
      {selectedPin && (
        <div className="absolute bottom-4 left-4 right-4 z-30 bg-white/95 border border-slate-200 backdrop-blur-xl p-4 rounded-xl shadow-lg animate-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge
                  type="simple"
                  value={selectedPin.type}
                  size="sm"
                />
                <span className="text-xs text-slate-500 font-mono font-bold">
                  ID: {selectedPin.data.id}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900">
                {selectedPin.data.title || selectedPin.data.name || `Request by ${selectedPin.data.citizenName}`}
              </h4>

              <p className="text-xs text-slate-600 mt-1 max-w-2xl line-clamp-2 font-medium">
                {selectedPin.data.description || selectedPin.data.address || selectedPin.data.locationName}
              </p>
            </div>

            <button
              onClick={() => setSelectedPin(null)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Quick Action buttons inside Popover */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-medium">{selectedPin.data.barangay || "Central District"}</span>
            </div>

            <div className="flex items-center gap-2">
              {selectedPin.type === "INCIDENT" && (
                <>
                  <button
                    onClick={() => {
                      if (onSelectIncident) onSelectIncident(selectedPin.data as Incident);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Dispatch Command
                  </button>
                </>
              )}

              {selectedPin.type === "REQUEST" && (
                <button
                  onClick={() => {
                    if (onSelectRequest) onSelectRequest(selectedPin.data as AssistanceRequest);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <LifeBuoy className="w-3.5 h-3.5" />
                  View Request Details
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Map Legend Footer */}
      <div className="p-3 bg-white/95 border-t border-slate-200 text-[11px] text-slate-700 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Critical Incident
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Active Responder
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Evacuation Center
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Citizen Request
          </span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono font-medium">
          Coordinates: 14.5995° N, 120.9842° E (GIS Datum: WGS84)
        </div>
      </div>
    </div>
  );
};
