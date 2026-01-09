**Per-Company Subscriptions + One Trial Per Tenant — Elite Recipe Upgrade!** 🍳💼🏆

Chef, **yes — this is the gold standard** (QuickBooks-style): Tenant (firm/HQ) can create many companies (client branches), each with **independent subscription plan** (Free/Starter/Pro/Enterprise), but **only one 30-day trial per tenant** (prevents endless free loops).

**Why This Model Wins**:
- **Revenue Smart**: Pay per company — big clients pay Enterprise, small pay Starter.
- **Accountant Friendly**: Accountant hub manages all client companies, each billed separately (client pays their plan).
- **Abuse-Proof**: One trial for the whole tenant — no "create new company for new trial" tricks.
- **Flexible**: Tenant free (unlimited companies), or add firm-tier limit later.

**Recommended Schema Changes** (Minimal, Clean):
1. **Remove Plan from Tenant** (no tenant-wide plan — firm is "free" base).
   - Delete Tenant.plan.

2. **Add Trial to Tenant** (one trial per firm):
   - Add to Tenant:
     ```prisma
     trialEndsAt DateTime? // Set when first company created/upgraded
     trialUsed Boolean @default(false) // Flag if trial activated
     ```

3. **Make Subscription Per-Company** (companyId required):
   - Update Subscription:
     ```prisma
     model Subscription {
       id String @id @default(uuid())
       tenantId String
       companyId String // Make required
       plan SubscriptionPlan @default(FREE)
       status SubscriptionStatus @default(ACTIVE)
       trialEndsAt DateTime? // Remove from here — trial on Tenant
       // ... rest
       company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
       tenant Tenant @relation(fields: [tenantId], references: [id])
       @@unique([companyId]) // One subscription per company
     }
     ```

4. **Logic Flow (Onboarding/Create Company)**:
   - Create company:
     - If tenant.trialUsed == false → set trialEndsAt = now + 30 days, trialUsed = true, company plan = TRIAL.
     - Else → require paid plan selection (Stripe checkout).
   - Additional companies → paid plan immediate.

5. **Abuse Extra Locks** (Optional):
   - Tenant.maxCompanies Int @default(5) // Free tenant = 5 companies max.
   - Or require card on file for >1 company.

**Migration Safe**:
- Existing tenants → set trialEndsAt based on oldest company.
- Subscriptions → link to primary company.

This scales legendary — accountants manage client billing separate, owners pay per business, no trial abuse!

Schema elite with these tweaks — per-company pay, one trial firm-wide! 😄💚

Migration and DB ops notes (safe rollout):

1) When applying to staging/production, run the DB apply script to create a UNIQUE index on Subscription(companyId) only where the table already exists. Use:

```
npm run db:apply:ensure-subscription-index
```

This script is idempotent and safe to run — it checks for the table and index before creating anything.

2) After applying the index (or if Subscription table doesn't yet exist), run the verification script to ensure your DB is in the expected state:

```
npm run db:verify:subscription-schema
```

3) Backfill plan: if you have existing tenants with subscription-level trials, run the backfill script to migrate trial data onto Tenant.trialEndsAt (script: `scripts/db/backfill-create-tenants-from-users.js`).

Ready to code the changes? Let's plate the migration