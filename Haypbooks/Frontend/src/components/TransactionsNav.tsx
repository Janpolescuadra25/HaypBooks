"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const sections = [
  { href: '/bank-transactions', label: 'Bank transactions', desc: 'Import, categorize, and match bank/credit card feeds.' },
  { href: '/transactions/reconcile', label: 'Reconcile', desc: 'Match statements to the ledger and resolve variances.' },
  { href: '/transactions/chart-of-accounts', label: 'Chart of accounts', desc: 'Manage GL accounts, types, and account numbers.' },
  { href: '/transactions/app-transactions', label: 'App transactions', desc: 'View postings created in-app across modules.' },
  { href: '/transactions/receipts', label: 'Receipts', desc: 'Capture, OCR, and attach receipts to transactions.' },
  { href: '/transactions/recurring-transactions', label: 'Recurring transactions', desc: 'Schedule recurring journal entries and spend/receive flows.' },
  { href: '/bank-transactions/rules', label: 'Rules', desc: 'Automate categorization with naming, amount, and payee rules.' },
  { href: '/transactions/tags', label: 'Tags', desc: 'Track dimensions like classes, locations, or projects.' },
]

export default function TransactionsNav({ activeHref }: { activeHref?: string }) {
  const pathname = usePathname()
  const current = activeHref || pathname
  const isActive = (href: string) => {
    if (!current) return false
    if (current === href) return true
    // treat nested paths like /transactions/chart-of-accounts/details as active for /transactions/chart-of-accounts
    return current.startsWith(href + '/')
  }
  return (
    <div>
      <div className="flex flex-nowrap items-center gap-1 overflow-x-auto">
        {sections.map((s) => (
          <Link key={s.href} href={s.href as any} className={`${isActive(s.href) ? 'btn-primary' : 'btn-secondary'} btn-xs whitespace-nowrap`}>
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
