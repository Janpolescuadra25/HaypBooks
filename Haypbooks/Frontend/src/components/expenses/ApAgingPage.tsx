'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, AlertCircle, DollarSign, Search, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import DataPage from '@/components/shared/DataPage'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useFixedWidthResizableMap } from '@/hooks/useFixedWidthTableResize'
import ColumnResizer from '@/components/ColumnResizer'

interface AgingBucket { current: number; days1to30: number; days31to60: number; days61to90: number; over90: number; total: number }
interface VendorAging { vendorId: string; vendorName: string; current: number; days1to30: number; days31to60: number; days61to90: number; over90: number; total: number }

type SortKey = 'vendorName' | 'current' | 'days1to30' | 'days31to60' | 'days61to90' | 'over90' | 'total'

const AGING_TABLE_ORDER: SortKey[] = ['vendorName', 'current', 'days1to30', 'days31to60', 'days61to90', 'over90', 'total']
const DEFAULT_AGING_COL_WIDTHS: Record<SortKey, number> = {
  vendorName: 220,
  current: 120,
  days1to30: 120,
  days31to60: 120,
  days61to90: 120,
  over90: 120,
  total: 130,
}
const AGING_COLUMNS_STORAGE_KEY = 'ap-aging-page-column-widths-v1'

function loadAgingWidthMap(): Record<string, number> {
  try {
    const saved = localStorage.getItem(AGING_COLUMNS_STORAGE_KEY)
    if (!saved) return DEFAULT_AGING_COL_WIDTHS
    const parsed = JSON.parse(saved) as Record<string, number>
    return {
      ...DEFAULT_AGING_COL_WIDTHS,
      ...Object.fromEntries(Object.entries(parsed).filter(([key]) => AGING_TABLE_ORDER.includes(key as SortKey))),
    }
  } catch {
    return DEFAULT_AGING_COL_WIDTHS
  }
}

function compareAging(a: VendorAging, b: VendorAging, key: SortKey, dir: 'asc' | 'desc') {
  const left = a[key] ?? ''
  const right = b[key] ?? ''
  if (key !== 'vendorName') {
    return dir === 'asc' ? Number(left) - Number(right) : Number(right) - Number(left)
  }
  return dir === 'asc'
    ? String(left).toLowerCase().localeCompare(String(right).toLowerCase())
    : String(right).toLowerCase().localeCompare(String(left).toLowerCase())
}

export default function ApAgingPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [summary, setSummary] = useState<AgingBucket>({ current: 0, days1to30: 0, days31to60: 0, days61to90: 0, over90: 0, total: 0 })
  const [vendors, setVendors] = useState<VendorAging[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('vendorName')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [widths, setWidths] = useState<Record<string, number>>(() => loadAgingWidthMap())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const widthsRef = useRef(widths)

  useEffect(() => { widthsRef.current = widths }, [widths])

  useFixedWidthResizableMap({
    widths,
    widthsRef,
    order: AGING_TABLE_ORDER,
    saveWidths: (next) => {
      setWidths(next)
      try { localStorage.setItem(AGING_COLUMNS_STORAGE_KEY, JSON.stringify(next)) } catch { }
    },
    fixedWidth: 100,
    minWidth: 100,
    fallbackMinWidth: 100,
  })

  const fetchAging = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ap/reports/aging`)
      if (data.summary) setSummary(data.summary)
      else setSummary({
        current: data.current ?? 0,
        days1to30: data.days1to30 ?? 0,
        days31to60: data.days31to60 ?? 0,
        days61to90: data.days61to90 ?? 0,
        over90: data.over90 ?? 0,
        total: data.total ?? 0,
      })
      setVendors(data.vendors ?? data.details ?? data.items ?? [])
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load aging report')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchAging() }, [fetchAging])

  const filtered = useMemo(() => {
    if (!search) return vendors
    const q = search.toLowerCase()
    return vendors.filter((vendor) =>
      vendor.vendorName.toLowerCase().includes(q),
    )
  }, [vendors, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => compareAging(a, b, sortKey, sortDir))
  }, [filtered, sortKey, sortDir])

  useEffect(() => {
    const total = Math.max(1, Math.ceil(sorted.length / pageSize))
    if (currentPage > total) {
      setCurrentPage(total)
    }
  }, [currentPage, pageSize, sorted.length])

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, currentPage, pageSize])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
      return
    }
    setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
  }

  const columns = useMemo(() => {
    const makeHeader = (label: string, key: SortKey, width: number) => (
      <div className="relative flex items-center gap-2">
        <button
          type="button"
          onClick={() => toggleSort(key)}
          className="inline-flex items-center gap-2 text-left font-medium text-slate-800 hover:text-slate-900"
        >
          {label}
          {sortKey === key ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-40" />}
        </button>
        <ColumnResizer colKey={key} width={width} onChange={(_, next) => setWidths((prev) => ({ ...prev, [key]: next }))} min={80} />
      </div>
    )

    return [
      {
        accessorKey: 'vendorName',
        header: makeHeader('Vendor', 'vendorName', widths.vendorName),
        meta: { align: 'left', style: { width: widths.vendorName, minWidth: widths.vendorName, maxWidth: widths.vendorName } },
      },
      {
        accessorKey: 'current',
        header: makeHeader('Current', 'current', widths.current),
        meta: { align: 'right', style: { width: widths.current, minWidth: widths.current, maxWidth: widths.current } },
        cell: ({ getValue }) => <span className="font-semibold tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'days1to30',
        header: makeHeader('1-30 Days', 'days1to30', widths.days1to30),
        meta: { align: 'right', style: { width: widths.days1to30, minWidth: widths.days1to30, maxWidth: widths.days1to30 } },
        cell: ({ getValue }) => <span className="font-semibold tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'days31to60',
        header: makeHeader('31-60 Days', 'days31to60', widths.days31to60),
        meta: { align: 'right', style: { width: widths.days31to60, minWidth: widths.days31to60, maxWidth: widths.days31to60 } },
        cell: ({ getValue }) => <span className="font-semibold tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'days61to90',
        header: makeHeader('61-90 Days', 'days61to90', widths.days61to90),
        meta: { align: 'right', style: { width: widths.days61to90, minWidth: widths.days61to90, maxWidth: widths.days61to90 } },
        cell: ({ getValue }) => <span className="font-semibold tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'over90',
        header: makeHeader('90+ Days', 'over90', widths.over90),
        meta: { align: 'right', style: { width: widths.over90, minWidth: widths.over90, maxWidth: widths.over90 } },
        cell: ({ getValue }) => <span className="font-semibold tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'total',
        header: makeHeader('Total', 'total', widths.total),
        meta: { align: 'right', style: { width: widths.total, minWidth: widths.total, maxWidth: widths.total } },
        cell: ({ getValue }) => <span className="font-semibold text-emerald-800 tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
    ]
  }, [fmt, sortDir, sortKey, widths])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))

  if (cidLoading || loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-emerald-700">Loading…</span>
      </div>
    )
  }

  if (cidError) {
    return <div className="p-6 text-center text-red-600">{cidError}</div>
  }

  const buckets = [
    { label: 'Current', value: summary.current, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { label: '1-30 Days', value: summary.days1to30, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { label: '31-60 Days', value: summary.days31to60, color: 'text-orange-700 bg-orange-50 border-orange-200' },
    { label: '61-90 Days', value: summary.days61to90, color: 'text-red-600 bg-red-50 border-red-200' },
    { label: '90+ Days', value: summary.over90, color: 'text-red-800 bg-red-100 border-red-300' },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-emerald-900">A/P Aging</h1>
        <p className="text-sm text-emerald-600/70 mt-1">Total outstanding {fmt(summary.total)}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {buckets.map((bucket) => (
          <div key={bucket.label} className={`rounded-xl border p-4 ${bucket.color}`}>
            <p className="text-xs font-medium opacity-80">{bucket.label}</p>
            <p className="text-lg font-bold mt-1">{fmt(bucket.value)}</p>
          </div>
        ))}
      </div>

      <DataPage
        title="A/P Aging"
        subtitle={`${sorted.length} vendor aging rows`}
        filters={(
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              placeholder="Search vendors…"
              className="w-full pl-9 pr-3 py-2 border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        )}
        columns={columns}
        data={paged}
        isLoading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={sorted.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1) }}
        selectedIds={[]}
        onSelectionChange={() => {}}
        getRowId={(row) => row.vendorId}
        emptyTitle="No aging data available"
        emptyDescription="Try adjusting filters or refresh the report."
      />
    </div>
  )
}
