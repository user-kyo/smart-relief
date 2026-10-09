import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Area, AreaChart, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Users,
  ShieldCheck,
  Building2,
  Activity,
  Settings,
  Plus,
  Search,
  Check,
  X,
  UserX,
  UserCheck,
  Edit2,
  Lock,
  BarChart3,
  Filter,
  ShieldAlert,
  Save,
  Download,
  Server,
  AlertCircle,
  Undo,
  Bell,
  Key,
  Globe,
  Cpu,
  Power,
  Mail,
  Database,
  Map,
  Settings2,
  CloudLightning,
  ChevronDown,
  Radio,
  EyeOff,
  WifiOff,
  AlertTriangle,
  HardDrive,
  Clock,
  Monitor,
  Shield,
  Stethoscope,
  User,
  Trash2
} from "lucide-react";
import { useSmartRelief } from "../../../context/SmartReliefContext";
import { KPICard } from "../../common/KPICard";
import { StatusBadge } from "../../common/StatusBadge";
import { Modal } from "../../common/Modal";
import { UserRole, SystemUser, RolePermission } from "../../../types";

interface SuperAdminPortalProps {
  activeTab: string;
}

export const SuperAdminPortal: React.FC<SuperAdminPortalProps> = ({ activeTab }) => {
  const {
    users,
    lgus,
    incidents,
    systemLogs,
    rolePermissions,
    addUser,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    updateRolePermissions,
    addLog,
    systemSettings: globalSettings,
    updateSystemSettings
  } = useSmartRelief();

  // Search & Filters
  const [userSearch, setUserSearch] = useState("");
  const [isSessionTimeoutDropdownOpen, setIsSessionTimeoutDropdownOpen] = useState(false);
  const [isAlertLevelDropdownOpen, setIsAlertLevelDropdownOpen] = useState(false);
  const [isBackupFreqDropdownOpen, setIsBackupFreqDropdownOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [isRoleFilterDropdownOpen, setIsRoleFilterDropdownOpen] = useState(false);
  const [openUserRoleDropdown, setOpenUserRoleDropdown] = useState<string | null>(null);
  
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Audit Logs State
  const [logSearch, setLogSearch] = useState("");
  const [logSeverityFilter, setLogSeverityFilter] = useState("ALL");
  const [isLogSeverityDropdownOpen, setIsLogSeverityDropdownOpen] = useState(false);
  const [logActionFilter, setLogActionFilter] = useState("ALL");
  const [isLogActionDropdownOpen, setIsLogActionDropdownOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [logSort, setLogSort] = useState("NEWEST");
  const [isLogSortDropdownOpen, setIsLogSortDropdownOpen] = useState(false);

  // Modal State

  const [exportModalState, setExportModalState] = useState<{
    isOpen: boolean;
    type: 'users' | 'logs' | 'incidents' | 'lgus' | null;
    dataPreview: any[];
  }>({ isOpen: false, type: null, dataPreview: [] });

  const openExportModal = (type: 'users' | 'logs' | 'incidents' | 'lgus') => {
    let preview = [];
    if (type === 'users') {
      preview = users.slice(0, 50).map(u => ({ Name: u.name, Email: u.email, Role: u.role, Status: u.status }));
    } else if (type === 'logs') {
      preview = systemLogs.slice(0, 50).map(l => ({ Time: new Date(l.timestamp).toLocaleString(), Action: l.action, User: l.userName, Role: l.userRole }));
    } else if (type === 'incidents') {
      preview = incidents.slice(0, 50).map(i => ({ Type: i.type, Location: i.locationName, Severity: i.severity, Status: i.status }));
    } else if (type === 'lgus') {
      preview = lgus.slice(0, 50).map(l => ({ Name: l.name, Region: l.region, Code: l.cityMunicipality, Status: l.status }));
    }
    setExportModalState({ isOpen: true, type, dataPreview: preview });
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    window.location.href = `http://localhost:5000/api/analytics/export/${exportModalState.type}?format=${format}`;
    setExportModalState({ isOpen: false, type: null, dataPreview: [] });
  };


  // Edited Permissions Matrix state
  const [localPermissions, setLocalPermissions] = useState<RolePermission[]>(rolePermissions);
  const [hasUnsavedPermissions, setHasUnsavedPermissions] = useState(false);
  const [matrixSaveSuccess, setMatrixSaveSuccess] = useState(false);

  // System Settings State
  const [sysSettings, setSysSettings] = useState({
    maintenanceMode: false,
    strict2fa: true,
    aiEnabled: true,
    mapLayer: "satellite",
    logLevel: "warn",
    sessionTimeout: "30",
    dataRetention: "90",
    autoEscalate: true,
    emailNotifications: true,
    smsGateway: true,
    alertLevel: "NORMAL",
    publicMapVisible: true,
    backupFrequency: "24",
    offlineMode: false,
    ...globalSettings
  });
  const [savedSettings, setSavedSettings] = useState(sysSettings);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeTab === "settings") {
      setIsLoadingSettings(true);
      timer = setTimeout(() => setIsLoadingSettings(false), 800);
    } else if (activeTab === "users") {
      setIsLoadingUsers(true);
      timer = setTimeout(() => setIsLoadingUsers(false), 800);
    } else if (activeTab === "roles") {
      setIsLoadingRoles(true);
      timer = setTimeout(() => setIsLoadingRoles(false), 800);
    } else if (activeTab === "audit") {
      setIsLoadingAudit(true);
      timer = setTimeout(() => setIsLoadingAudit(false), 800);
    } else if (activeTab === "reports") {
      setIsLoadingReports(true);
      timer = setTimeout(() => setIsLoadingReports(false), 800);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [activeTab]);
  
  React.useEffect(() => {
    setSysSettings(prev => ({ ...prev, ...globalSettings }));
    setSavedSettings(prev => ({ ...prev, ...globalSettings }));
  }, [globalSettings]);

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // --- Real Analytics Computations ---
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6', '#ef4444'];

  const pulseData = useMemo(() => {
    // Determine the latest timestamp in the system (to anchor our "last 7 days" view)
    let latestTime = 0;
    systemLogs.forEach(log => {
      const t = new Date(log.timestamp).getTime();
      if (t > latestTime) latestTime = t;
    });
    incidents.forEach(inc => {
      const t = new Date(inc.reportedAt).getTime();
      if (t > latestTime) latestTime = t;
    });
    
    // If no data, use current date
    const baseDate = latestTime > 0 ? new Date(latestTime) : new Date();
    
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      days.push({
        dateStr: d.toISOString().split('T')[0],
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        logins: 0,
        alerts: 0
      });
    }

    systemLogs.forEach(log => {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      const day = days.find(d => d.dateStr === logDate);
      if (day) {
        if (log.action.toLowerCase().includes('login') || log.action === 'User Authentication') {
          day.logins += 1;
        }
      }
    });

    incidents.forEach(inc => {
      const incDate = new Date(inc.reportedAt).toISOString().split('T')[0];
      const day = days.find(d => d.dateStr === incDate);
      if (day) {
        day.alerts += 1;
      }
    });

    return days;
  }, [systemLogs, incidents]);

  const userRolesData = useMemo(() => {
    const roleCount: Record<string, number> = {};
    users.forEach(u => {
      roleCount[u.role] = (roleCount[u.role] || 0) + 1;
    });
    return Object.entries(roleCount).map(([name, value]) => ({ name, value }));
  }, [users]);


  const isSettingsDirty = JSON.stringify(sysSettings) !== JSON.stringify(savedSettings);
  const showSaveBar = isSettingsDirty || saveSuccess;

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    const res = await updateSystemSettings(sysSettings);
    if (res.success) {
      setSavedSettings(sysSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
    setIsSavingSettings(false);
  };

  const handleDiscardSettings = () => {
    setSysSettings(savedSettings);
  };

  const activeAdmins = useMemo(() => users.filter(u => u.role === "ADMIN" && u.status === "ACTIVE").length, [users]);
  const activeResponders = useMemo(() => users.filter(u => u.role === "RESPONDER" && u.status === "ACTIVE").length, [users]);
  const activeCitizens = useMemo(() => users.filter(u => u.role === "CITIZEN" && u.status === "ACTIVE").length, [users]);
  const activeIncidents = useMemo(() => incidents.filter(i => i.status !== "RESOLVED" && i.status !== "CLOSED").length, [incidents]);

  const filteredUsers = useMemo(() => users.filter(u => {
    const matchesSearch = (u.name || "").toLowerCase().includes(userSearch.toLowerCase()) || (u.email || "").toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  }), [users, userSearch, roleFilter]);

  const filteredLogs = useMemo(() => {
    let filtered = systemLogs.filter(log => {
      const matchesSearch = (log.action || "").toLowerCase().includes(logSearch.toLowerCase()) || 
                            (log.userName || "").toLowerCase().includes(logSearch.toLowerCase()) ||
                            (log.details || "").toLowerCase().includes(logSearch.toLowerCase());
      const matchesSeverity = logSeverityFilter === "ALL" || log.severity === logSeverityFilter;
      const matchesAction = logActionFilter === "ALL" || log.action === logActionFilter;
      return matchesSearch && matchesSeverity && matchesAction;
    });

    if (logSort === "OLDEST") {
      filtered = filtered.slice().reverse();
    }
    return filtered;
  }, [systemLogs, logSearch, logSeverityFilter, logActionFilter, logSort]);



  const handlePermissionToggle = (role: UserRole, permKey: keyof RolePermission["permissions"]) => {
    setLocalPermissions(prev => {
      const existing = prev.find(p => p.role === role);
      if (!existing) {
        // Create a new entry if the role doesn't exist yet
        return [...prev, {
          role,
          description: "Custom role permissions",
          permissions: {
            incidentsCreate: false, incidentsVerify: false, incidentsAssign: false, incidentsDelete: false,
            requestsManage: false, resourcesAdd: false, resourcesTransfer: false, evacuationManage: false,
            usersManage: false, rolesManage: false, systemLogsView: false,
            [permKey]: true
          }
        }];
      }
      return prev.map(rp => rp.role === role ? {
        ...rp,
        permissions: { ...rp.permissions, [permKey]: !rp.permissions[permKey] }
      } : rp);
    });
    setHasUnsavedPermissions(true);
  };

  const handleSavePermissions = () => {
    localPermissions.forEach(rp => {
      updateRolePermissions(rp.role, rp.permissions);
    });
    setHasUnsavedPermissions(false);
    setMatrixSaveSuccess(true);
    setTimeout(() => setMatrixSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col min-h-0">
      
      {/* USER MANAGEMENT TAB */}
      {activeTab === "users" && (
        <AnimatePresence mode="wait">
          {isLoadingUsers ? (
            <motion.div
              key="users-skeleton"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="space-y-6 flex-1 flex flex-col min-h-0"
            >
              <div className="space-y-6 shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-[104px] rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 shrink-0 mt-2">
                <div className="space-y-2">
                  <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                  <div className="h-4 w-72 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-[74px] rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse mt-2 shrink-0" />
              <div className="flex-1 rounded-3xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse mt-2" />
            </motion.div>
          ) : (
            <motion.div
              key="users-content"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="space-y-6 flex-1 flex flex-col min-h-0"
            >
              <div className="space-y-6 shrink-0">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard title="Total Users" value={users.length} icon={Users} variant="blue" />
              <KPICard title="Active Admins" value={activeAdmins} icon={ShieldCheck} variant="indigo" />
              <KPICard title="Active Responders" value={activeResponders} icon={UserCheck} variant="emerald" />
              <KPICard title="Active Citizens" value={activeCitizens} icon={User} variant="amber" />
            </div>

          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
            <div>
              <h2 className="text-xl font-black text-slate-900">User Management</h2>
              <p className="text-xs text-slate-500 mt-0.5">Role-Based Access Control (RBAC), Provisioning & Account Status</p>
            </div>
          </div>

          {/* Search & Role Filter Bar */}
          <div className="relative z-20 p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 hover:shadow-2xl hover:-translate-y-1 flex flex-wrap items-center justify-between gap-4 transition-all duration-300">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search users by name, email, or department..."
                className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Role Filter:</span>
              <div className="relative">
                <button
                  onClick={() => setIsRoleFilterDropdownOpen(!isRoleFilterDropdownOpen)}
                  className="appearance-none flex items-center justify-between w-36 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all cursor-pointer shadow-sm"
                >
                  <span>{roleFilter === "ALL" ? "All Roles" : roleFilter === "SUPER_ADMIN" ? "Super Admin" : roleFilter === "ADMIN" ? "Admin" : roleFilter === "RESPONDER" ? "Responder" : "Citizen"}</span>
                  <motion.div animate={{ rotate: isRoleFilterDropdownOpen ? 180 : 0 }}>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isRoleFilterDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full right-0 mt-2 w-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      {[
                        { value: "ALL", label: "All Roles" },
                        { value: "SUPER_ADMIN", label: "Super Admin" },
                        { value: "ADMIN", label: "Admin" },
                        { value: "RESPONDER", label: "Responder" },
                        { value: "CITIZEN", label: "Citizen" }
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setRoleFilter(option.value);
                            setIsRoleFilterDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors ${roleFilter === option.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="flex-1 flex flex-col min-h-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-black/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left text-xs relative">
                <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider">
                  <tr>
                    <th className="p-4 text-center">User Details</th>
                    <th className="p-4 text-center">Assigned Role</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Last Active</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.map(usr => (
                    <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 text-center">
                        <div className="font-bold text-slate-900">{usr.name}</div>
                        <div className="text-[10px] text-slate-500">{usr.email} • {usr.phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <StatusBadge type="role" value={usr.role} size="sm" />
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          usr.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : (usr.status === "PENDING" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-slate-100 text-slate-600 border border-slate-200")
                        }`}>
                          {usr.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 text-center">{usr.lastActive}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Role Change Dropdown */}
                          <div className="relative">
                            <button
                              onClick={() => setOpenUserRoleDropdown(openUserRoleDropdown === usr.id ? null : usr.id)}
                              className="appearance-none flex items-center justify-between w-[110px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer shadow-sm transition-all"
                            >
                              <span>{usr.role === "SUPER_ADMIN" ? "Super Admin" : usr.role === "ADMIN" ? "Admin" : usr.role === "RESPONDER" ? "Responder" : "Citizen"}</span>
                              <motion.div animate={{ rotate: openUserRoleDropdown === usr.id ? 180 : 0 }}>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                              </motion.div>
                            </button>
                            <AnimatePresence>
                              {openUserRoleDropdown === usr.id && (
                                <motion.div
                                  initial={{ opacity: 0, y: -5, filter: "blur(4px)" }}
                                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                  exit={{ opacity: 0, y: -5, filter: "blur(4px)" }}
                                  transition={{ duration: 0.15, ease: "easeOut" }}
                                  className="absolute top-full right-0 mt-1 w-[120px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-xl shadow-xl z-50 overflow-hidden text-left"
                                >
                                  {[
                                    { value: "SUPER_ADMIN", label: "Super Admin" },
                                    { value: "ADMIN", label: "Admin" },
                                    { value: "RESPONDER", label: "Responder" },
                                    { value: "CITIZEN", label: "Citizen" }
                                  ].map(option => (
                                    <button
                                      key={option.value}
                                      onClick={() => {
                                        updateUserRole(usr.id, option.value as UserRole);
                                        setOpenUserRoleDropdown(null);
                                      }}
                                      className={`w-full text-left px-3 py-2 text-[10px] font-bold transition-colors ${usr.role === option.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <button
                            onClick={() => toggleUserStatus(usr.id)}
                            className={`p-1.5 rounded-lg border shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 ${
                              usr.status === "ACTIVE" 
                                ? "bg-rose-50/80 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40" 
                                : "bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                            }`}
                            title={usr.status === "ACTIVE" ? "Deactivate User Account" : (usr.status === "PENDING" ? "Approve User Account" : "Reactivate User Account")}
                          >
                            {usr.status === "ACTIVE" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                          
                          <button
                            onClick={() => {
                              setUserToDelete(usr.id);
                              setIsDeleteUserModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 bg-red-50/80 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* 3. ROLE & PERMISSIONS MATRIX TAB */}
      {activeTab === "roles" && (
        <AnimatePresence mode="wait">
          {isLoadingRoles ? (
            <motion.div
              key="roles-skeleton"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="space-y-6 animate-in fade-in"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-7 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                  <div className="h-4 w-96 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-[400px] rounded-3xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse mt-6" />
            </motion.div>
          ) : (
            <motion.div
              key="roles-content"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="space-y-6 animate-in fade-in"
            >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Role & Permission Matrix</h2>
              <p className="text-xs text-slate-500 mt-0.5">Fine-grained access rights management across all portal features</p>
            </div>

            {(hasUnsavedPermissions || matrixSaveSuccess) && (
              <button
                onClick={handleSavePermissions}
                disabled={matrixSaveSuccess}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${
                  matrixSaveSuccess 
                    ? "bg-emerald-500 text-white shadow-emerald-500/20 cursor-default hover:-translate-y-0" 
                    : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-slate-900/20 dark:shadow-white/20"
                }`}
              >
                {matrixSaveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[800px]">
                <thead>
                  <tr>
                    <th className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 font-black text-slate-800 dark:text-slate-200 tracking-wide">
                      Permission Category
                    </th>
                    <th className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-bold">
                        <Shield className="w-3.5 h-3.5" /> Super Admin
                      </div>
                    </th>
                    <th className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold">
                        <Building2 className="w-3.5 h-3.5" /> Admin
                      </div>
                    </th>
                    <th className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold">
                        <Stethoscope className="w-3.5 h-3.5" /> Responder
                      </div>
                    </th>
                    <th className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        <User className="w-3.5 h-3.5" /> Citizen
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {[
                    { key: "incidentsCreate", label: "Create Emergency Incidents", desc: "Allow creating new disaster incident reports" },
                    { key: "incidentsVerify", label: "Verify & Prioritize Incidents", desc: "Approve and set severity of citizen reports" },
                    { key: "incidentsAssign", label: "Assign Field Responders", desc: "Dispatch responders to active incidents" },
                    { key: "incidentsDelete", label: "Delete / Purge Incident Logs", desc: "Permanently remove incidents from DB" },
                    { key: "requestsManage", label: "Manage Assistance Requests Queue", desc: "Process and resolve citizen rescue requests" },
                    { key: "resourcesAdd", label: "Add & Edit Inventory Stock", desc: "Update supply levels in relief centers" },
                    { key: "resourcesTransfer", label: "Authorize Supply Transfers", desc: "Move inventory between LGUs/facilities" },
                    { key: "evacuationManage", label: "Manage Evacuation Facilities", desc: "Open, close, and update capacities" },
                    { key: "usersManage", label: "User Account Provisioning", desc: "Approve or disable user accounts" },
                    { key: "systemLogsView", label: "Access Immutable Audit Logs", desc: "View the system-wide action tracking" }
                  ].map((item, idx) => (
                    <tr key={item.key} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="p-4 pl-5">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{item.label}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</div>
                      </td>
                      {(["SUPER_ADMIN", "ADMIN", "RESPONDER", "CITIZEN"] as UserRole[]).map(r => {
                        const permVal = localPermissions.find(p => p.role === r)?.permissions[item.key as keyof RolePermission["permissions"]];
                        
                        // Determine track and check colors based on role
                        let activeBg = "bg-slate-800";
                        let checkColor = "text-slate-800";
                        
                        if (r === "SUPER_ADMIN") {
                          activeBg = "bg-purple-500";
                          checkColor = "text-purple-600";
                        } else if (r === "ADMIN") {
                          activeBg = "bg-blue-500";
                          checkColor = "text-blue-600";
                        } else if (r === "RESPONDER") {
                          activeBg = "bg-emerald-500";
                          checkColor = "text-emerald-600";
                        }
                        
                        return (
                          <td key={r} className="p-4 text-center align-middle">
                            <div className="flex justify-center">
                              <button
                                onClick={() => handlePermissionToggle(r, item.key as keyof RolePermission["permissions"])}
                                className={`w-14 h-6 rounded-full transition-colors relative flex items-center shrink-0 shadow-inner focus:outline-none overflow-hidden ${
                                  permVal ? activeBg : "bg-slate-200 dark:bg-slate-700"
                                }`}
                              >
                                <span className={`absolute text-[9px] font-black tracking-wider transition-opacity duration-300 ${permVal ? 'opacity-100 text-white left-2' : 'opacity-0'}`}>
                                  ON
                                </span>
                                <span className={`absolute text-[9px] font-black tracking-wider text-slate-500 transition-opacity duration-300 ${!permVal ? 'opacity-100 right-2' : 'opacity-0'}`}>
                                  OFF
                                </span>
                                <div className={`w-4 h-4 rounded-full bg-white absolute transition-all shadow-sm flex items-center justify-center z-10 ${
                                  permVal ? "left-9" : "left-1"
                                }`}>
                                  {permVal && <Check className={`w-2.5 h-2.5 ${checkColor}`} strokeWidth={4} />}
                                </div>
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* 4. AUDIT LOGS TAB */}
      {activeTab === "audit" && (
        <AnimatePresence mode="wait">
          {isLoadingAudit ? (
            <motion.div
              key="audit-skeleton"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="space-y-6 animate-in fade-in"
            >
              <div className="space-y-2">
                <div className="h-7 w-72 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                <div className="h-4 w-96 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
              </div>
              <div className="h-[74px] rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse mt-6" />
              <div className="space-y-4 mt-6">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-[88px] rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="audit-content"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="space-y-6 animate-in fade-in"
            >
          <div>
            <h2 className="text-xl font-black text-slate-900">System Monitoring & Audit Trail</h2>
            <p className="text-xs text-slate-500 mt-0.5">Immutable record of all disaster decisions, dispatches, and user logins</p>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700/30 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-wrap items-center justify-between gap-4 relative z-50">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
                placeholder="Search audit trail by user, or details..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Action Type Filter */}
              <div className="flex items-center gap-2 relative z-50">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Action:</span>
                <div className="relative w-40">
                  <button
                    type="button"
                    onClick={() => { setIsLogActionDropdownOpen(!isLogActionDropdownOpen); setIsLogSeverityDropdownOpen(false); setIsLogSortDropdownOpen(false); }}
                    className="relative w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl pl-3 pr-10 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-left cursor-pointer block"
                  >
                    <span className="truncate block pr-4">
                      {
                        [
                          { value: "ALL", label: "All Actions" },
                          { value: "LOGIN", label: "Login" },
                          { value: "UPDATE", label: "Update" },
                          { value: "DISPATCH", label: "Dispatch" }
                        ].find(opt => opt.value === logActionFilter)?.label || "Select Action"
                      }
                    </span>
                    <motion.div 
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      animate={{ rotate: isLogActionDropdownOpen ? 180 : 0 }}
                    >
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isLogActionDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full right-0 mt-2 w-full bg-white/90 backdrop-blur-md border border-[#E2E8F0]/80 rounded-xl shadow-xl z-50 overflow-hidden"
                      >
                        {[
                          { value: "ALL", label: "All Actions" },
                          { value: "LOGIN", label: "Login" },
                          { value: "UPDATE", label: "Update" },
                          { value: "DISPATCH", label: "Dispatch" }
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setLogActionFilter(option.value);
                              setIsLogActionDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-xs font-medium hover:bg-[#F8FAFC]/50 transition-colors ${logActionFilter === option.value ? 'bg-blue-50 text-blue-600' : 'text-[#0F172A]'}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Severity Filter */}
              <div className="flex items-center gap-2 relative z-50">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Severity:</span>
              <div className="relative w-40">
                <button
                  type="button"
                  onClick={() => { setIsLogSeverityDropdownOpen(!isLogSeverityDropdownOpen); setIsLogActionDropdownOpen(false); setIsLogSortDropdownOpen(false); }}
                  className="relative w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl pl-3 pr-10 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-left cursor-pointer block"
                >
                  <span className="truncate block pr-4">
                    {
                      [
                        { value: "ALL", label: "All Severities" },
                        { value: "INFO", label: "🔵 Info" },
                        { value: "WARNING", label: "🟡 Warning" },
                        { value: "CRITICAL", label: "🔴 Critical" }
                      ].find(opt => opt.value === logSeverityFilter)?.label || "Select Severity"
                    }
                  </span>
                  <motion.div 
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    animate={{ rotate: isLogSeverityDropdownOpen ? 180 : 0 }}
                  >
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isLogSeverityDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full right-0 mt-2 w-full bg-white/90 backdrop-blur-md border border-[#E2E8F0]/80 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      {[
                        { value: "ALL", label: "All Severities" },
                        { value: "INFO", label: "🔵 Info" },
                        { value: "WARNING", label: "🟡 Warning" },
                        { value: "CRITICAL", label: "🔴 Critical" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setLogSeverityFilter(option.value);
                            setIsLogSeverityDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-xs font-medium hover:bg-[#F8FAFC]/50 transition-colors ${logSeverityFilter === option.value ? 'bg-blue-50 text-blue-600' : 'text-[#0F172A]'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              </div>

              {/* Sort Filter */}
              <div className="flex items-center gap-2 relative z-50">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Sort:</span>
                <div className="relative w-36">
                  <button
                    type="button"
                    onClick={() => { setIsLogSortDropdownOpen(!isLogSortDropdownOpen); setIsLogActionDropdownOpen(false); setIsLogSeverityDropdownOpen(false); }}
                    className="relative w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl pl-3 pr-10 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-left cursor-pointer block"
                  >
                    <span className="truncate block pr-4">
                      {
                        [
                          { value: "NEWEST", label: "Newest First" },
                          { value: "OLDEST", label: "Oldest First" }
                        ].find(opt => opt.value === logSort)?.label || "Newest First"
                      }
                    </span>
                    <motion.div 
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      animate={{ rotate: isLogSortDropdownOpen ? 180 : 0 }}
                    >
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isLogSortDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full right-0 mt-2 w-full bg-white/90 backdrop-blur-md border border-[#E2E8F0]/80 rounded-xl shadow-xl z-50 overflow-hidden"
                      >
                        {[
                          { value: "NEWEST", label: "Newest First" },
                          { value: "OLDEST", label: "Oldest First" }
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setLogSort(option.value);
                              setIsLogSortDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-xs font-medium hover:bg-[#F8FAFC]/50 transition-colors ${logSort === option.value ? 'bg-blue-50 text-blue-600' : 'text-[#0F172A]'}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>
          </div>

          <motion.div layout className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-5 relative">
            <div className="absolute top-0 bottom-0 left-9 w-px bg-slate-200 dark:bg-slate-700/50 z-0 hidden sm:block" />
            
            <motion.div layout className="space-y-4 relative z-10">
              <AnimatePresence mode="popLayout">
                {filteredLogs.length > 0 ? filteredLogs.map((log) => {
                  const isCritical = log.severity === "CRITICAL";
                  const isWarning = log.severity === "WARNING";
                  
                  return (
                    <motion.div 
                      layout
                      key={log.id} 
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)", transition: { duration: 0.2 } }}
                      transition={{ duration: 0.3 }}
                      onClick={() => setSelectedLog(log)}
                    className={`group relative p-4 sm:p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer
                      ${isCritical ? 'border-red-200 dark:border-red-900/30 hover:border-red-300 dark:hover:border-red-700' : isWarning ? 'border-amber-200 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}
                      sm:ml-12`}
                  >
                    {/* Ambient Glow */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-0">
                      <div className={`absolute inset-0 bg-transparent transition-colors duration-500
                        ${isCritical ? 'group-hover:bg-red-400/5 dark:group-hover:bg-red-500/10' : isWarning ? 'group-hover:bg-amber-400/5 dark:group-hover:bg-amber-500/10' : 'group-hover:bg-blue-400/5 dark:group-hover:bg-blue-500/10'}`} 
                      />
                    </div>
                    {/* Timeline Node */}
                    <div className={`absolute -left-12 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 hidden sm:flex items-center justify-center shadow-sm z-20
                      ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500'}`}
                    >
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 w-full">
                      <div className="flex flex-col gap-2.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border shadow-sm shrink-0
                            ${isCritical ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' : 
                              isWarning ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                              'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'}`}
                          >
                            {(log.action || "").replace(/_/g, ' ')}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 truncate">
                            <UserCheck className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{log.userName}</span>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed pr-2">
                          {log.details}
                        </p>
                      </div>
                      
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-5 mt-2 sm:mt-0">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-700/50">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }) : (
                <motion.div 
                  key="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-24 flex flex-col items-center justify-center text-center text-slate-500 min-h-[50vh]"
                >
                  <Activity className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="text-sm font-medium">No audit logs match your search criteria.</p>
                </motion.div>
              )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* 5. SYSTEM SETTINGS TAB */}
      {activeTab === "settings" && (
        <AnimatePresence mode="wait">
          {isLoadingSettings ? (
            <motion.div
              key="settings-skeleton"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-2"></div>
                <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse"></div>
              </div>
              
              {/* Mini System Health Indicator Skeleton */}
              <div className="rounded-2xl border bg-gradient-to-br from-indigo-50/20 to-white dark:from-indigo-900/10 dark:to-slate-900/50 border-indigo-200/30 dark:border-indigo-800/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100/50 dark:bg-indigo-900/30 animate-pulse shrink-0"></div>
                    <div className="space-y-2 w-full max-w-[200px]">
                      <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                      <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-white/40 dark:bg-slate-800/40 p-3 rounded-xl border border-white/40 dark:border-slate-700/20">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                      <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                      <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Settings Category Skeletons */}
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="rounded-2xl border bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 flex flex-col overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100/50 dark:border-slate-800/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                      <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                    </div>
                    <div className="p-6 space-y-4">
                      {[1, 2].map(item => (
                        <div key={item} className="flex items-center justify-between p-4 rounded-xl border border-white/40 dark:border-slate-700/20 bg-white/40 dark:bg-slate-800/40">
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                            <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse"></div>
                          </div>
                          <div className="w-12 h-6 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="settings-content"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
          <div>
            <h2 className="text-xl font-black text-slate-900">System Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">Global configuration and feature flags</p>
          </div>
          
          {/* Mini System Health Indicator */}
          <div className="group relative rounded-2xl border bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-900/20 dark:to-slate-900 border-indigo-200/50 dark:border-indigo-800/30 group-hover:border-indigo-400 dark:group-hover:border-indigo-500 hover:shadow-[0_8px_30px_rgb(99,102,241,0.12)] transition-all duration-500 hover:-translate-y-1 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              {/* Ambient Glow */}
              <div className="absolute inset-0 bg-transparent group-hover:bg-indigo-400/5 dark:group-hover:bg-indigo-500/10 transition-colors duration-500 pointer-events-none" />
              
              {/* Huge subtle watermark icon */}
              <div className="absolute -right-4 -bottom-8 opacity-40 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 ease-out z-0 text-indigo-50 dark:text-indigo-900/10 pointer-events-none">
                <Server className="w-32 h-32" strokeWidth={1} />
              </div>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm backdrop-blur-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shrink-0">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white tracking-tight">Core Systems</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Global Infrastructure Status</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-3 rounded-xl border border-white/60 dark:border-slate-700/30 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Backend API</span>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-inner ${sysSettings.maintenanceMode ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                    {!sysSettings.maintenanceMode && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                    {sysSettings.maintenanceMode ? 'Suspended' : 'Operational'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Gemini Engine</span>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-inner ${!sysSettings.aiEnabled ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                    {sysSettings.aiEnabled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                    {sysSettings.aiEnabled ? 'Operational' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category 1: Application Settings */}
            <div className="group relative z-20 rounded-2xl border bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-900/20 dark:to-slate-900 border-blue-200/50 dark:border-blue-800/30 group-hover:border-blue-400 dark:group-hover:border-blue-500 hover:shadow-[0_8px_30px_rgb(59,130,246,0.12)] transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                {/* Ambient Glow */}
                <div className="absolute inset-0 bg-transparent group-hover:bg-blue-400/5 dark:group-hover:bg-blue-500/10 transition-colors duration-500 pointer-events-none" />
                
                {/* Huge subtle watermark icon */}
                <div className="absolute -right-6 -bottom-6 opacity-40 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 ease-out z-0 text-blue-50 dark:text-blue-900/10 pointer-events-none">
                  <Settings2 className="w-48 h-48" strokeWidth={1} />
                </div>
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="px-6 py-5 border-b border-blue-100 dark:border-blue-900/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
                    <Settings2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-slate-800 dark:text-white tracking-tight text-lg">Application Settings</h3>
                </div>
                <div className="p-6 space-y-4">
                  {/* Maintenance Mode */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/60 dark:border-slate-700/30 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-colors group/item shadow-sm">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">Maintenance Mode</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">Suspends access for non-superadmin accounts globally.</p>
                    </div>
                    <button 
                      onClick={() => setSysSettings(s => ({ ...s, maintenanceMode: !s.maintenanceMode }))}
                      className={`w-12 h-6 rounded-full transition-colors relative flex items-center shrink-0 shadow-inner ${sysSettings.maintenanceMode ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute transition-all shadow-sm ${sysSettings.maintenanceMode ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  {/* AI Capabilities */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/60 dark:border-slate-700/30 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-colors group/item shadow-sm">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">Gemini AI Engine</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">Enables AI routing, prediction, and NLP analysis.</p>
                    </div>
                    <button 
                      onClick={() => setSysSettings(s => ({ ...s, aiEnabled: !s.aiEnabled }))}
                      className={`w-12 h-6 rounded-full transition-colors relative flex items-center shrink-0 shadow-inner ${sysSettings.aiEnabled ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute transition-all shadow-sm ${sysSettings.aiEnabled ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Category 2: Security Settings */}
            <div className="group relative z-20 rounded-2xl border bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-900/20 dark:to-slate-900 border-emerald-200/50 dark:border-emerald-800/30 group-hover:border-emerald-400 dark:group-hover:border-emerald-500 hover:shadow-[0_8px_30px_rgb(16,185,129,0.12)] transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                {/* Ambient Glow */}
                <div className="absolute inset-0 bg-transparent group-hover:bg-emerald-400/5 dark:group-hover:bg-emerald-500/10 transition-colors duration-500 pointer-events-none" />
                
                {/* Huge subtle watermark icon */}
                <div className="absolute -right-6 -bottom-6 opacity-40 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 ease-out z-0 text-emerald-50 dark:text-emerald-900/10 pointer-events-none">
                  <ShieldCheck className="w-48 h-48" strokeWidth={1} />
                </div>
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="px-6 py-5 border-b border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-slate-800 dark:text-white tracking-tight text-lg">Security Settings</h3>
                </div>
                <div className="p-6 space-y-4">
                  {/* Strict 2FA */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/60 dark:border-slate-700/30 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-colors group/item shadow-sm">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors">Enforce Strict 2FA</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">Require Two-Factor Authentication for all LGU Admins.</p>
                    </div>
                    <button 
                      onClick={() => setSysSettings(s => ({ ...s, strict2fa: !s.strict2fa }))}
                      className={`w-12 h-6 rounded-full transition-colors relative flex items-center shrink-0 shadow-inner ${sysSettings.strict2fa ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute transition-all shadow-sm ${sysSettings.strict2fa ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  {/* Session Timeout */}
                  <div className="p-4 rounded-xl border border-white/60 dark:border-slate-700/30 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm relative z-20">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-500" /> Session Timeout</h4>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsSessionTimeoutDropdownOpen(!isSessionTimeoutDropdownOpen)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl pl-3 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-left cursor-pointer"
                      >
                        {
                          [
                            { value: "15", label: "15 Minutes (Strict)" },
                            { value: "30", label: "30 Minutes (Recommended)" },
                            { value: "60", label: "1 Hour" },
                            { value: "120", label: "2 Hours" }
                          ].find(opt => opt.value === sysSettings.sessionTimeout)?.label || "Select Timeout"
                        }
                      </button>

                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none z-10">
                        <motion.svg 
                          animate={{ rotate: isSessionTimeoutDropdownOpen ? 180 : 0 }}
                          className="h-4 w-4 text-slate-400" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </div>

                      <AnimatePresence>
                        {isSessionTimeoutDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md border border-[#E2E8F0]/80 rounded-xl shadow-xl z-50 overflow-hidden"
                          >
                            {[
                              { value: "15", label: "15 Minutes (Strict)" },
                              { value: "30", label: "30 Minutes (Recommended)" },
                              { value: "60", label: "1 Hour" },
                              { value: "120", label: "2 Hours" }
                            ].map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  setSysSettings(s => ({ ...s, sessionTimeout: option.value }));
                                  setIsSessionTimeoutDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 text-xs font-medium hover:bg-[#F8FAFC]/50 transition-colors ${sysSettings.sessionTimeout === option.value ? 'bg-emerald-50 text-emerald-600' : 'text-[#0F172A]'}`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category 3: Emergency Protocols */}
            <div className="group relative z-10 rounded-2xl border bg-gradient-to-br from-red-50/50 to-white dark:from-red-900/20 dark:to-slate-900 border-red-200/50 dark:border-red-800/30 group-hover:border-red-400 dark:group-hover:border-red-500 hover:shadow-[0_8px_30px_rgb(239,68,68,0.12)] transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-transparent group-hover:bg-red-400/5 dark:group-hover:bg-red-500/10 transition-colors duration-500 pointer-events-none" />
                <div className="absolute -right-6 -bottom-6 opacity-40 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 ease-out z-0 text-red-50 dark:text-red-900/10 pointer-events-none">
                  <AlertTriangle className="w-48 h-48" strokeWidth={1} />
                </div>
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="px-6 py-5 border-b border-red-100 dark:border-red-900/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center shadow-sm">
                    <Radio className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-slate-800 dark:text-white tracking-tight text-lg">Emergency Protocols</h3>
                </div>
                <div className="p-6 space-y-4">
                  
                  {/* Global Alert Level */}
                  <div className="p-4 rounded-xl border border-white/60 dark:border-slate-700/30 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm relative z-30">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Global Alert Level</h4>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsAlertLevelDropdownOpen(!isAlertLevelDropdownOpen)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl pl-3 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-left cursor-pointer"
                      >
                        {
                          [
                            { value: "NORMAL", label: "🟢 Normal Operations" },
                            { value: "ELEVATED", label: "🟡 Elevated / Standby" },
                            { value: "CRITICAL", label: "🔴 Critical Disaster" }
                          ].find(opt => opt.value === sysSettings.alertLevel)?.label || "Select Level"
                        }
                      </button>

                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none z-10">
                        <motion.svg animate={{ rotate: isAlertLevelDropdownOpen ? 180 : 0 }} className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </div>

                      <AnimatePresence>
                        {isAlertLevelDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -10, filter: "blur(4px)" }} transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md border border-[#E2E8F0]/80 rounded-xl shadow-xl z-50 overflow-hidden"
                          >
                            {[
                              { value: "NORMAL", label: "🟢 Normal Operations" },
                              { value: "ELEVATED", label: "🟡 Elevated / Standby" },
                              { value: "CRITICAL", label: "🔴 Critical Disaster" }
                            ].map((option) => (
                              <button key={option.value} type="button"
                                onClick={() => { setSysSettings(s => ({ ...s, alertLevel: option.value })); setIsAlertLevelDropdownOpen(false); }}
                                className={`w-full text-left px-4 py-3 text-xs font-medium hover:bg-[#F8FAFC]/50 transition-colors ${sysSettings.alertLevel === option.value ? 'bg-red-50 text-red-600' : 'text-[#0F172A]'}`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Public Map Visibility */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/60 dark:border-slate-700/30 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-colors group/item shadow-sm">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white group-hover/item:text-red-600 dark:group-hover/item:text-red-400 transition-colors">Public Map Visibility</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">Show active incidents on citizen portal.</p>
                    </div>
                    <button onClick={() => setSysSettings(s => ({ ...s, publicMapVisible: !s.publicMapVisible }))} className={`w-12 h-6 rounded-full transition-colors relative flex items-center shrink-0 shadow-inner ${sysSettings.publicMapVisible ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute transition-all shadow-sm ${sysSettings.publicMapVisible ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                </div>
              </div>
            </div>

            {/* Category 4: Data & Resilience */}
            <div className="group relative z-10 rounded-2xl border bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-900/20 dark:to-slate-900 border-amber-200/50 dark:border-amber-800/30 group-hover:border-amber-400 dark:group-hover:border-amber-500 hover:shadow-[0_8px_30px_rgb(245,158,11,0.12)] transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-transparent group-hover:bg-amber-400/5 dark:group-hover:bg-amber-500/10 transition-colors duration-500 pointer-events-none" />
                <div className="absolute -right-6 -bottom-6 opacity-40 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 ease-out z-0 text-amber-50 dark:text-amber-900/10 pointer-events-none">
                  <Database className="w-48 h-48" strokeWidth={1} />
                </div>
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="px-6 py-5 border-b border-amber-100 dark:border-amber-900/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-slate-800 dark:text-white tracking-tight text-lg">Data & Resilience</h3>
                </div>
                <div className="p-6 space-y-4">
                  
                  {/* Backup Frequency */}
                  <div className="p-4 rounded-xl border border-white/60 dark:border-slate-700/30 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm relative z-30">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-amber-500" /> Automated Backups</h4>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsBackupFreqDropdownOpen(!isBackupFreqDropdownOpen)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl pl-3 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-left cursor-pointer"
                      >
                        {
                          [
                            { value: "6", label: "Every 6 Hours" },
                            { value: "24", label: "Daily (Recommended)" },
                            { value: "168", label: "Weekly" }
                          ].find(opt => opt.value === sysSettings.backupFrequency)?.label || "Select Frequency"
                        }
                      </button>

                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none z-10">
                        <motion.svg animate={{ rotate: isBackupFreqDropdownOpen ? 180 : 0 }} className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </div>

                      <AnimatePresence>
                        {isBackupFreqDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -10, filter: "blur(4px)" }} transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md border border-[#E2E8F0]/80 rounded-xl shadow-xl z-50 overflow-hidden"
                          >
                            {[
                              { value: "6", label: "Every 6 Hours" },
                              { value: "24", label: "Daily (Recommended)" },
                              { value: "168", label: "Weekly" }
                            ].map((option) => (
                              <button key={option.value} type="button"
                                onClick={() => { setSysSettings(s => ({ ...s, backupFrequency: option.value })); setIsBackupFreqDropdownOpen(false); }}
                                className={`w-full text-left px-4 py-3 text-xs font-medium hover:bg-[#F8FAFC]/50 transition-colors ${sysSettings.backupFrequency === option.value ? 'bg-amber-50 text-amber-600' : 'text-[#0F172A]'}`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Aggressive Offline Mode */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/60 dark:border-slate-700/30 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-colors group/item shadow-sm">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white group-hover/item:text-amber-600 dark:group-hover/item:text-amber-400 transition-colors">Aggressive Offline Mode</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">Forces PWA aggressive local caching.</p>
                    </div>
                    <button onClick={() => setSysSettings(s => ({ ...s, offlineMode: !s.offlineMode }))} className={`w-12 h-6 rounded-full transition-colors relative flex items-center shrink-0 shadow-inner ${sysSettings.offlineMode ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute transition-all shadow-sm ${sysSettings.offlineMode ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>

            {/* Save Configuration Action Bar */}
            <div className={`md:col-span-2 relative z-10 mt-2 transition-all duration-300 origin-bottom ${showSaveBar ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 hover:border-slate-300 dark:hover:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Unsaved Changes</h4>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg">You have pending modifications to the global system configuration.</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={handleDiscardSettings}
                    disabled={isSavingSettings || saveSuccess}
                    className="px-5 py-2.5 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    <Undo className="w-4 h-4" /> Discard
                  </button>

                  <button 
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings || saveSuccess}
                    className={`px-8 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] shrink-0 ${saveSuccess ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-[#111827] hover:bg-[#1f2937] dark:bg-blue-600 dark:hover:bg-blue-700 text-white'}`}
                  >
                    {isSavingSettings ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...
                      </span>
                    ) : saveSuccess ? (
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4" /> Saved!
                      </span>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Apply Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* 6. REPORTS TAB */}
      {activeTab === "reports" && (
        <AnimatePresence mode="wait">
          {isLoadingReports ? (
            <motion.div
              key="reports-skeleton"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="space-y-6 animate-in fade-in"
            >
              <div className="space-y-2">
                <div className="h-7 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                <div className="h-4 w-72 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-[236px] rounded-3xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="reports-content"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="space-y-6 animate-in fade-in"
            >
          <div>
            <h2 className="text-xl font-black text-slate-900">Reports</h2>
            <p className="text-xs text-slate-500 mt-0.5">Export platform data and download systemic reports</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Incidents Report */}
            <div className="group bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col items-center text-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center gap-3 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">Disaster Incidents Export</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed px-2">Download a comprehensive report of all disaster incidents and statuses.</p>
                </div>
              </div>
              <button 
                onClick={() => openExportModal('incidents')}
                className="relative z-10 px-5 py-2.5 flex items-center justify-center gap-2 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors w-full mt-2"
              >
                <Download className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                Export Report
              </button>
            </div>

            {/* LGUs Report */}
            <div className="group bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col items-center text-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center gap-3 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">LGU Registry Export</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed px-2">Download data on all registered Local Government Units (LGUs) and regions.</p>
                </div>
              </div>
              <button 
                onClick={() => openExportModal('lgus')}
                className="relative z-10 px-5 py-2.5 flex items-center justify-center gap-2 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors w-full mt-2"
              >
                <Download className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                Export Report
              </button>
            </div>
            
            {/* User Registry Report */}
            <div className="group bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col items-center text-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center gap-3 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">User Registry Export</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed px-2">Download a complete CSV of all registered users across the platform.</p>
                </div>
              </div>
              <button 
                onClick={() => openExportModal('users')}
                className="relative z-10 px-5 py-2.5 flex items-center justify-center gap-2 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors w-full mt-2"
              >
                <Download className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                Export Report
              </button>
            </div>

            {/* Audit Trail Report */}
            <div className="group bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col items-center text-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center gap-3 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">Audit Trail Export</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed px-2">Download system security logs, admin actions, and modifications.</p>
                </div>
              </div>
              <button 
                onClick={() => openExportModal('logs')}
                className="relative z-10 px-5 py-2.5 flex items-center justify-center gap-2 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors w-full mt-2"
              >
                <Download className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                Export Report
              </button>
            </div>

          </div>
          
          {/* Charts removed per request */}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Audit Log Modal */}
      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Audit Trail Detail">
        {selectedLog && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border
                    ${selectedLog.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' : 
                      selectedLog.severity === 'WARNING' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'}`}
                  >
                    {(selectedLog.action || "").replace(/_/g, ' ')}
                  </span>
                  <h3 className="mt-2 text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    {selectedLog.userName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedLog.userRole}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {new Date(selectedLog.timestamp).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(selectedLog.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action Details</h4>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {selectedLog.details}
                  </p>
                </div>

                {selectedLog.changes && selectedLog.changes.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">System Changes</h4>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 overflow-hidden text-[12px] font-mono">
                      {selectedLog.changes.map((change: any, idx: number) => (
                        <div key={idx} className={`${idx !== 0 ? 'border-t border-slate-200 dark:border-slate-700' : ''}`}>
                          <div className="bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <span>{change.field}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-700">
                            <div className="px-3 py-2 bg-red-50/50 dark:bg-red-900/10 text-red-700 dark:text-red-400 flex items-start gap-2">
                              <span className="opacity-50 select-none">-</span>
                              <span className="break-all line-through opacity-70">{String(change.oldValue)}</span>
                            </div>
                            <div className="px-3 py-2 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
                              <span className="opacity-50 select-none">+</span>
                              <span className="break-all">{String(change.newValue)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IP Address</h4>
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {selectedLog.ipAddress}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event ID</h4>
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Database className="w-3 h-3" /> {selectedLog.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={exportModalState.isOpen}
        onClose={() => setExportModalState({ isOpen: false, type: null, dataPreview: [] })}
        title={`Export Preview: ${exportModalState.type === 'users' ? 'User Registry' : exportModalState.type === 'logs' ? 'Audit Trail' : exportModalState.type === 'incidents' ? 'Disaster Incidents' : 'LGU Registry'}`}
        subtitle="Review the data preview before downloading"
        maxWidth="4xl"
      >
        <div className="flex flex-col h-[65vh] min-h-[500px]">
          <div className="flex-1 overflow-auto border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 sticky top-0 z-10 shadow-sm">
                <tr>
                  {Object.keys(exportModalState.dataPreview[0] || {}).map(key => (
                    <th key={key} className="p-4 font-semibold">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {exportModalState.dataPreview.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="p-4 text-slate-700 dark:text-slate-300">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-slate-500 italic mt-3 mb-4 shrink-0">Showing up to 50 records as preview.</div>
          
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <button 
              onClick={() => handleExport('xlsx')}
              className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-100 rounded-xl text-sm font-bold transition-colors"
            >
              Download Excel (.xlsx)
            </button>
            <button 
              onClick={() => handleExport('csv')}
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-xl text-sm font-bold transition-colors"
            >
              Download CSV
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete User Confirmation Modal */}
      <AnimatePresence>
        {isDeleteUserModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsDeleteUserModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col items-center text-center relative overflow-hidden z-10 border border-slate-200 dark:border-slate-800"
            >
              {/* Decorative background glow */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-red-500/10 dark:from-red-500/20 to-transparent pointer-events-none" />

              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.6, bounce: 0.5, delay: 0.1 }}
                className="w-20 h-20 bg-gradient-to-tr from-red-500 to-rose-400 rounded-2xl flex items-center justify-center mb-6 shadow-[0_10px_25px_rgba(239,68,68,0.3)] rotate-3 z-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
                >
                  <Trash2 className="w-10 h-10 text-white ml-0" strokeWidth={2.5} />
                </motion.div>
              </motion.div>
              
              <motion.h3 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight z-10"
              >
                Delete Account
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium px-2 z-10"
              >
                Are you absolutely sure? This action cannot be undone. This will permanently delete the user account and remove their data from the database.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="flex gap-3 w-full z-10"
              >
                <button
                  onClick={() => setIsDeleteUserModalOpen(false)}
                  className="flex-1 py-3.5 px-4 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (userToDelete) {
                      await deleteUser(userToDelete);
                      setIsDeleteUserModalOpen(false);
                      setUserToDelete(null);
                    }
                  }}
                  className="flex-1 py-3.5 px-4 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 active:scale-[0.98] rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Account
                </button>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
