import React, { useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, TileLayer, Marker, Circle, ZoomControl, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  MapPin,
  AlertOctagon,
  Users2,
  Home,
  LifeBuoy,
  Layers,
  Eye,
  EyeOff,
  Send
} from "lucide-react";
import { useSmartRelief } from "../../context/SmartReliefContext";
import { Incident, EvacuationCenter, Responder, AssistanceRequest } from "../../types";
import { StatusBadge } from "../common/StatusBadge";

import { useMapEvents } from "react-leaflet";

interface GISMapProps {
  onSelectIncident?: (incident: Incident) => void;
  onSelectRequest?: (request: AssistanceRequest) => void;
  onMapClick?: (lat: number, lng: number) => void;
  mini?: boolean;
  hideLegend?: boolean;
  className?: string;
}

const MapClickHandler = ({ onMapClick, isPinMode, setIsPinMode }: { onMapClick?: (lat: number, lng: number) => void; isPinMode: boolean; setIsPinMode: (val: boolean) => void; }) => {
  useMapEvents({
    click(e) {
      if (isPinMode && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
        setIsPinMode(false);
      }
    },
  });
  return null;
};

// Custom Leaflet DivIcons using Tailwind
const createIncidentIcon = (isCritical: boolean) => {
  const html = renderToStaticMarkup(
    <div className="relative">
      {isCritical && (
        <span className="absolute -inset-2 rounded-full bg-rose-500/40 animate-ping" />
      )}
      <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-rose-500 shadow-xl flex items-center justify-center text-rose-400">
        <AlertOctagon className="w-4 h-4" />
      </div>
    </div>
  );
  return L.divIcon({ html, className: "bg-transparent border-0", iconSize: [32, 32], iconAnchor: [16, 16] });
};

const createResponderIcon = () => {
  const html = renderToStaticMarkup(
    <div className="relative">
      <span className="absolute -inset-1 rounded-full bg-amber-400/30 animate-pulse" />
      <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-amber-400 shadow-xl flex items-center justify-center text-amber-300">
        <Users2 className="w-4 h-4" />
      </div>
    </div>
  );
  return L.divIcon({ html, className: "bg-transparent border-0", iconSize: [32, 32], iconAnchor: [16, 16] });
};

const createEvacuationIcon = () => {
  const html = renderToStaticMarkup(
    <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-blue-400 shadow-xl flex items-center justify-center text-blue-300">
      <Home className="w-4 h-4" />
    </div>
  );
  return L.divIcon({ html, className: "bg-transparent border-0", iconSize: [32, 32], iconAnchor: [16, 16] });
};

const createRequestIcon = () => {
  const html = renderToStaticMarkup(
    <div className="w-7 h-7 rounded-full bg-slate-950 border-2 border-emerald-400 shadow-xl flex items-center justify-center text-emerald-300">
      <LifeBuoy className="w-3.5 h-3.5" />
    </div>
  );
  return L.divIcon({ html, className: "bg-transparent border-0", iconSize: [28, 28], iconAnchor: [14, 14] });
};

// Component to recenter map when selected pin changes (optional behavior, omitted to avoid jumping)
// We just use a fixed center for San Pablo City
const CENTER: [number, number] = [14.0720, 121.3250];

export const InteractiveGISMap = React.memo<GISMapProps>(({
  onSelectIncident,
  onSelectRequest,
  onMapClick,
  mini = false,
  hideLegend = false,
  className
}) => {
  const {
    incidents,
    evacuationCenters,
    responders,
    assistanceRequests
  } = useSmartRelief();

  // Layer Toggles
  const [showIncidents, setShowIncidents] = useState(true);
  const [showResponders, setShowResponders] = useState(true);
  const [showEvacuation, setShowEvacuation] = useState(true);
  const [showRequests, setShowRequests] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Pin Mode State
  const [isPinMode, setIsPinMode] = useState(false);

  // Selected Pin for Popover Detail
  const [selectedPin, setSelectedPin] = useState<{
    type: "INCIDENT" | "RESPONDER" | "EVACUATION" | "REQUEST";
    data: any;
  } | null>(null);

  // Icons
  const incidentIconNormal = createIncidentIcon(false);
  const incidentIconCritical = createIncidentIcon(true);
  const responderIcon = createResponderIcon();
  const evacuationIcon = createEvacuationIcon();
  const requestIcon = createRequestIcon();

  return (
    <div className={`relative w-full ${className || (mini ? 'h-[350px] bg-slate-900 border border-slate-200 rounded-xl overflow-hidden shadow-xs' : 'h-[650px] bg-slate-900 border border-slate-200 rounded-xl overflow-hidden shadow-xs')} flex flex-col`}>
      
      {/* Floating Tactical Layer Controls */}
      <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
        <div className="pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-2.5 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 w-[160px] flex flex-col gap-1 transition-all">
          <div className="flex items-center gap-2 mb-1.5 px-1 pb-1.5 border-b border-slate-200/50 dark:border-slate-700/50">
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Map Layers</span>
          </div>

          <button
            onClick={() => setShowIncidents(!showIncidents)}
            className={`flex items-center justify-between p-1.5 rounded-xl transition-all cursor-pointer ${showIncidents ? 'bg-rose-50 dark:bg-rose-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-lg ${showIncidents ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                <AlertOctagon className="w-3 h-3" />
              </div>
              <span className={`text-[11px] font-bold ${showIncidents ? 'text-rose-700 dark:text-rose-400' : 'text-slate-500'}`}>Incidents</span>
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${showIncidents ? 'bg-rose-200/50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>{incidents.length}</span>
          </button>

          <button
            onClick={() => setShowResponders(!showResponders)}
            className={`flex items-center justify-between p-1.5 rounded-xl transition-all cursor-pointer ${showResponders ? 'bg-amber-50 dark:bg-amber-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-lg ${showResponders ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                <Users2 className="w-3 h-3" />
              </div>
              <span className={`text-[11px] font-bold ${showResponders ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500'}`}>Responders</span>
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${showResponders ? 'bg-amber-200/50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>{responders.length}</span>
          </button>

          <button
            onClick={() => setShowEvacuation(!showEvacuation)}
            className={`flex items-center justify-between p-1.5 rounded-xl transition-all cursor-pointer ${showEvacuation ? 'bg-blue-50 dark:bg-blue-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-lg ${showEvacuation ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                <Home className="w-3 h-3" />
              </div>
              <span className={`text-[11px] font-bold ${showEvacuation ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500'}`}>Evacuation</span>
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${showEvacuation ? 'bg-blue-200/50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>{evacuationCenters.length}</span>
          </button>

          <button
            onClick={() => setShowRequests(!showRequests)}
            className={`flex items-center justify-between p-1.5 rounded-xl transition-all cursor-pointer ${showRequests ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-lg ${showRequests ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                <LifeBuoy className="w-3 h-3" />
              </div>
              <span className={`text-[11px] font-bold ${showRequests ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>Requests</span>
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${showRequests ? 'bg-emerald-200/50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>{assistanceRequests.length}</span>
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center justify-between p-1.5 rounded-xl transition-all cursor-pointer ${showHeatmap ? 'bg-purple-50 dark:bg-purple-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-lg ${showHeatmap ? 'bg-purple-500 text-white shadow-sm shadow-purple-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                {showHeatmap ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </div>
              <span className={`text-[11px] font-bold ${showHeatmap ? 'text-purple-700 dark:text-purple-400' : 'text-slate-500'}`}>Hazard Zones</span>
            </div>
          </button>

          {onMapClick && (
            <button
              onClick={() => setIsPinMode(!isPinMode)}
              className={`flex items-center justify-center p-2 rounded-xl transition-all cursor-pointer font-bold text-xs mt-2 ${isPinMode ? 'bg-rose-600 text-white shadow-md shadow-rose-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <MapPin className="w-3.5 h-3.5 mr-1.5" />
              {isPinMode ? "Click Map to Pin" : "Drop Incident Pin"}
            </button>
          )}
        </div>
      </div>

      <MapContainer
        center={CENTER}
        zoom={14}
        zoomControl={false}
        className={`w-full h-full z-0 relative ${isPinMode ? 'cursor-crosshair' : ''}`}
      >
        <MapClickHandler onMapClick={onMapClick} isPinMode={isPinMode} setIsPinMode={setIsPinMode} />
        <ZoomControl position="topright" />
        
        {/* Standard OpenStreetMap to avoid API key requirements */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showHeatmap && (
          <>
            <Circle 
              center={[14.0720, 121.3250]} 
              radius={800} 
              pathOptions={{ fillColor: '#ef4444', fillOpacity: 0.2, color: 'transparent' }} 
            />
            <Circle 
              center={[14.0850, 121.3380]} 
              radius={600} 
              pathOptions={{ fillColor: '#f59e0b', fillOpacity: 0.25, color: 'transparent' }} 
            />
          </>
        )}

        {showIncidents && incidents.map(inc => (
          <Marker 
            key={inc.id} 
            position={[inc.lat, inc.lng]} 
            icon={inc.severity === "CRITICAL" ? incidentIconCritical : incidentIconNormal}
            eventHandlers={{
              click: () => setSelectedPin({ type: "INCIDENT", data: inc })
            }}
          >
            <Tooltip direction="top" offset={[0, -16]} className="bg-slate-900 text-white border-0 font-bold text-xs">{inc.title}</Tooltip>
          </Marker>
        ))}

        {showResponders && responders.map(resp => (
          <Marker 
            key={resp.id} 
            position={[resp.lat, resp.lng]} 
            icon={responderIcon}
            eventHandlers={{
              click: () => setSelectedPin({ type: "RESPONDER", data: resp })
            }}
          >
            <Tooltip direction="top" offset={[0, -16]} className="bg-slate-900 text-white border-0 font-bold text-xs">{resp.name}</Tooltip>
          </Marker>
        ))}

        {showEvacuation && evacuationCenters.map(ec => (
          <Marker 
            key={ec.id} 
            position={[ec.lat, ec.lng]} 
            icon={evacuationIcon}
            eventHandlers={{
              click: () => setSelectedPin({ type: "EVACUATION", data: ec })
            }}
          >
            <Tooltip direction="top" offset={[0, -16]} className="bg-slate-900 text-white border-0 font-bold text-xs">{ec.name}</Tooltip>
          </Marker>
        ))}

        {showRequests && assistanceRequests.map(req => (
          <Marker 
            key={req.id} 
            position={[req.lat, req.lng]} 
            icon={requestIcon}
            eventHandlers={{
              click: () => setSelectedPin({ type: "REQUEST", data: req })
            }}
          >
            <Tooltip direction="top" offset={[0, -14]} className="bg-slate-900 text-white border-0 font-bold text-xs">{req.citizenName}</Tooltip>
          </Marker>
        ))}
      </MapContainer>

      {/* Pin Detail Overlay Popover Card */}
      {selectedPin && (
        <div className="absolute bottom-12 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[450px] z-[1000] bg-white/95 border border-slate-200 backdrop-blur-xl p-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-4">
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
                    Dispatch
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
                  View
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Map Legend Footer */}
      {!hideLegend && (
        <div className="relative z-[1000] p-2 bg-white/95 border-t border-slate-200 text-[10px] text-slate-700 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 font-medium flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Critical
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Responder
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Evacuation
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Request
            </span>
          </div>
          <div className="text-slate-500 font-mono font-medium hidden sm:block">
            GIS Datum: WGS84
          </div>
        </div>
      )}
    </div>
  );
});
