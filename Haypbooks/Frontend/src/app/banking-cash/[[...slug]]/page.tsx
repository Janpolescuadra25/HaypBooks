'use client'

import dynamic from 'next/dynamic'
import ComingSoon from '@/components/owner/ComingSoon'

const BankTransactionsPage = dynamic(
  () => import('@/components/banking/BankTransactionsPage'),
  { ssr: false },
)
const BankDepositsPage = dynamic(
  () => import('@/components/banking/BankDepositsPage'),
  { ssr: false },
)
const UndepositedFundsPage = dynamic(
  () => import('@/components/banking/UndepositedFundsPage'),
  { ssr: false },
)
const BankReconciliationPage = dynamic(
  () => import('@/components/banking/BankReconciliationPage'),
  { ssr: false },
)

type Props = { params: { slug?: string[] } }

function resolveLabel(slug: string[] | undefined): string {
  const path = (slug ?? []).join('/')
  const labels: Record<string, string> = {
    'transactions/bank-transactions': 'Bank Transactions',
    'transactions/bank-feeds': 'Bank Transactions',
    'transactions/bank-register': 'Bank Transactions',
    'transactions/transfers': 'Bank Transactions',
    'transactions/deposits': 'Bank Deposits',
    'transactions/undeposited': 'Undeposited Funds',
    'reconciliation/reconcile': 'Reconcile',
    'reconciliation/reconciliation-hub': 'Reconciliation Hub',
    'reconciliation/history': 'Reconciliation History',
    'reconciliation/statement-archive': 'Statement Archive',
    'accounts/bank-accounts': 'Bank Accounts',
    'accounts/credit-cards': 'Credit Cards',
    'accounts/petty-cash': 'Petty Cash',
    'accounts/clearing-accounts': 'Clearing Accounts',
    'management/transaction-rules': 'Transaction Rules',
    'management/recurring-transactions': 'Recurring Transactions',
    'cash-management/cash-position': 'Cash Position',
    'cash-management/cash-flow-projection': 'Cash Flow Projection',
    'cash-management/short-term-forecast': 'Short-Term Forecast',
  }
  return labels[path] ?? (slug?.[slug.length - 1] ?? 'Banking & Cash')
    .split('-')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function resolveComponent(slug: string[] | undefined) {
  const path = (slug ?? []).join('/')
  switch (path) {
    case 'transactions/bank-transactions':
    case 'transactions/bank-feeds':
    case 'transactions/bank-register':
    case 'transactions/transfers':
      return <BankTransactionsPage />
    case 'transactions/deposits':
      return <BankDepositsPage />
    case 'transactions/undeposited':
      return <UndepositedFundsPage />
    case 'reconciliation/reconcile':
    case 'reconciliation/reconciliation-hub':
    case 'reconciliation/history':
      return <BankReconciliationPage />
    default:
      return null
  }
}

export default function Page({ params }: Props) {
  const component = resolveComponent(params.slug)
  if (component) return component
  return <ComingSoon title={resolveLabel(params.slug)} />
}
