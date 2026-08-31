# Fixed Asset Depreciation and Disposal GL Posting

This feature documents the new fixed asset depreciation and disposal posting flow.

## What it does
- When a fixed asset depreciation record is created, the system now posts a corresponding `JournalEntry`.
- When a fixed asset is disposed, the system now posts a disposal `JournalEntry`.
- Both records are linked to their posted entries through `journalEntryId` and record `postingStatus = POSTED`.

## Accounting impact
- Depreciation posting:
  - Debit: `Depreciation Expense`
  - Credit: `Accumulated Depreciation`
- Disposal posting:
  - Debit: `Accumulated Depreciation`
  - Debit: `Cash` (if proceeds are received)
  - Credit: `Fixed Asset` (carrying amount)
  - Credit: `Gain on Sale of Assets` or Debit: `Loss on Sale of Assets`

## Implementation details
- The service methods are `SubLedgerService.postAssetDepreciationToGL()` and `SubLedgerService.postAssetDisposalToGL()`.
- Both methods validate GL account linkage on the related fixed asset before posting.
- Both methods persist `journalEntryId` and `postingStatus` on the source record.
- They use `createPostedJE()` to ensure entries are balanced and posted atomically.

## Audit traceability
- `FixedAssetDepreciation` and `AssetDisposal` now expose `journalEntryId` on the record.
- This supports audit queries that reconcile asset-related transactions to the general ledger.

## Limitations

- This feature assumes fixed assets already have valid depreciation and disposal account mappings; missing GL account configuration may prevent posting.
- Disposal postings do not currently include separate FX revaluation treatment for multi-currency asset dispositions.
- Posted depreciation and disposal entries are not editable; corrections must be handled through reversals and new correcting entries.
- The current implementation does not yet provide a dedicated fixed asset ledger review UI; it is validated through backend posting service flows.

- **Legacy `createAndPostJE` drops `entryNumber`** — the legacy path accepts an `entryNumber` argument but omits it from the `journalEntry.create` payload, so posted entries from that path carry no explicit entry number. Reported, not yet fixed; tracked as a P1 item in `Road_Map.md`.
- **Entry-number race window (verify-then-write)** — entry numbers are assigned by a read-then-write sequence; the payroll/fixed-asset posting methods scope number assignment inside the Prisma transaction, but the legacy window remains open for other callers until numbering is unified (e.g., `DocumentSequence.upsert()`).
- **`createPostedJE` signature extended additively** — `transactionSource` and `sourceReferenceId` were added to support sub-ledger linkage; existing callers are unaffected.
- **Out-of-band migration reconciliation** — migration `20260830160000_add_journal_entry_id_to_payroll_and_fixed_asset_models` was applied out-of-band and recorded with `prisma migrate resolve --applied`; see the migration folder's README.md.
