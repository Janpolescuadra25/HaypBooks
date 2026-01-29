# Implementation sequence (CPA‑grade)

This sequence focuses on correctness, auditability, and close‑readiness first. Each step lists the primary schema areas it touches.

## 1) Scope + accounting policy decisions (Day 0)
- Decide: GAAP/IFRS, tax jurisdictions, multi‑currency handling, period definitions, and rounding rules.
- Output: policy memo + config defaults (currency, fiscal year start, price/tax inclusive, accrual vs cash).
- Schema touchpoints: Company, Currency, ExchangeRate, AccountingPeriod.

## 2) Enforce DB constraints (Day 1)
- Apply CHECK constraints for scope XORs and date ranges.
- Output: migration applying docs/db_constraints.sql.
- Schema touchpoints: Subscription, OnboardingStep, AuditLog, Task, RefundApproval, WriteOff, AccountingPeriod, PostingLock, ApprovalThreshold.

## 3) Seed foundation masters (Day 1–2)
- Seed chart of accounts, account types/subtypes, tax codes/rates, payment terms/methods, default price list, default bank account.
- Output: seed script + baseline COA.
- Schema touchpoints: AccountType, AccountSubType, Account, TaxCode, TaxRate, TaxCodeRate, TaxCodeAccount, PaymentTerm, PaymentMethod, PriceList, BankAccount.

## 4) Posting engine + validations (Day 2–4)
- Implement journal creation and validation rules: balanced entries, base currency conversions, and posting status transitions.
- Output: posting service + tests.
- Schema touchpoints: JournalEntry, JournalEntryLine, ExchangeRate, PostingStatus, PostingModule.

## 5) Core AR workflows (Day 4–6)
- Quote → Invoice → PaymentReceived → BankDeposit → JournalEntry.
- Output: end‑to‑end AR flows with posting.
- Schema touchpoints: Quote, QuoteLine, Invoice, InvoiceLine, PaymentReceived, InvoicePaymentApplication, BankDeposit, BankDepositLine.

## 6) Core AP workflows (Day 6–8)
- PurchaseOrder → Bill → BillPayment → JournalEntry.
- Output: end‑to‑end AP flows with posting.
- Schema touchpoints: PurchaseOrder, PurchaseOrderLine, Bill, BillLine, BillPayment, BillPaymentApplication.

## 7) Refunds + write‑offs (Day 8–9)
- Customer/Vendor refunds with approvals; write‑offs with GL account mapping and journal links.
- Output: approvals and write‑off flows.
- Schema touchpoints: CustomerRefund, VendorRefund, RefundApproval, RefundReason, WriteOff, ApprovalThreshold.

## 8) Inventory + cost layers + COGS automation (Day 9–11)
- Inventory transactions with FIFO cost layers and serial/lot tracking.
- On invoice post: create COGSRecognition and journal entry (Dr COGS, Cr Inventory), reduce layers.
- Output: inventory postings with COGS/asset accounts.
- Schema touchpoints: InventoryTransaction, InventoryTransactionLine, InventoryCostLayer, StockLevel, COGSRecognition.

## 9) Payroll processing + accruals (Day 11–12)
- Payroll run → paychecks → PayrollAccrual + PayrollTaxLiability + payments.
- Output: payroll postings and liability tracking.
- Schema touchpoints: PayrollRun, Paycheck, PayrollAccrual, PayrollTaxLiability, PayrollTaxPayment.

## 10) Bank reconciliation (Day 12–13)
- Reconcile bank account transactions to ledger/bank feeds.
- Output: reconciliation workflow + reports.
- Schema touchpoints: BankTransaction, BankReconciliation, BankReconciliationLine.

## 11) Period close + locks (Day 13–15)
- Implement period close checklist, locks, and reversal policies.
- Output: close process with lock enforcement in services.
- Schema touchpoints: AccountingPeriod, PostingLock, Reversal, AuditLog.

## 12) Reporting pack (Day 15–17)
- Trial balance, P&L, balance sheet, cash flow, aging, and audit trail.
- Output: reporting queries + snapshots.
- Schema touchpoints: FinancialStatementSnapshot, SavedReport, AccountBalance.

## 13) Controls + QA (Day 17–19)
- Approval rules, role permissions, audit coverage, and negative‑test cases.
- Output: test suite + control matrix.
- Schema touchpoints: Role, Permission, RolePermission, Approval, AuditLog.

## 14) Data migration + go‑live (Day 20–22)
- Import historical balances, validate TB, lock prior period, then go live.
- Output: migration scripts + reconciliation sign‑off.
- Schema touchpoints: OpeningBalance, AccountBalance, JournalEntry.

---

## Immediate next actions (recommended)
1) Apply new constraints in docs/db_constraints.sql.
2) Create seed data for COA + tax + payment terms/methods.
3) Build posting engine and enforce posting locks in service layer.
4) Implement AR flow end‑to‑end and validate journal outputs.

If you want, I can generate the seed scripts and posting‑engine validation checklist next.