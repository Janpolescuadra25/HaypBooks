# Prisma Schema Flow — Restaurant Analogy 🍽️

**Purpose:** Explain how the updated `prisma.schema` (company-scoped COA) flows and whether it follows good practices — explained using restaurant terminology so it's easy to grasp.

---

## TL;DR
- **Workspace** = Restaurant Group / Headquarters (users, access, roles, invites)
- **Company** = Single Restaurant Location (its own kitchen, menu, tax rules, staff)
- **Practice** = External Accounting Firm workspace (advisors who manage multiple locations)
- Core accounting masters (accounts, items, taxes, classes, locations, fixed assets, payroll) are **per-Company**: each restaurant has its own chart of accounts and inventory.
- Transactions (Invoices, Bills, JournalEntries, Payments) are **tied to a Company** and recorded as double-entry flows that feed balances and reports.

---

## Restaurant Map (entity analogy)
- Workspace → The Restaurant Group (HQ) that manages multiple restaurant locations.
- WorkspaceCapabilities → HQ feature flags (enable companies/practices).
- Practice → External accounting firm that can manage locations under its workspace.
- Company → A Restaurant Location (has its own menu, ingredients, tax rates, staff).
- Account / AccountBalance / OpeningBalance → The menu categories and running totals (e.g., cash drawer, sales, cost of goods sold).
- Item / StockLocation / StockLevel → Ingredients and pantries at each location.
- Invoice / InvoiceLine → Customer orders (sales tickets) and the items sold.
- Bill / BillLine / VendorCredit → Supplier invoices for ingredients and returns/credits.
- JournalEntry / JournalEntryLine → Daily ledger entries (the kitchen's bookkeeping to keep the books balanced).
- TaxCode / TaxRate / LineTax → Local tax rules applied to menu items per location.
- Employee / Payroll → Kitchen and front-of-house staff and their payruns.
- Subscription → POS or service subscription tied to a location or a practice (per-owner billing, one per owner).
- WorkspaceUser / Role / WorkspaceInvite → HQ users, managers, and access controls (table-based roles).
- CompanyUser / PracticeUser → Company/Practice-level access grants (scoped visibility).
- AuditLog → Audit trail scoped to workspace, company, or practice.

---

## Flow Walkthrough (step-by-step)
1. Setup (Open the restaurant)
   - Create a **Workspace** (group) and assign an **owner**.
   - Create a **Company** (restaurant location) under the Workspace.
   - Optionally create a **Practice** workspace for an external accounting firm.
   - Seed the location with a **COA** (Accounts), **Items** (menu/ingredients), **TaxCodes**, **StockLocations** (pantries), and **Employees**.

2. Day-to-day Operations (Orders & Purchases)
   - A sale becomes an **Invoice** with **InvoiceLine** items (customer order). Each line may have **LineTax**.
   - A purchase from a vendor becomes a **Bill** with **BillLine** items.
   - Inventory movements create **InventoryTransaction** and update **StockLevel** and **InventoryCostLayer**.

3. Posting to Ledger (double-entry)
   - Transactions create or are associated with a **JournalEntry** and related **JournalEntryLine** entries (debits/credits) to keep books balanced.
   - **JournalEntryLine** references **Account** (from the location's COA).
   - **AccountBalance** and **OpeningBalance** reflect running totals by company.

4. Payroll / Staff Costs
   - **Employee**, **PaySchedule**, **PayrollRun**, and **Paycheck** record staff pay; payroll lines can post ledger entries to expense/payable accounts.

5. Period Close & Reporting
   - Use **AccountingPeriod**, **FinancialStatementSnapshot**, and **Revaluation** to close periods and snapshot financials for the location.

6. Workspace / Admin Operations
   - HQ (Workspace) manages users, invites, roles, and cross-location tasks while each location (Company) keeps operational accounting separate.
   - WorkspaceCapabilities tracks feature flags per workspace.
   - Company/Practice track their own onboarding completion status.

---

## Is the schema following good practices? ✅ / ⚠️
- **Strengths**
- Isolation by `companyId`: good for multi-entity accounting — avoids cross-contamination of books.
- Clear relations & indexes: `@@index([companyId,...])` added to commonly queried fields improves performance for per-company queries.
- Single source of truth for roles: `WorkspaceUser.roleId` with Role/Permission tables ensures consistent access control.
- Billing integrity: unique subscription per Company/Practice prevents duplicate plans for the same owner.
- Consistent use of UUIDs for IDs and proper decimal precision for money fields.
- Transaction models require `companyId`, which prevents unscoped transactions and makes queries simpler and safer.

**Things to consider / Improvements**
- Referential integrity: Consider adding explicit `onDelete` behavior (Cascade vs Restrict) where business rules require it (e.g., deleting a company should not accidentally delete historic journal entries).
- Enforce workspace/company consistency: Many tables still carry `tenantId` (mapped to Workspace) and `companyId`; consider a DB-level check (or trigger) to ensure `company.workspaceId == transaction.tenantId` to avoid mismatches.
- Balanced posting guard: Add application validation or DB constraint/trigger to enforce that a posted JournalEntry's debits equal credits before marking as POSTED.
- Soft deletes vs hard deletes: For auditability, prefer soft delete (deletedAt) on critical masters rather than hard removal.
- Index coverage: Verify indexes for heavy read paths (reporting queries often by company + date range; add composite indexes where needed).
- Unique constraints: Ensure business-logic unique constraints exist (e.g., invoice numbers scoped to company, which exists in places) and enforce where missing.

---

## Migration / Backfill checklist (safety-first)
1. Add `companyId` columns (non-null with default NULL temporarily) and foreign keys.
2. Backfill logic: map existing workspace-scoped rows to appropriate `companyId` using business rules (e.g., default company per workspace, mapping table, or scripted mapping). Validate counts and duplicates.
3. Add constraints/tests: verify `company.workspaceId == tenantId` for all backfilled rows (or update `tenantId` to keep consistent policy).
4. Swap to non-nullable `companyId` and remove old `tenantId` when ready.
5. Apply application changes (queries, filters) and run integration tests.
6. Add migration to remove `tenantId` only after thorough validation and historical reports confirmed.

> Tip: Run backfill in a transaction-per-table, and keep reversible migration scripts.

---

## Quick examples (pseudo-SQL)
- Ensure company/workspace match (example check):

```sql
-- Find mismatches where transaction.tenantId (workspace) doesn't equal company's workspace
SELECT c.id as company_id, tx.id
FROM company c
JOIN invoice tx ON tx.companyId = c.id
WHERE tx.tenantId IS NOT NULL AND tx.tenantId <> c.tenantId;
```

- Backfill `companyId` example (requires business mapping):

```sql
-- Example: assign `companyId` for invoices using a default or mapping table `workspace_default_company`
UPDATE invoice i
SET companyId = m.companyId
FROM workspace_default_company m
WHERE i.tenantId = m.tenantId AND i.companyId IS NULL;
```

- Guard for balanced journal entries (app-level preferred; trigger example is possible):

```sql
-- App-level: validate sum(debit) == sum(credit) before setting JournalEntry.postingStatus = 'POSTED'
```

---

## Action items (recommended)
- Add DB constraints or triggers for workspace/company consistency and balanced postings.
- Add soft-delete flags and archival strategy for long-lived financial records.
- Create and run a thorough backfill plan with pre/post checks and dry-runs on a snapshot of production data.
- Add docs & tests for operational flows: posting, reversing, period close, and audit.

---

If you'd like, I can:
- provide the **backfill script template** tailored to your current data, or
- generate a **short test plan** that verifies all flows after migration.

Tell me which I should do next. 🍽️