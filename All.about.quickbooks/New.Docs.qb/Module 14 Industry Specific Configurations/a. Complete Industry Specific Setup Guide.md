# Complete Industry-Specific QuickBooks Configuration Guide

## Overview
This comprehensive guide provides detailed QuickBooks Online setup and configuration instructions tailored for specific industries, including unique features, workflows, reports, and best practices for each sector.

---

## Table of Contents
1. [Retail & E-commerce](#retail-ecommerce)
2. [Construction & Contractors](#construction)
3. [Professional Services](#professional-services)
4. [Manufacturing](#manufacturing)
5. [Healthcare & Medical](#healthcare)
6. [Non-Profit Organizations](#nonprofit)
7. [Real Estate](#real-estate)
8. [Restaurants & Food Service](#restaurants)
9. [Transportation & Logistics](#transportation)
10. [SaaS & Technology](#saas-technology)

---

## 1. Retail & E-commerce {#retail-ecommerce}

### Initial Setup Configuration

#### Chart of Accounts - Retail
```
Assets:
1000 - Petty Cash
1100 - Cash Registers
1200 - Bank Accounts
1300 - Credit Card Processing Account
1400 - Accounts Receivable
1500 - Inventory
  1510 - Inventory - Retail Goods
  1520 - Inventory - In Transit
  1530 - Inventory - Consignment
1600 - Store Fixtures and Equipment
1700 - Prepaid Expenses

Liabilities:
2000 - Accounts Payable
2100 - Credit Cards
2200 - Sales Tax Payable
2300 - Gift Cards Outstanding
2400 - Customer Deposits
2500 - Loyalty Points Liability

Income:
4000 - Retail Sales
  4010 - In-Store Sales
  4020 - Online Sales
  4030 - Wholesale Sales
4100 - Shipping Revenue
4200 - Gift Card Breakage
4300 - Loyalty Program Income

Cost of Goods Sold:
5000 - Product Costs
5100 - Freight In
5200 - Inventory Adjustments
5300 - Shrinkage

Expenses:
6000 - Store Rent
6100 - Utilities
6200 - Store Payroll
6300 - Credit Card Fees
6400 - Marketing & Advertising
6500 - Store Supplies
```

#### Inventory Management Setup
```
Configuration Settings:
- Track quantity on hand: ✓
- Track inventory value: FIFO
- Enable low stock alerts: ✓
- Reorder point automation: ✓

Product Categories:
- Department → Category → Subcategory
- Season/Collection tracking
- Size/Color variants
- Bundle configurations
```

#### Point of Sale Integration
```javascript
// POS to QuickBooks Sync Configuration
{
  "sync_frequency": "real-time",
  "data_mapping": {
    "pos_sale": "quickbooks_sales_receipt",
    "pos_customer": "quickbooks_customer",
    "pos_product": "quickbooks_inventory_item",
    "pos_payment": "quickbooks_deposit"
  },
  "tax_handling": {
    "calculate_in": "POS",
    "sync_to_qb": true,
    "tax_inclusive": false
  },
  "inventory_sync": {
    "direction": "bidirectional",
    "update_frequency": "immediate",
    "location_tracking": true
  }
}
```

### Retail-Specific Features

#### Multi-Location Management
```
Location Setup:
1. Main Store (Headquarters)
   - Central inventory
   - Administrative functions
   - Consolidated reporting

2. Branch Stores
   - Location-specific inventory
   - Transfer capabilities
   - Individual P&L tracking

3. Warehouse
   - Bulk storage
   - Distribution center
   - Transfer hub
```

#### Customer Loyalty Program
```
Implementation:
1. Custom Fields:
   - Loyalty Number
   - Points Balance
   - Tier Level
   - Join Date

2. Automated Calculations:
   - Points earned = Purchase Amount × 0.1
   - Redemption rate = 100 points = $5
   - Tier upgrades at thresholds

3. Reports:
   - Points liability report
   - Customer lifetime value
   - Redemption analytics
```

### Key Reports for Retail

#### Daily Sales Report
```
Components:
- Sales by payment method
- Sales by department
- Hourly sales analysis
- Cashier performance
- Void/return summary
- Tax collected
- Daily reconciliation
```

#### Inventory Analytics
```
Key Metrics:
- Inventory turnover by SKU
- Days sales of inventory
- Slow-moving items
- Stock-out incidents
- Margin by product category
- Seasonal trend analysis
```

---

## 2. Construction & Contractors {#construction}

### Construction Setup

#### Job Costing Configuration
```
Project Structure:
Project (Main Job)
├── Phase 1: Site Preparation
│   ├── Labor
│   ├── Materials
│   ├── Equipment
│   └── Subcontractors
├── Phase 2: Foundation
│   ├── Labor
│   ├── Materials
│   └── Subcontractors
└── Phase 3: Framing
    ├── Labor
    ├── Materials
    └── Subcontractors
```

#### Chart of Accounts - Construction
```
Special Accounts:
1800 - Retainage Receivable
1900 - Work in Progress
2600 - Retainage Payable
2700 - Subcontractor Holdbacks
4500 - Progress Billings
5500 - Direct Job Costs
5600 - Equipment Costs
5700 - Subcontractor Costs
```

### Construction Workflows

#### AIA Billing Process
```
G702/G703 Application for Payment:
1. Create progress invoice
2. Calculate:
   - Original contract sum
   - Change orders
   - Revised contract sum
   - Previous payments
   - Current payment due
   - Retainage (typically 10%)
3. Generate AIA forms
4. Track approval workflow
```

#### Change Order Management
```
Change Order Process:
1. Create estimate for change
2. Get customer approval
3. Update project budget
4. Adjust progress billing schedule
5. Track impact on timeline
6. Update profitability projections
```

### Prevailing Wage Tracking
```
Certified Payroll Setup:
1. Employee Classifications:
   - Job classification codes
   - Wage determinations
   - Fringe benefits

2. Time Tracking:
   - Project allocation
   - Task codes
   - Location tracking

3. Reporting:
   - Weekly certified payroll
   - WH-347 forms
   - Compliance documentation
```

---

## 3. Professional Services {#professional-services}

### Service Business Setup

#### Time & Billing Configuration
```
Service Item Setup:
- Hourly rates by role
- Fixed fee services
- Retainer arrangements
- Expense markup rules
- Rush charge multipliers
```

#### Client Hierarchy
```
Structure:
Client Company
├── Matters/Projects
│   ├── Phase/Stage
│   │   ├── Tasks
│   │   │   ├── Time entries
│   │   │   └── Expenses
```

### Billing Arrangements

#### Retainer Management
```
Retainer Types:
1. Classic Retainer
   - Monthly fee for availability
   - Hours billed separately
   
2. Advance Payment Retainer
   - Deposit against future work
   - Applied to invoices
   
3. Evergreen Retainer
   - Minimum balance maintained
   - Auto-replenishment
```

#### Project Profitability
```
Tracking Metrics:
- Realization rate (Billed/Standard)
- Utilization rate (Billable/Total)
- Write-offs and adjustments
- Collection efficiency
- Margin by client/project
```

---

## 4. Manufacturing {#manufacturing}

### Manufacturing Setup

#### Bill of Materials (BOM)
```
Assembly Configuration:
Finished Good: Widget A
├── Raw Materials
│   ├── Steel plate (2 units)
│   ├── Screws (10 units)
│   └── Paint (0.5 liters)
├── Components
│   ├── Circuit board (1 unit)
│   └── Housing (1 unit)
├── Labor
│   ├── Assembly (0.5 hours)
│   └── Quality check (0.1 hours)
└── Overhead
    └── Machine time (0.25 hours)
```

#### Work in Progress Tracking
```
WIP Accounts:
1950 - WIP - Materials
1951 - WIP - Labor
1952 - WIP - Overhead
1953 - WIP - Completed not shipped

Journal Entry for Production:
Dr. WIP - Materials     $XXX
Dr. WIP - Labor        $XXX
Dr. WIP - Overhead     $XXX
   Cr. Raw Materials      $XXX
   Cr. Direct Labor       $XXX
   Cr. Applied Overhead   $XXX
```

### Cost Accounting

#### Standard Costing
```
Variance Analysis:
Material Price Variance = (Actual Price - Standard Price) × Actual Quantity
Material Usage Variance = (Actual Qty - Standard Qty) × Standard Price
Labor Rate Variance = (Actual Rate - Standard Rate) × Actual Hours
Labor Efficiency Variance = (Actual Hours - Standard Hours) × Standard Rate
```

---

## 5. Healthcare & Medical {#healthcare}

### Medical Practice Setup

#### Patient Account Management
```
Custom Fields:
- Patient ID
- Insurance Provider
- Policy Number
- Copay Amount
- Deductible Status
- Authorization Numbers
```

#### Insurance Billing Workflow
```
Process Flow:
1. Patient Service
2. Create Superbill
3. Submit Claim
4. Track ERA/EOB
5. Post Payment
6. Patient Statement
7. Follow-up Collections
```

### HIPAA Compliance
```
Security Measures:
- User access logs
- Encrypted data storage
- Audit trail maintenance
- Limited PHI in QuickBooks
- Separate clinical systems
```

---

## 6. Non-Profit Organizations {#nonprofit}

### Fund Accounting Setup

#### Fund Structure
```
Fund Categories:
1. Unrestricted Funds
   - General Operating
   - Board Designated
   
2. Temporarily Restricted
   - Program specific
   - Time restricted
   
3. Permanently Restricted
   - Endowment principal
```

#### Chart of Accounts - Non-Profit
```
Revenue:
4000 - Contributions
  4010 - Individual Donations
  4020 - Corporate Donations
  4030 - Foundation Grants
  4040 - Government Grants
4100 - Program Service Revenue
4200 - Fundraising Events
4300 - Investment Income

Expenses:
7000 - Program Services
  7100 - Program A Expenses
  7200 - Program B Expenses
8000 - Management & General
9000 - Fundraising Expenses
```

### Grant Management
```
Grant Tracking:
1. Create Class for each grant
2. Track restrictions
3. Monitor spending
4. Report outcomes
5. Maintain compliance
```

### Non-Profit Reports
```
Required Reports:
- Statement of Financial Position
- Statement of Activities
- Statement of Functional Expenses
- Statement of Cash Flows
- Form 990 preparation
```

---

## 7. Real Estate {#real-estate}

### Property Management Setup

#### Property Tracking
```
Property Structure:
Property
├── Units/Spaces
│   ├── Tenant
│   ├── Lease Terms
│   ├── Rent Roll
│   └── Maintenance History
```

#### Rent Collection
```
Automated Rent Process:
1. Monthly recurring invoices
2. Late fee calculation
3. Payment tracking
4. Deposit handling
5. Move-out reconciliation
```

### Trust Accounting
```
Trust Account Management:
- Separate bank accounts
- Security deposit tracking
- Interest allocation
- Compliance reporting
- Regular reconciliation
```

---

## 8. Restaurants & Food Service {#restaurants}

### Restaurant Setup

#### Cost Centers
```
Department Structure:
- Kitchen/Food
- Bar/Beverage
- Front of House
- Back of House
- Catering
- Delivery/Takeout
```

#### Recipe Costing
```
Menu Item Costing:
Burger Plate
├── Food Cost
│   ├── Patty (6 oz @ $0.50/oz = $3.00)
│   ├── Bun ($0.40)
│   ├── Toppings ($0.60)
│   └── Fries ($0.50)
├── Total Food Cost: $4.50
├── Menu Price: $15.00
└── Food Cost %: 30%
```

### Daily Operations
```
Daily Cash Out:
- Sales by category
- Payment methods
- Tips reporting
- Cash reconciliation
- Deposit preparation
```

---

## 9. Transportation & Logistics {#transportation}

### Fleet Management

#### Vehicle Tracking
```
Per Vehicle Accounting:
- Acquisition cost
- Depreciation schedule
- Maintenance log
- Fuel consumption
- Revenue allocation
- Cost per mile
```

#### Driver Settlements
```
Owner-Operator Settlements:
Gross Revenue: $5,000
Less:
- Fuel advance: ($800)
- Insurance: ($200)
- Maintenance reserve: ($150)
- Administrative fee: ($100)
Net Settlement: $3,750
```

---

## 10. SaaS & Technology {#saas-technology}

### Subscription Business Model

#### Revenue Recognition
```
MRR/ARR Tracking:
- New MRR
- Expansion MRR
- Churned MRR
- Contraction MRR
- Net MRR Growth
```

#### Deferred Revenue
```
Monthly Recognition:
Initial Annual Payment: $12,000
Dr. Cash                 $12,000
   Cr. Deferred Revenue  $12,000

Monthly Recognition:
Dr. Deferred Revenue     $1,000
   Cr. Revenue           $1,000
```

### SaaS Metrics
```
Key Performance Indicators:
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Churn Rate
- CAC Payback Period
- LTV/CAC Ratio
- Monthly Burn Rate
- Runway
```

---

## Industry-Specific Best Practices

### Retail
1. Daily cash reconciliation
2. Inventory cycle counts
3. Seasonal planning
4. Vendor management
5. Loss prevention tracking

### Construction
1. Job cost review weekly
2. Progress billing monthly
3. Lien waiver management
4. Safety compliance tracking
5. Equipment utilization

### Professional Services
1. Time tracking discipline
2. WIP management
3. Realization monitoring
4. Client profitability analysis
5. Capacity planning

### Manufacturing
1. Production variance analysis
2. Quality control metrics
3. Supply chain management
4. Capacity utilization
5. Inventory optimization

### Healthcare
1. Revenue cycle management
2. Denial tracking
3. Provider productivity
4. Cost per procedure
5. Payer mix analysis

### Non-Profit
1. Donor stewardship
2. Grant compliance
3. Program effectiveness
4. Overhead ratios
5. Sustainability planning

### Real Estate
1. Vacancy tracking
2. Maintenance scheduling
3. Lease renewal management
4. Market analysis
5. Capital planning

### Restaurants
1. Daily sales reports
2. Labor cost management
3. Inventory turnover
4. Table turnover rates
5. Customer analytics

### Transportation
1. Route optimization
2. Fuel hedging
3. Maintenance scheduling
4. DOT compliance
5. Driver retention

### SaaS
1. Cohort analysis
2. Feature adoption
3. Customer success metrics
4. Product-market fit
5. Scaling efficiency

---

## Implementation Checklist

### Phase 1: Initial Setup (Week 1)
- [ ] Select industry during setup
- [ ] Configure chart of accounts
- [ ] Set up tax requirements
- [ ] Enable industry features
- [ ] Import historical data

### Phase 2: Customization (Week 2)
- [ ] Create custom fields
- [ ] Design invoice templates
- [ ] Set up items/services
- [ ] Configure workflows
- [ ] Build reports

### Phase 3: Integration (Week 3)
- [ ] Connect industry apps
- [ ] Set up payment processing
- [ ] Configure bank feeds
- [ ] Test data flows
- [ ] Validate calculations

### Phase 4: Training (Week 4)
- [ ] Train staff on workflows
- [ ] Document procedures
- [ ] Create quick reference guides
- [ ] Set up support channels
- [ ] Plan go-live

### Phase 5: Go-Live
- [ ] Final data migration
- [ ] Parallel run if needed
- [ ] Monitor first transactions
- [ ] Address issues quickly
- [ ] Gather feedback

---

## Conclusion

Industry-specific configuration of QuickBooks Online ensures:
- **Compliance**: Meet industry regulations and standards
- **Efficiency**: Streamlined workflows for your business model
- **Accuracy**: Proper tracking of industry-specific metrics
- **Insights**: Relevant reports and KPIs for decision-making
- **Scalability**: Foundation for growth within your industry

Success requires understanding both QuickBooks capabilities and industry requirements, then bridging them effectively through proper configuration and customization.
