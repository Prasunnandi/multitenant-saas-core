import React from 'react';
import { 
  Building2, 
  Layers, 
  PlusCircle, 
  ShieldCheck, 
  Database, 
  Users, 
  Server
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'tenants', label: 'Tenant Organizations', icon: Building2, badge: '5 Orgs' },
    { id: 'provisioner', label: 'Tenant Provisioner', icon: PlusCircle, badge: 'Schema RLS' },
    { id: 'rbac', label: 'RBAC Security Matrix', icon: ShieldCheck, badge: 'Auth' }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400 font-bold shadow-inner">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
              MultiTenant
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                Core
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">SaaS Isolation Architecture</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 px-3 py-2 uppercase tracking-wider">
            Tenant Control Plane
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/30 shadow-sm' 
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                    isActive ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <Server className="w-4 h-4 text-violet-400" />
          <span>PostgreSQL Multi-Schema Engine</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          Kaggle Multi-Tenant SaaS Benchmark
        </div>
      </div>
    </aside>
  );
}
