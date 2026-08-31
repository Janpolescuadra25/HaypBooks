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
