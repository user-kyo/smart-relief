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

interface GISMapProps {
  onSelectIncident?: (incident: Incident) => void;
  onSelectRequest?: (request: AssistanceRequest) => void;
  mini?: boolean;
}

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

export const InteractiveGISMap: React.FC<GISMapProps> = ({
  onSelectIncident,
  onSelectRequest,
  mini = false
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
    <div className={`relative w-full ${mini ? 'h-[350px]' : 'h-[650px]'} bg-slate-900 border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col`}>
      
      {/* Top Map Toolbar Bar (Overlapping Map) */}
      <div className="absolute top-4 left-4 right-16 z-[1000] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Layer Toggle Bar */}
        <div className="pointer-events-auto bg-white/95 border border-slate-200 backdrop-blur-md p-1.5 rounded-xl shadow-md flex items-center gap-1 overflow-x-auto max-w-full">
          <div className="text-[11px] font-bold text-slate-700 px-2 border-r border-slate-200 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Layers</span>
          </div>

          <button
            onClick={() => setShowIncidents(!showIncidents)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              showIncidents ? "bg-rose-50 text-rose-800 border border-rose-200" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Incidents ({incidents.length})</span>
          </button>

          <button
            onClick={() => setShowResponders(!showResponders)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              showResponders ? "bg-amber-50 text-amber-800 border border-amber-200" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users2 className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Responders ({responders.length})</span>
          </button>

          <button
            onClick={() => setShowEvacuation(!showEvacuation)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              showEvacuation ? "bg-blue-50 text-blue-800 border border-blue-200" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Home className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Evacuation ({evacuationCenters.length})</span>
          </button>

          <button
            onClick={() => setShowRequests(!showRequests)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              showRequests ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden lg:inline">Requests ({assistanceRequests.length})</span>
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
              showHeatmap ? "bg-purple-50 text-purple-800 border border-purple-200" : "text-slate-600 hover:text-slate-900"
            }`}
            title="Toggle Hazard Zone Heatmap Overlay"
          >
            {showHeatmap ? <Eye className="w-3.5 h-3.5 text-purple-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>
      </div>

      <MapContainer
        center={CENTER}
        zoom={14}
        zoomControl={false}
        className="w-full h-full z-0 relative"
      >
        <ZoomControl position="topright" />
        
        {/* OpenStreetMap Dark/CartoDB Dark Matter equivalent or just standard OSM */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
    </div>
  );
};
