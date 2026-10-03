# Stripe Foundation, Checkout, Customer Portal & Webhook Integration (Phase 13 Steps 1, 2A, 2B, 3 & 4)

## Status
**DONE & VERIFIED** (2026-10-03)

## Overview
Phase 13 establishes the end-to-end payment gateway, checkout flow, customer portal, and webhook ingestion infrastructure:
1. Core SDK readiness through the installed Stripe dependency and typing support.
2. Plan catalog enrichment for Stripe product and price identifiers.
3. Billing module infrastructure for service registration and dependency injection.
4. Webhook persistence in the database for event idempotency and replay safety.
5. Scoped raw-body parsing and signature verification for Stripe delivery.
6. Checkout session creation for workspace-owned plan upgrades.
7. Customer portal session creation for workspace-owned billing management and subscription self-service.
8. Subscription lifecycle state synchronization for billing period dates, active status, and cancellation intent.

## Architecture

### Billing module
The billing domain is intentionally small and focused. `src/billing/billing.module.ts` exposes `StripeService` for DI and registers both the webhook controller and checkout controller while importing `PrismaRepositoriesModule` to access plan and subscription persistence.

### Stripe service
`src/billing/stripe.service.ts` encapsulates the official Stripe initialization, webhook validation, and checkout session creation logic. It provides:
- `getClient()` for retrieving a configured Stripe client instance.
- `constructEvent(payload, signature)` for validating incoming webhook payloads against `STRIPE_WEBHOOK_SECRET`.
- `createCheckoutSession(params)` for creating a Stripe subscription checkout session and returning the resulting `session.id` and redirect `url`.

### Checkout endpoint
The checkout session endpoint is mounted at `/billing/workspaces/:workspaceId/checkout` and is protected by `JwtAuthGuard`, `WorkspaceAccessGuard`, and `RolesGuard`. Only workspace owners may initiate checkout. The controller resolves the `Plan` by `planId`, picks the correct Stripe price by interval (`monthly` vs `annual`), and calls `StripeService.createCheckoutSession()`.

### Customer portal endpoint
The customer portal endpoint is mounted at `/billing/workspaces/:workspaceId/customer-portal`. It is also owner-only and resolves the workspace’s active `Subscription` record by `companyId` or `practiceId` before requesting a Stripe billing portal session. This allows the workspace owner to manage payment methods and billing settings without exposing direct provider access.

### Webhook endpoint
The webhook listener is mounted at `/billing/webhooks/stripe` and intentionally skips JWT auth so Stripe can POST directly. It verifies request signatures, rejects invalid payloads with a `BadRequestException`, and stores processed results in `StripeWebhookEvent` for idempotency. It also syncs lifecycle metadata such as `stripeCustomerId`, `currentPeriodStart`, `currentPeriodEnd`, and `cancelAtPeriodEnd` from Stripe subscription events.

### Raw-body requirement
`main.ts` mounts a scoped raw body parser before the global JSON parser:

```ts
app.use('/billing/webhooks/stripe', express.raw({ type: 'application/json', limit: '10mb' }))
app.use(express.json({ limit: '10mb' }))
```

This is required because Stripe signs the raw JSON payload, not the parsed object.

### Event schema plumbing
The Prisma schema includes `WebhookEventStatus` and the `StripeWebhookEvent` model, with relation arrays on both `Workspace` and `Subscription` to support auditability and webhook replay investigation.

## Required environment variables
The backend `.env.example` includes the following values:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PUBLISHABLE_KEY`
- `FRONTEND_URL` (used for default success/cancel redirect URLs)

These values must be supplied before any checkout or webhook workflow is opened in a real environment.

## Frontend integration requirement
Frontend checkout flows must redirect back to the workspace billing settings page using the canonical destination:
- success: `/workspaces/{workspaceId}/settings/billing?checkout=success`
- canceled: `/workspaces/{workspaceId}/settings/billing?checkout=canceled`

If the caller does not provide explicit URLs, the backend defaults to those destinations to keep provider-confirmed state aligned with the billing settings experience.

## Notes
This phase is intentionally scoped to the billing gateway foundation and initial workspace checkout flow. Customer portal completion, subscription lifecycle state transitions, and production billing contract enforcement remain the next layer beyond Step 3.