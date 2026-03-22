'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Treasury Overview"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Treasury / Treasury Overview"
      purpose="Treasury Overview is the executive dashboard for the company's cash and liquidity position. It aggregates balances across all bank accounts, investments, credit facilities, and outstanding payment obligations to give a real-time view of the company's total liquidity. It shows the cash conversion cycle, liquidity ratios, 30-day cash flow forecast, and any treasury alerts (e.g., low balance, covenant breach, upcoming maturities). This is the primary tool for the CFO and treasurer."
      components={[
        { name: 'Total Liquidity Panel', description: 'Net liquidity position: total cash + available credit facilities + liquid investments − upcoming payments due in 30 days.' },
        { name: 'Bank Account Balances', description: 'Real-time balance for each bank account with currency, equivalent in base currency, and balance trend.' },
        { name: 'Cash Flow Forecast Panel', description: '30-day rolling cash inflow and outflow forecast with projected net cash position per week.' },
        { name: 'Credit Facilities Summary', description: 'Available credit across all lines and facilities with utilization rate.' },
        { name: 'Treasury Alerts', description: 'Alerts for: low account balance, upcoming loan maturities, covenant near breach, and FX exposure.' },
        { name: 'Currency Exposure', description: 'Net exposure per foreign currency across all monetary items for hedging assessment.' },
      ]}
      tabs={['Overview', 'Cash Balances', 'Cash Flow Forecast', 'Credit Facilities', 'FX Exposure', 'Alerts']}
      features={[
        'Real-time total liquidity position',
        '30-day cash flow forecast driven by open AR, AP, and scheduled payments',
        'Multi-currency cash balance with FX conversion',
        'Credit facility utilization monitoring',
        'Treasury alert system for critical indicators',
        'Cash conversion cycle calculation',
        'FX exposure summary for hedging decisions',
      ]}
      dataDisplayed={[
        'Total cash across all accounts',
        'Net liquidity (cash + credit available)',
        'Cash flow forecast: 4-week inflows and outflows',
        'Credit facility availability',
        'FX exposure by currency',
        'Active treasury alerts',
      ]}
      userActions={[
        'View current liquidity position',
        'Drill into any bank account balance',
        'View detailed cash flow forecast',
        'Check credit facility availability',
        'Review FX exposure and consider hedging',
        'Configure treasury alert thresholds',
        'Export treasury report for CFO review',
      ]}
      relatedPages={[
        { label: 'Bank Accounts', href: '/banking-cash/accounts/bank-accounts' },
        { label: 'Credit Lines', href: '/financial-services/credit-facilities/credit-lines' },
        { label: 'FX Management', href: '/banking-cash/treasury/fx-management' },
        { label: 'Cash Position', href: '/home/cash-position' },
        { label: 'Cash Flow Report', href: '/reporting/reports-center/financial-statements/cash-flow-statement' },
      ]}
    />
  )
}

