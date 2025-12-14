"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import Amount from '@/components/Amount'

type SalesSummary = {
  totalSales: number
  paidInvoices: number
  unbilledActivity: number
  customerCount: number
}

export default function SalesWidget() {
  const [summary, setSummary] = useState<SalesSummary>({
    totalSales: 0,
    paidInvoices: 0,
    unbilledActivity: 0,
    customerCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await api<{ summary: SalesSummary }>('/api/dashboard/sales')
        setSummary(data.summary || summary)
      } catch (err) {
        console.error('Failed to load sales', err)
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
        <h3 className="text-lg font-semibold text-slate-900">Sales</h3>
        <Link href="/sales" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
          View all
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg text-white">
          <p className="text-sm opacity-90 mb-1">Total Sales (MTD)</p>
          <p className="text-2xl font-bold">
            <Amount value={summary.totalSales} />
          </p>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg text-white">
          <p className="text-sm opacity-90 mb-1">Paid Invoices</p>
          <p className="text-2xl font-bold">
            <Amount value={summary.paidInvoices} />
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div>
            <p className="text-sm font-medium text-amber-900">Unbilled Activity</p>
            <p className="text-xs text-amber-700 mt-1">Time and expenses not yet invoiced</p>
          </div>
          <p className="text-lg font-bold text-amber-900">
            <Amount value={summary.unbilledActivity} />
          </p>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <p className="text-sm font-medium text-slate-900">Active Customers</p>
          <p className="text-lg font-bold text-slate-900">{summary.customerCount}</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200 flex gap-3 text-sm">
        <Link href="/customers" className="text-sky-600 hover:text-sky-700 font-medium">
          Customers
        </Link>
        <Link href="/reports/sales-by-customer-summary" className="text-sky-600 hover:text-sky-700 font-medium">
          Sales report
        </Link>
      </div>
    </div>
  )
}
