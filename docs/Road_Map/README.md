# Road Map Directory

## Purpose

This directory contains the canonical project roadmap: `Road_Map.md`. The roadmap is the single source of truth for project status, active phases, audit findings, and acceptance criteria. The former root-level `Road_Map.md` was removed; `docs/Road_Map/Road_Map.md` is the only canonical copy.

## Contents of `Road_Map.md`

The roadmap contains: current audit findings E1-E12; audit review summary A-W; active phases 1-17; an end-to-end acceptance matrix; a definition of finished; consolidation decisions and a crosswalk from older roadmaps; legacy supplement phases 14A, 15A, 16A, 16B, 16C, 16D; and a historical completion index.

Open findings E1-E12 track known gaps; several are source-confirmed, including test endpoint exposure, checkout success behavior, build validation, and pricing/trial conflicts.

## Current fingerprint of `Road_Map.md`

Recorded 2026-10-01 after Task 507 archival finalization and README fingerprint sync:

- Size: 40946 bytes
- SHA-256: AA7EE5385346995DA0396FFDD2B34ED359181E01502D56EEB3FAA3E67D5D5812
- Lines: 344
- Encoding: UTF-8 without BOM; LF-only line endings; trailing newline consistent with current source state

Whenever `Road_Map.md` is validly edited, replace the values above with the new fingerprint. If the live file does not match this fingerprint, the file has drifted and must be re-audited before any further edit.

## File conventions

- Encoding: UTF-8 without BOM; LF line endings only; no trailing newline.
- The 32 mojibake check-mark markers inside `Road_Map.md` are known artifacts of historical edits. They are tracked intentionally and must not be "fixed" as part of unrelated work.
- Finding rows follow the pattern: finding id, anchored source path or paths, verified description, and a status column in the form "Status / count".

## How agents must treat the roadmap

- Never treat a phase as complete merely because the roadmap mentions it. Written statuses include PARTIAL, NOT STARTED, AUDIT REQUIRED, and BLOCKED.
- Completion claims require a verified repository audit. Do not edit status columns without one.
- Do not remove any phase unless a repository audit verifies that phase as fully complete.

## Verified repair history (summary)

- The roadmap is maintained through gated, byte-anchored repair cycles with pre-edit fingerprint checks and post-edit content re-audits.
- 2026-09-13: the defective E11 row at line 23 was replaced. Dangling parent-path fragments were removed; the overbroad claim "the auth pages now use AuthShell" was narrowed to seven inspected pages (login, signup, forgot-password, reset-password, verify-otp, verification, onboarding/welcome); the row marker is now "E11 (corrected, Hydra repo audit 2026-09-13)". Closure was verified by a Hydra content-level re-audit. E11 status: Partial / 1; the finding itself remains open.
- 2026-09-13: L1 roadmap follow-up recorded the DONE L1 subtask at the end of Phase 1 while keeping Phase 1 PARTIAL; added the L2-L6 queue lines directly below it; refined the Deliver line with the per-page hub composition pattern; and refreshed this file's Road_Map.md gate block to Size 44663, SHA-256 3D03A3EAB58DDE6D9FBA10412EE4FF9CC6EA194469934551864F9636AC82089E, Lines 346, LF 345, CR 0.
- Earlier verified repairs: the duplicate H-0 completion entry dated 2026-09-12 was removed as erroneous and a retained H-0 addendum records this; a literal "\r\n" garbage final line was removed; the file now ends cleanly at line 340.
- 2026-09-14 (R3): L2 LearnSupport round completed; its L2 completion record now stands at Road_Map.md line 87 (swapped in by R4, see next entry).
- 2026-09-14 (R4): Road_Map.md line 87 swapped from the L2 (NEXT) line (206 bytes) to the L2 LearnSupport completion record (1015 bytes); profile preserved (346 lines; LF 345; CR 0; no BOM; no trailing newline); fingerprint 44663/3D03A3EA -> 45472/43384B8C; Hydra post-run disk audit: R4 CLOSES CLEAN.
- 2026-10-01 (Task 507): finalized archival cleanup for Phase 9 and Phase 12 E1, removed the residual appendix references, and synchronized this README fingerprint block to the live Road_Map.md state.

## Edit protocol for `Road_Map.md`

1. Record the pre-edit fingerprint from this README; abort if the live file does not match.
2. Apply byte-anchored, gated edits only; abort on any gate failure with no write.
3. Preserve normalization: LF only, no BOM, no trailing newline; preserve all 32 mojibake markers.
4. After a verified edit, update the fingerprint block above and extend the repair history.

## Known documentation gaps (current as of 2026-09-13)

- Resolved 2026-09-13, statically verified by audit: root README.md, Haypbooks/Backend/README.md, Haypbooks/Frontend/README.md, and Haypbooks/Frontend/src/components/landing/README.md were rewritten in the four-file README alignment sequence; the stale claims listed by the previous revision of this section no longer apply.
- Haypbooks/Frontend/src/app/(platform-admin)/README.md line 51 declares a section-level "Status: DONE" that conflicts with roadmap phase 15A (PARTIAL / AUDIT REQUIRED); disposition is queued as a separate change.
- Haypbooks/Backend/src/auth/README.md line 104 claims "build errors fixed", which has not been verified by an authorized build or typecheck run; the "WorkspaceTypeGuard (DONE)" claim on line 92 is verified for the guard implementation itself.
- Other section READMEs under Haypbooks/Backend/src and Haypbooks/Frontend/src have not been fully audited and may contain stale claims; auditing them remains future work.
- No other documentation exists in this directory beyond this file and `Road_Map.md`.

## September 26 audit checkpoint

A fresh risk-based audit is available at [2026-09-26-current-status.md](../audits/2026-09-26-current-status.md). The canonical roadmap now begins with current verification results, scoped progress, open release blockers and recommended order. Earlier summaries and completion labels are historical where the checkpoint supplies newer evidence. No application code or production data was changed by this audit.
