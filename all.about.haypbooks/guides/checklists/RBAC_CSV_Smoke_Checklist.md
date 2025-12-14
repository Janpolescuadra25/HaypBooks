# RBAC + CSV Smoke Checklist

Purpose: Fast verification pass after routing/UI changes to ensure exports and permissions remain intact.

Scope
- Focused on high-traffic reports and lists: A/R Aging (summary & detail), A/P Aging (summary & detail), Open Invoices, Unpaid Bills, Trial Balance, General Ledger/Transaction Detail, Receipts/Deposits.

Checks
1) RBAC
- Without reports:read => CSV endpoints return 403.
- With reports:read => CSV endpoints succeed.
- Role override in tests uses deterministic user fixture to avoid environment drift.

2) CSV Shape
- Caption-first, then blank line, header, rows, trailing Totals.
- Filenames via buildCsvFilename with correct as-of/range tokens.
- Monetary cells use formatCurrency with baseCurrency from Settings.

3) Delegation
- CSV route delegates to its JSON sibling; no direct DB reads.

4) Print Availability
- Print button visible in report headers; no dedicated print-only pages.

5) Routing Stability
- No duplicate routes resolving to the same path (App Router parallel conflict).
- Legacy aliases use redirects, preserving query parameters.

Suggested Minimal Test Cases
- A/R Aging Summary CSV happy path.
- A/R Aging Detail CSV with customerId filter.
- A/P Aging Detail CSV with vendorId filter and bucket edge cases.
- Open Invoices CSV.
- Trial Balance CSV.
- Receipts CSV.

Outcome
- Document PASS/FAIL per check. If any FAIL, fix before broader QA.
