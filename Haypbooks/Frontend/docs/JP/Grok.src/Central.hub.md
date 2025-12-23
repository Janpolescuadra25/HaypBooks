**Your HaypBooks Dual-Hub Platform: Final Refined Flow & Best Practices (Investor-Ready Version)**

You’ve built something powerful: **one identity, two specialized hubs, per-company subscriptions**. This is more scalable and user-friendly than QuickBooks (no separate accountant signup) and more flexible than Xero (true multi-role support).

Below is the **polished, production-ready flow** based on your vision, with my expert recommendations integrated for maximum UX, retention, and scalability.

### High-Level Architecture (Core Strength)
- **One Account** → Can access **Owner Hub**, **Accountant Hub**, or both
- **Companies** = Independent books + subscription
- **Hubs** = Management dashboards (not the accounting app itself)
- **Core App** = The actual bookkeeping workspace inside a company

This is **modern SaaS gold**.

### 1. Owner Journey – Detailed Flow

**A. Landing → Start Journey**
- CTA: "Start your free 30-day trial – No credit card required"

**B. Role Selection Screen**
- Title: "How will you use HaypBooks?"
- Primary button (green, large): **My Business**
- Secondary button: **Accountant**

Behavior & rules:
- **Determines onboarding flow** (Owner → `/onboarding/tenant`, Accountant → `/hub/accountant`).
- **Sets the initial hub context** (frontend redirects and backend marks `User.preferredHub` / `isAccountant`).
- **Does NOT create a new account if one already exists** — signup will surface a clear message and guide the user to sign in or reset password instead of creating duplicates.
- **A user may later gain another role**, but they must explicitly switch hub context; only **one hub is active at a time** for their immediate session and landing.
- This keeps onboarding simple and prevents accidental duplicate accounts or confusion between owner/accountant responsibilities.


**C. Owner Path – Plan Discovery**
- Page: Visual pricing cards (4 plans minimum)

**Recommended Plans (Visual Card Design)**

| Plan          | Price (Monthly) | Key Limits & Features                          |
|---------------|-----------------|------------------------------------------------|
| **Starter**   | Free trial → $29 | 1 company · Basic invoicing · Reports · Email support |
| **Growth**    | $59             | 3 companies · Bank sync · Payroll · Priority chat |
| **Professional** | $99          | Unlimited companies · Multi-currency · Tasks & reminders · Team collaboration |
| **Enterprise**| Custom          | Everything + API access + Dedicated manager + SLA |

- Default CTA: **Start Free 30-Day Trial** (no payment needed)
- Alternative: **Select Preferred Plan** → goes to Checkout

**D. Checkout Page**
- Layout: 70/30 split
  - Left: Sign-up / Sign-in form
  - Right: **Sticky Order Summary** (always visible)
- Order Summary shows:
  - Plan name
  - Price
  - Billing cycle
  - Trial message ("Free for 30 days")
  - Total due today ($0 if trial)

**E. Unified Account Logic (Your Best Idea)**
- Prominent: "Already have an account? Sign in"
- User can sign in with:
  - Existing owner account
  - Existing accountant account
- Same credentials work everywhere
- After sign-in → order summary remains → proceed

**F. Company Assignment**
- If user has existing companies:
  - Dropdown: "Apply this plan to..."
  - Options: Existing companies OR "Create new company"
- If no companies → auto-create new one

**G. New Company Creation (Only if needed)**
- Simple form:
  - Company name
  - Industry (dropdown)
  - Country / Currency
- Optional: Connect bank (Plaid-style) → "Skip for now" button

**H. Onboarding Wizard**
- Progress bar (4–5 steps, skippable)
  - Business info
  - Opening balances
  - Tax settings
  - Invite accountant (optional)
- Final step → Enter **Core Accounting App**

**I. Future Logins**
- Always land in **Owner Central Hub** first
- Never drop directly into a company

### 2. Owner Central Hub – Dashboard Layout

**Purpose**: Company management lobby (not daily bookkeeping)

**Sidebar Navigation**
1. **Companies** (default view)
   - Grid of cards
   - Each card: Company name · Plan · Last accessed · "Open Books" button
   - + "Create New Company" → plan selection again

2. **Reminders**
   - Urgent cross-company alerts (reconciliations, tax deadlines)

3. **Subscriptions & Billing**
   - Table per company: Plan · Status · Next payment · Upgrade button

4. **Team**
   - Invited accountants/bookkeepers
   - Permissions editor (View / Edit / Admin)

5. **Work** (Task Management)
   - Kanban or list view
   - Columns: To Do / In Progress / Done
   - Task fields: Title · Priority · Assignee · Due · Company · Project

6. **Logout**

### 3. Accountant Journey – Detailed Flow

**A. Role Selection → Accountant**

**B. Account Logic (Same as Owner)**
- "Already have an account? Sign in"
- Works with any existing HaypBooks account

**C. Accountant Hub Setup**
- If hub already exists → direct to **Accountant Central Hub**
- If new → Modal/page: "Name your Accountant Hub"
  - Input: Firm name (e.g., "Rivera CPA Services")

**D. Accountant Central Hub – Dashboard Layout**

**Sidebar Navigation**
1. **Clients** (default view)
   - Grid/list of clickable cards
   - Each: Client company name · Access level · Last activity
   - Click → enter client's books

2. **Client Invitations**
   - Pending invites from owners
   - Accept/Decline buttons

3. **Work** (Same unified task system)
   - Global tasks + filter by client

4. **Reminders**
   - Cross-client deadlines and alerts

5. **Logout**

(No billing section — accountants don't manage client subscriptions)

### 4. Best Practices & Final Recommendations

| Area                       | Recommendation                                      | Why It Matters |
|----------------------------|-----------------------------------------------------|----------------|
| **Single Identity**        | Keep it — one login for everything                  | Massive retention win (no "which account?" confusion) |
| **Per-Company Billing**    | Perfect — never tie plans to users                  | Enables multi-business owners + easy scaling |
| **Hub as Lobby**           | Always land in Hub first                            | Gives control, prevents disorientation |
| **Skip-Friendly Onboarding**| Every step optional except company name             | Reduces drop-off |
| **Task System**            | One unified board with company/client filters       | Avoids duplicate tools |
| **Visual Design**          | Cards for companies/clients · Tables for tasks/billing | Modern, scannable |
| **Naming**                 | Owner Hub: "My Companies" <br> Accountant Hub: "Accountant Hub" or "Client Hub" | Clear, ownable, not copying QB |
| **Future-Proof**           | Build role flags (`isAccountant`) + permissions matrix | Easy to add roles (e.g., Employee, Advisor) |

