## Persisted Filter Preferences (Mock Backend)

The mock backend supports persisting user filter preferences for reports and list views. This powers a consistent UX where commonly used filters (period, compare, custom ranges, and tags) are remembered per page.

Key points:

- Storage model: preferences are stored by a string `reportKey` with a simple key/value `filters` object and `updatedAt` timestamp.
- API endpoints: implemented inside the frontend mock layer and accessible via `@/lib/preferences` helpers.
	- `getReportFilters(reportKey)` returns `{ filters: Record<string,string>, updatedAt: string }`.
	- `setReportFilters(reportKey, filters)` updates and returns the same shape.
- Debounced saves: client updates are auto-debounced ~500ms to reduce chatty writes.
- Hydration behavior: the hook will merge URL query params with stored preferences—URL wins when provided, otherwise stored values hydrate the UI and URL.

Report keys in use:

- Period selector: `period:${pathname}` (per page)
- Tag selector: `filters:${pathname}` (per page)
- Standard/custom report filters: `standard:${slug}` or list-specific keys (e.g., `list:invoices`)

Tag filter specifics:

- `src/components/TagSelect.tsx` uses `usePersistedFilterParams` with `reportKey = filters:${pathname}` and a single spec `{ key: 'tag' }`.
- Selecting a tag updates the URL `?tag=...` and persists the value via the mock preferences API.
- When navigating back to a page without `?tag`, the selector hydrates from stored preferences.

Testing:

- Unit tests validate both persistence and hydration flows:
	- `src/__tests__/tag-select-persistence.test.tsx`
	- `src/__tests__/tag-select-hydration.test.tsx`

These tests use a local in-memory stub for preferences and mock the tags endpoint to keep them fast and deterministic.

## Mock Backend Scope (Phase 1)

Objective: Provide stateful in-memory persistence for core entities (Accounts, Transactions, Invoices, Bills) while retaining deterministic report endpoints (will integrate later).

### Included In Phase 1
1. In-memory database (`src/mock/db.ts`) with seed (`seedIfNeeded`).
2. Domain type interfaces (`src/types/domain.ts`).
3. Refactored transactions handlers to read/write store (list/create/update/delete).
4. Deterministic seed: 150 transactions (mirrors prior mock behavior for tests).
5. Account balance recalculation on each mutating transaction change.

### Deferred To Phase 2
1. Integrate invoices & bills handlers with store (currently algorithmic in MSW file).
2. Reports (P&L, Balance Sheet, Trial Balance, Aging) to derive from unified store rather than synthetic data.
3. Double-entry simulation / journal entries.
4. Multi-company isolation.
5. Authentication / role-based authorization.

### Endpoints Impacted (Phase 1)
`GET /api/transactions`, `POST /api/transactions`, `PUT /api/transactions`, `DELETE /api/transactions` now operate on in-memory state.

### Data Consistency Strategy
Balances recalculated after each mutation (acceptable for small mock dataset; optimize later with incremental diff).

### Follow-up Tasks
1. Replace invoices/bills algorithmic responses with store-backed CRUD.
2. Add seed for invoices & bills; ensure payments adjust balances.
3. Unify reporting calculations with account & transaction data.
4. Add jest tests for new transaction CRUD endpoints (create/update/delete effects on list & balances).
5. Feature flag to toggle mock vs real API client.
