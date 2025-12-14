# Haypbooks — Subscription & Billing Integration (Phase 2) — Plan

This document outlines a safe, low-risk plan to transition from the MVP visual-only subscription UI to a full subscription and billing backend integration. The plan keeps the current policy intact: subscriptions remain UI-only during core development and final implementation will happen after core onboarding, accounting, and reporting features are done.

## Goals

- Add a robust subscription backend and billing integration (Stripe or similar) while preserving current mock-first flows.
- Ensure minimal disruptions when moving from mock-only flow to a real billing system.
- Provide a clear data model, API contract, and a verify-safe rollout strategy.

## High-level approach

1. Keep current UI visual-only in the MVP — do not enable payments or live billing yet.
2. Add a server-side subscription service later (Phase 2) as an isolated service or a set of endpoints inside `Backend/` (or `Haypbooks/backend`).
3. Create bridge/endpoints and feature flags so the frontend can be switched to use real billing only when safe.
4. Provide rigorous tests and dummy/stubbed Stripe test harnesses to validate flow before enabling real charges.

## Data model (minimum)

- Plan: { id, name, slug, priceMonthly, priceAnnual, limits, features }
- CustomerSubscription: { id, customerId, planId, status, startDate, endDate, trialEnd, cancelAt, cancelAtPeriodEnd, billingCycleAnchor }
- Invoice / PaymentIntent references (tokens / external ids) — stored for audit, not full card data
- PaymentMethod: { id, customerId, providerId, cardBrand, last4, expMonth, expYear }
- WebhookLog: { id, eventType, payload, processedAt }

Recommend persisting subscriptions in a schema that supports both external provider references and in-app overrides for feature flags.

## API endpoints (stub & production)

- GET /api/subscriptions/plans — list available plans (used by UI)
- POST /api/subscriptions/create-intent — create a subscription intent with Stripe (Phase 2)
- POST /api/subscriptions/webhook — receive provider webhooks (secure endpoint)
- GET /api/subscriptions/me — customer subscription status
- POST /api/subscriptions/change-plan — change plan (trial / immediate / scheduled)
- POST /api/subscriptions/cancel — cancel subscription (now or at period end)

Important: create a mock-layer version of these endpoints under `src/mocks` so UI and tests continue to work in mock-only mode.

## Feature gating & rollout

- Add a feature-flag `FEATURE_BILLING_REAL` (or environment variable) to toggle between mock subscription behavior and real provider integration.
- Default: `FEATURE_BILLING_REAL=false` in dev and CI.
- Rollout pattern:
  1. Implement provider integration behind `FEATURE_BILLING_REAL=false` with simulated flows.
  2. Build and test with provider test keys and a staged environment (staging). Keep real charges disabled until verified.
  3. Perform a beta test with internal users.
  4. Enable production with monitoring (webhook verification, retries, dead-letter queue).

## Testing strategy

- Unit tests and contract tests (OpenAPI or types) guaranteeing the same request/response shape between mocks and provider stitches.
- Integration tests with test provider keys (Stripe test mode) using isolated environment data.
- E2E tests that validate the customer journey (signup -> plan selection -> subscription creation) but in sandbox mode (no real charges).
- Webhook processing tests (retries, duplicate delivery safety, idempotency keys).

## Security & compliance

- Never store raw card data. Use payment provider tokens and PaymentMethod references.
- Use secure webhooks with signature verification and replay protection.
- Store minimal PCI-relevant data (brand, last4, expiration) for display and business logic.

## Backwards-compatibility and migration notes

- Maintain the mock DB and MSW handlers as the canonical mock source; do not remove them.
- Provide migration scripts for subscription data if you change the model once production usage begins.

## Dev & infra checklist

- [ ] Provider account configured for staging and production
- [ ] Secure webhook endpoint with signature verification
- [ ] Billing sync job (reconcile invoices, handle failures)
- [ ] Tenant-level feature flags for rollout
- [ ] Monitoring + alerting on webhook failure rates and billing errors

## Timeline suggestion

- Design & prototype: 1–2 sprints (API + mocks)
- Integration & testing (staging): 1–2 sprints
- Beta rollout: 1 sprint
- Prod rollout: 1 sprint

---

Notes: This plan is intentionally conservative and emphasizes safe rollout, feature flags, and preserving the mock-first frontend development experience until core features are finalized.
