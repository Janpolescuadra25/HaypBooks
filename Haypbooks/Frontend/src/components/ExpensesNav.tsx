"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const sections = [
  { href: '/expenses', label: 'Expenses', desc: 'Track spend, categorize receipts, and analyze outflows.' },
  { href: '/bills', label: 'Bills', desc: 'Capture vendor bills and manage approvals and payables.' },
  { href: '/purchase-orders', label: 'Purchase orders', desc: 'Issue and track purchase authorizations.' },
  { href: '/bill-payments', label: 'Bill payments', desc: 'Review and manage outgoing payments to vendors.' },
  { href: '/vendors', label: 'Vendors', desc: 'Manage vendor records and terms.' },
  { href: '/contractors', label: 'Contractors', desc: 'Track contractor payments and details.' },
  { href: '/mileage', label: 'Mileage', desc: 'Record business mileage for reimbursement or deduction.' },
  { href: '/1099-filings', label: '1099 filings', desc: 'Prepare and review 1099 forms for eligible payees.' },
]

export default function ExpensesNav({ activeHref }: { activeHref?: string }) {
  const pathname = usePathname()
  const current = activeHref || pathname
  const isActive = (href: string) => {
    if (!current) return false
    if (current === href) return true
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
