'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Investment Portfolio"
      module="FINANCIAL SERVICES"
      breadcrumb="Financial Services / Investments / Investment Portfolio"
      purpose="Investment Portfolio tracks the company's financial investments — time deposits, government securities, equity investments, bonds, mutual funds, and other financial instruments held by the business. It monitors current market values, unrealized gains/losses, income (interest and dividends), maturity schedules, and handles the accounting treatment under PFRS 9 (FVTPL, FVTOCI, or amortized cost classification)."
      components={[
        { name: 'Portfolio Summary', description: 'Total portfolio value by investment type, total unrealized gain/loss, and income YTD.' },
        { name: 'Investment Registry', description: 'All investments with instrument type, institution, face/cost value, current market value, unrealized G/L, income earned, and maturity date.' },
        { name: 'Maturity Calendar', description: 'Calendar view of investment maturity and reset dates in the next 90 days.' },
        { name: 'Mark-to-Market', description: 'Update market values for FVTPL and FVTOCI investments and generate revaluation journal entries.' },
        { name: 'Income Recording', description: 'Record interest income, dividend income, and capital distributions from investments.' },
      ]}
      tabs={['Portfolio View', 'By Type', 'Maturity Calendar', 'Income', 'Revaluation']}
      features={[
        'Multi-instrument investment portfolio tracking',
        'PFRS 9 classification (FVTPL / FVTOCI / Amortized Cost)',
        'Unrealized gain/loss calculation',
        'Mark-to-market journal entry generation',
        'Investment income tracking (interest and dividends)',
        'Maturity and rollover alerts',
        'Portfolio performance summary',
      ]}
      dataDisplayed={[
        'Total portfolio market value and cost basis',
        'Unrealized gain/loss per investment and total',
        'Per-investment yield/return metrics',
        'Investment maturity dates',
        'Income earned (interest/dividends) per investment',
        'PFRS 9 classification per investment',
      ]}
      userActions={[
        'Add a new investment to the portfolio',
        'Update market values (mark-to-market)',
        'Record interest or dividend income',
        'Record investment maturity/rollover',
        'Dispose/sell an investment and record gain/loss',
        'Export portfolio report',
      ]}
      relatedPages={[
        { label: 'Loan Management', href: '/financial-services/credit-facilities/loan-management' },
        { label: 'Treasury Overview', href: '/banking-cash/treasury/treasury-overview' },
          { label: 'Balance Sheet', href: '/reporting/reports-center/financial-statements/balance-sheet' },
        { label: 'Cash Position', href: '/home/cash-position' },
      ]}
    />
  )
}

