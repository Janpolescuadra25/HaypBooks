# Phase 6 — Banking Auto-Match Journal Reference Validation

**STATUS: DONE (IMPLEMENTED & VERIFIED)**
**Date:** 2026-09-27
**Scope:** Banking auto-match journal reference enforcement (Defect E6 resolution), preventing null journal line references on matched bank transactions, and candidate GL line matching.

## 1. Defect E6 Root Cause Analysis
The reconciliation flow previously permitted `matched: true` records to exist without a valid `journalEntryLineId`. In the repository, `matchTransactionToJournalLine()` accepted a missing or empty journal line ID and defaulted it to `null`, and in the service auto-match loop, transactions were marked matched without checking whether a real GL line existed.

That allowed a bank transaction to appear reconciled while remaining disconnected from the internal books, which breaks audit integrity and cash-account linkage.

## 2. Fix
The implementation now enforces the fail-closed rule:

1. Repository-level validation:
   - `matchTransactionToJournalLine()` throws `BadRequestException('Cannot mark a bank transaction as matched without a valid journalEntryLineId')` whenever `journalEntryLineId` is missing, null, or blank.
   - Manual matches that provide a valid journal line continue to proceed normally.

2. Auto-match candidate query:
   - In `autoMatchReconciliation()`, the service queries candidate journal entry lines for the workspace.
   - It matches on transaction amount (`Math.abs(Number(txn.amount)) === line.debit || line.credit`) and on a ±3-day date window relative to the bank transaction date.
   - When a candidate is found, the service calls `matchTransactionToJournalLine()` with the candidate line ID.
   - When no candidate exists, the transaction is left unmatched rather than being falsely marked as matched.

## 3. Validation Rules
- Bank transaction cannot be marked `matched: true` without a valid `journalEntryLineId`.
- Auto-match only links transactions when a valid internal journal entry line exists.
- Manual matches are still allowed when they supply a valid journal line reference.

## 4. Quality Gates
Verified through the targeted backend unit test suite and type-check runs:
- `npx jest src/banking/banking.service.spec.ts --runInBand --config jest.unit.config.js --verbose`
- `npx tsc --noEmit --pretty false`
- Frontend lint and typecheck completed successfully.

## Phase A6 — Banking Auto-Match Scoring & Invariant Hardening

### Multi-Rule Confidence Scoring Hierarchy
In `applySmartRules()`, rules are ranked by match confidence rather than arbitrary array order:
- `EXACT` match: Base score 100
- `STARTS_WITH` match: Base score 80
- `CONTAINS` match: Base score 60
- `Amount Range Specificity`: +15 bonus points if bounded by `amountRangeMin` or `amountRangeMax`
- Tie-breaker: Rule `priority` ascending (lower number = higher precedence)

### Candidate Ranking in Reconciliation Auto-Match
In `autoMatchReconciliation()`, candidate `journalEntryLine` records are scored by:
- Same-day date proximity: +30 points
- Within 1 day: +20 points
- Within 2-3 days: +10 points
- Description/memo keyword alignment: +15 bonus points
- Ties broken by minimum absolute date difference

### Status
- **Status:** DONE & VERIFIED
- **Date:** 2026-10-18
