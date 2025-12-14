"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const sections = [
  { href: '/reports', label: 'Standard reports' },
  { href: '/reports/custom', label: 'Custom reports' },
  { href: '/reports/management', label: 'Management reports' },
  { href: '/reports/performance-center', label: 'Performance center' },
]

export default function ReportsNav({ activeHref }: { activeHref?: string }) {
  const pathname = usePathname()
  const current = activeHref || pathname
  return (
    <div>
      <div className="flex flex-nowrap items-center gap-1 overflow-x-auto">
        {sections.map((s) => (
          <Link key={s.href} href={s.href as any} aria-current={current === s.href ? 'page' : undefined} className={`${current === s.href ? 'btn-primary' : 'btn-secondary'} btn-xs whitespace-nowrap`}>
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
