# Cross-Role Creation Guard

## What
Added a `WorkspaceTypeGuard` and `@RequireWorkspaceType()` decorator to prevent users from creating entities outside their assigned workspace type.

## Why
The app must enforce role-based boundaries between business owners and accounting practices. Without this guard, a practice workspace user could create companies and an owner workspace user could create practice invites, violating the intended separation of platform roles.

## How
- `@RequireWorkspaceType()` sets required workspace types as metadata on a route or controller.
- `WorkspaceTypeGuard` reads that metadata with `Reflector.getAllAndOverride()`.
- The guard checks the current user's owning workspace type via Prisma and permits the request only if the workspace type matches one of the required types.
- `SUPER_ADMIN` bypasses the workspace type restriction entirely.

## Protected Endpoints
- `POST /api/companies` — requires `OWNER` workspace
- `POST /api/practices` — requires `PRACTICE` workspace
- `POST /api/practice-hub/invites` — requires `PRACTICE` workspace

## SUPER_ADMIN Bypass
If `request.user.systemRole === 'SUPER_ADMIN'`, the guard returns `true` before querying the database.

## Notes
- The guard applies additively on top of `JwtAuthGuard`.
- `practice-hub.controller.ts` keeps its class-level `@UseGuards(JwtAuthGuard)` and adds `WorkspaceTypeGuard` only at the invite creation method.
- This implementation avoids schema changes and does not require a database migration.

## Future Optimization
A future improvement would be to include `workspaceType` in the JWT payload so the guard can avoid the Prisma lookup entirely for most requests.
