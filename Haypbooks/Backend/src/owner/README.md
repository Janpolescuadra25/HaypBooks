# Owner Module — Platform-Owner (SUPER_ADMIN) API

`Backend/src/owner` exposes the platform-owner back office: storage oversight, user administration, and platform metrics. Every route requires the `SUPER_ADMIN` system role.

## API Surface (9 endpoints)

| Method | Route | Handler | Purpose |
|--------|-------|---------|---------|
| GET | `/api/owner/health` | `health` | Liveness probe returning `{ status: 'ok', timestamp }`. |
| GET | `/api/owner/storage/usage` | `getPlatformStorageUsage` | Per-company storage summaries + platform totals. |
| GET | `/api/owner/storage/usage/:companyId` | `getCompanyStorageUsage` | One company's storage summary. |
| PUT | `/api/owner/storage/limits/:companyId` | `setStorageLimit` | Set/clear a company's owner override limit (body: `{ overrideMb: number | null }`). |
| GET | `/api/owner/users` | `getUsers` | Paginated, searchable user list with companies and last login. |
| PATCH | `/api/owner/users/:userId/status` | `setUserSuspendStatus` | Suspend/reactivate a user (body: `{ suspend: boolean }`). Idempotent; audited. |
| GET | `/api/owner/metrics/plan-distribution` | `getPlanDistribution` | Companies grouped by subscription plan. |
| POST | `/api/owner/metrics/snapshot` | `recordMetricsSnapshot` | Record today's platform metrics snapshot (idempotent per day). |
| GET | `/api/owner/metrics/history` | `getMetricsHistory` | Snapshot history; `days` clamped to 1–90 (default 30). |

## Security Model

- Class-level `@UseGuards(JwtAuthGuard)` on `OwnerController` — every request must carry a valid JWT.
- Per-route `@UseGuards(SystemRoleGuard)` + `@SystemRoles('SUPER_ADMIN')` — every endpoint additionally requires the `SUPER_ADMIN` system role in the JWT payload.
- State-changing operations (`setStorageLimit`, `setUserSuspendStatus`) write an `AuditLog` row with before/after values and the acting user.
- `setUserSuspendStatus` refuses to act without an authenticated acting user (`req.user.userId`).

## Service Behaviors (`OwnerService`)

- **Effective storage limit** = `max(planBaseLimitMb, ownerOverrideMb) + safetyNetMb`, where `safetyNetMb` defaults to 51200 MB (50 GB).
- **R2 folder sizing**: usage sums each company's `attachments/<companyId>/` and `receipts/<companyId>/` folders via `R2Service.getFolderSize`; per-company R2 errors are swallowed so one broken folder cannot abort a platform-wide snapshot.
- **`dbStorageMb` is a placeholder** — hardcoded `0` with a `TODO: implement per-company DB storage measurement`; usage percentages therefore reflect R2 only.
- **`getUsers`**: page defaults to 1; limit defaults to 20, clamped to 1–50; `query` matches email or name case-insensitively; each row includes the user's companies (with role) and last login (latest session `lastUsedAt`).
- **`setStorageLimit`**: `overrideMb` must be `null` or a non-negative integer; upserts the `StorageLimit` row and audits the change.
- **`setUserSuspendStatus`**: returns a no-op message when the user is already in the requested state; otherwise updates `suspended` and audits `SUSPEND` / `REACTIVATE`.
- **`recordMetricsSnapshot`**: if a snapshot already exists for the current day, returns it; otherwise records four metrics — `total_companies`, `total_users`, `total_db_storage_mb` (0), `total_r2_storage_mb`.
- **`getMetricsHistory`**: `days` clamped to 1–90 (default 30); groups the four metric names into per-timestamp snapshot objects and returns them oldest-first with the requested range.

## Module Wiring

- Imports: `AuthModule` (guards), `PrismaRepositoriesModule` (plus direct `PrismaService` provider), `CompaniesModule`.
- Providers: `OwnerService`, `PrismaService`. Exports: `OwnerService`.
- Registered in `app.module.ts`; standard NestJS layout (controller + service + module).

## Consumers

- Frontend `(platform-admin)` route group — `metrics`, `storage`, and `users` pages — call these endpoints through the shared axios `apiClient` (`/api/owner/...`).

## Testing

No spec file exists for this module (known gap). Coverage today is manual: log in as the seeded SUPER_ADMIN (see `prisma/seed-admin.ts`) and exercise the platform-admin pages. Natural first units to add under `src/__tests__/owner/`: effective-limit math, pagination clamping, and snapshot idempotency.

## Boundary vs Plan H-4

The full 9-section Platform Owner Dashboard (roadmap Plan H-4) is not built. What exists today is this backend module plus the three platform-admin pages (metrics/storage/users). This README documents what IS implemented; the H-4 expansion remains future work.
