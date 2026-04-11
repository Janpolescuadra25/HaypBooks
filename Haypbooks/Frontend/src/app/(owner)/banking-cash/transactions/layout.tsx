'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { label: 'Bank Transactions', href: '/banking-cash/transactions' },
  { label: 'Bank Rules',        href: '/banking-cash/transactions/rules' },
]

export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Full-screen pages render without the module tab bar
  const isFullScreen =
    pathname.startsWith('/banking-cash/transactions/match') ||
    pathname.startsWith('/banking-cash/transactions/split') ||
    pathname.startsWith('/banking-cash/transactions/transfer') ||
    pathname.startsWith('/banking-cash/transactions/view-record')

  if (isFullScreen) return <>{children}</>

  return (
    <>
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="px-6 overflow-x-auto">
          <nav className="flex gap-1 min-w-max" aria-label="Transactions tabs">
            {TABS.map(tab => {
              const isActive = tab.href === '/banking-cash/transactions'
                ? pathname === tab.href || pathname.startsWith('/banking-cash/transactions/register')
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
      <div>{children}</div>
    </>
  )
}
