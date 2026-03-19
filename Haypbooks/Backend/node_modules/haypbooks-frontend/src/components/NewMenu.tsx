'use client'

/**
 * NewMenu — Quick-access contextual menu for the AppShell header.
 * Provides fast navigation to recently visited pages and common actions.
 */

import { useState, useRef, useEffect } from 'react'
import { Grid3X3, ChevronDown } from 'lucide-react'
import Link from 'next/link'

const QUICK_LINKS = [
  { label: 'New Invoice', href: '/sales/sales-operations/invoices' },
  { label: 'New Bill', href: '/expenses/payables/bills' },
  { label: 'New Journal Entry', href: '/accounting/core-accounting/journal-entries' },
  { label: 'Bank Reconciliation', href: '/banking-cash/bank-accounts/reconcile' },
  { label: 'Run Payroll', href: '/payroll-workforce/payroll-processing/payroll-runs' },
  { label: 'New Expense', href: '/expenses/expense-management/expense-claims' },
]

export default function NewMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Quick actions menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
      >
        <Grid3X3 size={13} />
        New
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-[300] w-52 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 overflow-hidden">
          <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Actions</p>
          {QUICK_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
