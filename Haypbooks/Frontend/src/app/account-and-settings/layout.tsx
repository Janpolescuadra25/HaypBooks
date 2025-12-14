"use client"
import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { key: 'company', label: 'Company' },
  { key: 'billing', label: 'Billing & Subscription' },
  { key: 'usage', label: 'Usage' },
  { key: 'sales', label: 'Sales' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'payments', label: 'Payments' },
  { key: 'time', label: 'Time' },
  { key: 'advanced', label: 'Advanced' },
]

export default function AccountAndSettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const active = NAV_ITEMS.find(i => pathname === `/account-and-settings/${i.key}`)
  return (
    <div className="glass-card max-w-7xl">
      {/* Sub-navigation bar for settings sections (title removed to avoid redundancy) */}
      <nav aria-label="Account & Settings navigation" className="mb-6 rounded-md border border-slate-200 bg-white/90 px-3 py-2" role="navigation">
        <ul className="flex flex-wrap gap-2">
          {NAV_ITEMS.map(item => {
            const href = `/account-and-settings/${item.key}`
            const isActive = pathname === href
            return (
              <li key={item.key}>
                <Link
                  href={{ pathname: href }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm transition ${isActive ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <main className="px-1 pb-10">{children}</main>
    </div>
  )
}
