-- Migration: Add DESC indexes for DocumentRenderLog to optimize common analytics queries
-- Run this in Postgres (psql) against the target database. Uses CONCURRENTLY to avoid stalls on production systems.

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documentrenderlog_workspace_company_renderedat_desc
ON "DocumentRenderLog" ("workspaceId", "companyId", "renderedAt" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documentrenderlog_workspace_user_renderedat_desc
ON "DocumentRenderLog" ("workspaceId", "userId", "renderedAt" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documentrenderlog_status_renderedat_desc
ON "DocumentRenderLog" ("status", "renderedAt" DESC);

-- Rollback (if necessary):
-- DROP INDEX CONCURRENTLY IF EXISTS idx_documentrenderlog_workspace_company_renderedat_desc;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_documentrenderlog_workspace_user_renderedat_desc;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_documentrenderlog_status_renderedat_desc;
