# Adding Standard Reports (Stubs and Dedicated Accountant Reports)

This guide shows how to add:
- Standard report stubs (industry/generic) rendered by the generic standard report page, and
- Dedicated accountant reports (custom pages and APIs) that follow HaypBooks’ core report standards.

Keep outputs deterministic so tests stay stable.

## Steps

1) Add the slug to the catalog
- File: `src/components/ReportsCatalog.tsx`
- Add an item `{ title, slug }` to the desired category. If it’s an industry stub, prefer the "Industry insights" section.
- The link will route to `/reports/standard/[slug]` automatically when not in `implementedRoutes`.

2) Add optional filters to the header (for generic stubs)
- File: `src/components/StandardReportFilters.tsx`
- Add a new branch for your slug and simple inputs (select/number) that call `apply({ key: value })`.
- Use short, clear query param names (e.g., `channel`, `minMargin`, `view`).

3) Implement JSON API response
- File: `src/app/api/reports/standard/[slug]/route.ts`
- Add a `case 'your-slug': { ... }` that sets `columns: string[]` and `rows: any[][]`.
- Read query params for your filters and apply them to `rows`.
- Make data deterministic (no `Math.random`) to avoid flaky tests.

4) Implement CSV export with the same columns/filters
- File: `src/app/api/reports/standard/[slug]/export/route.ts`
- Mirror JSON columns and filter logic. Use the same slug case and deterministic values.
- Keep the filename pattern: `${slug}-${period}` plus optional `_${start}_to_${end}`.

5) Add tiny tests
- JSON API tests: `src/__tests__/standard-reports.api.test.ts`
  - Assert `columns` match, and filters reduce or shape `rows` as expected.
- CSV export tests: `src/__tests__/standard-reports.export.api.test.ts`
  - Assert header equals JSON columns, and filters affect lines.

## Contracts and tips
- Inputs: read query params `period`, `start`, `end`, `compare`, plus your filter params.
- Outputs: JSON `{ columns, rows, period, start, end, compare }`; CSV rows that match JSON columns.
- Edge cases: empty filters should return all rows; numeric filters should handle non-numeric gracefully (ignore or default).
- Formatting: keep currency/numbers simple; negatives for outflows where applicable.
- Determinism: derive values from index `i` or simple formulas.

## Dedicated Accountant Reports (pattern)
- Use a dedicated API folder under `src/app/api/reports/<slug>` with `route.ts` and `export/route.ts`.
- Period derivation: mirror our shared derive logic so both JSON and CSV behave identically.
- Return totals in JSON and a Totals row in CSV for parity.
- UI page under `src/app/reports/<slug>/page.tsx` with:
  - `ReportHeader` (Back, Period, Refresh, Export, Print)
  - Centered table headers/cells; caption with either As of <date> or the date range.
- Export filename tokens follow `all.about.haypbooks/guides/CSV_Filename_Tokens.md`.
- Wire into the catalog by adding the slug mapping in `implementedRoutes` in `ReportsCatalog.tsx`.

## Implemented dedicated accountant reports (examples)
- General Ledger List — `general-ledger-list`
- Account List — `account-list`
- Journal — `journal`
- Transaction Detail by Account — `transaction-detail-by-account`

Use these as references for JSON/CSV parity, deterministic data, and page layout.

## Example slugs already implemented
- Retail: `retail-sales-by-channel` (filter: `channel`)
- Construction: `construction-job-profitability` (filter: `minMargin`)
- Healthcare: `healthcare-revenue-cycle` (filter: `view` = `financial-only`)
- Professional Services: `psa-utilization` (filter: `minUtil`)
- Manufacturing: `manufacturing-wip-inventory` (filter: `minTurn`)
- SaaS: `saas-mrr-churn` (filter: `segment`)

See also: `all.about.haypbooks/guides/CSV_Filename_Tokens.md` for naming examples like:
- balance-sheet-YTD-asof-YYYY-MM-DD.csv
- general-ledger-list-asof-YYYY-MM-DD.csv
- account-list-asof-YYYY-MM-DD.csv
- transaction-detail-by-account-asof-YYYY-MM-DD.csv

Follow these patterns to add new reports quickly, with parity across UI, JSON, and CSV.
