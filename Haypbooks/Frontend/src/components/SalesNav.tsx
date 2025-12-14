"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const sections = [
  { href: '/sales', label: 'Overview', desc: 'Your receivables hub with recent activity and A/R aging.' },
  { href: '/sales/all-sales', label: 'Sales transactions', desc: 'View all sales activity across invoices and receipts.' },
  { href: '/sales/invoices', label: 'Invoices', desc: 'Create, send, and track invoices and payments.' },
  { href: '/sales/products-services', label: 'Products & Services', desc: 'Manage your products and services catalog.' },
  { href: '/sales/payment-links', label: 'Payment links', desc: 'Share links for quick, one-off payments.' },
  { href: '/sales/recurring-payments', label: 'Recurring payments', desc: 'Automate ongoing billing for subscriptions or retainers.' },
  { href: '/sales/sales-orders', label: 'Sales orders', desc: 'Track pending orders and fulfillments.' },
  { href: '/sales/sales-channels', label: 'Sales channels', desc: 'Manage your sales channels and integrations.' },
  { href: '/sales/haypbooks-payouts', label: 'Haypbooks payouts', desc: 'View and manage Haypbooks payment payouts.' },
  { href: '/sales/channel-payouts', label: 'Channel payouts', desc: 'Track payouts from sales channels.' },
]

export default function SalesNav({ activeHref }: { activeHref?: string }) {
  const pathname = usePathname()
  const current = activeHref || pathname
  return (
  <div>
      <div className="flex flex-nowrap items-center gap-1 overflow-x-auto">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href as any}
            className={`${current === s.href ? 'btn-primary' : 'btn-secondary'} btn-xs whitespace-nowrap`}
          >
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
