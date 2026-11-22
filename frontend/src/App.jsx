import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import TenantOrganizationsView from './pages/TenantOrganizationsView';
import TenantOnboardingProvisioner from './pages/TenantOnboardingProvisioner';
import RbacSecurityMatrix from './pages/RbacSecurityMatrix';
import { fetchTenants, fetchClusterSummary, fallbackTenants } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('tenants');
  const [tenants, setTenants] = useState(fallbackTenants);
  const [summary, setSummary] = useState({
    totalTenants: 5,
    schemaIsolatedTenantsCount: 4,
    rowLevelSecurityTenantsCount: 1,
    totalStorageUsedGb: 573.8,
    totalMonthlyApiCalls: 2739000,
    totalActiveSeats: 514
  });

  useEffect(() => {
    async function load() {
      const t = await fetchTenants();
      if (t && t.length) setTenants(t);
      const s = await fetchClusterSummary();
      if (s) setSummary(s);
    }
    load();
  }, []);

  const handleTenantCreated = (newTenant) => {
    setTenants(prev => [newTenant, ...prev]);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar summary={summary} />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'tenants' && (
              <TenantOrganizationsView 
                tenants={tenants} 
                summary={summary} 
                onNavigateProvision={() => setActiveTab('provisioner')} 
              />
            )}
            {activeTab === 'provisioner' && (
              <TenantOnboardingProvisioner 
                onTenantCreated={handleTenantCreated} 
              />
            )}
            {activeTab === 'rbac' && (
              <RbacSecurityMatrix />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
