import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
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
  systemSettings: Record<string, any>;
  updateSystemSettings: (newSettings: Record<string, any>) => Promise<{success: boolean}>;
  
  // Auth
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (email: string, password?: string) => Promise<{success: boolean, message?: string}>;
  register: (name: string, email: string, password: string, role: string) => Promise<{success: boolean, message?: string, status?: string}>;
  checkEmail: (email: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<{success: boolean, message?: string}>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<boolean>;
  loginAsGuest: () => void;
  logout: () => void;
  
  // Handlers
  setRole: (role: UserRole) => void;
  createIncident: (data: Partial<Incident>) => Promise<Incident>;
  verifyIncident: (id: string) => void;
  assignResponderToIncident: (incidentId: string, responderId: string) => void;
  updateIncidentStatus: (id: string, status: Incident["status"], notes?: string) => void;
  
  createAssistanceRequest: (data: Partial<AssistanceRequest>) => Promise<AssistanceRequest>;
  updateRequestStatus: (id: string, status: AssistanceRequest["status"], responderId?: string) => Promise<void>;
  
  addResource: (data: Partial<ResourceItem>) => Promise<void>;
  updateResourceStock: (id: string, deltaAvailable: number) => Promise<void>;
  transferResource: (id: string, destination: string, quantity: number) => Promise<void>;
  
  updateEvacuationOccupancy: (id: string, occupants: number) => void;
  updateEvacuationStatus: (id: string, status: EvacuationCenter["status"]) => void;
  addEvacuationCenter: (data: Partial<EvacuationCenter>) => void;
  
  updateResponderStatus: (id: string, status: Responder["status"], assignmentTitle?: string) => void;
  addResponder: (data: Partial<Responder>) => void;
  
  acceptAIRecommendation: (recId: string) => void;
  rejectAIRecommendation: (recId: string) => void;
  undoAIRecommendation: (recId: string) => void;
  fetchAIRecommendations: (prompt?: string) => Promise<void>;
  
  addUser: (user: Partial<SystemUser>) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  toggleUserStatus: (userId: string) => void;
  deleteUser: (userId: string) => Promise<void>;
  
  updateRolePermissions: (role: UserRole, permissions: RolePermission["permissions"]) => void;
  addAlert: (alert: Partial<EmergencyAlert>) => void;
  toggleAlertStatus: (alertId: string) => void;
  addLog: (action: string, details: string, severity?: SystemLog["severity"]) => void;
  resetToDefaultData: () => void;
}

const SmartReliefContext = createContext<SmartReliefContextType | undefined>(undefined);

const GUEST_USER: SystemUser = {
  id: "guest-citizen",
  name: "Guest Citizen",
  email: "guest@smartrelief.gov.ph",
  phone: "+63 900 000 0000",
  role: "CITIZEN",
  status: "ACTIVE",
  lastActive: "Just now"
};

export const SmartReliefProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local storage hydrator helper
  const getStored = <T,>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(`smartrelief_v3_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  };

  const setStored = <T,>(key: string, value: T) => {
    try {
      localStorage.setItem(`smartrelief_v3_${key}`, JSON.stringify(value));
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    try { return localStorage.getItem("smartrelief_is_guest") === "true"; } catch { return false; }
  });
  const [currentUser, setCurrentUser] = useState<SystemUser>(() => {
    try {
      if (localStorage.getItem("smartrelief_is_guest") === "true") return GUEST_USER;
      const saved = localStorage.getItem("smartrelief_current_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.id === "guest-citizen" || parsed.name === "Guest Citizen" || parsed.name === "Guest Resident") return GUEST_USER;
        return parsed;
      }
    } catch {}
    return { id: "", name: "", email: "", phone: "", role: "CITIZEN" as UserRole, status: "ACTIVE" as SystemUser["status"], lastActive: "" };
  });
  const [systemSettings, setSystemSettings] = useState<Record<string, any>>({
    maintenanceMode: false,
    publicRegistration: true,
    autoAssignResponders: false,
    requireVerification: true,
    maxActiveIncidents: 100,
    sessionTimeout: "30",
    emergencyAlertLevel: "ELEVATED",
    publicMapVisibility: true,
    automatedBackupFreq: "DAILY",
    aggressiveOfflineMode: false,
  });

  // Fetch settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings", {
          credentials: "include"
        });
        const data = await res.json();
        if (data.success && data.settings && Object.keys(data.settings).length > 0) {
          setSystemSettings(prev => ({ ...prev, ...data.settings }));
        }
      } catch (e) {
        console.error("Failed to fetch settings:", e);
      }
    };
    fetchSettings();

    const fetchPermissions = async () => {
      try {
        const res = await fetch("/api/permissions", {
          credentials: "include"
        });
        const data = await res.json();
        if (data.success && data.permissions && data.permissions.length > 0) {
          setRolePermissions(data.permissions);
        } else {
          // If DB is empty, use initialData defaults
          setRolePermissions(initialRolePermissions);
        }
      } catch (e) {
        console.error("Failed to fetch permissions:", e);
      }
    };
    
  }, []);

  const getAuthHeaders = (headers: Record<string, string> = {}) => {
    const token = localStorage.getItem("smartrelief_token");
    const result: Record<string, string> = { ...headers };
    if (token) {
      result["Authorization"] = `Bearer ${token}`;
    }
    return result;
  };

  const mergeWithPlaceholders = <T extends { id: string }>(dbItems: T[], placeholders: T[]): T[] => {
    if (!dbItems || dbItems.length === 0) return placeholders;
    const dbIds = new Set(dbItems.map(item => item.id));
    const remainingPlaceholders = placeholders.filter(item => !dbIds.has(item.id));
    return [...dbItems, ...remainingPlaceholders];
  };

  const syncAllData = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const [reqRes, incRes, resRes, evacRes, respRes, logRes] = await Promise.all([
        fetch("/api/requests", { credentials: "include", headers }),
        fetch("/api/incidents", { credentials: "include", headers }),
        fetch("/api/resources", { credentials: "include", headers }),
        fetch("/api/evacuation", { credentials: "include", headers }),
        fetch("/api/responders", { credentials: "include", headers }),
        fetch("/api/logs", { credentials: "include", headers })
      ]);
      
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        if (reqData.success && Array.isArray(reqData.requests)) {
          setAssistanceRequests(mergeWithPlaceholders(reqData.requests, initialAssistanceRequests));
        }
      }
      
      if (incRes.ok) {
        const incData = await incRes.json();
        if (incData.success && Array.isArray(incData.incidents)) {
          const formatted = incData.incidents.map((i: any) => ({
            ...i,
            assignedResponderIds: i.assignedResponders || [],
            assignedResponderNames: i.responders ? i.responders.map((r: any) => r.responder?.user?.name || r.responder?.id) : [],
            timeline: i.timelines || []
          }));
          setIncidents(mergeWithPlaceholders(formatted, initialIncidents));
        }
      }
      
      if (resRes.ok) {
        const resData = await resRes.json();
        if (resData.success && Array.isArray(resData.resources)) {
          setResources(mergeWithPlaceholders(resData.resources, initialResources));
        }
      }

      if (evacRes.ok) {
        const evacData = await evacRes.json();
        if (evacData.success && Array.isArray(evacData.centers)) {
          setEvacuationCenters(mergeWithPlaceholders(evacData.centers, initialEvacuationCenters));
        }
      }

      if (respRes.ok) {
        const respData = await respRes.json();
        if (respData.success && Array.isArray(respData.responders)) {
          const formattedResponders = respData.responders.map((r: any) => ({
            ...r,
            name: r.name || r.user?.name || r.codeName || "Field Unit",
            skills: typeof r.skills === 'string' ? JSON.parse(r.skills || '[]') : (r.skills || []),
            equipment: typeof r.equipment === 'string' ? JSON.parse(r.equipment || '[]') : (r.equipment || []),
            lastPing: r.lastPing ? 'Active now' : 'Recent'
          }));
          setResponders(mergeWithPlaceholders(formattedResponders, initialResponders));
        }
      }

      if (logRes.ok) {
        const logData = await logRes.json();
        if (logData.success && Array.isArray(logData.logs) && logData.logs.length > 0) {
          const formattedLogs = logData.logs.map((l: any) => ({
            id: l.id,
            timestamp: l.timestamp ? new Date(l.timestamp).toISOString() : new Date().toISOString(),
            userId: l.userId,
            userName: l.userName,
            userRole: l.userRole,
            action: l.action,
            details: l.details,
            ipAddress: l.ipAddress,
            severity: l.severity
          }));
          setSystemLogs(mergeWithPlaceholders(formattedLogs, initialLogs));
        }
      }
    } catch (e) {
      console.error("Failed to sync backend data:", e);
    }
  }, []);

  // Real-Time Cross-Device Sync (Phone <-> Laptop Polling every 2.5s)
  useEffect(() => {
    syncAllData();
    const interval = setInterval(() => {
      syncAllData();
    }, 2500);
    return () => clearInterval(interval);
  }, [syncAllData]);

  const updateSystemSettings = async (newSettings: Record<string, any>) => {
    try {
      const changes: SystemLog["changes"] = [];
      Object.keys(newSettings).forEach(key => {
        if (newSettings[key] !== systemSettings[key]) {
          changes.push({
            field: key,
            oldValue: systemSettings[key],
            newValue: newSettings[key]
          });
        }
      });

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: newSettings }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setSystemSettings(newSettings);
        addLog("SYSTEM_SETTINGS_UPDATED", "Updated system settings.", "WARNING", changes.length > 0 ? changes : undefined);
        return { success: true };
      }
      return { success: false };
    } catch (e) {
      console.error(e);
      return { success: false };
    }
  };

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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isGuestStored = localStorage.getItem("smartrelief_is_guest") === "true";
        if (isGuestStored) {
          setIsGuest(true);
          setCurrentRole("CITIZEN");
          setCurrentUser(GUEST_USER);
          setIsAuthenticated(true);
          return;
        }

        const token = localStorage.getItem("smartrelief_token");
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          headers
        });
        const data = await res.json();
        if (data.success && data.user) {
          let roleToSet = data.user.role;
          if (roleToSet === 'RESIDENT') roleToSet = 'CITIZEN';
          setCurrentRole(roleToSet as UserRole);
          const mappedUser: SystemUser = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone || "+63 917 123 4567",
            role: roleToSet as UserRole,
            status: data.user.status === 'APPROVED' || data.user.status === 'ACTIVE' ? 'ACTIVE' : data.user.status,
            lastActive: "Just now"
          };
          setIsGuest(false);
          localStorage.removeItem("smartrelief_is_guest");
          setCurrentUser(mappedUser);
          localStorage.setItem("smartrelief_current_user", JSON.stringify(mappedUser));
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Auth check failed:", e);
      }
    };
    checkAuth();
  }, []);

  // Fetch real users from backend if Super Admin
  useEffect(() => {
    if (currentRole === "SUPER_ADMIN" && isAuthenticated) {
      const fetchUsers = async () => {
        try {
          const res = await fetch("/api/users", {
            credentials: "include"
          });
          const data = await res.json();
          if (data.success) {
            const mappedUsers = data.users.map((u: any) => ({
              ...u,
              role: u.role === "RESIDENT" ? "CITIZEN" : u.role,
              status: u.status === "APPROVED" || u.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
              lastActive: "Recently",
              lguName: "Unassigned"
            }));
            setUsers(mappedUsers);
          }
        } catch (e) {
          console.error("Failed to fetch users", e);
        }
      };
      fetchUsers();
    }
  }, [currentRole, isAuthenticated]);



  const login = async (email: string, password?: string): Promise<{success: boolean, message?: string}> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setIsGuest(false);
        localStorage.removeItem("smartrelief_is_guest");
        if (data.token) {
          localStorage.setItem("smartrelief_token", data.token);
        }
        let roleToSet = data.user.role;
        if (roleToSet === 'RESIDENT') roleToSet = 'CITIZEN';
        
        const loggedInUser: SystemUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || "+63 917 123 4567",
          role: roleToSet as UserRole,
          status: data.user.status === 'APPROVED' || data.user.status === 'ACTIVE' ? 'ACTIVE' : (data.user.status || 'ACTIVE'),
          lastActive: "Just now"
        };
        setCurrentUser(loggedInUser);
        localStorage.setItem("smartrelief_current_user", JSON.stringify(loggedInUser));

        setCurrentRole(roleToSet as UserRole);
        setIsAuthenticated(true);
        syncAllData();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e) {
      console.error(e);
      return { success: false, message: "Network error occurred." };
    }
  };

  const register = async (name: string, email: string, password: string, role: string): Promise<{success: boolean, message?: string, status?: string}> => {
    try {
      let backendRole = role;
      if (backendRole === 'CITIZEN') backendRole = 'RESIDENT';
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: backendRole }),
      });
      const data = await res.json();
      
      if (data.success && data.user) {
        const newUserObj: SystemUser = {
          id: data.user.id || Math.random().toString(36).substr(2, 9),
          name: data.user.name,
          email: data.user.email,
          phone: "Not provided",
          role: data.user.role === 'RESIDENT' ? 'CITIZEN' : data.user.role,
          status: data.user.status === 'APPROVED' ? 'ACTIVE' : data.user.status,
          lastActive: "Just now"
        };
        setUsers(prev => [...prev, newUserObj]);
      }

      return { success: data.success, message: data.message, status: data.user?.status };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Network error occurred.' };
    }
  };

  const checkEmail = async (email: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return data.success && data.exists;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const forgotPassword = async (email: string): Promise<{success: boolean, message?: string}> => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return { success: data.success, message: data.message };
    } catch (e) {
      console.error(e);
      return { success: false, message: "Network error" };
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      return data.success;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const resetPassword = async (email: string, otp: string, newPassword: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      return data.success;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const loginAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem("smartrelief_is_guest", "true");
    localStorage.removeItem("smartrelief_token");
    localStorage.removeItem("smartrelief_current_user");
    setCurrentRole("CITIZEN");
    setCurrentUser(GUEST_USER);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (e) {
      console.error(e);
    }
    setIsGuest(false);
    localStorage.removeItem("smartrelief_is_guest");
    localStorage.removeItem("smartrelief_token");
    localStorage.removeItem("smartrelief_current_user");
    setCurrentUser(GUEST_USER);
    setIsAuthenticated(false);
  };

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    addLog("ROLE_SWITCH", `Switched role to ${role}.`, "INFO");
  };

  const addLog = (action: string, details: string, severity: SystemLog["severity"] = "INFO", changes?: SystemLog["changes"]) => {
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      action,
      details,
      ipAddress: "127.0.0.1",
      severity,
      changes
    };
    setSystemLogs(prev => [newLog, ...prev]);

    // Persist to backend database audit log
    fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLog),
      credentials: "include"
    }).catch(() => {});
  };

  // Incident handlers
  const createIncident = async (data: Partial<Incident>): Promise<Incident> => {
    const newInc = {
      ...data,
      reportedBy: currentUser.id,
      reportedByName: currentUser.name,
      reportedByPhone: currentUser.phone
    };

    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(newInc),
        credentials: "include"
      });
      const resData = await res.json();
      if (resData.success) {
        setIncidents(prev => [resData.incident, ...prev]);
        if (resData.request) {
          setAssistanceRequests(prev => [resData.request, ...prev]);
        }
        addLog("INCIDENT_CREATED", `Created incident '${data.title}'.`, data.severity === "CRITICAL" ? "CRITICAL" : "WARNING");
        setTimeout(() => syncAllData(), 300);
        return resData.incident;
      }
    } catch (e) {
      console.error(e);
    }
    
    // Fallback to local
    const fallbackInc: Incident = {
      id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: data.title || "Reported Emergency Incident",
      description: data.description || "Field disaster report.",
      type: data.type || "FLOOD",
      severity: data.severity || "HIGH",
      status: data.status || "REPORTED",
      locationName: data.locationName || "Pauli 2, Rizal, Laguna",
      barangay: data.barangay || "Pauli 2",
      lguName: currentUser.lguName || "Rizal DRRM Operations Center",
      lat: data.lat || 14.1134,
      lng: data.lng || 121.3938,
      affectedCount: data.affectedCount || 1,
      reportedBy: currentUser.name,
      reportedByPhone: currentUser.phone,
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedResponderIds: [],
      photoUrl: data.photoUrl,
      timeline: []
    };
    setIncidents(prev => [fallbackInc, ...prev]);

    // Also add to assistance requests so it reflects in My Requests and Citizen Requests
    const fallbackReq: AssistanceRequest = {
      id: `REQ-${Math.floor(8000 + Math.random() * 1000)}`,
      citizenName: currentUser.name,
      citizenPhone: currentUser.phone,
      requestType: data.type === "FLOOD" || data.type === "FIRE" || data.type === "LANDSLIDE" ? "RESCUE" : "MEDICAL",
      severity: data.severity || "HIGH",
      locationName: data.locationName || "Pauli 2, Rizal, Laguna",
      barangay: data.barangay || "Pauli 2",
      lat: data.lat || 14.1134,
      lng: data.lng || 121.3938,
      peopleCount: data.affectedCount || 1,
      description: `[Incident Report: ${data.title}] ${data.description || ""}`,
      status: "SUBMITTED",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      incidentId: fallbackInc.id,
      statusHistory: []
    };
    setAssistanceRequests(prev => [fallbackReq, ...prev]);

    return fallbackInc;
  };

  const verifyIncident = async (id: string) => {
    // Optimistic
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return { ...inc, status: "VERIFIED", updatedAt: new Date().toISOString() };
      }
      return inc;
    }));
    try {
      await fetch(`/api/incidents/${id}/verify`, {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include"
      });
      setTimeout(() => syncAllData(), 300);
    } catch(e) { console.error(e); }
    addLog("INCIDENT_VERIFIED", `Verified incident ${id}.`, "INFO");
  };

  const assignResponderToIncident = async (incidentId: string, responderId: string) => {
    const responder = responders.find(r => r.id === responderId);
    if (!responder) return;

    // Optimistic UI update
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const ids = inc.assignedResponderIds?.includes(responderId) ? inc.assignedResponderIds : [...(inc.assignedResponderIds || []), responderId];
        const names = [...(inc.assignedResponderNames || []), responder.name];
        return { ...inc, status: "ASSIGNED", assignedResponderIds: ids, assignedResponderNames: names, updatedAt: new Date().toISOString() };
      }
      return inc;
    }));

    setResponders(prev => prev.map(r => {
      if (r.id === responderId) {
        return { ...r, status: "EN_ROUTE", currentAssignmentId: incidentId };
      }
      return r;
    }));
    addLog("RESPONDER_ASSIGNED", `Assigned responder '${responder.name}' to incident ${incidentId}.`, "INFO");

    try {
      await fetch(`/api/incidents/${incidentId}/assign`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ responderId }),
        credentials: "include"
      });
      setTimeout(() => syncAllData(), 300);
    } catch(e) { console.error(e); }
  };

  const updateIncidentStatus = async (id: string, status: Incident["status"], notes?: string) => {
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
    addLog("INCIDENT_STATUS_UPDATE", `Updated incident ${id} status to ${status}.`, "INFO");

    try {
      await fetch(`/api/incidents/${id}/status`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status, notes }),
        credentials: "include"
      });
      setTimeout(() => syncAllData(), 300);
    } catch (e) { console.error(e); }
  };

  // Assistance Request Handlers
  const createAssistanceRequest = async (data: Partial<AssistanceRequest>): Promise<AssistanceRequest> => {
    let createdReq: AssistanceRequest;
    const reqPayload = {
      requestType: data.requestType || "RESCUE",
      severity: data.severity || "HIGH",
      locationName: data.locationName || "Pauli 2, Rizal, Laguna",
      barangay: data.barangay || "Pauli 2",
      lat: Number(data.lat) || 14.1134,
      lng: Number(data.lng) || 121.3938,
      peopleCount: Number(data.peopleCount) || 1,
      specialNeeds: data.specialNeeds || "",
      description: data.description || "Requesting immediate disaster assistance.",
      photoUrl: data.photoUrl,
      incidentId: data.incidentId
    };
    
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(reqPayload),
        credentials: "include"
      });
      const resData = await res.json();
      if (resData.success) {
        createdReq = {
          ...resData.request,
          citizenName: currentUser.name,
          citizenPhone: currentUser.phone,
          statusHistory: []
        };
        setAssistanceRequests(prev => [createdReq, ...prev]);
        addLog("REQUEST_SUBMITTED", `Created assistance request for ${currentUser.name}.`, "WARNING");
        setTimeout(() => syncAllData(), 300);
      } else {
        throw new Error(resData.message || "Failed to create request");
      }
    } catch (e) {
      console.error(e);
      // Fallback
      createdReq = {
        id: `REQ-${Math.floor(8000 + Math.random() * 1000)}`,
        citizenName: data.citizenName || currentUser.name,
        citizenPhone: data.citizenPhone || currentUser.phone,
        requestType: data.requestType || "RESCUE",
        severity: data.severity || "HIGH",
        locationName: data.locationName || "Pauli 2, Rizal, Laguna",
        barangay: data.barangay || "Pauli 2",
        lat: data.lat || 14.1134,
        lng: data.lng || 121.3938,
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
      setAssistanceRequests(prev => [createdReq, ...prev]);
    }

    // Automatically create a corresponding incident for emergency dispatch visibility
    createIncident({
      title: `${createdReq.requestType.replace("_", " ")} Request (${createdReq.citizenName})`,
      description: `${createdReq.description} [${createdReq.peopleCount} people affected]${createdReq.specialNeeds ? ` Special needs: ${createdReq.specialNeeds}` : ''}`,
      type: createdReq.requestType === "RESCUE" ? "FLOOD" : createdReq.requestType === "MEDICAL" ? "MEDICAL" : "OTHER",
      severity: createdReq.severity,
      status: "REPORTED",
      locationName: createdReq.locationName,
      barangay: createdReq.barangay,
      lat: createdReq.lat,
      lng: createdReq.lng,
      affectedCount: createdReq.peopleCount,
      reportedBy: createdReq.citizenName,
      reportedByPhone: createdReq.citizenPhone
    }).then(createdInc => {
      // Link request to incident
      setAssistanceRequests(prev => prev.map(r => r.id === createdReq.id ? { ...r, incidentId: createdInc.id } : r));
    });

    return createdReq;
  };

  const updateRequestStatus = async (id: string, status: AssistanceRequest["status"], responderId?: string) => {
    let responderName: string | undefined;
    if (responderId) {
      responderName = responders.find(r => r.id === responderId)?.name;
    }

    // Optimistic UI update
    setAssistanceRequests(prev => prev.map(req => {
      if (req.id === id) {
        const history = req.statusHistory ? [...req.statusHistory] : [];
        history.push({
          status,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: responderName ? `Assigned to ${responderName}` : `Status updated to ${status}`
        });
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
    
    addLog("REQUEST_STATUS_UPDATE", `Updated request ${id} status to ${status}.`, "INFO");

    try {
      await fetch(`/api/requests/${id}/status`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status, responderId }),
        credentials: "include"
      });
      setTimeout(() => syncAllData(), 300);
    } catch (e) {
      console.error(e);
    }
  };

  // Resource Handlers
  const addResource = async (data: Partial<ResourceItem>) => {
    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
        credentials: "include"
      });
      const resData = await res.json();
      if (resData.success) {
        setResources(prev => [resData.resource, ...prev]);
        addLog("RESOURCE_ADDED", `Added resource '${resData.resource.name}' (${resData.resource.quantity} ${resData.resource.unit}).`, "INFO");
        setTimeout(() => syncAllData(), 300);
      }
    } catch (e) {
      console.error("Failed to add resource", e);
    }
  };

  const updateResourceStock = async (id: string, deltaAvailable: number) => {
    try {
      const res = await fetch(`/api/resources/${id}/stock`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ deltaAvailable }),
        credentials: "include"
      });
      const resData = await res.json();
      if (resData.success) {
        setResources(prev => prev.map(r => r.id === id ? resData.resource : r));
        addLog("RESOURCE_STOCK_CHANGE", `Adjusted stock for resource ${id} by ${deltaAvailable} units.`, "INFO");
        setTimeout(() => syncAllData(), 300);
      }
    } catch (e) {
      console.error("Failed to update resource stock", e);
    }
  };

  const transferResource = async (id: string, destination: string, quantity: number) => {
    try {
      const res = await fetch(`/api/resources/${id}/transfer`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ quantity, destination }),
        credentials: "include"
      });
      const resData = await res.json();
      if (resData.success) {
        setResources(prev => prev.map(r => r.id === id ? resData.resource : r));
        addLog("RESOURCE_TRANSFERRED", `Transferred ${quantity} units of resource ${id} to ${destination}.`, "WARNING");
        setTimeout(() => syncAllData(), 300);
      }
    } catch (e) {
      console.error("Failed to transfer resource", e);
    }
  };

  // Evacuation Center Handlers
  const updateEvacuationOccupancy = async (id: string, occupants: number) => {
    const status = occupants >= (evacuationCenters.find(ec => ec.id === id)?.capacity || 100) ? "FULL" : "OPEN";
    setEvacuationCenters(prev => prev.map(ec => {
      if (ec.id === id) {
        return {
          ...ec,
          currentOccupants: Math.min(ec.capacity, Math.max(0, occupants)),
          status,
          updatedAt: "Just now"
        };
      }
      return ec;
    }));

    try {
      await fetch(`/api/evacuation/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentOccupants: occupants, status }),
        credentials: "include"
      });
    } catch (e) {
      console.error("Failed to update evacuation occupancy in backend", e);
    }
  };

  const updateEvacuationStatus = async (id: string, status: EvacuationCenter["status"]) => {
    setEvacuationCenters(prev => prev.map(ec => ec.id === id ? { ...ec, status, updatedAt: "Just now" } : ec));

    try {
      await fetch(`/api/evacuation/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include"
      });
    } catch (e) {
      console.error("Failed to update evacuation status in backend", e);
    }
  };

  const addEvacuationCenter = async (data: Partial<EvacuationCenter>) => {
    try {
      const res = await fetch("/api/evacuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
      });
      const resData = await res.json();
      if (resData.success && resData.center) {
        setEvacuationCenters(prev => [resData.center, ...prev]);
        addLog("EVACUATION_CENTER_ADDED", `Added evacuation center '${resData.center.name}'.`, "INFO");
        return;
      }
    } catch (e) {
      console.error("Failed to add evacuation center to backend", e);
    }

    const newEC: EvacuationCenter = {
      id: `EC-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.name || "New Evacuation Center",
      address: data.address || "",
      barangay: data.barangay || "",
      lguName: data.lguName || "Rizal",
      lat: data.lat || 14.1134,
      lng: data.lng || 121.3938,
      capacity: data.capacity || 100,
      currentOccupants: data.currentOccupants || 0,
      facilities: data.facilities || {
        powerGenerator: false,
        medicalStation: false,
        sanitation: true,
        wifiComm: false,
        communityKitchen: false,
        waterPurifier: false
      },
      status: "OPEN",
      contactPerson: data.contactPerson || "",
      contactPhone: data.contactPhone || "",
      updatedAt: new Date().toISOString()
    };
    setEvacuationCenters(prev => [newEC, ...prev]);
    addLog("EVACUATION_CENTER_ADDED", `Added evacuation center '${newEC.name}'.`, "INFO");
  };

  // Responder Handlers
  const addResponder = (data: Partial<Responder>) => {
    const newRes: Responder = {
      id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.name || "New Field Unit",
      codeName: data.codeName || "UNIT-1",
      roleType: data.roleType || "DISASTER_RESPONSE_TEAM",
      status: "AVAILABLE",
      lguName: data.lguName || "Rizal",
      locationName: data.locationName || "Deployed Location",
      lat: data.lat || 14.1134,
      lng: data.lng || 121.3938,
      phone: data.phone || "",
      teamSize: data.teamSize || 1,
      skills: data.skills || [],
      equipment: data.equipment || [],
      lastPing: "Just now"
    };
    setResponders(prev => [newRes, ...prev]);
    addLog("RESPONDER_ADDED", `Added responder '${newRes.name}' (${newRes.codeName}).`, "INFO");
  };

  const updateResponderStatus = async (id: string, status: Responder["status"], assignmentTitle?: string) => {
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

    try {
      await fetch(`/api/responders/${id}/status`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status }),
        credentials: "include"
      });
      setTimeout(() => syncAllData(), 300);
    } catch (e) {
      console.error("Failed to update responder status in backend", e);
    }
  };

  // AI Recommendation Handlers
  const acceptAIRecommendation = (recId: string) => {
    const rec = aiRecommendations.find(r => r.id === recId);
    if (!rec) return;
    const oldStatus = rec.status;

    setAiRecommendations(prev => prev.map(r => r.id === recId ? { ...r, status: "ACCEPTED" } : r));

    // Execute actionable side-effects based on category
    if (rec.category === "DISPATCH" && rec.targetId) {
      // Find an available responder or team
      const availResp = responders.find(r => r.status === "AVAILABLE");
      if (availResp) {
        assignResponderToIncident(rec.targetId, availResp.id);
      }
    } else if (rec.category === "RESOURCE_ALLOCATION" && rec.targetId) {
      // Find a resource that is available (not low stock) to transfer, or just a related resource
      const availableRes = resources.find(r => r.availableQuantity > 50);
      if (availableRes) {
        transferResource(availableRes.id, rec.targetId, 50);
      }
    }

    addLog("ACCEPTED_AI_RECOMMENDATION", `Accepted AI recommendation: '${rec.title}'.`, "CRITICAL", [
      { field: "status", oldValue: oldStatus, newValue: "ACCEPTED" }
    ]);
  };

  const rejectAIRecommendation = (recId: string) => {
    const rec = aiRecommendations.find(r => r.id === recId);
    if (!rec) return;
    const oldStatus = rec.status;
    setAiRecommendations(prev => prev.map(r => r.id === recId ? { ...r, status: "REJECTED" } : r));
    addLog("REJECTED_AI_RECOMMENDATION", `Rejected AI recommendation (ID: ${recId}).`, "INFO", [
      { field: "status", oldValue: oldStatus, newValue: "REJECTED" }
    ]);
  };

  const undoAIRecommendation = (recId: string) => {
    const rec = aiRecommendations.find(r => r.id === recId);
    if (!rec) return;
    const oldStatus = rec.status;
    setAiRecommendations(prev => prev.map(r => r.id === recId ? { ...r, status: "PENDING" } : r));
    addLog("UNDID_AI_RECOMMENDATION", `Reverted AI recommendation (ID: ${recId}) to pending.`, "INFO", [
      { field: "status", oldValue: oldStatus, newValue: "PENDING" }
    ]);
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
        addLog("AI_RECOMMENDATIONS_REFRESHED", `Generated ${formattedRecs.length} AI recommendations.`, "INFO");
      }
    } catch (e) {
      console.error("Failed to fetch AI recommendations:", e);
      setAiRecommendations([]);
      addLog("AI_RECOMMENDATIONS_REFRESHED", `Failed to generate AI recommendations, reverting to empty state.`, "WARNING");
    } finally {
      setIsAiLoading(false);
    }
  };

  // User Management
  const addUser = async (userData: Partial<SystemUser> & { password?: string }) => {
    try {
      const res = await register(
        userData.name || "New User",
        userData.email || "user@smartrelief.gov.ph",
        userData.password || "TempPassword123!",
        userData.role || "CITIZEN"
      );
      if (res.success) {
        addLog("USER_CREATED", `Created user account for ${userData.name} (${userData.role}).`, "SECURITY");
        
        // Auto-verify if Super Admin creates it
        const resData = res as any;
        if (resData.user && resData.user.id && currentRole === "SUPER_ADMIN") {
          await fetch(`/api/users/${resData.user.id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status: "ACTIVE" })
          });
        }
        
        // Re-fetch users if we are SUPER_ADMIN
        if (currentRole === "SUPER_ADMIN") {
          const fetchRes = await fetch("/api/users", { credentials: "include" });
          const data = await fetchRes.json();
          if (data.success) {
            const mappedUsers = data.users.map((u: any) => ({
              ...u,
              role: u.role === "RESIDENT" ? "CITIZEN" : u.role,
              status: u.status === "APPROVED" || u.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
              lastActive: "Recently",
              lguName: "Unassigned"
            }));
            setUsers(mappedUsers);
          }
        }
      }
    } catch (e) {
      console.error("Failed to add user:", e);
    }
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
        credentials: "include"
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
        addLog("USER_ROLE_CHANGED", `Updated role for user ${userId} to ${role}.`, "SECURITY");
      }
    } catch (e) {
      console.error("Failed to update user role in backend", e);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newStatusFrontend = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    
    try {
      const res = await fetch(`/api/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatusFrontend }),
        credentials: "include"
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatusFrontend } : u));
      }
    } catch (e) {
      console.error("Failed to update user status in backend", e);
    }
  };

  const deleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        addLog("USER_DELETED", `Deleted user account for ${user.name} (${user.email})`, "SECURITY");
      }
    } catch (e) {
      console.error("Failed to delete user in backend", e);
    }
  };

  // Role Permissions
  const updateRolePermissions = async (role: UserRole, permissions: RolePermission["permissions"]) => {
    try {
      const res = await fetch(`/api/permissions/${role}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions }),
        credentials: "include"
      });
      const data = await res.json();
      
      if (data.success) {
        setRolePermissions(prev => {
          const exists = prev.find(p => p.role === role);
          if (exists) {
            return prev.map(p => p.role === role ? { ...p, permissions } : p);
          }
          return [...prev, { id: Date.now().toString(), role, description: "", permissions }];
        });
        addLog("PERMISSIONS_UPDATED", `Updated permissions for role ${role}.`, "SECURITY");
      }
    } catch (e) {
      console.error("Failed to save permissions to DB:", e);
      // Fallback to local state if backend is down
      setRolePermissions(prev => {
        const exists = prev.find(p => p.role === role);
        if (exists) {
          return prev.map(p => p.role === role ? { ...p, permissions } : p);
        }
        return [...prev, { id: Date.now().toString(), role, description: "", permissions }];
      });
    }
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
    addLog("EMERGENCY_ALERT_ISSUED", `Issued emergency alert: '${newAlert.title}'.`, "CRITICAL");
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
    addLog("SYSTEM_RESET", "Reset system data to defaults.", "WARNING");
  };

  const contextValue = useMemo(() => ({
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
    systemSettings,
    updateSystemSettings,
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
    addEvacuationCenter,
    updateResponderStatus,
    addResponder,
    acceptAIRecommendation,
    rejectAIRecommendation,
    undoAIRecommendation,
    fetchAIRecommendations,
    addUser,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    updateRolePermissions,
    addAlert,
    toggleAlertStatus,
    addLog,
    resetToDefaultData,
    isAuthenticated,
    isGuest,
    login,
    register,
    checkEmail,
    forgotPassword,
    verifyOtp,
    resetPassword,
    loginAsGuest,
    logout
  }), [
    currentRole, currentUser, users, incidents, assistanceRequests, resources,
    evacuationCenters, responders, lgus, systemLogs, rolePermissions, aiRecommendations,
    alerts, isAiLoading, isAuthenticated, isGuest, systemSettings
  ]);

  return (
    <SmartReliefContext.Provider value={contextValue}>
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
