Posting flow (app-level) — design & checklist

Purpose
- Ensure posted JournalEntries update GL balances atomically, idempotently, and auditably.
- Avoid triggers when possible; prefer an application-controlled transaction that is easier to test and observe.

High-level approach (recommended)
1. Validation Phase (read-only)
   - Validate: journal lines exist and exactly balance (sum(debit) == sum(credit)).
   - Validate: posting date falls within OPEN period.
   - Validate: journal not already POSTED.

2. Posting Transaction (single DB transaction)
   - Begin transaction
   - Re-fetch the JournalEntry (FOR UPDATE) and check postingStatus is still DRAFT.
   - Re-validate balance and other invariants.
   - Update JournalEntry.postingStatus -> POSTED, postedAt = now(), postedBy = userId
   - For each JournalEntryLine:
     - SELECT Account row FOR UPDATE (or use optimistic update with check)
     - Compute delta = debit - credit
     - UPDATE Account set balance = balance + delta
     - Upsert (INSERT ... ON CONFLICT) into AccountBalance (companyId, accountId, yearMonth) adding delta
     - INSERT into AccountBalanceAudit with old/new balance, referenceId=journalId
   - Commit transaction

3. Post-commit
   - Emit events (webhook/queue) for other systems (tax, AR aging, inventory, cache invalidation)
   - Optionally create DocumentRenderLog or notifications

Idempotency & Safety
- Detect replays: If JournalEntry.postingStatus = POSTED and postedBy=..., treat as success if balances were updated earlier (idempotent path should detect audit rows or check an applied flag). Record `postedBy`, `postedAt`, `postingRunId` to help idempotency.
- Use `postingRunId` or `postingBatchId` to make repeated posting attempts idempotent.
- For concurrency, acquire account rows via `SELECT ... FOR UPDATE` within the posting transaction. This ensures correct balance updates under concurrency.

Testing
- Unit tests: small balanced journal posts updates balances correctly; unbalanced journals rejected.
- Integration tests: concurrency tests (2 concurrent posts against same account), database failure simulation, idempotent replay test.

Observability
- Log detailed posting events (companyId, journalId, userId, delta per line)
- Add alerts for cases where account balance sign flips unexpectedly (use the view `account_normal_balance_violations`)

Edge cases
- Multi-currency journals: ensure you update both base and foreign balances (see suggested schema extension if using FX)
- Reversals: implement reverse posting (POSTED -> VOIDED) with inverse deltas and audit entries

Notes
- Triggers are possible but can be opaque and harder to maintain for complex posting logic. Prefer application-level posting unless you need guaranteed DB-level invariants that cannot be implemented safely in app code.

Example pseudocode (JS/TypeScript + transactional db):

async function postJournal(journalId, userId) {
  await db.transaction(async (tx) => {
    const journal = await tx.JournalEntry.findUnique({ where: { id: journalId }, lock: true });
    if (journal.postingStatus !== 'DRAFT') throw new Error('Already posted');

    const lines = await tx.JournalEntryLine.findMany({ where: { journalId } });
    if (sum(lines.debit) !== sum(lines.credit)) throw new Error('Unbalanced');

    // apply deltas
    for (const line of lines) {
      const delta = line.debit - line.credit;
      await tx.Account.update({ where: { id: line.accountId }, data: { balance: { increment: delta } } });
      // upsert monthly AccountBalance, and insert AccountBalanceAudit
    }

    await tx.JournalEntry.update({ where: { id: journalId }, data: { postingStatus: 'POSTED', postedAt: new Date(), postedBy: userId } });
  });
}

If you'd like, I can produce a PR with example code for your posting path based on your current app stack (e.g., Node + Prisma) and include tests. 