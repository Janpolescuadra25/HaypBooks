## What problem does this PR solve?

- Add a concise description of what the change does and why.

## DB/Schema Checklist

- [ ] I ran `npm run ci:db-ship-check` locally and it passed.
- [ ] I verified `lint:db:fail-on-backups` passes (no tenant backup columns reintroduced).
- [ ] I verified `lint:migrations:rls` passes and no RLS policies reference old backup columns.
- [ ] If this PR contains new migrations, I've included an explanation and a plan to apply them in production.

## Code Checklist

- [ ] I added tests to cover changes where appropriate.
- [ ] I ran `npm run test` (or the targeted test suite) locally.
- [ ] I ran `npm run typecheck` in both Backend and Frontend where applicable.

## Notes for reviewers

- Include any special instructions reviewers should follow while reviewing this change, e.g. run particular scripts or look at specific areas.

