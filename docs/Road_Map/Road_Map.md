# HaypBooks Roadmap

> **Last Updated:** August 14, 2026
> **App Live:** https://haypbooks.com | **API:** https://api.haypbooks.com
> **Infrastructure:** Hetzner CX33 VPS (4 vCPU, 8GB RAM, 80GB SSD) — Helsinki
> **Database:** Neon PostgreSQL (temporary, pending self-hosted migration)

---

## Production Status

All core infrastructure is deployed and operational:

| Component | Status | Details |
|---|---|---|
| Frontend | ✅ Live | https://haypbooks.com — Next.js 14, 342 static pages |
| Backend API | ✅ Live | https://api.haypbooks.com — NestJS, 588 Prisma models, PM2 managed |
| Database | ✅ Connected | Neon PostgreSQL, 40 migrations applied |
| SSL | ✅ Active | Let's Encrypt, auto-renewal via certbot |
| DNS | ✅ Configured | Porkbun — A records for haypbooks.com and api.haypbooks.com |
| Nginx | ✅ Running | 3 server blocks (frontend, API, default catch-all) |
| Email | ✅ Working | Resend SMTP (port 587 STARTTLS) — verification codes delivered |
| CSRF Protection | ✅ Fixed | Cross-subdomain cookie domain (.haypbooks.com) + JWT bypass |

---

## Immediate Priorities

### Priority 1: Cloudflare R2 Integration (File Uploads)

**Goal:** Replace multer local diskStorage with Cloudflare R2 object storage so uploaded files persist across deploys, scale horizontally, and are served via CDN.

**Why now:** Current `attachments.controller.ts` saves files to `/uploads/attachments/` on the VPS filesystem. Any redeploy or server restart loses these files. This is the last infrastructure piece needed for full production readiness.

**What needs to be achieved:**
- [ ] Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` in Backend
- [ ] Create `R2StorageModule` with S3-compatible client configured via env vars:
  - `R2_ENDPOINT` — Full S3-compatible endpoint (`https://<account-id>.r2.cloudflarestorage.com`)
  - `R2_ACCESS_KEY_ID` — R2 API token access key
  - `R2_SECRET_ACCESS_KEY` — R2 API token secret key
  - `R2_BUCKET_NAME` — Bucket name (e.g., `haypbooks-uploads`)
  - `R2_PUBLIC_URL` — Public access URL for the bucket (if using custom domain or R2.dev subdomain)
- [ ] Create presigned URL endpoints: `POST /api/companies/:id/attachments/presign` (upload) and `GET /api/companies/:id/attachments/:fileId/presign` (download)
- [ ] Replace `multer({ storage: diskStorage(...) })` in `attachments.controller.ts` with R2 upload logic using presigned URLs
- [ ] Update frontend attachment components to upload directly to R2 via presigned URL, then POST the file metadata to the backend
- [ ] Configure R2 bucket CORS to allow uploads from `https://haypbooks.com`
- [ ] Add `R2_*` env vars to VPS `.env` and local `.env.example`
- [ ] Test: upload attachment on journal entry → verify file is in R2 bucket → verify download works

**Expected output:** All file uploads in HaypBooks are stored in Cloudflare R2. Files survive server redeployments. Uploads go directly from browser to R2 (presigned URLs) to avoid proxying large files through the backend.

**Files to modify:**
- `Haypbooks/Backend/src/attachments/` — controller and service
- `Haypbooks/Backend/src/common/` — new R2 storage module
- `Haypbooks/Backend/package.json` — add S3 SDK dependencies
- `Haypbooks/Backend/.env.example` — add R2_* variables
- `Haypbooks/Frontend/src/` — attachment upload components

---

### Priority 2: Full End-to-End Post-Deployment Testing

**Goal:** Verify the complete user flow works in production end-to-end, documenting any issues found.

**What needs to be achieved:**
- [ ] Run `pm2 startup && pm2 save` on VPS to ensure processes survive reboots (prerequisite before testing)
- [ ] Register new account at https://haypbooks.com → verification email arrives via Resend → enter code → account created
- [ ] Complete onboarding flow (business info, offerings, fiscal/tax, branding, banking, review → Finish Setup)
- [ ] Create a company and verify workspace selection works
- [ ] Navigate Chart of Accounts → create/edit/archive accounts
- [ ] Create a Journal Entry with lines → verify debit/credit balancing
- [ ] Test all major module pages load without console errors (Banking, Settings, Reporting, Home Dashboard)
- [ ] Test file attachment upload (after R2 integration)
- [ ] Test logout and login again (session refresh flow)
- [ ] Document any bugs or issues found with screenshots and steps to reproduce

**Expected output:** A test report documenting pass/fail for each flow, with any bugs logged for fixing.

---

## Active Plans

### Plan: Self-Hosted PostgreSQL Migration

**Goal:** Migrate the database from Neon free tier to PostgreSQL 16 running on the Hetzner VPS to eliminate external database dependency and costs ($0/month vs $19+/month for Neon paid tiers).

**Prerequisite:** App must be stable on Hetzner with R2 integration and E2E testing complete.

**What needs to be achieved:**
- [ ] Install PostgreSQL 16 on Hetzner CX33 (8GB RAM — allocate 4GB to PostgreSQL via `shared_buffers` and `effective_cache_size`)
- [ ] Configure `pg_hba.conf` for local-only connections (no remote access for security)
- [ ] Create `haypbooks` database and `haypbooks` user with restricted permissions
- [ ] Run `prisma migrate deploy` to apply all 40 migrations to local PostgreSQL
- [ ] Seed with production data (pg_dump from Neon → pg_restore to local)
- [ ] Set up automated backup: daily `pg_dump` cron at 3AM Helsinki time, 7-day rotation, backup stored in `/var/backups/postgresql/`
- [ ] Update `DATABASE_URL` in VPS `.env` to point to local PostgreSQL
- [ ] Restart PM2 and verify all API endpoints return correct data
- [ ] Run full E2E test suite against local database
- [ ] Decommission Neon project (delete after 7-day verification window)

**Expected output:** PostgreSQL 16 running on VPS, all data migrated, automated daily backups, $0/month database cost, Neon project decommissioned.

**Risk:** VPS has 80GB SSD. Database size must be monitored. If it exceeds ~20GB, the self-hosted migration may need to be reconsidered.

---

### Plan M: HB_Owner Dashboard + Architecture Restructure

**Goal:** Separate the platform owner (JP) admin experience from client-facing apps. The owner should have a confidential admin dashboard, not be routed through the same workspace selection as clients.

**Prerequisite:** Backend role system (`platform_owner` role), multi-tenant admin API endpoints, subscription management backend. This is a major architectural plan spanning both frontend and backend.

**What needs to be achieved:**

**M-1: Route Restructure**
- [ ] Rename `(owner)/` route group to represent HB_Online (client-facing app)
- [ ] Rename `practice-hub/` to HB_Practice_Hub (accountant-facing app)
- [ ] Create new `(hb-owner)/` route group — confidential, NOT in workspace selection
- [ ] Update login flow: backend checks for `platform_owner` role → redirect to HB_Owner or workspace selection
- [ ] Workspace selection only between HB_Online and HB_Practice_Hub

**M-2: HB_Owner Dashboard — Core Pages**
- [ ] Overview dashboard (total clients, users, subscriptions, MRR, system health, activity feed)
- [ ] Client management (list all companies, search/filter, suspend, reactivate, delete, read-only access to client books)
- [ ] Subscription plan management (create/edit plans, pricing, upgrade/downgrade clients, payment history)
- [ ] User management (global user list, block/unblock by email or domain, delete, login history, force password reset)
- [ ] Activity & security (global audit log, login tracking, failed attempts, blocked domains, IP management)

**M-3: HB_Owner Dashboard — Advanced Pages**
- [ ] Platform configuration (feature flags, maintenance mode, announcement banner, email templates, API rate limits, storage quotas)
- [ ] Analytics (user growth, revenue trends, feature usage, churn analysis, most active clients)
- [ ] Support tools (support tickets, client feedback, impersonation mode for debugging)

**Expected output:** A separate, confidential admin dashboard accessible only to platform owners with full visibility and control over all tenants, users, and system configuration.

---

## Deferred (Backend-Blocked Stubs — 22 total)

These frontend pages exist as stubs but cannot be completed until backend Prisma models, controllers, and services are built. They will be addressed as dedicated module-specific backend+frontend plans.

| Module | Stub Count | Missing Backend |
|---|---|---|
| Inventory | 6 | cycle-counts, bundles, cost-adjustments, landed-costs, write-downs, zones |
| Payroll | 6 | bonuses-commissions, final-pay, payroll-adjustments, holiday-calendar, employee-documents, job-positions |
| Projects | 6 | contracts, templates, schedule, progress-billing + KPI UI (budget-vs-actual, profitability) |
| Time | 1 | KPI summary object (billable-time-review) |
| Period Close | 1 | sign-offs |
| Fixed Assets | 1 | insurance |
| Accounting | 1 | sign-offs |

---

## Unresolved Tech Debt

1. **Missing shared components** — LoadingSpinner, FilterPills not yet extracted from individual pages
2. **108 HaypDataTable pages** (Expenses, Sales) — Different pattern from other tables, intentionally not unified
3. **Employees page** — Uses `gray-*` classes, raw `fetch()`, `Loader2` — needs full rebuild
4. **3 custom detail pages** — chart-of-accounts, journal-entries/[id], budgets/[budgetId] — too custom for generic patterns
5. **Backend schema drift** — TimeEntry, TimerSession, ProjectMilestone field name mismatches between Prisma models and frontend types
6. **Reporting backend endpoints missing** — 6 category reports, 6 CSV exports, custom-reports CRUD, scheduled-reports CRUD endpoints don't exist on backend (same category as deferred stubs)
7. **Inconsistent API verbs** — Account deactivate uses DELETE, reactivate uses PUT for same state toggle

---

## PM2 Startup Persistence

**Status:** NOT YET CONFIGURED. PM2 processes will NOT survive a VPS reboot.

**Fix required on VPS:**
```bash
pm2 startup
pm2 save
```
This generates and enables a systemd service that auto-starts PM2 and all managed processes on boot. Must be run on the VPS as root.
