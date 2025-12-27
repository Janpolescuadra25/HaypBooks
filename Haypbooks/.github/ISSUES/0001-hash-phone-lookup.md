Title: Consider hashed/HMAC phone lookup to reduce PII exposure

Summary
-------
We currently store normalized phone numbers (E.164) on the `users.phone` column and use direct lookup for phone-based verification flows. To reduce exposure of raw phone PII in backups, logs, and query surfaces, propose adding a hashed (HMAC) phone lookup field that can be safely indexed and used for lookups without storing plaintext phone values.

Proposal
--------
- Add `phone_hmac` text column to `users` (nullable) and index it.
- Use a server-side HMAC (e.g., HMAC-SHA256) with a rotating secret stored in env (HMAC_KEY). Compute HMAC over normalized E.164 phone (e.g., `hmac = HMAC(secret, phone)`), store it in `phone_hmac` alongside the existing `phone` for a transitional period.
- Update user lookup functions (`findByPhone`) to compute HMAC of provided phone and query `phone_hmac`. Optionally keep `findByPhone` fallback to `phone` where absent.
- Provide a migration and backfill script to populate `phone_hmac` from existing normalized `phone` column.
- Update tests and docs describing privacy benefits. Consider deleting `phone` after sufficient adoption and legal review.

Acceptance Criteria
-------------------
- Add migration that creates `phone_hmac` column and index.
- Implement HMAC utility and integrate into signup, phone verification, and user repository methods.
- Update tests (unit + e2e) to cover HMAC-backed phone lookups.
- Document the approach and the env var requirements and rotation plan.

Risks / Notes
-------------
- HMAC secret rotation requires a plan to re-hash or maintain an alternate index.
- Legal/Privacy team review recommended before removing plaintext phone values.

Next steps
----------
1. Create an issue with this proposal and label `privacy` / `enhancement`.
2. If approved, implement as a follow-up PR with migration, code, tests and docs.
