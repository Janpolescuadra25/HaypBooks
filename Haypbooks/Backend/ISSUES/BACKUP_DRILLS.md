# Backup and PITR Automation - Acceptance Criteria

## Problem
Runbooks exist but automation and drill logs are missing.

## Acceptance Criteria
- Automated scheduled backups and WAL archiving configured in `docker-compose` or production infra.
- Scripted restore drills that run in CI/test infra; results logged to `dr_runs` table.
- Alerts when backups/PITR are older than thresholds.
- Recovery time and point goals documented and validated in DR runs.

Estimated effort: 1-2 sprints depending on infra.