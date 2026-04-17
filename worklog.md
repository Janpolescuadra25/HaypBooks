# Worklog

## Ticket 5 - Invoice Lifecycle (Completed)

Status: Completed and pushed.

Deliverables:

1. 5A - Invoice status lifecycle state machine implemented and validated.
   Commit: 13c5d385
2. 5B - Send flow confirmation toast added.
   Commit: ddeb2be2
3. 5C - Invoice duplicate endpoint and frontend duplicate actions added.
   Commit: d9d4288c
4. 5D - Void flow updated to reverse payment allocations and restore unapplied balances.
   Commit: 2fe0658b
5. 5E - Create linked credit note from invoice detail.
   Commit: d78d20e2

Validation notes:

- Focused backend AR lifecycle tests passed after final fixes.
- Focused frontend invoice Playwright suite passed after final fixes.
- Required per-subitem commit and push flow completed for 5A through 5E.

Manual QA:

- Manual browser test of invoice lifecycle is in progress and awaiting user confirmation.

## Ticket 5 Follow-up - Credit Note Apply Flow (Completed)

Status: Completed and pushed.

Issue summary:

- Apply Credit Note modal invoice dropdown was empty because frontend requested status=UNPAID while backend expected concrete invoice statuses.
- Amount to Apply field displayed unformatted values such as 10000.

Deliverables:

1. Backend open-invoice filtering normalization for invoice listing.
   Commit: f60c4b21
2. Apply Credit Note modal invoice loading switched to openOnly query path.
   Commit: f60c4b21
3. Amount to Apply input formatting/parsing update (grouped display, safe numeric submit).
   Commit: f60c4b21
4. Playwright regression test for apply-credit-note invoice visibility and amount formatting.
   Commit: f60c4b21

Validation notes:

- Backend smoke test passed: test/ar-invoice-status-state-machine.smoke.e2e-spec.ts
- Focused Playwright regression passed for credit-note apply modal flow.
