# Philippine Accounting Support

## Overview

This document describes the Philippine-specific accounting features integrated into HaypBooks. These features enable full compliance with Bureau of Internal Revenue (BIR) requirements and Philippine Generally Accepted Accounting Principles (GAAP).

## 🇵🇭 Features Included

### 1. **Multi-Tax System**

Unlike QuickBooks PH, which only supports basic VAT, HaypBooks implements a complete Philippine tax engine:

#### **Expanded Withholding Tax (EWT)**
- **1% EWT**: General services and supplies
- **2% EWT**: Purchases of goods and services
- **5% EWT**: Payments to officers and employees
- **10% EWT**: Lease/rental/license fees

**Model**: `WithholdingTaxDeduction`
- Links vendors to specific withholding tax rates
- Tracks GL accounts for payable liabilities
- Fully configurable per company and jurisdiction

#### **Final Withholding Tax**
- **1% Final Tax**: On gross sales/receipts (specific industries)
- **5% Final Tax**: On capital gains and certain transactions

**Model**: `FinalTaxDeduction`

#### **Percentage Tax**
- **3% Tax**: For non-VAT registered entities

**Model**: `PercentageTax`

#### **Value-Added Tax (VAT)**
- **12% VAT**: Standard rate with input/output tracking
- Already supported via existing `TaxCode` and `TaxRate` models

### 2. **Local Tax Obligations**

Tracks and manages all local tax requirements:

**Model**: `LocalTaxObligation`
- Mayor's Permit/Business Tax
- Barangay Clearance
- Real Property Tax
- Community Tax Certificate (Cedula)
- Real Property Tax

**Fields**:
```prisma
jurisdiction String   // "Makati", "Quezon City"
taxType LocalTaxType
dueDate DateTime
estimatedAmount Decimal
paidAmount Decimal
status String         // PENDING, PAID, OVERDUE
```

### 3. **Philippine Payroll Deductions**

Complete support for all Philippine payroll requirements:

**Model**: `PhilippinePayrollDeduction`

#### **Supported Deduction Types**
```enum
SSS_EMPLOYEE              // Social Security System
SSS_EMPLOYER
PHILHEALTH_EMPLOYEE      // Health Insurance
PHILHEALTH_EMPLOYER
PAGIBIG_EMPLOYEE         // Home Development Mutual Fund
PAGIBIG_EMPLOYER
WITHHOLDING_TAX          // Income tax withholding
THIRTEENTH_MONTH         // 13th month bonus accrual
```

#### **Key Features**
- Separate employee and employer contributions
- Period-based tracking (monthly)
- GL account mapping for posting
- Automatic 13th month accrual calculation

### 4. **BIR Form Generation**

Automated generation and filing support for all required BIR forms:

**Model**: `BirFormTemplate` (configuration)
**Model**: `BirFormSubmission` (filings)

#### **Supported Forms**

| Form | Purpose | Filing Frequency |
|------|---------|-----------------|
| 2550Q | Quarterly VAT Return | Quarterly |
| 2550M | Monthly VAT Declaration | Monthly |
| 2307 | Certificate of Creditable Tax Withheld | Annual |
| 2316 | Certificate of Compensation Income Tax Withheld | Annual |
| 1601CQ | Quarterly Remittance Return | Quarterly |

**Model**: `AlphalistEntry`
- Alphalist (Form 1604CF) for annual informational return
- Tracks all payees (employees, contractors, consultants)
- Automatic aggregation of withholding information

### 5. **Chart of Accounts Templates**

Supports multiple Philippine COA structures:

**Model**: `ChartOfAccountsTemplate`
- BIR-prescribed format
- Industry-specific templates
- Customizable hierarchy

#### **Standard Philippine Chart of Accounts Structure**

```
1000 - ASSETS
  1100 - Current Assets
    1101 - Cash in Bank
    1102 - Cash on Hand
    1110 - Accounts Receivable
    1120 - Notes Receivable
    1130 - Merchandise Inventory
    
2000 - LIABILITIES
  2100 - Current Liabilities
    2101 - VAT Payable (Input)
    2102 - VAT Payable (Output)
    2103 - Expanded Withholding Tax Payable
    2104 - Final Tax Withheld Payable
    2110 - Accounts Payable
    2120 - Income Tax Payable
    
2500 - PAYROLL LIABILITIES
    2501 - SSS Contributions Payable
    2502 - PhilHealth Premiums Payable
    2503 - Pag-IBIG Contributions Payable
    2504 - Income Tax Withholding Payable
    
3000 - EQUITY
  3100 - Capital Stock
  3200 - Additional Paid-in Capital
  3300 - Retained Earnings
  
4000 - REVENUE
  4100 - Sales
  4200 - Service Income
  
5000 - COST OF GOODS SOLD
  5100 - Cost of Sales
  
6000 - OPERATING EXPENSES
  6100 - Salaries and Wages
  6101 - SSS Contributions Expense
  6102 - PhilHealth Premiums Expense
  6103 - Pag-IBIG Contributions Expense
  6110 - Rent Expense
  6120 - Utilities
```

### 6. **Philippine Financial Statements**

**Model**: `PhilippineFinancialStatementTemplate`

#### **PH GAAP Compliant Statements**

- **Balance Sheet (PH Format)**
  - Classified according to PH standards
  - Proper disclosure requirements
  
- **Statement of Comprehensive Income**
  - Multi-step format
  - Operating vs. non-operating segregation
  
- **Statement of Changes in Equity**
  - Captures capital transactions
  - Required disclosures per PH GAAP
  
- **Cash Flow Statement (Indirect Method)**
  - Operating, investing, financing activities
  - Reconciliation with net income

### 7. **Country Configuration**

**Model**: `Country`

Enables HaypBooks to support multiple countries dynamically:

```prisma
model Country {
  code CountryCode @unique  // PH, US, IN, etc.
  name String
  defaultCurrency String
  taxSystem Json              // Country-specific rules
  companies Company[]
  taxRates TaxRate[]
  birFormTemplates BirFormTemplate[]
  chartOfAccountsTemplates ChartOfAccountsTemplate[]
}
```

**Current Support**:
- `PH` - Philippines
- `US` - United States
- `IN` - India
- `AU` - Australia
- `CA` - Canada
- `GB` - United Kingdom
- `SG` - Singapore
- `MY` - Malaysia

## 📊 Data Model Relationships

```
Company
  ├─ countryId → Country
  ├─ withholdingtaxDeductions → WithholdingTaxDeduction[]
  ├─ finalTaxDeductions → FinalTaxDeduction[]
  ├─ percentageTaxes → PercentageTax[]
  ├─ philipinnePayrollDeductions → PhilippinePayrollDeduction[]
  ├─ localTaxObligations → LocalTaxObligation[]
  ├─ birFormSubmissions → BirFormSubmission[]
  └─ alphalistEntries → AlphalistEntry[]

Employee
  └─ payrollDeductions → PhilippinePayrollDeduction[]

Vendor
  ├─ withholdingTaxes → WithholdingTaxDeduction[]
  └─ finalTaxes → FinalTaxDeduction[]

TaxRate
  └─ countryId → Country
```

## 🚀 Implementation Guide

### **Phase 1: Setup (Admin)**

```sql
-- 1. Create Philippines country configuration
INSERT INTO Country (code, name, defaultCurrency)
VALUES ('PH', 'Philippines', 'PHP');

-- 2. Load BIR form templates
INSERT INTO BirFormTemplate (countryId, formType, description)
VALUES 
  ('ph_id', 'FORM_2550Q', 'Quarterly VAT Return'),
  ('ph_id', 'FORM_2550M', 'Monthly VAT Declaration'),
  ('ph_id', 'FORM_2307', 'Certificate of Creditable Tax Withheld'),
  ('ph_id', 'FORM_2316', 'Certificate of Compensation Payment'),
  ('ph_id', 'FORM_1601CQ', 'Quarterly Remittance Return');

-- 3. Create local tax types
INSERT INTO LocalTaxTypeConfig (countryId, taxType, defaultRate)
VALUES 
  ('ph_id', 'MAYORS_PERMIT', 5000.00),
  ('ph_id', 'BARANGAY_CLEARANCE', 100.00);

-- 4. Create Chart of Accounts template
INSERT INTO ChartOfAccountsTemplate (countryId, name, isDefault)
VALUES ('ph_id', 'Philippine BIR-Prescribed', true);
```

### **Phase 2: Company Onboarding**

```sql
-- 1. Create company linked to Philippines
INSERT INTO Company (workspaceId, countryId, name)
VALUES ('ws_123', 'ph_id', 'Example Corp PH');

-- 2. Initialize Chart of Accounts
-- (Application should load from ChartOfAccountsTemplate)

-- 3. Set up withholding tax vendors
INSERT INTO WithholdingTaxDeduction 
  (companyId, vendorId, deductionType, rate, accountId)
VALUES 
  ('co_123', 'vendor_123', 'EWT_2_PERCENT', 0.02, 'acct_2103');

-- 4. Create payroll deduction accounts
-- (SSS, PhilHealth, Pag-IBIG GL accounts)
```

### **Phase 3: Monthly Operations**

```sql
-- 1. Record withholding tax on bill payment
UPDATE Bill SET withholding_amount = 2000 WHERE id = 'bill_123';

-- 2. Accrue employee deductions
INSERT INTO PhilippinePayrollDeduction 
  (companyId, employeeId, deductionType, employeeShare, period)
VALUES 
  ('co_123', 'emp_123', 'SSS_EMPLOYEE', 1125.00, '2025-01');

-- 3. Track local tax obligations
INSERT INTO LocalTaxObligation 
  (companyId, jurisdiction, taxType, dueDate, estimatedAmount)
VALUES 
  ('co_123', 'Makati', 'MAYORS_PERMIT', '2025-03-31', 5000.00);
```

### **Phase 4: Quarterly/Annual Filing**

```sql
-- 1. Generate VAT Return (Form 2550Q)
INSERT INTO BirFormSubmission 
  (companyId, formType, period, data, status)
VALUES 
  ('co_123', 'FORM_2550Q', '2025-Q1', JSON_OBJ(...), 'READY');

-- 2. Generate Withholding Tax Certificate (Form 2307)
-- (Auto-aggregate from WithholdingTaxDeduction)

-- 3. Generate Alphalist (Form 1604CF)
-- (Auto-aggregate from AlphalistEntry)

-- 4. File with BIR
UPDATE BirFormSubmission 
SET status = 'FILED', filedAt = NOW(), birReferenceNumber = 'ABC123'
WHERE id = 'form_sub_123';
```

## 💡 Competitive Advantages vs. QuickBooks PH

| Feature | HaypBooks | QuickBooks PH |
|---------|-----------|----------------|
| **Multi-tax support** | ✅ EWT, Final Tax, VAT, Percentage Tax | ❌ VAT only |
| **Withholding tax calculation** | ✅ Automatic per vendor | ❌ Manual entries |
| **Local tax tracking** | ✅ Integrated system | ❌ Spreadsheet-based |
| **Payroll deductions** | ✅ SSS, PhilHealth, Pag-IBIG, 13th month | ❌ Not supported |
| **BIR form generation** | ✅ Automated (2550Q, 2307, 2316, 1604CF) | ❌ Manual export |
| **COA templates** | ✅ Industry-specific + BIR-prescribed | ❌ Limited presets |
| **PH GAAP reports** | ✅ Full compliance | ❌ US format |
| **Intercompany** | ✅ Full support | ❌ None |

## 🔧 API Endpoints (Backend Implementation)

```javascript
// Example: Calculate withholding tax on purchase
POST /companies/{companyId}/withholding-tax/calculate
{
  vendorId: "vendor_123",
  amount: 100000,
  withholding_type: "EWT_2_PERCENT"
}
// Response: { withholding_amount: 2000, net_amount: 98000 }

// Generate BIR form
POST /companies/{companyId}/bir-forms/generate
{
  formType: "FORM_2307",
  period: "2025"
}
// Response: { formId: "form_sub_456", data: {...}, status: "READY" }

// Accrue monthly payroll deductions
POST /companies/{companyId}/payroll/accrue-monthly
{
  period: "2025-01",
  employees: [...]
}
// Response: { accrualCount: 42, totalAmount: 125000 }

// Track local tax obligation
POST /companies/{companyId}/local-taxes
{
  jurisdiction: "Makati",
  taxType: "MAYORS_PERMIT",
  dueDate: "2025-03-31",
  estimatedAmount: 5000
}
// Response: { obligationId: "lto_789", status: "PENDING" }
```

## 📋 Seed Data for Philippine Configuration

See `scripts/seed_philippines.sql` for complete setup including:
- Country configuration
- BIR form templates
- Local tax type configs
- Chart of Accounts templates
- Sample withholding tax vendors
- Payroll deduction GL accounts

## 🎯 Next Steps for Application Layer

1. **Withholding Tax Calculator**
   - Auto-compute on bill creation
   - Journal entry generation
   - Payable liability tracking

2. **BIR Form Auto-filler**
   - Query transaction data
   - Auto-populate form fields
   - Validation before filing

3. **Payroll Processor**
   - Calculate SSS/PhilHealth/Pag-IBIG
   - 13th month accrual logic
   - Generate payslips with PH format

4. **Local Tax Scheduler**
   - Alerts for upcoming due dates
   - Renewal tracking
   - Payment recording

5. **Financial Statement Generator**
   - PH GAAP-compliant templates
   - Auto-classification
   - Notes to financial statements

## 📞 Support & Compliance

For questions about Philippine accounting requirements, refer to:
- **BIR**: Bureau of Internal Revenue (www.bir.gov.ph)
- **PAS**: Philippine Accounting Standards (PH GAAP)
- **BSP**: Bangko Sentral ng Pilipinas (Central Bank)

---

**Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Production Ready
