import React, { useState, useMemo } from "react";
import { AlertOctagon, Plus, FileText, X, ShieldAlert, Crosshair, MapPin, ChevronDown } from "lucide-react";
import { useSmartRelief } from "../../../context/SmartReliefContext";
import { StatusBadge } from "../../common/StatusBadge";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Responder } from "../../../types";
import { motion, AnimatePresence } from "motion/react";
import { useDroppable } from '@dnd-kit/core';

function SortableResponderItem({ responder }: { responder: Responder }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: responder.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative overflow-hidden p-3 mb-2 text-xs font-semibold bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-sm rounded-xl cursor-grab hover:border-blue-400 dark:hover:border-blue-500 flex items-center justify-between hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="relative z-10 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)] ${responder.status === 'AVAILABLE' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-slate-400 shadow-slate-400/50'}`} />
        <span className="text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{responder.name}</span>
      </div>
      <span className="relative z-10 text-[10px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{responder.roleType}</span>
    </div>
  );
}

function IncidentRow({ inc, verifyIncident, onSelect, assignedResponders, assignResponderToIncident }: any) {
  const { isOver, setNodeRef } = useDroppable({
    id: `incident-${inc.id}`,
    data: { incidentId: inc.id }
  });

  return (
    <tr 
      ref={setNodeRef} 
      className={`group border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all ${
        isOver ? 'bg-blue-50/80 dark:bg-blue-900/20 shadow-[inset_0_0_0_2px_rgba(59,130,246,0.5)]' : ''
      }`}
    >
      <td className="p-4 align-top">
        <div className="flex items-start gap-3">
          <div className="mt-1 shrink-0">
            {inc.severity === "CRITICAL" ? (
              <ShieldAlert className="w-5 h-5 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
            ) : (
              <AlertOctagon className="w-5 h-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
            )}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{inc.title}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-2 items-center">
              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">ID: {inc.id.slice(0, 8)}</span>
              <span className="flex items-center gap-1"><Crosshair className="w-3 h-3" /> {inc.affectedCount} affected</span>
              <span>•</span>
              <span>Reported by: <span className="font-medium text-slate-700 dark:text-slate-300">{inc.reportedBy}</span></span>
            </div>
          </div>
        </div>
      </td>
      <td className="p-4 align-top">
        <StatusBadge type="severity" value={inc.severity} size="sm" />
      </td>
      <td className="p-4 align-top">
        <StatusBadge type="status" value={inc.status} size="sm" />
      </td>
      <td className="p-4 align-top">
        <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300 font-medium text-xs">
          <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
          <span className="line-clamp-2">{inc.locationName}</span>
        </div>
      </td>
      <td className="p-4 align-top">
        {inc.assignedResponderNames && inc.assignedResponderNames.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {inc.assignedResponderNames.map((name: string, idx: number) => (
              <span key={idx} className="px-2 py-1 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 rounded-md text-[10px] font-bold shadow-sm flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {name}
              </span>
            ))}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-medium italic shadow-sm">
            Unassigned
          </span>
        )}
      </td>
      <td className="p-4 align-top text-right">
        <div className="flex items-center justify-end gap-2 relative z-10">
          {inc.status === "REPORTED" && (
            <button
              onClick={(e) => { e.stopPropagation(); verifyIncident(inc.id); }}
              className="px-3 py-1.5 bg-[#111827] dark:bg-blue-600 hover:bg-[#1f2937] dark:hover:bg-blue-700 text-white shadow-sm rounded-lg text-[11px] font-bold cursor-pointer transition-all"
            >
              Verify
            </button>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onSelect(inc); }}
            className="p-2 bg-slate-100 dark:bg-slate-800/50 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg cursor-pointer transition-colors"
            title="View Timeline & Details"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}


export const IncidentManagementTab: React.FC<{
  incidents: any[];
  responders: Responder[];
  verifyIncident: (id: string) => void;
  assignResponderToIncident: (incId: string, respId: string) => void;
  setIsNewIncidentOpen: (open: boolean) => void;
  setSelectedIncident: (inc: any) => void;
}> = ({
  incidents,
  responders,
  verifyIncident,
  assignResponderToIncident,
  setIsNewIncidentOpen,
  setSelectedIncident
}) => {
  const [incFilterSeverity, setIncFilterSeverity] = useState("ALL");
  const [isSeverityDropdownOpen, setIsSeverityDropdownOpen] = useState(false);
  const filteredIncidents = useMemo(() => incidents.filter(i => incFilterSeverity === "ALL" || i.severity === incFilterSeverity), [incidents, incFilterSeverity]);
  const availableResponders = useMemo(() => responders.filter(r => r.status === "AVAILABLE"), [responders]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && over.id.toString().startsWith("incident-")) {
      const incidentId = over.data.current.incidentId;
      const responderId = active.id;
      assignResponderToIncident(incidentId, responderId);
    }
  };

  const activeResponder = responders.find(r => r.id === activeId);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      className="space-y-6"
    >
      <div className="group relative z-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50/30 to-transparent dark:from-rose-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-rose-500" />
            Incident Management & Command Dispatch
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Drag and drop available responders to incidents to dispatch them to the field.</p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <div className="relative z-50">
            <button
              onClick={() => setIsSeverityDropdownOpen(!isSeverityDropdownOpen)}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 font-bold rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm cursor-pointer min-w-[140px] text-left relative flex items-center transition-all hover:bg-white dark:hover:bg-slate-800"
            >
              <span className="truncate block">
                {
                  [
                    { value: "ALL", label: "All Severities" },
                    { value: "CRITICAL", label: "Critical" },
                    { value: "HIGH", label: "High" },
                    { value: "MEDIUM", label: "Medium" },
                    { value: "LOW", label: "Low" }
                  ].find(opt => opt.value === incFilterSeverity)?.label || "All Severities"
                }
              </span>
              <motion.div 
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                animate={{ rotate: isSeverityDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isSeverityDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full right-0 mt-2 w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-[#E2E8F0]/80 dark:border-slate-700/80 rounded-xl shadow-xl z-[100] overflow-hidden"
                >
                  {[
                    { value: "ALL", label: "All Severities" },
                    { value: "CRITICAL", label: "Critical" },
                    { value: "HIGH", label: "High" },
                    { value: "MEDIUM", label: "Medium" },
                    { value: "LOW", label: "Low" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setIncFilterSeverity(option.value);
                        setIsSeverityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${incFilterSeverity === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setIsNewIncidentOpen(true)}
            className="px-5 py-2.5 bg-[#111827] dark:bg-white text-white dark:text-[#0F172A] rounded-xl text-xs font-bold transition-all flex items-center gap-2 hover:bg-[#1f2937] dark:hover:bg-slate-100 active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Incident</span>
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Dispatch Sidebar for Responders */}
          <div className="group w-full lg:w-72 shrink-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 shadow-lg flex flex-col h-[calc(100vh-220px)] sticky top-6 relative overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative z-10 mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Dispatch Units
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                Drag a unit card and drop it onto an incident row to assign.
              </p>
            </div>
            
            <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1">
              <SortableContext items={availableResponders.map(r => r.id)} strategy={verticalListSortingStrategy}>
                {availableResponders.length > 0 ? (
                  <div className="space-y-1 pb-4">
                    {availableResponders.map(resp => (
                      <SortableResponderItem key={resp.id} responder={resp} />
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                      <Crosshair className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No units available</p>
                    <p className="text-[10px] text-slate-500 mt-1">All responders are currently dispatched or offline.</p>
                  </div>
                )}
              </SortableContext>
            </div>
          </div>

          {/* Incidents Table */}
          <div className="group flex-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[calc(100vh-220px)] relative hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 to-transparent dark:from-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative z-10 overflow-auto flex-1 custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider sticky top-0 z-20">
                  <tr>
                    <th className="p-4 pl-6">Incident Details</th>
                    <th className="p-4">Severity</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Assigned Units</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700 dark:text-slate-300">
                  {filteredIncidents.length > 0 ? (
                    filteredIncidents.map(inc => (
                      <IncidentRow
                        key={inc.id}
                        inc={inc}
                        verifyIncident={verifyIncident}
                        onSelect={setSelectedIncident}
                        assignResponderToIncident={assignResponderToIncident}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <AlertOctagon className="w-8 h-8 text-slate-400" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No active incidents found</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {incFilterSeverity === "ALL" 
                              ? "There are currently no reported incidents in the system."
                              : `There are no active incidents matching the ${incFilterSeverity} severity filter.`}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DragOverlay zIndex={9999} dropAnimation={null}>
          {activeId && activeResponder ? (
            <div className="p-3 w-64 text-xs font-semibold bg-white dark:bg-slate-800 border-2 border-blue-500 shadow-2xl rounded-xl flex items-center justify-between opacity-95 scale-105 cursor-grabbing transform rotate-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                <span className="text-slate-900 dark:text-white font-bold">{activeResponder.name}</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{activeResponder.roleType}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </motion.div>
  );
};
