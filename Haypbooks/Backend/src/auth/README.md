# Auth Module

This document describes the authentication and authorization architecture for the backend auth module.

## Overview

The auth module is responsible for user login/signup, JWT validation, workspace role checks, system role enforcement, and workspace-type protection.

### Key files

- `auth.module.ts` — NestJS module registration and provider wiring
- `auth.controller.ts` — auth endpoints and cookie handling
- `prisma-auth.service.ts` — core auth logic, credential validation, JWT creation, refresh token/session management, and user response shaping
- `pending-signup.service.ts` — temporary state store for multi-step signup flows
- `verification.service.ts` — OTP generation and verification logic
- `decorators/roles.decorator.ts` — `@Roles(...roles)` metadata helper
- `decorators/system-roles.decorator.ts` — `@SystemRoles(...roles)` metadata helper
- `decorators/workspace-type.decorator.ts` — `@RequireWorkspaceType(...types)` metadata helper
- `guards/jwt-auth.guard.ts` — JWT validation guard
- `guards/system-role.guard.ts` — system role guard for platform owner routes
- `guards/roles.guard.ts` — workspace role guard for most protected routes
- `guards/workspace-type.guard.ts` — workspace type guard preventing cross-role entity creation
- `guards/company-access.guard.ts` — company-scoped access guard for `:companyId` routes
- `strategies/jwt.strategy.ts` — Passport JWT strategy for token extraction and payload validation

## Guard execution order

The auth guard architecture is layered:

1. `JwtAuthGuard` — validates the JWT token
2. `SystemRoleGuard` — enforces system-level roles from `user.systemRole`
3. `RolesGuard` — enforces workspace role checks from `@Roles()` metadata
4. `WorkspaceTypeGuard` — enforces workspace type restrictions from `@RequireWorkspaceType()`

Not every controller applies every guard; guards are combined where route-specific protection is required.

## Guards

### JwtAuthGuard

- File: `guards/jwt-auth.guard.ts`
- Purpose: Authenticate requests by validating the JWT
- Behavior: extends `AuthGuard('jwt')`
- Token sources: `Authorization: Bearer ...`, cookie named `token`, or raw `cookie` header containing `token=`.
- Usage example:

```ts
@UseGuards(JwtAuthGuard)
@Get('me')
me(@Req() req: any) { return req.user }
```

### SystemRoleGuard

- File: `guards/system-role.guard.ts`
- Purpose: Enforce system-level roles such as `SUPER_ADMIN`
- Decorator: `@SystemRoles(...roles)`
- Behavior:
  - If no required roles are configured, allows access
  - If `user.systemRole` is missing, throws `ForbiddenException`
  - If `user.systemRole` matches one of the required roles, allows access
  - Otherwise throws `ForbiddenException`
- Usage example:

```ts
@UseGuards(SystemRoleGuard)
@SystemRoles('SUPER_ADMIN')
@Get('platform-metrics')
getPlatformMetrics() { ... }
```

### RolesGuard

- File: `guards/roles.guard.ts`
- Purpose: Enforce workspace-level roles using `@Roles()` metadata
- Behavior:
  - If no `@Roles()` metadata exists, allows access
  - If `req.user` is missing, denies access
  - If `user.systemRole === 'SUPER_ADMIN'`, allows access (bypass)
  - If `user.isOwner === true`, allows access (workspace owner bypass)
  - Otherwise compares required roles case-insensitively against `user.role`
  - Special case: `@Roles('Owner')` also accepts backend `user.role === 'business'`
- Usage example:

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Owner', 'Admin')
@Post(':id')
update(@Param('id') id: string) { ... }
```

### WorkspaceTypeGuard (DONE)

- File: `guards/workspace-type.guard.ts`
- Purpose: Prevent cross-role entity creation by enforcing workspace type
- Decorator: `@RequireWorkspaceType(...types)`
- Behavior:
  - If no types are configured, allows access
  - If `req.user` is missing, denies access
  - If `user.systemRole === 'SUPER_ADMIN'`, allows access (bypass)
  - Otherwise queries Prisma for the workspace belonging to `user.userId`
  - If the workspace type matches a required type, allows access
  - Otherwise throws `ForbiddenException`
- Status: DONE — implemented and build errors fixed
- Usage example:

```ts
@RequireWorkspaceType('OWNER')
@UseGuards(JwtAuthGuard, WorkspaceTypeGuard)
@Post()
create(@Req() req: any, @Body() body: CreateCompanyDto) { ... }
```

### CompanyAccessGuard

- File: `guards/company-access.guard.ts`
- Purpose: Enforce that the authenticated user can access the company identified by `:companyId`
- Behavior:
  1. Reads `companyId` from `request.params`
  2. Reads `userId` from `request.user.userId` or `request.user.id`
  3. If `companyId` is missing, the guard is a no-op
  4. Verifies the company exists via Prisma
  5. Verifies the user is an ACTIVE member of the owning workspace via `WorkspaceUser`
  6. Attaches `request.companyWorkspaceId` and sets async request context for downstream use
- Usage example:

```ts
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Get(':companyId/invoices')
listInvoices(@Param('companyId') companyId: string) { ... }
```

## Decorators

### @SystemRoles(...roles)

- File: `decorators/system-roles.decorator.ts`
- Purpose: Attach required system-level roles to routes/controllers
- Usage example:

```ts
@SystemRoles('SUPER_ADMIN')
@UseGuards(SystemRoleGuard)
@Get('owner-dashboard')
ownerDashboard() { ... }
```

### @Roles(...roles)

- File: `decorators/roles.decorator.ts`
- Purpose: Attach required workspace roles to routes/controllers
- Usage example:

```ts
@Roles('Owner', 'Admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Patch(':id')
update(@Param('id') id: string) { ... }
```

### @RequireWorkspaceType(...types)

- File: `decorators/workspace-type.decorator.ts`
- Purpose: Attach required workspace types to routes/controllers
- Usage example:

```ts
@RequireWorkspaceType('PRACTICE')
@UseGuards(JwtAuthGuard, WorkspaceTypeGuard)
@Post('invite')
invite(@Body() body: InviteDto) { ... }
```

## Services

### PrismaAuthService

- File: `prisma-auth.service.ts`
- Purpose: Core authentication service used by `AuthController`
- Responsibilities:
  - `signup()` — create users, hash passwords, sign JWTs with `systemRole` and `isOwner`
  - `login()` — validate credentials, enforce verification, create refresh sessions, sign JWTs
  - `getIsOwner()` — determine workspace ownership using Prisma
  - `getOnboardingStatus()` — read onboarding completion state from `OnboardingData`
- Notes:
  - JWT payload includes `sub`, `email`, `role`, `systemRole`, and `isOwner`
  - `systemRole` is included in returned user responses for frontend consumption

## Strategy

### JwtStrategy

- File: `strategies/jwt.strategy.ts`
- Purpose: Passport JWT validation and payload transformation
- Behavior:
  - Accepts JWT from `Authorization` header or `token` cookie
  - Uses `process.env.JWT_SECRET`
  - `validate()` returns:
    - `userId: payload.sub`
    - `email: payload.email`
    - `role: payload.role`
    - `systemRole: payload.systemRole`
    - `isOwner: payload.isOwner`

## Cross-role prevention files

- `guards/workspace-type.guard.ts`
- `decorators/workspace-type.decorator.ts`
- `companies/company.controller.ts` — `@RequireWorkspaceType('OWNER')` on `POST /api/companies`
- `practice/practice.controller.ts` — `@RequireWorkspaceType('PRACTICE')` on practice creation
- `practice-hub/practice-hub.controller.ts` — `@RequireWorkspaceType('PRACTICE')` on invite creation

## Notes

- `WorkspaceTypeGuard` uses a Prisma lookup to find the workspace type. A future optimization would add `workspaceType` to the JWT payload to avoid the DB query.
- The Prisma schema defines `Workspace.type` as an enum with values `OWNER` and `PRACTICE`.
- The `Workspace` model includes `ownerUserId String @unique`, ensuring one workspace per owner user.
- All guards use NestJS `CanActivate` and `Reflector.getAllAndOverride()` for metadata resolution.

## Existing auth flow reference

This file retains the original auth flow documentation while adding the full current guard/decorator architecture. The sign-up, login, refresh, OTP, and email verification flows remain valid context for future agents.
