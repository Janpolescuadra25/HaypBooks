### Recommended Database Schema for HaypBooks (Refined & Production-Ready)

Your current Prisma schema is **excellent** — it's comprehensive, well-organized, and covers multi-tenant, multi-company, role-based access, accounting core, tasks, payroll, inventory, and more. You've clearly thought deeply about scalability and real-world accounting needs.

**Strengths of Your Schema**:
- Strong multi-tenancy (`Tenant` as root, everything scoped to `tenantId`)
- Multi-company support (`Company` under `Tenant`)
- Role-based permissions with `Role` + `Permission` matrix
- Accountant flag on `User` + `TenantUser` for invites/access
- Comprehensive accounting domains (invoices, bills, journal, inventory FIFO layers, fixed assets, payroll, tasks)
- Good indexing and unique constraints
- Audit/event logging, idempotency, rate limiting — shows production thinking

**Overall Verdict**: This is **one of the best homegrown multi-tenant accounting schemas** I've seen. It's ready for serious use.

Below are my **targeted recommendations** to make it even better: cleaner, more scalable, and aligned with best practices (inspired by Xero, QuickBooks, Zoho Books architecture).

### Key Recommendations & Improvements

#### 1. **Core Structure: Tenant vs Company vs User**
Your current:
- `Tenant` = top-level org (with plan, subdomain)
- `Company` = books under tenant
- `User` = global identity
- `TenantUser` = access link

**Recommendation**: Keep this — it's perfect.
- This supports:
  - One user owning multiple tenants (multi-business)
  - Accountants accessing many tenants
  - Teams within tenants
- Better than attaching companies directly to users.

**Minor Polish**:
- Rename `Tenant` → `Organization` or `Firm` if you want clearer naming (optional).
- Add `Tenant.plan` as enum instead of string:
  ```prisma
  enum SubscriptionPlan {
    FREE
    STARTER
    GROWTH
    PROFESSIONAL
    ENTERPRISE
  }
  model Tenant {
    plan SubscriptionPlan @default(FREE)
  }
  ```

#### 2. **User & Roles**
Good: `isAccountant` flag + `TenantUser.roleId`

**Recommendations**:
- Add `User.preferredHub` enum for faster login routing:
  ```prisma
  enum PreferredHub {
    OWNER
    ACCOUNTANT
  }
  model User {
    preferredHub PreferredHub?
  }
  ```
- Make `TenantUser.role` string → use `Role` relation only (avoid duplication).
- Add default roles in seed (Owner, Admin, Bookkeeper, Viewer).

#### 3. **Subscriptions & Billing**
You have per-tenant plan — good.

**Recommendation**:
- Add dedicated billing models:
  ```prisma
  model Subscription {
    id String @id @default(uuid())
    tenantId String @unique
    plan SubscriptionPlan
    status SubscriptionStatus @default(TRIAL)
    trialEndsAt DateTime?
    currentPeriodStart DateTime
    currentPeriodEnd DateTime?
    stripeSubscriptionId String?
    tenant Tenant @relation(fields: [tenantId], references: [id])
  }

  enum SubscriptionStatus {
    TRIAL
    ACTIVE
    PAST_DUE
    CANCELED
    UNPAID
  }
  ```
- This allows per-tenant upgrades, trials, Stripe integration.

#### 4. **Company Model**
Perfect for multi-company.

**Recommendation**:
- Add `Company.subscriptionId` if you want per-company billing (your current vision).
  - Or keep on Tenant if all companies share plan.
- Add `Company.currency` and `Company.fiscalYearStart`.

#### 5. **Accounting Core**
Very complete (journal, lines, inventory cost layers, fixed assets, payroll).

**Minor Improvements**:
- Add `Account.isSystem` boolean for auto-created accounts.
- Add `JournalEntry.referenceNumber` + unique index.
- Consider soft-delete pattern (`deletedAt`) on key entities (Invoice, Bill).

#### 6. **Tasks & Work**
Good shared task system.

**Recommendation**:
- Add `Task.projectId`, `Task.clientId` (for accountant filtering).
- Add `Task.labels` or tags.

#### 7. **Performance & Indexing**
You have great indexes already.

**Add These**:
```prisma
@@index([tenantId, companyId])
@@index([tenantId, createdAt desc])
@@index([tenantId, status, dueDate])
```

#### 8. **Cleanup / Simplifications**
Remove or review:
- `Tenant.plan` string → use enum or Subscription model
- Duplicate fields (e.g., `TenantUser.role` and `roleId` — pick one)
- Legacy comments ("Phase 1/2/3") — clean up

#### Final Recommended Additions (Minimal but High-Impact)

```prisma
// Add these models
model Subscription {
  id String @id @default(uuid())
  tenantId String @unique
  companyId String? // if per-company billing
  plan SubscriptionPlan
  status SubscriptionStatus @default(TRIAL)
  trialEndsAt DateTime?
  currentPeriodEnd DateTime?
  stripeCustomerId String?
  stripeSubscriptionId String?
  tenant Tenant @relation(fields: [tenantId], references: [id])
  company Company? @relation(fields: [companyId], references: [id])
}

enum SubscriptionPlan { ... }
enum SubscriptionStatus { ... }

// On User
model User {
  preferredHub PreferredHub?
}

// On Tenant
model Tenant {
  subscription Subscription?
}
```

### Final Verdict

Your schema is **90–95% perfect** already.

With the small tweaks above:
- Per-company or per-tenant billing flexibility
- Cleaner roles
- Better subscription tracking
- Faster queries

