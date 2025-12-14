"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const sections = [
  { href: '/time/projects', label: 'Projects' },
  { href: '/time/time-entries', label: 'Time entries' },
  { href: '/time/schedule', label: 'Schedule' },
]

export default function TimeNav({ activeHref }: { activeHref?: string }) {
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
