'use client'

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { Loader2, AlertCircle, X, Download, Search, ArrowUpDown } from 'lucide-react'
import apiClient from '@/lib/api-client'
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

type AgingSortKey = 'customerName' | 'current' | 'days30' | 'days60' | 'days90' | 'over90' | 'total'
type AgingSortDir = 'asc' | 'desc'

function compareAging(a: AgingCustomer, b: AgingCustomer, key: AgingSortKey, dir: AgingSortDir): number {
  if (key === 'customerName') {
    const as = (a.customerName ?? '').toLowerCase(); const bs = (b.customerName ?? '').toLowerCase()
    return dir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as)
  }
  const av = a[key] ?? 0; const bv = b[key] ?? 0
  return dir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
}

interface AgingColDef { key: string; label: string; visible: boolean; width: number; align?: 'left' | 'right' }
const DEFAULT_AGING_COLS: AgingColDef[] = [
  { key: 'customerName', label: 'Customer', visible: true, width: 200, align: 'left' },
  { key: 'current', label: 'Current', visible: true, width: 100, align: 'right' },
  { key: 'days30', label: '1-30', visible: true, width: 100, align: 'right' },
  { key: 'days60', label: '31-60', visible: true, width: 100, align: 'right' },
  { key: 'days90', label: '61-90', visible: true, width: 100, align: 'right' },
  { key: 'over90', label: '90+', visible: true, width: 100, align: 'right' },
  { key: 'total', label: 'Total', visible: true, width: 110, align: 'right' },
]
function loadAgingCols(): AgingColDef[] {
  try {
    const s = localStorage.getItem('ar-aging-cols-v1')
    if (s) {
      const saved = JSON.parse(s) as AgingColDef[]
      return DEFAULT_AGING_COLS.map(d => { const sc = saved.find(c => c.key === d.key); return sc ? { ...d, width: sc.width } : d })
    }
  } catch { /* ignore */ }
  return DEFAULT_AGING_COLS
}

export default function ArAgingPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [asOf, setAsOf] = useState(new Date().toISOString().split('T')[0])
  const [search, setSearch] = useState('')
  const [agingSortKey, setAgingSortKey] = useState<AgingSortKey>('total')
  const [agingSortDir, setAgingSortDir] = useState<AgingSortDir>('desc')
  const toggleAgingSort = (key: AgingSortKey) => {
    if (agingSortKey === key) { setAgingSortDir(d => d === 'asc' ? 'desc' : 'asc') }
    else { setAgingSortKey(key); setAgingSortDir(key === 'customerName' ? 'asc' : 'desc') }
  }

  const fetchAging = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data: res } = await apiClient.get(`/companies/${companyId}/ar/reports/aging`, { params: { asOf } })
      setData(res)
      setError('')
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to load aging report') }
    finally { setLoading(false) }
  }, [companyId, asOf])

  useEffect(() => { fetchAging() }, [fetchAging])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  // Support both flat and structured response formats
  const buckets: AgingBucket[] = data?.buckets ?? data?.summary ?? []
  const allCustomers: AgingCustomer[] = data?.customers ?? data?.details ?? []
  const totalOutstanding = data?.total ?? allCustomers.reduce((s: number, c: AgingCustomer) => s + c.total, 0) ?? 0

  const customers = useMemo(() => {
    const filtered = !search
      ? allCustomers
      : allCustomers.filter(c => c.customerName?.toLowerCase().includes(search.toLowerCase()))
    return [...filtered].sort((a, b) => compareAging(a, b, agingSortKey, agingSortDir))
  }, [allCustomers, search, agingSortKey, agingSortDir])
  const [agingCols, setAgingCols] = useState<AgingColDef[]>(() => loadAgingCols())
  const agingColsRef = useRef(agingCols)
  useEffect(() => { agingColsRef.current = agingCols }, [agingCols])
  const saveAgingCols = (next: AgingColDef[]) => { setAgingCols(next); try { localStorage.setItem('ar-aging-cols-v1', JSON.stringify(next)) } catch { /* ignore */ } }
  const agingResizeRef = useRef<{ key: string; startX: number; startW: number } | null>(null)
  const startAgingResize = (e: React.MouseEvent, key: string, w: number) => {
    e.preventDefault()
    agingResizeRef.current = { key, startX: e.clientX, startW: w }
    const onMove = (mv: MouseEvent) => { if (!agingResizeRef.current) return; saveAgingCols(agingColsRef.current.map(c => c.key === agingResizeRef.current!.key ? { ...c, width: Math.max(80, agingResizeRef.current!.startW + mv.clientX - agingResizeRef.current!.startX) } : c)) }
    const onUp = () => { agingResizeRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }

  function exportCsv() {
    const headers = ['Customer', 'Current', '1-30', '31-60', '61-90', '90+', 'Total']
    const rows = customers.map(c => [
      c.customerName, c.current, c.days30, c.days60, c.days90, c.over90, c.total
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
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
          <div className="flex items-center gap-2 bg-white border border-emerald-100 rounded-lg px-3 py-1.5">
            <span className="text-xs text-emerald-500">As of</span>
            <input
              type="date"
              value={asOf}
              onChange={e => setAsOf(e.target.value)}
              className="text-sm border-0 focus:outline-none focus:ring-0"
            />
          </div>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-emerald-200 rounded-lg text-emerald-700 hover:bg-emerald-50"
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
              <div className="p-3 border-b border-emerald-50">
                <div className="relative w-72">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search customers…"
                    className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ tableLayout: 'fixed', minWidth: 710 }}>
                <colgroup>
                  {agingCols.map(c => <col key={c.key} style={{ width: c.width }} />)}
                </colgroup>
                <thead>
                  <tr className="bg-emerald-50/50 border-b border-emerald-100">
                    {agingCols.map(c => (
                      <th key={c.key} className="relative px-4 py-3 font-medium text-emerald-700 border-r border-emerald-100 select-none overflow-hidden" style={{ width: c.width, minWidth: c.width, maxWidth: c.width, textAlign: c.align === 'right' ? 'right' : 'left' }} title={c.label}>
                        <button onClick={() => toggleAgingSort(c.key as AgingSortKey)} className="flex items-center gap-1 w-full min-w-0 overflow-hidden pr-2" style={{ justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start' }}>
                          <span className="truncate">{c.label}</span><ArrowUpDown size={11} className={`shrink-0 ${agingSortKey === c.key ? 'text-emerald-600' : 'text-emerald-300'}`} />
                        </button>
                        <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startAgingResize(e, c.key, c.width)} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-emerald-400">No customers found.</td></tr>
                  ) : customers.map(c => (
                    <tr key={c.customerId} className="border-t border-emerald-50 hover:bg-emerald-50/30">
                      <td className="px-4 py-2.5 font-medium text-emerald-900 truncate border-r border-emerald-50" title={c.customerName}>{c.customerName}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums border-r border-emerald-50">{c.current ? fmt(c.current) : '—'}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums border-r border-emerald-50">{c.days30 ? fmt(c.days30) : '—'}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums border-r border-emerald-50">{c.days60 ? fmt(c.days60) : '—'}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums border-r border-emerald-50">{c.days90 ? fmt(c.days90) : '—'}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-red-600 border-r border-emerald-50">{c.over90 ? fmt(c.over90) : '—'}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-emerald-800 border-r border-emerald-50">{fmt(c.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
