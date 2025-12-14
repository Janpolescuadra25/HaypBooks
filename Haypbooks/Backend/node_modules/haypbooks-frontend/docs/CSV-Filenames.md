# CSV Filenames – Convention and Helper

Standardized filename patterns for CSV exports are enforced via the shared helper in `src/lib/csv.ts`.

## Patterns
- Range: `<slug>-<start>_to_<end>[_<token> ...].csv`
- As of: `<slug>-asof-<YYYY-MM-DD>[_<token> ...].csv`
- Period mode: `<slug>-<Period>[_<start>_to_<end>][_<token> ...].csv`

Examples:
- `transactions-2025-01-01_to_2025-01-31_type-income_bank-categorized.csv`
- `customers-asof-2025-09-04_q-acme-widgets.csv`
- `retail-sales-by-channel-Custom_2025-01-01_to_2025-01-31_ch-marketplace.csv`

## Tokens and placement
Compact, sanitized filters appended as `_`-separated tokens:
- `type-<value>` e.g., `type-income`
- `bank-<status>` e.g., `bank-categorized`
- `status-<status>` e.g., `status-open` (do NOT emit for derived `overdue`)
- `tag-<value>` e.g., `tag-tprojectalpha` (see sanitization)
- `q-<term>` e.g., `q-acme-widgets`

Ordering: tokens appear in the order added by the route (generally filter order).

Placement rules:
- Default: tokens-after (suffix) → `<slug>...[_tokens].csv`
- Core statements and explicit compare variants: use tokens-before → `<slug>-<tokens>...`

## Sanitization
`sanitizeToken(v: string)` enforces:
- Lowercase, trim
- Spaces → dashes
- Remove all except `[a-z0-9-_.]`

Examples:
- `t:project:alpha` → `tprojectalpha`
- `Supply Co. Intl` → `supply-co.-intl`

## Helper API
`buildCsvFilename(baseSlug, opts)` supports both legacy and period modes:

```ts
type BuildCsvOpts = {
	start?: string
	end?: string
	asOfIso?: string        // legacy/range mode
	period?: string         // period mode (e.g., 'YTD', 'Custom', 'QTD')
	tokens?: string[]
	tokenPosition?: 'before' | 'after'
}

// Range/as-of (legacy)
buildCsvFilename('transactions', { start, end, asOfIso, tokens })

// Period mode
buildCsvFilename('retail-sales-by-channel', { period: 'Custom', start, end, tokens })

// Tokens before (e.g., core statements compare)
buildCsvFilename('balance-sheet', { asOfIso, tokens: ['YTD-compare'], tokenPosition: 'before' })
```

### PDF naming (checks printing)

Some endpoints return PDFs but still use the CSV filename helper for consistency, swapping the extension to `.pdf`.

- Endpoint: `POST /api/checks/print` (RBAC: `bills:write` required)
- Filename pattern: `checks-asof-<YYYY-MM-DD>[_<account>].pdf`
	- Example: `checks-asof-2025-10-04_operating-checking-1234.pdf`
	- The `<account>` token is sanitized via `sanitizeToken` and multiple dashes are collapsed.


## Tests
Each export route should have at least one test asserting the filename:
- As-of (end only) or date range
- Period mode (where applicable)
- Presence/absence of tokens when filters are set
- Token placement (before/after) for special cases
- Sanitization of tokens for special characters

See examples in `src/__tests__/`:
- `transactions-export.tokens.test.ts`
- `bills-export.tokens.test.ts`
- `customers-export.filename-q.test.ts`
- `vendors-export.filename-q.test.ts`
- `bill-payments-export.filename.test.ts`
- `accounts-export.filename.test.ts`
- `periods-export.filename.test.ts`
- `standard-reports.export.api.test.ts`
- `csv.build-filename.test.ts`

## CSV-Version prelude

As of 2025-10-08, CSV prelude emission (the optional first row `CSV-Version,1`) is centralized via `parseCsvVersionFlag` in `src/lib/csv.ts`.

- Aliases accepted: `csvVersion`, `csv-version`, `csv_version`, `csv`, `version`
- Falsy values treated as off: `''`, `0`, `false`, `no`, `off`, `null`, `undefined` (case-insensitive)
- Default remains opt-out; only emitted when a truthy version flag is provided

All export routes should call `parseCsvVersionFlag(req)` instead of manually reading query params to avoid drift.
