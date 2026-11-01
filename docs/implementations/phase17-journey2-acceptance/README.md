# Phase 17 Journey 2: Accountant Multi-Entity Lifecycle Acceptance

**Status:** IMPLEMENTED & VERIFIED  
**Target Spec:** `docs/Road_Map/Road_Map.md` — Phase 17 Journey 2  
**Suite Path:** `Haypbooks/Backend/test/acceptance/acceptance-journey2-multi-entity-accountant.e2e-spec.ts`

## 1. Objective
Journey 2 validates the accountant lifecycle across multiple client entities in a shared workspace model:
- accountant membership across multiple workspaces
- cross-company access only within authorized workspace scope
- enforcement of owner-only destructive actions
- balanced double-entry accounting during posting

## 2. Execution
Run this acceptance suite directly from the backend project:

```bash
cd Haypbooks/Backend
npx jest --runTestsByPath test/acceptance/acceptance-journey2-multi-entity-accountant.e2e-spec.ts --runInBand --config jest.acceptance.config.js
```

## 3. Invariants Checked
- Workspace membership is enforced via `WorkspaceUser` records and `CompanyService.getCompanyForUser`.
- A user scoped to one workspace cannot resolve another workspace’s active company without explicit membership.
- Only workspace owners can archive a company record.
- Journal entries remain in double-entry balance (`debit = credit`) for posted ledger tests.
