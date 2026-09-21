# Inventory Module

**Status:** PARTIALLY COMPLETED (Fixed Asset GL Subledger Integration Verified 2026-09-22)  
**Directory:** `Haypbooks/Backend/src/inventory/`  
**Last Updated:** 2026-09-22 (Task 311)

---

## 1. Overview & Architecture
The Inventory module provides core controllers, services, and data transfer objects for item management, fixed asset depreciation, and asset disposal. It integrates with the shared subledger service to record general ledger transactions.

### Key Files:
- `inventory.module.ts`: NestJS module declaration importing `PrismaModule` and `SubLedgerModule`.
- `inventory.service.ts`: Core business logic for inventory transactions, depreciation runs, and asset disposals.
- `inventory.controller.ts`: HTTP endpoints exposing inventory and asset management APIs.
- `inventory.dto.ts`: Input validation and request payload types.

---

## 2. Fixed Asset Subledger Integration
Fixed asset accounting operations interact directly with `SubLedgerService`:
1. **Asset Depreciation (`postAssetDepreciationToGL`):**
   - Invoked during `runDepreciation()`.
   - Passes `companyId`, `workspaceId`, `depreciationId`, `amount`, `date`, and `postedById`.
   - GL account links (`depreciationExpenseAccountId`, `accumulatedDepreciationId`) are retrieved internally by `SubLedgerService` from the asset relation attached to the depreciation record.
2. **Asset Disposal (`postAssetDisposalToGL`):**
   - Invoked during `disposeFixedAsset()`.
   - Passes `companyId`, `workspaceId`, `disposalId`, `cost`, `accumulated`, `proceeds`, `date`, and `postedById`.
   - GL account links (`assetAccountId`, `accumulatedDepreciationId`) and gain/loss accounts are resolved internally by `SubLedgerService`.

---

## 3. Verification & Invariants
- TypeScript compilation passes with exit code 0 (`npx tsc --noEmit`).
- Transactional safety: All GL posting operations execute inside `this.prisma.$transaction` blocks to ensure atomic rollbacks if journal entry creation fails.
