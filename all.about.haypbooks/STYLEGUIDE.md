# Haypbooks Frontend Styleguide

## Accessibility (ARIA) conventions

- Use literal tokens for ARIA boolean attributes (e.g., aria-expanded="true" | "false").
- Prefer branch rendering to ensure values are string literals when required by strict linters.
- Popovers and dialogs: move focus into the panel on open, trap focus, and return focus to trigger on close. Include aria-controls only when the panel is present.

## Preferences API (mock-backed)

- Endpoint: GET/PUT `/api/user/preferences/report-filters?reportKey=...`
- Shape: `{ filters: Record<string,string>, updatedAt: string }`
- Client helpers: `getReportFilters(reportKey)`, `setReportFilters(reportKey, filters)` in `frontend/src/lib/preferences.ts`.
- In mock mode, data persists to `localStorage` (key `prefs:${reportKey}`); server route maintains an in-memory map during dev.

Example: Standard report filter component loads saved values on mount and persists on apply/reset using these helpers.

## CompareHeader component

- Use `src/components/CompareHeader.tsx` to render grouped headers when compare mode is enabled across reports.
- Pass column labels and spans; the component ensures proper th scope, sticky behavior, and consistent layout across P&L, Cash Flow, Balance Sheet, and Budget vs Actual.
- Keep the first column fixed and provide accessible header text for screen readers.

