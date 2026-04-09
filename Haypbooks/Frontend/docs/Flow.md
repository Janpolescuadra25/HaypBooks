# Credits: auto-apply workflow (A/R and A/P)

This documents the customer credits auto-apply behavior to keep A/R clean while preserving period controls and CSV parity. Terms are brand-agnostic and align with our JSON-first policy.

## Contracts
- A/R
	- Input: POST /api/customers/:id/credits/auto-apply
	- Auth: invoices:write required
	- Behavior: Non-posting allocation of existing credit memos to open invoices for the same customer
	- Ordering: Oldest due invoices first (fallback to invoice date), then invoice number; credits consumed oldest-first by credit memo date then number
	- Output: { ok: number, results: ARAllocation[], invoices: MinimalInvoice[], nonPosting: true }
- A/P
	- Input: POST /api/vendors/:id/credits/auto-apply
	- Auth: bills:write required
	- Behavior: Non-posting allocation of vendor credits to open bills for the same vendor
	- Ordering: Oldest due bills first (fallback to bill date), then bill number; vendor credits consumed oldest-first by date then number
	- Output: { ok: number, results: APAllocation[], bills: MinimalBill[], nonPosting: true }

## Policies
- Non-posting: Allocations adjust remaining credit and invoice balances without creating new journal entries
- As-of: Aging treats applied credit as-of the credit memo’s original date; this preserves historical bucket placement
- Period controls: Closed-period enforcement applies to postings; non-posting allocations remain allowed across periods
- RBAC: Server-side checks enforce invoices:write for credit application operations (manual and auto)
- CSV parity: CSV exports derive from JSON and continue to omit CSV-Version by default unless explicitly opted-in

## UI Notes
- Provide a brief hint near the action explaining that allocations are non-posting and respect the credit memo date for as-of reporting
- Keep wording brand-agnostic (e.g., “Auto-apply credits”); avoid vendor names
- If no open invoices or no available credits, show a neutral confirmation indicating no allocations were made
 - Mirror the A/R affordance on A/P vendor pages for vendor credits to bills

## Error modes
- 403 Forbidden when the user lacks invoices:write
- 404 Not Found when the customer does not exist
- 200 OK with ok=0 when no allocations occur (e.g., no open invoices or no available credits)
 - For A/P: 403 Forbidden when the user lacks bills:write; 404 Not Found when the vendor does not exist

## Adjacent improvements
- Done: dry-run option supported via { dryRun: true } returning a proposed allocation plan without applying changes
- Add per-allocation caps (e.g., leave $N unapplied) when needed for partial application flows
- Done: audit events include a summary entry for auto-apply operations (entity customer/vendor, action ar:auto-apply-credits or ap:auto-apply-credits, meta { allocations, totalApplied })