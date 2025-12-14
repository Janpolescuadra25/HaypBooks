"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import Amount from '@/components/Amount'

type InvoiceTotals = {
  open: number
  overdue: number
  paid: number
  openCount: number
  overdueCount: number
  paidCount: number
}

export default function InvoicesWidget() {
  const [totals, setTotals] = useState<InvoiceTotals>({
    open: 0,
    overdue: 0,
    paid: 0,
    openCount: 0,
    overdueCount: 0,
    paidCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        type InvoicesApiResponse = { totals?: InvoiceTotals }
        const data = await api<InvoicesApiResponse>('/api/dashboard/invoices')
        setTotals(data?.totals || totals)
      } catch (err) {
        console.error('Failed to load invoices', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="animate-pulse bg-slate-100 rounded h-32" />
  }

  return (
    <div className="glass-card !shadow-none border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Invoices</h3>
        <Link href="/sales/invoices/new" className="btn-primary btn-xs">
          + New invoice
        </Link>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-700 font-medium uppercase mb-1">Open</p>
          <p className="text-2xl font-bold text-amber-900">
            <Amount value={totals.open} />
          </p>
          <p className="text-xs text-amber-600 mt-1">{totals.openCount} invoice{totals.openCount !== 1 ? 's' : ''}</p>
        </div>
        
        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs text-red-700 font-medium uppercase mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-900">
            <Amount value={totals.overdue} />
          </p>
          <p className="text-xs text-red-600 mt-1">{totals.overdueCount} invoice{totals.overdueCount !== 1 ? 's' : ''}</p>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-700 font-medium uppercase mb-1">Paid (30d)</p>
          <p className="text-2xl font-bold text-green-900">
            <Amount value={totals.paid} />
          </p>
          <p className="text-xs text-green-600 mt-1">{totals.paidCount} invoice{totals.paidCount !== 1 ? 's' : ''}</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200 flex gap-3 text-sm">
        <Link href="/sales/invoices" className="text-sky-600 hover:text-sky-700 font-medium">
          View all invoices
        </Link>
        <Link href="/reports/ar-aging" className="text-sky-600 hover:text-sky-700 font-medium">
          A/R aging
        </Link>
      </div>
    </div>
  )
}
