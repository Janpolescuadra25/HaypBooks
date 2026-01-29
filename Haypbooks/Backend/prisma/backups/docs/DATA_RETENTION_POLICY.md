# Data Retention Policy (Baseline)

This document outlines recommended retention windows for high‑volume or sensitive data in HaypBooks. Adjust per jurisdiction and customer contracts.

## 1) Operational Logs
- ExternalSystemAudit: 13 months (supports annual audits)
- ExternalSystemAccessLog: 6–12 months
- SystemHealthStatus: 90 days (rolling)
- SearchIndexingQueue: 30 days after completion

## 2) Financial & Compliance Logs
- AuditLog: 7–10 years (local statutory requirements)
- EventLog: 1–3 years
- BankTransactionRaw: 2–7 years (per banking retention rules)

## 3) PII and Security
- ApiKey: retain while active; redact key material on revoke
- ConsentRecord: retain per law (GDPR/CCPA/PH DPA) or until withdrawal + legal minimum
- SensitiveDataAccessLog: 1–2 years

## 4) Recurring & Automation
- RecurringExecutionLog: 12–24 months
- WorkflowRun/WorkflowRunStep: 6–12 months

## 5) Purge Strategy
- Use scheduled jobs for soft-delete or purge of expired records.
- Archive to cold storage before deletion where required.
- Always log purge events in AuditLog.

## 6) Legal Notes
- Always follow local retention laws for the company’s country and industry.
- Provide export before deletion when required by compliance policies.
