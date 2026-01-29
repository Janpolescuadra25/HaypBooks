Purpose: Add Project/ProjectLine/RevenueRecognitionSchedule models (Phase 1 job costing) and tenant RLS policies.

This migration safely creates the tables if they are missing, adds indexes and foreign keys idempotently, and enables Row-Level Security + tenant isolation policies for the new tables.

See also: scripts/db/backfill-project-counts.js and scripts/db/check_missing_rls_policies.js for verification and reconciliation.