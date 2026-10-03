# Stripe Foundation & Webhook Integration (Phase 13 Steps 1, 2A & 2B)

## Status
**DONE & VERIFIED** (2026-10-03)

## Overview
Phase 13 establishes the end-to-end payment gateway and webhook ingestion infrastructure:
1. Core SDK readiness through the installed Stripe dependency and typing support.
2. Plan catalog enrichment for Stripe product and price identifiers.
3. Billing module infrastructure for service registration and dependency injection.
4. Webhook persistence in the database for event idempotency and replay safety.
5. Scoped raw-body parsing and signature verification for Stripe delivery.

## Architecture

### Billing module
The billing domain is intentionally small and focused. src/billing/billing.module.ts exposes StripeService for DI and registers the webhook controller while importing PrismaRepositoriesModule to access subscription and event persistence.

### Stripe service
src/billing/stripe.service.ts encapsulates official Stripe initialization and webhook validation logic. It provides:
- getClient() for retrieving a configured Stripe client instance.
- constructEvent(payload, signature) for validating incoming webhook payloads against STRIPE_WEBHOOK_SECRET.

### Webhook endpoint
The webhook listener is mounted at `/billing/webhooks/stripe` and intentionally skips JWT auth so Stripe can POST directly. It verifies request signatures, rejects invalid payloads with a `BadRequestException`, and stores processed results in `StripeWebhookEvent` for idempotency.

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
The backend .env.example includes the following values:
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PUBLISHABLE_KEY

These values must be supplied before any checkout or webhook workflow is opened in a real environment.

## Notes
This step is intentionally scoped to the gateway foundation. Checkout sessions, billing contract state machines, and production webhook processing remain the next implementation layer beyond Step 2B.