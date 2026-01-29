📸 Snap Receipt (Camera Capture) — Implementation Overview

Goal: Provide a lightweight way to capture a paper receipt image and seed a receipt record in the transaction hub. Brand‑neutral, minimal dependencies.

Current UI Controls
1. Snap button: Opens a true camera modal with live preview → capture → retake/use. After Use Photo, the system shows an inline “Scanning…” status and then “Scanned. Next: Match → Post → Convert to Expense.”
2. Upload button: Standard file picker for existing images (scans, forwarded emails, etc.).

Lifecycle After Capture
uploaded → parsed → matched → posted → (optional) converted-to-expense.

Data Fields Seeded on Upload/Snap
- id: Random short id.
- date: Today (ISO yyyy-mm-dd) unless provided.
- vendor: Derived from filename stem (e.g. coffee.jpg → coffee).
- amount: 0 at creation; deterministic OCR derives amount during parse.
- attachment: { name, size } only (no binary persistence in this mock).
- method: 'upload' or 'capture' (Snap sets method='capture').
- status: 'uploaded'.
- expenseAccountNumber: Defaults to '6000'.

Parsing (Simulated)
After creation, both Upload and Snap auto-parse. `POST /api/receipts/{id}/parse` sets status=parsed and records a deterministic OCR stub (ocrExtract) by reading hints from the file name (vendor/date) and computing a stable amount from the filename. A lightweight heuristic also sets a `suggestedMatchTransactionId` when exactly one high-confidence candidate exists (amount tolerance and vendor-prefix check). An inline banner offers “Accept suggestion.”

Matching
POST /api/receipts/{id}/match links a receipt to a transaction id (bank feed or expense). Status moves to matched. When a single high-confidence suggestion exists, an Accept suggestion button is shown to post this action directly.

Posting
POST /api/receipts/{id}/post creates a journal entry: DR 6000 Operating Expenses / CR 1000 Cash for the amount. Status moves to posted and postedJournalId is stored.

Convert to Expense (Optional)
POST /api/receipts/{id}/expense creates an expenseId and optionally posts a reclass journal if the selected expense account differs from 6000. An inline account picker appears after posting and loads expense-type accounts. The UI shows a subtle lifecycle strip (Capture → Scan → Match → Post → Expense) and a “Scanned” badge when parsed.

RBAC Summary
- List / export: reports:read permission.
- Mutations (upload, parse, match, post, convert, delete): journal:write permission.
Deletion is blocked once status=posted.

Audit & Trace (Future Enhancements)
- Each mutation could log an event (pattern used in sales receipts) for an audit trail.
- Attachments list would hold name, size, contentType, and checksum when binary support added.

Future Enhancements Roadmap
1. Add client-side image compression + size guard (e.g. < 10 MB).
2. Content hash-based duplicate detection and optional client-side image compression.
3. Multi-page (merged PDF) capture support.
4. Drag-and-drop zone in desktop UI.
5. Background parsing queue (simulate latency & progress indicator).
6. Add a simple UI test covering Snap → Parse → Match (accept suggestion) → Post flow.
7. Add events log integration for each lifecycle transition.

Email Ingest (New)
- POST /api/receipts/email simulates an inbound emailed receipt: provide fileName, subject, optional size/date/amount hints; it seeds an uploaded receipt with method='email'.

Testing Notes
- receipts.convert.expense.test.ts validates convert logic (no reclass when account=6000; reclass when different).
- Additional smoke tests recommended: snap/upload insert, parse transition, post journal linking.

Filename & Export Alignment
CSV export for receipts delegates to JSON list, ensuring the Snap-captured receipt appears uniformly; filenames use standardized tokens (module + date or period) consistent with other exports.

Security & Privacy Considerations (Future)
- Image content not persisted; when enabled, ensure access control mirrors receipt record permissions.
- Sanitize and strip EXIF geo/location data before storage (privacy best practice).

Design Principles
- JSON-first backend routes.
- Progressive enhancement: camera capture when available, fallback otherwise.
- Minimal coupling: Snap flow reuses existing POST /api/receipts; later can branch if richer capture metadata needed.

Open Questions
- Should we auto-apply match automatically when confidence is 100%, or keep the “Accept suggestion” confirm?
- Retain original image vs normalized (cropped, deskewed) derivative? (Not implemented.)

Status: Implemented camera modal with auto-parse (for both Upload and Snap), deterministic OCR stub, suggested match banner, lifecycle strip, duplicate guard, and brand-neutral wording.
Match Modal & Suggestions
- A dedicated "Match…" modal fetches `GET /api/receipts/:id/suggestions` (ranked invoices/bills) and allows applying a candidate or entering an id manually.
- Suggestions require read permission; applying a match requires write permission. This maintains audit integrity while accelerating classification.
