This migration records the out-of-band schema patch that added journalEntryId and postingStatus support for PayrollRun, FixedAssetDepreciation, and AssetDisposal.

It is intentionally scoped to only those tables and does not recreate or alter existing enum definitions.
