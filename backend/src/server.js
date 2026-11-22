import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { initialTenants } from './data.js';

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

let tenants = [...initialTenants];

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MultiTenant SaaS Core & Isolation Architecture Platform',
    version: '1.0.0'
  });
});

// Cluster summary
app.get('/api/v1/analytics/cluster-summary', (req, res) => {
  const total = tenants.length;
  const schemaTenants = tenants.filter(t => t.isolationMode === 'SCHEMA_PER_TENANT').length;
  const totalStorageGb = tenants.reduce((acc, t) => acc + t.storageUsedGb, 0);
  const totalApiCalls = tenants.reduce((acc, t) => acc + t.monthlyApiCalls, 0);
  const totalSeats = tenants.reduce((acc, t) => acc + t.activeSeats, 0);

  res.json({
    totalTenants: total,
    schemaIsolatedTenantsCount: schemaTenants,
    rowLevelSecurityTenantsCount: total - schemaTenants,
    totalStorageUsedGb: Math.round(totalStorageGb * 10) / 10,
    totalMonthlyApiCalls: totalApiCalls,
    totalActiveSeats: totalSeats
  });
});

// List tenants
app.get('/api/v1/tenants', (req, res) => {
  res.json(tenants);
});

// Get single tenant
app.get('/api/v1/tenants/:id', (req, res) => {
  const tenant = tenants.find(t => t.id === req.params.id);
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant organization not found' });
  }
  res.json(tenant);
});

// Onboard new tenant
app.post('/api/v1/tenants', (req, res) => {
  const { organizationName, slug, isolationMode, tier } = req.body;
  const cleanSlug = (slug || organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-')).slice(0, 24);
  const isSchema = (isolationMode || 'SCHEMA_PER_TENANT') === 'SCHEMA_PER_TENANT';
  
  const newTenant = {
    id: `TEN-00${tenants.length + 1}`,
    organizationName: organizationName || 'New Venture Corp',
    slug: cleanSlug,
    isolationMode: isSchema ? 'SCHEMA_PER_TENANT' : 'ROW_LEVEL_SECURITY',
    databaseSchema: isSchema ? `tenant_${cleanSlug.replace(/-/g, '_')}` : 'public.tenants_shared',
    tier: tier || 'GROWTH',
    activeSeats: 5,
    seatLimit: tier === 'ENTERPRISE' ? 250 : 50,
    storageUsedGb: 1.2,
    storageQuotaGb: tier === 'ENTERPRISE' ? 500 : 100,
    monthlyApiCalls: 1500,
    quotaLimitCalls: tier === 'ENTERPRISE' ? 1000000 : 250000,
    status: 'ACTIVE',
    connectionPool: { activeConnections: 2, maxConnections: 20, idleTimeoutMs: 10000 },
    rbacUsers: [
      { email: `admin@${cleanSlug}.com`, role: 'OWNER' }
    ]
  };

  tenants.unshift(newTenant);
  res.status(201).json(newTenant);
});

// Update quota
app.post('/api/v1/tenants/:id/update-quota', (req, res) => {
  const tenant = tenants.find(t => t.id === req.params.id);
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant organization not found' });
  }

  const { seatLimit, storageQuotaGb, quotaLimitCalls } = req.body;
  if (seatLimit) tenant.seatLimit = Number(seatLimit);
  if (storageQuotaGb) tenant.storageQuotaGb = Number(storageQuotaGb);
  if (quotaLimitCalls) tenant.quotaLimitCalls = Number(quotaLimitCalls);

  res.json({ message: `Quotas updated for ${tenant.organizationName}`, tenant });
});

app.listen(PORT, () => {
  console.log(`MultiTenant SaaS backend listening on port http://localhost:${PORT}`);
});
