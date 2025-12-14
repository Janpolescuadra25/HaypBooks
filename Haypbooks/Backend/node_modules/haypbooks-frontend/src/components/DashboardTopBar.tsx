"use client"
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { ReactNode } from 'react'

// Dashboard navigation pills (matches SalesNav structure)
export default function DashboardTopBar({ rightActions }: { rightActions?: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-nowrap items-center gap-1 overflow-x-auto">
        <Link href="/dashboard" className={`${pathname==='/dashboard' || pathname === '/dashboard/overview' ? 'btn-primary' : 'btn-secondary'} btn-xs whitespace-nowrap`} aria-label="Go to Overview">Overview</Link>
        <Link href="/dashboard/cash-flow" className={`${pathname==='/dashboard/cash-flow' ? 'btn-primary' : 'btn-secondary'} btn-xs whitespace-nowrap`} aria-label="Go to Cash Flow">Cash Flow</Link>
        <Link href="/dashboard/flow" className={`${pathname==='/dashboard/flow' ? 'btn-primary' : 'btn-secondary'} btn-xs whitespace-nowrap`} aria-label="Go to Workflow">Workflow</Link>
      </div>
      {rightActions ? (
        <div className="flex items-center gap-2 shrink-0">
          {rightActions}
        </div>
      ) : null}
    </div>
  )
}
