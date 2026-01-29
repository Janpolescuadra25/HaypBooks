# Schema Organization & Conventions

## Section Order
1. Enums (grouped by domain)
2. Auth & Access
3. Workspace / Company / Practice
4. Core Accounting (GL, Journals, Periods)
5. AR / AP / Revenue
6. Inventory / Fixed Assets
7. Banking & Cash Management
8. Payroll & Time
9. Tax & Compliance
10. Reporting / Analytics / AI
11. Audit, Governance, Utilities

## Conventions
- Monetary amounts: Decimal(20,4)
- Rates/percentages: Decimal(10,6)
- Quantities: Decimal(28,6)
- Use enums for high‑usage status/type fields
- camelCase for fields; use @map only for legacy columns
- Apply consistent `deletedAt` for soft deletes and add filtered indexes for active queries

## Indexing Guidance
- Use composite indexes aligned with reports: status + dueDate, companyId + period
- Add postingStatus + date for unposted item scans
- Archive or partition high‑volume tables (journal lines, audit logs, AI logs)

## Sequencing & Compliance
- Use DocumentSequence for invoice/receipt numbering (no gaps)
- Keep TaxCalculationAudit for defensibility
- Lock periods via TaxPeriodLock after filing

## Data Quality
- Enforce check constraints for non‑negative amounts and valid period formats
- Use JSON schemas for structured JSON fields in rules/configs
