# Unused Exports Audit - Frontend/src/lib and Frontend/src/utils

**Criteria**: Exports that are defined but have ZERO imports anywhere in the codebase.

**Date**: Latest Scan

**Summary**: 20 unused exports across 8 files identified through comprehensive grep search of entire Frontend/src directory.

---

## lib/format.ts

| Export | Type | Line | Purpose | Status |
|--------|------|------|---------|--------|
| `formatInteger()` | function | 44 | Format integer values with null handling | ❌ UNUSED |
| `formatPercentFromPct()` | function | 52 | Format 0-100 scale percentages (e.g., 12.34 → "12.3%") | ❌ UNUSED |
| `tabular()` | function | 47 | Passthrough helper for Tailwind `tabular-nums` CSS class | ❌ UNUSED |

**Note**: `setDefaultCurrency()` IS USED (imported in `useCompanyCurrency.ts`)

---

## lib/minimized.ts

| Export | Type | Line | Purpose | Status |
|--------|------|------|---------|--------|
| `upsertMinimized()` | function | 30 | Add or update a minimized UI item | ❌ UNUSED |
| `removeMinimized()` | function | 39 | Remove a minimized item by ID | ❌ UNUSED |
| `consumeRestoreIntent()` | function | 47 | Retrieve and clear restore intent from localStorage | ❌ UNUSED |
| `addRestoreListener()` | function | 67 | Register callback for restore events | ❌ UNUSED |

**Note**: `readMinimized()`, `writeMinimized()`, `setRestoreIntent()`, `dispatchRestore()` ARE USED in `GlobalMinimizedDock.tsx`

---

## lib/analytics.ts

| Export | Type | Line | Purpose | Status |
|--------|------|------|---------|--------|
| `trackEvent()` | async function | 1 | Track analytics events via beacon or fetch | ❌ UNUSED |

---

## lib/auth.ts

| Export | Type | Line | Purpose | Status |
|--------|------|------|---------|--------|
| `getSession()` | async function | 7 | Get current server session (TODO implementation) | ❌ UNUSED |
| `requireAuth()` | async function | 11 | Require authentication; throw if no session (TODO implementation) | ❌ UNUSED |

**Note**: These are server-only stubs with TODO comments, likely placeholder implementations.

---

## lib/csv.ts

| Export | Type | Line | Purpose | Status |
|--------|------|------|---------|--------|
| `sanitizeToken()` | function | 1 | Sanitize token/filename component (lowercase, remove special chars) | ❌ UNUSED |
| `buildCsvFilename()` | function | 22 | Build CSV export filename with date range and tokens | ❌ UNUSED |
| `parseCsvVersionFlag()` | function | 54 | Parse CSV version flag from URL query string | ❌ UNUSED |

---

## lib/download.ts

| Export | Type | Line | Purpose | Status |
|--------|------|------|---------|--------|
| `getFilenameFromContentDisposition()` | function | 1 | Extract filename from HTTP Content-Disposition header | ❌ UNUSED |
| `downloadFromResponse()` | async function | 9 | Create blob from fetch Response and trigger browser download | ❌ UNUSED |

---

## lib/urlFilterSync.ts

| Export | Type | Line | Purpose | Status |
|--------|------|------|---------|--------|
| `syncFiltersToUrl()` | function | 19 | Merge stored filters with URL params and optionally navigate | ❌ UNUSED |

---

## lib/date.ts

| Export | Type | Line | Purpose | Status |
|--------|------|------|---------|--------|
| `formatDateTimeLocal()` | function | 82 | Format date-time as "YYYY-MM-DD HH:MM" for activity tables | ❌ UNUSED |
| `shortMonthFromIso()` | function | 95 | Get short month label (e.g., 'Jan') from "YYYY-MM" format | ❌ UNUSED |

**Note**: `formatAsOf()`, `todayIso()`, `formatDateRange()`, `formatMMDDYYYY()` ARE USED

---

## utils/navigation.ts

| Export | Type | Line | Purpose | Status |
|--------|------|------|---------|--------|
| `reloadPage()` | function | 1 | Reload current page (test-friendly wrapper) | ❌ UNUSED |
| `navigateTo()` | function | 6 | Navigate to path (test-friendly wrapper for `window.location.href`) | ❌ UNUSED |

**Note**: These are utilities designed for testability; likely intentionally unused in production code.

---

## utils/dates.ts

| Export | Type | Line | Purpose | Status |
|--------|------|------|---------|--------|
| `todayLocalISODate()` | function | 1 | Get today's date in "YYYY-MM-DD" format (local timezone) | ❌ UNUSED |

**Note**: A local timezone variant exists; the more common `todayIso()` from `lib/date.ts` IS USED.

---

## Summary Statistics

- **Total Files Scanned**: 25+
- **Total Exports Found**: ~50
- **Unused Exports**: 20
- **Unused Rate**: ~40%

### By Category
- **Format Utilities**: 3 unused (out of 7 format functions)
- **Minimized UI**: 4 unused (out of 8 minimized functions)
- **CSV Utilities**: 3 unused (new/unused feature)
- **Download Utilities**: 2 unused (new/unused feature)
- **Auth Stubs**: 2 unused (TODO implementations)
- **Analytics**: 1 unused
- **Filter Sync**: 1 unused
- **Date Utilities**: 2 unused (local variants)
- **Navigation**: 2 unused (test utilities)

---

## Recommendations

### High Priority - Remove
These are clearly unused and unlikely to be needed:
- `utils/navigation.ts`: `reloadPage()`, `navigateTo()` (test utilities, not used in tests)
- `lib/auth.ts`: `getSession()`, `requireAuth()` (TODO stubs, no implementation)

### Medium Priority - Evaluate
These represent completed but unused features:
- `lib/minimized.ts`: `upsertMinimized()`, `removeMinimized()`, `consumeRestoreIntent()`, `addRestoreListener()` 
  - Consider if minimized UI feature is still in use or planned
- `lib/csv.ts`: `sanitizeToken()`, `buildCsvFilename()`, `parseCsvVersionFlag()`
  - Consider if CSV export feature is being developed

### Low Priority - Consider Keeping
These are utilities that might be used in the future or provide value:
- `lib/format.ts`: `formatInteger()`, `formatPercentFromPct()`, `tabular()`
- `lib/download.ts`: `getFilenameFromContentDisposition()`, `downloadFromResponse()`
- `lib/urlFilterSync.ts`: `syncFiltersToUrl()`
- `lib/date.ts`: `formatDateTimeLocal()`, `shortMonthFromIso()`
- `utils/dates.ts`: `todayLocalISODate()`

