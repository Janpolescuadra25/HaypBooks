# A/R Parity Checklist

Practical acceptance criteria to keep A/R reports aligned with the accounting reference while preserving test stability and consistent CSV exports.

## Open Invoices

- Scope
  - Includes all unpaid customer invoices and related transactions affecting open balance
  - Default context is as-of (single date) for CSV filename purposes
- Caption
  - "As of <Month D, YYYY>"
- Columns (default)
  - Customer
  - Transaction type
  - Num
  - Term
  - Due date
  - Aging (date or bucket label)
  - Open balance
- Grouping
  - Group by Customer; show transaction rows under each group
  - Include TOTAL row at bottom
- Totals
  - Grand total equals sum of open balances
- CSV filename
  - open-invoices-asof-YYYY-MM-DD.csv (uses buildCsvFilename)
- Print
  - Keep Print button; no separate print routes

## Unpaid Bills

- Scope
  - Includes all unpaid vendor bills and related transactions affecting open balance; within exports, include all unpaid bills within the selected bill-date range (not only overdue)
  - Default context is as-of (single date) for CSV filename purposes
- Caption
  - "As of <Month D, YYYY>"
- Columns (default)
  - Vendor
  - Transaction type
  - Num
  - Term
  - Due date
  - Aging (date or bucket label)
  - Open balance
- Grouping
  - Group by Vendor; show transaction rows under each group
  - Include TOTAL row at bottom
- Totals
  - Grand total equals sum of open balances
- CSV filename
  - unpaid-bills-asof-YYYY-MM-DD.csv (uses buildCsvFilename)
- Print
  - Keep Print button; no separate print routes

## Notes

- If UI shows a date range, keep CSV filename as as-of in these two reports to avoid downstream breakage.
- Use shared helpers: buildCsvFilename and buildCsvCaption to ensure consistent formatting.
- Follow token policy: no extra tokens by default for these two reports.
