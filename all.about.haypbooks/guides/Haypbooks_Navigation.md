# HaypBooks Navigation

This page documents HaypBooks’ current navigation and global actions, aligned with the implemented frontend. A QuickBooks Online navigation reference remains below for comparison and migration mapping.

## Overview
- Global top bar: brand, Activity (overall log), +New (create), Role switcher, Upgrade, and user menu.
- Secondary header: page title and a short tagline (now slightly smaller for readability). No Activity button here anymore.
- Sidebar (left): primary sections; visibility is gated by role. Mobile uses a hamburger button with focus-trap and escape-to-close.
- Sales is the hub for all receivables workflows; Invoices and Customers are not in the left sidebar, by design.

## Global top bar
- Logo and “HaypBooks” brand label at left.
- Activity: moved into the top bar, immediately to the left of +New. This opens the overall activity log.
- +New: global create menu (Invoice, Sales Receipt, Journal, Vendor/Customer when permitted, etc.).
- Role Switcher: quickly emulate roles for RBAC testing/training.
- Upgrade: CTA button.
- User Menu: profile/session controls.

Accessibility and behavior:
- Keyboard focus order is logical; buttons have aria-labels (e.g., “View all recent activity”).
- Dedicated print views have been removed; use the browser's print from the primary page when needed.

## Secondary header
- Displays the page title based on the current path (e.g., Dashboard, Sales, Bills, Reports).
- Tagline (smaller text):
  - “Your finances at a glance” on Dashboard
  - “Manage customers, quotes, and sales workflows” on Sales
  - “Create, send, and track invoices and payments” on Invoices
  - “Capture vendor bills and manage payables” on Bills
  - “View P&L, Balance Sheet, Cash Flow, and more” on Reports
- Note: The Activity button formerly shown in this header is now in the top bar.

## Sidebar (left navigation)
Current items (role-gated):
- Dashboard
- Sales
- Expenses
- Transactions
- Reports
- Payroll
- Time
- Inventory
- Projects
- Budgets
- Tasks
- Books review
- Client overview
- My accountant
- Apps
- Taxes
- Commerce
- Accounts
- Periods

Notes:
- Invoices and Customers are intentionally not in the left nav; they live under the Sales section as sub-pages to streamline A/R workflows.
- Transactions hub spans two path roots for parity with reference patterns: the bank feed center at `/bank-transactions` and additional tools under `/transactions/*` (reconcile, chart of accounts, receipts, recurring, tags). Links in the sub‑nav route appropriately.
- Some sections may be hidden by role/plan; friendly 403s are shown if navigated directly.

Mobile: the sidebar opens via a hamburger in the top bar; focus is trapped within the drawer and closes with Escape or background click.

## Sidebar map (current app)
This section lists each primary sidebar item with its in-app sub-navigation and route mapping. Sub-navs are rendered via section layouts to prevent flicker and must appear only once per hub (pages should not render their own sub‑navs).

- Dashboard — `/`
- Sales (hub)
  - Overview: `/sales`
  - All sales: `/sales/all-sales`
  - Invoices: `/sales/invoices`
  - Customers: `/sales/customers`
  - Products & services: `/sales/products-services`
  - Estimates: `/sales/estimates`
  - Sales orders: `/sales/sales-orders`
  - Recurring payments: `/sales/recurring-payments`
  - Customer payments: `/sales/customer-payments`
  - Payment links: `/sales/payment-links`
  - Deposits: `/sales/deposits`
  - Statements: `/sales/statements`
- Expenses (hub)
  - Expenses: `/expenses`
  - Bills: `/bills` (Scheduled: `/bills/scheduled`)
  - Purchase orders: `/purchase-orders`
  - Bill payments: `/bill-payments`
  - Vendors: `/vendors`
  - Contractors: `/contractors`
  - Mileage: `/mileage`
  - 1099 filings: `/1099-filings`
  - Implementation note: The Expenses sub‑nav is centralized via a route‑grouped layout (`src/app/(expenses)/layout.tsx`). All canonical pages live under `src/app/(expenses)/*` so the bar renders once across the section. For backward compatibility, legacy top‑level routes like `/bills`, `/vendors`, `/purchase-orders`, `/bill-payments`, `/contractors`, `/mileage`, and `/1099-filings` are thin wrappers that render the grouped page and include the same sub‑nav. This guarantees the bar is always visible regardless of entry path.
- Transactions (hub)
  - Bank transactions: `/bank-transactions`
  - Reconcile: `/transactions/reconcile`
  - Chart of accounts: `/transactions/chart-of-accounts`
  - App transactions: `/transactions/app-transactions`
  - Receipts: `/transactions/receipts`
  - Recurring transactions: `/transactions/recurring-transactions`
  - Rules: `/bank-transactions/rules`
  - Tags: `/transactions/tags`
- Reports
  - Standard: `/reports`
  - Custom: `/reports/custom`
  - Management: `/reports/management`
  - Performance center: `/reports/performance-center`
- Payroll — `/payroll`
- Time — `/time`
- Inventory — `/inventory`
- Projects — `/projects`
- Budgets — `/budgets`
- Tasks — `/tasks`
- Books review — `/books-review`
- Client overview — `/client-overview`
- My accountant — `/my-accountant`
- Apps — `/apps`
- Taxes — `/taxes`
- Commerce — `/commerce`
- Accounts — `/accounts`
- Periods — `/periods`

## Sales hub
- Sub-navigation (rendered once via the Sales layout; individual pages must not render it again):
  - Overview (/sales)
  - All sales (/sales/all-sales)
  - Invoices (/sales/invoices)
  - Customers (/sales/customers)
  - Products & services (/sales/products-services)
  - Estimates (/sales/estimates)
  - Sales orders (/sales/sales-orders)
  - Recurring payments (/sales/recurring-payments)
  - Customer payments (/sales/customer-payments)
  - Payment links (/sales/payment-links)
  - Deposits (/sales/deposits)
  - Statements (/sales/statements)
- Overview includes:
  - A/R Aging Summary (Current, 30/60/90/120+) with an Open Report link
  - Recent invoices and sales receipts
  - Actions: Print, Record Payment, New Invoice, New Sales Receipt
- Deterministic navigation: links include from=/sales so list/detail pages show a Back button to Sales.

## Deterministic “Back” behavior
- Pages use a Back button that respects a from= query parameter when present (e.g., from=/sales), otherwise falls back sensibly (e.g., /sales or /reports).
- Implemented on Reports, Invoices list, Sales Receipts list, Customers list, and detail pages progressively.

## Expenses hub
- Sub-navigation (rendered once via the Expenses layout):
  - Expenses (/expenses)
  - Bills (/bills)
  - Purchase orders (/purchase-orders)
  - Bill payments (/bill-payments)
  - Vendors (/vendors)
  - Contractors (/contractors)
  - Mileage (/mileage)
  - 1099 filings (/1099-filings)
- Expenses and Bills pages align with shared filtering, export, and print patterns. Bills includes a payables aging summary card and quick actions.
 - Legacy path compatibility: The historical path "/expenses/bills" now acts as a lightweight server-side redirect to "/bills" and preserves query parameters. This keeps deep links working while ensuring only one canonical page exists.
 - Routing rule: Avoid creating parallel pages that resolve to the same path across route groups and top-level paths. Prefer a single canonical route and handle old paths via redirects.

## Transactions hub
- Sub-navigation (rendered once via the Transactions layout; individual pages must not render it again):

## Time hub
- Sub-navigation (rendered once via the Time layout; individual pages must not render it again):
  - Schedule (/time/schedule)
  - Time entries (/time/time-entries)
  - Note: Projects is not shown in the Time sub‑nav.
  - Bank transactions (/bank-transactions)
  - Reconcile (/transactions/reconcile)
  - Chart of accounts (/transactions/chart-of-accounts)
  - App transactions (/transactions/app-transactions)
  - Receipts (/transactions/receipts)
  - Recurring transactions (/transactions/recurring-transactions)
  - Rules (/bank-transactions/rules)
  - Tags (/transactions/tags)

## Reports and exports
- Report pages show “As of …” captions, consistent CSV export filenames, and hide action bars when printing.
- A/R and A/P Aging summaries are consistent across Sales and Bills.
- Drilldowns: Key financial statement lines link to detailed reports. Profit & Loss lines (Revenue, COGS, Operating Expenses, Other Income) click through to Transaction Detail by Account, preserving the current period/date range and passing the relevant account filter(s).

## RBAC and visibility
- Server-side enforcement; client-side gating hides items the current role shouldn’t see to avoid confusion.
- Friendly 403 UIs when a user navigates directly to restricted features.

## Differences vs QuickBooks
- Invoices and Customers are not in the left nav; they live under Sales to streamline A/R workflows.
- Global Activity is in the top bar, not within the secondary header.
- Taglines are intentionally smaller to keep the header compact.
- Some QBO areas (Payroll, Time, Taxes, Inventory/Projects/Budgets) are out of scope or staged; see the appendix for mapping.

---

# QuickBooks Navigation Menu (Reference)
## Table of Contents
- [Bookmarks](#bookmarks)
- [Menu (Left Navigation)](#menu)
  - [Client overview](#client-overview)
  - [Books review](#books-review)
  - [Dashboards](#dashboards)
  - [Transactions](#transactions)
  - [Sales](#sales)
  - [Expenses](#expenses)
  - [Reports](#reports)
  - [Payroll](#payroll)
  - [Time](#time)
  - [Inventory](#inventory-plusadvanced)
  - [Projects](#projects-plusadvanced)
  - [Budgets](#budgets-plusadvanced)
  - [Taxes](#taxes)
  - [My accountant](#my-accountant)
  - [Live Experts](#live-experts)
  - [Lending & banking](#lending--banking)
  - [Commerce](#commerce)
  - [Apps](#apps)
- [Global header and tools](#global-header-and-tools)
- [Accountant tools](#accountant-tools)
- [Gear (Settings)](#gear-settings)
- [Business vs Accountant view mapping](#business-vs-accountant-view-mapping)
- [Plan/Region Variants](#planregion-variants)

## Bookmarks
- Bookmark this page

## Menu
### Client overview
### Books review
### Dashboards
 - Home
 - Cash flow
 - Planner
### Tasks
### Transactions
  - App transactions
  - Bank transactions
  - Chart of accounts
  - Receipts
  - Reconcile
  - Recurring transactions
  - Rules
  - Tags [Feature dependent]
### Sales
  - Overview
  - All sales
  - Invoices
  - Customers
  - Products & services
  - Estimates
  - Sales orders
  - Recurring payments
  - Payment links
  - Deposits
### Expenses
  - Expenses
  - Bills
  - Purchase orders
  - Bill payments
  - Vendors
  - Contractors
  - Mileage
  - 1099 filings
### Reports
  - Standard reports
    - Business overview
      - Audit Log
      - Balance Sheet Comparison
      - Balance Sheet Detail
      - Balance Sheet Summary
      - Balance sheet
      - Custom summary report
      - Profit and Loss % of Total Income
      - Profit and Loss Comparison
      - Profit and Loss Detail
      - Profit and Loss YTD Comparison
      - Profit and Loss by Customer
      - Profit and Loss by Month
      - Profit and loss report
      - Quarterly Profit and Loss Summary
      - Statement of Cash Flows
      - Business snapshot
      - Profit and Loss by Tag Group Report
    - Sales and customers
      - Customer Contact List
      - Customer Phone List
      - Deposit Detail
      - Estimates & Progress Invoicing Summary by Customer
      - Estimates by Customer
      - Income by Customer Summary
      - Payment Method List
      - Physical Inventory Worksheet
      - Product/Service List
      - Sales by Customer Detail
      - Sales by Customer Summary
      - Sales by Customer Type Detail
      - Sales by Product/Service Detail
      - Sales by Product/Service Summary
      - Time Activities by Customer Detail
      - Transaction List by Customer
      - Transaction List by Tag Group Report
    - Who owes you
      - A/R Aging Detail Report
      - A/R Aging Summary Report
      - Collections Report
      - Customer Balance Detail Report
      - Customer Balance Summary
      - Invoice List by Date
      - Invoices and Received Payments
      - Open Invoices Report
      - Terms List
      - Unbilled Charges
      - Unbilled Time
      - Statement List Report
    - What you owe
      - 1099 Contractor Balance Detail [US]
      - 1099 Contractor Balance Summary [US]
      - A/P Aging Detail Report
      - A/P Aging Summary Report
      - Bill Payment List
      - Unpaid Bills Report
      - Vendor Balance Detail Report
      - Vendor Balance Summary
    - Expenses and vendors
      - 1099 Transaction Detail Report [US]
      - Check Detail Report
      - Expenses by Vendor Summary
      - Open Purchase Order Detail
      - Open Purchase Order List by Vendor
      - Purchase List
      - Purchases by Product/Service Detail
      - Purchases by Vendor Detail
      - Transaction List by Vendor
      - Vendor Contact List
      - Vendor Phone List
    - Payroll
      - Employee Contact List
      - Payroll Reports
      - Recent Edited Time Activities
      - Time Activities by Employee Detail
    - Employees
      - Employee Contact List
      - Recent Edited Time Activities
      - Time Activities by Employee Detail
    - Sales tax / VAT/GST [Region dependent]
      - Tax Summary
      - Tax Detail
      - Tax Liability
    - For my accountant
      - Account List
      - Adjusted Trial Balance
      - Adjusting Journal Entries
      - Balance Sheet Comparison
      - Balance Sheet Detail
      - Balance Sheet Report
      - Balance Sheet Summary
      - Closing Date
      - General Ledger List
      - General Ledger Report
      - Invalid Journal Transactions
      - Journal
      - Profit and Loss Comparison
      - Profit and Loss by Tag Group Report
      - Profit and Loss Report
      - Reconciliation Reports
      - Recurring Template List Report
      - Statement of Cash Flows
      - Transaction List with Splits
      - Transaction Report
      - Transaction Detail by Account Report
      - Transaction List by Date Report
      - Trial Balance Report
  - Custom reports
  - Management reports
  - Performance center
### Payroll
  - Contractors
  - Employees
  - Workers' comp
  - Payroll tax [Region/Payroll dependent]
### Time
  - Schedule
  - Time entries
### Inventory [Plus/Advanced]
  - Orders
  - Overview
  - Products and services (adjustments)
  - Products and services
  - Purchase Orders
  - QuickBooks
  - Shipping
### Projects [Plus/Advanced]
### Budgets [Plus/Advanced]
### Taxes
  - 1099 filings [US]
  - Income Tax [Region dependent]
  - Sales tax / VAT/GST [Region dependent]
  - Year-end filing [Region dependent]
### My accountant
### Live Experts
### Lending & banking
  - Line of credit
  - QuickBooks Checking [US]
  - Capital [US]
### Commerce
  - Overview
  - Sales channels [Feature/Region dependent]
  - Catalog [Feature/Region dependent]
  - Shipping
  - Payouts
  - Orders
### Apps

## Global header and tools
- + New (Global Create)
  - Opens the create menu (e.g., Invoice, Estimate, Expense, Bill, Journal entry, etc.).
- Gear (Settings)
  - Account and settings, Chart of accounts, All lists, Recurring transactions, Budgeting, Attachments, and more.
- Accountant tools (for QBO Accountant)
  - Access to accountant-only tools and workflows.
- Search
  - Global search across transactions, customers, vendors, accounts, etc.
- Help
  - In-product help, guides, and contact support.
- What's new
  - Product updates and announcements.
- Company switcher / Intuit account
  - Switch between companies and manage your Intuit account/profile.
- Apps (header quick launcher)
  - Opens app hub/launcher.

## Accountant tools
- Reclassify transactions — Move accounts, classes, or locations in batch across multiple transactions.
- Write off invoices — Batch write off small balances to close open invoices.
- Close books — Set a closing date and password to lock a period.
- Prep for taxes (Trial balance) — Map accounts to tax lines and manage workpapers/adjustments.
- Voided/Deleted transactions — Review activity that was voided or deleted.
- Reconciliation / Reconciliation reports — Start or review bank/credit card reconciliations and print reports.
- Reports tools / Management reports — Build and distribute report packages to clients.
- Chart of accounts & Journal entries — Access COA and post adjusting journal entries.
- Client switching & ProAdvisor — Switch clients, manage firm tools and ProAdvisor.

## Gear (Settings)
- Account and settings — Company info, Billing & Subscription, Sales, Expenses, Payments, Advanced (Multicurrency, Automation, Class/Location tracking, Close date).
- Manage users — Invite users and set roles/permissions.
- All lists — Products & services, Recurring transactions, Custom form styles, Locations, Classes, Tags, Attachments, Budgets.
- Tools — Import data, Export data, Audit log, Budgeting, Data management (if available).
- Chart of accounts — Create/edit accounts; enable account numbers.
- Custom form styles — Configure branding for invoices/estimates/receipts.
- Haypbooks Payments — Payments settings (if enabled).
- Payroll settings [Region/Payroll dependent] — Payroll company/tax settings (if payroll is active).

## Business vs Accountant view mapping
| Area | Business view label | Accountant view label | Notes |
|---|---|---|---|
| Banking/Transactions | Bookkeeping | Transactions | Bookkeeping center (Business) maps to Transactions (Accountant): Chart of accounts, Reconcile, Rules, Receipts. |
| Money in | Get paid & pay (Money in) | Sales | Customers, Invoices, Estimates, Products & services live under Sales in Accountant view. |
| Money out | Get paid & pay (Money out) | Expenses | Vendors, Bills, Bill payments live under Expenses in Accountant view. |
| Cash flow | Cash flow | Dashboards → Cash flow | Cash flow & Planner found under Dashboards in Accountant view. |
| Reports | Reports | Reports | Same location in both views. |
| Payroll | Payroll | Payroll | Same label; Payroll tax availability varies by region/product. |
| Time | Time | Time | Same label; requires Time feature. |
| Inventory/Projects/Budgets | Often under Bookkeeping/Lists | Left nav sections | Require Plus/Advanced plan. |
| Commerce | Commerce | Commerce | Sales channels/Catalog availability varies by region/integration. |
| Apps | Apps | Apps | Same label in both views. |

## Plan/Region Variants
Some items in QuickBooks Online may not appear for every company because the navigation varies by:

- Subscription plan (Simple Start, Essentials, Plus, Advanced).
- Country/region (e.g., US, UK, CA, AU, IN) and local tax rules (Sales tax vs VAT/GST, payroll availability).
- Enabled add‑ons/features (Payroll, Time, Inventory, Projects, Commerce, Multicurrency, Tags).
- User role and UI view (Accountant vs Business view, labels/groupings may differ).
- Feature flags/experiments (staged rollouts may add or hide tabs).

Examples of plan/region dependent items:

- Payroll tax [Region/Payroll dependent]
- Tags [Feature dependent]
- Inventory/Projects/Budgets [Plus/Advanced]
- Lending & banking → QuickBooks Checking/Capital [US]
- Commerce → Sales channels/Catalog [Feature/Region dependent]

# Haypbooks Navigation Policies

- Single subnav per hub: Render sub-navigation once from the hub layout; pages must not render another bar.
- No blank bars: Only show filter/action bars when real filters exist or are active.
- Canonical routes: One page per path. For legacy paths, add a redirect to the canonical route and preserve query params.
- Route groups: Use route groups per hub (e.g., (expenses)) and avoid duplicating identical paths at the app root.
- Dashboard header: No extra top bar at dashboard level; controls live in widgets.
- Reports index: No blank header bar; filters live in specific report pages.

Cross-reference: See `Roadmap.v2/Flow.md` → Navigation and route policies for rationale and examples.

