'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import DataPage from '@/components/shared/DataPage'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import ColumnResizer from '@/components/ColumnResizer'

interface AgingRow {
  id: string
  vendorName: string
  current: number
  days1To30: number
  days31To60: number
  days61To90: number
  over90: number
  total: number
}

type SortKey = 'vendorName' | 'current' | 'days1To30' | 'days31To60' | 'days61To90' | 'over90' | 'total'

const AGING_TABLE_ORDER: SortKey[] = ['vendorName', 'current', 'days1To30', 'days31To60', 'days61To90', 'over90', 'total']
const DEFAULT_AGING_COL_WIDTHS: Record<SortKey, number> = {
  vendorName: 220,
  current: 120,
  days1To30: 120,
  days31To60: 120,
  days61To90: 120,
  over90: 120,
  total: 130,
}
const AP_AGING_COLUMNS_STORAGE_KEY = 'ap-aging-column-widths-v2'

const SAMPLE_ROWS: AgingRow[] = [
  { id: 'aging-001', vendorName: 'Luzon Supplies', current: 12500, days1To30: 4000, days31To60: 1500, days61To90: 0, over90: 0, total: 18000 },
  { id: 'aging-002', vendorName: 'MNL Office Solutions', current: 3000, days1To30: 5200, days31To60: 1200, days61To90: 900, over90: 500, total: 10800 },
  { id: 'aging-003', vendorName: 'Cebu Transport Co.', current: 0, days1To30: 0, days31To60: 3200, days61To90: 1400, over90: 2000, total: 6600 },
]

function loadAgingWidthMap(): Record<string, number> {
  try {
    const saved = localStorage.getItem(AP_AGING_COLUMNS_STORAGE_KEY)
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

function compareAging(a: AgingRow, b: AgingRow, key: SortKey, dir: 'asc' | 'desc') {
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
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [rows, setRows] = useState<AgingRow[]>(SAMPLE_ROWS)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [asOfDate, setAsOfDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [sortKey, setSortKey] = useState<SortKey>('total')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [widths, setWidths] = useState<Record<string, number>>(() => loadAgingWidthMap())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const saveWidths = useCallback((next: Record<string, number>) => {
    setWidths(next)
    try {
      localStorage.setItem(AP_AGING_COLUMNS_STORAGE_KEY, JSON.stringify(next))
    } catch {
    }
  }, [])

  const fetchAging = useCallback(async () => {
    if (!companyId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/reports/ap-aging`, { params: { asOfDate } })
      const incoming = Array.isArray(data)
        ? data
        : data.rows ?? data.vendors ?? []
      const normalized = incoming.map((row: any, index: number) => {
        const current = Number(row.current ?? row.bucketCurrent ?? 0)
        const days1To30 = Number(row.days1To30 ?? row.bucket1To30 ?? 0)
        const days31To60 = Number(row.days31To60 ?? row.bucket31To60 ?? 0)
        const days61To90 = Number(row.days61To90 ?? row.bucket61To90 ?? 0)
        const over90 = Number(row.over90 ?? row.bucketOver90 ?? 0)
        const total = Number(row.total ?? current + days1To30 + days31To60 + days61To90 + over90)
        return {
          id: String(row.id ?? row.vendorId ?? `row-${index}`),
          vendorName: String(row.vendorName ?? row.name ?? 'Unknown Vendor'),
          current,
          days1To30,
          days31To60,
          days61To90,
          over90,
          total,
        } as AgingRow
      })
      setRows(normalized)
    } catch {
      setRows(SAMPLE_ROWS)
    } finally {
      setLoading(false)
    }
  }, [asOfDate, companyId])

  useEffect(() => { fetchAging() }, [fetchAging])

  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter((row) => row.vendorName.toLowerCase().includes(q))
  }, [rows, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => compareAging(a, b, sortKey, sortDir))
  }, [filtered, sortKey, sortDir])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
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
        <button type="button" onClick={() => toggleSort(key)} className="inline-flex items-center gap-2 text-left font-medium text-slate-800 hover:text-slate-900">
          {label}
          {sortKey === key ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-40" />}
        </button>
        <ColumnResizer colKey={key} width={width} onChange={(_, next) => saveWidths({ ...widths, [key]: next })} min={80} />
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
        cell: ({ getValue }) => <span className="tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'days1To30',
        header: makeHeader('1-30', 'days1To30', widths.days1To30),
        meta: { align: 'right', style: { width: widths.days1To30, minWidth: widths.days1To30, maxWidth: widths.days1To30 } },
        cell: ({ getValue }) => <span className="tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'days31To60',
        header: makeHeader('31-60', 'days31To60', widths.days31To60),
        meta: { align: 'right', style: { width: widths.days31To60, minWidth: widths.days31To60, maxWidth: widths.days31To60 } },
        cell: ({ getValue }) => <span className="tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'days61To90',
        header: makeHeader('61-90', 'days61To90', widths.days61To90),
        meta: { align: 'right', style: { width: widths.days61To90, minWidth: widths.days61To90, maxWidth: widths.days61To90 } },
        cell: ({ getValue }) => <span className="tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'over90',
        header: makeHeader('Over 90', 'over90', widths.over90),
        meta: { align: 'right', style: { width: widths.over90, minWidth: widths.over90, maxWidth: widths.over90 } },
        cell: ({ getValue }) => <span className="tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'total',
        header: makeHeader('Total', 'total', widths.total),
        meta: { align: 'right', style: { width: widths.total, minWidth: widths.total, maxWidth: widths.total } },
        cell: ({ getValue }) => <span className="font-semibold text-emerald-800 tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
    ]
  }, [fmt, saveWidths, sortDir, sortKey, widths])

  const totals = useMemo(() => {
    return sorted.reduce(
      (acc, row) => ({
        current: acc.current + row.current,
        days1To30: acc.days1To30 + row.days1To30,
        days31To60: acc.days31To60 + row.days31To60,
        days61To90: acc.days61To90 + row.days61To90,
        over90: acc.over90 + row.over90,
        total: acc.total + row.total,
      }),
      { current: 0, days1To30: 0, days31To60: 0, days61To90: 0, over90: 0, total: 0 },
    )
  }, [sorted])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))

  return (
    <DataPage
      title="A/P Aging"
      subtitle={`As of ${asOfDate} • ${sorted.length} vendors • Total ${fmt(totals.total)}`}
      filters={(
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              placeholder="Search vendors..."
              className="w-full pl-9 pr-3 py-2 border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => { setAsOfDate(e.target.value); setCurrentPage(1) }}
            aria-label="A/P aging as-of date"
            className="w-full max-w-xs px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
      )}
      columns={columns}
      data={paged}
      isLoading={cidLoading || loading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={sorted.length}
      pageSize={pageSize}
      onPageChange={setCurrentPage}
      onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1) }}
      selectedIds={[]}
      onSelectionChange={() => {}}
      getRowId={(row) => row.id}
      emptyTitle="No aging rows found"
      emptyDescription="Try a different search or as-of date."
    />
  )
}
