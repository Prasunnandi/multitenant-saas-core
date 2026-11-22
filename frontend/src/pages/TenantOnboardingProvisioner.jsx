import React, { useState } from 'react';
import { 
  PlusCircle, 
  Database, 
  Layers, 
  CheckCircle2, 
  Terminal, 
  Server, 
  ShieldCheck, 
  Cpu, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { createTenant } from '../services/api';

export default function TenantOnboardingProvisioner({ onTenantCreated }) {
  const [form, setForm] = useState({
    organizationName: 'Vanguard Capital Partners',
    slug: 'vanguard-capital',
    isolationMode: 'SCHEMA_PER_TENANT',
    tier: 'ENTERPRISE'
  });

  const [provisionedTenant, setProvisionedTenant] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleNameChange = (e) => {
    const name = e.target.value;
    const generatedSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 24);
    setForm(prev => ({
      ...prev,
      organizationName: name,
      slug: generatedSlug
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await createTenant(form);
    setProvisionedTenant(result);
    setLoading(false);
    if (onTenantCreated) {
      onTenantCreated(result);
    }
  };

  const schemaName = form.isolationMode === 'SCHEMA_PER_TENANT' 
    ? `tenant_${form.slug.replace(/-/g, '_')}`
    : 'public.tenants_shared';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-violet-400" />
            Automated Tenant Onboarding & Schema Provisioner
          </h2>
          <p className="text-xs text-slate-400">
            Provision isolated PostgreSQL database schemas, allocate connection pools, and configure RBAC policies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Provisioning Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-violet-400" />
              Tenant Organization Specs
            </h3>
            <span className="text-xs text-slate-400 font-mono">Control Plane</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Company / Organization Name</label>
              <input
                type="text"
                value={form.organizationName}
                onChange={handleNameChange}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-sans focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Subdomain Slug / Identifier</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-violet-300 font-mono focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Isolation Strategy Radio */}
            <div>
              <label className="text-slate-300 font-medium block mb-2">Data Isolation Architecture</label>
              <div className="space-y-2">
                <label className={`p-3 rounded-lg border flex items-start space-x-3 cursor-pointer transition-all ${
                  form.isolationMode === 'SCHEMA_PER_TENANT' 
                    ? 'bg-violet-950/20 border-violet-500/50 ring-1 ring-violet-500/30' 
                    : 'bg-slate-950/40 border-slate-800'
                }`}>
                  <input
                    type="radio"
                    name="isolationMode"
                    value="SCHEMA_PER_TENANT"
                    checked={form.isolationMode === 'SCHEMA_PER_TENANT'}
                    onChange={(e) => setForm({ ...form, isolationMode: e.target.value })}
                    className="mt-1 accent-violet-500"
                  />
                  <div>
                    <div className="text-white font-bold text-xs flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-violet-400" />
                      Schema-per-Tenant (Enterprise Isolation)
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Dedicated schema per customer. Maximum compliance, isolated indexing, and zero cross-tenant leak risk.
                    </p>
                  </div>
                </label>

                <label className={`p-3 rounded-lg border flex items-start space-x-3 cursor-pointer transition-all ${
                  form.isolationMode === 'ROW_LEVEL_SECURITY' 
                    ? 'bg-blue-950/20 border-blue-500/50 ring-1 ring-blue-500/30' 
                    : 'bg-slate-950/40 border-slate-800'
                }`}>
                  <input
                    type="radio"
                    name="isolationMode"
                    value="ROW_LEVEL_SECURITY"
                    checked={form.isolationMode === 'ROW_LEVEL_SECURITY'}
                    onChange={(e) => setForm({ ...form, isolationMode: e.target.value })}
                    className="mt-1 accent-blue-500"
                  />
                  <div>
                    <div className="text-white font-bold text-xs flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      Shared Table + Row-Level Security (RLS)
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Single table with PostgreSQL RLS policies filtering by <code className="text-blue-300">tenant_id</code>. Cost-optimized.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Plan Tier */}
            <div>
              <label className="text-slate-300 font-medium block mb-1">Subscription Plan Tier</label>
              <select
                value={form.tier}
                onChange={(e) => setForm({ ...form, tier: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
              >
                <option value="ENTERPRISE">ENTERPRISE (250 seats • 500GB storage • 1M API calls)</option>
                <option value="GROWTH">GROWTH (50 seats • 100GB storage • 250k API calls)</option>
                <option value="STARTER">STARTER (10 seats • 25GB storage • 50k API calls)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-violet-950/50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Executing DDL Migrations...' : 'Provision Tenant & Initialize Schema'}</span>
            </button>
          </form>
        </div>

        {/* Live SQL DDL & Connection Telemetry (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold text-white">Automated PostgreSQL DDL Script Execution</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> DDL Generator Ready
              </span>
            </div>

            {/* Simulated SQL Terminal Output */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 leading-relaxed overflow-x-auto">
              <div className="text-slate-500">-- Automated DDL provisioner for {form.organizationName}</div>
              <div className="text-purple-400">CREATE SCHEMA IF NOT EXISTS <span className="text-white font-bold">{schemaName}</span>;</div>
              <div className="text-purple-400">SET search_path TO <span className="text-white font-bold">{schemaName}</span>, public;</div>
              <div className="text-slate-500">-- Establishing tenant table structures</div>
              <div className="text-cyan-400">CREATE TABLE <span className="text-white">{schemaName}.users</span> (id UUID PRIMARY KEY, email TEXT, role VARCHAR(32));</div>
              <div className="text-cyan-400">CREATE TABLE <span className="text-white">{schemaName}.orders</span> (id UUID PRIMARY KEY, total NUMERIC, created_at TIMESTAMPTZ);</div>
              <div className="text-slate-500">-- Allocating dedicated connection pool</div>
              <div className="text-emerald-400">GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA <span className="text-white">{schemaName}</span> TO <span className="text-teal-300">tenant_app_pool</span>;</div>
            </div>

            {/* Connection Pool Card */}
            <div className="p-4 bg-violet-950/20 rounded-lg border border-violet-500/30 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-violet-300 font-bold border-b border-violet-500/30 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-violet-400" /> Tenant Connection Pool Specification
                </span>
                <span className="text-emerald-400">ONLINE</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <div>Max Connections: <span className="text-white font-bold">{form.tier === 'ENTERPRISE' ? '30' : '15'}</span></div>
                <div>Idle Timeout: <span className="text-white font-bold">10,000 ms</span></div>
                <div>Connection Mode: <span className="text-teal-300 font-bold">Dedicated</span></div>
              </div>
            </div>

            {provisionedTenant && (
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-lg text-xs font-mono text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Successfully provisioned <strong>{provisionedTenant.organizationName}</strong> with schema <strong>{provisionedTenant.databaseSchema}</strong>.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
