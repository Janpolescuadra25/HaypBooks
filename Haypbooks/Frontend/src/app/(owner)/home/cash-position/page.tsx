'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Cash Position"
      module="HOME"
      breadcrumb="Home / Cash Position"
      purpose="The Cash Position page provides a real-time snapshot of the company's current cash and cash equivalent balances across all bank accounts, along with short-term liquidity analysis and cash flow forecasting. It gives owners and financial managers an immediate view of how much cash is available, what is expected to come in and go out in the next 7 and 30 days, and whether the company maintains adequate liquidity to meet upcoming obligations."
      components={[
        { name: 'Total Cash Balance Card', description: 'Large display of total cash across all bank accounts in functional currency, refreshed with latest bank feed data.' },
        { name: 'Bank Account Breakdown Table', description: 'Per-account view showing account name, bank, balance, currency, and last sync time.' },
        { name: 'Cash Flow Mini-Chart', description: 'Bar chart showing daily cash in vs. cash out for the past 14 days and next 14 days (forecast).' },
        { name: 'Liquidity Indicators', description: 'Current ratio, quick ratio, and cash runway (months at current burn rate) displayed as metric chips.' },
        { name: 'Upcoming Cash Events', description: 'List of expected payments and receipts this week: scheduled bills, expected invoice payments, payroll run.' },
      ]}
      tabs={['Current Position', 'By Account', '7-Day Forecast', '30-Day Forecast']}
      features={[
        'Real-time multi-account cash aggregation',
        'Cash flow forecasting from scheduled transactions',
        'Low cash runway alerts with configurable threshold',
        'Per-account drill-down to transactions',
        'Multi-currency consolidation to functional currency',
        'Uncleared check and undeposited funds breakdown',
      ]}
      dataDisplayed={[
        'Total cash balance across all bank accounts',
        'Per-bank account balance with last sync time',
        'Uncleared deposits and outstanding checks',
        'Undeposited receipts (in-transit)',
        'Available credit line balances',
        'Cash inflow and outflow for trailing 14 days',
        '7-day and 30-day cash forecast',
        'Current ratio, quick ratio, cash runway months',
      ]}
      userActions={[
        'Drill into any bank account to see transactions',
        'Set low-cash alert threshold',
        'Refresh bank feed data manually',
        'Toggle between accounts to see individual forecasts',
        'Export cash position report',
        'Navigate to bank reconciliation from any account',
      ]}
      relatedPages={[
        { label: 'Bank Transactions', href: '/banking-cash/transactions/bank-transactions' },
        { label: 'Cash Flow Report', href: '/reporting/reports-center/financial-statements/cash-flow-statement' },
        { label: 'Bank Accounts', href: '/banking-cash/accounts/bank-accounts' },
        { label: 'Treasury Overview', href: '/banking-cash/treasury/treasury-overview' },
      ]}
    />
  )
}

