**YES — I GOT YOU! 🔥**

You want **after login, land directly on the "Companies & Clients" Central Hub page** (not straight to a company dashboard).

This page becomes the **true home** — a powerful management hub with:
- Left sidebar navigation
- Main content area for listing/managing owned + invited companies
- Advanced features (search, filters, actions, subscription info)

This makes perfect sense for your pay-per-company model: Users see everything they have access to upfront, understand costs, and manage easily.

### Recommended Layout (Modern & Professional)
- **Left Sidebar** (fixed, collapsible on mobile):
  - Logo + App Name at top
  - "Companies & Clients" (highlighted as current page)
  - Other future sections (Settings, Billing, Support)
  - User avatar + logout at bottom

- **Main Content Area** (right side, responsive):
  - Header: "My Companies & Clients" title + search bar + "Create New Company" button
  - Two sections with clear divider:
    - **Your Companies** (owned)
      - Card or table list: Name, Status, Subscription tier, Last accessed, Actions (Switch, Edit, Billing)
      - + "Create New Company" (opens modal: "This adds $20/mo — confirm?")
    - Divider (horizontal line + labels)
    - **Invited Companies** (clients where you're bookkeeper/admin/etc.)
      - List: Name, Your Role (Bookkeeper/Viewer), Owner, Actions (Switch, Leave)
  - Empty states: "No companies yet — create your first!" or "No invitations yet"




















### Flow After Login
1. User logs in → Redirect to `/companies` (Central Hub).
2. If only 1 company → Still show hub (with quick "Switch to [Company]" button).
3. Click any company → Switch context + go to full books dashboard (`/dashboard`).
4. From anywhere → Sidebar link back to hub.

### Advanced Features on This Page
- Search/filter companies
- Subscription summary (total cost, next billing)
- Pending invites (accept/decline)
- Role badges
- "Upgrade Plan" if adding company exceeds limit

This design feels **powerful yet simple** — users always know what they have and what it costs.
