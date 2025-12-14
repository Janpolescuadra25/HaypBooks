# Advanced API Integration Patterns & Best Practices

## Custom App Development

### QuickBooks App Architecture

#### Multi-Tenant Application Design
```javascript
class QuickBooksMultiTenantApp {
  constructor() {
    this.tenants = new Map();
    this.connectionPool = new ConnectionPool();
  }
  
  async addTenant(realmId, tokens) {
    const tenant = {
      realmId,
      tokens,
      lastActivity: new Date(),
      rateLimiter: new RateLimiter(500, 60000), // 500 requests per minute
      cache: new Cache(realmId)
    };
    
    this.tenants.set(realmId, tenant);
    await this.persistTenant(tenant);
  }
  
  async executeRequest(realmId, operation) {
    const tenant = this.tenants.get(realmId);
    
    if (!tenant) {
      throw new Error('Tenant not found');
    }
    
    // Check rate limits
    await tenant.rateLimiter.acquire();
    
    // Get valid token
    const token = await this.getValidToken(tenant);
    
    // Check cache
    const cacheKey = this.getCacheKey(operation);
    const cached = await tenant.cache.get(cacheKey);
    
    if (cached && !operation.skipCache) {
      return cached;
    }
    
    // Execute request
    const result = await this.performRequest(token, operation);
    
    // Update cache
    await tenant.cache.set(cacheKey, result);
    
    // Update last activity
    tenant.lastActivity = new Date();
    
    return result;
  }
}
```

### Data Synchronization Patterns

#### Bi-directional Sync
```javascript
class BidirectionalSync {
  constructor(qbClient, externalSystem) {
    this.qb = qbClient;
    this.external = externalSystem;
    this.syncLog = new SyncLog();
  }
  
  async syncEntities(entityType, options = {}) {
    const {
      direction = 'bidirectional',
      conflictResolution = 'latest-wins',
      batchSize = 100
    } = options;
    
    try {
      // Get changes from both systems
      const qbChanges = await this.getQuickBooksChanges(entityType);
      const externalChanges = await this.getExternalChanges(entityType);
      
      // Detect conflicts
      const conflicts = this.detectConflicts(qbChanges, externalChanges);
      
      // Resolve conflicts
      const resolved = await this.resolveConflicts(conflicts, conflictResolution);
      
      // Apply changes
      if (direction === 'bidirectional' || direction === 'qb-to-external') {
        await this.pushToExternal(qbChanges, resolved);
      }
      
      if (direction === 'bidirectional' || direction === 'external-to-qb') {
        await this.pushToQuickBooks(externalChanges, resolved);
      }
      
      // Log sync results
      await this.syncLog.record({
        entityType,
        timestamp: new Date(),
        qbChanges: qbChanges.length,
        externalChanges: externalChanges.length,
        conflicts: conflicts.length,
        status: 'success'
      });
      
    } catch (error) {
      await this.syncLog.recordError(entityType, error);
      throw error;
    }
  }
  
  detectConflicts(qbChanges, externalChanges) {
    const conflicts = [];
    
    for (const qbChange of qbChanges) {
      const externalChange = externalChanges.find(
        e => e.mappingId === qbChange.mappingId
      );
      
      if (externalChange && 
          qbChange.lastModified !== externalChange.lastModified) {
        conflicts.push({
          entityId: qbChange.id,
          qbVersion: qbChange,
          externalVersion: externalChange
        });
      }
    }
    
    return conflicts;
  }
  
  async resolveConflicts(conflicts, strategy) {
    const resolved = [];
    
    for (const conflict of conflicts) {
      let winner;
      
      switch (strategy) {
        case 'latest-wins':
          winner = conflict.qbVersion.lastModified > 
                   conflict.externalVersion.lastModified
                   ? 'quickbooks' : 'external';
          break;
          
        case 'quickbooks-wins':
          winner = 'quickbooks';
          break;
          
        case 'external-wins':
          winner = 'external';
          break;
          
        case 'manual':
          winner = await this.promptUserForResolution(conflict);
          break;
      }
      
      resolved.push({
        ...conflict,
        resolution: winner
      });
    }
    
    return resolved;
  }
}
```

#### Event-Driven Sync
```javascript
class EventDrivenSync {
  constructor() {
    this.eventBus = new EventEmitter();
    this.queue = new Queue('sync-queue');
    this.processors = new Map();
  }
  
  registerProcessor(eventType, processor) {
    this.processors.set(eventType, processor);
    
    this.eventBus.on(eventType, async (event) => {
      await this.queue.enqueue({
        type: eventType,
        data: event,
        timestamp: new Date()
      });
    });
  }
  
  async startProcessing() {
    while (true) {
      const job = await this.queue.dequeue();
      
      if (!job) {
        await this.sleep(1000);
        continue;
      }
      
      try {
        const processor = this.processors.get(job.type);
        
        if (processor) {
          await processor(job.data);
          await this.recordSuccess(job);
        }
      } catch (error) {
        await this.handleError(job, error);
      }
    }
  }
  
  async handleError(job, error) {
    job.retries = (job.retries || 0) + 1;
    
    if (job.retries < 3) {
      // Exponential backoff
      const delay = Math.pow(2, job.retries) * 1000;
      await this.queue.enqueue(job, delay);
    } else {
      // Send to dead letter queue
      await this.dlq.enqueue({
        ...job,
        error: error.message,
        failedAt: new Date()
      });
    }
  }
}
```

### Performance Optimization

#### Caching Strategy
```javascript
class QuickBooksCacheManager {
  constructor(redisClient) {
    this.redis = redisClient;
    this.ttls = {
      customer: 3600,      // 1 hour
      invoice: 300,        // 5 minutes
      item: 7200,          // 2 hours
      report: 1800         // 30 minutes
    };
  }
  
  async get(entityType, id, fetcher) {
    const key = `qb:${entityType}:${id}`;
    
    // Try cache first
    const cached = await this.redis.get(key);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Fetch from API
    const data = await fetcher();
    
    // Store in cache
    await this.redis.setex(
      key,
      this.ttls[entityType] || 600,
      JSON.stringify(data)
    );
    
    return data;
  }
  
  async invalidate(entityType, id) {
    const key = `qb:${entityType}:${id}`;
    await this.redis.del(key);
    
    // Also invalidate related caches
    await this.invalidateRelated(entityType, id);
  }
  
  async invalidateRelated(entityType, id) {
    // Invalidate reports that include this entity
    if (entityType === 'customer' || entityType === 'invoice') {
      await this.redis.del('qb:report:ar-aging');
      await this.redis.del('qb:report:sales-by-customer');
    }
  }
}
```

#### Connection Pooling
```javascript
class QuickBooksConnectionPool {
  constructor(maxConnections = 10) {
    this.pool = [];
    this.maxConnections = maxConnections;
    this.activeConnections = 0;
    this.waitQueue = [];
  }
  
  async acquire(realmId) {
    if (this.activeConnections >= this.maxConnections) {
      return new Promise((resolve) => {
        this.waitQueue.push({ realmId, resolve });
      });
    }
    
    this.activeConnections++;
    
    const connection = {
      realmId,
      createdAt: new Date(),
      inUse: true
    };
    
    this.pool.push(connection);
    return connection;
  }
  
  release(connection) {
    connection.inUse = false;
    this.activeConnections--;
    
    // Process wait queue
    if (this.waitQueue.length > 0) {
      const waiting = this.waitQueue.shift();
      this.acquire(waiting.realmId).then(waiting.resolve);
    }
  }
  
  async executeWithConnection(realmId, operation) {
    const connection = await this.acquire(realmId);
    
    try {
      return await operation(connection);
    } finally {
      this.release(connection);
    }
  }
}
```

### Error Handling & Retry Logic

#### Comprehensive Error Handler
```javascript
class QuickBooksErrorHandler {
  constructor() {
    this.retryableErrors = [
      'RATE_LIMIT_EXCEEDED',
      'SERVICE_UNAVAILABLE',
      'GATEWAY_TIMEOUT',
      'INTERNAL_SERVER_ERROR'
    ];
  }
  
  async executeWithRetry(operation, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
        
      } catch (error) {
        lastError = error;
        
        const errorType = this.classifyError(error);
        
        if (!this.isRetryable(errorType)) {
          throw this.enhanceError(error);
        }
        
        if (attempt < maxRetries) {
          const delay = this.calculateBackoff(attempt, errorType);
          await this.sleep(delay);
          
          if (errorType === 'AUTH_ERROR') {
            await this.refreshAuth();
          }
        }
      }
    }
    
    throw lastError;
  }
  
  classifyError(error) {
    if (error.statusCode === 401) return 'AUTH_ERROR';
    if (error.statusCode === 429) return 'RATE_LIMIT';
    if (error.statusCode === 500) return 'SERVER_ERROR';
    if (error.statusCode === 503) return 'UNAVAILABLE';
    if (error.code === 'ECONNRESET') return 'NETWORK_ERROR';
    
    return 'UNKNOWN';
  }
  
  calculateBackoff(attempt, errorType) {
    const baseDelay = errorType === 'RATE_LIMIT' ? 60000 : 1000;
    return baseDelay * Math.pow(2, attempt - 1);
  }
  
  enhanceError(error) {
    const enhanced = new Error(error.message);
    enhanced.originalError = error;
    enhanced.timestamp = new Date();
    enhanced.context = this.gatherContext();
    
    return enhanced;
  }
}
```

### Security Best Practices

#### Token Security
```javascript
class SecureTokenManager {
  constructor(encryptionKey) {
    this.cipher = new AES256(encryptionKey);
    this.vault = new SecureVault();
  }
  
  async storeToken(realmId, tokens) {
    const encrypted = {
      accessToken: this.cipher.encrypt(tokens.accessToken),
      refreshToken: this.cipher.encrypt(tokens.refreshToken),
      expiresAt: tokens.expiresAt,
      createdAt: new Date()
    };
    
    await this.vault.store(`qb-tokens-${realmId}`, encrypted);
    
    // Audit log
    await this.auditLog('TOKEN_STORED', realmId);
  }
  
  async retrieveToken(realmId) {
    const encrypted = await this.vault.retrieve(`qb-tokens-${realmId}`);
    
    if (!encrypted) {
      throw new Error('Token not found');
    }
    
    // Audit log
    await this.auditLog('TOKEN_RETRIEVED', realmId);
    
    return {
      accessToken: this.cipher.decrypt(encrypted.accessToken),
      refreshToken: this.cipher.decrypt(encrypted.refreshToken),
      expiresAt: encrypted.expiresAt
    };
  }
  
  async rotateTokens(realmId) {
    const current = await this.retrieveToken(realmId);
    const newTokens = await this.refreshTokens(current.refreshToken);
    
    await this.storeToken(realmId, newTokens);
    await this.revokeToken(current.accessToken);
    
    // Audit log
    await this.auditLog('TOKEN_ROTATED', realmId);
    
    return newTokens;
  }
}
```

### Monitoring & Logging

#### API Monitoring System
```javascript
class QuickBooksAPIMonitor {
  constructor() {
    this.metrics = {
      requests: new Counter(),
      errors: new Counter(),
      latency: new Histogram(),
      rateLimit: new Gauge()
    };
  }
  
  async trackRequest(operation, executeFunc) {
    const start = Date.now();
    const labels = {
      operation: operation.type,
      entity: operation.entity
    };
    
    try {
      const result = await executeFunc();
      
      this.metrics.requests.inc(labels);
      this.metrics.latency.observe(labels, Date.now() - start);
      
      return result;
      
    } catch (error) {
      this.metrics.errors.inc({
        ...labels,
        error: error.code || 'UNKNOWN'
      });
      
      throw error;
    }
  }
  
  async checkHealth() {
    const health = {
      status: 'healthy',
      checks: {}
    };
    
    // Check API connectivity
    try {
      await this.pingAPI();
      health.checks.api = 'pass';
    } catch {
      health.checks.api = 'fail';
      health.status = 'unhealthy';
    }
    
    // Check rate limit
    const rateLimit = await this.getRateLimit();
    health.checks.rateLimit = rateLimit.remaining > 100 ? 'pass' : 'warning';
    
    // Check token validity
    const tokenStatus = await this.checkTokens();
    health.checks.tokens = tokenStatus;
    
    return health;
  }
  
  getMetrics() {
    return {
      totalRequests: this.metrics.requests.get(),
      totalErrors: this.metrics.errors.get(),
      avgLatency: this.metrics.latency.mean(),
      p95Latency: this.metrics.latency.percentile(0.95),
      rateLimitRemaining: this.metrics.rateLimit.get()
    };
  }
}
```

## Testing & Quality Assurance

### Unit Testing
```javascript
describe('QuickBooks API Integration', () => {
  let qbClient;
  let mockAPI;
  
  beforeEach(() => {
    mockAPI = new MockQuickBooksAPI();
    qbClient = new QuickBooksClient(mockAPI);
  });
  
  describe('Customer Operations', () => {
    test('should create customer successfully', async () => {
      const customerData = {
        DisplayName: 'Test Customer',
        PrimaryEmailAddr: { Address: 'test@example.com' }
      };
      
      mockAPI.setResponse('create', 'Customer', {
        Id: '123',
        ...customerData
      });
      
      const result = await qbClient.createCustomer(customerData);
      
      expect(result.Id).toBe('123');
      expect(result.DisplayName).toBe('Test Customer');
    });
    
    test('should handle validation errors', async () => {
      mockAPI.setError('create', 'Customer', {
        code: 'VALIDATION_ERROR',
        message: 'Email is required'
      });
      
      await expect(
        qbClient.createCustomer({ DisplayName: 'Test' })
      ).rejects.toThrow('Email is required');
    });
  });
});
```

### Integration Testing
```javascript
describe('End-to-End Integration', () => {
  test('Complete order flow', async () => {
    // Create customer
    const customer = await qbClient.createCustomer({
      DisplayName: 'Integration Test Customer'
    });
    
    // Create invoice
    const invoice = await qbClient.createInvoice({
      CustomerRef: { value: customer.Id },
      Line: [{
        Amount: 100,
        DetailType: 'SalesItemLineDetail'
      }]
    });
    
    // Record payment
    const payment = await qbClient.createPayment({
      CustomerRef: { value: customer.Id },
      TotalAmt: 100,
      Line: [{
        Amount: 100,
        LinkedTxn: [{
          TxnId: invoice.Id,
          TxnType: 'Invoice'
        }]
      }]
    });
    
    // Verify invoice is paid
    const updatedInvoice = await qbClient.getInvoice(invoice.Id);
    expect(updatedInvoice.Balance).toBe(0);
  });
});
```

## Deployment & Operations

### Production Checklist
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Error logging enabled
- [ ] Monitoring dashboards setup
- [ ] Rate limiting implemented
- [ ] Token encryption enabled
- [ ] Backup procedures documented
- [ ] Disaster recovery plan
- [ ] Security audit completed
- [ ] Performance testing done

### Scaling Considerations
1. **Horizontal Scaling**: Multiple app instances
2. **Caching Layer**: Redis/Memcached
3. **Queue System**: RabbitMQ/SQS for async processing
4. **Database Sharding**: For tenant data
5. **CDN**: For static assets
6. **Load Balancing**: Distribute API requests

## Conclusion

The QuickBooks API provides powerful capabilities for integrating financial data with external systems. Key success factors include:

1. **Proper Authentication**: Secure token management
2. **Error Handling**: Robust retry logic
3. **Performance**: Caching and optimization
4. **Monitoring**: Track API usage and health
5. **Testing**: Comprehensive test coverage
6. **Documentation**: Clear API documentation

By following these patterns and best practices, you can build reliable, scalable, and secure integrations with QuickBooks Online.
