### My Thoughts on the Current Prisma Schema

This is an **extremely ambitious and comprehensive** Prisma schema for a multi-tenant, multi-company SaaS accounting + payroll + inventory platform (very similar in scope to NetSuite, Xero, or QuickBooks Online at enterprise level).

**Strengths:**
- Excellent multi-tenant design with `Tenant` as the central hub.
- Good separation of global `User` vs tenant-scoped `TenantUser`.
- Solid core accounting foundation: Chart of Accounts, Journal Entries, sub-ledgers (AR/AP), inventory with cost layers (FIFO implied).
- Payroll, fixed assets, budgeting, time tracking, approvals, bank reconciliation — all major modules are touched.
- Operational tables (audit logs, outbox, idempotency, search indexing, billing) show production-grade thinking.
- Clear phasing comments and progressive complexity.

**Weaknesses & Gaps (Critical for a "complete and logically sound" system):**
1. **Missing Core Relations & Constraints**
   - Many reverse relations are missing or one-sided (e.g., `Invoice` → `Contact` via `Customer`, but no back-ref).
   - No proper linking between transactions and journal entries (no automated posting model).
   - Tax application on lines is incomplete (no relation to `InvoiceLine`/`BillLine` for taxes).

2. **Incomplete Sub-ledgers**
   - AR: Payments not linked to invoices (no `PaymentApplication`).
   - AP: Bill payments not properly applied to bills.
   - No credit memos properly applied.

3. **Inventory Costing Incomplete**
   - FIFO cost layers exist but no consumption logic modeled.
   - No average cost or LIFO alternatives.

4. **Missing Key Domains**
   - No `Department`, limited tracking categories (`Class`, `Location`, `Project` exist but incomplete).
   - No multi-currency transactions (only base/exchange rates).
   - No recurring transactions/templates.
   - No consolidated reporting across companies.

5. **Security & RBAC**
   - Role/Permission exists but no assignment to `TenantUser`.

6. **Data Integrity Issues**
   - Some fields like `tenantId` repeated unnecessarily when relation exists.
   - Some optional fields should be required.
   - Inconsistent naming (`issuedAt` vs `date`, `total` vs `totalAmount`).

7. **Scalability & Performance**
   - Missing composite indexes on frequent query patterns.
   - Large Json fields where structured data would be better.

### My Recommendations: How to Complete This Schema Properly

Here’s a prioritized, logical plan to make this schema **production-ready, complete, consistent, and scalable**.

#### 1. Fix Core Relationships & Back-References
Add missing reverse relations for navigation and data integrity.

```prisma
// Add to Customer
invoices Invoice[]
payments PaymentReceived[]

// Add to Invoice
payments PaymentApplication[]  // NEW MODEL needed

// Add to Bill
payments BillPayment[]  // already has, but rename to applications
credits VendorCreditApplication[]  // NEW
```

#### 2. Add Transaction Application Models (Critical for AR/AP)
These track how payments/credits are applied to invoices/bills.

```prisma
model InvoicePaymentApplication {
  id          String @id @default(uuid())
  tenantId    String
  invoiceId   String
  paymentId   String
  amount      Decimal @db.Decimal(16, 4)
  appliedAt   DateTime @default(now())
  
  invoice     Invoice @relation(fields: [invoiceId], references: [id])
  payment     PaymentReceived @relation(fields: [paymentId], references: [id])
  tenant      Tenant  @relation(fields: [tenantId], references: [id])

  @@unique([invoiceId, paymentId])
  @@index([tenantId, invoiceId])
  @@index([tenantId, paymentId])
}

model BillPaymentApplication {
  id          String @id @default(uuid())
  tenantId    String
  billId      String
  paymentId   String
  amount      Decimal @db.Decimal(16, 4)
  appliedAt   DateTime @default(now())

  bill        Bill    @relation(fields: [billId], references: [id])
  payment     BillPayment @relation(fields: [paymentId], references: [id])
  tenant      Tenant  @relation(fields: [tenantId], references: [id])

  @@unique([billId, paymentId])
}
```

#### 3. Complete Tax Application on Lines
Currently `LineTax` only loosely linked.

```prisma
// Add to InvoiceLine and BillLine
taxes LineTax[]

// Update LineTax
model LineTax {
  // ...
  invoiceLine   InvoiceLine? @relation(fields: [invoiceLineId], references: [id])
  billLine      BillLine?    @relation(fields: [billLineId], references: [id])
  purchaseOrderLine PurchaseOrderLine? @relation(fields: [purchaseOrderLineId], references: [id])
  
  purchaseOrderLineId String?
  
  @@index([invoiceLineId])
  @@index([billLineId])
  @@index([purchaseOrderLineId])
}
```

#### 4. Complete RBAC
Link roles to users in tenant.

```prisma
model TenantUser {
  // existing fields...
  roleId String?
  role   Role? @relation(fields: [roleId], references: [id])
  
  @@index([tenantId, roleId])
}
```

#### 5. Add Missing Tracking Dimensions
You have `Class`, `Location`, `Project` — make them usable on lines.

Add to:
- `JournalEntryLine`
- `InvoiceLine`
- `BillLine`
- `TimeEntry`
- etc.

```prisma
classId    String?
class      Class? @relation(fields: [classId], references: [id])
locationId String?
location   Location? @relation(fields: [locationId], references: [id])
projectId  String?
project    Project? @relation(fields: [projectId], references: [id])
```

#### 6. Add Multi-Currency Support on Transactions
```prisma
// Add to major transaction headers
currency       String @default("USD")
exchangeRate   Decimal? @db.Decimal(20, 12)
baseTotal      Decimal? @db.Decimal(20, 4)  // in base currency
```

#### 7. Add Recurring Templates
```prisma
model RecurringInvoice {
  id            String @id @default(uuid())
  tenantId      String
  customerId    String
  frequency     String // MONTHLY, QUARTERLY, etc.
  startDate     DateTime
  endDate       DateTime?
  nextRun       DateTime
  templateData  Json
  status        String @default("ACTIVE")
  
  tenant        Tenant @relation(fields: [tenantId], references: [id])
  customer      Customer @relation(fields: [customerId], references: [contactId])
}
```

#### 8. Improve Indexing Strategy
Add critical indexes:
- `(tenantId, date)` on all transaction headers
- `(tenantId, customerId)` on Invoice
- `(tenantId, itemId)` on StockLevel
- `(tenantId, status, createdAt)` on major entities

#### 9. Clean Up Inconsistencies
- Standardize date fields: use `issuedAt`, `dueAt`, `postedAt`
- Standardize amount fields: `totalAmount`, `subtotal`, `taxAmount`, `balanceDue`
- Remove redundant `tenantId` when relation exists (Prisma handles it via relation scalar)

#### 10. Final Architecture Recommendation

| Layer             | Recommendation                                  |
|-------------------|-------------------------------------------------|
| Tenant Model      | Keep as central hub — perfect                     |
| Company Support   | Good for multi-entity — keep                      |
| User Auth         | Solid (OTP, sessions, security events)            |
| Chart of Accounts | Excellent hierarchy support                       |
| Journal Engine    | Needs auto-posting rules engine (future phase)    |
| Subledgers        | Complete AR/AP with application models            |
| Inventory         | Strong with cost layers — add consumption logic   |
| Payroll           | MVP-ready for US hourly/salary                     |
| Fixed Assets      | Good start — add disposal, impairment later       |
| RBAC              | Complete with TenantUser → Role linking           |

### Final Verdict

You are **90% there** for a world-class accounting SaaS backend.

With the additions above — especially **payment applications, line-level taxes, RBAC linking, and tracking dimensions** — this schema will be:

- Logically complete  
- Double-entry safe  
- Multi-tenant secure  
- Ready for production at scale  

---

## What I implemented now (small, safe PR)

I've implemented a focused set of changes that close important gaps and are safe to apply in stages:

- Added `InvoicePaymentApplication` and `BillPaymentApplication` models and indices to record payment applications.
- Added `RecurringInvoice` model for scheduled invoice templates.
- Added multi-currency fields (`currency`, `exchangeRate`, `baseTotal`) on `Invoice`, `Bill`, and `JournalEntry`.
- Added `classId`, `locationId`, `projectId` tracking columns (and indexes) to line-level models (`InvoiceLine`, `BillLine`, `JournalEntryLine`, `PurchaseOrderLine`, `InventoryTransactionLine`).
- Added relations from `LineTax` to `InvoiceLine`, `BillLine`, and `PurchaseOrderLine`.
- Linked `TenantUser` to `Role` via `roleId` (RBAC linking).
- Wrote idempotent SQL migrations and scripts:
  - `prisma/migrations/20251213170000_company_tenant_integrity/migration.sql` — adds a trigger function to enforce company→tenant consistency, creates per-table triggers, adds NOT VALID FKs, and enables RLS on tables with `companyId`.
  - `prisma/migrations/20251213180000_applications_and_currency_and_tracking/migration.sql` — creates payment application tables, recurring invoices, multi-currency columns, and tracking columns (with NOT VALID FKs to `Class`/`Location`/`Project`).
  - `prisma/migrations/20251213183000_make_companyid_not_null/migration.sql` — idempotent script to set `companyId` NOT NULL on core transactional tables if backfilled (run after backfill & validation).
- Added scripts:
  - `scripts/db/backfill-company-ids.ts` — upserts a default `company-<tenant.id>` and backfills `companyId` where NULL.
  - `scripts/db/validate-company-fks.ts` — runs `ALTER TABLE ... VALIDATE CONSTRAINT` for company FKs.
  - `scripts/db/test-company-trigger.ts` — dev-only test to spot-check the company→tenant trigger behavior.
- Seed updates: seed now creates an admin `Role` and assigns `TenantUser.roleId`.

## Recommended next steps (staging → production)

1. Run the company migration and backfill in **staging** (use a prod-like snapshot):

   - Apply company trigger migration:

     psql "$STAGING_DATABASE_URL" -f prisma/migrations/20251213170000_company_tenant_integrity/migration.sql

   - Run backfill:

     npm --prefix "Haypbooks/Backend" run db:backfill:companyIds

   - Validate FKs (in staging maintenance window):

     npm --prefix "Haypbooks/Backend" run db:validate:company-fks

   - Apply the applications/currency/tracking migration:

     psql "$STAGING_DATABASE_URL" -f prisma/migrations/20251213180000_applications_and_currency_and_tracking/migration.sql

   - Run CI DB checks and integration tests: `npm --prefix "Haypbooks/Backend" run ci:db-ship-check`

   - Run seed and smoke tests for exports and reports.

2. If staging checks pass, schedule a short maintenance window for production and repeat the above steps there.

3. During the production maintenance window, after backfill and FK validation, run the `20251213183000_make_companyid_not_null/migration.sql` to make `companyId` NOT NULL on the agreed tables.

4. Consider the following follow-ups (non-blocking, but valuable):
   - Decide whether `Account` should be tenant-wide or company-scoped (document choice and enforce it).
   - Implement application-level invariants: immutability of posted docs, balancing checks enforced before posting, period locking checks.
   - Convert `status` string columns to enums with a safe multi-step migration if desired.

---

If you'd like, I can now:

- A) Run the staging runbook steps (apply migrations & backfill) using a staging DB URL you provide; or
- B) Prepare the migration PR and tests for your review and let you run staging; or
- C) Produce a targeted migration to make `companyId` NOT NULL for a short list of tables you confirm.

Which should I do next?


