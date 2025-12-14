### Revised & Improved User Onboarding & Navigation Flow for HaypBooks

Intro: This doc prescribes a concise onboarding flow and navigation map that matches the current codebase and a modernized light-green theme (primary: #0d9488). The changes are intentionally incremental: they reuse your Sidebar, +New menu, Header switchers and Command Palette while improving copy, CTAs and subtle UI animations.

I reviewed your original proposal and the **current frontend navigation** you already have (detailed sidebar, +New menu, header tools, command palette, breadcrumbs, etc.).

The revised version below **aligns perfectly with your existing code structure** while incorporating the best practices from the original flow. It keeps the fast, intuitive path for new users, eliminates confusion between tenant/company, and leverages your current components (Sidebar, AppShellHeader, NewMenu, CommandPalette, Breadcrumbs).

#### Key Improvements Over the Original
- Matches your **existing routes** (e.g., `/dashboard`, `/sales`, `/expenses`, `/inventory`, etc.).
- Uses your **existing +New menu** and **Sidebar active-state grouping**.
- Adds **tenant/company switchers** in the header (top-left logo + user menu) — no need for separate `/tenants` or `/companies` pages.
- Makes onboarding **non-blocking** (no forced wizard if user skips).
- Keeps **public paths** exactly as you have them.
- Integrates with your **permission system** and **Command Palette**.

#### The Full Revised Sequence

1. **Landing Page (Public)**  
   URL: `/` or `/landing` (your current marketing page)

   - Hero + “Start Free Trial” → `/auth/signup`
   - “Sign In” → `/auth/login`

2. **Signup Page**  
   URL: `/auth/signup` (matches your current `(public)/signup/page.tsx`)

   - Simple form (Name, Email, Password)
   - Google SSO option
   - After signup → **redirect to `/onboarding/tenant`**

3. **Login Page**  
   URL: `/auth/login` (your current `(public)/login/page.tsx`)

   - Email + Password + Google SSO
   - After login:
     - If **0 tenants** → `/onboarding/tenant`
     - If **1 tenant & 1 company** → auto-select → `/dashboard`
     - If **multiple tenants/companies** → show **Tenant Switcher** in header (visible immediately)

4. **Create First Tenant (Organization)**  
   URL: `/onboarding/tenant` (new route – we’ll create this)

   - Form:
     - Organization Name
     - Subdomain (`yourname.haypbooks.com`) – live availability check
     - Base Currency (default USD)
     - Optional: Industry
   - CTA: “Create Organization”
   - After creation:
     - Auto-create first **Company** with same name
     - Redirect to **Company Setup Wizard**

5. **Tenant Switcher** (No separate page – integrated in header)  
   Location: Top-left (click logo) or User Menu dropdown

   - Shows list of user’s tenants (name, subdomain, role, last accessed)
   - “+ New Organization” button → `/onboarding/tenant`
   - Clicking tenant → sets active tenant → reloads page (or client-side navigation) → shows **Company Switcher** if needed

6. **Company Switcher** (If tenant has multiple companies)  
   Location: Next to tenant name in header (e.g., “Acme Corp ▼”)

   - Dropdown list of companies in current tenant
   - “+ Add Company” → modal or `/onboarding/company/new`
   - Clicking company → sets active company → navigates to `/dashboard`

7. **Company Setup Wizard** (First-time per company)  
   URL: `/onboarding/company` (or modal after tenant creation)

   Multi-step (progress bar, skippable):

   **Step 1: Basic Info**
   - Legal Name, Tax ID, Address, Fiscal Year Start

   **Step 2: Chart of Accounts**
   - Recommended: “Use Standard Chart” (pre-populate common accounts)
   - Advanced: “Start Blank” or “Import Later”

   **Step 3: Opening Balances**
   - Key accounts (Bank, AR, AP)
   - “As of” date

   **Step 4: Done**
   - “Finish Setup” → mark `onboardingComplete = true` → go to `/dashboard`

   - “Skip for now” option on every step → still go to dashboard

8. **Main Dashboard**  
   URL: `/dashboard` (your current route)

   - Financial snapshots
   - Overdue items
   - Quick actions (leveraging your **+New menu**)
   - Full sidebar visible

   Top bar:
   - Logo → Tenant Switcher
   - Current Tenant + Company name (with dropdowns)
   - +New button
   - Command Palette (Cmd+K)
   - User Menu (profile, logout)

#### Additional Flows (Already Supported or Easy to Add)

- **Invite Flow**  
  `/invite/accept?token=xxx` → login/signup → accept → added to tenant → show Tenant Switcher

- **Forgot/Reset Password**  
  Already in your e2e tests — works with OTP flow

- **Onboarding Resume**  
  If user logs in with incomplete setup → redirect to last step

#### Design Tokens & Animation Guidance

- **Primary color**: `--hb-primary` is the single source of truth (set to `#0d9488`). Prefer `var(--hb-primary)` or the utility classes we add (`.btn-primary`, `.bg-hb-primary`, `.text-hb-primary`) instead of raw `teal-` classes.
- **Use subtle motion**: Use a single spotlight/sheen animation (`hb-sheen-sweep`) for buttons and link hover, and a short underline sweep for nav items. Keep durations under 250–900ms and provide `prefers-reduced-motion` fallbacks.
- **Micro-interactions**: buttons use a gentle scale on hover when not `:focus-visible`, and focus outlines are a strong accessibility cue using `rgba(var(--hb-primary-400-rgb), 0.9)`.
- **Components**: Make the Sidebar and Header re-use the same token sets and avoid hard-coded colors inside components. Use CSS variables for gradients and tints (e.g., `rgba(var(--hb-primary-400-rgb), 0.08)`).

#### Microcopy & CTA wording recommendations

- Signup CTA: "Start your free trial" → secondary: "Explore demo" (reduces friction). Keep language active and outcome-focused.
- Tenant creation: Button: "Create organization"; hint: "You can add companies later — skip if you like."
- Company setup final step: CTA: "Finish setup — Take me to dashboard" with a subtle success microcopy: "You’re all set. Your company is ready."

#### Implementation notes

- Add `NAVIGATION.md` to docs (done) and keep it in sync with `Sidebar.tsx` and `AppShellHeader.tsx`.
- Add a Playwright e2e that validates the main navigation, active states and the presence of the `--hb-primary` CSS variable on the page.

#### Why these design choices

- A single token (`--hb-primary`) with utility classes makes theme changes safe and fast, useful for future branding variants. Subtle motion improves perceived quality without harming accessibility when `prefers-reduced-motion` is honored.

#### Ready to implement

If you want, I will now add the intro text and the CSS utilities that implement these guidelines and add a Playwright test to verify nav + theme are present.

#### Why This Revised Flow Is Best for Your Current App

- **No breaking changes** — uses your existing sidebar, header, +New menu, permissions, routes.
- **Fastest path** — new user: Landing → Signup → Tenant → Company Wizard → Dashboard in <5 min.
- **Scales naturally** — switchers appear only when needed (multiple tenants/companies).
- **Leverages your strengths**:
  - Your beautiful **Sidebar** with grouped active states
  - Powerful **+New menu**
  - **Command Palette** for power users
  - **Breadcrumbs** for deep navigation
- **Professional & familiar** — matches Xero/QuickBooks pattern but fits your UI perfectly.

### Ready to Implement?

This flow is **100% implementable** with your current stack (Next.js App Router + Tailwind + shadcn/ui).

**Recommended order to build:**
1. Tenant Creation page (`/onboarding/tenant`)
2. Header switchers (tenant + company dropdowns)
3. Company Setup Wizard (multi-step form)
4. Onboarding redirect logic (in layout or middleware)

