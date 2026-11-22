// Multi-Tenant SaaS Seed Data

export const initialTenants = [
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
