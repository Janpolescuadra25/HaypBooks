import Link from 'next/link'
import type { Route } from 'next'
import ReportsCatalog from '@/components/ReportsCatalog'
// Removed ReportsHubFilters per request to hide the "Default period for links" bar

export default function ReportsPage() {
  const items = [
    { href: '/reports/profit-loss?from=/reports', title: 'Profit & Loss', desc: 'Revenue, COGS, expenses, and net income.' },
    { href: '/reports/balance-sheet?from=/reports', title: 'Balance Sheet', desc: 'Assets, liabilities, and equity.' },
    { href: '/reports/cash-flow?from=/reports', title: 'Cash Flow', desc: 'Operating, investing, and financing cash flows.' },
  { href: '/reports/trial-balance?from=/reports', title: 'Trial Balance', desc: 'Debits and credits by account; must balance.' },
  { href: '/reports/ar-aging?from=/reports', title: 'A/R Aging', desc: 'Outstanding receivables by aging bucket.' },
  { href: '/reports/ap-aging?from=/reports', title: 'A/P Aging', desc: 'Outstanding payables by aging bucket.' },
  { href: '/reports/account-ledger?from=/reports', title: 'Account Ledger', desc: 'Transactions and running balance for an account.' },
  { href: '/reports/retained-earnings?from=/reports', title: 'Retained Earnings', desc: 'Beginning RE + Net Income - Dividends = Ending RE.' },
  { href: '/reports/refunds?from=/reports', title: 'Refunds', desc: 'Customer refunds (AR) and vendor refunds (AP) with totals.' },
  ]
  return (
    <div className="space-y-4">
      <ReportsCatalog />
    </div>
  )
}
