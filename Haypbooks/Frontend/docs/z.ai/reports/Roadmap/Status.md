# Roadmap Status

## ✅ Chart of Accounts (COA) - Validation Enhancements

- [x] Implemented **account code range validation** based on account type:
  - Asset: 1000–1999
  - Liability: 2000–2999
  - Equity: 3000–3999
  - Revenue: 4000–4999
  - Expense: 5000–5999
- [x] Enforced **parent-child type inheritance** (child type locked to parent type when a parent is selected).
- [x] Prevented selecting a parent that would create a circular relationship (child cannot become its own ancestor).
- [x] Added unit tests for both code range validation and parent-type locking.
- [x] Added backend enforcement to prevent deactivating parent accounts that have active children.
- [x] Added backend enforcement to prevent changing account type when the account has a non-zero balance.
- [x] Verified `npm test` passes for COA-related tests (frontend + backend).

---

## Next Recommended COA Enhancements (Future Work)

- Add backend enforcement for account code range validation (type-to-range mapping)
- Improve backend validation for parent/child activation rules (e.g. prevent re-activating parents with inactive children)
- Seed COA based on selected industry template (e.g., Retail, SaaS, Construction) via a template manager
- Add an admin UI to view/edit COA templates and persist them to disk (JSON-based template store)
- Persist company currency (from onboarding) and use it when seeding accounts + formatting
- Add COA UI/UX improvements: better error messaging and guided correction flows
- Add automated regression tests for COA import/export and reconciliation scenarios
