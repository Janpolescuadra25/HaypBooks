### **Do You Need New Schema Changes for Hayp Accountant?**

**Short answer: YES — but only a few small additions.**  
Your current schema is already **very strong** for multi-tenant + team access (Tenant, TenantUser, TenantInvite, Role, Permission). You can build 90% of **Hayp Accountant** on top of what you have today.

But to make **Hayp Accountant** truly powerful (like QBOA), you need to distinguish between:
- Regular users (business owners managing their own tenant)
- Pro users (accountants managing many clients)

#### Recommended Schema Additions (Minimal & Safe)

```prisma
// New enum for user types
enum UserType {
  STANDARD     // Regular business owner/user
  ACCOUNTANT   // Pro user with Hayp Accountant access
}

// Add to existing User model
model User {
  // ... your existing fields

  userType      UserType @default(STANDARD)
  
  // For accountants only
  isCertified   Boolean?  @default(false)  // Verified accountant
  firmName      String?                   // e.g., "Smith Accounting LLC"
  certification String?                  // License number or type
  proAdvisorBadge Boolean @default(false) // Unlocked perks

  // Relations for Hayp Accountant
  managedTenants AccountantClient[]       // Tenants this accountant manages
}

// New join table: Which accountants have access to which tenants
model AccountantClient {
  id            String   @id @default(uuid())
  accountantId  String   // User.id of the accountant
  tenantId      String   // The client tenant
  accessLevel   String   @default("FULL")  // FULL, VIEW_ONLY, etc.
  invitedBy     String?  // Who invited (owner or another accountant)
  invitedAt     DateTime?
  acceptedAt    DateTime?
  status        String   @default("ACTIVE")  // ACTIVE, PENDING, REVOKED

  accountant    User     @relation(fields: [accountantId], references: [id])
  tenant        Tenant   @relation(fields: [tenantId], references: [id])

  @@unique([accountantId, tenantId])
  @@index([tenantId])
  @@index([accountantId])
}

// Optional: Track accountant-specific activity
model AccountantActivity {
  id            String   @id @default(uuid())
  accountantId  String
  tenantId      String?
  action        String   // e.g., "RECONCILED", "POSTED_PAYROLL", "SENT_MESSAGE"
  details       Json?
  createdAt     DateTime @default(now())

  accountant    User     @relation(fields: [accountantId], references: [id])

  @@index([accountantId, createdAt])
  @@index([tenantId])
}
```

#### Why These Changes?
| Feature                          | Current Schema | With New Schema |
|----------------------------------|----------------|-----------------|
| Free accountant signup           | Not distinguished | `userType: ACCOUNTANT` |
| Accountant dashboard shows clients| No direct link       | `AccountantClient` table |
| Invite accountant to tenant      | Only via TenantInvite (team) | Keep TenantInvite for team, use AccountantClient for pro access |
| Revoke accountant access         | Possible via TenantUser | Cleaner with dedicated table |
| ProAdvisor perks/directory       | No tracking          | `isCertified`, `firmName` |
| Track accountant work (for marketing)| No                   | `AccountantActivity` |

#### How It Works in Practice (Flow)
1. Accountant signs up at `/accountant` → `userType = ACCOUNTANT`
2. Business owner invites accountant → creates `AccountantClient` entry
3. Accountant logs in → sees **Hayp Accountant dashboard** with list from `AccountantClient`
4. Click client → seamless switch to their tenant (set `currentTenantId` in session)
5. All RLS still applies (tenantId filtering) — safe!

---

### Implementation notes (2025-12-15)

I implemented the recommended changes in the codebase:

- `prisma/schema.prisma` now includes `enum UserType` and the fields `userType`, `isCertified`, `firmName`, `certification`, `proAdvisorBadge` on `User`, plus `AccountantClient` and `AccountantActivity` models.
- Added an idempotent SQL migration `prisma/migrations/20251215120000_add_accountant_models/migration.sql` that creates the enum, user columns, tables, FKs, indexes, and **explicitly enables RLS and creates `rls_tenant` policies** for the new tables so CI checks pass.
- Added a unit/e2e test `Backend/test/accountant.tenant.test.ts` that verifies the `rls_tenant` policy is present for the new tables after running `scripts/db/apply-rls-phase2.js`.

Next recommended steps:

1. Run the migration in staging and confirm `npm run db:apply-phase2-safe` applies indexes and RLS as expected.
2. Run the new RLS test (`npm run test:rls-enforcement` or the single jest test) against a test DB.
3. Open a PR so CI can validate the full pipeline (lint:migrations:rls, verify:expected-schema, test:rls-enforcement, etc.).

#### You DON'T Need to Change
- Your existing `TenantUser` / `TenantInvite` → Keep for internal team members (Owner, Admin, Bookkeeper, Viewer)
- RLS policies → Still work perfectly
- Roles/Permissions → Reuse for both regular and accountant access

**Bottom line**: Add ~3 small models → unlock a full **Hayp Accountant** portal that can compete with QBOA.

