import React from 'react';
import { 
  Building2, 
  Database, 
  Layers, 
  Server, 
  ShieldCheck, 
  Users, 
  HardDrive, 
  Activity,
  AlertTriangle,
  CheckCircle2,
  Plus
} from 'lucide-react';

export default function TenantOrganizationsView({ tenants, summary, onNavigateProvision }) {
  const getIsolationBadge = (mode) => {
    if (mode === 'SCHEMA_PER_TENANT') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-violet-500/20 text-violet-300 border border-violet-500/40">
          <Database className="w-3 h-3 mr-1 text-violet-400" />
          SCHEMA ISOLATED
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40">
          <Layers className="w-3 h-3 mr-1 text-blue-400" />
          SHARED RLS
        </span>
      );
    }
  };

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'ENTERPRISE':
        return <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">ENTERPRISE</span>;
      case 'GROWTH':
        return <span className="text-[10px] font-mono font-bold text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">GROWTH</span>;
      default:
        return <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">STARTER</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-violet-400" />
            Multi-Tenant SaaS Organizations & Data Isolation Grid
          </h2>
          <p className="text-xs text-slate-400">
            Schema-per-tenant vs. row-level security isolation, tenant-aware connection pooling, and quota meters.
          </p>
        </div>

        <button
          onClick={onNavigateProvision}
          className="px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-lg shadow-violet-950/50"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Tenant</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-mono text-slate-400">Active Tenant Organizations</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {summary?.totalTenants || 5} Orgs
          </div>
          <div className="text-[11px] text-violet-400 mt-1 flex items-center gap-1">
            <Database className="w-3 h-3" /> {summary?.schemaIsolatedTenantsCount || 4} Schema-Isolated
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-mono text-slate-400">Aggregate Storage Consumed</div>
          <div className="text-2xl font-bold text-violet-400 font-mono mt-1">
            {summary?.totalStorageUsedGb || 573.8} GB
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across PostgreSQL RDS tablespaces</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-mono text-slate-400">Monthly API Invocations</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {((summary?.totalMonthlyApiCalls || 2739000) / 1000000).toFixed(2)}M calls
          </div>
          <div className="text-[11px] text-teal-400 mt-1 flex items-center gap-1">
            <Activity className="w-3 h-3" /> Rate limit governor active
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-mono text-slate-400">Active Licensed Seats</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {summary?.totalActiveSeats || 514} Seats
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <Users className="w-3 h-3" /> 100% RBAC verified
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-violet-400" />
            Provisioned Tenant Schemas & Resources
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {tenants.length} Tenant Clusters
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 font-mono text-[11px] text-slate-400 uppercase">
                <th className="py-3 px-4">Organization & Slug</th>
                <th className="py-3 px-4">Isolation Architecture</th>
                <th className="py-3 px-4">Database Schema</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Seats Used</th>
                <th className="py-3 px-4">Storage Used</th>
                <th className="py-3 px-4">API Meter</th>
                <th className="py-3 px-4 text-right">Pool Conns</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {tenants.map((t) => {
                const apiPercent = Math.min(100, Math.round((t.monthlyApiCalls / t.quotaLimitCalls) * 100));
                const storagePercent = Math.min(100, Math.round((t.storageUsedGb / t.storageQuotaGb) * 100));

                return (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-medium text-white">
                      <div className="font-bold">{t.organizationName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{t.id} • {t.slug}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getIsolationBadge(t.isolationMode)}
                    </td>
                    <td className="py-3.5 px-4 text-violet-300 font-mono">
                      {t.databaseSchema}
                    </td>
                    <td className="py-3.5 px-4">
                      {getTierBadge(t.tier)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {t.activeSeats} / <span className="text-slate-500">{t.seatLimit}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-300">{t.storageUsedGb} GB ({storagePercent}%)</div>
                      <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full ${storagePercent > 80 ? 'bg-amber-500' : 'bg-violet-500'}`} 
                          style={{ width: `${storagePercent}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-300">{(t.monthlyApiCalls / 1000).toFixed(0)}k ({apiPercent}%)</div>
                      <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full ${apiPercent > 90 ? 'bg-rose-500' : 'bg-teal-500'}`} 
                          style={{ width: `${apiPercent}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-slate-300 font-bold">
                        {t.connectionPool?.activeConnections || 4}
                      </span>
                      <span className="text-slate-500"> / {t.connectionPool?.maxConnections || 25}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
