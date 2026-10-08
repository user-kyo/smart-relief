import React, { useState, useMemo } from "react";
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
  UserCheck,
  UserX,
  Edit2,
  Lock,
  Filter,
  ShieldAlert,
  Save,
  Download
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
    updateRolePermissions,
    addLog
  } = useSmartRelief();

  // Search & Filters
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  // Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserData, setNewUserData] = useState<Partial<SystemUser>>({
    name: "",
    email: "",
    phone: "",
    role: "ADMIN",
    lguName: "Manila DRRM Operations Center"
  });

  // Edited Permissions Matrix state
  const [localPermissions, setLocalPermissions] = useState<RolePermission[]>(rolePermissions);
  const [hasUnsavedPermissions, setHasUnsavedPermissions] = useState(false);

  const activeAdmins = useMemo(() => users.filter(u => u.role === "ADMIN" && u.status === "ACTIVE").length, [users]);
  const activeResponders = useMemo(() => users.filter(u => u.role === "RESPONDER" && u.status === "ACTIVE").length, [users]);
  const activeIncidents = useMemo(() => incidents.filter(i => i.status !== "RESOLVED" && i.status !== "CLOSED").length, [incidents]);

  const filteredUsers = useMemo(() => users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  }), [users, userSearch, roleFilter]);

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email) return;
    addUser(newUserData);
    setIsAddUserOpen(false);
    setNewUserData({ name: "", email: "", phone: "", role: "ADMIN", lguName: "Manila DRRM Operations Center" });
  };

  const handlePermissionToggle = (role: UserRole, permKey: keyof RolePermission["permissions"]) => {
    setLocalPermissions(prev => prev.map(rp => {
      if (rp.role === role) {
        return {
          ...rp,
          permissions: {
            ...rp.permissions,
            [permKey]: !rp.permissions[permKey]
          }
        };
      }
      return rp;
    }));
    setHasUnsavedPermissions(true);
  };

  const handleSavePermissions = () => {
    localPermissions.forEach(rp => {
      updateRolePermissions(rp.role, rp.permissions);
    });
    setHasUnsavedPermissions(false);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="space-y-4">
            
            {/* 1. KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard title="Total Users" value={users.length} icon={Users} variant="blue" />
              <KPICard title="Active Admins" value={activeAdmins} icon={ShieldCheck} variant="indigo" />
              <KPICard title="Field Units" value={activeResponders} icon={UserCheck} variant="emerald" />
              <KPICard title="Registered LGUs" value={lgus.length} icon={Building2} variant="amber" />
            </div>

            {/* 2. Middle Row: LGUs and Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Registered LGUs */}
              <div className="h-[400px] bg-white dark:bg-slate-900 border rounded-2xl shadow-sm flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <h3 className="font-bold text-[0.875rem]" style={{ color: 'var(--color-text-primary)' }}>Registered LGU DRRM Operations</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{lgus.length} Active Offices</span>
                </div>
                <div className="flex-1 w-full overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {lgus.map(lgu => (
                    <div key={lgu.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border rounded-xl flex flex-wrap items-center justify-between gap-3 group transition-colors" style={{ borderColor: 'var(--color-border)' }}>
                      <div>
                        <div className="font-bold text-sm tracking-tight mb-0.5" style={{ color: 'var(--color-text-primary)' }}>{lgu.name}</div>
                        <div className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>{lgu.region} • DRRM Head: {lgu.drrmHead}</div>
                      </div>
                      <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-md">
                        {lgu.registeredRespondersCount} Responders
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Governance Activity Logs */}
              <div className="h-[400px] bg-white dark:bg-slate-900 border rounded-2xl shadow-sm flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <h3 className="font-bold text-[0.875rem]" style={{ color: 'var(--color-text-primary)' }}>Governance Activity Logs</h3>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live Audit
                  </span>
                </div>
                <div className="flex-1 w-full overflow-y-auto p-4 space-y-2 custom-scrollbar">
                  {systemLogs.slice(0, 6).map(log => (
                    <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 border rounded-xl flex flex-col gap-1 transition-colors" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{log.userName} ({log.userRole})</span>
                        <span className="font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{log.details}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 2. USER MANAGEMENT TAB */}
      {(activeTab === "users" || activeTab === "overview") && activeTab !== "overview" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">User Management</h2>
              <p className="text-xs text-slate-500 mt-0.5">Role-Based Access Control (RBAC), Provisioning & Account Status</p>
            </div>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New User Account</span>
            </button>
          </div>

          {/* Search & Role Filter Bar */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search users by name, email, or department..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Role Filter:</span>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="ALL">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin / LGU-DRRM</option>
                <option value="RESPONDER">Responder</option>

                <option value="CITIZEN">Citizen</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Assigned Role</th>
                    <th className="p-4">LGU / Barangay</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Last Active</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.map(usr => (
                    <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{usr.name}</div>
                        <div className="text-[10px] text-slate-500">{usr.email} • {usr.phone}</div>
                      </td>
                      <td className="p-4">
                        <StatusBadge type="role" value={usr.role} size="sm" />
                      </td>
                      <td className="p-4 text-slate-700 font-medium">
                        {usr.lguName || usr.barangay || "Central District"}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          usr.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : (usr.status === "PENDING" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-slate-100 text-slate-600 border border-slate-200")
                        }`}>
                          {usr.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{usr.lastActive}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Role Change Dropdown */}
                          <select
                            value={usr.role}
                            onChange={e => updateUserRole(usr.id, e.target.value as UserRole)}
                            className="bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-700 rounded px-2 py-1 focus:outline-none"
                          >
                            <option value="SUPER_ADMIN">Super Admin</option>
                            <option value="ADMIN">Admin</option>
                            <option value="RESPONDER">Responder</option>

                            <option value="CITIZEN">Citizen</option>
                          </select>

                          <button
                            onClick={() => toggleUserStatus(usr.id)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              usr.status === "ACTIVE" ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            }`}
                            title={usr.status === "ACTIVE" ? "Deactivate User Account" : (usr.status === "PENDING" ? "Approve User Account" : "Reactivate User Account")}
                          >
                            {usr.status === "ACTIVE" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. ROLE & PERMISSIONS MATRIX TAB */}
      {activeTab === "roles" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Role & Permission Matrix</h2>
              <p className="text-xs text-slate-500 mt-0.5">Fine-grained access rights management across all portal features</p>
            </div>

            {hasUnsavedPermissions && (
              <button
                onClick={handleSavePermissions}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm animate-bounce"
              >
                <Save className="w-4 h-4" />
                <span>Save Permission Matrix Changes</span>
              </button>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Permission Category</th>
                    <th className="p-3 text-center">Super Admin</th>
                    <th className="p-3 text-center">Admin / LGU</th>
                    <th className="p-3 text-center">Responder</th>

                    <th className="p-3 text-center">Citizen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[
                    { key: "incidentsCreate", label: "Create Emergency Incidents" },
                    { key: "incidentsVerify", label: "Verify & Prioritize Incidents" },
                    { key: "incidentsAssign", label: "Assign Field Responders" },
                    { key: "incidentsDelete", label: "Delete / Purge Incident Logs" },
                    { key: "requestsManage", label: "Manage Assistance Requests Queue" },
                    { key: "resourcesAdd", label: "Add & Edit Inventory Stock" },
                    { key: "resourcesTransfer", label: "Authorize Supply Transfers" },
                    { key: "evacuationManage", label: "Manage Evacuation Facilities" },
                    { key: "usersManage", label: "User Account Provisioning" },
                    { key: "systemLogsView", label: "Access Immutable Audit Logs" }
                  ].map(item => (
                    <tr key={item.key} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">{item.label}</td>
                      {(["SUPER_ADMIN", "ADMIN", "RESPONDER", "CITIZEN"] as UserRole[]).map(r => {
                        const permVal = localPermissions.find(p => p.role === r)?.permissions[item.key as keyof RolePermission["permissions"]];
                        return (
                          <td key={r} className="p-3 text-center">
                            <button
                              onClick={() => handlePermissionToggle(r, item.key as keyof RolePermission["permissions"])}
                              className={`w-6 h-6 rounded border inline-flex items-center justify-center transition-colors ${
                                permVal ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-50 border-slate-200 text-slate-400"
                              }`}
                            >
                              {permVal ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. AUDIT LOGS TAB */}
      {activeTab === "audit" && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-slate-900">System Monitoring & Audit Trail</h2>
            <p className="text-xs text-slate-500 mt-0.5">Immutable record of all disaster decisions, dispatches, and user logins</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs p-4 space-y-3">
            {systemLogs.map(log => (
              <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600">{log.action}</span>
                    <span className="text-slate-500">• {log.userName} ({log.userRole})</span>
                  </div>
                  <span className="text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-slate-800 font-medium">{log.details}</div>
                <div className="text-[10px] text-slate-500 pt-1 flex justify-between">
                  <span>IP Address: {log.ipAddress}</span>
                  <StatusBadge type="simple" value={log.severity} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SYSTEM SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-slate-900">System Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">Global configuration and feature flags</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-xs">
            <Settings className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">Settings Configuration</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">Global system configuration and maintenance tools will be available here in the next update.</p>
          </div>
        </div>
      )}

      {/* 6. ANALYTICS & REPORTS TAB */}
      {activeTab === "analytics" && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-slate-900">Analytics & Reports</h2>
            <p className="text-xs text-slate-500 mt-0.5">Export platform data and view systemic insights</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-xl flex items-center justify-between shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-slate-800">User Registry Export</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Download a complete CSV of all registered users</p>
              </div>
              <button 
                onClick={() => {
                  const headers = "ID,Name,Email,Role,Status,LGU\n";
                  const rows = users.map(u => `${u.id},"${u.name}","${u.email}",${u.role},${u.status},"${u.lguName}"`).join("\n");
                  const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `smartrelief_users_${new Date().toISOString().split("T")[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
            
            <div className="bg-white border border-slate-200 p-5 rounded-xl flex items-center justify-between shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Audit Trail Export</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Download system security logs</p>
              </div>
              <button 
                onClick={() => {
                  const headers = "Timestamp,Action,User,Role,Severity,Details\n";
                  const rows = systemLogs.map(l => `"${l.timestamp}","${l.action}","${l.userName}",${l.userRole},${l.severity},"${l.details}"`).join("\n");
                  const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `smartrelief_audit_${new Date().toISOString().split("T")[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Provision New User Account"
        subtitle="Create an authorized SmartRelief user credentials"
      >
        <form onSubmit={handleCreateUserSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={newUserData.name}
              onChange={e => setNewUserData({ ...newUserData, name: e.target.value })}
              placeholder="e.g., Capt. Manuel Ramos"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
            <input
              type="email"
              required
              value={newUserData.email}
              onChange={e => setNewUserData({ ...newUserData, email: e.target.value })}
              placeholder="m.ramos@drrm.gov.ph"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Contact Phone</label>
            <input
              type="text"
              value={newUserData.phone}
              onChange={e => setNewUserData({ ...newUserData, phone: e.target.value })}
              placeholder="+63 917 000 0000"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">System Access Role</label>
            <select
              value={newUserData.role}
              onChange={e => setNewUserData({ ...newUserData, role: e.target.value as UserRole })}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin / LGU-DRRM Administrator</option>
              <option value="RESPONDER">Responder</option>

              <option value="CITIZEN">Citizen</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddUserOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
