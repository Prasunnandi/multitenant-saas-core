import React from 'react';
import { 
  ShieldCheck, 
  Users, 
  Key, 
  CheckCircle2, 
  XCircle, 
  Lock 
} from 'lucide-react';

export default function RbacSecurityMatrix() {
  const permissions = [
    { name: 'Schema Migration DDL', owner: true, admin: false, member: false, auditor: false },
    { name: 'Connection Pool Allocation', owner: true, admin: true, member: false, auditor: false },
    { name: 'Tenant Billing & Quota Upgrades', owner: true, admin: true, member: false, auditor: false },
    { name: 'CRUD Domain Records', owner: true, admin: true, member: true, auditor: false },
    { name: 'Audit Log & Telemetry Export', owner: true, admin: true, member: false, auditor: true },
    { name: 'Invite & Manage Team Users', owner: true, admin: true, member: false, auditor: false }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-violet-400" />
          Multi-Tenant RBAC Security & Authorization Matrix
        </h2>
        <p className="text-xs text-slate-400">
          Enforce fine-grained schema boundaries, audit compliance, and role-based permissions.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-violet-400" />
            Tenant Security Role Capabilities
          </h3>
          <span className="text-xs font-mono text-slate-400">4 Global Roles</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 font-mono text-[11px] text-slate-400 uppercase">
                <th className="py-3 px-4">System Capability</th>
                <th className="py-3 px-4 text-center">OWNER</th>
                <th className="py-3 px-4 text-center">ADMIN</th>
                <th className="py-3 px-4 text-center">MEMBER</th>
                <th className="py-3 px-4 text-center">AUDITOR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {permissions.map((p) => (
                <tr key={p.name} className="hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-sans font-medium text-white">{p.name}</td>
                  <td className="py-3.5 px-4 text-center">
                    {p.owner ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {p.admin ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {p.member ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {p.auditor ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
