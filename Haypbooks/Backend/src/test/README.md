# Backend Test Module (`src/test`)

## Status: DONE (Verified 2026-09-20)

### Overview
The test module centralizes helper endpoints used by automated verification, smoke checks, and local E2E flows. The controller is intentionally isolated behind a module boundary and a fail-closed guard so it does not leak into production routes by default.

### Security model
- `TestModule` wraps `TestController` and is conditionally imported from `AppModule`.
- `TestController` is protected with `@UseGuards(TestEndpointGuard)`.
- Access is granted only when:
  - `NODE_ENV === 'test'`, or
  - `ALLOW_TEST_ENDPOINTS === 'true'` in development/CI, or
  - `ALLOW_TEST_ENDPOINTS_TOKEN` is configured and the request includes a matching `X-Test-Token` or `Authorization: Bearer <token>`.
- All other environments fail closed with `403 Forbidden`.

### Endpoint coverage
The module exposes the internal helper endpoints used for OTP generation, verification shortcuts, onboarding automation, and debug routing under `/api/test`.

### Operational notes
- Production defaults to no route exposure.
- Local development and CI remain opt-in.
- Staging and production use token-based validation only when explicitly configured.
