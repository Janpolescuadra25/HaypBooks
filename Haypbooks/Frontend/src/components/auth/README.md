# Authentication Module (`src/components/auth`)

## Status: DONE (Verified 2026-09-20)

### 1. Overview & Architecture
The authentication module provides the unified, responsive container for HaypBooks' public authentication and onboarding experience. This module centralizes the visual shell, shared brand treatment, and form framing for the app's sign-in, account creation, password recovery, and verification flows.

### 2. Unified Container: `AuthShell.tsx`
`AuthShell.tsx` is the canonical layout for all public auth screens. It provides the shared split-screen shell with:
- a desktop brand panel and a mobile-responsive header,
- branded background treatment and motion-safe transitions,
- a scrollable form panel for all auth entry points,
- consistent spacing, typography, and dark-brand styling across auth views.

The legacy `AuthLayout.tsx` has been permanently removed from the repository. There are no remaining active imports or references to it in the frontend source.

### 3. Verified Consumers (7 pages)
The following 7 verified pages across the frontend application consume `AuthShell`:
1. `/app/(public)/login/page.tsx` — Standard credentials sign-in
2. `/app/(public)/signup/page.tsx` — Account registration & tenant creation
3. `/app/(public)/forgot-password/page.tsx` — Password reset initiation
4. `/app/(public)/reset-password/page.tsx` — Password reset submission with token validation
5. `/app/(public)/verify-otp/page.tsx` — One-time password verification
6. `/app/verification/page.tsx` — General account verification workflow
7. `/app/onboarding/welcome/page.tsx` — Initial post-registration onboarding shell

Dashboard pages do not consume `AuthShell` and are intentionally excluded from this inventory. The `AuthShell` component remains scoped to public authentication and onboarding screens only.

### 4. Session, Security & Layout Standards
- Session handling remains managed by the active auth/session flow already used by the app.
- Refresh and access token behavior remains tied to the existing secure cookie and application session infrastructure.
- The shell is designed for responsive desktop and mobile layouts, with keyboard-safe focus flow and accessible form spacing.
- Motion and visual treatment are intentionally subtle and reduced-motion aware.

### 5. Verification Basis
This documentation reflects the verified repository state after the E11 migration was completed and the deprecated layout was removed. The verified consumer list above is limited to the actual `AuthShell` imports in the frontend source, excluding the component definition itself.
