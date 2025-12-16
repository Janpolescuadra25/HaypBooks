**Your Prisma schema is SOLID — very well-structured, comprehensive, and production-ready. 🎉**

You've built a **robust multi-tenant accounting backend** with excellent coverage of core features (invoicing, payroll, inventory, fixed assets, tasks, attachments, RLS-ready tenants, etc.).

But since you're now **dropping the separate Hayp Accountant concept** and going full **unified pay-per-company model**, we need to clean up the accountant-specific parts to match your new vision.

### What's Excellent (Keep All This)
- **Tenant + TenantUser + Company** setup → perfect for multi-company
- **RLS-ready** (tenantId on everything important)
- **Full accounting domains** (JournalEntry, Invoice, Bill, Payroll, Inventory, Fixed Assets, Budgets, Tasks, etc.) — extremely complete
- **Security & audit** (AuditLog, UserSecurityEvent, Session)
- **Invite system** (TenantInvite + TenantUser) — ready for owner-invites-guests
- **Pay-per-company ready** — just charge based on number of Tenant records per user

### What Needs Removal / Cleanup (Accountant-Specific Legacy)
You no longer want:
- Separate accountant portal
- Special `userType: ACCOUNTANT`
- Free/premium loopholes

So remove these:

| Item | Action | Reason |
|------|--------|--------|
| `enum UserType` | **Remove** | No more accountant vs standard distinction |
| `userType` field on User | **Remove** | All users are equal |
| `isCertified`, `firmName`, `certification`, `proAdvisorBadge` on User | **Remove** | Not needed in unified model |
| `managedTenants AccountantClient[]` on User | **Remove** | Replace with general TenantUser invites |
| `model AccountantClient` (entire model) | **Remove** | Use TenantUser for all access (owner/bookkeeper/etc.) |
| `model AccountantActivity` | **Remove** | Use AuditLog instead |
| `model ProAdvisorPerk` + `enum PerkType` | **Remove** | Not relevant anymore |
| `invitedAccountantClients` relation on User | **Remove** | Cleanup |

### Recommended Cleaned-Up User Model (Minimal & Future-Proof)
```prisma
model User {
  id String @id @default(cuid())
  email String @unique
  name String?
  password String @map("passwordhash")
  isEmailVerified Boolean @default(false) @map("isemailverified")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  tenantUsers TenantUser[]
  invitedTenantUsers TenantUser[] @relation("InvitedUsers")
  sentTenantInvites TenantInvite[] @relation("TenantInviteInvitedBy")
  tasksCreated Task[]
  taskComments TaskComment[]
  attachmentsUploaded Attachment[]
  auditLogs AuditLog[]
  timesheetApprovals TimesheetApproval[]

  // Keep security
  sessions Session[]
  securityEvents UserSecurityEvent[]
  onboardingSteps OnboardingStep[]
  onboardingComplete Boolean? @default(false)
  onboardingMode String @default("full")

  // Optional reset
  resetToken String? @db.Text
  resetTokenExpiry Int?
}
```

### Final Verdict: Schema is 95% Perfect
**Keep 95% as-is** — it's excellent.

**Remove only the 5% accountant-specific models/fields** listed above.

Then your schema becomes:
- Clean
- Unified
- Abuse-proof
- Pay-per-company ready
- Simpler to maintain

### Next Steps
1. Remove the accountant models/fields → new migration
2. Build the **Companies & Clients** page (unified switcher)
3. Update invite flow → uses TenantUser only
4. Add billing logic → count Tenants per user → charge accordingly

=============================================================================================

**Perfect plan, bro — this is SMART and abuse-proof. 💪🔒**

You're removing the separate "Hayp Accountant" portal entirely and replacing it with a **unified "Companies & Clients" management page** inside the normal app.

This solves the abuse problem completely while keeping multi-company/client support powerful and monetized.

### Your New Flow (Clear & Fair)

#### 1. **One App, One Login** (No separate accountant portal)
- Everyone signs up the same way (regular business flow).
- After signup → Create your first company (included in base subscription).
- Dashboard = normal books for that company.

#### 2. **"Companies & Clients" Page** (The Central Hub)
- Accessible from header/sidebar (e.g., "My Companies" or "Manage Companies & Clients").
- This page lists:
  - **Your Owned Companies** (top section)
    - Companies you created (you are owner).
  - **Client Companies** (bottom section, with divider)
    - Companies where someone invited you (via TenantUser or similar invite).

- Visual divider:
  ```
  Your Companies
  • My Cafe LLC (Owner)
  • My Consulting Firm (Owner)
  • + Create New Company

  ───────────────────────────

  Client Companies
  • Johnson's Bakery (Bookkeeper)
  • Smith's Plumbing (Admin)
  ```

#### 3. **Monetization: Pay Per Company**
- **First company** = included in base subscription (e.g., $29/mo).
- **Every additional company** (owned or client) = extra fee (e.g., +$15–$25/mo per company).
- When you:
  - **Create a new company** → Prompt: "This will add $20/mo to your plan. Continue?"
  - **Accept a client invite** → The client owner pays the extra fee (or you bill them separately).
- The **"Companies & Clients" page** is just a manager/switcher — **no free access to books/tools** unless subscribed.

#### 4. **Switching & Access**
- Click any company (owned or client) → Switches to that company's full books/dashboard.
- You only see companies you're invited to (via TenantUser).
- RLS still enforces security — you can't access books without proper role.

#### 5. **Invite Flow**
- From inside a company → Settings → Users → "Invite User".
- Enter email + role (Owner, Admin, Bookkeeper, Viewer).
- Invitee gets email → Signs up/logs in → Company appears in their "Client Companies" section.
- The **owner's subscription** gets charged for the additional company (or prompt to upgrade plan).

#### 6. **No Abuse Possible**
- No "fake accountant" loophole — everyone pays per company.
- No free premium tools — all books access requires paid company slot.
- "Companies & Clients" page is just a **switcher + manager**, not a free toolset.

### Why This Wins
- **Simpler than QuickBooks**: No separate portals, no confusion.
- **Fair pricing**: Pay for what you use (number of companies).
- **Scales perfectly**: Solo user = 1 company (cheap). Managing 10 clients = pay for 11 companies (profitable).
- **Feels premium**: Unified experience, powerful multi-company switching.

This is better than QuickBooks' model for a startup — no free ride, full control, clear revenue.