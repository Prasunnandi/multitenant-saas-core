// MultiTenant SaaS Core API Service

const API_BASE = 'http://localhost:5005';

export const fallbackTenants = [
  {
    id: "TEN-001",
    organizationName: "Apex Global Technologies",
    slug: "apex-tech",
    isolationMode: "SCHEMA_PER_TENANT",
    databaseSchema: "tenant_apex_tech",
    tier: "ENTERPRISE",
    activeSeats: 145,
    seatLimit: 250,
    storageUsedGb: 84.5,
    storageQuotaGb: 500,
    monthlyApiCalls: 482000,
    quotaLimitCalls: 1000000,
    status: "ACTIVE",
    connectionPool: { activeConnections: 12, maxConnections: 30, idleTimeoutMs: 10000 },
    rbacUsers: [
      { email: "admin@apextech.com", role: "OWNER" },
      { email: "devops@apextech.com", role: "ADMIN" },
      { email: "analyst@apextech.com", role: "MEMBER" }
    ]
  },
  {
    id: "TEN-002",
    organizationName: "Skyline Media Partners",
    slug: "skyline-media",
    isolationMode: "ROW_LEVEL_SECURITY",
    databaseSchema: "public.tenants_shared",
    tier: "GROWTH",
    activeSeats: 38,
    seatLimit: 50,
    storageUsedGb: 22.1,
    storageQuotaGb: 100,
    monthlyApiCalls: 142000,
    quotaLimitCalls: 250000,
    status: "ACTIVE",
    connectionPool: { activeConnections: 4, maxConnections: 15, idleTimeoutMs: 10000 },
    rbacUsers: [
      { email: "ceo@skylinemedia.com", role: "OWNER" },
      { email: "editor@skylinemedia.com", role: "MEMBER" }
    ]
  },
  {
    id: "TEN-003",
    organizationName: "Quantum Financial Analytics",
    slug: "quantum-fin",
    isolationMode: "SCHEMA_PER_TENANT",
    databaseSchema: "tenant_quantum_fin",
    tier: "ENTERPRISE",
    activeSeats: 89,
    seatLimit: 100,
    storageUsedGb: 145.0,
    storageQuotaGb: 200,
    monthlyApiCalls: 920000,
    quotaLimitCalls: 1000000,
    status: "ACTIVE",
    connectionPool: { activeConnections: 18, maxConnections: 40, idleTimeoutMs: 10000 },
    rbacUsers: [
      { email: "compliance@quantumfin.com", role: "AUDITOR" },
      { email: "cfo@quantumfin.com", role: "OWNER" }
    ]
  },
  {
    id: "TEN-004",
    organizationName: "BioVance Health Labs",
    slug: "biovance-labs",
    isolationMode: "SCHEMA_PER_TENANT",
    databaseSchema: "tenant_biovance_labs",
    tier: "ENTERPRISE",
    activeSeats: 52,
    seatLimit: 75,
    storageUsedGb: 41.8,
    storageQuotaGb: 250,
    monthlyApiCalls: 210000,
    quotaLimitCalls: 500000,
    status: "ACTIVE",
    connectionPool: { activeConnections: 6, maxConnections: 25, idleTimeoutMs: 10000 },
    rbacUsers: [
      { email: "admin@biovance.com", role: "OWNER" },
      { email: "researcher@biovance.com", role: "MEMBER" }
    ]
  },
  {
    id: "TEN-006",
    organizationName: "OmniRetail Logistics",
    slug: "omni-retail",
    isolationMode: "SCHEMA_PER_TENANT",
    databaseSchema: "tenant_omni_retail",
    tier: "ENTERPRISE",
    activeSeats: 190,
    seatLimit: 200,
    storageUsedGb: 280.4,
    storageQuotaGb: 300,
    monthlyApiCalls: 985000,
    quotaLimitCalls: 1000000,
    status: "QUOTA_WARNING",
    connectionPool: { activeConnections: 24, maxConnections: 35, idleTimeoutMs: 10000 },
    rbacUsers: [
      { email: "cto@omniretail.com", role: "OWNER" },
      { email: "ops@omniretail.com", role: "ADMIN" }
    ]
  }
];

export async function fetchTenants() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/tenants`);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (e) {
    return fallbackTenants;
  }
}

export async function fetchClusterSummary() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/analytics/cluster-summary`);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (e) {
    return {
      totalTenants: 5,
      schemaIsolatedTenantsCount: 4,
      rowLevelSecurityTenantsCount: 1,
      totalStorageUsedGb: 573.8,
      totalMonthlyApiCalls: 2739000,
      totalActiveSeats: 514
    };
  }
}

export async function createTenant(tenantData) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tenantData)
    });
    if (!res.ok) throw new Error('Create error');
    return await res.json();
  } catch (e) {
    const cleanSlug = (tenantData.slug || tenantData.organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-')).slice(0, 24);
    const isSchema = (tenantData.isolationMode || 'SCHEMA_PER_TENANT') === 'SCHEMA_PER_TENANT';
    return {
      id: `TEN-00${Math.floor(7 + Math.random() * 20)}`,
      organizationName: tenantData.organizationName,
      slug: cleanSlug,
      isolationMode: isSchema ? 'SCHEMA_PER_TENANT' : 'ROW_LEVEL_SECURITY',
      databaseSchema: isSchema ? `tenant_${cleanSlug.replace(/-/g, '_')}` : 'public.tenants_shared',
      tier: tenantData.tier || 'GROWTH',
      activeSeats: 5,
      seatLimit: tenantData.tier === 'ENTERPRISE' ? 250 : 50,
      storageUsedGb: 1.2,
      storageQuotaGb: tenantData.tier === 'ENTERPRISE' ? 500 : 100,
      monthlyApiCalls: 1200,
      quotaLimitCalls: tenantData.tier === 'ENTERPRISE' ? 1000000 : 250000,
      status: 'ACTIVE',
      connectionPool: { activeConnections: 2, maxConnections: 20, idleTimeoutMs: 10000 },
      rbacUsers: [{ email: `admin@${cleanSlug}.com`, role: 'OWNER' }]
    };
  }
}
