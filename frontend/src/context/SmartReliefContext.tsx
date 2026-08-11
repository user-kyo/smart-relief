import React, { createContext, useContext, useState, useEffect } from "react";
import {
  UserRole,
  SystemUser,
  Incident,
  AssistanceRequest,
  ResourceItem,
  EvacuationCenter,
  Responder,
  LGUOrganization,
  SystemLog,
  RolePermission,
  AIRecommendation,
  EmergencyAlert,
  IncidentSeverity,
  IncidentType,
  RequestType,
  ResourceCategory,
  StockStatus
} from "../types";
import {
  initialUsers,
  initialIncidents,
  initialAssistanceRequests,
  initialResources,
  initialEvacuationCenters,
  initialResponders,
  initialLGUs,
  initialLogs,
  initialRolePermissions,
  initialAIRecommendations,
  initialAlerts
} from "../data/initialData";

interface SmartReliefContextType {
  currentRole: UserRole;
  currentUser: SystemUser;
  users: SystemUser[];
  incidents: Incident[];
  assistanceRequests: AssistanceRequest[];
  resources: ResourceItem[];
  evacuationCenters: EvacuationCenter[];
  responders: Responder[];
  lgus: LGUOrganization[];
  systemLogs: SystemLog[];
  rolePermissions: RolePermission[];
  aiRecommendations: AIRecommendation[];
  alerts: EmergencyAlert[];
  isAiLoading: boolean;
  
  // Handlers
  setRole: (role: UserRole) => void;
  createIncident: (data: Partial<Incident>) => Incident;
  verifyIncident: (id: string) => void;
  assignResponderToIncident: (incidentId: string, responderId: string) => void;
  updateIncidentStatus: (id: string, status: Incident["status"], notes?: string) => void;
  
  createAssistanceRequest: (data: Partial<AssistanceRequest>) => AssistanceRequest;
  updateRequestStatus: (id: string, status: AssistanceRequest["status"], responderId?: string) => void;
  
  addResource: (data: Partial<ResourceItem>) => void;
  updateResourceStock: (id: string, deltaAvailable: number) => void;
  transferResource: (id: string, destination: string, quantity: number) => void;
  
  updateEvacuationOccupancy: (id: string, occupants: number) => void;
  updateEvacuationStatus: (id: string, status: EvacuationCenter["status"]) => void;
  
  updateResponderStatus: (id: string, status: Responder["status"], assignmentTitle?: string) => void;
  
  acceptAIRecommendation: (recId: string) => void;
  rejectAIRecommendation: (recId: string) => void;
  fetchAIRecommendations: (prompt?: string) => Promise<void>;
  
  addUser: (user: Partial<SystemUser>) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  toggleUserStatus: (userId: string) => void;
  
  updateRolePermissions: (role: UserRole, permissions: RolePermission["permissions"]) => void;
  addAlert: (alert: Partial<EmergencyAlert>) => void;
  toggleAlertStatus: (alertId: string) => void;
  addLog: (action: string, details: string, severity?: SystemLog["severity"]) => void;
  resetToDefaultData: () => void;
}

const SmartReliefContext = createContext<SmartReliefContextType | undefined>(undefined);

export const SmartReliefProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local storage hydrator helper
  const getStored = <T,>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(`smartrelief_v2_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  };

  const setStored = <T,>(key: string, value: T) => {
    try {
      localStorage.setItem(`smartrelief_v2_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error(e);
    }
  };

  const [currentRole, setCurrentRole] = useState<UserRole>(() => getStored("role", "ADMIN"));
  const [users, setUsers] = useState<SystemUser[]>(() => getStored("users", initialUsers));
  const [incidents, setIncidents] = useState<Incident[]>(() => getStored("incidents", initialIncidents));
  const [assistanceRequests, setAssistanceRequests] = useState<AssistanceRequest[]>(() => getStored("requests", initialAssistanceRequests));
  const [resources, setResources] = useState<ResourceItem[]>(() => getStored("resources", initialResources));
  const [evacuationCenters, setEvacuationCenters] = useState<EvacuationCenter[]>(() => getStored("centers", initialEvacuationCenters));
  const [responders, setResponders] = useState<Responder[]>(() => getStored("responders", initialResponders));
  const [lgus, setLgus] = useState<LGUOrganization[]>(() => getStored("lgus", initialLGUs));
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(() => getStored("logs", initialLogs));
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(() => getStored("permissions", initialRolePermissions));
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>(() => getStored("ai_recs", initialAIRecommendations));
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(() => getStored("alerts", initialAlerts));
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Sync to local storage on changes
  useEffect(() => setStored("role", currentRole), [currentRole]);
  useEffect(() => setStored("users", users), [users]);
  useEffect(() => setStored("incidents", incidents), [incidents]);
  useEffect(() => setStored("requests", assistanceRequests), [assistanceRequests]);
  useEffect(() => setStored("resources", resources), [resources]);
  useEffect(() => setStored("centers", evacuationCenters), [evacuationCenters]);
  useEffect(() => setStored("responders", responders), [responders]);
  useEffect(() => setStored("lgus", lgus), [lgus]);
  useEffect(() => setStored("logs", systemLogs), [systemLogs]);
  useEffect(() => setStored("permissions", rolePermissions), [rolePermissions]);
  useEffect(() => setStored("ai_recs", aiRecommendations), [aiRecommendations]);
  useEffect(() => setStored("alerts", alerts), [alerts]);

  const currentUser = users.find(u => u.role === currentRole) || users[0];

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    addLog("ROLE_SWITCH", `Switched active portal view to ${role}`, "INFO");
  };

  const addLog = (action: string, details: string, severity: SystemLog["severity"] = "INFO") => {
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      action,
      details,
      ipAddress: "127.0.0.1",
      severity
    };
    setSystemLogs(prev => [newLog, ...prev]);
  };

  // Incident handlers
  const createIncident = (data: Partial<Incident>): Incident => {
    const newInc: Incident = {
      id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: data.title || "Reported Emergency Incident",
      description: data.description || "Field disaster report.",
      type: data.type || "FLOOD",
      severity: data.severity || "HIGH",
      status: data.status || "REPORTED",
      locationName: data.locationName || "Barangay Central Sector",
      barangay: data.barangay || "Barangay Central",
      lguName: currentUser.lguName || "Manila DRRM Operations Center",
      lat: data.lat || 14.5990 + (Math.random() - 0.5) * 0.02,
      lng: data.lng || 120.9840 + (Math.random() - 0.5) * 0.02,
      affectedCount: data.affectedCount || 1,
      reportedBy: data.reportedBy || currentUser.name,
      reportedByPhone: data.reportedByPhone || currentUser.phone,
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedResponderIds: [],
      photoUrl: data.photoUrl,
      timeline: [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: "Incident reported",
          performedBy: currentUser.name
        }
      ]
    };

    setIncidents(prev => [newInc, ...prev]);
    addLog("INCIDENT_CREATED", `Created Incident ${newInc.id}: ${newInc.title}`, newInc.severity === "CRITICAL" ? "CRITICAL" : "WARNING");
    return newInc;
  };

  const verifyIncident = (id: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        const updatedTimeline = [
          ...inc.timeline,
          {
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            action: "Incident verified by LGU-DRRM Command",
            performedBy: currentUser.name
          }
        ];
        return {
          ...inc,
          status: "VERIFIED",
          updatedAt: new Date().toISOString(),
          timeline: updatedTimeline
        };
      }
      return inc;
    }));
    addLog("INCIDENT_VERIFIED", `Verified Incident ${id}`, "INFO");
  };

  const assignResponderToIncident = (incidentId: string, responderId: string) => {
    const responder = responders.find(r => r.id === responderId);
    if (!responder) return;

    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const ids = inc.assignedResponderIds.includes(responderId)
          ? inc.assignedResponderIds
          : [...inc.assignedResponderIds, responderId];
        const names = [...(inc.assignedResponderNames || []), responder.name];
        
        return {
          ...inc,
          status: "ASSIGNED",
          assignedResponderIds: ids,
          assignedResponderNames: names,
          updatedAt: new Date().toISOString(),
          timeline: [
            ...inc.timeline,
            {
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              action: `Assigned responder unit: ${responder.name}`,
              performedBy: currentUser.name
            }
          ]
        };
      }
      return inc;
    }));

    // Update responder assignment status
    setResponders(prev => prev.map(r => {
      if (r.id === responderId) {
        return {
          ...r,
          status: "EN_ROUTE",
          currentAssignmentId: incidentId,
          currentAssignmentTitle: incidents.find(i => i.id === incidentId)?.title || "Field Emergency"
        };
      }
      return r;
    }));

    addLog("RESPONDER_ASSIGNED", `Assigned ${responder.name} to Incident ${incidentId}`, "INFO");
  };

  const updateIncidentStatus = (id: string, status: Incident["status"], notes?: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          status,
          updatedAt: new Date().toISOString(),
          timeline: [
            ...inc.timeline,
            {
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              action: `Status updated to ${status}${notes ? `: ${notes}` : ""}`,
              performedBy: currentUser.name
            }
          ]
        };
      }
      return inc;
    }));
    addLog("INCIDENT_STATUS_UPDATE", `Updated Incident ${id} status to ${status}`, "INFO");
  };

  // Assistance Request Handlers
  const createAssistanceRequest = (data: Partial<AssistanceRequest>): AssistanceRequest => {
    const newReq: AssistanceRequest = {
      id: `REQ-${Math.floor(8000 + Math.random() * 1000)}`,
      citizenName: data.citizenName || currentUser.name,
      citizenPhone: data.citizenPhone || currentUser.phone,
      requestType: data.requestType || "RESCUE",
      severity: data.severity || "HIGH",
      locationName: data.locationName || "Barangay San Jose",
      barangay: data.barangay || "Barangay San Jose",
      lat: data.lat || 14.5985,
      lng: data.lng || 120.9835,
      peopleCount: data.peopleCount || 1,
      specialNeeds: data.specialNeeds,
      description: data.description || "Requesting immediate disaster assistance.",
      status: "SUBMITTED",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photoUrl: data.photoUrl,
      statusHistory: [
        {
          status: "SUBMITTED",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: "Request received by SmartRelief Emergency System"
        }
      ]
    };

    setAssistanceRequests(prev => [newReq, ...prev]);

    // Automatically create a corresponding incident for emergency dispatch visibility
    const createdInc = createIncident({
      title: `${newReq.requestType.replace("_", " ")} Request (${newReq.citizenName})`,
      description: `${newReq.description} [${newReq.peopleCount} people affected]${newReq.specialNeeds ? ` Special needs: ${newReq.specialNeeds}` : ''}`,
      type: newReq.requestType === "RESCUE" ? "FLOOD" : newReq.requestType === "MEDICAL" ? "MEDICAL" : "OTHER",
      severity: newReq.severity,
      status: "REPORTED",
      locationName: newReq.locationName,
      barangay: newReq.barangay,
      lat: newReq.lat,
      lng: newReq.lng,
      affectedCount: newReq.peopleCount,
      reportedBy: newReq.citizenName,
      reportedByPhone: newReq.citizenPhone
    });

    // Link request to incident
    setAssistanceRequests(prev => prev.map(r => r.id === newReq.id ? { ...r, incidentId: createdInc.id } : r));

    addLog("REQUEST_SUBMITTED", `Submitted assistance request ${newReq.id} for ${newReq.citizenName}`, "WARNING");
    return newReq;
  };

  const updateRequestStatus = (id: string, status: AssistanceRequest["status"], responderId?: string) => {
    let responderName: string | undefined;
    if (responderId) {
      responderName = responders.find(r => r.id === responderId)?.name;
    }

    setAssistanceRequests(prev => prev.map(req => {
      if (req.id === id) {
        const history = [
          ...req.statusHistory,
          {
            status,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            note: responderName ? `Assigned to ${responderName}` : `Status updated to ${status}`
          }
        ];
        return {
          ...req,
          status,
          assignedResponderId: responderId || req.assignedResponderId,
          assignedResponderName: responderName || req.assignedResponderName,
          updatedAt: new Date().toISOString(),
          statusHistory: history
        };
      }
      return req;
    }));

    addLog("REQUEST_STATUS_UPDATE", `Request ${id} status changed to ${status}`, "INFO");
  };

  // Resource Handlers
  const addResource = (data: Partial<ResourceItem>) => {
    const qty = data.quantity || 100;
    const newRes: ResourceItem = {
      id: `RES-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name || "Emergency Supply Kit",
      category: data.category || "FOOD_WATER",
      quantity: qty,
      availableQuantity: data.availableQuantity ?? qty,
      reservedQuantity: data.reservedQuantity || 0,
      distributedQuantity: data.distributedQuantity || 0,
      unit: data.unit || "units",
      location: data.location || "Central Logistics Hub",
      lguName: currentUser.lguName || "Manila DRRM Operations Center",
      minThreshold: data.minThreshold || 50,
      stockStatus: qty < (data.minThreshold || 50) ? "LOW_STOCK" : "NORMAL",
      expirationDate: data.expirationDate,
      lastUpdated: "Just now"
    };

    setResources(prev => [newRes, ...prev]);
    addLog("RESOURCE_ADDED", `Added inventory item: ${newRes.name} (${newRes.quantity} ${newRes.unit})`, "INFO");
  };

  const updateResourceStock = (id: string, deltaAvailable: number) => {
    setResources(prev => prev.map(res => {
      if (res.id === id) {
        const newAvail = Math.max(0, res.availableQuantity + deltaAvailable);
        let stockStatus: StockStatus = "NORMAL";
        if (newAvail === 0) stockStatus = "DEPLETED";
        else if (newAvail < res.minThreshold) stockStatus = "LOW_STOCK";

        return {
          ...res,
          availableQuantity: newAvail,
          distributedQuantity: res.distributedQuantity + (deltaAvailable < 0 ? Math.abs(deltaAvailable) : 0),
          stockStatus,
          lastUpdated: "Just now"
        };
      }
      return res;
    }));
    addLog("RESOURCE_STOCK_CHANGE", `Updated stock for ${id} (Delta: ${deltaAvailable})`, "INFO");
  };

  const transferResource = (id: string, destination: string, quantity: number) => {
    updateResourceStock(id, -quantity);
    addLog("RESOURCE_TRANSFERRED", `Transferred ${quantity} units of ${id} to ${destination}`, "WARNING");
  };

  // Evacuation Center Handlers
  const updateEvacuationOccupancy = (id: string, occupants: number) => {
    setEvacuationCenters(prev => prev.map(ec => {
      if (ec.id === id) {
        const status = occupants >= ec.capacity ? "FULL" : "OPEN";
        return {
          ...ec,
          currentOccupants: Math.min(ec.capacity, Math.max(0, occupants)),
          status,
          updatedAt: "Just now"
        };
      }
      return ec;
    }));
  };

  const updateEvacuationStatus = (id: string, status: EvacuationCenter["status"]) => {
    setEvacuationCenters(prev => prev.map(ec => ec.id === id ? { ...ec, status, updatedAt: "Just now" } : ec));
  };

  // Responder Handlers
  const updateResponderStatus = (id: string, status: Responder["status"], assignmentTitle?: string) => {
    setResponders(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status,
          currentAssignmentTitle: assignmentTitle !== undefined ? assignmentTitle : r.currentAssignmentTitle,
          lastPing: "Just now"
        };
      }
      return r;
    }));
  };

  // AI Recommendation Handlers
  const acceptAIRecommendation = (recId: string) => {
    const rec = aiRecommendations.find(r => r.id === recId);
    if (!rec) return;

    setAiRecommendations(prev => prev.map(r => r.id === recId ? { ...r, status: "ACCEPTED" } : r));

    // Execute actionable side-effects based on category
    if (rec.category === "DISPATCH" && rec.targetId) {
      const availResp = responders.find(r => r.status === "AVAILABLE");
      if (availResp) {
        assignResponderToIncident(rec.targetId, availResp.id);
      }
    } else if (rec.category === "RESOURCE_ALLOCATION") {
      const lowStockRes = resources.find(r => r.stockStatus === "LOW_STOCK");
      if (lowStockRes) {
        updateResourceStock(lowStockRes.id, 200);
      }
    }

    addLog("ACCEPTED_AI_RECOMMENDATION", `Accepted AI Action: ${rec.title}`, "CRITICAL");
  };

  const rejectAIRecommendation = (recId: string) => {
    setAiRecommendations(prev => prev.map(r => r.id === recId ? { ...r, status: "REJECTED" } : r));
    addLog("REJECTED_AI_RECOMMENDATION", `Rejected AI Recommendation ID ${recId}`, "INFO");
  };

  const fetchAIRecommendations = async (customPrompt?: string) => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai/decision-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentContext: incidents,
          resourceContext: resources,
          prompt: customPrompt
        })
      });

      const data = await res.json();
      if (data.success && data.recommendations) {
        const formattedRecs: AIRecommendation[] = data.recommendations.map((r: any, idx: number) => ({
          id: r.id || `rec-gen-${Date.now()}-${idx}`,
          title: r.title || "AI Priority Action",
          severity: (r.severity as IncidentSeverity) || "HIGH",
          reasoning: r.reasoning || "Analyzed from real-time spatial logs.",
          recommendedAction: r.recommendedAction || "Execute field dispatch.",
          impactScore: r.impactScore || 85,
          category: r.category || "DISPATCH",
          targetId: r.targetId || incidents[0]?.id,
          status: "PENDING"
        }));

        setAiRecommendations(formattedRecs);
        addLog("AI_RECOMMENDATIONS_REFRESHED", `Generated ${formattedRecs.length} strategic recommendations using AI engine`, "INFO");
      }
    } catch (e) {
      console.error("Failed to fetch AI recommendations:", e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // User Management
  const addUser = (userData: Partial<SystemUser>) => {
    const newUser: SystemUser = {
      id: `usr-${Math.floor(100 + Math.random() * 900)}`,
      name: userData.name || "New User",
      email: userData.email || "user@smartrelief.gov.ph",
      phone: userData.phone || "+63 900 000 0000",
      role: userData.role || "CITIZEN",
      status: "ACTIVE",
      lguName: userData.lguName || "Manila DRRM",
      lastActive: "Just now"
    };
    setUsers(prev => [newUser, ...prev]);
    addLog("USER_CREATED", `Created user account for ${newUser.name} (${newUser.role})`, "SECURITY");
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    addLog("USER_ROLE_CHANGED", `Updated user ${userId} role to ${role}`, "SECURITY");
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : u));
  };

  // Role Permissions
  const updateRolePermissions = (role: UserRole, permissions: RolePermission["permissions"]) => {
    setRolePermissions(prev => prev.map(rp => rp.role === role ? { ...rp, permissions } : rp));
    addLog("PERMISSIONS_UPDATED", `Updated security permission matrix for ${role}`, "SECURITY");
  };

  // Alerts
  const addAlert = (alertData: Partial<EmergencyAlert>) => {
    const newAlert: EmergencyAlert = {
      id: `alt-${Math.floor(100 + Math.random() * 900)}`,
      title: alertData.title || "Disaster Safety Alert",
      affectedArea: alertData.affectedArea || "All Municipalities",
      severity: alertData.severity || "WARNING",
      instructions: alertData.instructions || "Stay indoors and observe local DRRM announcements.",
      issuedAt: new Date().toISOString(),
      issuedBy: currentUser.name,
      active: true
    };
    setAlerts(prev => [newAlert, ...prev]);
    addLog("EMERGENCY_ALERT_ISSUED", `Issued broadcast alert: ${newAlert.title}`, "CRITICAL");
  };

  const toggleAlertStatus = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, active: !a.active } : a));
  };

  const resetToDefaultData = () => {
    setUsers(initialUsers);
    setIncidents(initialIncidents);
    setAssistanceRequests(initialAssistanceRequests);
    setResources(initialResources);
    setEvacuationCenters(initialEvacuationCenters);
    setResponders(initialResponders);
    setLgus(initialLGUs);
    setSystemLogs(initialLogs);
    setRolePermissions(initialRolePermissions);
    setAiRecommendations(initialAIRecommendations);
    setAlerts(initialAlerts);
    localStorage.clear();
    addLog("SYSTEM_RESET", "Reset all system data to factory default demonstration state.", "WARNING");
  };

  return (
    <SmartReliefContext.Provider
      value={{
        currentRole,
        currentUser,
        users,
        incidents,
        assistanceRequests,
        resources,
        evacuationCenters,
        responders,
        lgus,
        systemLogs,
        rolePermissions,
        aiRecommendations,
        alerts,
        isAiLoading,
        setRole,
        createIncident,
        verifyIncident,
        assignResponderToIncident,
        updateIncidentStatus,
        createAssistanceRequest,
        updateRequestStatus,
        addResource,
        updateResourceStock,
        transferResource,
        updateEvacuationOccupancy,
        updateEvacuationStatus,
        updateResponderStatus,
        acceptAIRecommendation,
        rejectAIRecommendation,
        fetchAIRecommendations,
        addUser,
        updateUserRole,
        toggleUserStatus,
        updateRolePermissions,
        addAlert,
        toggleAlertStatus,
        addLog,
        resetToDefaultData
      }}
    >
      {children}
    </SmartReliefContext.Provider>
  );
};

export const useSmartRelief = () => {
  const context = useContext(SmartReliefContext);
  if (!context) {
    throw new Error("useSmartRelief must be used within a SmartReliefProvider");
  }
  return context;
};
