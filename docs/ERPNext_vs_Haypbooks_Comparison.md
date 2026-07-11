# ERPNext vs Haypbooks — Module Structure Comparison Report

*Generated July 7, 2026 — Based on actual file inspection of both codebases*

---

## Section 1: ERPNext Module Inventory

ERPNext organizes its functionality into 12+ top-level modules. Each module contains **doctypes** (entity/document types), **reports**, **pages** (custom UI views), and **workspace configs** (navigation). Below is the full inventory derived from reading every workspace JSON and listing every doctype/report/page directory.

---

### 1.1 Accounts Module

**Workspace configs (9):** Accounts Setup, Banking, Budgeting, Financial Reports, Invoicing, Payments, Share Management, Subscriptions, Taxes

**Key Doctypes (~170+):**
- **Masters:** Account, Account Category, Cost Center, Cost Center Allocation, Accounting Dimension, Finance Book, Fiscal Year, Accounting Period, Accounts Settings, Currency, Currency Exchange, Currency Exchange Settings
- **Transactions:** Sales Invoice, Purchase Invoice, Journal Entry, Journal Entry Template, Payment Entry, Payment Order, Payment Request, Payment Reconciliation, Process Payment Reconciliation, Unreconcile Payment, Period Closing Voucher, Process Period Closing Voucher, Dunning, Dunning Type, Invoice Discounting, Exchange Rate Revaluation
- **Banking:** Bank, Bank Account, Bank Account Type, Bank Account Subtype, Bank Account Balance, Bank Clearance, Bank Reconciliation Tool, Bank Guarantee, Bank Transaction, Bank Transaction Mapping, Bank Transaction Rule, Bank Statement Import, Plaid Settings
- **Budgeting:** Budget, Budget Account, Budget Distribution, Monthly Distribution
- **Tax:** Sales/Purchase Taxes and Charges Template, Item Tax Template, Tax Category, Tax Rule, Tax Withholding Category/Group/Rate/Account/Entry, Shipping Rule, Advance Taxes and Charges
- **Pricing:** Pricing Rule, Promotional Scheme, Coupon Code
- **POS (Point of Sale):** POS Profile, POS Settings, POS Invoice, POS Opening/Closing Entry, POS Invoice Merge Log, Cashier Closing
- **Subscriptions:** Subscription, Subscription Plan, Subscription Settings, Subscription Invoice, Process Subscription
- **Shares:** Shareholder, Share Transfer, Share Type, Share Balance
- **Opening/Closing:** Opening Invoice Creation Tool, Chart of Accounts Importer, Account Closing Balance, Closed Document
- **Ledger Health:** Ledger Health, Ledger Health Monitor, Ledger Merge
- **Other:** GL Entry, Payment Ledger Entry, Advance Payment Ledger Entry, Repost Accounting/Payment Ledger, Financial Report Template, Financial Report Row, Process Deferred Accounting, Process Statement of Accounts

**Reports (~50):**
- *Financial Statements:* Balance Sheet, Profit and Loss Statement, Cash Flow, Trial Balance, Trial Balance (Simple), Trial Balance for Party, Consolidated Financial Statement, Consolidated Trial Balance, Custom Financial Statement
- *Ledgers:* General Ledger, Customer Ledger Summary, Supplier Ledger Summary, Payment Ledger, Account Balance
- *Receivables/Payables:* Accounts Receivable, Accounts Receivable Summary, Accounts Payable, Accounts Payable Summary, Voucher-wise Balance
- *Registers:* Sales Register, Purchase Register, Item-wise Sales Register, Item-wise Purchase Register, POS Register
- *Profitability:* Gross Profit, Profitability Analysis, Gross and Net Profit Report, Financial Ratios, Deferred Revenue and Expense
- *Trends:* Sales Invoice Trends, Purchase Invoice Trends
- *Banking:* Bank Reconciliation Statement, Bank Clearance Summary, Cheques and Deposits Incorrectly Cleared, General and Payment Ledger Comparison
- *Other:* Budget Variance Report, Payment Period Based on Invoice Date, Sales Partners Commission, Sales Payment Summary, Customer Credit Balance, Share Ledger, Share Balance, Tax Withholding Details, TDS Computation Summary, Delivered Items to Be Billed, Received Items to Be Billed, Billed Items to Be Received, Inactive Sales Items, Calculated Discount Mismatch, Invalid Ledger Entries, Dimension-wise Accounts Balance, Profitability Analysis

**Pages:** None (accounts/page directory is empty)

---

### 1.2 Selling Module

**Workspace config (1):** Selling

**Key Doctypes (~18):**
- Customer, Customer Credit Limit, Quotation, Sales Order, Sales Partner, Sales Partner Type, Sales Team, Product Bundle, Selling Settings, Installation Note, Industry Type, Party Specific Item, Supplier Number at Customer, Blanket Order, Delivery Schedule Item, SMS Center

**Reports (~22):**
- Sales Analytics, Sales Order Analysis, Sales Order Trends, Quotation Trends, Customer Acquisition and Loyalty, Inactive Customers, Customers Without Any Sales Transactions, Item-wise Sales History, Customer Credit Balance, Customer-wise Item Price, Lost Quotations, Payment Terms Status for Sales Order, Pending SO Items for Purchase Request, Available Stock for Packing Items, Sales Partners Commission, Sales Partner Commission Summary, Sales Partner Transaction Summary, Sales Person Commission Summary, Sales Person-wise Transaction Summary, Sales Partner Target Variance, Sales Person Target Variance, Territory Target Variance, Territory-wise Sales, Address and Contacts

**Pages (2):** Point of Sale (full POS interface), Sales Funnel (visual funnel page)

---

### 1.3 Buying Module

**Workspace config (1):** Buying

**Key Doctypes (~19):**
- Supplier, Supplier Group, Purchase Order, Request for Quotation, Supplier Quotation, Buying Settings, Customer Number at Supplier, Purchase Receipt Item Supplied, Supplier Scorecard, Supplier Scorecard Criteria/Period/Scoring Criteria/Scoring Standing/Scoring Variable/Standing/Variable

**Reports (~10):**
- Purchase Analytics, Purchase Order Analysis, Purchase Order Trends, Procurement Tracker, Requested Items to Order and Receive, Items to Be Requested, Item-wise Purchase History, Supplier Quotation Comparison, Subcontract Order Summary, Subcontracted Item to Be Received, Subcontracted Raw Materials to Be Transferred, Material Requests for which Supplier Quotations are not created

**Pages:** None

---

### 1.4 Stock Module

**Workspace config (1):** Stock

**Key Doctypes (~80):**
- **Item masters:** Item, Item Attribute, Item Attribute Value, Item Barcode, Item Default, Item Customer Detail, Item Supplier, Item Lead Time, Item Manufacturer, Item Price, Item Quality Inspection Parameter, Item Reorder, Item Standard Cost, Item Tax, Item Variant, Item Variant Settings, Item Website Specification, Item Alternative
- **Warehouses:** Warehouse, Warehouse Type, Putaway Rule
- **Stock transactions:** Stock Entry, Stock Entry Type, Stock Entry Detail, Material Request, Delivery Note, Delivery Settings, Delivery Stop, Delivery Trip, Purchase Receipt, Pick List, Packing Slip
- **Serial/Batch:** Serial No, Batch, Serial and Batch Bundle, Serial and Batch Entry
- **Valuation:** Landed Cost Voucher, Landed Cost Item/Taxes/Receipt/Vendor Invoice, Stock Reconciliation, Repost Item Valuation, Stock Reservation Entry
- **Other:** Sales BOM, Manufacturer, Price List, Price List Country, UOM Category, UOM Conversion Detail, Quality Inspection, Quality Inspection Template, Quality Inspection Parameter/Parameter Group/Reading, Stock Closing Balance/Entry, Inventory Dimension, Quick Stock Balance, Shipment, Shipment Delivery Note, Shipment Parcel/Template, Stock Settings, Stock Reposting Settings, Customs Tariff Number, Variant Field

**Reports (~55):**
- Stock Ledger, Stock Balance, Stock Projected Qty, Stock Ageing, Stock Analytics, Total Stock Summary, Warehouse Wise Stock Balance, Warehouse Wise Item Balance Age and Value, Item Balance, Item Price Stock, Item Prices, Item Shortage Report, Item Variant Details, Item Where Used, Item-wise Consumption, Itemwise Recommended Reorder Level, Available Batch Report, Available Serial No, Batch Item Expiry Status, Batch-wise Balance History, Serial No and Batch Summary, Serial No and Batch Traceability, Serial No Ledger, Serial No Status, Serial No Service Contract Expiry, Serial No Warranty Expiry, COGS by Item Group, BOM Search, Product Bundle Balance, Reserved Stock, Stock and Account Value Comparison, Landed Cost Report, Delivery Note Trends, Purchase Receipt Trends, Requested Items to Be Transferred, Delayed Item Report, Delayed Order Report, FIFO Queue vs Qty Comparison, Incorrect Balance Qty, Incorrect Serial and Batch Bundle, Incorrect Serial No Valuation, Incorrect Stock Value, Negative Batch Report, Stock Ledger Invariant Check, Stock Ledger Variance, Stock Qty vs Batch Qty, Stock Qty vs Serial No Count

**Pages (2):** Stock Balance (visual page), Warehouse Capacity Summary

---

### 1.5 Projects Module

**Workspace config (1):** Projects

**Key Doctypes (~15):**
- Project, Project Template, Project Template Task, Project Type, Project Update, Project User, Projects Settings, Task, Task Depends On, Task Type, Timesheet, Timesheet Detail, Activity Type, Activity Cost, Dependent Task

**Reports (5):** Daily Timesheet Summary, Project wise Stock Tracking, Timesheet Billing Summary, Delayed Tasks Summary, Project Summary

**Pages:** None

---

### 1.6 Assets Module

**Workspace config (1):** Assets

**Key Doctypes (~27):**
- Asset, Asset Activity, Asset Capitalization (and related item doctypes), Asset Category, Asset Category Account, Asset Depreciation Schedule, Asset Finance Book, Asset Maintenance, Asset Maintenance Log, Asset Maintenance Task, Asset Maintenance Team, Asset Movement (and item), Asset Repair (and Consumed Item/Purchase Invoice), Asset Shift Allocation, Asset Shift Factor, Asset Value Adjustment, Depreciation Schedule, Linked Location, Location, Maintenance Team Member

**Reports (3):** Fixed Asset Register, Asset Depreciation Ledger, Asset Depreciations and Balances, Asset Maintenance, Asset Activity

**Pages:** None

---

### 1.7 Support Module

**Workspace config (1):** Support (scheduled for deprecation in v17 — replaced by Frappe Helpdesk)

**Key Doctypes (~11):**
- Issue, Issue Priority, Issue Type, Pause SLA on Status, Service Day, Service Level Agreement, Service Level Priority, SLA Fulfilled on Status, Support Search Source, Support Settings, Warranty Claim

**Reports (1):** First Response Time for Issues

**Pages:** None

---

### 1.8 CRM Module

**Workspace config (1):** CRM (scheduled for deprecation — replaced by Frappe CRM)

**Key Doctypes (~27):**
- Lead, Opportunity, Opportunity Item, Opportunity Type, Opportunity Lost Reason, Prospect, Prospect Lead, Prospect Opportunity, Contract, Contract Template, Contract Fulfilment Checklist, Campaign, Campaign Email Schedule, Email Campaign, Competitor, Competitor Detail, Appointment, Appointment Booking Settings, Appointment Booking Slots, Availability of Slots, CRM Settings, CRM Note, Market Segment, Sales Stage, Lost Reason Detail, Frappe CRM Allowed User

**Reports (7):** Lead Details, Sales Pipeline Analytics, Opportunity Summary by Sales Stage, Prospects Engaged But Not Converted, First Response Time for Opportunity, Campaign Efficiency, Lead Owner Efficiency, Inactive Customers

**Pages:** None

---

### 1.9 Manufacturing Module

**Workspace config (1):** Manufacturing

**Key Doctypes (~49):**
- **BOM:** BOM, BOM Item, BOM Operation, BOM Explosion Item, BOM Secondary Item, BOM Creator, BOM Creator Item, BOM Update Batch, BOM Update Log, BOM Update Tool, BOM Website Item/Operation
- **Production:** Work Order, Work Order Item, Work Order Operation, Work Order Additional Item, Production Plan (and related item/reference/material request/sales order/sub-assembly item), Job Card, Job Card Item, Job Card Operation, Job Card Scheduled Time, Job Card Secondary Item, Job Card Time Log, Manufacturing Settings, Master Production Schedule (and item), Material Request Plan Item, Downtime Entry, Sales Forecast (and item)
- **Setup:** Operation, Sub Operation, Routing, Workstation, Workstation Cost, Workstation Operating Component (and account), Workstation Type, Workstation Working Hour, Plant Floor, Blanket Order (and item)

**Reports (~11):** Production Planning Report, Material Requirements Planning, Work Order Summary, Quality Inspection Summary, Downtime Analysis, Job Card Summary, BOM Search, Production Analytics, BOM Operations Time, Work Order Consumed Materials, Exponential Smoothing Forecasting

**Pages (2):** BOM Comparison Tool, Shop Floor

---

### 1.10 Subcontracting Module

**Doctypes (~13):** Subcontracting BOM, Subcontracting Order (and item/service item/supplied item), Subcontracting Receipt (and item/supplied item), Subcontracting Inward Order (and received item/secondary item/service item)

---

### 1.11 Quality Management Module

**Doctypes (~16):** Non Conformance, Quality Action, Quality Action Resolution, Quality Feedback, Quality Feedback Parameter, Quality Feedback Template, Quality Feedback Template Parameter, Quality Goal, Quality Goal Objective, Quality Meeting, Quality Meeting Agenda, Quality Meeting Minutes, Quality Procedure, Quality Procedure Process, Quality Review, Quality Review Objective

---

### 1.12 Utilities Module

**Doctypes (4):** Portal User, Rename Tool, Video, Video Settings

**Python utilities:** bulk_transaction.py, naming.py, product.py, query.py, regional.py, transaction_base.py, activation.py

---

### 1.13 Other ERPNext Top-Level Modules (not covered in depth)

- **bulk_transaction** — bulk operations on doctypes
- **communication** — communication/timeline framework
- **domains** — domain-specific configurations (Healthcare, Education, Non-profit, etc.)
- **edi** — Electronic Data Interchange
- **erpnext_integrations** — Plaid, Shopify, etc.
- **maintenance** — Maintenance Schedule, Maintenance Visit
- **portal** — customer/supplier portal
- **regional** — country-specific compliance (Italy, UAE, Saudi Arabia, France, South Africa)
- **report_center** — centralized report hub
- **setup** — Company, Employee, Branch, Department, Designation
- **shopping_cart** — e-commerce shopping cart
- **telephony** — Call Log, Call Settings

---

## Section 2: Haypbooks Module Inventory

Haypbooks uses Next.js App Router with 17 top-level modules under `(owner)/`. Total: **276 page routes** across all modules.

---

### 2.1 accountant-workspace (1 route)
- `client-requests`

### 2.2 accounting (20 routes)
- **allocations:** allocation-history, allocation-rules, allocation-runs
- **close-workflow:** page
- **core-accounting:** chart-of-accounts ([id]/audit-log, audit-log, page), general-ledger, journal-entries ([id]/activity, [id], audit-log, new, page)
- **fixed-assets:** asset-lifecycle, asset-management, depreciation, insurance
- **period-close:** close-archive, lock-period, multi-currency-revaluation, sign-offs

### 2.3 activity (1 route)
- page (global activity feed)

### 2.4 apps-integrations (8 routes)
- **api:** api-keys, webhooks
- **connected-apps:** installed-apps
- **data-tools:** export-data
- **developer-tools:** developer-sandbox
- **discover:** app-marketplace
- **imports:** import-data
- **my-integrations:** integration-logs

### 2.5 automation (6 routes)
- **ai-intelligence:** ai-bookkeeping, smart-matching
- **monitoring:** automation-logs, error-queue
- **workflow-engine:** smart-rules, workflow-builder

### 2.6 banking (18 routes)
- **bank-rules:** csv-upload, page, rule-templates, rules
- **reconciliation:** history, page, reconcile, statements
- **transactions:** activity, deposits (activity, page), match, page, register, rules, split, transfer, undeposited-funds (activity, page), view-record

### 2.7 compliance (6 routes)
- **controls:** control-testing, internal-controls, policy-management
- **monitoring:** audit-log-analysis, fraud-detection-rules, issue-tracking

### 2.8 expenses (35 routes)
- **bills-payments:** ap-aging, bill-payments ([id], activity, page), bills ([id], activity, page), page, payment-runs (activity, page), recurring-bills (activity, edit/[id], new, page), vendor-credits (activity, page)
- **employee-expenses:** expenses ([id], activity, page), mileage (activity, page), page, per-diem (activity, page), receipts (activity, page), reimbursements (activity, page)
- **procurement:** approvals (activity, page), orders ([id], activity, page), page, purchase-requests, requests (activity), rfq (activity, page), vendors ([id])
- **recurring-expenses:** page
- **vendors:** activity, contacts, page, statements

### 2.9 home (6 routes)
- business-health, dashboard, notifications, performance, setup-center, shortcuts

### 2.10 inventory (22 routes)
- **control:** cycle-counts, lot-serial-tracking, page, physical-counts, reorder-points
- **items:** bundles, categories, item-list, page, units
- **stock-operations:** adjustments, item-receipts, page, stock-movements, transfers
- **valuation:** cost-adjustments, inventory-valuation, landed-costs, page, write-downs
- **warehouses:** bin-locations, page, warehouse-list, zones

### 2.11 organization (4 routes)
- **entity-structure:** consolidation, intercompany, legal-entities
- **operational-structure:** locations-divisions

### 2.12 payroll-workforce (20 routes)
- **compensation:** allowances, benefit-plans, deductions, loans, salary-structures
- **payroll-processing:** bonuses-commissions, final-pay, payroll-adjustments, payroll-approvals, payroll-history, payroll-runs
- **payroll-taxes:** government-contributions, remittance-tracking, tax-withholding
- **time-leave:** holiday-calendar, leave-balances, leave-requests, shift-scheduling
- **workforce:** employee-documents, employees, job-positions

### 2.13 projects (17 routes)
- **billing:** change-orders, page, progress-billing, project-billing, wip
- **financials:** budget-vs-actual, page, profitability
- **project-setup:** contracts, milestones, page, projects, templates
- **tasks:** page, resource-planning, schedule, task-list, time-expenses

### 2.14 reporting (16 routes)
- **analytics:** analytics-dashboards
- **custom-reports:** page, report-builder, scheduled-reports
- **reports-center:** page, accountant-reports (general-ledger, trial-balance, page), banking-reports, expense-reports, financial-statements (balance-sheet, cash-flow-statement, page, profit-and-loss), inventory-reports, payroll-reports, project-reports, sales-reports

### 2.15 sales (31 routes)
- **billing:** invoices (activity, new, page), page, payment-links, recurring (activity, edit/[id], new, page)
- **collections:** aging, center, dunning, page, payments (activity, page), refunds (activity, page), write-offs
- **customers:** [id], activity, documents, groups ([id], page), page, portal, statements
- **opportunities:** orders (activity, page), page, pipeline, products-services ([id], page), quotes (activity, page)
- **page** (module landing)
- **revenue:** credit-notes (activity, page), deferred, page, recognition

### 2.16 settings (12 routes)
- accounting-preferences, company-profile (company-details, fiscal-year-setup), customization (custom-fields), data-privacy (audit-log, data-backup), entity-management (base-currency, numbering-sequences), users-security (roles-permissions, two-factor-auth, user-management)

### 2.17 tasks-approvals (11 routes)
- **management:** approval-history, approval-queue, delegated-tasks, task-templates, team-tasks
- **my-work:** calendar, my-approvals, my-exceptions, my-tasks, overdue-items

### 2.18 taxes (10 routes)
- **filing-payments:** e-filing, tax-returns
- **tax-center:** filing-payments, tax-calendar, tax-dashboard, tax-liabilities
- **tax-reporting:** tax-summary, vat-payable
- **tax-setup:** tax-agencies, tax-rates

### 2.19 time (7 routes)
- **entry:** page, time-entries, timer, timesheets
- **review:** billable-time-review, page, time-approvals

---

## Section 3: Gap Analysis — Features in ERPNext but NOT in Haypbooks

### ADOPT — Worth Adding to Haypbooks

| # | ERPNext Feature | ERPNext Module | Gap in Haypbooks | Justification |
|---|---|---|---|---|
| 1 | **Delivery Notes & Delivery Trips** | Stock | No delivery note or shipment tracking | Essential for product-based businesses. QuickBooks has shipping/delivery. Haypbooks inventory has stock-operations/transfers but no customer-facing delivery documents. |
| 2 | **Purchase Receipts** (goods receipt) | Stock | No purchase receipt document | When inventory is received from a supplier, a goods receipt is needed before the bill. Haypbooks has item-receipts but lacks the formal 3-way match (PO → Receipt → Bill). QuickBooks has this. |
| 3 | **Material Requests** | Stock/Buying | No formal material request / requisition flow | Haypbooks has procurement/purchase-requests but lacks the full material request → PO → receipt chain. Important for inventory-driven businesses. |
| 4 | **Pick Lists** | Stock | No pick list functionality | Warehouses need pick lists for order fulfillment. Haypbooks has warehouses and zones but no picking workflow. |
| 5 | **Pricing Rules & Promotional Schemes** | Accounts/Selling | No pricing rules or promotional schemes | Haypbooks has no discount/pricing rule engine. QuickBooks has price levels. Essential for B2B businesses with volume discounts. |
| 6 | **Item Variants & Item Attributes** | Stock | No item variant system | Haypbooks has items/categories/units but no attribute-based variants (e.g., size × color). Important for retail/product businesses. |
| 7 | **Multi-Currency Exchange Rate Revaluation** | Accounts | Haypbooks has multi-currency-revaluation route but no automated FX revaluation entries | ERPNext has Exchange Rate Revaluation doctype that auto-creates journal entries. This is a QuickBooks feature too. |
| 8 | **Payment Terms Templates** | Accounts | No payment terms template management | Haypbooks has no payment terms configuration. QuickBooks has payment terms (Net 30, Net 60, etc.). Essential for AR/AP management. |
| 9 | **Cheque Printing Templates** | Accounts | No cheque printing | ERPNext has cheque print templates. Useful for businesses that issue cheques. |
| 10 | **Dunning Letters/Types** | Accounts | Haypbooks has collections/dunning route but no dunning type/letter configuration | ERPNext has configurable dunning types with escalating dunning letters. Haypbooks has a dunning page but no configuration system. |
| 11 | **Loyalty Programs** | Accounts/Selling | No loyalty program | ERPNext has loyalty points, redemption, and collection. QuickBooks doesn't have this natively, but it's valuable for retail. |
| 12 | **Cost Center Allocation** | Accounts | Haypbooks has no cost center allocation system | ERPNext allows allocating expenses across cost centers with percentages. Haypbooks has allocations (allocation-rules/runs) but these seem to be for journal allocations, not cost center allocation. |
| 13 | **Accounting Dimensions** | Accounts | No custom accounting dimensions | ERPNext allows creating custom dimensions (beyond cost center/project) for tracking. Powerful for multi-dimensional reporting. |
| 14 | **Process Statement of Accounts** (auto email customer/supplier statements) | Accounts | No automated statement generation/emailing | ERPNext auto-emails customer/supplier statements. Haypbooks has customer/vendor statements but no automation. |
| 15 | **Budget Distribution (Monthly)** | Accounts | No monthly budget distribution | ERPNext distributes annual budgets across months. Haypbooks has budget-vs-actual in projects but no company-level budgeting with monthly distribution. |
| 16 | **Bank Guarantee** | Accounts/Banking | No bank guarantee tracking | For businesses dealing with LCs/bank guarantees. Niche but important for import/export. |
| 17 | **Supplier Scorecards** | Buying | No supplier performance scoring | ERPNext has full supplier scorecard system with criteria, variables, and standings. Haypbooks has vendor statements but no performance metrics. |
| 18 | **Blanket Orders** | Selling/Manufacturing | No blanket order (long-term purchase agreement) | For recurring customer/supplier commitments. QuickBooks doesn't have this, but B2B businesses need it. |
| 19 | **Item Alternative / Item Manufacturer** | Stock | No item alternative or manufacturer tracking | Useful for procurement when primary item is unavailable. |
| 20 | **Stock Reservation Entries** | Stock | No stock reservation | ERPNext can reserve stock for specific orders. Important for allocation management. |
| 21 | **Serial and Batch Bundle** | Stock | Haypbooks has lot-serial-tracking page but no bundle system | ERPNext has a comprehensive serial/batch bundle system for tracking. Haypbooks page exists but seems placeholder. |
| 22 | **Project Update (status tracking)** | Projects | No project update/status tracking feed | ERPNext has project updates with timeline. Haypbooks has milestones but no status update feed. |
| 23 | **Activity Cost (project costing)** | Projects | No activity cost tracking | ERPNext tracks costs per activity type for projects. Haypbooks has project financials/profitability but no activity-level costing. |

### CONSIDER — Interesting But Not Urgent

| # | ERPNext Feature | ERPNext Module | Gap in Haypbooks | Notes |
|---|---|---|---|---|
| 24 | **Full POS System** (POS Profile, POS Invoice, Opening/Closing Entry) | Selling | Haypbooks has no POS | QuickBooks has POS. If Haypbooks targets retail, this is important. Currently seems B2B/accounting focused. |
| 25 | **Subscriptions (recurring billing with plans)** | Accounts | Haypbooks has recurring invoices/bills but no subscription plan system | ERPNext has Subscription → Subscription Plan → auto-generate invoices. Haypbooks has recurring billing but no plan-based subscription management. |
| 26 | **Share Management (Shareholders, Share Transfers)** | Accounts | No shareholder management | For publicly traded or closely-held corporations. Niche but useful. |
| 27 | **Contracts (CRM)** | CRM | No contract management | ERPNext has Contract with fulfilment checklists and templates. Haypbooks has project contracts but not customer/vendor contracts. |
| 28 | **Appointment Booking** | CRM | No appointment booking | ERPNext has appointment booking with available slots. Useful for service businesses. |
| 29 | **Campaign / Email Campaign Management** | CRM | No campaign management | ERPNext tracks campaign efficiency and email campaigns. Haypbooks has no marketing campaign features. |
| 30 | **Prospect Management** | CRM | No prospect doctype (goes lead → opportunity directly) | ERPNext has Prospect as an intermediate stage. Minor difference. |
| 31 | **Service Level Agreements (SLA)** | Support | No SLA tracking | For businesses providing support with SLA commitments. |
| 32 | **Asset Maintenance & Repair** | Assets | Haypbooks has asset-lifecycle/management/depreciation but no maintenance/repair | ERPNext tracks asset maintenance teams, logs, and repairs. Haypbooks has insurance but no maintenance tracking. |
| 33 | **Asset Capitalization** | Assets | No asset capitalization from stock/expenses | ERPNext can capitalize items from stock and service items into assets. Useful but complex. |
| 34 | **Production Planning / MRP** | Manufacturing | No manufacturing at all | ERPNext has full MRP, production plans, work orders. Haypbooks doesn't target manufacturing. |
| 35 | **BOM (Bill of Materials)** | Manufacturing | No BOM | ERPNext has multi-level BOMs with operations. Not relevant unless Haypbooks enters manufacturing. |
| 36 | **Work Orders & Job Cards** | Manufacturing | No work orders | Manufacturing execution tracking. Not for accounting-focused product. |
| 37 | **Subcontracting Orders** | Subcontracting | No subcontracting | For outsourced manufacturing. Niche. |
| 38 | **Quality Management (NCRs, Quality Goals, Procedures)** | Quality Mgmt | No quality management | Full QMS system. Useful for manufacturing/compliance-heavy businesses. |
| 39 | **Telephony / Call Log** | Telephony | No telephony integration | ERPNext logs calls and links to contacts. Niche. |
| 40 | **Shopping Cart / E-Commerce** | Shopping Cart | No e-commerce | ERPNext has a built-in shopping cart. Haypbooks has app marketplace but not product e-commerce. |
| 41 | **EDI (Electronic Data Interchange)** | EDI | No EDI | For B2B document exchange. Niche but growing. |
| 42 | **Maintenance Schedule / Visit** | Support/Maintenance | No maintenance scheduling | For equipment service businesses. Haypbooks has no equipment maintenance. |
| 43 | **Territory Management** | Selling | No territory hierarchy | ERPNext has territory trees with sales targets. Haypbooks has no territory concept. |
| 44 | **Sales Person / Sales Partner Management** | Selling | No sales person or partner tracking | ERPNext tracks sales person commissions and partner targets. Haypbooks has no sales team commission system. |
| 45 | **Custom UOM Conversion Factors** | Stock | Haypbooks has units but no UOM conversion | ERPNext supports converting between UOMs (e.g., box → pieces). Important for inventory businesses. |
| 46 | **Stock Ageing Report** | Stock | No stock ageing report | ERPNext reports on inventory age. Haypbooks has inventory-valuation but not ageing analysis. |
| 47 | **Item Shortage Report** | Stock | No item shortage report | ERPNext shows what's short. Useful for procurement planning. |
| 48 | **Stock Projected Qty** | Stock | No projected stock availability | ERPNext shows projected qty (incoming - outgoing). Important for inventory planning. |
| 49 | **Putaway Rules** | Stock | No putaway rules | For warehouse slotting optimization. Advanced WMS feature. |
| 50 | **Financial Report Template Builder** | Accounts | No custom financial statement builder | ERPNext has Financial Report Template doctype for custom statements. Haypbooks has custom-reports/report-builder but not specifically for financial statements. |

### SKIP — Not Relevant for Haypbooks' Target Market

| # | ERPNext Feature | Reason to Skip |
|---|---|---|
| 51 | **Manufacturing Settings, Workstations, Routing, Plant Floor** | Haypbooks is an accounting/ERP platform, not a manufacturing execution system. This is a fundamentally different product. |
| 52 | **Subcontracting BOMs and Orders** | Manufacturing-specific. Only relevant if Haypbooks enters manufacturing. |
| 53 | **Full Quality Management System (NCR, Quality Actions, Quality Meetings)** | QMS is an entire domain. Not core to accounting/ERP for SMBs. |
| 54 | **Domain-specific configurations** (Healthcare, Education, Non-profit) | ERPNext's domain modules are for specific industries. Haypbooks targets general SMB accounting. |
| 55 | **Shopping Cart** | E-commerce is a separate product. QuickBooks integrates with Shopify rather than building it in. |
| 56 | **Portal (customer/supplier self-service portal)** | Different architecture. Haypbooks has customer portal under sales/customers/portal which may serve a similar purpose. |
| 57 | **Website generators (BOM, Sales Partner published to web)** | ERPNext's web framework feature. Haypbooks is a SPA, not a CMS. |
| 58 | **Regional compliance for specific countries** (Italy SDI, UAE VAT 201, South Africa VAT) | Country-specific implementations. Haypbooks should handle this differently (config-driven, not code-per-country). |
| 59 | **Demo Data / Demo Company clearing** | Development/testing feature, not a product feature. |
| 60 | **Bot Parsers (FindItemBot)** | ERPNext's search bot. Haypbooks should use modern AI search instead. |

---

## Section 4: Features Haypbooks Already Has That ERPNext Also Has (Overlap Confirmation)

These features exist in both systems — no action needed:

| Feature Area | ERPNext Location | Haypbooks Location |
|---|---|---|
| **Chart of Accounts** | Account doctype | accounting/core-accounting/chart-of-accounts |
| **Journal Entries** | Journal Entry doctype | accounting/core-accounting/journal-entries |
| **General Ledger** | General Ledger report | accounting/core-accounting/general-ledger + reporting/reports-center/accountant-reports/general-ledger |
| **Balance Sheet** | Balance Sheet report | reporting/reports-center/financial-statements/balance-sheet |
| **Profit & Loss** | P&L Statement report | reporting/reports-center/financial-statements/profit-and-loss |
| **Cash Flow** | Cash Flow report | reporting/reports-center/financial-statements/cash-flow-statement |
| **Trial Balance** | Trial Balance report | reporting/reports-center/accountant-reports/trial-balance |
| **Sales Invoices** | Sales Invoice doctype | sales/billing/invoices |
| **Credit Notes** | Sales Invoice (is_return) | sales/revenue/credit-notes |
| **Customers** | Customer doctype | sales/customers |
| **Customer Groups** | Customer Group doctype | sales/customers/groups |
| **Customer Statements** | Process Statement of Accounts | sales/customers/statements |
| **Quotations** | Quotation doctype | sales/opportunities/quotes |
| **Sales Orders** | Sales Order doctype | sales/opportunities/orders |
| **Opportunities / Pipeline** | Opportunity doctype | sales/opportunities/pipeline |
| **Recurring Invoices** | Subscription doctype | sales/billing/recurring |
| **Collections / AR Aging** | Accounts Receivable report | sales/collections/aging |
| **Dunning** | Dunning doctype | sales/collections/dunning |
| **Write-offs** | (via Journal Entry) | sales/collections/write-offs |
| **Deferred Revenue** | Process Deferred Accounting | sales/revenue/deferred + sales/revenue/recognition |
| **Suppliers/Vendors** | Supplier doctype | expenses/vendors |
| **Bills (Purchase Invoices)** | Purchase Invoice doctype | expenses/bills-payments/bills |
| **Bill Payments** | Payment Entry (against PI) | expenses/bills-payments/bill-payments |
| **AP Aging** | Accounts Payable report | expenses/bills-payments/ap-aging |
| **Recurring Bills** | Subscription (purchase) | expenses/bills-payments/recurring-bills |
| **Vendor Credits** | (via PI is_return) | expenses/bills-payments/vendor-credits |
| **Purchase Orders** | Purchase Order doctype | expenses/procurement/orders |
| **Request for Quotation** | Request for Quotation doctype | expenses/procurement/rfq |
| **Procurement Approvals** | (via workflow) | expenses/procurement/approvals |
| **Employee Expenses** | (via HR module) | expenses/employee-expenses/expenses |
| **Mileage** | (via HR module) | expenses/employee-expenses/mileage |
| **Per Diem** | (via HR module) | expenses/employee-expenses/per-diem |
| **Reimbursements** | (via HR module) | expenses/employee-expenses/reimbursements |
| **Bank Reconciliation** | Bank Reconciliation Tool | banking/reconciliation |
| **Bank Rules** | Bank Transaction Rule | banking/bank-rules |
| **Bank Transactions** | Bank Transaction | banking/transactions |
| **Undeposited Funds** | (via Payment Entry) | banking/transactions/undeposited-funds |
| **Items** | Item doctype | inventory/items |
| **Item Categories** | Item Group | inventory/items/categories |
| **Warehouses** | Warehouse doctype | inventory/warehouses |
| **Stock Movements** | Stock Entry | inventory/stock-operations/stock-movements |
| **Stock Transfers** | Stock Entry (Transfer) | inventory/stock-operations/transfers |
| **Stock Adjustments** | Stock Reconciliation | inventory/stock-operations/adjustments + inventory/control/physical-counts |
| **Cycle Counts** | Stock Reconciliation | inventory/control/cycle-counts |
| **Reorder Points** | Item Reorder | inventory/control/reorder-points |
| **Inventory Valuation** | Stock Balance report | inventory/valuation/inventory-valuation |
| **Landed Costs** | Landed Cost Voucher | inventory/valuation/landed-costs |
| **Item Bundles** | Product Bundle | inventory/items/bundles |
| **Projects** | Project doctype | projects/project-setup/projects |
| **Project Templates** | Project Template | projects/project-setup/templates |
| **Project Tasks** | Task doctype | projects/tasks |
| **Milestones** | (via project tasks) | projects/project-setup/milestones |
| **Project Billing** | (via Sales Invoice w/ project) | projects/billing |
| **Budget vs Actual (Project)** | Budget | projects/financials/budget-vs-actual |
| **Project Profitability** | (via Project dashboard) | projects/financials/profitability |
| **Timesheets** | Timesheet doctype | time/entry/timesheets |
| **Time Entries / Timer** | (via Timesheet) | time/entry/time-entries + time/entry/timer |
| **Billable Time Review** | Timesheet Billing Summary | time/review/billable-time-review |
| **Time Approvals** | (via workflow) | time/review/time-approvals |
| **Fixed Assets** | Asset doctype | accounting/fixed-assets/asset-management |
| **Depreciation** | Asset Depreciation Schedule | accounting/fixed-assets/depreciation |
| **Asset Lifecycle** | Asset Movement + Activity | accounting/fixed-assets/asset-lifecycle |
| **Employees** | Employee doctype (setup) | payroll-workforce/workforce/employees |
| **Job Positions** | Designation (setup) | payroll-workforce/workforce/job-positions |
| **Payroll Runs** | (via HR module, separate app) | payroll-workforce/payroll-processing/payroll-runs |
| **Salary Structures** | (via HR module) | payroll-workforce/compensation/salary-structures |
| **Allowances/Deductions** | (via HR module) | payroll-workforce/compensation/allowances + deductions |
| **Leave Management** | (via HR module) | payroll-workforce/time-leave/leave-requests + leave-balances |
| **Holiday Calendar** | Holiday List (setup) | payroll-workforce/time-leave/holiday-calendar |
| **Shift Scheduling** | (via HR module) | payroll-workforce/time-leave/shift-scheduling |
| **Payroll Taxes / Withholding** | Tax Withholding Category | payroll-workforce/payroll-taxes/tax-withholding |
| **Tax Rates** | Tax templates | taxes/tax-setup/tax-rates |
| **Tax Filing** | (via regional reports) | taxes/filing-payments/tax-returns |
| **Tax Calendar** | (via scheduler) | taxes/tax-center/tax-calendar |
| **Tax Dashboard** | (via reports) | taxes/tax-center/tax-dashboard |
| **Period Close / Lock** | Period Closing Voucher | accounting/period-close/lock-period |
| **Multi-Currency Revaluation** | Exchange Rate Revaluation | accounting/period-close/multi-currency-revaluation |
| **Company / Entity Setup** | Company doctype | settings/company-profile/company-details |
| **Fiscal Year** | Fiscal Year doctype | settings/company-profile/fiscal-year-setup |
| **Users & Roles** | User/Role (Frappe core) | settings/users-security/roles-permissions + user-management |
| **Custom Fields** | Custom Field (Frappe core) | settings/customization/custom-fields |
| **Audit Log** | Version (Frappe core) | settings/data-privacy/audit-log + compliance/monitoring/audit-log-analysis |
| **Data Backup** | (Frappe core) | settings/data-privacy/data-backup |
| **Dashboard** | Workspace dashboards | home/dashboard |
| **Notifications** | Notification (Frappe core) | home/notifications |
| **Reports Center** | Report Center | reporting/reports-center |
| **Custom Report Builder** | Query Report | reporting/custom-reports/report-builder |
| **Scheduled Reports** | Auto Email Report | reporting/custom-reports/scheduled-reports |
| **API Keys** | (Frappe core) | apps-integrations/api/api-keys |
| **Webhooks** | Webhook (Frappe core) | apps-integrations/api/webhooks |
| **Import Data** | Data Import (Frappe core) | apps-integrations/imports/import-data |
| **Export Data** | (Frappe core) | apps-integrations/data-tools/export-data |
| **Task Management** | ToDo (Frappe core) | tasks-approvals |
| **Approval Workflows** | Workflow (Frappe core) | tasks-approvals/management/approval-queue |
| **Intercompany Transactions** | (via Company setup) | organization/entity-structure/intercompany |
| **Consolidation** | Consolidated Financial Statement | organization/entity-structure/consolidation |

---

## Section 5: ERPNext Features That Are BETTER Than QuickBooks — Worth Adopting Even If QuickBooks Doesn't Have Them

These are ERPNext innovations that exceed what QuickBooks offers and would give Haypbooks a competitive edge:

### 5.1 Multi-Dimensional Accounting (Accounting Dimensions)
**What ERPNext does:** Allows creating custom accounting dimensions beyond the standard Cost Center and Project — e.g., "Branch," "Region," "Product Line" — and tagging every transaction with these dimensions for multi-dimensional P&L analysis.

**Why it's better than QuickBooks:** QuickBooks only has Class and Location (2 dimensions). ERPNext allows unlimited custom dimensions. This is a game-changer for businesses that need to analyze profitability by multiple axes simultaneously.

**Recommendation:** **ADOPT.** This would differentiate Haypbooks from QuickBooks significantly.

### 5.2 Bank Transaction Rules with ML-like Auto-Matching
**What ERPNext does:** Bank Transaction Rules with description conditions and account mapping that automatically categorize and match bank transactions. The scheduler runs rule evaluation hourly.

**Why it's better than QuickBooks:** QuickBooks has bank rules, but ERPNext's system is more granular with condition-based matching, multiple rule types, and scheduled evaluation. Combined with Haypbooks' existing AI bookkeeping (`automation/ai-intelligence/ai-bookkeeping`), this could be a powerful differentiator.

**Recommendation:** **ADOPT.** Haypbooks already has bank-rules and smart-matching — extend this with ERPNext-style condition-based rules.

### 5.3 Ledger Health Monitoring
**What ERPNext does:** A Ledger Health Monitor that runs automated checks on ledger integrity — detecting unreconciled entries, orphaned references, mismatched balances, and invalid entries — with company-level monitoring.

**Why it's better than QuickBooks:** QuickBooks has a "Verify Data" utility but it's manual. ERPNext's continuous health monitoring is proactive and enterprise-grade.

**Recommendation:** **ADOPT.** This fits perfectly with Haypbooks' `compliance/monitoring` module and would be a unique selling point for accountants.

### 5.4 Repost Accounting/Payment Ledger
**What ERPNext does:** Allows reposting (recalculating) accounting and payment ledgers when historical transactions are modified, with a full audit trail of what was reposted and why.

**Why it's better than QuickBooks:** QuickBooks recalculates silently. ERPNext's explicit reposting with audit trail is more transparent and auditable.

**Recommendation:** **CONSIDER.** Valuable for audit compliance but complex to implement.

### 5.5 Subscription Management with Plan-Based Billing
**What ERPNext does:** Full subscription system: Subscription Plan → Subscription → auto-generate invoices on schedule → process subscription. Supports multiple plans per subscription, proration, and cancellation.

**Why it's better than QuickBooks:** QuickBooks has recurring transactions (memorized transactions) but not true subscription management with plan hierarchies. This is closer to Stripe Billing or Chargebee.

**Recommendation:** **ADOPT.** Haypbooks has recurring invoices but extending to plan-based subscriptions would be a significant feature upgrade.

### 5.6 Landed Cost Voucher System
**What ERPNext does:** A dedicated Landed Cost Voucher that distributes additional costs (freight, insurance, customs) across received items based on quantity or value, automatically updating item valuation.

**Why it's better than QuickBooks:** QuickBooks has no native landed cost functionality. Businesses must manually adjust item costs. ERPNext's system is a proper landed cost allocation engine.

**Recommendation:** **ADOPT.** Haypbooks already has `inventory/valuation/landed-costs` route — extend it to a full voucher-based allocation system.

### 5.7 Supplier Scorecard System
**What ERPNext does:** A complete supplier performance scoring system with configurable criteria (on-time delivery, quality, price variance), weighted scoring, standing levels, and period-based evaluation.

**Why it's better than QuickBooks:** QuickBooks has no supplier performance tracking at all.

**Recommendation:** **CONSIDER.** Valuable for procurement-heavy businesses. Haypbooks could add a lightweight version under `expenses/vendors`.

### 5.8 Item Variants with Attribute Matrix
**What ERPNext does:** Items can have variants based on attributes (e.g., T-Shirt → Size: S/M/L × Color: Red/Blue). Each variant is a separate trackable item with its own stock, price, and barcode.

**Why it's better than QuickBooks:** QuickBooks has no item variant system. Each variant must be a separate item manually.

**Recommendation:** **CONSIDER.** Essential for retail/product businesses but adds significant complexity.

### 5.9 Putaway Rules for Warehouse Optimization
**What ERPNext does:** Putaway rules that automatically suggest where to store received items based on item attributes, warehouse zones, and capacity constraints.

**Why it's better than QuickBooks:** QuickBooks has no warehouse management at all.

**Recommendation:** **SKIP** for now (too advanced for SMB target), but **CONSIDER** if Haypbooks expands WMS capabilities.

### 5.10 Process Statement of Accounts (Automated Customer/Vendor Statements)
**What ERPNext does:** Automatically generates and emails customer or supplier statements on a schedule, with configurable frequency, format, and cost center filtering.

**Why it's better than QuickBooks:** QuickBooks can email statements but not on an automated schedule with this level of configuration.

**Recommendation:** **ADOPT.** Haypbooks has customer/vendor statements pages — add scheduled auto-email functionality.

### 5.11 Dunning with Escalation
**What ERPNext does:** Configurable dunning types with escalating letter levels (reminder → warning → final notice), each with configurable text, interest calculation, and timing.

**Why it's better than QuickBooks:** QuickBooks has no dunning system. Users must manually create reminder emails.

**Recommendation:** **ADOPT.** Haypbooks already has `sales/collections/dunning` — extend with dunning type configuration and escalation levels.

### 5.12 Project Update Timeline
**What ERPNext does:** Project Updates that create a timeline of status changes, notes, and milestones — visible as a project activity feed with email notifications to project users.

**Why it's better than QuickBooks:** QuickBooks has no project management. Even QuickBooks Online's "Projects" feature is basic profitability tracking.

**Recommendation:** **ADOPT.** Haypbooks has projects — adding a status update timeline would enhance project tracking significantly.

### 5.13 Appointment Booking with Slot Availability
**What ERPNext does:** Appointment booking with availability of slots, booking settings, and confirmation — essentially a built-in Calendly.

**Why it's better than QuickBooks:** Not applicable — QuickBooks has nothing like this.

**Recommendation:** **CONSIDER.** Useful for service businesses (accountants, consultants) but could be an integration instead.

### 5.14 Exponential Smoothing Forecasting (Sales/Production)
**What ERPNext does:** Built-in statistical forecasting using exponential smoothing for sales and production planning.

**Why it's better than QuickBooks:** QuickBooks has no forecasting beyond simple trend lines.

**Recommendation:** **CONSIDER.** Could enhance Haypbooks' `home/performance` and `reporting/analytics` modules with predictive analytics.

### 5.15 Multi-Company Consolidated Financial Statements
**What ERPNext does:** Generates consolidated financial statements across multiple companies, eliminating inter-company transactions automatically.

**Why it's better than QuickBooks:** QuickBooks Online requires separate subscriptions per company with no consolidation. QuickBooks Enterprise has limited consolidation.

**Recommendation:** **ADOPT.** Haypbooks already has `organization/entity-structure/consolidation` — make sure it produces actual consolidated financial statements, not just entity management.

---

## Summary Statistics

| Metric | ERPNext | Haypbooks |
|---|---|---|
| **Top-level modules** | 12+ (accounts, selling, buying, stock, projects, assets, support, crm, manufacturing, subcontracting, quality_management, utilities) | 17 (accounting, banking, sales, expenses, inventory, payroll-workforce, projects, reporting, compliance, taxes, settings, automation, apps-integrations, tasks-approvals, time, organization, home) |
| **Total doctypes (estimated)** | ~450+ | N/A (route-based, not doctype-based) |
| **Total reports** | ~160+ | ~20 report routes + custom report builder |
| **Total pages (custom UI)** | ~6 (POS, Sales Funnel, Stock Balance, BOM Comparison, Shop Floor, Warehouse Capacity) | 276 page routes |
| **Total workspace configs** | 15 (Accounts Setup, Banking, Budgeting, Financial Reports, Invoicing, Payments, Share Management, Subscriptions, Taxes, Selling, Buying, Stock, Projects, Assets, Support, CRM, Manufacturing) | N/A (sidebar-based navigation) |

### Key Architectural Differences

1. **ERPNext** is doctype-centric: every entity is a Frappe DocType with CRUD operations, views, and print formats. Navigation is workspace-based with links to doctypes/reports.

2. **Haypbooks** is route-centric: every feature is a Next.js page route with custom UI. Navigation is module-based with nested directories. This gives more UI flexibility but requires explicit page creation for each feature.

3. **ERPNext** auto-generates list views, form views, and reports from doctype definitions. **Haypbooks** must build each UI explicitly.

4. **Haypbooks has features ERPNext lacks:** AI bookkeeping, smart matching, workflow builder, compliance monitoring (fraud detection rules, internal controls, policy management), accountant workspace, developer sandbox, app marketplace, and a dedicated time tracking module with timer.

5. **ERPNext has features Haypbooks lacks:** Manufacturing (BOMs, work orders, job cards, MRP), subcontracting, quality management, full POS, supplier scorecards, item variants, loyalty programs, share management, EDI, telephony, and a customer/supplier portal.
