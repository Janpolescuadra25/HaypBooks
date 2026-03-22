'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Credit Lines"
      module="FINANCIAL SERVICES"
      breadcrumb="Financial Services / Credit Facilities / Credit Lines"
      purpose="Credit Lines manages all revolving credit facilities available to the business — lines of credit from banks, overdraft facilities, and credit card limits. It tracks the total limit, utilized amount, available balance, interest rate, maturity date, and covenants for each facility. Users can record drawdowns, repayments, and interest charges, and monitor credit utilization across all facilities."
      components={[
        { name: 'Credit Facilities Summary', description: 'Total credit available vs. total utilized across all facilities, displayed as a utilization gauge.' },
        { name: 'Facility List', description: 'Each credit facility with institution, type, total limit, drawn amount, available balance, interest rate, and maturity date.' },
        { name: 'Transaction Log', description: 'Drawdowns and repayments per facility with date, amount, reference, and running balance.' },
        { name: 'Covenant Tracker', description: 'Financial covenants per facility with current status (in compliance / at risk / breached) and covenant value.' },
        { name: 'Interest Calculation', description: 'Calculates accrued interest per facility based on drawn balance and applicable interest rate.' },
      ]}
      tabs={['All Facilities', 'Revolving Lines', 'Overdraft', 'Draw History', 'Covenants']}
      features={[
        'Multi-facility credit portfolio management',
        'Drawdown and repayment recording',
        'Automatic interest accrual calculation',
        'Covenant monitoring with breach alerts',
        'Maturity and renewal date alerts',
        'Credit utilization ratio tracking',
        'Integration with GL for drawdown journal entries',
      ]}
      dataDisplayed={[
        'Total credit limit and available balance per facility',
        'Utilization percentage per facility',
        'Interest rate, accrued interest, and next interest payment',
        'Maturity date and days to maturity',
        'Covenant requirements and current values',
        'Drawdown and repayment history',
      ]}
      userActions={[
        'Record a drawdown on a credit line',
        'Record a repayment',
        'Update credit facility terms (after renewal)',
        'Check covenant compliance status',
        'Export facility summary for bank presentations',
        'Add a new credit facility',
      ]}
      relatedPages={[
        { label: 'Loan Management', href: '/financial-services/credit-facilities/loan-management' },
        { label: 'Treasury Overview', href: '/banking-cash/treasury/treasury-overview' },
        { label: 'Bank Accounts', href: '/banking-cash/accounts/bank-accounts' },
        { label: 'Cash Flow Report', href: '/reporting/reports-center/financial-statements/cash-flow-statement' },
      ]}
    />
  )
}

