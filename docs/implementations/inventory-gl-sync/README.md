# Inventory Stock & General Ledger Atomic Synchronization — Defect E5 Remediation (Phase 5)

## Status
**DONE & VERIFIED** (2026-10-04)

## Overview
This implementation resolves release-blocking P0 Defect E5 (`Haypbooks/Backend/src/inventory/inventory.repository.ts:237-278` and `Haypbooks/Backend/src/inventory/inventory.service.ts:329-422`) by enforcing strict lifecycle separation between `DRAFT` and `POSTED` inventory transactions and guaranteeing atomic General Ledger posting whenever stock levels are mutated.

Completed and verified on 2026-10-04: the final E5 archive keeps `DRAFT` transactions read-only, ensures direct `POSTED` creates call `SubLedgerService.postInventoryTransactionToGL` inside the same Prisma transaction, and records `journalEntryId` plus `POST_TO_GL` audit updates before returning.

## Root Cause Addressed
1. **DRAFT Stock Mutation Prevention**
   - `DRAFT` inventory transactions return early before any `stockLevel` mutation or GL call occurs.
2. **Direct `POSTED` Transaction Stock-GL Desync**
   - Previously, `InventoryRepository.createInventoryTransaction` mutated `stockLevel` quantities without invoking `SubLedgerService.postInventoryTransactionToGL`, linking `journalEntryId`, or recording a `POST_TO_GL` audit log entry.

## Implemented Architecture & Safeguards
1. **`SubLedgerService` Injection in `InventoryRepository`**
   - Imported `Injectable, Optional` from `@nestjs/common` and `SubLedgerService` from `../shared/sub-ledger.service`.
   - Injected `@Optional() private readonly subLedger?: SubLedgerService` as the second constructor parameter on the `@Injectable()` repository.
   - Updated `createInventoryTransaction` to accept `userId?: string` in the payload and as an optional 4th argument.
   - Inside the single Prisma `$transaction`, `POSTED` records now atomically mutate stock, guard against double posting via `if ((txn as any).journalEntryId) return txn`, call `this.subLedger.postInventoryTransactionToGL(...)`, fail closed on a missing JE ID, update `journalEntryId`, and write the `POST_TO_GL` audit log.
2. **Authenticated User Propagation**
   - `InventoryService.createTransaction` passes the authenticated `userId` both as `data.userId` and as the 4th method argument to `InventoryRepository.createInventoryTransaction`.
3. **Unit Test Coverage**
   - The repository test suite verifies `DRAFT` non-mutation, `POSTED` stock mutation, direct `POSTED` GL synchronization, optional `SubLedgerService` compatibility, and duplicate post rejection.

## Related Documentation
- [Subscription onboarding implementation](../subscription-onboarding/README.md)
- [Billing trial alignment implementation](../billing-trial-alignment/README.md)
- [Module inventory](../module-inventory/README.md)
