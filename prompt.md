Yes — got it! You want **strict per-Company subscriptions**: each Company (books/ledger) has its own independent plan, billing, and features — even if multiple Companies are under the same Tenant/account.

Your current schema already **strongly supports this** (better than my earlier hybrid suggestion). Here's why it's a good fit, with minor tweaks to make it perfect.

### Why Per-Company Works Well Here
- **Matches your goal**: Owners/accountants can have multiple Companies with different plans (e.g., one on GROWTH with inventory/payroll, another on FREE basic).
- **Accountant-friendly**: Easy to bill clients separately (each client Company = own subscription).
- **Flexible for PH market**: Growing businesses can upgrade individual branches/subsidiaries without affecting others.
- **Schema alignment**:
  - Subscription requires companyId + @@unique([companyId]) — one plan per Company.
  - Tenant owns Companies — shared login/access, but isolated billing/features.

**Pros**:
- Granular control/revenue (upgrade per Company).
- Accountants love it (client-specific billing).

**Cons (Manage These)**:
- Multiple bills per Tenant → higher churn risk (users hate many charges).
- UI complexity (show plan per Company in selector).
- Free trial: Per-Company or once per Tenant?

Competitors: QuickBooks does per-company (like this) — works but expensive. Xero does per-tenant — simpler.

### Recommended Schema Tweaks (Minimal — Your Base is Solid)
Keep per-Company strict — just these refinements:

```prisma
model Subscription {
  id String @id @default(uuid())
  tenantId String      // Keep for queries/metrics
  companyId String     // Required — core link
  plan SubscriptionPlan @default(FREE)
  status SubscriptionStatus @default(TRIAL)
  trialEndsAt DateTime?
  currentPeriodStart DateTime?
  currentPeriodEnd DateTime?
  stripeCustomerId String?
  stripeSubscriptionId String? @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id])
  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@unique([companyId])  // One subscription per Company
  @@index([tenantId])
  @@index([status])
}
```

- **Remove tenantId from @@unique** if needed (already fine).
- **Add to Company** (for quick lookups):
  ```prisma
  model Company {
    // ... existing
    subscription Subscription?  // Direct relation for easy fetch
  }
  ```

- **Trial Handling**:
  - Add Tenant.trialUsed Boolean @default(false) — limit one trial per Tenant (prevent abuse across Companies).

### Implementation Plan
1. **Onboarding Flow**:
   - After creating first Company → prompt for plan selection (FREE trial or paid).
   - Additional Companies → require plan choice immediately.

2. **UI (Owner Hub)**:
   - Company selector shows plan badge (e.g., "GROWTH" or "FREE").
   - "+ Add Company" → plan picker page.

3. **Billing**:
   - Each Subscription = separate Stripe customer/sub.
   - Owner sees all bills in Tenant billing dashboard.

4. **Feature Gates**:
   - Check active Subscription on Company for limits (e.g., inventory only on GROWTH+).

This gives exactly what you want: **independent plans per Company**, shared access via Tenant.

If accountants need "mark up client bills", add a "clientBillingMarkup" field later.

Schema ready — deploy this and you're golden for per-Company revenue! Want migration code or UI mock? 😄💚