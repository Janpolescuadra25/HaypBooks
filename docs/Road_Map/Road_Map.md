# HaypBooks Frontend Roadmap
**Last Updated:** August 9, 2026  
**Branch:** `main` (80 commits ahead of origin)  
**Total Built Pages:** 349  
**ComingSoon Stubs Remaining:** 26  
**Service Files:** 25  

---

## Completed Modules (19)

| Module | Batches | Pages Built | Service File | Status |
|---|---|---|---|---|
| Budget | 5A-5B | 4 | budget.service.ts (10 methods) | ✅ Complete |
| Ledger Health | 7B-1/2 | 2 | accounting.service.ts | ✅ Complete |
| Tax | 7A-1-5 | 10 | tax.service.ts (12 methods) | ✅ Complete |
| Period Close | 8A-1/2 | 3 | accounting.service.ts | ⚠️ 1 deferred (sign-offs) |
| Fixed Assets | 8B-1/2 | 3 | accounting.service.ts | ⚠️ 1 deferred (insurance) |
| Inventory | 9A-1-4 | 13 | inventory.service.ts (15 methods) | ⚠️ 6 deferred |
| Payroll | 10A-1-5 | 13 | payroll.service.ts (14 methods) | ⚠️ 6 deferred |
| Organization | 12A-1/2 | 4 | organization.service.ts (5 methods) | ✅ Complete |
| Projects | 13A-1-4 | 8 | projects.service.ts (9 methods) | ⚠️ 6 deferred |
| Time | 14A-1/2 | 4 | time.service.ts (7 methods) | ⚠️ 1 deferred |
| Tasks & Approvals | E-1/E-2/E-3 | 10 | tasks-approvals.service.ts (9 methods) | ✅ Complete |
| Settings | F-1/F-2/F-3 | 12 | settings.service.ts (22 methods) | ✅ Complete |
| Compliance | G-1/G-2 | 6 | compliance.service.ts (20 methods) | ✅ Complete |
| Banking | pre-roadmap | 20 | banking.service.ts (45 methods) | ✅ Complete |
| Accountant Workspace | H | 1 | accountant-workspace.service.ts (4 methods) | ✅ Complete |
| Automation | I-1/I-2 | 6 | automation.service.ts (20 methods) | ✅ Complete |
| Integrations | J-1/J-2 | 8 | integration.service.ts (23 methods) | ✅ Complete |
| Reporting | L-1 | 8 | reporting.service.ts (20 methods) | ✅ Complete (L-1 + L-2) |
| Home Dashboard | K-1/K-2 | 6 | home.service.ts (5 methods) | ✅ Complete |

---

## Plan L: Reporting (✅ COMPLETE)

### L-1: ✅ Complete (commit 62e6396f)
- Created `reporting.service.ts` (20 methods: 6 category reports, 6 CSV exports, custom-reports CRUD, scheduled-reports CRUD)
- Built 6 category report pages: banking, expense, inventory, payroll, project, sales — each with date-range filter, data table with totals, CSV export
- Built 2 CRUD pages (table+modal pattern): custom-reports, scheduled-reports — full create/edit/delete with modal

### L-2: ✅ Complete (commit 0957d91e)
- Fixed URL convention in reporting.service.ts (20 methods → /reporting/* with query params)
- Added error state rendering with retry button to 6 category report pages
- Built analytics/analytics-dashboards — recharts KPI cards, bar + line charts, mock data
- Built custom-reports/report-builder — form + live preview, dynamic columns/filters, CSV download

---

## Deferred Stubs (22 total)

| Module | Stubs | Reason |
|---|---|---|
| Inventory | 6 | No backend (cycle-counts, bundles, cost-adjustments, landed-costs, write-downs, zones) |
| Payroll | 6 | No backend (bonuses-commissions, final-pay, payroll-adjustments, holiday-calendar, employee-documents, job-positions) |
| Projects | 6 | No backend (contracts, templates, schedule, progress-billing) + KPI UI (budget-vs-actual, profitability) |
| Time | 1 | KPI summary object (billable-time-review) |
| Period Close | 1 | No backend (sign-offs) |
| Fixed Assets | 1 | No backend (insurance) |
| Accounting | 1 | No backend (sign-offs) |

---

## Next Plans

### Immediate: N-3 — Code Quality Cleanup

| Task | Type | Description |
|---|---|---|
| Remove `as any` casts in accounting | Type safety | Replace ~30 `as any` / `catch (e: any)` with proper types across 4 accounting files |
| Remove dead `Star` import in OwnerSidebar | Dead code | Unused lucide-react `Star` import in sidebar component |
| Remove dead tanstack imports in HaypDataTable.types | Dead code | Unused `@tanstack/react-table` type imports |
| Consolidate 3 coming-soon components | Redundancy | Merge redundant ComingSoon/ComingSoonPage/ComingSoonCard into 1 |

### Plan N: Accounting Module Fixes (N-1 ✅, N-2 ✅, N-3 Pending)
Section 2 audit found 30 issues (7 critical, 13 significant, 10 minor). Top priorities:
- **N-1: Data-loss hotfixes** — Fix attachment upload, customerId payload, COA modal fields, remove console.logs (7 critical items)
- **N-2: UX improvements** — Add void reason modal, post confirmation, fix recurrence logic, fix contra styling, fix CSV import error reporting (13 significant items)
- **N-3: Code quality** — Remove 30+ `as any` casts, extract shared audit-log component, dead code cleanup (10 minor items)
- **Missing vs QB/ERPNext (10 items)** — Payment terms, FX revaluation logic, budget distribution (monthly), period close checklist, JE templates, account subtypes, cheque printing, cost center allocation, GL reconciliation, financial statement snapshots

### Post-Reporting: Deployment
See "Deployment Roadmap" section below.

### Plan M: HB_Owner Dashboard + Architecture Restructure (POST-L-2)

**Problem:** The current `(owner)` route treats the SaaS platform owner (JP) the same as a client. The platform owner should have a confidential admin dashboard separate from client-facing apps.

**Architecture Change:**
```
CURRENT (wrong):
  Login → Workspace Selection → (owner)/dashboard  (owner treated as client)

CORRECT:
  Owner credentials → HB_Owner dashboard (confidential, no workspace selection)
  Client credentials → Workspace Selection (HB_Online ↔ HB_Practice_Hub) → respective dashboard
```

**M-1: Route Restructure**
- Rename or clarify `(owner)/` route group to represent HB_Online (client-facing app)
- Rename `practice-hub/` to HB_Practice_Hub (accountant-facing app)
- Create new `(hb-owner)/` route group — confidential, NOT in workspace selection
- Update login flow: backend checks for "platform_owner" role → redirect to HB_Owner or workspace selection
- Keep workspace selection between HB_Online and HB_Practice_Hub only

**M-2: HB_Owner Dashboard — Core Pages**
- Overview dashboard (total clients, users, subscriptions, MRR, system health, activity feed)
- Client management (list all companies, search/filter, suspend, reactivate, delete, read-only access to client books)
- Subscription plan management (create/edit plans, pricing, upgrade/downgrade clients, payment history)
- User management (global user list, block/unblock by email or domain, delete, login history, force password reset)
- Activity & security (global audit log, login tracking, failed attempts, blocked domains, IP management)

**M-3: HB_Owner Dashboard — Advanced Pages**
- Platform configuration (feature flags, maintenance mode, announcement banner, email templates, API rate limits, storage quotas)
- Analytics (user growth, revenue trends, feature usage, churn analysis, most active clients)
- Support tools (support tickets, client feedback, impersonation mode for debugging)

**Dependencies:** Requires backend role system (platform_owner role), multi-tenant admin API endpoints, subscription management backend. This is a major architectural plan that spans both frontend and backend.

### Deferred (22+ stubs, backend-blocked)
These require backend Prisma models, controllers, and services before frontend can be built. Tracked in Deferred Stubs table above. Will be addressed as dedicated module-specific backend+frontend plans.

---

## Known Tech Debt

1. ~~**Header pattern drift**~~ — ✅ Resolved. 31 pages normalized via Plan C (C-1 through C-4)
2. ~~**Table styling drift**~~ — ✅ Resolved. S1-S4 structural fixes applied across all Plan C batches
3. **Missing shared components** — LoadingSpinner, FilterPills not yet extracted
4. ~~**DashboardHeader.tsx + GlassCard.tsx**~~ — ✅ Deleted in Plan D (dead code). Main dashboard already built via OwnerDashboard.tsx (18KB, fully functional). Actual blockers: 5 ComingSoon stubs need chart library + domain visualizations
5. **108 HaypDataTable pages** (Expenses, Sales) — Different pattern, intentionally not unified
6. **Employees page** — Uses `gray-*`, raw `fetch()`, `Loader2` — needs full rebuild (C-5 deferred)
7. **3 custom detail pages** — chart-of-accounts, journal-entries/[id], budgets/[budgetId] — too custom for Plan C
8. **Backend schema drift** — TimeEntry, TimerSession, ProjectMilestone field name mismatches
9. ~~**Reporting URL convention mismatch** — `reporting.service.ts` uses `/companies/${companyId}/reporting/*` but all existing reporting pages and the backend controller use `/reporting/*` with `companyId` as query param. Frontend pages will 404 until fixed.~~ — ✅ Resolved (L-2, commit 0957d91e)
10. ~~**Reporting error states not rendered** — 6 category report pages capture `error` state but never render it in JSX. Errors are silently swallowed.~~ — ✅ Resolved (L-2, commit 0957d91e)
11. **Reporting backend endpoints missing** — 6 category reports, 6 CSV exports, custom-reports CRUD, scheduled-reports CRUD endpoints don't exist on backend. Same category as 22 deferred stubs.
12. **Heavy `any` typing in reporting service** — No TypeScript interfaces for report row shapes or request/response payloads.
13. ~~**Dead code: 8 unused component files** — Toaster.tsx, CenteredModal.tsx, Breadcrumbs.tsx, BackButton.tsx, BackBar.tsx, StatusBadge.tsx (root-level), layout/tabs/SectionTabBar.tsx, layout/tabs/SectionBreadcrumb.tsx — all have zero imports~~ — ✅ Resolved (N-2, commit 2c11c32d)
14. ~~**Dual toast systems** — ToastProvider.tsx (canonical, 40+ consumers) and ui/Toast.tsx (4 expenses layouts) export same names with different APIs and z-indices; Toaster.tsx (third, dead code) pollutes window global~~ — ✅ Resolved (N-2, commit c9b450e8)
15. ~~**TopBar.tsx has non-functional buttons** — "PORTFOLIO", "TASK REMINDER", "RECONCILE ACCOUNTS" are decorative (onClick does nothing); user menu links are `href="#"` to non-existent pages~~ — ✅ Resolved (N-2, commit 69f856ad)
16. ~~**HaypReportTable customize panel is cosmetic** — Number format, show cents, negative format, row height toggles don't affect rendering; console.log left in production code~~ — ✅ Resolved (N-2, commit 2c11c32d)
17. **Three "coming soon" components** — TabComingSoon.tsx, ComingSoonPage.tsx, TabPlaceholder.tsx serve the same purpose with different UIs
18. **OwnerSidebar has dead Star import** — lucide-react Star imported but never used
19. **HaypDataTable.types.ts has dead tanstack imports** — ColumnDef, SortingState, ColumnOrderState, VisibilityState, RowSelectionState, ColumnSizingState imported but unused
20. ~~**JE attachments are discarded on create/edit** — File input only increments `attachmentCount`; actual files never uploaded to backend. journal-entries/new and journal-entries/[id] both affected. (Accounting audit #1, #3)~~ — ✅ Resolved (N-1, commit 3aee1f1e)
21. ~~**JE customerId silently dropped from payload** — Form collects customer per line but `validLines.map()` only sends accountId/debit/credit/description. (Accounting audit #2)~~ — ✅ Resolved (N-1, commit 3aee1f1e)
22. ~~**COA modal drops 4 form fields on save** — handleSave sends only {code, name, type}; parentId, description, isHeader, normalSide collected in form are silently discarded. (Accounting audit #4)~~ — ✅ Resolved (N-1, commit 3aee1f1e)
23. ~~**console.log leaks financial data** — journal-entries/new page logs full JE payload (amounts, accounts) to browser console. 3 more in GeneralLedgerPage. (Accounting audit #5, #6)~~ — ✅ Resolved (N-1, commit 3aee1f1e)
24. ~~**Contra account styling never applies** — `getTypeRowStyle` checks `CONTRA_` (underscore) but types use spaces (`Contra Asset`). Falls through to gray. (Accounting audit #7)~~ — ✅ Resolved (N-2, commit 69f856ad)
25. ~~**Recurrence next-run always +1 month** — Yearly/Quarterly JEs show next run as next month regardless of interval. (Accounting audit #8)~~ — ✅ Resolved (N-2, commit 69f856ad)
26. ~~**JE void has no reason UI** — Hardcoded `{reason:'Voided by user'}`; Post action has no confirmation dialog. (Accounting audit #13, #14)~~ — ✅ Resolved (N-2, commit 69f856ad)
27. ~~**COA CSV import swallows per-row errors** — Failed imports reported as successful. (Accounting audit #16)~~ — ✅ Resolved (N-2, commit 69f856ad)
28. **Inconsistent API verbs** — Account deactivate uses DELETE, reactivate uses PUT for same state toggle. (Accounting audit #17)
29. **30+ `as any` / `catch (e: any)` in accounting module** — Reduces TypeScript safety across all accounting pages. (Accounting audit #10, #11, #27)

---

## Commit History

| Commit | Batch | Description |
|---|---|---|
| `df2623d4` | C-1 | Normalize 10 Inventory pages (11 systematic fixes) |
| `78f70968` | C-1-fix | Apply structural + date + search fixes to Inventory |
| `65119adc` | C-1-fix | Complete structural normalization for Inventory |
| `cc2365ac` | C-2 | Normalize 10 Tax pages (11 systematic fixes) |
| `351908ff` | C-2-fix | Structural fixes for 12 Tax module tables (S1/S2/S3/Fix6/Fix7/outer-div) |
| `89127632` | C-3 | Normalize 8 Accounting + Budgeting pages to Pattern A (15-fix recipe) |
| `389078fc` | C-4 | Normalize 3 special case inventory files (lot-serial-tracking, inventory-valuation, bin-locations) |
| `c4698373` | docs | Update Road_Map.md — Plan C complete, condense and align metrics |
| `ab5a289b` | D | Remove dead code, fix ComingSoonPage palette drift, remove stale config |
| `2e0352b9` | docs | Update Road_Map.md — add Plan D, fix tech debt #4 |
| `b5349eeb` | security | Change RBAC default role from 'admin' to 'viewer' |
| `fc7a9e4b` | E-1 | Add tasks-approvals service, domain types, my-approvals page |
| `c55ea3fe` | E-2 | Build 4 my-work list pages |
| `27a3aba1` | E-3 | Build 5 management list pages, module complete |
| `1b302b7e` | F-1 | Establish form gold standard with company-details & fiscal-year-setup |
| `a6c16011` | F-2 | Table+modal pattern with numbering-sequences, custom-fields, data-backup |
| `bfe3e938` | F-3 | User security pages, Settings module complete (12/12) |
| `7f9a3a2c` | docs | Consolidate roadmap — Plan F complete, Settings to Completed Modules |
| `4e1b87d5` | G-1 | Add compliance service + internal-controls, control-testing, policy-management |
| `19bbf943` | G-1-fix | Remove as const from constant arrays to fix tsc errors |
| `5296439c` | G-2 | Add monitoring pages — issue-tracking and fraud-detection-rules |
| `6b6d4b6e` | docs | Consolidate roadmap — Plan G complete, Compliance to Completed Modules |
| `168cee6b` | H | Add statement archive + client requests pages (Banking + Accountant Workspace complete) |
| `650f64ab` | docs | Consolidate roadmap — Plan H complete, Banking and Accountant Workspace to Completed Modules |
| `112e699f` | I-1 | Add automation service + workflow/rules/ai-bookkeeping pages |
| `27065d18` | I-2 | Add smart-matching, automation-logs, error-queue pages (Automation complete) |
| `4c626883` | docs | Consolidate roadmap — Plan I complete, Automation to Completed Modules |
| `a391baac` | J-1 | Create integration service + api-keys, webhooks, installed-apps, integration-logs |
| `fd225b02` | J-2 | Export-data, import-data, app-marketplace, developer-sandbox (Integrations complete) |
| `6b8f0a7d` | docs | Consolidate roadmap — Plan J complete, Integrations to Completed Modules |
| `23aa6c85` | K-1 | Setup-center, shortcuts, notifications (3 chart-free dashboard pages) |
| `a1f55791` | K-2 | Install recharts + business-health and performance dashboard pages |
| `a5c79d8b` | docs | Consolidate roadmap — Plan K complete, Home Dashboard to Completed Modules |
| `62e6396f` | L-1 | feat(reporting): add reporting service + 8 pages — L-1 (6 category reports + 2 CRUD) |
| `3b054483` | docs | Add Cloudflare R2 + detailed deployment guide to roadmap |
| `8979e51b` | docs | Add Section 1 audit findings + HB_Owner architectural plan to roadmap |
| `fb813da4` | docs | Add accounting module audit findings (30 issues) to roadmap |
| `0957d91e` | L-2 | feat(reporting): complete L-2 — fix URL convention, error rendering, add analytics dashboards + report builder |
| `3aee1f1e` | N-1 | fix(accounting): N-1 critical hotfixes — attachment upload, customerId payload, COA modal fields, remove console.logs |

## Deployment Roadmap

### Tagline
"HaypBooks — the heartbeat of your business"

### Stack
| Service | Purpose | Provider |
|---|---|---|
| Frontend | Next.js app, auto-deploys from GitHub | Vercel |
| Backend | API server, connects to Neon | Render.com |
| Database | Serverless PostgreSQL | Neon |
| Email | Transactional emails (invoices, receipts, notifications) | SendGrid |
| File Storage | Attachment uploads (receipts, documents, invoices) | Cloudflare R2 |
| DNS | Domain management | Porkbun (haypbooks.com) |

### ⚠️ Deployment Prerequisites
Before deploying, the following backend code changes are required:

1. **R2 Integration (REQUIRED — Render has an ephemeral filesystem)**
   - Render's filesystem is ephemeral — files saved to local disk are **lost on every deploy or restart**
   - The current backend uses multer `diskStorage` saving to `uploads/attachments/` — this will NOT work on Render
   - Required changes:
     - Install `@aws-sdk/client-s3` in Backend (`npm install @aws-sdk/client-s3`)
     - Replace multer `diskStorage` with S3-compatible upload in `attachments.controller.ts` using the R2 endpoint
     - Add R2 env vars to `Haypbooks/Backend/.env.production.example`: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
     - Update the `fileUrl` stored in database from local path to R2 public URL
   - This should be completed as a dedicated task before production deployment

### Deployment Order
1. **Neon** → Create database, get connection string, run migrations
2. **Cloudflare R2** → Create bucket, get credentials, configure CORS
3. **Render** → Deploy backend, set all env vars (including R2 vars after integration)
4. **SendGrid** → Get API key, configure domain authentication
5. **Vercel** → Connect GitHub repo, set env vars, deploy
6. **Porkbun** → Configure all DNS records (Vercel, Render, SendGrid, R2)
7. **Testing** → End-to-end verification of all integrations

### Environment Variables
Source of truth: `Haypbooks/Backend/.env.production.example` and `Haypbooks/Frontend/.env.local.example`.

**Critical production overrides** (set in each platform's dashboard, never committed to git):

**Backend (Render):**
| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://[user]:[pass]@[host]/[db]?sslmode=require` | From Neon dashboard |
| `SENDGRID_API_KEY` | `SG.xxxxxxxxxxxx` | From SendGrid dashboard |
| `SENDGRID_FROM` | `noreply@haypbooks.com` | Verified sender in SendGrid |
| `JWT_SECRET` | Random 64-char string | Generate with `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | Random 64-char string | Generate with `openssl rand -hex 32` |
| `HMAC_KEY` | Random 64 hex chars | Phone number hashing — `openssl rand -hex 32` |
| `FIELD_ENCRYPTION_KEY` | Random 64 hex chars | Sensitive field encryption — `openssl rand -hex 32` |
| `CORS_ORIGINS` | `https://haypbooks.com` | Frontend URL |
| `FRONTEND_URL` | `https://haypbooks.com` | Used in email links and CORS |
| `PORT` | `4000` | Backend port |
| `R2_ACCOUNT_ID` | Cloudflare account ID | From R2 dashboard — **requires backend R2 integration first** |
| `R2_ACCESS_KEY_ID` | R2 API access key | From R2 dashboard → Manage R2 API Tokens — **requires backend R2 integration first** |
| `R2_SECRET_ACCESS_KEY` | R2 API secret key | From R2 dashboard → Manage R2 API Tokens — **requires backend R2 integration first** |
| `R2_BUCKET_NAME` | `haypbooks-attachments` | Your bucket name — **requires backend R2 integration first** |
| `R2_PUBLIC_URL` | `https://attachments.haypbooks.com` | Public URL for uploaded files — **requires backend R2 integration first** |

**Frontend (Vercel):**
| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.haypbooks.com` | Backend API URL |
| `NEXT_PUBLIC_USE_MOCK_API` | `false` | Must be false in production |
| `NEXT_PUBLIC_ENABLE_TAGS` | `true` | Feature flag |
| `NEXT_PUBLIC_SITE_URL` | `https://haypbooks.com` | Used by server-url.ts |

---

### Step-by-Step Deployment Guide

#### 1. Neon — Database Setup
1. Go to [neon.tech](https://neon.tech) and sign up / log in
2. Click **"Create Project"**
3. Name it `haypbooks-db`, choose the closest region to your users
4. Select **"Plan"** — Free tier is fine to start, upgrade as needed
5. After creation, copy the **connection string** (format: `postgresql://[user]:[pass]@[ep-xxx].us-east-2.aws.neon.tech/[db]?sslmode=require`)
6. Go to the **"Branches"** tab — ensure you have a `main` branch (default)
7. Go to **"Connection Pooling"** (under Settings) — enable it for better performance. The pooled connection string uses port `5432` with `-pooler` in the hostname
8. Save the connection string — you'll need it for Render env vars
9. **For Prisma migrations:** After deploying Render, SSH into the Render service or run locally with the production DATABASE_URL:
   ```
   npx prisma migrate deploy
   ```

#### 2. Cloudflare R2 — File Storage Setup
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) and sign up / log in
2. In the left sidebar, click **"R2 Object Storage"**
3. Click **"Create Bucket"**
4. Bucket name: `haypbooks-attachments` (must be globally unique)
5. Choose the closest location to your users
6. After creation, go to the bucket **Settings** tab
7. **Configure CORS policy:**
   - Go to Settings → CORS Policy
   - Add the following CORS configuration:
   ```json
   [
     {
       "AllowedOrigins": ["https://haypbooks.com", "https://www.haypbooks.com"],
       "AllowedMethods": ["GET", "PUT", "DELETE", "HEAD"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 86400
     }
   ]
   ```
8. **Get API credentials:**
   - Go to R2 → **Manage R2 API Tokens** (top right)
   - Click **"Create API Token"**
   - Permissions: **Object Read & Write**
   - Specify bucket: `haypbooks-attachments` (or apply to all)
   - Copy the **Access Key ID** and **Secret Access Key** — save these securely
   - Also note your **Cloudflare Account ID** (visible in the R2 dashboard URL or any API token page)
9. **(Optional) Custom domain for attachments:**
   - In the bucket settings, go to **"Custom Domains"**
   - Click **"Connect Domain"** → enter `attachments.haypbooks.com`
   - Cloudflare will provide DNS records to add at Porkbun (see step 6)
10. **Note:** R2 bucket setup can be done now, but the **backend code integration** (replacing multer diskStorage with S3 upload) must be completed before uploads will work in production. See "Deployment Prerequisites" above.

#### 3. Render — Backend Deployment
1. Go to [render.com](https://render.com) and sign up / log in (GitHub SSO recommended)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository (`Janpolescuadra25/HaypBooks`)
4. **Configure the service:**
   - **Name:** `haypbooks-api`
   - **Root Directory:** `Haypbooks` (monorepo root — required because Backend's package.json has `"haypbooks-frontend": "file:../Frontend"`)
   - **Build Command:** `cd Backend && npm install && npm run build`
   - **Start Command:** `cd Backend && node dist/main.js`
   - **Instance Type:** Free to start (Starter $7/mo recommended for production — free tier spins down after 15 min inactivity causing ~30s cold starts, and **has an ephemeral filesystem** so local file uploads are lost on every deploy)
5. **Environment variables** — Add ALL backend env vars from the table above (DATABASE_URL, SENDGRID_API_KEY, JWT_SECRET, etc.)
   - Add R2 vars only after completing the backend R2 integration (see Prerequisites)
6. Click **"Create Web Service"**
7. Wait for the build to complete. Monitor the build logs for errors.
8. After successful deploy, copy the service URL (e.g., `https://haypbooks-api.onrender.com`)
9. **If build fails:** Common issues:
    - TypeScript errors — run `cd Backend && npx tsc --noEmit` locally to check
    - Missing env vars at build time — some build steps may need vars set early
    - Monorepo path issue — verify root directory is `Haypbooks`, not `Haypbooks/Backend`

#### 4. SendGrid — Email Setup
1. Go to [sendgrid.com](https://sendgrid.com) and sign up (free tier allows 100 emails/day)
2. Complete account verification (email confirmation)
3. Go to **Settings** → **Sender Authentication**
4. **Domain Authentication (recommended over single sender):**
   - Click **"Get Started"** under "Domain Authentication"
   - Enter domain: `haypbooks.com`
   - SendGrid will generate DNS records (TXT and CNAME records for SPF and DKIM)
   - **Do NOT add these to Porkbun yet** — do it in step 6 alongside all other DNS records
5. **Single Sender Verification (quick alternative):**
   - Go to Settings → **Sender Authentication** → **Single Sender Verification**
   - Add: `noreply@haypbooks.com`
   - SendGrid will send a verification email — click the link
6. **Get API Key:**
   - Go to **Settings** → **API Keys**
   - Click **"Create API Key"**
   - Name: `HaypBooks Production`
   - Permissions: **Restricted Access** → select "Mail Send" → "Full Access"
   - Copy the API key (shown only once) — add to Render env vars as `SENDGRID_API_KEY`

#### 5. Vercel — Frontend Deployment
1. Go to [vercel.com](https://vercel.com) and sign up / log in (GitHub SSO recommended)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository (`Janpolescuadra25/HaypBooks`)
4. **Configure the project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** Click "Edit" → select `Haypbooks/Frontend`
   - **Build Command:** `npm run build` (default, should auto-detect)
   - **Output Directory:** Leave default (`.next`)
5. **Environment Variables** — Add ALL frontend env vars from the table above (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_USE_MOCK_API=false, etc.)
6. Click **"Deploy"**
7. Wait for the build to complete
8. After deploy, Vercel assigns a preview URL (e.g., `haypbooks-frontend.vercel.app`)
9. Go to **Project Settings** → **Domains**
10. Add: `haypbooks.com` and `www.haypbooks.com`
11. Vercel will show DNS records needed — add them at Porkbun in step 6

#### 6. Porkbun — DNS Configuration
1. Go to [porkbun.com](https://porkbun.com) and log in
2. Go to your domain `haypbooks.com` → **DNS Management**
3. **Remove any existing records** that conflict with the ones below (check carefully)

4. **Add Vercel records:**
   | Type | Name | Value | Notes |
   |---|---|---|---|
   | A | `@` | `76.76.21.21` | Points haypbooks.com to Vercel |
   | CNAME | `www` | `cname.vercel-dns.com` | Points www subdomain to Vercel |

5. **Add Render record:**
   | Type | Name | Value | Notes |
   |---|---|---|---|
   | CNAME | `api` | `haypbooks-api.onrender.com` | Points api.haypbooks.com to Render backend |

6. **Add SendGrid records** (from SendGrid Dashboard → Settings → Sender Authentication → your domain → "View DNS Records"):
   | Type | Name | Value | Notes |
   |---|---|---|---|
   | TXT | `@` | (from SendGrid) | SPF record — copy exact value from SendGrid dashboard |
   | CNAME | (from SendGrid) | (from SendGrid) | DKIM record 1 — copy exact hostname and value from SendGrid |
   | CNAME | (from SendGrid) | (from SendGrid) | DKIM record 2 — copy exact hostname and value from SendGrid |
   | CNAME | (from SendGrid) | (from SendGrid) | DKIM record 3 — copy exact hostname and value from SendGrid |

   **Important:** SendGrid generates unique DNS records per domain. Do NOT guess the values — always copy the exact hostnames and values from your SendGrid dashboard's "View DNS Records" button.

7. **Add Cloudflare R2 records** (if using custom domain for attachments):
   | Type | Name | Value | Notes |
   |---|---|---|---|
   | CNAME | `attachments` | (from Cloudflare R2 custom domain setup) | Provided in R2 bucket settings → Custom Domains |

8. **Wait for DNS propagation** — can take up to 48 hours, usually 5-30 minutes

9. **Verify DNS:** Use [dnschecker.org](https://dnschecker.org) to check each record

#### 7. Post-Deployment Testing
After all DNS records propagate, verify each service:

- **Frontend:** Visit `https://haypbooks.com` — should load the HaypBooks app
- **Backend API:** Visit `https://api.haypbooks.com/api` or any health endpoint — should return a response (not a browser error)
- **Auth flow:** Sign up / log in on the frontend — should hit the backend API successfully
- **Database:** Create a test company after login — data should persist (verify by refreshing)
- **Email:** Trigger a transactional email (e.g., send an invoice) — check email arrives at the recipient
- **File upload:** Upload a receipt/attachment — **requires R2 backend integration first** (see Prerequisites). After integration, verify file is stored in R2 and retrievable via the public URL
- **CORS:** Verify no CORS errors in browser console (both frontend↔backend and frontend↔R2)

### Render Deployment Note
The backend has a monorepo dependency (`"haypbooks-frontend": "file:../Frontend"` in Backend's package.json). The Render service root must be set to `Haypbooks/` (the monorepo root, not `Haypbooks/Backend/`). Build command: `cd Backend && npm install && npm run build`. Start command: `cd Backend && node dist/main.js`. **Render's filesystem is ephemeral** — any files saved to local disk (including multer uploads) are lost on every deploy or restart, which is why R2 integration is a production requirement.

**Status:** Plan L complete. Frontend ready for deployment after R2 backend integration. JP executes deployment steps manually.
