import type { ReactNode } from 'react'
import TransactionsNav from '@/components/TransactionsNav'

// Render the Transactions sub-nav for the Bank Transactions section.
export default function BankTransactionsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden">
        <TransactionsNav />
      </div>
      {children}
    </div>
  )
}
