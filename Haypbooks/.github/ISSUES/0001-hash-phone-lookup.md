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

CI & Rollout
----------
- Add `HMAC_KEY` as a protected secret in CI (GitHub Actions: Repository secret `HMAC_KEY`). Ensure it is scoped only to environments that require it (staging/production). For tests in CI, either: 1) supply the secret in the workflow's env for the test job, or 2) run tests that rely on phone HMAC with a mocked key.
- Backfill: run `npm run db:backfill:phoneHmac` in staging with `HMAC_KEY` set, run smoke checks, then run in production in a maintenance window.
- Migration and client generation: ensure `npx prisma generate` is part of the CI setup after migrations are applied.

Next steps
----------
1. Create an issue with this proposal and label `privacy` / `enhancement`.
2. If approved, implement as a follow-up PR with migration, code, tests and docs.
3. Add `HMAC_KEY` to CI secrets and update workflow steps to inject the secret into the test job.
4. Run backfill in staging and verify before production rollout.
