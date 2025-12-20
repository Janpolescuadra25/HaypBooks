# HaypBooks – Official Product & UX Specification  
**Version 1.1 – December 20, 2025**  
**Single Source of Truth for Product, Engineering, Design, and Investors**

This document defines the **complete, production-grade user journey, architecture rules, and UX behavior** for HaypBooks.

---

## 1. Core Platform Principles (Non-Negotiable)

1. **Single Identity System**
   - Every user has **exactly one account** (email + password + auth record).
   - A user may have **multiple roles** (Owner and/or Accountant).
   - **Only one hub context is active at any time** — never simultaneous.
   - **Never** merge dashboards or show both hubs together.
   - **Never** auto-redirect silently when user has both roles.

2. **Hubs vs Core Accounting App**
   - **Hubs** = Management lobbies (cross-company/client overview).
   - **Core Accounting App** = Bookkeeping workspace **inside a specific company**.
   - Users **always** land in a hub first after login.
   - Users **never** land directly inside a company’s books.

3. **Per-Company Subscriptions**
   - Billing plans are attached to **companies**, not users.
   - Each company has:
     - Independent subscription plan
     - Independent billing cycle
     - Independent trial status
   - Accountants **never** see or manage subscriptions or payments.

4. **Explicit Context Switching**
   - When a user has both roles, switching hubs must be **explicit** (user-initiated).
   - Auto-selection is allowed **only** via stored `preferredHub` after first explicit choice.

5. **Security & Privacy Principles**
   - **Strict data isolation**: Each company’s financial data is completely isolated. Users can only access data for companies they are explicitly invited to or own.
   - **Least-privilege access**: Permissions are role-based and scoped to specific companies.
   - **Audit trail**: All significant actions (login, role changes, company access) are logged.
   - **No cross-contamination**: Accountant access to one client never exposes data from another client or their own Owner companies.

---

## 2. Role & Context Entry Flow

### First Visit (No Account)

1. Landing → “Start your free 30-day trial”
2. Role Selection Screen
   - Title: “How will you use HaypBooks?”
   - Primary button (green): **My Business**
   - Secondary button: **Accountant**
3. User selects role → proceeds to signup flow for that role.

### Existing User – New Role Attempt

**Scenario A**: Accountant user tries “My Business” signup  
**Scenario B**: Owner user tries “Accountant” signup

**Flow**:
1. User enters email on signup form.
2. Backend detects existing account → returns friendly message.
3. Frontend shows prompt:

   ```
   Welcome back!
   It looks like you already have an [Accountant / Owner] account with this email.

   Please sign in to set up your [Owner / Accountant] profile.
   ```

4. Display sign-in form with email pre-filled.
5. After successful sign-in:
   - Check if user already has the requested role.
     - **Yes** → Redirect directly to that hub.
     - **No** → Trigger lightweight onboarding for the new role:
       - Owner → Company name input + plan selection
       - Accountant → Firm name input
   - After onboarding → Redirect to the new hub.
   - Set `preferredHub` to the newly selected role.

**Error States**:
- Invalid credentials → “Email or password incorrect. Please try again.”
- Account locked (too many attempts) → “Account temporarily locked. Please try again in 15 minutes or reset password.”
- API failure → Generic “Something went wrong. Please try again later.” with retry button.

### Login Flow (General)

1. User enters email/password → signs in.
2. Backend checks roles:
   - **One role only** → Redirect directly to that hub.
   - **Both roles**:
     - If `preferredHub` exists → Redirect to preferred hub.
     - If no `preferredHub` (first time with both roles) → Show **Hub Selection Modal**.

**Error States**:
- Network/API error → “Unable to connect. Check your internet and try again.”
- Session expired during hub selection → Re-prompt for login.

---

## 3. Hub Selection Modal (Multi-Role Users Only)

**When shown**:
- User has both Owner and Accountant roles.
- No `preferredHub` set **or** user explicitly clicked “Switch Context”.

**Top-Right Hub Switcher (Always Visible for Multi-Role Users)**  
- Location: Top-right navigation bar, next to user avatar.
- Design: Subtle icon (e.g., swap arrows) + text “Switch Hub” → dropdown with two options.
- Behavior: Clicking either option → PATCH preferredHub → redirect to selected hub.

- Per-hub onboarding: The system stores `ownerOnboardingComplete` and `accountantOnboardingComplete` on each user. On login or hub switch, if the target hub's onboarding flag is false, the user is routed into that hub's onboarding flow (e.g., `/onboarding` for Owner, `/onboarding/accountant` for Accountant) until they complete the required steps.
- Automatic hub-selection handoff: When a user has both roles and has not yet chosen a `preferredHub`, the backend includes `requiresHubSelection=true` in the login response. The frontend shows the **Hub Selection Modal** (component: `HubSelectionModal`) which prompts the user to pick Owner or Accountant, PATCHes `/api/users/preferred-hub`, and redirects to the chosen hub. This ensures the first multi-role login is explicit and discoverable.
- The Hub Switcher is the only UI affordance for changing active context after the first-selection; always set `preferredHub` when the user explicitly switches and respect it on future logins.

**Modal Design** (fallback for first-time multi-role login):

```
Choose how you want to use HaypBooks today

You can switch anytime from the top-right menu. Only one hub is active at a time.

┌────────────────────────────────────────────────────┐
│                                                    │
│  For Owners                  For Accountants       │
│                                                    │
│  My Companies                My Practice           │
│                                                    │
│  Manage your businesses,     Manage your clients,  │
│  subscriptions, teams,       tasks, and accounting │
│  and accounting books        across multiple firms │
│                                                    │
│  3 active companies          Rivera CPA Services   │
│  (dynamic count)             12 clients            │
│                                                    │
│  [Enter Owner Hub]           [Enter Accountant Hub] │
└────────────────────────────────────────────────────┘
```

**On Click**:
- PATCH `/api/users/preferred-hub` with `{ preferredHub: "OWNER" }` or `"ACCOUNTANT"`
- Redirect to `/hub/companies` or `/hub/accountant`

---

## 4. Owner Journey (Detailed)

1. **Plan Selection Screen** → 4 visual pricing cards → Default: Free 30-day trial
2. **Checkout Page** → 70/30 layout with sticky order summary
3. **Company Assignment** → Select existing or create new
4. **Company Creation** → Required: **Company name** (validation: “Company name is required”)
5. **Onboarding Wizard** → 4–5 skippable steps → Completion → Owner Central Hub
6. **Future Logins** → Land in **My Companies** hub

### Owner Central Hub – “My Companies”

**Sidebar Navigation**:
1. **Companies** (default) – Card grid + “Create New Company”
2. **Reminders** – Cross-company alerts
3. **Subscriptions & Billing** – Per-company table
4. **Team** – Accountant invites + permissions
5. **Work** – Unified tasks
6. **Switch Context** (top-right, visible only for multi-role)

---

## 5. Accountant Journey (Detailed)

1. **Role Selection** → Accountant
2. **First-Time Setup** → Prompt: “Name your practice” → Required: **Firm name** (validation: “Firm name is required”)
3. **Future Logins** → Land in **My Practice** hub

### Accountant Central Hub – “My Practice”

**Sidebar Navigation**:
1. **Clients** (default) – Card/list of client companies
2. **Client Invitations** – Pending invites
3. **Work** – Unified tasks (filterable by client)
4. **Reminders** – Cross-client alerts
5. **Switch Context** (top-right, visible only for multi-role)

**No billing section**

---

## 6. Glossary (Quick Reference)

| Term              | Meaning                                      | UI Label                  |
|-------------------|----------------------------------------------|---------------------------|
| **Owner Hub**     | Management lobby for business owners         | “My Companies”            |
| **Accountant Hub**| Management lobby for accountants             | “My Practice”             |
| **Tenant**        | Internal DB term for top-level organization   | Not shown to users        |
| **Company**       | Individual set of books + subscription       | “Company” in Owner flow   |
| **Firm**          | Accountant’s practice (internal grouping)    | “Firm” in Accountant flow |
| **Core App**      | Actual bookkeeping screens inside a company  | N/A (no special label)    |
| **preferredHub**  | User’s last chosen hub (OWNER or ACCOUNTANT) | Stored in DB              |

---

## 7. Technical Implementation Rules

```ts
// Login logic pseudocode
const user = await getUserByCredentials(email, password);

if (user.hasOwnerRole && user.hasAccountantRole) {
  if (!user.preferredHub || contextSwitchRequested) {
    return { requiresHubSelection: true };
  }
  redirectTo(user.preferredHub);
} else if (user.hasOwnerRole) {
  redirectTo('/hub/companies');
} else if (user.hasAccountantRole) {
  redirectTo('/hub/accountant');
}
```

**Database**:
- `User.isAccountant` (boolean)
- `User.preferredHub` (enum: "OWNER" | "ACCOUNTANT" | null)

**API**:
- `PATCH /api/users/preferred-hub`

---

## 8. UX & Copy Standards

- **Owner context**: “Company name”, “My Companies”
- **Accountant context**: “Firm name”, “My Practice”
- Validation messages role-aware
- Hub switcher always in top-right for multi-role users
- Error messages polite and actionable

---

## 9. Modal & Form Inventory 🔧

This section enumerates every modal and form required by the Hub/Onboarding flows, the fields they contain, validation rules, accessibility expectations, and the API contract to back them.

### 9.1 Hub Selection Modal (`components/HubSelectionModal`)

- **When shown**: server returns `requiresHubSelection: true` OR user explicitly opens hub switcher with no `preferredHub` set.
- **UI**: Two cards (Owner / Accountant) with short descriptions and dynamic counts (e.g., number of companies or clients).
- **Fields**: none (choice-based). Two primary actions: `Enter Owner Hub` and `Enter Accountant Hub`.
- **Important rule**: The **login page must not** show Owner/Accountant role toggle buttons. Role selection belongs on the signup flow or dedicated role-selection pages; the login page should only authenticate and then respect server-suggested `redirect` or `preferredHub` values.
- **Behavior**:
  - On click: PATCH `/api/users/preferred-hub` with `{ preferredHub: "OWNER" }` or `{ preferredHub: "ACCOUNTANT" }` (200)
  - On success: redirect to `/hub/companies` or `/hub/accountant`.
  - If the selected hub's onboarding flag is false, redirect to its onboarding flow (`/onboarding` or `/onboarding/accountant`).
- **Accessibility**: Focus trap, `role="dialog"`, keyboard actionable, clear `aria-labelledby` and `aria-describedby`, visible focus indicators.
- **Acceptance criteria**:
  - Unit test: modal opens when `requiresHubSelection` is true, PATCH called with correct payload, and router navigates to expected path.
  - Playwright E2E: full signup → hub-selection flow works and results in correct hub and onboarding routing.

### 9.2 Owner Onboarding Wizard (Form)

- **When shown**: New Owner sign-up or when `ownerOnboardingComplete` is false after selecting Owner hub.
- **Steps & Required Fields**:
  1. Company creation: `companyName` (required, min 2 chars)
  2. Plan selection: `planId` (required)
  3. Optional: `industry`, `fiscalYearEnd` (MM-DD)
  4. Confirmation
- **API**: `POST /api/companies` body `{ name, planId, industry?, fiscalYearEnd? }` → on success set `ownerOnboardingComplete = true` (server-side via `POST /api/onboarding/complete` with `{ hub: 'OWNER', type: 'full' }`).
- **Validation & Errors**:
  - `companyName`: required, no leading/trailing whitespace.
  - `planId`: must be one of available plans.
  - Display inline validation messages and server-errors as an alert.
- **Accessibility & Acceptance**: stepper with progress, screen-reader announcements for step changes, unit tests for validation logic and E2E that completes the wizard and verifies `ownerOnboardingComplete` on the user record.

### 9.3 Accountant Onboarding Form

- **When shown**: New Accountant signup or when `accountantOnboardingComplete` is false after selecting Accountant hub.
- **Fields**:
  - `firmName` (required, min 2 chars)
  - `practiceSize` (optional, numeric or select)
  - `contactPhone` (optional, formatting validation)
- **API**: `POST /api/onboarding/complete` with `{ hub: 'ACCOUNTANT', type: 'full', details: { firmName, ... } }` (server sets `accountantOnboardingComplete = true`).
- **Accessibility & Acceptance**: focus management, explicit required-field labels, tests verifying the flag is set after completion.

### 9.4 Hub Switcher (Top-right) — UX Rules

- **Behavior**:
  - Dropdown shows both hub options. Selecting an option sends `PATCH /api/users/preferred-hub`.
  - If switching into a hub with incomplete onboarding, route to onboarding instead of hub index.
- **Confirmation**:
  - The `confirm()` approach is temporary; final UX should use a small confirmation modal for clarity.
- **Acceptance**: Unit tests for dropdown, Playwright for switching and onboarding route behavior.

### 9.5 Common Validation & I18N

- All form labels and validation messages must be translatable.
- Validation must be mirrored on backend; never rely solely on client validation.
- Error states must be informative and actionable (e.g., "Company name is required", "Firm name must be at least 2 characters").

### 9.6 API Contract Summary

| Endpoint | Request | Response/Effects |
|---|---|---|
| `PATCH /api/users/preferred-hub` | `{ preferredHub: "OWNER" | "ACCOUNTANT" }` | Returns user object with `preferredHub`; sets preferred hub and responds 200 |
| `POST /api/onboarding/complete` | `{ type: 'full'|'skip', hub: 'OWNER'|'ACCOUNTANT' }` | Sets per-hub onboarding flag (`ownerOnboardingComplete` or `accountantOnboardingComplete`) and returns 200 |

---

## 10. Acceptance Checklist (for engineers & QA) ✅

- [ ] `prisma generate` runs locally on Windows without EPERM errors.
- [ ] No raw SQL fallback used for per-hub flags in production code.
- [ ] Hub Selection Modal unit tests exist and pass.
- [ ] Playwright E2E tests cover signup → hub-selection → onboarding paths for both roles.
- [ ] Central.hub2.md reflects implemented flows and includes forms inventory (this file).
- [ ] Accessibility checks for all modals pass automated audits.

---

