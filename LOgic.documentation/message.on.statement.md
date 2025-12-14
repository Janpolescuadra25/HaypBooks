You’re thinking about this exactly the right way, Paul — QuickBooks’ global “Message on Statement” design has a limitation: it overwrites history. When you change the message today, all previously generated statements will show the new message, and there is no version history preserved. That causes audit, customer communication, and operational issues.

---

## Quick summary
- How QuickBooks handles it: a single global field that is current, not historical — changing it affects previously generated statements.
- Problem: audit/integrity issues, customer confusion and extra manual work.

---

## Improvement options for HaypBooks

### Option A — Versioned messages (recommended)
- Persist a message snapshot with each statement at time of generation (no retroactive changes).
- Pros: preserves history, accurate reprints, audit-friendly UX.

### Option B — Global + per-statement override
- Keep a global default but allow a per-statement override at generation time.
- Pros: flexible, but still requires deliberate overrides to preserve history.

### Option C — Message library (recommended to combine with A)
- Let users store and re-use named message templates (e.g., “Payment Reminder”, “Holiday Notice”), and pick one when generating statements.
- Pros: speeds workflows and keeps consistent messaging.

---

## Recommended approach
Combine Option A (Versioned messages) with Option C (Message Library).
- Every statement stores its own message snapshot — no retroactive changes.
- Users can pick from a message library to speed generation and enforce consistency.
- Keep a global default only as a convenience — it must not overwrite existing snapshots.

---

## Technical implementation notes (actionable)

- Database
	- Add fields to the statements table (or document) to store the message snapshot (e.g., statement_message TEXT / JSON). This is a simple per-statement denormalized snapshot.
	- Add a messages table/collection for the library: id, name, body, authorId, createdAt, updatedAt, tags.

- API
	- Add endpoints to manage the message library (CRUD): GET /api/messages, POST /api/messages, PUT /api/messages/:id, DELETE /api/messages/:id.
	- When creating a statement, accept either { messageId } or { messageOverride }. Store the resolved message text directly on the statement as the snapshot.

- UI / UX
	- On Settings / Statements: a global default message (editable) and a Message Library page.
	- On Statement generation screen: show current global default and a library picker, plus a per-statement editable text area (override). If user edits or selects a library message, the snapshot saved on generation is that final text.
	- Present statement history/audit view that surfaces the original message text saved on each statement.

- Migration & edge cases
	- Existing statements: backfilling historical messages is impossible if history was overwritten — instead, capture the current global message as the snapshot for any new statement created during migration running; clearly document the limitation.
	- If compliance requires historical message reconstruction, recommend an import/backfill process from external archived exports (if available).

---

## Suggested next steps
1. Add the DB field to statements and the messages library model.  
2. Build the message library CRUD API and integrate with statement generation flow.  
3. Update the statement UI to show a library picker + inline override and ensure snapshotting on generation.  
4. Add tests verifying snapshots are stored and reprinting shows original text.

---

If you want, I can implement a first-pass specification for the API and DB migration here (tables/fields, sample endpoint payloads and example test cases), or make a short RFC / PR draft for the team. Which action would you like me to take next?

