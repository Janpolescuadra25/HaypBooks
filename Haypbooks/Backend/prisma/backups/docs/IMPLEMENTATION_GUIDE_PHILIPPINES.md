# Philippine Accounting Implementation Guide

## Quick Reference: What QuickBooks PH Doesn't Have (But You Do Now)

| Requirement | QB PH | HaypBooks | Impact |
|---|---|---|---|
| **EWT Calculation** | ❌ Manual | ✅ Automatic | Save 2+ hrs/month |
| **SSS/PhilHealth/Pag-IBIG** | ❌ Spreadsheet | ✅ Integrated | Eliminate errors |
| **Form 2307 Filing** | ❌ Manual export | ✅ Auto-generate | Same-day filing |
| **Form 2316 Generation** | ❌ Not possible | ✅ Auto-populate | Instant compliance |
| **Local Tax Tracking** | ❌ External sheet | ✅ Integrated calendar | Never miss deadline |
| **13th Month Accrual** | ❌ Manual calc | ✅ Automatic monthly | 100% accuracy |
| **VAT Input/Output** | ✅ Partial | ✅ Full tracking | Better reporting |

---

## Implementation Roadmap

### **Phase 1: Setup (Immediate - Day 1-3)**

#### **1.1 Initialize Country Configuration**

```sql
-- Insert Philippines as a country
INSERT INTO Country (id, code, name, defaultCurrency)
VALUES 
  ('country_ph_2025', 'PH', 'Philippines', 'PHP');

-- Load all BIR form templates, local tax types, and COA templates
-- Run: scripts/seed_philippines.sql
```

**Action Items**:
- [ ] Confirm Philippines country record exists
- [ ] Run seed script to populate templates
- [ ] Verify BIR form templates loaded (check: 5 forms)
- [ ] Verify local tax types loaded (check: 5 types)
- [ ] Verify COA template loaded

---

### **Phase 2: Company Onboarding (Day 4-7)**

#### **2.1 Create Company with Philippines Configuration**

When creating a company, select:
```javascript
{
  name: "Company Name",
  countryId: "country_ph_2025",
  currency: "PHP",
  taxId: "123-456-789-000",  // BIR TIN
  vatRegistered: true,        // If VAT-registered
  businessType: "Corporation",
  industry: "Retail Trade"
}
```

#### **2.2 Initialize Chart of Accounts**

Use the Philippine BIR-Prescribed template:

```javascript
POST /api/companies/{companyId}/accounts/init-from-template
{
  templateId: "ph_bir_coa_template_id",
  copyDefaults: true
}
```

**Result**: Creates ~50 standard PH COA accounts

**Key Accounts**:
- `1101` - Cash in Bank
- `1130` - Merchandise Inventory
- `2101` - VAT Payable (Output)
- `2102` - VAT Payable (Input)
- `2103` - Expanded Withholding Tax Payable
- `2501` - SSS Contributions Payable
- `2502` - PhilHealth Premiums Payable
- `2503` - Pag-IBIG Contributions Payable
- `4100` - Sales
- `5100` - Cost of Sales
- `6100` - Salaries and Wages
- `6101` - SSS Contributions Expense

#### **2.3 Verify Account Structure**

```sql
SELECT account_code, account_name 
FROM Account 
WHERE companyId = 'company_id_here'
ORDER BY account_code
LIMIT 10;
```

---

### **Phase 3: Tax Configuration (Day 8-10)**

#### **3.1 Set Up Withholding Tax Vendors**

For each vendor subject to EWT:

```javascript
POST /api/companies/{companyId}/withholding-tax/vendors
{
  vendorId: "vendor_123",
  deductionType: "EWT_2_PERCENT",  // 2% for goods/services
  accountId: "acct_2103",           // Withholding tax payable
  rate: 0.02,
  jurisdiction: "NATIONAL"
}
```

**Common Scenarios**:
- Supplies vendor → `EWT_2_PERCENT`
- Service provider → `EWT_2_PERCENT` or `EWT_5_PERCENT`
- Leasing company → `EWT_10_PERCENT`
- Contractor → `EWT_5_PERCENT`

#### **3.2 Configure Final Tax (if applicable)**

For entities subject to final tax:

```javascript
POST /api/companies/{companyId}/final-tax
{
  taxType: "FINAL_TAX_1_PERCENT",
  rate: 0.01,
  accountId: "acct_2104"
}
```

#### **3.3 Set Up Percentage Tax (if non-VAT)**

For non-VAT registered entities:

```javascript
POST /api/companies/{companyId}/percentage-tax
{
  taxType: "TAX_3_PERCENT",
  rate: 0.03,
  accountId: "acct_2105"
}
```

**Action Items**:
- [ ] Identify all vendors subject to withholding tax
- [ ] Map each to appropriate EWT percentage
- [ ] Create withholding tax deduction records
- [ ] Test calculation on sample bill

---

### **Phase 4: Payroll Setup (Day 11-15)**

#### **4.1 Create Payroll Deduction GL Accounts**

System should auto-create, but verify:

```sql
SELECT account_code, account_name 
FROM Account 
WHERE account_code IN ('2501', '2502', '2503', '2504');
```

**Required Accounts**:
- `2501` - SSS Contributions Payable
- `2502` - PhilHealth Premiums Payable
- `2503` - Pag-IBIG Contributions Payable
- `2504` - Income Tax Withholding Payable

#### **4.2 Configure Monthly Payroll Deduction Accrual**

When processing payroll, system should auto-create:

```javascript
POST /api/payroll/{payrollRunId}/accrue-deductions
{
  period: "2025-01",
  employees: ["emp_1", "emp_2", "emp_3"]
}
```

**System Auto-Creates**:
- `PhilippinePayrollDeduction` records for each employee
- Journal entries to debit expense accounts, credit payable accounts

**Example Paycheck Breakdown** (Monthly salary ₱50,000):
```
Gross Salary:          ₱50,000
Less:
  SSS Employee:        (₱1,125)  → Account 2501
  PhilHealth:          (₱437.50) → Account 2502
  Pag-IBIG:            (₱100)    → Account 2503
  Income Tax:          (₱4,000)  → Account 2504
                       ________
NET PAY:               ₱44,337.50

Employer Contributions (Separate JE):
  SSS Employer:        ₱1,687.50 → Account 6101
  PhilHealth Employer: ₱812.50   → Account 6102
  Pag-IBIG Employer:   ₱200      → Account 6103
```

#### **4.3 Automatic 13th Month Accrual**

Configure system to accrue 1/12 of annual salary each month:

```javascript
POST /api/payroll/configure-13th-month
{
  companyId: "company_id",
  accrualMethod: "MONTHLY_STRAIGHT_LINE",
  gl_account: "acct_2505"  // 13th Month Payable
}
```

**Monthly Accrual Entry** (for ₱50,000 salary):
```
Dr. Salaries and Wages Expense      ₱4,166.67
  Cr. 13th Month Payable (Accrual)              ₱4,166.67
```

---

### **Phase 5: Local Tax Setup (Day 16-18)**

#### **5.1 Create Local Tax Obligations**

For each local tax requirement:

```javascript
POST /api/companies/{companyId}/local-taxes
{
  jurisdiction: "Makati",
  taxType: "MAYORS_PERMIT",
  dueDate: "2025-03-31",
  estimatedAmount: 5000.00,
  description: "Mayor's Permit for 2025"
}
```

**Common Local Taxes**:
- **Mayor's Permit**: Usually due March 31
- **Barangay Clearance**: Can renew anytime
- **Real Property Tax**: Usually due Q1 and Q2
- **Cedula**: Usually due within January

#### **5.2 Set Up Tax Calendar**

System should alert for upcoming tax dates:

```javascript
POST /api/companies/{companyId}/tax-calendar
{
  events: [
    { date: "2025-01-31", event: "Cedula Renewal", type: "LOCAL" },
    { date: "2025-03-15", event: "VAT Return (2550Q) Due", type: "BIR" },
    { date: "2025-03-31", event: "Mayor's Permit Renewal", type: "LOCAL" },
    { date: "2025-04-15", event: "Income Tax Deadline", type: "BIR" }
  ]
}
```

---

### **Phase 6: Monthly Operations (Recurring)**

#### **6.1 Process Bills with Withholding Tax**

```javascript
// When creating a bill from vendor subject to EWT:

POST /api/companies/{companyId}/bills
{
  vendorId: "vendor_supplies_123",
  amount: 100000,
  billDate: "2025-01-15"
}

// System should:
// 1. Check vendor for withholding tax rules
// 2. Calculate: 100,000 × 2% = ₱2,000 withholding
// 3. Create journal entry:
//    Dr. Supplies Expense (account X)      ₱100,000
//      Cr. Expanded Withholding Tax Pay              ₱2,000
//      Cr. Cash/Accounts Payable                     ₱98,000
```

#### **6.2 Process Payroll with Deductions**

```javascript
POST /api/payroll/run
{
  companyId: "company_id",
  payrollDate: "2025-01-15",
  employees: [...]
}

// System creates:
// 1. Paycheck records with deductions
// 2. Accrual entries for employee share
// 3. Employer contribution entries
// 4. 13th month accrual
```

#### **6.3 Track Local Tax Payments**

```javascript
PUT /api/companies/{companyId}/local-taxes/{obligation_id}/pay
{
  paymentDate: "2025-03-30",
  paidAmount: 5000.00,
  method: "CHECK",
  referenceNumber: "CHK-001234"
}

// System marks as PAID and creates payment record
```

---

### **Phase 7: Quarterly Reporting (Quarterly)**

#### **7.1 Generate Form 2550Q (VAT Return)**

```javascript
POST /api/companies/{companyId}/bir-forms/2550q
{
  period: "2025-Q1",  // Jan-Mar 2025
  includeAdjustments: true
}

// System generates:
// 1. Queries all invoices/bills from Jan-Mar
// 2. Calculates VAT Output (from sales)
// 3. Calculates VAT Input (from purchases)
// 4. Computes VAT Due = Output - Input
// 5. Returns data in 2550Q format (ready to file)
```

**Sample Output**:
```json
{
  "formType": "2550Q",
  "period": "2025-Q1",
  "quarter": 1,
  "year": 2025,
  "sections": {
    "sales": {
      "totalSales": 500000,
      "vatableAmount": 500000,
      "vatOutput": 60000
    },
    "purchases": {
      "totalPurchases": 200000,
      "vatableAmount": 200000,
      "vatInput": 24000
    },
    "computation": {
      "vatOutput": 60000,
      "vatInput": 24000,
      "vatDue": 36000
    }
  },
  "status": "READY"
}
```

#### **7.2 Generate Form 1601CQ (Remittance Return)**

```javascript
POST /api/companies/{companyId}/bir-forms/1601cq
{
  period: "2025-Q1"
}

// System aggregates all withholding taxes withheld:
// - EWT withheld on purchases
// - Final tax withheld
// - Income tax withheld from employees
// - Generates remittance summary
```

#### **7.3 File with BIR**

Via eFPS (Electronic Filing and Payment System):

```javascript
POST /api/companies/{companyId}/bir-forms/{form_id}/file
{
  channel: "eFPS",
  filingDate: "2025-04-15"
}

// System:
// 1. Validates form data
// 2. Submits through eFPS API
// 3. Records BIR reference number
// 4. Updates form status to FILED
```

---

### **Phase 8: Annual Reporting (Year-End)**

#### **8.1 Generate Form 2307 (Withholding Certificate)**

```javascript
POST /api/companies/{companyId}/bir-forms/2307
{
  year: 2025
}

// System:
// 1. Aggregates all vendors with EWT withheld
// 2. For each vendor:
//    - Sums all withholding amounts
//    - Classifies by withholding type
// 3. Generates 2307 for each vendor
// 4. Ready to print/email to vendors
```

**Output**:
```json
{
  "forms": [
    {
      "vendorName": "ABC Supplies Co",
      "vendorTaxId": "123-456-789-000",
      "withholdings": [
        { "type": "EWT_2_PERCENT", "amount": 10000 }
      ],
      "totalWithheld": 10000
    }
  ]
}
```

#### **8.2 Generate Form 2316 (Employee Tax Certificate)**

```javascript
POST /api/companies/{companyId}/bir-forms/2316
{
  year: 2025
}

// System:
// 1. For each employee (active + separated):
//    - Sums gross compensation
//    - Sums income tax withheld
//    - Sums SSS/PhilHealth/Pag-IBIG
// 2. Generates 2316 for each employee
// 3. Ready to print/email
```

**Output**:
```json
{
  "forms": [
    {
      "employeeName": "Juan dela Cruz",
      "employeeTaxId": "987-654-321-000",
      "grossCompensation": 600000,
      "withholdings": {
        "incomeTax": 48000,
        "sss": 13500,
        "philhealth": 5250,
        "pagibig": 1200
      }
    }
  ]
}
```

#### **8.3 Generate Alphalist (Form 1604CF)**

```javascript
POST /api/companies/{companyId}/bir-forms/alphalist
{
  year: 2025,
  includeType: ["EMPLOYEE", "CONTRACTOR"]
}

// System:
// 1. Aggregates all employees and contractors
// 2. For each payee:
//    - Name, Tax ID, income type
//    - Total compensation/payments
//    - Total withholdings
// 3. Generates consolidated alphalist
// 4. File with BIR (usually by Apr 15)
```

#### **8.4 Generate PH GAAP Financial Statements**

```javascript
POST /api/companies/{companyId}/financial-statements
{
  as_of_date: "2025-12-31",
  include_statements: [
    "BALANCE_SHEET_PH",
    "INCOME_STATEMENT_PH",
    "CHANGES_IN_EQUITY_PH",
    "CASH_FLOW_PH"
  ]
}

// System:
// 1. Queries all accounts
// 2. Applies PH GAAP format
// 3. Classifies and subtotals
// 4. Generates multi-page report
```

---

## Database Queries for Common Tasks

### **Task 1: Check Monthly Payroll Deduction Summary**

```sql
SELECT 
  pd.deductionType,
  SUM(pd.employeeShare) as total_employee_share,
  SUM(pd.employerShare) as total_employer_share,
  COUNT(DISTINCT pd.employeeId) as employee_count
FROM PhilippinePayrollDeduction pd
WHERE pd.companyId = 'company_id_here'
  AND pd.period = '2025-01'
GROUP BY pd.deductionType
ORDER BY pd.deductionType;
```

**Expected Output**:
```
deductionType          employee_share  employer_share  employee_count
SSS_EMPLOYEE           ₱11,250         ₱11,250         10
PHILHEALTH_EMPLOYEE    ₱4,375          ₱4,375          10
PAGIBIG_EMPLOYEE       ₱1,000          ₱2,000          10
WITHHOLDING_TAX        ₱4,000          -               10
```

### **Task 2: Calculate Withholding Tax Payable**

```sql
SELECT 
  'EWT_1_PERCENT' as withholding_type,
  SUM(bill_amount * 0.01) as total_withheld
FROM Bill b
INNER JOIN WithholdingTaxDeduction wtd 
  ON b.vendorId = wtd.vendorId 
  AND wtd.deductionType = 'EWT_1_PERCENT'
WHERE b.companyId = 'company_id_here'
  AND EXTRACT(MONTH FROM b.issuedAt) = 1
  AND EXTRACT(YEAR FROM b.issuedAt) = 2025
UNION ALL
SELECT 
  'EWT_2_PERCENT',
  SUM(bill_amount * 0.02)
FROM Bill b
INNER JOIN WithholdingTaxDeduction wtd 
  ON b.vendorId = wtd.vendorId 
  AND wtd.deductionType = 'EWT_2_PERCENT'
WHERE b.companyId = 'company_id_here'
  AND EXTRACT(MONTH FROM b.issuedAt) = 1
  AND EXTRACT(YEAR FROM b.issuedAt) = 2025;
```

### **Task 3: Upcoming Local Tax Obligations**

```sql
SELECT 
  jurisdiction,
  taxType,
  dueDate,
  estimatedAmount,
  status
FROM LocalTaxObligation
WHERE companyId = 'company_id_here'
  AND dueDate BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY dueDate ASC;
```

### **Task 4: BIR Form Filing Status**

```sql
SELECT 
  formType,
  period,
  status,
  filedAt,
  COUNT(*) as count
FROM BirFormSubmission
WHERE companyId = 'company_id_here'
  AND EXTRACT(YEAR FROM createdAt) = 2025
GROUP BY formType, period, status, filedAt
ORDER BY period DESC;
```

---

## API Endpoints Summary

### **Withholding Tax**
- `POST /api/companies/{id}/withholding-tax/vendors` - Add vendor with EWT
- `POST /api/bills/{id}/calculate-withholding` - Calculate on bill creation
- `GET /api/companies/{id}/withholding-tax/summary?period=2025-01` - Monthly summary

### **Payroll Deductions**
- `POST /api/payroll/{runId}/accrue-deductions` - Accrue monthly deductions
- `GET /api/employees/{id}/deductions?period=2025-01` - Employee deduction detail
- `POST /api/payroll/configure-13th-month` - Set up 13th month accrual

### **Local Taxes**
- `POST /api/companies/{id}/local-taxes` - Create obligation
- `PUT /api/companies/{id}/local-taxes/{obsId}/pay` - Record payment
- `GET /api/companies/{id}/local-taxes/calendar` - Tax calendar view

### **BIR Forms**
- `POST /api/companies/{id}/bir-forms/2550q` - Generate VAT Return
- `POST /api/companies/{id}/bir-forms/2307` - Generate Withholding Certificate
- `POST /api/companies/{id}/bir-forms/2316` - Generate Employee Certificate
- `POST /api/companies/{id}/bir-forms/alphalist` - Generate Alphalist
- `POST /api/companies/{id}/bir-forms/{fid}/file` - Submit to BIR

### **Financial Statements**
- `POST /api/companies/{id}/financial-statements` - Generate PH GAAP statements
- `GET /api/companies/{id}/balance-sheet?as_of_date=2025-12-31` - Balance sheet
- `GET /api/companies/{id}/income-statement?period=2025` - Income statement

---

## Testing Checklist

### **Unit Tests**
- [ ] Withholding tax calculation (2%, 5%, 10%)
- [ ] Payroll deduction accrual
- [ ] 13th month calculation
- [ ] VAT computation (Output - Input)
- [ ] Local tax date validation

### **Integration Tests**
- [ ] Create bill → Auto-calculate withholding → Create JE
- [ ] Process payroll → Auto-create deduction records → Create JE
- [ ] Generate 2550Q → Verify amounts match trial balance
- [ ] Generate 2307 → Verify matches WithholdingTaxDeduction totals
- [ ] File with eFPS → Verify reference number recorded

### **User Acceptance Tests**
- [ ] Accountant can create company with PH settings
- [ ] Bills show withholding tax calculations
- [ ] Payroll deductions appear on payslip
- [ ] Monthly payroll JEs post correctly
- [ ] BIR forms populate with actual data
- [ ] Tax calendar alerts show upcoming due dates

---

## Support & References

**BIR Official Resources**:
- https://www.bir.gov.ph/
- eFPS: https://efps.bir.gov.ph/

**Philippine Tax Rates (2025)**:
- VAT: 12%
- SSS Employee: 2.25% (min ₱300, max ₱1,350)
- SSS Employer: 3.35%
- PhilHealth Employee: 2.5%
- PhilHealth Employer: 3.75%
- Pag-IBIG Employee: 1-2%
- Pag-IBIG Employer: 1-2%

---

**Version**: 1.0  
**Last Updated**: January 2025  
**Maintainer**: Accounting Team
