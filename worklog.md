# Worklog

### Ticket 7 - Wire Searchable Pickers Into Existing Forms (7A-7D) - COMPLETE
- 7A: Wired ProductPickerField into invoice line items and auto-filled description, unit price, and tax rate while preserving free-text edits.
- 7B: Wired InvoicePickerField into Credit Note apply modal with open-invoice filtering and parsed balance preview.
- 7C: Wired BankAccountPickerField into Customer Payments deposit destination flow while keeping Undeposited Funds behavior unchanged.
- 7D: Wired TaxCodePickerField into invoice line-item tax controls with tax-rate auto-fill and line tax feedback.
- Quality gate per sub-ticket: Backend smoke `test/ar-invoice-status-state-machine.smoke.e2e-spec.ts` passed and Frontend `npx tsc --noEmit` passed.
- Commits pushed: af3fe558, 18064c84, 74782890, e6b01b37.
- Follow-up Fix 2: Consolidated invoice create API loading for catalog items and customers into a single concurrent load.
- Follow-up Fix 3: Verified no sales-area TODO/FIXME markers remain for the invoice create flow.
- Follow-up Fix 5: Validated invoice create page against sales Playwright audit tests under `playwright.sales.config.ts`.

### Ticket 6 - Searchable Picker Components (6A-6D) - COMPLETE
- 6A: Shared picker foundation + ProductPickerField (debounced server search)
- 6B: InvoicePickerField + AR invoice search backend support
- 6C: BankAccountPickerField + bank accounts search backend support
- 6D: TaxCodePickerField + tax codes search backend support
- Added barrel export for sales picker components
- Quality gate per sub-ticket: Backend smoke 5/5 passed and Frontend `npx tsc --noEmit` passed
- Commits pushed: 8bf75ea8, 5962ca2f, d6728826, plus 6D commit

### Ticket 5 — Invoice Lifecycle (5A–5E) — COMPLETE
- 5A: Invoice send (status DRAFT→SENT)
- 5B: Invoice duplicate (deep-copy with new number)
- 5C: Invoice void with allocation reversal
- 5D: Credit note creation from invoice
- 5E: Credit note apply to open invoices (openOnly filter, comma-formatted amounts)
- All backend smoke + Playwright E2E tests passing
- All commits pushed to main

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

### Credit Note Amount Formatting Fix
- **Commit**: e06f20a0
- **What**: Changed credit note CREATE amount field from `type="number"` to `type="text"` with `inputMode="decimal"`, added comma formatting on blur and strip-on-input logic in `CreditNotesPage.tsx`
- **Quality Gate**: Backend smoke 5/5 passed, Playwright apply-credit-note 2/2 passed
- **Status**: DONE and pushed
