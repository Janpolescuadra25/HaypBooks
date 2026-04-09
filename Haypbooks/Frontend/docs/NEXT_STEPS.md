# NEXT_STEPS

A concise forward roadmap consolidating remaining gaps, quality initiatives, and strategic extensions for HaypBooks frontend + mock backend.

---
## 1. Current Core Coverage (Implemented)
- Double-entry journal foundation with adjusting & reversing entries
- Period close & reopen (with audit trail)
- Dynamic Trial Balance (unadjusted vs adjusted) + CSV export
- AR/AP Aging (detail & summary)
- Profit & Loss, Balance Sheet, Cash Flow (baseline)
- Invoice & Bill lifecycles with payments (accrual & cash modes)
- Void workflows (invoice/bill) with optional reversing journals
- Audit trail skeleton capturing CRUD, payments, closing, adjustments, voids
- Test utilities (act helpers, async flushing) and broad report coverage
- Centralized ledger integrity helper `assertBalanced` integrated across invoice, bill, void, journal diagnostics & stress tests

## 2. Identified Gaps / Enhancements (Prioritized)
| Priority | Area | Gap | Proposed Action |
|----------|------|-----|-----------------|
| P0 | Data Integrity | (DONE) Double-entry balance assertion integrated | Enforce continued usage in any new mutation tests |
| P0 | Audit | (DONE) Filtering & pagination added | Build UI table controls (filters, cursor pagination) |
| P0 | Security | (DONE) RBAC scaffold & audit gating | Extend to per-action UI enable/disable & settings close-period guard |
| P1 | Journals | Manual reversing for void uses current date only | Allow specifying reversal date (next open period) |
| P1 | Reporting | Multi-period comparative (Adjusted vs Unadjusted side-by-side in exports) | Extend adjusted TB export to include paired columns |
| P1 | UX | No UI for voiding with reason & optional reversal toggle | Add modal; record `meta.reason` in audit event |
| P1 | Compliance | No retention / immutability layer for audit/events | Add write-once append log abstraction (even if in-memory mock) |
| P2 | Performance | Aggregations recompute full dataset every call | Cache journal ledger snapshots per period (invalidate on mutation) |
| P2 | Extensibility | Hard-coded account numbers in posting logic | Centralize account code mapping via settings chart configuration |
| P2 | Reporting | Segment/department tracking absent | Add optional `segmentId` on lines + segment dimension aggregation |
| P3 | Internationalization | No multi-currency hooks | Introduce currency table + FX revaluation placeholder |
| P3 | Accessibility | Some test components unverified for a11y regression | Add axe-core jest checks to critical report UIs |

## 3. Near-Term Implementation Sequence
1. Void UI (modal) + reason capture; update audit `meta.reason`.
2. Reversal date selection support; default next open period; block if no open period.
3. Adjusted TB export extension: include Unadjusted / Adjustments / Adjusted columns wide layout.
4. Segment dimension (optional): extend journal line with `segmentId`; add segment filter to P&L.
5. Audit immutability placeholder: append-only hash chain (prevHash+JSON(event)).
6. Performance caching for heavy aggregations (LRU by date range + invalidation flags).
7. Multi-currency scaffolding (settings + currencyRates map + FX revaluation adjusting journal utility).
8. UI polish: adopt a light-green primary theme (#0d9488), subtle nav underline and button sheen animations, and update Onboarding copy.

## 4. Quality Gates & Tooling Roadmap
| Gate | Current | Target Improvement |
|------|---------|--------------------|
| Build / Type | Strict TS passes | Enforce no unused eslint rule set; add tsc --noEmit CI step |
| Unit Tests | Broad report + workflow coverage | Add coverage threshold (80% lines), mutation integrity tests |
| Lint | Basic | Add eslint config & run pre-commit hook |
| A11y | Partial | Introduce automated axe check on key pages |
| Performance | Basic naive recompute | Snapshot & diff timing on core report aggregation tests |
| Security | Placeholder only | Mock RBAC + future token boundary |
| Compliance | Audit skeleton | Hash chain + export redaction (omit before/after on PII fields) |

## 5. Proposed Helpers / New Files
- `src/test-utils/assertBalanced.ts` – exports `assertBalanced(db)`; sums all journal lines: Σ debits === Σ credits.
- `src/app/api/audit/route.ts` (enhanced) – add filtering & pagination.
- `src/lib/security/permissions.ts` – role -> permissions map; guard utility.
- `src/components/VoidingModal.tsx` – collect reason + reversal toggle.
- `src/lib/audit/hashChain.ts` – simple hash util for tamper-evident demonstration.

## 6. Data Model Extensions (Draft)
```
interface JournalEntryLine {
  // ...existing
  segmentId?: string
  currency?: string // original currency
  amountFunctional?: number // normalized to base currency
}
interface AuditEvent {
  hash?: string
  prevHash?: string
  reason?: string // for void / adjustment rationale
}
interface CompanySettings {
  baseCurrency?: string
  currencies?: string[]
}
```

## 7. Risk & Edge Case Watchlist
- Re-opening a period after adjustments: ensure reversing entries still considered adjusting classification.
- Void after partial payment (currently blocked) – ensure user-friendly error surfaced.
- Reversal posting date at month boundary in different time zones (normalize to UTC midnight ISO).
- Hash chain continuity when events pruned or retention kicks in (decide: either full reset w/ marker event or forbid prune until archival process implemented).

## 8. Metrics & Observability (Future)
- Add lightweight timing wrapper around aggregation functions writing to a dev console channel (optionally surfaced in a diagnostics panel).
- Track counts: invoices (open/overdue), bills (open/overdue), journal entries (adjusting vs regular) to feed a dashboard snapshot.

## 9. Done Definition for Upcoming Milestones
- Audit Enhancements: filter + pagination + hash chain + tests verifying deterministic hash continuity.
- Integrity Layer: All mutation tests call `assertBalanced()`; failing test aborts pipeline.
- Segment Support: P&L with segment filter; trial balance unaffected; tests for two segments.
- Multi-Currency Scaffold: Journal lines accept currency; revaluation stub producing adjusting journal; test verifying creation & adjusted trial balance effect.

## 10. Open Questions
- Retention model: logical (soft archive) vs physical purge? Suggest start with logical flagged `archivedAt`.
- Permission granularity: per-report vs category-level bundles? (Recommend category bundles for maintainability.)
- UI Strategy for hash chain integrity display? (Badge: "Audit chain intact" after recomputation.)

---
## 11. Immediate Next Action (Recommendation)
Implement Void UI modal with reason + optional reversal toggle, persisting reason in audit meta, then proceed to reversal date selector.

---
Prepared: 2025-09-18
