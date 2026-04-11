'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { label: 'Bank Feed', href: '/banking-cash/transactions', exact: true  },
  { label: 'Register',  href: '/banking-cash/transactions/register', exact: false },
]

export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="px-6 overflow-x-auto">
          <nav className="flex gap-1 min-w-max" aria-label="Transactions tabs">
            {TABS.map(tab => {
              const isActive = tab.exact
                ? pathname === tab.href
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
