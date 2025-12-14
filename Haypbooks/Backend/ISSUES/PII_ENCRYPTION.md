# PII Field-Level Encryption - Acceptance Criteria

## Problem
Sensitive data storage needs KMS-backed field-level encryption and non-prod masking.

## Acceptance Criteria
- PII inventory created with all sensitive fields flagged.
- KMS config for field-level encryption implemented (per-field or JSONB encryption) with rotation support.
- Non-prod data masking run in seed pipeline.
- Tests for decryption only with proper KMS permissions and tenant-safety.

Estimated effort: 1-2 sprints for initial POC and gradual rollout.
