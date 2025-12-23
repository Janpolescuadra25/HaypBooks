# Frontend Layout Guidelines

Purpose: establish clear rules for where pages belong and when the app "chrome" (top bar + left sidebar) should appear.

Rules

- Public / Marketing / Auth pages
  - Must live under `src/app/(public)` (e.g., `/pricing`, `/accountants`, `/landing`).
  - Must NOT include the core app chrome (AppShellHeader, Sidebar).
  - Should be accessible to unauthenticated users and must render correctly even when a user is signed in.
  - Add the route prefix to `src/config/publicPaths.ts` when creating a new public page.

- Core Accounting App pages
  - Must live under `src/app/(app)` or other non-public routes (e.g., `/hub`, `/invoices`, `/accounts`).
  - These pages render the core app chrome: `AppShellHeader` (top bar) and `Sidebar` (left navigation).
  - These pages are authenticated and expect a full-featured application shell.

Developer workflow

- Creating a marketing page: create under `src/app/(public)/your-page`, then add the prefix (e.g., `/your-page`) to `src/config/publicPaths.ts`.
- Avoid importing `AppShellHeader` or `Sidebar` in public pages. A test will fail if these are present in public pages.

Why this matters

- Clear separation prevents marketing pages from accidentally inheriting authenticated UI (topbar/sidebar) and avoids confusing UX for new visitors or partners.
- Centralized `publicPaths` ensures client runtime and tests agree on which routes are public.
