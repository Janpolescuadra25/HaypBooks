-- Add composite index on Company(tenantId, isActive) for faster active company queries
CREATE INDEX IF NOT EXISTS "Company_tenantId_isActive_idx" ON "Company"("tenantId", "isActive");
