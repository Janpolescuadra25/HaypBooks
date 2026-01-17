# TenantId_old Cleanup - Progress Report

**Date**: 2026-01-17  
**Status**: Phase 1 & 2 Complete - Ready for Database Cleanup ✅

---

## ✅ Completed: Option C - Lockfile Cleanup

**Actions taken**:
1. Ran `npm prune` to remove extraneous packages
2. Deleted `node_modules` directory  
3. Reinstalled with `npm install --ignore-scripts` (skipped husky due to no git)
4. Verified `ioredis` is no longer in dependencies
5. Confirmed TypeScript compilation passes

**Result**: Backend lockfile is clean, no Redis dependencies remain, typecheck passed ✅

---

## ✅ Completed: Safety Scripts Prepared

**Actions taken**:
1. Created backup PowerShell script: `scripts/db/backup-before-cleanup.ps1`
   - Automated pg_dump with timestamped backups
   - Verifies backup file integrity
   - Lists all available backups
   - Provides restore instructions

2. Created rollback SQL script: `scripts/db/rollback-tenantid-cleanup.sql`
   - Restores all tenantId_old columns
   - Restores foreign key constraints
   - Includes verification queries
   - Emergency safety net if cleanup fails

3. Created comprehensive guide: `scripts/db/CLEANUP_GUIDE.md`
   - Complete step-by-step instructions
   - Safety checklists at each phase
   - Rollback procedures
   - Verification queries
   - Execution log template

**Result**: Full safety net in place - backup + rollback ready ✅

---

## 📋 Prepared: Option B - Database Cleanup SQL

Created two SQL scripts for safe execution:

### 1. Safe Drops (Low Risk) ✅
**File**: `scripts/db/drop-safe-tenantid-old-columns.sql`

**Tables included** (19 tables with NO constraints):
- AccountBalance, SearchIndexingQueue, SearchIndexedDoc
- ApiRateLimit, DsrExportRequest, ConsentRecord
- IdempotencyKey, OutboxEvent, Class
- Customer, FixedAssetCategory, Location
- LineTax, OpeningBalance, Project
- TaxCodeAccount, TenantBillingUsage, TenantBillingInvoice, Vendor

**Recommended action**: Run this script first (with DB backup) and test app

---

### 2. Constrained Drops (High Risk) ⚠️
**File**: `scripts/db/drop-constrained-tenantid-old-columns.sql`

**Includes**:
- Foreign key constraint drops for all tables with `tenantId_old` FKs
- Column drops (commented out) to run AFTER testing
- **Special attention**: `TenantUser` table has PRIMARY KEY on `tenantId_old` — needs careful handling

**Recommended action**: 
1. Only run AFTER safe drops succeed and app tested
2. Run constraint drops first (Step 1)
3. Test application thoroughly
4. Uncomment and run column drops (Step 2)

---

## 🎯 Next Steps - Ready for Database Cleanup!

### Immediate (When Ready):
1. **Read the guide**: Review `scripts/db/CLEANUP_GUIDE.md` thoroughly
2. **Run backup script**: `.\scripts\db\backup-before-cleanup.ps1`
3. **Verify backup**: Check backup file created successfully
4. **Execute Phase 1**: Run `drop-safe-tenantid-old-columns.sql` (19 safe tables)
5. **Test thoroughly**: Backend + test suite + manual testing
6. **Execute Phase 2a**: Run constraint drops from `drop-constrained-tenantid-old-columns.sql`
7. **Test again**: Ensure app still works with constraints gone
8. **Execute Phase 2b**: Drop constrained columns (final step)
9. **Final verification**: Confirm all tenantId_old columns gone
10. **Monitor 24h**: Watch for any issues

### Recommended Timeline:
- **Day 1 Morning**: Create backup + run Phase 1 (safe drops)
- **Day 1 Afternoon**: Test + monitor
- **Day 2 Morning**: Run Phase 2a (constraint drops) if Day 1 succeeded
- **Day 2 Afternoon**: Test + monitor
- **Day 3 Morning**: Run Phase 2b (column drops) if Day 2 succeeded
- **Day 3+**: Monitor and verify stability

**Don't rush!** Each phase needs testing and monitoring.

### Special handling needed:
- **TenantUser table**: Has composite PRIMARY KEY including `tenantId_old`
  - May need to recreate primary key with new constraint
  - Consider separate migration for this table
  - Test with non-production data first

---

## 🔍 Verification Commands

After each step, check remaining tenantId_old columns:
```sql
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE column_name = 'tenantId_old' 
  AND table_schema = 'public'
ORDER BY table_name;
```

Check remaining constraints:
```sql
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE constraint_name LIKE '%tenantId%' 
  AND table_schema = 'public';
```

---

## ⚠️ Safety Checklist

Before running ANY SQL:
- [ ] Full database backup created (pg_dump)
- [ ] Backup tested and verified restorable
- [ ] Test suite is passing
- [ ] Application starts without errors
- [ ] Review SQL script line-by-line
- [ ] Have rollback plan ready

After running SQL:
- [ ] Run verification queries
- [ ] Test application manually
- [ ] Run full test suite
- [ ] Check logs for errors
- [ ] Monitor application for 24h

---

## 📝 Notes

- All SQL uses `IF EXISTS` to be idempotent
- Scripts can be run multiple times safely
- Local-only (no Git/PR needed per your preference)
- Commit to local Git after each successful phase (optional)

---

**Recommendation**: Start with safe drops tomorrow when you have time to monitor and test. The constrained drops can wait until safe drops are verified working. 🎯✅
