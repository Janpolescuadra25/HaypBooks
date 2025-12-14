# CSV Filename Tokens

This guide explains how HaypBooks formats CSV export filenames for consistency and easy identification.

- Base pattern: <report-slug>-<period>[optional tokens].csv
- Date range: when start/end are present, the caption reflects the range. Some reports may include range tokens; otherwise, an "asof-<YYYY-MM-DD>" token is used.
- Compact filter tokens appended when filters are active:
  - ch-<channel> (Retail channel)
  - mm-<month> (Manufacturing month)
  - mu-<month> (MRR month)
  - v-<vendor> (Vendor)
  - mt-<method> (Payment method)
  - seg-<segment> (Segment)
  - res-<resource> (Resource)
  - prog-<program> (Program)
  - prop-<property> (Property)
  - cat-<category> (Category)
  - cust-<id> (Customer identifier for per-customer exports, e.g., statements)
    - acct-<number> (Account identifier for account-ledger exports when needed; current convention appends the raw account number token after the date part)

Token placement
- Default: tokens appear after the date/period segment (e.g., `<slug>-asof-YYYY-MM-DD_<tokens>.csv`).
- Statements: follow the default placement (e.g., `customer-statement-asof-YYYY-MM-DD_cust-<id>.csv`).
- Compare modes (and certain periodized financials): may use tokens-before-asof per helper config; see Flow.md and in-repo docs for specifics.

Examples
- retail-sales-by-channel-YTD_ch-marketplace.csv
- hospitality-occupancy-revpar-YTD_prop-airport-hotel.csv
- balance-sheet-YTD-asof-2025-09-04.csv
 - customer-statement-asof-2025-09-04_cust-12345.csv
 - account-ledger-asof-2025-09-04_1000.csv
 - open-po-detail-asof-2025-09-04.csv

Notes
- Slugs and token values are lowercased and spaces replaced by dashes.
- Where totals are included in CSVs, the structure mirrors the JSON response deterministically.
- Management Pack export uses the preset key (e.g., preset=YTD) and concatenates selected reports.
 - Account Ledger filenames may include the selected account number as a trailing token (e.g., `_1000`) using the shared helper `buildCsvFilename` with `tokens: [accountNumber]`.

Special note: Customer Statement CSV emits numeric strings for `Amount` and `Running Balance` to support numeric comparisons and reconciliation tests. The UI renders presentational currency for readability.

## CSV-Version (opt-in metadata)

Some CSV exports can include a leading metadata line identifying the CSV schema version. This is disabled by default for compatibility. When enabled, the first line will be:

CSV-Version,1

Immediately after the version line (when present), the CSV follows our standard pattern: caption line, blank spacer line, header row, then body rows and any totals.

Enablement flags (any of these in the query string are accepted):
- csvVersion=1
- csv-version=1
- csv_version=1
- csv=1
- version=1

Notes about disabling:
- The flags are treated as truthy/falsey. Values like 0, false, no, off (any case) will disable the version line.
- A shared parser in the frontend ensures consistent handling across routes.

Supported exports (current):
- Open Invoices
- General Ledger List
- Journal (journal list)
- Account Ledger (per-account)
 - Transaction Detail by Account
 - Journal Detail (per-entry)
 - Transaction Report
 - Transaction List by Date
 - Transaction List with Splits
 - Invoices
 - Bills
 - Customer Payments
 - Deposits
 - Transactions (Bank)
 - Invoices and Received Payments
 - Invoice List by Date
 - Sales Receipts (list)
 - Expenses (list)
 - Bill Payments (list)
 - Accounts (list)
 - Customers (list)
 - Vendors (list)
 - Terms List
 - Payment Method List
 - Product & Service List
 - Customer Contact List
 - Vendor Contact List
 - Customer Phone List
 - Vendor Phone List
 - Receipts
 - Periods
 - Statement List
 - Customer Statement
 - AR Aging (summary)
 - AP Aging (summary)
 - AR Aging Detail
 - AP Aging Detail
 - Reconciliation Summary
 - Reconciliation Progress by Account

Notes:
- Default behavior remains unchanged (no version line) unless explicitly requested.
- New exports should prefer JSON-first generation and then project to CSV; if adding CSV-Version support, place the version line before the caption.
