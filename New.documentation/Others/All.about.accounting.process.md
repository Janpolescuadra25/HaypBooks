# Accounting Process in HaypBooks

This document summarizes the Accounting Process page and the month‑end workflow now available in HaypBooks.

## Overview

The Accounting Process page provides a single place to:
- Review AR/AP snapshot and key KPIs (DSO, DPO)
- See receipts and deposits activity (including undeposited payments)
- Check general ledger health (balanced trial balance, journal counts)
- Manage period close: generate closing entries, set a close date, and optionally require a password
- Post quick adjusting entries with an optional reversing entry next month
- Track month‑end tasks via a checklist per period

Route: `/accounting/process`

## Month‑end checklist

- Checklist is stored per period (YYYY‑MM) in settings.
- Default tasks:
  1. Reconcile bank accounts
  2. Clear undeposited funds
  3. Review receivables and apply credits
  4. Review payables and vendor credits
  5. Apply write‑offs (if any)
  6. Assess finance charges (if any)
  7. Send statements (if needed)
  8. Post recurring adjustments (depreciation, amortization)
  9. Post inventory adjustments (if applicable)
  10. Generate closing entries
  11. Close books for the month
- Users can toggle items as done and reset the list for the active period.

API:
- GET `/api/accounting/process/checklist?period=YYYY-MM` → `{ period, items }`
- POST `/api/accounting/process/checklist` with `{ period, id, done }` to update one item
- POST `/api/accounting/process/checklist` with `{ period, action: 'reset' }` to reset defaults

## Audit-based histories (new)

HaypBooks surfaces key audit timelines to support reconciliation and compliance. These reports follow our JSON-first + CSV export standard:
- Caption-first CSV rows with a two-cell caption where applicable (e.g., `As of,<MM DD, YYYY>`)
- Optional CSV version prelude row when requested
- Stable headers and filename conventions via shared helpers

- Payment Application History
  - JSON: `GET /api/receivables/payments/applications/history?start=YYYY-MM-DD&end=YYYY-MM-DD&customerId=...&invoiceId=...`
  - CSV: `GET /api/receivables/payments/applications/history/export[?csv=1]`
  - RBAC: requires both `audit:read` and `reports:read`
  - Columns: Date, Customer, Invoice, Payment Id, Applied Amount, Remaining Balance, Method, Batch Id

- Collections Reminders History
  - JSON: `GET /api/receivables/collections/reminders/history?start=YYYY-MM-DD&end=YYYY-MM-DD&customerId=...`
  - CSV: `GET /api/receivables/collections/reminders/history/export[?csv=1]`
  - RBAC: requires both `audit:read` and `reports:read`
  - Columns: Date, Customer, Invoice, Batch

- Statement Send History
  - JSON: `GET /api/customers/statements/send/history?start=YYYY-MM-DD&end=YYYY-MM-DD&customerId=...&batchId=...`
  - CSV: `GET /api/customers/statements/send/history/export[?csv=1]`
  - RBAC: requires both `audit:read` and `reports:read`
  - Columns: Date, Customer, As Of, Type, Status, Message Id, Batch Id

Related action endpoint:
- `POST /api/customers/[id]/statement/send` — queues a statement send and writes an audit event. RBAC: `statements:send`.

All history endpoints sort newest-first and accept inclusive `start`/`end` filters. CSV filenames use shared helpers and include tokens for range/as-of as applicable.

CSV version flag:
- Enable a version prelude row by passing any of the following query params with a truthy value: `csvVersion`, `csv-version`, `csv_version`, `csv`, or `version`. Falsy values like `0`, `false`, `no`, or `off` disable it.

## Recurring Transactions

Automate journals, invoices, and bills on a defined interval using brand‑neutral templates.

### Data model
id, name, kind (`journal`|`invoice`|`bill`), status (`active`|`paused`), startDate, frequency (`daily`|`weekly`|`monthly`), nextRunDate, lastRunDate, remainingRuns (undefined → indefinite), totalRuns, lines[], memo, currency.

### Scheduling semantics
Advancing a run sets `lastRunDate = nextRunDate` then moves `nextRunDate` forward one interval.
Monthly rollover is month‑end safe (clamps to the last day when the intent day doesn’t exist). Examples: 2025‑01‑31 → 2025‑02‑28; 2024‑01‑31 → 2024‑02‑29; 2025‑03‑31 → 2025‑04‑30. When `remainingRuns` is numeric it decrements on each run and auto‑pauses at zero.

### Run behavior (materialization + period lock)
Posting date uses the current `nextRunDate`.
Closed‑period guard: run is blocked when `nextRunDate` is on or before the closed date (shared period utilities) returning `{ code: 'PERIOD_CLOSED', closeDate, requestedDate, error }` without changing the template.
Materialization (mock layer):
- `journal`: creates a journal entry mapping template lines (debit/credit respected; positive `amount` treated as debit, negative as credit fallback) and returns `{ type: 'journal', id, date, total }`.
- `invoice`: creates an invoice (status set to sent) using line amounts and returns `{ type: 'invoice', id, number, date, total }`.
- `bill`: creates a bill (open status) and returns `{ type: 'bill', id, number, date, total }`.
After materialization the schedule advances; auto‑pause still applies when remaining runs reach zero.
No silent date shifting: a blocked run requires reopening the period or rescheduling explicitly.

### Export policy
JSON‑first list: `GET /api/recurring-transactions` → `{ data: [...] }`.
CSV: `GET /api/recurring-transactions/export` delegates to JSON; caption‑first with optional CSV‑Version prelude; formatted Amount (presentational currency); filename via shared helper.
Headers: `Name,Type,Frequency,Next Run,Last Run,Status,Remaining,Amount,Currency`.

### RBAC
List/Export: viewer safe (`reports:read`).
Create/Update/Run/Pause/Resume: requires write permission (mock: user/admin). Delete restricted to admin.

### UI pattern
Unified toolbar (Search, Apply, Clear, Export CSV, Print) plus Run Now / Pause / Resume row actions. Table shows Next/Last Run, Remaining, Status, Amount.

### Run history (new)
Every successful run appends a lightweight history entry used for audit and CSV export.

JSON:
- `GET /api/recurring-transactions/history?templateId=…&start=YYYY-MM-DD&end=YYYY-MM-DD` → `{ data: [{ id, templateId, runDate, artifactType, artifactId, amount, status }] }`

CSV:
- `GET /api/recurring-transactions/history/export[?templateId=…][&start=YYYY-MM-DD][&end=YYYY-MM-DD][&csvVersion=1]`
- Caption‑first with optional `CSV-Version,1` prelude. Headers: `Run Date,Template ID,Artifact Type,Artifact ID,Amount`.
- Caption reflects filters when present (e.g., `From,<YYYY-MM-DD>`, `To,<YYYY-MM-DD>`). Filename tokenized via shared helper: `recurring-history-<YYYY-MM-DD>.csv` (as-of date when no range).

Notes:
- Status values: `posted` (success). Future values may include `skipped` and `error` with `errorCode`.
- Posting date equals the run’s `runDate` (the template’s `nextRunDate` at execution time).
- History surfaces newest-first; API is append-only in this mock.
- UI affordances: history table links artifacts to detail pages when available — `journal` → `/journal/:id`, `invoice` → `/invoices/:id`, `bill` → `/bills/:id`.
- UI affordances: Templates table includes a quick search filter (matches name, type, or frequency) with a clear button and live filtered count.

### Tests
- `recurring-transactions.schedule.test.ts`: month‑end rollover & auto‑pause.
- `recurring-transactions.export.csv-version.test.ts`: CSV version prelude & headers.
- `recurring-transactions.rbac.test.ts`: list/create/delete RBAC.
- `recurring-transactions.run.materialize.test.ts`: materialization per kind & schedule advance.
- `recurring-transactions.run.closed-period.test.ts`: period lock enforcement.
- `recurring-transactions.actions.rbac.test.ts`: run/pause/resume RBAC.
- `recurring-transactions.history.logging.test.ts`: history entry created on run.
- `recurring-transactions.history.csv-version.test.ts`: CSV prelude and headers for history export.

## Receipts lifecycle (parse → match → post)

Receipts follow a simple, brand‑neutral lifecycle that aligns with our JSON‑first policy and RBAC.

Endpoints (mock):
- Parse: `POST /api/receipts/:id/parse` — simulates OCR extraction to fill missing fields; sets `status=parsed`.
- Match: `POST /api/receipts/:id/match` — associates a transaction id and sets `status=matched`.
- Post: `POST /api/receipts/:id/post` — finalizes and posts; sets `status=posted`, stamps `postedAt`, and creates a journal entry with id `postedJournalId`.

Convert to expense (optional):
- `POST /api/receipts/:id/expense` — attaches an `expenseId` to a posted receipt.
- Accepts optional `{ expenseAccountNumber }` (defaults to `6000`). When provided and different from the initial posting account, the server posts a balancing reclass journal (DR new acct / CR 6000) dated on the receipt date.

Posting rule (mock):
- DR 6000 Operating Expenses / CR 1000 Cash. The posted journal is expected to be balanced (tests assert total debits === total credits).

RBAC:
- `GET /api/receipts` (list/export): requires `reports:read`.
- Parse/Match/Post/Delete: require `journal:write`. Server remains authoritative.

Deletion guard:
- `DELETE /api/receipts?id=...` returns 400 when `status='posted'`. Earlier statuses are deletable.

UI behavior:
- The Receipts page shows Status and Method columns with contextual actions (Parse, Match, Post). After posting, a Journal column appears with a link using `postedJournalId`.
- After posting, a "Convert to Expense" action appears (brand‑neutral). Once converted, the table shows the resulting `expenseId`.
 - The "Match…" modal displays suggested documents with columns for Kind, Id, Name, Remaining, Amount Delta, Date Delta, Score, and Similarity. Score is a composite 0–100% based on vendor similarity, amount proximity, and date proximity; Similarity is the raw vendor name similarity. A threshold slider filters suggestions client‑side without affecting server results.

CSV export policy:
- Receipts CSV delegates to the JSON list (JSON‑first), uses caption‑first shape with optional CSV‑Version prelude, applies presentational currency formatting based on Settings `baseCurrency`, and uses standardized filenames via the shared helper. Filters supported by JSON are inherited by CSV.

## Aging summary (receivables and payables)

Point-in-time aging summaries are available for both receivables and payables. These reports bucket open balances as of a target date into Current, 30, 60, 90, and 120+ day columns.

- Receivables Aging Summary (CSV)
  - `GET /api/reports/ar-aging/export?period=YTD&end=YYYY-MM-DD[&csv=1]`
  - First row caption row: two cells `As of,<formatted date>`; header row: `Customer,Current,30,60,90,120+,Total`
  - Filename pattern: `ar-aging-<PERIOD>-asof-<YYYY-MM-DD>.csv` (period token appears before the as-of segment)
  - RBAC: `reports:read`

- Payables Aging Summary (CSV)
  - `GET /api/reports/ap-aging/export?period=YTD&end=YYYY-MM-DD[&csv=1]`
  - First row caption row: two cells `As of,<formatted date>`; header row: `Vendor,Current,30,60,90,120+,Total`
  - Filename pattern: `ap-aging-<PERIOD>-asof-<YYYY-MM-DD>.csv`
  - RBAC: `reports:read`

JSON (internal use / future UI wiring):
- `GET /api/reports/ar-aging?period=...&start=...&end=...` → `{ start, end, asOf, rows: [{ name, current, '30','60','90','120+', total }], totals }`
- `GET /api/reports/ap-aging?period=...&start=...&end=...` → same shape (Vendor names)

Notes:
- As-of date defaults to derived `end` or today when omitted.
- Bucketing uses due date when available, falling back to transaction date; 120+ represents balances older than 90 days in this simplified mock.
- CSV routes delegate to JSON for data and apply presentational currency formatting using the base currency setting.
 - Periodized exports place tokens before the as-of segment in filenames to keep sort order predictable.
 - Implementation detail: CSV shape is centralized in `src/lib/reports/aging-csv.ts` to avoid drift between AR/AP. Routes call `buildAgingSummaryCsvRows(...)` and then stringify with the shared `toCSV(...)` utility.
 - Detail exports: A/R and A/P Aging Detail CSVs also use the centralized helper (`buildAgingDetailCsvRows(...)`) with caption via the shared range-or-date builder, a blank spacer before the header, presentational currency for Open Balance, and a trailing Totals row.

## Period close controls

- Close through a specified month with optional password requirement
- Reopen workflow requires a reason for audit
- Generate closing entries: moves current period P&L to Retained Earnings

Endpoints:
- POST `/api/accounting/month-end` with `{ action: 'close_period', period, password? }`
- POST `/api/accounting/month-end` with `{ action: 'generate_closing_entries', period }`
- POST `/api/settings/reopen-period` with `{ reason, password? }`
- POST `/api/settings/close-password` to set or clear the close password

## Adjusting journal (quick)

- Single‑line reclass or adjustment with optional reversing entry next month
- Validates date format, account selections, and positive amount
- Posts via `/api/journal/adjusting`

## RBAC and guards

- Reading the process summary requires `reports:read`
- Updating checklist requires `settings:write`
- Closing/reopening and generating closing entries require appropriate permissions
- All posting/voiding honors the closed‑period guard and normalizes dates when appropriate

## Navigation links

From the Accounting Process page you can quickly access:
- Invoices, Collections, Customers, and AR aging detail
- Bills, Vendors, POs, and AP aging detail
- Banking, Deposits, Journal, and Reports
 - Receivables audit surfaces: Payment Application History (`/receivables/payments/applications/history`), Reminder History (`/collections/reminders/history`), and Statement Send History (`/sales/statements/send/history`)

## Notes

- This is a mock implementation intended to illustrate workflows and guardrails.
- The page and APIs are designed to be extended with company‑specific policies and checklists.

## Accessibility updates (2025‑11‑01)

- Added polite aria‑live summaries to key reports so screen reader users are informed when content updates:
  - Bank Register: announces account, caption, and opening/closing balances.
  - A/R and A/P Aging Summary: announces totals update in caption.
  - A/R and A/P Aging Detail: announces caption and total open balance.
  - General Ledger: announces caption, opening balance (when present), and row count.
  - Profit & Loss: announces caption, whether comparison is enabled, and line count.
  - Trial Balance: announces totals and whether adjusted/unadjusted mode; numeric columns use tabular-nums.
  - Transaction Detail by Account: announces row count and totals; headers and cells use tabular-nums for numeric columns.
  - Customer/Vendor Balance Summary: announces totals update; numeric columns use tabular-nums.
- Numeric columns use tabular numerals for alignment.
- Export/Print toolbars are consistent across reports with clear aria‑labels.

### Helper

- Introduced a tiny `ReportLive` helper component to render consistent polite live regions in report captions:
  - Usage: wrap short summary phrases (totals, counts, mode flags) within `<ReportLive>…</ReportLive>`.
  - Keeps announcements consistent and easy to audit.
