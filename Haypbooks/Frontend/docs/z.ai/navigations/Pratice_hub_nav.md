# Haypbooks — Practice Hub Navigation Reference

> **Source of truth:** `src/app/practice-hub/page.tsx` → `const NAV`  
> **Component:** `src/app/practice-hub/page.tsx` (self-contained SPA)

---

## Architecture

The Practice Hub is a **Single-Page Application (SPA)** — all navigation is managed by internal React state, not the Next.js file system router.

| Property | Detail |
|----------|--------|
| **Base URL** | `/practice-hub` |
| **URL pattern** | `/practice-hub?section={sectionKey}&page={pageKey}` |
| **Nav depth** | 2 levels — Primary (section) + Secondary (page item) |
| **State variables** | `activeSection`, `activePage` |
| **Tertiary nav** | None — the Practice Hub is flat 2-level only |
| **Sidebar** | Left vertical nav — section buttons + horizontal item bar beneath header |

### Standalone Routes (outside SPA)

These are real Next.js pages, **not** part of the SPA navigation:

| Path | Description |
|------|-------------|
| `/practice-hub/client-connect/mail` | Client Connect mail page (separate `page.tsx`) |

---

## Primary Navigation — 9 Sections

| # | Key | Label | Icon |
|---|-----|-------|------|
| 1 | `home` | Home | LayoutDashboard |
| 2 | `clients` | Clients | Users |
| 3 | `work` | Work Mgmt | ListChecks |
| 4 | `accountant` | Workspace | BriefcaseBusiness |
| 5 | `billing` | Billing | Receipt |
| 6 | `analytics` | Analytics | PieChart |
| 7 | `team` | Team | UsersRound |
| 8 | `communication` | Communication | MessageSquare |
| 9 | `settings` | Settings | Settings |

---

## Section 1 · `home` — Home

**URL:** `/practice-hub?section=home&page={key}`

| Key | Label | Icon |
|-----|-------|------|
| `dashboard` | Dashboard | LayoutDashboard |
| `practice-health` | Practice Health | HeartPulse |
| `performance` | Performance | TrendingUp |
| `deadlines-home` | Deadlines | AlertCircle |
| `shortcuts` | Shortcuts | Zap |
| `setup-center` | Setup Center | Layers |
| `notifications` | Notifications Inbox | Bell |
| `help` | Help & Support | HelpCircle |

---

## Section 2 · `clients` — Clients

**URL:** `/practice-hub?section=clients&page={key}`

| Key | Label | Icon |
|-----|-------|------|
| `client-list` | My Clients | Users |
| `client-onboarding` | Client Onboarding | UserPlus |
| `client-documents` | Client Documents | FolderOpen |
| `client-portal` | Client Portal | Globe |
| `client-crm` | Client CRM | Filter |
| `client-groups` | Client Groups | Tag |
| `client-transitions` | Client Transitions | ArrowUpRight |
| `communications` | Communications | MessageSquare |

---

## Section 3 · `work` — Work Mgmt

**URL:** `/practice-hub?section=work&page={key}`

| Key | Label | Icon |
|-----|-------|------|
| `work-queue` | Work Queue | ListChecks |
| `monthly-close` | Monthly Close | RefreshCw |
| `annual-engagements` | Annual Engagements | BookMarked |
| `work-in-progress` | WIP Ledger | BarChart |
| `calendar` | Calendar | CalendarDays |
| `deadline-tracker` | Deadline Tracker | AlertCircle |

---

## Section 4 · `accountant` — Workspace

**URL:** `/practice-hub?section=accountant&page={key}`

| Key | Label | Icon |
|-----|-------|------|
| `books-review` | Books Review | BookMarked |
| `reconciliation` | Reconciliation Hub | RefreshCw |
| `adjusting` | Adjusting Entries | FileDiff |
| `client-requests` | Client Requests | ClipboardList |
| `audit-trail` | Audit Trail | Eye |
| `period-close` | Period Close | CheckCircle2 |
| `expert-help` | Expert Help | HelpCircle |

---

## Section 5 · `billing` — Billing

**URL:** `/practice-hub?section=billing&page={key}`

| Key | Label | Icon |
|-----|-------|------|
| `invoice-generation` | Generate Invoices | FileText |
| `invoice-list` | Invoice List | LayoutGrid |
| `recurring-billing` | Recurring Billing | RefreshCw |
| `payment-tracking` | Payment Tracking | DollarSign |
| `rate-cards` | Rate Cards | FileSpreadsheet |
| `retainers` | Retainers | Briefcase |
| `collections` | Collections | AlertCircle |
| `write-offs` | Write-offs | Trash2 |

---

## Section 6 · `analytics` — Analytics

**URL:** `/practice-hub?section=analytics&page={key}`

| Key | Label | Icon |
|-----|-------|------|
| `practice-overview` | Practice Overview | BarChart3 |
| `client-analytics` | Client Analytics | Users |
| `staff-reports` | Staff Reports | UsersRound |
| `billing-reports` | Billing Reports | Receipt |
| `work-reports` | Work Reports | ListChecks |
| `financial-reports` | Financial Reports | FileSpreadsheet |

---

## Section 7 · `team` — Team

**URL:** `/practice-hub?section=team&page={key}`

| Key | Label | Icon |
|-----|-------|------|
| `team-members` | Team Members | Users |
| `time-off` | Time Off | CalendarDays |
| `schedule` | Schedule | Calendar |
| `team-performance` | Performance | Award |
| `team-capacity` | Capacity View | Target |

---

## Section 8 · `communication` — Communication

**URL:** `/practice-hub?section=communication&page={key}`

| Key | Label | Icon |
|-----|-------|------|
| `team-chat` | Team Chat | MessageSquare |
| `client-communication` | Client Messages | Mail |
| `announcements` | Announcements | Bell |
| `document-collab` | Document Collaboration | FileText |
| `comm-settings` | Comm Settings | Settings |

---

## Section 9 · `settings` — Settings

**URL:** `/practice-hub?section=settings&page={key}`

| Key | Label | Icon |
|-----|-------|------|
| `profile` | Practice Profile | Building2 |
| `team-management` | Team Management | UsersRound |
| `templates` | Templates | LayoutTemplate |
| `automation` | Automation | Zap |
| `integrations` | Integrations | Layers |
| `subscriptions` | Subscriptions | CreditCard |
| `security` | Security | ShieldCheck |
| `data-management` | Data Management | Archive |
| `localization` | Localization | Globe |

---

## Complete Navigation Map

```
Practice Hub (/practice-hub)
│
├── home
│   ├── dashboard
│   ├── practice-health
│   ├── performance
│   ├── deadlines-home
│   ├── shortcuts
│   ├── setup-center
│   ├── notifications
│   └── help
│
├── clients
│   ├── client-list
│   ├── client-onboarding
│   ├── client-documents
│   ├── client-portal
│   ├── client-crm
│   ├── client-groups
│   ├── client-transitions
│   └── communications
│
├── work
│   ├── work-queue
│   ├── monthly-close
│   ├── annual-engagements
│   ├── work-in-progress
│   ├── calendar
│   └── deadline-tracker
│
├── accountant
│   ├── books-review
│   ├── reconciliation
│   ├── adjusting
│   ├── client-requests
│   ├── audit-trail
│   ├── period-close
│   └── expert-help
│
├── billing
│   ├── invoice-generation
│   ├── invoice-list
│   ├── recurring-billing
│   ├── payment-tracking
│   ├── rate-cards
│   ├── retainers
│   ├── collections
│   └── write-offs
│
├── analytics
│   ├── practice-overview
│   ├── client-analytics
│   ├── staff-reports
│   ├── billing-reports
│   ├── work-reports
│   └── financial-reports
│
├── team
│   ├── team-members
│   ├── time-off
│   ├── schedule
│   ├── team-performance
│   └── team-capacity
│
├── communication
│   ├── team-chat
│   ├── client-communication
│   ├── announcements
│   ├── document-collab
│   └── comm-settings
│
└── settings
    ├── profile
    ├── team-management
    ├── templates
    ├── automation
    ├── integrations
    ├── subscriptions
    ├── security
    ├── data-management
    └── localization

Standalone (outside SPA)
└── /practice-hub/client-connect/mail
```

---

## Nav Counts

| Section | Item Count |
|---------|------------|
| home | 8 |
| clients | 8 |
| work | 6 |
| accountant | 7 |
| billing | 8 |
| analytics | 6 |
| team | 5 |
| communication | 5 |
| settings | 9 |
| **Total** | **62** |

---

*Last updated from source: `src/app/practice-hub/page.tsx` — March 2026*
