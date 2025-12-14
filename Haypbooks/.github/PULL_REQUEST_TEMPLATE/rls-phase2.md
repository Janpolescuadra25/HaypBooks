## DB RLS Phase 2 rollout

Checklist for the reviewer and CI:

- [ ] CI job `RLS PR Check` runs and passes (recreates test DB, applies indexes, runs Phase2 RLS, runs RLS tests)
- [ ] `scripts/ci/verify-rls-phase2.js` passes in CI (ensures Phase 2 candidates have RLS)
- [ ] Review the list of Phase 2 candidate tables in `scripts/db/list-rls-candidates.js` and confirm scope
- [ ] Confirm `prisma/MIGRATION_NOTES.md` and `prisma/DB_RLS_ROLLOUT.md` clearly outline rollback and bypass guidance
- [ ] Ensure documentation and rollout plan approved by DB/ops

Notes:
- All scripts are idempotent and safe to re-run.
- If a table cannot be converted safely, remove it from Phase 2 candidate list and rerun the verification CI job.
