'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, AlertCircle, X, Download, Clock } from 'lucide-react'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypColumn } from '@/components/shared/HaypDataTable.types'
import { salesService } from '@/services/sales.service'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

interface AgingBucket {
  label: string
  amount: number
  count?: number
}

interface AgingCustomer {
  customerId: string
  customerName: string
  current: number
  days30: number
  days60: number
  days90: number
  over90: number
  total: number
}

export default function ArAgingPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [asOf, setAsOf] = useState(new Date().toISOString().split('T')[0])
  const [search, setSearch] = useState('')
  const [drawerCustomer, setDrawerCustomer] = useState<AgingCustomer | null>(null)
  const [drawerTab, setDrawerTab] = useState<'details' | 'activity'>('details')
  const [agingActivity, setAgingActivity] = useState<any[]>([])
  const [agingActivityLoading, setAgingActivityLoading] = useState(false)

  const fetchAging = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await salesService.getArAgingReport(companyId, { asOf })
      setData(response.data)
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load aging report')
    } finally {
      setLoading(false)
    }
  }, [companyId, asOf])

  useEffect(() => { fetchAging() }, [fetchAging])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  // Support both flat and structured response formats
  const buckets: AgingBucket[] = data?.buckets ?? data?.summary ?? []
  const allCustomers: AgingCustomer[] = data?.customers ?? data?.details ?? []
  const totalOutstanding = data?.total ?? allCustomers.reduce((s: number, c: AgingCustomer) => s + c.total, 0) ?? 0

  const columns = useMemo<HaypColumn<AgingCustomer>[]>(() => [
    { id: 'customerName', header: 'Customer', accessorKey: 'customerName', size: 220 },
    {
      id: 'current',
      header: 'Current',
      accessorKey: 'current',
      size: 120,
      align: 'right',
      render: (_value, row) => (row.current ? fmt(row.current) : '—'),
    },
    {
      id: 'days30',
      header: '1-30 Days',
      accessorKey: 'days30',
      size: 120,
      align: 'right',
      render: (_value, row) => (row.days30 ? fmt(row.days30) : '—'),
    },
    {
      id: 'days60',
      header: '31-60 Days',
      accessorKey: 'days60',
      size: 120,
      align: 'right',
      render: (_value, row) => (row.days60 ? fmt(row.days60) : '—'),
    },
    {
      id: 'days90',
      header: '61-90 Days',
      accessorKey: 'days90',
      size: 120,
      align: 'right',
      render: (_value, row) => (row.days90 ? fmt(row.days90) : '—'),
    },
    {
      id: 'over90',
      header: 'Over 90 Days',
      accessorKey: 'over90',
      size: 120,
      align: 'right',
      render: (_value, row) => (row.over90 ? fmt(row.over90) : '—'),
    },
    {
      id: 'total',
      header: 'Total',
      accessorKey: 'total',
      size: 140,
      align: 'right',
      render: (_value, row) => fmt(row.total),
    },
  ], [fmt])

  const openDrawer = (customer: AgingCustomer) => {
    setDrawerCustomer(customer)
    setDrawerTab('details')
    setAgingActivity([])
  }

  const loadCustomerActivity = useCallback(async (customerId: string) => {
    if (!companyId) return
    setAgingActivityLoading(true)
    try {
      const response = await salesService.getArCustomerActivity(companyId, customerId)
      const activityData = response.data
      setAgingActivity(Array.isArray(activityData?.data) ? activityData.data : Array.isArray(activityData) ? activityData : [])
    } catch {
      setAgingActivity([])
    } finally {
      setAgingActivityLoading(false)
    }
  }, [companyId])

  const filteredCustomers = useMemo(() => {
    if (!search) return allCustomers
    return allCustomers.filter((c) => c.customerName?.toLowerCase().includes(search.toLowerCase()))
  }, [allCustomers, search])

  function exportCsv() {
    const headers = ['Customer', 'Current', '1-30 Days', '31-60 Days', '61-90 Days', 'Over 90 Days', 'Total']
    const rows = filteredCustomers.map(c => [
      c.customerName, c.current, c.days30, c.days60, c.days90, c.over90, c.total,
    ])
    const totalsRow = [
      'Total',
      filteredCustomers.reduce((s, c) => s + (c.current || 0), 0),
      filteredCustomers.reduce((s, c) => s + (c.days30 || 0), 0),
      filteredCustomers.reduce((s, c) => s + (c.days60 || 0), 0),
      filteredCustomers.reduce((s, c) => s + (c.days90 || 0), 0),
      filteredCustomers.reduce((s, c) => s + (c.over90 || 0), 0),
      filteredCustomers.reduce((s, c) => s + (c.total || 0), 0),
    ]
    const csv = [headers, ...rows, totalsRow].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `ar-aging-${asOf}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  if (cidLoading) {
    return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /><span className="ml-2 text-emerald-700">Loading…</span></div>
  }
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">AR Aging Report</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">Accounts Receivable aging summary</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
            <span className="text-xs text-slate-500">As of</span>
            <input
              type="date"
              value={asOf}
              onChange={e => setAsOf(e.target.value)}
              className="text-sm border-0 focus:outline-none focus:ring-0"
            />
          </div>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} /> {error} <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Summary buckets */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
        </div>
      ) : (
        <>
          {buckets.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {buckets.map((b, i) => (
                <div key={i} className="bg-white rounded-xl border border-emerald-100 p-4">
                  <p className="text-xs text-emerald-600/60 font-medium">{b.label}</p>
                  <p className="text-lg font-bold text-emerald-800 mt-1">{fmt(b.amount)}</p>
                  {b.count !== undefined && <p className="text-xs text-emerald-500 mt-0.5">{b.count} invoices</p>}
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 flex items-center justify-between">
            <span className="font-semibold text-emerald-700">Total Outstanding</span>
            <span className="text-xl font-bold text-emerald-800">{fmt(totalOutstanding)}</span>
          </div>

          {/* Customer detail */}
          {allCustomers.length > 0 && (
            <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden">
              <HaypDataTable
                data={allCustomers}
                columns={columns}
                tableId="ar-aging"
                loading={loading}
                globalFilter={search}
                onGlobalFilterChange={setSearch}
                headerActions={<button type="button" onClick={exportCsv} className="flex items-center gap-2 px-3 py-2 text-sm border border-emerald-200 rounded-lg text-emerald-700 hover:bg-emerald-50">Export CSV</button>}
                onRowClick={openDrawer}
                emptyTitle="No customers found"
                emptySubtitle="Try adjusting your search or changing the as-of date"
              />
            </div>
          )}

          {drawerCustomer && (
            <div className="fixed inset-0 z-50 flex">
              <div className="flex-1 bg-black/30" onClick={() => setDrawerCustomer(null)} />
              <div className="flex w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{drawerCustomer.customerName}</h2>
                    <p className="mt-0.5 text-sm text-slate-500">A/R aging snapshot as of {asOf}</p>
                  </div>
                  <button onClick={() => setDrawerCustomer(null)} title="Close details" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
                </div>
                <div className="flex border-b border-slate-200 bg-slate-50 px-5">
                  {(['details', 'activity'] as const).map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        setDrawerTab(tab)
                        if (tab === 'activity' && agingActivity.length === 0) {
                          loadCustomerActivity(drawerCustomer.customerId)
                        }
                      }}
                      className={`border-b-2 px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${drawerTab === tab ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                      {tab === 'activity' ? <span className="flex items-center gap-1"><Clock size={13} />Activity</span> : 'Details'}
                    </button>
                  ))}
                </div>
                {drawerTab === 'activity' ? (
                  <div className="space-y-3 px-5 py-4">
                    {agingActivityLoading ? (
                      <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-slate-400" /></div>
                    ) : agingActivity.length === 0 ? (
                      <p className="py-8 text-center text-sm text-slate-400">No activity recorded yet.</p>
                    ) : agingActivity.map((log: any) => (
                      <div key={log.id} className="flex items-start gap-3 text-sm">
                        <Clock size={13} className="mt-0.5 shrink-0 text-slate-400" />
                        <div>
                          <span className="font-semibold text-slate-700">{log.action}</span>
                          {log.user && <span className="text-slate-500"> by {log.user.name ?? log.user.email}</span>}
                          <span className="ml-2 text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 space-y-4 px-5 py-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Current</p>
                        <p className="font-semibold text-slate-800">{fmt(drawerCustomer.current)}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">1-30 Days</p>
                        <p className="font-semibold text-slate-800">{fmt(drawerCustomer.days30)}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">31-60 Days</p>
                        <p className="font-semibold text-slate-800">{fmt(drawerCustomer.days60)}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">61-90 Days</p>
                        <p className="font-semibold text-slate-800">{fmt(drawerCustomer.days90)}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Over 90 Days</p>
                        <p className="font-semibold text-red-600">{fmt(drawerCustomer.over90)}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Total Outstanding</p>
                        <p className="font-bold text-xl text-emerald-800">{fmt(drawerCustomer.total)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
