# Backend Module & Billing Inventory (Phase 13 / Phase 16D)

## Status
**DONE & VERIFIED (2026-10-03)**

## Overview
This document records the verified inventory of the billing, subscription, and onboarding modules completed across the Phase 13 billing workstream and the remaining-module inventory audit. The scope includes the backend billing domain, the company subscription contract, the real subscription creation route used by onboarding, and the tenant-scoped enforcement applied to authenticated billing endpoints.

## Verified Module Inventory

| Module / Path | Responsibility | Security & Guard Coverage | Status |
|---|---|---|---|
| `Haypbooks/Backend/src/billing/` | Registers the billing feature set, Stripe lifecycle handlers, and the backend service graph for checkout and customer portal flows. | Module-level dependency isolation plus controller-level authentication and tenant enforcement | DONE & VERIFIED |
| `Haypbooks/Backend/src/billing/stripe.service.ts` | Encapsulates Stripe SDK client initialization, checkout session creation, customer portal session creation, and webhook verification plumbing. | Uses server-side Stripe secret keys and strict webhook signature validation for provider callbacks | DONE & VERIFIED |
| `Haypbooks/Backend/src/billing/checkout.controller.ts` | Creates Stripe Checkout and Customer Portal sessions for company and practice subscription workflows. | Guarded with authenticated request context and tenant-aware workspace access checks | DONE & VERIFIED |
| `Haypbooks/Backend/src/billing/stripe-webhook.controller.ts` | Receives and processes Stripe lifecycle events including checkout completion, subscription updates, and cancellations. | Verifies the raw request body with the Stripe `stripe-signature` header before processing provider events | DONE & VERIFIED |
| `Haypbooks/Backend/src/companies/subscription.util.ts` | Defines `DEFAULT_TRIAL_PLAN_ID`, `CANONICAL_PAID_PLANS`, and ownership validation for tenant/company and practice records. | Enforces company XOR practice ownership and rejects deprecated `'FREE'` plan strings | DONE & VERIFIED |
| `Haypbooks/Backend/src/companies/company.repository.prisma.ts` | Bootstraps 30-day trial subscriptions using `planId: DEFAULT_TRIAL_PLAN_ID` and status `TRIAL` for tenant and child-company creation paths. | Idempotent, race-safe creation flow that preserves the non-destructive trial contract | DONE & VERIFIED |
| `Haypbooks/Frontend/src/app/api/subscriptions/create/route.ts` | Validates subscription payloads, forwards authenticated requests to the backend when configured, and returns `201 Created` on successful onboarding. | Rejects invalid plan payloads with `400 Bad Request` and forwards auth context through the request pipeline | DONE & VERIFIED |
| `Haypbooks/Backend/src/auth/guards/workspace-access.guard.ts` | Enforces tenant membership and workspace context on authenticated billing routes. | Blocks cross-tenant access before controller logic is reached | DONE & VERIFIED |

## Guard & Security Coverage

The Phase 13 billing work preserved the fail-closed pattern required for financial flows:

- `WorkspaceAccessGuard` remains the gate for authenticated billing and subscription endpoints, ensuring the current request belongs to an active member of the intended workspace.
- Stripe webhook endpoints rely on the raw request body and verify the `stripe-signature` header before mutating subscription state.
- Subscription creation routes validate plan payloads and reject the deprecated free-plan string instead of silently accepting invalid values.
- Trial bootstrap uses the canonical `planId` value and preserves the 30-day trial semantics without creating a permanent free plan.

## Cross-Reference Documentation

- [Subscription onboarding implementation](../subscription-onboarding/README.md)
- [Billing trial alignment implementation](../billing-trial-alignment/README.md)

## Outcome
The billing and subscription system now has a verified module inventory, a consistent plan contract, and guard coverage for both tenant isolation and provider webhook integrity. This inventory is the authoritative reference for the shipping Phase 13 scope and the documented remediation of E2/E9.
