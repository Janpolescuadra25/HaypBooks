'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  path: string
  icon?: React.ReactNode
}

interface SectionBreadcrumbProps {
  items: BreadcrumbItem[]
}

export function SectionBreadcrumb({ items }: SectionBreadcrumbProps) {
  if (items.length === 0) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 px-4 py-2 text-xs text-slate-500 overflow-x-auto no-scrollbar"
    >
      <Link
        href="/home/dashboard"
        className="flex items-center gap-1 hover:text-emerald-700 transition-colors shrink-0"
        aria-label="Home"
      >
        <Home size={12} />
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1

        return (
          <span key={idx} className="flex items-center gap-1 shrink-0">
            <ChevronRight size={12} className="text-slate-300 shrink-0" />
            {isLast ? (
              <span
                className="font-medium text-slate-700 truncate max-w-[160px]"
                aria-current="page"
                title={item.label}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.path}
                className="hover:text-emerald-700 transition-colors truncate max-w-[120px]"
                title={item.label}
              >
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
