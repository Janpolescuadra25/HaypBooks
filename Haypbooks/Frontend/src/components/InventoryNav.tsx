"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const sections = [
  { href: '/inventory/overview', label: 'Overview' },
  { href: '/inventory/inventory', label: 'Inventory' },
  { href: '/inventory/sales-orders', label: 'Sales orders' },
  { href: '/inventory/purchase-orders', label: 'Purchase Orders' },
  { href: '/inventory/shipping', label: 'Shipping' },
]

export default function InventoryNav({ activeHref }: { activeHref?: string }) {
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
