"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const sections = [
  { href: '/customer-hub', label: 'Overview', desc: 'Customer hub overview and activity.' },
  { href: '/customer-hub/leads', label: 'Leads', desc: 'Manage your sales leads and prospects.' },
  { href: '/customers', label: 'Customers', desc: 'View and manage customer information.' },
  { href: '/customer-hub/estimates', label: 'Estimates', desc: 'Create and track estimates.' },
  { href: '/customer-hub/contracts', label: 'Contracts', desc: 'Manage customer contracts.' },
  { href: '/customer-hub/appointments', label: 'Appointments', desc: 'Schedule and track appointments.' },
  { href: '/customer-hub/reviews', label: 'Reviews', desc: 'View and manage customer reviews.' },
]

export default function CustomerHubNav({ activeHref }: { activeHref?: string }) {
  const pathname = usePathname()
  
  function isActive(href: string) {
    if (activeHref) return activeHref === href
    if (href === '/customer-hub') {
      return pathname === '/customer-hub'
    }
    if (href === '/customers') {
      return pathname === '/customers' || pathname?.startsWith('/customers/')
    }
    return pathname === href || pathname?.startsWith(href + '/')
  }
  
  return (
  <div>
      <div className="flex flex-nowrap items-center gap-1 overflow-x-auto">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href as any}
            className={`${isActive(s.href) ? 'btn-primary' : 'btn-secondary'} btn-xs whitespace-nowrap`}
          >
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
