import React, { useState } from "react";
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
  Save
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

  const activeAdmins = users.filter(u => u.role === "ADMIN" && u.status === "ACTIVE").length;
  const activeResponders = users.filter(u => (u.role === "RESPONDER" || u.role === "VOLUNTEER") && u.status === "ACTIVE").length;
  const activeIncidents = incidents.filter(i => i.status !== "RESOLVED" && i.status !== "CLOSED").length;

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
          <div>
            <h2 className="text-xl font-black text-slate-900">Super Admin System Command</h2>
            <p className="text-xs text-slate-500 mt-0.5">High-Level Governance, User Access Control & Multi-LGU Infrastructure</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total Registered Users" value={users.length} subtext="Across all 4 role portals" icon={Users} variant="blue" />
            <KPICard title="Active LGU Administrators" value={activeAdmins} subtext="DRRM Operational Leads" icon={ShieldCheck} variant="indigo" />
            <KPICard title="Responders & Volunteers" value={activeResponders} subtext="Registered Field Units" icon={UserCheck} variant="emerald" />
            <KPICard title="Registered LGUs" value={lgus.length} subtext="Municipal DRRM Operations" icon={Building2} variant="amber" />
          </div>

          {/* Quick System Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Registered LGU DRRM Operations
                </h3>
                <span className="text-xs font-bold text-blue-600">{lgus.length} Active Offices</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {lgus.map(lgu => (
                  <div key={lgu.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{lgu.name}</div>
                      <div className="text-[10px] text-slate-500">{lgu.region} • DRRM Head: {lgu.drrmHead}</div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 rounded">
                      {lgu.registeredRespondersCount} Responders
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-600" />
                  Recent Governance Activity Logs
                </h3>
                <span className="text-xs text-slate-500 font-mono font-medium">Live Audit</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {systemLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-bold text-blue-600">{log.userName} ({log.userRole})</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-slate-700 font-medium truncate">{log.details}</div>
                  </div>
                ))}
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
                <option value="VOLUNTEER">Volunteer</option>
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
                          usr.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"
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
                            <option value="VOLUNTEER">Volunteer</option>
                            <option value="CITIZEN">Citizen</option>
                          </select>

                          <button
                            onClick={() => toggleUserStatus(usr.id)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              usr.status === "ACTIVE" ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            }`}
                            title={usr.status === "ACTIVE" ? "Deactivate User Account" : "Reactivate User Account"}
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
                    <th className="p-3 text-center">Volunteer</th>
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
                      {(["SUPER_ADMIN", "ADMIN", "RESPONDER", "VOLUNTEER", "CITIZEN"] as UserRole[]).map(r => {
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
              <option value="VOLUNTEER">Volunteer</option>
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
