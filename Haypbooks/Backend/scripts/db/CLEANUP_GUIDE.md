# TenantId_old Database Cleanup Guide

**Last Updated**: 2026-01-17  
**Status**: Ready for execution

---

## 📋 Overview

This guide walks you through safely removing `tenantId_old` columns from the HaypBooks database after the tenant ID migration from UUID to TEXT.

**Current State**:
- ✅ Lockfile cleaned (Redis dependencies removed)
- ✅ Backend builds successfully
- ✅ Backup script ready
- ✅ Rollback script ready
- ✅ Cleanup SQL scripts prepared

---

## 🔐 Safety First - Pre-Flight Checklist

Before starting, ensure:

- [ ] **Database is stable** - No active issues or errors
- [ ] **Application runs normally** - Test all critical features
- [ ] **Test suite passes** - Run `npm run test:e2e`
- [ ] **You have time to monitor** - Don't rush, allow 2-3 hours
- [ ] **No production deployments pending** - Do this in quiet period
- [ ] **PostgreSQL tools installed** - `pg_dump` and `psql` available

---

## 🚀 Execution Steps

### Step 1: Create Database Backup (CRITICAL) 🔴

**Script**: `scripts/db/backup-before-cleanup.ps1`

```powershell
# Run from Backend directory
cd C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\Backend
.\scripts\db\backup-before-cleanup.ps1
```

**What it does**:
- Creates timestamped backup in `./backups/` directory
- Verifies backup file format
- Shows backup size and location
- Lists recent backups

**Expected output**: 
```
✅ Backup completed successfully!
   File: .\backups\haypbooks_before_tenantid_cleanup_20260117_143022.sql
   Size: 15.24 MB
```

⚠️ **STOP HERE** if backup fails. Fix any errors before proceeding.

---

### Step 2: Phase 1 - Drop Safe Columns (Low Risk) 🟡

**Script**: `scripts/db/drop-safe-tenantid-old-columns.sql`

These 19 tables have NO constraints on `tenantId_old`:
- AccountBalance, SearchIndexingQueue, SearchIndexedDoc
- ApiRateLimit, DsrExportRequest, ConsentRecord
- IdempotencyKey, OutboxEvent, Class
- Customer, FixedAssetCategory, Location
- LineTax, OpeningBalance, Project
- TaxCodeAccount, TenantBillingUsage, TenantBillingInvoice, Vendor

**Execute**:
```powershell
# Connect to database
psql -h localhost -p 5432 -U postgres -d haypbooks

# Run the script
\i scripts/db/drop-safe-tenantid-old-columns.sql

# Verify columns dropped
SELECT table_name FROM information_schema.columns 
WHERE column_name = 'tenantId_old' AND table_schema = 'public'
ORDER BY table_name;
```

**Expected**: Should see 19 fewer rows (only constrained tables remain)

**Test after execution**:
1. Start backend: `npm run dev`
2. Check logs for errors
3. Test app manually (login, view data)
4. Run test suite: `npm run test:e2e`

⚠️ If errors occur, restore from backup and investigate.

---

### Step 3: Phase 2a - Drop Foreign Key Constraints (Medium Risk) 🟠

**Script**: `scripts/db/drop-constrained-tenantid-old-columns.sql` (Step 1 only)

**Execute**:
```powershell
psql -h localhost -p 5432 -U postgres -d haypbooks

# Run ONLY Step 1 (constraint drops)
# Copy/paste Step 1 section from the SQL file
# OR comment out Step 2 before running the whole file
```

**What happens**: Drops foreign key constraints but keeps columns

**Test after execution**:
1. Start backend: `npm run dev`
2. Test app functionality
3. Run test suite: `npm run test:e2e`
4. Monitor for 1-2 hours

⚠️ If app breaks, you can still restore constraints (columns still exist)

---

### Step 4: Phase 2b - Drop Constrained Columns (Final Step) 🔴

**Script**: `scripts/db/drop-constrained-tenantid-old-columns.sql` (Step 2)

⚠️ **ONLY** proceed if Phase 2a succeeded and app is stable!

**Execute**:
```powershell
psql -h localhost -p 5432 -U postgres -d haypbooks

# Uncomment Step 2 in the SQL file, then:
\i scripts/db/drop-constrained-tenantid-old-columns.sql
```

**Verify complete cleanup**:
```sql
SELECT table_name FROM information_schema.columns 
WHERE column_name = 'tenantId_old' AND table_schema = 'public';
```

**Expected**: No rows returned (all `tenantId_old` columns gone)

**Final testing**:
1. Restart backend completely
2. Full application smoke test
3. Run full test suite
4. Monitor logs for 24 hours
5. Test all major features

---

## 🔄 Rollback Procedures

### If Problems Occur in Phase 1 or 2a:

**Option A - Restore from backup** (recommended):
```powershell
# Stop backend first
psql -h localhost -p 5432 -U postgres -d haypbooks -f ".\backups\haypbooks_before_tenantid_cleanup_YYYYMMDD_HHMMSS.sql"
```

**Option B - Use rollback script**:
```powershell
psql -h localhost -p 5432 -U postgres -d haypbooks -f ".\scripts\db\rollback-tenantid-cleanup.sql"
```

### If Problems Occur in Phase 2b:

**MUST restore from backup** (rollback script won't restore data):
```powershell
psql -h localhost -p 5432 -U postgres -d haypbooks -f ".\backups\haypbooks_before_tenantid_cleanup_YYYYMMDD_HHMMSS.sql"
```

---

## ⚠️ Special Cases

### TenantUser Table
This table has a **PRIMARY KEY** that includes `tenantId_old`. Handle separately:

1. Check current primary key:
```sql
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'TenantUser' AND constraint_type = 'PRIMARY KEY';
```

2. If needed, recreate primary key without `tenantId_old` BEFORE dropping column
3. Test thoroughly before proceeding

---

## 📊 Verification Queries

### Check remaining tenantId_old columns:
```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE column_name = 'tenantId_old' 
  AND table_schema = 'public'
ORDER BY table_name;
```

### Check remaining tenantId constraints:
```sql
SELECT tc.constraint_name, tc.table_name, tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.constraint_name LIKE '%tenantId%' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

### Check foreign key details:
```sql
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (kcu.column_name = 'tenantId_old' OR ccu.column_name = 'tenantId_old');
```

---

## 📝 Execution Log Template

Keep notes as you execute:

```
=== TenantId_old Cleanup Execution Log ===
Date: _______________
Executed by: _______________

[ ] Step 1: Backup created
    - Backup file: _______________________________
    - Size: _______ MB
    - Verified: Yes/No

[ ] Step 2: Safe columns dropped (Phase 1)
    - Timestamp: _______________
    - Columns dropped: 19
    - App tested: Pass/Fail
    - Test suite: Pass/Fail

[ ] Step 3: Constraints dropped (Phase 2a)
    - Timestamp: _______________
    - Constraints dropped: ~65
    - App tested: Pass/Fail
    - Test suite: Pass/Fail

[ ] Step 4: Constrained columns dropped (Phase 2b)
    - Timestamp: _______________
    - Columns dropped: ~65
    - App tested: Pass/Fail
    - Test suite: Pass/Fail

[ ] Final verification
    - All tenantId_old columns gone: Yes/No
    - All tenantId_old constraints gone: Yes/No
    - App stable for 24h: Yes/No

Issues encountered:
_________________________________________________
_________________________________________________

Resolution:
_________________________________________________
_________________________________________________
```

---

## 🎯 Success Criteria

Cleanup is successful when:

1. ✅ Zero `tenantId_old` columns remain in database
2. ✅ Zero `tenantId_old` foreign key constraints remain
3. ✅ Backend starts without errors
4. ✅ All test suites pass
5. ✅ Application functions normally
6. ✅ No errors in logs for 24 hours
7. ✅ All critical features tested and working

---

## 🆘 Need Help?

If issues occur:

1. **Don't panic** - You have a backup
2. **Stop immediately** - Don't make it worse
3. **Document the error** - Screenshot logs
4. **Restore from backup** - Use rollback procedure
5. **Investigate root cause** - Before trying again

---

## 📦 File Reference

All scripts in `Backend/scripts/db/`:

- `backup-before-cleanup.ps1` - Creates database backup
- `drop-safe-tenantid-old-columns.sql` - Phase 1 (safe drops)
- `drop-constrained-tenantid-old-columns.sql` - Phase 2 (constraint + column drops)
- `rollback-tenantid-cleanup.sql` - Emergency rollback (no data restore)

Reports:
- `tenantid_old_cleanup_report.md` - Analysis of what needs cleanup
- `TENANTID_CLEANUP_PROGRESS.md` - Current progress and next steps

---

**Good luck! Take your time and test thoroughly at each step.** 🚀✅
