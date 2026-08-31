# Payroll Run Journal Entry Integration

This feature documents the new payroll-to-general-ledger posting flow.

## What it does
- When a payroll run is posted, the system now creates a POSTED `JournalEntry`.
- The payroll run is linked to the posted journal entry through `PayrollRun.journalEntryId`.
- The payroll run also records `postingStatus = POSTED` to distinguish GL-posted runs from draft/submitted-only runs.

## Accounting impact
- Debit: `Salaries and Wages` expense account (gross pay)
- Credit: `Accrued Salaries and Wages` liability account (net pay)
- Credit: `SSS Contributions Payable` or similar payroll deduction liability account for employer deductions when present

## Implementation details
- The service method is `SubLedgerService.postPayrollRunToGL()`.
- It verifies the payroll run exists and is not already posted.
- It aggregates payroll run check amounts and validates totals.
- It runs inside the same Prisma transaction that writes the payroll posting status, ensuring atomicity.
- `createPostedJE()` is used to create a balanced, POSTED journal entry and update account balances.

## Audit traceability
- `PayrollRun` now contains:
  - `journalEntryId` → pointer to the GL journal entry
  - `postingStatus` → indicates whether the run has been posted to the GL
- This supports audit queries for payroll transactions that have been posted to the general ledger.

## Limitations

- This feature depends on payroll runs and payroll checks having valid linked GL accounts; missing or invalid account setup can still prevent posting.
- The current implementation is service-layer only and does not include a dedicated UI review workflow for posted payroll journal entries.
- Journal entries are created as `POSTED` immediately; corrections require reversal journal entries rather than editing a posted entry.
- Very small rounding differences are tolerated up to 0.005, but larger payroll rounding mismatches will still fail the posting.

- **Legacy `createAndPostJE` drops `entryNumber`** — the legacy path accepts an `entryNumber` argument but omits it from the `journalEntry.create` payload, so posted entries from that path carry no explicit entry number. Reported, not yet fixed; tracked as a P1 item in `Road_Map.md`.
- **Entry-number race window (verify-then-write)** — entry numbers are assigned by a read-then-write sequence; the payroll/fixed-asset posting methods scope number assignment inside the Prisma transaction, but the legacy window remains open for other callers until numbering is unified (e.g., `DocumentSequence.upsert()`).
- **`createPostedJE` signature extended additively** — `transactionSource` and `sourceReferenceId` were added to support sub-ledger linkage; existing callers are unaffected.
- **Out-of-band migration reconciliation** — migration `20260830160000_add_journal_entry_id_to_payroll_and_fixed_asset_models` was applied out-of-band and recorded with `prisma migrate resolve --applied`; see the migration folder's README.md.
