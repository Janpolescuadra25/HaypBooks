# Seed guidance (CPA‑grade)

This outlines the minimum system accounts and setup values to seed per company.

## 1) Core equity + closing
- Retained Earnings (Equity)
- Income Summary (Equity / temp)
- Owner Draw / Dividends (Equity, contra)

## 2) Depreciation
- Depreciation Expense (Expense)
- Accumulated Depreciation (Contra‑Asset)

## 3) Taxes
- Sales Tax Payable (Liability)
- Payroll Tax Payable (Liability)

## 4) Accruals/deferrals
- Prepaid Expenses (Asset)
- Accrued Expenses (Liability)
- Deferred Revenue (Liability)
- Accrued Revenue (Asset)

## 5) AR/AP contra
- Allowance for Doubtful Accounts (Contra‑Asset)
- Sales Returns/Discounts (Contra‑Revenue)
- Purchase Returns/Discounts (Contra‑Expense)

## 6) System account auto‑creation (recommended)
Create these on company setup and mark `isSystem = true`:
- 3000 Retained Earnings (Equity)
- 3900 Income Summary (Temporary Equity)
- 1820 Accumulated Depreciation (Contra‑Asset)
- 1830 Inventory Reserve (Contra‑Asset)
- 2200 Sales Tax Payable (Liability)
- 2210 Payroll Tax Payable (Liability)
- 2220 Wages Payable (Liability)
- 5100 Cost of Goods Sold (Expense)

## 7) Recommended default config
- Default payment terms (Net 30)
- Default payment methods (ACH, Check, Card)
- Default price list (Retail)
- Base currency and fiscal year start

## 8) COA types/subtypes + cash flow mapping
- Seed `AccountType` with categories (Asset/Liability/Equity/Revenue/Expense).
- Seed `AccountSubType` per company to match your COA (e.g., Cash, AR, Inventory, AP).
- Classify key accounts with `cashFlowType` and/or `CashFlowCategory` for statement prep.

If you want, I can generate a seed script from your COA spreadsheet and wire these to the new models.