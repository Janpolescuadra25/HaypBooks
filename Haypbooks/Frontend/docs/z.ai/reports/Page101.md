
PAGE 101 DEVELOPMENT GUIDE
PART 1: CORE ACCOUNTING FOUNDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Chart of Accounts • Journal Entries • General Ledger • Trial Balance
HaypBooks Accounting Platform
Version 1.0 • March 2026
 
 
Table of Contents
Table of Contents	2
Introduction & Development Roadmap	4
Development Priority Roadmap	4
Page 1: Chart of Accounts	5
1.1 Page Overview	5
1.2 Page Goals & Objectives	5
1.3 UI Layout Design	5
1.3.1 Page Header Section	5
1.3.2 Summary Cards Section	6
1.3.3 Account Tree Table	6
1.4 Button Specifications	6
1.4.1 Primary Actions	7
1.4.2 Row Actions (Dropdown Menu)	7
1.5 Create/Edit Account Modal	7
1.6 API Endpoints	8
1.7 State Management	8
1.7.1 Required State Variables	8
1.8 Validation Rules	9
1.9 Error Handling	9
Page 2: Journal Entries	11
2.1 Page Overview	11
2.2 Page Goals & Objectives	11
2.3 UI Layout Design	11
2.3.1 Header Section	11
2.3.2 Journal Entries Table	11
2.4 Create/Edit Journal Entry Page	12
2.4.1 Header Section	12
2.4.2 Entry Details Section	12
2.4.3 Line Items Section	13
2.4.4 Balance Summary Footer	13
2.5 Button Specifications	14
2.6 API Endpoints	14
2.7 Validation Rules	14
Page 3: General Ledger	16
3.1 Page Overview	16
3.2 Page Goals & Objectives	16
3.3 UI Layout Design	16
3.3.1 Account Selector Section	16
3.3.2 Ledger Transactions Table	16
3.3.3 Summary Footer	17
3.4 API Endpoints	17
3.5 Query Parameters	17
Page 4: Trial Balance	19
4.1 Page Overview	19
4.2 Page Goals & Objectives	19
4.3 UI Layout Design	19
4.3.1 Report Header	19
4.3.2 Balance Status Card	19
4.3.3 Trial Balance Table	20
4.4 API Endpoints	20
4.5 Response Structure	20
Appendix A: API Client Setup Guide	22
A.1 Recommended API Client Structure	22
A.1.1 File Structure	22
A.2 Data Fetching Strategy	22
A.3 Authentication Flow	22
Summary	22

Note: Right-click the Table of Contents and select "Update Field" to refresh page numbers.
 
Introduction & Development Roadmap
This document provides comprehensive end-to-end specifications for the Core Accounting Foundation pages of HaypBooks. Each page specification includes complete UI design details, button functionality, data table requirements, API endpoint mappings, state management, validation rules, and error handling strategies.
Development Priority Roadmap
The following roadmap defines the recommended implementation order based on dependencies. Core Accounting pages must be implemented first as all other modules depend on them.
Phase	Pages	Priority	Dependencies
1	Chart of Accounts	CRITICAL	None - Foundation
2	Journal Entries	CRITICAL	Chart of Accounts
3	General Ledger	HIGH	Chart of Accounts, JEs
4	Trial Balance	HIGH	Chart of Accounts, JEs
5	Accounting Periods	HIGH	All Core Accounting
Table 1: Development Priority Roadmap
 
Page 1: Chart of Accounts
1.1 Page Overview
Property	Description
Route Path	/accounting/core-accounting/chart-of-accounts
Page Title	Chart of Accounts
Purpose	Manage the complete chart of accounts structure - the foundation of the entire accounting system. Users can create, edit, organize, and deactivate accounts in a hierarchical tree structure.
User Roles	Admin, Accountant, Bookkeeper (read-only for Bookkeeper)
Key Metrics	Total Accounts, Active Accounts, Account Types Distribution, Total Balance by Category
Table 1.1: Chart of Accounts Page Overview

> **🔗 Cross-References:** Account codes underpin every module. Drill down from any account to General Ledger → `/accounting/core-accounting/general-ledger`. Balances roll up to Trial Balance → `/accounting/core-accounting/trial-balance`. AR uses revenue/receivable accounts; AP uses expense/payable accounts; Payroll uses salary/tax accounts; Tax mappings reference VAT/withholding liability accounts.

1.2 Page Goals & Objectives
•	Provide a comprehensive view of all accounts organized by type (Asset, Liability, Equity, Revenue, Expense)
•	Enable creation of new accounts with proper categorization and parent-child relationships
•	Allow editing of account details including name, code, description, and settings
•	Support account deactivation (soft delete) with balance validation
•	Display real-time balances for each account
•	Provide account ledger drill-down capability
•	Support filtering by account type, status, and search functionality
1.3 UI Layout Design
1.3.1 Page Header Section
The header section contains the page title, action buttons, and summary statistics. It should be sticky at the top during scrolling.
Component	Details	Styling
Page Title	"Chart of Accounts" with company name subtitle	text-2xl font-bold, text-slate-900
New Account Button	Primary CTA - Opens create modal	bg-emerald-600 hover:bg-emerald-700, white text
Import Button	Secondary - Import from CSV	bg-white border-slate-300, hover:bg-slate-50
Export Button	Secondary - Export to CSV/Excel	bg-white border-slate-300, hover:bg-slate-50
Search Input	Global search across accounts	w-64, border-slate-300, focus:ring-2 focus:ring-emerald-500
Filter Dropdown	Filter by account type	w-48, border-slate-300
Status Toggle	Show/Hide inactive accounts	Toggle switch with label
Table 1.2: Header Components
1.3.2 Summary Cards Section
Four summary cards displayed horizontally showing key metrics at a glance:
Card	Metric	Calculation	Icon
Total Accounts	Count of all accounts	COUNT(accounts) WHERE deletedAt IS NULL	Layers icon (lucide)
Active Accounts	Count of active accounts	COUNT(accounts) WHERE isActive=true	CheckCircle icon
Total Debits	Sum of debit balances	SUM(balance) WHERE normalSide=DEBIT	TrendingUp icon
Total Credits	Sum of credit balances	SUM(balance) WHERE normalSide=CREDIT	TrendingDown icon
Table 1.3: Summary Cards
1.3.3 Account Tree Table
The main content area displays a hierarchical tree table with expandable/collapsible rows. Parent accounts are bold with an expand icon, child accounts are indented.
Column	Width	Alignment	Content
Expand/Icon	40px fixed	Center	Chevron for parent accounts, indentation for children
Code	100px	Left	Account code (e.g., 1000, 1100, 1110)
Name	Flexible (grow)	Left	Account name, bold for parent accounts
Type	120px	Center	Account type badge with color coding
Category	100px	Center	Category: Asset/Liability/Equity/Revenue/Expense
Balance	140px	Right	Current balance formatted as currency
Status	80px	Center	Active/Inactive badge
Actions	100px	Center	Dropdown menu: Edit, View Ledger, Deactivate
Table 1.4: Account Tree Table Columns
1.4 Button Specifications
1.4.1 Primary Actions
Button	Action	Icon	Behavior
New Account	Opens create modal	Plus icon	Slide-in panel from right, all form fields
Import	Opens Import CSV modal	Upload icon	File picker + preview table (first 5 rows) + row-by-row POST to API
Export	Downloads chart-of-accounts.csv	Download icon	Builds CSV from flat accounts: Code, Name, Type, Normal Side, Balance, Status, Parent Code, Description
Expand All	Expands all tree rows	ChevronDown icon	setExpanded(new Set(flatAccs.map(a => a.id)))
Collapse	Collapses all tree rows	ChevronRight icon	setExpanded(new Set())
Refresh	Reloads data from API	Refresh icon	Spinner animation during fetch
Table 1.5: Primary Action Buttons
1.4.2 Row Actions (Dropdown Menu)
Action	Function	Conditions
Edit Account	Opens edit modal with pre-filled data	Always visible
View Ledger	Navigates to /accounting/core-accounting/general-ledger?accountId=:id	Always visible — implemented as <a> tag
Add Sub-account	Opens create modal with parent.id as defaultParentId	Only visible when account.isHeader === true
Deactivate	DELETE /companies/:id/accounting/accounts/:id — soft delete	Only if account.isActive === true
Reactivate	PUT /companies/:id/accounting/accounts/:id { isActive: true }	Only visible when account.isActive === false
Table 1.6: Row Action Buttons
1.5 Create/Edit Account Modal
A slide-in panel from the RIGHT side of the screen. The panel uses spring animation (Framer Motion) and closes by clicking the X button or calling onClose(). It does NOT close on outside click.
Field	Type	Required	Validation & Behavior
Account Code	Text Input (monospace)	Yes	Unique per company, alphanumeric, shown as placeholder e.g. 1110
Account Type	Select Dropdown	Yes	5 options: Asset, Liability, Equity, Revenue, Expense
Account Name	Text Input	Yes	Max 100 chars; placeholder e.g. "Cash & Cash Equivalents"
Parent Account	Select Dropdown	No	Filtered to isHeader accounts only; — None (Top Level) — as first option
Normal Side	Radio Buttons (Debit/Credit)	Yes	Auto-populated on account type change: Asset/Expense → Debit; Liability/Equity/Revenue → Credit
Description	Textarea (3 rows)	No	Optional description, resize disabled
Opening Balance (company currency)	Number Input	No	Only for NEW accounts (hidden on edit); prefix symbol uses company currency (via `formatCurrency()` helper)
Is Header Account	Checkbox	No	When checked: account cannot have transactions; qualifies for Add Sub-account in row menu
Table 1.7: Account Form Fields

AUTO_NORMAL_SIDE map (implemented):
Asset → Debit | Expense → Debit | Liability → Credit | Equity → Credit | Revenue → Credit

API calls on save:
- Create: POST /companies/:companyId/accounting/accounts
- Edit:   PUT  /companies/:companyId/accounting/accounts/:accountId

Modal guard: only rendered when modalOpen && companyId are both truthy.
1.6 API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/accounting/accounts	List all accounts with filters
POST	/api/companies/:companyId/accounting/accounts	Create new account
GET	/api/companies/:companyId/accounting/accounts/:accountId	Get single account details
PUT	/api/companies/:companyId/accounting/accounts/:accountId	Update account
DELETE	/api/companies/:companyId/accounting/accounts/:accountId	Deactivate account (soft delete)
GET	/api/companies/:companyId/accounting/accounts/:accountId/ledger	Get account ledger entries
GET	/api/companies/:companyId/accounting/account-types	Get all account types (reference data)
Table 1.8: Chart of Accounts API Endpoints
1.7 State Management
1.7.1 Required State Variables
State Variable	Type	Description
treeAccounts	Account[]	Hierarchical tree of accounts from API
flatAccs	Account[]	Flat array for CSV export, modal dropdowns, totals
companyId	string | null	Loaded from /api/companies/recent (first item)
companyName	string	Loaded from /api/companies/recent .name field; shown in header
loading	boolean	Loading state for API calls
search	string	Full-text filter on code + name
filterType	AccountType | ''	Filter by account type (Asset/Liability/etc.)
showInactive	boolean	Toggle to show inactive accounts (default: false)
expanded	Set<string>	IDs of expanded tree rows; initially auto-expanded to top level
modalOpen	boolean	Account create/edit panel visibility
editingAccount	Account | null	Null = create mode; Account = edit mode
defaultParentId	string | undefined	Pre-set parent when opening Add Sub-account
importModal	boolean	Import CSV modal visibility
Table 1.9: State Variables
1.8 Validation Rules
•	Account Code: Required, unique within company, alphanumeric with hyphens allowed, 1-20 characters
•	Account Name: Required, 1-100 characters, cannot be duplicate within same parent
•	Account Type: Required, must be valid type ID from account-types endpoint
•	Parent Account: Optional, must exist and belong to same company, cannot create circular references
•	Normal Side: Required, auto-populated based on account type category (Asset/Expense = Debit, others = Credit)
•	Opening Balance: Optional, numeric, >= 0 for debit-normal accounts, <= 0 for credit-normal accounts
•	Deactivation: Can only deactivate if account balance is zero and no pending transactions
1.9 Error Handling
Error Type	User Message	Action
Network Error	Unable to connect to server. Please check your connection.	Show retry button, log error
401 Unauthorized	Your session has expired. Please log in again.	Redirect to login
403 Forbidden	You don't have permission to perform this action.	Show toast, disable action
404 Not Found	Account not found. It may have been deleted.	Refresh list, show toast
409 Conflict	Account code already exists. Please choose a different code.	Focus on code field
422 Validation	Please check the form for errors and try again.	Show field-level errors
500 Server Error	An unexpected error occurred. Please try again later.	Show toast, log error
Table 1.10: Error Handling Matrix
 
Page 2: Journal Entries
2.1 Page Overview
Property	Description
Route Path	/accounting/core-accounting/journal-entries
Page Title	Journal Entries
Purpose	Create, review, post, and manage journal entries - the core double-entry bookkeeping interface where all financial transactions are recorded.
User Roles	Admin, Accountant (full access), Bookkeeper (create only)
Key Metrics	Total Entries, Draft Entries, Posted Entries, Voided Entries, Total Debits/Credits
Table 2.1: Journal Entries Page Overview

> **🔗 Cross-References:** JEs are auto-created by: Invoice posting → `/sales/billing/invoices`, Bill approval → `/expenses/payables/bills`, Bank Reconciliation adjustments → `/banking-cash/reconciliation/reconcile`, Payroll post → `/payroll-workforce/payroll-processing/payroll-runs`. Manual adjusting entries via Period Close → `/accounting/period-close/adjustments`.

2.2 Page Goals & Objectives
•	Display all journal entries with filtering by status (Draft, Posted, Voided), date range, and search
•	Enable creation of new journal entries with proper double-entry validation (debits must equal credits)
•	Allow editing of draft entries with full line item management
•	Support posting of draft entries which updates account balances
•	Provide voiding capability for posted entries (creates reversing entry)
•	Show detailed view of each entry with all line items and audit information
•	Support bulk operations (bulk post, bulk void) for efficiency
2.3 UI Layout Design
2.3.1 Header Section
Component	Details	Styling
Page Title	"Journal Entries" with company name subtitle	text-2xl font-bold, text-slate-900
New Entry Button	Primary CTA - Opens create page/modal	bg-violet-600 hover:bg-violet-700, white text
Date Range Picker	Filter entries by date range	Two inputs: From Date, To Date
Status Filter	Multi-select: Draft, Posted, Voided	Dropdown with checkboxes
Search Input	Search by entry number, description	w-64, placeholder: "Search entries..."
Table 2.2: Journal Entries Header Components
2.3.2 Journal Entries Table
Column	Width	Content	Align	Sortable	Notes
Checkbox	40px	Selection checkbox	Center	No	For bulk actions
Entry #	120px	Journal entry number	Left	Yes	Click to view details
Date	100px	Entry date (YYYY-MM-DD)	Center	Yes	Default sort desc
Description	Flexible	Entry description	Left	No	Truncated with tooltip
Debit	120px	Total debit amount	Right	Yes	Currency formatted
Credit	120px	Total credit amount	Right	Yes	Currency formatted
Status	90px	Badge: Draft/Posted/Voided	Center	Yes	Color-coded badges
Created By	120px	User who created entry	Left	No	Avatar + name
Actions	100px	Dropdown menu	Center	No	Context-aware options
Table 2.3: Journal Entries Table Columns
2.4 Create/Edit Journal Entry Page
The journal entry creation/edit page is a full-page form (not a modal) for better usability with complex line items.
2.4.1 Header Section
Component	Details	Behavior
Back Button	Arrow left icon + "Back to Journal Entries"	Navigate back, confirm if unsaved changes
Page Title	"New Journal Entry" or "Edit Journal Entry #XXX"	Dynamic based on mode
Save Draft Button	Secondary button, saves without posting	Disabled if validation fails
Post Entry Button	Primary button, saves and posts immediately	Only enabled when balanced
Cancel Button	Discard changes and return to list	Confirm dialog if unsaved
Table 2.4: Journal Entry Form Header
2.4.2 Entry Details Section
Field	Type	Required	Validation & Behavior
Entry Date	Date Picker	Yes	Defaults to today, cannot be in closed period
Reference Number	Text Input	No	Auto-generated if empty (JE-YYYY-NNNN)
Description	Textarea	Yes	Max 500 chars, describes the transaction
Attachments	File Upload	No	Supports PDF, images, max 10MB each
Tags/Memo	Multi-select	No	Optional categorization tags
Table 2.5: Journal Entry Header Fields
2.4.3 Line Items Section
The line items section is a dynamic table where users add debit and credit lines. It must always balance.
Column	Type	Required	Behavior
Account	Searchable Select	Yes	Search by code or name, shows account type badge
Description	Text Input	No	Optional line-level description
Debit	Number Input	Conditional	At least one debit or credit required per line
Credit	Number Input	Conditional	Mutually exclusive with debit on same line
Actions	Icon Buttons	-	Delete row, duplicate row, add row below
Table 2.6: Line Items Table Columns
2.4.4 Balance Summary Footer
A sticky footer showing the running totals and balance status:
Element	Display	Styling
Total Debits	Sum of all debit amounts	Right-aligned, currency format
Total Credits	Sum of all credit amounts	Right-aligned, currency format
Difference	Total Debits - Total Credits	Red if ≠ 0, green if = 0
Balance Status	"Balanced" or "Out of Balance by X"	Badge: green for balanced, red for unbalanced
Line Count	Number of line items	Small text, "N lines"
Table 2.7: Balance Summary Footer
2.5 Button Specifications
Button	Action	Enabled When	API Call
New Entry	Opens create page	Always	None (navigation)
Save Draft	Saves entry as DRAFT	Valid form data	POST /journal-entries
Post Entry	Saves and posts entry	Balanced + valid data	POST then POST /:id/post
Edit	Opens edit page	Entry is DRAFT	None (navigation)
Post	Posts a draft entry	Entry is DRAFT	POST /:id/post
Void	Voids posted entry	Entry is POSTED	POST /:id/void
Add Line	Adds new row to lines	Always (max 100 lines)	None (local state)
Delete Line	Removes row from lines	More than 2 lines exist	None (local state)
Table 2.8: Journal Entry Buttons
2.6 API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/accounting/journal-entries	List all journal entries with filters
POST	/api/companies/:companyId/accounting/journal-entries	Create new journal entry (as DRAFT)
GET	/api/companies/:companyId/accounting/journal-entries/:jeId	Get single journal entry with lines
PUT	/api/companies/:companyId/accounting/journal-entries/:jeId	Update draft journal entry
POST	/api/companies/:companyId/accounting/journal-entries/:jeId/post	Post a draft entry (updates balances)
POST	/api/companies/:companyId/accounting/journal-entries/:jeId/void	Void a posted entry (creates reversal)
Table 2.9: Journal Entries API Endpoints
2.7 Validation Rules
•	Entry Date: Required, cannot be in a closed accounting period
•	Description: Required, 1-500 characters
•	Line Items: Minimum 2 lines required, maximum 100 lines
•	Account Selection: Each line must have a valid, active account
•	Debit/Credit: At least one of debit or credit must be non-zero per line
•	Balance Rule: Total debits must equal total credits (difference < 0.01)
•	Duplicate Lines: Same account can appear multiple times (will be combined)
•	Post Permission: User must have 'accountant' or 'admin' role to post
 
Page 3: General Ledger
3.1 Page Overview
Property	Description
Route Path	/accounting/core-accounting/general-ledger
Page Title	General Ledger
Purpose	View all transactions for a specific account with running balances. This is the detailed transaction history that shows how each account's balance changes over time.
User Roles	Admin, Accountant, Bookkeeper, Viewer (read-only)
Key Metrics	Opening Balance, Total Debits, Total Credits, Closing Balance, Transaction Count
Table 3.1: General Ledger Page Overview
3.2 Page Goals & Objectives
•	Display all posted transactions for a selected account in chronological order
•	Show running balance after each transaction
•	Allow filtering by date range
•	Provide drill-down to source journal entry from each line
•	Support export to CSV/Excel for external analysis
•	Show account summary at top (code, name, type, current balance)
•	Enable quick navigation to related accounts in split transactions
3.3 UI Layout Design
3.3.1 Account Selector Section
A prominent section at the top for selecting the account to view:
Component	Details	Behavior
Account Selector	Searchable dropdown with all active accounts	Search by code or name, grouped by type
Account Info Card	Shows account code, name, type, normal side	Updates when account changes
Current Balance	Large number display of current balance	Color: green for positive, red for negative
Date Range Picker	From/To date inputs for filtering	Defaults to current fiscal year
Export Button	Download as CSV or Excel	Includes all filtered transactions
Table 3.2: Account Selector Components
3.3.2 Ledger Transactions Table
Column	Width	Content	Align	Sortable	Notes
Date	100px	Transaction date	Center	Yes	Default sort ascending
Entry #	120px	Journal entry number (clickable)	Left	No	Link to journal entry
Description	Flexible	Line item description or entry description	Left	No	Truncated with tooltip
Debit	120px	Debit amount if applicable	Right	No	Blank if credit
Credit	120px	Credit amount if applicable	Right	No	Blank if debit
Balance	120px	Running balance after transaction	Right	No	Calculated running total
Reference	100px	Related document reference	Left	No	Invoice #, Bill #, etc.
Table 3.3: Ledger Transactions Table
3.3.3 Summary Footer
Element	Display	Calculation
Opening Balance	Balance at start of date range	Balance before first transaction in range
Total Debits	Sum of all debits in range	SUM(debit) for filtered transactions
Total Credits	Sum of all credits in range	SUM(credit) for filtered transactions
Net Change	Total Debits - Total Credits	Based on normal side of account
Closing Balance	Balance at end of date range	Opening Balance + Net Change
Table 3.4: Summary Footer Elements
3.4 API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/accounting/accounts/:accountId/ledger	Get ledger entries for account
Table 3.5: General Ledger API
3.5 Query Parameters
Parameter	Type	Required	Description
from	Date (ISO string)	No	Start date for filtering
to	Date (ISO string)	No	End date for filtering
limit	Integer	No	Max records to return (default 100)
offset	Integer	No	Pagination offset (default 0)
Table 3.6: Query Parameters
 
Page 4: Trial Balance
4.1 Page Overview
Property	Description
Route Path	/accounting/core-accounting/trial-balance
Page Title	Trial Balance
Purpose	Display the trial balance report showing all account balances at a point in time. This is a critical report for verifying that total debits equal total credits before generating financial statements.
User Roles	Admin, Accountant, Bookkeeper, Viewer (read-only)
Key Metrics	Total Debit Balance, Total Credit Balance, Difference, Balance Status
Table 4.1: Trial Balance Page Overview
4.2 Page Goals & Objectives
•	Display all active accounts with their current balances
•	Separate balances into debit and credit columns based on normal side
•	Show totals and verify that debits equal credits
•	Allow filtering by "As Of" date to see historical trial balance
•	Support drill-down to account ledger from each row
•	Enable export to PDF, Excel for reporting
•	Highlight any imbalance with clear visual indicators
4.3 UI Layout Design
4.3.1 Report Header
Component	Details	Styling
Report Title	"Trial Balance" with company name	text-2xl font-bold, text-slate-900
As Of Date Picker	Date input for point-in-time view	Defaults to today, can select any past date
Export Button	Dropdown: PDF, Excel, Print	bg-white border, hover:bg-slate-50
Refresh Button	Reload data from server	Icon button with spinner on load
Print Button	Opens browser print dialog	Opens print preview
Table 4.2: Trial Balance Header Components
4.3.2 Balance Status Card
A prominent card showing the balance verification status:
Element	Display	Color	Behavior
Status Badge	"BALANCED" or "OUT OF BALANCE"	Green / Red	Prominent indicator
Total Debits	Sum of all debit column	Black text	Large number format
Total Credits	Sum of all credit column	Black text	Large number format
Difference	Total Debits - Total Credits	Green if 0, Red otherwise	Should always be 0
Table 4.3: Balance Status Card
4.3.3 Trial Balance Table
Column	Width	Content	Align	Sort	Notes
Code	100px	Account code	Left	Yes	Clickable to ledger
Name	Flexible	Account name	Left	Yes	Main sortable column
Type	100px	Account type badge	Center	Yes	Color-coded badge
Debit	130px	Debit balance	Right	Yes	Only if > 0
Credit	130px	Credit balance	Right	Yes	Only if > 0
Actions	80px	View ledger icon	Center	No	Opens general ledger
Table 4.4: Trial Balance Table Columns
4.4 API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/accounting/trial-balance	Get trial balance as of date
Table 4.5: Trial Balance API
4.5 Response Structure
The trial balance endpoint returns the following structure:
Field	Type	Description
rows	Array	Array of account balance objects
totalDebits	Decimal	Sum of all debit balances
totalCredits	Decimal	Sum of all credit balances
balanced	Boolean	True if debits = credits (within tolerance)
asOf	DateTime	The as-of date for the report
Table 4.6: API Response Structure
 
Appendix A: API Client Setup Guide
A.1 Recommended API Client Structure
Create a centralized API client for all backend communication. This ensures consistent authentication handling, error management, and TypeScript typing across all pages.
A.1.1 File Structure
File Path	Purpose
/lib/api/client.ts	Base API client with fetch wrapper, auth injection, error handling
/lib/api/accounting.ts	Accounting module API functions (accounts, journal entries, etc.)
/lib/api/ar.ts	Accounts Receivable API functions
/lib/api/ap.ts	Accounts Payable API functions
/lib/api/banking.ts	Banking module API functions
/types/api/	TypeScript interfaces matching backend DTOs
Table A.1: Recommended File Structure
A.2 Data Fetching Strategy
Use SWR (stale-while-revalidate) for data fetching across all pages. This provides automatic caching, background refetching, and optimistic updates.
•	useSWR for read operations (list, get single record)
•	useSWRMutation for create, update, delete operations
•	Dedicated hooks for each resource (useAccounts, useJournalEntries, etc.)
•	Optimistic updates for better UX on mutations
•	Automatic error boundary integration
A.3 Authentication Flow
All API requests must include authentication token in headers:
Step	Description
1. Token Storage	Store JWT token in httpOnly cookie (set by backend on login)
2. Request Interceptor	API client reads token from cookie or localStorage
3. Header Injection	Add Authorization: Bearer <token> to all requests
4. 401 Handling	Redirect to login on 401 response, clear token
5. Token Refresh	Use refresh token to get new access token before expiry
Table A.2: Authentication Flow
Summary
This Part 1 document covers the Core Accounting Foundation pages that form the backbone of the HaypBooks accounting platform. These pages must be implemented first as all other modules (AR, AP, Banking, Payroll) depend on a properly functioning chart of accounts and journal entry system.
Key dependencies to implement before starting frontend development:
•	API client library with authentication handling
•	SWR setup for data fetching and caching
•	Shared UI components (tables, forms, modals, buttons)
•	Toast notification system for user feedback
•	Loading states and skeleton components
•	Error boundary components for graceful error handling
Part 2 will cover Accounts Receivable pages (Customers, Invoices, Payments, Quotes), and Part 3 will cover Accounts Payable pages (Vendors, Bills, Bill Payments, Purchase Orders).


PAGE 101 DEVELOPMENT GUIDE
PART 2: ACCOUNTS RECEIVABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Customers • Invoices • Payments • Quotes • AR Aging
HaypBooks Accounting Platform
Version 1.0 • March 2026
 
 
Table of Contents

Introduction & Module Overview	3
Page 1: Customers	5
1.1 Page Overview	5
1.2 Page Goals & Objectives	5
1.3 UI Layout Design	6
1.4 Create/Edit Customer Modal	7
1.5 Customer Detail Page	10
1.6 API Endpoints	11
Page 2: Invoices	12
2.1 Page Overview	12
2.2 Invoice Status Flow	12
2.3 Invoices List UI	13
2.4 Create Invoice Page	15
2.5 Invoice Actions & Buttons	17
2.6 API Endpoints	18
Page 3: Customer Payments	19
3.1 Page Overview	19
3.2 Payments List UI	19
3.3 Record Payment Modal	21
3.4 API Endpoints	23
Page 4: Quotes & Estimates	24
4.1 Page Overview	24
4.2 Quote Status Flow	24
4.3 Quote Form Differences from Invoice	25
4.4 API Endpoints	26
Page 5: AR Aging Report	27
5.1 Page Overview	27
5.2 Aging Buckets	27
5.3 Report UI Design	28
5.4 API Endpoints	29
Part 2 Summary	30

Note: Right-click the Table of Contents and select "Update Field" to refresh page numbers.
 
Introduction & Module Overview
This document provides comprehensive end-to-end specifications for the Accounts Receivable (AR) module pages. The AR module handles the complete Order-to-Cash cycle: managing customers, creating quotes, generating invoices, recording payments, and tracking outstanding receivables.
Module Dependencies
Before implementing AR pages, ensure these Core Accounting components are in place:
Dependency	Required For	Integration Point
Chart of Accounts	Invoice line items, Revenue accounts	AR Control Account, Revenue Accounts
Journal Entries	Posting invoices/payments	Auto-generated JEs on post
Tax Codes	Invoice tax calculations	VAT/Withholding on invoices
Payment Terms	Due date calculations	Net 30, Net 15, etc.
Table 0.1: AR Module Dependencies
AR Workflow Overview
The Order-to-Cash workflow follows this sequence:
1.	Create/Manage Customers - Set up customer profiles with billing details and payment terms
2.	Create Quote (Optional) - Generate estimates for customer approval
3.	Convert Quote to Invoice or Create Invoice Directly
4.	Send Invoice to Customer (email/download)
5.	Receive Payment - Record customer payments against invoices
6.	Monitor AR Aging - Track outstanding receivables by age bucket
 
Page 1: Customers
1.1 Page Overview
Property	Description
Route Path	/sales/customers/customers
Page Title	Customers
Purpose	Manage customer profiles including contact information, billing addresses, payment terms, credit limits, and transaction history. Customers are the foundation of all AR operations.
User Roles	Admin, Accountant, Bookkeeper, Sales Rep (limited)
Key Metrics	Total Customers, Active Customers, Total Outstanding Balance, Average Days to Pay
Table 1.1: Customers Page Overview
1.2 Page Goals & Objectives
•	Display all customers in a searchable, filterable table with key metrics
•	Enable creation of new customers with comprehensive contact details
•	Allow editing of customer information including payment terms and credit limits
•	Show customer balance and transaction summary at a glance
•	Provide quick access to customer's invoices, payments, and statements
•	Support customer grouping/categorization for reporting
•	Enable customer portal access management
1.3 UI Layout Design
1.3.1 Page Header Section
Component	Details	Styling
Page Title	"Customers" with company context	text-2xl font-bold, text-slate-900
New Customer Button	Primary CTA - Opens create modal	bg-blue-600 hover:bg-blue-700, white text
Import Button	Import customers from CSV	bg-white border-slate-300
Export Button	Export customer list to CSV/Excel	bg-white border-slate-300
Search Input	Search by name, email, phone, tax ID	w-72, with icon
Filter Dropdown	Filter by status, group, balance range	w-48 dropdown
View Toggle	Table view / Card view toggle	Icon buttons group
Table 1.2: Header Components
1.3.2 Summary Cards Section
Card	Metric	Calculation	Icon
Total Customers	Count of all customers	COUNT(customers)	Users icon
Active Customers	Count with outstanding balance	COUNT WHERE balance > 0	UserCheck icon
Total Receivables	Sum of all customer balances	SUM(balance)	DollarSign icon
Overdue Amount	Sum of overdue balances	SUM(balance WHERE overdue)	AlertTriangle icon
Table 1.3: Summary Cards
1.3.3 Customers Table
Column	Width	Content	Align	Sortable	Notes
Name	Flexible	Customer display name	Left	Yes	Clickable to details
Email	180px	Primary email address	Left	No	Clickable mailto link
Phone	120px	Primary phone number	Left	No	Clickable tel link
Balance	120px	Current outstanding balance	Right	Yes	Red if > 0
Status	80px	Active/Inactive badge	Center	Yes	Green/Gray badge
Payment Terms	100px	Assigned payment terms	Center	No	e.g., Net 30
Actions	100px	Dropdown menu	Center	No	View, Edit, More
Table 1.4: Customers Table Columns
1.4 Create/Edit Customer Modal
The customer form is organized into tabs for better UX:
1.4.1 Tab 1: Basic Information
Field	Type	Required	Validation
Display Name	Text Input	Yes	1-100 chars, unique
Company Name	Text Input	No	1-200 chars, for businesses
Customer Type	Select	Yes	Individual or Business
Customer Group	Select	No	From customer groups list
Tax ID / TIN	Text Input	No	Format based on country
VAT Registered	Checkbox	No	Enables VAT on invoices
VAT Number	Text Input	Conditional	Required if VAT registered
Table 1.5: Basic Information Fields
1.4.2 Tab 2: Contact Information
Field	Type	Required	Notes
Primary Email	Email Input	Yes	For invoice delivery
Secondary Email	Email Input	No	CC on invoices
Primary Phone	Tel Input	No	With country code
Mobile Phone	Tel Input	No	For SMS notifications
Website	URL Input	No	Customer's website
Contact Person	Text Input	No	Primary contact name
Notes	Textarea	No	Internal notes, max 500 chars
Table 1.6: Contact Information Fields
1.4.3 Tab 3: Billing Address
Field	Type	Required	Notes
Address Line 1	Text Input	Yes	Street address
Address Line 2	Text Input	No	Apt, Suite, etc.
City	Text Input	Yes	City/Municipality
State/Province	Select/Text	Yes	Dropdown or free text
Postal Code	Text Input	No	ZIP/Postal code
Country	Select	Yes	Default to company country
Table 1.7: Billing Address Fields
1.4.4 Tab 4: Payment & Credit
Field	Type	Required	Notes
Payment Terms	Select	No	Default: company default terms
Credit Limit	Number Input	No	0 = no limit, warns on exceeding
Default Discount	Percent Input	No	Auto-applied to invoices
AR Account	Select	No	Override default AR account
Revenue Account	Select	No	Override default revenue account
Withholding Tax	Percent Input	No	EWT rate if applicable
Table 1.8: Payment & Credit Fields
1.5 Customer Detail Page
Clicking on a customer row opens the customer detail page showing:
Section	Content
Header	Customer name, balance, quick actions (New Invoice, Record Payment, Send Statement)
Summary Cards	Total Invoiced, Total Paid, Outstanding Balance, Overdue Amount, Avg Days to Pay
Contact Card	Address, phone, email, contact person, edit contact button
Transaction Tabs	Tabs: Invoices, Payments, Quotes, Credit Notes - each with mini table
Activity Timeline	Recent activity: invoices sent, payments received, emails sent
Quick Actions	New Invoice, Record Payment, Send Statement, Edit Customer, View Ledger
Table 1.9: Customer Detail Page Sections
1.6 API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/ar/customers	List all customers
POST	/api/companies/:companyId/ar/customers	Create new customer
GET	/api/companies/:companyId/ar/customers/:contactId	Get single customer
PUT	/api/companies/:companyId/ar/customers/:contactId	Update customer
DELETE	/api/companies/:companyId/ar/customers/:contactId	Deactivate customer
GET	/api/companies/:companyId/ar/customers/:contactId/statement	Get customer statement
GET	/api/companies/:companyId/ar/customers/:contactId/transactions	Get customer transactions
Table 1.10: Customers API Endpoints
 
Page 2: Invoices
2.1 Page Overview
Property	Description
Route Path	/sales/billing/invoices
Page Title	Invoices
Purpose	Create, manage, and track sales invoices. Invoices are the primary billing documents that record revenue and create accounts receivable.
User Roles	Admin, Accountant, Bookkeeper, Sales Rep (create/view)
Key Metrics	Total Invoices, Draft/Overdue/Paid Counts, Total Outstanding, Total Overdue
Table 2.1: Invoices Page Overview

> **🔗 Cross-References:** Posting an invoice auto-creates a GL Journal Entry → `/accounting/core-accounting/journal-entries`. Output VAT tracked at → `/taxes/sales-output-tax/vat-sales-tax`. Customer open balances appear in AR Aging → `/sales/collections/ar-aging`. Incoming payments matched at Bank Transactions → `/banking-cash/transactions/bank-transactions`.

2.2 Invoice Status Flow
Invoices follow a defined status lifecycle:
Status	Badge Color	Description	Allowed Actions
DRAFT	Gray	Not yet sent, fully editable	Edit, Delete, Send, Void
SENT	Blue	Sent to customer, awaiting payment	View, Record Payment, Send Reminder, Void
PARTIAL	Yellow	Partially paid	View, Record Payment, Send Reminder
PAID	Green	Fully paid	View, Print
OVERDUE	Red	Past due date, unpaid balance	View, Record Payment, Send Reminder
VOID	Dark Gray	Cancelled, no financial impact	View only
Table 2.2: Invoice Status Flow
2.3 Invoices List UI
2.3.1 Header Section
Component	Details	Behavior
New Invoice Button	Primary CTA - Opens create page	Full-page form for invoice creation
Status Tabs	All, Draft, Sent, Overdue, Paid, Void	Filter table by status
Date Range	Filter by invoice date	Presets: This Month, Last 30 Days, Custom
Customer Filter	Searchable customer dropdown	Show invoices for specific customer
Search	Search by invoice #, customer name	Real-time filtering
Export	Export to CSV, PDF, Print	Download filtered results
Table 2.3: Invoices Header Components
2.3.2 Invoices Table
Column	Width	Content	Align	Sort	Notes
Invoice #	110px	Invoice number	Left	Yes	Click to view
Date	90px	Invoice date	Center	Yes	YYYY-MM-DD
Customer	Flexible	Customer name	Left	Yes	Click to customer
Due Date	90px	Payment due date	Center	Yes	Red if overdue
Total	110px	Invoice total amount	Right	Yes	Currency format
Balance	110px	Outstanding balance	Right	Yes	0 if paid
Status	90px	Status badge	Center	Yes	Color-coded
Actions	100px	Dropdown menu	Center	No	Context-aware
Table 2.4: Invoices Table Columns
2.4 Create Invoice Page
Full-page form for creating/editing invoices with multiple sections:
2.4.1 Invoice Header Section
Field	Type	Required	Behavior
Customer	Searchable Select	Yes	Search by name, shows balance info
Invoice Number	Text Input	Yes	Auto-generated: INV-YYYY-NNNN
Invoice Date	Date Picker	Yes	Defaults to today
Due Date	Date Picker	Yes	Auto-calculated from payment terms
Payment Terms	Select	No	Defaults to customer's terms
Reference/PO #	Text Input	No	Customer's purchase order number
Currency	Select	No	Defaults to company currency
Table 2.5: Invoice Header Fields
2.4.2 Line Items Section
Column	Type	Required	Behavior
Product/Service	Searchable Select	Yes	Search items, auto-fills description and rate
Description	Text Input	Yes	Line item description
Quantity	Number Input	Yes	Default: 1, decimal allowed
Unit Price	Currency Input	Yes	Per unit price
Discount	Percent/Input	No	Per line discount % or amount
Tax	Select	No	Tax code for this line
Amount	Calculated	-	Qty × Price - Discount + Tax
Account	Select	No	Override revenue account per line
Table 2.6: Invoice Line Items Columns
2.4.3 Invoice Footer Summary
Element	Calculation	Display
Subtotal	Sum of line amounts before tax	Right-aligned currency
Total Discount	Sum of all line discounts	Shown if > 0, negative
Tax Summary	Grouped by tax code	Expandable breakdown
Total Tax	Sum of all taxes	Right-aligned currency
Grand Total	Subtotal - Discount + Tax	Large bold currency
Table 2.7: Invoice Footer Summary
2.5 Invoice Actions & Buttons
Button	Action	Enabled When	API Call
Save Draft	Saves as DRAFT	Valid customer selected	POST /ar/invoices
Save & Send	Saves and emails to customer	Valid invoice, customer has email	POST + POST /:id/send
Preview	Opens PDF preview	Always	None (local)
Add Line	Adds new line item row	Always (max 100)	None (local)
Send	Emails saved invoice	Invoice saved, not sent	POST /:id/send
Record Payment	Opens payment modal	Invoice has balance > 0	None (modal)
Void	Cancels invoice	Invoice not void/paid	POST /:id/void
Print/Download	Downloads PDF	Always	GET /:id/pdf
Duplicate	Creates copy as new draft	Always	New invoice with same data
Table 2.8: Invoice Buttons
2.6 API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/ar/invoices	List all invoices
POST	/api/companies/:companyId/ar/invoices	Create new invoice
GET	/api/companies/:companyId/ar/invoices/:invoiceId	Get single invoice
PUT	/api/companies/:companyId/ar/invoices/:invoiceId	Update draft invoice
POST	/api/companies/:companyId/ar/invoices/:invoiceId/send	Email invoice to customer
POST	/api/companies/:companyId/ar/invoices/:invoiceId/void	Void invoice
GET	/api/companies/:companyId/ar/invoices/:invoiceId/pdf	Download invoice PDF
Table 2.9: Invoices API Endpoints
 
Page 3: Customer Payments
3.1 Page Overview
Property	Description
Route Path	/sales/collections/customer-payments
Page Title	Customer Payments
Purpose	Record and manage customer payments. Payments are applied to invoices to reduce accounts receivable.
User Roles	Admin, Accountant, Bookkeeper
Key Metrics	Total Payments (Today/This Month), Average Payment Amount, Unapplied Payments
Table 3.1: Customer Payments Page Overview
3.2 Payments List UI
3.2.1 Header Section
Component	Details	Behavior
Record Payment Button	Primary CTA - Opens payment modal	Modal for recording new payment
Date Range	Filter by payment date	Presets available
Payment Method Filter	Filter by method: Cash, Check, Bank, etc.	Multi-select dropdown
Search	Search by payment #, customer, reference	Real-time filtering
Export	Export to CSV/Excel	Download filtered list
Table 3.2: Payments Header Components
3.2.2 Payments Table
Column	Width	Content	Align	Sort	Notes
Payment #	110px	Payment reference number	Left	Yes	Click to view
Date	90px	Payment date	Center	Yes	YYYY-MM-DD
Customer	Flexible	Customer name	Left	Yes	Click to customer
Method	100px	Payment method	Center	No	Cash/Check/Bank/Card
Reference	120px	Check #, Transaction ID	Left	No	If applicable
Amount	120px	Total payment amount	Right	Yes	Currency format
Applied	120px	Amount applied to invoices	Right	No	May be less than total
Actions	100px	Dropdown menu	Center	No	View, Edit, Void
Table 3.3: Payments Table Columns
3.3 Record Payment Modal
The payment recording modal includes:
Field	Type	Required	Behavior
Customer	Searchable Select	Yes	Select customer to pay
Payment Date	Date Picker	Yes	Defaults to today
Payment Method	Select	Yes	Cash, Check, Bank Transfer, Credit Card
Deposit To	Select	Yes	Bank account or Undeposited Funds
Reference #	Text Input	Conditional	Check number, transaction ID
Amount Received	Currency Input	Yes	Total payment amount
Invoice Application	Table	Yes	Select invoices to apply payment
Table 3.4: Payment Form Fields
3.3.1 Invoice Application Table
After selecting a customer, show their outstanding invoices for payment application:
Column	Content	Input	Behavior
Select	Checkbox	Checkbox	Check to apply payment
Invoice #	Invoice number	-	Click to view invoice
Date	Invoice date	-	YYYY-MM-DD
Due Date	Payment due date	-	Red if overdue
Total	Invoice total	-	Currency format
Amount Due	Outstanding balance	-	Currency format
Payment	Amount to apply	Number Input	Auto-fills with due amount
Table 3.5: Invoice Application Table
3.4 API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/ar/payments	List all payments
POST	/api/companies/:companyId/ar/payments	Record new payment
GET	/api/companies/:companyId/ar/payments/:paymentId	Get payment details
POST	/api/companies/:companyId/ar/payments/:paymentId/void	Void payment
Table 3.6: Payments API Endpoints
 
Page 4: Quotes & Estimates
4.1 Page Overview
Property	Description
Route Path	/sales/sales-operations/quotes-estimates
Page Title	Quotes & Estimates
Purpose	Create and manage sales quotes/estimates for customers. Quotes can be converted to invoices when accepted.
User Roles	Admin, Accountant, Bookkeeper, Sales Rep
Key Metrics	Total Quotes, Pending Value, Accepted Rate, Average Quote Value
Table 4.1: Quotes Page Overview
4.2 Quote Status Flow
Status	Badge Color	Description	Allowed Actions
DRAFT	Gray	Being prepared, not sent	Edit, Delete, Send, Void
SENT	Blue	Sent to customer, awaiting response	View, Mark Accepted/Rejected, Convert
ACCEPTED	Green	Customer approved	Convert to Invoice
REJECTED	Red	Customer declined	View, Duplicate
EXPIRED	Orange	Past validity date	View, Duplicate
CONVERTED	Purple	Converted to invoice	View linked invoice
Table 4.2: Quote Status Flow
4.3 Quote Form Differences from Invoice
The quote form is nearly identical to the invoice form, with these key differences:
Aspect	Quote	Invoice
Financial Impact	No GL entries created	Creates AR and Revenue entries
Due Date	Validity/Expiry date	Payment due date
Payment Terms	Optional message	Required for payment
Status After Send	SENT (awaiting approval)	SENT (awaiting payment)
Primary Action	Convert to Invoice	Record Payment
Customer Balance	Not affected	Increases AR balance
Table 4.3: Quote vs Invoice Differences
4.4 API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/ar/quotes	List all quotes
POST	/api/companies/:companyId/ar/quotes	Create new quote
GET	/api/companies/:companyId/ar/quotes/:quoteId	Get quote details
PUT	/api/companies/:companyId/ar/quotes/:quoteId	Update draft quote
PATCH	/api/companies/:companyId/ar/quotes/:quoteId/status	Update quote status
POST	/api/companies/:companyId/ar/quotes/:quoteId/convert	Convert quote to invoice
Table 4.4: Quotes API Endpoints
 
Page 5: AR Aging Report
5.1 Page Overview
Property	Description
Route Path	/sales/collections/ar-aging
Page Title	AR Aging Report
Purpose	Display accounts receivable aging report showing outstanding balances grouped by how long they've been overdue. Critical for collections management.
User Roles	Admin, Accountant, Bookkeeper, Collections
Key Metrics	Total AR, Current, 1-30 Days, 31-60 Days, 61-90 Days, Over 90 Days
Table 5.1: AR Aging Page Overview
5.2 Aging Buckets
Bucket	Days Overdue	Color Code
Current	0 days (not yet due)	Green - No action needed
1-30 Days	1-30 days past due	Yellow - First reminder
31-60 Days	31-60 days past due	Orange - Second reminder
61-90 Days	61-90 days past due	Red - Final notice
Over 90 Days	91+ days past due	Dark Red - Collection action
Table 5.2: Aging Buckets
5.3 Report UI Design
5.3.1 Summary Header
Horizontal stacked bar showing aging distribution with totals for each bucket:
Component	Display	Behavior
As Of Date	Date picker for point-in-time	Defaults to today
Summary Bar	Horizontal stacked bar chart	Shows proportion of each bucket
Total AR	Sum of all buckets	Large prominent number
Overdue %	Percentage of total that is overdue	Alert if > 20%
Export	PDF, Excel options	Full report download
Table 5.3: Summary Header Components
5.3.2 Aging Detail Table
Column	Width	Content	Align	Bucket	Bucket	Bucket	Notes
Customer	Flexible	Name	Left	-	-	-	Grouped rows
Invoice #	100px	Number	Left	-	-	-	Click to invoice
Current	100px	Amount	Right	0-0 days	-	-	Green if value
1-30	100px	Amount	Right	1-30 days	-	-	Yellow if value
31-60	100px	Amount	Right	31-60	-	-	Orange if value
61-90	100px	Amount	Right	61-90	-	-	Red if value
Over 90	100px	Amount	Right	91+	-	-	Dark red
Total	100px	Sum	Right	-	-	-	Bold row total
Table 5.4: Aging Detail Table Columns
5.4 API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/ar/reports/aging	Get AR aging report data
Table 5.5: AR Aging API
 
Part 2 Summary
This Part 2 document covers the complete Accounts Receivable module. These pages form the Order-to-Cash cycle that handles customer billing and payment collection. Key implementation notes:
Page	Implementation Priority	Key Dependencies
Customers	HIGH - Foundation for AR	None (standalone)
Invoices	HIGH - Core billing document	Customers, Chart of Accounts, Tax Codes
Payments	HIGH - Cash application	Customers, Invoices, Bank Accounts
Quotes	MEDIUM - Pre-sales workflow	Customers, Items/Services
AR Aging	MEDIUM - Collections tool	Invoices, Payments
Table 6.1: AR Module Implementation Priority
Part 3 will cover Accounts Payable pages (Vendors, Bills, Bill Payments, Purchase Orders, AP Aging). Part 4 will cover Banking & Cash Management. Part 5 will cover Dashboard & Home pages.



PAGE 101 DEVELOPMENT GUIDE
PART 3: ACCOUNTS PAYABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vendors • Bills • Bill Payments • Purchase Orders • AP Aging
HaypBooks Accounting Platform
Version 1.0 • March 2026
 
 
Table of Contents

Introduction & Module Overview	3
Page 1: Vendors	4
1.1 Page Overview	4
1.2 UI Layout Design	4
1.3 Create/Edit Vendor Modal	5
1.4 API Endpoints	7
Page 2: Bills	8
2.1 Page Overview	8
2.2 Bill Status Flow	8
2.3 Bills List Table	9
2.4 Create Bill Page	10
2.5 API Endpoints	11
Page 3: Bill Payments	12
3.1 Page Overview	12
3.2 Record Payment Modal	12
3.3 API Endpoints	13
Page 4: Purchase Orders	14
4.1 Page Overview	14
4.2 PO Status Flow	14
4.3 API Endpoints	15
Page 5: AP Aging Report	16
5.1 Page Overview	16
5.2 Aging Buckets	16
5.3 API Endpoint	17
Part 3 Summary	18

Note: Right-click the Table of Contents and select "Update Field" to refresh.
 
Introduction & Module Overview
This document provides comprehensive specifications for the Accounts Payable (AP) module. The AP module handles the complete Procure-to-Pay cycle: managing vendors, processing bills, recording payments, and tracking payables. This module mirrors the AR module but focuses on money going out rather than money coming in.
AP Workflow Overview
The Procure-to-Pay workflow follows this sequence:
1.	Create/Manage Vendors - Set up vendor profiles with payment details
2.	Create Purchase Order (Optional) - Generate PO for vendor approval
3.	Receive Bill from Vendor - Create bill manually or convert from PO
4.	Approve Bill - Review and approve for payment
5.	Record Bill Payment - Pay vendor and apply to bills
6.	Monitor AP Aging - Track outstanding payables by age
Page 1: Vendors
1.1 Page Overview
Property	Description
Route Path	/expenses/vendors/vendors
Page Title	Vendors
Purpose	Manage vendor profiles including contact info, payment terms, tax settings (EWT), and 1099 status. Vendors are the foundation of all AP operations.
User Roles	Admin, Accountant, Bookkeeper, Purchasing
Key Metrics	Total Vendors, Active Vendors, Total Payables, Overdue Amount
Table 1.1: Vendors Page Overview
1.2 UI Layout Design
1.2.1 Header Section
Component	Details	Styling
Page Title	"Vendors" with company context	text-2xl font-bold
New Vendor Button	Primary CTA - Opens create modal	bg-amber-600 hover:bg-amber-700
Import/Export	Import from CSV, Export to Excel	bg-white border-slate-300
Search	Search by name, email, TIN	w-72, with icon
Filter	Filter by status, type (1099, foreign)	w-48 dropdown
Table 1.2: Vendors Header Components
1.2.2 Vendors Table
Column	Width	Content	Align	Sort	Notes
Name	Flexible	Vendor display name	Left	Yes	Click to details
Email	180px	Primary email	Left	No	mailto link
Phone	120px	Primary phone	Left	No	tel link
Balance	120px	Outstanding balance	Right	Yes	Red if > 0
Payment Terms	100px	Assigned terms	Center	No	e.g., Net 30
1099	60px	1099 eligible badge	Center	No	If applicable
Actions	100px	Dropdown menu	Center	No	View, Edit, Pay
Table 1.3: Vendors Table Columns
1.3 Create/Edit Vendor Modal
1.3.1 Tab 1: Basic Information
Field	Type	Required	Validation
Display Name	Text Input	Yes	1-100 chars, unique
Company Name	Text Input	No	For businesses
Vendor Type	Select	Yes	Individual/Business/Government
Tax ID / TIN	Text Input	Conditional	Required for 1099 vendors
Is 1099 Vendor	Checkbox	No	Enables 1099 tracking
Is Non-Resident	Checkbox	No	For withholding tax
Default Withholding %	Number Input	No	EWT rate (1%, 2%, 5%, 10%)
Table 1.4: Vendor Basic Information Fields
1.3.2 Tab 2: Payment & Accounting
Field	Type	Required	Notes
Payment Terms	Select	No	Default: company terms
AP Account	Select	No	Override default AP account
Expense Account	Select	No	Default expense account
Bank Name	Text Input	No	Vendor's bank for payments
Bank Account #	Text Input	No	For bank transfers
Currency	Select	No	Default transaction currency
Table 1.5: Payment & Accounting Fields
1.4 API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/ap/vendors	List all vendors
POST	/api/companies/:companyId/ap/vendors	Create vendor
GET	/api/companies/:companyId/ap/vendors/:contactId	Get vendor details
PUT	/api/companies/:companyId/ap/vendors/:contactId	Update vendor
DELETE	/api/companies/:companyId/ap/vendors/:contactId	Deactivate vendor
Table 1.6: Vendors API Endpoints
 
Page 2: Bills
2.1 Page Overview
Property	Description
Route Path	/expenses/payables/bills
Page Title	Bills
Purpose	Manage vendor bills - the primary expense documents that record costs and create accounts payable.
User Roles	Admin, Accountant, Bookkeeper, Purchasing
Key Metrics	Total Bills, Draft/Approved/Paid Counts, Total Outstanding, Overdue Amount
Table 2.1: Bills Page Overview

> **🔗 Cross-References:** Approving a bill auto-creates a GL Journal Entry → `/accounting/core-accounting/journal-entries`. Input VAT tracked at → `/taxes/purchase-input-tax/input-vat`. EWT (Expanded Withholding Tax) → `/taxes/purchase-input-tax/expanded-withholding` (source for BIR Form 2307). Payments drawn from bank → `/banking-cash/cash-accounts/bank-accounts`.

2.2 Bill Status Flow
Status	Color	Description	Actions
DRAFT	Gray	Created, not approved	Edit, Delete, Approve, Void
APPROVED	Blue	Approved for payment	View, Record Payment, Void
PARTIAL	Yellow	Partially paid	View, Record Payment
PAID	Green	Fully paid	View, Print
OVERDUE	Red	Past due date, unpaid	View, Record Payment
CANCELLED	Dark Gray	Voided/cancelled	View only
Table 2.2: Bill Status Flow
2.3 Bills List Table
Column	Width	Content	Align	Sort	Notes
Bill #	110px	Bill number	Left	Yes	Click to view
Date	90px	Bill date	Center	Yes	YYYY-MM-DD
Vendor	Flexible	Vendor name	Left	Yes	Click to vendor
Due Date	90px	Payment due	Center	Yes	Red if overdue
Total	110px	Bill total	Right	Yes	Currency
Balance	110px	Outstanding	Right	Yes	0 if paid
Status	90px	Status badge	Center	Yes	Color-coded
Actions	100px	Dropdown	Center	No	Context-aware
Table 2.3: Bills Table Columns
2.4 Create Bill Page
2.4.1 Bill Header Fields
Field	Type	Required	Behavior
Vendor	Searchable Select	Yes	Search by name, shows balance
Bill Number	Text Input	Yes	Auto-generated or vendor invoice #
Bill Date	Date Picker	Yes	Defaults to today
Due Date	Date Picker	Yes	Auto from payment terms
Payment Terms	Select	No	Defaults to vendor's terms
Reference/PO #	Text Input	No	Your PO number if applicable
Currency	Select	No	Default to company currency
Table 2.4: Bill Header Fields
2.4.2 Line Items Section
Column	Type	Required	Behavior
Product/Service	Searchable Select	Yes	Search items, auto-fill details
Description	Text Input	Yes	Line description
Account	Select	Yes	Expense/Asset account
Quantity	Number Input	Yes	Default: 1
Unit Price	Currency Input	Yes	Per unit cost
Tax	Select	No	Input VAT if applicable
Amount	Calculated	-	Qty × Price + Tax
Table 2.5: Bill Line Items
2.5 API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/ap/bills	List all bills
POST	/api/companies/:companyId/ap/bills	Create bill
GET	/api/companies/:companyId/ap/bills/:billId	Get bill details
PUT	/api/companies/:companyId/ap/bills/:billId	Update draft bill
POST	/api/companies/:companyId/ap/bills/:billId/approve	Approve bill
POST	/api/companies/:companyId/ap/bills/:billId/void	Void bill
Table 2.6: Bills API Endpoints
 
Page 3: Bill Payments
3.1 Page Overview
Property	Description
Route Path	/expenses/payables/bill-payments
Page Title	Bill Payments
Purpose	Record and manage payments to vendors. Payments are applied to bills to reduce accounts payable.
User Roles	Admin, Accountant, Bookkeeper
Key Metrics	Total Payments, Payments Today/This Month, Average Payment
Table 3.1: Bill Payments Page Overview
3.2 Record Payment Modal
Field	Type	Required	Behavior
Vendor	Searchable Select	Yes	Select vendor to pay
Payment Date	Date Picker	Yes	Defaults to today
Payment Method	Select	Yes	Cash, Check, Bank Transfer, Credit Card
Pay From	Select	Yes	Bank account to pay from
Check # / Reference	Text Input	Conditional	For check/bank transfer
Amount	Currency Input	Yes	Total payment amount
Apply to Bills	Table	Yes	Select bills to apply payment
Table 3.2: Payment Form Fields
3.3 API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/ap/bill-payments	List all payments
POST	/api/companies/:companyId/ap/bill-payments	Record payment
GET	/api/companies/:companyId/ap/bill-payments/:paymentId	Get payment details
POST	/api/companies/:companyId/ap/bill-payments/:paymentId/void	Void payment
Table 3.3: Bill Payments API Endpoints
 
Page 4: Purchase Orders
4.1 Page Overview
Property	Description
Route Path	/expenses/purchasing/purchase-orders
Page Title	Purchase Orders
Purpose	Create and manage purchase orders for vendor purchases. POs can be converted to bills when goods/services are received.
User Roles	Admin, Accountant, Bookkeeper, Purchasing
Key Metrics	Total POs, Open Value, Average PO Value, Conversion Rate
Table 4.1: Purchase Orders Page Overview
4.2 PO Status Flow
Status	Color	Description	Actions
OPEN	Blue	Created, awaiting receipt	Edit, Close, Convert to Bill
PARTIAL_RECEIVED	Yellow	Partially received	View, Receive More, Convert
RECEIVED	Green	Fully received	View, Convert to Bill
CLOSED	Gray	Manually closed	View only
CANCELLED	Dark Gray	Cancelled	View only
Table 4.2: PO Status Flow
4.3 API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/ap/purchase-orders	List all POs
POST	/api/companies/:companyId/ap/purchase-orders	Create PO
GET	/api/companies/:companyId/ap/purchase-orders/:poId	Get PO details
PATCH	/api/companies/:companyId/ap/purchase-orders/:poId/status	Update PO status
POST	/api/companies/:companyId/ap/purchase-orders/:poId/convert	Convert PO to Bill
Table 4.3: PO API Endpoints
 
Page 5: AP Aging Report
5.1 Page Overview
Property	Description
Route Path	/expenses/payables/ap-aging
Page Title	AP Aging Report
Purpose	Display accounts payable aging report showing outstanding payables grouped by age. Critical for cash flow management.
User Roles	Admin, Accountant, Bookkeeper
Key Metrics	Total AP, Current, 1-30 Days, 31-60 Days, 61-90 Days, Over 90 Days
Table 5.1: AP Aging Page Overview
5.2 Aging Buckets (Same as AR)
Bucket	Days Overdue	Color Code
Current	0 days (not yet due)	Green - No urgency
1-30 Days	1-30 days past due	Yellow - Plan payment
31-60 Days	31-60 days past due	Orange - Priority payment
61-90 Days	61-90 days past due	Red - Urgent payment
Over 90 Days	91+ days past due	Dark Red - Critical
Table 5.2: AP Aging Buckets
5.3 API Endpoint
Method	Endpoint	Purpose
GET	/api/companies/:companyId/ap/reports/aging	Get AP aging report
Table 5.3: AP Aging API
 
Part 3 Summary
This Part 3 document covers the complete Accounts Payable module. These pages form the Procure-to-Pay cycle that handles vendor management and payment processing. Implementation notes:
Page	Priority	Dependencies
Vendors	HIGH - Foundation for AP	None (standalone)
Bills	HIGH - Core expense document	Vendors, Chart of Accounts, Tax Codes
Bill Payments	HIGH - Cash outflow	Vendors, Bills, Bank Accounts
Purchase Orders	MEDIUM - Pre-purchase workflow	Vendors, Items/Services
AP Aging	MEDIUM - Cash flow management	Bills, Payments
Table 6.1: AP Module Implementation Priority
Parts 1-3 cover the core transactional modules. Part 4 will cover Banking & Cash Management. Part 5 will cover Dashboard & Home pages with KPI visualizations.

HaypBooks Page101 Documentation
Part 4: Banking & Cash Module
Comprehensive Page Design Specifications
Table of Contents


Note: Right-click the Table of Contents and select 'Update Field' to refresh page numbers.
 
1. Banking & Cash Module Overview
The Banking & Cash module in HaypBooks provides comprehensive cash management capabilities for businesses of all sizes. This module handles all aspects of financial operations related to bank accounts, cash transactions, deposits, reconciliation, and treasury management. The module is designed to integrate seamlessly with the core accounting system, ensuring real-time visibility into cash positions and automated reconciliation processes. Businesses can manage multiple bank accounts across different currencies, track transactions with full audit trails, handle deposits efficiently through undeposited funds workflow, and maintain accurate cash flow projections through this centralized banking hub.
1.1 Module Architecture
The Banking module follows the NestJS modular architecture with a Controller-Service-Repository pattern. The backend exposes RESTful APIs under the base path /api/companies/:companyId/banking, protected by JWT authentication guards. Each endpoint validates user permissions through workspace membership checks before processing requests. The module integrates with the Chart of Accounts for automatic posting of transactions and supports multi-currency operations for international business requirements. The architecture supports both real-time bank feed connections through OAuth integrations and manual transaction entry through file uploads.
1.2 Backend API Endpoints
The following table summarizes the primary API endpoints available in the Banking module:
Endpoint	Method & Path	Purpose
List Bank Accounts	GET /bank-accounts	Retrieve all bank accounts
Create Bank Account	POST /bank-accounts	Add new bank account
Bank Transactions	GET /transactions	List all transactions
Reconciliation	POST /reconcile	Perform bank reconciliation
Bank Deposits	POST /deposits	Create bank deposit
Table 1-1: Banking Module API Endpoints
 
2. Bank Connections
The Bank Connections section manages the integration between HaypBooks and external financial institutions. This critical infrastructure enables automatic transaction imports, real-time balance updates, and secure credential management for connected banks. The system supports connections to major Philippine banks including BDO, BPI, Metrobank, UnionBank, and popular e-wallets like GCash and Maya, providing businesses with a unified view of all their financial accounts across multiple institutions and account types.
2.1 Connected Banks Page
Route: /banking-cash/bank-connections/connected-banks
Page Goal
The Connected Banks page serves as the central hub for managing all bank integrations. Users can view existing connections, establish new bank links through OAuth flows, monitor connection health status in real-time, and troubleshoot synchronization issues as they arise. The page provides a comprehensive dashboard showing which accounts are actively syncing, when the last sync occurred, and any errors that require immediate attention. This visibility ensures businesses maintain accurate and up-to-date financial data across all their banking relationships, reducing manual data entry and improving financial visibility.
Page Design Specifications
The page layout follows a card-based design pattern with a prominent action area at the top for adding new connections. Each connected bank is displayed as an individual card showing the bank logo, account nickname, account type badge (checking/savings), last four digits of the account number, connection status indicator with color coding, and last sync timestamp. The design uses a clean white background with subtle shadows to create depth and visual hierarchy. The card layout ensures easy scanning of multiple connections at a glance. A status badge system uses color coding: green for active connections with successful recent syncs, yellow for connections requiring re-authentication or with warnings, and red for disconnected accounts that need immediate attention.
Button Components
Button	Location	Function
Connect Bank	Top-right action bar	Opens bank selection modal to initiate new connection
Sync Now	Per-bank card	Triggers immediate transaction sync for selected bank
Disconnect	Per-bank card menu	Removes bank connection after confirmation dialog
Edit Settings	Per-bank card menu	Opens sync frequency and account mapping settings
Reconnect	Expired connection card	Initiates OAuth flow to refresh credentials
Table 2-1: Connected Banks Page Buttons
Data Tables Required
•	BankAccount: Stores account details, credentials (encrypted), and sync settings
•	BankFeedConnection: Tracks OAuth tokens and connection metadata
•	BankTransaction: Stores imported transactions from connected banks
•	ExternalSystemConfig: Stores integration configuration per bank
•	SyncJob: Tracks sync operation status and history
Backend API Connections
•	GET /api/companies/:companyId/banking/feed-connections - List all connections
•	POST /api/companies/:companyId/banking/feed-connections - Create new connection
•	DELETE /api/companies/:companyId/banking/feed-connections/:id - Remove connection
•	POST /api/companies/:companyId/banking/feed-connections/:id/sync - Manual sync trigger
•	GET /api/companies/:companyId/banking/feed-connections/:id/status - Check connection health
 
3. Transactions
The Transactions section is the core operational area for managing all cash movements within the system. This section handles both imported bank transactions from connected accounts and manually created app transactions. Users can categorize transactions using customizable rules, apply them to invoices or bills for matching, transfer between accounts seamlessly, and maintain a complete audit trail of all financial movements. The transaction management workflow supports reconciliation by providing clear visibility into matched and unmatched items, helping businesses maintain accurate books.
3.1 Bank Transactions Page
Route: /banking-cash/transactions/bank-transactions
Page Goal
The Bank Transactions page provides a comprehensive view of all transactions imported from connected bank accounts, or manually added. Users can review, filter, categorize, and match transactions to existing accounting records. The page supports full-text search, date range filtering, type (Credit/Debit) toggling, and reconciliation status filtering. A master-detail layout shows a transaction list on the left with a detail panel sliding in on the right when a row is clicked.

Current Implementation Status (March 2026)
Feature	Status	Notes
Account selector + date filters	✅ Done	Bank account dropdown, from/to date pickers
Type filter (Credit/Debit/All)	✅ Done	Dropdown filter
Reconciliation status filter	✅ Done	All/Matched/Unmatched
Full-text search bar	✅ Done	Filters by description in real time
Summary strip (4 cards)	✅ Done	Count, Total In, Total Out, Reconciled
Master-detail layout	✅ Done	Detail panel slides in on row click
CSV Export (all filtered)	✅ Done	Downloads bank-transactions.csv
CSV Export (selected rows)	✅ Done	Bulk select + Export Selected
Add Transaction modal	✅ Done	Date, type CREDIT/DEBIT, description, amount; POST to API
Categorize (with API call)	✅ Done	PATCH .../transactions/:id { category }; quick-select chips
Match button	⚠️ Button present	Opens no modal yet — backlog item
Transfer button	⚠️ Button present	Opens no modal yet — backlog item
Split Transaction	❌ Missing	Critical backlog — allocate 1 txn to multiple GL accounts
Transaction Status badges	⚠️ Basic	Shows Matched/Pending; full PENDING/CATEGORIZED/MATCHED/SPLIT/EXCLUDED backlog
Bank Rules auto-categorization	❌ Missing	High priority backlog
Pagination	❌ Missing	Currently limit=200; needs page controls

Page Design Specifications
The page employs a sticky header with filter controls (account selector, date range, type filter, match-status filter, search bar). Below the header is a 4-card summary strip. The main area is a master-detail split layout: the transaction list occupies full width when nothing is selected, then shrinks to 55% when the detail panel is open. The detail panel is 45% and slides in from the right.
The transaction table columns: checkbox, date (monospace), description (with category chip if set), amount (green for positive, red for negative), status badge, chevron.
The detail panel shows: large amount with +/- color, date, status badge, description, category chip if set, memo if set; then 3 action buttons (Categorize, Match, Transfer); then quick-categorize with text input + 6 preset chips.

Button Components
Button	Location	Function
Add Transaction	Top action bar	Opens AddTransactionModal: date, type, description, amount → POST API
Export	Top action bar	Downloads filtered rows as CSV
Refresh (icon)	Top action bar	Refetches transactions from API
Export Selected	Bulk toolbar (when rows selected)	Downloads only selected rows as CSV
Add Transaction	Toolbar (right side)	Opens Add Transaction modal (manual entry)
Export	Toolbar (right side)	Downloads CSV for visible rows
Refresh	Toolbar (right side)	Reloads transaction list
Search	Filter bar	Filters description text live
Categorize	Detail panel action grid	Focuses quick-categorize input in detail panel
Split	Detail panel action grid	Opens split-transaction modal
Match	Detail panel action grid	Opens invoice/bill search modal
Transfer	Detail panel action grid	Opens transfer-between-accounts modal
Apply	Detail panel quick-categorize	Calls PATCH API to apply category and updates local state
Table 3-1: Bank Transactions Page Buttons

API Endpoints
Method	Endpoint	Purpose
GET	/companies/:id/banking/accounts	List bank accounts for dropdown
GET	/companies/:id/banking/accounts/:accId/transactions?limit=200&from=&to=	Load transactions with filters
POST	/companies/:id/banking/accounts/:accId/transactions	Manually add transaction
PATCH	/companies/:id/banking/accounts/:accId/transactions/:txnId	Update category/memo/status
POST	/companies/:id/banking/accounts/:accId/transactions/:txnId/split	Persist split line items (must sum to original amount)
POST	/companies/:id/banking/transfers	Create inter-account transfer (creates two offsetting transactions)
Table 3-2: Bank Transactions API Endpoints

> **🔗 Cross-References:** Match transactions to AR Invoices → `/sales/billing/invoices` or AP Bills → `/expenses/payables/bills`. Apply Transaction Tags → `/settings/customization/transaction-tags`. Categorized/split entries feed the General Ledger → `/accounting/core-accounting/general-ledger`. Unmatched items feed Bank Reconciliation → `/banking-cash/reconciliation/reconcile`.

Data Displayed Per Row
• date (YYYY-MM-DD, monospace)
• description (with optional category chip in violet)
• amount (+ prefix for credits in emerald, red for debits)
• status: Matched (emerald chip with CheckCircle2) / Pending (slate chip with Clock)

State Variables
Variable	Type	Purpose
companyId	string	From /api/companies/recent
bankAccounts	BankAccount[]	Dropdown options
selectedBankId	string	Selected bank account
transactions	BankTransaction[]	All loaded transactions
filtered	BankTransaction[]	Derived: after all filters applied
loading	boolean	Fetch in progress
fromDate / toDate	string	Date range filters
typeFilter	'all'|'credit'|'debit'	Credit/debit toggle
page	number	Current page index (zero-based)
hasMore	boolean	Whether more transactions exist beyond current page
reconFilter	'all'|'matched'|'unmatched'	Reconciliation status filter
searchText	string	Text entered in search field
addTxnModal	boolean	Controls Add Transaction modal visibility
splitModal	boolean	Controls Split modal visibility
matchModal	boolean	Controls Match modal visibility
transferModal	boolean	Controls Transfer modal visibility
selectedTxn	BankTransaction | null	Currently open detail panel
selectedIds	Set<string>	Bulk selection for export
category	string	Quick-categorize input value
categorizing	boolean	Applying category in progress
searchText	string	Full-text search on description
selectedTxn	BankTransaction|null	Opens detail panel
selectedIds	Set<string>	Checkbox multi-select for bulk export
category	string	Quick-categorize current input
categorizing	boolean	Loading state for categorize action
addTxnModal	boolean	Add Transaction modal visibility
 
4. Reconciliation
The Reconciliation section provides tools for matching bank statement transactions with internal accounting records. This critical process ensures the accuracy of financial data and identifies discrepancies that require investigation. The module supports both manual and semi-automated reconciliation workflows, with intelligent matching algorithms that suggest potential matches based on amount, date proximity, and reference numbers. Regular reconciliation helps businesses maintain accurate books, detect errors or fraudulent transactions early, and ensure compliance with financial reporting requirements.
4.1 Reconcile Page
Route: /banking-cash/reconciliation/reconcile
Page Goal
The Reconcile page is the primary interface for performing bank reconciliation. Users select a bank account, start a reconciliation session (entering statement date + closing balance), then clear individual bank transactions by matching them to the books. The difference between statement balance and cleared sum decreases as more items are cleared; when it reaches \u20b10.00 the "Finish Now" button enables. Auto Match, Add Adjustment, and Undo are also available.

Current Implementation Status (March 2026)
Feature	Status	Notes
Start Reconciliation modal (date + closing balance)	✅ Done	POST .../reconciliations
Summary Dashboard (3 cards: Statement / Cleared / Diff)	✅ Done	Real-time calc; diff card turns red/green
"Off by \u20b1X" label under Finish Now	✅ Done	Shows exact amount remaining when not balanced
Auto Match algorithm	✅ Done	POST .../reconciliations/:id/auto-match
Manual Clear / Unclear (C/R badges)	✅ Done	POST match, DELETE match
Add Adjustment modal	✅ Done	Description, amount, DEBIT/CREDIT type
Undo Reconciliation	✅ Done	POST .../undo; requires confirm dialog
Finish Now (only enabled when balanced)	✅ Done	POST .../complete
Search on unmatched transactions	✅ Done	Real-time filter
Type filter (ALL/CREDIT/DEBIT)	✅ Done	Toggle button group
Two-panel split (Unmatched | Cleared)	✅ Done	With R/C status markers
Discrepancy Detection (beginning balance check)	✅ Done	Warning displays in Start Recon modal if entered closing balance doesn’t match last completed reconciliation; previous balance shown
Print / Export reconciliation report	❌ Missing	Medium priority backlog
Beginning Balance displayed	❌ Missing	Medium priority backlog
Date range filter on unmatched panel	✅ Done	Two date inputs added beside search field in status row to limit unmatched transactions
Pagination	✅ Done	Transactions list now loads in pages of 50 with Previous/Next controls

Page Design Specifications
The page has a sticky header with bank account selector and action buttons. Below is a toast notification area for success/error messages. When no reconciliation is active, a centered empty state is shown with a "Start Reconciliation" button.
When a reconciliation is active:
1. 3-card summary bar (Statement Balance, Cleared Balance, Difference) — difference card changes from rose to emerald when balanced.
2. Status badge + search input + ALL/CREDIT/DEBIT toggle.
3. Two-panel grid: left = "Unmatched Bank Transactions", right = "Cleared (C)" or "Reconciled (R)".
Each cleared item shows a colored badge square: blue C for in-progress, green R for completed. Items can be uncleared by hovering (shows \u2715 Unclear button).

Button Components
Button	Location	Function
Start Reconciliation	Header (when no active recon)	Opens StartReconModal: statement date + closing balance \u2192 POST
Auto Match	Header (active IN_PROGRESS recon)	POST .../auto-match; shows count matched in toast
Add Adjustment	Header (active IN_PROGRESS recon)	Opens AddAdjustmentModal; creates adjusting entry
Finish Now	Header (IN_PROGRESS)	Enabled only when diff < 0.01; POST .../complete; shows \u201cOff by \u20b1X\u201d below when disabled
Undo Reconciliation	Header (COMPLETED recon)	Requires confirm dialog; POST .../undo; returns to IN_PROGRESS
Clear	Unmatched item (hover)	POST .../match { bankTransactionId }
Unclear	Cleared item (hover)	DELETE .../match/:bankTransactionId
Table 4-1: Reconcile Page Buttons

API Endpoints
Method	Endpoint	Purpose
POST	/companies/:id/banking/accounts/:accId/reconciliations	Start new reconciliation
GET	/companies/:id/banking/reconciliations/:reconId	Load reconciliation with lines
POST	/companies/:id/banking/reconciliations/:reconId/match	Clear a transaction
DELETE	/companies/:id/banking/reconciliations/:reconId/match/:txnId	Unclear a transaction
POST	/companies/:id/banking/reconciliations/:reconId/auto-match	Run auto-match algorithm
POST	/companies/:id/banking/reconciliations/:reconId/complete	Finish reconciliation
POST	/companies/:id/banking/reconciliations/:reconId/undo	Undo completed reconciliation
POST	/companies/:id/banking/reconciliations/:reconId/adjustment	Add adjusting entry
GET	/companies/:id/banking/reconciliations/:reconId/discrepancies	[Backlog] Get discrepancy report
Table 4-2: Reconcile API Endpoints

> **🔗 Cross-References:** Reconciliation adjustment entries auto-post to Journal Entries → `/accounting/core-accounting/journal-entries`. Transactions being reconciled come from Bank Transactions → `/banking-cash/transactions/bank-transactions`. Completed reconciliation history viewable at → `/banking-cash/reconciliation/history`.

State Variables
Variable	Type	Purpose
companyId	string	From /api/companies/recent
bankAccounts	BankAccount[]	Dropdown options
selectedBankId	string	Selected bank account
recon	Reconciliation | null	Active reconciliation session
transactions	BankTxn[]	All transactions for the selected account
lines	ReconLine[]	Derived: recon.BankReconciliationLine
matchedLines	ReconLine[]	Derived: lines.filter(l => l.matched)
closingBalance	number	From recon.closingBalance
matchedSum	number	Sum of matched transaction amounts
diff / absDiff	number	closingBalance - matchedSum
isBalanced	boolean	absDiff < 0.01
search	string	Search text for unmatched panel
typeFilter	'ALL'|'CREDIT'|'DEBIT'	Type filter for unmatched panel
startModal	boolean	StartReconModal visibility
adjustModal	boolean	AddAdjustmentModal visibility
completing / autoMatching / undoing	boolean	Loading states for async actions
message	{text,type}|null	Toast message (auto-clears after 3s)
 
5. Cash Accounts
The Cash Accounts section manages all cash and bank account records within the system. This includes traditional bank accounts (checking, savings), petty cash funds for small expenses, and clearing accounts used for temporary holding of funds. Each account maintains its own register, balance tracking, and transaction history. The section provides tools for account setup with comprehensive configuration options, balance management with reconciliation support, and account-level reporting for financial analysis.
5.1 Bank Accounts Page
Route: /banking-cash/cash-accounts/bank-accounts
Page Goal
The Bank Accounts page provides a comprehensive management interface for all company bank accounts. Users can create new accounts with detailed configuration, view current balances with real-time updates, access transaction registers for each account, and manage account settings including currency and GL mappings. The page displays account details including account number (masked for security), bank name and logo, currency, and current balance with available balance. It serves as the entry point for all bank-related operations and provides quick access to common tasks like transfers and reconciliation.
Page Design Specifications
The page uses a card-grid layout to display accounts, with each card showing the bank logo prominently, account name, account type badge (checking/savings/payable), masked account number, and current balance displayed in large, readable format. Cards are grouped by currency and sorted alphabetically within groups for easy navigation. Quick action buttons appear on hover, providing immediate access to common operations without navigation. The page header includes aggregate totals showing total cash across all accounts, organized by currency with exchange rate conversions for multi-currency businesses.
Button Components
Button	Location	Function
Add Account	Page header	Opens new account creation form
View Register	Account card	Opens transaction register for account
Transfer	Account card	Opens transfer form with pre-filled source
Reconcile	Account card	Navigates to reconciliation for account
Edit	Account card menu	Opens account settings and details editor
Deactivate	Account card menu	Marks account as inactive (requires zero balance)
Table 5-1: Bank Accounts Page Buttons
 
6. Deposits
The Deposits section manages the process of grouping undeposited funds and creating bank deposits. This workflow is essential for businesses that receive multiple payments (checks, cash) that need to be deposited together at the bank. The system tracks undeposited funds separately from bank balances, allows grouping of payments into deposit batches for efficient processing, and generates professional deposit slips for bank visits. Proper deposit management ensures accurate cash tracking and simplifies the reconciliation process when deposits appear on bank statements.
6.1 Undeposited Funds Page
Route: /banking-cash/deposits/undeposited-funds
Page Goal
The Undeposited Funds page displays all payments received that have not yet been deposited to a bank account. This includes checks waiting to be deposited at the bank, cash on hand awaiting deposit, and electronic payments pending batch processing. Users can review individual payments with full details, group them into deposit batches for efficient bank visits, and prepare deposit slips automatically. The page helps businesses track funds in transit and ensures all received payments are properly accounted for before reaching the bank.
Page Design Specifications
The page presents a table view of undeposited payments with sortable columns for date received, customer name, payment method type, reference or check number, and amount. Checkboxes allow selection of multiple items for batch deposit creation. The interface groups items by payment method (check, cash, card) automatically, as different payment types typically require separate deposit processing at most banks. A running total shows the sum of selected items in real-time. The deposit action creates a new deposit record with selected items and generates a printable deposit slip.
Button Components
Button	Location	Function
Create Deposit	Selection toolbar	Creates deposit batch from selected items
Select All	Table header	Selects all items in current filter view
View Payment	Row action	Opens payment detail for selected item
Filter by Method	Filter bar	Filters list by payment method type
Table 6-1: Undeposited Funds Page Buttons
 
7. Bank Feeds
The Bank Feeds section manages the automated import of bank transactions through direct bank connections. This section handles feed connection setup with secure OAuth flows, import rule configuration for automatic categorization, and feed status monitoring for proactive issue resolution. Bank feeds eliminate manual transaction entry by automatically retrieving transactions from connected financial institutions on a scheduled basis. The module supports multiple integration methods including direct API connections, file uploads (OFX, QBO, CSV), and screen scraping for institutions without API support.
7.1 Feed Connections Page
Route: /banking-cash/bank-feeds/feed-connections
Page Goal
The Feed Connections page manages the configuration and status of automated bank feed imports. Users can view active feed connections with real-time status, monitor sync schedules and upcoming sync times, check connection health indicators, and troubleshoot failed imports with detailed error messages. The page serves as the control center for all automated bank data retrieval, ensuring continuous data flow from financial institutions into the accounting system without manual intervention.
Backend API Connections
•	GET /api/companies/:companyId/banking/feed-connections - List connections
•	POST /api/companies/:companyId/banking/feed-connections - Create connection
•	PUT /api/companies/:companyId/banking/feed-connections/:id - Update settings
•	POST /api/companies/:companyId/banking/feed-connections/:id/sync - Trigger sync
•	GET /api/companies/:companyId/banking/feed-status - Overall feed status
 
8. Credit Cards
The Credit Cards section manages corporate credit card accounts and their transactions. This module tracks credit card purchases with detailed categorization, handles statement imports for reconciliation, and manages payment processing with proper authorization workflows. Integration with expense management allows automatic categorization of card transactions based on merchant rules. The section supports multiple card accounts, individual cardholder tracking for accountability, and statement reconciliation workflows for accurate expense reporting.
8.1 Credit Card Accounts Page
Route: /banking-cash/credit-cards/credit-card-accounts
Page Goal
The Credit Card Accounts page provides an overview of all corporate credit card accounts. Users can view current balances against credit limits, available credit with utilization indicators, payment due dates with reminder alerts, and recent activity summaries. The page helps finance teams monitor credit utilization across cards, track spending patterns by cardholder, and ensure timely payments to avoid late fees. Summary cards show aggregate metrics for quick financial health assessment.
Page Design Specifications
The page uses a card-based layout similar to bank accounts but with credit-specific metrics prominently displayed. Each card displays the card issuer logo, card name (with masked number for security), credit limit, current balance, available credit (with utilization progress bar), and payment due date with countdown indicator. Color-coded alerts highlight cards approaching credit limits (yellow at 80%, red at 90%) or with upcoming due dates within 7 days. Quick actions include view transactions, make payment, and import statement for each card.
Button Components
Button	Location	Function
Add Card	Page header	Opens form to add new credit card account
Make Payment	Card actions	Opens payment form to pay card balance
View Transactions	Card actions	Navigates to card transaction register
Import Statement	Card actions	Uploads statement file for import
Table 8-1: Credit Card Accounts Page Buttons
 
9. Checks
The Checks section manages check-based payment workflows including check register maintenance, check printing with customizable layouts, and stop payment processing with authorization. This module is essential for businesses that issue checks as a primary payment method. The system tracks check numbers sequentially, maintains check stock inventory for reordering, and provides printing capabilities with customizable check layouts. Stop payment requests are managed through a formal workflow requiring proper authorization and documentation.
9.1 Check Register Page
Route: /banking-cash/checks/check-register
Page Goal
The Check Register page provides a comprehensive view of all checks issued by the company with complete audit trails. Users can search for specific checks by number or payee, view check status (outstanding, cleared, voided, stopped), and manage check-related operations including voids and stop payments. The register serves as the audit trail for check-based payments and supports reconciliation by tracking clearance status with dates. Historical check data is retained indefinitely for compliance and audit purposes.
Page Design Specifications
The page uses a table layout with extensive filtering capabilities for efficient searching. Columns include check number, issue date, payee name, amount, bank account, current status, and clearance date. Status badges provide visual differentiation between outstanding checks (yellow), cleared checks (green), voided checks (gray), and stopped checks (red). Advanced search allows lookup by check number range, date range, or payee name with partial matching. The interface supports bulk status updates for checks cleared from bank statements during reconciliation.
Button Components
Button	Location	Function
Print Checks	Page header	Navigates to check printing interface
Mark Cleared	Selection context	Updates status to cleared with clearance date
Void Check	Row action menu	Voids check with confirmation and creates reversal
Stop Payment	Row action menu	Initiates stop payment request workflow
View Details	Row action	Opens check detail with payment information
Table 9-1: Check Register Page Buttons
 
10. Cash Management
The Cash Management section provides tools for monitoring and projecting cash positions. This strategic module helps businesses understand their current liquidity status, forecast future cash needs based on AR/AP data, and make informed decisions about cash deployment and investment. Features include real-time cash position dashboards, short-term cash flow forecasts, and enterprise-level cash flow projections with scenario modeling. The module integrates data from AR, AP, and banking to provide a comprehensive view of expected cash movements.
10.1 Cash Position Page
Route: /banking-cash/cash-management/cash-position
Page Goal
The Cash Position page provides a real-time snapshot of the company's current cash situation across all accounts. It aggregates balances across all cash accounts, shows pending transactions not yet cleared, and highlights potential cash constraints requiring attention. Finance teams use this page to monitor daily liquidity, identify surplus cash available for investment, and detect potential shortfalls requiring proactive action such as credit line draws. The page serves as the primary dashboard for treasury operations.
Page Design Specifications
The page uses a dashboard layout with multiple widgets showing different aspects of cash position in a single view. Key metrics displayed prominently include total cash available, cash by account type breakdown, cash by currency with conversion rates, and pending transactions summary. A timeline view shows expected cash movements over the next 7 days, with incoming and outgoing cash clearly separated as stacked bars. Visual indicators highlight accounts with low balances approaching minimum thresholds set in preferences. Drill-down capabilities allow navigation from summary metrics to detailed transaction lists.
Button Components
Button	Location	Function
Refresh	Dashboard header	Updates all metrics with latest data
View Forecast	Timeline widget	Navigates to detailed forecast view
Transfer Funds	Quick actions	Opens transfer form for immediate movement
Export Report	Dashboard header	Generates PDF/Excel cash position report
Table 10-1: Cash Position Page Buttons
 
11. Treasury (Enterprise Feature)
The Treasury section provides advanced cash management capabilities for enterprise customers. This premium module includes intercompany fund transfers between related entities, internal loan management with interest tracking, credit line tracking with availability monitoring, and payment approval workflows with multi-level authorization. Designed for multi-entity organizations, the treasury module enables centralized cash management while maintaining proper accounting controls across all entities. Features support complex organizational structures with automated elimination entries for intercompany transactions.
11.1 Intercompany Transfers Page
Route: /banking-cash/treasury/intercompany-transfers
Page Goal
The Intercompany Transfers page manages fund movements between related entities within the same organization. This includes cash pooling operations between subsidiaries, management fee transfers, and capital contributions or distributions. The system automatically generates corresponding entries in both entities' books and tracks intercompany loan balances over time. Users can initiate, approve, and track transfers while maintaining proper documentation for audit purposes and consolidation requirements.
Data Tables Required
•	IntercompanyTransaction: Records transfers between entities
•	Company: Related entities within the organization
•	BankAccount: Source and destination accounts
•	JournalEntry: Created for accounting in both entities
•	Approval: Workflow tracking for transfer authorization
 
12. Module Summary & Implementation Guide
The Banking & Cash module provides a comprehensive suite of tools for managing all aspects of cash operations in a modern accounting system. From bank connections and transaction management to reconciliation and treasury operations, the module supports businesses of all sizes with scalable features. The integration with core accounting ensures that all cash movements are properly recorded and reconciled, providing accurate financial reporting and complete audit trails.
12.1 Key Integration Points
The Banking module integrates with the following HaypBooks modules for seamless data flow:
•	Core Accounting: Automatic journal entries for all transactions posted to GL
•	Accounts Receivable: Payment matching and deposit management workflow
•	Accounts Payable: Bill payment processing and check management
•	Reporting: Cash flow statements and bank reconciliation reports
•	Multi-Currency: Foreign exchange handling for international accounts
12.2 Implementation Priority
Based on the current codebase analysis, the following implementation order is recommended:
1.	Bank Accounts Management (foundation for all other features)
2.	Transaction Management (core operational workflow)
3.	Reconciliation (critical for accuracy and compliance)
4.	Bank Feed Connections (automation layer for efficiency)
5.	Deposit Management (operational efficiency improvement)
6.	Cash Management Dashboard (decision support for treasury)
7.	Treasury Features (enterprise premium tier)

HaypBooks Page101 Documentation
Part 5: Payroll & Workforce Module
Comprehensive Page Design Specifications
Table of Contents


Note: Right-click the Table of Contents and select 'Update Field' to refresh page numbers.
 
1. Payroll & Workforce Module Overview
The Payroll & Workforce module in HaypBooks provides comprehensive human resources and payroll management capabilities designed for Philippine businesses. This module handles all aspects of employee management from hiring to separation, including payroll processing with automatic tax and contribution calculations, government-mandated contributions (SSS, PhilHealth, Pag-IBIG), leave management, and benefits administration. The module ensures compliance with Philippine labor laws and BIR regulations while streamlining HR operations through automation.
1.1 Module Architecture
The Payroll module follows the NestJS modular architecture with Controller-Service-Repository pattern. The backend exposes RESTful APIs under /api/companies/:companyId/payroll, protected by JWT authentication guards. Each endpoint validates user permissions through workspace membership and role-based access control. The module integrates with the Chart of Accounts for automatic posting of payroll journal entries and supports multi-company payroll processing within a single workspace. The architecture accommodates complex payroll scenarios including multiple pay frequencies, varying employment types, and special payroll runs.
1.2 Backend API Endpoints
Endpoint	Method & Path	Purpose
List Employees	GET /employees	Retrieve all employees
Create Employee	POST /employees	Add new employee record
Payroll Runs	GET /payroll-runs	List payroll processing runs
Run Payroll	POST /payroll-runs	Execute payroll calculation
Leave Requests	GET/POST /leave-requests	Manage employee leave
Table 1-1: Payroll Module API Endpoints
 
2. Workforce Management
The Workforce Management section handles all employee-related operations from hiring to separation. This includes maintaining comprehensive employee records, managing employment contracts, tracking job positions, storing employee documents securely, and handling contractor relationships. The section provides a complete HRIS solution integrated with payroll processing, ensuring employee data flows seamlessly into payroll calculations without duplicate data entry.
2.1 Employees Page
Route: /payroll-workforce/workforce/employees
Page Goal
The Employees page serves as the central hub for managing all employee records within the organization. Users can view employee lists with filtering and search capabilities, access individual employee profiles with complete employment history, manage employment status changes (probation, regular, separated), and initiate payroll-related actions. The page provides quick access to employee documents, contracts, and payroll history. HR administrators use this page as their primary interface for employee data management.
Page Design Specifications
The page uses a table layout with employee photo thumbnails, name, employee ID, department, position, and employment status. Status badges differentiate between active (green), probationary (yellow), and separated (gray) employees. Quick filters above the table allow filtering by department, employment type (regular, contractual, project-based), and status. A detail panel slides in when an employee is selected, showing complete profile information organized into tabs: Personal Info, Employment Details, Compensation, Documents, and Payroll History.
Button Components
Button	Location	Function
Add Employee	Page header	Opens new employee creation wizard
Import	Page header	Opens bulk import dialog for CSV upload
View Profile	Row action	Opens detailed employee profile
Edit	Row action menu	Opens employee editor form
Terminate	Row action menu	Initiates separation workflow
View Payslips	Detail panel	Shows employee's payslip history
Table 2-1: Employees Page Buttons
Data Tables Required
•	Employee: Core employee records with personal and employment details
•	EmploymentContract: Contract terms, start/end dates, salary history
•	Department: Organizational structure for employee assignment
•	JobPosition: Job titles and position definitions
•	EmployeeDocument: Secure document storage for employee files
•	Address/Contact: Employee contact information and emergency contacts
 
3. Time & Leave Management
The Time & Leave section manages employee attendance tracking and leave administration. This includes leave request submissions and approvals, leave balance tracking with carry-over rules, holiday calendar management, overtime rules configuration, and shift scheduling for enterprise plans. The module integrates with payroll to automatically calculate leave deductions and overtime premiums, ensuring accurate compensation based on actual time worked.
3.1 Leave Requests Page
Route: /payroll-workforce/time-leave/leave-requests
Page Goal
The Leave Requests page provides a comprehensive interface for managing employee time-off requests. Employees can submit leave requests through a self-service portal, managers can review and approve/reject requests, and HR administrators can monitor overall leave utilization. The page shows pending requests requiring action, approved upcoming leaves, and historical leave records. Leave balances are displayed alongside requests to prevent over-utilization.
Page Design Specifications
The page uses a Kanban-style board layout for pending approvals, with columns for Pending, Approved, and Rejected requests. Each card shows the employee photo, name, leave type, date range, and number of days. Managers can drag cards between columns to approve or reject with optional comments. A calendar view shows leave distribution across days, helping identify coverage gaps. The page adapts for employee view (showing own requests) and manager view (showing team requests).
Button Components
Button	Location	Function
Request Leave	Page header	Opens leave request form for self/team
Approve	Request card	Approves pending leave request
Reject	Request card	Rejects request with reason required
View Details	Request card	Shows full request with leave balance impact
Cancel	Own request card	Cancels pending or approved request
Calendar View	View toggle	Switches to calendar display mode
Table 3-1: Leave Requests Page Buttons
 
4. Payroll Processing
The Payroll Processing section handles the complete payroll calculation and disbursement workflow. This includes regular payroll runs on scheduled pay dates, off-cycle payroll for special payments, payroll adjustments for corrections, bonuses and commissions processing, final pay computation for separating employees, and payroll approvals workflow. The module automatically calculates all statutory deductions (SSS, PhilHealth, Pag-IBIG, withholding tax) based on current government rates and contribution tables.
4.1 Payroll Runs Page
Route: /payroll-workforce/payroll-processing/payroll-runs
Page Goal
The Payroll Runs page manages the execution and tracking of payroll processing cycles. Users can initiate new payroll runs for selected pay periods, review calculated payroll before approval, process approvals through defined workflows, and track payroll history with complete audit trails. The page shows all payroll runs with their status (draft, submitted, posted, void) and provides access to payslips and payroll reports. Integration with bank accounts enables direct deposit file generation for supported banks.
Page Design Specifications
The page uses a list layout with expandable rows for each payroll run. Each row shows the pay period dates, pay frequency (semi-monthly, monthly), total employees, gross pay, total deductions, net pay, and status badge. Expanding a row reveals summary statistics by department and quick action buttons. The page header shows upcoming scheduled pay dates as reminders. A wizard-style interface guides users through creating new payroll runs with employee selection, preview, and approval steps.
Button Components
Button	Location	Function
New Payroll Run	Page header	Opens payroll run creation wizard
Preview	Run row	Shows calculated payroll details before posting
Approve	Run row (draft)	Submits payroll for approval workflow
Post	Run row (approved)	Posts payroll and creates journal entries
Void	Run menu	Voids posted payroll with reversal entries
Generate Payslips	Run actions	Creates PDF payslips for distribution
Export Bank File	Run actions	Generates bank credit file for direct deposit
Table 4-1: Payroll Runs Page Buttons
Backend API Connections
•	GET /api/companies/:companyId/payroll/payroll-runs - List payroll runs
•	POST /api/companies/:companyId/payroll/payroll-runs - Create new payroll run
•	POST /api/companies/:companyId/payroll/payroll-runs/:id/calculate - Execute calculation
•	POST /api/companies/:companyId/payroll/payroll-runs/:id/approve - Submit for approval
•	POST /api/companies/:companyId/payroll/payroll-runs/:id/post - Post to GL
•	GET /api/companies/:companyId/payroll/payroll-runs/:id/payslips - Generate payslips

> **🔗 Cross-References:** Processed payroll auto-posts a GL Journal Entry → `/accounting/core-accounting/journal-entries`. Tax withholding feeds BIR Form 2316 → `/philippine-tax/bir-forms/form-2316` and Form 1601CQ → `/philippine-tax/bir-forms/form-1601cq`. Government contributions (SSS/PhilHealth/Pag-IBIG) tracked at → `/payroll-workforce/payroll-taxes/government-contributions`.
 
5. Compensation Management
The Compensation section manages employee compensation structures including base salaries, allowances, deductions, and employee loans. This module maintains salary history, handles salary adjustments and increases, manages various allowance types (transportation, meal, clothing, etc.), and tracks employee loans with amortization schedules. The compensation data feeds directly into payroll calculations, ensuring accurate and up-to-date compensation is applied to each payroll run.
5.1 Salary Structures Page
Route: /payroll-workforce/compensation/salary-structures
Page Goal
The Salary Structures page manages employee base compensation and salary components. Users can define salary structures for individual employees or apply templates by position, view and compare salaries across the organization, process salary adjustments with effective dates, and maintain complete salary history for audit purposes. The page supports multiple compensation components including basic salary, allowances, and taxable/non-taxable earnings.
Button Components
Button	Location	Function
Add Salary	Page header	Opens salary structure creation form
Adjust Salary	Employee row	Initiates salary adjustment workflow
View History	Employee row	Shows complete salary change history
Compare	Selection toolbar	Opens comparison view for selected employees
Table 5-1: Salary Structures Page Buttons
 
6. Payroll Taxes & Statutory
The Payroll Taxes & Statutory section manages government-mandated contributions and withholding taxes. This includes SSS (Social Security System) contributions for both employee and employer shares, PhilHealth premium calculations, Pag-IBIG fund contributions, and BIR withholding tax calculations based on current tax tables. The module generates contribution reports in government-prescribed formats and tracks remittance schedules to ensure timely compliance and avoid penalties.
6.1 Tax Withholding Page
Route: /payroll-workforce/payroll-taxes/tax-withholding
Page Goal
The Tax Withholding page manages employee income tax calculations and BIR compliance. Users can view withholding tax calculations per employee, update tax exemption status and dependents, generate BIR Form 2316 (Certificate of Compensation Tax Withheld), and prepare alphalist reports. The page ensures compliance with TRAIN Law tax tables and supports the new tax rates effective January 2023. Integration with payroll ensures accurate tax withholding on each pay period.
Page Design Specifications
The page displays a summary dashboard at the top showing total withholding tax for the current period, year-to-date totals, and upcoming filing deadlines. Below, a table lists all employees with their tax status (single, married, head of family), number of qualified dependents, taxable income, and calculated withholding tax. Filters allow viewing by pay period and department. Quick actions generate BIR-prescribed forms and reports directly from the interface.
Data Tables Required
•	EmployeeTaxProfile: Tax exemption status and dependent information
•	WithholdingTaxTable: BIR-prescribed tax brackets
•	PayrollDeduction: Individual tax deduction records per payroll
•	BirForm: Generated BIR forms with filing status
•	TaxRemittance: Tracking of tax payments to BIR
 
7. Module Summary & Implementation Guide
The Payroll & Workforce module provides comprehensive HR and payroll management capabilities fully compliant with Philippine regulations. From employee management and time tracking to payroll processing and statutory compliance, the module streamlines all workforce-related operations while ensuring accurate calculations and timely government remittances. The integration with core accounting ensures all payroll expenses are properly recorded in the general ledger.
7.1 Key Integration Points
•	Core Accounting: Automatic journal entries for payroll expenses and liabilities
•	Banking: Direct deposit file generation for supported banks
•	Tax Module: BIR form generation and tax reporting integration
•	Reporting: Payroll reports and workforce analytics dashboards
•	Projects Module: Time tracking integration for project-based costing
7.2 Implementation Priority
1.	Employee Management (foundation for payroll processing)
2.	Compensation Setup (salary structures and allowances)
3.	Payroll Processing (core calculation engine)
4.	Statutory Contributions (SSS, PhilHealth, Pag-IBIG, Tax)
5.	Leave Management (time-off tracking)
6.	Advanced Features (shift scheduling, recruiting)

HaypBooks Page101 Documentation
Part 6: Tax Module
Comprehensive Page Design Specifications
Table of Contents


Note: Right-click the Table of Contents and select 'Update Field' to refresh page numbers.
 
1. Tax Module Overview
The Tax Module in HaypBooks provides comprehensive tax management and BIR compliance capabilities specifically designed for Philippine businesses. This module handles all aspects of taxation including VAT (Value Added Tax) management, expanded withholding tax (EWT), creditable withholding tax (CWT), percentage tax for non-VAT registered entities, and income tax provisions. The module supports the generation of various BIR forms including Form 2550Q (Quarterly VAT Return), Form 2307 (Certificate of Creditable Tax Withheld), Form 2316 (Certificate of Compensation Tax Withheld), and annual alphalist submissions.
1.1 Module Architecture
The Tax module follows the NestJS modular architecture with Controller-Service-Repository pattern. The backend exposes RESTful APIs under /api/companies/:companyId/tax, protected by JWT authentication guards with role-based access control. The module integrates with Chart of Accounts for tax account mapping, Accounts Receivable for output VAT calculations, Accounts Payable for input VAT and withholding tax tracking, and the Payroll module for withholding tax on compensation. The architecture supports multiple tax types with configurable rates and thresholds.
1.2 Backend API Endpoints
Endpoint	Method & Path	Purpose
Tax Rates	GET /tax-rates	List configured tax rates
Tax Codes	GET/POST /tax-codes	Manage tax code definitions
VAT Summary	GET /vat/summary	Get VAT input/output summary
Form 2307	GET /forms/2307	Generate BIR Form 2307
Withholding Report	GET /withholding/report	Get withholding tax report
Table 1-1: Tax Module API Endpoints
 
2. Tax Setup
The Tax Setup section provides configuration tools for defining tax rates, tax codes, tax agencies, withholding tax setups, and exemption rules. This foundational configuration determines how taxes are calculated throughout the system on invoices, bills, and other transactions. Proper setup ensures accurate tax calculations, correct withholding application, and compliant reporting. The configuration supports multiple tax types including VAT at different rates, expanded withholding taxes at various percentages, and percentage tax for non-VAT taxpayers.
2.1 Tax Rates Page
Route: /taxes/tax-setup/tax-rates
Page Goal
The Tax Rates page manages the definition and configuration of all tax rates applicable to the business. Users can define VAT rates (standard 12%, zero-rated, exempt), expanded withholding tax rates (1%, 2%, 5%, 10%), creditable withholding tax rates, and percentage tax rates for non-VAT registered businesses. The page allows effective date management for rate changes and supports tax-inclusive vs tax-exclusive pricing configurations. Each rate can be linked to specific GL accounts for proper posting.
Page Design Specifications
The page uses a categorized list layout with expandable sections for each tax type (VAT, EWT, CWT, Percentage Tax). Each rate entry shows the rate name, percentage, effective date range, linked GL account, and status (active/inactive). A visual indicator shows whether the rate is currently active based on the current date. Inline editing allows quick rate updates without navigation. The page includes a rate history view showing past rate changes for audit purposes.
Button Components
Button	Location	Function
Add Rate	Section header	Opens form to create new tax rate
Edit	Rate row	Opens rate editor with all properties
Deactivate	Rate menu	Sets rate as inactive with effective date
View History	Rate menu	Shows rate change history timeline
Duplicate	Rate menu	Creates copy of existing rate for new config
Table 2-1: Tax Rates Page Buttons
Data Tables Required
•	TaxRate: Stores all tax rate definitions with effective dates
•	TaxType: Categorization of tax rates (VAT, EWT, CWT, etc.)
•	Account: GL accounts linked for tax postings
•	TaxRateHistory: Audit trail of rate changes
 
3. Sales & Output Tax
The Sales & Output Tax section manages value-added tax collected from sales transactions. This includes VAT tracking on invoices, zero-rated sales documentation, exempt sales recording, and output tax ledger management. The module automatically calculates output VAT on taxable sales based on configured rates and provides comprehensive reporting for VAT return preparation. Proper output tax tracking ensures accurate VAT payable calculations and compliance with BIR filing requirements.
3.1 VAT / Sales Tax Page
Route: /taxes/sales-output-tax/vat-sales-tax
Page Goal
The VAT / Sales Tax page provides a comprehensive view of all output VAT generated from sales transactions. Users can view VAT collected by invoice, track VAT by tax type (standard, zero-rated, exempt), reconcile output VAT with sales records, and prepare data for VAT returns. The page supports filtering by period, customer, and tax type. Summary cards show total output VAT for the selected period with breakdown by category.
Page Design Specifications
The page uses a dashboard layout with summary cards at the top showing total output VAT, zero-rated sales, exempt sales, and effective VAT rate. Below, a detailed table lists each VAT-able transaction with invoice number, customer, date, gross amount, VAT amount, and tax type. Color coding differentiates standard rated (green), zero-rated (blue), and exempt (gray) transactions. Export options allow downloading VAT data for external reconciliation or filing systems.
Button Components
Button	Location	Function
Filter by Period	Filter bar	Select date range for VAT display
View Invoice	Transaction row	Opens source invoice document
Export VAT Data	Page header	Downloads VAT report in CSV/Excel format
Generate VAT Return	Page header	Creates Form 2550Q data export
Table 3-1: VAT / Sales Tax Page Buttons
 
4. Purchase & Input Tax
The Purchase & Input Tax section manages VAT on purchases and withholding taxes on payments. This includes input VAT tracking on purchases and expenses, expanded withholding tax (EWT) on various transaction types, creditable withholding tax (CWT) on specific payments, and tax reconciliation tools. The module calculates claimable input VAT for offset against output VAT and tracks withholding taxes for Form 2307 generation. Proper input tax management maximizes VAT credits while ensuring compliance.
4.1 Input VAT Page
Route: /taxes/purchase-input-tax/input-vat
Page Goal
The Input VAT page displays all VAT paid on purchases and expenses that can be claimed as input tax credits. Users can view input VAT by supplier, reconcile input VAT with purchase records, identify unclaimed input VAT, and prepare data for VAT return preparation. The page calculates total claimable input VAT for the period and shows the net VAT position (output minus input) for quick assessment of VAT payable or refundable.
Page Design Specifications
The page uses a table layout with summary metrics above. Each row shows the bill/invoice number, supplier name, date, gross amount, input VAT amount, and claim status. A claim status indicator shows whether input VAT is claimable (green), partially claimable (yellow), or non-claimable (red) based on business rules. The summary bar shows total input VAT, total claimable, and net VAT position calculated in real-time as filters change.
Button Components
Button	Location	Function
View Bill	Transaction row	Opens source bill document
Toggle Claimable	Row action	Adjusts claimable status for item
Export Input VAT	Page header	Downloads input VAT report
Reconcile	Page header	Opens reconciliation tool
Table 4-1: Input VAT Page Buttons
4.2 Expanded Withholding Page
Route: /taxes/purchase-input-tax/expanded-withholding
Page Goal
The Expanded Withholding page manages all EWT transactions on payments to suppliers. Users can view withholding tax deducted by transaction type, track cumulative EWT per supplier, generate BIR Form 2307 for suppliers, and reconcile EWT with remittance records. The page supports the different EWT rates (1% for goods, 2% for services, 5% for rentals, 10% for certain payments) and ensures proper documentation for BIR compliance.
Data Tables Required
•	WithholdingTax: Records of all withholding tax transactions
•	Bill/Payment: Source documents for withholding calculations
•	Vendor: Supplier information for Form 2307 generation
•	BirForm2307: Generated 2307 certificates with tracking
•	TaxRemittance: Withholding tax payment records
 
5. Tax Reporting
The Tax Reporting section provides comprehensive reporting tools for tax compliance and analysis. This includes tax summary reports for management review, VAT payable calculations for return preparation, withholding tax reports for supplier certificates, tax liability tracking for payment planning, and audit trail reports for compliance verification. Reports can be generated on-demand or scheduled for automatic distribution. The section supports both standard reports and custom report configurations.
5.1 Tax Summary Page
Route: /taxes/tax-reporting/tax-summary
Page Goal
The Tax Summary page provides a consolidated view of all tax activities for a selected period. Users can see VAT position (output vs input), withholding tax collected and due, tax liabilities by type, and reconciliation status. The page serves as the primary dashboard for tax compliance monitoring, highlighting any discrepancies or items requiring attention. Summary cards provide at-a-glance metrics while detailed breakdowns support drill-down analysis.
Page Design Specifications
The page uses a dashboard layout with multiple widgets organized in a grid. Primary widgets show VAT summary with output/input/payable calculation, withholding tax summary by type, and overall tax liability position. Each widget includes trend indicators comparing to prior periods. Below the widgets, tables show detailed breakdowns with drill-down capability. Period selector allows switching between monthly, quarterly, and annual views. Color-coded alerts highlight approaching deadlines or outstanding liabilities.
Button Components
Button	Location	Function
Period Selector	Page header	Changes reporting period view
Export Report	Widget header	Downloads widget data as report
View Details	Widget	Opens detailed breakdown page
Schedule Report	Page header	Sets up automatic report delivery
Table 5-1: Tax Summary Page Buttons

> **🔗 Cross-References:** Output VAT sourced from AR Invoice postings → `/sales/billing/invoices`. Input VAT and EWT sourced from AP Bills → `/expenses/payables/bills`. File VAT returns via Form 2550Q → `/philippine-tax/bir-forms/form-2550q` or 2550M → `/philippine-tax/bir-forms/form-2550m`. Annual tax summary → `/taxes/year-end/annual-tax-summary`.
 
6. Filing & Payments
The Filing & Payments section manages the submission of tax returns and payment of tax liabilities. This includes tax return generation and filing, filing history tracking for audit purposes, tax payment recording and allocation, remittance tracking for government agencies, and e-filing integration for supported BIR forms. The section ensures timely compliance with filing deadlines and provides complete documentation for all tax submissions.
6.1 Tax Returns Page
Route: /taxes/filing-payments/tax-returns
Page Goal
The Tax Returns page manages the preparation and filing of BIR tax returns. Users can generate VAT returns (Form 2550Q, 2550M), prepare withholding tax returns, submit annual information returns (alphalist), and track filing status. The page shows pending returns requiring preparation, upcoming deadlines, and filed return history. Integration with e-filing systems (eFPS, eBIRForms) streamlines the submission process where supported.
Button Components
Button	Location	Function
Prepare Return	Page header	Opens return preparation wizard
Generate Form	Return row	Creates BIR form PDF for filing
File Electronically	Return row	Submits via eFPS/eBIRForms
Mark as Filed	Return row	Records manual filing with confirmation
View Filed Return	Return row	Opens filed return document
Table 6-1: Tax Returns Page Buttons
Backend API Connections
•	GET /api/companies/:companyId/tax/returns - List tax returns
•	POST /api/companies/:companyId/tax/returns - Create new return
•	POST /api/companies/:companyId/tax/returns/:id/generate - Generate form data
•	POST /api/companies/:companyId/tax/returns/:id/file - Submit filing
•	GET /api/companies/:companyId/tax/returns/:id/pdf - Generate PDF form
 
7. Year-End Tax Processing
The Year-End section handles annual tax compliance requirements. This includes annual tax summary generation, year-end tax adjustments, tax closing entries for the GL, and preparation of annual information returns. The module ensures all tax data is complete and accurate before year-end closing, generates required annual reports, and facilitates the transition to the new fiscal year. Proper year-end processing is essential for accurate financial statements and compliant annual tax filings.
7.1 Annual Tax Summary Page
Route: /taxes/year-end/annual-tax-summary
Page Goal
The Annual Tax Summary page provides a comprehensive year-end view of all tax activities. Users can review annual VAT summaries, withholding tax totals by type, tax payments made during the year, and outstanding liabilities. The page supports preparation of annual tax returns including the alphalist submission. Summary views compare actual tax liabilities to payments made, highlighting any variances requiring attention before year-end closing.
Data Tables Required
•	AnnualTaxSummary: Aggregated annual tax data by type
•	TaxClosingEntry: Year-end tax journal entries
•	BirForm1604CF: Alphalist submission records
•	FiscalYear: Year-end processing status tracking
 
8. Module Summary & Implementation Guide
The Tax Module provides comprehensive tax management capabilities fully compliant with Philippine BIR requirements. From tax setup and configuration to filing and payments, the module ensures accurate tax calculations and timely compliance. Integration with AR, AP, and core accounting creates a seamless tax workflow from transaction to remittance, reducing manual effort and ensuring audit trails.
8.1 Key Integration Points
•	Core Accounting: Tax account mapping and journal entry creation
•	Accounts Receivable: Output VAT on invoices and sales
•	Accounts Payable: Input VAT and withholding taxes on bills
•	Payroll Module: Withholding tax on compensation (Form 2316)
•	Banking: Tax payment processing and remittance
8.2 Implementation Priority
1.	Tax Setup (rates, codes, agencies)
2.	VAT Processing (output and input tracking)
3.	Withholding Tax (EWT and CWT)
4.	Tax Reporting (summaries and reports)
5.	BIR Forms (2307, 2316, 2550Q)
6.	E-Filing Integration (eFPS, eBIRForms)

HaypBooks Page101 Documentation
Part 7: Inventory Module
Comprehensive Page Design Specifications
Table of Contents


Note: Right-click the Table of Contents and select 'Update Field' to refresh page numbers.
 
1. Inventory Module Overview
The Inventory Module in HaypBooks provides comprehensive inventory management capabilities for businesses that handle physical goods. This module handles all aspects of inventory operations including item management, stock tracking, receiving, stock movements, adjustments, and valuation. The module integrates seamlessly with Accounts Payable for purchase orders and receiving, Accounts Receivable for sales and stock deduction, and the Chart of Accounts for inventory valuation and COGS tracking. Support for multiple warehouses, lot/serial tracking (enterprise), and various costing methods ensures flexibility for different business models.
1.1 Module Architecture
The Inventory module follows the NestJS modular architecture with Controller-Service-Repository pattern. The backend exposes RESTful APIs under /api/companies/:companyId/inventory, protected by JWT authentication guards. The module maintains inventory item master data, tracks stock levels through transaction records, calculates inventory values based on configured costing methods, and generates COGS entries automatically upon sales. The architecture supports real-time inventory updates and provides complete audit trails for all inventory movements.
1.2 Backend API Endpoints
Endpoint	Method & Path	Purpose
Inventory Items	GET/POST /items	Manage inventory items
Stock Movements	GET/POST /movements	Track stock in/out
Adjustments	POST /adjustments	Adjust stock counts
Valuation	GET /valuation	Get inventory value
Table 1-1: Inventory Module API Endpoints
 
2. Inventory Setup
The Inventory Setup section provides configuration tools for establishing the foundation of inventory management. This includes defining inventory items with all their attributes, setting up categories for organization, configuring units of measure for accurate quantification, and establishing bundles/assemblies for composite products (enterprise feature). Proper setup ensures consistent data structure and accurate inventory tracking throughout all operations.
2.1 Inventory Items Page
Route: /inventory/setup/inventory-items
Page Goal
The Inventory Items page serves as the central hub for managing all inventory item master data. Users can create new items with complete specifications, view and search existing items, manage item details including pricing and costing information, and track stock levels per item. The page provides quick access to item history, related transactions, and stock status. Item types include inventory items (tracked), non-inventory items (not tracked), services (no stock), and assemblies (enterprise).
Page Design Specifications
The page uses a table layout with item image thumbnails, item code/name, category, unit of measure, current stock quantity, and unit cost. Filters above the table allow filtering by category, item type, and stock status (in stock, low stock, out of stock). Color-coded stock indicators show healthy (green), low (yellow), and out of stock (red) items. A detail panel slides in when an item is selected, showing complete item information with tabs for Details, Stock, Pricing, History, and Related Items.
Button Components
Button	Location	Function
Add Item	Page header	Opens item creation wizard
Import	Page header	Opens bulk import dialog
Edit	Row action	Opens item editor
View Stock	Row action	Shows stock details by location
Duplicate	Row menu	Creates copy of item
Deactivate	Row menu	Marks item as inactive
Table 2-1: Inventory Items Page Buttons
Data Tables Required
•	Item: Core item master data with all attributes
•	ItemCategory: Item categorization structure
•	UnitOfMeasure: Measurement units and conversions
•	ItemStock: Current stock levels per item per location
•	ItemPrice: Pricing information per price list
 
3. Receiving
The Receiving section manages the process of receiving goods into inventory from suppliers. This includes purchase order processing, item receipt recording, vendor return handling, and landed cost allocation (enterprise feature). The workflow ensures accurate stock updates upon receipt, proper valuation including all associated costs, and complete documentation for AP matching. Integration with Accounts Payable allows automatic creation of bills from received items.
3.1 Purchase Orders Page
Route: /inventory/receiving/purchase-orders
Page Goal
The Purchase Orders page manages the creation and tracking of purchase orders sent to suppliers. Users can create new POs with multiple items, track PO status (open, partial, received, closed), manage approvals workflow, and convert POs to item receipts upon delivery. The page shows pending deliveries and expected receipt dates. Integration with vendor records ensures accurate pricing and terms.
Page Design Specifications
The page uses a table layout showing PO number, vendor name, order date, expected delivery date, total value, and status badge. Status badges indicate open (blue), partial receipt (yellow), fully received (green), and cancelled (gray) orders. Expanding a row shows line items with quantities ordered vs received. Quick actions allow creating receipts from POs directly. The page header shows summary totals for open POs and expected deliveries.
Button Components
Button	Location	Function
New PO	Page header	Opens purchase order creation form
Receive Items	PO row	Creates item receipt from PO
Edit	PO row (open)	Modifies PO details
Cancel	PO menu	Cancels open PO
View History	PO menu	Shows PO activity log
Table 3-1: Purchase Orders Page Buttons
 
4. Stock Operations
The Stock Operations section handles all inventory movements and adjustments within the system. This includes stock movements between locations, inventory adjustments for corrections, cycle counts for periodic verification, physical counts for annual audits, and transfers between warehouses (enterprise). The module maintains complete audit trails for all stock changes and ensures accurate inventory records through proper authorization workflows.
4.1 Stock Movements Page
Route: /inventory/stock-operations/stock-movements
Page Goal
The Stock Movements page provides a complete view of all inventory movements including stock in (receipts), stock out (sales, adjustments), and transfers. Users can view movement history, create manual adjustments, track movement types, and audit inventory changes. The page supports filtering by item, location, movement type, and date range. Each movement record links to source documents (receipt, invoice, adjustment) for complete traceability.
Page Design Specifications
The page uses a table layout with columns for movement date, item name, movement type badge (in/out/transfer), quantity, reference number, and location. Color coding differentiates stock in (green) from stock out (red) movements. Each row links to the source document for drill-down. A running balance column shows stock level after each movement for selected items. Quick filters and search allow rapid location of specific movements.
Button Components
Button	Location	Function
New Adjustment	Page header	Opens adjustment form for stock correction
New Transfer	Page header	Opens transfer form between locations
View Source	Row action	Opens source document for movement
Export	Page header	Downloads movement history
Table 4-1: Stock Movements Page Buttons
 
5. Inventory Valuation
The Inventory Valuation section provides tools for calculating and reporting inventory values. This includes inventory valuation reports by various methods (FIFO, average cost, standard cost), cost adjustments for price changes, write-downs for obsolete or damaged inventory, and COGS analysis for margin tracking. The module ensures accurate financial reporting of inventory assets and proper matching of costs with revenues.
5.1 Inventory Valuation Page
Route: /inventory/valuation/inventory-valuation
Page Goal
The Inventory Valuation page provides a snapshot of inventory value at any point in time. Users can view total inventory value, breakdown by category or item, compare values across periods, and generate valuation reports for financial reporting. The page supports multiple valuation methods and shows the calculation basis for each item's value. Integration with GL ensures inventory asset accounts reflect accurate values.
Page Design Specifications
The page uses a dashboard layout with summary cards showing total inventory value, value by category breakdown (pie chart), and value trend over time (line chart). Below, a detailed table shows each item with quantity, unit cost, and total value. Columns are sortable by value for identifying high-value items. The valuation date selector allows viewing values as of any historical date. Export options support generating formal valuation reports for auditors or management.
Data Tables Required
•	Item: Item master with costing information
•	ItemStock: Current quantities per location
•	InventoryTransaction: Transaction history for cost calculation
•	InventoryValuation: Period-end valuation snapshots
 
6. Module Summary & Implementation Guide
The Inventory Module provides comprehensive inventory management capabilities for businesses handling physical goods. From item setup and receiving to stock operations and valuation, the module ensures accurate tracking of all inventory movements. Integration with AR, AP, and accounting creates a seamless flow from purchase to sale, maintaining accurate financial records throughout.
6.1 Key Integration Points
•	Accounts Payable: Purchase orders convert to bills upon receipt
•	Accounts Receivable: Sales automatically deduct stock
•	Core Accounting: Inventory asset and COGS postings
•	Projects Module: Inventory allocation to projects
6.2 Implementation Priority
1.	Inventory Items Setup (master data foundation)
2.	Receiving Workflow (stock in process)
3.	Stock Operations (movements and adjustments)
4.	Valuation (financial accuracy)
5.	Advanced Features (warehouses, lot/serial)

HaypBooks Page101 Documentation
Part 8: Projects & Time Module
Comprehensive Page Design Specifications
Table of Contents


Note: Right-click the Table of Contents and select 'Update Field' to refresh page numbers.
 
1. Projects & Time Module Overview
The Projects & Time Module in HaypBooks provides comprehensive project management and time tracking capabilities for businesses that bill based on projects or time. This module handles project setup and planning, task and milestone management, time entry and timesheet processing, project billing and progress invoicing, and work-in-progress (WIP) tracking. The module integrates with the Chart of Accounts for project-based costing, AR for project billing, and Payroll for time-based compensation calculations.
1.1 Module Architecture
The Projects module follows the NestJS modular architecture with separate sub-modules for Projects and Time tracking. The backend exposes RESTful APIs under /api/companies/:companyId/projects and /api/companies/:companyId/time, protected by JWT authentication. The module maintains project hierarchies, tracks resource allocation, calculates project profitability, and supports various billing methods (fixed price, time and materials, milestone-based). Time entries link to projects, tasks, or general activities with approval workflows.
1.2 Backend API Endpoints
Endpoint	Method & Path	Purpose
Projects	GET/POST /projects	Manage project records
Time Entries	GET/POST /time/entries	Record time worked
Timesheets	GET/POST /time/timesheets	Submit/approve timesheets
Project Billing	POST /projects/:id/invoice	Generate project invoice
Table 1-1: Projects & Time Module API Endpoints
 
2. Project Setup
The Project Setup section provides tools for creating and configuring projects. This includes defining project scope and deliverables, establishing budgets and billing terms, setting up milestones and tasks, creating project templates for recurring project types, and configuring contracts. Proper project setup ensures accurate tracking of progress, costs, and billings throughout the project lifecycle.
2.1 Projects Page
Route: /projects/project-setup/projects
Page Goal
The Projects page serves as the central hub for managing all projects. Users can create new projects, view project status and progress, access project financials, and manage project settings. The page provides a portfolio view of all projects with key metrics including completion percentage, budget vs actual costs, unbilled amounts, and project profitability. Project managers use this page to monitor project health and identify issues requiring attention.
Page Design Specifications
The page uses a card-based layout showing project name, client/customer, project manager, status badge, progress bar, and key financial metrics. Cards are grouped by status (active, on hold, completed) or can be viewed in a Kanban layout. Each card shows budget utilization, hours logged, and profitability percentage. Color-coded health indicators show on track (green), at risk (yellow), and over budget (red) projects. Clicking a card opens the project dashboard with full details.
Button Components
Button	Location	Function
New Project	Page header	Opens project creation wizard
From Template	Page header dropdown	Creates project from predefined template
View Dashboard	Project card	Opens project dashboard view
Edit	Project card menu	Opens project settings editor
Close Project	Project card menu	Marks project as completed
Archive	Project card menu	Archives completed project
Table 2-1: Projects Page Buttons
Data Tables Required
•	Project: Core project records with scope and settings
•	ProjectMilestone: Milestone definitions and tracking
•	ProjectTask: Task breakdown within projects
•	ProjectBudget: Budget allocation and tracking
•	ProjectTemplate: Reusable project configurations
•	Contract: Project contract terms and conditions
 
3. Time Entry
The Time Entry section provides tools for recording and managing time worked. This includes individual time entry submission, timesheet compilation and submission, timer sessions for real-time tracking, and billable time review for client billing. The module supports multiple time entry methods including manual entry, timer-based entry, and calendar-based entry. Time entries can be linked to projects, tasks, or general activities.
3.1 Time Entries Page
Route: /time/entry/time-entries
Page Goal
The Time Entries page allows users to record and manage their time entries. Employees can log time against projects or general activities, specify billable vs non-billable time, add descriptions and notes, and manage their time entry history. The page shows entries by day, week, or month with totals for billable and non-billable hours. Quick actions allow starting timers or duplicating previous entries.
Page Design Specifications
The page uses a calendar-style layout with daily or weekly views. Each time entry shows project/task, duration, billable status, and description. A timer widget floats at the bottom for quick timer start/stop. Daily and weekly totals show hours logged vs expected hours. Filters allow viewing by project, task type, or billable status. The interface supports inline editing of existing entries and bulk operations for time management.
Button Components
Button	Location	Function
Add Entry	Page header	Opens time entry form
Start Timer	Floating widget	Begins timer for current activity
Edit	Entry row	Opens entry for modification
Duplicate	Entry menu	Creates copy of entry for new date
Delete	Entry menu	Removes time entry
Submit to Timesheet	Entry row	Adds entry to current timesheet
Table 3-1: Time Entries Page Buttons
 
4. Project Billing
The Project Billing section handles invoicing for project-based work. This includes progress billing for percentage-complete invoicing, milestone billing for fixed-price projects, time and materials billing, change order management for scope changes, and retainer management for prepaid services. The module tracks work-in-progress (WIP) to ensure all billable work is invoiced and revenue is recognized properly.
4.1 Project Billing Page
Route: /projects/billing/project-billing
Page Goal
The Project Billing page manages the creation of invoices from project work. Users can review billable time and expenses, select billing method for each project, generate invoices based on progress or milestones, and track billing history. The page shows unbilled WIP, partially billed items, and completed billings. Integration with AR ensures proper invoice creation and customer management.
Button Components
Button	Location	Function
Create Invoice	Project row	Generates invoice from billable items
Select Items	Billing wizard	Choose specific time/expense items to bill
Preview Invoice	Billing wizard	Shows invoice preview before creation
View WIP	Project row	Shows work-in-progress details
Table 4-1: Project Billing Page Buttons
 
5. Project Financials
The Project Financials section provides comprehensive financial tracking for projects. This includes project profitability analysis, budget vs actual comparisons, margin analysis by project phase, and cost breakdown reporting. The module calculates realized and unrealized revenue, tracks cost overruns, and provides insights for project performance improvement. Financial data integrates with the GL for accurate reporting.
5.1 Project Profitability Page
Route: /projects/financials/project-profitability
Page Goal
The Project Profitability page shows the financial performance of projects. Users can view revenue, costs, margins, and profitability percentages by project. The page supports comparison across projects, periods, and project managers. Summary metrics show total revenue, total costs, gross margin, and realization rate. Drill-down capabilities allow detailed analysis of cost components.
Data Tables Required
•	Project: Project master data
•	TimeEntry: Billable hours and costs
•	Invoice/InvoiceLine: Revenue recognized
•	ProjectCost: Direct and allocated costs
•	ProjectFinancial: Aggregated financial metrics
 
6. Module Summary & Implementation Guide
The Projects & Time Module provides comprehensive project management and time tracking capabilities for service-based businesses. From project setup and planning to billing and financial analysis, the module ensures accurate tracking of all project activities. Integration with AR, Payroll, and Accounting creates a seamless workflow from time entry to revenue recognition.
6.1 Key Integration Points
•	Accounts Receivable: Project billing and invoice generation
•	Payroll Module: Time-based compensation calculations
•	Core Accounting: Project cost and revenue recognition
•	Inventory Module: Material allocation to projects
•	Reporting Module: Project analytics and dashboards
6.2 Implementation Priority
1.	Project Setup (project creation and configuration)
2.	Time Entry (time recording foundation)
3.	Timesheets (approval workflow)
4.	Project Billing (revenue generation)
5.	Project Financials (analysis and reporting)


HAYPBOOKS
Page101 Documentation Series
Part 9: Home, Tasks & Approvals, and Organization
Comprehensive Page Specifications for Implementation
Version 1.0 | 2026-03-08
 
Table of Contents


Note: Right-click the Table of Contents and select 'Update Field' to refresh page numbers.
 
 
SECTION 1: HOME MODULE
1.1 Dashboard
Route: /home/dashboard
Page Goal
Provide users with a comprehensive overview of their business financial health, key metrics, recent activities, and quick access to frequently used features. The dashboard serves as the central hub for daily operations and decision-making.
Page Design
Layout: Three-column responsive grid with KPI cards at the top, charts in the middle, and activity feed on the bottom
Header: Company name, current period, quick actions dropdown
KPI Cards Row: Cash Balance, Accounts Receivable, Accounts Payable, Net Income (current month)
Charts Section: Revenue vs Expenses trend (line chart), Expense breakdown (pie chart), Cash flow projection (area chart)
Activity Feed: Recent transactions, pending approvals, upcoming due dates
Quick Actions Panel: Create Invoice, Record Payment, Add Bill, New Journal Entry
Sidebar Integration: Collapsible with favorites and recent items
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Quick Create	Plus icon	Opens quick create modal	N/A (Client state)	Shows dropdown with create options: Invoice, Bill, Payment, JE, etc.
Refresh	Refresh icon	Refreshes all dashboard data	GET /api/companies/:id/dashboard	Fetches latest KPIs and activities
Export	Download icon	Exports dashboard to PDF	GET /api/companies/:id/dashboard/export	Generates PDF report of current view
Filter Period	Calendar icon	Changes the reporting period	N/A (Client state)	Updates all metrics to selected period
View All Transactions	Arrow right	Navigates to transactions	N/A (Navigation)	Routes to /banking-cash/transactions
Settings	Gear icon	Customizes dashboard widgets	N/A (Client state)	Opens widget configuration modal
Tables & Data Displays
Table Name	Columns	Data Source	Features
KPI Cards	Metric, Value, Change %, Trend indicator	Dashboard API	Real-time updates, drill-down capability
Revenue Chart	Month, Revenue, Expenses	Reporting API	Interactive tooltips, zoom functionality
Expense Breakdown	Category, Amount, Percentage	Reporting API	Clickable segments for details
Activity Feed	Date, Type, Description, Amount, Status	Transaction API	Pagination, filtering, sorting
Due Dates	Date, Item, Amount, Days Until	AR/AP APIs	Color-coded urgency indicators
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/dashboard	GET	Fetch all dashboard data	period, asOf	KPIs, charts data, activities, alerts
GET /api/companies/:companyId/reporting/kpis	GET	Get KPI metrics	period	Cash balance, AR, AP, Net Income
GET /api/companies/:companyId/ar/aging	GET	AR aging summary	asOf	Aging buckets for dashboard
GET /api/companies/:companyId/ap/aging	GET	AP aging summary	asOf	Aging buckets for dashboard
GET /api/companies/:companyId/reporting/cash-flow	GET	Cash flow data	months	Monthly cash flow projection
UI Components Required
• KPI Card Component: Displays metric with trend indicator and percentage change
• Line Chart Component: Recharts responsive line chart with multiple series
• Pie Chart Component: Interactive pie/donut chart with tooltips
• Activity Feed Component: Virtualized list with infinite scroll
• Quick Create Modal: Multi-step modal with form validation
• Date Range Picker: Calendar component for period selection
• Loading Skeleton: Skeleton loaders for async data states
 
1.2 Business Health
Route: /home/business-health
Page Goal
Provide a comprehensive health score and analysis of the business financial condition. Display key financial ratios, liquidity metrics, profitability indicators, and trend analysis to help business owners understand their company's financial wellbeing.
Page Design
Layout: Full-width health score card at top, followed by metric cards in a grid, then detailed charts
Health Score Card: Large circular gauge showing overall health score (0-100), color-coded status (Poor/Fair/Good/Excellent)
Metric Categories: Liquidity, Profitability, Efficiency, Solvency
Each metric card shows: Current value, Benchmark comparison, Trend (up/down), Industry percentile
Charts: Historical trend for each metric category, comparison with industry benchmarks
Recommendations Section: AI-generated suggestions for improving weak areas
Alert Badges: Critical items requiring immediate attention
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
View Details	Info icon	Shows detailed breakdown of score	N/A (Client state)	Expands metric to show calculation components
Compare Periods	Chart icon	Compare current vs previous period	GET /api/companies/:id/health/compare	Shows side-by-side comparison
Export Report	Download icon	Export health report to PDF	GET /api/companies/:id/health/export	Generates comprehensive PDF report
View Recommendations	Lightbulb icon	Shows improvement suggestions	GET /api/companies/:id/health/recommendations	AI-generated recommendations
Adjust Weights	Settings icon	Customize metric weights	N/A (Client state)	Opens weight configuration modal
Set Alerts	Bell icon	Configure health alerts	POST /api/companies/:id/health/alerts	Sets threshold-based notifications
Tables & Data Displays
Table Name	Columns	Data Source	Features
Health Score Card	Score, Status, Last Updated, Trend	Health API	Animated gauge, color transitions
Liquidity Metrics	Current Ratio, Quick Ratio, Cash Ratio	Health API	Gauge indicators, benchmark lines
Profitability Metrics	Gross Margin, Net Margin, ROA, ROE	Health API	Trend arrows, percentile badges
Efficiency Metrics	Asset Turnover, Inventory Turnover, AR Days	Health API	Comparison bars, targets
Solvency Metrics	Debt Ratio, Equity Ratio, Interest Coverage	Health API	Risk indicators, thresholds
Recommendations List	Priority, Category, Action, Impact	AI API	Sortable, filterable, dismissible
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/health/score	GET	Get overall health score	asOf	Score, status, component scores
GET /api/companies/:companyId/health/metrics	GET	Get detailed metrics	categories[]	All metric values with benchmarks
GET /api/companies/:companyId/health/trends	GET	Get historical trends	months, metrics[]	Time series data for charts
GET /api/companies/:companyId/health/recommendations	GET	Get AI recommendations	N/A	List of prioritized recommendations
POST /api/companies/:companyId/health/alerts	POST	Configure health alerts	thresholds	Alert configuration confirmation
UI Components Required
• Health Gauge Component: SVG-based circular gauge with animation
• Metric Card Component: Card with value, benchmark, trend indicator
• Benchmark Comparison Component: Visual comparison with industry standards
• Trend Chart Component: Line chart showing historical metric values
• Recommendations Panel: Expandable list with priority badges
• Alert Configuration Modal: Form for setting threshold alerts
 
1.3 Shortcuts
Route: /home/shortcuts
Page Goal
Provide quick access to frequently used features, recent items, and custom user shortcuts. Allow users to personalize their workspace by pinning favorite pages and creating custom quick-action buttons.
Page Design
Layout: Three-column grid with sections for Pinned Items, Recent Items, Quick Actions, and Custom Shortcuts
Pinned Section: User's favorite/bookmarked pages with icons, can be rearranged via drag-and-drop
Recent Items: Last 20 accessed pages/documents with timestamps and quick preview on hover
Quick Actions: Predefined action buttons for common tasks (Create Invoice, Add Bill, etc.)
Custom Shortcuts: User-defined shortcuts with custom labels and icons
Search Bar: Global search at the top to find any page, transaction, or entity
Drag-and-drop support for reorganizing shortcuts
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Add Shortcut	Plus icon	Create new custom shortcut	N/A (Client state)	Opens shortcut creation modal
Edit Layout	Pencil icon	Enter edit mode for rearranging	N/A (Client state)	Enables drag-and-drop mode
Remove Shortcut	X icon	Remove a shortcut	DELETE /api/users/:id/shortcuts/:sid	Removes from user's shortcuts
Pin Current Page	Pin icon	Add current page to pinned	POST /api/users/:id/pins	Saves to pinned items
Clear Recents	Trash icon	Clear recent items history	DELETE /api/users/:id/recents	Clears recent items list
Restore Defaults	Refresh icon	Reset to default shortcuts	POST /api/users/:id/shortcuts/reset	Restores default layout
Tables & Data Displays
Table Name	Columns	Data Source	Features
Pinned Items Grid	Icon, Label, Route, Order	User Preferences API	Draggable, editable, deletable
Recent Items List	Type, Name, Route, Timestamp	User Activity API	Clickable, preview on hover
Quick Actions Grid	Icon, Label, Action Type	System Default	Configurable, permission-aware
Custom Shortcuts	Icon, Label, URL/Route, Color	User Preferences API	Full CRUD operations
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/users/:userId/shortcuts	GET	Get user's shortcuts	N/A	Pinned items, custom shortcuts
POST /api/users/:userId/shortcuts	POST	Create shortcut	label, route, icon	Created shortcut object
PUT /api/users/:userId/shortcuts/:shortcutId	PUT	Update shortcut	label, route, icon, order	Updated shortcut
DELETE /api/users/:userId/shortcuts/:shortcutId	DELETE	Delete shortcut	N/A	Success confirmation
GET /api/users/:userId/recents	GET	Get recent items	limit	List of recent items
DELETE /api/users/:userId/recents	DELETE	Clear recent items	N/A	Success confirmation
UI Components Required
• Shortcut Card Component: Icon with label, clickable, context menu for edit/delete
• Drag-and-Drop Grid: DnD container for rearranging shortcuts
• Recent Items List: Virtualized list with hover preview
• Shortcut Creation Modal: Form with icon picker, label input, route selector
• Global Search Bar: Autocomplete search with categories
• Edit Mode Toggle: Button to enable/disable edit mode
 
SECTION 2: TASKS & APPROVALS MODULE
2.1 My Tasks
Route: /tasks-approvals/my-work/my-tasks
Page Goal
Display all tasks assigned to the current user, including accounting tasks, review items, and workflow assignments. Provide filtering, sorting, and bulk action capabilities for efficient task management.
Page Design
Layout: Full-width task list with sidebar filters
Header: Task count summary (Total, Due Today, Overdue, Completed This Week)
Filter Sidebar: Task type, Priority, Due date range, Status, Assigned by
Task List: Virtualized list with task cards showing title, type, priority, due date, assigner, and quick actions
Each Task Card: Checkbox for completion, Priority badge, Type icon, Title, Description preview, Due date with countdown
Bulk Actions Bar: Appears when multiple tasks selected (Mark Complete, Reassign, Change Priority, Snooze)
Task Detail Modal: Opens on click showing full details, related items, activity log
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Complete Task	Check icon	Mark task as complete	POST /api/tasks/:id/complete	Updates status, logs completion
View Details	Eye icon	Open task detail modal	GET /api/tasks/:id	Shows full task information
Reassign	User icon	Reassign to another user	PUT /api/tasks/:id/assignee	Opens user selector
Change Priority	Flag icon	Update task priority	PUT /api/tasks/:id/priority	Priority dropdown
Snooze	Clock icon	Postpone task due date	PUT /api/tasks/:id/snooze	Date picker for new due date
Add Comment	Message icon	Add comment to task	POST /api/tasks/:id/comments	Opens comment input
Bulk Complete	CheckDouble icon	Complete selected tasks	POST /api/tasks/bulk/complete	Batch status update
Export Tasks	Download icon	Export tasks to CSV/Excel	GET /api/tasks/export	Downloads file
Tables & Data Displays
Table Name	Columns	Data Source	Features
Task List	ID, Title, Type, Priority, Status, Due Date, Assignee, Assigner	Tasks API	Sortable, filterable, pagination
Task Summary Cards	Count, Label, Trend	Tasks API	Click to filter by status
Activity Log	Timestamp, User, Action, Details	Tasks API	Reverse chronological order
Related Items	Type, Reference, Link	Tasks API	Click to navigate to related entity
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/tasks	GET	List all tasks	assignee, status, priority, type, from, to, sort, page, limit	Paginated task list
GET /api/tasks/:taskId	GET	Get task details	N/A	Full task with activity log
POST /api/tasks/:taskId/complete	POST	Complete task	completionNotes	Updated task
PUT /api/tasks/:taskId/assignee	PUT	Reassign task	assigneeId	Updated task
PUT /api/tasks/:taskId/priority	PUT	Change priority	priority	Updated task
PUT /api/tasks/:taskId/snooze	PUT	Snooze task	newDueDate, reason	Updated task
POST /api/tasks/bulk/complete	POST	Bulk complete	taskIds[]	Completion results
GET /api/tasks/export	GET	Export tasks	format, filters	File download
UI Components Required
• Task Card Component: Card with checkbox, badges, actions menu
• Task List Component: Virtualized list with infinite scroll
• Filter Sidebar Component: Collapsible filter panel with checkboxes and date pickers
• Bulk Actions Bar Component: Sticky bar with action buttons
• Task Detail Modal Component: Full-screen or slide-over modal with tabs
• Priority Badge Component: Color-coded priority indicator
• Activity Timeline Component: Vertical timeline for task activity
 
2.2 My Approvals
Route: /tasks-approvals/my-work/my-approvals
Page Goal
Display all items pending the current user's approval, including invoices, bills, journal entries, payments, and purchase orders. Provide a streamlined approval workflow with ability to approve, reject, or request changes.
Page Design
Layout: Two-column layout with approval queue on left and detail preview on right
Header: Approval count by type, average time to approve, pending vs processed stats
Filter Bar: Type filter (Invoice, Bill, JE, Payment, PO), Amount range, Date range, Submitter
Approval Queue: List of items awaiting approval, sorted by urgency (amount and age)
Detail Preview Panel: Shows full details of selected item without leaving page
Quick Actions: Approve, Reject, Request Changes, Delegate buttons
Batch Approval: Multi-select for batch approval of similar items
Approval History: Tab showing past approvals with filter by date range
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Approve	Check icon	Approve the item	POST /api/approvals/:id/approve	Moves to approved status, creates audit log
Reject	X icon	Reject the item	POST /api/approvals/:id/reject	Requires rejection reason, notifies submitter
Request Changes	Edit icon	Request modifications	POST /api/approvals/:id/request-changes	Opens comment modal, returns to submitter
Delegate	UserPlus icon	Delegate to another approver	POST /api/approvals/:id/delegate	Opens user selector
View Full Details	Expand icon	Open full detail page	N/A (Navigation)	Navigates to entity detail page
Batch Approve	CheckDouble icon	Approve multiple items	POST /api/approvals/bulk/approve	Batch approval with confirmation
Add Comment	Message icon	Add approval comment	POST /api/approvals/:id/comments	Attaches comment to approval
View History	History icon	View approval history	GET /api/approvals/:id/history	Shows approval workflow history
Tables & Data Displays
Table Name	Columns	Data Source	Features
Approval Queue	ID, Type, Reference #, Amount, Submitter, Submitted Date, Urgency	Approvals API	Sortable, filterable, selectable
Approval Detail	Full entity details, Line items, Approval workflow	Entity API + Approvals API	Context-aware display
Approval Stats	Pending Count, Approved Today, Average Time, Overdue	Approvals API	Real-time counters
Approval History	Date, Approver, Action, Comments	Approvals API	Filterable by date and action
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/approvals/pending	GET	Get pending approvals	type, from, to, submitter, page, limit	Paginated approval queue
GET /api/approvals/:approvalId	GET	Get approval details	N/A	Full approval with entity details
POST /api/approvals/:approvalId/approve	POST	Approve item	comments	Approval confirmation, entity status updated
POST /api/approvals/:approvalId/reject	POST	Reject item	reason, comments	Rejection confirmation, submitter notified
POST /api/approvals/:approvalId/request-changes	POST	Request changes	changes, comments	Change request sent to submitter
POST /api/approvals/:approvalId/delegate	POST	Delegate approval	delegateToId, reason	Delegation confirmation
POST /api/approvals/bulk/approve	POST	Batch approve	approvalIds[], comments	Batch approval results
GET /api/approvals/:approvalId/history	GET	Get approval history	N/A	Full approval workflow history
UI Components Required
• Approval Queue Component: Virtualized list with type icons and urgency badges
• Detail Preview Panel Component: Resizable panel with entity-specific views
• Approval Action Bar Component: Sticky bar with approve/reject/request buttons
• Batch Selection Component: Checkbox selection with count indicator
• Rejection Modal Component: Modal with required reason dropdown and comments
• Delegation Modal Component: User selector with reason input
• Approval Stats Cards Component: Summary cards with counters
 
2.3 My Exceptions
Route: /tasks-approvals/my-work/my-exceptions
Page Goal
Display all exceptions and anomalies that require the user's attention, including reconciliation discrepancies, failed transactions, validation errors, and system-detected anomalies. Provide tools to investigate and resolve each exception.
Page Design
Layout: Exception list with severity-based color coding and detail panel
Header: Exception summary by severity (Critical, High, Medium, Low), Trend indicator
Filter Sidebar: Severity, Type, Date range, Status, Source module
Exception List: Cards showing exception type, severity, description, detected date, affected records
Detail Panel: Shows exception details, affected records, suggested resolution, related items
Actions: Investigate, Resolve, Dismiss, Escalate, Create Task
Resolution Workflow: Step-by-step guidance for resolving common exception types
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
View Details	Eye icon	View exception details	GET /api/exceptions/:id	Opens detail panel with full information
Investigate	Search icon	Start investigation	POST /api/exceptions/:id/investigate	Creates investigation record, logs activity
Resolve	Check icon	Mark as resolved	POST /api/exceptions/:id/resolve	Requires resolution notes, updates status
Dismiss	X icon	Dismiss exception	POST /api/exceptions/:id/dismiss	Requires reason, removes from active list
Escalate	AlertTriangle icon	Escalate to manager	POST /api/exceptions/:id/escalate	Notifies manager, creates task
Create Task	Plus icon	Create task from exception	POST /api/tasks	Pre-fills task with exception details
View Affected Records	List icon	View related records	GET /api/exceptions/:id/records	Shows all affected transactions
Export	Download icon	Export exceptions report	GET /api/exceptions/export	Downloads CSV/Excel report
Tables & Data Displays
Table Name	Columns	Data Source	Features
Exception List	ID, Type, Severity, Description, Detected Date, Status, Module	Exceptions API	Sortable by severity, filterable
Severity Summary	Count by severity level	Exceptions API	Click to filter by severity
Exception Details	Full description, Root cause, Suggested resolution, Audit trail	Exceptions API	Expandable sections
Affected Records	Record Type, ID, Reference, Amount, Date	Exceptions API	Click to navigate to record
Resolution History	Date, User, Action, Notes	Exceptions API	Timeline format
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/exceptions	GET	List exceptions	severity, type, status, module, from, to, page, limit	Paginated exception list
GET /api/exceptions/:exceptionId	GET	Get exception details	N/A	Full exception with affected records
POST /api/exceptions/:exceptionId/investigate	POST	Start investigation	notes	Investigation record created
POST /api/exceptions/:exceptionId/resolve	POST	Resolve exception	resolution, notes	Status updated, logged
POST /api/exceptions/:exceptionId/dismiss	POST	Dismiss exception	reason	Status updated, reason logged
POST /api/exceptions/:exceptionId/escalate	POST	Escalate exception	escalateToId, reason	Escalation notification sent
GET /api/exceptions/:exceptionId/records	GET	Get affected records	N/A	List of affected records
GET /api/exceptions/export	GET	Export exceptions	format, filters	File download
UI Components Required
• Exception Card Component: Card with severity badge, type icon, expandable details
• Severity Badge Component: Color-coded badge (Critical=Red, High=Orange, Medium=Yellow, Low=Blue)
• Exception Detail Panel Component: Slide-over panel with tabs for details, records, history
• Resolution Modal Component: Form with resolution type, notes, confirmation
• Escalation Modal Component: User selector with priority and reason fields
• Exception Timeline Component: Visual timeline of exception lifecycle
 
2.4 Overdue Items
Route: /tasks-approvals/my-work/overdue-items
Page Goal
Display all overdue items across all modules, including overdue invoices, bills, tasks, reconciliations, and filing deadlines. Provide consolidated view with quick actions to address each overdue item.
Page Design
Layout: Dashboard-style overview with category cards and detailed list
Header: Total overdue count, Total overdue amount, Trend comparison with last week
Category Cards: Overdue by type (AR, AP, Tasks, Reconciliations, Filings) with count and amount
Overdue List: Consolidated list of all overdue items with type-specific actions
Age Buckets: Items grouped by age (1-7 days, 8-30 days, 31-60 days, 60+ days)
Quick Actions: Context-aware actions based on item type (Send Reminder, Record Payment, Complete Task, etc.)
Alert Settings: Configuration for overdue alerts and escalation rules
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Send Reminder	Mail icon	Send payment reminder	POST /api/ar/invoices/:id/remind	Sends email reminder to customer
Record Payment	Dollar icon	Record payment received	N/A (Navigation)	Opens payment entry form
Mark Complete	Check icon	Mark task as complete	POST /api/tasks/:id/complete	Completes overdue task
Contact Vendor	Phone icon	View vendor contact info	GET /api/vendors/:id	Shows vendor contact details
Escalate	AlertTriangle icon	Escalate overdue item	POST /api/overdue/:id/escalate	Notifies manager
View Details	Eye icon	View item details	N/A (Navigation)	Navigates to entity detail page
Set Follow-up	Calendar icon	Schedule follow-up	POST /api/overdue/:id/follow-up	Creates follow-up task
Export Report	Download icon	Export overdue report	GET /api/overdue/export	Downloads detailed report
Tables & Data Displays
Table Name	Columns	Data Source	Features
Overdue Summary Cards	Type, Count, Total Amount, Oldest Date	Overdue API	Click to filter by type
Overdue Invoices	Invoice #, Customer, Amount, Due Date, Days Overdue	AR API	Actions: Remind, Payment, Write-off
Overdue Bills	Bill #, Vendor, Amount, Due Date, Days Overdue	AP API	Actions: Pay, Contact, Dispute
Overdue Tasks	Task, Assigned To, Due Date, Days Overdue, Priority	Tasks API	Actions: Complete, Reassign
Overdue Reconciliations	Account, Period, Status, Days Overdue	Banking API	Actions: Reconcile, Investigate
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/overdue	GET	Get all overdue items	type, age, sort, page, limit	Consolidated overdue list
GET /api/companies/:companyId/overdue/summary	GET	Get overdue summary	N/A	Counts and amounts by type
POST /api/ar/invoices/:invoiceId/remind	POST	Send reminder	template, customMessage	Reminder sent confirmation
POST /api/overdue/:itemId/escalate	POST	Escalate item	escalateToId, reason	Escalation notification sent
POST /api/overdue/:itemId/follow-up	POST	Set follow-up	date, notes	Follow-up task created
GET /api/overdue/export	GET	Export overdue report	format, type, age	File download
UI Components Required
• Overdue Summary Card Component: Card with count, amount, trend arrow
• Overdue List Component: Virtualized list with type-specific icons and actions
• Age Bucket Tabs Component: Tab navigation for age-based filtering
• Quick Action Menu Component: Context menu with type-specific actions
• Follow-up Modal Component: Date picker with notes input
• Reminder Modal Component: Template selector with custom message option
 
2.5 Team Tasks
Route: /tasks-approvals/management/team-tasks
Page Goal
Display and manage tasks assigned to all team members. Provide visibility into team workload, task distribution, and completion metrics. Enable managers to assign, reassign, and monitor team tasks.
Page Design
Layout: Kanban board view (default) and list view toggle, with team member filter
Header: Team summary stats (Total tasks, Completed this week, Average completion time, Bottlenecks)
View Toggle: Kanban Board (columns by status) | List View | Calendar View
Kanban Columns: To Do, In Progress, Review, Blocked, Done
Filter Bar: Team member, Task type, Priority, Due date, Project
Team Workload Panel: Shows task count and hours per team member
Task Cards: Assignee avatar, title, priority, due date, quick actions on hover
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Add Task	Plus icon	Create new task	N/A (Client state)	Opens task creation form
Assign Task	UserPlus icon	Assign to team member	POST /api/tasks	Creates task with assignee
Bulk Assign	Users icon	Assign multiple tasks	POST /api/tasks/bulk/assign	Batch assignment
Change View	Layout icon	Toggle view mode	N/A (Client state)	Switches between Kanban/List/Calendar
Filter by Member	Filter icon	Filter by team member	N/A (Client state)	Shows only tasks for selected member
Export	Download icon	Export team tasks	GET /api/tasks/export	Downloads CSV/Excel
View Workload	Chart icon	View workload distribution	GET /api/tasks/workload	Shows team workload chart
Reassign	Arrow icon	Reassign task	PUT /api/tasks/:id/assignee	Changes task assignee
Tables & Data Displays
Table Name	Columns	Data Source	Features
Task Board/Kanban	Status columns with task cards	Tasks API	Drag-and-drop between columns
Team Workload Chart	Member, Task Count, Hours, Capacity	Tasks API	Bar chart visualization
Task List	ID, Title, Assignee, Status, Priority, Due Date	Tasks API	Sortable, filterable
Calendar View	Due dates on calendar	Tasks API	Drag to reschedule
Team Members Panel	Member, Active Tasks, Completed, Overdue	Tasks API	Click to filter
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/tasks/team	GET	Get team tasks	assignee, status, priority, from, to, view, page, limit	Team task list/board
POST /api/tasks	POST	Create task	title, description, assigneeId, priority, dueDate, type	Created task
PUT /api/tasks/:taskId/assignee	PUT	Reassign task	assigneeId	Updated task
PUT /api/tasks/:taskId/status	PUT	Update status	status	Updated task (for drag-drop)
POST /api/tasks/bulk/assign	POST	Bulk assign	taskIds[], assigneeId	Assignment results
GET /api/tasks/workload	GET	Get workload data	period	Team workload metrics
GET /api/tasks/export	GET	Export team tasks	format, filters	File download
UI Components Required
• Kanban Board Component: Drag-and-drop board with status columns
• Task Card Component: Compact card with assignee avatar, priority badge
• Team Filter Component: Multi-select dropdown with team members
• Workload Chart Component: Bar chart showing task distribution
• Calendar View Component: Full calendar with task events
• Task Creation Modal Component: Form with assignee selector, priority, due date
• View Toggle Component: Segmented control for Kanban/List/Calendar
 
2.6 Approval Queue
Route: /tasks-approvals/management/approval-queue
Page Goal
Manage all pending approvals across the organization. View approval requests by type, manage approval workflows, and configure delegation rules. Available to users with approval management permissions.
Page Design
Layout: Dashboard overview with approval queue management
Header: Total pending approvals, Average approval time, Approval rate, Bottleneck alerts
Filter Bar: Approval type, Submitter, Amount range, Date submitted, Priority
Queue Management: Bulk approve/reject, Delegate approvals, Set approval limits
Workflow Configuration: Configure approval chains, thresholds, and escalation rules
Delegate Settings: Set up delegation rules for absences
Approval Analytics: Charts showing approval patterns, bottlenecks, and trends
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Approve All	CheckDouble icon	Approve all visible items	POST /api/approvals/bulk/approve	Batch approval with confirmation
Reject Selected	X icon	Reject selected items	POST /api/approvals/bulk/reject	Batch rejection with reason
Delegate	UserPlus icon	Delegate approvals	POST /api/approvals/delegate	Opens delegation settings
Configure Workflow	Settings icon	Configure approval rules	N/A (Navigation)	Opens workflow configuration
Set Auto-Approve	Zap icon	Configure auto-approval rules	POST /api/approvals/auto-approve	Sets threshold-based auto-approval
View Analytics	Chart icon	View approval analytics	GET /api/approvals/analytics	Shows approval trends
Export Report	Download icon	Export approval report	GET /api/approvals/export	Downloads detailed report
Tables & Data Displays
Table Name	Columns	Data Source	Features
Approval Summary Cards	Pending, Approved Today, Rejected, Avg Time	Approvals API	Real-time counters
Approval Queue List	ID, Type, Ref #, Amount, Submitter, Date, Priority	Approvals API	Multi-select, bulk actions
Workflow Rules Table	Type, Threshold, Approvers, Auto-approve	Settings API	Editable configuration
Delegation Rules	Approver, Delegate, From Date, To Date, Status	Settings API	CRUD operations
Approval Analytics	Charts: By Type, By Approver, Time Trends	Analytics API	Interactive charts
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/approvals/queue	GET	Get approval queue	type, submitter, amount, from, to, page, limit	Full approval queue
POST /api/approvals/bulk/approve	POST	Bulk approve	approvalIds[], comments	Approval results
POST /api/approvals/bulk/reject	POST	Bulk reject	approvalIds[], reason	Rejection results
POST /api/approvals/delegate	POST	Set delegation	delegateToId, fromDate, toDate, types[]	Delegation confirmation
GET /api/approvals/analytics	GET	Get analytics data	period	Approval metrics and trends
POST /api/approvals/auto-approve	POST	Configure auto-approval	type, threshold, conditions	Configuration saved
GET /api/approvals/export	GET	Export approvals	format, filters	File download
UI Components Required
• Approval Queue Table Component: DataTable with multi-select and bulk actions
• Workflow Configuration Component: Form for setting approval rules
• Delegation Settings Component: Form with date range and type selectors
• Approval Analytics Component: Chart dashboard with filters
• Bulk Action Confirmation Modal: Modal with action summary and confirmation
 
SECTION 3: ORGANIZATION MODULE
3.1 Legal Entities
Route: /organization/entity-structure/legal-entities
Page Goal
Manage all legal entities within the workspace. Create, edit, and configure legal entities with their tax information, registration details, and intercompany relationships. This is the foundation for multi-entity accounting.
Page Design
Layout: Card grid view (default) and list view toggle
Header: Entity count, Primary entity indicator, Multi-entity status
Entity Cards: Logo/initials, Name, Tax ID, Registration #, Base currency, Status (Active/Inactive)
Quick Actions on Card: View details, Edit, Set as primary, Deactivate
Filter Bar: Status, Country, Currency, Entity type
Detail View: Full entity information with tabs for Details, Tax Settings, Addresses, Users, Intercompany
Entity Creation Wizard: Multi-step form for creating new entities
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Add Entity	Plus icon	Create new legal entity	POST /api/entities	Opens entity creation wizard
Edit Entity	Pencil icon	Edit entity details	PUT /api/entities/:id	Opens edit form
Set Primary	Star icon	Set as primary entity	PUT /api/entities/:id/primary	Updates primary entity flag
Deactivate	Toggle icon	Deactivate entity	PUT /api/entities/:id/status	Sets status to inactive
View Details	Eye icon	View full entity details	GET /api/entities/:id	Opens detail modal/page
Manage Users	Users icon	Manage entity users	GET /api/entities/:id/users	Opens user management
Configure Tax	FileText icon	Configure tax settings	GET /api/entities/:id/tax	Opens tax configuration
Export	Download icon	Export entity data	GET /api/entities/export	Downloads entity list
Tables & Data Displays
Table Name	Columns	Data Source	Features
Entity List/Grid	Name, Tax ID, Reg #, Currency, Country, Status, Primary Flag	Entities API	Card or list view
Entity Details	Full profile: Name, Addresses, Tax info, Registration, Contacts	Entities API	Tabbed interface
Tax Configuration	TIN, VAT Reg, Tax Type, Filing Frequency	Entities API	Country-specific fields
Assigned Users	User, Role, Permissions, Access Level	Entities API	Editable permissions
Intercompany Relations	Related Entity, Relationship Type, Transactions	IC API	Link to IC transactions
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/workspaces/:workspaceId/entities	GET	List entities	status, country, currency, page, limit	Entity list
GET /api/entities/:entityId	GET	Get entity details	N/A	Full entity profile
POST /api/entities	POST	Create entity	name, taxId, regNumber, currency, country, addresses, taxConfig	Created entity
PUT /api/entities/:entityId	PUT	Update entity	fields to update	Updated entity
PUT /api/entities/:entityId/primary	PUT	Set primary	N/A	Primary updated confirmation
PUT /api/entities/:entityId/status	PUT	Update status	status	Status updated confirmation
GET /api/entities/:entityId/users	GET	Get entity users	N/A	User list with permissions
GET /api/entities/:entityId/tax	GET	Get tax settings	N/A	Tax configuration
UI Components Required
• Entity Card Component: Card with logo placeholder, name, key details, action menu
• Entity Creation Wizard Component: Multi-step form with validation
• Entity Detail Tabs Component: Tabbed interface for different information sections
• Tax Configuration Form Component: Country-specific tax form fields
• Address Form Component: Multi-address form with type selector
• User Permission Matrix Component: Role and permission assignment grid
 
3.2 Intercompany Transactions
Route: /organization/entity-structure/intercompany
Page Goal
Manage intercompany transactions between related entities. Record, track, and reconcile transactions between entities including loans, transfers, sales, and purchases. Maintain proper intercompany accounting and elimination entries.
Page Design
Layout: Transaction list with summary dashboard at top
Header: Outstanding IC balance, Due to/from related entities, Unreconciled items count
Summary Dashboard: Cards showing balances by entity, aging of IC items, reconciliation status
Filter Bar: Entity (from/to), Transaction type, Status, Date range, Amount range
Transaction List: Date, Type, From Entity, To Entity, Description, Amount, Status, Actions
Quick Actions: New IC Transaction, Reconcile, Generate Elimination Entries, IC Statement
IC Types: Loan, Transfer, Sale, Purchase, Service Fee, Management Fee, Dividend
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
New IC Transaction	Plus icon	Create IC transaction	POST /api/intercompany	Opens IC transaction form
Reconcile	Refresh icon	Reconcile IC items	POST /api/intercompany/reconcile	Matches IC entries
Generate Eliminations	Zap icon	Create elimination entries	POST /api/intercompany/eliminations	Generates consolidated JE
IC Statement	FileText icon	Generate IC statement	GET /api/intercompany/statement	Opens statement report
View Details	Eye icon	View transaction details	GET /api/intercompany/:id	Opens detail modal
Reverse	Undo icon	Reverse transaction	POST /api/intercompany/:id/reverse	Creates reversing entries
Match	Link icon	Match IC entries	POST /api/intercompany/match	Links related entries
Export	Download icon	Export IC report	GET /api/intercompany/export	Downloads report file
Tables & Data Displays
Table Name	Columns	Data Source	Features
IC Summary Cards	Entity, Due To, Due From, Net Balance, Status	IC API	Click to drill down
IC Transaction List	Date, Type, From Entity, To Entity, Ref, Amount, Balance, Status	IC API	Sortable, filterable
Unmatched Items	Item, Entity, Amount, Date, Potential Match	IC API	Manual matching interface
Elimination Entries	Period, Entities, Entries, Status	IC API	Auto-generated consolidations
IC Aging	Entity, Current, 1-30, 31-60, 60+, Total	IC API	Aging by entity
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/intercompany	GET	List IC transactions	entity, type, status, from, to, page, limit	IC transaction list
GET /api/intercompany/:transactionId	GET	Get IC details	N/A	Full IC transaction
POST /api/intercompany	POST	Create IC transaction	type, fromEntityId, toEntityId, amount, description, date	Created IC entries
POST /api/intercompany/reconcile	POST	Reconcile IC items	itemIds[]	Reconciliation results
POST /api/intercompany/eliminations	POST	Generate eliminations	period, entities[]	Elimination entries created
POST /api/intercompany/:id/reverse	POST	Reverse IC transaction	reason	Reversing entries
GET /api/intercompany/statement	GET	Get IC statement	entityId, from, to	Statement data
GET /api/intercompany/export	GET	Export IC data	format, filters	File download
UI Components Required
• IC Transaction Form Component: Form with entity selectors, type, amount fields
• IC Balance Card Component: Card showing entity pair balance
• Matching Interface Component: Side-by-side comparison for manual matching
• Elimination Preview Component: Preview of elimination entries before posting
• IC Statement Component: Statement report with entity details
• IC Aging Table Component: Aging breakdown by entity
 
3.3 Locations & Divisions
Route: /organization/operational-structure/locations-divisions
Page Goal
Manage business locations and divisions for reporting and operational purposes. Create hierarchical structures, assign addresses, and configure location-specific settings. Enable location-based reporting and transaction filtering.
Page Design
Layout: Tree view for hierarchy and card/list view for details
Header: Total locations, Total divisions, Active/Inactive count
View Toggle: Tree View (hierarchical) | List View (flat) | Map View (geographic)
Tree Structure: Expandable tree showing parent-child relationships
Location/Division Cards: Name, Type, Address (for locations), Manager, Status, Employee count
Quick Actions: Add Location, Add Division, Edit, Assign Manager, Deactivate
Filter Bar: Type, Status, Country/Region, Manager
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Add Location	Building icon	Create new location	POST /api/locations	Opens location form
Add Division	Folder icon	Create new division	POST /api/divisions	Opens division form
Edit	Pencil icon	Edit location/division	PUT /api/locations/:id or /api/divisions/:id	Opens edit form
Assign Manager	User icon	Assign manager	PUT /api/locations/:id/manager	Opens user selector
View Hierarchy	Tree icon	View full hierarchy	N/A (Client state)	Expands tree view
Deactivate	Toggle icon	Deactivate item	PUT /api/locations/:id/status	Sets status to inactive
View Transactions	List icon	View related transactions	GET /api/transactions?location=:id	Shows filtered transactions
Export	Download icon	Export locations data	GET /api/locations/export	Downloads file
Tables & Data Displays
Table Name	Columns	Data Source	Features
Hierarchy Tree	Name, Type, Manager, Status, Children count	Locations API	Expandable tree nodes
Location List	Name, Type, Address, Manager, Employees, Status	Locations API	Card or list view
Division List	Name, Parent, Manager, Employees, Budget, Status	Divisions API	Card or list view
Location Details	Full profile with address, contacts, settings, employees	Locations API	Tabbed interface
Transaction Summary	Location, Revenue, Expenses, Headcount	Reporting API	By location metrics
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/locations	GET	List locations	type, status, manager, page, limit	Location list
GET /api/companies/:companyId/divisions	GET	List divisions	status, manager, page, limit	Division list
GET /api/locations/:locationId	GET	Get location details	N/A	Full location profile
POST /api/locations	POST	Create location	name, type, address, managerId, parentId	Created location
POST /api/divisions	POST	Create division	name, managerId, parentId	Created division
PUT /api/locations/:locationId	PUT	Update location	fields to update	Updated location
PUT /api/locations/:locationId/manager	PUT	Assign manager	managerId	Manager assigned
PUT /api/locations/:locationId/status	PUT	Update status	status	Status updated
GET /api/locations/export	GET	Export locations	format	File download
UI Components Required
• Hierarchy Tree Component: Expandable tree with drag-and-drop reordering
• Location Card Component: Card with address, manager, employee count
• Division Card Component: Card with parent relationship, budget info
• Location Form Component: Form with address, contacts, settings
• Map View Component: Geographic map with location markers
• Manager Assignment Modal: User selector with search
 
3.4 Departments
Route: /organization/operational-structure/departments
Page Goal
Manage organizational departments for reporting, budgeting, and expense allocation. Create departmental structures, assign managers, track department budgets, and analyze departmental performance.
Page Design
Layout: Card grid view with hierarchy indicators
Header: Total departments, Departments over budget, Average utilization
Department Cards: Name, Manager, Employee count, Budget, Actual spend, Utilization %
Budget Indicator: Color-coded bar showing budget utilization (green/yellow/red)
Quick Actions: Add Department, Edit, Assign Manager, Set Budget, View Details
Filter Bar: Manager, Budget status, Cost center, Division
Department Details: Employees, Budget vs Actual, Transactions, Projects
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Add Department	Plus icon	Create new department	POST /api/departments	Opens department form
Edit	Pencil icon	Edit department	PUT /api/departments/:id	Opens edit form
Assign Manager	User icon	Assign department manager	PUT /api/departments/:id/manager	Opens user selector
Set Budget	Dollar icon	Configure budget	POST /api/departments/:id/budget	Opens budget form
View Details	Eye icon	View department details	GET /api/departments/:id	Opens detail page
View Employees	Users icon	View department employees	GET /api/departments/:id/employees	Shows employee list
View Transactions	List icon	View department transactions	GET /api/transactions?department=:id	Filtered transaction list
Export	Download icon	Export department data	GET /api/departments/export	Downloads file
Tables & Data Displays
Table Name	Columns	Data Source	Features
Department List	Name, Manager, Employees, Budget, Actual, Variance, Status	Departments API	Card or list view
Budget Summary	Department, Annual Budget, YTD Actual, Remaining, Utilization %	Departments API	Progress bars
Employee Distribution	Department, Employee Count, Full-time, Part-time, Contractors	HR API	Bar chart
Department Details	Profile, Budget, Employees, Transactions, Projects	Departments API	Tabbed interface
Cost Center Mapping	Department, Cost Center Code, GL Accounts	Accounting API	Editable mapping
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/departments	GET	List departments	manager, budgetStatus, page, limit	Department list
GET /api/departments/:departmentId	GET	Get department details	N/A	Full department profile
POST /api/departments	POST	Create department	name, managerId, costCenter, parentId, budget	Created department
PUT /api/departments/:departmentId	PUT	Update department	fields to update	Updated department
PUT /api/departments/:departmentId/manager	PUT	Assign manager	managerId	Manager assigned
POST /api/departments/:departmentId/budget	POST	Set budget	annualAmount, monthly, notes	Budget saved
GET /api/departments/:departmentId/employees	GET	Get department employees	N/A	Employee list
GET /api/departments/export	GET	Export departments	format	File download
UI Components Required
• Department Card Component: Card with budget bar, employee count, manager
• Budget Progress Bar Component: Visual budget utilization indicator
• Department Form Component: Form with manager selector, cost center, budget
• Budget Configuration Modal: Annual and monthly budget allocation
• Department Details Component: Tabbed interface with budget, employees, transactions
• Cost Center Mapping Component: GL account assignment interface
 
3.5 Filing Calendar
Route: /organization/governance/filing-calendar
Page Goal
Manage all statutory filing deadlines and compliance dates. Track filing requirements, deadlines, responsible parties, and filing status. Generate reminders and alerts for upcoming deadlines to ensure timely compliance.
Page Design
Layout: Calendar view (default) and list view toggle
Header: Upcoming filings (next 30 days), Overdue filings, Completed this month
Calendar View: Month view with filing deadlines as events, color-coded by type and urgency
List View: Sortable list of all filings with filters
Event Types: Tax filings, Regulatory submissions, Annual reports, Permit renewals, Government forms
Filing Cards: Name, Type, Due Date, Status, Responsible Party, Entity, Frequency
Quick Actions: Add Filing, Mark Complete, Reschedule, Assign, View Details
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Add Filing	Plus icon	Create filing entry	POST /api/filings	Opens filing form
Mark Complete	Check icon	Mark filing as complete	POST /api/filings/:id/complete	Updates status, logs completion
Reschedule	Calendar icon	Reschedule filing	PUT /api/filings/:id/due-date	Opens date picker
Assign	User icon	Assign responsible party	PUT /api/filings/:id/assignee	Opens user selector
Set Reminder	Bell icon	Configure reminders	POST /api/filings/:id/reminders	Opens reminder settings
View Details	Eye icon	View filing details	GET /api/filings/:id	Opens detail modal
Generate Report	FileText icon	Generate filing status report	GET /api/filings/report	Opens report preview
Export	Download icon	Export filing calendar	GET /api/filings/export	Downloads ICS/CSV
Tables & Data Displays
Table Name	Columns	Data Source	Features
Calendar View	Monthly calendar with filing events	Filings API	Drag to reschedule
Filing List	Name, Type, Due Date, Entity, Status, Assignee, Frequency	Filings API	Sortable, filterable
Upcoming Filings	Name, Due Date, Days Until, Status, Assignee	Filings API	Priority sorted
Overdue Filings	Name, Due Date, Days Overdue, Assignee, Entity	Filings API	Requires immediate attention
Filing Details	Full info, History, Attachments, Related items	Filings API	Complete profile
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/filings	GET	List filings	status, type, entity, from, to, page, limit	Filing list
GET /api/filings/:filingId	GET	Get filing details	N/A	Full filing information
POST /api/filings	POST	Create filing	name, type, dueDate, entityId, assigneeId, frequency, description	Created filing
PUT /api/filings/:filingId	PUT	Update filing	fields to update	Updated filing
POST /api/filings/:filingId/complete	POST	Complete filing	filedDate, reference, notes, attachments	Completion confirmed
PUT /api/filings/:filingId/due-date	PUT	Reschedule filing	newDueDate, reason	Date updated
PUT /api/filings/:filingId/assignee	PUT	Assign filing	assigneeId	Assignee updated
POST /api/filings/:filingId/reminders	POST	Set reminders	days[], channels[]	Reminders configured
GET /api/filings/export	GET	Export filings	format, filters	File download (ICS/CSV)
UI Components Required
• Calendar Component: Full calendar view with event rendering
• Filing Event Component: Calendar event with type icon, status indicator
• Filing Form Component: Form with type selector, entity, frequency, assignee
• Reminder Configuration Component: Multi-select for days and notification channels
• Filing Status Badge Component: Color-coded status indicator
• Overdue Alert Component: Prominent alert for overdue items
 
3.6 Document Storage
Route: /organization/governance/document-storage
Page Goal
Centralized document management system for storing, organizing, and retrieving business documents. Support for categorization, versioning, access control, and document search. Integration with transactions and entities for document linking.
Page Design
Layout: Folder tree on left, document list on right
Header: Storage used, Document count, Recent uploads, Shared with me
Folder Structure: Hierarchical folder tree with expandable nodes
Document List: Grid view (thumbnails) and list view toggle
Document Cards: Thumbnail/icon, Name, Type, Size, Modified date, Owner, Tags
Quick Actions: Upload, New Folder, Share, Download, Delete, Move
Search Bar: Full-text search with filters (type, date, owner, tags)
Document Preview: In-browser preview for common file types
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Upload	Upload icon	Upload documents	POST /api/documents/upload	Opens file picker with drag-drop
New Folder	FolderPlus icon	Create new folder	POST /api/documents/folders	Opens folder name input
Download	Download icon	Download document	GET /api/documents/:id/download	Downloads file
Share	Share icon	Share document/folder	POST /api/documents/:id/share	Opens sharing settings
Delete	Trash icon	Delete document	DELETE /api/documents/:id	Confirms and moves to trash
Move	Move icon	Move to folder	PUT /api/documents/:id/folder	Opens folder selector
Preview	Eye icon	Preview document	GET /api/documents/:id/preview	Opens preview modal
Version History	History icon	View version history	GET /api/documents/:id/versions	Shows all versions
Tables & Data Displays
Table Name	Columns	Data Source	Features
Folder Tree	Folder name, Document count, Subfolders	Documents API	Expandable tree
Document List	Name, Type, Size, Modified, Owner, Tags, Actions	Documents API	Grid or list view
Storage Summary	Used space, Available space, By type breakdown	Documents API	Progress bar
Shared Documents	Name, Shared by, Shared with, Permission, Date	Documents API	Filterable list
Version History	Version, Modified by, Date, Size, Changes	Documents API	Download previous versions
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/documents	GET	List documents	folder, type, search, page, limit	Document list
GET /api/documents/:documentId	GET	Get document details	N/A	Full document info
POST /api/documents/upload	POST	Upload document	file, folderId, name, tags[], relatedEntity	Uploaded document
POST /api/documents/folders	POST	Create folder	name, parentId	Created folder
PUT /api/documents/:documentId	PUT	Update document	name, tags[], folderId	Updated document
DELETE /api/documents/:documentId	DELETE	Delete document	N/A	Soft delete confirmation
POST /api/documents/:documentId/share	POST	Share document	userIds[], permission	Share confirmation
GET /api/documents/:documentId/versions	GET	Get versions	N/A	Version history
GET /api/documents/:documentId/download	GET	Download document	version?	File download
UI Components Required
• Folder Tree Component: Expandable tree with context menu
• Document Grid Component: Grid of document cards with thumbnails
• Document List Component: Table view with sorting and filtering
• File Upload Component: Drag-drop zone with progress indicator
• Document Preview Component: In-browser preview for images, PDFs, Office docs
• Sharing Modal Component: User/group selector with permission levels
• Version History Component: Timeline of document versions


HAYPBOOKS
Page101 Documentation Series
Part 10: Reporting & Analytics, Compliance, and Automation
Comprehensive Page Specifications for Implementation
Version 1.0 | 2026-03-08
 
Table of Contents


Note: Right-click the Table of Contents and select 'Update Field' to refresh page numbers.
 
 
SECTION 1: REPORTING & ANALYTICS MODULE
1.1 Financial Statements
Route: /reporting/financial-statements
Page Goal
Generate and view core financial statements including Balance Sheet, Profit & Loss Statement, Cash Flow Statement, and Statement of Changes in Equity. Provide comparative analysis, drill-down capabilities, and export options for stakeholder reporting.
Page Design
Layout: Statement selector at top, statement view below with period controls
Header: Company name, Statement type, As-of date/Period, Comparison options
Statement Tabs: Balance Sheet | Profit & Loss | Cash Flow | Changes in Equity
Period Selector: Single period, Comparative (Prior Period, Prior Year, Budget), Custom range
Statement View: Hierarchical display with expandable sections, subtotals, totals
Drill-down: Click any line item to see underlying transactions
Export Options: PDF, Excel, Word with formatting options
Save as Template: Save current view configuration for reuse
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Refresh	Refresh icon	Refresh statement data	GET /api/reporting/statements	Fetches latest data
Export PDF	FileText icon	Export to PDF	GET /api/reporting/statements/export?format=pdf	Downloads formatted PDF
Export Excel	Table icon	Export to Excel	GET /api/reporting/statements/export?format=xlsx	Downloads Excel file
Compare Periods	Columns icon	Add comparison column	N/A (Client state)	Shows period selector
Drill Down	ZoomIn icon	View transaction details	GET /api/reporting/drilldown	Opens transaction list
Save View	Save icon	Save current configuration	POST /api/reporting/views	Saves view settings
Print	Print icon	Print statement	N/A (Client)	Opens print dialog
Share	Share icon	Share with team	POST /api/reporting/share	Opens sharing modal
Tables & Data Displays
Table Name	Columns	Data Source	Features
Balance Sheet	Assets, Liabilities, Equity sections with subtotals	Reporting API	Expandable, drill-down enabled
Profit & Loss	Revenue, COGS, Expenses, Other Income, Net Income	Reporting API	Monthly/YTD toggle
Cash Flow	Operating, Investing, Financing activities	Reporting API	Direct/Indirect method
Changes in Equity	Opening balance, Changes, Closing balance by equity type	Reporting API	Period movement detail
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/reporting/balance-sheet	GET	Get Balance Sheet	asOf, comparison, includeZeroBalances	Hierarchical balance sheet data
GET /api/companies/:companyId/reporting/profit-loss	GET	Get P&L Statement	from, to, comparison, includeBudget	P&L with comparisons
GET /api/companies/:companyId/reporting/cash-flow	GET	Get Cash Flow	from, to, method	Cash flow statement
GET /api/companies/:companyId/reporting/equity-changes	GET	Get Equity Changes	from, to	Equity movement statement
GET /api/reporting/drilldown	GET	Drill down on line item	accountId, from, to	Underlying transactions
GET /api/reporting/statements/export	GET	Export statement	type, format, params	File download
POST /api/reporting/views	POST	Save view configuration	name, settings	Saved view confirmation
UI Components Required
• Statement Viewer Component: Hierarchical expandable view
• Period Selector Component: Date range picker with presets
• Comparison Selector Component: Multi-select for comparison types
• Drill-down Modal Component: Transaction list from line item
• Export Configuration Modal: Format and layout options
• Statement Header Component: Company info, date, currency display
 
1.2 Standard Reports
Route: /reporting/standard-reports
Page Goal
Access a library of pre-built accounting and business reports. Browse categories, run reports with parameters, schedule reports, and manage saved report configurations. Reports cover AR, AP, Inventory, GL, Tax, and operational metrics.
Page Design
Layout: Report categories on left sidebar, report center on right
Categories: Financial, AR, AP, Inventory, Payroll, Tax, Operational, Custom
Report Cards: Name, Description, Last run date, Schedule indicator
Search Bar: Search reports by name or keyword
Filter: By category, frequency, tags
Quick Actions: Run Now, Schedule, Edit Parameters, View History, Favorite
Report Runner: Modal for setting parameters before running
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Run Report	Play icon	Execute report with parameters	POST /api/reports/:id/run	Generates report output
Schedule	Clock icon	Set up recurring schedule	POST /api/reports/:id/schedule	Opens schedule configuration
View History	History icon	View past runs	GET /api/reports/:id/history	Shows execution history
Add to Favorites	Star icon	Mark as favorite	POST /api/reports/:id/favorite	Adds to favorites list
Export	Download icon	Export report	GET /api/reports/:id/export	Downloads in selected format
Share	Share icon	Share report with users	POST /api/reports/:id/share	Opens sharing modal
Customize	Settings icon	Customize report layout	PUT /api/reports/:id/settings	Opens customization
New Custom Report	Plus icon	Create custom report	N/A (Navigation)	Opens report builder
Tables & Data Displays
Table Name	Columns	Data Source	Features
Report Library	Name, Category, Description, Last Run, Schedule, Favorite	Reports API	Searchable, filterable
Report Categories	Category, Report Count, Description	Reports API	Expandable sections
Report Parameters	Parameter name, Type, Default, Required	Reports API	Dynamic form generation
Execution History	Date, Run by, Parameters, Duration, Status, Download	Reports API	Sortable, filterable
Scheduled Reports	Report, Schedule, Next Run, Recipients, Status	Reports API	CRUD operations
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/reports	GET	List available reports	category, search, page, limit	Report list
GET /api/reports/:reportId	GET	Get report details	N/A	Report metadata and parameters
POST /api/reports/:reportId/run	POST	Run report	parameters, format	Report output data
GET /api/reports/:reportId/history	GET	Get run history	page, limit	Execution history
POST /api/reports/:reportId/schedule	POST	Schedule report	frequency, recipients[], parameters{}	Schedule confirmation
PUT /api/reports/:reportId/settings	PUT	Update settings	layout, columns, filters	Settings updated
POST /api/reports/:reportId/favorite	POST	Toggle favorite	N/A	Favorite status
GET /api/reports/:reportId/export	GET	Export report	format, executionId	File download
UI Components Required
• Report Card Component: Card with name, description, quick actions
• Report Parameter Form Component: Dynamic form based on report definition
• Report Output Viewer Component: Tabular/graphical report display
• Schedule Configuration Component: Cron expression builder with presets
• Report History Table Component: History with re-run capability
• Category Sidebar Component: Collapsible category navigation
 
1.3 Custom Reports
Route: /reporting/custom-reports
Page Goal
Create and manage custom reports using a visual report builder. Define data sources, columns, filters, groupings, and visualizations without SQL knowledge. Save and share custom reports with team members.
Page Design
Layout: Report builder interface with drag-and-drop functionality
Left Panel: Data sources (Tables) and available fields
Center Panel: Report canvas showing columns, filters, and preview
Right Panel: Properties panel for selected elements
Data Sources: Accounts, Transactions, Customers, Vendors, Items, Employees, etc.
Report Elements: Columns, Calculated Fields, Filters, Sort, Group By, Charts
Preview Mode: Live preview of report output
Save Options: Save as new, Update existing, Save as template
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Add Data Source	Database icon	Select data source	N/A (Client state)	Opens data source picker
Add Column	Plus icon	Add column to report	N/A (Client state)	Field selector appears
Add Filter	Filter icon	Add filter criteria	N/A (Client state)	Filter builder opens
Add Grouping	Layers icon	Group results	N/A (Client state)	Grouping options appear
Add Chart	Chart icon	Add visualization	N/A (Client state)	Chart configuration opens
Preview	Eye icon	Preview report output	POST /api/reports/preview	Shows sample output
Save	Save icon	Save report definition	POST /api/reports/custom	Saves report
Run	Play icon	Run and view report	POST /api/reports/custom/:id/run	Generates output
Tables & Data Displays
Table Name	Columns	Data Source	Features
Data Source Panel	Available tables with fields	Schema API	Draggable field items
Column Configuration	Field, Alias, Format, Sort, Width	N/A (Client)	Editable properties
Filter Builder	Field, Operator, Value, And/Or logic	N/A (Client)	Dynamic filter rows
Report Preview	Paginated preview with sample data	Reports API	Real-time updates
Chart Configuration	Type, X-axis, Y-axis, Series, Colors	N/A (Client)	Visual customization
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/reports/schema	GET	Get data schema	N/A	Available tables and fields
POST /api/reports/custom	POST	Create custom report	name, description, definition{}	Created report
PUT /api/reports/custom/:reportId	PUT	Update custom report	fields to update	Updated report
GET /api/reports/custom/:reportId	GET	Get report definition	N/A	Full report configuration
POST /api/reports/custom/:reportId/run	POST	Run custom report	parameters{}	Report output
POST /api/reports/preview	POST	Preview report	definition{}	Sample output
DELETE /api/reports/custom/:reportId	DELETE	Delete custom report	N/A	Deletion confirmation
UI Components Required
• Data Source Selector Component: Tree view of available data
• Field Selector Component: Searchable, draggable field list
• Column Builder Component: Drag-drop column arrangement
• Filter Builder Component: Dynamic filter row management
• Chart Builder Component: Chart type selector with configuration
• Report Preview Component: Paginated preview with refresh
• Property Panel Component: Context-aware property editor
 
1.4 Performance Center
Route: /reporting/performance-center
Page Goal
Advanced analytics dashboard providing KPI tracking, trend analysis, benchmarking, and performance insights. Configure custom KPIs, set targets, and monitor business performance with interactive visualizations.
Page Design
Layout: KPI dashboard with customizable widgets
Header: Period selector, Comparison options, Refresh interval
KPI Widgets: Large metric cards with trend indicators, sparklines, and targets
Chart Widgets: Various chart types for trend analysis
Scorecard View: Tabular KPI comparison with status indicators
Alert Badges: KPIs outside target thresholds
Configuration: Add/remove widgets, resize, rearrange via drag-drop
Export: Export dashboard as PDF or image
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Add Widget	Plus icon	Add KPI widget	N/A (Client state)	Opens widget gallery
Configure Widget	Settings icon	Edit widget settings	N/A (Client state)	Opens configuration modal
Set Target	Target icon	Set KPI target	POST /api/kpis/:id/target	Opens target form
View Trend	TrendingUp icon	View detailed trend	GET /api/kpis/:id/trend	Opens trend modal
Compare	GitCompare icon	Compare periods	GET /api/kpis/:id/compare	Side-by-side view
Export Dashboard	Download icon	Export as PDF	GET /api/dashboard/export	Downloads PDF
Share	Share icon	Share dashboard	POST /api/dashboard/share	Opens sharing modal
Reset Layout	RefreshCw icon	Reset to default	N/A (Client state)	Resets widget positions
Tables & Data Displays
Table Name	Columns	Data Source	Features
KPI Cards	Metric, Value, Change %, Target, Status, Trend	KPI API	Configurable widgets
Trend Charts	Time series with moving average	KPI API	Interactive tooltips
Scorecard Table	KPI, Actual, Target, Variance, Status, Trend	KPI API	Conditional formatting
Benchmark Comparison	KPI, Company, Industry, Percentile	KPI API	External benchmark data
Alert List	KPI, Alert, Threshold, Current, Triggered Date	KPI API	Priority sorted
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/kpis	GET	Get KPI values	period, includeTargets	All KPIs with values
GET /api/kpis/:kpiId/trend	GET	Get KPI trend	months, granularity	Time series data
POST /api/kpis/:kpiId/target	POST	Set target	value, period, alertThreshold	Target configuration
GET /api/kpis/:kpiId/compare	GET	Compare periods	periods[]	Comparison data
GET /api/kpis/benchmarks	GET	Get industry benchmarks	industry, region	Benchmark data
GET /api/dashboard/export	GET	Export dashboard	format	File download
POST /api/dashboard/share	POST	Share dashboard	userIds[], permissions	Share confirmation
UI Components Required
• KPI Widget Component: Metric card with trend sparkline
• Chart Widget Component: Various chart types (line, bar, pie, gauge)
• Scorecard Component: Tabular KPI view with conditional formatting
• Target Configuration Modal: Form for setting targets and alerts
• Trend Analysis Modal: Detailed trend with annotations
• Widget Gallery Component: Selectable widget templates
• Dashboard Grid Component: Drag-drop grid layout
 
SECTION 2: COMPLIANCE MODULE (ENTERPRISE)
2.1 Internal Controls
Route: /compliance/controls/internal-controls
Page Goal
Define and manage internal control procedures and policies. Document control objectives, control activities, testing procedures, and responsible parties. Track control effectiveness and compliance status.
Page Design
Layout: Control library with categorization and status tracking
Header: Control counts by status, Category filter, Search
Control Categories: Financial Reporting, Operations, Compliance, IT General Controls
Control Cards: Name, Category, Type (Preventive/Detective), Status, Last Test Date
Quick Actions: Add Control, Test, View Details, Assign Owner, View History
Filter Bar: Category, Status, Type, Owner, Risk Level
Control Details: Objective, Description, Control Activities, Testing Procedures, Evidence Required
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Add Control	Plus icon	Create new control	POST /api/controls	Opens control form
Edit Control	Pencil icon	Edit control details	PUT /api/controls/:id	Opens edit form
Test Control	CheckSquare icon	Record test result	POST /api/controls/:id/test	Opens test form
Assign Owner	User icon	Assign control owner	PUT /api/controls/:id/owner	Opens user selector
View History	History icon	View control history	GET /api/controls/:id/history	Shows audit trail
Export	Download icon	Export controls	GET /api/controls/export	Downloads report
View Evidence	Paperclip icon	View attached evidence	GET /api/controls/:id/evidence	Shows evidence files
Assess Risk	AlertTriangle icon	Risk assessment	POST /api/controls/:id/risk	Opens risk form
Tables & Data Displays
Table Name	Columns	Data Source	Features
Control Library	Name, Category, Type, Status, Owner, Last Test, Risk	Controls API	Sortable, filterable
Control Details	Full control documentation	Controls API	Tabbed interface
Test Results	Date, Tester, Result, Issues, Evidence	Controls API	Timeline format
Risk Assessment	Risk Level, Likelihood, Impact, Mitigation	Controls API	Matrix view
Evidence Files	Name, Type, Upload Date, Uploader	Controls API	Document list
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/controls	GET	List controls	category, status, type, owner, page, limit	Control list
GET /api/controls/:controlId	GET	Get control details	N/A	Full control info
POST /api/controls	POST	Create control	name, category, type, objective, activities, procedures, owner	Created control
PUT /api/controls/:controlId	PUT	Update control	fields to update	Updated control
POST /api/controls/:controlId/test	POST	Record test	result, findings, evidence[]	Test record created
PUT /api/controls/:controlId/owner	PUT	Assign owner	ownerId	Owner updated
POST /api/controls/:controlId/risk	POST	Risk assessment	level, likelihood, impact, notes	Risk recorded
GET /api/controls/export	GET	Export controls	format, filters	File download
UI Components Required
• Control Card Component: Card with status badge and category icon
• Control Form Component: Multi-tab form for control documentation
• Test Result Form Component: Form for recording test results
• Risk Matrix Component: Visual risk assessment matrix
• Evidence Upload Component: File upload with categorization
• Control History Timeline Component: Audit trail visualization
 
2.2 Control Testing
Route: /compliance/controls/control-testing
Page Goal
Plan and execute control testing programs. Schedule tests, document test procedures, record results, and track remediation of identified issues. Manage testing cycles and maintain evidence of control effectiveness.
Page Design
Layout: Testing dashboard with schedule and results
Header: Tests due this period, Completion rate, Open issues, Overdue tests
Testing Schedule: Calendar or list view of planned tests
Test Cards: Control, Test Type, Scheduled Date, Status, Tester, Result
Quick Actions: Schedule Test, Record Result, View Details, Reassign
Filter Bar: Status, Period, Tester, Control Category, Result
Issue Tracking: Issues identified during testing with remediation status
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Schedule Test	Calendar icon	Schedule new test	POST /api/tests	Opens scheduling form
Record Result	Clipboard icon	Record test result	POST /api/tests/:id/result	Opens result form
View Details	Eye icon	View test details	GET /api/tests/:id	Opens detail modal
Reassign	UserPlus icon	Reassign tester	PUT /api/tests/:id/tester	Opens user selector
Create Issue	AlertCircle icon	Log issue from test	POST /api/issues	Opens issue form
View Evidence	Paperclip icon	View test evidence	GET /api/tests/:id/evidence	Shows evidence files
Export Report	Download icon	Export testing report	GET /api/tests/export	Downloads report
Bulk Update	CheckSquare icon	Bulk update tests	PUT /api/tests/bulk	Opens bulk edit
Tables & Data Displays
Table Name	Columns	Data Source	Features
Testing Schedule	Control, Test Type, Scheduled Date, Tester, Status	Tests API	Calendar/list view
Test Results	Test, Control, Result, Issues Found, Evidence, Date	Tests API	Sortable, filterable
Issue Tracker	Issue, Control, Severity, Status, Owner, Due Date	Issues API	Remediation tracking
Testing Metrics	Period, Planned, Completed, Passed, Failed, Issues	Tests API	Dashboard cards
Evidence Repository	Test, Files, Upload Date, Type	Tests API	Document list
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/tests	GET	List tests	status, period, tester, page, limit	Test list
GET /api/tests/:testId	GET	Get test details	N/A	Full test information
POST /api/tests	POST	Schedule test	controlId, type, scheduledDate, testerId, procedures	Scheduled test
PUT /api/tests/:testId	PUT	Update test	fields to update	Updated test
POST /api/tests/:testId/result	POST	Record result	result, findings, evidence[], issues[]	Result recorded
PUT /api/tests/:testId/tester	PUT	Reassign tester	testerId	Tester reassigned
PUT /api/tests/bulk	PUT	Bulk update	testIds[], updates	Bulk update results
GET /api/tests/export	GET	Export tests	format, filters	File download
UI Components Required
• Testing Calendar Component: Calendar view with test events
• Test Card Component: Card with status, result, and quick actions
• Test Result Form Component: Form with finding documentation
• Issue Creation Modal: Form for logging control issues
• Evidence Upload Component: Multi-file upload with categorization
• Testing Metrics Dashboard: Summary cards and charts
 
2.3 Policy Management
Route: /compliance/controls/policy-management
Page Goal
Manage organizational policies and procedures. Create, publish, and track policy documents. Manage policy acknowledgments, version control, and policy review cycles.
Page Design
Layout: Policy library with categories and status
Header: Total policies, Pending review, Acknowledgment rate
Policy Categories: Accounting, HR, IT, Operations, Compliance
Policy Cards: Title, Category, Version, Status, Owner, Last Review
Quick Actions: Add Policy, Edit, Publish, Request Acknowledgment, Archive
Filter Bar: Category, Status, Owner, Review Status
Policy Details: Content, Version History, Acknowledgments, Related Documents
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Add Policy	Plus icon	Create new policy	POST /api/policies	Opens policy editor
Edit Policy	Pencil icon	Edit policy content	PUT /api/policies/:id	Opens editor
Publish	Send icon	Publish policy	POST /api/policies/:id/publish	Makes policy live
Request Acknowledgment	UserCheck icon	Request sign-off	POST /api/policies/:id/acknowledgment	Sends requests
View Versions	GitBranch icon	View version history	GET /api/policies/:id/versions	Shows all versions
Archive	Archive icon	Archive policy	PUT /api/policies/:id/status	Sets status to archived
Export	Download icon	Export policy	GET /api/policies/:id/export	Downloads PDF
Track Acknowledgments	Users icon	View acknowledgment status	GET /api/policies/:id/acknowledgments	Shows who signed
Tables & Data Displays
Table Name	Columns	Data Source	Features
Policy Library	Title, Category, Version, Status, Owner, Last Review, Due	Policies API	Card/list view
Policy Content	Full policy document with sections	Policies API	Rich text editor
Version History	Version, Date, Author, Changes	Policies API	Comparison view
Acknowledgment Status	User, Department, Status, Date, Signature	Policies API	Progress tracking
Review Schedule	Policy, Next Review, Owner, Status	Policies API	Calendar view
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/policies	GET	List policies	category, status, owner, page, limit	Policy list
GET /api/policies/:policyId	GET	Get policy details	N/A	Full policy with content
POST /api/policies	POST	Create policy	title, category, content, ownerId, reviewDate	Created policy
PUT /api/policies/:policyId	PUT	Update policy	fields to update	Updated policy
POST /api/policies/:policyId/publish	POST	Publish policy	version, effectiveDate	Published confirmation
POST /api/policies/:policyId/acknowledgment	POST	Request acknowledgment	userIds[]	Requests sent
GET /api/policies/:policyId/acknowledgments	GET	Get acknowledgments	N/A	Acknowledgment list
GET /api/policies/:policyId/versions	GET	Get versions	N/A	Version history
UI Components Required
• Policy Editor Component: Rich text editor with templates
• Policy Card Component: Card with status, version, review date
• Version Comparison Component: Side-by-side version diff
• Acknowledgment Tracker Component: Progress bar with user list
• Policy Categories Sidebar: Category navigation with counts
• Review Schedule Calendar: Calendar with review due dates
 
2.4 Issue Tracking
Route: /compliance/monitoring/issue-tracking
Page Goal
Track and manage compliance issues, audit findings, and remediation activities. Log issues, assign owners, set deadlines, and monitor resolution progress. Maintain audit trail of issue lifecycle.
Page Design
Layout: Issue dashboard with filters and detail panel
Header: Open issues, Critical issues, Overdue remediation, Resolution rate
Issue Categories: Control Failure, Audit Finding, Policy Violation, Process Gap
Issue Cards: Title, Category, Severity, Status, Owner, Due Date
Quick Actions: Log Issue, Assign, Update Status, View Details, Escalate
Filter Bar: Status, Severity, Category, Owner, Date Range
Issue Details: Description, Root Cause, Remediation Plan, Evidence, Timeline
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Log Issue	Plus icon	Create new issue	POST /api/issues	Opens issue form
Update Status	RefreshCw icon	Update issue status	PUT /api/issues/:id/status	Status dropdown
Assign	UserPlus icon	Assign issue owner	PUT /api/issues/:id/owner	Opens user selector
Add Remediation	Wrench icon	Add remediation plan	POST /api/issues/:id/remediation	Opens remediation form
Escalate	AlertTriangle icon	Escalate issue	POST /api/issues/:id/escalate	Escalates to management
View Timeline	Clock icon	View issue timeline	GET /api/issues/:id/timeline	Shows activity log
Close Issue	CheckCircle icon	Close resolved issue	POST /api/issues/:id/close	Requires resolution notes
Export	Download icon	Export issues	GET /api/issues/export	Downloads report
Tables & Data Displays
Table Name	Columns	Data Source	Features
Issue List	ID, Title, Category, Severity, Status, Owner, Due Date	Issues API	Sortable, filterable
Issue Details	Full description, Root cause, Impact, Related controls	Issues API	Tabbed interface
Remediation Tasks	Task, Owner, Status, Due Date, Completion	Issues API	Task list
Issue Timeline	Date, Action, User, Details	Issues API	Vertical timeline
Metrics Dashboard	By severity, By category, Trend, Resolution time	Issues API	Charts and cards
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/issues	GET	List issues	status, severity, category, owner, from, to, page, limit	Issue list
GET /api/issues/:issueId	GET	Get issue details	N/A	Full issue info
POST /api/issues	POST	Create issue	title, category, severity, description, rootCause, controlId, owner	Created issue
PUT /api/issues/:issueId/status	PUT	Update status	status, notes	Status updated
PUT /api/issues/:issueId/owner	PUT	Assign owner	ownerId	Owner assigned
POST /api/issues/:issueId/remediation	POST	Add remediation	plan, tasks[]	Remediation recorded
POST /api/issues/:issueId/escalate	POST	Escalate issue	escalateToId, reason	Escalation logged
POST /api/issues/:issueId/close	POST	Close issue	resolution, evidence[]	Issue closed
GET /api/issues/export	GET	Export issues	format, filters	File download
UI Components Required
• Issue Card Component: Card with severity badge, status indicator
• Issue Form Component: Comprehensive form for issue logging
• Remediation Plan Component: Task list with assignment and tracking
• Issue Timeline Component: Vertical timeline of issue activities
• Metrics Dashboard Component: Charts for issue analytics
• Escalation Modal Component: Form for issue escalation
 
SECTION 3: AUTOMATION MODULE
3.1 Workflow Builder
Route: /automation/workflow-engine/workflow-builder
Page Goal
Visual workflow builder for creating automated business processes. Design workflows with triggers, conditions, actions, and approvals. Automate repetitive tasks and ensure consistent process execution.
Page Design
Layout: Canvas-based workflow designer with drag-and-drop
Left Panel: Trigger types, Action types, Condition blocks, Connectors
Center Canvas: Visual workflow diagram with nodes and connections
Right Panel: Properties for selected node (configuration)
Trigger Types: Record Created, Record Updated, Schedule, Webhook, Manual
Action Types: Create Record, Update Record, Send Email, Create Task, API Call
Conditions: If/Else branches based on field values or expressions
Save/Activate: Save draft, Test workflow, Activate workflow
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Add Trigger	Zap icon	Add workflow trigger	N/A (Client state)	Shows trigger selector
Add Action	Play icon	Add action step	N/A (Client state)	Shows action selector
Add Condition	GitBranch icon	Add conditional branch	N/A (Client state)	Adds if/else node
Save	Save icon	Save workflow	POST /api/workflows	Saves workflow definition
Test	Flask icon	Test workflow	POST /api/workflows/:id/test	Runs test with sample data
Activate	ToggleRight icon	Activate workflow	PUT /api/workflows/:id/status	Enables automation
Duplicate	Copy icon	Duplicate workflow	POST /api/workflows/:id/duplicate	Creates copy
View History	History icon	View execution history	GET /api/workflows/:id/executions	Shows run log
Tables & Data Displays
Table Name	Columns	Data Source	Features
Workflow Canvas	Visual diagram of workflow steps	N/A (Client)	Drag-drop nodes and connections
Trigger Configuration	Trigger type, Entity, Conditions	Workflows API	Dynamic form based on trigger
Action Configuration	Action type, Parameters, Mappings	Workflows API	Field mapping interface
Condition Configuration	Field, Operator, Value, Branch logic	Workflows API	Expression builder
Execution History	Date, Trigger, Status, Duration, Output	Workflows API	Detailed run log
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/workflows	GET	List workflows	status, trigger, page, limit	Workflow list
GET /api/workflows/:workflowId	GET	Get workflow definition	N/A	Full workflow config
POST /api/workflows	POST	Create workflow	name, description, definition{}	Created workflow
PUT /api/workflows/:workflowId	PUT	Update workflow	fields to update	Updated workflow
PUT /api/workflows/:workflowId/status	PUT	Update status	status	Status updated
POST /api/workflows/:workflowId/test	POST	Test workflow	testData{}	Test results
POST /api/workflows/:workflowId/duplicate	POST	Duplicate workflow	N/A	Duplicated workflow
GET /api/workflows/:workflowId/executions	GET	Get executions	status, from, to, page, limit	Execution history
UI Components Required
• Workflow Canvas Component: Interactive diagram with zoom/pan
• Node Palette Component: Draggable trigger and action nodes
• Node Configuration Panel: Context-aware configuration form
• Expression Builder Component: Visual condition/expression builder
• Field Mapping Component: Source-to-target field mapper
• Execution Timeline Component: Timeline of workflow runs
 
3.2 Smart Rules
Route: /automation/workflow-engine/smart-rules
Page Goal
Configure intelligent automation rules for common business scenarios. Set up rules for auto-categorization, auto-approval, routing, notifications, and data enrichment without complex workflow design.
Page Design
Layout: Rules library with quick configuration
Header: Active rules, Rules triggered today, Savings estimate
Rule Categories: Auto-Categorization, Auto-Approval, Routing, Notification, Data Enrichment
Rule Cards: Name, Category, Trigger, Status, Times Triggered
Quick Actions: Add Rule, Edit, Enable/Disable, View History
Filter Bar: Category, Status, Trigger Type
Rule Templates: Pre-built rules for common scenarios
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Add Rule	Plus icon	Create new rule	POST /api/rules	Opens rule builder
Edit Rule	Pencil icon	Edit rule	PUT /api/rules/:id	Opens rule editor
Toggle Status	Toggle icon	Enable/disable rule	PUT /api/rules/:id/status	Toggles active status
Test Rule	Flask icon	Test rule logic	POST /api/rules/:id/test	Runs with sample data
View History	History icon	View execution history	GET /api/rules/:id/history	Shows trigger log
Duplicate	Copy icon	Duplicate rule	POST /api/rules/:id/duplicate	Creates copy
Use Template	Layout icon	Create from template	POST /api/rules/from-template	Pre-fills rule config
Export	Download icon	Export rules	GET /api/rules/export	Downloads configuration
Tables & Data Displays
Table Name	Columns	Data Source	Features
Rules List	Name, Category, Trigger, Condition, Action, Status, Count	Rules API	Sortable, filterable
Rule Configuration	Trigger, Conditions, Actions, Schedule	Rules API	Form-based configuration
Rule Templates	Name, Description, Category, Use Case	Rules API	Pre-built templates
Execution History	Date, Rule, Trigger, Input, Output, Status	Rules API	Detailed log
Rule Statistics	Rule, Triggers, Success Rate, Avg Time	Rules API	Performance metrics
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/rules	GET	List rules	category, status, page, limit	Rule list
GET /api/rules/:ruleId	GET	Get rule details	N/A	Full rule configuration
POST /api/rules	POST	Create rule	name, category, trigger, conditions[], actions[]	Created rule
PUT /api/rules/:ruleId	PUT	Update rule	fields to update	Updated rule
PUT /api/rules/:ruleId/status	PUT	Update status	status	Status updated
POST /api/rules/:ruleId/test	POST	Test rule	testData{}	Test results
POST /api/rules/from-template	POST	Create from template	templateId, customizations	Created rule
GET /api/rules/:ruleId/history	GET	Get history	from, to, page, limit	Execution history
UI Components Required
• Rule Card Component: Card with trigger icon and status indicator
• Rule Builder Component: Step-by-step rule configuration
• Condition Builder Component: Visual condition logic builder
• Action Configuration Component: Action type and parameter form
• Rule Templates Gallery Component: Selectable template cards
• Rule Statistics Component: Charts showing rule performance
 
3.3 Approval Matrices
Route: /automation/approvals-governance/approval-matrices
Page Goal
Configure approval matrices for different transaction types and amounts. Define approval thresholds, chains, and delegation rules. Manage multi-level approval workflows with automatic routing.
Page Design
Layout: Matrix configuration with threshold rules
Header: Active matrices, Pending approvals, Average approval time
Matrix Types: By Amount, By Type, By Department, By Project
Matrix Cards: Name, Type, Thresholds, Approvers, Status
Quick Actions: Add Matrix, Edit, Configure Thresholds, View Hierarchy
Filter Bar: Type, Status, Department
Matrix Details: Thresholds, Approvers, Delegation, Escalation rules
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Add Matrix	Plus icon	Create approval matrix	POST /api/approval-matrices	Opens matrix form
Edit Matrix	Pencil icon	Edit matrix settings	PUT /api/approval-matrices/:id	Opens editor
Configure Thresholds	DollarSign icon	Set amount thresholds	PUT /api/approval-matrices/:id/thresholds	Opens threshold form
Assign Approvers	Users icon	Assign approvers	PUT /api/approval-matrices/:id/approvers	Opens user selector
Set Delegation	UserPlus icon	Configure delegation	POST /api/approval-matrices/:id/delegation	Opens delegation form
View Hierarchy	GitBranch icon	View approval chain	GET /api/approval-matrices/:id/hierarchy	Shows visual tree
Test Matrix	Flask icon	Test routing logic	POST /api/approval-matrices/:id/test	Tests with sample amount
Export	Download icon	Export matrix config	GET /api/approval-matrices/export	Downloads configuration
Tables & Data Displays
Table Name	Columns	Data Source	Features
Matrix List	Name, Type, Thresholds, Approvers, Status	Approval API	Card/list view
Threshold Configuration	Min Amount, Max Amount, Approvers Required	Approval API	Editable ranges
Approver Assignment	Level, Approver, Backup, Status	Approval API	Drag-drop ordering
Delegation Rules	Approver, Delegate, From, To, Status	Approval API	Schedule-based
Approval Hierarchy	Visual tree of approval chain	Approval API	Interactive diagram
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/approval-matrices	GET	List matrices	type, status, page, limit	Matrix list
GET /api/approval-matrices/:matrixId	GET	Get matrix details	N/A	Full matrix configuration
POST /api/approval-matrices	POST	Create matrix	name, type, transactionType, thresholds[], approvers[]	Created matrix
PUT /api/approval-matrices/:matrixId	PUT	Update matrix	fields to update	Updated matrix
PUT /api/approval-matrices/:matrixId/thresholds	PUT	Update thresholds	thresholds[]	Thresholds updated
PUT /api/approval-matrices/:matrixId/approvers	PUT	Update approvers	approvers[]	Approvers updated
POST /api/approval-matrices/:matrixId/delegation	POST	Set delegation	delegateId, from, to	Delegation configured
GET /api/approval-matrices/:matrixId/hierarchy	GET	Get hierarchy	N/A	Approval chain structure
UI Components Required
• Matrix Card Component: Card with type icon and threshold summary
• Threshold Configuration Component: Range slider with approver count
• Approver Assignment Component: User selector with level ordering
• Delegation Calendar Component: Calendar-based delegation scheduling
• Approval Hierarchy Diagram Component: Visual tree of approvers
• Matrix Test Component: Form to test routing with sample amounts
 
3.4 AI Bookkeeping
Route: /automation/ai-intelligence/ai-bookkeeping
Page Goal
AI-powered bookkeeping automation for transaction categorization, matching, and data entry. Train the AI with historical data, review suggestions, and improve accuracy over time through feedback.
Page Design
Layout: AI dashboard with suggestions queue and training stats
Header: AI accuracy rate, Suggestions pending, Auto-processed today
Suggestion Queue: Transactions awaiting AI categorization/matching
Accuracy Metrics: Categorization accuracy, Match accuracy, Learning progress
Quick Actions: Review Suggestions, Train AI, View Learning Log, Configure Rules
Filter Bar: Confidence level, Transaction type, Date range
AI Settings: Confidence threshold for auto-approval, Learning mode toggle
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Review Suggestions	List icon	Review AI suggestions	GET /api/ai/suggestions	Opens review queue
Accept Suggestion	Check icon	Accept AI suggestion	POST /api/ai/suggestions/:id/accept	Applies suggestion
Reject Suggestion	X icon	Reject and correct	POST /api/ai/suggestions/:id/reject	Opens correction form
Train AI	GraduationCap icon	Train with new data	POST /api/ai/train	Starts training job
View Learning Log	Book icon	View learning history	GET /api/ai/learning-log	Shows improvement timeline
Configure Thresholds	Sliders icon	Set confidence thresholds	PUT /api/ai/settings	Opens threshold form
Export Suggestions	Download icon	Export suggestion report	GET /api/ai/suggestions/export	Downloads report
Reset Learning	RefreshCw icon	Reset AI model	POST /api/ai/reset	Clears learned patterns
Tables & Data Displays
Table Name	Columns	Data Source	Features
Suggestion Queue	Transaction, AI Suggestion, Confidence, Type, Date	AI API	Reviewable list
Accuracy Metrics	Metric, Current, Previous, Trend, Target	AI API	Gauge charts
Learning Log	Date, Training Data, Accuracy Change, Status	AI API	Timeline format
Category Mapping	Pattern, Suggested Category, Confidence, Override	AI API	Editable mapping
Performance Stats	Period, Auto-Processed, Manually Reviewed, Accuracy	AI API	Trend charts
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/ai/suggestions	GET	Get suggestions	type, confidence, status, page, limit	Suggestion queue
POST /api/ai/suggestions/:suggestionId/accept	POST	Accept suggestion	N/A	Suggestion applied
POST /api/ai/suggestions/:suggestionId/reject	POST	Reject suggestion	correctValue	Correction recorded for learning
GET /api/ai/accuracy	GET	Get accuracy metrics	period	Accuracy statistics
POST /api/ai/train	POST	Trigger training	dataSource, dateRange	Training job started
GET /api/ai/learning-log	GET	Get learning log	from, to, page, limit	Learning history
PUT /api/ai/settings	PUT	Update settings	confidenceThreshold, autoApprove, learningMode	Settings updated
POST /api/ai/reset	POST	Reset AI model	confirm	Model reset confirmation
UI Components Required
• Suggestion Review Component: Transaction with side-by-side AI suggestion
• Accuracy Gauge Component: Visual accuracy meter
• Confidence Badge Component: Color-coded confidence indicator
• Learning Progress Component: Timeline of AI improvements
• Threshold Slider Component: Confidence threshold configuration
• Category Override Component: Manual override of AI suggestion
 
3.5 Automation Logs
Route: /automation/monitoring/automation-logs
Page Goal
View and analyze automation execution logs. Monitor workflow runs, rule triggers, and API integrations. Debug failed automations and track performance metrics.
Page Design
Layout: Log viewer with filters and detail panel
Header: Total runs today, Success rate, Failed runs, Average duration
Log Types: Workflow, Rule, Integration, Scheduled Task
Log List: Timestamp, Type, Name, Status, Duration, Trigger
Quick Actions: View Details, Retry Failed, Export Log
Filter Bar: Type, Status, Date range, Search
Log Details: Full execution trace, Input/Output, Error messages
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
View Details	Eye icon	View log details	GET /api/logs/:id	Opens detail panel
Retry	RefreshCw icon	Retry failed automation	POST /api/logs/:id/retry	Re-runs automation
Export	Download icon	Export logs	GET /api/logs/export	Downloads log file
Filter	Filter icon	Apply filters	N/A (Client state)	Shows filter options
Search	Search icon	Search logs	GET /api/logs?search=	Text search in logs
View Trace	GitBranch icon	View execution trace	GET /api/logs/:id/trace	Shows step-by-step
Clear Logs	Trash icon	Clear old logs	DELETE /api/logs/bulk	Deletes old logs
Download Debug	Bug icon	Download debug info	GET /api/logs/:id/debug	Downloads debug package
Tables & Data Displays
Table Name	Columns	Data Source	Features
Log List	Timestamp, Type, Name, Status, Duration, Trigger	Logs API	Sortable, filterable
Log Details	Full execution info, Steps, Input/Output	Logs API	Expandable sections
Execution Trace	Step, Status, Duration, Output, Error	Logs API	Visual flow diagram
Performance Metrics	Automation, Runs, Success Rate, Avg Duration	Logs API	Charts and stats
Error Summary	Error Type, Count, Last Occurrence, Affected	Logs API	Grouped by error
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/logs	GET	List logs	type, status, from, to, search, page, limit	Log list
GET /api/logs/:logId	GET	Get log details	N/A	Full log with trace
GET /api/logs/:logId/trace	GET	Get execution trace	N/A	Step-by-step trace
POST /api/logs/:logId/retry	POST	Retry automation	N/A	Retry initiated
DELETE /api/logs/bulk	DELETE	Clear old logs	before, type	Deletion confirmation
GET /api/logs/export	GET	Export logs	format, filters	File download
GET /api/logs/:logId/debug	GET	Get debug info	N/A	Debug package download
UI Components Required
• Log Table Component: Paginated table with status indicators
• Log Detail Panel Component: Expandable log information
• Execution Trace Component: Visual step-by-step diagram
• Performance Chart Component: Trend charts for automation health
• Error Summary Component: Grouped error display with counts
• Log Filter Component: Multi-criteria filter sidebar
 
3.6 Scheduled Reports
Route: /automation/scheduling/scheduled-reports
Page Goal
Configure and manage scheduled report generation and distribution. Set up recurring report schedules, recipients, and delivery methods. Track scheduled report execution and delivery status.
Page Design
Layout: Schedule management dashboard
Header: Active schedules, Reports due today, Last run status
Schedule Cards: Report, Frequency, Next Run, Recipients, Status
Quick Actions: Add Schedule, Edit, Pause, View History, Run Now
Filter Bar: Status, Frequency, Report Type
Schedule Details: Report, Parameters, Frequency, Recipients, Delivery Method
Delivery Options: Email, Download link, Cloud storage, Slack/Teams
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Add Schedule	Plus icon	Create new schedule	POST /api/schedules	Opens schedule form
Edit Schedule	Pencil icon	Edit schedule	PUT /api/schedules/:id	Opens editor
Pause/Resume	Toggle icon	Pause or resume	PUT /api/schedules/:id/status	Toggles active status
Run Now	Play icon	Execute immediately	POST /api/schedules/:id/run	Runs report now
View History	History icon	View run history	GET /api/schedules/:id/history	Shows past runs
Manage Recipients	Users icon	Edit recipients	PUT /api/schedules/:id/recipients	Opens recipient form
Test Delivery	Send icon	Send test email	POST /api/schedules/:id/test	Sends test to yourself
Export Config	Download icon	Export schedule config	GET /api/schedules/export	Downloads configuration
Tables & Data Displays
Table Name	Columns	Data Source	Features
Schedule List	Report, Frequency, Next Run, Recipients, Status	Schedules API	Card/list view
Schedule Configuration	Report, Parameters, Frequency, Delivery	Schedules API	Form interface
Recipient Management	Email, Name, Format, Delivery Status	Schedules API	Editable list
Run History	Date, Status, Duration, Recipients, Download	Schedules API	With re-run option
Delivery Log	Date, Recipient, Status, Opened, Downloaded	Schedules API	Tracking metrics
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/schedules	GET	List schedules	status, frequency, page, limit	Schedule list
GET /api/schedules/:scheduleId	GET	Get schedule details	N/A	Full schedule info
POST /api/schedules	POST	Create schedule	reportId, parameters{}, frequency, recipients[], delivery	Created schedule
PUT /api/schedules/:scheduleId	PUT	Update schedule	fields to update	Updated schedule
PUT /api/schedules/:scheduleId/status	PUT	Update status	status	Status updated
PUT /api/schedules/:scheduleId/recipients	PUT	Update recipients	recipients[]	Recipients updated
POST /api/schedules/:scheduleId/run	POST	Run now	N/A	Report generated and sent
POST /api/schedules/:scheduleId/test	POST	Test delivery	N/A	Test email sent
GET /api/schedules/:scheduleId/history	GET	Get history	page, limit	Run history
UI Components Required
• Schedule Card Component: Card with next run countdown
• Schedule Form Component: Step-by-step schedule configuration
• Frequency Picker Component: Cron expression builder with presets
• Recipient Manager Component: Multi-email with format options
• Run History Component: History with status indicators
• Delivery Tracker Component: Shows who opened/downloaded reports
 


HAYPBOOKS
Page101 Documentation Series
Part 11: Apps & Integrations, Settings, and Practice Hub
Comprehensive Page Specifications for Implementation
Version 1.0 | 2026-03-08
 
Table of Contents


Note: Right-click the Table of Contents and select 'Update Field' to refresh page numbers.
 
 
SECTION 1: APPS & INTEGRATIONS MODULE
1.1 App Marketplace
Route: /apps-integrations/discover/app-marketplace
Page Goal
Browse and discover third-party applications and integrations available for HaypBooks. View app details, ratings, reviews, and install apps to extend functionality. Categories include banking, payment, CRM, e-commerce, and more.
Page Design
Layout: Marketplace grid with categories sidebar
Header: Featured apps carousel, Search bar, Category filter
App Categories: Banking, Payments, CRM, E-commerce, Payroll, Tax, Productivity
App Cards: Logo, Name, Category, Rating, Install count, Price (Free/Paid)
Featured Section: Editor's picks, New apps, Trending apps
Quick Actions: View Details, Install, Compare, Add to Wishlist
Search: Full-text search with filters by category, rating, price
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
View Details	Eye icon	View app details	GET /api/apps/:id	Opens app detail page
Install App	Download icon	Install application	POST /api/apps/:id/install	Starts installation flow
Compare	Columns icon	Compare with other apps	N/A (Client state)	Adds to comparison list
Add to Wishlist	Heart icon	Save for later	POST /api/apps/:id/wishlist	Adds to user wishlist
Write Review	Star icon	Write a review	POST /api/apps/:id/reviews	Opens review form
Contact Developer	Mail icon	Contact app developer	POST /api/apps/:id/contact	Opens contact form
Report Issue	AlertTriangle icon	Report app issue	POST /api/apps/:id/report	Opens issue form
Share	Share icon	Share app link	N/A (Client state)	Copies link to clipboard
Tables & Data Displays
Table Name	Columns	Data Source	Features
App Grid	Name, Logo, Category, Rating, Installs, Price	Apps API	Filterable, searchable
Featured Carousel	Featured apps with screenshots	Apps API	Auto-rotating carousel
Category Sidebar	Category, App count, Popular tags	Apps API	Expandable sections
App Details	Full description, Screenshots, Pricing, Reviews, Permissions	Apps API	Tabbed interface
Reviews	User, Rating, Comment, Date, Helpful count	Apps API	Sortable by date/rating
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/apps	GET	List apps	category, search, sort, page, limit	App list with filters
GET /api/apps/:appId	GET	Get app details	N/A	Full app information
POST /api/apps/:appId/install	POST	Install app	companyId, permissions	Installation initiated
POST /api/apps/:appId/wishlist	POST	Add to wishlist	N/A	Added to wishlist
POST /api/apps/:appId/reviews	POST	Submit review	rating, comment	Review submitted
POST /api/apps/:appId/contact	POST	Contact developer	message, email	Message sent
GET /api/apps/:appId/reviews	GET	Get reviews	sort, page, limit	Review list
UI Components Required
• App Card Component: Card with logo, rating stars, install button
• Featured Carousel Component: Auto-rotating app showcase
• Category Sidebar Component: Collapsible category navigation
• App Detail Component: Full-page app information with tabs
• Review Form Component: Star rating with text input
• Install Wizard Component: Multi-step installation flow with permissions
 
1.2 Connected Apps
Route: /apps-integrations/my-integrations/connected-apps
Page Goal
Manage installed applications and their connections. View connection status, manage permissions, configure settings, and disconnect apps. Monitor data sync status and troubleshoot connection issues.
Page Design
Layout: Connected apps list with status indicators
Header: Total connections, Active connections, Sync status, Last sync time
Connection Cards: App logo, Name, Status, Last sync, Data synced
Status Indicators: Active (green), Syncing (yellow), Error (red), Disconnected (gray)
Quick Actions: Configure, Sync Now, View Logs, Disconnect, Manage Permissions
Filter Bar: Status, Category, Data type
Connection Details: Settings, Permissions, Sync history, Error logs
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Configure	Settings icon	Open app settings	GET /api/integrations/:id/settings	Opens configuration modal
Sync Now	RefreshCw icon	Trigger manual sync	POST /api/integrations/:id/sync	Starts sync job
View Logs	FileText icon	View sync logs	GET /api/integrations/:id/logs	Opens log viewer
Manage Permissions	Shield icon	Edit permissions	GET /api/integrations/:id/permissions	Opens permission manager
Disconnect	Unlink icon	Disconnect app	DELETE /api/integrations/:id	Confirms and disconnects
Reconnect	Link icon	Reconnect app	POST /api/integrations/:id/reconnect	Initiates reconnection flow
View Errors	AlertCircle icon	View error details	GET /api/integrations/:id/errors	Shows error messages
Export Data	Download icon	Export synced data	GET /api/integrations/:id/export	Downloads data file
Tables & Data Displays
Table Name	Columns	Data Source	Features
Connection List	App, Status, Last Sync, Data Types, Actions	Integrations API	Status color-coded
Sync Status	Integration, Status, Progress, Records, Errors	Integrations API	Real-time updates
Permission Matrix	Permission, Granted, Scope, Description	Integrations API	Toggleable permissions
Sync History	Date, Type, Records, Duration, Status	Integrations API	Sortable by date
Error Log	Timestamp, Error Type, Message, Resolution	Integrations API	Filterable by severity
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/integrations	GET	List connections	status, category, page, limit	Connection list
GET /api/integrations/:integrationId	GET	Get connection details	N/A	Full connection info
GET /api/integrations/:integrationId/settings	GET	Get settings	N/A	Configuration options
PUT /api/integrations/:integrationId/settings	PUT	Update settings	settings	Settings updated
POST /api/integrations/:integrationId/sync	POST	Trigger sync	fullSync?	Sync job started
DELETE /api/integrations/:integrationId	DELETE	Disconnect	N/A	Connection removed
POST /api/integrations/:integrationId/reconnect	POST	Reconnect	N/A	Reconnection initiated
GET /api/integrations/:integrationId/logs	GET	Get logs	type, from, to, page, limit	Sync logs
UI Components Required
• Connection Card Component: Card with status badge and sync indicator
• Sync Status Component: Real-time progress bar for sync operations
• Permission Manager Component: Toggle grid for app permissions
• Settings Panel Component: Dynamic form based on app requirements
• Error Log Viewer Component: Filterable error list with details
• Connection Wizard Component: OAuth/connection flow for setup
 
1.3 API Keys
Route: /apps-integrations/developer-tools/api-keys
Page Goal
Manage API keys for programmatic access to HaypBooks. Create, rotate, and revoke API keys. Monitor API usage, set rate limits, and view access logs for security auditing.
Page Design
Layout: API key management dashboard
Header: Total keys, Active keys, API calls today, Rate limit status
Key Cards: Name, Key prefix, Created date, Last used, Status, Permissions
Security: Masked key display, one-time full key reveal on creation
Quick Actions: Create Key, View Usage, Rotate Key, Revoke, Edit Permissions
Filter Bar: Status, Permissions, Created date
Key Details: Permissions, Usage stats, Access log, Rate limits
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Create Key	Plus icon	Create new API key	POST /api/api-keys	Opens key creation form
View Key	Eye icon	Reveal key (one-time)	GET /api/api-keys/:id/reveal	Shows full key once
Copy Key	Copy icon	Copy key to clipboard	N/A (Client)	Copies masked key
Rotate Key	RefreshCw icon	Generate new key value	POST /api/api-keys/:id/rotate	Old key invalidated
Revoke Key	Trash icon	Revoke/delete key	DELETE /api/api-keys/:id	Confirms and deletes
Edit Permissions	Shield icon	Edit key permissions	PUT /api/api-keys/:id/permissions	Opens permission editor
View Usage	Chart icon	View usage statistics	GET /api/api-keys/:id/usage	Shows usage charts
View Access Log	History icon	View access log	GET /api/api-keys/:id/access-log	Shows API calls
Tables & Data Displays
Table Name	Columns	Data Source	Features
API Key List	Name, Key Prefix, Created, Last Used, Status, Permissions	API Keys API	Masked display
Key Details	Full metadata, Permissions, Rate limits	API Keys API	Edit panel
Usage Statistics	Date, Requests, Errors, Avg Response Time	API Keys API	Charts and tables
Access Log	Timestamp, Endpoint, Method, Status, IP, Duration	API Keys API	Filterable log
Permission Scope	Permission, Description, Access Level	API Keys API	Editable checkboxes
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/api-keys	GET	List API keys	status, page, limit	Key list (masked)
GET /api/api-keys/:keyId	GET	Get key details	N/A	Key metadata
POST /api/api-keys	POST	Create key	name, permissions[], expiresAt	Created key (full key shown once)
PUT /api/api-keys/:keyId	PUT	Update key	name, permissions	Updated key
POST /api/api-keys/:keyId/rotate	POST	Rotate key	N/A	New key value generated
DELETE /api/api-keys/:keyId	DELETE	Revoke key	N/A	Key revoked
GET /api/api-keys/:keyId/usage	GET	Get usage	period	Usage statistics
GET /api/api-keys/:keyId/access-log	GET	Get access log	from, to, page, limit	Access log entries
UI Components Required
• API Key Card Component: Card with masked key and status badge
• Key Creation Form Component: Form with name and permission selector
• Permission Selector Component: Multi-select with scopes
• Key Reveal Modal Component: One-time key display with copy
• Usage Chart Component: Line/bar charts for API usage
• Access Log Table Component: Filterable log with details
 
1.4 Webhooks
Route: /apps-integrations/developer-tools/webhooks
Page Goal
Configure webhook endpoints to receive real-time notifications for events in HaypBooks. Create webhook subscriptions, manage endpoints, test deliveries, and view delivery logs.
Page Design
Layout: Webhook management with endpoint list
Header: Total webhooks, Active webhooks, Deliveries today, Success rate
Webhook Cards: Endpoint URL, Events subscribed, Status, Last triggered
Event Types: Transaction created, Invoice paid, Bill approved, Journal posted, etc.
Quick Actions: Create Webhook, Test, View Deliveries, Edit, Disable, Delete
Security: Secret key for signature verification, IP allowlist
Delivery Details: Request/response payload, headers, status code, retry count
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Create Webhook	Plus icon	Create new webhook	POST /api/webhooks	Opens webhook form
Test	Flask icon	Send test payload	POST /api/webhooks/:id/test	Sends test event
View Deliveries	List icon	View delivery history	GET /api/webhooks/:id/deliveries	Opens delivery log
Edit	Pencil icon	Edit webhook config	PUT /api/webhooks/:id	Opens editor
Toggle Status	Toggle icon	Enable/disable webhook	PUT /api/webhooks/:id/status	Toggles active
Regenerate Secret	Key icon	Regenerate signing secret	POST /api/webhooks/:id/regenerate-secret	New secret generated
View Logs	FileText icon	View detailed logs	GET /api/webhooks/:id/logs	Shows request/response
Delete	Trash icon	Delete webhook	DELETE /api/webhooks/:id	Confirms and deletes
Tables & Data Displays
Table Name	Columns	Data Source	Features
Webhook List	URL, Events, Status, Created, Last Triggered	Webhooks API	Status indicators
Delivery History	Timestamp, Event, Status, Response Code, Duration	Webhooks API	Filterable by status
Event Selector	Event category, Event type, Description	Webhooks API	Multi-select checkboxes
Delivery Details	Request headers, Payload, Response headers, Response body	Webhooks API	Expandable sections
Retry Queue	Webhook, Event, Retry count, Next retry, Status	Webhooks API	Auto-retry status
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/webhooks	GET	List webhooks	status, page, limit	Webhook list
GET /api/webhooks/:webhookId	GET	Get webhook details	N/A	Full webhook config
POST /api/webhooks	POST	Create webhook	url, events[], secret, active	Created webhook
PUT /api/webhooks/:webhookId	PUT	Update webhook	fields to update	Updated webhook
PUT /api/webhooks/:webhookId/status	PUT	Update status	active	Status updated
POST /api/webhooks/:webhookId/test	POST	Test webhook	eventType	Test delivery initiated
POST /api/webhooks/:webhookId/regenerate-secret	POST	Regenerate secret	N/A	New secret generated
DELETE /api/webhooks/:webhookId	DELETE	Delete webhook	N/A	Webhook deleted
GET /api/webhooks/:webhookId/deliveries	GET	Get deliveries	status, from, to, page, limit	Delivery history
UI Components Required
• Webhook Card Component: Card with URL, events, status indicator
• Webhook Form Component: URL input with event multi-selector
• Event Selector Component: Categorized event checkboxes
• Delivery Log Component: Table with status and retry info
• Payload Viewer Component: JSON viewer for request/response
• Test Modal Component: Send test event with custom payload
 
1.5 Import Data
Route: /apps-integrations/data-tools/import-data
Page Goal
Import data from external sources into HaypBooks. Support CSV, Excel, and other file formats. Map columns, validate data, preview imports, and track import history with error handling.
Page Design
Layout: Import wizard with step-by-step process
Steps: 1) Select Import Type, 2) Upload File, 3) Map Columns, 4) Validate, 5) Review, 6) Import
Import Types: Chart of Accounts, Customers, Vendors, Items, Transactions, Journal Entries
File Upload: Drag-drop zone, supports CSV, XLSX, XLS
Column Mapping: Auto-detect columns, manual mapping, save mapping templates
Validation: Data type checks, required field validation, duplicate detection
Preview: Sample of data to be imported with validation errors highlighted
Progress: Real-time progress bar with record count and error count
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Select Import Type	List icon	Choose what to import	N/A (Client state)	Shows import type selector
Upload File	Upload icon	Upload data file	POST /api/imports/upload	Validates and parses file
Auto Map	Wand icon	Auto-detect column mapping	POST /api/imports/auto-map	Suggests column mapping
Save Mapping	Save icon	Save column mapping template	POST /api/imports/mappings	Saves for reuse
Validate	CheckCircle icon	Validate data	POST /api/imports/validate	Runs validation rules
Preview	Eye icon	Preview import data	GET /api/imports/:id/preview	Shows sample records
Start Import	Play icon	Begin import process	POST /api/imports/:id/execute	Starts import job
Download Template	Download icon	Download template file	GET /api/imports/template	Downloads CSV template
Tables & Data Displays
Table Name	Columns	Data Source	Features
Import Type Selector	Type, Description, Required Fields	Imports API	Selectable cards
File Upload Zone	Drag-drop area, Supported formats	N/A (Client)	Progress indicator
Column Mapping	Source column, Target field, Data type, Sample value	Imports API	Drag-drop mapping
Validation Results	Row, Field, Error, Suggestion	Imports API	Editable error rows
Import Progress	Total, Processed, Success, Errors, Current status	Imports API	Real-time progress
Import History	Date, Type, File, Records, Status, User	Imports API	With download/retry
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/imports/types	GET	Get import types	N/A	Available import types
POST /api/imports/upload	POST	Upload file	file, type	Parsed file with columns
POST /api/imports/auto-map	POST	Auto map columns	fileId, type	Suggested mapping
POST /api/imports/validate	POST	Validate data	fileId, mapping	Validation results
GET /api/imports/:importId/preview	GET	Preview data	rows	Preview records
POST /api/imports/:importId/execute	POST	Execute import	N/A	Import job started
GET /api/imports/:importId/status	GET	Get import status	N/A	Progress and results
GET /api/imports/template	GET	Download template	type	Template file download
UI Components Required
• Import Type Selector Component: Cards for each import type
• File Upload Component: Drag-drop zone with format indicators
• Column Mapper Component: Drag-drop source to target mapping
• Validation Table Component: Error highlighting with suggestions
• Progress Tracker Component: Step indicator with current step
• Import Progress Component: Real-time progress bar with counts
 
1.6 Export Data
Route: /apps-integrations/data-tools/export-data
Page Goal
Export data from HaypBooks to various file formats. Select data types, filter criteria, and export format. Schedule recurring exports and manage export templates.
Page Design
Layout: Export configuration wizard
Export Types: Chart of Accounts, Customers, Vendors, Items, Transactions, Reports
Filter Options: Date range, Status, Category, Amount range, Custom filters
Export Formats: CSV, Excel (XLSX), PDF, JSON
Column Selection: Choose which columns to include, save templates
Schedule: One-time export or recurring schedule
Delivery: Download immediately, email, or save to cloud storage
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
New Export	Plus icon	Create new export	N/A (Client state)	Opens export wizard
Select Data	Database icon	Choose data to export	N/A (Client state)	Shows data type selector
Set Filters	Filter icon	Apply filters	N/A (Client state)	Opens filter builder
Select Columns	Columns icon	Choose columns	N/A (Client state)	Shows column picker
Preview	Eye icon	Preview export data	POST /api/exports/preview	Shows sample
Export Now	Download icon	Export immediately	POST /api/exports/execute	Starts export job
Schedule	Clock icon	Schedule export	POST /api/exports/schedule	Opens scheduler
Save Template	Save icon	Save as template	POST /api/exports/templates	Saves configuration
Tables & Data Displays
Table Name	Columns	Data Source	Features
Export Type Selector	Type, Record Count, Description	Exports API	Selectable list
Filter Builder	Field, Operator, Value, Logic	Exports API	Dynamic filter rows
Column Picker	Column, Include, Order, Format	Exports API	Drag-drop ordering
Export Preview	Sample rows of export data	Exports API	Paginated preview
Scheduled Exports	Name, Type, Schedule, Next Run, Status	Exports API	CRUD operations
Export Templates	Name, Type, Columns, Filters, Created	Exports API	Reusable configs
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/exports/types	GET	Get export types	N/A	Available export types
POST /api/exports/preview	POST	Preview export	type, filters, columns	Preview data
POST /api/exports/execute	POST	Execute export	type, filters, columns, format	Export job started
GET /api/exports/:exportId/status	GET	Get export status	N/A	Progress and download URL
POST /api/exports/schedule	POST	Schedule export	config, schedule	Scheduled export created
POST /api/exports/templates	POST	Save template	name, config	Template saved
GET /api/exports/templates	GET	List templates	N/A	Template list
GET /api/exports/download/:exportId	GET	Download export	N/A	File download
UI Components Required
• Export Type Selector Component: Cards with record counts
• Filter Builder Component: Dynamic filter row management
• Column Picker Component: Checkbox list with drag-drop reordering
• Export Preview Component: Paginated table preview
• Schedule Form Component: Cron expression builder with presets
• Export Progress Component: Progress bar with download link
 
SECTION 2: SETTINGS MODULE
2.1 Company Profile
Route: /settings/company-profile/company-details
Page Goal
Configure company information including legal name, tax identification, addresses, contact details, and business settings. This information is used throughout the system for documents, reports, and compliance.
Page Design
Layout: Form-based settings page with sections
Sections: Basic Information, Tax Details, Addresses, Contact Info, Business Settings
Basic Information: Legal name, Trade name, Business type, Industry, Registration number
Tax Details: TIN, VAT registration, Tax type, Withholding tax status
Addresses: Primary address, Mailing address, Branch addresses
Contact Info: Phone, Email, Website, Social media
Business Settings: Fiscal year start, Base currency, Time zone, Date format
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Edit	Pencil icon	Enable edit mode	N/A (Client state)	Toggles form editability
Save	Save icon	Save changes	PUT /api/companies/:id	Saves all changes
Cancel	X icon	Cancel changes	N/A (Client state)	Reverts to saved values
Add Address	Plus icon	Add new address	POST /api/companies/:id/addresses	Opens address form
Upload Logo	Image icon	Upload company logo	POST /api/companies/:id/logo	Opens file picker
View History	History icon	View change history	GET /api/companies/:id/history	Shows audit log
Export Profile	Download icon	Export as PDF	GET /api/companies/:id/export	Downloads profile PDF
Tables & Data Displays
Table Name	Columns	Data Source	Features
Basic Information Form	Legal name, Trade name, Type, Industry, Registration	Companies API	Editable fields
Tax Information Form	TIN, VAT, Tax type, Withholding settings	Companies API	Country-specific fields
Address Cards	Type, Street, City, Region, Postal, Country, Default	Companies API	Multiple addresses
Contact Form	Phone, Email, Website, Social links	Companies API	Multiple contacts
Settings Form	Fiscal year, Currency, Timezone, Date format	Companies API	Dropdowns and toggles
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId	GET	Get company details	N/A	Full company profile
PUT /api/companies/:companyId	PUT	Update company	fields to update	Updated company
POST /api/companies/:companyId/addresses	POST	Add address	type, street, city, region, postal, country, isDefault	Address added
PUT /api/companies/:companyId/addresses/:addressId	PUT	Update address	fields to update	Address updated
DELETE /api/companies/:companyId/addresses/:addressId	DELETE	Delete address	N/A	Address removed
POST /api/companies/:companyId/logo	POST	Upload logo	file	Logo URL returned
GET /api/companies/:companyId/history	GET	Get change history	page, limit	Audit log entries
UI Components Required
• Company Form Component: Multi-section form with validation
• Address Card Component: Address display with edit/delete actions
• Logo Upload Component: Image upload with preview and crop
• Tax Configuration Component: Country-specific tax form fields
• Change History Component: Timeline of profile changes
• Currency Selector Component: Currency dropdown with symbols
 
2.2 User Management
Route: /settings/users-security/user-management
Page Goal
Manage users and their access to the company. Invite new users, assign roles, configure permissions, and manage user status. Monitor user activity and security settings.
Page Design
Layout: User list with detail panel
Header: Total users, Active users, Pending invitations, Last activity
User Cards: Avatar, Name, Email, Role, Status, Last active
Status Types: Active, Inactive, Pending invitation, Suspended
Quick Actions: Invite User, Edit, Change Role, Reset Password, Suspend, Delete
Filter Bar: Status, Role, Department
User Details: Profile, Permissions, Activity log, Security settings
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Invite User	UserPlus icon	Send invitation	POST /api/users/invite	Opens invitation form
Edit User	Pencil icon	Edit user details	PUT /api/users/:id	Opens edit form
Change Role	Shield icon	Change user role	PUT /api/users/:id/role	Opens role selector
Reset Password	Key icon	Send password reset	POST /api/users/:id/reset-password	Sends reset email
Suspend	Ban icon	Suspend user	PUT /api/users/:id/status	Sets status to suspended
Resend Invite	Mail icon	Resend invitation	POST /api/users/:id/resend-invite	Sends new invite
View Activity	History icon	View activity log	GET /api/users/:id/activity	Shows user actions
Delete	Trash icon	Delete user	DELETE /api/users/:id	Confirms and removes
Tables & Data Displays
Table Name	Columns	Data Source	Features
User List	Name, Email, Role, Status, Last Active, Actions	Users API	Sortable, filterable
User Details	Profile info, Permissions, Security settings	Users API	Tabbed interface
Permission Matrix	Module, Permission, Access Level	Users API	Visual grid
Activity Log	Date, Action, Details, IP Address	Users API	Filterable timeline
Invitation List	Email, Role, Sent Date, Status, Expires	Users API	Resend/cancel options
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/users	GET	List users	status, role, page, limit	User list
GET /api/users/:userId	GET	Get user details	N/A	Full user profile
POST /api/users/invite	POST	Invite user	email, role, permissions[]	Invitation sent
PUT /api/users/:userId	PUT	Update user	fields to update	User updated
PUT /api/users/:userId/role	PUT	Update role	roleId	Role updated
PUT /api/users/:userId/status	PUT	Update status	status	Status updated
POST /api/users/:userId/reset-password	POST	Reset password	N/A	Reset email sent
DELETE /api/users/:userId	DELETE	Delete user	N/A	User removed
GET /api/users/:userId/activity	GET	Get activity	from, to, page, limit	Activity log
UI Components Required
• User Card Component: Card with avatar, role badge, status indicator
• User Invitation Form Component: Form with email and role selector
• Permission Matrix Component: Grid showing module permissions
• Activity Timeline Component: Vertical timeline of user actions
• Role Selector Component: Dropdown with role descriptions
• Bulk Action Bar Component: Actions for selected users
 
2.3 Roles & Permissions
Route: /settings/users-security/roles-permissions
Page Goal
Configure roles and their associated permissions. Create custom roles, edit permission sets, and assign roles to users. Define granular access control for all modules and features.
Page Design
Layout: Role list with permission matrix
Header: Total roles, Custom roles, Users per role
Role Types: System roles (Admin, Accountant, Viewer) and Custom roles
Role Cards: Name, Description, User count, Type, Last modified
Permission Categories: Accounting, AR, AP, Banking, Payroll, Tax, Reports, Settings
Permission Levels: None, View, Create, Edit, Delete, Full
Quick Actions: Create Role, Edit Permissions, Duplicate, Delete
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Create Role	Plus icon	Create custom role	POST /api/roles	Opens role form
Edit Permissions	Shield icon	Edit role permissions	PUT /api/roles/:id/permissions	Opens permission editor
Duplicate Role	Copy icon	Duplicate role	POST /api/roles/:id/duplicate	Creates copy
Delete Role	Trash icon	Delete custom role	DELETE /api/roles/:id	Confirms and deletes
View Users	Users icon	View users with role	GET /api/roles/:id/users	Shows user list
Compare Roles	Columns icon	Compare permissions	N/A (Client state)	Side-by-side view
Export	Download icon	Export role config	GET /api/roles/export	Downloads configuration
Restore Default	RefreshCw icon	Restore default roles	POST /api/roles/restore-defaults	Resets to default
Tables & Data Displays
Table Name	Columns	Data Source	Features
Role List	Name, Description, Type, Users, Modified	Roles API	Card/list view
Permission Matrix	Module, Permission, Access Level	Roles API	Editable grid
Permission Categories	Category, Permissions count, Description	Roles API	Expandable sections
Users by Role	User, Email, Assigned Date, Status	Roles API	Filterable list
Role Comparison	Permission, Role A, Role B, Difference	Roles API	Side-by-side matrix
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/roles	GET	List roles	type, page, limit	Role list
GET /api/roles/:roleId	GET	Get role details	N/A	Full role with permissions
POST /api/roles	POST	Create role	name, description, permissions[]	Created role
PUT /api/roles/:roleId	PUT	Update role	name, description	Updated role
PUT /api/roles/:roleId/permissions	PUT	Update permissions	permissions[]	Permissions updated
POST /api/roles/:roleId/duplicate	POST	Duplicate role	N/A	Duplicated role
DELETE /api/roles/:roleId	DELETE	Delete role	N/A	Role deleted
GET /api/roles/:roleId/users	GET	Get users with role	N/A	User list
UI Components Required
• Role Card Component: Card with permission count, user count
• Permission Matrix Component: Editable grid for permission assignment
• Role Form Component: Form with name, description, permission selector
• Permission Category Component: Expandable section with permissions
• Role Comparison Component: Side-by-side permission comparison
• User Assignment Component: Multi-select for assigning users
 
2.4 Custom Fields
Route: /settings/customization/custom-fields
Page Goal
Create and manage custom fields for various entity types. Add custom data fields to customers, vendors, items, transactions, and more. Configure field types, validation, and display options.
Page Design
Layout: Custom field manager by entity type
Header: Total fields, Fields by entity, Active/Inactive count
Entity Types: Customer, Vendor, Item, Invoice, Bill, Journal Entry, Employee, etc.
Field Types: Text, Number, Date, Dropdown, Checkbox, URL, Email, Phone
Field Cards: Name, Type, Entity, Required, Status
Quick Actions: Create Field, Edit, Deactivate, Delete
Field Settings: Label, Type, Required, Default value, Validation rules, Display order
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Create Field	Plus icon	Create custom field	POST /api/custom-fields	Opens field form
Edit Field	Pencil icon	Edit field settings	PUT /api/custom-fields/:id	Opens editor
Toggle Status	Toggle icon	Activate/deactivate field	PUT /api/custom-fields/:id/status	Toggles active
Preview	Eye icon	Preview field appearance	N/A (Client state)	Shows field preview
Reorder	GripVertical icon	Change display order	PUT /api/custom-fields/reorder	Drag-drop reordering
Duplicate	Copy icon	Duplicate field	POST /api/custom-fields/:id/duplicate	Creates copy
Delete	Trash icon	Delete field	DELETE /api/custom-fields/:id	Confirms and deletes
Export	Download icon	Export field config	GET /api/custom-fields/export	Downloads configuration
Tables & Data Displays
Table Name	Columns	Data Source	Features
Field List by Entity	Name, Type, Required, Default, Status, Order	Custom Fields API	Sortable, filterable
Field Configuration	All field settings and validation rules	Custom Fields API	Form interface
Entity Type Selector	Entity, Field count, Description	Custom Fields API	Tab navigation
Field Preview	How field appears in forms	N/A (Client)	Live preview
Usage Report	Field, Entity, Records with data, Fill rate	Custom Fields API	Usage statistics
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/custom-fields	GET	List custom fields	entity, status, page, limit	Field list
GET /api/custom-fields/:fieldId	GET	Get field details	N/A	Full field configuration
POST /api/custom-fields	POST	Create field	name, type, entity, required, defaultValue, validation, order	Created field
PUT /api/custom-fields/:fieldId	PUT	Update field	fields to update	Updated field
PUT /api/custom-fields/:fieldId/status	PUT	Update status	status	Status updated
PUT /api/custom-fields/reorder	PUT	Reorder fields	fieldIds[]	Order updated
DELETE /api/custom-fields/:fieldId	DELETE	Delete field	N/A	Field deleted
GET /api/custom-fields/export	GET	Export fields	entity	Configuration file
UI Components Required
• Custom Field Card Component: Card with type icon, entity badge
• Field Type Selector Component: Visual selector for field types
• Field Configuration Form Component: Form with all field settings
• Validation Rules Component: Rule builder for field validation
• Field Preview Component: Live preview of field appearance
• Entity Tabs Component: Tab navigation for entity types
 
2.5 Audit Log
Route: /settings/data-privacy/audit-log
Page Goal
View comprehensive audit log of all user activities and system events. Track changes, access attempts, and system modifications. Export logs for compliance and security review.
Page Design
Layout: Searchable audit log viewer
Header: Total events today, Failed logins, High risk events, Data exports
Event Categories: Authentication, Data Access, Data Modification, Configuration, System
Log Columns: Timestamp, User, Action, Entity, Details, IP Address
Quick Actions: Search, Filter, Export, View Details
Filter Bar: Date range, User, Action type, Entity type, Risk level
Event Details: Full event information with before/after values for changes
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Search	Search icon	Search logs	GET /api/audit-log?search=	Text search in logs
Filter	Filter icon	Apply filters	N/A (Client state)	Shows filter options
View Details	Eye icon	View event details	GET /api/audit-log/:id	Opens detail panel
Export	Download icon	Export logs	GET /api/audit-log/export	Downloads log file
View User Events	User icon	Filter by user	GET /api/audit-log?user=	Shows user's events
View Entity Events	Database icon	Filter by entity	GET /api/audit-log?entity=	Shows entity's events
Mark as Reviewed	Check icon	Mark event as reviewed	PUT /api/audit-log/:id/reviewed	Marks reviewed
Report	AlertTriangle icon	Report suspicious activity	POST /api/audit-log/:id/report	Creates security alert
Tables & Data Displays
Table Name	Columns	Data Source	Features
Audit Log List	Timestamp, User, Action, Entity, IP, Risk	Audit API	Sortable, filterable
Event Details	Full event information with changes	Audit API	Before/after comparison
Summary Cards	Event type counts, Risk distribution	Audit API	Dashboard cards
User Activity	User, Events, Last Activity, Risk Score	Audit API	User-focused view
Entity History	Entity, Changes, Users, Timeline	Audit API	Entity-focused view
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/companies/:companyId/audit-log	GET	List audit events	user, action, entity, from, to, risk, page, limit	Audit log entries
GET /api/audit-log/:eventId	GET	Get event details	N/A	Full event with changes
GET /api/audit-log/summary	GET	Get summary stats	period	Event statistics
GET /api/audit-log/export	GET	Export logs	format, filters	File download
PUT /api/audit-log/:eventId/reviewed	PUT	Mark reviewed	notes	Event reviewed
POST /api/audit-log/:eventId/report	POST	Report event	reason, details	Security alert created
UI Components Required
• Audit Log Table Component: Paginated table with event details
• Event Detail Panel Component: Expandable event information
• Filter Sidebar Component: Multi-criteria filter panel
• Before/After Comparison Component: Side-by-side value display
• Summary Dashboard Component: Cards with event statistics
• Risk Indicator Component: Color-coded risk level badges
 
SECTION 3: PRACTICE HUB MODULE
3.1 Practice Hub Dashboard
Route: /practice-hub/home/dashboard
Page Goal
Central dashboard for accounting firm practice management. View client overview, active engagements, team workload, and practice health metrics. Quick access to common tasks and client management.
Page Design
Layout: Multi-widget dashboard for practice overview
Header: Practice name, Active clients, Engagements in progress, Team online
Client Summary: Active clients, New this month, Upcoming deadlines, At-risk clients
Engagement Widgets: Active engagements by type, Due soon, Overdue items
Team Workload: Staff utilization, Capacity, Available hours
Quick Actions: Add Client, Create Engagement, Assign Work, View Reports
Alerts: Client deadlines, Compliance items, Staff availability
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Add Client	UserPlus icon	Add new client	POST /api/clients	Opens client form
Create Engagement	FolderPlus icon	Create new engagement	POST /api/engagements	Opens engagement form
View All Clients	Users icon	View client list	N/A (Navigation)	Routes to client list
View Engagements	Briefcase icon	View engagements	N/A (Navigation)	Routes to work management
Assign Work	UserCheck icon	Assign work to staff	POST /api/assignments	Opens assignment modal
Generate Report	FileText icon	Generate practice report	GET /api/reports/practice	Opens report selector
View Calendar	Calendar icon	View practice calendar	N/A (Navigation)	Routes to calendar
Refresh	RefreshCw icon	Refresh dashboard	GET /api/dashboard/practice	Reloads all data
Tables & Data Displays
Table Name	Columns	Data Source	Features
Client Summary Cards	Total, Active, New, At-risk, Retention rate	Practice API	Click to drill down
Engagement Overview	Type, Count, Status, Due dates	Practice API	Progress indicators
Team Workload Chart	Staff, Assigned hours, Capacity, Utilization %	Practice API	Bar chart
Upcoming Deadlines	Client, Item, Due date, Assignee, Priority	Practice API	Sortable list
Revenue Metrics	Monthly revenue, Realization rate, Collection rate	Practice API	Trend charts
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/practice/dashboard	GET	Get dashboard data	N/A	All dashboard metrics
GET /api/practice/clients	GET	List clients	status, page, limit	Client list
GET /api/practice/engagements	GET	List engagements	status, type, page, limit	Engagement list
GET /api/practice/team/workload	GET	Get team workload	period	Staff workload data
GET /api/practice/deadlines	GET	Get upcoming deadlines	days	Deadline list
GET /api/practice/metrics	GET	Get practice metrics	period	Revenue and utilization
UI Components Required
• Practice Dashboard Widget Component: Configurable widget grid
• Client Summary Component: Cards with client metrics
• Engagement Overview Component: Visual engagement tracker
• Team Workload Chart Component: Bar chart for utilization
• Deadline List Component: Priority-sorted deadline items
• Revenue Metrics Component: Trend charts for practice health
 
3.2 Client List
Route: /practice-hub/clients/client-list
Page Goal
Manage all clients of the accounting practice. View client details, company information, engagement history, and assigned staff. Track client status, billing, and communication.
Page Design
Layout: Client list with detail panel
Header: Total clients, Active clients, Onboarding, At-risk, Retention rate
Client Cards: Company name, Contact, Assigned staff, Status, Last activity
Status Types: Active, Onboarding, Inactive, Prospect, Churned
Quick Actions: Add Client, View Details, Create Engagement, Assign Staff, Export
Filter Bar: Status, Industry, Assigned staff, Revenue tier, Location
Client Details: Company info, Engagements, Team, Documents, Communications
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Add Client	Plus icon	Add new client	POST /api/clients	Opens client form
View Details	Eye icon	View client details	GET /api/clients/:id	Opens detail panel
Create Engagement	FolderPlus icon	Create engagement	POST /api/engagements	Opens engagement form
Assign Staff	UserPlus icon	Assign team members	PUT /api/clients/:id/team	Opens team selector
Edit Client	Pencil icon	Edit client information	PUT /api/clients/:id	Opens edit form
View Engagements	Briefcase icon	View client engagements	GET /api/clients/:id/engagements	Shows engagement list
Export	Download icon	Export client list	GET /api/clients/export	Downloads file
Archive Client	Archive icon	Archive client	PUT /api/clients/:id/status	Sets status to archived
Tables & Data Displays
Table Name	Columns	Data Source	Features
Client List	Name, Contact, Industry, Status, Assigned, Revenue, Last Activity	Clients API	Sortable, filterable
Client Details	Company info, Team, Engagements, Documents, Billing	Clients API	Tabbed interface
Engagement History	Type, Period, Status, Fees, Staff	Clients API	Timeline format
Team Assignment	Staff member, Role, Hours, Rate	Clients API	Editable list
Communication Log	Date, Type, Subject, Staff, Notes	Clients API	Reverse chronological
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/practice/clients	GET	List clients	status, industry, staff, page, limit	Client list
GET /api/clients/:clientId	GET	Get client details	N/A	Full client profile
POST /api/clients	POST	Create client	companyName, contact, industry, address, team[]	Created client
PUT /api/clients/:clientId	PUT	Update client	fields to update	Updated client
PUT /api/clients/:clientId/status	PUT	Update status	status	Status updated
PUT /api/clients/:clientId/team	PUT	Update team	teamMembers[]	Team updated
GET /api/clients/:clientId/engagements	GET	Get engagements	N/A	Engagement list
GET /api/clients/export	GET	Export clients	format, filters	File download
UI Components Required
• Client Card Component: Card with status badge and assigned staff
• Client Form Component: Multi-tab form for client information
• Team Assignment Component: User selector with role assignment
• Engagement Timeline Component: Visual history of engagements
• Communication Log Component: List of client communications
• Client Status Badge Component: Color-coded status indicator
 
3.3 Work Queue
Route: /practice-hub/work-management/work-queue
Page Goal
Manage work items across all client engagements. View, assign, prioritize, and track work items. Monitor team workload and ensure timely completion of client deliverables.
Page Design
Layout: Kanban board (default) with list view toggle
Header: Total items, Due today, Overdue, Completed this week, Team capacity
Kanban Columns: To Do, In Progress, Review, Blocked, Done
View Options: By Client, By Staff, By Type, By Priority
Work Item Cards: Title, Client, Type, Assignee, Due date, Priority
Quick Actions: Add Item, Assign, Prioritize, Complete, Reassign
Filter Bar: Client, Staff, Type, Priority, Due date
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Add Item	Plus icon	Create work item	POST /api/work-items	Opens item form
Assign	UserPlus icon	Assign to staff	PUT /api/work-items/:id/assignee	Opens user selector
Set Priority	Flag icon	Change priority	PUT /api/work-items/:id/priority	Priority dropdown
Complete	Check icon	Mark complete	POST /api/work-items/:id/complete	Moves to Done
Reassign	Arrow icon	Reassign item	PUT /api/work-items/:id/assignee	Opens user selector
View Details	Eye icon	View item details	GET /api/work-items/:id	Opens detail modal
Add Time	Clock icon	Log time spent	POST /api/work-items/:id/time	Opens time entry
Export	Download icon	Export work items	GET /api/work-items/export	Downloads file
Tables & Data Displays
Table Name	Columns	Data Source	Features
Work Item Board	Columns by status with item cards	Work Items API	Drag-drop between columns
Work Item List	Title, Client, Type, Assignee, Due, Priority, Status	Work Items API	Sortable, filterable
Item Details	Full description, Subtasks, Time logged, Comments	Work Items API	Expandable sections
Team Workload	Staff, Items assigned, Hours logged, Capacity	Work Items API	Utilization view
Due Date Alerts	Item, Client, Due, Assignee, Days until	Work Items API	Priority sorted
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/practice/work-items	GET	List work items	client, assignee, status, priority, from, to, page, limit	Work item list
GET /api/work-items/:itemId	GET	Get item details	N/A	Full item information
POST /api/work-items	POST	Create item	title, clientId, type, assigneeId, priority, dueDate, description	Created item
PUT /api/work-items/:itemId	PUT	Update item	fields to update	Updated item
PUT /api/work-items/:itemId/status	PUT	Update status	status	Status updated (for drag-drop)
POST /api/work-items/:itemId/complete	POST	Complete item	notes	Item completed
POST /api/work-items/:itemId/time	POST	Log time	hours, notes, date	Time logged
GET /api/work-items/export	GET	Export items	format, filters	File download
UI Components Required
• Kanban Board Component: Drag-drop board with columns
• Work Item Card Component: Compact card with priority and assignee
• Work Item Form Component: Form with client, type, assignee fields
• Time Entry Component: Form for logging work hours
• Workload Summary Component: Team utilization display
• Priority Badge Component: Color-coded priority indicator
 
3.4 Monthly Close
Route: /practice-hub/work-management/monthly-close
Page Goal
Manage monthly close process for all client engagements. Track close status, manage close checklists, monitor deadlines, and ensure timely completion of period-end procedures.
Page Design
Layout: Close status dashboard with client progress
Header: Period being closed, Clients completed, In progress, Overdue, Days remaining
Client Cards: Company name, Close status, Completion %, Assigned staff, Due date
Status Types: Not Started, In Progress, Review, Completed, Overdue
Close Phases: Data Entry, Reconciliations, Adjustments, Reviews, Filing
Quick Actions: Start Close, Update Status, View Checklist, Complete Phase
Filter Bar: Status, Assigned staff, Close phase
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Start Close	Play icon	Begin close process	POST /api/monthly-close/start	Initializes close for client
Update Status	RefreshCw icon	Update close status	PUT /api/monthly-close/:id/status	Status dropdown
View Checklist	List icon	View close checklist	GET /api/monthly-close/:id/checklist	Opens checklist modal
Complete Phase	CheckCircle icon	Complete close phase	POST /api/monthly-close/:id/phase/complete	Marks phase done
Assign Reviewer	UserPlus icon	Assign for review	PUT /api/monthly-close/:id/reviewer	Opens user selector
View Issues	AlertTriangle icon	View close issues	GET /api/monthly-close/:id/issues	Shows blocking issues
Complete Close	CheckDouble icon	Finalize close	POST /api/monthly-close/:id/complete	Completes all phases
Export Report	Download icon	Export close report	GET /api/monthly-close/export	Downloads status report
Tables & Data Displays
Table Name	Columns	Data Source	Features
Close Status Dashboard	Client, Status, Progress, Phase, Assignee, Due	Monthly Close API	Progress bars
Close Checklist	Phase, Task, Status, Assignee, Completed date	Monthly Close API	Checkable items
Phase Progress	Phase, Tasks, Completed, Blocked, %	Monthly Close API	Visual progress
Issues Log	Issue, Phase, Severity, Assignee, Status	Monthly Close API	Resolution tracking
Team Assignments	Staff, Clients assigned, Completed, Overdue	Monthly Close API	Workload view
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/practice/monthly-close	GET	List close status	period, status, page, limit	Client close list
GET /api/monthly-close/:closeId	GET	Get close details	N/A	Full close information
POST /api/monthly-close/start	POST	Start close	clientId, period	Close initiated
PUT /api/monthly-close/:closeId/status	PUT	Update status	status, notes	Status updated
GET /api/monthly-close/:closeId/checklist	GET	Get checklist	N/A	Checklist items
POST /api/monthly-close/:closeId/phase/complete	POST	Complete phase	phase, notes	Phase completed
POST /api/monthly-close/:closeId/complete	POST	Complete close	notes	Close finalized
GET /api/monthly-close/export	GET	Export report	period, format	File download
UI Components Required
• Close Status Card Component: Card with progress bar and phase indicator
• Close Checklist Component: Expandable checklist with phases
• Phase Progress Component: Visual phase completion tracker
• Issues Panel Component: List of blocking issues with resolution
• Team Assignment Component: Staff workload for close period
• Period Selector Component: Month/year picker for close period
 
3.5 Practice Settings
Route: /practice-hub/settings/practice-profile
Page Goal
Configure practice-wide settings for the accounting firm. Manage practice profile, branding, service offerings, rate cards, and integration settings specific to practice management.
Page Design
Layout: Settings form with categorized sections
Sections: Practice Profile, Branding, Services, Rates, Notifications, Integrations
Practice Profile: Name, Address, Contact, License numbers, Specializations
Branding: Logo, Colors, Email templates, Document templates
Services: Service types offered, Engagement templates, Service packages
Rate Cards: Billing rates by staff level, Service rates, Flat fee schedules
Notifications: Practice alerts, Client notifications, Deadline reminders
Buttons & Actions
Button Name	Icon	Function	API Endpoint	Behavior
Edit	Pencil icon	Enable edit mode	N/A (Client state)	Toggles form editability
Save	Save icon	Save settings	PUT /api/practice/settings	Saves all changes
Upload Logo	Image icon	Upload practice logo	POST /api/practice/logo	Opens file picker
Add Service	Plus icon	Add service type	POST /api/practice/services	Opens service form
Edit Rates	DollarSign icon	Edit rate card	PUT /api/practice/rates	Opens rate editor
Preview Template	Eye icon	Preview document template	GET /api/practice/templates/:id/preview	Shows preview
Test Notification	Bell icon	Send test notification	POST /api/practice/notifications/test	Sends test
Reset Defaults	RefreshCw icon	Reset to defaults	POST /api/practice/settings/reset	Restores defaults
Tables & Data Displays
Table Name	Columns	Data Source	Features
Practice Profile Form	Name, Address, Contact, License, Specializations	Practice API	Editable fields
Branding Settings	Logo, Colors, Fonts, Email signatures	Practice API	Visual customization
Service Types	Name, Description, Default rate, Template	Practice API	CRUD operations
Rate Card Grid	Staff Level, Hourly Rate, Service Type, Rate	Practice API	Editable matrix
Notification Settings	Event, Recipients, Template, Active	Practice API	Toggleable items
Backend API Connections
API Endpoint	Method	Purpose	Request Params	Response
GET /api/practice/settings	GET	Get practice settings	N/A	All practice settings
PUT /api/practice/settings	PUT	Update settings	fields to update	Settings updated
POST /api/practice/logo	POST	Upload logo	file	Logo URL returned
GET /api/practice/services	GET	List services	N/A	Service types
POST /api/practice/services	POST	Add service	name, description, defaultRate	Service added
GET /api/practice/rates	GET	Get rate cards	N/A	Billing rates
PUT /api/practice/rates	PUT	Update rates	rates[]	Rates updated
POST /api/practice/settings/reset	POST	Reset settings	N/A	Defaults restored
UI Components Required
• Practice Form Component: Multi-section settings form
• Branding Customizer Component: Color picker and logo upload
• Service Manager Component: CRUD for service types
• Rate Card Editor Component: Editable rate matrix
• Notification Configurator Component: Event and template settings
• Template Preview Component: Document template preview

HaypBooks Page101 Documentation
Part 12: Non-Profit & Grants Module
Comprehensive Page Specifications for Implementation
1. Module Overview
The Non-Profit & Grants module provides comprehensive fund accounting capabilities designed specifically for non-profit organizations, charities, NGOs, and grant-funded entities. This module ensures compliance with fund accounting standards, grant tracking requirements, and donor management needs that differentiate non-profit financial management from traditional for-profit accounting. The module integrates with the core accounting system while providing specialized features for restricted fund tracking, grant lifecycle management, and donor relationship management.
1.1 Module Structure
Section	Pages	Purpose
Donors & Campaigns	3 pages	Manage donor relationships and fundraising campaigns
Fund Accounting	3 pages	Track funds, allocations, and restricted grants
2. Donors & Campaigns Section
2.1 Sponsors & Donors Page
Route: /non-profit/donors-campaigns/sponsors-donors
Page Goal
The Sponsors & Donors page serves as the central hub for managing all donor relationships within the organization. It provides a comprehensive view of individual donors, corporate sponsors, foundation partners, and government entities that contribute to the organization. The page enables users to track donor engagement history, contribution patterns, communication preferences, and relationship status. This page is critical for fundraising teams who need to maintain strong donor relationships, identify giving patterns, and plan targeted outreach campaigns.
Page Design
The page features a clean, professional layout optimized for relationship management. The top section includes a summary dashboard showing key donor metrics: total active donors, new donors this period, donor retention rate, and average gift size. Below the dashboard, a sophisticated data table displays donor information with advanced filtering and sorting capabilities. Each donor row shows the donor name, type (individual/corporate/foundation), total lifetime giving, last gift date, giving frequency, and relationship status. Quick action buttons allow users to view donor profiles, log interactions, and create acknowledgments. A sidebar panel provides quick access to recent activity, upcoming stewardship tasks, and donor segmentation tools.
Buttons and Functions
Button	Function	API Endpoint
New Donor	Opens form to add new donor/sponsor to the system	POST /api/companies/:companyId/nonprofit/donors
Import Donors	Bulk import donors from CSV/Excel file	POST /api/companies/:companyId/nonprofit/donors/import
Export List	Export filtered donor list to CSV/Excel	GET /api/companies/:companyId/nonprofit/donors/export
Segment Donors	Create and manage donor segments for campaigns	GET /api/companies/:companyId/nonprofit/donors/segments
Send Acknowledgment	Generate and send thank-you letters/receipts	POST /api/companies/:companyId/nonprofit/donors/:id/acknowledge
View Profile	Open detailed donor profile with full history	GET /api/companies/:companyId/nonprofit/donors/:id
Log Interaction	Record communication, meeting, or touchpoint	POST /api/companies/:companyId/nonprofit/donors/:id/interactions
Create Pledge	Create new pledge record for donor	POST /api/companies/:companyId/nonprofit/donors/:id/pledges
Data Tables
Column	Data Type	Description
Donor Name	String	Full name or organization name
Donor Type	Enum	Individual, Corporate, Foundation, Government
Total Giving	Decimal	Lifetime total contributions
Last Gift	Date	Date of most recent donation
Frequency	String	One-time, Monthly, Quarterly, Annual
Status	Enum	Active, Lapsed, Prospect, Archived
Assigned To	String	Staff member managing relationship
Next Touchpoint	Date	Scheduled next contact date
Backend API Connections
•	Primary Service: NonProfitService (src/nonprofit/nonprofit.service.ts)
•	Repository: NonProfitRepository (src/nonprofit/nonprofit.repository.ts)
•	Controller: NonProfitController (src/nonprofit/nonprofit.controller.ts)
•	Database Models: Donor, DonorInteraction, Pledge, Donation
2.2 Campaigns Page
Route: /non-profit/donors-campaigns/campaigns
Page Goal
The Campaigns page provides comprehensive management of fundraising campaigns, appeals, and initiatives. It enables organizations to plan, execute, and track the performance of various fundraising efforts including annual appeals, capital campaigns, emergency relief funds, and special events. The page supports goal-setting, progress tracking, donor segmentation for targeted outreach, and performance analytics. This page is essential for development teams who need to coordinate multi-channel fundraising efforts, measure campaign effectiveness, and optimize future campaigns based on historical data.
Page Design
The page features a campaign management dashboard with visual progress indicators and performance metrics. Active campaigns are displayed as cards showing goal progress, days remaining, donor count, and average gift size. A timeline view shows campaign milestones and deadlines. The main table lists all campaigns with status indicators (Planning, Active, Completed, Archived). Each campaign row includes key metrics and quick action buttons. A detailed campaign view panel slides out when selecting a campaign, showing comprehensive analytics including response rates, channel performance, and donor retention analysis.
Buttons and Functions
Button	Function	API Endpoint
New Campaign	Create new fundraising campaign	POST /api/companies/:companyId/nonprofit/campaigns
Clone Campaign	Duplicate existing campaign setup	POST /api/companies/:companyId/nonprofit/campaigns/:id/clone
Launch Campaign	Activate campaign and begin tracking	POST /api/companies/:companyId/nonprofit/campaigns/:id/launch
Pause Campaign	Temporarily pause campaign activity	POST /api/companies/:companyId/nonprofit/campaigns/:id/pause
Close Campaign	Finalize campaign and generate final report	POST /api/companies/:companyId/nonprofit/campaigns/:id/close
View Analytics	Open detailed campaign performance dashboard	GET /api/companies/:companyId/nonprofit/campaigns/:id/analytics
Export Report	Generate campaign summary report	GET /api/companies/:companyId/nonprofit/campaigns/:id/report
Manage Segments	Edit donor segments for campaign	GET /api/companies/:companyId/nonprofit/campaigns/:id/segments
Data Tables
Column	Data Type	Description
Campaign Name	String	Name of the fundraising campaign
Type	Enum	Annual Appeal, Capital, Emergency, Event
Start Date	Date	Campaign start date
End Date	Date	Campaign end date
Goal Amount	Decimal	Fundraising target amount
Raised	Decimal	Total amount raised to date
Donors	Integer	Number of unique donors
Status	Enum	Planning, Active, Paused, Completed
2.3 Pledges Page
Route: /non-profit/donors-campaigns/pledges
Page Goal
The Pledges page manages multi-year commitments and promised donations from donors. It tracks pledge schedules, payment status, reminder notifications, and pledge fulfillment rates. The page is critical for organizations that rely on pledged giving programs, where donors commit to giving specific amounts over extended periods. The page helps ensure timely follow-up on pledged amounts, tracks installment schedules, and provides visibility into expected future revenue from existing pledges.
Page Design
The page displays a pledges dashboard showing total outstanding pledges, upcoming payments, overdue amounts, and fulfillment rates. A timeline visualization shows expected payment schedule across fiscal years. The main data table lists all pledges with donor information, total pledged amount, paid-to-date, remaining balance, payment schedule, and next payment due date. Color-coded status indicators show pledges that are on-track, due soon, or overdue. Action buttons allow recording payments, sending reminders, or modifying pledge terms.
Buttons and Functions
Button	Function	API Endpoint
New Pledge	Create new pledge commitment	POST /api/companies/:companyId/nonprofit/pledges
Record Payment	Log payment against existing pledge	POST /api/companies/:companyId/nonprofit/pledges/:id/payments
Send Reminder	Send payment reminder to donor	POST /api/companies/:companyId/nonprofit/pledges/:id/remind
Modify Terms	Adjust pledge amount or schedule	PUT /api/companies/:companyId/nonprofit/pledges/:id
Write Off	Mark unpaid pledge as uncollectible	POST /api/companies/:companyId/nonprofit/pledges/:id/writeoff
View Schedule	Display full payment schedule	GET /api/companies/:companyId/nonprofit/pledges/:id/schedule
Generate Statement	Create pledge statement for donor	GET /api/companies/:companyId/nonprofit/pledges/:id/statement
Data Tables
Column	Data Type	Description
Donor	String	Name of pledging donor
Campaign	String	Associated campaign (if any)
Total Pledged	Decimal	Total commitment amount
Paid to Date	Decimal	Amount received so far
Balance	Decimal	Remaining unpaid amount
Frequency	Enum	Monthly, Quarterly, Annual, One-time
Next Payment	Date	Date of next scheduled payment
Status	Enum	Active, Completed, Overdue, Written-off
3. Fund Accounting Section
3.1 Funds Page
Route: /non-profit/fund-accounting/funds
Page Goal
The Funds page is the cornerstone of fund accounting, providing management of distinct funds that track restricted and unrestricted resources separately. Each fund represents a self-balancing set of accounts with its own assets, liabilities, revenues, and expenses. The page supports various fund types including unrestricted, temporarily restricted, permanently restricted, board-designated, and endowment funds. This page ensures compliance with FASB 117 and other non-profit accounting standards that require separate tracking of funds based on donor-imposed restrictions.
Page Design
The page features a fund overview dashboard showing total assets by fund type, fund balance trends, and compliance indicators. Each fund is displayed as a card showing current balance, fund type, restriction status, and recent activity. The main table provides detailed fund information including fund code, name, type, balance, net assets classification, and associated restricted purposes. A fund detail view shows the complete chart of accounts within each fund, recent transactions, and balance history. Visual indicators highlight funds approaching restriction expiration or requiring attention.
Buttons and Functions
Button	Function	API Endpoint
New Fund	Create new fund with accounting structure	POST /api/companies/:companyId/nonprofit/funds
View Transactions	Display all transactions for selected fund	GET /api/companies/:companyId/nonprofit/funds/:id/transactions
Transfer Between Funds	Process inter-fund transfer	POST /api/companies/:companyId/nonprofit/funds/transfer
Release Restrictions	Convert restricted to unrestricted	POST /api/companies/:companyId/nonprofit/funds/:id/release
Generate FASB Report	Create Statement of Financial Position	GET /api/companies/:companyId/nonprofit/funds/reports/fasb
Close Fund	Close fund and distribute remaining assets	POST /api/companies/:companyId/nonprofit/funds/:id/close
View Journal Entries	Show all journal entries for fund	GET /api/companies/:companyId/nonprofit/funds/:id/journal-entries
Data Tables
Column	Data Type	Description
Fund Code	String	Unique identifier for the fund
Fund Name	String	Descriptive name of the fund
Fund Type	Enum	Unrestricted, Temp Restricted, Perm Restricted
Balance	Decimal	Current fund balance
Net Assets	Enum	Without Donor Restrictions, With Donor Restrictions
Purpose	String	Stated purpose or restriction
Created	Date	Fund creation date
Status	Enum	Active, Inactive, Closed
3.2 Fund Allocations Page
Route: /non-profit/fund-accounting/fund-allocations
Page Goal
The Fund Allocations page manages the distribution of unrestricted or board-designated funds across various purposes, programs, or initiatives. It supports both automatic allocation rules (percentage-based distributions) and manual allocations for special circumstances. The page ensures that overhead costs, administrative expenses, and shared resources are properly allocated across funds according to organizational policies and regulatory requirements. This page is essential for maintaining accurate cost accounting and demonstrating proper fund utilization to donors and regulators.
Page Design
The page displays an allocation dashboard showing total allocations by category, allocation trends, and percentage breakdowns. A visual allocation tree shows how funds flow from source to destination. The main table lists allocation transactions with source fund, destination fund, amount, allocation basis, and effective date. Allocation rules are managed through a rules configuration panel where users can set up percentage-based automatic allocations triggered by revenue receipts or other events.
Buttons and Functions
Button	Function	API Endpoint
New Allocation	Create manual fund allocation	POST /api/companies/:companyId/nonprofit/allocations
Create Rule	Set up automatic allocation rule	POST /api/companies/:companyId/nonprofit/allocations/rules
Run Allocation	Execute allocation rules	POST /api/companies/:companyId/nonprofit/allocations/run
Reverse Allocation	Undo previous allocation	POST /api/companies/:companyId/nonprofit/allocations/:id/reverse
View Rules	Display all allocation rules	GET /api/companies/:companyId/nonprofit/allocations/rules
Allocation Report	Generate allocation summary	GET /api/companies/:companyId/nonprofit/allocations/report
3.3 Restricted Grants Page
Route: /non-profit/fund-accounting/restricted-grants
Page Goal
The Restricted Grants page provides comprehensive management of grant-funded projects and programs. It tracks grant awards from application through final reporting, ensuring compliance with grantor requirements and proper recognition of restricted revenue. The page monitors grant budgets, expenditure tracking, matching requirements, and reporting deadlines. This page is critical for organizations receiving government grants, foundation grants, or corporate sponsorships that come with specific restrictions on use and reporting obligations.
Page Design
The page features a grants pipeline view showing grants at various stages from application to closeout. Active grants are displayed with progress indicators showing budget utilization, timeline progress, and compliance status. A calendar widget highlights upcoming reporting deadlines. The main table lists all grants with funder name, grant amount, award period, remaining balance, and compliance status. A detailed grant view shows budget vs. actual spending, deliverables tracking, and report submission history.
Buttons and Functions
Button	Function	API Endpoint
New Grant	Record new grant award	POST /api/companies/:companyId/nonprofit/grants
Record Expenditure	Log grant spending	POST /api/companies/:companyId/nonprofit/grants/:id/expenditures
Submit Report	File required grant report	POST /api/companies/:companyId/nonprofit/grants/:id/reports
Request Modification	Submit grant modification request	POST /api/companies/:companyId/nonprofit/grants/:id/modifications
Draw Funds	Request grant disbursement	POST /api/companies/:companyId/nonprofit/grants/:id/draws
View Budget	Display grant budget details	GET /api/companies/:companyId/nonprofit/grants/:id/budget
Close Grant	Complete grant closeout process	POST /api/companies/:companyId/nonprofit/grants/:id/close
Data Tables
Column	Data Type	Description
Grant Name	String	Name/title of the grant
Funder	String	Granting organization name
Award Amount	Decimal	Total grant award
Drawn to Date	Decimal	Amount received/drawn
Expended	Decimal	Amount spent
Balance	Decimal	Remaining available funds
Period Start	Date	Grant period start
Period End	Date	Grant period end
Next Report Due	Date	Upcoming reporting deadline
Status	Enum	Pending, Active, Reporting, Closed
4. UI Components Reference
The Non-Profit & Grants module utilizes the following reusable UI components from the HaypBooks component library. Each component is designed for consistent user experience across the platform while supporting the specialized needs of non-profit financial management.
Component	Location	Purpose
DonorCard	@/components/nonprofit/DonorCard	Display donor summary with quick actions
CampaignProgressCard	@/components/nonprofit/CampaignProgressCard	Visual campaign progress indicator
FundBalanceCard	@/components/nonprofit/FundBalanceCard	Fund summary with balance display
GrantTimeline	@/components/nonprofit/GrantTimeline	Grant lifecycle timeline visualization
PledgeSchedule	@/components/nonprofit/PledgeSchedule	Payment schedule calendar view
AllocationMatrix	@/components/nonprofit/AllocationMatrix	Fund allocation configuration grid
DonorSearchFilter	@/components/nonprofit/DonorSearchFilter	Advanced donor filtering component
ComplianceIndicator	@/components/nonprofit/ComplianceIndicator	Grant compliance status badge
5. Database Models Reference
The following Prisma models support the Non-Profit & Grants module functionality. These models integrate with the core accounting system while providing specialized structures for fund accounting and donor management.
Model	Purpose	Key Fields
Donor	Donor/Sponsor records	id, contactId, type, status, lifetimeGiving
Donation	Individual donation records	id, donorId, fundId, amount, date, type
Pledge	Pledge commitments	id, donorId, campaignId, totalAmount, schedule
Campaign	Fundraising campaigns	id, name, type, goal, startDate, endDate
Fund	Fund accounting entities	id, code, name, type, balance, netAssetClass
FundAllocation	Inter-fund allocations	id, sourceFundId, destFundId, amount, basis
Grant	Grant awards	id, funderId, amount, period, status
GrantReport	Grant reporting records	id, grantId, type, dueDate, status
6. Implementation Notes
This module requires careful attention to fund accounting principles and non-profit regulatory compliance. Key implementation considerations include proper handling of restricted vs. unrestricted funds, automatic release of temporarily restricted funds when restrictions are met, accurate revenue recognition for multi-year pledges, and comprehensive audit trails for all fund movements. Integration with the core Chart of Accounts ensures that fund transactions properly flow to the general ledger while maintaining separate fund-level tracking.

HaypBooks Page101 Documentation
Part 13: Retail & Commerce Module
Comprehensive Page Specifications for Implementation
1. Module Overview
The Retail & Commerce module provides specialized features for businesses that operate customer loyalty programs, gift card systems, and other customer engagement initiatives. This module is designed for retail businesses, restaurants, service providers, and e-commerce operations that need to manage customer rewards, prepaid value instruments, and customer relationship tracking as part of their overall financial management. The module integrates with the core sales and accounts receivable systems while providing dedicated tools for loyalty program administration and gift card lifecycle management.
1.1 Module Structure
Section	Pages	Purpose
Loyalty Programs	3 pages	Manage loyalty programs, tiers, and points tracking
Gift Cards	2 pages	Gift card issuance, redemption, and management
2. Loyalty Programs Section
2.1 Programs & Tiers Page
Route: /retail-commerce/loyalty-programs/programs-tiers
Page Goal
The Programs & Tiers page serves as the central configuration hub for all loyalty program management. It enables businesses to create and manage multiple loyalty programs, each with customizable earning rules, redemption options, and tier structures. The page supports various loyalty program types including points-based systems, spend-based rewards, frequency programs, and hybrid models. Users can configure tier thresholds, benefits, and progression rules that automatically upgrade customers as they qualify for higher tiers. This page is essential for marketing and customer experience teams who need to design, launch, and optimize loyalty initiatives that drive customer retention and lifetime value.
Page Design
The page features a program dashboard displaying active programs with key metrics including member count, points outstanding, redemption rate, and program ROI. Each program card shows program name, type, status, and performance indicators. A tier visualization displays the tier hierarchy with member distribution across tiers. The configuration panel allows editing of earning rates, redemption values, bonus multipliers, and promotional offers. The main table lists all programs with enrollment numbers, active members, points liability, and program health indicators. Quick actions allow creating new programs, duplicating existing configurations, or adjusting program parameters.
Buttons and Functions
Button	Function	API Endpoint
New Program	Create new loyalty program with configuration wizard	POST /api/companies/:companyId/loyalty/programs
Edit Program	Modify program rules and tier structure	PUT /api/companies/:companyId/loyalty/programs/:id
Add Tier	Create new tier level within program	POST /api/companies/:companyId/loyalty/programs/:id/tiers
Configure Earning	Set up points earning rules	POST /api/companies/:companyId/loyalty/programs/:id/earning-rules
Configure Redemption	Define redemption options and rates	POST /api/companies/:companyId/loyalty/programs/:id/redemption-rules
Launch Campaign	Create promotional bonus campaign	POST /api/companies/:companyId/loyalty/programs/:id/campaigns
View Analytics	Display program performance dashboard	GET /api/companies/:companyId/loyalty/programs/:id/analytics
Pause Program	Temporarily suspend program activity	POST /api/companies/:companyId/loyalty/programs/:id/pause
Archive Program	Close program and settle outstanding points	POST /api/companies/:companyId/loyalty/programs/:id/archive
Data Tables
Column	Data Type	Description
Program Name	String	Name of the loyalty program
Program Type	Enum	Points, Spend, Frequency, Hybrid
Status	Enum	Draft, Active, Paused, Archived
Members	Integer	Total enrolled members
Active Members	Integer	Members with recent activity
Points Outstanding	Decimal	Total unredeemed points liability
Redemption Rate	Decimal	Percentage of points redeemed
Avg Points/Member	Decimal	Average points per member
2.2 Loyalty Accounts Page
Route: /retail-commerce/loyalty-programs/loyalty-accounts
Page Goal
The Loyalty Accounts page provides comprehensive management of individual member accounts across all loyalty programs. It displays member enrollment information, current tier status, points balance, transaction history, and engagement metrics. The page enables customer service representatives to look up accounts, resolve issues, make manual adjustments, and view complete activity history. This page is critical for customer support teams who need to handle member inquiries, process point adjustments, and manage account-related issues.
Page Design
The page features a powerful search interface allowing lookup by member ID, phone number, email, or name. Search results display in a table with member name, program, tier, points balance, and last activity date. Selecting a member opens a detailed account view showing profile information, linked accounts, tier progression history, points ledger, and recent transactions. The account view includes action buttons for manual point adjustments, tier overrides, account merging, and communication history. A points ledger shows all earning and redemption transactions with running balance.
Buttons and Functions
Button	Function	API Endpoint
Search Accounts	Find accounts by various criteria	GET /api/companies/:companyId/loyalty/accounts/search
View Account	Display full account details	GET /api/companies/:companyId/loyalty/accounts/:id
Adjust Points	Manually add or deduct points	POST /api/companies/:companyId/loyalty/accounts/:id/adjust
Override Tier	Manually set tier level	POST /api/companies/:companyId/loyalty/accounts/:id/tier-override
Merge Accounts	Combine duplicate accounts	POST /api/companies/:companyId/loyalty/accounts/merge
View Transactions	Display transaction history	GET /api/companies/:companyId/loyalty/accounts/:id/transactions
Redeem Points	Process manual redemption	POST /api/companies/:companyId/loyalty/accounts/:id/redeem
Transfer Points	Move points between accounts	POST /api/companies/:companyId/loyalty/accounts/transfer
Export Account	Download account statement	GET /api/companies/:companyId/loyalty/accounts/:id/export
Data Tables
Column	Data Type	Description
Account ID	String	Unique account identifier
Member Name	String	Customer name
Program	String	Enrolled loyalty program
Current Tier	String	Current tier level
Points Balance	Decimal	Available points
Lifetime Points	Decimal	Total points ever earned
Enroll Date	Date	Account creation date
Last Activity	Date	Most recent transaction
Status	Enum	Active, Inactive, Suspended
2.3 Points Ledger Page
Route: /retail-commerce/loyalty-programs/points-ledger
Page Goal
The Points Ledger page provides a comprehensive audit trail of all points transactions across the loyalty program ecosystem. It tracks every point earning event (purchases, bonuses, promotions), redemption event (rewards claimed, points used), expiration event (points expired due to policy), and adjustment event (manual changes, corrections). The page is essential for financial reporting, audit compliance, and liability tracking related to outstanding points obligations.
Page Design
The page displays a summary dashboard showing total points earned, redeemed, expired, and outstanding for selected date ranges. Filter controls allow narrowing by program, transaction type, date range, or specific accounts. The main ledger table shows transaction date, account, type (earn/redeem/expire/adjust), reference (invoice/receipt number), points amount, running balance, and operator. Export functionality supports compliance reporting and reconciliation with financial records.
Buttons and Functions
Button	Function	API Endpoint
Filter Ledger	Apply filters to transaction list	GET /api/companies/:companyId/loyalty/ledger
Export Ledger	Download ledger to CSV/Excel	GET /api/companies/:companyId/loyalty/ledger/export
View Transaction	Display transaction details	GET /api/companies/:companyId/loyalty/ledger/:id
Run Expiration	Process points expiration batch	POST /api/companies/:companyId/loyalty/ledger/expire
Generate Liability Report	Calculate outstanding points liability	GET /api/companies/:companyId/loyalty/ledger/liability
Reconcile	Match ledger to source transactions	POST /api/companies/:companyId/loyalty/ledger/reconcile
Data Tables
Column	Data Type	Description
Date	DateTime	Transaction timestamp
Account ID	String	Associated account
Type	Enum	Earn, Redeem, Expire, Adjust, Bonus
Points	Decimal	Points amount (+/-)
Reference	String	Invoice/Receipt/Transaction ID
Description	String	Transaction description
Balance After	Decimal	Account balance post-transaction
Operator	String	User who processed (if manual)
3. Gift Cards Section
3.1 Gift Card Manager Page
Route: /retail-commerce/gift-cards/gift-card-manager
Page Goal
The Gift Card Manager page provides comprehensive administration of gift card programs including physical cards, digital e-gift cards, and corporate bulk gift cards. It handles the complete lifecycle from issuance through redemption to expiry management. The page supports multiple gift card types including fixed-value cards, variable-value cards, promotional cards, and reloadable cards. This page is essential for retail operations teams who need to manage gift card inventory, process activations, handle customer inquiries, and reconcile gift card liability accounts.
Page Design
The page features a dashboard showing outstanding gift card liability, cards sold this period, redemption rate, and average card value. A quick-lookup tool allows searching by card number or last digits. The main table lists gift cards with card number (masked), original value, current balance, issue date, expiry date, and status. Filters allow viewing by status (active, redeemed, expired, suspended), value range, or date ranges. Card detail view shows complete transaction history, activation details, and ownership information if registered.
Buttons and Functions
Button	Function	API Endpoint
Issue Card	Create and activate new gift card	POST /api/companies/:companyId/giftcards
Issue Bulk Cards	Generate multiple cards for corporate order	POST /api/companies/:companyId/giftcards/bulk
Activate Card	Activate pre-printed physical card	POST /api/companies/:companyId/giftcards/:id/activate
Reload Card	Add value to reloadable card	POST /api/companies/:companyId/giftcards/:id/reload
Redeem Card	Process gift card redemption	POST /api/companies/:companyId/giftcards/:id/redeem
Check Balance	Query card balance	GET /api/companies/:companyId/giftcards/:id/balance
Suspend Card	Temporarily block card usage	POST /api/companies/:companyId/giftcards/:id/suspend
Replace Card	Issue replacement for lost/stolen card	POST /api/companies/:companyId/giftcards/:id/replace
Run Expiry	Process expired cards batch	POST /api/companies/:companyId/giftcards/expire
View Transactions	Display card transaction history	GET /api/companies/:companyId/giftcards/:id/transactions
Data Tables
Column	Data Type	Description
Card Number	String	Gift card number (masked for security)
Type	Enum	Physical, Digital, Promotional, Reloadable
Original Value	Decimal	Initial card value
Current Balance	Decimal	Remaining balance
Issue Date	Date	Date card was issued
Expiry Date	Date	Card expiration date
Recipient	String	Registered recipient name
Status	Enum	Inactive, Active, Redeemed, Expired, Suspended
3.2 Issuance & Redemption Page
Route: /retail-commerce/gift-cards/issuance-redemption
Page Goal
The Issuance & Redemption page provides detailed tracking and reporting of all gift card transactions including sales, redemptions, reloads, and adjustments. It serves as a comprehensive transaction log for reconciliation, audit, and analysis purposes. The page helps finance teams reconcile gift card liability accounts, track redemption patterns, and analyze the financial impact of gift card programs on revenue recognition and deferred revenue.
Page Design
The page displays transaction summary cards showing daily volumes for issuances, redemptions, reloads, and net change. Trend charts visualize transaction patterns over time. The main transaction log shows timestamp, card number, transaction type, amount, location/channel, operator, and reference. Filter controls allow drilling down by date range, transaction type, channel, or card. Export options support reconciliation with POS systems and financial reporting.
Buttons and Functions
Button	Function	API Endpoint
Filter Transactions	Apply filters to transaction log	GET /api/companies/:companyId/giftcards/transactions
Export Transactions	Download transaction history	GET /api/companies/:companyId/giftcards/transactions/export
Reconcile	Match transactions to POS/sales records	POST /api/companies/:companyId/giftcards/reconcile
Generate Report	Create gift card activity report	GET /api/companies/:companyId/giftcards/report
View Deferred Revenue	Show deferred revenue breakdown	GET /api/companies/:companyId/giftcards/deferred-revenue
Post to GL	Create journal entries for transactions	POST /api/companies/:companyId/giftcards/post-to-gl
Data Tables
Column	Data Type	Description
Timestamp	DateTime	Transaction date and time
Card Number	String	Gift card number (masked)
Type	Enum	Issue, Redeem, Reload, Adjust, Expire
Amount	Decimal	Transaction amount
Balance After	Decimal	Card balance post-transaction
Channel	Enum	POS, Online, Mobile, Corporate
Location	String	Store/branch identifier
Reference	String	Invoice/Transaction ID
Operator	String	Staff who processed
4. UI Components Reference
Component	Location	Purpose
ProgramCard	@/components/retail/ProgramCard	Display loyalty program summary
TierBadge	@/components/retail/TierBadge	Visual tier level indicator
PointsDisplay	@/components/retail/PointsDisplay	Animated points balance display
GiftCardTile	@/components/retail/GiftCardTile	Gift card status visualization
TransactionTimeline	@/components/retail/TransactionTimeline	Transaction history timeline
MemberSearch	@/components/retail/MemberSearch	Loyalty member lookup component
QuickRedeem	@/components/retail/QuickRedeem	Fast redemption interface
LiabilityGauge	@/components/retail/LiabilityGauge	Points/gift card liability indicator
5. Database Models Reference
Model	Purpose	Key Fields
LoyaltyProgram	Loyalty program configuration	id, name, type, earningRate, status
LoyaltyTier	Tier level definition	id, programId, name, threshold, benefits
LoyaltyAccount	Member account	id, programId, customerId, tierId, pointsBalance
PointsTransaction	Points ledger entry	id, accountId, type, points, reference
GiftCard	Gift card record	id, number, type, originalValue, balance, status
GiftCardTransaction	Gift card activity	id, giftCardId, type, amount, reference
6. Implementation Notes
The Retail & Commerce module requires careful attention to financial liability management. Points and gift cards represent deferred revenue that must be properly tracked for GAAP compliance. Key considerations include proper revenue recognition timing (at redemption rather than issuance), breakage estimation for unredeemed points/cards, and escheatment compliance for dormant cards. Integration with the Chart of Accounts ensures that gift card liability and deferred revenue accounts are automatically updated. The loyalty points ledger provides audit trail support for financial reporting on outstanding loyalty obligations.

HaypBooks Page101 Documentation
Part 14: Automation Module
Comprehensive Page Specifications for Implementation
1. Module Overview
The Automation module provides powerful workflow automation, approval management, AI-powered features, and scheduling capabilities that streamline accounting operations and reduce manual effort. This module enables organizations to create automated workflows, configure intelligent rules, set up approval hierarchies, and leverage AI capabilities for bookkeeping, matching, and document recognition. The module is designed to improve operational efficiency, ensure compliance with approval policies, and reduce human error in routine accounting tasks.
1.1 Module Structure
Section	Pages	Purpose
Workflow Engine	3 pages	Create and manage automated workflows
Approvals & Governance	3 pages	Configure approval matrices and chains
AI & Intelligence	3 pages	AI bookkeeping and smart matching
Scheduling	3 pages	Scheduled reports and batch processing
Monitoring	2 pages	Automation logs and error management
2. Workflow Engine Section
2.1 Workflow Builder Page
Route: /automation/workflow-engine/workflow-builder
Page Goal
The Workflow Builder page provides a visual, no-code interface for creating automated workflows that respond to business events and trigger actions. Users can design workflows using a drag-and-drop interface with triggers (events that start the workflow), conditions (logic gates), and actions (tasks to execute). The page supports complex multi-step workflows with branching logic, parallel execution paths, and error handling. This page is essential for operations managers who need to automate routine processes such as invoice approval routing, payment reminders, document generation, and notification workflows.
Page Design
The page features a canvas-based workflow designer with a toolbar of available trigger types, condition blocks, and action components. Workflows are displayed as flowcharts with nodes representing each step. The left panel shows a library of workflow templates organized by category (AP, AR, Banking, Reporting). The right panel shows configuration options for the selected workflow element. A test mode allows simulating workflow execution with sample data. The bottom panel shows workflow history and execution statistics.
Buttons and Functions
Button	Function	API Endpoint
New Workflow	Create blank workflow from scratch	POST /api/companies/:companyId/automation/workflows
Save Workflow	Save workflow configuration	PUT /api/companies/:companyId/automation/workflows/:id
Add Trigger	Configure workflow trigger event	POST /api/companies/:companyId/automation/workflows/:id/triggers
Add Condition	Add conditional logic branch	POST /api/companies/:companyId/automation/workflows/:id/conditions
Add Action	Add action step to workflow	POST /api/companies/:companyId/automation/workflows/:id/actions
Test Workflow	Simulate execution with test data	POST /api/companies/:companyId/automation/workflows/:id/test
Activate	Enable workflow for live execution	POST /api/companies/:companyId/automation/workflows/:id/activate
Deactivate	Pause workflow execution	POST /api/companies/:companyId/automation/workflows/:id/deactivate
View Runs	Show workflow execution history	GET /api/companies/:companyId/automation/workflows/:id/runs
Duplicate	Copy workflow configuration	POST /api/companies/:companyId/automation/workflows/:id/duplicate
2.2 Smart Rules Page
Route: /automation/workflow-engine/smart-rules
Page Goal
The Smart Rules page provides a simplified interface for creating business rules without building full workflows. Smart rules are condition-action pairs that automatically execute when specified conditions are met. Examples include auto-categorizing transactions based on description patterns, auto-applying payment terms based on customer segments, and auto-tagging transactions based on amount thresholds. The page supports both simple rules and complex rule sets with multiple conditions and compound logic.
Page Design
The page displays rules in a table format with rule name, trigger type, condition summary, action summary, execution count, and status. A rule editor panel allows defining conditions using a form-based interface with dropdown selectors for fields, operators, and values. Action configuration supports various outcome types including field updates, email notifications, task creation, and workflow triggers. A priority setting determines execution order when multiple rules match.
Buttons and Functions
Button	Function	API Endpoint
New Rule	Create new smart rule	POST /api/companies/:companyId/automation/rules
Edit Rule	Modify existing rule	PUT /api/companies/:companyId/automation/rules/:id
Add Condition	Define trigger condition	POST /api/companies/:companyId/automation/rules/:id/conditions
Set Action	Configure rule action	POST /api/companies/:companyId/automation/rules/:id/actions
Test Rule	Evaluate rule against sample data	POST /api/companies/:companyId/automation/rules/:id/test
Toggle Active	Enable/disable rule	POST /api/companies/:companyId/automation/rules/:id/toggle
Reorder	Change rule priority	POST /api/companies/:companyId/automation/rules/:id/reorder
View Matches	Show recent rule matches	GET /api/companies/:companyId/automation/rules/:id/matches
2.3 Email Notifications Page
Route: /automation/workflow-engine/email-notifications
Page Goal
The Email Notifications page manages all automated email communications generated by the system including alerts, reminders, reports, and workflow notifications. Users can configure email templates, set delivery schedules, manage recipient lists, and track email delivery status. The page supports both transactional emails triggered by events and scheduled emails sent on recurring schedules.
Page Design
The page shows notification templates organized by category (Alerts, Reminders, Reports, Workflows). Each template shows name, trigger event, recipient type, last sent, and status. A template editor allows customizing subject lines, body content with variable placeholders, and attachments. A delivery log shows recent emails with recipient, subject, sent time, and open/click status.
Buttons and Functions
Button	Function	API Endpoint
New Template	Create email notification template	POST /api/companies/:companyId/automation/notifications/templates
Edit Template	Modify template content	PUT /api/companies/:companyId/automation/notifications/templates/:id
Preview	Preview email with sample data	POST /api/companies/:companyId/automation/notifications/templates/:id/preview
Send Test	Send test email to self	POST /api/companies/:companyId/automation/notifications/templates/:id/test
Configure Schedule	Set up recurring delivery	POST /api/companies/:companyId/automation/notifications/templates/:id/schedule
View Log	Display delivery history	GET /api/companies/:companyId/automation/notifications/log
Resend	Resend failed notification	POST /api/companies/:companyId/automation/notifications/:id/resend
3. Approvals & Governance Section
3.1 Approval Matrices Page
Route: /automation/approvals-governance/approval-matrices
Page Goal
The Approval Matrices page configures the rules that determine which approvers are required for different types of transactions based on criteria such as amount, department, vendor/customer, or transaction type. The matrix defines approval thresholds, approval chains, and approval limits for different roles and individuals. This page is critical for organizations that need to enforce internal controls and segregation of duties in their financial processes.
Page Design
The page displays approval matrices in a grid format with transaction types as rows and amount ranges as columns. Each cell shows the required approver(s). A matrix editor allows defining approval rules with conditions (transaction type, amount threshold, department, etc.) and required approvers (specific users or roles). Preview functionality shows how a sample transaction would be routed through the approval process.
Buttons and Functions
Button	Function	API Endpoint
New Matrix	Create approval matrix	POST /api/companies/:companyId/automation/approvals/matrices
Edit Matrix	Modify matrix configuration	PUT /api/companies/:companyId/automation/approvals/matrices/:id
Add Rule	Add approval rule to matrix	POST /api/companies/:companyId/automation/approvals/matrices/:id/rules
Test Routing	Simulate approval routing	POST /api/companies/:companyId/automation/approvals/matrices/:id/test
Activate	Enable matrix for use	POST /api/companies/:companyId/automation/approvals/matrices/:id/activate
View History	Show approval routing history	GET /api/companies/:companyId/automation/approvals/matrices/:id/history
3.2 Approval Chains Page
Route: /automation/approvals-governance/approval-chains
Page Goal
The Approval Chains page configures multi-level approval sequences where approvals must be obtained in a specific order. This supports hierarchical approval processes where junior approvers review first and senior approvers provide final authorization. The page enables setting up sequential, parallel, or hybrid approval patterns with escalation rules for delayed approvals.
Page Design
The page displays approval chains as visual flowcharts showing the sequence of approval steps. Each step shows the approver (user or role), approval type (any of, all of), timeout period, and escalation target. Chain configuration allows setting up conditional branching based on approval decisions. A simulation feature shows how a request would flow through the chain.
Buttons and Functions
Button	Function	API Endpoint
New Chain	Create approval chain	POST /api/companies/:companyId/automation/approvals/chains
Add Step	Add approval step to chain	POST /api/companies/:companyId/automation/approvals/chains/:id/steps
Configure Escalation	Set up timeout escalation	POST /api/companies/:companyId/automation/approvals/chains/:id/escalation
Preview Chain	Visualize approval flow	GET /api/companies/:companyId/automation/approvals/chains/:id/preview
Activate	Enable chain for use	POST /api/companies/:companyId/automation/approvals/chains/:id/activate
3.3 Delegation Rules Page
Route: /automation/approvals-governance/delegation-rules
Page Goal
The Delegation Rules page manages temporary approval delegation when primary approvers are unavailable due to vacation, travel, or other absence. It allows setting up automatic delegation based on date ranges, approval types, and delegation limits. This ensures business continuity by routing approvals to designated backups without requiring manual intervention for each request.
Buttons and Functions
Button	Function	API Endpoint
New Delegation	Set up delegation rule	POST /api/companies/:companyId/automation/approvals/delegations
Edit Delegation	Modify delegation settings	PUT /api/companies/:companyId/automation/approvals/delegations/:id
Set Schedule	Define delegation period	POST /api/companies/:companyId/automation/approvals/delegations/:id/schedule
Set Limits	Configure delegation authority limits	POST /api/companies/:companyId/automation/approvals/delegations/:id/limits
Activate	Enable delegation rule	POST /api/companies/:companyId/automation/approvals/delegations/:id/activate
View Active	Show currently active delegations	GET /api/companies/:companyId/automation/approvals/delegations/active
4. AI & Intelligence Section
4.1 AI Bookkeeping Page
Route: /automation/ai-intelligence/ai-bookkeeping
Page Goal
The AI Bookkeeping page manages automated transaction categorization and coding suggestions powered by machine learning. The AI learns from historical transaction patterns to suggest accounts, departments, and tags for new transactions. The page shows pending suggestions awaiting review, confidence scores, and learning progress metrics. Users can train the model by confirming or correcting suggestions, improving accuracy over time.
Page Design
The page displays a dashboard showing AI performance metrics: accuracy rate, suggestions pending, suggestions confirmed, model confidence level. A queue of pending transactions shows suggested categorizations with confidence scores. Quick action buttons allow accepting or correcting suggestions. A training interface allows providing feedback to improve model accuracy. Settings control confidence thresholds for auto-acceptance vs. human review.
Buttons and Functions
Button	Function	API Endpoint
View Suggestions	Display pending AI suggestions	GET /api/companies/:companyId/automation/ai/suggestions
Accept All	Accept all high-confidence suggestions	POST /api/companies/:companyId/automation/ai/suggestions/accept-all
Review Queue	Open suggestion review interface	GET /api/companies/:companyId/automation/ai/review
Train Model	Provide corrective feedback	POST /api/companies/:companyId/automation/ai/train
View Accuracy	Display model performance metrics	GET /api/companies/:companyId/automation/ai/accuracy
Reset Model	Retrain from historical data	POST /api/companies/:companyId/automation/ai/reset
Configure Thresholds	Set confidence thresholds	PUT /api/companies/:companyId/automation/ai/config
4.2 Smart Matching Page
Route: /automation/ai-intelligence/smart-matching
Page Goal
The Smart Matching page automates the matching of bank transactions to invoices, bills, and other source documents. Using intelligent matching algorithms, the system identifies likely matches based on amount, date proximity, reference numbers, and vendor/customer patterns. The page displays potential matches with confidence scores and allows one-click confirmation or manual override.
Buttons and Functions
Button	Function	API Endpoint
Run Matching	Execute matching algorithm	POST /api/companies/:companyId/automation/ai/matching/run
View Matches	Display suggested matches	GET /api/companies/:companyId/automation/ai/matching/suggestions
Confirm Match	Accept suggested match	POST /api/companies/:companyId/automation/ai/matching/:id/confirm
Reject Match	Reject suggested match	POST /api/companies/:companyId/automation/ai/matching/:id/reject
Manual Match	Create manual match	POST /api/companies/:companyId/automation/ai/matching/manual
View Unmatched	Show unmatched items	GET /api/companies/:companyId/automation/ai/matching/unmatched
4.3 Document Recognition Page
Route: /automation/ai-intelligence/document-recognition
Page Goal
The Document Recognition page manages AI-powered extraction of data from uploaded documents including invoices, receipts, bills, and bank statements. The system uses OCR and machine learning to identify document type, extract key fields (vendor, date, amounts, line items), and create draft transactions. Users review and confirm extracted data before posting.
Buttons and Functions
Button	Function	API Endpoint
Upload Document	Upload document for processing	POST /api/companies/:companyId/automation/ai/documents/upload
Process Queue	Process uploaded documents	POST /api/companies/:companyId/automation/ai/documents/process
Review Extracts	Review extracted data	GET /api/companies/:companyId/automation/ai/documents/review
Confirm Extract	Confirm extracted transaction	POST /api/companies/:companyId/automation/ai/documents/:id/confirm
Correct Extract	Manually correct extraction	PUT /api/companies/:companyId/automation/ai/documents/:id
Train Extractor	Provide extraction feedback	POST /api/companies/:companyId/automation/ai/documents/train
5. Scheduling Section
5.1 Scheduled Reports Page
Route: /automation/scheduling/scheduled-reports
Page Goal
The Scheduled Reports page manages automatic generation and distribution of reports on recurring schedules. Users can schedule any report in the system for automatic generation and delivery via email, export to file storage, or API webhook. The page supports various schedule types including daily, weekly, monthly, and custom cron expressions.
Buttons and Functions
Button	Function	API Endpoint
New Schedule	Create report schedule	POST /api/companies/:companyId/automation/schedules
Edit Schedule	Modify schedule settings	PUT /api/companies/:companyId/automation/schedules/:id
Run Now	Execute schedule immediately	POST /api/companies/:companyId/automation/schedules/:id/run
Pause Schedule	Temporarily disable schedule	POST /api/companies/:companyId/automation/schedules/:id/pause
View History	Show execution history	GET /api/companies/:companyId/automation/schedules/:id/history
5.2 Batch Processing Page
Route: /automation/scheduling/batch-processing
Page Goal
The Batch Processing page manages scheduled execution of batch operations such as recurring invoice generation, payment runs, depreciation calculations, and period-end processes. Users can set up batch jobs with defined parameters and execution schedules. The page monitors batch job status, handles errors, and provides execution logs.
Buttons and Functions
Button	Function	API Endpoint
New Batch Job	Create batch processing job	POST /api/companies/:companyId/automation/batches
Configure Job	Set job parameters	PUT /api/companies/:companyId/automation/batches/:id
Run Job	Execute batch job	POST /api/companies/:companyId/automation/batches/:id/run
View Status	Check job execution status	GET /api/companies/:companyId/automation/batches/:id/status
View Log	Display execution log	GET /api/companies/:companyId/automation/batches/:id/log
Retry Failed	Retry failed job items	POST /api/companies/:companyId/automation/batches/:id/retry
5.3 Recurring Templates Hub Page
Route: /automation/scheduling/recurring-templates-hub
Page Goal
The Recurring Templates Hub provides centralized management of all recurring transaction templates including recurring invoices, recurring bills, recurring journal entries, and recurring expense claims. Users can create, edit, and manage templates that automatically generate transactions on defined schedules.
Buttons and Functions
Button	Function	API Endpoint
New Template	Create recurring template	POST /api/companies/:companyId/automation/templates
Edit Template	Modify template details	PUT /api/companies/:companyId/automation/templates/:id
Preview	Preview generated transaction	GET /api/companies/:companyId/automation/templates/:id/preview
Generate Now	Execute template immediately	POST /api/companies/:companyId/automation/templates/:id/generate
View History	Show generation history	GET /api/companies/:companyId/automation/templates/:id/history
6. Monitoring Section
6.1 Automation Logs Page
Route: /automation/monitoring/automation-logs
Page Goal
The Automation Logs page provides comprehensive logging of all automated activities including workflow executions, rule evaluations, scheduled jobs, and AI operations. Users can search and filter logs to investigate issues, audit automation activities, and analyze performance patterns.
Data Tables
Column	Data Type	Description
Timestamp	DateTime	Log entry time
Type	Enum	Workflow, Rule, Schedule, AI, Batch
Name	String	Automation name
Action	String	Specific action executed
Status	Enum	Success, Failed, Partial
Duration	Integer	Execution time in ms
Details	String	Additional information
User	String	Triggering user (if applicable)
6.2 Error Queue Page
Route: /automation/monitoring/error-queue
Page Goal
The Error Queue page displays failed automation tasks requiring attention. It shows errors from workflows, scheduled jobs, batch processes, and integrations. Users can view error details, retry failed operations, or mark errors as resolved after manual correction.
Buttons and Functions
Button	Function	API Endpoint
View Errors	Display error queue	GET /api/companies/:companyId/automation/errors
Retry	Retry failed operation	POST /api/companies/:companyId/automation/errors/:id/retry
Resolve	Mark error as resolved	POST /api/companies/:companyId/automation/errors/:id/resolve
Dismiss	Dismiss error without action	POST /api/companies/:companyId/automation/errors/:id/dismiss
Bulk Retry	Retry multiple errors	POST /api/companies/:companyId/automation/errors/bulk-retry
Export	Export error log	GET /api/companies/:companyId/automation/errors/export
7. UI Components Reference
Component	Location	Purpose
WorkflowCanvas	@/components/automation/WorkflowCanvas	Visual workflow builder interface
RuleBuilder	@/components/automation/RuleBuilder	Condition-action rule editor
ApprovalMatrix	@/components/automation/ApprovalMatrix	Approval grid visualization
ChainDiagram	@/components/automation/ChainDiagram	Approval chain flowchart
AISuggestionCard	@/components/automation/AISuggestionCard	AI suggestion display with actions
ScheduleCalendar	@/components/automation/ScheduleCalendar	Schedule visualization calendar
LogViewer	@/components/automation/LogViewer	Log search and display
ErrorCard	@/components/automation/ErrorCard	Error item with actions
8. Database Models Reference
Model	Purpose	Key Fields
Workflow	Workflow definition	id, name, triggers, steps, status
WorkflowRun	Workflow execution	id, workflowId, status, startTime, endTime
SmartRule	Business rule	id, name, conditions, actions, priority
ApprovalMatrix	Approval configuration	id, name, rules, status
ApprovalRequest	Pending approval	id, entityType, entityId, status
Delegation	Approval delegation	id, fromUserId, toUserId, startDate, endDate
ScheduledJob	Job schedule	id, type, schedule, config, status
AutomationLog	Activity log	id, type, action, status, details
9. Implementation Notes
The Automation module requires careful attention to error handling and retry logic. All automated operations should be idempotent where possible to allow safe retry. Workflow execution state must be persisted to support recovery from failures. AI features require privacy considerations around data used for training. Approval workflows must maintain complete audit trails for compliance. Integration with the notification system ensures stakeholders are informed of automation activities and exceptions requiring attention.

HaypBooks Page101 Documentation
Part 15: Apps & Integrations Module
Comprehensive Page Specifications for Implementation
1. Module Overview
The Apps & Integrations module enables connectivity between HaypBooks and external systems including banks, payment processors, e-commerce platforms, POS systems, and other business applications. This module provides a marketplace for discovering integrations, management tools for connected applications, developer resources for custom integrations, and data tools for import/export operations. The module supports both pre-built integrations and custom API connections, enabling organizations to create a unified financial ecosystem.
1.1 Module Structure
Section	Pages	Purpose
Discover	3 pages	Browse and explore available integrations
My Integrations	3 pages	Manage connected apps and connections
Developer Tools	4 pages	API keys, webhooks, sandbox, documentation
Data Tools	4 pages	Import, export, and data sync management
2. Discover Section
2.1 App Marketplace Page
Route: /apps-integrations/discover/app-marketplace
Page Goal
The App Marketplace page serves as the central hub for discovering and exploring available integrations. It displays a catalog of pre-built integrations organized by category including Banking, Payment Processors, E-commerce, POS Systems, CRM, Payroll, and more. Each integration listing provides details about functionality, pricing, setup requirements, and user reviews. The page enables users to quickly find and initiate integration setup for external systems they use.
Page Design
The page features a searchable, filterable grid of integration cards organized by category. Each card shows the integration logo, name, category, rating, and quick-connect button. Category navigation on the left allows filtering by integration type. A search bar enables finding specific integrations by name or keyword. Featured integrations are highlighted at the top. Clicking an integration opens a detailed view with full description, screenshots, setup guide, and reviews.
Buttons and Functions
Button	Function	API Endpoint
Browse Category	Filter integrations by category	GET /api/integrations/marketplace?category=:cat
Search	Search integrations by keyword	GET /api/integrations/marketplace/search?q=:query
View Details	Open integration detail page	GET /api/integrations/marketplace/:id
Connect	Initiate integration setup	POST /api/integrations/marketplace/:id/connect
Request Integration	Request new integration	POST /api/integrations/marketplace/request
Write Review	Submit integration review	POST /api/integrations/marketplace/:id/reviews
2.2 Featured Apps Page
Route: /apps-integrations/discover/featured-apps
Page Goal
The Featured Apps page highlights curated integrations that are recommended based on popularity, user satisfaction, and strategic partnerships. It showcases new integrations, seasonal promotions, and apps that provide exceptional value. The page serves as a discovery starting point for users looking for recommended solutions.
Buttons and Functions
Button	Function	API Endpoint
View Featured	Get featured apps list	GET /api/integrations/marketplace/featured
View New	Show newly added integrations	GET /api/integrations/marketplace/new
View Promotions	Display promotional offers	GET /api/integrations/marketplace/promotions
Quick Connect	One-click connect for featured apps	POST /api/integrations/marketplace/:id/quick-connect
2.3 Suggested Integrations Page
Route: /apps-integrations/discover/suggested-integrations
Page Goal
The Suggested Integrations page provides personalized integration recommendations based on company profile, industry, usage patterns, and existing connections. The recommendation engine analyzes business needs and suggests integrations that could improve efficiency, fill gaps, or enhance existing workflows.
Buttons and Functions
Button	Function	API Endpoint
Get Suggestions	Load personalized recommendations	GET /api/integrations/suggestions
Dismiss Suggestion	Remove from recommendations	POST /api/integrations/suggestions/:id/dismiss
Connect Suggested	Accept and set up suggested integration	POST /api/integrations/suggestions/:id/connect
Refresh Suggestions	Regenerate recommendations	POST /api/integrations/suggestions/refresh
3. My Integrations Section
3.1 Connected Apps Page
Route: /apps-integrations/my-integrations/connected-apps
Page Goal
The Connected Apps page displays all active integrations and their current status. It provides an overview of connected systems, last sync times, data flow summaries, and quick access to configuration options. Users can manage connections, update credentials, configure sync settings, and troubleshoot issues from this centralized dashboard.
Page Design
The page displays connected integrations as cards showing app logo, name, connection status (Connected, Error, Expired), last sync time, and data sync summary. Each card has quick action buttons for Configure, Sync Now, View Logs, and Disconnect. A status indicator shows the health of each connection. Filters allow viewing by status or category.
Buttons and Functions
Button	Function	API Endpoint
View Connected	List all connected integrations	GET /api/integrations/connected
Configure	Open integration settings	GET /api/integrations/connected/:id/config
Update Credentials	Refresh authentication	POST /api/integrations/connected/:id/credentials
Sync Now	Trigger immediate sync	POST /api/integrations/connected/:id/sync
Disconnect	Remove integration connection	DELETE /api/integrations/connected/:id
View Data Flow	Show data exchange summary	GET /api/integrations/connected/:id/data-flow
Data Tables
Column	Data Type	Description
App Name	String	Integration name
Category	Enum	Bank, Payment, E-commerce, POS, etc.
Status	Enum	Connected, Error, Expired, Paused
Last Sync	DateTime	Most recent synchronization
Next Sync	DateTime	Scheduled next sync
Records Synced	Integer	Total records exchanged
Direction	Enum	Import, Export, Bidirectional
3.2 Connection Health Page
Route: /apps-integrations/my-integrations/connection-health
Page Goal
The Connection Health page provides detailed monitoring of integration connection status and health metrics. It displays uptime statistics, error rates, sync performance, and alert history for each connected system. The page helps administrators proactively identify and resolve integration issues before they impact operations.
Buttons and Functions
Button	Function	API Endpoint
View Health	Get health status for all connections	GET /api/integrations/health
View Alerts	Display connection alerts	GET /api/integrations/health/alerts
Acknowledge Alert	Dismiss an alert	POST /api/integrations/health/alerts/:id/acknowledge
Run Diagnostics	Execute connection diagnostics	POST /api/integrations/connected/:id/diagnostics
View Uptime	Show uptime statistics	GET /api/integrations/connected/:id/uptime
3.3 Integration Logs Page
Route: /apps-integrations/my-integrations/integration-logs
Page Goal
The Integration Logs page provides detailed audit trails of all integration activities including sync operations, data transfers, API calls, and errors. Users can search, filter, and export logs for troubleshooting, compliance, and analysis purposes.
Data Tables
Column	Data Type	Description
Timestamp	DateTime	Log entry time
Integration	String	Associated integration name
Action	String	Sync, Import, Export, API Call
Status	Enum	Success, Failed, Partial
Records	Integer	Number of records processed
Duration	Integer	Execution time in ms
Details	String	Additional information or error
4. Developer Tools Section
4.1 API Keys Page
Route: /apps-integrations/developer-tools/api-keys
Page Goal
The API Keys page manages API credentials for programmatic access to HaypBooks data. Users can create, rotate, and revoke API keys with configurable permissions and expiration. The page provides secure key management with audit trails of API usage and access patterns.
Page Design
The page lists API keys in a table showing key name, prefix (masked), permissions, creation date, expiration, last used, and status. A create button opens a form for naming the key and selecting permissions. Security features include key rotation reminders, usage statistics, and immediate revocation capability.
Buttons and Functions
Button	Function	API Endpoint
Create Key	Generate new API key	POST /api/companies/:companyId/api-keys
View Keys	List all API keys	GET /api/companies/:companyId/api-keys
Regenerate Key	Rotate API key	POST /api/companies/:companyId/api-keys/:id/regenerate
Revoke Key	Disable API key	DELETE /api/companies/:companyId/api-keys/:id
View Usage	Show API key usage statistics	GET /api/companies/:companyId/api-keys/:id/usage
Set Permissions	Configure key permissions	PUT /api/companies/:companyId/api-keys/:id/permissions
4.2 Webhooks Page
Route: /apps-integrations/developer-tools/webhooks
Page Goal
The Webhooks page manages webhook endpoints that receive real-time notifications when specific events occur in HaypBooks. Users can configure webhook URLs, select trigger events, manage authentication, and monitor delivery status. This enables real-time integration with external systems without polling.
Buttons and Functions
Button	Function	API Endpoint
Create Webhook	Register new webhook endpoint	POST /api/companies/:companyId/webhooks
View Webhooks	List all webhooks	GET /api/companies/:companyId/webhooks
Edit Webhook	Modify webhook configuration	PUT /api/companies/:companyId/webhooks/:id
Test Webhook	Send test payload	POST /api/companies/:companyId/webhooks/:id/test
View Deliveries	Show delivery history	GET /api/companies/:companyId/webhooks/:id/deliveries
Retry Delivery	Resend failed webhook	POST /api/companies/:companyId/webhooks/:id/retry
Delete Webhook	Remove webhook	DELETE /api/companies/:companyId/webhooks/:id
4.3 Developer Sandbox Page
Route: /apps-integrations/developer-tools/developer-sandbox
Page Goal
The Developer Sandbox page provides a testing environment for developers building custom integrations. It offers sample data, API exploration tools, and isolated testing without affecting production data. Developers can make test API calls, inspect responses, and debug integration code.
Buttons and Functions
Button	Function	API Endpoint
Create Sandbox	Initialize sandbox environment	POST /api/companies/:companyId/sandbox
Reset Sandbox	Clear and reset sandbox data	POST /api/companies/:companyId/sandbox/reset
Get Sandbox Key	Retrieve sandbox API credentials	GET /api/companies/:companyId/sandbox/credentials
View Sample Data	Access sample datasets	GET /api/companies/:companyId/sandbox/sample-data
API Explorer	Open interactive API testing	GET /api/companies/:companyId/sandbox/explorer
4.4 API Documentation Page
Route: /apps-integrations/developer-tools/api-documentation
Page Goal
The API Documentation page provides comprehensive documentation for HaypBooks REST API including endpoint reference, authentication guides, request/response formats, code examples, and best practices. The documentation is interactive with try-it-now functionality for authenticated users.
5. Data Tools Section
5.1 Import Data Page
Route: /apps-integrations/data-tools/import-data
Page Goal
The Import Data page provides tools for bulk importing data into HaypBooks from CSV, Excel, or other file formats. Users can import customers, vendors, items, accounts, transactions, and other records. The page offers field mapping, data validation, duplicate detection, and import preview before committing data.
Page Design
The page features an import wizard workflow: (1) Select import type, (2) Upload file, (3) Map fields, (4) Preview and validate, (5) Review errors/warnings, (6) Confirm import. Progress indicators show import status. Error reports detail validation failures. Template downloads provide correctly formatted samples.
Buttons and Functions
Button	Function	API Endpoint
Start Import	Begin import process	POST /api/companies/:companyId/import
Upload File	Upload import file	POST /api/companies/:companyId/import/upload
Map Fields	Configure field mapping	POST /api/companies/:companyId/import/:id/mapping
Preview	Preview import data	GET /api/companies/:companyId/import/:id/preview
Validate	Run validation checks	POST /api/companies/:companyId/import/:id/validate
Execute Import	Commit import	POST /api/companies/:companyId/import/:id/execute
Download Template	Get import template	GET /api/companies/:companyId/import/templates/:type
Cancel Import	Abort import process	POST /api/companies/:companyId/import/:id/cancel
5.2 Export Data Page
Route: /apps-integrations/data-tools/export-data
Page Goal
The Export Data page enables exporting data from HaypBooks in various formats for backup, reporting, or integration purposes. Users can export master data (customers, vendors, items), transaction data, or custom report results. Exports can be scheduled or run on-demand.
Buttons and Functions
Button	Function	API Endpoint
New Export	Create export job	POST /api/companies/:companyId/export
Select Data	Choose data to export	GET /api/companies/:companyId/export/data-types
Set Filters	Apply export filters	POST /api/companies/:companyId/export/:id/filters
Choose Format	Select output format	POST /api/companies/:companyId/export/:id/format
Run Export	Execute export	POST /api/companies/:companyId/export/:id/execute
Download	Download exported file	GET /api/companies/:companyId/export/:id/download
Schedule Export	Set up recurring export	POST /api/companies/:companyId/export/:id/schedule
5.3 Import History Page
Route: /apps-integrations/data-tools/import-history
Page Goal
The Import History page displays a complete history of all data imports with status, record counts, errors, and audit information. Users can review past imports, download error reports, and undo imports if needed.
Data Tables
Column	Data Type	Description
Date	DateTime	Import execution time
Type	String	Data type imported
File Name	String	Original filename
Status	Enum	Pending, Processing, Complete, Failed
Records	Integer	Total records in file
Imported	Integer	Successfully imported
Errors	Integer	Failed records
User	String	User who initiated
5.4 Data Sync Status Page
Route: /apps-integrations/data-tools/data-sync-status
Page Goal
The Data Sync Status page provides a comprehensive view of data synchronization across all integrations. It shows sync schedules, last sync times, pending records, conflicts, and sync errors. Users can monitor data consistency between HaypBooks and connected systems.
Buttons and Functions
Button	Function	API Endpoint
View Status	Get sync status dashboard	GET /api/companies/:companyId/sync/status
View Pending	Show pending sync records	GET /api/companies/:companyId/sync/pending
Resolve Conflicts	Handle sync conflicts	GET /api/companies/:companyId/sync/conflicts
Force Sync	Trigger immediate sync	POST /api/companies/:companyId/sync/force
Pause Sync	Temporarily stop syncing	POST /api/companies/:companyId/sync/pause
View Errors	Show sync errors	GET /api/companies/:companyId/sync/errors
6. UI Components Reference
Component	Location	Purpose
IntegrationCard	@/components/integrations/IntegrationCard	Integration listing card
ConnectionStatus	@/components/integrations/ConnectionStatus	Connection health indicator
APIKeyManager	@/components/integrations/APIKeyManager	API key creation/management
WebhookConfig	@/components/integrations/WebhookConfig	Webhook configuration form
ImportWizard	@/components/integrations/ImportWizard	Step-by-step import interface
FieldMapper	@/components/integrations/FieldMapper	Import field mapping tool
SyncDashboard	@/components/integrations/SyncDashboard	Sync status visualization
LogViewer	@/components/integrations/LogViewer	Integration log display
7. Database Models Reference
Model	Purpose	Key Fields
ExternalSystemConfig	Integration configuration	id, type, config, credentials, status
ExternalEntity	Entity sync mapping	id, externalId, internalId, syncStatus
SyncJob	Sync operation record	id, type, status, startTime, endTime
ApiKey	API key record	id, keyHash, permissions, expiresAt
WebhookSubscription	Webhook configuration	id, url, events, secret, status
WebhookDelivery	Webhook delivery record	id, webhookId, payload, status, response
DataImportJob	Import job record	id, type, file, status, stats
DataExportJob	Export job record	id, type, filters, format, status
8. Implementation Notes
The Apps & Integrations module requires careful attention to security, particularly for credential management and API access. All credentials should be encrypted at rest and in transit. API keys should use secure hashing rather than storing plaintext. Webhook endpoints should verify signatures to prevent replay attacks. Import/export operations should support large file handling with streaming and background processing. Rate limiting should be implemented for API endpoints to prevent abuse.

HaypBooks Page101 Documentation
Part 16: Settings Module
Comprehensive Page Specifications for Implementation
1. Module Overview
The Settings module provides comprehensive configuration capabilities for all aspects of the HaypBooks system. It enables administrators and users to customize company profiles, manage users and permissions, configure accounting preferences, set up notifications, customize document templates, and manage data privacy settings. This module serves as the control center for tailoring HaypBooks to specific organizational requirements and ensuring compliance with internal policies and external regulations.
1.1 Module Structure
Section	Pages	Purpose
Account & Billing	3 pages	Subscription, billing, and payment methods
Company Profile	3 pages	Company details and fiscal configuration
Users & Security	5 pages	User management, roles, and security
Accounting Preferences	3 pages	Default accounts and closing settings
Customization	4 pages	Custom fields, lists, and templates
Notifications	2 pages	System alerts and email settings
Data & Privacy	4 pages	Audit logs, backup, and data management
2. Account & Billing Section
2.1 Subscription & Plans Page
Route: /settings/account-billing/subscription-plans
Page Goal
The Subscription & Plans page displays current subscription details, plan features, usage metrics, and upgrade options. Users can view their current plan tier, billing cycle, included features, and usage against plan limits. The page enables plan upgrades, downgrades, and add-on purchases. For multi-company workspaces, it shows company count and per-company pricing details.
Buttons and Functions
Button	Function	API Endpoint
View Plans	Display available plans	GET /api/settings/plans
Upgrade Plan	Initiate plan upgrade	POST /api/settings/subscription/upgrade
Downgrade Plan	Request plan downgrade	POST /api/settings/subscription/downgrade
Add Add-on	Purchase additional features	POST /api/settings/subscription/addons
Remove Add-on	Cancel add-on subscription	DELETE /api/settings/subscription/addons/:id
View Usage	Show current usage metrics	GET /api/settings/subscription/usage
Cancel Subscription	Initiate cancellation	POST /api/settings/subscription/cancel
2.2 Billing History Page
Route: /settings/account-billing/billing-history
Page Goal
The Billing History page displays all past invoices, payment records, and credit adjustments. Users can view invoice details, download PDF invoices, and see payment status. The page supports filtering by date range and payment status, and provides quick access to outstanding balances and payment reminders.
Data Tables
Column	Data Type	Description
Invoice Date	Date	Invoice issue date
Invoice Number	String	Unique invoice identifier
Description	String	Billing period or item
Amount	Decimal	Invoice total
Status	Enum	Paid, Pending, Failed, Refunded
Payment Date	Date	When payment was received
Download	Action	PDF download link
2.3 Payment Methods Page
Route: /settings/account-billing/payment-methods
Page Goal
The Payment Methods page manages stored payment methods for automatic billing including credit cards, debit cards, and bank accounts. Users can add, update, or remove payment methods, set a default payment method, and view card expiration alerts.
Buttons and Functions
Button	Function	API Endpoint
Add Payment Method	Add new card/bank account	POST /api/settings/payment-methods
Set Default	Set primary payment method	POST /api/settings/payment-methods/:id/default
Update Payment Method	Edit payment details	PUT /api/settings/payment-methods/:id
Remove Payment Method	Delete payment method	DELETE /api/settings/payment-methods/:id
Verify Bank Account	Confirm bank account ownership	POST /api/settings/payment-methods/:id/verify
3. Company Profile Section
3.1 Company Details Page
Route: /settings/company-profile/company-details
Page Goal
The Company Details page manages core company information including legal name, trade name, tax identification numbers, registered address, contact information, and business classification. This information appears on invoices, reports, and government filings. Changes to certain fields may require re-verification for compliance purposes.
Page Design
The page presents a form-based interface organized into sections: Legal Information (name, registration numbers), Contact Information (address, phone, email), Business Details (industry, size, classification), and Branding (logo, colors). Each section can be expanded or collapsed. Required fields are clearly marked. Some fields may be locked if verified and require support ticket to change.
Buttons and Functions
Button	Function	API Endpoint
Save Changes	Update company information	PUT /api/companies/:companyId/details
Upload Logo	Upload company logo	POST /api/companies/:companyId/logo
Verify TIN	Verify tax identification number	POST /api/companies/:companyId/verify-tin
Request Change	Request locked field change	POST /api/companies/:companyId/change-request
View History	Show change history	GET /api/companies/:companyId/details/history
3.2 Fiscal Year Setup Page
Route: /settings/company-profile/fiscal-year-setup
Page Goal
The Fiscal Year Setup page configures the fiscal year calendar, accounting periods, and period closing schedules. Users can define fiscal year start month, create accounting periods (monthly, quarterly, annually), and set up period closing reminders. The page supports calendar year and custom fiscal year configurations.
Buttons and Functions
Button	Function	API Endpoint
Get Fiscal Years	List fiscal year configurations	GET /api/companies/:companyId/fiscal-years
Create Fiscal Year	Add new fiscal year	POST /api/companies/:companyId/fiscal-years
Edit Fiscal Year	Modify fiscal year settings	PUT /api/companies/:companyId/fiscal-years/:id
Create Periods	Generate accounting periods	POST /api/companies/:companyId/fiscal-years/:id/periods
Close Period	Close accounting period	POST /api/companies/:companyId/periods/:id/close
Reopen Period	Reopen closed period	POST /api/companies/:companyId/periods/:id/reopen
3.3 Operating Hours Page
Route: /settings/company-profile/operating-hours
Page Goal
The Operating Hours page configures business hours for the organization. This information is used for due date calculations, support availability display, and automated workflow scheduling. Users can set different hours for different days and configure holiday calendars.
4. Users & Security Section
4.1 User Management Page
Route: /settings/users-security/user-management
Page Goal
The User Management page provides comprehensive administration of all users within the workspace. Administrators can view, create, edit, and deactivate user accounts. The page supports user search, filtering by role or status, and bulk operations. Each user card shows profile information, assigned roles, last login, and current status.
Page Design
The page displays users in a table format with columns for name, email, role, teams, last login, and status. Quick action buttons allow editing roles, sending password reset, or deactivating accounts. A user creation wizard guides through setting up new accounts with role assignment and team membership. Bulk selection enables operations on multiple users simultaneously.
Buttons and Functions
Button	Function	API Endpoint
List Users	Get all workspace users	GET /api/workspaces/:workspaceId/users
Create User	Add new user account	POST /api/workspaces/:workspaceId/users
Edit User	Modify user details	PUT /api/workspaces/:workspaceId/users/:id
Deactivate User	Disable user access	POST /api/workspaces/:workspaceId/users/:id/deactivate
Reactivate User	Restore user access	POST /api/workspaces/:workspaceId/users/:id/reactivate
Reset Password	Send password reset link	POST /api/workspaces/:workspaceId/users/:id/reset-password
Impersonate User	Admin impersonation (audit logged)	POST /api/workspaces/:workspaceId/users/:id/impersonate
Export Users	Download user list	GET /api/workspaces/:workspaceId/users/export
Data Tables
Column	Data Type	Description
Name	String	User full name
Email	String	User email address
Role	String	Primary role assignment
Teams	Array	Team memberships
Last Login	DateTime	Most recent login
Status	Enum	Active, Pending, Inactive, Suspended
MFA Enabled	Boolean	Two-factor authentication status
4.2 Roles & Permissions Page
Route: /settings/users-security/roles-permissions
Page Goal
The Roles & Permissions page manages role definitions and their associated permissions. Administrators can create custom roles, modify permission sets, and assign roles to users. The permission system supports granular access control across all modules and features.
Page Design
The page displays roles as cards showing role name, description, user count, and permission summary. Selecting a role opens a detailed permission matrix organized by module. Each permission can be set to None, View, Edit, or Full. Changes are tracked with audit logs. System roles are protected but can be duplicated for customization.
Buttons and Functions
Button	Function	API Endpoint
List Roles	Get all available roles	GET /api/workspaces/:workspaceId/roles
Create Role	Define new custom role	POST /api/workspaces/:workspaceId/roles
Edit Role	Modify role permissions	PUT /api/workspaces/:workspaceId/roles/:id
Duplicate Role	Copy existing role	POST /api/workspaces/:workspaceId/roles/:id/duplicate
Delete Role	Remove custom role	DELETE /api/workspaces/:workspaceId/roles/:id
Assign Role	Assign role to user	POST /api/workspaces/:workspaceId/users/:userId/roles
View Permissions	Show permission matrix	GET /api/workspaces/:workspaceId/roles/:id/permissions
4.3 Teams & Groups Page
Route: /settings/users-security/teams-groups
Page Goal
The Teams & Groups page organizes users into logical groupings for easier management, reporting, and workflow assignment. Teams can represent departments, locations, project teams, or any organizational structure. Group membership affects visibility, approvals, and notifications.
Buttons and Functions
Button	Function	API Endpoint
List Teams	Get all teams	GET /api/workspaces/:workspaceId/teams
Create Team	Add new team	POST /api/workspaces/:workspaceId/teams
Edit Team	Modify team details	PUT /api/workspaces/:workspaceId/teams/:id
Add Members	Add users to team	POST /api/workspaces/:workspaceId/teams/:id/members
Remove Member	Remove user from team	DELETE /api/workspaces/:workspaceId/teams/:id/members/:userId
Set Manager	Assign team lead	POST /api/workspaces/:workspaceId/teams/:id/manager
4.4 Login History Page
Route: /settings/users-security/login-history
Page Goal
The Login History page provides audit trail of all login attempts including successful logins, failed attempts, and suspicious activity. Users can review their own login history while administrators can view all user activity. The page supports security investigations and compliance reporting.
Data Tables
Column	Data Type	Description
Timestamp	DateTime	Login attempt time
User	String	User email/name
Status	Enum	Success, Failed, Blocked
IP Address	String	Source IP address
Location	String	Geographic location
Device	String	Browser/device info
Failure Reason	String	If failed, the reason
4.5 Two-Factor Auth Page
Route: /settings/users-security/two-factor-auth
Page Goal
The Two-Factor Auth page manages 2FA settings for user accounts. Users can enable, configure, and manage their 2FA preferences including authenticator apps, SMS codes, and backup codes. Administrators can enforce 2FA policies at workspace level.
Buttons and Functions
Button	Function	API Endpoint
Enable 2FA	Start 2FA setup	POST /api/users/:userId/2fa/enable
Verify Setup	Confirm 2FA configuration	POST /api/users/:userId/2fa/verify
Generate Backup Codes	Create new backup codes	POST /api/users/:userId/2fa/backup-codes
Disable 2FA	Turn off 2FA	POST /api/users/:userId/2fa/disable
Enforce Policy	Require 2FA for all users	POST /api/workspaces/:workspaceId/2fa/enforce
5. Accounting Preferences Section
5.1 Default Accounts Page
Route: /settings/accounting-preferences/default-accounts
Page Goal
The Default Accounts page configures default account assignments for various transaction types. Users can set default accounts for receivables, payables, sales, purchases, inventory, banking, and tax. These defaults streamline transaction entry by auto-populating account fields.
Buttons and Functions
Button	Function	API Endpoint
Get Defaults	Retrieve default account mappings	GET /api/companies/:companyId/defaults/accounts
Set Default	Configure default account	PUT /api/companies/:companyId/defaults/accounts/:type
Reset to Standard	Restore system defaults	POST /api/companies/:companyId/defaults/accounts/reset
5.2 Closing Date Protection Page
Route: /settings/accounting-preferences/closing-date-protection
Page Goal
The Closing Date Protection page manages settings that prevent or warn about changes to closed accounting periods. Administrators can set closing dates, configure protection levels (warn or block), and manage exceptions for specific users or roles.
5.3 Currency Settings Page
Route: /settings/accounting-preferences/currency-settings
Page Goal
The Currency Settings page configures base currency, enabled foreign currencies, exchange rate sources, and revaluation settings. Users can add currencies, set up automatic rate updates, and configure gain/loss accounts for currency adjustments.
6. Customization Section
6.1 Custom Fields Page
Route: /settings/customization/custom-fields
Page Goal
The Custom Fields page enables creation and management of custom fields for various entity types including customers, vendors, items, invoices, bills, and transactions. Custom fields extend the standard data model to capture organization-specific information without code changes.
Page Design
The page organizes custom fields by entity type with a field editor supporting various field types: text, number, date, dropdown, checkbox, and lookup. Each field has settings for label, required status, default value, validation rules, and visibility. A drag-and-drop interface controls field order.
Buttons and Functions
Button	Function	API Endpoint
List Fields	Get custom fields for entity	GET /api/companies/:companyId/custom-fields/:entity
Create Field	Add new custom field	POST /api/companies/:companyId/custom-fields
Edit Field	Modify field settings	PUT /api/companies/:companyId/custom-fields/:id
Delete Field	Remove custom field	DELETE /api/companies/:companyId/custom-fields/:id
Reorder Fields	Change field order	POST /api/companies/:companyId/custom-fields/reorder
6.2 Custom Lists Page
Route: /settings/customization/custom-lists
Page Goal
The Custom Lists page manages custom dropdown options for custom fields and transaction classifications. Users can create and maintain lists of values for categorization, segmentation, and reporting purposes.
6.3 Transaction Tags Page
Route: /settings/customization/transaction-tags
Page Goal
The Transaction Tags page manages a tagging system for flexible transaction categorization. Tags can be applied to any transaction for grouping, filtering, and reporting. Users can create tag hierarchies, set colors, and define usage rules.
6.4 PDF Templates Page
Route: /settings/customization/pdf-templates
Page Goal
The PDF Templates page customizes document templates for invoices, quotes, purchase orders, statements, and other external documents. Users can select layouts, customize colors and logos, add custom text, and configure page settings.
7. Notifications Section
7.1 System Alerts Page
Route: /settings/notifications/system-alerts
Page Goal
The System Alerts page configures in-app notification preferences for various system events including approvals, exceptions, reminders, and updates. Users can choose which alerts to receive and how they should be delivered (in-app, email, push).
7.2 Email Digest Settings Page
Route: /settings/notifications/email-digest-settings
Page Goal
The Email Digest Settings page configures email notification frequency and content. Users can choose between immediate notifications or daily/weekly digests, select content categories, and set quiet hours for non-urgent notifications.
8. Data & Privacy Section
8.1 Audit Log Page
Route: /settings/data-privacy/audit-log
Page Goal
The Audit Log page provides comprehensive audit trails of all user actions and system events. Administrators can search, filter, and export audit records for compliance, security investigations, and operational analysis.
Data Tables
Column	Data Type	Description
Timestamp	DateTime	Event occurrence time
User	String	User who performed action
Action	String	Action type (Create, Update, Delete, View)
Entity Type	String	Type of record affected
Entity ID	String	Identifier of affected record
Details	JSON	Before/after values
IP Address	String	Source IP address
8.2 Data Export Page
Route: /settings/data-privacy/data-export
Page Goal
The Data Export page enables exporting all company data for backup, migration, or archival purposes. Users can select data categories, choose export format, and schedule or run immediate exports.
8.3 Data Backup Page
Route: /settings/data-privacy/data-backup
Page Goal
The Data Backup page manages automated backup schedules and manual backup operations. Users can configure backup frequency, retention period, and storage location. The page shows backup history and provides restore functionality.
8.4 Trash / Deleted Records Page
Route: /settings/data-privacy/trash-deleted-records
Page Goal
The Trash page displays soft-deleted records that can be recovered. Users can view deleted items by type, restore accidentally deleted records, or permanently purge items past retention period.
Buttons and Functions
Button	Function	API Endpoint
View Deleted	List soft-deleted records	GET /api/companies/:companyId/trash
Restore	Recover deleted record	POST /api/companies/:companyId/trash/:id/restore
Purge	Permanently delete	DELETE /api/companies/:companyId/trash/:id
Empty Trash	Clear all deleted items	DELETE /api/companies/:companyId/trash/purge-all
9. UI Components Reference
Component	Location	Purpose
SettingsLayout	@/components/settings/SettingsLayout	Settings page wrapper with navigation
SettingsForm	@/components/settings/SettingsForm	Generic settings form container
PermissionMatrix	@/components/settings/PermissionMatrix	Role permission configuration grid
UserCard	@/components/settings/UserCard	User profile card with actions
TeamTree	@/components/settings/TeamTree	Team hierarchy visualization
CustomFieldEditor	@/components/settings/CustomFieldEditor	Custom field creation/editing
TemplatePreview	@/components/settings/TemplatePreview	PDF template preview
AuditTimeline	@/components/settings/AuditTimeline	Audit log timeline view
10. Database Models Reference
Model	Purpose	Key Fields
Company	Company entity	id, name, taxId, fiscalYearStart, status
WorkspaceUser	User-workspace membership	id, workspaceId, userId, role, status
Role	Role definition	id, workspaceId, name, permissions
Team	Team/group	id, workspaceId, name, managerId
TeamMember	Team membership	id, teamId, userId
UserPreferences	User settings	id, userId, preferences
CustomField	Custom field definition	id, companyId, entity, name, type, config
AuditLog	Audit record	id, workspaceId, userId, action, entityType, entityId, details
11. Implementation Notes
The Settings module requires careful attention to access control. Many settings pages should be restricted to administrators only. Changes to critical settings should require confirmation and create audit log entries. Role and permission changes should propagate immediately but may require user re-login for full effect. Custom fields require database migration considerations for large datasets. The module should support both workspace-level and company-level settings where appropriate.

HaypBooks Page101 Documentation
Part 17: Practice Hub Module
Comprehensive Page Specifications for Implementation
1. Module Overview
The Practice Hub is a dedicated interface designed for accounting firms, bookkeepers, and financial service providers who manage multiple client companies. It provides tools for client management, work organization, collaborative bookkeeping, and practice administration. The Practice Hub enables accounting professionals to efficiently serve multiple clients through centralized dashboards, standardized workflows, and team coordination features. This module is distinct from the Owner interface and is accessed through a separate navigation structure.
1.1 Module Structure
Section	Pages	Purpose
Home	3 pages	Practice dashboard and health metrics
Clients	5 pages	Client management and onboarding
Work Management	5 pages	Work queue and engagement tracking
Accountant Workspace	4 pages	Books review and reconciliation
Reporting	3 pages	Financial statements and reports
Practice Settings	5 pages	Practice configuration and team management
2. Home Section
2.1 Dashboard Page
Route: /practice-hub/dashboard
Page Goal
The Practice Hub Dashboard serves as the command center for accounting professionals, providing an at-a-glance view of all client activities, pending work items, and practice performance metrics. It aggregates information from multiple clients into a unified view, enabling accountants to prioritize work and manage their time effectively. The dashboard highlights items requiring attention, upcoming deadlines, and key performance indicators for the practice.
Page Design
The dashboard features a modular layout with customizable widgets. The top section shows practice-level KPIs: active clients, pending tasks, overdue items, and monthly revenue. Below, client status cards show each client's health score, last activity date, and pending items count. A work queue widget displays priority-sorted tasks across all clients. Calendar integration shows upcoming deadlines. Quick action buttons provide shortcuts to common tasks.
Buttons and Functions
Button	Function	API Endpoint
Get Dashboard	Load dashboard data	GET /api/practice/:practiceId/dashboard
View All Tasks	Navigate to work queue	GET /api/practice/:practiceId/tasks
Quick Client Switch	Switch to client context	POST /api/practice/:practiceId/context/switch
View Alerts	Show practice alerts	GET /api/practice/:practiceId/alerts
Refresh Metrics	Update dashboard statistics	POST /api/practice/:practiceId/dashboard/refresh
2.2 Practice Health Page
Route: /practice-hub/practice-health
Page Goal
The Practice Health page provides insights into the overall operational health of the accounting practice. It displays metrics on client satisfaction, service delivery, team utilization, revenue trends, and growth indicators. Practice managers can use this page to identify areas for improvement and track progress toward business goals.
Page Design
The page presents health metrics as scorecards with trend indicators. Key metrics include client retention rate, average engagement completion time, team utilization percentage, and revenue per client. Visual charts show trends over time. A comparison section benchmarks against industry standards or past performance. Action recommendations suggest improvements based on identified issues.
2.3 Shortcuts Page
Route: /practice-hub/shortcuts
Page Goal
The Shortcuts page provides quick access to frequently used actions, reports, and clients. Users can customize their shortcuts for maximum efficiency, creating a personalized workflow that matches their daily routine.
3. Clients Section
3.1 Client List Page
Route: /practice-hub/clients/client-list
Page Goal
The Client List page displays all clients managed by the practice with comprehensive information about each client relationship. It provides filtering, sorting, and search capabilities to quickly find specific clients. Each client entry shows engagement status, health indicators, and key metrics. The page is the primary entry point for accessing client-specific work and information.
Page Design
Clients are displayed in a table format with columns for name, industry, engagement type, status, last activity, pending items, and health score. A sidebar filter panel allows filtering by status, engagement type, assigned team member, and date ranges. Quick action buttons on each row provide access to client details, work queue, and recent activity. A card view option displays clients as tiles with summary information.
Buttons and Functions
Button	Function	API Endpoint
List Clients	Get all practice clients	GET /api/practice/:practiceId/clients
Search Clients	Search client records	GET /api/practice/:practiceId/clients/search
View Client	Open client detail page	GET /api/practice/:practiceId/clients/:clientId
Add Client	Create new client record	POST /api/practice/:practiceId/clients
Edit Client	Modify client information	PUT /api/practice/:practiceId/clients/:clientId
Archive Client	Archive client relationship	POST /api/practice/:practiceId/clients/:clientId/archive
Assign Team	Assign team members to client	POST /api/practice/:practiceId/clients/:clientId/assign
Export Clients	Download client list	GET /api/practice/:practiceId/clients/export
Data Tables
Column	Data Type	Description
Client Name	String	Company or individual name
Industry	String	Business industry classification
Engagement Type	Enum	Bookkeeping, Tax, Advisory, Full Service
Status	Enum	Active, On Hold, Prospective, Archived
Health Score	Integer	0-100 health indicator
Assigned To	String	Primary team member
Last Activity	Date	Most recent work item
Pending Items	Integer	Count of open tasks
3.2 Client Onboarding Page
Route: /practice-hub/clients/client-onboarding
Page Goal
The Client Onboarding page manages the process of bringing new clients into the practice. It provides a structured workflow for collecting client information, setting up systems access, configuring services, and transitioning from prior accountants. The page ensures consistent onboarding quality and tracks progress through each step.
Page Design
The page displays onboarding as a checklist with progress tracking. Each client in onboarding shows completion percentage and next steps. The onboarding wizard guides through stages: Client Information, System Setup, Service Configuration, Document Collection, and Go-Live. Templates support standardized onboarding for different service types.
Buttons and Functions
Button	Function	API Endpoint
Start Onboarding	Begin new client onboarding	POST /api/practice/:practiceId/onboarding
Get Checklist	Retrieve onboarding checklist	GET /api/practice/:practiceId/onboarding/:id/checklist
Complete Step	Mark step as complete	POST /api/practice/:practiceId/onboarding/:id/steps/:stepId/complete
Upload Documents	Add onboarding documents	POST /api/practice/:practiceId/onboarding/:id/documents
Request Access	Request system access from client	POST /api/practice/:practiceId/onboarding/:id/access-request
Complete Onboarding	Finalize onboarding process	POST /api/practice/:practiceId/onboarding/:id/complete
3.3 Client Documents Page
Route: /practice-hub/clients/client-documents
Page Goal
The Client Documents page provides centralized document management for client files including tax documents, financial statements, engagement letters, and supporting schedules. It supports secure document sharing between the practice and clients with version control and audit trails.
3.4 Client CRM Leads Page
Route: /practice-hub/clients/client-crm-leads
Page Goal
The Client CRM Leads page manages prospective clients and sales pipeline for the practice. It tracks leads from initial inquiry through conversion, with tools for follow-up scheduling, proposal generation, and conversion tracking.
3.5 Communications Page
Route: /practice-hub/clients/communications
Page Goal
The Communications page centralizes all client communications including emails, messages, notes, and meeting records. It provides a unified view of client interactions across all team members, ensuring continuity and enabling quick context switching between clients.
4. Work Management Section
4.1 Work Queue Page
Route: /practice-hub/work-management/work-queue
Page Goal
The Work Queue page is the primary task management interface for practice staff. It aggregates all pending work items across all clients into a unified, prioritized queue. Staff can view assigned tasks, claim unassigned work, track progress, and manage their daily workload. The page supports filtering by client, task type, priority, and due date.
Page Design
Work items are displayed in a kanban-style board with columns for New, In Progress, Review, and Complete. Each card shows client name, task type, priority, due date, and assignee. List view provides a detailed table with sorting capabilities. Quick filters allow focusing on specific clients or task types. A sidebar shows task details and allows status updates.
Buttons and Functions
Button	Function	API Endpoint
Get Work Queue	Load all work items	GET /api/practice/:practiceId/work-queue
Claim Task	Assign task to self	POST /api/practice/:practiceId/tasks/:taskId/claim
Update Status	Change task status	PUT /api/practice/:practiceId/tasks/:taskId/status
Add Note	Add task note/comment	POST /api/practice/:practiceId/tasks/:taskId/notes
Complete Task	Mark task complete	POST /api/practice/:practiceId/tasks/:taskId/complete
Reassign Task	Transfer to another team member	POST /api/practice/:practiceId/tasks/:taskId/reassign
Create Subtask	Add subtask to main task	POST /api/practice/:practiceId/tasks/:taskId/subtasks
Data Tables
Column	Data Type	Description
Client	String	Associated client name
Task Type	Enum	Bookkeeping, Tax, Advisory, Admin
Description	String	Task description
Priority	Enum	Critical, High, Medium, Low
Due Date	Date	Task deadline
Assignee	String	Assigned team member
Status	Enum	New, In Progress, Review, Complete
Time Spent	Decimal	Hours logged
4.2 Monthly Close Page
Route: /practice-hub/work-management/monthly-close
Page Goal
The Monthly Close page manages the monthly bookkeeping close process for all clients. It provides templates, checklists, and progress tracking for ensuring timely and accurate monthly closes. The page shows close status for each client and highlights items that are behind schedule.
Buttons and Functions
Button	Function	API Endpoint
Get Close Status	View monthly close status	GET /api/practice/:practiceId/monthly-close
Start Close	Begin close for client/month	POST /api/practice/:practiceId/monthly-close/start
Get Checklist	Retrieve close checklist	GET /api/practice/:practiceId/monthly-close/:id/checklist
Complete Item	Mark checklist item done	POST /api/practice/:practiceId/monthly-close/:id/items/:itemId/complete
Finalize Close	Complete monthly close	POST /api/practice/:practiceId/monthly-close/:id/finalize
4.3 Annual Engagements Page
Route: /practice-hub/work-management/annual-engagements
Page Goal
The Annual Engagements page manages year-end and annual service engagements including tax returns, annual financial statements, and annual reviews. It tracks engagement milestones, deadlines, and deliverables throughout the engagement lifecycle.
4.4 Work In Progress Page
Route: /practice-hub/work-management/work-in-progress
Page Goal
The Work In Progress (WIP) page tracks unbilled work across all engagements. It shows time and costs invested in client work that has not yet been invoiced. Practice managers can monitor WIP levels, identify aging work items, and generate WIP reports for billing decisions.
4.5 Calendar Page
Route: /practice-hub/work-management/calendar
Page Goal
The Calendar page provides a unified view of all practice deadlines, client due dates, team schedules, and important events. It helps coordinate work across the team and ensures no deadlines are missed.
5. Accountant Workspace Section
5.1 Books Review Page
Route: /practice-hub/accountant-workspace/books-review
Page Goal
The Books Review page provides tools for reviewing and verifying client bookkeeping. It highlights anomalies, unclassified transactions, reconciliation discrepancies, and other issues requiring attention. Accountants can drill down into specific areas and document their review findings.
Page Design
The page shows a client selector at the top, with the main content area displaying review findings. Summary cards show counts of issues by category. A detailed table lists specific findings with severity, description, and suggested resolution. Quick action buttons allow clearing items or creating adjusting entries.
Buttons and Functions
Button	Function	API Endpoint
Run Review	Execute books review check	POST /api/practice/:practiceId/clients/:clientId/review/run
Get Findings	Retrieve review findings	GET /api/practice/:practiceId/clients/:clientId/review/findings
Clear Finding	Mark finding as resolved	POST /api/practice/:practiceId/review/findings/:findingId/clear
Create Adjustment	Generate adjusting entry	POST /api/practice/:practiceId/review/findings/:findingId/adjustment
Export Review	Download review report	GET /api/practice/:practiceId/clients/:clientId/review/export
5.2 Reconciliation Hub Page
Route: /practice-hub/accountant-workspace/reconciliation-hub
Page Goal
The Reconciliation Hub provides a centralized view of all bank and account reconciliations across client companies. It shows reconciliation status, discrepancies, and items requiring attention. Accountants can efficiently manage reconciliations for multiple clients from a single interface.
5.3 Adjusting Entries Page
Route: /practice-hub/accountant-workspace/adjusting-entries
Page Goal
The Adjusting Entries page manages the creation, review, and posting of adjusting journal entries. It supports standard adjusting entry templates, automatic accruals, and reversing entries. All adjustments are tracked for audit purposes.
5.4 Client Requests Page
Route: /practice-hub/accountant-workspace/client-requests
Page Goal
The Client Requests page manages information requests and client communications related to ongoing work. It tracks requests sent to clients, responses received, and outstanding items needed to complete work.
6. Reporting Section
6.1 Financial Statements Page
Route: /practice-hub/reporting/financial-statements
Page Goal
The Financial Statements page generates and manages financial statements for client companies including Balance Sheet, Income Statement, Cash Flow Statement, and supporting schedules. It supports multiple formats and customization options.
Buttons and Functions
Button	Function	API Endpoint
Generate Statement	Create financial statement	POST /api/practice/:practiceId/clients/:clientId/statements
View Statements	List generated statements	GET /api/practice/:practiceId/clients/:clientId/statements
Export PDF	Download statement as PDF	GET /api/practice/:practiceId/statements/:id/pdf
Export Excel	Download statement as Excel	GET /api/practice/:practiceId/statements/:id/excel
Customize Layout	Modify statement format	PUT /api/practice/:practiceId/statements/config
6.2 Management Reports Page
Route: /practice-hub/reporting/management-reports
Page Goal
The Management Reports page provides operational and analytical reports for practice management including profitability analysis, utilization reports, WIP aging, and client analysis. These reports help practice owners make informed business decisions.
6.3 Tax Reports Page
Route: /practice-hub/reporting/tax-reports
Page Goal
The Tax Reports page generates tax-related reports and workpapers for client tax filings. It supports preparation of schedules for income tax returns, VAT returns, and other tax compliance requirements.
7. Practice Settings Section
7.1 Practice Profile Page
Route: /practice-hub/practice-settings/practice-profile
Page Goal
The Practice Profile page manages practice-level information including firm name, contact details, branding, service offerings, and professional credentials. This information appears on client-facing documents and communications.
7.2 Team Management Page
Route: /practice-hub/practice-settings/team-management
Page Goal
The Team Management page administers practice staff including accountants, bookkeepers, and administrative personnel. It manages user accounts, roles, permissions, and team assignments.
7.3 Rate Cards & Pricing Page
Route: /practice-hub/practice-settings/rate-cards-pricing
Page Goal
The Rate Cards & Pricing page manages billing rates for different staff levels, service types, and client tiers. It supports both hourly billing and fixed-fee arrangements.
Buttons and Functions
Button	Function	API Endpoint
Get Rate Cards	List all rate cards	GET /api/practice/:practiceId/rate-cards
Create Rate Card	Add new rate card	POST /api/practice/:practiceId/rate-cards
Update Rate Card	Modify rate card	PUT /api/practice/:practiceId/rate-cards/:id
Set Default	Set default rate card	POST /api/practice/:practiceId/rate-cards/:id/default
Apply to Client	Assign rate card to client	POST /api/practice/:practiceId/clients/:clientId/rate-card
7.4 Subscriptions & Billing Page
Route: /practice-hub/practice-settings/subscriptions-billing
Page Goal
The Subscriptions & Billing page manages the practice's subscription to HaypBooks Practice Hub and associated billing. It displays current plan, usage, and billing history.
7.5 Templates Page
Route: /practice-hub/practice-settings/templates
Page Goal
The Templates page manages reusable templates for client documents, engagement letters, checklists, and reports. Templates ensure consistency across the practice and save time on routine document creation.
8. UI Components Reference
Component	Location	Purpose
PracticeLayout	@/components/practice/PracticeLayout	Practice Hub page wrapper
ClientCard	@/components/practice/ClientCard	Client summary card
WorkQueueItem	@/components/practice/WorkQueueItem	Task item in work queue
ClientSelector	@/components/practice/ClientSelector	Client switcher dropdown
PracticeHealthWidget	@/components/practice/PracticeHealthWidget	Practice health indicator
EngagementCard	@/components/practice/EngagementCard	Engagement summary card
CloseChecklist	@/components/practice/CloseChecklist	Monthly close checklist
ReviewFindingCard	@/components/practice/ReviewFindingCard	Books review finding item
9. Database Models Reference
Model	Purpose	Key Fields
Practice	Accounting firm entity	id, workspaceId, name, services, status
PracticeUser	Practice staff membership	id, practiceId, userId, role, status
ClientCompany	Client relationship	id, practiceId, companyId, engagementType, status
Engagement	Service engagement	id, practiceId, clientId, type, period, status
PracticeTask	Work item	id, practiceId, clientId, type, priority, status, assigneeId
ClientRequest	Information request	id, practiceId, clientId, request, status, response
MonthlyClose	Close tracking	id, practiceId, clientId, period, status, checklist
RateCard	Billing rates	id, practiceId, name, rates, isDefault
10. Implementation Notes
The Practice Hub requires careful attention to multi-tenancy and client isolation. Each practice operates independently with its own client list, team, and workflows. Client company data must be properly scoped to ensure practices only access their authorized clients. The client-switching mechanism should maintain proper context throughout the application. Integration with the core accounting modules requires careful handling of company context to ensure operations are performed on the correct client company. The practice-level settings should not affect client company configurations.

HAYPBOOKS
Page101 Documentation Series
Part 18: HOME Module
Dashboard, Business Health & Shortcuts
Comprehensive Page Specifications for Implementation
 
Table of Contents
This document covers 3 pages in the HOME module: Dashboard, Business Health, and Shortcuts.
1. Dashboard Page
Route: /home/dashboard
1.1 Page Overview
The Dashboard serves as the primary landing page for users after logging into HaypBooks. It provides a comprehensive at-a-glance view of the company's financial status, key performance indicators, pending tasks, and quick access to frequently used features. The dashboard is designed to reduce cognitive load by presenting the most critical information upfront while enabling drill-down into detailed views. This page aggregates data from multiple modules including accounting, sales, expenses, banking, and payroll to provide a holistic business overview.
1.2 Page Layout & Design
The dashboard follows a card-based responsive grid layout that adapts to different screen sizes. The design prioritizes information hierarchy with key metrics prominently displayed in the upper section. Color coding is used consistently to indicate status (green for positive, red for negative, amber for warnings). Interactive charts and graphs provide visual representation of trends and comparisons. The layout is organized into logical sections that group related information together.
Layout Components
Section	Position	Description
KPI Cards	Top Row	4 cards showing Cash Balance, Receivables, Payables, Net Income
Cash Flow Chart	Middle Left	Line chart showing cash position over last 30/60/90 days
Income vs Expense	Middle Right	Bar chart comparing monthly income and expenses
Pending Tasks	Bottom Left	List of tasks requiring attention with due dates
Recent Activity	Bottom Right	Timeline of recent transactions and system events
Table 1: Dashboard Layout Components
1.3 Buttons & Actions
Button	Location	Function
Refresh	Top Right	Reloads all dashboard data with latest values
Date Range	Top Filter Bar	Dropdown to select This Month, Last 30 Days, Quarter, Year
View Details	KPI Card	Clicking a KPI card navigates to detailed report page
Quick Create	Top Bar (+)	Opens modal to create Invoice, Bill, JE, Expense, etc.
Task Item	Pending Tasks	Clicking a task navigates to the relevant page to complete
Table 2: Dashboard Buttons and Actions
1.4 Data Tables & Displays
The Dashboard contains several data displays that present information in different formats. The KPI Cards section displays four primary financial metrics with comparison to previous periods and trend indicators. Each card shows the current value, percentage change, and a mini sparkline chart. The Cash Flow Chart visualizes the movement of cash through the business over time, helping identify patterns and potential shortfalls.
KPI Cards Data Structure
KPI Name	Calculation Source	Drill-Down Target
Cash Balance	Sum of all bank account balances	/banking-cash/cash-accounts/bank-accounts
Accounts Receivable	Sum of unpaid invoices	/sales/aging
Accounts Payable	Sum of unpaid bills	/expenses/aging
Net Income	Revenue minus expenses for period	/reporting/financial-statements
Table 3: Dashboard KPI Cards Configuration
1.5 Backend API Connections
The Dashboard aggregates data from multiple backend services. The primary API endpoint serves as a dashboard summary aggregator that fetches data from various modules and returns a consolidated response. This approach minimizes frontend API calls and ensures consistent data presentation across all dashboard components.
API Endpoint	Method	Purpose
/api/companies/:id/dashboard	GET	Fetch all dashboard KPIs
/api/companies/:id/cash-flow	GET	Cash flow chart data
/api/companies/:id/tasks/pending	GET	Pending tasks list
/api/companies/:id/activity	GET	Recent activity feed
Table 4: Dashboard API Endpoints
1.6 Database Models Used
•	Company - For company context and settings
•	Account - For balance calculations
•	JournalEntry, JournalEntryLine - For income calculations
•	Invoice - For receivables
•	Bill - For payables
•	BankAccount - For cash balance
•	Task - For pending tasks
•	AuditLog - For activity feed
1.7 Page Goals & Success Metrics
The Dashboard page serves several critical goals for the HaypBooks application. First, it provides immediate visibility into the company's financial health upon login, reducing the time users need to spend gathering information from multiple sources. Second, it surfaces actionable items and pending tasks that require attention, helping users prioritize their daily activities. Third, it enables quick navigation to detailed views for deeper analysis when needed.
•	Reduce time to access critical financial data by 70%
•	Surface at least 95% of actionable items requiring user attention
•	Enable drill-down navigation within 2 clicks for all KPIs
•	Page load time under 2 seconds for dashboard data
2. Business Health Page
Route: /home/business-health
2.1 Page Overview
The Business Health page provides a comprehensive diagnostic view of the company's financial wellbeing. Unlike the Dashboard which shows raw metrics, this page presents analyzed health scores, alerts, and recommendations. It helps business owners and accountants quickly identify potential issues and areas requiring attention. The page combines automated analysis with visual indicators to communicate complex financial information in an accessible format.
2.2 Health Score Components
Score Name	Range	Factors Considered
Cash Health	0-100	Cash runway, burn rate, liquidity ratio
Receivables Health	0-100	DSO, aging concentration, collection rate
Payables Health	0-100	DPO, payment timing, vendor relationships
Profitability	0-100	Gross margin, net margin, trend direction
Overall Score	0-100	Weighted average of all component scores
Table 5: Business Health Score Components
2.3 Alert Categories
The Business Health page features an intelligent alert system that proactively identifies potential issues before they become critical problems. Alerts are categorized by severity and type, with each alert providing context, recommended actions, and links to relevant pages where users can address the underlying issues. The alert engine runs continuously in the background and updates scores in real-time as new transactions are processed.
Severity	Example Alerts	Action Required
Critical	Cash runway < 30 days	Immediate attention to cash management
Warning	AR aging > 60 days increasing	Review collection process
Info	Quarterly tax payment due	Schedule payment in calendar
Table 6: Business Health Alert Categories
2.4 Backend API Connections
API Endpoint	Method	Purpose
/api/companies/:id/health/scores	GET	Health scores summary
/api/companies/:id/health/alerts	GET	Active alerts list
/api/companies/:id/health/recommendations	GET	AI-generated recommendations
Table 7: Business Health API Endpoints
2.5 UI Components Required
•	HealthScoreGauge - Circular gauge visualization (0-100)
•	ScoreCard - Individual metric card with trend indicator
•	AlertList - Scrollable list of active alerts with severity badges
•	RecommendationCard - Actionable recommendation with links
•	TrendChart - Sparkline showing metric history
3. Shortcuts Page
Route: /home/shortcuts
3.1 Page Overview
The Shortcuts page provides a customizable quick-access panel for frequently used features, reports, and pages. Users can personalize their shortcuts based on their role and workflow preferences, significantly reducing navigation time for routine tasks. This page serves as a personal productivity hub that adapts to each user's unique needs and working patterns. The system also suggests shortcuts based on usage patterns and role-based templates.
3.2 Default Shortcuts by Role
Role	Default Shortcuts	Quick Actions
Owner	Dashboard, Invoices, Bills, Bank Accounts	Create Invoice, Record Payment, Add Bill
Accountant	Chart of Accounts, Journal Entries, Reconciliation	Create JE, Post Entries, Run Reports
Bookkeeper	Bank Transactions, Reconciliation, Receipts	Import Bank, Match Transactions, Upload Receipt
Sales User	Customers, Invoices, Quotes, Products	New Invoice, New Quote, Add Customer
Table 8: Default Shortcuts by User Role
3.3 Shortcut Configuration
Each shortcut is configured with a display name, target route, icon identifier, and optional description. Shortcuts can be organized into custom groups or categories for better organization. The system supports both page navigation shortcuts and action shortcuts that trigger specific functions like creating new records.
Field	Description	Required
name	Display label shown to user	Yes
route	Navigation path when clicked	Yes
icon	Lucide icon identifier	Yes
actionType	navigate or quickAction	Yes
category	Optional group for organization	No
Table 9: Shortcut Configuration Fields
3.4 Buttons & Actions
Button	Location	Function
Add Shortcut	Top Right	Opens modal to add new shortcut from catalog
Remove	Shortcut Card	Removes shortcut from user's list
Reset to Default	Top Bar	Restores role-based default shortcuts
Drag Handle	Shortcut Card	Reorder shortcuts via drag and drop
Shortcut Card	Main Grid	Click to navigate or trigger action
Table 10: Shortcuts Page Buttons
3.5 Backend API Connections
API Endpoint	Method	Purpose
/api/users/:id/shortcuts	GET	Get user's shortcuts
/api/users/:id/shortcuts	PUT	Update shortcuts order/list
/api/shortcuts/catalog	GET	Available shortcuts catalog
/api/users/:id/shortcuts/reset	POST	Reset to role defaults
Table 11: Shortcuts API Endpoints
3.6 Database Models Used
•	UserShortcut - Stores user's shortcut configuration
•	ShortcutTemplate - Available shortcuts catalog
•	User - For user context and role
•	Role - For default shortcut templates
3.7 UI Components Required
•	ShortcutGrid - Responsive grid layout for shortcut cards
•	ShortcutCard - Individual shortcut display with icon and label
•	ShortcutCatalog - Modal for browsing and adding shortcuts
•	DragDropList - Reorderable list component
•	QuickActionModal - Modal for quick actions (create invoice, etc.)
4. Implementation Summary
The HOME module provides the essential entry point for users into the HaypBooks application. The Dashboard offers immediate visibility into critical business metrics, the Business Health page provides diagnostic insights and recommendations, and the Shortcuts page enables personalized productivity optimization. Together, these three pages form a cohesive home experience that adapts to different user roles and workflow preferences.
4.1 Module Statistics
Metric	Value
Total Pages	3
API Endpoints Required	12
Database Models Used	12+
UI Components Required	15+
Table 12: HOME Module Implementation Statistics

HAYPBOOKS
Page101 Documentation Series
Part 19: TASKS & APPROVALS Module
My Work, Management & History Sections
Comprehensive Page Specifications for Implementation
 
Table of Contents
This document covers 10 pages across 3 sections: My Work (4 pages), Management (3 pages), and History (2 pages).
1. My Work Section
The My Work section provides a personal task management interface where users can view and manage their assigned tasks, approvals, exceptions, and overdue items. This section serves as the primary workspace for individual contributors to track their daily work responsibilities and ensure timely completion of assigned activities.
1.1 My Tasks Page
Route: /tasks-approvals/my-work/my-tasks
Page Overview
The My Tasks page displays all tasks currently assigned to the logged-in user. Tasks are organized by priority and due date, with visual indicators showing urgency levels. The page supports filtering by task type, status, and date range. Users can expand task details to view full context, related documents, and action history. The page integrates with the broader task management system and supports task-specific actions based on task type.
Data Table Columns
Column	Type	Sortable	Filterable
Task Name	String	Yes	Yes
Task Type	Enum	Yes	Yes
Priority	Enum	Yes	Yes
Due Date	Date	Yes	Yes
Status	Enum	Yes	Yes
Assigned By	String	Yes	Yes
Table 1: My Tasks Data Columns
Buttons & Actions
Button	Location	Function
View Details	Row Action	Opens task detail modal/panel
Complete	Row Action	Marks task as completed
Defer	Row Action	Opens defer dialog with new due date
Filter	Top Bar	Filter by type, priority, status
Table 2: My Tasks Buttons
1.2 My Approvals Page
Route: /tasks-approvals/my-work/my-approvals
Page Overview
The My Approvals page displays all items awaiting the user's approval. This includes transactions like invoices, bills, purchase orders, journal entries, and expense reports based on the user's approval authority level. The page provides a streamlined interface for reviewing and acting on approval requests, with the ability to approve, reject, or request additional information. Each approval item shows relevant context to enable informed decision-making.
Approval Types Supported
Approval Type	Source Module	Key Details Shown
Invoice Approval	Sales	Customer, amount, line items
Bill Approval	Expenses/AP	Vendor, amount, due date
Journal Entry	Accounting	Lines, debits, credits
Purchase Order	Expenses/AP	Items, quantities, total
Expense Report	Expenses	Employee, total, receipts
Table 3: Approval Types Configuration
Approval Actions
•	Approve - Grants approval and advances to next level if applicable
•	Reject - Declines the item with required reason
•	Request Info - Sends back to submitter for clarification
•	Delegate - Forwards to another approver
•	View Details - Opens full document preview
1.3 My Exceptions Page
Route: /tasks-approvals/my-work/my-exceptions
Page Overview
The My Exceptions page displays system-detected anomalies and exceptions that require user attention. These include reconciliation mismatches, failed automations, validation errors, and compliance alerts. Exceptions are categorized by severity and impact, helping users prioritize resolution efforts. Each exception provides context about what went wrong, why it matters, and suggested resolution steps.
Exception Categories
Category	Severity	Examples
Reconciliation	High	Bank balance mismatch, unmatched transactions
Automation Failure	Medium	Failed bank feed import, recurring invoice error
Validation Error	Medium	Invalid tax code, missing required fields
Compliance Alert	High	Filing deadline approaching, threshold breach
Table 4: Exception Categories
1.4 Overdue Items Page
Route: /tasks-approvals/my-work/overdue-items
Page Overview
The Overdue Items page aggregates all items past their due date that are assigned to or owned by the current user. This includes overdue tasks, unprocessed approvals, pending reconciliations, and aged items like invoices awaiting payment or bills due for payment. The page provides a consolidated view to help users identify and address time-sensitive items that require immediate attention.
Overdue Metrics Displayed
•	Days Overdue - Calculated from original due date
•	Aging Bucket - 1-7 days, 8-30 days, 31+ days, 60+ days
•	Impact Score - Business impact assessment
•	Escalation Status - Whether item has been escalated
2. Management Section
The Management section provides supervisory capabilities for team leads and managers to oversee team tasks, delegated responsibilities, and the approval queue. This section requires elevated permissions and offers a broader view of work distribution and team productivity.
2.1 Team Tasks Page
Route: /tasks-approvals/management/team-tasks
Page Overview
The Team Tasks page displays all tasks assigned to team members under the current user's supervision. It provides visibility into team workload, task distribution, and completion status. Managers can reassign tasks, adjust priorities, and monitor team productivity. The page includes team-level metrics and individual performance indicators.
Team Metrics Dashboard
Metric	Calculation	Visualization
Team Workload	Active tasks per member	Bar chart
Completion Rate	Completed / Total tasks	Progress bar
Overdue Count	Tasks past due date	Counter badge
Table 5: Team Tasks Metrics
2.2 Delegated Tasks Page
Route: /tasks-approvals/management/delegated-tasks
Page Overview
The Delegated Tasks page shows tasks that the current user has delegated to others while retaining oversight responsibility. This allows managers and team leads to track delegated work without direct ownership. The page maintains visibility into task status, completion progress, and any issues that may require intervention. Delegation history and comments are preserved for audit purposes.
Delegation Features
•	Delegate with deadline - Set expected completion date
•	Delegate with instructions - Add context and requirements
•	Receive notifications - Alerts on status changes
•	Reclaim task - Take back delegated task if needed
•	View progress - Real-time status updates
2.3 Approval Queue Page
Route: /tasks-approvals/management/approval-queue
Page Overview
The Approval Queue page provides a consolidated view of all items pending approval across the team or organization. This is particularly useful for managers who need to monitor approval bottlenecks and ensure timely processing of requests. The queue can be filtered by approval type, submitter, amount threshold, and time pending. Batch approval capabilities are available for qualified items.
Queue Management Actions
Action	Description	Permission Required
Batch Approve	Approve multiple items at once	Manager + Batch Approval
Reassign	Move item to different approver	Manager
Escalate	Flag for urgent attention	Manager + Escalation
View Audit Trail	See full approval history	All Approvers
Table 6: Approval Queue Management Actions
3. History Section
The History section provides archival access to completed tasks and approval decisions. This enables audit trail review, performance analysis, and reference lookup for past activities.
3.1 Completed Tasks Page
Route: /tasks-approvals/history/completed-tasks
Page Overview
The Completed Tasks page archives all tasks that have been marked as complete. This serves as a historical record for audit purposes and performance analysis. Users can search and filter completed tasks, view completion details, and export data for reporting. The page also supports reopening tasks if additional work is discovered to be needed.
Completion Details Captured
Field	Description	Usage
Completed Date	When task was marked complete	Audit, performance tracking
Completed By	User who completed the task	Accountability, assignment
Time to Complete	Duration from assignment to completion	Performance metrics
Completion Notes	Optional notes added at completion	Context, knowledge transfer
Table 7: Completed Tasks Details
3.2 Approval History Page
Route: /tasks-approvals/history/approval-history
Page Overview
The Approval History page provides a comprehensive record of all approval decisions made within the system. This includes approvals granted, rejections, and requests for additional information. The history is essential for audit compliance, dispute resolution, and analyzing approval patterns. Each record maintains the full context of the approval decision including the document details, approver, decision, and timestamp.
History Record Structure
•	Document Reference - Link to original document
•	Document Type - Invoice, Bill, JE, PO, etc.
•	Decision - Approved, Rejected, Delegated
•	Approver - User who made the decision
•	Decision Date - Timestamp of action
•	Comments - Optional notes provided
•	Approval Level - Position in multi-level approval
4. Backend API Connections
The Tasks & Approvals module requires comprehensive API infrastructure to support the various workflows and data requirements across all pages. The following endpoints define the integration points between the frontend components and the backend services.
API Endpoint	Method	Purpose
/api/companies/:id/tasks	GET, POST	List/create tasks
/api/companies/:id/tasks/:taskId	GET, PUT	Task details/update
/api/companies/:id/tasks/:taskId/complete	POST	Mark task complete
/api/companies/:id/approvals	GET	List pending approvals
/api/companies/:id/approvals/:approvalId/approve	POST	Approve item
/api/companies/:id/approvals/:approvalId/reject	POST	Reject item
/api/companies/:id/exceptions	GET	List exceptions
/api/companies/:id/approvals/history	GET	Approval history
Table 8: Tasks & Approvals API Endpoints
5. Database Models Used
The Tasks & Approvals module relies on several database models to track tasks, approvals, and related entities. These models maintain relationships with other system modules to provide comprehensive workflow management.
•	Task - Core task entity with status, priority, assignments
•	TaskAssignment - Links users to tasks with role
•	ApprovalRequest - Approval workflow requests
•	ApprovalDecision - Individual approval decisions
•	ApprovalChain - Multi-level approval configuration
•	Exception - System-detected anomalies
•	Delegation - Task delegation records
•	User - User context and assignments
•	Company - Company context
6. UI Components Required
The following reusable UI components are required to implement the Tasks & Approvals module across all pages:
•	TaskCard - Individual task display with status indicator
•	TaskList - Sortable/filterable list of tasks
•	ApprovalCard - Approval request display with actions
•	ApprovalActions - Approve/Reject/Delegate buttons
•	ExceptionAlert - Exception display with severity
•	PriorityBadge - Visual priority indicator
•	DueDateDisplay - Date with overdue highlighting
•	TaskFilters - Filter dropdown component
•	TaskDetailModal - Full task view in modal
•	ApprovalHistoryTimeline - Visual approval flow
7. Module Summary
Metric	Value
Total Pages	10 (My Work: 4, Management: 3, History: 2)
API Endpoints Required	15+
Database Models Used	9+
UI Components Required	15+
Table 9: Tasks & Approvals Module Statistics

HAYPBOOKS
Page101 Documentation Series
Part 20: ORGANIZATION Module
Entity Structure, Operational Structure & Governance
Comprehensive Page Specifications for Implementation
 
Table of Contents
This document covers 7 pages across 3 sections: Entity Structure (3 pages), Operational Structure (3 pages), and Governance (2 pages).
1. Entity Structure Section (Legal)
The Entity Structure section manages the legal entity framework of the organization, including legal entities, intercompany transactions, and consolidation processes. This section is essential for multi-entity organizations and enterprise-level accounting operations that require proper legal entity management and financial consolidation.
1.1 Legal Entities Page
Route: /organization/entity-structure/legal-entities
Page Overview
The Legal Entities page serves as the central registry for all legal entities within the organization's corporate structure. Each legal entity represents a distinct legal person such as a corporation, LLC, partnership, or branch office. The page enables creation, editing, and management of entity information including registration details, tax identification numbers, fiscal year settings, and base currency. This information is critical for proper financial reporting, tax compliance, and intercompany transaction processing.
Entity Data Structure
Field	Type	Description
Legal Name	String	Official registered name of the entity
Trading Name	String	DBA or brand name if different
Entity Type	Enum	Corporation, LLC, Partnership, Branch
Tax ID	String	EIN, TIN, or local tax identifier
Registration No	String	Company registration number
Base Currency	Currency	Functional currency for accounting
Fiscal Year End	Month	Month when fiscal year ends
Jurisdiction	String	Country/state of incorporation
Table 1: Legal Entity Data Structure
Buttons & Actions
Button	Location	Function
Add Entity	Top Right	Opens form to create new legal entity
Edit	Row Action	Opens entity edit form
View Details	Row Click	Shows entity detail panel
Deactivate	Row Action	Soft deletes entity if no transactions
Set Active	Entity Switcher	Changes current working entity context
Table 2: Legal Entities Page Buttons
1.2 Intercompany Transactions Page
Route: /organization/entity-structure/intercompany
Page Overview
The Intercompany Transactions page manages financial transactions between related legal entities within the same corporate group. This includes intercompany loans, expense allocations, revenue sharing, and asset transfers. Proper intercompany accounting is essential for consolidated financial statements and tax compliance. The page provides visibility into intercompany balances, automated elimination entries, and reconciliation tools to ensure intercompany accounts are in balance across entities.
Transaction Types Supported
Type	Description	Accounting Treatment
Intercompany Loan	Loan between related entities	Due to/from affiliate accounts
Expense Allocation	Shared costs distributed to entities	Management fee/expense allocation
Revenue Sharing	Shared revenue between entities	Intercompany revenue/expense
Asset Transfer	Transfer of assets between entities	Fixed asset disposal/acquisition
Cash Transfer	Movement of cash between entities	Due to/from affiliate accounts
Table 3: Intercompany Transaction Types
1.3 Consolidation Page
Route: /organization/entity-structure/consolidation
Page Overview
The Consolidation page enables the creation of consolidated financial statements by combining the financial results of multiple legal entities. This enterprise-level feature supports percentage of ownership consolidation, elimination of intercompany transactions, and currency translation for multi-currency entities. The consolidation process generates elimination entries automatically and provides tools for reviewing and adjusting the consolidated results before final report generation.
Consolidation Process Steps
•	Entity Selection - Choose entities to consolidate
•	Ownership Setup - Define ownership percentages
•	Currency Translation - Convert to reporting currency
•	Intercompany Elimination - Remove IC transactions
•	Minority Interest Calculation - Compute NCI
•	Report Generation - Produce consolidated statements
2. Operational Structure Section
The Operational Structure section manages the internal organizational framework including locations, divisions, departments, and the organizational chart. This structure supports operational reporting, cost center accounting, and workforce management.
2.1 Locations & Divisions Page
Route: /organization/operational-structure/locations-divisions
Page Overview
The Locations & Divisions page manages the physical and organizational divisions of the company. Locations represent physical places of business such as offices, warehouses, and retail stores. Divisions represent logical business segments such as product lines or service areas. Both can be used for reporting segmentation and operational management. The page supports hierarchical structures where locations can be grouped under regions and divisions under business units.
Location Data Fields
Field	Type	Description
Name	String	Location display name
Location Type	Enum	Headquarters, Branch, Warehouse, Retail
Address	Address	Full physical address
Region	Reference	Parent region for grouping
Manager	User Reference	Location manager or head
Table 4: Location Data Structure
2.2 Departments Page
Route: /organization/operational-structure/departments
Page Overview
The Departments page manages the organizational departments and cost centers within the company. Departments can be organized hierarchically with parent-child relationships, enabling detailed cost allocation and reporting. Each department can have assigned employees, budgets, and expense tracking. The page supports department-level reporting for management accounting and operational analysis.
Department Configuration
•	Department Name and Code
•	Parent Department - For hierarchical structure
•	Department Head - Manager assignment
•	Cost Center Code - For accounting integration
•	Budget Allocation - Annual budget amount
•	Default GL Accounts - Expense account mappings
2.3 Org Chart Page
Route: /organization/operational-structure/org-chart
Page Overview
The Org Chart page provides a visual representation of the organizational structure, showing reporting relationships between employees and departments. The interactive chart allows users to explore the hierarchy, view employee details, and understand reporting lines. This is particularly useful for understanding the company structure, planning reorganizations, and onboarding new employees who need to understand the organizational landscape.
Org Chart Features
Feature	Description
Interactive View	Click to expand/collapse branches, zoom and pan
Employee Cards	Photo, name, title, department for each employee
Search	Find employees by name, title, or department
Export	Download org chart as PDF or image
Table 5: Org Chart Features
3. Governance Section
The Governance section manages corporate governance requirements including filing calendars and document storage. This section helps organizations maintain compliance with regulatory filing requirements and maintain proper document archives.
3.1 Filing Calendar Page
Route: /organization/governance/filing-calendar
Page Overview
The Filing Calendar page tracks all required regulatory and tax filings for the organization. It provides a centralized view of upcoming deadlines, completed filings, and historical records. The calendar can be configured to show filings by entity, jurisdiction, or filing type. Automated reminders alert responsible parties before deadlines, and the system tracks completion status and supporting documentation.
Filing Types Tracked
Category	Examples	Typical Frequency
Tax Filings	Income tax, VAT, withholding tax	Monthly, Quarterly, Annual
Regulatory	SEC filings, industry reports	Quarterly, Annual
Corporate	Annual report, business renewal	Annual
Employment	SSS, PhilHealth, HDMF contributions	Monthly
Table 6: Filing Calendar Categories
3.2 Document Storage Page
Route: /organization/governance/document-storage
Page Overview
The Document Storage page provides a centralized repository for corporate documents including legal documents, contracts, resolutions, and compliance records. Documents can be organized by category, entity, or custom tags. The system maintains version history, access controls, and retention schedules. Integration with other modules allows linking documents to transactions, customers, vendors, and employees.
Document Categories
•	Legal Documents - Articles of incorporation, bylaws, resolutions
•	Contracts - Customer contracts, vendor agreements, leases
•	Tax Records - Tax returns, assessments, BIR correspondence
•	Compliance - Permits, licenses, certifications
•	Financial Records - Audit reports, financial statements
•	HR Documents - Employee records, contracts, policies
4. Backend API Connections
API Endpoint	Method	Purpose
/api/companies/:id/legal-entities	GET, POST	List/create legal entities
/api/companies/:id/intercompany	GET, POST	Intercompany transactions
/api/companies/:id/consolidation	GET, POST	Consolidation management
/api/companies/:id/locations	GET, POST	Location management
/api/companies/:id/departments	GET, POST	Department management
/api/companies/:id/org-chart	GET	Org chart data
/api/companies/:id/filings	GET, POST	Filing calendar management
/api/companies/:id/documents	GET, POST	Document storage
Table 7: Organization Module API Endpoints
5. Database Models Used
•	Company/LegalEntity - Legal entity records
•	IntercompanyTransaction - IC transaction records
•	Consolidation - Consolidation configuration
•	Location - Physical location records
•	Division - Business division records
•	Department - Department/cost center records
•	Employee - Employee records with reporting
•	Filing - Regulatory filing records
•	Document - Document storage records
•	Attachment - File attachments
6. UI Components Required
•	EntityCard - Legal entity display card
•	EntityForm - Entity creation/edit form
•	IntercompanyTable - IC transaction list
•	ConsolidationWizard - Step-by-step consolidation
•	LocationTree - Hierarchical location display
•	DepartmentTree - Department hierarchy
•	OrgChartView - Interactive org chart
•	FilingCalendar - Calendar view of filings
•	FilingCard - Individual filing display
•	DocumentBrowser - File browser component
•	DocumentUploader - File upload component
7. Module Summary
Metric	Value
Total Pages	7 (Entity: 3, Operational: 3, Governance: 2)
API Endpoints Required	12+
Database Models Used	10+
UI Components Required	12+
Table 8: Organization Module Statistics

HAYPBOOKS
Page101 Documentation Series
Part 21: PROJECTS Module
Project Setup, Planning, Tracking, Billing & Financials
Comprehensive Page Specifications for Implementation
 
1. Projects Module Overview
The Projects module provides comprehensive project management and accounting capabilities. It supports project-based businesses in tracking costs, billing clients, managing resources, and analyzing project profitability. The module integrates with Time, Expenses, AR, and AP modules for complete project financial management.
2. Project Setup Section
2.1 Projects Page
Route: /projects/project-setup/projects
The Projects page is the central hub for managing all projects. Each project contains details about the client, contract value, budget, timeline, and status. The page provides filtering by status, client, project manager, and date range. Projects can be created from templates for standard engagement types.
Project Data Structure
Field	Type	Description
Project Name	String	Display name for the project
Project Code	String	Unique identifier code
Client	Customer Ref	Customer or internal department
Status	Enum	Draft, Active, On Hold, Completed, Cancelled
Project Manager	User Ref	Primary project owner
Contract Value	Decimal	Total contract amount
Billing Type	Enum	Fixed Price, Time & Materials, Retainer
Table 1: Project Data Structure
2.2 Project Templates Page
Route: /projects/project-setup/project-templates
Project Templates allow organizations to define standard project configurations for recurring engagement types. Templates include default tasks, milestones, budget allocations, and billing structures. Creating projects from templates ensures consistency and reduces setup time.
2.3 Milestones Page
Route: /projects/project-setup/milestones
Milestones define key deliverables or checkpoints within a project. Each milestone has a target date, deliverables list, and can be linked to billing events. Milestone tracking helps monitor project progress and can trigger billing or payment events.
2.4 Budgets Page
Route: /projects/project-setup/budgets
Project Budgets define the planned financial parameters including labor hours, labor costs, expense allowances, and margin targets. Budgets can be entered by phase, task, or cost category. The system tracks actual vs budget throughout the project lifecycle.
2.5 Contracts Page
Route: /projects/project-setup/contracts
Project Contracts store the legal agreements with clients including scope, terms, payment schedules, and change order provisions. Contract terms can be linked to billing rules and milestone triggers.
3. Planning Section
3.1 Project Tasks Page
Route: /projects/planning/project-tasks
Project Tasks define the work breakdown structure for each project. Tasks can be organized hierarchically with dependencies, assigned to team members, and linked to budget allocations. Task management supports Gantt chart visualization and critical path analysis.
3.2 Schedule Page
Route: /projects/planning/schedule
The Schedule page provides timeline visualization of project tasks and milestones. Users can adjust task durations, set dependencies, and view the project Gantt chart. Resource leveling tools help optimize team allocation across concurrent projects.
3.3 Resource Planning (Enterprise)
Route: /projects/planning/resource-planning
Resource Planning enables allocation of personnel and equipment across projects. The page shows resource utilization, availability, and conflicts. Managers can optimize assignments to balance workloads and meet project deadlines.
4. Tracking Section
4.1 Project Time Page
Route: /projects/tracking/project-time
Project Time displays time entries logged against project tasks. The page supports filtering by project, task, employee, and date range. Time entries can be approved, adjusted, or marked as billable/non-billable.
4.2 Project Expenses Page
Route: /projects/tracking/project-expenses
Project Expenses tracks costs incurred for projects including travel, materials, and subcontractors. Expenses can be marked as reimbursable, billable, or internal. The page links to expense reports and vendor bills.
4.3 Billable Review Page
Route: /projects/tracking/billable-review
Billable Review provides a workflow for reviewing time and expenses before billing. Users can adjust billing amounts, mark items as non-billable, or split entries across invoices. This ensures accurate client billing.
5. Billing Section
5.1 Project Billing Page
Route: /projects/billing/project-billing
Project Billing manages the invoicing process for projects. Users can generate invoices based on time & materials, fixed milestones, or percentage of completion. The page supports draft review before invoice generation.
5.2 Progress Billing Page
Route: /projects/billing/progress-billing
Progress Billing supports percentage-of-completion invoicing common in construction and long-term projects. Users enter completion percentages and the system calculates billable amounts based on contract terms.
5.3 Change Orders Page
Route: /projects/billing/change-orders
Change Orders manages modifications to project scope, timeline, or budget. Each change order documents the requested changes, impact analysis, and approval workflow. Approved change orders update the project baseline.
5.4 Work in Progress (WIP) Page
Route: /projects/billing/work-in-progress
WIP tracks unbilled work on projects. The page shows costs incurred vs amounts billed, helping identify projects needing invoice generation. WIP reports support revenue recognition decisions.
6. Financials Section
6.1 Project Profitability Page
Route: /projects/financials/project-profitability
Project Profitability analyzes revenue vs costs by project. The page shows gross margin, contribution margin, and profitability trends. Users can drill into cost categories to identify improvement opportunities.
6.2 Budget vs Actual Page
Route: /projects/financials/budget-vs-actual
Budget vs Actual compares planned vs incurred costs by category, phase, or task. Variance analysis helps identify cost overruns early. The page supports forecast adjustments based on current trends.
6.3 Margin Analysis Page
Route: /projects/financials/margin-analysis
Margin Analysis provides detailed breakdown of project margins including labor margin, expense margin, and overall project margin. Analysis can be viewed by project, client, or project type.
7. Insights Section
7.1 Project Dashboard Page
Route: /projects/insights/project-dashboard
The Project Dashboard provides KPIs and visualizations for project portfolio management. Key metrics include active projects, total revenue, average margin, and projects at risk. The dashboard supports drill-down to individual project details.
7.2 Resource Utilization Page
Route: /projects/insights/resource-utilization
Resource Utilization shows team member allocation across projects. The page identifies underutilized and overallocated resources. Utilization rates can be analyzed by role, department, or individual.
7.3 Completion Forecast Page
Route: /projects/insights/completion-forecast
Completion Forecast predicts project completion dates and final costs based on current progress and trends. The forecast engine uses earned value analysis to identify projects likely to exceed budget or timeline.
8. Backend API Connections
API Endpoint	Method	Purpose
/api/companies/:id/projects	GET, POST	List/create projects
/api/companies/:id/projects/:projectId	GET, PUT	Project details/update
/api/companies/:id/projects/:projectId/tasks	GET, POST	Project tasks
/api/companies/:id/projects/:projectId/time	GET	Project time entries
/api/companies/:id/projects/:projectId/expenses	GET	Project expenses
/api/companies/:id/projects/:projectId/invoices	GET, POST	Project invoices
/api/companies/:id/projects/:projectId/profitability	GET	Profitability analysis
Table 2: Projects Module API Endpoints
9. Database Models
•	Project - Core project entity
•	ProjectTask - Work breakdown structure
•	ProjectMilestone - Project milestones
•	ProjectBudget - Budget allocations
•	ProjectContract - Contract terms
•	ChangeOrder - Scope changes
•	TimeEntry - Project time tracking
•	ProjectExpense - Project costs
10. Module Summary
The Projects Module encompasses 18 pages across 6 sections: Setup (5), Planning (3), Tracking (5), Billing (6), Financials (4), and Insights (3). The module requires 10+ database models, 15+ API endpoints, and 20+ UI components for complete implementation.

HAYPBOOKS
Page101 Documentation Series
Part 22: TIME Module
Time Entry, Review & Analysis
Comprehensive Page Specifications for Implementation
 
1. Time Module Overview
The Time Module provides comprehensive time tracking capabilities for professional services organizations. It supports time entry, timesheet management, billable time review, and utilization analysis. The module integrates with Projects for project-based time tracking and Payroll for compensation calculations.
2. Entry Section
2.1 Time Entries Page
Route: /time/entry/time-entries
The Time Entries page is the primary interface for logging work hours. Users can enter time against projects, tasks, or general activities. The page supports daily and weekly entry views, with auto-population of recent activities. Time entries include start/end times or duration, project/task assignment, billable status, and notes.
Time Entry Data Structure
Field	Type	Description
Date	Date	Date of work performed
Duration	Decimal/Time	Hours and minutes worked
Project	Project Ref	Associated project (optional)
Task	Task Ref	Specific task within project
Billable	Boolean	Whether time is billable
Bill Rate	Decimal	Hourly billing rate
Notes	String	Description of work performed
Table 1: Time Entry Data Structure
2.2 Timesheets Page
Route: /time/entry/timesheets
The Timesheets page provides a weekly or bi-weekly view of time entries for approval workflows. Employees submit timesheets for manager approval, and approved timesheets trigger billing and payroll processes. The page shows daily totals, weekly summaries, and overtime calculations.
2.3 Timer Page
Route: /time/entry/timer
The Timer page provides a real-time clock-in/clock-out interface for tracking work sessions. Users start timers for specific projects or tasks, and the system logs elapsed time. The timer supports pausing, resuming, and switching between activities. Completed timer sessions automatically create time entries.
3. Review Section
3.1 Billable Time Review Page
Route: /time/review/billable-time-review
The Billable Time Review page enables managers to review time entries before billing. Users can adjust billable status, modify billing rates, and prepare entries for invoicing. The page shows unbilled time by project, client, and employee.
3.2 Time Approvals Page (Enterprise)
Route: /time/review/time-approvals
The Time Approvals page provides a workflow for managers to approve or reject timesheet submissions. Approvers can review time entries, compare against schedules, and ensure compliance with policies. Rejected timesheets return to employees for correction.
4. Analysis Section
4.1 Time by Project Page
Route: /time/analysis/time-by-project
The Time by Project page analyzes time allocation across projects. Users can view hours logged, compare against budgets, and identify projects requiring attention. The page supports filtering by date range, project status, and project manager.
4.2 Time by Customer Page
Route: /time/analysis/time-by-customer
The Time by Customer page aggregates time by client, showing total hours, billable amounts, and revenue per customer. This view helps identify high-value clients and opportunities for additional services.
4.3 Utilization Report Page
Route: /time/analysis/utilization-report
The Utilization Report measures productivity by comparing billable hours to total available hours. The report shows utilization rates by employee, role, department, and team. High utilization indicates efficient resource use, while low utilization may indicate capacity for additional work.
Utilization Metrics
Metric	Formula	Purpose
Billable Utilization	Billable Hours / Available Hours	Revenue-generating efficiency
Total Utilization	(Billable + Non-Billable) / Available	Overall productivity
Target Utilization	Expected utilization rate	Performance benchmark
Table 2: Utilization Metrics
5. Backend API Connections
API Endpoint	Method	Purpose
/api/companies/:id/time-entries	GET, POST	List/create time entries
/api/companies/:id/time-entries/:entryId	GET, PUT, DELETE	Entry CRUD operations
/api/companies/:id/timesheets	GET, POST	Timesheet management
/api/companies/:id/timesheets/:tsId/submit	POST	Submit for approval
/api/companies/:id/timesheets/:tsId/approve	POST	Approve timesheet
/api/companies/:id/time/utilization	GET	Utilization analysis
/api/companies/:id/timer/start	POST	Start timer session
/api/companies/:id/timer/stop	POST	Stop timer session
Table 3: Time Module API Endpoints
6. Database Models
•	TimeEntry - Individual time records
•	Timesheet - Weekly/bi-weekly time summary
•	TimerSession - Active timer sessions
•	TimeApproval - Approval workflow records
•	BillableRate - Employee billing rates
•	User - Employee context
•	Project - Project context
7. UI Components Required
•	TimeEntryForm - Time entry creation/edit form
•	TimeEntryList - List of time entries
•	WeeklyTimesheet - Weekly time grid
•	TimerWidget - Live timer display
•	TimerControls - Start/stop/pause buttons
•	UtilizationChart - Utilization visualization
•	TimeApprovalCard - Approval interface
8. Module Summary
The Time Module contains 8 pages across 3 sections: Entry (3), Review (2), and Analysis (3). The module requires 7+ database models, 10+ API endpoints, and 10+ UI components for complete implementation.

HAYPBOOKS
Page101 Documentation Series
Part 23: REPORTING & ANALYTICS Module
Financial Statements, Custom Reports & Performance Center
Comprehensive Page Specifications for Implementation
 
1. Reporting & Analytics Overview
The Reporting & Analytics module provides comprehensive financial reporting capabilities including standard financial statements, custom report builder, saved report views, and performance dashboards. The module supports multi-entity consolidation, multi-currency reporting, and ESG reporting for enterprise customers.
1.1 Financial Statements Page
Route: /reporting/financial-statements
The Financial Statements page generates core financial reports including Balance Sheet, Income Statement (P&L), and Cash Flow Statement. Users can select reporting period, comparison options, and presentation format. Reports support drill-down from summary to detail level, showing underlying transactions.
Standard Financial Reports
Report	Description	Key Features
Balance Sheet	Assets = Liabilities + Equity	Comparative periods, classified format
Income Statement	Revenue - Expenses = Net Income	YoY comparison, % of revenue
Cash Flow Statement	Operating, Investing, Financing	Direct/indirect method options
Statement of Changes in Equity	Equity movements over period	Retained earnings roll-forward
Table 1: Standard Financial Reports
1.2 Standard Reports Page
Route: /reporting/standard-reports
The Standard Reports page provides a library of pre-built reports for common business needs. Reports include A/R Aging, A/P Aging, Trial Balance, General Ledger, and various operational reports. Each report offers parameters for customization and can be exported to Excel, PDF, or CSV.
Report Categories
•	Accounting Reports - Trial Balance, GL, Journal Report
•	Sales Reports - Sales by Customer, Product, Region
•	Expense Reports - Spend by Vendor, Category, Department
•	Banking Reports - Reconciliation Summary, Cash Position
•	Tax Reports - VAT Summary, Withholding Report
•	Payroll Reports - Payroll Summary, Tax Liabilities
1.3 Custom Reports Page
Route: /reporting/custom-reports
The Custom Reports page provides a report builder for creating ad-hoc reports. Users can select data sources, define columns, apply filters, and set sorting. The builder supports calculated fields, grouping, and subtotals. Custom reports can be saved as templates for reuse.
Report Builder Features
Feature	Description
Data Sources	GL, AR, AP, Banking, Inventory, Payroll, Projects
Column Selection	Drag-drop column selection with ordering
Filters	Date range, account, customer, vendor, department
Calculations	Sum, Count, Average, Min, Max, Custom formulas
Export	Excel, PDF, CSV, scheduled email delivery
Table 2: Custom Report Builder Features
1.4 Saved Views Page
Route: /reporting/saved-views
The Saved Views page manages user-created report configurations and dashboard layouts. Users can save their preferred report parameters, column layouts, and filter settings. Views can be shared with team members or kept private. The page supports organizing views by category or favorite status.
1.5 Performance Center Page
Route: /reporting/performance-center
The Performance Center provides KPI dashboards and scorecards for business performance monitoring. Pre-built dashboards cover financial metrics, operational efficiency, and growth indicators. Users can customize dashboards with widgets showing charts, gauges, and data tables. Real-time updates ensure current performance visibility.
KPI Categories
•	Financial KPIs - Revenue, Profit Margin, Cash Flow, ROI
•	Liquidity KPIs - Current Ratio, Quick Ratio, Cash Runway
•	Efficiency KPIs - DSO, DPO, Inventory Turnover
•	Growth KPIs - Revenue Growth, Customer Acquisition, Market Share
1.6 ESG Reporting Page (Enterprise)
Route: /reporting/esg-reporting
The ESG Reporting page supports Environmental, Social, and Governance reporting requirements. Users can track sustainability metrics, social responsibility initiatives, and governance compliance. The page supports frameworks like GRI, SASB, and TCFD for regulatory compliance and stakeholder reporting.
2. Backend API Connections
API Endpoint	Method	Purpose
/api/companies/:id/reports/balance-sheet	GET	Generate balance sheet
/api/companies/:id/reports/income-statement	GET	Generate P&L
/api/companies/:id/reports/cash-flow	GET	Generate cash flow
/api/companies/:id/reports/trial-balance	GET	Generate trial balance
/api/companies/:id/reports/custom	GET, POST	Custom report generation
/api/companies/:id/reports/saved	GET, POST, DELETE	Saved report management
/api/companies/:id/reports/export	GET	Export report to file
Table 3: Reporting Module API Endpoints
3. Database Models
•	Report - Custom report definitions
•	SavedView - User report configurations
•	Dashboard - Dashboard layouts
•	DashboardWidget - Dashboard components
•	KPI - KPI definitions and calculations
•	ReportSchedule - Scheduled report jobs
4. UI Components Required
•	ReportViewer - Report display component
•	ReportBuilder - Drag-drop report creator
•	ParameterPanel - Report parameter inputs
•	DashboardCanvas - Dashboard layout editor
•	KPICard - KPI display widget
•	ChartWidget - Chart display widget
•	ExportModal - Export options dialog
5. Module Summary
The Reporting & Analytics Module contains 6 pages covering financial statements, standard reports, custom report builder, saved views, performance center, and ESG reporting. The module requires 6+ database models, 10+ API endpoints, and 10+ UI components for complete implementation.

HAYPBOOKS
Page101 Documentation Series
Part 24: COMPLIANCE Module (Enterprise)
Controls, Monitoring & Reporting
Comprehensive Page Specifications for Implementation
 
1. Compliance Module Overview
The Compliance Module provides enterprise-grade compliance management capabilities including internal controls management, control testing, policy management, issue tracking, fraud detection, audit log analysis, and SOX compliance. This module is essential for organizations subject to regulatory requirements such as Sarbanes-Oxley, HIPAA, or industry-specific regulations.
2. Controls Section
2.1 Internal Controls Page
Route: /compliance/controls/internal-controls
The Internal Controls page manages the organization's control framework including control definitions, risk assessments, and control ownership. Each control is documented with its objective, risk category, control type (preventive/detective), frequency, and responsible party. The page supports control libraries that can be imported from standard frameworks like COSO or COBIT.
Control Documentation Structure
Field	Type	Description
Control ID	String	Unique control identifier
Control Name	String	Descriptive control name
Objective	String	What the control achieves
Risk Category	Enum	Financial, Operational, Compliance, Strategic
Control Type	Enum	Preventive, Detective, Corrective
Frequency	Enum	Daily, Weekly, Monthly, Quarterly, Annual
Owner	User Ref	Control owner responsible
Table 1: Control Documentation Fields
2.2 Control Testing Page
Route: /compliance/controls/control-testing
The Control Testing page manages the testing program for internal controls. Testing schedules define when and how controls are tested. Test results document findings, exceptions, and remediation status. The page supports different testing approaches including inquiry, observation, inspection, and re-performance.
2.3 Policy Management Page
Route: /compliance/controls/policy-management
The Policy Management page maintains the organization's policy library including corporate policies, procedures, and guidelines. Each policy includes version history, approval workflow, distribution tracking, and acknowledgment management. The page supports policy review cycles and automated reminders for policy updates.
3. Monitoring Section
3.1 Issue Tracking Page
Route: /compliance/monitoring/issue-tracking
The Issue Tracking page manages compliance issues, audit findings, and remediation activities. Issues can be linked to controls, policies, or audit engagements. Each issue tracks severity, root cause, remediation plan, owner, and due date. The page provides visibility into open issues and aging analysis.
3.2 Fraud Detection Rules Page
Route: /compliance/monitoring/fraud-detection-rules
The Fraud Detection Rules page configures automated rules for detecting potentially fraudulent activities. Rules can monitor transactions, user behavior, and access patterns. Alerts generated by rules are routed for investigation. The page supports rule testing and tuning to minimize false positives.
Detection Rule Types
•	Transaction Monitoring - Unusual amounts, frequencies, patterns
•	Access Monitoring - Unusual login times, locations, actions
•	Segregation of Duties - Conflicting role assignments
•	Threshold Alerts - Approaching or exceeding limits
•	Behavioral Analysis - Deviation from normal patterns
3.3 Audit Log Analysis Page
Route: /compliance/monitoring/audit-log-analysis
The Audit Log Analysis page provides tools for searching and analyzing system audit logs. Users can filter by user, action, date range, and object type. The page supports export for forensic analysis and compliance reporting. Audit trails are immutable and tamper-evident for regulatory compliance.
4. Reporting Section
4.1 SOX Compliance Page
Route: /compliance/reporting/sox-compliance
The SOX Compliance page provides dashboards and reports for Sarbanes-Oxley compliance management. It includes control effectiveness summaries, deficiency tracking, and management assertion support. The page generates documentation required for Section 302 and 404 certifications.
4.2 Compliance Reports Page
Route: /compliance/reporting/compliance-reports
The Compliance Reports page generates various compliance reports including control status reports, testing summaries, issue status reports, and policy compliance reports. Reports can be scheduled for automated distribution to stakeholders.
4.3 Attestations Page
Route: /compliance/reporting/attestations
The Attestations page manages periodic attestations where employees or managers confirm compliance with policies or controls. Attestation campaigns can be configured with questionnaires, due dates, and escalation rules. The page tracks completion status and maintains attestation records for audit purposes.
5. Backend API Connections
API Endpoint	Method	Purpose
/api/companies/:id/compliance/controls	GET, POST	Control management
/api/companies/:id/compliance/tests	GET, POST	Control testing
/api/companies/:id/compliance/policies	GET, POST	Policy management
/api/companies/:id/compliance/issues	GET, POST	Issue tracking
/api/companies/:id/compliance/rules	GET, POST	Fraud detection rules
/api/companies/:id/compliance/attestations	GET, POST	Attestation management
Table 2: Compliance Module API Endpoints
6. Database Models
•	Control - Internal control definitions
•	ControlTest - Testing records
•	Policy - Policy documents
•	ComplianceIssue - Issue tracking
•	DetectionRule - Fraud detection rules
•	Attestation - Attestation records
•	AuditLog - System audit trail
7. UI Components Required
•	ControlCard - Control display component
•	TestResultForm - Testing documentation
•	PolicyViewer - Policy document viewer
•	IssueTracker - Issue management interface
•	RuleBuilder - Detection rule creator
•	AttestationForm - Attestation questionnaire
•	ComplianceDashboard - Compliance status overview
8. Module Summary
The Compliance Module contains 9 pages across 3 sections: Controls (3), Monitoring (3), and Reporting (3). The module requires 7+ database models, 8+ API endpoints, and 10+ UI components for complete implementation.

HAYPBOOKS
Page101 Documentation Series
Part 25: ACCOUNTANT WORKSPACE Module
Client Overview, Books Review & Reconciliation Hub
Comprehensive Page Specifications for Implementation
 
1. Accountant Workspace Overview
The Accountant Workspace module provides specialized tools for accountants and bookkeepers who manage client books. It offers client overview dashboards, books review capabilities, reconciliation hubs, adjusting entry management, and client communication tools. This module bridges the Owner and Practice Hub interfaces, providing accountants with direct access to client company data.
1.1 Client Overview Page
Route: /accountant-workspace/client-overview
The Client Overview page provides a consolidated view of all client companies the accountant has access to. Each client card shows key metrics including last activity date, books status, upcoming deadlines, and outstanding tasks. The page supports filtering by client status, engagement type, and team assignment. Quick access links enable navigation to specific client functions.
Client Summary Metrics
Metric	Description	Alert Threshold
Last Sync	Date of last bank feed sync	Alert if > 7 days
Unreconciled Items	Count of unmatched transactions	Alert if > 50 items
Books Status	Current, Behind, Critical	Based on close completion
Upcoming Deadlines	Tax filings, payroll, etc.	Alert within 7 days
Table 1: Client Overview Metrics
1.2 Books Review Page
Route: /accountant-workspace/books-review
The Books Review page provides a comprehensive review interface for client books. It includes a checklist of review items, anomaly detection, and period comparison. Accountants can review account reconciliations, verify transaction classifications, and identify potential issues before generating reports. The page supports marking items as reviewed and adding review notes.
Review Checklist Items
•	Bank Reconciliation - Verify all accounts reconciled
•	AR Aging Review - Check for uncollectible amounts
•	AP Aging Review - Verify vendor balances
•	Revenue Recognition - Ensure proper cutoff
•	Expense Classification - Verify coding accuracy
•	Intercompany - Confirm elimination entries
•	Prepaid/Deferred - Review amortization schedules
1.3 Reconciliation Hub Page
Route: /accountant-workspace/reconciliation-hub
The Reconciliation Hub provides a centralized interface for managing all account reconciliations across clients. It shows reconciliation status for bank accounts, credit cards, loans, and other balance sheet accounts. The hub supports bulk reconciliation actions and prioritizes accounts needing attention.
1.4 Adjusting Entries Page
Route: /accountant-workspace/adjusting-entries
The Adjusting Entries page manages period-end and year-end adjusting journal entries. Accountants can create, review, and post adjusting entries including accruals, deferrals, depreciation, and corrections. The page supports templates for recurring adjustments and links adjustments to review checklists.
Adjustment Types
Type	Description
Accrual	Record expenses incurred but not yet paid
Deferral	Defer recognition of prepaid expenses
Depreciation	Record fixed asset depreciation
Amortization	Amortize intangible assets
Correction	Correct errors in prior entries
Reclassification	Move amounts between accounts
Table 2: Adjustment Types
1.5 Client Requests Page
Route: /accountant-workspace/client-requests
The Client Requests page manages information requests from clients to their accountants. Clients can request reports, ask questions, or submit documents through this interface. Accountants can respond, attach files, and track request status. The page maintains a communication history for each client.
1.6 My Accountant Page
Route: /accountant-workspace/my-accountant
The My Accountant page enables business owners to connect with their assigned accountant or bookkeeper. It shows the accountant's contact information, availability, and upcoming scheduled activities. Users can send messages, schedule consultations, and view recent communications.
1.7 Live Experts Page
Route: /accountant-workspace/live-experts
The Live Experts page provides access to on-demand accounting expertise. Users can browse available experts by specialty, view credentials, and initiate consultations. The page supports scheduling, video calls, and screen sharing for real-time assistance. This feature connects users with certified accountants for guidance on complex accounting questions.
2. Backend API Connections
API Endpoint	Method	Purpose
/api/accountant/clients	GET	List accessible clients
/api/accountant/clients/:id/overview	GET	Client summary metrics
/api/accountant/clients/:id/review	GET, POST	Books review operations
/api/accountant/reconciliations	GET, POST	Reconciliation hub data
/api/accountant/adjustments	GET, POST	Adjusting entries
/api/accountant/requests	GET, POST	Client request management
/api/accountant/experts	GET	Available experts list
Table 3: Accountant Workspace API Endpoints
3. Database Models
•	ClientAccess - Client-accountant relationships
•	BooksReview - Review session records
•	ReviewChecklistItem - Review checklist status
•	AdjustingEntry - Adjustment records
•	ClientRequest - Request tracking
•	ExpertProfile - Expert directory
•	Consultation - Consultation sessions
4. UI Components Required
•	ClientCard - Client summary display
•	ReviewChecklist - Review task list
•	ReconciliationStatus - Account status indicator
•	AdjustmentForm - Adjustment entry form
•	RequestThread - Client communication thread
•	ExpertCard - Expert profile display
•	ConsultationScheduler - Booking interface
5. Module Summary
The Accountant Workspace Module contains 7 pages providing client overview, books review, reconciliation hub, adjusting entries, client requests, my accountant, and live experts functionality. The module requires 7+ database models, 8+ API endpoints, and 10+ UI components for complete implementation.

HAYPBOOKS
Page101 Documentation Series
Part 26: FINANCIAL SERVICES Module
Banking, Capital & Credit, and Financial Insights
Comprehensive Page Specifications for Implementation
 
1. Financial Services Module Overview
The Financial Services module provides integrated financial products and services for HaypBooks users. Through partnerships with financial institutions, users can access business checking accounts, savings accounts, lines of credit, business loans, and merchant services. The module also provides financial health insights including credit health scores and cash runway analysis.
2. Banking Section
2.1 Business Checking Page
Route: /financial-services/banking/business-checking
The Business Checking page enables users to open and manage business checking accounts through integrated banking partners. The page shows available account options, fee structures, and interest rates. Users can apply for new accounts, view existing account details, and manage account settings. Integration with the main banking module provides seamless transaction visibility.
Business Checking Features
Feature	Description
Account Opening	Online application with KYC verification
Debit Card	Virtual and physical debit card management
Wire Transfers	Domestic and international wire capabilities
ACH Payments	Send and receive ACH transfers
Mobile Deposit	Check deposit via mobile app
Table 1: Business Checking Features
2.2 Savings Accounts Page
Route: /financial-services/banking/savings-accounts
The Savings Accounts page provides access to business savings products including high-yield savings accounts and money market accounts. Users can compare rates, open accounts, and manage transfers between checking and savings. The page shows current balances, interest earned, and projected earnings based on current rates.
3. Capital & Credit Section
3.1 Line of Credit Page
Route: /financial-services/capital-credit/line-of-credit
The Line of Credit page enables businesses to apply for and manage revolving lines of credit. The application process uses financial data from HaypBooks for pre-qualification. Active lines show available credit, outstanding balance, and repayment schedule. Users can draw funds, make payments, and manage credit line settings.
Line of Credit Features
•	Pre-qualification - Quick assessment based on books data
•	Instant Draw - Same-day access to approved funds
•	Flexible Repayment - Pay interest only or principal + interest
•	Auto-Pay - Automatic payments from linked account
•	Credit Increase - Request higher limits as business grows
3.2 Business Loans Page
Route: /financial-services/capital-credit/business-loans
The Business Loans page provides access to various business financing options including term loans, equipment financing, and SBA loans. The page shows available products, rates, and terms from partner lenders. Users can apply for loans, track application status, and manage existing loans including payment schedules and statements.
Loan Products Available
Product	Amount Range	Term	Use Case
Term Loan	$25K - $500K	1-5 years	Growth, working capital
Equipment	$10K - $250K	3-7 years	Equipment purchase
SBA Loan	$50K - $5M	5-25 years	Major expansion
Invoice Financing	Up to 90% AR	30-90 days	Cash flow gaps
Table 2: Business Loan Products
3.3 Merchant Services Page
Route: /financial-services/capital-credit/merchant-services
The Merchant Services page provides payment processing solutions including credit card processing, ACH acceptance, and payment gateways. Users can apply for merchant accounts, view processing rates, and manage payment settings. Integration with HaypBooks ensures automatic recording of payment transactions.
4. Insights Section
4.1 Credit Health Score Page
Route: /financial-services/insights/credit-health-score
The Credit Health Score page provides business credit monitoring and scoring. It shows the business's credit score, factors affecting the score, and comparison to industry benchmarks. Users receive alerts for credit inquiries, score changes, and potential fraud. The page also provides tips for improving credit health.
Credit Health Factors
•	Payment History - On-time payments to vendors and lenders
•	Credit Utilization - Ratio of credit used to available credit
•	Credit Age - Length of credit history
•	Credit Mix - Variety of credit types
•	Public Records - Liens, judgments, bankruptcies
•	Company Financials - Revenue, profitability, cash flow
4.2 Cash Runway Analysis Page
Route: /financial-services/insights/cash-runway-analysis
The Cash Runway Analysis page projects how long the business can operate at current burn rate before running out of cash. It uses historical data to predict cash inflows and outflows, and shows scenarios for different growth rates. The page provides recommendations for extending runway through cost reduction or financing.
Runway Analysis Components
Component	Calculation	Usage
Current Cash	Sum of all cash accounts	Starting position
Monthly Burn	Avg monthly expenses - revenue	Consumption rate
Runway Months	Current Cash / Monthly Burn	Time until cash depletion
Projected Cash	Forward-looking cash projection	Future planning
Table 3: Cash Runway Analysis Components
5. Backend API Connections
API Endpoint	Method	Purpose
/api/financial-services/products	GET	Available financial products
/api/financial-services/applications	GET, POST	Loan/account applications
/api/financial-services/accounts	GET	User's financial accounts
/api/financial-services/credit-score	GET	Credit health data
/api/financial-services/runway	GET	Cash runway analysis
/api/financial-services/prequalify	POST	Pre-qualification check
Table 4: Financial Services API Endpoints
6. Database Models
•	FinancialProduct - Available products catalog
•	FinancialApplication - Application records
•	FinancialAccount - Active accounts
•	CreditScore - Credit health data
•	CashRunway - Runway calculations
•	PartnerIntegration - Partner API configs
7. UI Components Required
•	ProductCard - Financial product display
•	ApplicationForm - Application wizard
•	AccountSummary - Account overview card
•	CreditScoreGauge - Credit score visualization
•	RunwayChart - Cash runway projection
•	RateComparison - Product rate comparison
•	PreQualificationModal - Quick check modal
8. Module Summary
The Financial Services Module contains 7 pages across 3 sections: Banking (2), Capital & Credit (3), and Insights (2). The module requires 6+ database models, 8+ API endpoints, and 10+ UI components for complete implementation. Integration with third-party financial service providers is required for full functionality.


HAYPBOOKS

Page101 Documentation

Part 27

SALES (Order-to-Cash) Module

Comprehensive Page Documentation for Implementation

Version 1.0 | January 2025
 
 
Table of Contents


Note: Right-click the Table of Contents and select 'Update Field' to refresh page numbers.
 
Module Overview
The SALES (Order-to-Cash) module encompasses the complete customer-facing revenue cycle, from initial customer setup and product management through billing, collections, and revenue recognition. This module integrates with the Chart of Accounts for automatic posting, the Banking module for payment processing, and the Reporting module for financial analytics.
Module Structure
The SALES module is organized into six major sub-sections:
Sub-Section	Description
Customers	Customer management, groups, documents, and price lists
Sales Operations	Products & services, quotes, estimates, and sales orders
Billing	Invoices, recurring invoices, credit notes, payment links, statements
Collections	Payments, A/R aging, write-offs, collections center, dunning
Revenue Management	Revenue recognition, deferred revenue, contracts, subscriptions
Sales Insights	Performance analytics, trends, and customer profitability

Section 1: Customers
The Customers sub-section provides comprehensive customer relationship management integrated with accounting functions. It includes customer profiles, groupings for segmentation, document storage, and enterprise-level price list management.
1.1 Customers List Page
Page Route: /sales/customers
Page Goal
The Customers List page serves as the central hub for managing all customer relationships. It provides a comprehensive view of customer profiles, contact information, credit status, outstanding balances, and transaction history. This page enables users to quickly access customer details, create new customers, and perform bulk actions on customer records.
Page Layout & Design
The page follows a master-detail pattern with a filterable/sortable data table as the primary component. The header section includes page title, quick stats cards, and action buttons. The table supports inline editing for quick updates and expands to show detailed customer information on click.
Buttons & Functions
Button	Location	Function
New Customer	Header, primary action	Opens new customer form modal/drawer
Import	Header, secondary action	Opens import wizard for CSV/Excel upload
Export	Header, secondary action	Exports filtered customer list to CSV/Excel
Filter	Table toolbar	Opens filter panel (status, group, balance range)
Search	Table toolbar	Global search across name, email, phone, tax ID
View/Edit	Row action menu	Opens customer detail page or edit modal
New Invoice	Row action menu	Creates new invoice pre-filled with customer data
Record Payment	Row action menu	Opens payment receipt form for this customer
Deactivate	Row action menu	Marks customer as inactive (requires zero balance)

Data Table Columns
Column	Data Type	Description
Customer Name	String	Primary display name, clickable link to detail
Customer ID	String	Auto-generated or custom customer code
Email	String	Primary email address for invoicing
Phone	String	Primary contact phone number
Customer Group	Reference	Assigned customer group for segmentation
Credit Limit	Decimal	Maximum credit allowed, with utilization bar
Outstanding Balance	Decimal	Current A/R balance with aging indicator
Payment Terms	Reference	Default payment terms (Net 30, Due on Receipt, etc.)
Status	Enum	Active/Inactive with visual badge

Backend API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/ar/customers	List all customers with pagination
POST	/api/companies/:companyId/ar/customers	Create new customer
GET	/api/companies/:companyId/ar/customers/:id	Get single customer details
PUT	/api/companies/:companyId/ar/customers/:id	Update customer information
DELETE	/api/companies/:companyId/ar/customers/:id	Soft delete/deactivate customer
GET	/api/companies/:companyId/ar/customers/:id/transactions	Get customer transaction history
GET	/api/companies/:companyId/ar/customers/:id/statement	Generate customer statement

Database Models
Primary model: Customer - Stores customer profile information including name, contact details, billing/shipping addresses, credit limits, payment terms, tax settings, and group assignments. Related models include CustomerGroup, Address, Contact, CustomerCredit, and CustomerStatement.
1.2 Customer Groups Page
Page Route: /sales/customers/groups
Page Goal
Customer Groups enables segmentation of customers for targeted pricing, reporting, and communication. Groups can be used to apply default payment terms, assign price lists, generate group-specific reports, and streamline bulk operations.
Buttons & Functions
Button	Location	Function
New Group	Header, primary	Opens form to create new customer group
View Customers	Row action	Filters customers list by selected group
Assign Price List	Row action	Links price list to all group members
Edit/Delete	Row action	Modify or remove group (checks for customers)

Data Table Columns
Column	Data Type	Description
Group Name	String	Display name of the customer group
Description	String	Optional description of group purpose
Customer Count	Integer	Number of customers assigned to this group
Default Payment Terms	Reference	Payment terms applied to new group members
Price List	Reference	Associated price list for group pricing
Total Balance	Decimal	Sum of outstanding balances for all members

1.3 Customer Documents Page
Page Route: /sales/customers/documents
Page Goal
Customer Documents provides a centralized document management system for customer-related files. This includes contracts, tax documents (BIR Form 2307), business registrations, credit applications, and correspondence. Documents can be linked to specific customers and tagged for easy retrieval.
Key Features
•	Drag-and-drop file upload with OCR extraction for key document types
•	Document versioning and audit trail
•	Expiry date tracking with automated reminders
•	Document sharing via secure links with expiration
•	Bulk document operations (download, archive, delete)

1.4 Price Lists Page (Enterprise)
Page Route: /sales/customers/price-lists
Page Goal
Price Lists enables enterprise-level pricing management with support for multiple price tiers, customer-specific pricing, currency-specific lists, and date-effective pricing. This feature is essential for businesses with complex pricing structures, wholesale operations, or multi-currency requirements.
Buttons & Functions
Button	Location	Function
New Price List	Header, primary	Opens price list creation wizard
Import Prices	Header, secondary	Bulk import prices from CSV/Excel
Duplicate	Row action	Create copy of existing price list
Set as Default	Row action	Mark price list as default for new customers
Apply Markup/Discount	Row action	Apply percentage adjustment to all items

Section 2: Sales Operations
Sales Operations covers the pre-billing workflow including product/service catalog management, quote/estimate generation, and sales order processing. This section bridges the gap between customer inquiries and actual billing.
2.1 Products & Services Page
Page Route: /sales/products
Page Goal
Products & Services is the central catalog for all sellable items. It supports both tangible products (with inventory tracking) and services (time-based billing). Each item can have multiple pricing tiers, tax configurations, and can be linked to inventory for automatic stock updates.
Page Layout
The page uses a card-grid layout for visual browsing with list view option. Cards show product image, name, SKU, price, stock level (for inventory items), and quick action buttons. Advanced filtering includes category, type, price range, and stock status.
Buttons & Functions
Button	Location	Function
New Product	Header, primary	Opens product creation form
New Service	Header, dropdown	Opens service creation form
Import Catalog	Header, secondary	Bulk import products/services from file
View Inventory	Row/card action	Shows stock levels and movements (products only)
Quick Edit	Row/card action	Inline editing for price and description
Duplicate	Row/card action	Creates copy with '-copy' suffix in SKU
Deactivate	Row/card action	Hides item from selection dialogs (preserves history)

Product/Service Form Fields
Field	Type	Description
Name	Text (Required)	Display name shown on invoices and reports
SKU/Code	Text (Required)	Unique identifier, auto-generated option available
Type	Select	Product (inventory) or Service (non-inventory)
Category	Reference	Product/service category for grouping
Sales Price	Decimal (Required)	Default selling price per unit
Cost Price	Decimal	Purchase/manufacturing cost for margin calc
Unit of Measure	Reference	Base unit (pcs, kg, hr, etc.)
Income Account	Reference	GL account for revenue posting
Tax Code	Reference	Default tax treatment (VAT, Zero-rated, Exempt)
Description	Rich Text	Extended description for invoices/quotes
Image	File Upload	Product image for visual catalog

2.2 Quotes & Estimates Page
Page Route: /sales/quotes
Page Goal
Quotes & Estimates enables creation and management of sales quotations before conversion to actual invoices or sales orders. The page supports version tracking, customer approval workflows, and direct conversion to invoices upon acceptance. Quotes can include expiration dates, terms and conditions, and multiple line items with discounts.
Buttons & Functions
Button	Location	Function
New Quote	Header, primary	Opens quote creation form
Send	Row action	Emails quote to customer with PDF attachment
Convert to Invoice	Row action	Creates invoice from accepted quote
Convert to Order	Row action	Creates sales order from accepted quote
Create Revision	Row action	Creates new version with revision number
Mark as Accepted	Row action	Updates status to accepted with date
Mark as Declined	Row action	Updates status to declined with reason
Download PDF	Row action	Generates and downloads PDF version
Copy Link	Row action	Generates shareable customer portal link

Quote Status Flow
Draft → Sent → (Accepted/Declined/Expired) → Converted. Quotes can also be revised which creates a new version while maintaining the original for audit purposes.
2.3 Sales Orders Page
Page Route: /sales/orders
Page Goal
Sales Orders manages the fulfillment workflow between quote approval and invoicing. This page is essential for businesses that need to track order status, manage backorders, coordinate with inventory/warehouse, and generate packing lists before final invoicing.
Key Features
•	Order status tracking: Open → Partially Filled → Filled → Invoiced → Closed
•	Backorder management with automatic inventory allocation
•	Partial fulfillment with multiple invoices per order
•	Packing list and delivery note generation
•	Integration with inventory for real-time stock checking

Section 3: Billing
The Billing section handles all customer invoicing operations including standard invoices, recurring billing, credit notes, payment links, and customer statements. This is the core revenue generation module that integrates with accounting for automatic journal entry creation.
3.1 Invoices Page
Page Route: /sales/invoices
Page Goal
The Invoices page is the primary billing interface for creating, managing, and tracking customer invoices. It supports multiple invoice types (standard, recurring, pro-forma), automatic tax calculation, multi-currency, and integrates with payment gateways for online payments. The page also provides aging analysis and collection status for each invoice.
Page Layout
The page features a summary header with key metrics (Total Outstanding, Overdue, Due This Week), followed by a comprehensive data table. The table supports bulk operations, inline status updates, and expandable rows showing line item details. A slide-out panel provides quick access to invoice details without full page navigation.
Buttons & Functions
Button	Location	Function
New Invoice	Header, primary	Opens invoice creation form
Batch Invoice	Header, dropdown	Create invoices for multiple customers at once
Send	Row action	Emails invoice to customer with PDF
Record Payment	Row action	Opens payment receipt form
Print/Download	Row action	Generates PDF for printing or download
Copy to Credit Note	Row action	Creates credit note from invoice
Void	Row action	Voids invoice with reason (creates reversal JE)
Send Reminder	Row action	Sends payment reminder email
Bulk Actions	Selection toolbar	Send, Print, Export selected invoices

Invoice Status Flow
Draft → Sent → (Partial/Paid/Overdue/Void). Paid invoices automatically generate journal entries to the appropriate GL accounts. Partial payments update the outstanding balance and can be tracked per invoice.
Backend API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/ar/invoices	List invoices with filters
POST	/api/companies/:companyId/ar/invoices	Create new invoice
GET	/api/companies/:companyId/ar/invoices/:id	Get invoice details
PUT	/api/companies/:companyId/ar/invoices/:id	Update draft invoice
POST	/api/companies/:companyId/ar/invoices/:id/send	Email invoice to customer
POST	/api/companies/:companyId/ar/invoices/:id/void	Void invoice
GET	/api/companies/:companyId/ar/invoices/:id/pdf	Generate PDF

3.2 Recurring Invoices Page
Page Route: /sales/recurring-invoices
Recurring Invoices manages automated billing schedules for subscription-based services or regular billing arrangements. Features include flexible scheduling (daily, weekly, monthly, yearly), automatic invoice generation, email delivery, and pause/resume functionality.
3.3 Credit Notes Page
Page Route: /sales/credit-notes
Credit Notes handles customer refunds and adjustments. Supports both standalone credit notes and those linked to specific invoices. Automatic application to outstanding invoices or creation of customer credits for future use.
3.4 Payment Links Page
Page Route: /sales/payment-links
Payment Links generates shareable payment URLs for customers to pay online. Integrates with payment gateways (Stripe, PayPal, GCash, Maya). Supports both one-time and recurring payment links with customizable branding and expiration.
3.5 Customer Statements Page
Page Route: /sales/statements
Customer Statements generates periodic account statements showing all transactions, payments, and outstanding balances. Supports automated statement generation and delivery on configurable schedules.
Section 4: Collections
The Collections section (Customer Payments, A/R Aging, Write-Offs, Collections Center, Dunning Management) is comprehensively documented in Part 2: Accounts Receivable. Refer to that document for detailed specifications of these pages.
Section 5: Revenue Management
Revenue Management handles complex revenue recognition scenarios including deferred revenue, subscription billing, contract revenue, and compliance with ASC 606/IFRS 15 revenue recognition standards.
5.1 Revenue Recognition Page
Page Route: /sales/revenue-recognition
Page Goal
Revenue Recognition manages the systematic allocation of revenue over time according to accounting standards (ASC 606, IFRS 15). This page displays revenue schedules, tracks recognized vs. deferred amounts, and provides automated recognition based on configured rules.
Key Features
•	Performance obligation tracking with automatic recognition triggers
•	Multiple recognition methods: point-in-time, over-time, percentage-of-completion
•	Contract asset/liability tracking
•	Automatic journal entry generation for recognized revenue
•	Revenue waterfall reports and forecasts

5.2 Deferred Revenue Page
Page Route: /sales/deferred-revenue
Deferred Revenue tracks unearned revenue that will be recognized in future periods. Shows deferred revenue balances, amortization schedules, and provides management of recognition timing.
5.3 Contract Revenue Page (Enterprise)
Page Route: /sales/contract-revenue
Contract Revenue manages long-term contracts with progress billing, milestone-based recognition, and percentage-of-completion tracking. Integrates with project management for automatic progress updates.
5.4 Subscription Billing Page (Enterprise)
Page Route: /sales/subscriptions
Subscription Billing provides comprehensive subscription lifecycle management including plan management, usage-based billing, upgrades/downgrades, trial management, and churn tracking with MRR/ARR reporting.
Section 6: Sales Insights
Sales Insights provides analytics and reporting for sales performance monitoring, trend analysis, and customer profitability assessment. These dashboards help businesses understand revenue drivers and make data-driven decisions.
6.1 Sales Performance Page
Page Route: /sales/insights/performance
Page Goal
Sales Performance provides a comprehensive dashboard for monitoring key sales metrics including revenue, invoice volume, average deal size, conversion rates, and sales team performance. Features interactive charts, period comparisons, and drill-down capabilities.
Dashboard Components
•	Revenue trend chart (daily/weekly/monthly view)
•	Sales by customer group pie chart
•	Top 10 customers by revenue table
•	Invoice status distribution
•	Period comparison (YoY, MoM, WoW)
•	KPI cards: Total Revenue, Average Invoice Value, Collection Rate

6.2 Revenue Trends Page
Page Route: /sales/insights/trends
Revenue Trends provides historical analysis with forecasting capabilities. Includes seasonality detection, growth rate calculations, and predictive modeling for revenue projections.
6.3 Customer Profitability Page
Page Route: /sales/insights/profitability
Customer Profitability analyzes revenue vs. cost-to-serve for each customer. Identifies high-value customers, unprofitable relationships, and provides recommendations for pricing optimization.
Implementation Summary
The SALES (Order-to-Cash) module represents one of the most critical business workflows in HaypBooks. Successful implementation requires careful integration between customer management, product catalog, billing operations, and financial accounting. Key integration points include:
•	Chart of Accounts: Automatic posting of invoices to revenue and receivable accounts
•	Inventory Module: Real-time stock updates for product sales
•	Banking Module: Payment processing and bank reconciliation
•	Tax Module: Automatic tax calculation and reporting
•	Reporting Module: Financial statements and analytics
•	Projects Module: Project-based billing and revenue recognition

This documentation serves as the comprehensive implementation guide for all SALES module pages. Each page should be developed following the specifications outlined herein, ensuring consistent UX patterns and proper backend integration.


HAYPBOOKS

Page101 Documentation

Part 28

EXPENSES (Procure-to-Pay) Module

Comprehensive Page Documentation for Implementation

Version 1.0 | January 2025
 
 
Table of Contents


Note: Right-click the Table of Contents and select 'Update Field' to refresh page numbers.
 
Module Overview
The EXPENSES (Procure-to-Pay) module manages the complete vendor-facing expenditure cycle, from vendor setup and purchasing through expense capture, payables management, and payment execution. This module integrates with inventory for purchase orders, accounting for automatic posting, and banking for payment processing.
Module Structure
The EXPENSES module is organized into five major sub-sections:
Sub-Section	Description
Vendors	Vendor management, documents, contractors, 1099 tracking
Purchasing	Purchase requests, orders, approval workflows, budget checks
Expense Capture	Expenses, receipts, mileage, reimbursements, company cards
Payables	Bills, recurring bills, payments, A/P aging, payment runs
Expense Insights	Spend analysis, vendor spend, cost allocation analytics

Section 1: Vendors
The Vendors sub-section provides comprehensive vendor/supplier relationship management integrated with accounts payable functions. It includes vendor profiles, document storage, contractor management for 1099 reporting, and vendor performance tracking.
1.1 Vendors List Page
Page Route: /expenses/vendors
Page Goal
The Vendors List page serves as the central hub for managing all vendor/supplier relationships. It provides a comprehensive view of vendor profiles, contact information, payment terms, outstanding payables, and transaction history. This page enables users to quickly access vendor details, create new vendors, and perform bulk actions on vendor records.
Page Layout & Design
The page follows a master-detail pattern with a filterable/sortable data table as the primary component. The header section includes page title, quick stats cards (Total Payables, Due This Week, Overdue), and action buttons. The table supports inline editing for quick updates and row expansion for detailed vendor information.
Buttons & Functions
Button	Location	Function
New Vendor	Header, primary action	Opens new vendor form modal/drawer
Import	Header, secondary action	Opens import wizard for CSV/Excel upload
Export	Header, secondary action	Exports filtered vendor list to CSV/Excel
Filter	Table toolbar	Opens filter panel (status, type, balance range)
Search	Table toolbar	Global search across name, email, phone, TIN
View/Edit	Row action menu	Opens vendor detail page or edit modal
New Bill	Row action menu	Creates new bill pre-filled with vendor data
Record Payment	Row action menu	Opens bill payment form for this vendor
Deactivate	Row action menu	Marks vendor as inactive (requires zero balance)

Data Table Columns
Column	Data Type	Description
Vendor Name	String	Primary display name, clickable link to detail
Vendor ID	String	Auto-generated or custom vendor code
Email	String	Primary email for purchase orders and payments
Phone	String	Primary contact phone number
Vendor Type	Enum	Business/Individual/Contractor/Government
TIN	String	Tax Identification Number for 1099/BIR reporting
Outstanding Balance	Decimal	Current A/P balance with aging indicator
Payment Terms	Reference	Default payment terms (Net 30, Net 60, etc.)
Status	Enum	Active/Inactive with visual badge
1099 Eligible	Boolean	Indicates if vendor requires 1099 reporting

Backend API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/ap/vendors	List all vendors with pagination
POST	/api/companies/:companyId/ap/vendors	Create new vendor
GET	/api/companies/:companyId/ap/vendors/:id	Get single vendor details
PUT	/api/companies/:companyId/ap/vendors/:id	Update vendor information
DELETE	/api/companies/:companyId/ap/vendors/:id	Soft delete/deactivate vendor
GET	/api/companies/:companyId/ap/vendors/:id/transactions	Get vendor transaction history

Database Models
Primary model: Vendor - Stores vendor profile information including name, contact details, billing address, payment terms, tax settings (TIN, VAT registration), 1099 eligibility, bank account details for payments, and vendor category. Related models include VendorDocument, VendorCredit, Address, Contact, and Contractor.
1.2 Vendor Documents Page
Page Route: /expenses/vendors/documents
Page Goal
Vendor Documents provides a centralized document management system for vendor-related files. This includes contracts, W-9 forms, tax documents, business registrations, insurance certificates, and correspondence. Documents can be linked to specific vendors and tagged for easy retrieval.
Key Features
•	Drag-and-drop file upload with OCR extraction for tax documents
•	Document versioning and audit trail
•	Expiry date tracking for insurance certificates and contracts
•	Automated reminders for document renewals
•	Secure document sharing with external parties

1.3 Contractor Management Page
Page Route: /expenses/contractors
Page Goal
Contractor Management handles the specific requirements for independent contractors and freelancers. This includes contractor onboarding, contract management, W-9 collection, insurance verification, and integration with 1099 reporting. Contractors can access a portal for invoice submission and document upload.
Contractor-Specific Features
•	Contractor onboarding workflow with W-9 collection
•	Contract templates and management
•	Insurance and certification tracking with expiry alerts
•	Self-service portal for contractors to submit invoices
•	Year-end 1099-NEC preparation and filing

1.4 1099 Management Page
Page Route: /expenses/1099
Page Goal
1099 Management handles the complete 1099 reporting cycle for US-based businesses. This includes tracking reportable payments, generating 1099-NEC/MISC forms, collecting W-9 forms, and e-filing with the IRS. The page provides a dashboard view of 1099 status by vendor and tax year.
Key Functions
Button	Location	Function
Generate 1099s	Header, primary	Creates 1099 forms for eligible vendors
Request W-9	Row action	Sends W-9 request email to vendor
Preview 1099	Row action	Preview 1099 form before filing
E-File with IRS	Header, after review	Submits forms electronically to IRS
Print/Download	Row action	Download PDF for mailing to vendors

Section 2: Purchasing
The Purchasing section manages the procurement workflow from purchase requisition through purchase order creation and approval. This section provides visibility into purchasing activity, supports approval workflows, and integrates with inventory for automatic reorder suggestions.
2.1 Purchase Requests Page
Page Route: /expenses/purchase-requests
Page Goal
Purchase Requests manages internal requisitions for goods and services. Employees can submit requests that route through approval workflows based on amount, department, and category. Approved requests automatically convert to purchase orders or procurement tasks.
Page Layout
The page features a Kanban-style board view (Draft → Pending Approval → Approved → Ordered → Received) alongside a traditional list view. Status columns show request counts and total values. Cards display requestor, item count, total amount, and priority level.
Buttons & Functions
Button	Location	Function
New Request	Header, primary	Opens purchase request form
Submit for Approval	Card/List action	Routes request through approval workflow
Approve	Card/List action (approvers)	Approves request for procurement
Reject	Card/List action (approvers)	Rejects request with reason
Convert to PO	Card/List action	Creates purchase order from approved request
View History	Card/List action	Shows approval history and comments

2.2 Purchase Orders Page
Page Route: /expenses/purchase-orders
Page Goal
Purchase Orders manages formal procurement documents sent to vendors. This page handles the complete PO lifecycle from creation through receiving and closure. It integrates with inventory for automatic stock updates upon receipt and with accounts payable for invoice matching.
PO Status Flow
Draft → Issued → Partially Received → Fully Received → Closed (or Cancelled). Each status transition triggers appropriate actions and notifications.
Buttons & Functions
Button	Location	Function
New PO	Header, primary	Opens PO creation form
Issue/Email	Row action	Sends PO to vendor via email
Receive Items	Row action	Records item receipt against PO
Create Bill	Row action	Creates AP bill from PO receipt
Print/Download	Row action	Generates PDF for printing or download
Close	Row action	Closes PO (partially received items)
Cancel	Row action	Cancels PO with reason (no receipt)

2.3 Approval Workflows Page
Page Route: /expenses/approvals
Approval Workflows manages multi-level approval routing for purchase requests and expenses. Supports amount-based thresholds, department-specific approvers, parallel and sequential approval chains, and delegation rules. Provides real-time visibility into approval status and bottlenecks.
2.4 Budget Checks Page (Enterprise)
Page Route: /expenses/budgets
Budget Checks provides real-time budget validation during purchasing. Shows budget vs. actual spending, committed amounts (open POs), and available balance. Supports departmental budgets, project budgets, and GL account budgets with configurable warning and hard-stop thresholds.
Section 3: Expense Capture
Expense Capture handles employee-initiated expenses including receipts, mileage, and reimbursement requests. This section provides mobile-friendly interfaces for capturing expenses on-the-go and integrates with approval workflows for reimbursement processing.
3.1 Expenses Page
Page Route: /expenses/entries
Page Goal
The Expenses page is the primary interface for employees to log business expenses. It supports multiple expense types, receipt attachment, project/department allocation, and automatic policy validation. Expenses can be submitted individually or grouped into expense reports for approval.
Page Layout
The page features a card-based list view showing expense thumbnail, amount, date, category, and status. Quick entry form appears at the top for rapid expense logging. Mobile-optimized view supports camera capture for receipt scanning.
Buttons & Functions
Button	Location	Function
New Expense	Header, primary	Opens expense entry form
Quick Capture	Header, secondary	Opens camera for receipt scan (mobile)
Submit for Approval	Row/bulk action	Submits expense(s) for manager approval
Attach Receipt	Row action	Uploads or captures receipt image
Edit/Delete	Row action	Modify or remove expense (draft only)
Duplicate	Row action	Creates copy of expense for similar entry

Expense Form Fields
Field	Type	Description
Expense Date	Date (Required)	Date expense was incurred
Category	Select (Required)	Expense category (Meals, Travel, Supplies, etc.)
Amount	Decimal (Required)	Expense amount with currency selection
Vendor/Merchant	Text/Reference	Where the expense was made
Description	Text	Business purpose and justification
Project/Department	Reference	Allocation for cost tracking
Billable	Boolean	Mark as billable to customer/project
Tax Code	Reference	Applicable tax treatment
Receipt	File Upload	Receipt image or PDF attachment

3.2 Receipts Page
Page Route: /expenses/receipts
Receipts manages uploaded receipt images with OCR processing for automatic expense extraction. Features include bulk upload, receipt organization, expense creation from receipts, and receipt matching with existing expenses.
3.3 Mileage Page
Page Route: /expenses/mileage
Mileage tracks business vehicle usage for reimbursement. Features include GPS-based distance calculation, route mapping, standard mileage rate application, and vehicle expense tracking. Supports both personal and company vehicle configurations.
3.4 Employee Reimbursements Page
Page Route: /expenses/reimbursements
Employee Reimbursements manages the complete reimbursement workflow from expense submission through payment. Features include expense report creation, approval routing, payment scheduling, and integration with payroll for direct deposit.
3.5 Company Card Activity Page
Page Route: /expenses/company-cards
Company Card Activity manages corporate credit card transactions. Features include transaction import from bank feeds, receipt matching, expense categorization, policy compliance checking, and statement reconciliation. Cardholders can review and categorize their transactions.
Section 4: Payables
The Payables section (Bills, Recurring Bills, Bill Payments, A/P Aging, Payment Runs) is comprehensively documented in Part 3: Accounts Payable. Refer to that document for detailed specifications of these pages.
Section 5: Expense Insights
Expense Insights provides analytics and reporting for spend monitoring, vendor analysis, and cost allocation. These dashboards help businesses understand expenditure patterns and optimize purchasing decisions.
5.1 Spend Analysis Page
Page Route: /expenses/insights/spend
Page Goal
Spend Analysis provides a comprehensive dashboard for monitoring organizational spending patterns. Features include spend by category breakdowns, period-over-period comparisons, budget vs. actual analysis, and trend visualization.
Dashboard Components
•	Spend trend chart (daily/weekly/monthly view)
•	Spend by category pie/donut chart
•	Top vendors by spend table
•	Department/Project spend breakdown
•	Budget utilization gauges
•	Approval cycle time metrics

5.2 Vendor Spend Page
Page Route: /expenses/insights/vendor
Vendor Spend analyzes spending patterns by vendor/supplier. Includes vendor concentration analysis, spend trends per vendor, payment behavior analysis, and vendor performance metrics. Helps identify consolidation opportunities and negotiate better terms.
5.3 Cost Allocation Page
Page Route: /expenses/insights/costs
Cost Allocation shows how expenses are distributed across departments, projects, locations, and cost centers. Supports allocation rule configuration, automatic cost distribution, and allocation variance analysis.
Implementation Summary
The EXPENSES (Procure-to-Pay) module represents a critical business workflow in HaypBooks for managing vendor relationships and organizational spending. Successful implementation requires careful integration between vendor management, purchasing, expense capture, and financial accounting. Key integration points include:
•	Chart of Accounts: Automatic posting of bills to expense and payable accounts
•	Inventory Module: Purchase order receiving updates stock levels
•	Banking Module: Payment processing and bank reconciliation
•	Tax Module: Withholding tax calculation and reporting
•	Projects Module: Project-based expense allocation
•	Reporting Module: Financial statements and expense analytics

This documentation serves as the comprehensive implementation guide for all EXPENSES module pages. Each page should be developed following the specifications outlined herein, ensuring consistent UX patterns and proper backend integration.
Backend API Reference
AP Module Endpoints
The AP (Accounts Payable) module in the NestJS backend handles all vendor and payables-related operations. The module follows the Controller-Service-Repository pattern:
Layer	File	Purpose
Controller	./ap/ap.controller.ts	HTTP route handlers
Service	./ap/ap.service.ts	Business logic layer
Repository	./ap/ap.repository.ts	Database operations

Key API Endpoints Summary
All endpoints require JWT authentication and company access validation. Base path: /api/companies/:companyId/ap/
Resource	Endpoints	Methods
/vendors	CRUD + transactions, statement	GET, POST, PUT, DELETE
/bills	CRUD + approve, void, payments	GET, POST, PUT, DELETE
/bill-payments	CRUD + void	GET, POST, PUT
/purchase-orders	CRUD + issue, receive, close	GET, POST, PUT, DELETE
/aging	A/P aging report data	GET
/payment-runs	Payment batch processing	GET, POST, PUT


========================================================================






BANKTRANSACTIONS101
Bank Transaction Processing Guide

QuickBooks vs HaypBooks Implementation Analysis


Categorization | Matching | Splitting | Transfers | Auto-Detection | Rules Engine

January 2025 | HaypBooks Technical Documentation
 
Table of Contents
1. Executive Summary  ..................................................  3
2. QuickBooks Bank Transaction Architecture  ..................................................  4
    2.1 Bank Feed Connection Flow  ..................................................  4
    2.2 Transaction Categorization Engine  ..................................................  5
    2.3 Transaction Matching System  ..................................................  6
    2.4 Transaction Splitting  ..................................................  7
    2.5 Transfer Detection  ..................................................  8
    2.6 Bank Rules Engine  ..................................................  9
3. HaypBooks Current Schema Analysis  ..................................................  10
    3.1 Existing Banking Models  ..................................................  10
    3.2 Gap Analysis  ..................................................  12
4. Implementation Recommendations  ..................................................  13
    4.1 Enhanced BankTransaction Model  ..................................................  13
    4.2 Categorization System Design  ..................................................  15
    4.3 Matching Algorithm  ..................................................  17
    4.4 Split Transaction Support  ..................................................  19
    4.5 Transfer Detection Logic  ..................................................  20
    4.6 Rules Engine Architecture  ..................................................  21
5. API Endpoint Specifications  ..................................................  23
6. UI/UX Recommendations  ..................................................  25
7. Philippine Market Considerations  ..................................................  27
8. Implementation Roadmap  ..................................................  28
9. Uncertainty Statement & Limitations  ..................................................  30
 
1. Executive Summary
This document provides a comprehensive analysis of bank transaction processing in accounting software, comparing QuickBooks' established approach with HaypBooks' current implementation. The analysis covers six core capabilities: transaction categorization, matching, splitting, transfers, auto-detection, and rules engine. The objective is to provide actionable recommendations for implementing a world-class bank transaction management system in HaypBooks that matches or exceeds QuickBooks functionality while addressing Philippine market requirements.
1.1 Scope & Objectives
Primary Objectives:
•	• Analyze QuickBooks' bank transaction handling methodology
•	• Document HaypBooks' current schema capabilities and gaps
•	• Provide detailed implementation specifications for each core capability
•	• Include code examples and API endpoint designs
•	• Address Philippine-specific requirements (GCash, Maya, local banks)
1.2 Key Findings Summary
Capability	QuickBooks	HaypBooks Current	Gap Level
Bank Feed Connection	Plaid, Yodlee, Direct Connect	Schema ready, not implemented	Medium
Transaction Categorization	AI-powered + Rules	Basic BankRule model	High
Transaction Matching	Multi-criteria matching	Basic matchType field	High
Split Transactions	Full support	Not supported	Critical
Transfer Detection	Auto-detect between accounts	Not implemented	Critical
Rules Engine	Complex conditions + actions	Basic JSON matchCriteria	High
E-Wallet Integration	Limited	Schema includes GCash/Maya	Opportunity
Table 1: Capability Gap Analysis
2. QuickBooks Bank Transaction Architecture
QuickBooks has refined its bank transaction handling over 25+ years, creating a robust system that processes billions of transactions annually. Understanding their architecture is essential for building competitive functionality in HaypBooks. The system operates on a pipeline model where transactions flow through multiple processing stages before being finalized in the general ledger.
2.1 Bank Feed Connection Flow
QuickBooks Online uses a multi-provider approach to bank connectivity. The flow begins when a user initiates a bank connection through the Banking Center. QuickBooks connects to financial institution aggregators (primarily Plaid and Yodlee) which establish secure connections to the user's bank. Transactions are then pulled automatically on a scheduled basis, typically every 4-6 hours, with on-demand refresh available.
Connection States in QuickBooks:
•	• CONNECTED: Active connection, transactions syncing normally
•	• DISCONNECTED: User revoked access or connection expired
•	• ERROR: Authentication failure or API error requiring re-authentication
•	• PENDING: Initial connection in progress
The critical insight from QuickBooks' approach is the separation of raw imported transactions from categorized transactions. Raw transactions are immutable records from the bank, while categorized transactions are the user's interpretation for accounting purposes. This two-layer approach enables audit trails and re-categorization without losing original data.
2.2 Transaction Categorization Engine
QuickBooks uses a sophisticated multi-layer categorization system that combines machine learning with user-defined rules. When a new transaction arrives, it passes through several classification stages before appearing in the user's review queue.
Categorization Pipeline:
Stage	Process	Confidence	User Action Required
1. Rule Match	Check bank rules in priority order	100%	None if matched
2. AI Suggestion	ML model predicts category	Variable	Confirm/Modify
3. Vendor History	Check past transactions for same vendor	High	Confirm
4. Similarity Match	Fuzzy match on description	Medium	Confirm/Select
5. Uncategorized	Default to Uncategorized	None	Manual categorization
Table 2: Categorization Pipeline Stages
The AI categorization model in QuickBooks learns from millions of anonymized transactions across all users. For new businesses with no transaction history, the model provides reasonably accurate suggestions based on merchant category codes (MCC) and description patterns. As the business accumulates transactions, the model adapts to their specific categorization patterns, improving accuracy over time.
2.3 Transaction Matching System
Transaction matching is one of QuickBooks' most powerful features, automatically linking bank transactions to internal records like invoices, bills, and payments. This dramatically reduces manual reconciliation work and ensures accurate books. The matching system evaluates multiple criteria to find the best matches.
Matching Criteria Priority:
•	• Exact Amount Match: Transaction amount equals invoice/payment amount
•	• Date Proximity: Transaction date within expected range of internal record
•	• Customer/Vendor Name Match: Fuzzy matching on names in transaction description
•	• Reference Number: Check number, invoice number, or payment reference
•	• Partial Amount Match: For split payments or partial payments
Match Confidence Levels:
QuickBooks displays matches with confidence indicators. A 'Green' match indicates high confidence (typically exact amount + date within 7 days + recognizable payee name), requiring only a single click to confirm. A 'Yellow' match requires user review due to lower confidence scores. The system also supports manual matching where users can search and select records to match against bank transactions.
2.4 Transaction Splitting
Transaction splitting allows a single bank transaction to be allocated to multiple categories, accounts, or entities. This is essential for accurately representing complex transactions like credit card payments that may include multiple expense categories, or payroll deposits that split across wages, taxes, and benefits.
Split Transaction Use Cases:
•	• Credit Card Payments: Split total payment across multiple expense categories
•	• Payroll Deposits: Allocate to wages, taxes, benefits, retirement contributions
•	• Mixed-Purpose Purchases: Split a single receipt across multiple departments/projects
•	• Cost Allocation: Distribute shared costs across multiple cost centers
•	• Reimbursements: Separate business expenses from personal portions
In QuickBooks, splits are managed through the transaction detail view. Each split line contains: Account, Description, Amount, and optional Customer/Project/Class. The sum of all splits must equal the total transaction amount. Splits can be saved as templates for recurring use, and the system validates that split amounts don't exceed the transaction total.
2.5 Transfer Detection
Transfer detection is QuickBooks' automatic identification of movements between the user's own bank accounts. When a withdrawal appears in one account and a matching deposit appears in another account within a reasonable timeframe, QuickBooks suggests a transfer entry rather than an expense or income.
Transfer Detection Algorithm:
•	• Identify candidate pairs: Withdrawals in Account A matching deposits in Account B
•	• Amount matching: Exact or near-exact amount (allowing for transfer fees)
•	• Date window: Deposits within 0-3 days of withdrawal (configurable)
•	• Account pairing: Both accounts must belong to the same company/workspace
•	• Exclusion rules: Exclude known payment recipients, known income sources
The system automatically creates a transfer transaction when high-confidence matches are found, which is then reflected as a movement between bank accounts in the Balance Sheet rather than impacting Profit & Loss. This prevents misclassification of internal transfers as expenses or income, a common bookkeeping error.
2.6 Bank Rules Engine
QuickBooks' bank rules engine allows users to automate repetitive categorization decisions. Rules can be simple (if description contains 'Starbucks', categorize to 'Office Supplies - Coffee') or complex multi-condition rules that evaluate multiple fields and apply multiple actions.
Rule Components:
•	• Conditions: Field, Operator, Value (e.g., Description CONTAINS 'UBER', Amount GREATER_THAN 100)
•	• Actions: Categorize to account, Assign payee, Add class/location, Set memo
•	• Priority: Rules execute in priority order; first match wins
•	• Scope: Apply to specific bank accounts or all accounts
Supported Condition Operators:
Field	Supported Operators	Example
Description	Contains, Does not contain, Is exactly, Starts with, Ends with	Contains 'AMAZON'
Amount	Equals, Does not equal, Is greater than, Is less than, Is between	Between 100 and 500
Transaction Type	Is, Is not	Is 'Credit Card Charge'
Bank Account	Is, Is not	Is 'Operating Account'
Date	Is in last, Is in next, Is between	Is in last 30 days
Table 3: Bank Rules Condition Operators
3. HaypBooks Current Schema Analysis
Analysis of the HaypBooks Prisma schema reveals a solid foundation for banking functionality, with most core models already defined. However, several enhancements are needed to match QuickBooks' capabilities. This section details the current schema structure and identifies specific gaps requiring attention.
3.1 Existing Banking Models
The HaypBooks schema includes a comprehensive set of banking models organized around bank feeds, transactions, and reconciliation. The following models are currently implemented:
BankAccount Model:
The BankAccount model captures essential bank account information including institution name, account number, routing number, SWIFT code, and IBAN. It supports soft deletion and includes relations to transactions, deposits, and reconciliation records. However, it lacks fields for account type (checking, savings, credit card), currency, current balance, and connection status.
BankTransaction Model:
The BankTransaction model is intentionally minimal, storing only bankAccountId, amount, date, description, and workspaceId. This design appears to follow the principle of storing raw bank data separately from categorized accounting entries. The model links to BankTransactionRaw which stores the original imported data including rawPayload.
BankRule Model:
The BankRule model provides a foundation for automation with matchCriteria stored as JSON and assignAccountId for categorization. The priority and isActive fields enable rule ordering and status management. However, the model currently supports only a single match criterion and single action.
BankFeedConnection Model:
This model handles connections to external bank feed providers (Plaid, Yodlee, Manual) with status tracking and lastSyncedAt timestamp. It appropriately separates connection-level concerns from account-level concerns through the BankFeedAccount model.
Current Model Relationships:
Model	Relationships	Purpose
BankFeedConnection	BankFeedAccount[], BankFeedImport[]	Provider connection
BankFeedAccount	BankFeedConnection, BankAccount	External account mapping
BankFeedImport	BankFeedConnection, BankTransactionRaw[]	Import batch tracking
BankTransactionRaw	BankFeedAccount, BankTransaction?	Raw imported data
BankTransaction	BankAccount, BankTransactionRaw[]	Processed transaction
BankRule	Workspace, Account	Auto-categorization rules
BankReconciliation	BankAccount, BankReconciliationLine[]	Reconciliation session
BankReconciliationLine	BankReconciliation, BankTransaction, JournalEntryLine?	Match tracking
Table 4: Banking Model Relationships
3.2 Gap Analysis
Based on the QuickBooks analysis and current HaypBooks schema, the following gaps require attention to achieve feature parity:
Gap	Current State	Required Enhancement	Priority
Transaction Status	No status tracking	Add status field (PENDING, CATEGORIZED, MATCHED, REVIEWED)	Critical
Split Transactions	Not supported	New BankTransactionSplit model	Critical
Match Confidence	Only matched boolean	Add confidenceScore, matchedEntityId, matchedEntityType	High
AI Categorization	Not implemented	Add suggestedAccountId, aiConfidenceScore	High
Transfer Detection	Not implemented	Add isTransfer, relatedBankTransactionId	High
Rule Conditions	Single JSON criterion	Multiple conditions with AND/OR logic	Medium
Rule Actions	Single account assignment	Multiple actions (account, payee, class, memo)	Medium
E-Wallet Support	IntegrationType enum only	Dedicated e-wallet transaction models	Medium
Category Learning	Not implemented	UserCategorizationPattern model	Low
Table 5: Schema Enhancement Requirements
4. Implementation Recommendations
4.1 Enhanced BankTransaction Model
The BankTransaction model requires significant enhancement to support categorization, matching, and splitting workflows. The following schema additions are recommended:
Enhanced BankTransaction Schema:
model BankTransaction {
  id              String   @id @default(uuid())
  bankAccountId   String
  amount          Decimal  @db.Decimal(19, 4)
  date            DateTime
  description     String
  workspaceId     String
  
  // NEW: Transaction Status
  status          BankTransactionStatus @default(PENDING_REVIEW)
  
  // NEW: Categorization
  categoryId      String?   // GL Account
  category        Account?  @relation(fields: [categoryId], references: [id])
  isAiSuggested   Boolean   @default(false)
  aiConfidence    Decimal?  @db.Decimal(5, 4)
  
  // NEW: Matching
  matchedEntityId    String?
  matchedEntityType  String?   // INVOICE, BILL, PAYMENT_RECEIVED, BILL_PAYMENT
  matchConfidence    Decimal?  @db.Decimal(5, 4)
  matchType          String?   // EXACT, SUGGESTED, MANUAL
  
  // NEW: Transfer Detection
  isTransfer              Boolean   @default(false)
  relatedBankTransactionId String?
  relatedBankTransaction  BankTransaction?  @relation("TransferPair", 
                                fields: [relatedBankTransactionId], 
                                references: [id])
  
  // NEW: Splits Support
  splits  BankTransactionSplit[]
  
  // NEW: Metadata
  memo            String?
  payeeId         String?
  payee           Contact?  @relation(fields: [payeeId], references: [id])
  classId         String?
  locationId      String?
  
  // NEW: Audit
  categorizedAt   DateTime?
  categorizedBy   String?
  reviewedAt      DateTime?
  reviewedBy      String?
  
  // NEW: Source Tracking
  source          String    @default("BANK_FEED") // BANK_FEED, MANUAL, IMPORT
  
  bankAccount     BankAccount        @relation(fields: [bankAccountId], references: [id])
  workspace       Workspace          @relation(fields: [workspaceId], references: [id])
  rawTransactions BankTransactionRaw[]
  BankReconciliationLine BankReconciliationLine[]
  
  @@index([workspaceId, status])
  @@index([bankAccountId, date])
  @@index([categoryId])
  @@index([matchedEntityId])
}
New Enum for Transaction Status:
enum BankTransactionStatus {
  PENDING_REVIEW    // New transaction awaiting categorization
  CATEGORIZED       // Assigned to category but not matched
  MATCHED           // Linked to internal record (invoice/bill/payment)
  SPLIT             // Split into multiple categories
  TRANSFER          // Identified as account transfer
  REVIEWED          // User has reviewed and confirmed
  EXCLUDED          // User excluded from books
}
4.2 Categorization System Design
The categorization system should implement a priority-based pipeline similar to QuickBooks. Each incoming transaction is evaluated against multiple categorization sources in a defined order.
Categorization Pipeline Architecture:
The pipeline consists of five sequential stages, each attempting to categorize the transaction. The first stage that produces a confident categorization wins, and subsequent stages are skipped. This ensures that explicit rules always take precedence over AI suggestions.
Stage 1 - Bank Rules: Execute all active bank rules in priority order. Rules are user-defined and deterministic, providing 100% confidence when matched.
Stage 2 - Historical Patterns: Query the user's past categorizations for the same payee/description. If a pattern exists with sufficient frequency, suggest that category with confidence proportional to frequency.
Stage 3 - AI Categorization: Send transaction description and amount to the ML model. The model returns a suggested category with confidence score. This requires building or integrating a categorization model.
Stage 4 - Similarity Search: Use fuzzy matching to find similar transactions in the user's history. Suggest categories based on similar transaction categorizations.
Stage 5 - Default/Uncategorized: If no suggestion meets confidence threshold, leave uncategorized for manual review.
Category Learning Model:
To enable learning from user corrections, a new model is recommended to track categorization patterns:
model CategorizationPattern {
  id            String   @id @default(uuid())
  workspaceId   String
  payeeName     String   // Normalized payee/description
  categoryId    String
  category      Account  @relation(fields: [categoryId], references: [id])
  frequency     Int      @default(1)
  lastUsedAt    DateTime @default(now())
  
  // For AI training
  descriptionPattern String?
  amountRangeMin     Decimal? @db.Decimal(19, 4)
  amountRangeMax     Decimal? @db.Decimal(19, 4)
  
  workspace Workspace @relation(fields: [workspaceId], references: [id])
  
  @@unique([workspaceId, payeeName, categoryId])
  @@index([workspaceId, payeeName])
}
4.3 Matching Algorithm
The matching system identifies relationships between bank transactions and internal records (invoices, bills, payments). A multi-criteria scoring algorithm calculates match confidence.
Matching Score Calculation:
The matching algorithm evaluates candidate records across multiple dimensions and calculates a weighted confidence score. Records exceeding a confidence threshold are presented as suggested matches.
Criterion	Weight	Scoring Logic	Max Points
Exact Amount	40%	Amount matches exactly	40
Date Proximity	20%	Within 7 days: 20 pts, 14 days: 10 pts, 30 days: 5 pts	20
Payee Match	25%	Exact name match: 25, Fuzzy match: 15, No match: 0	25
Reference Match	15%	Check/Ref number matches	15
Total	100%	Sum of weighted scores	100
Table 6: Matching Score Weights
Match Confidence Thresholds:
•	• High Confidence (80-100): Automatically selected as suggested match, single-click confirm
•	• Medium Confidence (60-79): Shown as potential match, requires explicit user selection
•	• Low Confidence (40-59): Shown in 'Other Possible Matches' section
•	• No Match (< 40): No automatic suggestion, manual search required
Entity Matching Query Structure:
// TypeScript example for match finding
interface MatchCandidate {
  entityId: string;
  entityType: 'INVOICE' | 'BILL' | 'PAYMENT_RECEIVED' | 'BILL_PAYMENT';
  confidence: number;
  matchDetails: {
    amountMatch: boolean;
    dateProximity: number;
    payeeMatchScore: number;
    referenceMatch: boolean;
  };
}

async function findMatches(
  transaction: BankTransaction,
  entityType: 'RECEIVABLE' | 'PAYABLE'
): Promise<MatchCandidate[]> {
  const candidates: MatchCandidate[] = [];
  const amount = parseFloat(transaction.amount.toString());
  const txDate = transaction.date;
  
  // Query unpaid invoices/bills with matching amount
  if (entityType === 'RECEIVABLE') {
    const invoices = await prisma.invoice.findMany({
      where: {
        workspaceId: transaction.workspaceId,
        status: { in: ['SENT', 'PARTIAL'] },
        balanceDue: { gte: amount - 0.01, lte: amount + 0.01 }
      },
      include: { customer: true }
    });
    // Calculate confidence for each invoice...
  }
  
  return candidates.sort((a, b) => b.confidence - a.confidence);
}
4.4 Split Transaction Support
Split transactions require a new model to store individual line items that together compose a single bank transaction. Each split line represents a portion of the total transaction amount allocated to a specific account.
BankTransactionSplit Model:
model BankTransactionSplit {
  id               String   @id @default(uuid())
  bankTransactionId String
  
  // Allocation details
  amount           Decimal  @db.Decimal(19, 4)
  accountId        String
  account          Account  @relation(fields: [accountId], references: [id])
  
  // Optional attributes
  description      String?
  customerId       String?
  customer         Customer? @relation(fields: [customerId], references: [id])
  vendorId         String?
  vendor           Vendor?  @relation(fields: [vendorId], references: [id])
  classId          String?
  locationId       String?
  
  // Audit
  createdAt        DateTime @default(now())
  createdById      String?
  
  bankTransaction  BankTransaction @relation(fields: [bankTransactionId], 
                          references: [id], onDelete: Cascade)
  
  @@index([bankTransactionId])
  @@index([accountId])
}
Split Validation Rules:
•	• Sum of all split amounts must equal the parent transaction amount
•	• Each split must have a positive amount
•	• At least one split is required when transaction status is SPLIT
•	• Maximum 100 splits per transaction (UI constraint)
•	• Splits can only be created/modified while transaction is in PENDING_REVIEW or CATEGORIZED status
4.5 Transfer Detection Logic
Transfer detection automatically identifies movements between bank accounts within the same workspace. This prevents incorrect categorization of internal transfers as expenses or income.
Transfer Detection Algorithm:
async function detectTransfers(workspaceId: string): Promise<TransferMatch[]> {
  const transfers: TransferMatch[] = [];
  
  // Get all pending review transactions
  const pendingTxs = await prisma.bankTransaction.findMany({
    where: {
      workspaceId,
      status: 'PENDING_REVIEW',
      isTransfer: false
    },
    include: { bankAccount: true }
  });
  
  // Group by approximate amount (within small tolerance)
  const tolerance = 0.50; // Account for transfer fees
  const dateWindow = 3; // Days
  
  for (const tx of pendingTxs) {
    if (tx.amount < 0) { // Outgoing transaction
      const matchingDeposit = pendingTxs.find(candidate => {
        if (candidate.amount <= 0) return false;
        if (candidate.bankAccountId === tx.bankAccountId) return false;
        
        const amountMatch = Math.abs(
          Math.abs(parseFloat(tx.amount.toString())) - 
          parseFloat(candidate.amount.toString())
        ) <= tolerance;
        
        const dateMatch = Math.abs(
          candidate.date.getTime() - tx.date.getTime()
        ) <= dateWindow * 24 * 60 * 60 * 1000;
        
        return amountMatch && dateMatch;
      });
      
      if (matchingDeposit) {
        transfers.push({
          withdrawalTx: tx,
          depositTx: matchingDeposit,
          confidence: calculateTransferConfidence(tx, matchingDeposit)
        });
      }
    }
  }
  
  return transfers;
}
Transfer Confidence Factors:
•	• Exact amount match: +40 points
•	• Same-day transfer: +30 points
•	• Within 1 day: +25 points
•	• Within 3 days: +15 points
•	• Both accounts same currency: +10 points
4.6 Rules Engine Architecture
The enhanced bank rules engine should support multiple conditions with AND/OR logic and multiple actions per rule. The current BankRule model needs significant enhancement.
Enhanced BankRule Model:
model BankRule {
  id              String   @id @default(uuid())
  workspaceId     String
  name            String
  description     String?
  priority        Int      @default(100)
  isActive        Boolean  @default(true)
  
  // Apply to specific accounts (null = all accounts)
  bankAccountIds  String[] // Array of bank account IDs
  
  // Condition logic
  conditionLogic  String   @default("AND") // AND, OR
  conditions      BankRuleCondition[]
  
  // Actions
  actions         BankRuleAction[]
  
  // Statistics
  matchCount      Int      @default(0)
  lastMatchedAt   DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  workspace Workspace @relation(fields: [workspaceId], references: [id])
  
  @@index([workspaceId, isActive, priority])
}

model BankRuleCondition {
  id          String   @id @default(uuid())
  ruleId      String
  
  field       String   // DESCRIPTION, AMOUNT, DATE, PAYEE, TRANSACTION_TYPE
  operator    String   // CONTAINS, EQUALS, STARTS_WITH, ENDS_WITH, 
                       // GREATER_THAN, LESS_THAN, BETWEEN, REGEX
  value       String   // Comparison value
  valueEnd    String?  // For BETWEEN operator
  
  rule BankRule @relation(fields: [ruleId], references: [id], onDelete: Cascade)
  
  @@index([ruleId])
}

model BankRuleAction {
  id          String   @id @default(uuid())
  ruleId      String
  
  actionType  String   // SET_CATEGORY, SET_PAYEE, SET_CLASS, 
                       // SET_LOCATION, SET_MEMO, SET_TAG
  targetId    String?  // Account ID, Contact ID, Class ID, etc.
  targetValue String?  // String value for memo, tag, etc.
  
  rule BankRule @relation(fields: [ruleId], references: [id], onDelete: Cascade)
  
  @@index([ruleId])
}
Rule Evaluation Logic:
function evaluateRule(rule: BankRule, transaction: BankTransaction): boolean {
  const conditions = rule.conditions;
  const logic = rule.conditionLogic;
  
  if (logic === 'AND') {
    return conditions.every(c => evaluateCondition(c, transaction));
  } else {
    return conditions.some(c => evaluateCondition(c, transaction));
  }
}

function evaluateCondition(condition: BankRuleCondition, tx: BankTransaction): boolean {
  const fieldValue = getFieldValue(tx, condition.field);
  
  switch (condition.operator) {
    case 'CONTAINS':
      return fieldValue.toLowerCase().includes(condition.value.toLowerCase());
    case 'EQUALS':
      return fieldValue.toLowerCase() === condition.value.toLowerCase();
    case 'STARTS_WITH':
      return fieldValue.toLowerCase().startsWith(condition.value.toLowerCase());
    case 'GREATER_THAN':
      return parseFloat(fieldValue) > parseFloat(condition.value);
    case 'LESS_THAN':
      return parseFloat(fieldValue) < parseFloat(condition.value);
    case 'BETWEEN':
      const val = parseFloat(fieldValue);
      return val >= parseFloat(condition.value) && 
             val <= parseFloat(condition.valueEnd!);
    case 'REGEX':
      return new RegExp(condition.value, 'i').test(fieldValue);
    default:
      return false;
  }
}
5. API Endpoint Specifications
This section defines the RESTful API endpoints required for bank transaction management. All endpoints follow the pattern /api/companies/:companyId/banking/* and require authentication.
5.1 Bank Transactions Endpoints
Method	Endpoint	Purpose
GET	/transactions	List transactions with filters (status, date, account)
GET	/transactions/:id	Get single transaction with splits and matches
PATCH	/transactions/:id	Update transaction (categorize, match, split)
POST	/transactions/:id/categorize	Categorize transaction to account
POST	/transactions/:id/match	Match transaction to internal record
POST	/transactions/:id/split	Create split allocation
DELETE	/transactions/:id/match	Remove existing match
POST	/transactions/:id/exclude	Exclude transaction from books
POST	/transactions/bulk-categorize	Bulk categorize multiple transactions
POST	/transactions/detect-transfers	Run transfer detection
Table 7: Bank Transaction API Endpoints
5.2 Bank Rules Endpoints
Method	Endpoint	Purpose
GET	/rules	List all bank rules sorted by priority
POST	/rules	Create new bank rule
GET	/rules/:id	Get rule with conditions and actions
PUT	/rules/:id	Update rule (including conditions/actions)
DELETE	/rules/:id	Delete rule
PATCH	/rules/:id/priority	Update rule priority
POST	/rules/reorder	Bulk reorder rule priorities
POST	/rules/:id/test	Test rule against sample transactions
Table 8: Bank Rules API Endpoints
5.3 Example API Request/Response
Categorize Transaction Request:
// POST /api/companies/:companyId/banking/transactions/:id/categorize
{
  "accountId": "acc_abc123",
  "payeeId": "contact_xyz789",
  "memo": "Monthly office supplies",
  "classId": "class_001",
  "confidence": 0.95,
  "source": "MANUAL" // or "RULE", "AI", "HISTORICAL"
}

// Response
{
  "id": "btx_def456",
  "status": "CATEGORIZED",
  "categoryId": "acc_abc123",
  "category": {
    "id": "acc_abc123",
    "code": "6001",
    "name": "Office Supplies"
  },
  "categorizedAt": "2025-01-15T10:30:00Z",
  "categorizedBy": {
    "id": "user_123",
    "name": "John Accountant"
  }
}
6. UI/UX Recommendations
The bank transactions interface is one of the most frequently used features in accounting software. The UI design should prioritize efficiency for high-volume transaction processing while remaining intuitive for occasional users.
6.1 Transaction Review Interface
The primary interface for bank transactions is a three-column layout inspired by QuickBooks' Banking Center. The left column shows bank accounts with transaction counts, the center column displays the transaction list with categorization controls, and the right column shows details for the selected transaction.
Layout Structure:
Column	Width	Content
Left Sidebar	20%	Bank account cards with pending count, filters, date range selector
Main Content	50%	Transaction list with inline categorization, batch action bar
Detail Panel	30%	Selected transaction details, match suggestions, split editor
Table 9: UI Layout Structure
6.2 Transaction List Design
Each transaction row should display the following information with visual hierarchy:
•	• Date: Left-aligned, smaller font, muted color
•	• Description: Primary text, bold, with payee name highlighted if recognized
•	• Amount: Right-aligned, color-coded (green for deposits, red for withdrawals)
•	• Status Badge: Color-coded status indicator (Pending, Matched, Categorized, etc.)
•	• Category: Dropdown selector with recent categories and search
•	• Match: Icon indicator showing match status with click-to-match action
•	• Actions: Kebab menu with View, Split, Exclude, Undo options
6.3 Match Suggestion Panel
When a transaction is selected, the right panel should display potential matches with confidence indicators. High-confidence matches appear at the top with a single 'Confirm' button. Lower-confidence matches are collapsible under 'Other Possible Matches'. A search field allows manual record search.
Match Card Design:
•	• Entity Type Badge: Invoice, Bill, Payment (color-coded)
•	• Entity Number: Clickable link to open original document
•	• Customer/Vendor Name: Secondary text
•	• Amount: Prominent display matching transaction amount
•	• Date: Proximity indicator (e.g., '3 days before transaction')
•	• Confidence Meter: Visual bar showing match score percentage
•	• Actions: Confirm Match, View Details, Reject
6.4 Keyboard Shortcuts
For power users processing high transaction volumes, keyboard shortcuts are essential:
Shortcut	Action
Enter	Confirm current selection/match
Tab	Move to next transaction
Shift+Tab	Move to previous transaction
C	Open category dropdown
M	Open match panel
S	Open split editor
E	Exclude transaction
U	Undo last action
?	Open help/shortcuts panel
Table 10: Keyboard Shortcuts
7. Philippine Market Considerations
HaypBooks has a unique opportunity to differentiate from QuickBooks by providing native support for Philippine payment methods and banking practices. This section addresses specific requirements for the Philippine market.
7.1 E-Wallet Integration
GCash and Maya are the dominant e-wallets in the Philippines, with over 70% of Filipino adults using digital wallets. Unlike traditional bank accounts, e-wallet transactions have unique characteristics:
•	• Transaction references: E-wallets use reference numbers and QR codes rather than traditional check numbers
•	• Instant transfers: Transactions are real-time, eliminating the typical bank feed delay
•	• Merchant categorization: E-wallets often include merchant category codes that can inform categorization
•	• Split payment support: A single transaction may be partially funded by wallet balance and partially by linked card
E-Wallet Transaction Model Extension:
model EWalletTransaction {
  id                String   @id @default(uuid())
  bankTransactionId String
  provider          String   // GCASH, MAYA, GRABPAY
  
  // E-wallet specific fields
  referenceNumber   String
  qrCode            String?
  merchantCategory  String?
  merchantName      String?
  
  // Payment method breakdown
  walletAmount      Decimal? @db.Decimal(19, 4)
  linkedCardAmount  Decimal? @db.Decimal(19, 4)
  
  // Philippine-specific
  isInstapay        Boolean  @default(false)
  isPesonet         Boolean  @default(false)
  
  bankTransaction BankTransaction @relation(fields: [bankTransactionId], references: [id])
  
  @@index([provider, referenceNumber])
}
7.2 Local Bank Integration
The IntegrationType enum already includes major Philippine banks (BDO, BPI, Metrobank, etc.). Implementation should prioritize:
•	• BDO and BPI: Largest retail banks, highest user volume
•	• Metrobank: Strong SME banking presence
•	• UnionBank: API-forward bank, easier integration
•	• LandBank: Government transactions, NGO/grant funding
•	• InstaPay/PESONet: Philippine interbank transfer protocols
8. Implementation Roadmap
The following phased approach is recommended to deliver bank transaction functionality incrementally while managing development complexity. Each phase builds upon the previous, allowing for iterative refinement based on user feedback.
Phase 1: Foundation (Weeks 1-4)
•	• Enhance BankTransaction model with status and categorization fields
•	• Implement basic bank rules engine (single condition, single action)
•	• Build transaction list UI with categorization dropdown
•	• Create API endpoints for transaction CRUD and categorization
•	• Establish categorization pattern learning (historical patterns)
Phase 2: Matching & Splits (Weeks 5-8)
•	• Implement matching algorithm with confidence scoring
•	• Build match suggestion UI panel
•	• Create BankTransactionSplit model and validation
•	• Build split transaction editor UI
•	• Add transfer detection algorithm
Phase 3: AI & Automation (Weeks 9-12)
•	• Integrate or build AI categorization model
•	• Enhance rules engine with multiple conditions/actions
•	• Build rules management UI with testing
•	• Implement bulk categorization with rule preview
•	• Add keyboard shortcuts for power users
Phase 4: Philippine Integrations (Weeks 13-16)
•	• Implement GCash transaction import
•	• Implement Maya transaction import
•	• Build InstaPay/PESONet transfer detection
•	• Add Philippine bank feed connections
•	• Create e-wallet specific categorization rules
Resource Estimation:
Phase	Duration	Backend Dev	Frontend Dev	QA
Phase 1	4 weeks	1 FTE	1 FTE	0.5 FTE
Phase 2	4 weeks	1 FTE	1 FTE	0.5 FTE
Phase 3	4 weeks	1 FTE	1 FTE	1 FTE
Phase 4	4 weeks	1 FTE	1 FTE	1 FTE
Table 11: Resource Estimation
9. Uncertainty Statement & Limitations
9.1 Assumptions Made
•	• Bank feed providers (Plaid, Yodlee) can integrate with Philippine banks through their existing infrastructure or partner arrangements
•	• The Prisma schema can be modified without breaking existing functionality
•	• AI/ML categorization model will be built or integrated as a separate microservice
•	• GCash and Maya APIs provide transaction history access (to be verified during implementation)
•	• User has administrative access to make schema migrations
9.2 Known Limitations
•	• E-wallet API access may require business partnerships that take time to establish
•	• AI categorization accuracy depends on training data which will initially be limited
•	• Transfer detection may produce false positives for transactions between related companies
•	• Rules engine complexity may require performance optimization for large rule sets
•	• Some Philippine banks may not support direct API access, requiring file-based imports
9.3 Validation Steps Required
•	• Verify GCash/Maya API availability and terms of service for transaction access
•	• Test schema migrations on a staging database before production deployment
•	• Conduct user research on categorization UI preferences with Philippine accountants
•	• Benchmark rules engine performance with 1000+ rules
•	• Validate matching algorithm accuracy against historical reconciliation records
=====================================================

Bank Reconciliation Documentation
QuickBooks Implementation Analysis & HaypBooks Recommendations
Document: Bankrecon101 | Date: January 2025
Table of Contents

1. Executive Summary	2
2. QuickBooks Bank Reconciliation System	2
2.1 Overview of QuickBooks Approach	2
2.2 Pre-Reconciliation Preparation	3
2.3 The Reconciliation Workflow	3
2.4 Auto-Reconciliation Adjustment Feature	5
2.5 Discrepancy Detection and Resolution	5
2.6 Reconciliation Reports	6
3. HaypBooks Schema Analysis for Bank Reconciliation	6
3.1 Existing Banking Models	6
3.2 BankReconciliationStatus Enum	7
3.3 Philippine-Specific Integration Types	8
3.4 Navigation Structure for Reconciliation	8
4. Gap Analysis: QuickBooks vs HaypBooks	9
4.1 Features Present in QuickBooks, Missing in HaypBooks	9
4.2 HaypBooks Advantages Over QuickBooks	10
5. Implementation Recommendations	10
5.1 Core Reconciliation Engine	10
5.2 Reconciliation Workflow UI	11
5.3 Discrepancy Resolution System	11
5.4 Bank Rules Integration	12
5.5 Reporting and Analytics	12
6. Technical Implementation Guide	13
6.1 Database Schema Enhancements	13
6.2 API Endpoint Design	13
6.3 Transaction Matching Algorithm	14
7. Conclusion and Next Steps	14

Note: Right-click the TOC and select 'Update Field' to refresh page numbers.
 
1. Executive Summary
Bank reconciliation is a critical accounting process that ensures the accuracy of financial records by comparing a company's internal financial records against the bank's official statements. This fundamental control mechanism serves as the cornerstone of sound financial management, enabling businesses to identify discrepancies, detect errors, prevent fraud, and maintain the integrity of their accounting systems. The reconciliation process has evolved significantly with modern cloud-based accounting software, transforming from a manual, paper-intensive procedure into an automated, intelligent workflow that dramatically reduces human error while improving efficiency.
This comprehensive documentation examines how QuickBooks, the industry-leading accounting software, handles bank reconciliation across its desktop and online platforms. The analysis covers the complete reconciliation lifecycle, from initial bank feed integration through final report generation, with particular attention to automation features, discrepancy detection mechanisms, and error resolution workflows. Understanding QuickBooks' approach provides valuable insights for implementing similar functionality in HaypBooks, a cloud-based accounting platform specifically designed for the Philippine market.
The document is structured to first present QuickBooks' implementation patterns and best practices, followed by a detailed examination of HaypBooks' existing schema architecture for banking and reconciliation. The analysis identifies gaps, opportunities for improvement, and provides specific recommendations for implementing a robust bank reconciliation system that meets Philippine regulatory requirements while exceeding user expectations for functionality and ease of use.
2. QuickBooks Bank Reconciliation System
2.1 Overview of QuickBooks Approach
QuickBooks implements bank reconciliation as an integrated feature that seamlessly connects bank feed data with the company's accounting records. The system is designed to minimize manual data entry while maximizing accuracy and providing comprehensive audit trails. QuickBooks Online and QuickBooks Desktop share fundamental reconciliation principles but differ in their implementation details and user interfaces. Both platforms emphasize the importance of completing bank reconciliation regularly as a best practice for maintaining accurate financial records.
The QuickBooks reconciliation workflow is built around the concept of matching transactions between the bank statement and the company's books. Transactions that appear in both records are marked as 'cleared' and eventually 'reconciled' as the user works through the reconciliation process. The system automatically handles many matching operations through its intelligent transaction recognition capabilities, significantly reducing the manual effort required from users while maintaining full transparency and control.
2.2 Pre-Reconciliation Preparation
Before initiating a bank reconciliation, QuickBooks recommends several preparatory steps that ensure a smooth and accurate reconciliation process. These steps are critical for businesses converting from other accounting systems or establishing new company files, as they establish the baseline from which future reconciliations will build.
•	Bank Account Setup: Configure checking, savings, and credit card accounts as 'Bank' type accounts in the Chart of Accounts, ensuring proper classification for reporting purposes
•	Opening Balance Entry: Enter accurate opening balances that match the bank statement balance as of the start date, typically the first day of a fiscal period
•	Bank Feed Connection: Link bank accounts to enable automatic transaction downloads, reducing manual entry and ensuring up-to-date records
•	Historical Transaction Review: Review and categorize downloaded transactions before reconciliation to identify any outstanding items requiring attention
•	Statement Acquisition: Obtain the current bank statement with ending balance and ending date, which will serve as the reference point for reconciliation
2.3 The Reconciliation Workflow
The QuickBooks reconciliation workflow follows a structured, step-by-step process designed to guide users through comparing their records with the bank statement. This systematic approach ensures completeness and accuracy while providing clear visual feedback on the reconciliation status.
Step 1: Access Reconciliation Module
Users access the reconciliation feature through the Gear menu (QuickBooks Online) or Banking menu (QuickBooks Desktop). The reconciliation module presents a summary of previous reconciliation history, including the last reconciled date and ending balance, providing context for the current reconciliation session.
Step 2: Select Account and Enter Statement Information
The user selects the bank account to reconcile from a dropdown list and enters the ending balance and ending date from the bank statement. QuickBooks automatically populates the beginning balance from the previous reconciliation, providing a seamless continuation of the reconciliation history. If the beginning balance differs from expected values, QuickBooks alerts the user and provides tools to investigate and resolve the discrepancy.
Step 3: Review and Clear Transactions
The reconciliation screen displays all transactions within the statement period, organized by deposits and other credits, checks and payments, and other transactions. Transactions that were previously matched through bank feeds are automatically marked as cleared (indicated by a 'C' in the register), streamlining the reconciliation process. The user reviews each transaction against the bank statement, marking items as cleared by clicking checkboxes.
Step 4: Verify Difference Equals Zero
As transactions are marked cleared, QuickBooks continuously calculates the difference between the statement balance and the cleared balance. The goal is to achieve a difference of zero, indicating that all transactions on the bank statement have been accounted for in the company's records. A real-time summary displays: statement balance, cleared balance, and the difference. The user can identify and investigate any discrepancies before completing the reconciliation.
Step 5: Complete Reconciliation
Once the difference equals zero, the user clicks 'Finish Now' to complete the reconciliation. QuickBooks marks all cleared transactions as reconciled (indicated by an 'R' in the register) and records the reconciliation details for historical reference. Users have the option to view and print a reconciliation report immediately after completion.
2.4 Auto-Reconciliation Adjustment Feature
QuickBooks Online includes an auto-reconciliation adjustment feature that provides flexibility when users need to complete a reconciliation with a non-zero difference. This feature automatically creates an adjusting journal entry that brings the difference to zero, allowing the reconciliation to be completed. While this feature offers convenience, it should be used cautiously as it bypasses the normal investigation process for discrepancies.
When a user forces a reconciliation with a non-zero difference, QuickBooks displays a warning explaining that an auto-adjustment entry will be created in the 'Reconciliation Discrepancies' expense account. This adjustment appears in the Profit and Loss statement, providing visibility into forced reconciliations. To correct an incorrect auto-adjustment, users must first delete the adjustment transaction from the Transaction Report, then undo the reconciliation and re-reconcile correctly.
2.5 Discrepancy Detection and Resolution
QuickBooks provides robust tools for detecting and resolving reconciliation discrepancies. When the beginning balance doesn't match expected values (indicating changes to previously reconciled transactions), QuickBooks generates a Reconciliation Discrepancy Report that identifies specific transactions modified or deleted after reconciliation. This audit trail enables users to pinpoint exactly what changed and restore the integrity of their records.
The discrepancy detection system monitors for several types of changes that can affect reconciliation accuracy:
•	Modified Transactions: Changes to amount, date, or payee on previously reconciled transactions
•	Deleted Transactions: Removal of transactions that were part of completed reconciliations
•	Added Transactions: New entries backdated into previously reconciled periods
•	Voided Transactions: Transactions voided after reconciliation completion
2.6 Reconciliation Reports
QuickBooks generates comprehensive reconciliation reports that serve as permanent records of each reconciliation session. These reports are essential for audit purposes, providing documentation of the reconciliation process and results. The primary reconciliation report includes:
•	Summary Information: Account name, statement date, beginning balance, ending balance, and reconciliation date
•	Cleared Transactions: Complete list of deposits and withdrawals cleared during reconciliation
•	Uncleared Transactions: Outstanding checks and deposits in transit as of the statement date
•	Adjustments: Any adjustments made during the reconciliation process
Users can access reconciliation history through the History by Account feature, which displays all past reconciliations with options to view detailed reports for each session. This historical record enables tracking of reconciliation patterns over time and provides evidence of financial control compliance.
3. HaypBooks Schema Analysis for Bank Reconciliation
3.1 Existing Banking Models
HaypBooks' Prisma schema includes a comprehensive set of banking-related models that provide a solid foundation for implementing bank reconciliation functionality. The schema demonstrates thoughtful design with proper relationships, status tracking, and support for the Philippine banking ecosystem. The following analysis examines the key models relevant to bank reconciliation implementation.
Table 1: HaypBooks Banking Models Overview
Model Name	Purpose	Key Fields
BankAccount	Store bank/e-wallet account details	accountNumber, currency, balance
BankTransaction	Individual bank transactions	amount, type, cleared, reconciled
BankReconciliation	Reconciliation session tracking	beginningBalance, endingBalance, status
BankReconciliationLine	Individual cleared transactions	transactionId, cleared, adjustments
BankRule	Automation rules for categorization	conditions, actions, priority
BankFeedConnection	Bank API connections for feeds	integrationType, credentials, status
3.2 BankReconciliationStatus Enum
The schema defines a BankReconciliationStatus enum that tracks the lifecycle of reconciliation sessions. This state machine approach enables proper workflow management and audit trail maintenance throughout the reconciliation process.
•	DRAFT: Initial state when reconciliation session is created but not yet started
•	IN_PROGRESS: Active reconciliation session where user is clearing transactions
•	COMPLETED: Successfully finished reconciliation with zero difference
•	VOID: Cancelled or reversed reconciliation session
3.3 Philippine-Specific Integration Types
A distinctive strength of the HaypBooks schema is its comprehensive support for Philippine banking and payment integrations. The IntegrationType enum includes dedicated values for major Philippine banks, e-wallets, and e-commerce platforms, enabling direct connectivity with the financial services most commonly used by Philippine businesses.
Table 2: Philippine Banking & Payment Integrations
Category	Integration Type	Description
Major Banks	BDO, BPI, Metrobank	Top 3 universal banks by assets in Philippines
Government Banks	Landbank, PNB	Government-owned banks for public sector transactions
E-Wallets	GCash, Maya, GrabPay	Mobile payment platforms popular for SME transactions
E-Commerce	Lazada, Shopee	Marketplace integrations for online sellers
3.4 Navigation Structure for Reconciliation
The HaypBooks navigation structure includes a dedicated Banking & Cash section with a comprehensive reconciliation subsection. This organization provides clear user pathways for all reconciliation-related activities, from the main reconciliation screen to historical reports and statement archives. The navigation hierarchy demonstrates a thoughtful approach to feature organization that mirrors QuickBooks' proven patterns while adding Philippine-specific elements.
The reconciliation navigation includes the following pages:
1.	Reconcile: Main reconciliation interface for active sessions
2.	Reconciliation History: Historical record of completed reconciliations
3.	Statement Archive: Repository for uploaded bank statements
4.	Reconciliation Reports: Reporting and analytics for reconciliation data
4. Gap Analysis: QuickBooks vs HaypBooks
4.1 Features Present in QuickBooks, Missing in HaypBooks
While HaypBooks' schema provides a strong foundation, several features present in QuickBooks' reconciliation implementation require additional development. Identifying these gaps enables prioritized feature development that aligns with user expectations and industry standards.
Table 3: Feature Gap Analysis
Feature	QuickBooks	HaypBooks Status
Auto-Match Algorithm	Intelligent matching by amount, date, payee	Schema ready; logic needed
Discrepancy Report	Auto-generated on balance mismatch	Not yet implemented
Auto-Adjustment Entry	Forced reconciliation with warning	Schema missing adjustment tracking
Clear/R Status Markers	Visual C and R indicators	Fields exist; UI needed
Undo Reconciliation	One-click undo with audit trail	VOID status exists; UI needed
4.2 HaypBooks Advantages Over QuickBooks
HaypBooks possesses several inherent advantages that differentiate it from QuickBooks in the Philippine market. These advantages should be leveraged and enhanced during reconciliation feature development to create a compelling value proposition for local users.
•	Local Bank Integration: Native support for BDO, BPI, Metrobank, and other Philippine banks eliminates the friction of connecting local accounts, a pain point for QuickBooks users in the Philippines
•	E-Wallet Support: Built-in GCash and Maya integration addresses the unique payment landscape in the Philippines where e-wallets handle significant transaction volume for SMEs
•	BIR Compliance: Integration with BIR forms and tax reporting requirements ensures reconciled data flows seamlessly into regulatory filings
•	Multi-Currency Support: Schema supports currency tracking, essential for Philippine businesses with USD accounts or overseas transactions
5. Implementation Recommendations
5.1 Core Reconciliation Engine
The core reconciliation engine should implement a transaction matching algorithm that automatically identifies and matches bank transactions with book entries. This algorithm should consider multiple matching criteria with configurable tolerance levels:
1.	Exact Match: Amount and date match exactly, highest confidence level
2.	Near Match: Amount matches exactly, date within configurable tolerance (e.g., ±3 days)
3.	Fuzzy Match: Amount within tolerance (e.g., ±1%), requires user confirmation
4.	Reference Match: Transaction reference numbers match, regardless of other factors
5.2 Reconciliation Workflow UI
The user interface for reconciliation should follow QuickBooks' proven patterns while incorporating Philippine-specific enhancements. Key UI components include:
•	Summary Dashboard: Real-time display of statement balance, cleared balance, and difference with visual indicators for reconciliation status
•	Transaction Grid: Split-panel view showing deposits and withdrawals separately, with checkbox selection for clearing transactions
•	Filter Controls: Date range, amount range, transaction type, and cleared status filters for large transaction volumes
•	Quick Actions: Add transaction, transfer between accounts, and resolve discrepancy shortcuts
5.3 Discrepancy Resolution System
Implement a comprehensive discrepancy resolution system that guides users through identifying and correcting reconciliation differences. The system should:
1.	Automatically detect when beginning balance differs from expected value and generate discrepancy report
2.	Identify specific transactions modified, deleted, or added after previous reconciliation
3.	Provide guided workflow for correcting discrepancies with option to create adjusting entries
4.	Maintain complete audit trail of all changes made during discrepancy resolution
5.4 Bank Rules Integration
Leverage the existing BankRule model to automate transaction categorization before reconciliation. Bank rules should support:
•	Pattern Matching: Rules based on description text, amount patterns, or transaction type
•	Auto-Categorization: Automatically assign accounts, classes, and tags based on rule conditions
•	Auto-Clear: Option to automatically mark matched transactions as cleared
•	Priority Ordering: Rule execution order for handling overlapping conditions
5.5 Reporting and Analytics
Develop a comprehensive reporting suite for reconciliation that provides visibility into financial controls and supports audit requirements:
1.	Reconciliation Summary Report: Overview of cleared items, outstanding items, and adjustments
2.	Outstanding Items Report: List of uncleared checks and deposits in transit with aging analysis
3.	Reconciliation History Report: Chronological record of all reconciliation sessions with completion dates
4.	Discrepancy Analysis Report: Summary of discrepancies identified and resolution actions taken
6. Technical Implementation Guide
6.1 Database Schema Enhancements
While the existing schema provides solid foundations, consider adding the following fields to enhance reconciliation tracking capabilities:
•	BankReconciliation Model: Add 'adjustmentAmount', 'adjustmentAccountId', and 'forcedCompletion' fields for auto-adjustment tracking
•	BankTransaction Model: Add 'matchedTransactionId' for linking to book entries, 'matchConfidence' for algorithm confidence score
•	New ReconciliationDiscrepancy Model: Track individual discrepancies with resolution status and audit trail
6.2 API Endpoint Design
Design RESTful API endpoints that support the complete reconciliation workflow:
Table 4: Reconciliation API Endpoints
Endpoint	Method	Purpose
/api/reconciliations	GET, POST	List and create reconciliations
/api/reconciliations/:id	GET, PUT	Get and update reconciliation
/api/reconciliations/:id/complete	POST	Complete reconciliation session
/api/reconciliations/:id/undo	POST	Undo completed reconciliation
/api/reconciliations/:id/discrepancies	GET	Get discrepancy report
6.3 Transaction Matching Algorithm
Implement a sophisticated matching algorithm that handles the nuances of Philippine banking transactions:
1.	Date Normalization: Handle timezone differences between bank records and local entries, accounting for Philippine timezone (UTC+8)
2.	Amount Tolerance: Support exact and near-match amount comparison with configurable percentage or absolute tolerance
3.	Reference Parsing: Extract and match reference numbers from bank transaction descriptions using pattern recognition
4.	Batch Processing: Process large transaction volumes efficiently using queue-based background processing
7. Conclusion and Next Steps
HaypBooks possesses a robust foundation for implementing bank reconciliation functionality that can match or exceed QuickBooks' capabilities while offering unique advantages for the Philippine market. The existing schema architecture demonstrates thoughtful design with proper support for Philippine banks, e-wallets, and regulatory requirements. By implementing the recommendations outlined in this document, HaypBooks can deliver a reconciliation experience that addresses the specific needs of Filipino businesses while maintaining the accounting accuracy and control standards expected of professional accounting software.
Key implementation priorities should include: developing the intelligent matching algorithm, creating an intuitive reconciliation workflow UI, implementing the discrepancy detection and resolution system, and building comprehensive reporting capabilities. The integration with existing bank feed connections and bank rules infrastructure will provide a seamless user experience that automates much of the reconciliation process while maintaining user control and visibility.
With focused development effort on these priorities, HaypBooks can establish bank reconciliation as a key competitive differentiator in the Philippine accounting software market, providing local businesses with a purpose-built solution that understands and addresses their unique financial management requirements.
==================================================================
Chart of Accounts Documentation
QuickBooks Implementation Analysis & HaypBooks Recommendations
Document: COA101 | Date: January 2025
Table of Contents

1. Executive Summary	2
2. QuickBooks Chart of Accounts Structure	2
2.1 Fundamental Concepts	2
2.2 Account Category Types	3
2.3 Standard QuickBooks Chart of Accounts	4
2.3.1 Asset Accounts	4
2.3.2 Liability Accounts	5
2.3.3 Equity Accounts	5
2.3.4 Income Accounts	6
2.3.5 Expense Accounts	6
2.4 Account Management Features	7
3. HaypBooks Chart of Accounts Analysis	8
3.1 Schema Architecture	8
3.2 Account Category Enum	9
3.3 Special Account Types	10
3.4 Development Specifications	11
4. Philippine-Specific Chart of Accounts Requirements	11
4.1 BIR Compliance Considerations	11
4.2 Recommended Philippine Chart of Accounts Structure	12
5. Implementation Recommendations	13
5.1 Default Chart of Accounts Templates	13
5.2 Account Numbering System	14
5.3 Import/Export Functionality	14
5.4 Validation and Integrity Controls	15
5.5 API Implementation	15
6. Conclusion and Next Steps	16

Note: Right-click the TOC and select 'Update Field' to refresh page numbers.
 
1. Executive Summary
The Chart of Accounts (COA) serves as the foundational backbone of any accounting system, representing the complete list of accounts used by an organization to record financial transactions. Each account categorizes the nature of transactions flowing through it, ultimately determining how financial statements are constructed and presented. A well-designed Chart of Accounts enables accurate financial reporting, compliance with regulatory requirements, and effective business decision-making through meaningful data analysis and trend identification.
This comprehensive documentation examines how QuickBooks, the leading small business accounting software, structures and manages the Chart of Accounts across its product offerings. The analysis covers account type classifications, hierarchical organization, detail type specifications, and the user experience for managing accounts. Understanding QuickBooks' approach provides valuable benchmarks for implementing similar functionality in HaypBooks, a cloud-based accounting platform designed specifically for the Philippine market with unique requirements for BIR compliance and local business practices.
The document presents QuickBooks' standard Chart of Accounts structure, analyzes the existing HaypBooks schema and development specifications, identifies gaps and opportunities, and provides detailed implementation recommendations. Special attention is given to Philippine-specific requirements including BIR-mandated account structures, tax reporting classifications, and local business terminology that differentiate HaypBooks from international accounting software solutions.
2. QuickBooks Chart of Accounts Structure
2.1 Fundamental Concepts
QuickBooks defines the Chart of Accounts as the 'hub' of the accounting system, where every transaction entered flows through to the Chart of Accounts and ultimately appears on financial statements. The Chart of Accounts represents the complete list of a business's accounts and their balances, serving as tracking categories for assets, liabilities, equity, income, and expenses. This fundamental concept drives the entire accounting process within QuickBooks, ensuring that every financial transaction is properly categorized and reported.
The most critical element when working with the Chart of Accounts in QuickBooks is the Account Category Type. This classification determines whether an account appears on the Balance Sheet or the Profit and Loss Statement, and selecting the wrong category type will result in incorrect financial statements. QuickBooks enforces this through its user interface by requiring users to select both a Category Type (which determines the financial statement placement) and a Detail Type (which provides more specific classification within the category).
2.2 Account Category Types
QuickBooks organizes accounts into five primary categories that align with standard accounting principles. These categories determine the financial statement where each account appears and the normal balance side (debit or credit) for the account. Understanding these categories is essential for proper account setup and accurate financial reporting.
Table 1: QuickBooks Account Category Types
Category	Financial Statement	Normal Balance	Examples
Assets	Balance Sheet	Debit	Cash, A/R, Inventory, Equipment
Liabilities	Balance Sheet	Credit	A/P, Loans, Credit Cards
Equity	Balance Sheet	Credit	Owner's Equity, Retained Earnings
Income	Profit & Loss	Credit	Sales, Service Income, Interest
Expenses	Profit & Loss	Debit	Rent, Utilities, Salaries
2.3 Standard QuickBooks Chart of Accounts
QuickBooks provides a comprehensive standard Chart of Accounts that is automatically generated when a new company file is created. The standard accounts are organized hierarchically with parent accounts and sub-accounts, allowing businesses to track detailed information while maintaining organized financial statements. The following sections detail the standard account structure used in QuickBooks.
2.3.1 Asset Accounts
Asset accounts represent what the business owns or is owed. QuickBooks organizes assets into several subcategories including Bank accounts (for cash and bank balances), Accounts Receivable (for money owed by customers), Other Current Assets (for short-term assets like inventory and prepaid expenses), Fixed Assets (for long-term assets like buildings and equipment), and Other Long-term Assets. The detailed structure allows businesses to track specific asset types while maintaining accurate balance sheet reporting.
•	Bank Accounts: Bank, Cash on hand, Checking, Money Market, Rents Held in Trust, Savings, Trust account
•	Accounts Receivable: Accounts Receivable (A/R), Allowance for Bad Debts
•	Other Current Assets: Development Costs, Employee Cash Advances, Inventory, Investments, Loans to Officers/Others/Stockholders, Other Current Assets, Prepaid Expenses, Retainage, Undeposited Funds
•	Fixed Assets: Buildings, Computers, Copiers, Furniture, Machinery & Equipment, Other Tools & Equipment, Phone, Photo/Video, Software, Vehicles, Other Fixed Assets
•	Intangible Assets: Goodwill, Licenses, Organizational Costs
•	Other Assets: Other Long-term Assets, Security Deposits, Leasehold Improvements, Land
2.3.2 Liability Accounts
Liability accounts represent what the business owes to others. QuickBooks organizes liabilities into Credit Card accounts, Accounts Payable (for money owed to vendors), Other Current Liabilities (for short-term obligations), and Long-term Liabilities. The structure supports tracking of various debt instruments, tax obligations, and other payables that businesses commonly encounter in their operations.
•	Credit Card: Credit Card accounts for tracking business credit card balances
•	Accounts Payable: Accounts Payable (A/P) for tracking vendor obligations
•	Other Current Liabilities: Deferred Revenue, Federal Income Tax Payable, Insurance Payable, Line of Credit, Loan Payable, Health Insurance Premium, Health Savings Account Contribution, Payroll Clearing, Payroll Tax Payable, Prepaid Expenses Payable, Rents in Trust, Sales Tax Payable, State/Local Income Tax Payable, Trust Accounts, Undistributed Tips
•	Long Term Liabilities: Other Long Term Liabilities, Shareholder Notes Payable, Estimated Taxes
2.3.3 Equity Accounts
Equity accounts represent the owner's interest in the business after liabilities are subtracted from assets. QuickBooks provides various equity account types to accommodate different business structures including sole proprietorships, partnerships, and corporations. The structure allows for tracking of owner contributions, distributions, retained earnings, and various stock types for incorporated businesses.
•	General Equity: Equity, Accumulated Adjustment, Opening Balance Equity, Owner's Equity
•	Corporate Equity: Paid-In Capital or Surplus, Preferred Stock, Common Stock, Treasury Stock, Retained Earnings
•	Partnership Equity: Partner Contributions, Partner Distributions, Partner's Equity
•	Personal: Personal Expense, Personal Income
2.3.4 Income Accounts
Income accounts track the revenue generated by the business. QuickBooks provides various income account types to categorize different revenue streams including product sales, service income, interest earned, and other miscellaneous income. The structure supports detailed revenue tracking that enables businesses to analyze their income sources and make informed decisions about business strategy and resource allocation.
•	Primary Income: Income, Sales of Product Income, Service/Fee Income, Other Primary Income
•	Investment Income: Interest Earned, Tax-Exempt Interest, Dividend Income, Other Investment Income
•	Other Income: Other Income, Non-Profit Income, Other Miscellaneous Income, Unapplied Cash Payment Income
2.3.5 Expense Accounts
Expense accounts track the costs incurred in running the business. QuickBooks provides an extensive list of expense categories covering all common business expenses from advertising and auto expenses to professional fees and utilities. The detailed categorization enables accurate expense tracking, tax deduction identification, and cost management analysis. Sub-accounts are used extensively in the expense category to provide additional detail while maintaining organized financial statements.
•	Operating Expenses: Advertising/Promotional, Amortization, Auto, Bad Debts, Bank Charges, Charitable Contributions, Communication, Cost of Labor, Depreciation, Dues & Subscriptions
•	Facilities: Rent or Lease of Buildings, Repairs and Maintenance, Utilities, Insurance, Property Tax
•	Professional Services: Legal & Professional Fees, Office/General Administrative Expenses
•	Travel & Entertainment: Travel, Travel Meals, Entertainment, Entertainment Meals, Promotional Meals, Parking and Tolls
•	Vehicle Expenses: Vehicle (with sub-accounts: Insurance, Lease, Loan, Loan Interest, Registration, Repairs), Gas and Fuel, Other Vehicle Expenses, Wash and Road Services
•	Home Office: Home Office (with sub-accounts: Mortgage Interest, Other Expenses, Rental Insurance, Repairs and Maintenance, Utilities)
•	Payroll: Payroll Expenses (with sub-accounts: Payroll Tax Expenses, Payroll Wage Expenses)
•	Other Expenses: Other Business Expenses, Other Miscellaneous Expense, Penalties & Settlements, Shipping/Freight/Delivery, Supplies & Materials, Taxes Paid, Exchange Gain or Loss, Finance Costs
2.4 Account Management Features
QuickBooks provides comprehensive features for managing the Chart of Accounts, including creation, editing, organization, and maintenance capabilities. These features are designed to accommodate both novice users and experienced accountants, providing flexibility while maintaining accounting integrity.
Account Creation Process
Creating a new account in QuickBooks involves selecting both a Category Type and a Detail Type. The Category Type determines the financial statement placement and is the most critical selection. The Detail Type provides additional classification within the category but does not affect financial reporting. Users must also enter an account name and can optionally add a description, account number, and opening balance. The system validates the Category Type selection to ensure proper financial statement construction.
Sub-Account Functionality
QuickBooks supports hierarchical account structures through sub-accounts. Sub-accounts are used when users need to track more detail associated with a parent account. For example, a Legal and Professional Fees account might have sub-accounts for Accounting, Lawyer, and Bookkeeping. Sub-accounts inherit the Category Type from their parent and appear indented under the parent account in the Chart of Accounts list. The parent account's balance includes all sub-account balances, providing both detail and summary views on financial statements.
Account Numbers
QuickBooks supports optional account numbering for standardized Chart of Accounts organization. When enabled, users must enter an account number for each account. Account numbers make it easy for accountants to standardize their clients' Chart of Accounts and facilitate data entry by allowing users to enter either the account name or number when recording transactions. The numbering feature is enabled through Account and Settings under the Advanced section.
3. HaypBooks Chart of Accounts Analysis
3.1 Schema Architecture
HaypBooks implements a robust Chart of Accounts architecture through its Prisma schema, providing comprehensive support for multi-tenant, multi-company accounting operations. The schema design demonstrates thoughtful consideration of accounting principles while incorporating Philippine-specific requirements for BIR compliance and local business practices. The following analysis examines the key schema elements relevant to Chart of Accounts functionality.
Table 2: HaypBooks Account Model Key Fields
Field	Type	Description
code	String	Unique account identifier (e.g., 1000, 1100)
name	String	Account display name
category	Enum	ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE, etc.
normalSide	Enum	DEBIT or CREDIT - determines balance increase side
parentId	String?	Self-referential for hierarchical structure
liquidityType	Enum	CURRENT, NON_CURRENT, NOT_APPLICABLE
specialType	Enum	CONTROL_ACCOUNT, CONTRA_ACCOUNT, SUSPENSE_ACCOUNT, etc.
cashFlowSection	Enum	OPERATING, INVESTING, FINANCING for cash flow statements
3.2 Account Category Enum
HaypBooks extends the standard five accounting categories with additional specialized types to support comprehensive financial reporting and Philippine-specific accounting requirements. The enhanced category structure enables more precise classification of accounts while maintaining compatibility with standard accounting principles.
•	ASSET: Resources owned by the business with future economic value
•	LIABILITY: Obligations owed to external parties
•	EQUITY: Owner's residual interest after liabilities are deducted
•	REVENUE: Income generated from business operations
•	EXPENSE: Costs incurred in generating revenue
•	CONTRA_ASSET: Accounts that reduce asset values (e.g., Accumulated Depreciation)
•	CONTRA_REVENUE: Accounts that reduce revenue (e.g., Sales Returns and Allowances)
•	CONTRA_EXPENSE: Accounts that reduce expenses (e.g., Purchase Returns)
•	TEMPORARY_EQUITY: Temporary equity accounts for year-end closing
3.3 Special Account Types
HaypBooks introduces a sophisticated special type classification system that enables advanced accounting functionality. This system supports control accounts for subsidiary ledger management, contra accounts for offsetting balances, suspense accounts for temporary holding, intercompany accounts for multi-entity transactions, and revaluation accounts for foreign exchange adjustments.
Table 3: Account Special Types
Special Type	Purpose and Use Case
CONTROL_ACCOUNT	Summary accounts for subsidiary ledgers (e.g., AR Control, AP Control)
CONTRA_ACCOUNT	Offset accounts that reduce paired account balances (e.g., Accumulated Depreciation)
SUSPENSE_ACCOUNT	Temporary holding accounts for unidentified or unclassified transactions
INTERCOMPANY_ACCOUNT	Accounts for transactions between related entities in multi-company setups
REVALUATION_ACCOUNT	Accounts for foreign exchange or asset revaluation differences
3.4 Development Specifications
The Page 101 Development Guide provides comprehensive specifications for the Chart of Accounts page implementation. The guide defines the UI layout, API endpoints, state management requirements, and validation rules that govern the Chart of Accounts functionality in HaypBooks.
Route and Access
The Chart of Accounts page is accessible at /accounting/core-accounting/chart-of-accounts and serves as the foundation for all other accounting modules. The page provides a comprehensive view of all accounts organized by type, with support for creation, editing, organization, and deactivation of accounts in a hierarchical tree structure. User roles determine access levels: Admin and Accountant have full access, while Bookkeeper has read-only permissions.
UI Components
The page design includes a sticky header section with action buttons (New Account, Import, Export, Search), summary cards showing Total Accounts, Active Accounts, Total Debits, and Total Credits, and a hierarchical tree table with expandable/collapsible rows. The tree table displays account code, name, type, category, balance, status, and action dropdown menus for each account.
4. Philippine-Specific Chart of Accounts Requirements
4.1 BIR Compliance Considerations
The Bureau of Internal Revenue (BIR) in the Philippines has specific requirements for Chart of Accounts structure that impact how businesses must organize their accounting records. HaypBooks should incorporate these requirements to ensure that users can easily generate compliant financial statements and tax returns without manual adjustments or reclassification of accounts.
•	Tax Account Classification: Separate tracking for VAT-input and VAT-output accounts, withholding tax accounts (EWT, FWT), and percentage tax accounts to support BIR Form preparation
•	Government Contribution Accounts: Dedicated accounts for SSS, PhilHealth, and PAG-IBIG contributions payable and expense accounts
•	13th Month Pay Tracking: Separate expense and liability accounts for 13th month pay accrual and payment
•	Local Tax Accounts: Accounts for Mayor's Permit, Barangay Clearance, Real Property Tax, and Community Tax Certificate
4.2 Recommended Philippine Chart of Accounts Structure
Based on BIR requirements and common Philippine business practices, the following additional accounts and classifications should be incorporated into the standard HaypBooks Chart of Accounts template to ensure comprehensive local compliance.
Table 4: Philippine-Specific Account Categories
Category	Account	Purpose
Liabilities	VAT Payable	Output VAT less Input VAT for BIR Form 2550
Liabilities	EWT Payable	Expanded Withholding Tax withheld from suppliers
Liabilities	SSS Payable	Social Security System contributions
Liabilities	PhilHealth Payable	Philippine Health Insurance contributions
Liabilities	PAG-IBIG Payable	Home Development Mutual Fund contributions
Liabilities	13th Month Pay Payable	Mandatory 13th month pay accrual
Expenses	Input VAT	VAT on purchases for credit against Output VAT
Expenses	EWT Expense	Expanded Withholding Tax expense on income
5. Implementation Recommendations
5.1 Default Chart of Accounts Templates
HaypBooks should provide multiple Chart of Accounts templates optimized for different business types in the Philippines. These templates should incorporate both standard accounting classifications and Philippine-specific accounts to minimize setup time while ensuring compliance.
1.	General Business Template: Comprehensive COA suitable for most small and medium enterprises with standard trading or service operations
2.	Retail Template: Optimized for retail businesses with inventory tracking, multiple payment methods, and point-of-sale integration accounts
3.	Service Business Template: Streamlined COA for professional services, consulting, and other service-oriented businesses
4.	Construction Template: Specialized COA with job costing accounts, progress billing, retention, and construction-specific classifications
5.	Non-Profit Template: Fund accounting structure with restricted and unrestricted fund accounts, donor tracking, and grant management accounts
5.2 Account Numbering System
Implement a standardized account numbering system that follows both international best practices and Philippine conventions. The numbering system should be configurable to allow businesses to customize while providing sensible defaults.
•	Assets (1000-1999): Current assets (1000-1499), Fixed assets (1500-1799), Other assets (1800-1999)
•	Liabilities (2000-2999): Current liabilities (2000-2499), Long-term liabilities (2500-2999)
•	Equity (3000-3999): Owner's equity, retained earnings, and other equity accounts
•	Revenue (4000-4999): Operating revenue (4000-4499), Other income (4500-4999)
•	Expenses (5000-9999): Cost of sales (5000-5999), Operating expenses (6000-8999), Other expenses (9000-9999)
5.3 Import/Export Functionality
Provide robust import and export capabilities to facilitate COA migration from other accounting systems. This is particularly important for businesses transitioning from QuickBooks or other software to HaypBooks.
1.	CSV Import: Support importing Chart of Accounts from CSV files with field mapping capabilities for different source formats
2.	QuickBooks Migration: Dedicated import tool for QuickBooks Chart of Accounts with automatic field mapping and validation
3.	Excel Export: Export COA to Excel with formatting options for review and external reporting
4.	PDF Report: Generate printable COA reports with account balances and hierarchical structure
5.4 Validation and Integrity Controls
Implement comprehensive validation controls to maintain Chart of Accounts integrity and prevent accounting errors.
•	Category Type Validation: Prevent changing category type if account has transactions to maintain financial statement integrity
•	Deactivation Rules: Only allow deactivation of accounts with zero balance and no pending transactions
•	Parent-Child Validation: Prevent circular references in parent-child relationships and ensure proper hierarchy
•	System Account Protection: Protect critical system accounts (AR Control, AP Control, Retained Earnings) from deletion or category changes
5.5 API Implementation
Implement comprehensive REST API endpoints for Chart of Accounts management following the specifications defined in the Page 101 Development Guide.
Table 5: Chart of Accounts API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:id/accounting/accounts	List all accounts
POST	/api/companies/:id/accounting/accounts	Create new account
GET	/api/companies/:id/accounting/accounts/:accountId	Get account details
PUT	/api/companies/:id/accounting/accounts/:accountId	Update account
DELETE	/api/companies/:id/accounting/accounts/:accountId	Deactivate account
GET	/api/companies/:id/accounting/accounts/:accountId/ledger	Get account ledger
GET	/api/companies/:id/accounting/account-types	Get account types
6. Conclusion and Next Steps
The Chart of Accounts serves as the fundamental building block for the entire HaypBooks accounting platform. By combining QuickBooks' proven organizational structure with Philippine-specific enhancements, HaypBooks can deliver a Chart of Accounts experience that meets international accounting standards while addressing local compliance requirements. The existing schema architecture provides a robust foundation with comprehensive support for hierarchical structures, special account types, liquidity classification, and cash flow categorization.
Key implementation priorities include developing intuitive UI components for hierarchical account management, implementing comprehensive import/export functionality for migration scenarios, creating industry-specific templates optimized for Philippine business types, and building robust validation controls that maintain accounting integrity while providing flexibility for business-specific customizations. The API endpoints defined in the development specifications provide a solid foundation for frontend development.
Success in Chart of Accounts implementation will enable all subsequent accounting modules to function correctly, as the COA serves as the classification foundation for every financial transaction recorded in HaypBooks. Careful attention to Philippine-specific requirements during implementation will differentiate HaypBooks from international competitors and provide genuine value to Filipino businesses seeking compliant, user-friendly accounting software designed specifically for their needs.
========================================================================

PART 29 — MISSING PAGES SUPPLEMENT
Coverage Completion: Fixed Assets | Period Close | Planning | Banking Sub-pages | Sales Collections | Expenses Payables | Payroll Secondary | Taxes Secondary | Inventory Secondary | Time Secondary | Reporting Secondary

March 2026 | HaypBooks Technical Documentation
========================================================================

MODULE 1: ACCOUNTING — FIXED ASSETS
The Fixed Assets module manages long-term tangible assets throughout their entire lifecycle — from acquisition and depreciation through revaluation, impairment, and disposal. Fixed assets directly impact financial statements (Balance Sheet, Depreciation Expense on P&L) and must comply with PAS 16 (Property, Plant & Equipment), PAS 36 (Impairment of Assets), and PAS 40 (Investment Property) under Philippine Financial Reporting Standards.

============================
FIXED ASSETS — ASSET MANAGEMENT
============================

1.1 Asset Register Page
Page Route: /accounting/fixed-assets/asset-management/asset-register
Page Goal
The Asset Register is the master list of all fixed assets owned by the company. It is the primary entry point for the Fixed Assets module, showing every asset with its current book value, accumulated depreciation, status, and classification. Users can filter by category, location, department, and status to gain a complete view of the company's capital assets.

Page Layout & Design
Full-width data table with a top toolbar for filters, search, and actions. A summary card strip above the table shows: Total Assets Count, Total Cost, Total Book Value (Net), YTD Depreciation. A side panel opens on row click to show full asset detail without navigating away. Supports grid and card view toggle.

Buttons & Functions
ButtonLocationFunction
Add AssetHeader, primaryOpens new asset entry form (full-page drawer)
Import AssetsHeader, secondaryBulk import from CSV/Excel template
ExportHeader, secondaryExports filtered asset list to CSV/Excel or PDF
Run DepreciationHeader, actionShortcut to initiate depreciation run for selected period
FilterToolbarFilter by category, location, department, cost center, status, method
Bulk ActionsToolbar (on selection)Dispose, Transfer, Revalue, Export selected assets
View / EditRow actionOpen asset detail or edit form
Dispose AssetRow actionInitiates disposal workflow for selected asset
Print Asset TagRow actionGenerates printable asset tag with QR code / barcode
View HistoryRow actionShows full audit log for this asset

Data Table Columns
ColumnData TypeDescription
Asset CodeStringSystem-generated or user-defined unique identifier
Asset NameStringDescriptive name of the asset
CategoryReferenceAsset category (e.g., Buildings, Furniture, IT Equipment)
Acquisition DateDateDate of purchase or capitalization
Original CostDecimalPurchase price including all capitalized costs
Accumulated DepreciationDecimalTotal depreciation charged to date
Book Value (Net)DecimalOriginal Cost minus Accumulated Depreciation
Depreciation MethodEnumStraight-Line / Declining Balance / Units of Production
Useful LifeIntegerTotal useful life in months
Remaining LifeIntegerRemaining months of useful life
LocationReferencePhysical location or branch where asset is kept
StatusEnumActive, Disposed, Fully Depreciated, Under Maintenance, Transferred

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/assetsList all assets with filters and pagination
POST/api/companies/:companyId/assetsCreate new asset
GET/api/companies/:companyId/assets/:idGet single asset with full depreciation schedule
PUT/api/companies/:companyId/assets/:idUpdate asset details
DELETE/api/companies/:companyId/assets/:idSoft-delete / retire asset
GET/api/companies/:companyId/assets/summaryAggregate totals for summary cards
POST/api/companies/:companyId/assets/importBulk import from CSV

Database Models
Primary model: FixedAsset - stores assetCode, name, categoryId, acquisitionDate, acquisitionCost, residualValue, usefulLifeMonths, depreciationMethod, accumulatedDepreciation, bookValue, locationId, departmentId, costCenterId, status, disposalDate, disposalProceeds, notes, attachments. Related models: AssetCategory, AssetLocation, AssetDepreciationSchedule, AssetMaintenanceLog, AssetDisposal, AssetRevaluation, AssetTransfer.

-----------------------------
1.2 New Asset Entry Page
Page Route: /accounting/fixed-assets/asset-management/new-asset-entry
Page Goal
Guided form for recording a new fixed asset into the system. Captures all required information including acquisition details, cost components, depreciation parameters, and GL account mappings. Automatically generates the first depreciation schedule upon save.

Page Layout & Design
Multi-step form wizard with 4 steps: (1) Asset Details, (2) Cost & GL Mapping, (3) Depreciation Setup, (4) Review & Save. Progress indicator at the top. Side-by-side preview of the depreciation schedule updates in real time as user adjusts parameters on Step 3.

Buttons & Functions
ButtonLocationFunction
Next / BackStep navigationAdvance or return between wizard steps
Save as DraftFooterSave incomplete form for later completion
Save & Add AnotherFooter (Step 4)Save and immediately open blank new asset form
Save & ViewFooter (Step 4)Save and navigate to the new asset's detail page
Recalculate ScheduleStep 3Refresh preview depreciation table with current parameters
Add Cost ComponentStep 2Adds line item row for capitalized costs (freight, install, etc.)
Attach DocumentStep 2Upload purchase invoice or receipt as attachment

Form Fields (Step 1 — Asset Details)
FieldTypeRequiredDescription
Asset NameTextYesDescriptive name
Asset CodeTextAuto/manualSystem-generated; can be overridden
CategorySelectYesAsset category (drives default depreciation method)
Sub-categorySelectNoMore specific classification within category
DescriptionTextareaNoAdditional description or notes
Serial Number / TagTextNoManufacturer serial number or internal asset tag
LocationSelectYesPhysical location
DepartmentSelectNoOwning department
Cost CenterSelectNoCost center for depreciation expense allocation
Acquisition DateDateYesDate purchased or placed in service
VendorSelect / TextNoSupplier reference (links to vendor record)

Form Fields (Step 2 — Cost & GL Mapping)
FieldTypeRequiredDescription
Acquisition CostDecimalYesBase purchase price
Cost ComponentsRepeatable rowsNoFreight, installation, commissioning, taxes
Total Capitalized CostCalculated—Sum of all cost components
Asset Account (Dr)Account selectYesFixed asset GL account (e.g., 1500 - Equipment)
Accumulated Deprec. Account (Cr)Account selectYesContra asset account (e.g., 1550 - Accum. Depr. Equipment)
Depreciation Expense AccountAccount selectYesP&L account for depreciation charge

Form Fields (Step 3 — Depreciation Setup)
FieldTypeRequiredDescription
Depreciation MethodSelectYesStraight-Line, Declining Balance (DB), Double DB, Units of Production, Sum-of-Years-Digits
Useful Life (months)IntegerYesNumber of months over which to depreciate
Residual / Salvage ValueDecimalNoEstimated value at end of useful life (default 0)
Depreciation Start DateDateYesFirst period to begin charging depreciation
ConventionSelectNoFull-month, Mid-month, Half-year (default: Full-month)

Backend API Endpoints
MethodEndpointPurpose
POST/api/companies/:companyId/assetsCreate asset and generate initial depreciation schedule
GET/api/companies/:companyId/assets/preview-schedulePreview depreciation schedule (parameters via query string)
GET/api/companies/:companyId/asset-categoriesList categories with default depreciation settings
GET/api/companies/:companyId/assets/next-codeGet next available auto-generated asset code

-----------------------------
1.3 Asset Categories Page
Page Route: /accounting/fixed-assets/asset-management/asset-categories
Page Goal
Manage the classification taxonomy for fixed assets. Asset categories carry default depreciation settings (method, useful life) which are automatically applied when a new asset is created in that category. This page is a configuration/settings page accessed mainly during setup and periodic review.

Buttons & Functions
ButtonLocationFunction
New CategoryHeader, primaryOpens drawer to create new category
EditRow actionEdit category details and defaults
Merge CategoryRow actionMerge this category into another, reassigning all assets
DeleteRow actionDelete category if no assets assigned

Data Table Columns
ColumnData TypeDescription
Category NameStringName of the asset class (e.g., Furniture & Fixtures)
Account Code — AssetReferenceGL account for assets in this category
Account Code — Accum. Depr.ReferenceContra asset GL account
Account Code — Depr. ExpenseReferenceP&L depreciation expense account
Default Depr. MethodEnumDefault depreciation method for new assets
Default Useful Life (months)IntegerDefault useful life when creating assets
Asset CountIntegerNumber of active assets in this category

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/asset-categoriesList all categories
POST/api/companies/:companyId/asset-categoriesCreate category
PUT/api/companies/:companyId/asset-categories/:idUpdate category
DELETE/api/companies/:companyId/asset-categories/:idDelete if no assets

-----------------------------
1.4 Asset Locations Page
Page Route: /accounting/fixed-assets/asset-management/asset-locations
Page Goal
Manage the physical locations where assets are kept (e.g., branches, offices, warehouses). Locations are used for asset tracking, insurance purposes, and location-based reports. Enterprise tier supports location-based cost center mapping.

Data Table Columns
ColumnData TypeDescription
Location NameStringDescriptive name (e.g., Main Office - Makati)
Location CodeStringShort code for reporting
AddressStringFull physical address
Branch / DivisionReferenceAssociated organizational unit
Asset CountIntegerNumber of assets currently at this location
CustodianReferenceEmployee responsible for assets at this location

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/asset-locationsList all locations
POST/api/companies/:companyId/asset-locationsCreate location
PUT/api/companies/:companyId/asset-locations/:idUpdate location
DELETE/api/companies/:companyId/asset-locations/:idDelete if no assets assigned

============================
FIXED ASSETS — DEPRECIATION
============================

1.5 Depreciation Schedules Page
Page Route: /accounting/fixed-assets/depreciation/depreciation-schedules
Page Goal
Displays the full depreciation schedule for any or all assets — period-by-period breakdown of depreciation expense, accumulated depreciation, and ending book value. Users can view by individual asset or view all assets for a selected fiscal period. This is a read-only analysis/review page.

Page Layout & Design
Two-panel layout: left panel for filter controls (asset, category, date range, fiscal year), right panel for the schedule table. Top summary shows: Total Cost, Total Accum. Depr., Total Net Book Value as of selected date. Toggle between Individual Asset view (full schedule per asset) and Consolidated view (one row per period).

Data Table Columns (Asset Schedule View)
ColumnData TypeDescription
PeriodStringFiscal Month / Quarter / Year label
Opening Book ValueDecimalNet book value at start of period
Depreciation ChargeDecimalDepreciation expense for the period
Accumulated DepreciationDecimalCumulative depreciation as of period end
Closing Book ValueDecimalNet book value at end of period
StatusEnumProjected / Posted (has a depreciation run been posted for this period)

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/assets/:id/scheduleFull depreciation schedule for one asset
GET/api/companies/:companyId/assets/schedulesConsolidated schedules with filters
GET/api/companies/:companyId/assets/schedules/exportExport to CSV/Excel

-----------------------------
1.6 Depreciation Runs Page
Page Route: /accounting/fixed-assets/depreciation/depreciation-runs
Page Goal
Execute and manage monthly/periodic depreciation runs. A depreciation run calculates the depreciation expense for all eligible assets in a selected period and posts journal entries to the General Ledger. This is an action-oriented page with a clear workflow: Select Period → Preview → Post.

Page Layout & Design
Top section: Run Configuration panel (period selector, asset filter options, run description). Below: Recent Runs table showing history. When a preview is generated, it expands to show a preview table of all assets and their depreciation charges before posting.

Buttons & Functions
ButtonLocationFunction
Preview DepreciationConfig panelCalculates and displays charges without posting; generates preview table
Post DepreciationPreview panelPosts journal entries for all previewed assets; irreversible action
Reverse RunHistory row actionReverses a posted depreciation run (creates reversing JEs)
View Journal EntryHistory row actionOpens the posted JE associated with this run
Export PreviewPreview panelDownload preview as CSV/Excel before posting

Data Table Columns (Run History)
ColumnData TypeDescription
Run DateDateTimeWhen the run was executed
PeriodStringAccounting period covered
Run ByUser referenceUser who executed the run
Asset CountIntegerNumber of assets included in this run
Total DepreciationDecimalSum of all depreciation charges posted
StatusEnumPreview / Posted / Reversed
Journal EntryReferenceLink to the posted journal entry batch

Backend API Endpoints
MethodEndpointPurpose
POST/api/companies/:companyId/depreciation-runs/previewGenerate preview (not posted)
POST/api/companies/:companyId/depreciation-runs/postPost depreciation run (creates JEs)
POST/api/companies/:companyId/depreciation-runs/:id/reverseReverse a posted run
GET/api/companies/:companyId/depreciation-runsList all runs with pagination

-----------------------------
1.7 Depreciation Reports Page
Page Route: /accounting/fixed-assets/depreciation/depreciation-reports
Page Goal
Dedicated reporting page for depreciation analytics including YTD depreciation by category, depreciation expense trend, tax depreciation vs. book depreciation reconciliation, and future depreciation projection. All reports are exportable.

Report Types Available
ReportDescription
Depreciation SummaryTotal depreciation by category/period, exportable to PDF/Excel
Depreciation Expense LedgerDetailed GL postings for depreciation
Tax vs. Book DepreciationReconciliation of accounting (PFRS) vs. BIR-allowed depreciation
Future Depreciation ProjectionMonthly depreciation forecast for next 1–5 years
Asset Fully DepreciatedList of assets reaching zero book value in current/future periods

============================
FIXED ASSETS — ASSET LIFECYCLE
============================

1.8 Asset Disposals Page
Page Route: /accounting/fixed-assets/asset-lifecycle/asset-disposals
Page Goal
Manage the disposal of fixed assets through sale, scrapping, trade-in, or write-off. The disposal workflow automatically calculates gain or loss on disposal and posts the corresponding journal entry (debit Accum. Depr., debit/credit Gain/Loss on Disposal, credit Asset Account). Compliance with PAS 16 derecognition requirements.

Page Layout & Design
Two-section layout: top section is the pending disposal queue (assets marked for disposal awaiting processing), bottom section is disposal history. Clicking a pending disposal opens a guided disposal form.

Buttons & Functions
ButtonLocationFunction
New DisposalHeader, primarySelect asset(s) and initiate disposal workflow
Process DisposalQueue row actionOpens disposal detail form to enter proceeds and post JE
View JEHistory row actionOpens posted journal entry for this disposal
Undo DisposalHistory row actionReverses disposal if within same period (subject to period lock)
Export HistoryHeader, secondaryExport disposal history to CSV/Excel/PDF

Disposal Form Fields
FieldTypeDescription
AssetReference (read-only)Asset being disposed
Disposal DateDateDate of disposal (must be on or after asset acquisition date)
Disposal MethodEnumSale, Scrap, Donation, Trade-in, Write-off
Sale ProceedsDecimalAmount received (0 for scrap/write-off)
Disposal DescriptionTextareaReason for disposal and notes
Book Value at DisposalCalculatedNet book value as of disposal date (including any partial-period depreciation)
Gain / LossCalculatedSale Proceeds minus Book Value (positive = gain, negative = loss)
Gain/Loss AccountAccount selectGL account for the gain or loss (auto-populated from category settings)

Backend API Endpoints
MethodEndpointPurpose
POST/api/companies/:companyId/assets/:id/disposeRecord and post disposal
POST/api/companies/:companyId/assets/:id/disposal-previewPreview gain/loss calculation
GET/api/companies/:companyId/asset-disposalsList all disposal records
POST/api/companies/:companyId/asset-disposals/:id/reverseReverse disposal

-----------------------------
1.9 Asset Impairments Page
Page Route: /accounting/fixed-assets/asset-lifecycle/asset-impairments
Page Goal
Record impairment losses when an asset's recoverable amount falls below its carrying amount, in accordance with PAS 36. The impairment reduces the asset's book value and records an impairment loss expense. An impairment review history is maintained for each asset.

Buttons & Functions
ButtonLocationFunction
Record ImpairmentHeader, primaryOpens impairment form for asset selection
Reverse ImpairmentRow actionRecord impairment reversal (if recoverable amount recovers under PAS 36)
View JERow actionOpens posted journal entry for the impairment

Impairment Form Fields
FieldTypeDescription
AssetReferenceAsset being impaired
Impairment DateDateDate of impairment assessment
Carrying Amount (before)CalculatedCurrent book value before impairment
Recoverable AmountDecimalHigher of Fair Value less disposal costs or Value in Use
Impairment LossCalculatedCarrying Amount minus Recoverable Amount
Impairment Loss AccountAccount selectP&L expense account for impairment loss
Notes / Assessment BasisTextareaExplanation of how recoverable amount was determined

Backend API Endpoints
MethodEndpointPurpose
POST/api/companies/:companyId/assets/:id/impairRecord impairment
POST/api/companies/:companyId/assets/:id/impairment-reversalReverse prior impairment
GET/api/companies/:companyId/asset-impairmentsList all impairment records

-----------------------------
1.10 Asset Maintenance Page
Page Route: /accounting/fixed-assets/asset-lifecycle/asset-maintenance
Page Goal
Track maintenance activities, scheduled service, and repair costs for fixed assets. Maintenance records help distinguish between capital expenditures (which increase asset value and should be capitalized) and revenue expenditures (routine repairs expensed to P&L).

Buttons & Functions
ButtonLocationFunction
Log MaintenanceHeader, primaryRecord a new maintenance activity
Schedule MaintenanceHeader, secondarySet up recurring maintenance schedule with reminder
Capitalize RepairRow actionConvert a maintenance record into a capitalized improvement (increases asset cost)
Mark CompleteRow action (scheduled)Mark scheduled maintenance as done

Data Table Columns
ColumnData TypeDescription
AssetReferenceAsset the maintenance applies to
Maintenance DateDateDate maintenance was performed or scheduled
TypeEnumPreventive / Corrective / Improvement / Inspection
DescriptionStringWhat was done or will be done
CostDecimalLabor and materials cost
TreatmentEnumExpensed (posted to P&L) / Capitalized (added to asset cost)
Vendor / TechnicianStringWho performed the maintenance
Next Due DateDateWhen next maintenance is scheduled (for recurring)

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/asset-maintenanceList all maintenance records
POST/api/companies/:companyId/asset-maintenanceLog maintenance event
PUT/api/companies/:companyId/asset-maintenance/:idUpdate maintenance record
POST/api/companies/:companyId/asset-maintenance/:id/capitalizeConvert to capital improvement

-----------------------------
1.11 Asset Revaluations Page
Page Route: /accounting/fixed-assets/asset-lifecycle/asset-revaluations
Page Goal
Record upward or downward revaluations of fixed assets to fair value under the Revaluation Model (PAS 16). Revaluation changes are posted to Other Comprehensive Income (Revaluation Surplus) for increases and to P&L for decreases (to the extent that no prior surplus exists for that asset).

Revaluation Form Fields
FieldTypeDescription
AssetReferenceAsset being revalued
Revaluation DateDateEffective date of revaluation
Valuation BasisTextHow fair value was determined (e.g., independent appraiser, market data)
Current Carrying AmountCalculatedBook value before revaluation
Fair Value (New Amount)DecimalAssessed fair value
Revaluation ChangeCalculatedDifference (positive = upward, negative = downward)
Revaluation Surplus AccountAccount selectOCI account for upward revaluation (auto-populated)
Revaluation Expense AccountAccount selectP&L account for downward revaluation (auto-populated)

Backend API Endpoints
MethodEndpointPurpose
POST/api/companies/:companyId/assets/:id/revalueRecord revaluation and post JEs
GET/api/companies/:companyId/asset-revaluationsList all revaluation records

-----------------------------
1.12 Asset Transfers Page (Enterprise)
Page Route: /accounting/fixed-assets/asset-lifecycle/transfers
Page Goal
Manage the transfer of fixed assets between departments, locations, branches, or legal entities within the enterprise. Transfers update the asset's assigned location/department and, in the case of inter-entity transfers, may trigger intercompany accounting entries.

Data Table Columns
ColumnData TypeDescription
AssetReferenceAsset being transferred
Transfer DateDateEffective date of transfer
From Location / DepartmentReferenceSource
To Location / DepartmentReferenceDestination
Transfer TypeEnumInternal (same entity) / Inter-entity
ReasonStringBusiness reason for transfer
Approved ByUser referenceApprover (required for inter-entity transfers)
StatusEnumPending / Approved / Completed

============================
FIXED ASSETS — INSURANCE
============================

1.13 Asset Insurance Page
Page Route: /accounting/fixed-assets/insurance/asset-insurance
Page Goal
Centralized register of insurance policies covering fixed assets. Links each policy to the assets it covers, tracks policy renewal dates, and provides visibility into insured vs. uninsured assets. Ensures the business is never caught with expired coverage on capital assets.

Data Table Columns
ColumnData TypeDescription
Policy NumberStringInsurance policy identifier
InsurerStringInsurance company name
Policy TypeStringFire, All-Risk, Motor, Equipment Breakdown, etc.
Coverage AmountDecimalMaximum sum insured
Premium (Annual)DecimalAnnual premium amount
Effective DateDatePolicy start date
Expiry DateDatePolicy end date (with color-coded expiry warning)
Assets CoveredIntegerCount of assets linked to this policy
StatusEnumActive / Expired / Cancelled

Buttons & Functions
ButtonLocationFunction
New PolicyHeader, primaryAdd new insurance policy record
Link AssetsRow actionSelect assets covered under this policy
Renew PolicyRow actionExtend expiry date and update premium details
ExportHeaderExport insurance register to PDF/Excel

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/asset-insuranceList all policies
POST/api/companies/:companyId/asset-insuranceCreate policy
PUT/api/companies/:companyId/asset-insurance/:idUpdate policy / renew
POST/api/companies/:companyId/asset-insurance/:id/link-assetsLink assets to policy

-----------------------------
1.14 Coverage Tracking Page
Page Route: /accounting/fixed-assets/insurance/coverage-tracking
Page Goal
Asset-centric view of insurance coverage. For each asset, shows which policies cover it, the insured value, and whether coverage is current or expired. Highlights assets with no active insurance coverage. Useful for risk management reviews.

Data Table Columns
ColumnData TypeDescription
Asset NameReferenceAsset being tracked
Asset Book ValueDecimalCurrent net book value
Insured ValueDecimalSum insured for this specific asset
Coverage RatioCalculatedInsured Value / Book Value (alerts if under-insured < 80%)
Active PoliciesIntegerNumber of active policies covering this asset
Coverage StatusEnumFully Covered / Partial Coverage / Uninsured / Expired
Next Renewal DateDateEarliest policy renewal due for this asset

-----------------------------
1.15 Premium Management Page
Page Route: /accounting/fixed-assets/insurance/premium-management
Page Goal
Track insurance premium payment schedules, record premium payments as expenses, and manage premium amortization for annual policies prepaid in full. Links directly to the AP module for premium bill payments.

Data Table Columns
ColumnData TypeDescription
Policy ReferenceReferenceLinked insurance policy
Payment Due DateDateWhen premium payment is due
Amount DueDecimalPremium instalment amount
Prepaid Asset AccountAccount refGL account for prepaid insurance (if annual prepayment)
Expense AccountAccount refGL account for insurance expense
Payment StatusEnumUpcoming / Paid / Overdue
Journal EntryReferenceLink to JE or AP bill for the premium

============================
FIXED ASSETS — REPORTS
============================

1.16 Fixed Asset Schedule Report
Page Route: /accounting/fixed-assets/reports/fixed-asset-schedule
Page Goal
The statutory Fixed Asset Schedule (also called the Fixed Asset Lapsing Schedule) is a comprehensive report showing every asset with its opening balances, additions, disposals, and closing balances for cost and accumulated depreciation for a selected period. This is a required supporting schedule for financial statement preparation and BIR tax compliance.

Report Columns
ColumnDescription
Asset Code / NameAsset identifier and description
CategoryAsset classification
Opening CostCost at start of period
AdditionsNew assets or capitalized improvements in period
Disposals / RetirementsCost removed due to disposal in period
Closing CostCost at end of period
Opening Accum. Depr.Accumulated depreciation at start
Depr. Charge (Period)Depreciation expense for the period
Depr. on DisposalsAccumulated depreciation on disposed assets removed
Closing Accum. Depr.Accumulated depreciation at end of period
Closing Net Book ValueClosing Cost minus Closing Accum. Depr.

Export Options: PDF (formatted for filing), Excel (with formulas), print-friendly layout with company header.

-----------------------------
1.17 Depreciation Summary Report
Page Route: /accounting/fixed-assets/reports/depreciation-summary
Page Goal
Summarizes depreciation expense by period, category, department, and cost center. Provides drill-down from category level to individual asset. Used for month-end close verification and P&L depreciation review.

Filters: Period range, category, location, department, depreciation method.
Display: Summary table with subtotals by category; bar chart showing monthly depreciation trend; pie chart showing depreciation by category.

-----------------------------
1.18 Asset Valuation Report
Page Route: /accounting/fixed-assets/reports/asset-valuation
Page Goal
Shows the current fair value vs. book value of all assets. Particularly relevant for companies using the Revaluation Model (PAS 16) or needing to assess insurance adequacy. Includes revaluation surplus balances per asset.

Report Columns: Asset, Category, Original Cost, Accumulated Depreciation, Book Value, Last Appraised Value, Revaluation Surplus, Date of Last Appraisal.

-----------------------------
1.19 Gain / Loss on Disposal Report
Page Route: /accounting/fixed-assets/reports/gain-loss-on-disposal
Page Goal
Summarizes all disposal transactions within a selected period, showing the book value, proceeds, and resulting gain or loss on each disposal. Used for P&L review and tax return preparation (BIR requires separate treatment of gains/losses on asset disposals).

Report Columns: Asset, Disposal Date, Disposal Method, Original Cost, Accum. Depr. at Disposal, Book Value at Disposal, Proceeds, Gain / (Loss), GL Account Posted To.

========================================================================

MODULE 2: ACCOUNTING — PERIOD CLOSE
The Period Close module provides a structured, checklist-driven workflow for closing an accounting period. It ensures all required tasks (reconciliations, journal entries, accruals, approvals) are completed before a period is locked against further postings. This is a critical control mechanism for financial statement integrity.

============================
PERIOD CLOSE PAGES
============================

2.1 Close Checklist Page
Page Route: /accounting/period-close/close-checklist
Page Goal
The Close Checklist is the command centre for the period-end close process. It lists all required close tasks organized by category (Bank Reconciliation, Subledger Reconciliation, Accruals, Adjustments, Review, Approval), shows their completion status, assigns owners, and tracks due dates. A progress indicator shows overall close completion percentage.

Page Layout & Design
Kanban-style or checklist layout with tasks grouped by category. Top banner shows the current period being closed, overall completion % progress bar, and close status badge (Open / In Progress / Under Review / Locked). Each task card shows: task name, category, assignee, due date, status, and a direct action button.

Buttons & Functions
ButtonLocationFunction
Start Period CloseHeader (if not started)Initiates a new close cycle for the selected period; generates tasks from template
Edit Close TemplateHeader, secondaryCustomize which tasks appear in the checklist
Mark CompleteTask cardMark a task as done (some tasks auto-complete when underlying action is done)
ReassignTask cardChange the assignee for a checklist item
Add Ad-hoc TaskFooter of listAdd a one-off task specific to this close cycle
Request ReviewHeaderNotify reviewers that close tasks are ready for review
Lock PeriodHeader (requires all tasks complete)Locks the accounting period — see Lock Period page

Checklist Item Structure
FieldDescription
Task NameDescriptive name of the close task
CategoryBank Recon / Subledger / Accruals / JE / Report / Approval
AssigneeUser responsible for completing this task
Due DateTarget completion date
StatusNot Started / In Progress / Complete / Blocked / Waived
NotesFree-text notes or blockers
Linked ObjectOptional link to the reconciliation, JE, or report this task corresponds to

Standard Close Tasks (generated automatically)
CategoryTask
Bank ReconciliationReconcile all bank accounts to period-end statement
Bank ReconciliationClear all unmatched bank transactions
SubledgerVerify A/R subledger agrees to GL control account
SubledgerVerify A/P subledger agrees to GL control account
SubledgerVerify Inventory subledger agrees to GL
SubledgerVerify Fixed Asset register agrees to GL
AccrualsPost accrued expenses and prepaid amortization
AccrualsPost depreciation run for the period
AdjustmentsReview and post adjusting journal entries
AdjustmentsPost foreign currency revaluation (if multi-currency)
ReportsGenerate Trial Balance — review for anomalies
ReportsGenerate preliminary P&L and Balance Sheet
ApprovalCFO / Controller review and sign-off
LockLock period in the system

Backend API Endpoints
MethodEndpointPurpose
POST/api/companies/:companyId/period-closeInitialize a new close cycle for a period
GET/api/companies/:companyId/period-closeList all close cycles
GET/api/companies/:companyId/period-close/:idGet current close with all tasks and statuses
PATCH/api/companies/:companyId/period-close/:id/tasks/:taskIdUpdate task status or assignee
POST/api/companies/:companyId/period-close/:id/lockLock the period
POST/api/companies/:companyId/period-close/:id/reopenReopen a locked period (requires elevated permission)

-----------------------------
2.2 Reconciliations Page (Period Close)
Page Route: /accounting/period-close/reconciliations
Page Goal
A subledger-to-GL reconciliation hub dedicated to the period-close workflow. Shows reconciliation status for all control accounts (A/R, A/P, Inventory, Payroll Payable, Tax Payable, Fixed Assets) as of the closing period. Each reconciliation displays the subledger total vs. the GL balance with the variance highlighted.

Data Table Columns
ColumnData TypeDescription
Account NameStringGL control account name and code
GL BalanceDecimalBalance per General Ledger at period end
Subledger BalanceDecimalSum from the corresponding subledger module
VarianceDecimalDifference (GL minus Subledger); red-highlighted if non-zero
StatusEnumReconciled / Variance (needs resolution) / Not Started
Last Reconciled ByUser referenceWho last confirmed this reconciliation
NotesStringExplanation of any variance

Buttons & Functions
ButtonLocationFunction
ReconcileRow actionOpens the detailed reconciliation drill-down for this account
Clear VarianceRow actionMarks variance as investigated and explained (with required note)
Refresh BalancesHeaderRe-fetches current GL and subledger balances
ExportHeaderExport reconciliation status to PDF for sign-off filing

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/period-close/:id/reconciliationsGet all subledger reconciliation statuses
POST/api/companies/:companyId/period-close/:id/reconciliations/:accountId/reconcileMark account as reconciled

-----------------------------
2.3 Adjustments Page (Period Close)
Page Route: /accounting/period-close/adjustments
Page Goal
A focused view of all adjusting journal entries created during the close cycle. Adjustments include accruals, deferrals, depreciation corrections, reclassifications, and year-end entries. Shows entries that have been posted and those still in draft awaiting review.

Data Table Columns
ColumnData TypeDescription
JE ReferenceStringJournal entry reference number
DateDatePosting date
DescriptionStringDescription of the adjustment
TypeEnumAccrual / Deferral / Reclassification / Depreciation / Tax / Other
Debit TotalDecimalTotal debit amount
Credit TotalDecimalTotal credit amount
Posted ByUser referenceUser who posted the entry
StatusEnumDraft / Pending Approval / Posted / Reversed
Reversing EntryBoolean + DateWhether a reversing entry has been scheduled for next period

Buttons & Functions
ButtonLocationFunction
New Adjustment JEHeader, primaryOpens journal entry form pre-loaded for adjustment type
Auto-generate AccrualsHeader, secondarySuggests common accrual entries based on prior periods and open transactions
Post All DraftsHeader, batch actionPosts all draft adjustment JEs in one action
Schedule ReversalRow actionSet a future date for automatic reversal of this entry

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/period-close/:id/adjustmentsList all adjustment JEs for the close period
POST/api/companies/:companyId/journal-entriesCreate new adjusting JE
POST/api/companies/:companyId/journal-entries/:id/reverseSchedule reversing entry

-----------------------------
2.4 Multi-Currency Revaluation Page
Page Route: /accounting/period-close/multi-currency-revaluation
Page Goal
At period end, foreign-currency-denominated account balances (A/R, A/P, bank accounts, loans) must be revalued at the closing exchange rate, and the resulting unrealized FX gain or loss must be recorded per PAS 21. This page runs the revaluation calculation, previews the impact, and posts the corresponding journal entries.

Page Layout & Design
Configuration panel at top: Period end date, exchange rate source (manual input or auto-fetch), accounts scope (all FX accounts or selected). Below: Preview table showing each FX account with its local balance, foreign balance at old rate, foreign balance at new rate, and the revaluation adjustment. Footer: total unrealized FX Gain / Loss for the period.

Buttons & Functions
ButtonLocationFunction
Set Exchange RatesConfig panelEnter or confirm the period-end exchange rates per currency
Preview RevaluationConfig panelRun calculation and show preview table without posting
Post RevaluationPreview panelPost the revaluation journal entries to GL
Reverse RevaluationHistory row actionReverse previously posted revaluation JEs

Data Table Columns (Preview)
ColumnDescription
AccountGL account name and code
CurrencyForeign currency code (USD, EUR, etc.)
Foreign Currency BalanceBalance in the foreign currency
Opening RateExchange rate used in prior period
Closing RatePeriod-end exchange rate
Book Value (Opening Rate)Current PHP equivalent at original rate
Book Value (Closing Rate)PHP equivalent at new period-end rate
Revaluation AdjustmentDifference (unrealized gain or loss)
FX Gain/Loss AccountGL account where the adjustment will be posted

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/period-close/fx-previewGet revaluation preview (rates as query params)
POST/api/companies/:companyId/period-close/fx-revaluationPost revaluation JEs
GET/api/companies/:companyId/exchange-rates/:dateGet exchange rates for a specific date

-----------------------------
2.5 Lock Period Page
Page Route: /accounting/period-close/lock-period
Page Goal
Lock a completed accounting period to prevent any further posting of transactions. Once locked, all journal entries, invoices, bills, payments, and other transactions in that period become read-only. Provides an additional layer of financial control. Requires controller/CFO permission. Shows current lock status of all periods.

Page Layout & Design
Period grid showing the last 24 months with lock status for each. Each period card shows: Month, Year, Status (Open / Locked / Archived), number of transactions posted, and the user who locked it with the lock date. Click a locked period to see the lock details.

Buttons & Functions
ButtonLocationFunction
Lock PeriodPeriod card (Open)Confirms lock action for the selected period (confirmation dialog required)
Unlock PeriodPeriod card (Locked)Available only to Owners/CFO; requires reason; creates audit entry
Lock All Prior PeriodsHeader, emergency actionLocks all periods prior to a selected date in bulk

Period Card Information
FieldDescription
Period LabelMonth YYYY (e.g. February 2026)
Lock StatusOpen / Locked / Archived badge
TransactionsCount of transactions in this period
Locked ByUser who locked the period
Locked OnDate and time of lock
Last ModifiedMost recent transaction edit in this period

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/period-locksList all periods with lock status
POST/api/companies/:companyId/period-locks/:period/lockLock a period
POST/api/companies/:companyId/period-locks/:period/unlockUnlock a period (elevated permission)
GET/api/companies/:companyId/period-locks/check/:dateCheck if a given date is in a locked period

-----------------------------
2.6 Sign-Offs Page
Page Route: /accounting/period-close/sign-offs
Page Goal
Formal sign-off workflow where designated reviewers (Senior Accountant, Controller, CFO) must review and approve the completed period close before the period is locked. Each sign-off level has a defined sequence. Electronic signatures with timestamps create an inalterable audit trail.

Sign-Off Workflow
LevelRoleActions Available
Level 1 — AccountantPreparerSubmit for review; attach Period Close Report
Level 2 — ControllerReviewerApprove or Return with comments
Level 3 — CFO / OwnerFinal ApproverFinal approval required to enable period lock

Data Table Columns
ColumnData TypeDescription
PeriodStringPeriod label
Submitted ByUser referenceWho submitted the close for sign-off
Submitted OnDateTimeTime of submission
ReviewerUser referenceAssigned reviewer at current level
StatusEnumPending / Under Review / Approved / Returned
CommentsTextReviewer comments
Approved OnDateTimeTimestamp of each sign-off level approval
Locked After ApprovalBooleanWhether period was auto-locked after final sign-off

Backend API Endpoints
MethodEndpointPurpose
POST/api/companies/:companyId/period-close/:id/submitSubmit close for sign-off
POST/api/companies/:companyId/period-close/:id/approveApprove (sign off at current level)
POST/api/companies/:companyId/period-close/:id/returnReturn with comments
GET/api/companies/:companyId/period-close/:id/signoffsGet full sign-off history

-----------------------------
2.7 Close Archive Page
Page Route: /accounting/period-close/close-archive
Page Goal
Historical archive of all completed period-close packages. Each archived close contains: the checklist completion report, reconciliation sign-off sheets, adjustment JE listing, the period-end Trial Balance, and the sign-off audit trail. Available for download at any time for audit purposes.

Data Table Columns
ColumnData TypeDescription
PeriodStringMonth / Year of the closed period
Close TypeEnumMonthly / Quarterly / Annual
Close Completed OnDateTimeDate all sign-offs were obtained and period was locked
Closed ByUser referenceFinal approver
Report PackageLinkDownload PDF package of the full close documentation
Re-open RequestsIntegerNumber of unlock requests made for this period (audit trail)

========================================================================

MODULE 3: ACCOUNTING — PLANNING
The Planning module provides budgeting and forecasting tools to help management compare actual financial performance against planned targets.

============================
PLANNING PAGES
============================

3.1 Budgets Page
Page Route: /accounting/planning/budgets
Page Goal
Create, manage, and maintain annual or period-specific operating budgets. Budgets are built at the GL account level and can be broken down by month, quarter, or the full year. Supports top-down budget entry (input full year and system distributes monthly) and bottom-up entry (input each month individually). Supports departmental and project-based budgeting at Enterprise tier.

Page Layout & Design
Budget list view as the default — shows all budgets with their fiscal year, type, status, and coverage. Clicking a budget opens the Budget Editor — a spreadsheet-style grid with accounts as rows and periods as columns. Column totals and row totals auto-calculate. Comparison columns show prior year actuals alongside budgeted amounts.

Buttons & Functions
ButtonLocationFunction
New BudgetHeader, primaryOpens new budget setup dialog (name, fiscal year, method, scope)
Copy BudgetRow actionDuplicate an existing budget (e.g., last year + 10%)
Import BudgetHeader, secondaryImport from Excel using provided template
Export BudgetHeader / editorExport current budget to Excel or CSV
Apply % IncreaseEditor toolbarApply a uniform percentage increase/decrease to all selected accounts
Distribute EvenlyEditor toolbarSplit an annual total evenly across all 12 months
Publish BudgetEditor footerMark budget as Official (read-only published version)
ArchiveRow actionArchive an old budget (hidden from default view)

Budget Editor Grid Columns
ColumnDescription
Account CodeGL account code
Account NameAccount description
TypeRevenue / COGS / Operating Expense / etc.
Jan, Feb… DecOne column per month with editable budget amount
Full Year TotalSum of all monthly amounts (auto-calculated)
Prior Year ActualsRead-only reference column from prior year GL

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/budgetsList all budgets
POST/api/companies/:companyId/budgetsCreate new budget header
GET/api/companies/:companyId/budgets/:idGet budget with all line items
PUT/api/companies/:companyId/budgets/:idUpdate budget
POST/api/companies/:companyId/budgets/:id/linesBulk update budget lines (spreadsheet save)
POST/api/companies/:companyId/budgets/:id/publishPublish budget
GET/api/companies/:companyId/budgets/:id/exportExport budget to Excel

Database Models
Primary model: Budget - stores fiscalYear, name, type (ANNUAL / ROLLING), status (DRAFT / PUBLISHED / ARCHIVED), scope (COMPANY / DEPARTMENT / PROJECT), departmentId, projectId.
BudgetLine - stores budgetId, accountId, month (1-12), year, amount.

-----------------------------
3.2 Budget vs. Actual Page (Enterprise)
Page Route: /accounting/planning/budget-vs-actual
Page Goal
Side-by-side comparison of budgeted amounts against actual GL activity for any selected period or year-to-date. Calculates variance (Actual - Budget) and variance percentage. Highlights accounts with significant variances (configurable threshold). Drill-down from any line to the underlying transactions. Used for management reporting and board presentations.

Page Layout & Design
Full-width spreadsheet grid with account hierarchy (collapsed/expandable). Sticky header with period selector (Month, YTD, Full Year). Color-coded variance column (green = favorable, red = unfavorable, with configurable threshold: e.g., ±10%). Chart panel to the right showing trend line of budget vs. actual month by month.

Data Table Columns
ColumnDescription
Account Code & NameGL account with hierarchy indentation
Budget (Period)Budget amount for selected period
Actual (Period)Actual GL activity for selected period
Variance (Period)Actual minus Budget
Variance %Variance as percentage of Budget
Budget (YTD)Year-to-date budget
Actual (YTD)Year-to-date actual
Variance (YTD)YTD variance
NotesManagement notes explaining major variances

Buttons & Functions
ButtonLocationFunction
Period SelectorHeaderSwitch between Month, YTD, Full Year views
Select BudgetHeaderChoose which published budget to compare against
Add Variance NoteCell actionAttach management comment to a specific account variance
Export ReportHeaderExport to PDF (boardroom-ready) or Excel
Drill DownRow clickShow individual transactions making up the actual amount

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/budgets/:id/vs-actualBudget vs Actual comparison data
GET/api/companies/:companyId/budgets/:id/vs-actual/exportExport formatted report

-----------------------------
3.3 Forecasts Page
Page Route: /accounting/planning/forecasts
Page Goal
Rolling financial forecast that blends year-to-date actuals with forward-looking estimates for remaining periods. Supports driver-based forecasting (e.g., revenue driven by headcount or units sold) and simple manual override forecasting. Used for rolling 12-month P&L and cash flow outlook.

Key Features
•Always current: Actuals auto-populate for completed periods; only future periods are editable
•Multiple forecast scenarios: Create Base, Optimistic, Pessimistic scenarios
•Driver-based rows: Link revenue or expense lines to business drivers (units, headcount, price)
•Variance to budget: Column showing forecast vs. original budget for remaining periods
•Cash flow integration: Forecasted P&L feeds cash flow forecast

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/forecastsList all forecast scenarios
POST/api/companies/:companyId/forecastsCreate new forecast
GET/api/companies/:companyId/forecasts/:idGet forecast with all lines
PUT/api/companies/:companyId/forecasts/:id/linesUpdate forecast lines


========================================================================

MODULE 4: BANKING & CASH — SECONDARY PAGES
Banking & Cash secondary pages expand on the 10 main group pages already documented in Part 4. Each sub-page provides deeper workflows within its respective group.

============================
BANKING — TRANSACTIONS SUB-PAGES
============================

4.1 App Transactions Page
Page Route: /banking-cash/transactions/app-transactions
Page Goal
Displays transactions originating from within the HaypBooks application itself (payments recorded via invoices, bill payments via AP workflows, payroll disbursements, etc.) as opposed to bank-feed imported transactions. Provides a reconciliation bridge between the application ledger and external bank statements.

Data Table Columns
ColumnData TypeDescription
DateDateTransaction date
ReferenceStringSource document reference (e.g., INV-001, BILL-045)
Source ModuleEnumAR / AP / Payroll / Banking / General
DescriptionStringAuto-generated description from source record
AmountDecimalTransaction amount (debit/credit indicator)
Bank AccountReferenceTarget bank account the transaction was posted to
Cleared StatusEnumUncleared / Cleared / Reconciled
Match StatusEnumUnmatched / Matched to Bank Feed / Manual Match

Buttons & Functions
ButtonLocationFunction
Match to Bank FeedRow actionManually link this app transaction to a bank-feed imported transaction
UnmatchRow actionRemove a previously matched link
ClearRow actionMark as cleared on bank statement without a bank feed match
ExportHeaderExport to CSV/Excel for manual bank reconciliation

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/banking/app-transactionsList app-side transactions with filters
POST/api/companies/:companyId/banking/app-transactions/:id/matchMatch to a bank-feed transaction
DELETE/api/companies/:companyId/banking/app-transactions/:id/matchUnmatch

-----------------------------
4.2 Transaction Rules Page
Page Route: /banking-cash/transactions/transaction-rules
Page Goal
Manage automated bank rules that categorize incoming bank-feed transactions on import. Rules evaluate transaction descriptions, amounts, and types to auto-assign GL accounts, payees, classes, and tags. Reduces manual categorization work. Rules execute in priority order; first match wins.

Page Layout & Design
List view of all active and inactive rules, ordered by priority. Drag-handle for priority reordering. Right panel opens when creating or editing a rule, containing the condition builder and action configurator.

Buttons & Functions
ButtonLocationFunction
New RuleHeader, primaryOpens rule builder in right panel
Test RuleRule cardRuns the rule against the last 30 days of transactions to preview matches
Enable / DisableToggle on rule cardActivate or pause a rule without deleting it
DuplicateRow actionCopy rule for similar use case
DeleteRow actionRemove rule permanently
Reorder (drag)Rule card drag handleChange rule execution priority

Rule Builder Components
ComponentDescription
Condition SectionAdd one or more conditions: Field (Description, Amount, T-Type, Account), Operator (contains / equals / starts with / greater than / between), Value; AND/OR logic selector
Action SectionSet Category/Account (required), optionally set Payee, Class, Location, Memo, Tag
Apply ToAll accounts or specific bank accounts
Auto-ConfirmToggle: auto-confirm the categorization (no manual review) or suggest only

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/banking/rulesList rules
POST/api/companies/:companyId/banking/rulesCreate rule
PUT/api/companies/:companyId/banking/rules/:idUpdate rule
DELETE/api/companies/:companyId/banking/rules/:idDelete rule
POST/api/companies/:companyId/banking/rules/:id/testTest rule against recent transactions
POST/api/companies/:companyId/banking/rules/reorderBulk reorder priorities

-----------------------------
4.3 Recurring Transactions Page
Page Route: /banking-cash/transactions/recurring-transactions
Page Goal
Manage recurring bank entries such as standing orders, auto-debits (rent, utilities, subscriptions, loan repayments), and scheduled transfers. Recurring templates automatically generate expected transactions for each period, prompting the user to confirm when the actual bank entry arrives and matches.

Data Table Columns
ColumnData TypeDescription
Transaction NameStringDescriptive name for the recurring item
AccountReferenceBank account the recurring debit/credit appears on
AmountDecimalExpected amount (fixed or estimated)
FrequencyEnumDaily / Weekly / Monthly / Quarterly / Annual
Next Expected DateDateDate when the next occurrence is expected
GL Account / CategoryReferenceExpense or income account to post to
Last MatchedDateMost recent date a bank transaction matched this template
StatusEnumActive / Paused / Ended

Buttons & Functions
ButtonLocationFunction
New RecurringHeader, primaryOpen form to define a new recurring transaction template
EditRow actionModify template details (amount, frequency, account)
Pause / ResumeRow actionTemporarily suspend matching for this template
End RecurringRow actionMark as ended from a specified date
View HistoryRow actionShow all bank transactions that matched this template

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/banking/recurringList recurring templates
POST/api/companies/:companyId/banking/recurringCreate template
PUT/api/companies/:companyId/banking/recurring/:idUpdate template
DELETE/api/companies/:companyId/banking/recurring/:idDelete / end template
GET/api/companies/:companyId/banking/recurring/:id/historyMatch history for template

============================
BANKING — RECONCILIATION SUB-PAGES
============================

4.4 Reconciliation History Page
Page Route: /banking-cash/reconciliation/history
Page Goal
Complete audit history of all completed and in-progress reconciliations for all bank accounts. Each record shows the reconciliation period, ending balance matched, difference at completion, duration, and the user who completed it. Enables management to verify reconciliations are being done regularly and on time.

Data Table Columns
ColumnData TypeDescription
AccountReferenceBank account that was reconciled
Statement DateDateBank statement end date for this reconciliation
Statement Ending BalanceDecimalBank statement closing balance
Cleared Balance (Books)DecimalSum of cleared transactions in the books
Difference at CompletionDecimalShould be 0.00 for fully reconciled; non-zero indicates forced completion
Started ByUser referenceUser who initiated the reconciliation
Completed ByUser referenceUser who finished the reconciliation
Completed OnDateTimeDate and time reconciliation was completed
DurationDurationTime taken from start to completion
Forced CompletionBooleanWhether reconciliation was completed with a non-zero difference
StatusEnumCompleted / Reopened / Voided

Buttons & Functions
ButtonLocationFunction
View ReportRow actionOpen the reconciliation report for this session
ReopenRow actionReopen a completed reconciliation for correction (creates audit entry)
Download PDFRow actionDownload formatted reconciliation report (for file/audit)
Export HistoryHeaderExport all history to CSV/Excel

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/banking/reconciliationsList all reconciliation records with filters
GET/api/companies/:companyId/banking/reconciliations/:idGet single reconciliation details
POST/api/companies/:companyId/banking/reconciliations/:id/reopenReopen reconciliation

-----------------------------
4.5 Statement Archive Page
Page Route: /banking-cash/reconciliation/statement-archive
Page Goal
Central repository for all uploaded bank statements (PDF, CSV, or OFX/QFX files). Statements are linked to their corresponding reconciliation records. Provides a permanent record for audit purposes. Supports OCR extraction to auto-parse PDF statements.

Data Table Columns
ColumnData TypeDescription
AccountReferenceBank account the statement belongs to
Statement PeriodStringMonth / Year of the statement
File NameStringOriginal uploaded file name
File TypeStringPDF / CSV / OFX / QFX / XLSX
Uploaded ByUser referenceWho uploaded the file
Uploaded OnDateTimeUpload timestamp
ReconciliationReferenceLinked reconciliation record (if reconciled)
OCR StatusEnumNot Processed / Extracted / Failed

Buttons & Functions
ButtonLocationFunction
Upload StatementHeader, primaryDrag-and-drop or browse to upload new statement file
OCR ExtractRow actionTrigger OCR parsing to extract transaction data from PDF
ViewRow actionOpen/download the statement file
DeleteRow actionRemove statement (requires confirmation; cannot delete if linked to completed reconciliation)

Backend API Endpoints
MethodEndpointPurpose
POST/api/companies/:companyId/banking/statementsUpload statement file
GET/api/companies/:companyId/banking/statementsList all statements with filters
DELETE/api/companies/:companyId/banking/statements/:idDelete statement
POST/api/companies/:companyId/banking/statements/:id/extractTrigger OCR extraction

-----------------------------
4.6 Reconciliation Reports Page
Page Route: /banking-cash/reconciliation/reports
Page Goal
Reporting hub for all reconciliation analytics: outstanding items (uncleared checks and outstanding deposits), reconciliation status dashboard across all bank accounts, and historical reconciliation summary. Key control tool for CFO/Controller review.

Reports Available
ReportDescription
Outstanding Checks & PaymentsAll uncleared payments older than selected number of days
Deposits in TransitAll uncleared deposits older than selected number of days
Reconciliation Status DashboardLast reconciliation date and current unreconciled item count per account
Reconciliation Summary ReportFor any completed reconciliation: cleared items, outstanding items, balance proof
Bank Balance SummaryCurrent book balance vs. bank balance for all accounts as of today

============================
BANKING — CASH ACCOUNTS SUB-PAGES
============================

4.7 Petty Cash Page
Page Route: /banking-cash/cash-accounts/petty-cash
Page Goal
Manage petty cash funds — small, on-hand cash reserves for minor business expenses. Track the fund balance, record disbursements, replenish the fund (which posts a journal entry debiting various expense accounts and crediting the bank account used to replenish), and perform periodic fund count reconciliations.

Data Table Columns (Transactions)
ColumnData TypeDescription
DateDateTransaction date
DescriptionStringPurpose of the petty cash disbursement
AmountDecimalAmount disbursed
Expense AccountReferenceGL account charged
Received ByStringEmployee who received the cash
Receipt ReferenceStringReceipt or voucher number
ReplenishmentBooleanFlag for fund replenishment entries

Buttons & Functions
ButtonLocationFunction
Record DisbursementHeader, primaryAdd a petty cash payment record
Replenish FundHeader, secondaryGenerate reimbursement JE to bring fund back to float amount
Fund CountHeaderRecord a physical count of the petty cash tin
ExportHeaderExport petty cash log to PDF/Excel

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/banking/petty-cashList petty cash transactions
POST/api/companies/:companyId/banking/petty-cashRecord disbursement
POST/api/companies/:companyId/banking/petty-cash/replenishPost replenishment JE

-----------------------------
4.8 Clearing Accounts Page
Page Route: /banking-cash/cash-accounts/clearing-accounts
Page Goal
Monitor and maintain clearing accounts — temporary holding accounts used when funds are in transit between accounts or modules (e.g., Undeposited Funds, Payroll Clearing, Intercompany Clearing, Tax Clearing). Displays the current balance of each clearing account and the items making up that balance. Alerts when clearing account balances are non-zero at period end.

Data Table Columns
ColumnData TypeDescription
Account NameReferenceGL clearing account name and code
Current BalanceDecimalCurrent balance (should ideally be zero at period end)
Oldest Item AgeIntegerAge in days of the oldest uncleared item
Item CountIntegerNumber of transactions contributing to the balance
StatusEnumClear (zero balance) / Has Balance / Overdue (items > 30 days)

Buttons & Functions
ButtonLocationFunction
Drill DownRow actionShow individual transactions making up the clearing account balance
Clear ItemItem-level actionMatch and clear offsetting items
Post Clearing JEHeaderCreate a journal entry to manually clear a balance
Age AnalysisHeaderShow aging breakdown of all clearing account balances

============================
BANKING — DEPOSITS SUB-PAGES
============================

4.9 Bank Deposits Page
Page Route: /banking-cash/deposits/bank-deposits
Page Goal
Record physical bank deposits — the act of taking cash or checks (from Undeposited Funds) to the bank and recording the deposit into a specific bank account. This workflow clears the Undeposited Funds account and records the increase in the bank account.

Deposit Form Fields
FieldTypeDescription
Deposit DateDateDate the deposit was made at the bank
Bank AccountSelectWhich bank account the deposit was made into
Reference / Deposit Slip #TextBank-issued deposit reference number
Items to DepositMulti-selectSelect from undeposited funds: customer payments, cash receipts, etc.
Total Deposit AmountCalculatedSum of all selected items
NotesTextareaOptional notes

Data Table Columns (Deposit History)
ColumnData TypeDescription
Deposit DateDateWhen deposit was made
Bank AccountReferenceDestination account
Deposit ReferenceStringSlip number or bank reference
Items IncludedIntegerNumber of payment items in this deposit
Total AmountDecimalTotal deposit amount
Prepared ByUser referenceUser who recorded the deposit
StatusEnumPending / Deposited / Matched to Bank Feed

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/banking/depositsList all bank deposits
POST/api/companies/:companyId/banking/depositsCreate bank deposit
PUT/api/companies/:companyId/banking/deposits/:idUpdate unposted deposit
DELETE/api/companies/:companyId/banking/deposits/:idDelete unposted deposit

-----------------------------
4.10 Deposit Slips Page
Page Route: /banking-cash/deposits/deposit-slips
Page Goal
Generate and print formatted bank deposit slips for physical submission to the bank. Pre-populated from the bank deposits module. Supports BDO, BPI, Metrobank, and other major Philippine bank deposit slip formats.

Buttons & Functions
ButtonLocationFunction
Generate Deposit SlipHeader, primarySelect a bank deposit record and generate a formatted slip
PrintPreview actionPrint formatted deposit slip
Download PDFPreview actionDownload as PDF for digital submission

============================
BANKING — BANK FEEDS SUB-PAGES
============================

4.11 Import Rules Page
Page Route: /banking-cash/bank-feeds/import-rules
Page Goal
Configure data transformation rules applied during bank statement import — specifically for CSV/Excel import formats from Philippine banks that don't support direct API feeds. Import rules map bank-specific column names to HaypBooks fields, handle date format variations, and filter out header/footer rows.

Rule Components
ComponentDescription
Source File FormatCSV, Excel, OFX, QFX
Bank / InstitutionWhich bank this rule applies to
Date ColumnColumn index or header name for transaction date
Date FormatDate format string (e.g., MM/DD/YYYY, DD-Mon-YYYY)
Description ColumnColumn for transaction narration
Amount ColumnDebit and credit amount column(s) or single signed amount column
Skip RowsNumber of header rows to skip

Buttons & Functions
ButtonLocationFunction
New Import RuleHeader, primaryOpens rule configuration form
Test RuleRow actionUpload a sample file to verify the rule parses correctly
Set as DefaultRow actionMake default for all imports from this bank
Edit / DeleteRow actionModify or remove rule

-----------------------------
4.12 Feed Status Page
Page Route: /banking-cash/bank-feeds/feed-status
Page Goal
Dashboard showing the health and status of all bank feed connections. Displays last successful sync time, sync frequency, any errors, and account links. Allows users to manually trigger a sync or reconnect a broken feed.

Data Table Columns
ColumnData TypeDescription
InstitutionStringBank or e-wallet name
Account NameReferenceLinked bank account in HaypBooks
Connection TypeEnumDirect API / Plaid / Yodlee / Manual Import
StatusEnumConnected / Disconnected / Error / Pending
Last SyncedDateTimeMost recent successful data pull
Transactions Pulled (Last Sync)IntegerNumber of transactions imported in last sync
Error MessageStringError description if status is Error

Buttons & Functions
ButtonLocationFunction
Sync NowRow actionManually trigger an immediate sync
ReconnectRow action (Error/Disconnected)Re-authenticate the bank connection
DisconnectRow action (Connected)Remove the feed connection
New ConnectionHeader, primaryAdd a new bank feed connection

============================
BANKING — CREDIT CARDS SUB-PAGES
============================

4.13 Card Transactions Page
Page Route: /banking-cash/credit-cards/card-transactions
Page Goal
Dedicated view for credit card transactions imported via bank feed or manual upload. Users review, categorize, and match credit card charges to receipts and expense reports. Mirrors the bank transactions UX but specific to credit card accounts with additional fields for card number and merchant category.

Data Table Columns
ColumnData TypeDescription
Post DateDateDate the charge posted to the card
Transaction DateDateDate of the actual purchase
Merchant NameStringMerchant / payee name from card statement
Merchant CategoryStringMCC-based category (e.g., Restaurants, Travel, Office)
AmountDecimalCharge amount (positive) or credit (negative)
Card / Last 4StringLast 4 digits of the card used
Category (GL)ReferenceAssigned GL expense account
StatusEnumUncategorized / Categorized / Matched to Receipt / Reconciled

Buttons & Functions
ButtonLocationFunction
CategorizeRow action / inlineAssign GL account to a transaction
Match ReceiptRow actionLink uploaded receipt to this card transaction
SplitRow actionSplit across multiple GL accounts or projects
Bulk CategorizeToolbar (multi-select)Apply same category to all selected transactions
Export StatementHeaderExport filtered card transactions to CSV/PDF

-----------------------------
4.14 Card Statements Page
Page Route: /banking-cash/credit-cards/card-statements
Page Goal
Monthly credit card statement view showing the billing cycle summary: opening balance, new charges, payments, credits, and closing balance due. Reconcile all charges on the statement against categorized card transactions. Post the statement balance as a payable for payment tracking.

Data Table Columns
ColumnData TypeDescription
Billing PeriodStringStatement month and year
Card AccountReferenceCredit card account
Opening BalanceDecimalBalance from prior statement
New ChargesDecimalTotal charges this period
Payments/CreditsDecimalTotal payments and credits received
Closing BalanceDecimalBalance due at statement close
Due DateDatePayment due date
CategorizedIntegerNumber of transactions categorized
Total TransactionsIntegerTotal transactions on statement
StatusEnumOpen / Reconciled / Paid

============================
BANKING — CHECKS SUB-PAGES
============================

4.15 Check Printing Page
Page Route: /banking-cash/checks/check-printing
Page Goal
Print checks for vendor payments, employee reimbursements, and other disbursements directly from HaypBooks. Supports MICR-formatted check printing for major Philippine bank check stock. Check register is automatically updated when checks are printed or voided.

Buttons & Functions
ButtonLocationFunction
Select Payments to PrintHeader, primaryChoose from approved bill payments and reimbursements awaiting check printing
Print ChecksPreview actionSend selected checks to printer with check layout preview
Void CheckRow actionVoid a printed check number (creates void entry in register)
ReprintRow actionReprint a check (after confirming the original was destroyed)
Check Number AssignmentConfigSet starting check number alignment to bank check book

Check Print Settings
SettingDescription
Check FormatStandard 3-per-page / Voucher check / Single full-page
Bank AccountBank account associated with the check stock
Starting Check NumberNext check number to assign
Company Name / AddressPre-filled from company settings
Signature LineOptional e-signature image or "Authorized Signature" placeholder

-----------------------------
4.16 Stop Payments Page
Page Route: /banking-cash/checks/stop-payments
Page Goal
Record stop payment requests made to the bank for specific check numbers. Tracks the status of each stop payment request, associated fees, and whether the check was successfully stopped. Links to the check register for complete audit trail.

Data Table Columns
ColumnData TypeDescription
Check NumberStringCheck number for which stop payment was requested
Bank AccountReferenceAccount the check was drawn on
PayeeStringIntended recipient of the check
Check AmountDecimalFace value of the check
Check DateDateOriginal check issue date
Stop Payment DateDateDate stop payment was requested with the bank
FeeDecimalBank fee charged for the stop payment
StatusEnumRequested / Confirmed / Expired / Cleared Anyway
NotesStringRemarks or bank confirmation number

============================
BANKING — CASH MANAGEMENT SUB-PAGES
============================

4.17 Short-Term Cash Forecast Page
Page Route: /banking-cash/cash-management/short-term-forecast
Page Goal
14 to 90-day rolling cash flow forecast based on: current bank balances, upcoming expected receipts (from open AR invoices with due dates), upcoming expected payments (from AP bills and payroll runs), and recurring scheduled transactions. Helps management identify potential cash shortfalls in advance.

Page Layout & Design
Waterfall/bar chart showing projected daily ending cash balance for the forecast period. Below the chart: a detailed day-by-day or week-by-week table showing inflows, outflows, net movement, and ending balance. Color-coded rows: red when projected balance drops below the minimum cash threshold set in settings.

Data Table Columns (Forecast Table)
ColumnDescription
Date / WeekForecast date or week label
Opening BalanceProjected cash balance at start of period
Expected InflowsAR payments due, customer deposits, other expected receipts
Expected OutflowsAP payments due, payroll, recurring expenses, taxes due
Net Cash FlowInflows minus Outflows
Projected Ending BalanceOpening + Net Cash Flow
Variance from Prior ForecastChange vs. last time this forecast was generated (if applicable)

Buttons & Functions
ButtonLocationFunction
Refresh ForecastHeaderRecalculate using latest AR/AP/payroll data
Set Minimum BalanceHeader / SettingsSet the alert threshold for minimum cash balance
Add Manual ItemHeaderAdd a one-off expected cash item not driven by AR/AP
ExportHeaderExport forecast to Excel or PDF for management review
Drill DownRow clickSee individual transactions making up inflows/outflows for that period

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/banking/cash-forecastGenerate cash forecast for date range
POST/api/companies/:companyId/banking/cash-forecast/manual-itemsAdd manual forecast item

-----------------------------
4.18 Cash Flow Projection Page (Enterprise)
Page Route: /banking-cash/cash-management/cash-flow-projection
Page Goal
Long-term (3–18 month) cash flow projection combining the short-term AR/AP forecast with budget-driven estimates for periods beyond the open transaction horizon. Supports what-if scenario analysis. Feeds from the Planning module (Budgets and Forecasts) for revenue and expense projections.

Key Features
•Multi-scenario: Base, Upside, Downside scenarios
•Budget vs. Projected: Built-in comparison of projected cash against budgeted targets
•Sensitivity analysis: Adjust key assumptions (collection days, payment days, sales growth) to see impact
•Graphical and table views

============================
BANKING — TREASURY SUB-PAGES
============================

4.19 Internal Loans Page
Page Route: /banking-cash/treasury/internal-loans
Page Goal
Track loans between related entities, from owners to the company, or between affiliated businesses. Records the loan principal, interest rate, repayment schedule, and all repayment transactions. Automatically generates accrued interest journal entries at period end.

Data Table Columns
ColumnData TypeDescription
Loan ReferenceStringInternal loan identifier
Lender / BorrowerStringParties to the loan (internal entities only)
Principal AmountDecimalOriginal loan amount
Interest RateDecimalAnnual interest rate (%)
Start DateDateDraw-down date
Maturity DateDateScheduled repayment completion date
Outstanding BalanceDecimalCurrent principal balance
Accrued InterestDecimalUnpaid interest accrued to date
StatusEnumActive / Fully Repaid / Overdue / Written Off

-----------------------------
4.20 Credit Lines Page
Page Route: /banking-cash/treasury/credit-lines
Page Goal
Manage revolving credit facilities and term loans from banks. Track available credit, current utilization, interest rates, covenant requirements, and repayment obligations. Provides a treasury dashboard view across all external financing facilities.

Data Table Columns
ColumnData TypeDescription
Facility NameStringBank and loan product name (e.g., BDO Revolving Credit Facility)
Credit LimitDecimalMaximum available facility
Amount DrawnDecimalCurrent outstanding balance
Available CreditDecimalCredit Limit minus Amount Drawn
Interest RateDecimalCurrent applicable interest rate (% p.a.)
Drawdown DateDateDate facility was first utilized
Review / Maturity DateDateFacility review or expiry date
Next Interest DueDateDate of next interest payment
CollateralStringDescription of pledged collateral

-----------------------------
4.21 Payment Approvals Page
Page Route: /banking-cash/treasury/payment-approvals
Page Goal
Approval workflow for high-value payments before they are released for processing. Payments above a configurable threshold require one or more approvers (e.g., any payment above PHP 100,000 requires CFO approval). Integrates with AP Bill Payments and Payroll to intercept large disbursements.

Data Table Columns
ColumnData TypeDescription
Payment ReferenceStringAP payment run or payroll batch reference
PayeeStringRecipient of the payment
AmountDecimalPayment amount
AccountReferenceBank account payment will be made from
Payment TypeEnumVendor Payment / Payroll / Tax Remittance / Loan Repayment
Submitted ByUser referenceUser who initiated the payment
Submitted OnDateTimeTime of submission
Approver(s)User referencesRequired approver(s)
StatusEnumPending Approval / Approved / Rejected / Released
Due DateDateDate payment needs to be executed

Buttons & Functions
ButtonLocationFunction
ApproveRow actionApprove a pending payment (advances to next approval level or releases)
RejectRow actionReject with required comment (payment returned to submitter)
Request InfoRow actionAsk submitter for additional information without rejecting
Bulk ApproveToolbarApprove multiple selected payments at once
View Supporting DocsRow actionOpen linked AP bills, payroll report, or tax computation


========================================================================

MODULE 5: SALES — COLLECTIONS SUB-PAGES
The Collections sub-section handles the post-invoice workflow for managing overdue receivables: write-offs of uncollectable amounts, active collections campaigns, and dunning (automated overdue reminder escalation).

============================
SALES COLLECTIONS PAGES
============================

5.1 Write-Offs Page
Page Route: /sales/write-offs
Page Goal
Manage the write-off of uncollectable customer balances. When a customer invoice is deemed uncollectable (after exhausting collection efforts), the outstanding balance is written off — debiting Allowance for Bad Debts (or Bad Debt Expense directly if no allowance method is used) and crediting Accounts Receivable. This page provides a workflow for identifying candidates, getting approvals, and posting write-offs. Also handles partial write-offs and write-off reversals (if payment is later received on a written-off amount).

Page Layout & Design
Two-tab layout: Pending Write-Offs (candidates identified for write-off, awaiting approval) and Write-Off History (completed write-offs). The pending tab shows aging analysis of overdue amounts to help prioritize which balances to write off.

Buttons & Functions
ButtonLocationFunction
Identify Write-Off CandidatesHeader, primaryRuns AR aging filter to surface invoices overdue by a set number of days (configurable)
New Write-OffHeader, secondaryManual selection of invoice(s) to write off
Approve Write-OffPending tab row actionApprove and post the write-off journal entry
RejectPending tab row actionReturn with comments (does not write off)
Reverse Write-OffHistory row actionReverse a prior write-off when payment is received unexpectedly
ExportHeaderExport write-off history to CSV/PDF for audit

Write-Off Form Fields
FieldTypeDescription
CustomerReference (read-only when from aging)Customer being written off
Invoice(s)Multi-selectOne or more open invoices to include in this write-off
Amount to Write OffDecimalFull invoice balance or partial amount
Write-Off DateDateAccounting date for the transaction
Bad Debt AccountAccount selectBad Debt Expense or Allowance for Bad Debts (based on company method)
Reason / NotesTextareaJustification for writing off this balance

Data Table Columns (Write-Off History)
ColumnData TypeDescription
CustomerReferenceCustomer whose balance was written off
Invoice(s)StringInvoice numbers included
Write-Off DateDateDate of the write-off
Amount Written OffDecimalTotal amount removed from AR
Approved ByUser referenceUser who approved the write-off
StatusEnumPosted / Reversed
Reversal DateDateDate of reversal (if reversed)

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/ar/write-offsList all write-offs
POST/api/companies/:companyId/ar/write-offsCreate write-off (posts JE)
POST/api/companies/:companyId/ar/write-offs/:id/reverseReverse write-off
GET/api/companies/:companyId/ar/write-off-candidatesGet AR aging candidates for write-off

-----------------------------
5.2 Collections Center Page
Page Route: /sales/collections
Page Goal
Centralized workspace for managing the collection of overdue receivables. Provides a prioritized list of customers with overdue balances, collection activity log, next action tracking, communication templates (email/SMS), and collector task assignments. Helps reduce DSO (Days Sales Outstanding) through systematic follow-up.

Page Layout & Design
Split-panel layout: left panel is a customer queue sorted by overdue amount or days overdue (configurable). Right panel shows the selected customer's detail: all overdue invoices, full communication history, aging breakdown, and collector notes. Top summary bar: Total Overdue AR, Customers with Overdue Balances, Average Days Overdue, Collector Task Count.

Buttons & Functions
ButtonLocationFunction
Send ReminderCustomer panelSend overdue payment reminder via email (uses template) to this customer
Log ActivityCustomer panelRecord a collection activity (call made, email sent, promise to pay received)
Create Promise-to-PayCustomer panelRecord a customer's commitment to pay by a specific date
Place on HoldCustomer panelFlag customer account — blocks new invoice creation until balance resolved
EscalateCustomer panelEscalate account to senior collector or manager
Assign CollectorTable row actionAssign a staff member as responsible collector for this account
Bulk Send RemindersHeaderSend batch reminder emails to all selected overdue customers

Data Table Columns (Customer Queue)
ColumnData TypeDescription
CustomerReferenceCustomer name and code
Total OverdueDecimalSum of all overdue invoice balances
Days Oldest Invoice OverdueIntegerDays since the oldest unpaid invoice's due date
Invoices Overdue CountIntegerNumber of overdue invoices
Last Contact DateDateDate of most recent collection activity
Next ActionStringDescription of next scheduled collection step
CollectorUser referenceAssigned collections staff member
StatusEnumOpen / Promise-to-Pay / Disputed / Legal / Escalated / Resolved

Activity Log Structure
FieldDescription
Activity TypeCall / Email / SMS / In-Person / Promise-to-Pay / Legal Notice
Date/TimeWhen the activity occurred
NotesSummary of conversation or correspondence
OutcomeWhat was agreed or outcome of the attempt
Next Action DateWhen to follow up next
Recorded ByStaff member who performed or logged the activity

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/ar/collectionsList collections queue with filters
GET/api/companies/:companyId/ar/collections/:customerIdGet customer collections detail
POST/api/companies/:companyId/ar/collections/:customerId/activitiesLog activity
POST/api/companies/:companyId/ar/collections/:customerId/promise-to-payRecord payment promise
POST/api/companies/:companyId/ar/collections/send-remindersBulk send reminder emails
GET/api/companies/:companyId/ar/collections/dashboardGet collection summary stats

-----------------------------
5.3 Dunning Management Page (Enterprise)
Page Route: /sales/dunning
Page Goal
Automate the overdue payment reminder escalation workflow using configurable dunning sequences. A dunning sequence defines the timing, tone, and channel (email, SMS) of each reminder — typically from polite "friendly reminder" to firm "final notice before legal action." Reduces manual collections effort through systematic automated follow-up.

Page Layout & Design
Two sections: (1) Dunning Templates — lists all dunning sequences with their steps shown in a timeline/visual flow; (2) Active Dunning — customers currently progressing through a dunning sequence with their current step and next scheduled reminder.

Buttons & Functions
ButtonLocationFunction
New Dunning SequenceHeader, primaryCreate a new escalation sequence (name, description, steps)
Add StepSequence editorAdd a reminder step to a sequence (days after due, channel, template)
Assign to CustomerActive dunning actionStart a dunning sequence for a specific customer/invoice
Pause DunningActive dunning actionTemporarily suspend dunning for a customer
Stop DunningActive dunning actionEnd the dunning sequence for a resolved account
Preview EmailStep editorPreview the email template for this dunning step

Dunning Sequence Step Fields
FieldDescription
Step NumberSequence order (e.g., Step 1, Step 2, Step 3)
Days After Due DateTrigger: days after invoice due date (e.g., +3, +14, +30)
Or trigger: days since last stepFor escalating based on no response
ChannelEmail / SMS (SMS requires integration)
Message ToneFriendly / Firm / Final Notice / Legal Warning
Email TemplateChoose from saved communication templates
CC OptionsOptional: CC manager or other contact on escalated steps
Include StatementWhether to attach customer statement PDF to the email

Data Table Columns (Active Dunning)
ColumnData TypeDescription
CustomerReferenceCustomer in dunning
SequenceReferenceWhich dunning sequence is assigned
Current StepIntegerCurrent step number the customer is on
Next Reminder DateDateScheduled date for the next automated reminder
Total OverdueDecimalCurrent overdue balance
Days OverdueIntegerDays since oldest invoice was due
Sequence StatusEnumActive / Paused / Completed / Stopped

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/ar/dunning-sequencesList dunning sequences
POST/api/companies/:companyId/ar/dunning-sequencesCreate sequence
PUT/api/companies/:companyId/ar/dunning-sequences/:idUpdate sequence/steps
POST/api/companies/:companyId/ar/dunning/assignAssign sequence to customer
POST/api/companies/:companyId/ar/dunning/:id/pausePause dunning
POST/api/companies/:companyId/ar/dunning/:id/stopStop dunning
GET/api/companies/:companyId/ar/dunning/activeList all active dunning assignments

========================================================================

MODULE 6: EXPENSES — PAYABLES SUB-PAGES
These pages expand the core Payables section already documented in Part 3. Recurring Bills and Payment Runs are distinct operational workflows within AP.

============================
EXPENSES PAYABLES PAGES
============================

6.1 Recurring Bills Page
Page Route: /expenses/recurring-bills
Page Goal
Manage recurring bill templates for regular vendor obligations such as rent, utilities, subscriptions, insurance premiums, and retainer fees. Recurring bill templates auto-generate draft bill records on a defined schedule, which the user reviews and posts. Eliminates the need to manually create the same bill every month.

Page Layout & Design
List view of all active recurring bill templates. Each template card shows: vendor, amount, frequency, next generation date, GL account, and status. Quick filter by frequency type, vendor, and status. A preview of bills scheduled for the next 30 days is pinned at the top.

Buttons & Functions
ButtonLocationFunction
New Recurring BillHeader, primaryOpens recurring bill setup form
PauseTemplate card actionTemporarily stop auto-generation (bill won't generate until resumed)
ResumeTemplate card actionRestart auto-generation from next scheduled date
Generate NowTemplate card actionImmediately generate the next draft bill from this template
End RecurringTemplate card actionStop the template from generating future bills (set end date)
View Generated BillsTemplate card actionFilter Bills list to show only bills from this template
Edit TemplateTemplate card actionModify amount, frequency, accounts, or other settings

Recurring Bill Template Fields
FieldTypeDescription
VendorReferenceVendor for this recurring bill
Category / GL AccountAccount selectExpense account (e.g., Rent Expense, Utilities)
AmountDecimalFixed amount per occurrence (or estimated, with pre-fill option)
Amount TypeEnumFixed / Estimated (user must confirm amount per occurrence)
FrequencyEnumWeekly / Monthly / Bi-monthly / Quarterly / Semi-annual / Annual
Start DateDateFirst generation date
End DateDateOptional end date (leave blank for indefinite)
Due TermsSelectNumber of days after generation the bill is due
Description / ReferenceTextStandard description to pre-fill on generated bills
Tax CodeReferenceDefault input VAT / withholding tax code
Project / Cost CenterReferenceOptional allocation for generated bills
Auto-PostToggleIf enabled, generated bills are automatically posted (no review step)

Data Table Columns (Template List)
ColumnData TypeDescription
VendorReferenceVendor name
DescriptionStringBrief template description
AmountDecimalPer-occurrence amount (or "Estimated" label)
FrequencyEnumRecurrence interval
Next Generation DateDateWhen the next bill will be created
Last GeneratedDateMost recent generation date
YTD Generated AmountDecimalTotal amount billed via this template year-to-date
StatusEnumActive / Paused / Ended

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/ap/recurring-billsList all recurring bill templates
POST/api/companies/:companyId/ap/recurring-billsCreate template
PUT/api/companies/:companyId/ap/recurring-bills/:idUpdate template
POST/api/companies/:companyId/ap/recurring-bills/:id/pausePause template
POST/api/companies/:companyId/ap/recurring-bills/:id/resumeResume template
POST/api/companies/:companyId/ap/recurring-bills/:id/generateManually generate next bill
DELETE/api/companies/:companyId/ap/recurring-bills/:idEnd/archive template
GET/api/companies/:companyId/ap/recurring-bills/upcomingBills scheduled for next 30 days

Database Models
Primary model: RecurringBill — stores vendorId, templateName, amount, amountType (FIXED/ESTIMATED), frequency, startDate, endDate, glAccountId, taxCodeId, dueDays, autoPost, status, lastGeneratedAt, nextGenerationDate, description. Linked to Vendor, Account, TaxCode.

-----------------------------
6.2 Payment Runs Page
Page Route: /expenses/payment-runs
Page Goal
Batch payment processing for AP bills. A payment run aggregates multiple approved, unpaid bills into a single payment batch — allowing the company to pay many vendors in one operation via bank transfer, check, or online banking. Supports partial payments, on-hold vendors, and generates remittance advices for each vendor.

Page Layout & Design
Three-step workflow view: (1) Select & Configure — choose payment date, payment bank account, payment method, and apply filters (due by date, vendor, minimum amount); (2) Review Bills — table of all bills included with options to exclude specific bills or override payment amounts; (3) Confirm & Process — summary of total payment and vendor count with Post Run button.

Buttons & Functions
ButtonLocationFunction
New Payment RunHeader, primaryStart a new payment run (opens Step 1 configuration)
Save as DraftStep 1–2 actionSave current run config without processing
Process RunStep 3 actionPost payment entries and mark bills as paid; generates remittance advices
Send RemittancesAfter processEmail remittance advices to all vendors in the run
Exclude BillStep 2 row actionRemove a specific bill from the current run
Override AmountStep 2 row actionPay a partial amount on a bill in this run
Put Vendor On HoldStep 2 row actionSkip all bills for a specific vendor in this run

Payment Run Configuration Fields
FieldTypeDescription
Run Name / ReferenceTextInternal reference for this payment batch
Payment DateDateDate payments will be made (affects GL posting date)
Bank AccountSelectAccount from which payments will be disbursed
Payment MethodEnumBank Transfer / Check / Online Banking / GCash / PayMaya
Pay Bills Due ByDateFilter: include only bills with due dates on or before this date
Include Early Payment DiscountsToggleApply discount terms where discount window is still open
Minimum Payment AmountDecimalExclude bills below this amount threshold
Include On-Hold VendorsToggleWhether to include bills for vendors flagged on-hold

Data Table Columns (Review Bills — Step 2)
ColumnData TypeDescription
VendorReferenceVendor name
Bill ReferenceStringBill number(s) being paid
Bill DateDateOriginal bill date
Due DateDatePayment due date
Bill AmountDecimalTotal bill amount
Amount OwingDecimalRemaining unpaid balance
Payment AmountDecimalAmount to pay in this run (editable for partial payment)
DiscountDecimalEarly payment discount applied (if applicable)
Net PaymentDecimalPayment Amount minus Discount
IncludedCheckboxWhether this bill is included in the run

Data Table Columns (Payment Run History)
ColumnData TypeDescription
Run ReferenceStringPayment run identifier
Payment DateDateDate payments were processed
Bank AccountReferenceDisbursement account used
Payment MethodEnumTransfer / Check / Online
Vendor CountIntegerNumber of vendors paid
Bill CountIntegerTotal bills settled in this run
Total AmountDecimalTotal disbursed in this run
Processed ByUser referenceUser who executed the run
StatusEnumDraft / Processed / Reversed / Partially Reversed

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/ap/payment-runsList all payment runs
POST/api/companies/:companyId/ap/payment-runsCreate payment run
GET/api/companies/:companyId/ap/payment-runs/:idGet run with bill detail
PUT/api/companies/:companyId/ap/payment-runs/:idUpdate draft run
POST/api/companies/:companyId/ap/payment-runs/:id/processProcess/post the payment run
POST/api/companies/:companyId/ap/payment-runs/:id/reverseReverse a processed run
POST/api/companies/:companyId/ap/payment-runs/:id/send-remittancesSend remittance advices
GET/api/companies/:companyId/ap/payment-runs/previewPreview bills eligible for a run (based on filter params)

Database Models
Primary model: PaymentRun — stores name, paymentDate, bankAccountId, paymentMethod, status, totalAmount, vendorCount, processedAt, processedBy. Related model: PaymentRunLine — stores paymentRunId, billId, vendorId, billAmount, paymentAmount, discountAmount, netPayment, isIncluded.


========================================================================

MODULE 7: PAYROLL & WORKFORCE — SECONDARY PAGES
The secondary Payroll & Workforce pages expand the core 5 pages (Employees, Leave Requests, Payroll Runs, Salary Structures, Tax Withholding) documented in Part 5. They cover the full workforce management lifecycle including contracts, hiring, time management, payroll processing variants, compensation administration, and Philippine government contribution remittances.

============================
PAYROLL — WORKFORCE MANAGEMENT
============================

7.1 Employment Contracts Page
Page Route: /payroll-workforce/workforce/employment-contracts
Page Goal
Store and manage employee employment contracts. Track contract type (Regular, Probationary, Project-based, Contractual), probationary end dates, contract renewal reminders, and contract document attachments. Automatically flags probationary employees approaching regularization or contract expiry.

Data Table Columns
ColumnData TypeDescription
EmployeeReferenceEmployee name and ID
Contract TypeEnumRegular / Probationary / Project-based / Contractual / Part-time / Consultant
Start DateDateContract commencement date
End Date / Regularization DateDateContract end or scheduled regularization date
Days to Expiry / RegularizationIntegerCountdown in days (color-coded: red < 30 days)
Salary RateDecimalContracted salary (removed from main view; accessible in detail)
Notice PeriodIntegerRequired notice period in days
Contract DocumentAttachmentPDF of signed employment contract
StatusEnumActive / Expired / Terminated / Regularized

Buttons & Functions
ButtonLocationFunction
New ContractHeader, primaryCreate a new employment contract record for an employee
Renew ContractRow actionExtend or modify an expiring contract
RegularizeRow action (Probationary)Convert probationary employee to regular status
TerminateRow actionRecord contract termination
Upload ContractRow actionAttach signed contract PDF
Send for e-SignatureRow actionSend contract for digital signature (if e-signature integration enabled)

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/payroll/contractsList all contracts
POST/api/companies/:companyId/payroll/contractsCreate contract
PUT/api/companies/:companyId/payroll/contracts/:idUpdate / renew contract
POST/api/companies/:companyId/payroll/contracts/:id/regularizeProcess regularization
GET/api/companies/:companyId/payroll/contracts/expiringGet contracts expiring within N days

-----------------------------
7.2 Job Positions Page
Page Route: /payroll-workforce/workforce/job-positions
Page Goal
Manage the company's organizational job positions / job titles hierarchy. Job positions define the role (e.g., Senior Accountant, HR Manager, Sales Executive), the department, job level, and compensation band. Employees are hired into a position. Supports headcount planning at the Enterprise tier.

Data Table Columns
ColumnData TypeDescription
Position TitleStringOfficial job title
DepartmentReferenceOwning department
Job Level / GradeStringLevel within hierarchy (e.g., L3 / Manager / Senior)
Salary Band (Min-Max)Decimal rangeCompensation range for this position
Headcount AuthorizedIntegerNumber of approved positions for this title (ENT)
Headcount FilledIntegerCurrently hired and active employees in this position
Open VacanciesIntegerAuthorized minus Filled
Report ToReferencePosition this role reports to (org chart linkage)
StatusEnumActive / Inactive

-----------------------------
7.3 Employee Documents Page
Page Route: /payroll-workforce/workforce/employee-documents
Page Goal
Centralized document repository for all employee-related files: government IDs, SSS/PhilHealth/Pag-IBIG numbers and cards, BIR TIN, HDMF (Pag-IBIG) forms, pre-employment medical certificates, training certificates, disciplinary records, and performance appraisals. Documents are linked to specific employees with expiry tracking for documents that need renewal.

Key Features
•Document type library with standard Philippine employment document categories
•Expiry date tracking with email reminders before documents expire (medical certs, work permits for foreign nationals)
•Version management — keep history of renewed documents
•Secure access controls: HR-only for sensitive documents
•Bulk upload with document type tagging

Data Table Columns
ColumnData TypeDescription
EmployeeReferenceEmployee the document belongs to
Document TypeEnumGovernment ID / Tax / SSS / PhilHealth / Pag-IBIG / Medical / Contract / Certificate / Other
Document NameStringDescriptive name
Issue DateDateWhen document was issued
Expiry DateDateWhen document expires (null for non-expiring)
StatusEnumValid / Expiring Soon (< 30 days) / Expired / Superseded
Uploaded ByUser referenceWho uploaded the file
FileAttachmentLink to download the document

-----------------------------
7.4 Contractor Management Page
Page Route: /payroll-workforce/workforce/contractor-management
Page Goal
Manage independent contractors, freelancers, and service providers who are not regular employees. Track contractor agreements, payment terms, service periods, and tax withholding obligations (expanded withholding tax / EWT under BIR rules). Contractors appear in the Expenses module for payment (AP billing) but are tracked here for workforce visibility.

Data Table Columns
ColumnData TypeDescription
Contractor NameStringIndividual or company name
Service DescriptionStringNature of contracted services
Contract Start / EndDateService period
Rate / Project PriceDecimalAgreed rate (hourly/daily/fixed)
Tax ID (TIN)StringBIR TIN for withholding compliance
EWT RateDecimalExpanded withholding tax rate applicable (%)
Total Paid YTDDecimalYear-to-date payments
BIR 2307 IssuedBooleanWhether a Certificate of Creditable Tax Withheld (2307) has been issued
StatusEnumActive / Completed / Terminated

-----------------------------
7.5 Recruitment Page (Enterprise)
Page Route: /payroll-workforce/workforce/recruiting
Page Goal
Basic recruitment pipeline tracker for open positions. Track job requisitions, applicant stages (Applied, Screening, Interview, Offer, Hired), and convert successful candidates directly to new employee records. Integrates with Job Positions for authorized headcount tracking.

Key Features
•Job requisition form linked to authorized job positions
•Kanban pipeline view: Applied → Screened → Interviewed → Offer Made → Hired / Rejected
•Basic applicant database with contact info and resume attachment
•One-click convert to employee on hire
•Headcount check: blocks requisition if position is already filled (unless override authorized)

============================
PAYROLL — TIME & LEAVE
============================

7.6 Leave Balances Page
Page Route: /payroll-workforce/time-leave/leave-balances
Page Goal
View and manage leave balance entitlements for all employees. Shows each employee's entitlement per leave type (Vacation Leave, Sick Leave, Service Incentive Leave, Paternity/Maternity, Bereavement, Emergency Leave) against their used, scheduled, and remaining balances. HR can manually adjust balances, carry over unused leaves, and process leave encashment.

Page Layout & Design
Employee list with expandable rows showing balance breakdown by leave type. Top filter: department, employee, leave type. Summary cards: Total Employees with Leave Balance, Employees with Zero VL Remaining, Total Pending Leave Requests. Option to switch between individual view (one row per employee with sub-rows for leave types) and leave type view (one row per leave type with employee drill-down).

Data Table Columns
ColumnData TypeDescription
EmployeeReferenceEmployee name and ID
Leave TypeEnumVL / SL / SIL / Paternity / Maternity / Bereavement / Emergency / Custom
YearIntegerLeave year the balance applies to
Opening BalanceDecimalBalance at start of year (or hire date)
AccruedDecimalEarned/accrued during the year
Availed/TakenDecimalUtilized leaves
ScheduledDecimalApproved leave requests not yet taken
Remaining BalanceDecimalNet remaining (Opening + Accrued - Taken - Scheduled)
Carry ForwardDecimalBalance carried from prior year (if carry forward policy enabled)
Monetized / EncashedDecimalLeaves encashed in lieu of use

Buttons & Functions
ButtonLocationFunction
Adjust BalanceRow actionManual HR adjustment with reason (positive or negative)
Process Carry ForwardHeader, batch actionApply carry-forward policy to all employees at year end
Process EncashmentRow action / batchCalculate monetary value of leave encashment and post to payroll
Export BalancesHeaderExport leave balance summary to Excel/PDF

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/payroll/leave-balancesList all leave balances
GET/api/companies/:companyId/payroll/leave-balances/:employeeIdOne employee's full balance
POST/api/companies/:companyId/payroll/leave-balances/adjustManual adjustment
POST/api/companies/:companyId/payroll/leave-balances/carry-forwardYear-end carry forward
POST/api/companies/:companyId/payroll/leave-balances/encashmentProcess encashment

-----------------------------
7.7 Holiday Calendar Page
Page Route: /payroll-workforce/time-leave/holiday-calendar
Page Goal
Manage the company's official holiday schedule for the year: national regular holidays, special non-working holidays, local government unit (LGU) holidays (Philippine context), and company-specific paid holidays. The holiday calendar drives payroll calculations (holiday pay, rest day premiums) and leave request validation.

Philippines Holiday Pay Rules (built-in logic reference)
Holiday TypePay Rule
Regular Holiday (e.g., Araw ng Kagitingan, Christmas)Absent: 100% regular pay; Worked: 200% of daily rate
Special Non-Working Holiday (e.g., Ninoy Aquino Day)Absent: No pay (no work, no pay); Worked: 130% of daily rate
Rest Day + Regular HolidayWorked: 260% of daily rate
Rest Day + Special Non-Working HolidayWorked: 150% of daily rate

Data Table Columns
ColumnData TypeDescription
Holiday NameStringOfficial name of the holiday
DateDateCalendar date
Holiday TypeEnumRegular Holiday / Special Non-Working / Local / Company
LGU / ScopeStringWhich location/city this holiday applies to (for LGU holidays)
Pay MultiplierDecimalAuto-calculated based on holiday type (editable for custom company holidays)
RecurringBooleanWhether this holiday repeats annually on the same date/rule
ActiveBooleanWhether this holiday is in effect this year

Data Model Note: The system should pre-load BIR-issued Proclamation holidays for the current year and allow the user to add LGU and company-specific holidays. Annual reset with copy-forward from prior year.

-----------------------------
7.8 Overtime Rules Page
Page Route: /payroll-workforce/time-leave/overtime-rules
Page Goal
Configure overtime (OT) pay policies in compliance with Philippine Labor Code. Define OT thresholds, multipliers, approval requirements, and which employee types (rank-and-file, managerial) are eligible for OT pay. Rules drive automatic OT premium calculation in payroll processing.

Philippine Labor Code OT Rules (defaults)
Overtime TypePremium Rate
Ordinary Day OTRegular pay + 25% of hourly rate for every hour worked beyond 8 hours
Rest Day OTRegular pay + 30% of hourly rate (on top of rest day rate of 130%)
Regular Holiday OTRegular pay + 30% of holiday rate (200%)
Night Shift Differential (10PM–6AM)+10% of applicable hourly rate
Night Shift OT+10% on OT rate

Configuration Fields
FieldDescription
OT Threshold (hours/day)Hours of regular work before OT kicks in (default: 8)
Maximum OT per DayCap on overtime hours per day (optional)
Maximum OT per WeekCap on overtime hours per week (optional)
Employee Types EligibleWhich employment types qualify for OT pay (typically rank-and-file; field/managerial may be excluded)
OT Approval RequiredWhether OT claims require manager approval before payroll inclusion
Night Differential ThresholdStart and end time for night differential computation (default: 10PM–6AM)

-----------------------------
7.9 Shift Scheduling Page (Enterprise)
Page Route: /payroll-workforce/time-leave/shift-scheduling
Page Goal
Enterprise shift scheduling for businesses with multiple shifts or non-standard work schedules (e.g., manufacturing, BPO, retail). Define shift templates (Day, Mid, Night, flexi), assign employees to shifts, manage shift swaps, and export schedules for HR posting.

Key Features
•Weekly/monthly calendar view for department or team schedule
•Drag-and-drop shift assignment
•Shift swap requests and approvals
•Automated conflict detection (double-booking, insufficient rest between shifts)
•Export schedule to PDF for team posting

============================
PAYROLL — PAYROLL PROCESSING SECONDARY
============================

7.10 Off-Cycle Payroll Page
Page Route: /payroll-workforce/payroll-processing/off-cycle-payroll
Page Goal
Process payroll for employees who need to be paid outside the regular payroll schedule — typically for final pay (separation), bonus payments, commission payouts, retroactive adjustments, or corrections to prior payroll. Off-cycle runs follow the same calculation engine as regular payroll but apply only to selected employees.

Buttons & Functions
ButtonLocationFunction
New Off-Cycle RunHeader, primarySelect employees and type of off-cycle payment
PreviewRun setupCalculate off-cycle amounts before posting
Post Off-CyclePreview pagePost entries and mark for payment; generates payslips
Export PayslipsAfter postPDF payslips for all included employees

Off-Cycle Run Types
TypeDescription
Final PayComplete clearance computation: last pay, unpaid leaves, 13th month pro-rata, separation pay (if applicable); deduct remaining company loans
Ad-Hoc BonusOne-time bonus payment subject to tax withholding
Commission PayoutVariable pay for sales staff based on commission computation
Retroactive AdjustmentBack-pay for salary corrections, rate changes effective in prior periods
Payroll CorrectionCorrect an error in a prior regular payroll run

-----------------------------
7.11 Payroll Adjustments Page
Page Route: /payroll-workforce/payroll-processing/payroll-adjustments
Page Goal
Manage adjustments that will be included in the next regular payroll run: salary corrections, leave without pay deductions, retroactive items, and one-off additions or deductions identified between pay periods. Adjustments are queued here and auto-applied to the next payroll run for the affected employees.

Data Table Columns
ColumnData TypeDescription
EmployeeReferenceEmployee receiving the adjustment
TypeEnumAddition / Deduction
ReasonStringDescription of the adjustment (e.g., "Salary Correction - March", "LWOP Day 24")
AmountDecimalAdjustment amount
ComponentReferenceWhich salary component this affects (Basic, Allowance, Deduction, etc.)
Apply In PeriodStringTarget payroll period for this adjustment
Approved ByUser referenceApproving manager
StatusEnumPending / Approved / Applied / Cancelled

-----------------------------
7.12 Bonuses & Commissions Page
Page Route: /payroll-workforce/payroll-processing/bonuses-commissions
Page Goal
Configure, compute, and manage bonus and commission structures. Supports 13th month pay computation (mandatory Philippines), performance bonuses, and sales commissions based on configurable formulas.

Key Features
13th Month Pay:
•Automatic computation per DOLE rules: total basic pay earned in the year / 12
•Mid-year and year-end release tracking
•Prorated for new hires and resigned employees
•Philippine law: minimum 1/12 of total basic salary; non-taxable up to PHP 90,000

Commission Structures:
•Link commissions to Sales module performance (AR invoices/collections)
•Tiered commission rates (e.g., 2% on first PHP 500K, 3% on excess)
•Commission approval workflow before payout
•Commission statement report per salesperson

-----------------------------
7.13 Final Pay Page
Page Route: /payroll-workforce/payroll-processing/final-pay
Page Goal
Process the final pay computation for separated employees (resigned, terminated, retrenched). Philippine law: final pay must be released within 30 days of separation. The Final Pay module computes all entitlements and deductions to produce the net final pay amount and Certificate of Final Pay.

Final Pay Components (Philippine-compliant)
ComponentRule
Last Pay (unpaid salary)Basic salary for days actually worked in final period
Pro-rated 13th Month PayDOLE formula: total basic pay year to date / 12
Unused Service Incentive Leaves (SIL)Monetized at daily rate; up to 5 days SIL mandated by DOLE
Separation Pay (if applicable)Per DOLE rules: 1/2 month per year of service (retrenchment) or 1 month per year (redundancy)
Unpaid AllowancesAny unprocessed allowances due
DeductionsRemaining company loans, salary advances, unreturned assets, SSS/PhilHealth/Pag-IBIG final contributions
Tax Computation (BIR)Annualized tax computation for the year (to determine exact BIR withholding on final pay)

Buttons & Functions
ButtonLocationFunction
Initiate Final PayHeader, primarySelect employee; requires separation details (date, reason, separation type)
Compute Final PaySetup stepRun calculation with editable component amounts
Generate Certificate of Final PayAfter postingDOLE-required document (Certificate of Final Pay and/or Quitclaim)
Post Final PayPreview stepPost to payroll ledger and generate payslip
Generate BIR 2316After postingBIR Form 2316 (Certificate of Compensation Payment) for the year

-----------------------------
7.14 Payroll Approvals Page
Page Route: /payroll-workforce/payroll-processing/payroll-approvals
Page Goal
Approval workflow for payroll runs before disbursement. After the payroll run is computed and reviewed, it enters an approval queue. Designated approvers (Payroll Manager, CFO, Owner) review the run summary and payslips before approving disbursement. Multi-level approval is supported for large payroll amounts.

Data Table Columns
ColumnData TypeDescription
Payroll Run ReferenceStringRun identifier and period label
Pay PeriodStringe.g., "March 1-15, 2026"
Run TypeEnumRegular / Off-Cycle / 13th Month / Bonus
Employee CountIntegerNumber of employees in this run
Gross PayrollDecimalTotal gross pay before deductions
Net PayrollDecimalTotal net amount to be disbursed
Prepared ByUser referenceUser who computed and submitted for approval
Submitted OnDateTimeWhen submitted to approval queue
Current ApproverUser referenceWho needs to approve at current level
StatusEnumDraft / Pending Review / Pending Approval / Approved / Released / Reversed

-----------------------------
7.15 Payroll History Page
Page Route: /payroll-workforce/payroll-processing/payroll-history
Page Goal
Complete archive of all processed payroll runs. Provides drill-down access to individual payslips, payroll summary reports, journal entries, and bank file exports. Used for payroll audits, reprinting payslips, and year-end payroll reconciliation.

Data Table Columns
ColumnData TypeDescription
Pay PeriodStringPeriod covered
Run TypeEnumRegular / Off-Cycle / Bonus / 13th Month / Final Pay
Processed OnDateTimeDate payroll was posted
Processed ByUser referenceUser who posted the run
Employee CountIntegerNumber of employees paid
Total Gross PayDecimalTotal gross payroll
Total Government DeductionsDecimalSSS + PhilHealth + Pag-IBIG + Withholding Tax total
Total Net PayDecimalNet cash disbursed
Journal EntryReferenceLink to the GL journal entry batch
Bank FileDownload linkPayroll disbursement bank file (if generated)

============================
PAYROLL — COMPENSATION MANAGEMENT
============================

7.16 Allowances Page
Page Route: /payroll-workforce/compensation/allowances
Page Goal
Manage employee allowance entitlements: transportation, meal, communication, housing, representation, medical — both taxable and non-taxable (per BIR de minimis benefits rules). Configure whether allowances are fixed, variable, or receipt-based. Assign allowances to employees individually or by employee group.

De Minimis Benefits (BIR — non-taxable thresholds)
BenefitMaximum Non-Taxable (Annual)
Rice SubsidyPHP 2,000 / month (PHP 24,000 / year)
Meal AllowancePHP 1,000 / month (PHP 12,000 / year) — if provided for overtime
Clothing Allowance (Uniform)PHP 6,000 / year
Medical Cash AllowancePHP 750 / month (PHP 9,000 / year)
Christmas / Anniversary IncentiveIncluded in PHP 90,000 13th month + other benefits cap

Data Table Columns
ColumnData TypeDescription
Allowance NameStringDescriptive name (e.g., Transportation Allowance, Housing Allowance)
Allowance TypeEnumFixed Monthly / Variable / Reimbursement / In-Kind
TaxabilityEnumNon-Taxable (De Minimis) / Taxable / Partially Taxable
Amount / CapDecimalMonthly amount (fixed) or maximum monthly cap (variable/reimbursement)
BIR CapDecimalBIR non-taxable limit per year for this benefit type
GL AccountReferencePayroll expense account for this allowance
Employees AssignedIntegerNumber of employees currently receiving this allowance

-----------------------------
7.17 Deductions Page
Page Route: /payroll-workforce/compensation/deductions
Page Goal
Manage voluntary and involuntary payroll deductions beyond government mandates: company loans, salary advances, cooperative contributions, union dues, health insurance premiums (HMO), life insurance, and other employer-approved deductions. Each deduction has an amortization schedule and a GL account to receive the credit.

Data Table Columns
ColumnData TypeDescription
Deduction NameStringName of the deduction type
Deduction TypeEnumLoan Repayment / Salary Advance / Insurance / Union Dues / Cooperative / Garnishment / Other
Collection MethodEnumFixed Amount Per Period / Percentage of Basic Pay / Until Fully Recovered
GL Credit AccountReferenceLiability or asset account credited when deduction is collected
Active EmployeesIntegerCount of employees currently subject to this deduction

-----------------------------
7.18 Loans Page
Page Route: /payroll-workforce/compensation/loans
Page Goal
Track company loans to employees: cash advance, salary loans, emergency loans, and HDMF/SSS salary loans administered by the employer. Records loan principal, amortization schedule, deductions per payroll, outstanding balance, and full repayment.

Data Table Columns
ColumnData TypeDescription
EmployeeReferenceBorrowing employee
Loan TypeEnumCash Advance / Salary Loan / Emergency Loan / SSS Salary Loan / HDMF Calamity Loan
Date GrantedDateWhen the loan was approved and disbursed
Loan AmountDecimalOriginal principal
Amortization per PeriodDecimalDeduction amount per payroll period
Outstanding BalanceDecimalRemaining unpaid principal
Expected Payoff DateDateBased on current amortization schedule
StatusEnumActive / Fully Paid / Defaulted / Waived

Buttons & Functions
ButtonLocationFunction
New LoanHeader, primaryRecord loan grant to an employee
Generate ScheduleRow actionPreview full amortization schedule
Adjust AmortizationRow actionChange per-period deduction amount
Waive BalanceRow actionWrite off remaining balance (with approval and reason)
Export Loan RegisterHeaderExport full loan register to Excel

-----------------------------
7.19 Benefit Plans Page (Enterprise)
Page Route: /payroll-workforce/compensation/benefit-plans
Page Goal
Manage group benefit programs such as HMO (Health Maintenance Organization), group life insurance, dental plans, and education assistance. Assigns benefit plans to employee groups (by level, department, or individual), tracks cost sharing (employer vs. employee contribution), and generates premium deduction schedules.

Key Features
•Plan catalog with carrier, coverage details, and cost
•Employee enrollment / un-enrollment workflow
•Employer and employee cost split configuration
•Premium due dates and remittance tracking (links to AP for employer premium payments)
•Dependent registration (for HMO plans that cover dependents)

============================
PAYROLL — PAYROLL TAXES & GOVERNMENT CONTRIBUTIONS
============================

7.20 Government Contributions Page
Page Route: /payroll-workforce/payroll-taxes/government-contributions
Page Goal
Track and manage mandatory Philippine government social security contributions deducted from employee salaries and matched by the employer: SSS (Social Security System), PhilHealth (Philippine Health Insurance), and Pag-IBIG / HDMF (Home Development Mutual Fund). This is one of the most critical compliance pages for Philippine employers.

Philippine Contribution Rules (as of 2026)
AgencyEmployee ShareEmployer ShareBasisRemittance Deadline
SSS4.5% of MSC9.5% of MSCMonthly Salary Credit (MSC); table-basedLast day of month following payroll month
PhilHealth2.5% of basic salary2.5% of basic salaryPremium Rate × Monthly Basic Salary; PHP 500 minimum eachLast day of month following payroll month
Pag-IBIG (HDMF)1%–2% of compensation2% of compensationUp to PHP 5,000 compensation base; flat PHP 200 for higher earnersEnd of month following payroll month

Page Layout & Design
Per-employee contribution summary table with period filter. Summary cards at top: Total SSS Contributions Due, Total PhilHealth Contributions Due, Total Pag-IBIG Contributions Due, Total Employer Contributions, Remittance Status for Current Period.

Data Table Columns
ColumnData TypeDescription
EmployeeReferenceEmployee name and ID
Payroll PeriodStringMonth and year
SSS (Employee)DecimalEmployee share of SSS contribution
SSS (Employer)DecimalEmployer share of SSS contribution
SSS ECDecimalEmployees' Compensation fund (employer-paid)
PhilHealth (Employee)DecimalEmployee PhilHealth premium share
PhilHealth (Employer)DecimalEmployer PhilHealth premium share
Pag-IBIG EmployeeDecimalEmployee HDMF contribution
Pag-IBIG EmployerDecimalEmployer HDMF contribution
Total Employee DeductionsDecimalSum of all employee-side deductions
Total Employer ContributionsDecimalSum of all employer-side contributions

Buttons & Functions
ButtonLocationFunction
Generate Monthly ListHeader, primaryCreate the contribution table for a selected month
Export SSS R3 / ML-1HeaderExport contribution list in SSS / PhilHealth / Pag-IBIG file format for online submission
Post Remittance JEHeaderPost journal entry for employer contribution expense
Mark as RemittedBulk actionRecord that contributions have been remitted to the agency
Compute ContributionsAutomatic/manualCalculate based on current payroll data and contribution tables

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/payroll/contributionsList contributions by period
GET/api/companies/:companyId/payroll/contributions/summaryMonthly summary totals
POST/api/companies/:companyId/payroll/contributions/generateGenerate contribution table for period
POST/api/companies/:companyId/payroll/contributions/remitMark period contributions as remitted
GET/api/companies/:companyId/payroll/contributions/exportExport formatted file for government portal submission

-----------------------------
7.21 Remittance Tracking Page
Page Route: /payroll-workforce/payroll-taxes/remittance-tracking
Page Goal
Track all government remittance obligations: SSS, PhilHealth, Pag-IBIG, and BIR withholding tax. Shows amounts due per period, payment status, confirmation references, penalties for late remittance, and upcoming due dates. Ensures the company never misses a statutory deadline.

Data Table Columns
ColumnData TypeDescription
AgencyEnumSSS / PhilHealth / Pag-IBIG / BIR
PeriodStringMonth / Year the contributions relate to
Amount DueDecimalTotal remittance due (employee + employer shares)
Due DateDateStatutory remittance deadline (with color-coded urgency)
Date RemittedDateActual date payment was made/transmitted
Confirmation / Reference No.StringGovernment portal reference number or bank receipt number
Late PenaltyDecimalPenalty charges if paid after due date
StatusEnumPending / Remitted On Time / Remitted Late / Overdue

-----------------------------
7.22 Payroll Reports Page
Page Route: /payroll-workforce/payroll-taxes/payroll-reports
Page Goal
Comprehensive payroll reporting hub. Provides all standard BIR, DOLE, and SSS/PhilHealth/Pag-IBIG reports alongside internal management payroll reports.

Reports Available
ReportDescription
Payroll RegisterDetailed listing of all employee pay components per payroll run
Payroll Summary by DepartmentTotal payroll cost broken down by department
Compensation & Benefits SummaryFull cost view: gross pay + employer contributions + benefits
BIR Form 1601-CMonthly remittance return for compensation income tax withheld
BIR Form 2316Annual certificate of compensation payment (per employee — year-end)
BIR AlphalistAnnual information return of income tax withheld from compensation
SSS Contribution List (R3 / ML-1)Monthly list for SSS submission
PhilHealth Contribution List (RF-1)Monthly list for PhilHealth submission
Pag-IBIG Contribution ListMonthly list for HDMF submission
DOLE Report on Regular EmploymentWorkforce composition report for DOLE compliance
13th Month Pay ReportDOLE-required certification of 13th month pay payments
Leave ReportLeave utilization summary per employee/department


========================================================================

MODULE 8: TAXES — SECONDARY PAGES
The Tax secondary pages expand beyond the 7 core tax pages documented in Part 6. The full Tax module covers setup configuration, detailed output and input tax management, comprehensive reporting, filing and payment tracking, and Philippine-specific corporate tax functionality.

============================
TAXES — TAX SETUP
============================

8.1 Tax Codes Page
Page Route: /taxes/tax-setup/tax-codes
Page Goal
Manage the complete library of tax codes used throughout the system. Tax codes are applied to transactions (invoices, bills, journal entries) to determine the applicable tax rate and GL accounts for tax posting. Supports output tax codes (for sales), input tax codes (for purchases), withholding tax codes, and combined codes.

Data Table Columns
ColumnData TypeDescription
Tax CodeStringShort code (e.g., VAT12, EWT2, ZR, EXEMPT)
DescriptionStringFull descriptive name
Tax TypeEnumOutput VAT / Input VAT / Withholding / Withholding VAT / Reverse Charge / Zero-Rated / Exempt
Rate (%)DecimalApplicable tax rate percentage
Tax Account — Payable/ReceivableReferenceGL account for tax collected or recoverable
Applied ToStringSales / Purchases / Sales & Purchases
BIR ReferenceStringBIR ATC (Alphanumeric Tax Code) for filing purposes
ActiveBooleanWhether this code is currently available for selection

Buttons & Functions
ButtonLocationFunction
New Tax CodeHeader, primaryCreate a new tax code with all properties
EditRow actionModify an existing tax code (rate, accounts, description)
DeactivateRow actionHide from selection without deleting (used if rate changes)
Set as DefaultRow actionMark as the default tax code for sales or purchases
Import CodesHeader, secondaryImport bulk tax codes from CSV

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/tax/codesList all tax codes
POST/api/companies/:companyId/tax/codesCreate tax code
PUT/api/companies/:companyId/tax/codes/:idUpdate tax code
DELETE/api/companies/:companyId/tax/codes/:idDeactivate tax code

-----------------------------
8.2 Tax Agencies Page
Page Route: /taxes/tax-setup/tax-agencies
Page Goal
Manage the government tax agencies to which the company remits taxes: BIR (Bureau of Internal Revenue), LGU (Local Government Unit — for business tax, RPT), BOC (Bureau of Customs — for import duties). Each agency record drives the remittance workflow and GL account mapping.

Data Table Columns
ColumnData TypeDescription
Agency NameStringFull name of the tax authority
Agency CodeStringShort code (e.g., BIR, LGU-MKT, BOC)
Tax Types AdministeredStringTax types this agency handles (VAT, EWT, RPT, etc.)
Filing FrequencyEnumMonthly / Quarterly / Annual / As Needed
Remittance Account (Payable)ReferenceGL liability account for taxes owed to this agency
Website / eFPS LinkURLBIR eFPS or other portal link
Contact DetailsStringAgency branch contact for correspondence

-----------------------------
8.3 Jurisdictions Page (Enterprise)
Page Route: /taxes/tax-setup/jurisdictions
Page Goal
For multi-location enterprises operating in multiple LGUs (Local Government Units) or with cross-border transactions, manage the tax jurisdictions applicable to the company's operations. Each jurisdiction can have different local business tax rates, RPT rates, and applicable national tax rules.

Key Features
•Map business locations to LGU jurisdictions
•Store local business tax (LBT) rates per LGU
•Real property tax (RPT) rate configuration
•Multi-jurisdiction allocation: split revenue across jurisdictions for LBT computation
•Jurisdiction-specific BIR RDO (Revenue District Office) mapping

-----------------------------
8.4 Withholding Setup Page
Page Route: /taxes/tax-setup/withholding-setup
Page Goal
Configure Philippine expanded withholding tax (EWT) and creditable withholding tax (CWT) codes and rates. Includes all ATC (Alphanumeric Tax Code) codes from BIR Revenue Regulations used to withhold tax from vendor payments. Pre-loaded with current Philippine EWT rate table; editable as regulations change.

Philippine EWT ATC Code Groups (pre-loaded)
CategoryExample ATCRateApplies To
Professional / Talent FeesWB01010% / 15%Lawyers, CPAs, engineers and other professionals
Rentals (Real Property)WC0505%Landlords, property lessors
CommissionWB03010%Insurance agents, brokers, commission agents
ContractorsWC1202%General engineering / general building contractors
Interest (bank)CC01020%Interest paid to individuals / banks
Services (individual)WB02510%Individual services with mixed transactions
Services (corporation)WB0262%Corporate service providers
Supplier of goods (large taxpayers)WC1501%Purchases from large taxpayer-registered suppliers

Data Table Columns: ATC Code, Description, Rate (%), Applies To (Individual/Corporation/Both), Minimum Amount Threshold, AR/AP Withholding Account.

-----------------------------
8.5 Exemptions & Rules Page
Page Route: /taxes/tax-setup/exemptions-rules
Page Goal
Configure tax exemption certificates and rules for specific customers or vendors. Records government-issued exemption certificates (e.g., BOI-registered, PEZA-accredited, Cooperatives exempt under RA 6938), sets validity periods, and applies the exemption to transactions automatically when the exemption is active.

Data Table Columns
ColumnData TypeDescription
EntityReferenceCustomer or Vendor the exemption applies to
Exemption TypeEnumVAT-Exempt / Zero-Rated / EWT-Exempt / PEZA / BOI / Cooperative
Basis / Legal AuthorityStringLaw, BIR ruling, or certification basis
Exemption Certificate No.StringGovernment-issued certificate number
Valid From / ToDate rangeValidity period (with expiry alert)
Approved By (Internal)User referenceInternal finance approval for the exemption
StatusEnumActive / Expired / Pending Renewal

============================
TAXES — SALES / OUTPUT TAX
============================

8.6 Zero-Rated & Exempt Sales Page
Page Route: /taxes/sales-output-tax/zero-rated-exempt-sales
Page Goal
Detailed register of all zero-rated (0% VAT, still requires VAT return filing) and VAT-exempt transactions. Required for BIR quarterly VAT return (BIR Form 2550Q) which requires separate disclosure of zero-rated and exempt sales. PEZA and BOI locators, export sales, and certain government sales are typically zero-rated.

Data Table Columns
ColumnData TypeDescription
Transaction DateDateInvoice date
CustomerReferenceCustomer name
Invoice NumberStringInvoice reference
TypeEnumZero-Rated / VAT-Exempt
Legal BasisStringWhy this transaction is zero-rated/exempt
Invoice AmountDecimalTotal invoice amount (VAT-exclusive)
VAT AmountDecimalShould be 0.00 for both types
BIR Filing PeriodStringQuarter this will be reported in

-----------------------------
8.7 Output Tax Ledger Page
Page Route: /taxes/sales-output-tax/output-tax-ledger
Page Goal
Complete ledger of all output VAT collected on sales invoices. Shows every VAT-inclusive transaction and the corresponding output tax amount. Grouped by tax code to facilitate VAT return preparation. Reconciles to the Output VAT payable GL account balance.

Data Table Columns
ColumnData TypeDescription
DateDateInvoice date
ReferenceStringInvoice number
CustomerReferenceCustomer name
Taxable SalesDecimalNet invoice amount (ex-VAT)
VAT RateDecimalApplied VAT rate (12% for regular, 0% for zero-rated)
Output VATDecimalVAT amount on this transaction
Running TotalDecimalCumulative output VAT for the selected period
GL AccountReferenceOutput VAT GL account posted to

============================
TAXES — PURCHASE / INPUT TAX
============================

8.8 Creditable Withholding Page
Page Route: /taxes/purchase-input-tax/creditable-withholding
Page Goal
Ledger of all expanded withholding tax (EWT) withheld from vendor payments. Tracks the BIR Certificate of Creditable Tax Withheld at Source (Form 2307) issues. Provides data for BIR Form 1601-EQ (quarterly EWT return). Philippine creditable withholding taxes are claimed as deductions from the withholding agent's income tax.

Data Table Columns
ColumnData TypeDescription
DateDateDate of payment / withholding
VendorReferencePayee from whom tax was withheld
ATC CodeReferenceBIR Alphanumeric Tax Code
Gross PaymentDecimalTotal payment before withholding
Withholding RateDecimalApplied EWT rate (%)
EWT WithheldDecimalAmount withheld and remitted to BIR
BIR Form 2307Reference/StatusWhether 2307 has been generated and issued
Filing QuarterStringQuarter for 1601-EQ reporting

-----------------------------
8.9 Tax Reconciliation Page
Page Route: /taxes/purchase-input-tax/tax-reconciliation
Page Goal
Reconcile Input VAT GL account balance against the detailed input VAT ledger (from bills and AP transactions). Identifies any unmatched differences, input VAT subject to amortization (for mixed VAT status businesses), and VAT that has been claimed vs. pending claim. Required before preparing the BIR VAT return.

Key Features
•Side-by-side comparison: Input VAT per GL vs. Input VAT per AP subledger
•Itemized difference report: shows specific transactions causing discrepancies
•Input VAT Categories: directly attributable to VAT sales (immediately creditable), to exempt sales (not creditable), to both (ratable allocation)
•Standard Input VAT (SIV) section for purchases not exceeding PHP 1M per quarter
•Summary of deferred input VAT (for purchases over PHP 1M — amortized over 60 months)

============================
TAXES — TAX REPORTING
============================

8.10 VAT Payable Report
Page Route: /taxes/tax-reporting/vat-payable
Page Goal
Detailed computation of VAT payable for a selected period: Output VAT minus creditable Input VAT equals VAT payable or excess input VAT. Exactly mirrors the BIR Form 2550M (Monthly VAT Declaration) or 2550Q (Quarterly VAT Return) computation. Ready-to-review before BIR filing.

Report Layout
SectionDescription
Part I — SalesRegular taxable sales, Zero-rated, Exempt sales — by category
Output VAT12% × Taxable Sales (regular transactions)
Part II — PurchasesFor goods, for services, for capital goods — by category
Input VATCreditable input VAT from qualified purchases
VAT Payable / (Excess)Output VAT less creditable Input VAT
AdjustmentsPrior month excess input, advance VAT payments, previous over-remittance
Net VAT Payable/(Refundable)Final amount to remit or carry forward

-----------------------------
8.11 Withholding Report
Page Route: /taxes/tax-reporting/withholding-report
Page Goal
Comprehensive withholding tax report covering: EWT withheld from vendors, withholding tax on compensation (WTC), and final withholding tax (FWT). Used to prepare BIR Form 1601-EQ, 1601-C, and 1600 remittance returns.

Report Sections
SectionBIR FormDescription
Compensation Withholding (WTC)1601-CTax withheld from employee compensation per employer
Expanded Withholding (EWT)1601-EQTax withheld from vendor payments per ATC code
Final Withholding Tax (FWT)1602Q / 1603QTax withheld on passive income (dividends, interest, royalties)
VAT Withholding16005% creditable VAT withheld on government money payments

-----------------------------
8.12 Tax Liability Report
Page Route: /taxes/tax-reporting/tax-liability-report
Page Goal
Consolidated view of all tax liabilities as of a date: output VAT payable, EWT withholding payable, WTC payable, RPT payable, local business tax payable, and income tax payable. Reconciles to the Tax Payable accounts on the Balance Sheet. Shows amounts due vs. amounts already remitted.

Report Columns: Tax Type, GL Account, GL Balance (per books), Per Tax Schedule, Variance, Due Date, Paid / Unpaid Status.

-----------------------------
8.13 Audit Trail by Tax Code
Page Route: /taxes/tax-reporting/audit-trail-by-tax-code
Page Goal
Complete transaction-level audit trail grouped by tax code. For each tax code, shows every transaction (invoice, bill, journal entry, adjustment) that used that code in the selected period. Supports BIR tax audit defense by providing a complete, downloadable record of all tax postings.

Data Table Columns: Date, Document Type, Reference Number, Entity (Customer/Vendor), Taxable Amount, Tax Rate, Tax Amount, GL Account, Posted By.

============================
TAXES — FILING & PAYMENTS
============================

8.14 Filing History Page
Page Route: /taxes/filing-payments/filing-history
Page Goal
Archive of all submitted BIR and LGU tax returns. Each record shows the form type, filing period, amount filed, filing date, and BIR acknowledgement number. Links to the actual Return data and any payment confirmation.

Data Table Columns
ColumnData TypeDescription
AgencyEnumBIR / LGU / BOC
Form NumberStringe.g., 2550M, 2550Q, 1601-C, 1701Q, 2551Q
PeriodStringMonth/Quarter/Year covered
Due DateDateOriginal filing deadline
Date FiledDateActual date of submission
Amount FiledDecimalTax declared in the return
Filing ModeEnumeFPS (electronic) / eBIRForms / Manual
Acknowledgement No.StringBIR eFPS or eBIRForms confirmation number
Payment StatusEnumNo Tax Due / Paid / Unpaid / Overpayment

-----------------------------
8.15 Tax Payments Page
Page Route: /taxes/filing-payments/tax-payments
Page Goal
Record all tax payments made to BIR, LGU, and other tax agencies. Links payments to corresponding filed returns. Tracks payment mode (Electronic / OTC at bank), bank receipt/confirmation number, and GL account debited.

Data Table Columns
ColumnData TypeDescription
AgencyEnumBIR / LGU / PhilHealth / SSS / Pag-IBIG
Return ReferenceReferenceLinked filed return
Payment DateDateDate payment was made
Amount PaidDecimalTotal tax payment
Payment ModeEnumeFPS / G-Cash (GCash) / Maya / OTC Bank / Manager's Check
Bank Reference / Receipt No.StringPayment confirmation from bank or portal
GL Account DebitedReferenceTax Payable account debited on payment
Posted ByUser referenceStaff member who recorded the payment

-----------------------------
8.16 Remittance Tracking Page (Tax)
Page Route: /taxes/filing-payments/remittance-tracking
Page Goal
Consolidated dashboard of all outstanding and completed tax remittance obligations across all tax types. Provides a calendar view of upcoming tax deadlines, color-coded by urgency. Sends automated reminders to designated tax staff before deadlines.

Calendar/List Views: Monthly deadline calendar showing all BIR and LGU filing deadlines. Toggle to list view sorted by due date.

Summary Cards: Overdue Remittances Count, Due This Week, Due This Month, Total Outstanding Tax Liabilities.

-----------------------------
8.17 E-Filing Page (Enterprise)
Page Route: /taxes/filing-payments/e-filing
Page Goal
Direct integration with BIR eFPS (Electronic Filing and Payment System) for submitting tax returns electronically without leaving HaypBooks. Generates the required eFPS-compatible data files from the system's tax data, allows preview and manual adjustment before submission, and records the filing confirmation received from BIR.

Key Features
•Supported forms: 2550M, 2550Q, 1601-C, 1601-EQ, 1700, 1701, 1702, 2551Q, 0619E
•Auto-populate return fields from HaypBooks tax data
•Pre-filing review: editable fields for any manual adjustments before transmission
•Direct eFPS API submission (requires BIR enrollment credentials stored securely in Settings)
•Download generated .dat or .xml file for manual eFPS upload if direct API not available
•Filing confirmation receipt stored in Filing History

============================
TAXES — YEAR-END
============================

8.18 Tax Adjustments Page
Page Route: /taxes/year-end/tax-adjustments
Page Goal
Year-end tax adjustments required before income tax return preparation. Includes: permanent and temporary book-to-tax differences, deferred tax asset/liability computation, non-deductible expenses identification, and tax-exempt income exclusions. Generates the Tax Reconciliation schedule needed for BIR Form 1702.

Key Features
•Book Income vs. Taxable Income reconciliation table
•Add-back schedule: non-deductible expenses (50% limit meals, entertainment; excess interest deduction)
•Deduction schedule: additional deductions available under TRAIN Law or special tax regimes
•Deferred tax computation: temporary differences (bad debt provision, depreciation timing, prepaid expenses)
•Net Operating Loss Carryover (NOLCO) tracking

-----------------------------
8.19 Tax Closing Entries Page
Page Route: /taxes/year-end/tax-closing-entries
Page Goal
Post the year-end income tax expense and current/deferred tax journal entries after the income tax computation is finalized. Manages the clearing of quarterly income tax payments against the final annual tax liability (BIR Form 1702). Records refund claims or additional tax due.

Key Entries Managed
EntryDescription
Income Tax Expense — CurrentDr: Income Tax Expense; Cr: Income Tax Payable (based on final tax computation)
Deferred Tax Asset/LiabilityAdjust deferred tax accounts based on timing differences
Clear Quarterly PaymentsDr: Income Tax Payable; Cr: Creditable Tax Withheld / Quarterly Payments
Balance Due or OverpaymentRemaining payable to BIR or application for refund/carry-forward


============================
US TAXATION & COMPLIANCE (Optional)
============================

The following pages document the additional compliance and reporting requirements for U.S.-based customers. These pages are intended to be enabled in a U.S. localization flavor of HaypBooks.

9.1 U.S. Sales Tax Setup Page
Page Route: /taxes/us/sales-tax-setup
Page Goal
Configure U.S. sales tax jurisdictions, register tax agencies (states, counties, cities), and set up nexus rules. Supports multi-jurisdiction rates, tax boundary rules, and tax automation for sales transactions.

Key Features
• Manage tax agencies per state/county/city
• Define nexus rules (physical presence, economic threshold)
• Configure tax rate tables per jurisdiction
• Set default tax behavior for customers and items
• Integrate with tax calculation engines (Avalara, TaxJar)

Data Table Columns
Column	Data Type	Description
Jurisdiction	String	State/County/City name
Tax Agency	String	Agency responsible (e.g., CA CDTFA)
Tax Rate	Decimal	Combined rate for this jurisdiction
Nexus Rule	String	Definition of nexus trigger (sales, transactions, location)
Effective Date	Date	Date rate takes effect

Backend API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/tax/us/sales-tax-jurisdictions	List jurisdictions
POST	/api/companies/:companyId/tax/us/sales-tax-jurisdictions	Create jurisdiction
PUT	/api/companies/:companyId/tax/us/sales-tax-jurisdictions/:id	Update jurisdiction
DELETE	/api/companies/:companyId/tax/us/sales-tax-jurisdictions/:id	Delete jurisdiction

-----------------------------
9.2 1099 Reporting Page
Page Route: /taxes/us/1099-reporting
Page Goal
Generate U.S. 1099-MISC/1099-NEC reports for contractors and vendors, based on payments made during the calendar year. Provides vendor status tracking (1099 vs non-1099), threshold monitoring, and electronic filing support.

Key Features
• Track vendor 1099 status and TIN/EIN
• Auto-calculate 1099-eligible payments per vendor
• Generate 1099 forms (MISC/NEC) and 1096 transmittal
• Export e-file formats (IRS Pub 1220) or generate print-ready PDFs

Data Table Columns
Column	Data Type	Description
Vendor	Reference	Vendor name
TIN/EIN	String	Taxpayer Identification Number
1099 Type	Enum	NEC / MISC / INT / DIV
Box	String	1099 box number (e.g., 1, 3, 7)
Total Payments	Decimal	Total payments made this year
Threshold	Decimal	Reporting threshold (e.g., $600)
Status	Enum	Pending / Ready / Filed

Backend API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/tax/us/1099/vendors	List 1099 vendors
POST	/api/companies/:companyId/tax/us/1099/generate	Generate 1099 forms
GET	/api/companies/:companyId/tax/us/1099/export	Export 1099 file (FIRE format)

-----------------------------
9.3 W-2 / W-3 Reporting Page
Page Route: /taxes/us/w2-reporting
Page Goal
Generate U.S. payroll W-2 forms for employees and the W-3 transmittal form for the Social Security Administration. Supports year-end W-2 preparation, corrections (W-2c), and electronic filing (SSA EFW2 format).

Key Features
• Auto-populate W-2 fields from payroll data (wages, federal/state tax, Social Security, Medicare)
• Support for multiple state/local jurisdictions per employee
• Generate W-2c corrections for amended filings
• Export EFW2 electronic filing format

Data Table Columns
Column	Data Type	Description
Employee	Reference	Employee name
SSN	String	Social Security Number
State	String	Primary work state
Total Wages	Decimal	Box 1 wages
Federal Income Tax	Decimal	Box 2 withheld
Social Security Wages	Decimal	Box 3 wages
Medicare Wages	Decimal	Box 5 wages
Social Security Tax	Decimal	Box 4 withheld
Medicare Tax	Decimal	Box 6 withheld

Backend API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/tax/us/w2/preview	Preview W-2 data
POST	/api/companies/:companyId/tax/us/w2/generate	Generate W-2/W-3 forms
GET	/api/companies/:companyId/tax/us/w2/export	Export EFW2 file

-----------------------------
9.4 Federal Payroll Tax Returns Page
Page Route: /taxes/us/federal-payroll-returns
Page Goal
Prepare and track U.S. federal payroll tax returns (941, 940, 944) including liability calculations, payment vouchers, and deposit scheduling.

Key Features
• Generate Form 941 (quarterly) and Form 940 (annual) calculations
• Track deposit schedule (semi-weekly/monthly) and due dates
• Record EFTPS payments and link to returns
• Support for multi-state payroll and multi-employer returns

Data Table Columns
Column	Data Type	Description
Return Type	Enum	941 / 940 / 944
Period	String	Quarter or year
Total Wages	Decimal	Total wages subject to tax
Taxable Social Security	Decimal	Wages subject to SS tax
Taxable Medicare	Decimal	Wages subject to Medicare tax
Total Liability	Decimal	Total tax liability
Deposits Made	Decimal	Total payments made
Balance Due	Decimal	Remaining due

-----------------------------
9.5 State & Local Tax Returns Page
Page Route: /taxes/us/state-local-returns
Page Goal
Manage state and local payroll tax filings, including withholding, unemployment, and disability insurance. Tracks each jurisdiction’s filing requirements and due dates.

Key Features
• Multi-state withholding tracking per employee
• State unemployment insurance (SUI) and disability insurance (SDI) tracking
• State-specific filing forms and due dates
• Local tax (city/county) withholding tracking


========================================================================

MODULE 9: INVENTORY — SECONDARY PAGES
Inventory secondary pages expand the core 4 pages (Items, POs/Receiving, Stock Movements, Valuation) from Part 7. They cover the full inventory management lifecycle: catalog setup, receiving workflows, stock operations, warehousing (Enterprise), and inventory analytics.

============================
INVENTORY — CATALOG SETUP
============================

9.1 Item Categories Page
Page Route: /inventory/categories
Page Goal
Manage the classification hierarchy for inventory items. Categories drive default GL accounts (inventory asset account, COGS account), default tax codes, default cost method, and reporting groupings. A well-structured category tree makes item setup faster and reports more meaningful.

Data Table Columns
ColumnData TypeDescription
Category NameStringCategory label (e.g., Raw Materials, Finished Goods, Consumables, Merchandise)
Parent CategoryReferenceFor hierarchical classification (e.g., Electronics > Computers > Laptops)
Default Asset AccountReferenceGL Inventory account for items in this category
Default COGS AccountReferenceGL Cost of Goods Sold account
Default Tax Code (Sales)ReferenceDefault output VAT code on sales of items in this category
Default Tax Code (Purchase)ReferenceDefault input VAT code on purchases
Cost MethodEnumFIFO / Weighted Average / Specific Identification (per category default)
Item CountIntegerNumber of inventory items in this category

Buttons & Functions
ButtonLocationFunction
New CategoryHeader, primaryCreate category (with optional parent for sub-categories)
EditRow actionModify category settings
Merge intoRow actionMove all items to another category and delete this one
Edit GL DefaultsRow actionQuickly update GL account mappings without full edit

-----------------------------
9.2 Units of Measure Page
Page Route: /inventory/uoms
Page Goal
Define the units of measure (UoM) used for inventory items: pieces, kilograms, liters, boxes, packs, meters, etc. Supports UoM conversion sets (e.g., 1 box = 12 pieces) so items can be purchased in one unit and sold in another, with automatic quantity conversion.

Data Table Columns
ColumnData TypeDescription
Unit NameStringFull name (e.g., Piece, Kilogram, Box, Carton)
Symbol / AbbreviationStringShort form used on documents (pcs, kg, box)
Unit TypeEnumCount / Weight / Volume / Length / Area / Custom
Conversion SetsIntegerNumber of conversion rules defined for this unit
Base UnitBooleanWhether this is the primary storage unit for conversions

Conversion Table (sub-table within UoM detail)
ColumnDescription
From UnitSource unit
To UnitTarget unit
Conversion FactorMultiplier (e.g., 1 carton = 24 pieces → factor = 24)
DirectionBidirectional or one-way

-----------------------------
9.3 Bundles & Assemblies Page (Enterprise)
Page Route: /inventory/bundles
Page Goal
Define product bundles (a set of existing items sold as a single SKU at a bundle price) and assemblies (manufactured items whose cost is built from component materials — Bill of Materials). Bundles affect only the sales side; assemblies create work orders and manufacturing journal entries.

Bundle Fields
FieldDescription
Bundle Name / SKUProduct identifier
Bundle TypeBundle (no production) / Assembly (requires work order)
Sale PriceBundle selling price (may differ from sum of component prices)
ComponentsList of items and quantities included in the bundle or BOM

Assembly (Bill of Materials) Features
•Multi-level BOM support (assemblies made of sub-assemblies)
•Work Order generation from sales demand or manual trigger
•Work order posting: debit WIP (Work in Process), credit component inventory; on completion, debit Finished Goods, credit WIP
•Cost roll-up: automatically calculates assembly cost from component COGS

============================
INVENTORY — RECEIVING
============================

9.4 Item Receipts Page
Page Route: /inventory/receiving/receipts
Page Goal
Record the physical receipt of inventory items from vendors — either against a Purchase Order (PO) or as a standalone receipt. When items are received, the system increases inventory quantity and creates the GL entry: Dr Inventory, Cr Goods Received Not Invoiced (GRNI) / Purchases Clearing. The corresponding AP bill is matched to this receipt.

Page Layout & Design
List of all receipts (receivable and received). Top filters: date range, vendor, PO number, status. Clicking a receipt opens the detail view showing line items, quantities, condition notes, and any discrepancies.

Buttons & Functions
ButtonLocationFunction
Receive ItemsHeader, primaryCreate a new item receipt — select from open POs or manual entry
Receive Against PORow action (on PO list)Navigate from PO to receive the order (shortcut from Purchasing flow)
Edit (Draft only)Row actionEdit a draft receipt before posting
VoidRow action (Posted)Void an incorrect receipt (creates reverse GL entry)
Create Bill from ReceiptRow actionGenerate an AP Bill pre-filled from this item receipt

Item Receipt Line Columns
ColumnData TypeDescription
ItemReferenceInventory item received
DescriptionStringItem description
PO QuantityIntegerQuantity ordered on the linked PO
Received QuantityIntegerQuantity actually received (may differ from PO qty)
ConditionEnumGood / Damaged / Short-Received / Over-Received
Unit CostDecimalCost per unit (from PO or manually entered if no PO)
Total CostCalculatedReceived Quantity × Unit Cost
LocationReferenceWarehouse or bin location where items will be put away

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/inventory/receiptsList all item receipts
POST/api/companies/:companyId/inventory/receiptsCreate item receipt
GET/api/companies/:companyId/inventory/receipts/:idGet receipt detail
POST/api/companies/:companyId/inventory/receipts/:id/postPost receipt (posts GL entry)
POST/api/companies/:companyId/inventory/receipts/:id/voidVoid posted receipt

-----------------------------
9.5 Vendor Returns Page
Page Route: /inventory/receiving/returns
Page Goal
Process the return of inventory items to vendors for defective goods, over-shipment, or incorrect items. Vendor returns decrease inventory and credit the AP account or create a vendor credit. Requires a linked original receipt or standalone return entry.

Return Form Fields
FieldDescription
VendorVendor being returned to
Original ReceiptLink to the item receipt being returned against (optional)
Return DateDate items are being sent back
Items to ReturnRepeating rows: item, quantity returned, unit cost, reason for return
Return MethodEnum: Credit Note (vendor gives credit) / Replacement (exchange) / Refund (cash back)
Reason CodeEnum: Defective / Wrong Item / Over-Delivery / Quality Rejection / Other
Return Authorization No.Vendor-issued RMA (Return Merchandise Authorization) number

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/inventory/returnsList vendor returns
POST/api/companies/:companyId/inventory/returnsCreate return
POST/api/companies/:companyId/inventory/returns/:id/postPost return JE

-----------------------------
9.6 Landed Costs Page (Enterprise)
Page Route: /inventory/receiving/landed-costs
Page Goal
Allocate additional costs incurred to import/receive inventory (customs duties, freight, insurance, handling, customs brokerage fees) to the cost of landed items. Increases the inventory cost basis for accurate COGS and item profitability reporting. Allocation methods: by quantity, by value, by weight, or by specific item.

Landed Cost Entry Fields
FieldDescription
Source Receipt(s)One or more item receipts this landed cost applies to
Cost TypeFreight / Insurance / Customs Duty / Brokerage / Handling / Other
AmountTotal landed cost amount
CurrencyCurrency of the landed cost (with live FX conversion)
Allocation MethodBy Quantity / By Value / By Weight / By Item (manual)
Allocation PreviewShows how the cost is distributed across each item

============================
INVENTORY — STOCK OPERATIONS
============================

9.7 Inventory Adjustments Page
Page Route: /inventory/stock/adjustments
Page Goal
Record manual adjustments to on-hand inventory quantities or values: spoilage, expiry, theft, shrinkage, found goods (variance over), or corrections to prior incorrect entries. Posts a journal entry: Dr Inventory Adjustment Expense (loss) or Dr Inventory (gain), Cr Inventory or Cr Inventory Overage.

Buttons & Functions
ButtonLocationFunction
New AdjustmentHeader, primaryOpen adjustment form (item, current qty, new qty, reason)
Bulk AdjustmentHeader, secondaryUpload CSV of multiple item adjustments in one batch
View HistoryHeaderToggle to adjustment history list

Adjustment Form Fields
FieldDescription
ItemInventory item to adjust
LocationWarehouse/bin location the adjustment applies to
Quantity On Hand (Current)System current quantity (read-only)
Adjusted QuantityNew correct quantity
Quantity ChangeDifference (calculated: positive = gain, negative = loss)
Unit CostCost per unit (for valuation of the adjustment)
ReasonEnum: Spoilage / Theft / Damage / Counting Error / Overcount / Obsolescence / Found / Other
GL AccountAdjustment loss or gain account (auto-populated; editable)
Adjustment DateDate for the inventory and GL transaction

-----------------------------
9.8 Cycle Counts Page
Page Route: /inventory/stock/cycle-counts
Page Goal
Systematic counting of a subset of inventory items on a rotating basis, so the entire inventory is physically counted over multiple shorter counting sessions rather than a single disruptive full physical count. Cycle count schedules are configured by category, location, or ABC classification (high-value items counted more frequently).

Cycle Count Workflow
1. Schedule → 2. Assign Counters → 3. Perform Count (scan or manual entry) → 4. Review Variances → 5. Approve and Post Adjustments

Data Table Columns
ColumnData TypeDescription
Count ReferenceStringAuto-generated count batch number
Scheduled DateDateWhen this count is planned
Items to CountIntegerNumber of items in this count batch
ScopeStringCategory, location, or ABC class being counted
Assigned ToUser referenceStaff assigned to perform the count
Count CompletedIntegerItems that have been physically counted so far
Variances FoundIntegerItems with actual quantity differing from system quantity
StatusEnumScheduled / In Progress / Under Review / Posted / Cancelled

-----------------------------
9.9 Physical Inventory Count Page
Page Route: /inventory/stock/physical-counts
Page Goal
Full-warehouse physical inventory count where all items are counted at a point in time (typically year-end or financial audit requirement). During counting, inventory movements are suspended (count freeze). After counting, variances are reviewed and adjustment entries are posted. Generates the Board-level Physical Count Report.

Physical Count Process
StepDescription
1. Initiate CountFreeze date is set; system stops accepting inventory movements after freeze
2. Generate Count SheetsPrint or export count sheets (item code, description, location) with blank quantity column
3. Enter CountsInput physical counts per item/location (multiple count iterations for variances above tolerance)
4. Review VariancesCompare entered counts vs. system quantities; flag items for recount
5. Approve CountManagement approval of final count results
6. Post AdjustmentsAuto-generate inventory adjustment journal entries for all variances
7. Unfreeze InventoryResume normal inventory operations

-----------------------------
9.10 Stock Transfers Page (Enterprise)
Page Route: /inventory/stock/transfers
Page Goal
Move inventory between warehouses, branches, or bin locations within the enterprise. Transfers do not affect total company inventory value but update location-level quantities. Supports in-transit inventory tracking (inventory in transit is held in a Transfer-in-Transit account until received at destination).

Transfer Form Fields
FieldDescription
From LocationSource warehouse or bin
To LocationDestination warehouse or bin
Transfer DateDate of physical dispatch
Expected ArrivalDate inventory is expected at destination
ItemsRepeating rows: item, quantity, unit cost
Status flowDrafted → Dispatched → In Transit → Received

============================
INVENTORY — WAREHOUSING (Enterprise)
============================

9.11 Warehouses Page (Enterprise)
Page Route: /inventory/warehousing/warehouses
Page Goal
Manage the company's warehouse records. Each warehouse represents a distinct physical storage location. Warehouses drive inventory location tracking, bin management, and location-specific inventory reports.

Data Table Columns: Warehouse Code, Warehouse Name, Address/Location, Capacity (sq m or units), Custodian/Manager, On-Hand Value, Active Status.

-----------------------------
9.12 Bin Locations Page (Enterprise)
Page Route: /inventory/warehousing/bin-locations
Page Goal
Define storage bins (shelves, racks, zones) within a warehouse for granular item tracking at the bin level. Bin management enables faster picking, organized put-away, and precise stock location reporting.

Data Table Columns: Bin Code (e.g., A-01-03 = Aisle A, Rack 01, Shelf 03), Bin Name, Warehouse, Aisle/Rack/Level, Capacity, Current Fill Level (%), Items Currently Stored.

-----------------------------
9.13 Stock Zones Page (Enterprise)
Page Route: /inventory/warehousing/stock-zones
Page Goal
Group bins into storage zones with special handling requirements: ambient, refrigerated, freezer, hazardous, high-security (for high-value items). Zones apply storage rules and may restrict which items can be stored there.

=====================================
INVENTORY — INVENTORY CONTROL
=====================================

9.14 Reorder Points Page
Page Route: /inventory/control/reorder
Page Goal
Configure and monitor reorder points for all inventory items. When an item's on-hand quantity falls at or below its reorder point, the system generates a reorder alert or auto-creates a draft Purchase Requisition. Critical for preventing stockouts.

Data Table Columns
ColumnData TypeDescription
ItemReferenceInventory item
Current On HandDecimalCurrent stock quantity
Reorder PointDecimalQuantity threshold that triggers reorder recommendation
Reorder QuantityDecimalStandard quantity to order when reordering
Lead Time (days)IntegerAverage days from PO to receipt from this item's primary vendor
Preferred VendorReferenceDefault vendor for reorder POs
StatusEnumAdequate Stock / Reorder Suggested / Below Reorder / Stockout

Buttons & Functions
ButtonLocationFunction
Set Reorder PointsBulk editQuickly update reorder points for multiple items
Generate Reorder POsHeader, batchCreate draft Purchase Orders for all items below their reorder point
Export Reorder ReportHeaderExport items needing reorder to Excel

-----------------------------
9.15 Safety Stock Page
Page Route: /inventory/control/safety-stock
Page Goal
Manage safety stock levels — the buffer inventory kept above the reorder point to protect against demand spikes and supply delays. Safety stock is calculated based on lead time variability and demand variability. Shows items with insufficient safety stock coverage.

Data Table Columns: Item, Current On Hand, Reorder Point, Safety Stock Level, Days of Safety Stock Cover (current), Average Daily Usage, Lead Time, Safety Factor, Review Status.

-----------------------------
9.16 Backorders Page
Page Route: /inventory/control/backorders
Page Goal
Track sales orders and invoices that could not be fully fulfilled due to insufficient stock. Backorders show the customer, the item, the quantity short, and the expected fulfillment date. When stock is replenished, backorder items are automatically prioritized.

Data Table Columns
ColumnData TypeDescription
CustomerReferenceCustomer with the backorder
Sales Order / InvoiceReferenceSource order
ItemReferenceItem on backorder
Quantity OrderedDecimalOriginal quantity requested
Quantity DeliveredDecimalQuantity fulfilled so far
Quantity Back-OrderedDecimalUnfulfilled quantity
Promised DateDateCommitted delivery date to the customer
On Order (PO)ReferencePurchase order placed to fulfill this backorder

-----------------------------
9.17 Lot & Serial Tracking Page (Enterprise)
Page Route: /inventory/control/lot-serial
Page Goal
Track inventory items by lot number (batch) or individual serial number. Essential for regulated industries (food, pharma, medical devices) requiring traceability back to manufacturing batch for recall purposes, or for high-value equipment tracked individually.

Key Features
•Receive items by lot/serial during item receipt
•Track lot/serial per storage location
•FEFO (First Expired, First Out) picking for food/pharma lots
•Recall management: instantly identify all customers who received items from a specific lot
•Serial number warranty tracking with warranty expiry dates
•BOM lot tracking: trace which lot of components were used in an assembly

=====================================
INVENTORY — VALUATION
=====================================

9.18 Cost Adjustments Page
Page Route: /inventory/valuation/cost-adjustments
Page Goal
Correct the unit cost of inventory items when the original cost was entered incorrectly or when costs are updated (e.g., actual landed costs differ from estimated costs used at receipt). Cost adjustments revalue existing on-hand stock and post the valuation difference to a Cost Adjustment account.

Adjustment Form Fields: Item, Location, Current Unit Cost, New Unit Cost, Quantity Affected, Adjustment Basis (e.g., actual invoice vs. estimated), GL Adjustment Account, Adjustment Date.

-----------------------------
9.19 Inventory Write-Downs Page
Page Route: /inventory/valuation/write-downs
Page Goal
Record reductions in inventory value when net realizable value (NRV) falls below cost — as required by PAS 2. Write-downs reduce both the inventory balance on the Balance Sheet and recognize an inventory loss on the P&L. Common for obsolete, slow-moving, damaged, or perishable inventory.

Write-Down Form Fields: Item, Current Unit Cost, Estimated NRV per Unit, Write-Down per Unit, Quantity to Write Down, Total Write-Down Amount, Reason (Obsolescence / Damage / Expiry / Market Decline), GL Inventory Write-Down Expense Account.

-----------------------------
9.20 Inventory Insights Page
Page Route: /inventory/insights
Page Goal
Analytics dashboard covering inventory performance across three key perspectives: Stock Aging (how long items have been in stock), Inventory Turnover (how fast items are selling), and Overstock Analysis (items with excessive stock on hand relative to recent demand). Drives purchasing and markdown decisions.

Dashboard Sections

Stock Aging
•Age bands: 0–30 days, 31–60 days, 61–90 days, 91–180 days, 180+ days
•Value of inventory in each age band
•Items approaching write-down risk (180+ days with no movement)

Inventory Turnover
•Turnover ratio by item and category: COGS / Average Inventory
•Days Inventory Outstanding (DIO): 365 / Turnover Ratio
•Trend: turnover comparison vs. prior 3 periods
•Fast movers vs. Slow movers ranking

Overstock Analysis
•Items with months-on-hand exceeding threshold (e.g., > 6 months of supply)
•Over-invested capital in slow-moving stock
•Recommended action flags: Discount / Write-down candidate / Return to vendor / Transfer to higher-demand location


========================================================================

MODULE 10: TIME — SECONDARY PAGES
The Time secondary pages expand beyond the single Time Entries page documented in Part 8. They cover timesheet management, live timer, billability review, approvals, and time analytics.

============================
TIME MODULE SECONDARY PAGES
============================

10.1 Timesheets Page
Page Route: /time/timesheets
Page Goal
Weekly or bi-weekly timesheet view for entering and reviewing time worked across multiple days. Timesheets aggregate individual time entries into a structured grid (days as columns, projects/tasks as rows) making it easier to see the full week's time allocation at a glance. Supports timesheet submission for manager approval.

Page Layout & Design
Calendar week selector at the top with Previous/Next week navigation. Below: a spreadsheet grid with Projects/Tasks as rows and Monday–Sunday as columns. Each cell is editable — user enters hours per day per project. Row totals (weekly hours per project) and column totals (daily hours) auto-calculate. A target hours indicator shows daily/weekly target vs. entered.

Buttons & Functions
ButtonLocationFunction
Previous / Next WeekHeaderNavigate between weeks
Copy Last WeekHeaderPre-fill the current week grid with last week's project/task breakdown (hours zeroed)
Add RowGrid footerAdd a project/task row to the timesheet
Submit for ApprovalHeader primaryLock the timesheet and send to manager for review
Recall SubmissionHeader (if submitted)Pull back a submitted timesheet for editing
Approve (manager view)Approval tabApprove submitted timesheet from a direct report

Timesheet Grid Columns
ColumnDescription
ProjectProject name (linked to Projects module)
TaskTask or work category under the project
Mon–SunHours entered per day (decimal, e.g., 7.5)
TotalSum of all days for this project/task row
Billable?Toggle: is this time billable to the customer

Data Table Columns (Timesheet History List)
ColumnData TypeDescription
Week ofDateStart date of the week
StatusEnumDraft / Submitted / Approved / Rejected
Total HoursDecimalTotal hours logged for the week
Billable HoursDecimalBillable portion of hours
Non-Billable HoursDecimalInternal / overhead / leave hours
Submitted OnDateTimeDate timesheet was submitted
Approved ByUser referenceManager who approved

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/time/timesheetsList timesheets for current user
GET/api/companies/:companyId/time/timesheets/:idGet timesheet with all daily entries
POST/api/companies/:companyId/time/timesheetsCreate / initialize a timesheet for a week
PUT/api/companies/:companyId/time/timesheets/:idSave timesheet entries
POST/api/companies/:companyId/time/timesheets/:id/submitSubmit for approval
POST/api/companies/:companyId/time/timesheets/:id/approveApprove (manager)
POST/api/companies/:companyId/time/timesheets/:id/rejectReject with comments
GET/api/companies/:companyId/time/timesheets/teamGet team timesheets (manager view)

-----------------------------
10.2 Timer Page
Page Route: /time/timer
Page Goal
Live stopwatch-style time tracker for real-time time capture. Users start a timer when beginning work on a project/task and stop it when done. The elapsed time automatically creates a time entry. Supports simultaneous timer display in the browser header/tab so users can track time across the application without staying on the Timer page.

Page Layout & Design
Large central timer display showing HH:MM:SS. Below: Project and Task selectors. Description field for notes. Start/Pause/Stop controls. History of today's time clips shown below the timer, with a daily total counter.

Buttons & Functions
ButtonLocationFunction
StartTimer controlBegin timing; requires project selection
PauseTimer control (while running)Pause timing (resumes on Start)
Stop & SaveTimer control (while running)Stop timer, prompt for description, save as time entry
DiscardTimer control (while running)Cancel current timing session without saving
Quick Add (Manual)HeaderAdd a time entry for a past block of time without the live timer
EditHistory rowEdit a previously saved timer clip

Timer Entry Fields
FieldRequiredDescription
ProjectYesProject this work relates to
TaskNoSpecific task or activity type
DescriptionNoWhat was done during this time block
DateYesDate of work (defaults to today)
Start TimeYesTime work started (auto-filled from timer or manual)
End TimeYesTime work ended (auto-filled from timer or manual)
DurationCalculatedEnd Time minus Start Time
BillableToggleIs this time billable to the client

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/time/timer/runningGet active timer for current user (if any)
POST/api/companies/:companyId/time/timer/startStart a timer
POST/api/companies/:companyId/time/timer/stopStop timer and create time entry
POST/api/companies/:companyId/time/entriesCreate manual time entry
GET/api/companies/:companyId/time/entries/todayGet today's entries for current user

-----------------------------
10.3 Billable Time Review Page
Page Route: /time/review/billable-time-review
Page Goal
Review all logged time and mark entries as billable or non-billable before invoicing. Time marked billable and linked to a project feeds directly into the Project Billing module for invoice generation. This page is the bridge between time tracking and the AR billing workflow.

Page Layout & Design
Full-width table filterable by date, employee, project, customer, billability status. Time entries can be marked billable/non-billable individually or in bulk. A right-side panel shows the total billable hours per customer/project ready for invoicing.

Data Table Columns
ColumnData TypeDescription
DateDateWork date
EmployeeReferenceStaff member who logged the time
ProjectReferenceProject time was logged against
CustomerReferenceCustomer associated with the project
Task / DescriptionStringWork description
HoursDecimalTime worked
Billable StatusEnumBillable / Non-Billable / Already Invoiced
Billing RateDecimalRate per hour (pulled from project or employee rate card)
Billable AmountCalculatedHours × Billing Rate
Invoice ReferenceReferenceIf already invoiced, shows invoice number

Buttons & Functions
ButtonLocationFunction
Mark as BillableRow action / bulkFlag time entries as billable
Mark as Non-BillableRow action / bulkFlag time entries as non-billable
Create InvoiceHeader / bulk selectGenerate an invoice from selected billable time entries (routes to Project Billing)
ExportHeaderExport detailed billable time report to CSV/PDF

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/time/reviewList all time entries with billability filters
PATCH/api/companies/:companyId/time/entries/:id/billabilityUpdate billable status
POST/api/companies/:companyId/time/review/create-invoiceCreate invoice from selected billable entries

-----------------------------
10.4 Time Approvals Page (Enterprise)
Page Route: /time/review/time-approvals
Page Goal
Manager approval workflow for time entries and timesheet submissions. Before time can be invoiced or included in payroll, designated approvers must review and approve logged hours. Supports multi-level approvals for specific projects or customers.

Data Table Columns
ColumnData TypeDescription
EmployeeReferenceStaff member whose time is pending approval
Period / TimesheetStringWeek or custom period submitted
Total HoursDecimalHours pending approval
Project(s)StringProject(s) time was logged against
Submitted OnDateTimeSubmission timestamp
StatusEnumPending Approval / Approved / Rejected / Recalled
ApproverUser referenceAssigned approver at current level

Buttons & Functions
ButtonLocationFunction
ApproveRow actionApprove all time entries in this submission
RejectRow actionReject with required comment
Request ClarificationRow actionSend a note to the employee asking about specific entries
Bulk ApproveToolbarApprove multiple employee submissions at once

-----------------------------
10.5 Time by Project Report
Page Route: /time/analysis/time-by-project
Page Goal
Analytical report showing total hours logged per project, broken down by employee and task type. Shows billable vs. non-billable split, hours vs. project budget, and billing realization rate. Key tool for project managers and operations.

Report Dimensions: Date range, Project filter, Employee filter, Billable filter. Display: Bar chart of hours per project; Table with project rows showing: Total Hours, Billable Hours, Non-Billable Hours, Billing Rate, Billable Amount, Budget Hours (from project), Budget Used %.

-----------------------------
10.6 Time by Customer Report
Page Route: /time/analysis/time-by-customer
Page Goal
Aggregate view of all time logged across all projects for each customer. Shows total engagement hours, billable hours, non-billable hours, billed amount, and unbilled (work in progress) amount. Essential for customer profitability analysis in professional services.

Report Columns: Customer, Projects Count, Total Hours, Billable Hours, Non-Billable Hours, Average Hourly Rate, Total Billed, Total Unbilled (WIP), Realization Rate %.

-----------------------------
10.7 Utilization Report
Page Route: /time/analysis/utilization-report
Page Goal
Employee time utilization analysis — ratio of billable hours to total available working hours. Tracks individual and team utilization rates vs. targets. Identifies under-utilized and over-utilized staff. Key KPI for professional services firms.

Report Columns: Employee, Department, Available Hours (based on schedule), Logged Hours, Billable Hours, Non-Billable Hours, Leave Hours, Billable Utilization % (Billable / Available), Total Utilization % (Logged / Available), Target Utilization %.

Visualization: Bar chart comparing utilization rates across team members; trend line for team average utilization by week/month.

========================================================================

MODULE 11: REPORTING & ANALYTICS — SECONDARY PAGES
Two additional reporting pages not covered in Part 10.

============================
REPORTING SECONDARY PAGES
============================

11.1 Saved Views Page
Page Route: /reporting-analytics/saved-views
Page Goal
Manage saved report configurations — custom filter sets, column selections, date ranges, and display preferences that users have saved from any report in the system. Saved views enable rapid access to frequently needed reports without reconfiguring from scratch each time. Views can be saved as Personal (only visible to the creator) or Shared (visible to all users with report access).

Page Layout & Design
Card grid layout displaying all saved views. Each card shows: view name, source report, last run date, who created it, and whether it is shared or personal. Clicking a card immediately opens the report with all saved configurations applied.

Data Table / Card Fields
FieldDescription
View NameUser-assigned name (e.g., "Monthly AR by Customer — NET30")
Source ReportWhich report module this view came from (e.g., AR Aging, Trial Balance, Payroll Register)
Filters AppliedSummary of active filters (e.g., "Date: Last 3 Months | Status: Overdue")
Created ByUser who created this view
Created OnCreation date
Last RunMost recent date this view was used
VisibilityPersonal / Shared
Pinned to DashboardBoolean: pinned as a dashboard quick-access widget

Buttons & Functions
ButtonLocationFunction
Run ViewCard action / row actionExecute the saved report with all preset parameters
Edit ViewCard actionModify the filter configuration or name
DuplicateCard actionCopy the view for modification (creating a variant)
Share / UnshareCard actionToggle the view between personal and shared
Pin to DashboardCard actionAdd this report view as a dashboard widget
DeleteCard actionRemove the saved view

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/reports/saved-viewsList all saved views (personal + shared for current user)
POST/api/companies/:companyId/reports/saved-viewsCreate new saved view
PUT/api/companies/:companyId/reports/saved-views/:idUpdate view (rename, edit filters, toggle share)
DELETE/api/companies/:companyId/reports/saved-views/:idDelete saved view
POST/api/companies/:companyId/reports/saved-views/:id/runExecute saved view and return report data
POST/api/companies/:companyId/reports/saved-views/:id/pinPin view to dashboard

Database Models
Primary model: SavedReportView — stores viewName, reportType, reportPath, filterConfig (JSON), columnConfig (JSON), sortConfig (JSON), userId, companyId, isShared, isPinnedToDashboard, lastRunAt.

-----------------------------
11.2 ESG Reporting Page (Enterprise)
Page Route: /reporting-analytics/esg-reporting
Page Goal
Environment, Social, and Governance (ESG) reporting dashboard and data collection hub for enterprise companies with sustainability reporting obligations. Collects quantitative ESG metrics, maps them to disclosure frameworks (GRI, SASB, SEC Philippines), and generates ESG report summaries. While early-stage for Philippine SMEs, enterprise clients and listed companies increasingly require ESG disclosure.

Page Layout & Design
Three-tab layout: Environmental, Social, Governance. Each tab presents a set of data collection forms, a KPI dashboard for the current reporting period, and a comparison to prior period / target benchmarks.

ENVIRONMENTAL TAB — Key Metrics
MetricUnitDescription
Energy ConsumptionkWhTotal electricity and fuel consumption
Energy IntensitykWh per PHP M revenueNormalized energy usage per unit of output
Greenhouse Gas Emissions (Scope 1)tCO2eDirect emissions from owned/controlled sources
Greenhouse Gas Emissions (Scope 2)tCO2eIndirect emissions from purchased electricity
Water ConsumptionCubic metersTotal water used in operations
Waste Generatedkg/tonsTotal waste by category (recyclable, hazardous, general)
Waste Diverted from Landfill%Proportion of waste recycled or recovered

SOCIAL TAB — Key Metrics
MetricUnitDescription
Total HeadcountCountTotal number of employees (FTE + part-time)
Employee Diversity%Gender diversity ratio, age demographics
Employee Turnover Rate%Voluntary turnover as % of average workforce
Training Hours per EmployeeHoursAverage training and development hours
Work-Related InjuriesCountRecordable incident rate
Community InvestmentPHPCorporate social responsibility spend
MSME Supplier ProcurementPHPAmount procured from micro/small enterprises

GOVERNANCE TAB — Key Metrics
MetricUnitDescription
Board Independence%Proportion of independent directors
Anti-Corruption PolicyYes/NoWhether a written anti-corruption policy exists and is communicated
Data Privacy IncidentsCountNumber of reported data breach incidents
Internal Audit Coverage%Business units subject to internal audit in the period
Compliance ViolationsCountRegulatory violations or fines received

Buttons & Functions
ButtonLocationFunction
Enter MetricsTab sectionOpen data entry form for the selected ESG metric category
Import DataHeader, secondaryUpload ESG data from CSV (for bulk metric entry)
Generate ESG ReportHeader, primaryCompile all metrics and generate a formatted ESG disclosure document
Select FrameworkHeaderChoose disclosure standard for report formatting (GRI / SASB / GHG Protocol / SEC Philippines)
Compare to Prior PeriodHeaderToggle prior period benchmark columns
Export ReportAfter generationDownload as PDF (audit-ready ESG report) or Excel (raw data)

Backend API Endpoints
MethodEndpointPurpose
GET/api/companies/:companyId/esg/metricsList all ESG metrics for a period
POST/api/companies/:companyId/esg/metricsRecord ESG metric values
GET/api/companies/:companyId/esg/frameworksGet available disclosure frameworks
POST/api/companies/:companyId/esg/report/generateGenerate formatted ESG report
GET/api/companies/:companyId/esg/report/:idRetrieve generated report

Database Models
Primary model: ESGMetric — stores metricCode, metricName, category (ENVIRONMENTAL/SOCIAL/GOVERNANCE), unit, value, period, companyId, source, lastUpdatedBy. Related: ESGFrameworkMapping — maps internal metrics to GRI/SASB/SEC disclosure indicators.

========================================================================

ADDITIONAL FEATURES
These pages cover widely used accounting features that enhance auditability, transactional tagging, and reconciliation controls.

============================
AUDIT LOG
============================

Page Route: /compliance/audit-log
Page Goal
Provide a complete, tamper-evident record of all user actions in the system. This includes creation, modification, deletion, and approval workflows across all major modules (AR, AP, Banking, Payroll, Inventory, Tax). The Log supports forensic review, compliance audits, and incident investigation.

Key Features
•	Filter by date range, user, module, action type, and affected record
•	View record-level change diffs (before/after values) for sensitive fields
•	Export audit data to CSV for external review or regulatory submission
•	Retention policy settings (e.g., 2 years, 5 years) controlled by admin
•	Audit log tamper protection / immutability indicator (if backend supports it)

Data Table Columns
Column	Data Type	Description
Timestamp	DateTime	When the action occurred
User	Reference	User who performed the action
Module	String	Module affected (e.g., AR, AP, Banking, Payroll)
Action	String	Action type (CREATE, UPDATE, DELETE, APPROVE, REJECT)
Record Type	String	Entity type affected (Invoice, Bill, Payment, Employee)
Record ID	String	Identifier of the affected record
Field	String	Field changed (for updates)
Old Value	String	Value prior to change
New Value	String	Value after change
Notes	String	Optional comment or reason

Backend API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/audit-log	List audit log entries with filtering
GET	/api/companies/:companyId/audit-log/:id	Get details for a single audit entry


============================
TAGS & RECEIPTS (TRANSACTION TAGGING + RECEIPT CAPTURE)
============================

Page Route: /settings/tags-receipts
Page Goal
Enable users to organize and classify transactions using tags and to capture receipts (mobile/desktop) linked to accounting transactions. Tags are a lightweight, cross‑module categorization mechanism complementary to Chart of Accounts and Classes/Locations.

Key Features
•	Create and manage tags (e.g., "marketing", "capex", "audit")
•	Apply tags to transactions across AR, AP, Expenses, Banking, Payroll, etc.
•	Filter and report on tagged transactions for analysis and audit
•	Upload receipt images/PDFs and attach them to transactions (OCR optional)
•	Auto-tag rules (e.g., auto-tag payment transactions containing "Uber")

Data Table Columns
Column	Data Type	Description
Tag Name	String	Name of the tag
Description	String	Optional description or usage guidelines
Color	String	Visual tag color used in UI
Created By	User reference	Who created the tag
Created On	DateTime	Creation timestamp
Usage Count	Integer	Number of transactions tagged

Receipt Capture Features
•	Receipt Upload: Mobile/desktop upload with drag-drop (image/PDF)
•	OCR Extraction: Auto-extract date, amount, vendor (optional)
•	Link to Transaction: Attach receipt to invoice, bill, expense, or bank transaction
•	Receipt Gallery: Search receipts by vendor, amount, date, tags

Backend API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/tags	List tags
POST	/api/companies/:companyId/tags	Create tag
PUT	/api/companies/:companyId/tags/:id	Update tag
DELETE	/api/companies/:companyId/tags/:id	Delete tag
POST	/api/companies/:companyId/receipts	Upload receipt and create attachment
GET	/api/companies/:companyId/receipts	List receipts (with filters)
POST	/api/companies/:companyId/receipts/:id/link	Link receipt to a transaction


============================
AUTO RECONCILIATION ADJUSTMENT
============================

Page Route: /banking-cash/reconciliation/auto-adjust
Page Goal
Provide a controlled way to complete a bank reconciliation when a small, acceptable difference remains (e.g., bank rounding or timing differences). The system creates an adjusting journal entry to zero out the reconciliation difference while recording the reason and requiring approval.

Key Features
•	Configurable tolerance threshold (e.g., PHP 10)
•	Approval workflow for auto-adjustments (manager/CFO)
•	Automatic journal entry creation with audit notes
•	Flagged on reconciliation report for review

Buttons & Functions
Button	Location	Function
Auto-Adjust	Reconciliation page	Create adjustment journal entry for the difference
Set Tolerance	Settings	Configure maximum allowable adjustment amount
View Adjustments	History	View all auto adjustments and their approvals

Backend API Endpoints
Method	Endpoint	Purpose
POST	/api/companies/:companyId/banking/reconciliation/auto-adjust	Create auto adjustment entry
GET	/api/companies/:companyId/banking/reconciliation/auto-adjusts	List past adjustments


============================
CLASS & LOCATION TRACKING (GLOBAL)
============================

Page Route: /settings/class-location
Page Goal
Manage the global system of Class and Location tracking used across transactions (AR, AP, Bank, Inventory, Payroll). Classes and locations provide multidimensional reporting without altering the core Chart of Accounts.

Key Features
•	Define Class categories (e.g., Business Unit, Profit Center, Product Line)
•	Define Location hierarchies (e.g., Country > Region > Branch)
•	Set defaults for modules (e.g., default location for a user, default class for a project)
•	Enable/disable tracking in each module (AR, AP, Payroll, Inventory)
•	Manage access control (who can edit vs. who can only apply)

Data Table Columns
Column	Data Type	Description
Name	String	Class or Location name
Code	String	Short reference code
Type	Enum	Class / Location
Parent	Reference	Parent in hierarchy (for locations)
Active	Boolean	Whether this value is currently usable

Backend API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/settings/class-location	List classes & locations
POST	/api/companies/:companyId/settings/class-location	Create class/location
PUT	/api/companies/:companyId/settings/class-location/:id	Update
DELETE	/api/companies/:companyId/settings/class-location/:id	Delete (if unused)


============================
CUSTOMER PORTAL (AR SELF-SERVICE)
============================

Page Route: /customer-portal/dashboard (public route, customer-accessible)
Page Goal
Provide self-service portal for customers to view their invoices, make payments, check account balances, and download statements. This reduces AR team workload and improves customer experience. The portal uses a separate public-facing UI layer with limited, read-only access to AR data filtered by customer.

Key Features
•	View all invoices (draft, sent, paid, overdue) with drill-down to line items
•	Make payments directly via integrated payment processor (Stripe, PayMaya, etc.)
•	Download invoices and statements as PDF
•	View account balance and aging summary
•	Auto-generated payment receipts and confirmations
•	Message center for AR team communication (ticketing)
•	Multi-language support (English, Tagalog for Philippines)

Access Control
•	Customer login via email/password or SSO (optional)
•	Portal access linked to customer in AR module
•	View only data belonging to their company/account
•	Payment posting immediately updates AR ledger

Data Table Columns (Customer Invoices View)
Column	Data Type	Description
Invoice #	String	Customer-facing invoice number
Date	DateTime	Invoice date
Due Date	DateTime	Due date for payment
Amount	Currency	Total invoice amount
Paid	Currency	Amount already paid
Balance	Currency	Outstanding balance (Amount - Paid)
Status	Enum	Draft, Sent, Partially Paid, Paid, Overdue
Action	Button	Pay Now, Download PDF

Backend API Endpoints
Method	Endpoint	Purpose	Authentication
GET	/api/customers/:customerId/invoices	List invoices for customer	Customer JWT token
GET	/api/customers/:customerId/invoices/:invoiceId	Get invoice details	Customer JWT token
POST	/api/customers/:customerId/payments	Create payment record	Customer JWT token
GET	/api/customers/:customerId/balance-summary	Get balance and aging	Customer JWT token
POST	/api/customers/:customerId/statements	Request account statement	Customer JWT token
GET	/api/customers/:customerId/messages	List messages from AR team	Customer JWT token

Additional UI Components
•	Login/Registration page (email verification required)
•	Payment processing UI (integrated with Stripe/PayMaya checkout)
•	Receipt & payment confirmation download
•	Support/Help section with FAQ and contact form
•	Account settings (password reset, notification preferences)


============================
TRIAL BALANCE VARIANCE ANALYSIS
============================

Page Route: /accounting/core-accounting/trial-balance/variance-analysis
Page Goal
Extend Trial Balance functionality with period-over-period variance analysis. This allows accountants to quickly identify account movements, unusual fluctuations, and drill down to root causes at the transaction level.

Key Features
•	Compare trial balances across two periods (current vs. previous, or custom date ranges)
•	Display variance amounts and percentages for each account
•	Color-code high-variance accounts (> 10%, > 25%, > 50% thresholds configurable)
•	Drill-down: Click an account variance to see contributing journal entries
•	Variance by transaction source (AR invoices, AP bills, manual JEs, bank reconciliation, etc.)
•	Export variance report to Excel with commentary fields

UI Layout Design
Section	Content
Header	Period selector (From Date, To Date), Comparison Period selector, Variance Threshold selector, Export button
Summary Cards	Total variance (balance change), Positive variance total, Negative variance total, High-variance account count
Variance Table	
  Columns:
    - Account Code
    - Account Name
    - Period 1 Balance
    - Period 2 Balance
    - Variance ($)
    - Variance (%)
    - Variance Category (Asset/Liability/etc.)
    - Status badge (✓ Normal, ⚠ High, 🔴 Critical)
Drill-down Detail	When user clicks variance row: Show list of journal entries / transactions that caused variance
Commentary Section	Notes field for accountant to record variance explanations

Backend API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/accounting/trial-balance/variance	Get variance analysis data
GET	/api/companies/:companyId/accounting/trial-balance/variance/:accountId/transactions	Get transactions contributing to variance
POST	/api/companies/:companyId/accounting/trial-balance/variance/report	Generate and export variance report

Data Model
•	VarianceAnalysis: accountId, period1Balance, period2Balance, variance, variancePercentage, varianceCategory, sourceModules[], commentsSummary
•	VarianceExplanation: varianceId, explainedBy (JE/Invoice/Bill/etc.), transactionId, transactionAmount


============================
RECURRING JOURNAL ENTRIES
============================

Page Route: /accounting/core-accounting/journal-entries/recurring
Page Goal
Enable automation of routine journal entries (e.g., monthly rent, depreciation, insurance, salary accruals). Reduces manual entry errors and ensures consistent monthly entries. When a recurring JE is triggered, it creates a draft JE that can be reviewed and posted.

Key Features
•	Create recurring entry template with line items
•	Set frequency (monthly, quarterly, annually, custom day-of-month)
•	Define start/end dates and optional skip periods
•	Auto-generate draft entries on scheduled date
•	Review and post auto-generated entries (with option to modify amounts)
•	Disable/pause a recurring entry without deleting template
•	Audit trail showing which entries were auto-generated
•	Bulk approve recurring entries generated in a period

UI Layout Design
Section	Content
Recurring Entries List	
  Columns:
    - Template Name
    - Description
    - Frequency
    - Last Generated
    - Next Schedule
    - Status (Active/Paused/Inactive)
    - Action dropdown (Edit, View Generated, Pause, Delete)
Create/Edit Form	
  Fields:
    - Template Name
    - Description
    - Entry Date Pattern (e.g., "15th of each month")
    - Frequency (Monthly/Quarterly/Annually/Custom)
    - Start Date, End Date
    - Auto-post Y/N (if Y: auto-post without approval; if N: create as draft)
    - Line Items (same as normal JE)
    - Is Active toggle

Generated Entries Section	Show all JEs created by this recurring template, with filters for status (Draft, Posted, Rejected)

Backend API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/accounting/journal-entries/recurring	List recurring templates
POST	/api/companies/:companyId/accounting/journal-entries/recurring	Create recurring template
PUT	/api/companies/:companyId/accounting/journal-entries/recurring/:id	Update recurring template
DELETE	/api/companies/:companyId/accounting/journal-entries/recurring/:id	Deactivate recurring template
POST	/api/companies/:companyId/accounting/journal-entries/recurring/:id/generate	Manually trigger generation (for testing)
GET	/api/companies/:companyId/accounting/journal-entries/recurring/:id/history	List entries generated by this template

Scheduled Job
•	Background job runs nightly (configurable time): Check all active recurring templates for date match → Auto-create draft/posted JE
•	Log entry for each generated JE for audit trail
•	Send notification to approvers if auto-posting is disabled

Data Model
•	RecurringJournalEntry: templateId, templateName, frequency, startDate, endDate, nextScheduleDate, lineItems[], autoPost, isActive, createdBy, createdAt
•	GeneratedJournalEntry: journalEntryId, recurringTemplateId, generatedAutomatically, generatedAt


============================
BILL APPROVAL HIERARCHIES
============================

Page Route: /expenses/payables/bill-approval-workflow
Page Goal
Implement organization-specific bill approval workflows where bills are routed to designated approvers based on amount, vendor, expense category, or department. This enforces internal controls and prevents unauthorized payments. Approvals can be sequential (VP approval → CFO approval) or parallel (two manager approvals).

Key Features
•	Define approval rules: (Amount Range, Vendor Category, Expense Type) → Approver(s)
•	Multi-level approval: Sequential (step-by-step) or Parallel (simultaneous) routing
•	Custom approval templates by department, cost center, or project
•	View approval status and pending approver details on each bill
•	Approver dashboard showing pending approvals with due dates
•	Email notifications to approvers (with approval link for quick action)
•	Reject with comments (returns bill to creator with feedback)
•	Auto-escalation: If pending > X days, escalate to manager's manager
•	Audit trail: Who approved, when, and any comments

UI Layout Design
Section	Content
Approval Rules Setup	
  List of configured rules with columns:
    - Rule Name
    - Amount Range (Min-Max)
    - Vendor/Category Filter (optional)
    - Approvers (list of users)
    - Approval Type (Sequential/Parallel)
    - Status (Active/Inactive)
    - Actions (Edit, Duplicate, Delete)
Edit Rule Form	
  Fields:
    - Rule Name
    - Amount Range (0 to ∞)
    - Applies To: All / Specific Vendors / Specific Categories
    - Approver Selection: Search and select users, set order/group
    - Approval Type: Sequential or Parallel
    - Notify approvers Y/N
    - Escalation Days (0 = no escalation)
Bill Approval Card (on Bill Detail page)	
  Shows approval chain with each approver:
    - Approver name, title, approval date (if approved)
    - Status: Pending / Approved / Rejected
    - Comment field (if rejected)
Approver Dashboard	
  - Pending approvals count (by priority: urgent, due soon, normal)
  - List of pending bills: Bill #, Supplier, Amount, Submitted Date, Days Pending, Action (Approve/Reject)

Backend API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/expenses/approval-rules	List approval rules
POST	/api/companies/:companyId/expenses/approval-rules	Create approval rule
PUT	/api/companies/:companyId/expenses/approval-rules/:id	Update approval rule
DELETE	/api/companies/:companyId/expenses/approval-rules/:id	Delete approval rule
POST	/api/companies/:companyId/expenses/bills/:billId/approve	Submit approval
POST	/api/companies/:companyId/expenses/bills/:billId/reject	Reject with comments
GET	/api/companies/:companyId/expenses/approvals/pending	Get approver's pending bills
POST	/api/companies/:companyId/expenses/approvals/escalate	Manually escalate pending approval

Data Model
•	ApprovalRule: ruleId, companyId, ruleName, amountMin, amountMax, vendorFilter, categoryFilter, approverChain[], approvalType (SEQUENTIAL/PARALLEL), isActive
•	ApprovalChain: billId, approverChainId, currentApproverStep, approvers[], approvalStatuses[], rejectionComments, escalatedAt, escalatedTo
•	ApprovalLog: billId, approverId, approvalAction (APPROVED/REJECTED), timestamp, comment


============================
AR AGING WITH COLLECTIONS ALERTS & PREDICTIVE ANALYTICS
============================

Page Route: /sales/aging-collections (enhanced version of existing AR aging)
Page Goal
Extend AR Aging functionality with predictive analytics, automated collection alerts, and dunning workflow recommendations. This enables proactive cash flow management, reduces DSO (Days Sales Outstanding), and optimizes collection efforts.

Key Features
•	Enhanced AR Aging: 30/60/90/120+ day buckets with drill-down to invoice level
•	Predictive Risk Scoring: ML-based scoring (0-100) for each aged invoice predicting likelihood of payment
•	Collection Alert Triggers: Auto-flag overdue invoices (>30, >60, >90 days) with escalation rules
•	Suggested Collection Actions: AI recommends next best action (email reminder, phone call, dunning letter, legal review)
•	Dunning Workflow: Auto-send escalating payment reminders (email, SMS, print) on configurable schedule
•	Customer Payment Trend Analysis: Show payment history (on-time %, average days to pay) for each customer
•	Collections Dashboard: Summary of collection status, at-risk invoices, successful collections, write-off candidates
•	Export Collections List with prioritization for sales team

UI Layout Design
Section	Content
Collections Dashboard Summary	
  Cards showing:
    - Total AR Balance
    - Overdue Balance (>30 days)
    - At-Risk Score (aggregate of aging + payment history)
    - % on-time: Invoices paid within 30 days
    - Estimated Cash Recovery (sum of at-risk invoices with high probability score)
Aging Bucket Table	
  Columns:
    - Customer Name
    - Invoice # (drill-down link)
    - Amount
    - Invoice Date
    - Due Date
    - Days Overdue
    - Payment Status (On Time / 31-60 / 61-90 / 90+ days)
    - Risk Score (0-100, color-coded: green <30, yellow 30-70, red >70)
    - Suggested Action (Email Reminder, Phone Call, Dunning Letter, Legal Review)
    - Collections Status: Not Started / In Progress / Recently Paid / Disputed
    - Action Button (Send Reminder, Log Activity, Mark Paid, Write-off)
Customer Payment Profile	
  (Accessible via drill-down or customer link)
    - Historical AR Balance trend (chart)
    - Payment Timeliness: On-time % (30d, 90d, 1y)
    - Average Days to Pay
    - Largest open invoice
    - Recent payment history (last 5 payments with dates)
Dunning Workflow Schedule	
  (View/edit per customer or globally)
    - Event triggers: Invoice overdue 1d, 7d, 14d, 30d, 45d, 60d, 90d, 120d
    - Action: Email template, SMS, Print letter, Call reminder
    - Status: Active/Paused

Backend API Endpoints
Method	Endpoint	Purpose
GET	/api/companies/:companyId/sales/aging-collections/summary	Get aging & collections dashboard data
GET	/api/companies/:companyId/sales/aging-collections/analyze	Analyze AR with risk scores and recommendations
POST	/api/companies/:companyId/sales/aging-collections/risk-score/:invoiceId	Calculate/recalculate risk score
GET	/api/companies/:companyId/sales/customers/:customerId/payment-profile	Get customer payment history & trends
POST	/api/companies/:companyId/sales/aging-collections/dunning/:invoiceId/trigger	Trigger dunning reminder
POST	/api/companies/:companyId/sales/aging-collections/:invoiceId/collection-action	Log collection activity (call, email, etc.)
GET	/api/companies/:companyId/sales/aging-collections/export	Export collections list with scores

Data Model
•	CollectionsRiskScore: invoiceId, riskScore (0-100), riskCategory (PAID, LOW_RISK, MEDIUM_RISK, HIGH_RISK), paymentProbability, recommendedAction, lastUpdated
•	PaymentProfile: customerId, onTimePercentage (30d/90d/1y), avgDaysToPayment, lastPaymentDate, paymentTrendChart
•	DunningSchedule: companyId, daysOverdueThreshold, action (EMAIL/SMS/PRINT/CALL), emailTemplate, isActive, lastTriggered
•	CollectionActivity: invoiceId, activityType (CALL/EMAIL/LETTER/DISPUTE), activityDate, notes, handledBy, outcome


========================================================================

SUPPLEMENT COMPLETION SUMMARY

This supplement (Parts 29–35) adds comprehensive Page101 specifications for all previously missing pages. Combined with the existing Parts 1–28, the pagecompilation.txt now provides complete coverage of the HaypBooks navigation.

Pages Added in This Supplement
ModulePages AddedRoutes Now Covered
Fixed Assets — Asset Management4/accounting/fixed-assets/asset-management/*
Fixed Assets — Depreciation3/accounting/fixed-assets/depreciation/*
Fixed Assets — Asset Lifecycle5/accounting/fixed-assets/asset-lifecycle/*
Fixed Assets — Insurance3/accounting/fixed-assets/insurance/*
Fixed Assets — Reports4/accounting/fixed-assets/reports/*
Period Close7/accounting/period-close/*
Planning3/accounting/planning/*
Banking & Cash — Transactions3/banking-cash/transactions/*
Banking & Cash — Reconciliation sub-pages3/banking-cash/reconciliation/* (history, archive, reports)
Banking & Cash — Cash Accounts2/banking-cash/cash-accounts/*
Banking & Cash — Deposits2/banking-cash/deposits/*
Banking & Cash — Bank Feeds2/banking-cash/bank-feeds/*
Banking & Cash — Credit Cards2/banking-cash/credit-cards/*
Banking & Cash — Checks2/banking-cash/checks/*
Banking & Cash — Cash Management2/banking-cash/cash-management/*
Banking & Cash — Treasury3/banking-cash/treasury/*
Sales — Collections2/sales/write-offs, /sales/collections
Sales — Dunning (ENT)1/sales/dunning
Expenses — Recurring Bills1/expenses/recurring-bills
Expenses — Payment Runs1/expenses/payment-runs
Payroll — Workforce Management5/payroll-workforce/workforce/*
Payroll — Time & Leave4/payroll-workforce/time-leave/*
Payroll — Payroll Processing Secondary6/payroll-workforce/payroll-processing/* (off-cycle to history)
Payroll — Compensation4/payroll-workforce/compensation/*
Payroll — Payroll Taxes3/payroll-workforce/payroll-taxes/*
Taxes — Tax Setup5/taxes/tax-setup/*
Taxes — Sales Output Tax2/taxes/sales-output-tax/*
Taxes — Purchase Input Tax2/taxes/purchase-input-tax/*
Taxes — Tax Reporting4/taxes/tax-reporting/*
Taxes — Filing & Payments4/taxes/filing-payments/*
Taxes — Year-End2/taxes/year-end/*
Inventory — Catalog Setup3/inventory/categories, /inventory/uoms, /inventory/bundles
Inventory — Receiving3/inventory/receiving/*
Inventory — Stock Operations4/inventory/stock/*
Inventory — Warehousing (ENT)3/inventory/warehousing/*
Inventory — Inventory Control4/inventory/control/*
Inventory — Valuation2/inventory/valuation/*
Inventory — Insights1/inventory/insights
Time — Timesheets1/time/timesheets
Time — Timer1/time/timer
Time — Review2/time/review/*
Time — Analysis3/time/analysis/*
Reporting — Saved Views1/reporting-analytics/saved-views
Reporting — ESG (ENT)1/reporting-analytics/esg-reporting

TOTAL PAGES ADDED: ~92 pages
CUMULATIVE COVERAGE: ~285 pages fully documented

March 2026 | HaypBooks Page101 Supplement — End of Document
========================================================================
APPENDIX A: ROUTE VERIFICATION REPORT
Generated: March 2026 -- Verified against ownerNavConfig.ts + src/app/(owner) filesystem scan
========================================================================

Legend:
  OK     = route confirmed in ownerNavConfig.ts AND exists as page.tsx in filesystem
  FIXED  = route was wrong in this doc -- corrected in this revision
  ORPHAN = page.tsx exists in filesystem but NOT registered in ownerNavConfig.ts
  PLAN   = documented route not yet in nav or filesystem (planned feature)

------------------------------------------------------------------------
PART 1  -- CORE ACCOUNTING
------------------------------------------------------------------------
Status  Route (after corrections)
OK      /accounting/core-accounting/chart-of-accounts
OK      /accounting/core-accounting/journal-entries
OK      /accounting/core-accounting/general-ledger
OK      /accounting/core-accounting/trial-balance

------------------------------------------------------------------------
PART 2  -- ACCOUNTS RECEIVABLE  (5 routes corrected)
------------------------------------------------------------------------
Status  Route (after corrections)                      Was (before)
FIXED   /sales/customers/customers                     /sales/customers
FIXED   /sales/billing/invoices                        /sales/invoices
FIXED   /sales/collections/customer-payments           /sales/payments
FIXED   /sales/sales-operations/quotes-estimates       /sales/quotes
FIXED   /sales/collections/ar-aging                    /sales/aging

------------------------------------------------------------------------
PART 3  -- ACCOUNTS PAYABLE  (5 routes corrected)
------------------------------------------------------------------------
Status  Route (after corrections)                      Was (before)
FIXED   /expenses/vendors/vendors                      /expenses/vendors
FIXED   /expenses/payables/bills                       /expenses/bills
FIXED   /expenses/payables/bill-payments               /expenses/payments
FIXED   /expenses/purchasing/purchase-orders           /expenses/purchase-orders
FIXED   /expenses/payables/ap-aging                    /expenses/aging
ORPHAN  /expenses/aging                                page.tsx EXISTS in filesystem but has NO nav entry in ownerNavConfig.ts. Recommend audit: redirect or remove.

------------------------------------------------------------------------
PART 4  -- BANKING & CASH  (10 routes, all correct)
------------------------------------------------------------------------
Status  Route
OK      /banking-cash/bank-connections/connected-banks
OK      /banking-cash/transactions/bank-transactions
OK      /banking-cash/reconciliation/reconcile
OK      /banking-cash/cash-accounts/bank-accounts
OK      /banking-cash/deposits/undeposited-funds
OK      /banking-cash/bank-feeds/feed-connections
OK      /banking-cash/credit-cards/credit-card-accounts
OK      /banking-cash/checks/check-register
OK      /banking-cash/cash-management/cash-position
OK      /banking-cash/treasury/intercompany-transfers

------------------------------------------------------------------------
PART 5  -- PAYROLL & WORKFORCE  (5 routes, all correct)
------------------------------------------------------------------------
Status  Route
OK      /payroll-workforce/workforce/employees
OK      /payroll-workforce/time-leave/leave-requests
OK      /payroll-workforce/payroll-processing/payroll-runs
OK      /payroll-workforce/compensation/salary-structures
OK      /payroll-workforce/payroll-taxes/tax-withholding

------------------------------------------------------------------------
PART 6  -- TAX  (7 routes, all correct)
------------------------------------------------------------------------
Status  Route
OK      /taxes/tax-setup/tax-rates
OK      /taxes/sales-output-tax/vat-sales-tax
OK      /taxes/purchase-input-tax/input-vat
OK      /taxes/purchase-input-tax/expanded-withholding
OK      /taxes/tax-reporting/tax-summary
OK      /taxes/filing-payments/tax-returns
OK      /taxes/year-end/annual-tax-summary

------------------------------------------------------------------------
PART 7  -- INVENTORY  (4 routes: 3 corrected, 1 already correct)
------------------------------------------------------------------------
Status  Route (after corrections)                          Was (before)
FIXED   /inventory/setup/inventory-items                   /inventory/items
OK      /inventory/receiving/purchase-orders               (already correct)
FIXED   /inventory/stock-operations/stock-movements        /inventory/stock/movements
FIXED   /inventory/valuation/inventory-valuation           /inventory/valuation

------------------------------------------------------------------------
PART 8  -- PROJECTS & TIME  (4 routes, all corrected)
------------------------------------------------------------------------
Status  Route (after corrections)                          Was (before)
FIXED   /projects/project-setup/projects                   /projects/projects
FIXED   /time/entry/time-entries                           /time/entries
FIXED   /projects/billing/project-billing                  /projects/billing
FIXED   /projects/financials/project-profitability         /projects/financials/profitability

------------------------------------------------------------------------
PART 9  -- HOME  (3 routes, all correct)
------------------------------------------------------------------------
Status  Route
OK      /home/dashboard
OK      /home/business-health
OK      /home/shortcuts

------------------------------------------------------------------------
SECTION 2  -- TASKS & APPROVALS  (all correct)
------------------------------------------------------------------------
Status  Route
OK      /tasks-approvals/my-work/my-tasks
OK      /tasks-approvals/my-work/my-approvals
OK      /tasks-approvals/my-work/my-exceptions
OK      /tasks-approvals/my-work/overdue-items
OK      /tasks-approvals/management/team-tasks
OK      /tasks-approvals/management/approval-queue

------------------------------------------------------------------------
REPORTING  (4 routes corrected: prefix was /reporting-analytics/)
------------------------------------------------------------------------
Status  Route (after corrections)                          Was (before)
FIXED   /reporting/financial-statements                    /reporting-analytics/financial-statements
FIXED   /reporting/standard-reports                        /reporting-analytics/standard-reports
FIXED   /reporting/custom-reports                          /reporting-analytics/custom-reports
FIXED   /reporting/performance-center                      /reporting-analytics/performance-center

------------------------------------------------------------------------
PRACTICE HUB SECTION  -- PLANNED ROUTES (not yet implemented)
------------------------------------------------------------------------
Status  Route
PLAN    /practice-hub/home/dashboard
PLAN    /practice-hub/clients/client-list
PLAN    /practice-hub/work-management/work-queue
PLAN    /practice-hub/work-management/monthly-close
PLAN    /practice-hub/settings/practice-profile
PLAN    (and all other /practice-hub/* routes)

NOTE: The currently implemented accountant workspace uses /accountant-workspace/* routes:
OK      /accountant-workspace/client-overview
OK      /accountant-workspace/books-review
OK      /accountant-workspace/reconciliation-hub
OK      /accountant-workspace/adjusting-entries
OK      /accountant-workspace/client-requests
OK      /accountant-workspace/my-accountant
OK      /accountant-workspace/live-experts

------------------------------------------------------------------------
GREP SCAN SUMMARY  -- Duplicate / Conflicting Route Check
------------------------------------------------------------------------
Filesystem scan of src/app/(owner): 290+ page.tsx files checked.
RESULT: No duplicate route definitions found.
       Each route path maps to exactly one page.tsx file.

ORPHANED FILES (exist in filesystem, no nav entry):
  - /expenses/aging/page.tsx  (nav entry is /expenses/payables/ap-aging)

------------------------------------------------------------------------
CORRECTION SUMMARY
------------------------------------------------------------------------
Total route corrections applied in this revision: 21
  - Part 2 AR:        5 routes corrected
  - Part 3 AP:        5 routes corrected
  - Part 7 Inventory: 3 routes corrected
  - Part 8 Projects:  4 routes corrected
  - Reporting:        4 routes corrected

Cross-references added: 8 module pages
  Chart of Accounts, Journal Entries, AR Invoices, AP Bills,
  Bank Transactions, Bank Reconciliation, Payroll Runs, Tax Summary

========================================================================
END OF APPENDIX A
========================================================================
