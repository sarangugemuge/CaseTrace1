'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getRoleLabel } from '../../../lib/roles';
import { apiClient } from '../../../lib/apiClient';
import { RoleRecord, SystemConfig } from '../../../types/admin';
import { PermissionDeniedState, LoadingState } from '../../../components/common/UXStates';
import {
  ShieldCheck,
  Users,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Database,
  Lock,
  RefreshCw,
  X
} from 'lucide-react';

const AVAILABLE_PERMISSIONS = [
  'CREATE_CASE',
  'EDIT_CASE',
  'VIEW_CASE',
  'UPLOAD_DOCUMENT',
  'VIEW_DOCUMENT',
  'DOWNLOAD_DOCUMENT',
  'MODIFY_DOCUMENT',
  'DELETE_DOCUMENT',
  'VERIFY_INTEGRITY',
  'VIEW_AUDIT',
  'EXPORT_AUDIT',
  'ADMIN_ROLES',
  'ADMIN_CONFIG'
];

export default function AdminPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'roles' | 'config'>('roles');

  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Role Modal States
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleKey, setRoleKey] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [roleActive, setRoleActive] = useState(true);
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [roleSuccess, setRoleSuccess] = useState<string | null>(null);

  // Config Form States
  const [shaPolicy, setShaPolicy] = useState('STRICT_AUTHENTIC');
  const [maxUploadMb, setMaxUploadMb] = useState(50);
  const [auditDays, setAuditDays] = useState(365);
  const [configSaving, setConfigSaving] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  if (!currentUser) return null;

  // Strict Admin Isolation: Admin role ONLY
  const isAuthorized = currentUser.role === 'Admin';

  const loadRoles = useCallback(async () => {
    if (!isAuthorized) return;
    setLoadingRoles(true);
    try {
      const data = await apiClient.getAdminRoles();
      setRoles(data);
    } catch (err) {
      console.error('Failed to load roles:', err);
    } finally {
      setLoadingRoles(false);
    }
  }, [isAuthorized]);

  const loadConfig = useCallback(async () => {
    if (!isAuthorized) return;
    setLoadingConfig(true);
    try {
      const data = await apiClient.getAdminConfig();
      setConfig(data);
      setShaPolicy(data.sha256_enforcement);
      setMaxUploadMb(data.max_upload_size_mb);
      setAuditDays(data.audit_retention_days);
    } catch (err) {
      console.error('Failed to load config:', err);
    } finally {
      setLoadingConfig(false);
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (isAuthorized) {
      loadRoles();
      loadConfig();
    }
  }, [isAuthorized, loadRoles, loadConfig]);

  if (!isAuthorized) {
    return (
      <div className="max-w-3xl mx-auto my-8">
        <PermissionDeniedState
          role={currentUser.role}
          reason={`Clearance Denied: You are currently signed in as "${getRoleLabel(currentUser.role)}". The System Administration & Governance Console is restricted exclusively to the System Administrator.`}
          policyId="POL-ADMIN-RESTRICTED-01"
          onReturnHref="/dashboard"
          onReturnText="Return to Dashboard"
        />
      </div>
    );
  }

  const handleOpenNewRoleModal = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleKey('');
    setRoleDesc('');
    setRolePermissions(['VIEW_CASE', 'VIEW_DOCUMENT']);
    setRoleActive(true);
    setRoleError(null);
    setRoleModalOpen(true);
  };

  const handleOpenEditRoleModal = (role: RoleRecord) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleKey(role.role_key);
    setRoleDesc(role.description || '');
    setRolePermissions([...role.permissions]);
    setRoleActive(role.is_active);
    setRoleError(null);
    setRoleModalOpen(true);
  };

  const handleTogglePermission = (perm: string) => {
    setRolePermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setRoleError('Role name is required.');
      return;
    }

    setRoleSaving(true);
    setRoleError(null);

    try {
      if (editingRole) {
        await apiClient.updateAdminRole(editingRole.id, {
          name: roleName.trim(),
          description: roleDesc.trim() || undefined,
          permissions: rolePermissions,
          is_active: roleActive,
        });
        setRoleSuccess(`Role '${roleName}' updated successfully.`);
      } else {
        if (!roleKey.trim()) {
          setRoleError('Role key is required.');
          setRoleSaving(false);
          return;
        }
        await apiClient.createAdminRole({
          name: roleName.trim(),
          role_key: roleKey.trim(),
          description: roleDesc.trim() || undefined,
          permissions: rolePermissions,
        });
        setRoleSuccess(`New role '${roleName}' created successfully.`);
      }

      await loadRoles();
      setTimeout(() => {
        setRoleSuccess(null);
        setRoleModalOpen(false);
      }, 700);
    } catch (err: any) {
      setRoleError(err.message || 'Failed to save role.');
    } finally {
      setRoleSaving(false);
    }
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!window.confirm(`Are you sure you want to delete role "${roleName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await apiClient.deleteAdminRole(roleId);
      await loadRoles();
    } catch (err: any) {
      alert(`Error deleting role: ${err.message}`);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaving(true);
    setConfigError(null);
    setConfigSuccess(false);

    try {
      const updated = await apiClient.updateAdminConfig({
        sha256_enforcement: shaPolicy,
        max_upload_size_mb: maxUploadMb,
        audit_retention_days: auditDays,
      });
      setConfig(updated);
      setConfigSuccess(true);
      setTimeout(() => setConfigSuccess(false), 2500);
    } catch (err: any) {
      setConfigError(err.message || 'Failed to update system config.');
    } finally {
      setConfigSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-6 shadow-card flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
            <span>ACCESS LEVEL:</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold uppercase">
              SYSTEM ADMINISTRATOR PRIVILEGED CONSOLE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            System Administration & Governance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Configure system roles, granular RBAC permissions, cryptographic integrity parameters, object storage endpoints, and system-wide retention policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenNewRoleModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create System Role
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-navy-800 font-mono text-xs">
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-3 font-bold border-b-2 transition-colors ${
            activeTab === 'roles'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-navy-950/50'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Role & Access Management ({roles.length})
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-4 py-3 font-bold border-b-2 transition-colors ${
            activeTab === 'config'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-navy-950/50'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          System & Storage Configuration
        </button>
      </div>

      {/* TAB 1: ROLE MANAGEMENT */}
      {activeTab === 'roles' && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-6 shadow-card transition-colors space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-navy-800">
            <div>
              <h2 className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Configured System Roles & Permissions Matrix
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Roles configured in PostgreSQL/SQLite database with granular action allowances.
              </p>
            </div>
            <button
              onClick={loadRoles}
              disabled={loadingRoles}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              title="Refresh Roles"
            >
              <RefreshCw className={`w-4 h-4 ${loadingRoles ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingRoles ? (
            <LoadingState message="Loading system roles registry..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-navy-800">
                  <tr>
                    <th scope="col" className="px-4 py-3">Role / Indian Title</th>
                    <th scope="col" className="px-4 py-3">Key Identifier</th>
                    <th scope="col" className="px-4 py-3">Description</th>
                    <th scope="col" className="px-4 py-3">Permissions ({AVAILABLE_PERMISSIONS.length})</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {roles.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span>{r.name}</span>
                          {r.is_system && (
                            <span className="text-[10px] bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">
                              SYSTEM
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-sans font-normal text-blue-600 dark:text-blue-400 mt-0.5">
                          {getRoleLabel(r.name as any)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-bold">{r.role_key}</td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-sans max-w-xs truncate" title={r.description}>
                        {r.description || '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {r.permissions.slice(0, 3).map((p, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300"
                            >
                              {p}
                            </span>
                          ))}
                          {r.permissions.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400">
                              +{r.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] ${
                            r.is_active
                              ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                          }`}
                        >
                          {r.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditRoleModal(r)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-navy-800 transition-colors"
                          title="Edit Permissions"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!r.is_system && (
                          <button
                            onClick={() => handleDeleteRole(r.id, r.name)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-navy-800 transition-colors"
                            title="Delete Custom Role"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SYSTEM & STORAGE CONFIGURATION */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* Storage & Database Diagnostics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-card space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold pb-2 border-b border-slate-200 dark:border-navy-800">
                <HardDrive className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>EVIDENCE OBJECT STORAGE STATUS</span>
              </div>
              <div className="space-y-2 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">BACKEND ENGINE:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{config?.storage_backend || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">BUCKET IDENTIFIER:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{config?.storage_bucket || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ENDPOINT URL:</span>
                  <span className="text-slate-600 dark:text-slate-400 truncate max-w-[200px]" title={config?.storage_endpoint}>
                    {config?.storage_endpoint || '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-card space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold pb-2 border-b border-slate-200 dark:border-navy-800">
                <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>DATABASE & PERSISTENCE POOL</span>
              </div>
              <div className="space-y-2 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">DIALECT:</span>
                  <span className="font-bold uppercase text-slate-900 dark:text-white">{config?.db_dialect || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CONNECTION STATUS:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">{config?.db_status || 'CONNECTED'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">REGISTERED USERS:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{config?.active_sessions_count || 7} Personas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Config Policy Form */}
          <form onSubmit={handleSaveConfig} className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-6 shadow-card space-y-4">
            <div className="border-b border-slate-200 dark:border-navy-800 pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-mono text-sm font-bold text-slate-900 dark:text-white uppercase">
                  Runtime Security Policies & Limits
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Changes take effect immediately across all backend endpoints.
                </p>
              </div>
            </div>

            {configError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
                {configError}
              </div>
            )}
            {configSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>System configuration updated and recorded in audit log.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  SHA-256 Enforcement Policy
                </label>
                <select
                  value={shaPolicy}
                  onChange={(e) => setShaPolicy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="STRICT_AUTHENTIC">STRICT_AUTHENTIC (Reject Tampered Bytes)</option>
                  <option value="MONITOR_ONLY">MONITOR_ONLY (Alert on Mismatch)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  Controls automated verification behavior on evidence retrieval.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Max Document / Artifact Size (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={maxUploadMb}
                  onChange={(e) => setMaxUploadMb(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  Enforced server-side (HTTP 413) on document uploads.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Audit Trail Retention Period (Days)
                </label>
                <input
                  type="number"
                  min="30"
                  max="3650"
                  value={auditDays}
                  onChange={(e) => setAuditDays(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  Retention threshold for immutable security event records.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={configSaving}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {configSaving ? 'Saving Configuration...' : 'Save Configuration & Log Audit'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Role Edit/Create Modal */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-colors">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-navy-800">
              <h3 className="font-bold text-slate-900 dark:text-white font-mono text-sm uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                {editingRole ? `Edit Role: ${editingRole.name}` : 'Create New System Role'}
              </h3>
              <button
                onClick={() => setRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-5 space-y-4 font-sans text-xs">
              {roleError && (
                <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
                  {roleError}
                </div>
              )}
              {roleSuccess && (
                <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300">
                  {roleSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role Display Name *
                  </label>
                  <input
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    required
                    placeholder="e.g. Intelligence Analyst"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role Key Identifier *
                  </label>
                  <input
                    type="text"
                    value={roleKey}
                    onChange={(e) => setRoleKey(e.target.value)}
                    disabled={!!editingRole}
                    required
                    placeholder="e.g. Intelligence Analyst"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Scope
                </label>
                <input
                  type="text"
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  placeholder="Jurisdiction or statutory mandate for this role"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="roleActive"
                  checked={roleActive}
                  onChange={(e) => setRoleActive(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="roleActive" className="font-semibold text-slate-700 dark:text-slate-300">
                  Role is Active & Authorizable
                </label>
              </div>

              {/* Permissions Checkbox Grid */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-navy-800">
                <label className="block font-mono font-bold text-slate-900 dark:text-white uppercase text-[11px]">
                  Granted Granular Permissions ({rolePermissions.length}/{AVAILABLE_PERMISSIONS.length})
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-navy-950 p-3 rounded-lg border border-slate-200 dark:border-navy-800 max-h-48 overflow-y-auto">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <label
                      key={perm}
                      className="flex items-center gap-2 text-[11px] font-mono cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    >
                      <input
                        type="checkbox"
                        checked={rolePermissions.includes(perm)}
                        onChange={() => handleTogglePermission(perm)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setRoleModalOpen(false)}
                  disabled={roleSaving}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={roleSaving}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {roleSaving ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
