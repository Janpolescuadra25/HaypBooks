# HaypBooks Product Maturity Standard

Version: 1.0 — August 27, 2026
Maintained by: CYPRA (definition) / HYDRA (enforcement in audits)
Status: ACTIVE — this document is the single Definition of Done for
HaypBooks capabilities and the governing structure for all Plan G
maturity audits.

## 1. PURPOSE
This standard converts "is this feature done?" from opinion into
evidence. Every roadmap initiative, every defect classification,
and every maturity audit verdict must be traceable to a rule in
this document. When the roadmap and this standard disagree, this
standard wins and the roadmap must be corrected.

## 2. SCOPE AND AUTHORITY
- Applies to: backend services, frontend application, database
  schema and migrations, deployments, documentation.
- Invoked by: every HYDRA maturity audit, every DONE/NOT-DONE
  judgment on roadmap items, every gap classification.
- Reference materials (local, gitignored): docs/erpnext/ and
  docs/Quickbooks_api/. They inform judgments under Section 6 but
  never expand scope by themselves (Section 8).

## 3. THE SIX AUDIT PERSPECTIVES
Every capability is examined through all six lenses before any
maturity tier or priority is assigned:
  S1  Accounting & Ledger Integrity — double-entry validity,
      posting completeness, fail-closed behavior on imbalance,
      document numbering uniqueness under concurrency.
  S2  Security — authentication, authorization, tenant isolation,
      secret handling, absence of debug backdoors.
  S3  Data Integrity & Persistence — schema correctness,
      transactional boundaries, migration safety, backup/restore
      story.
  S4  Concurrency & Reliability — race conditions, idempotency,
      failure modes, timeout handling, performance under load.
  S5  UX & API Consistency — contract stability, error surfacing,
      frontend/backend behavioral alignment.
  S6  Quality Operations — automated test coverage, module
      documentation (README policy), deployment safety.

## 4. FUNCTIONAL MATURITY SCALE (FIVE TIERS)
Every audited capability receives exactly one tier, backed by
evidence:
  T1  SKELETON — declared in UI/docs but effectively absent.
  T2  IMPLEMENTED, BROKEN EDGES — core path exists; error paths,
      concurrency, or validation are defective.
  T3  HAPPY-PATH COMPLETE — normal flow works; edge cases and
      test evidence are insufficient for production trust.
  T4  PRODUCTION VERIFIED — behaves correctly under adversarial
      conditions; has passing tests; has module README.
  T5  AUDITED & HARDENED — T4 plus a completed maturity audit and
      benchmark comparison against reference products.
Promotion between tiers REQUIRES cited evidence (file/line, test
names, audit report). Claims without evidence stay at the lower tier.

## 5. PRIORITY CLASSIFICATION
  P0 — blocks correctness of accounting data, causes data loss,
       opens security exposure, or breaks tenant isolation.
  P1 — major functional defects or systemic integrity risk that
       do not corrupt committed data today.
  P2 — meaningful gaps in reliability, consistency, or UX.
  P3 — polish, nice-to-have improvements.
Rules: a T2 rating on anything touching ledgers implies at least
one P0/P1 entry in the remediation queue. Priorities attach to
defects, not to whole modules.

## 6. REAL-WORLD BENCHMARK PROTOCOL
For each capability area, auditors compare actual behavior against
ERPNext and QuickBooks using the local reference dumps in
docs/erpnext/ and docs/Quickbooks_api/. For every divergence found,
classify it as:
  CONFORMANCE GAP — the benchmark behavior is correct industry
  practice and HaypBooks falls short (candidate defect), or
  PRODUCT DIVERGENCE — HaypBooks intentionally differs.
Only CONFORMANCE GAPs generate remediation entries.

## 7. STANDARD AUDIT REPORT STRUCTURE
Every Plan G maturity audit produces one report with these fixed,
lettered sections, in order:
  A  Executive Summary
  B  Scope & Method
  C  Ledger Integrity Findings          (perspective S1)
  D  Security Findings                   (perspective S2)
  E  Data Integrity Findings             (perspective S3)
  F  Concurrency & Reliability Findings  (perspective S4)
  G  UX & API Consistency Findings       (perspective S5)
  H  Quality Operations Findings         (perspective S6)
  I  ERPNext Benchmark Comparison
  J  QuickBooks Benchmark Comparison
  K  Maturity Tier Assignments
  L  Risk Assessment
  M  P0 Remediation Queue
  N  P1 Remediation Queue
  O  P2/P3 Backlog Entries
  P  Regression Risk Checklist
  Q  Test Coverage Assessment
  R  Documentation Impact
  S  Deployment Safety Notes
  T  Decision Log
  U  Evidence Index (file/line citations)
  V  Open Questions for JP
  W  Recommended Sequencing

## 8. ANTI-FEATURE-CREEP RULE (BINDING)
Benchmark materials EXIST TO JUDGE, NOT TO EXPAND. Therefore:
  8.1  Reading ERPNext/QuickBooks references may reveal gaps;
       gaps become roadmap items ONLY via a Plan G audit verdict.
  8.2  Adopting any new feature inspired by a benchmark product
       requires: (a) an explicit HYDRA framing proposal, and
       (b) JP's written approval. Neither agent may add scope
       silently.
  8.3  This standard may tighten definitions of existing plans;
       it may never grow the product surface on its own.
