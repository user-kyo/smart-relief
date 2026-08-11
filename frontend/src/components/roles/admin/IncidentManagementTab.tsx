import React, { useState } from "react";
import { AlertOctagon, Plus, FileText, X } from "lucide-react";
import { useSmartRelief } from "../../../context/SmartReliefContext";
import { StatusBadge } from "../../common/StatusBadge";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Responder } from "../../../types";

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
      className="p-2 mb-2 text-xs font-semibold bg-white border border-slate-200 shadow-sm rounded-lg cursor-grab hover:border-blue-300 flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${responder.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
        <span className="text-slate-800">{responder.name}</span>
      </div>
      <span className="text-[10px] text-slate-500 font-normal">{responder.roleType}</span>
    </div>
  );
}

// Droppable Incident row wrapper
function DroppableIncidentRow({ incident, children, isOver }: any) {
  // To handle drops on the incident row, we need useDroppable from dnd-kit
  // But wait, the standard way in dnd-kit is to use useDroppable. Let's create it.
  return (
    <tr className={`hover:bg-slate-50 transition-colors ${isOver ? 'bg-blue-50/50' : ''}`}>
      {children}
    </tr>
  );
}

import { useDroppable } from '@dnd-kit/core';

function IncidentRow({ inc, verifyIncident, onSelect, assignedResponders, assignResponderToIncident }: any) {
  const { isOver, setNodeRef } = useDroppable({
    id: `incident-${inc.id}`,
    data: { incidentId: inc.id }
  });

  return (
    <tr ref={setNodeRef} className={`hover:bg-slate-50/80 transition-colors ${isOver ? 'bg-blue-50 ring-2 ring-inset ring-blue-300' : ''}`}>
      <td className="p-4">
        <div className="font-bold text-slate-900">{inc.title}</div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          ID: {inc.id} • Affected: {inc.affectedCount} people • Reported by: {inc.reportedBy}
        </div>
      </td>
      <td className="p-4">
        <StatusBadge type="severity" value={inc.severity} size="sm" />
      </td>
      <td className="p-4">
        <StatusBadge type="status" value={inc.status} size="sm" />
      </td>
      <td className="p-4 text-slate-700 font-medium">
        {inc.locationName}
      </td>
      <td className="p-4">
        {inc.assignedResponderNames && inc.assignedResponderNames.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {inc.assignedResponderNames.map((name: string, idx: number) => (
              <span key={idx} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">
                {name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-amber-600 italic font-medium">Unassigned</span>
        )}
      </td>
      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-2 relative z-10">
          {inc.status === "REPORTED" && (
            <button
              onClick={(e) => { e.stopPropagation(); verifyIncident(inc.id); }}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold cursor-pointer"
            >
              Verify
            </button>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onSelect(inc); }}
            className="p-1.5 bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded cursor-pointer"
            title="View Timeline & Details"
          >
            <FileText className="w-3.5 h-3.5" />
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
  const filteredIncidents = incidents.filter(i => incFilterSeverity === "ALL" || i.severity === incFilterSeverity);
  const availableResponders = responders.filter(r => r.status === "AVAILABLE");

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
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Incident Management & Command Dispatch</h2>
          <p className="text-xs text-slate-500 mt-0.5">Drag and drop available responders to incidents to dispatch them.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={incFilterSeverity}
            onChange={e => setIncFilterSeverity(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold rounded-xl px-3 py-2 focus:outline-none focus:bg-white"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <button
            onClick={() => setIsNewIncidentOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Incident</span>
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Dispatch Sidebar for Responders */}
          <div className="w-full lg:w-64 shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Dispatch Units</h3>
            <p className="text-[10px] text-slate-500 mb-4">Drag unit to assign to incident</p>
            
            <SortableContext items={availableResponders.map(r => r.id)} strategy={verticalListSortingStrategy}>
              {availableResponders.length > 0 ? (
                <div className="space-y-1">
                  {availableResponders.map(resp => (
                    <SortableResponderItem key={resp.id} responder={resp} />
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-4 text-center">No available responders</div>
              )}
            </SortableContext>
          </div>

          {/* Incidents Table */}
          <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Incident Details</th>
                    <th className="p-4">Severity</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Location / Barangay</th>
                    <th className="p-4">Assigned Responders</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredIncidents.map(inc => (
                    <IncidentRow
                      key={inc.id}
                      inc={inc}
                      verifyIncident={verifyIncident}
                      onSelect={setSelectedIncident}
                      assignResponderToIncident={assignResponderToIncident}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeId && activeResponder ? (
            <div className="p-2 w-56 text-xs font-semibold bg-white border-2 border-blue-400 shadow-xl rounded-lg flex items-center justify-between opacity-90 scale-105 cursor-grabbing">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-800">{activeResponder.name}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-normal">{activeResponder.roleType}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
