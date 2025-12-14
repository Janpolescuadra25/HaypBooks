"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const sections = [
  { href: '/commerce/overview', label: 'Overview' },
  { href: '/commerce/sales-channels', label: 'Sales channels' },
  { href: '/commerce/catalog', label: 'Catalog' },
  { href: '/commerce/shipping', label: 'Shipping' },
  { href: '/commerce/payouts', label: 'Payouts' },
  { href: '/commerce/orders', label: 'Orders' },
]

export default function CommerceNav({ activeHref }: { activeHref?: string }) {
  const pathname = usePathname()
  const current = activeHref || pathname
  return (
    <div>
      <div className="flex flex-nowrap items-center gap-1 overflow-x-auto">
        {sections.map((s) => (
          <Link key={s.href} href={s.href as any} className={`${current === s.href ? 'btn-primary' : 'btn-secondary'} btn-xs whitespace-nowrap`}>
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
