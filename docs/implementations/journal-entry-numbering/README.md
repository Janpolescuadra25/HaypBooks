# Journal Entry Numbering Hardening

**STATUS: DONE**
**Date:** 2026-10-18
**Phase:** A7 — company-local journal sequence generation and schema hardening

## Summary
The accounting engine was relying on a schema-wide unique `entryNumber`, which allowed cross-company collisions and made sequence generation non-deterministic across tenants. The fix moves the numbering discipline to a company-local sequence using the existing `DocumentSequence` table.

## Required invariant
Each company must produce a unique `JournalEntry.entryNumber` within that company, while allowing the same number to exist in a different company.

### Schema contract
In `Haypbooks/Backend/prisma/schema.prisma`:
- `JournalEntry.entryNumber` is no longer globally unique.
- The model now enforces `@@unique([companyId, entryNumber])`.
- `DocumentSequence` retains the atomic sequence record used for `JOURNAL_ENTRY` numbering.

## Atomic generation behavior
`Haypbooks/Backend/src/shared/gl-integration.ts` now does this when `data.entryNumber` is not supplied:
1. calls `tx.documentSequence.upsert({ where: { companyId_documentType: { companyId, documentType: 'JOURNAL_ENTRY' } }, ... })`
2. increments `nextNumber` atomically inside the transaction
3. returns a value like `JE-000001`
4. persists `entryNumber` in the `journalEntry.create` call

If a caller explicitly passes an `entryNumber`, it is preserved as-is and no sequence row is generated.

## Why this is safe
- Sequence increments happen inside the same Prisma transaction as the journal entry insert.
- The unique key is scoped to `companyId + entryNumber`, so each tenant can reuse the same number without collision.
- Manual override paths remain supported and do not get silently replaced by a generated value.

## Verification
- Prisma generate: passed
- backend typecheck: passed
- regression suite: `gl-integration-period-lock.spec.ts` passes with the new company-local numbering checks
