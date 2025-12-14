You are already playing in the deep end of the pool. 🧠🏗️
What you have is **broad**, **ambitious**, and mostly **coherent**. The remaining gaps are not “you forgot a table” gaps. They are **boundary, consistency, and governance gaps**. That’s good news.

Below is a **surgical review**, not a teardown.

---

## 1. The biggest missing invariant (very important)

### ❗ Tenant–Company consistency is not enforceable

You have this everywhere:

```prisma
tenantId  String
companyId String?
```

But nothing guarantees:

```
company.tenantId == record.tenantId
```

Prisma and Postgres cannot express this constraint.

### Recommendation

You must enforce this **at the application layer** consistently.

Create a single helper:

```ts
assertCompanyBelongsToTenant(companyId, tenantId)
```

Call it in:

* create
* update
* bulk imports
* background jobs

This is the #1 source of multi-tenant data leaks in SaaS systems. Guard it like a vault. 🔐

---

## 2. Company-scoped vs Tenant-scoped is still fuzzy

You currently mix both intentionally, but you should **document and codify the rule**.

### Example ambiguity

* `Account` is tenant-wide
* `JournalEntry` is company-scoped
* But nothing prevents:

  * Company A posting to Account intended only for Company B

### Recommendation

Add one of these patterns (choose one, not both):

#### Option A: Explicit account scope

```prisma
companyId String?
```

on `Account`, where:

* null = shared
* set = company-specific

#### Option B: Enforced shared chart of accounts

Document:

> All companies under a tenant share the same chart of accounts

This is a valid accounting model. Just **make it explicit**.

---

## 3. Missing “legal entity” fields on Company

Right now, `Company` is operational, not legal.

### What’s missing

You will need these very soon:

```prisma
legalName       String?
registrationNo  String?
taxId           String?
country         String
state           String?
addressJson     Json?
fiscalYearStart Int? // month number
baseCurrency    String
```

Without these:

* Tax reporting
* Payroll
* Multi-currency
* Invoicing compliance

will all get awkward fast.

---

## 4. Multi-currency design is incomplete

You have:

* `Currency`
* `ExchangeRate`

But:

### Gaps

* No currency on:

  * `Invoice`
  * `Bill`
  * `JournalEntry`
* No recorded FX rate at transaction time

### Recommendation

For all monetary documents:

```prisma
currency     String
fxRate       Decimal? // rate used at posting time
baseAmount   Decimal? // amount in tenant base currency
```

This avoids historical FX recalculation bugs. Those are accounting horror stories. 👻

---

## 5. Posting lifecycle needs stronger guards

You have `PostingStatus`, which is great.

### What’s missing

Nothing prevents:

* Editing lines after POSTED
* Deleting posted documents
* Posting unbalanced journal entries

### Recommendation

Application-level rules:

* POSTED = immutable
* JournalEntry must balance (debits == credits)
* Inventory transactions must reconcile quantities

Optional future hardening:

* Database triggers (later)
* Ledger snapshot tables

---

## 6. Period locking is not enforced

You have:

```prisma
AccountingPeriod { status: OPEN | CLOSED | LOCKED }
```

But nothing checks it.

### Recommendation

Before posting:

* Resolve accounting period by date
* Reject if CLOSED or LOCKED

This is non-negotiable for real accounting systems.

---

## 7. Roles are tenant-wide only

That’s fine… until it isn’t.

### Missing capability

---

## Action: companyId backfill & tenant→company integrity

What we added:

- An idempotent migration at `prisma/migrations/20251213170000_company_tenant_integrity/migration.sql` which:
  - Adds a guarded function `ensure_company_belongs_to_tenant()`.
  - Creates triggers on every table with a `companyId` column to ensure `company.tenantId == record.tenantId` on INSERT/UPDATE.
  - Adds FK constraints (created `NOT VALID` to avoid long locks during backfill) and per-table `companyId` indexes.
  - Enables RLS on tables containing `companyId` where applicable.

- A backfill script at `scripts/db/backfill-company-ids.ts` which:
  - Upserts a default company for each tenant (id `company-<tenant.id>`).
  - Batch-updates rows with `companyId IS NULL` to the tenant's default company across all key tables.

How to run (staging/workflow):

1. Apply the migration SQL in staging (use existing deployment tool or `psql`):

   psql "$DATABASE_URL" -f prisma/migrations/20251213170000_company_tenant_integrity/migration.sql

2. Run the backfill script against the staging DB (use a staging copy of prod):

   npm --prefix "Haypbooks/Backend" run db:backfill:companyIds

3. Validate FK constraints (maintenance window):

   DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT table_name FROM information_schema.columns WHERE lower(column_name) = 'companyid' AND table_schema = 'public' LOOP EXECUTE FORMAT('ALTER TABLE public.%I VALIDATE CONSTRAINT %I', r.table_name, format('fk_%s_company', r.table_name)); END LOOP; END $$;

4. Run CI DB checks and seeds in staging, and run the test suite: `npm run ci:db-ship-check` and the relevant test commands.

Notes & caveats:

- The triggers will cause INSERT/UPDATE to fail if a mismatched companyId is supplied; this is intended and prevents cross-tenant leaks.
- We kept FK constraints `NOT VALID` while backfilling to avoid long exclusive locks; validating them should be done in a maintenance window.
- After the backfill/validate, we can consider making `companyId` non-nullable on chosen tables if desired (requires careful migration and testing).

---

### Recommendation

- Run the above plan in staging first, verify RLS, run the demo seeds, smoke-test reporting and exports, and then schedule the validation step in a short maintenance window for production.



You cannot express:

* User is Admin in Company A
* Viewer in Company B

### Recommendation (future-proof)

Add optional company scoping:

```prisma
model TenantUserRole {
  tenantId
  userId
  roleId
  companyId String?
}
```

Null = tenant-wide
Set = company-specific

---

## 8. Soft deletes are inconsistent

You have:

* `deletedAt` on Tenant
* Not on Company
* Not on financial docs

### Recommendation

Pick a rule:

* Either **never delete financial data**
* Or **soft delete everything**

For accounting systems, “never delete” + reversal entries is usually the right answer.

---

## 9. Naming and consistency polish (small but important)

These won’t break logic but improve clarity:

* `JournalEntry` vs `JournalEntryLine` pluralization is inconsistent
* Some models use `issuedAt`, others `date`
* Some use `status`, others `postingStatus`

Recommendation:

* `date` = accounting date
* `issuedAt` = document issuance
* `postingStatus` only for ledger-impacting docs

Consistency pays interest over time 📈.

---

## 10. What you actually did *very* well

This deserves credit:

* Tenant-first isolation
* Company added without breaking tenant-wide features
* Optional `companyId` everywhere = graceful evolution
* No premature micro-optimizations
* Clear future hooks (outbox, idempotency, search)

This is **not a hobby schema**. This is a **platform schema**.

---

## Final assessment

You are **95% complete** from a logical modeling perspective.

What’s left is not schema volume.
It’s **rules, invariants, and intent**.

