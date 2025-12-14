### HaypBooks Frontend Navigation Map

This document maps routes, primary navigation surfaces, active states, and important client-side behaviors for the app (desktop + mobile). It is designed to be authoritative and actionable for developers implementing UI changes or e2e tests.

- **Top-level surfaces**
  - Header (AppShellHeader)
    - Tenant switcher (logo or left area) — shows tenant list, last accessed. +New Organization entry action -> `/onboarding/tenant`
    - Company switcher (if multiple companies in current tenant) — dropdown near tenant name
    - +New menu — central quick-create for Invoices/Bills/Payments/Customers (keeps dropdown shortcuts)
    - Command Palette (Cmd/Ctrl+K) — global search & action launcher
    - User menu — profile, billing, logout
  - Sidebar (Sidebar component)
    - Collapsible; collapsed state shows icons only
    - Grouped items with primary/secondary headings
    - Keyboard navigation: Up/Down focus; Enter activates; Cmd/Ctrl+K to open Command Palette

- **Canonical routes (and behavior)**
  - `/` or `/landing` — Marketing / public Landing
  - `/auth/signup` — Signup form > redirect to `/onboarding/tenant` when new
  - `/auth/login` — Login; post-login routing depends on tenant count
  - `/onboarding/tenant` — Create tenant flow (form) — creates tenant + first company then `/onboarding/company`
  - `/onboarding/company` — Company setup wizard (multi-step, skippable)
  - `/dashboard` — Dashboard snapshot (default landing post-login)
  - `/customers`, `/vendors` — Lists with filters, quick-create
  - `/invoices`, `/bills`, `/payments` — Core lifecycle lists + create flows
  - `/reports` — Grouped reports with parameterized query strings for filters and CSV export
  - `/settings` — Organization and company settings (permissions, chart of accounts)
  - `/developers` and `/developers/explorer` — internal developer docs (Redoc & examples)

- **Active states & spacing rules**
  - Sidebar item active: `nav-link-active` class; show left accent bar and broader background tint
  - In collapsed sidebar: only icon shows; accessible tooltip appears on hover/focus
  - Bread-crumbs reflect canonical path segments; click breadcrumb to open list or parent resource

- **Permissions & Gating**
  - Sidebar item visibility is controlled by backend permissions; UI avoids showing disallowed routes
  - Command Palette items are filtered at runtime by user permissions

- **Mobile behaviors**
  - Sidebar becomes an overlay sheet; header compresses to show a compact +New button
  - Tenant/Company switchers open full-screen selection modal on small screens

- **Keyboard & Accessibility**
  - `Cmd/Ctrl + K`: Open Command Palette
  - `g d` (example binding): quick jump to Dashboard (implement in Command Palette binding table)
  - Focus outlines use `:focus-visible` and respect `prefers-reduced-motion`
  - All nav links have accessible names and clear skip links for screen readers

- **E2E suggestions**
  - Playwright test: open app, sign in, verify Tenant switcher (0/1/multiple), open Sidebar, navigate to `/invoices`, click +New > create minimal invoice, verify invoice appears in list
  - Visual snapshot for sidebar collapsed vs expanded states; assert nav-link-active styles and underline sweep

- **Notes & Action Items**
  - Add `NAVIGATION.md` to Docs and keep synchronized with `Sidebar.tsx`, `AppShellHeader.tsx`, and `CommandPalette` bindings
  - Add Playwright test that asserts active-state left accent and nav underline animation has been applied

Prepared: 2025-12-14
