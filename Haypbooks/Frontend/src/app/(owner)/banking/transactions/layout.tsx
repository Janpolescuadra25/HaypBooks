'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { label: 'Bank Transactions', href: '/banking/transactions' },
  { label: 'Undeposited Funds', href: '/banking/transactions/undeposited-funds' },
  { label: 'Deposits', href: '/banking/transactions/deposits' },
  { label: 'Bank Rules', href: '/banking/transactions/rules' },
]

export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Full-screen pages render without the module tab bar
  const isFullScreen =
    pathname.startsWith('/banking/transactions/match') ||
    pathname.startsWith('/banking/transactions/split') ||
    pathname.startsWith('/banking/transactions/transfer') ||
    pathname.startsWith('/banking/transactions/view-record')

  if (isFullScreen) return <>{children}</>

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div className="px-6 overflow-x-auto">
          <nav className="flex gap-1 min-w-max" aria-label="Transactions tabs">
            {TABS.map(tab => {
              const isActive = tab.href === '/banking/transactions'
                ? pathname === tab.href || pathname.startsWith('/banking/transactions/register') || pathname.startsWith('/banking/transactions/view-record') || pathname.startsWith('/banking/transactions/match') || pathname.startsWith('/banking/transactions/split') || pathname.startsWith('/banking/transactions/transfer') || pathname.startsWith('/banking/transactions/activity')
                : pathname === tab.href || pathname.startsWith(tab.href + '/')
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
