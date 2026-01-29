# Unified Accounting Schema Capabilities

## Core Ledgers
- **Multi-Entity:** `Workspace` > `Company` > `Branch/Location`.
- **General Ledger:** `JournalEntry` (Double-entry core), `Account` (Universal COA).
- **Audit:** `AuditLog` tracks all changes.

## Industry Modules

### 1. Manufacturing (Inventory & Production)
- **BOM & Assembly:** `AssemblyBuild` takes Components (`Item`) and produces Finished Goods.
- **Tracking:** `InventoryTransactionLine` supports Serial #, Lot #, and Expiration Dates.
- **Costing:** Automated weighted average or FIFO (handled via application logic + `InventoryCostLayer`).

### 2. Construction & Professional Services (Project Accounting)
- **Projects:** `Project` entity links to every transaction line (Invoice, Bill, Journal).
- **Estimates:** `Quote` entity for bidding.
- **Retainage:** Supported via `Account` types (Asset/Liability).

### 3. Retail & E-Commerce
- **Point of Sale:** `Invoice` works as Sales Receipt (if paid immediately).
- **Inventory:** Multi-location inventory (`Location`).
- **Tracking:** Batch/Lot tracking for perishable goods.

### 4. SaaS / Subscription
- **Revenue Recognition:** `RevenueSchedule` amortizes revenue over time (Deferred Revenue).
- **Billing:** `Invoice` with recurring support (via Service items).

### 5. Services (Time & Expense)
- **Expenses:** `ExpenseClaim` workflow for employees.
- **Time Tracking:** `TimeEntry` linked to Projects.

## Automation & Banking
- **Bank Feeds:** `BankStatement` + `BankTransaction` + `BankFeedRule` for auto-reconciliation.
- **Reporting:** `SavedReport` engine.

## Lifecycle Coverage
- **Order to Cash:** Quote -> Sales Order (via Quote status) -> Invoice -> Payment -> Bank Deposit.
- **Procure to Pay:** Purchase Order (use Quote/Bill type) -> Bill -> Bill Payment -> Bank Withdrawal.
- **Record to Report:** Auto-journals, Bank Rec, Financial Statements.
