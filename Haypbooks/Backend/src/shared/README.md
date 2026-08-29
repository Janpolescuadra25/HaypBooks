# Shared Module — Cross-Cutting Infrastructure & Posting Engine

`Backend/src/shared` holds two categories of code the rest of the backend depends on:

1. **Request-scoped infrastructure** — async context propagation, company-context middleware, and the app-wide throttler guard.
2. **The centralized posting engine** — `SubLedgerService` and the `gl-integration` helpers through which the sub-ledgers (AR, AP, expenses, banking) create, post, and reverse journal entries.

There is no `shared.module.ts`; this directory is not a NestJS module. Feature modules (`ar`, `ap`, `expenses`, `banking`) provide `SubLedgerService` directly in their own `providers` arrays, and the request-infra pieces (`AppThrottlerGuard`, `CompanyContextMiddleware`) are wired globally in `app.module.ts`.

## File Map

| File | Role |
|------|------|
| `sub-ledger.service.ts` | `SubLedgerService` — the centralized posting/reversal engine: journal-entry creation (`POSTED` status), per-line account-balance updates by normal side, entry numbering, period/lock enforcement, and the posting/reversal methods for AR, AP, expense, banking, deposit, refund, credit-note, mileage, and per-diem flows. |
| `gl-integration.ts` | Functional GL helpers: `SYSTEM_ACCOUNTS` (10 reserved account codes), `resolveAccount` (find-or-create a system account), `createAndPostJE` (create a balanced journal entry and post it), `createReversingJE` (mirror an entry and void the original). |
| `async-context.ts` | `AsyncLocalStorage`-based `RequestContext` (`companyId`, `workspaceId`, `userId`) with `runWithContext` / `getRequestContext` / `setRequestContext` and getter helpers, so deep code reads request context without parameter threading. |
| `company-context.middleware.ts` | Express middleware that extracts `companyId` (params/body/query), `workspaceId`, and `userId` from the incoming request and opens the async context for the rest of the call. |
| `app-throttler.guard.ts` | `ThrottlerGuard` subclass whose tracker key is the request's email (when present) instead of IP alone — avoids shared-IP rate-limit flakiness (e.g., local E2E runs). |

## Architecture

Feature modules never write `journalEntry` / `journalLine` / `account.balance` directly. They call `SubLedgerService` (or the `gl-integration` helpers) inside a Prisma transaction, and the posting engine enforces the double-entry invariants once, centrally.

- **`SubLedgerService` consumers:** `ar`, `ap`, `expenses`, `banking` modules (each lists it in `providers`).
- **`gl-integration` consumers:** `sub-ledger.service.ts`, `banking.service.ts`, `banking.repository.ts`, `accounting.service.ts`, `accounting.repository.ts`, `ar.repository.ts`, `ap.repository.ts`.

## Behavioral Contracts

### 1. Unbalanced entries fail fast — never silently skipped
`createPostedJE` validates `|Σ debits − Σ credits| > 0.005` and **throws** instead of posting. (An earlier version logged a warning and returned `null`, silently skipping unbalanced entries; the fail-fast behavior replaced it — see `__tests__/shared/sub-ledger-imbalance.spec.ts`.)

### 2. Closed/locked periods and posting locks reject postings
`assertPeriodOpen(companyId, date, tx)` throws `BadRequestException` when the date falls inside an `AccountingPeriod` with status `CLOSED` or `LOCKED`, or when an active `PostingLock` covers that date for that company. Every posting and reversal path calls it.

### 3. Reversals keep the original entry's date
`createReversingJE(tx, companyId, originalJeId, reason, date?)` defaults the reversal date to the **original entry's date** (pass `date` to override), mirrors every line (debit ↔ credit), marks the original `VOIDED`, and refuses to reverse an entry that is already `VOIDED`.

### 4. System accounts auto-create on demand
`resolveAccount` looks up a `SYSTEM_ACCOUNTS` code for the company and creates the account (`isSystem: true`) when missing. `SYSTEM_ACCOUNTS` reserves 10 codes: 1010 Cash on Hand, 1100 Accounts Receivable, 1170 Undeposited Funds, 2010 Accounts Payable, 2020 Accrued Expenses, 3030 Retained Earnings, 3050 Opening Balance Equity, 3200 Income Summary, 4010 Sales Revenue, 6010 Salaries and Wages.

## Decisions & Rationale

- **Centralized posting engine.** Double-entry invariants (balance, period openness, reversal dating, balance maintenance) live in one place, so sub-ledgers inherit them and cannot drift.
- **Two imbalance tolerances.** `createPostedJE` (SubLedgerService) uses `0.005`; `createAndPostJE` (gl-integration) uses `0.001` and throws a plain `Error`. Both are cent-level guards against floating-point noise, not business limits.
- **Reversals date to the original entry's date** so a mistake posted in a closed period is corrected inside that same period rather than leaking into the current one.
- **Posting is immediate.** Entries are created with `postingStatus: 'POSTED'`; there is no draft step in the sub-ledger flow — corrections happen via reversal, never by editing a posted entry.
- **Account balances update on posting.** `createPostedJE` increments each line's account balance according to `normalSide` (DEBIT → debit − credit; CREDIT → credit − debit).

## Usage Examples

Post a balanced entry via the low-level helper (as banking does):

```ts
await prisma.$transaction(async (tx) => {
  const cash = await resolveAccount(tx, companyId, SYSTEM_ACCOUNTS.CASH)
  const undeposited = await resolveAccount(tx, companyId, SYSTEM_ACCOUNTS.UNDEPOSITED_FUNDS)
  await createAndPostJE(tx, {
    workspaceId,
    companyId,
    date: new Date(),
    description: 'Record deposit',
    lines: [
      { accountId: cash.id, debit: 1000, credit: 0 },
      { accountId: undeposited.id, debit: 0, credit: 1000 },
    ],
  })
})
```

Reverse an entry (original date preserved by default):

```ts
await prisma.$transaction(async (tx) => {
  await createReversingJE(tx, companyId, originalJeId, 'Corrective reversal')
})
```

Feature modules normally call `SubLedgerService` methods (invoice posting, payment receipt, bill posting, expense-claim posting, and their `*Reversal` variants) rather than these primitives directly. All posting methods take an optional caller transaction so callers can compose larger units of work.

## Testing

Targeted unit specs (run from `Haypbooks/Backend`):

- `src/__tests__/shared/sub-ledger-reversal.spec.ts` — reversal behavior (mirrored lines, original-date default, VOIDED rejection).
- `src/__tests__/shared/sub-ledger-imbalance.spec.ts` — fail-fast on unbalanced entries.

Run: `npm run test:unit -- src/__tests__/shared`

Note: the full unit-suite baseline does not currently complete in this environment (tracked as technical debt in the roadmap); these targeted specs plus `tsc --noEmit` are the evidence standard for changes to this module.

## Known Limitations

- `nextEntryNumber` uses a read-then-increment pattern (`PREFIX-000001`) without a DB uniqueness constraint; concurrent postings to the same company can race on entry numbers.
- Posting methods expect a caller-provided transaction — correct isolation is the caller's responsibility.
- Remaining ledger-integrity gaps are tracked in the roadmap's P1 Accounting & Ledger Integrity workstream (`docs/Road_Map/Road_Map.md`).
