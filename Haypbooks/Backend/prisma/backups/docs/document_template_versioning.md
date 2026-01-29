Document Template Versioning & Signatures

Purpose
- Maintain historical versions of `DocumentTemplate` for auditing, rollback, and traceability.
- Allow document-level signatures (e-sign or digital seals) for legal acceptance.

Models
- `DocumentTemplateVersion` stores snapshot of structure/design/content per template version.
- `DocumentSignature` stores signer info, type of signature, timestamp, and verification metadata.

Usage
- When updating a template, create a new `DocumentTemplateVersion` with incremented `versionNumber` and update `DocumentTemplate` if needed.
- When a document is approved or signed, insert a `DocumentSignature` referencing the document and store `metadata` (signing provider id, signature token, audit log).

Important
- For legal compliance, keep full audit of versions and signatures in tamper-evident storage (consider append-only logs or ensuring DB audit logs are immutable).
