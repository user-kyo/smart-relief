import React, { useState, useMemo } from "react";
import { HandHeart, ChevronDown, Check, Users } from "lucide-react";
import { useSmartRelief } from "../../../context/SmartReliefContext";
import { StatusBadge } from "../../common/StatusBadge";
import { motion, AnimatePresence } from "motion/react";

export function CitizenRequestsTab() {
  const { assistanceRequests, responders, updateRequestStatus } = useSmartRelief();
  const [reqFilterType, setReqFilterType] = useState("ALL");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [activeAssignDropdownId, setActiveAssignDropdownId] = useState<string | null>(null);

  const filteredRequests = useMemo(() => 
    assistanceRequests.filter(r => reqFilterType === "ALL" || r.requestType === reqFilterType), 
  [assistanceRequests, reqFilterType]);

  const filterOptions = [
    { value: "ALL", label: "All Assistance Types" },
    { value: "RESCUE", label: "Boat / Heavy Rescue" },
    { value: "MEDICAL", label: "Medical Emergency" },
    { value: "FOOD_WATER", label: "Food & Potable Water" },
    { value: "SHELTER", label: "Shelter Assistance" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      className="space-y-6"
    >
      <div className="group relative z-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-transparent dark:from-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <HandHeart className="w-6 h-6 text-amber-500" />
            Citizen Assistance Requests Queue
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Triage rescue, medical, and food supply requests submitted by the public</p>
        </div>

        <div className="relative z-10">
          <button
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 font-bold rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm cursor-pointer min-w-[180px] text-left relative flex items-center transition-all hover:bg-white dark:hover:bg-slate-800"
          >
            <span className="truncate block">
              {filterOptions.find(opt => opt.value === reqFilterType)?.label || "All Assistance Types"}
            </span>
            <motion.div 
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              animate={{ rotate: isFilterDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isFilterDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-full right-0 mt-2 w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-[#E2E8F0]/80 dark:border-slate-700/80 rounded-xl shadow-xl z-[100] overflow-hidden"
              >
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setReqFilterType(option.value);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${reqFilterType === option.value ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRequests.map(req => (
          <div key={req.id} className="group relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            <div className="p-5 flex-1 space-y-4 relative z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md inline-block mb-1">{req.id}</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base truncate">{req.citizenName}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{req.citizenPhone}</p>
                </div>
                <div className="shrink-0">
                  <StatusBadge type="status" value={req.status} size="sm" />
                </div>
              </div>

              <div className="p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl space-y-2 border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wide">
                  <Users className="w-3.5 h-3.5" />
                  {req.requestType ? String(req.requestType).replace("_", " ") : "Unknown"} • {req.peopleCount} Affected
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium line-clamp-3">
                  {req.description}
                </p>
                {req.specialNeeds && (
                  <div className="text-xs text-rose-600 dark:text-rose-400 font-bold flex items-start gap-1.5 pt-1">
                    <span>⚠️</span>
                    <span>{req.specialNeeds}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-20">
              <span className="text-slate-500 dark:text-slate-400 text-xs font-medium truncate shrink-0 max-w-[50%]">
                {req.barangay}
              </span>
              
              <div className="relative z-30 shrink-0">
                <button
                  onClick={() => setActiveAssignDropdownId(activeAssignDropdownId === req.id ? null : req.id)}
                  className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all min-w-[140px]
                    ${req.assignedResponderId 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/40' 
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-sm'
                    }
                  `}
                >
                  <span className="truncate">
                    {req.assignedResponderId 
                      ? responders.find(r => r.id === req.assignedResponderId)?.name || 'Assigned'
                      : 'Assign Unit...'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${activeAssignDropdownId === req.id ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {activeAssignDropdownId === req.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, filter: "blur(2px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -5, filter: "blur(2px)" }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden py-1 z-[60]"
                    >
                      <div className="max-h-48 overflow-y-auto custom-scrollbar">
                        {responders.length === 0 && (
                          <div className="px-3 py-2 text-xs text-slate-500 text-center italic">No responders available</div>
                        )}
                        {responders.map(r => (
                          <button
                            key={r.id}
                            onClick={() => {
                              updateRequestStatus(req.id, "ASSIGNED", r.id);
                              setActiveAssignDropdownId(null);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors flex items-center justify-between
                              ${req.assignedResponderId === r.id 
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                              }
                            `}
                          >
                            <span className="truncate">{r.name}</span>
                            {req.assignedResponderId === r.id && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ))}
        
        {filteredRequests.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <HandHeart className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
            <p className="font-medium">No requests found for this filter.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
