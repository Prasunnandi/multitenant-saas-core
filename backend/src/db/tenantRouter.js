/**
 * Dynamic Multi-Tenant Database Connection Pool & Schema Router
 * Manages tenant-aware database connection pooling, schema-per-tenant search_path routing,
 * dedicated database connection routing, and LRU pool lifecycle management.
 */

export const ISOLATION_STRATEGIES = {
  SCHEMA_PER_TENANT: 'SCHEMA_PER_TENANT',
  DATABASE_PER_TENANT: 'DATABASE_PER_TENANT',
  SHARED_TABLE_RLS: 'SHARED_TABLE_RLS'
};

/**
 * Validate and sanitize PostgreSQL schema/identifier to prevent SQL injection
 */
export function sanitizeSchemaIdentifier(identifier) {
  if (!identifier || typeof identifier !== 'string') {
    throw new Error('Tenant schema identifier must be a non-empty string');
  }
  const clean = identifier.trim().toLowerCase();
  if (!/^[a-z][a-z0-9_]{1,62}$/.test(clean)) {
    throw new Error(
      `Invalid schema name "${identifier}". Must start with letter, contain only [a-z0-9_], max 63 chars.`
    );
  }
  return clean;
}

/**
 * Lightweight mock/proxy database connection pool simulating pg.Pool
 */
export class MockDatabasePool {
  constructor(config) {
    this.config = config;
    this.totalCount = 0;
    this.idleCount = config.min || 2;
    this.waitingCount = 0;
    this.queryCount = 0;
    this.closed = false;
    this.lastActiveAt = Date.now();
  }

  async query(sql, params = []) {
    if (this.closed) throw new Error('Cannot execute query on closed pool');
    this.queryCount++;
    this.lastActiveAt = Date.now();
    return {
      command: 'SELECT',
      rowCount: 1,
      rows: [{ ok: true, executedSql: sql, params, schema: this.config.schema || 'public' }]
    };
  }

  async acquireClient() {
    if (this.closed) throw new Error('Cannot acquire client on closed pool');
    this.idleCount = Math.max(0, this.idleCount - 1);
    this.totalCount++;
    this.lastActiveAt = Date.now();

    return {
      query: (sql, params) => this.query(sql, params),
      release: () => {
        this.totalCount = Math.max(0, this.totalCount - 1);
        this.idleCount++;
      }
    };
  }

  async end() {
    this.closed = true;
    this.idleCount = 0;
    this.totalCount = 0;
  }
}

export class TenantDatabaseRouter {
  /**
   * @param {Object} [options]
   * @param {string} [options.defaultConnectionString]
   * @param {number} [options.maxPools=100] - Max active tenant pools before LRU eviction
   * @param {number} [options.idleTimeoutMs=300000] - 5 minutes idle reaper
   */
  constructor(options = {}) {
    this.defaultConnectionString = options.defaultConnectionString || 'postgresql://postgres:postgres@localhost:5432/saas_master';
    this.maxPools = options.maxPools || 100;
    this.idleTimeoutMs = options.idleTimeoutMs || 300000;

    // tenantId -> TenantConfig { id, isolationStrategy, schemaName, connectionString, maxConnections }
    this.tenantRegistry = new Map();
    // poolKey -> { pool, tenantId, lastUsedAt }
    this.poolCache = new Map();
  }

  /**
   * Register or update tenant database isolation configuration
   */
  registerTenant(tenantId, config = {}) {
    const strategy = config.isolationStrategy || ISOLATION_STRATEGIES.SCHEMA_PER_TENANT;
    const schemaName = config.schemaName
      ? sanitizeSchemaIdentifier(config.schemaName)
      : sanitizeSchemaIdentifier(`tenant_${tenantId.replace(/[^a-z0-9_]/gi, '_')}`);

    const tenantConfig = {
      tenantId,
      isolationStrategy: strategy,
      schemaName,
      connectionString: config.connectionString || this.defaultConnectionString,
      maxConnections: config.maxConnections || 10,
      minConnections: config.minConnections || 2
    };

    this.tenantRegistry.set(tenantId, tenantConfig);
    return tenantConfig;
  }

  /**
   * Resolve or lazily instantiate connection pool for tenant
   */
  async getPoolForTenant(tenantId) {
    let tenant = this.tenantRegistry.get(tenantId);
    if (!tenant) {
      // Default to schema-per-tenant on the fly
      tenant = this.registerTenant(tenantId);
    }

    const poolKey = tenant.isolationStrategy === ISOLATION_STRATEGIES.DATABASE_PER_TENANT
      ? `db:${tenant.connectionString}`
      : `schema:${tenant.connectionString}`;

    let poolEntry = this.poolCache.get(poolKey);

    if (!poolEntry || poolEntry.pool.closed) {
      // Evict oldest if pool cache exceeds capacity
      if (this.poolCache.size >= this.maxPools) {
        await this._evictOldestPool();
      }

      const pool = new MockDatabasePool({
        connectionString: tenant.connectionString,
        schema: tenant.schemaName,
        max: tenant.maxConnections,
        min: tenant.minConnections
      });

      poolEntry = {
        pool,
        tenantId,
        poolKey,
        lastUsedAt: Date.now()
      };
      this.poolCache.set(poolKey, poolEntry);
    }

    poolEntry.lastUsedAt = Date.now();
    return { pool: poolEntry.pool, tenantConfig: tenant };
  }

  /**
   * Execute tenant query with schema search_path or session context encapsulation
   * @param {string} tenantId
   * @param {Function} callback - Async function receiving (client, tenantConfig)
   * @returns {Promise<any>}
   */
  async withTenantClient(tenantId, callback) {
    const { pool, tenantConfig } = await this.getPoolForTenant(tenantId);
    const client = await pool.acquireClient();

    try {
      // Apply isolation strategy
      if (tenantConfig.isolationStrategy === ISOLATION_STRATEGIES.SCHEMA_PER_TENANT) {
        // Direct search_path isolation
        await client.query(`SET search_path TO "${tenantConfig.schemaName}", public;`);
      } else if (tenantConfig.isolationStrategy === ISOLATION_STRATEGIES.SHARED_TABLE_RLS) {
        // Session variable for PostgreSQL Row Level Security
        await client.query(`SET LOCAL app.current_tenant_id = '${tenantId}';`);
      }

      // Execute user payload
      const result = await callback(client, tenantConfig);
      return result;
    } finally {
      // Reset search_path before returning to pool
      try {
        await client.query('RESET search_path;');
      } catch (_) {
        // ignore reset error
      }
      client.release();
    }
  }

  /**
   * Execute a single parameterized SQL query in tenant context
   */
  async queryTenant(tenantId, sql, params = []) {
    return this.withTenantClient(tenantId, async (client) => {
      return client.query(sql, params);
    });
  }

  /**
   * Evict least-recently-used pool
   */
  async _evictOldestPool() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.poolCache.entries()) {
      if (entry.lastUsedAt < oldestTime) {
        oldestTime = entry.lastUsedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.poolCache.get(oldestKey);
      await entry.pool.end();
      this.poolCache.delete(oldestKey);
    }
  }

  /**
   * Close all connection pools
   */
  async closeAll() {
    for (const entry of this.poolCache.values()) {
      await entry.pool.end();
    }
    this.poolCache.clear();
  }

  /**
   * Inspect current router metrics
   */
  getMetrics() {
    const activePools = [];
    for (const [key, entry] of this.poolCache.entries()) {
      activePools.push({
        poolKey: key,
        tenantId: entry.tenantId,
        queryCount: entry.pool.queryCount,
        lastUsedAt: new Date(entry.lastUsedAt).toISOString()
      });
    }

    return {
      registeredTenants: this.tenantRegistry.size,
      activePoolCount: this.poolCache.size,
      pools: activePools
    };
  }
}

// Dual ESM & CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ISOLATION_STRATEGIES,
    sanitizeSchemaIdentifier,
    MockDatabasePool,
    TenantDatabaseRouter
  };
}

export default TenantDatabaseRouter;
