# Time Tracking & Projects - Acceptance Criteria

## Problem
Time tracking and Projects are documented but not implemented end-to-end.

## Acceptance Criteria
- Models: `project`, `time_entry`, `timesheet`, `timesheet_approval`, `project_expense`, `project_task`.
- Approvals workflow implemented (approve/reject) with audit log.
- Project-level budgets and `project_profitability` materialized view.
- E2E tests for creating timesheets, approval, billing to invoice, and project profitability report.
- RLS + tenant-safety enforced.

Estimated effort: 2-3 sprints.
