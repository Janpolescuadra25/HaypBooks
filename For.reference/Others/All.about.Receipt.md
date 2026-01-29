🔎 Brand‑Neutral Receipt Handling Overview

Receipts go through a structured lifecycle designed to reduce manual entry, prevent duplicates, and maintain a durable audit trail.

**Input Methods**
- Upload from local or cloud storage (e.g. shared drives).
- Forward via a unique ingestion email address (when enabled).
- Capture photos using a mobile app or device camera.

**Automated Data Extraction**
- OCR extracts vendor, transaction date, total amount, and payment method.
- Normalization trims whitespace, standardizes date format (YYYY-MM-DD), and validates positive numeric totals.
- Deterministic OCR (mock): when parsing, the system derives a stable amount from the filename and infers vendor/date tokens. This removes randomness for tests while preserving brand-neutral logic.

**Matching & Classification**
- System attempts to match a receipt to an existing bank feed transaction using amount and date proximity.
- If matched, link to the existing transaction (no duplicate expense entry).
- If unmatched, optionally create a new expense/bill or hold for manual review.
- Duplicate guard: Implemented. Upload of an attachment with identical `name` and `size` is blocked with a friendly 409 response containing the existing `duplicateOf` id.

**Lifecycle Stages** (as implemented in the current mock):
1. Uploaded – raw file and minimal metadata.
2. Parsed – OCR applied automatically after both Capture and Upload; core fields populated using deterministic OCR.
3. Matched – associated with a bank feed or internal transaction id.
4. Posted – journal created (DR expense / CR cash) and deletion guard enforced.
5. Converted (optional) – attaches an `expenseId` and, when a different expense account is selected, posts a reclass journal (DR new account / CR original expense account).

**Inline Edit & Hints**
- Vendor, date, and amount can be edited while status is Uploaded or Parsed using an inline editor; edits are blocked once Matched or Posted to preserve audit integrity.
- A "Detected: <vendor>" badge appears when OCR vendor differs from the current vendor, encouraging quick correction before matching.
- Next-step hint text (e.g., "Next: Match", "Next: Post") guides the user through the lifecycle.

**Suggested Match Banner**
- During parsing, a lightweight heuristic attempts to identify exactly one candidate (open invoice or bill) by matching amount (±0.01) and vendor prefix.
- When found, a banner displays a suggested transaction id with an "Accept suggestion" button; acceptance transitions the receipt to Matched.

**Suggestions Endpoint & Manual Match Modal**
- Suggestions endpoint (read-only): `GET /api/receipts/:id/suggestions?limit=5` lists likely invoices/bills ranked by amount proximity and date proximity with vendor-prefix filtering.
- Receipts page includes a "Match…" modal that displays suggestions and supports manual id entry; applying a suggestion calls `/api/receipts/:id/match`. RBAC: suggestions require `reports:read`; matching requires `journal:write`.

**Lifecycle Strip UI**
- A compact strip shows progress: Capture → Scan → Match → Post → Expense, highlighting completed steps and the next actionable one.

**Update Endpoint**
- `POST /api/receipts/:id/update` allows edits (vendor/date/amount) only while status is Uploaded or Parsed and requires a write permission. Attempts after Match/Post return a conflict.

**Batch Operations**
- Multi‑file upload supported.
- Bulk categorize, bulk match, and bulk archive actions are roadmap considerations (single‑item operations implemented now).

<!-- Existing content assumed; appending new Linked Match Preview section -->

## Linked Match Preview (Added 2025-11-08)

Once a receipt has been successfully matched to a source record (e.g., a payable or receivable document), users benefit from an inline, read‑only preview rather than needing to navigate away immediately. This preserves workflow focus (continuing to process additional incoming receipts) while still allowing confidence verification of the match.

### Endpoint: GET `/api/receipts/:id/linked`

Returns a normalized summary of the matched target. Delegates internally to existing mock stores for invoices or bills; future expansion could include expenses or journal entries.

Response shape (union — simplified mock contract):
```
{ linked: {
	type: 'invoice' | 'bill',
	id: string,
	number?: string,
	date: string,          // ISO yyyy-mm-dd
	dueDate?: string,      // invoice/bill due logic
	vendorOrCustomer: string,
	status: string,        // existing document status
	amountOriginal: number,
	amountOpen?: number,   // invoices: remaining balance; bills: remaining payable
	lineCount?: number,
	currency?: string
} }
```

Error cases:
- 404 when receipt not found.
- 409 when receipt has no `matchedTransactionId` yet (still unmatched).
- 403 permission denied (requires read capability consistent with underlying document type — follows existing RBAC `reports:read`).

### UI Behavior

When a receipt status is `matched`, a new "View match" action button appears beside the existing lifecycle strip. Clicking opens a non‑blocking modal or popover containing:
1. Header with document type icon (generic income/expense styling) + number.
2. Key fields grid: Date, Due (if present), Status badge, Original Amount, Open Amount (if invoice/bill still open), Lines, Currency.
3. Action row:
	 - "Open full record" (navigates to the standard document detail route in a new tab to preserve current receipt processing context).
	 - Close button.

No edit actions are surfaced here to maintain lifecycle integrity; modifications occur through the canonical document screen.

### Rationale
Providing a quick preview mirrors established accounting UX norms: users frequently ingest a batch of receipts and want lightweight verification their matches are correct before posting or converting. A preview reduces context switching and accidental navigations while retaining transparency.

### Future Enhancements (Planned)
- Include payment / applied credit summary for invoices (e.g., paid percent, last payment date).
- For bills, show already entered payments or upcoming scheduled payment date once payables scheduling is added.
- Add mismatch flagging (user can mark "Does not look right" to clear match and revert to parsed state for re-selection).
- Extend to expenses and journal entries when conversions broaden target set.
- Accessibility: announce preview content via polite aria‑live region on open.

### Documentation Alignment
Flow diagrams and lifecycle sections referencing "Match" will be updated to include the optional preview step. The preview itself is agnostic to underlying document brand terms and uses neutral accounting language (e.g., "Open Amount" vs competitor‑specific phrasing).

### Testing Notes
Add a focused test creating a receipt, matching it to a mock invoice, then calling `/api/receipts/:id/linked` asserting union shape fields and 409 on an unmatched receipt. UI test should simulate clicking "View match" and verifying modal content without navigation.

**Audit & Compliance**
		- Each lifecycle transition records an event (actor, timestamp, before/after core fields).
		- Linked receipts remain searchable by vendor, date range, amount, and status without exposing brand terms.
- Digital storage supports typical tax/audit substantiation requirements (retain image + parsed metadata).

📊 Example Flow
1. Capture a photo of an office supplies receipt.
2. Parsing extracts vendor “Office Supply Co”, date, and total 42.75.
3. Matching locates a bank transaction with same amount within the tolerance window → link created.
4. Posting creates a journal (DR Operating Expenses 6000 / CR Cash 1000) and locks deletion.
5. Optional conversion selects account 6010 (Office Supplies) → reclass journal posts DR 6010 / CR 6000.

**UX Notices**
- After posting, a success notice appears with guidance (e.g., review journal link or convert to expense).
- After converting, a success notice confirms the new expense link.

✅ Benefits
- Time savings: Removes most manual data keying.
- Accuracy: Consistent mapping of expense accounts and prevention of double posting.
- Organization: Unified searchable repository of receipt images + normalized fields.
- Audit readiness: Each posted receipt ties to a journal and retains source artifact.
- Extensibility: Reclass logic and account picker enable granular expense tracking without modifying the original source journal.

🔧 Future Enhancements (Not yet implemented)
- Hash-based duplicate detection (upgrade from filename+size heuristic).
- Bulk reclass wizard for multiple posted receipts.
- Confidence scoring on OCR fields with inline correction UI.
- Automated currency normalization for multi-currency receipts.

This document intentionally avoids third‑party brand references to maintain a neutral internal knowledge base while reflecting commonly accepted accounting patterns.

