# Tenants Module

This module supports multi-tenant behaviour (known as ``workspaces``) and
provides APIs for:

* Listing tenants an authenticated user belongs to (`GET /api/tenants`).
* Gathering client lists for accountant dashboard (`GET /api/tenants/clients`).
* Inviting another user to a tenant (`POST /api/tenants/:tenantId/invites`).
* Retrieving pending invites for the current user (`GET /api/tenants/invites/pending`).
* Fetching a specific tenant's details (`GET /api/tenants/:id`).
* Updating last-accessed timestamp when switching clients (`POST /api/tenants/:tenantId/access`).

All routes are protected by `JwtAuthGuard` and input validation is enforced via
DTOs and the global `ValidationPipe`.

The service handles business rules such as ensuring only owners can invite new
users, preventing duplicate invites or memberships, and sending an email
notification through `MailService` when an invite is issued.
