# UI Formatting Sweep: Standards, Hotspots, and How-To

This guide captures the standards and the repeatable steps to migrate any page/report to the shared formatting utilities so the whole app stays consistent and export-safe.

## Standards at a glance
- Currency in UI: render with the shared Amount component and tabular-nums class for column alignment; it respects base currency via CurrencyProvider.
- Currency in SSR/exports: use formatCurrency(value, baseCurrency) only in server/export contexts (routes, CSV builders); never inline toLocaleString with hardcoded currency.
- Percentages: 
  - Values expressed on a 0–100 scale (e.g., tax rate 8.25) → use formatPercentFromPct(pct, digits/options)
  - Ratios 0–1 (e.g., utilization 0.873) → use formatPercent(ratio, digits/options)
- Numbers: use formatNumber for general numbers and formatInteger for counts when grouping and decimals aren’t needed.
- Avoid: ad‑hoc toLocaleString, toFixed for money, or hardcoded "USD". Keep alignment with tabular-nums and preserve negative coloring where meaningful.

## Migration pattern (repeatable)
1) Identify the currency/number/percent cells.
2) Replace currency cells with <Amount value={...} />; keep className for alignment.
3) Replace inline percent logic with formatPercent or formatPercentFromPct, matching the scale in the data.
4) Replace number formatting with formatNumber/formatInteger as appropriate.
5) Don’t change API shapes or column order. Only change presentation code.
6) Add/adjust minimal tests to assert the new formatting (one happy path per page is enough).

## Known hotspot checklist (track and check off)
- Reports
  - [ ] Open Purchase Orders: list and detail pages
  - [ ] Purchases by Product: summary and detail
  - [ ] Purchases by Vendor: detail and summary
  - [ ] Income by Customer: summary
  - [ ] Expenses by Vendor: summary
  - [ ] Profit & Loss by Quarter
  - [ ] Sales by Item/Customer: detail and summary
  - [ ] Ratio Analysis
  - [ ] Standard dynamic report (standard/[slug])
- App pages
  - [ ] Audit Log: numeric fields and export
  - [ ] Reconcile: amounts and variances
  - [ ] Unbilled Time: totals and row amounts
  - [ ] Statements: running balance and aging summary
- Exports
  - [ ] Journal export routes (currency and percent formatting)

## Test and lint guidance
- Lint pass criteria: No ad-hoc toLocaleString or hardcoded currency strings where <Amount /> or format* utilities should be used.
- Targeted tests: run only affected suites to keep cycles fast (e.g., tax-*.export.test, purchases-*.test). Verify PASS before merging.
- Exports: ensure formatCurrency is used on server. Totals row should match on-screen settings and column precision.

## Acceptance checklist per page/report
- [ ] All monetary values use <Amount /> (UI) or formatCurrency (SSR/export)
- [ ] Percentages use the correct helper based on data scale
- [ ] Numbers use formatNumber/formatInteger
- [ ] tabular-nums alignment for numeric columns
- [ ] No API/shape changes; only presentation
- [ ] Minimal tests updated and passing

## Notes
- When unsure of the scale for a percent, inspect the source (e.g., ratePct often is 0–100 in reports). Prefer formatPercentFromPct in those cases to avoid double-multiplying.
- Keep PRs small: 1–3 pages per commit with a quick targeted test run.
