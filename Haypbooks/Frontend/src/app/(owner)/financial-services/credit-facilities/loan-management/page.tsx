'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Loan Management"
      module="FINANCIAL SERVICES"
      breadcrumb="Financial Services / Credit Facilities / Loan Management"
      purpose="Loan Management handles the lifecycle of all term loans — bank loans, commercial paper, intercompany loans, and shareholder loans. It maintains the amortization schedule, tracks principal and interest payments, calculates outstanding balances, accrue interest, and generates the journal entries required for proper loan accounting under PFRS 9/IFRS 9. Covenant compliance monitoring and maturity alerts are included."
      components={[
        { name: 'Loan Register', description: 'All active loans with institution, type, original principal, outstanding balance, interest rate, payment frequency, and maturity date.' },
        { name: 'Amortization Schedule', description: 'Full payment schedule for each loan showing: payment due date, principal payment, interest payment, and outstanding balance.' },
        { name: 'Payment Recording', description: 'Record actual loan payments against the amortization schedule with bank reference for reconciliation.' },
        { name: 'Interest Accrual Journal', description: 'Month-end interest accrual entries calculated automatically and posted to GL.' },
        { name: 'Covenant Monitor', description: 'Loan covenant tracking: DSCR, leverage ratio, current ratio requirements with current calculated values.' },
      ]}
      tabs={['Loan Register', 'Amortization Schedules', 'Payment History', 'Accruals', 'Covenants']}
      features={[
        'Full loan register with amortization scheduling',
        'Actual vs. scheduled payment tracking',
        'Automatic interest accrual journal entries',
        'Effective interest rate (EIR) calculation per PFRS 9',
        'Covenant compliance monitoring with alerts',
        'Maturity and balloon payment alerts',
        'Loan payoff calculation',
      ]}
      dataDisplayed={[
        'All loans with current outstanding balances',
        'Next payment date and amount',
        'Accrued interest balance',
        'Amortization schedule with principal/interest split',
        'Covenant ratios: required vs. actual',
        'Total debt portfolio summary',
      ]}
      userActions={[
        'Add a new loan to the register',
        'Record a loan payment against schedule',
        'Run month-end interest accrual journal',
        'View or print amortization schedule',
        'Update loan terms after modification',
        'Check covenant compliance',
        'Forecast payoff amount on any date',
      ]}
      relatedPages={[
        { label: 'Credit Lines', href: '/financial-services/credit-facilities/credit-lines' },
        { label: 'Treasury Overview', href: '/banking-cash/treasury/treasury-overview' },
          { label: 'Balance Sheet', href: '/reporting/reports-center/financial-statements/balance-sheet' },
        { label: 'Fixed Assets', href: '/accounting/fixed-assets/asset-register' },
      ]}
    />
  )
}

