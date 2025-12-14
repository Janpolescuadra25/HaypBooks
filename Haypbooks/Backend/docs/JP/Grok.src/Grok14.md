Issue,Recommendation,Priority
Task model exists but no navigation/permission integration yet,Add permission like tasks:read/write and link to sidebar,Medium
Implemented: Added `tasks:read` and `tasks:write` permissions to seed and assigned to `ADMIN`. Added `deletedAt` soft-delete on `Task` and a GIN FTS index on `description` (migration added). Consider adding sidebar link in frontend next.,Medium
"Some fields use String for IDs but default to uuid() — good, but ensure all are consistent",Already good (cuid() or uuid()),Low
relatedType / relatedId on Task is polymorphic — works but can be slow,"Consider separate relations (taskOnInvoice, taskOnProject) if tasks grow large",Low (future)
No soft-delete on most transactional tables,Add deletedAt if you want recycle bin,Low
No full-text search index on descriptions/names,Add @db.Text + GIN index if needed later,Low
JournalEntry.entryNumber is optional + unique — risky if nulls allowed,Make required or use sequence,Medium