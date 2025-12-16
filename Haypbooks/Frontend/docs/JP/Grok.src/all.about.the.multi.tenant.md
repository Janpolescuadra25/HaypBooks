QuickBooks Online (QBO) handles **team members** (multi-user access) like this, as a solid reference for your HaypBooks multi-tenant design:

### How Team Setup Works in QuickBooks Online
- **No dedicated option during initial onboarding** — When a new user signs up and creates their company (similar to a "tenant" in your system), the onboarding flow focuses on basics like business info, chart of accounts, connecting banks, etc. There's **no step to invite team members right away**.
- **Done in the core app after setup** — Once the company is active, the primary admin (the signup user) goes to:
  - **Gear icon** → **Manage users** (under "Your Company").
  - Click **Add user**.
  - Enter email, select role (e.g., Company Admin, Standard user with custom permissions, Reports only, Time tracking only).
  - Send invite via email.
- The invited user gets an email to accept, create/log in with an Intuit account, and access the company.

### Key Details on Roles & Limits
- **Roles** include:
  - Primary/Company Admin → full access.
  - Bookkeeper → comprehensive bookkeeping but no full admin.
  - Standard → customizable (e.g., limited to customers/vendors, no sensitive banking/payroll).
  - Reports only/Time tracking → don't count toward user limits.
  - Separate accountant invite → (free, up to 2-3 depending on plan, full access).
- **User limits** depend on plan:
  - Simple Start → 1 billable user + accountants.
  - Essentials → 3.
  - Plus → 5.
  - Advanced → 25 + custom roles.
- Multiple users work simultaneously (cloud-based).

### Reference for HaypBooks
QuickBooks treats each "company" as isolated (like your tenants). The owner (signup user) is the initial admin and adds team members later via a dedicated "Manage users" page in settings — not during onboarding.

For HaypBooks, this suggests:
- Keep onboarding focused on creating the tenant/company and basic setup.
- Add a clear "Invite team" or "Manage users/roles" section in the main app (e.g., under tenant settings) post-onboarding.
- Your current roles (Owner, Admin, Bookkeeper, Viewer) align well — even better than QBO's in some ways!

This is a common pattern in SaaS accounting tools — keeps onboarding simple.

If you want to dive deeper or compare to Xero/ FreshBooks, let me know! 🚀