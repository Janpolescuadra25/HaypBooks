'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Check, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import DataPage from '@/components/shared/DataPage'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import ColumnResizer from '@/components/ColumnResizer'
import { StatusBadge } from '@/components/shared/StatusBadgeSet'
import { useToast } from '@/components/ui/Toast'

interface VendorCredit {
  id: string
  creditNumber?: string
  vendorName?: string
  issueDate: string
  status?: string
  amount: number
  availableAmount?: number
}

type SortKey = 'creditNumber' | 'vendorName' | 'issueDate' | 'status' | 'amount' | 'availableAmount'

const CREDIT_TABLE_ORDER: SortKey[] = ['creditNumber', 'vendorName', 'issueDate', 'status', 'amount', 'availableAmount']
const DEFAULT_CREDIT_COL_WIDTHS: Record<SortKey, number> = {
  creditNumber: 130,
  vendorName: 190,
  issueDate: 120,
  status: 130,
  amount: 130,
  availableAmount: 150,
}
const CREDIT_COLUMNS_STORAGE_KEY = 'vendor-credits-column-widths-v2'

const SAMPLE_CREDITS: VendorCredit[] = [
  { id: 'credit-001', creditNumber: 'VC-1001', vendorName: 'Luzon Supplies', issueDate: '2026-04-02', status: 'OPEN', amount: 5000, availableAmount: 5000 },
  { id: 'credit-002', creditNumber: 'VC-1002', vendorName: 'MNL Office Solutions', issueDate: '2026-03-28', status: 'PARTIALLY_USED', amount: 7000, availableAmount: 2300 },
  { id: 'credit-003', creditNumber: 'VC-1003', vendorName: 'Cebu Transport Co.', issueDate: '2026-03-01', status: 'APPLIED', amount: 1800, availableAmount: 0 },
]

function loadCreditWidthMap(): Record<string, number> {
  try {
    const saved = localStorage.getItem(CREDIT_COLUMNS_STORAGE_KEY)
    if (!saved) return DEFAULT_CREDIT_COL_WIDTHS
    const parsed = JSON.parse(saved) as Record<string, number>
    return {
      ...DEFAULT_CREDIT_COL_WIDTHS,
      ...Object.fromEntries(Object.entries(parsed).filter(([key]) => CREDIT_TABLE_ORDER.includes(key as SortKey))),
    }
  } catch {
    return DEFAULT_CREDIT_COL_WIDTHS
  }
}

function compareCredits(a: VendorCredit, b: VendorCredit, key: SortKey, dir: 'asc' | 'desc') {
  const left = a[key] ?? ''
  const right = b[key] ?? ''
  if (key === 'amount' || key === 'availableAmount') {
    return dir === 'asc' ? Number(left) - Number(right) : Number(right) - Number(left)
  }
  return dir === 'asc'
    ? String(left).toLowerCase().localeCompare(String(right).toLowerCase())
    : String(right).toLowerCase().localeCompare(String(left).toLowerCase())
}

export default function VendorCreditsPage() {
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [credits, setCredits] = useState<VendorCredit[]>(SAMPLE_CREDITS)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('issueDate')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [widths, setWidths] = useState<Record<string, number>>(() => loadCreditWidthMap())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const saveWidths = useCallback((next: Record<string, number>) => {
    setWidths(next)
    try {
      localStorage.setItem(CREDIT_COLUMNS_STORAGE_KEY, JSON.stringify(next))
    } catch {
    }
  }, [])

  const fetchCredits = useCallback(async () => {
    if (!companyId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/vendor-credits`)
      setCredits(Array.isArray(data) ? data : data.vendorCredits ?? data.credits ?? [])
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to load vendor credits')
    } finally {
      setLoading(false)
    }
  }, [companyId, toast])

  useEffect(() => { fetchCredits() }, [fetchCredits])

  const filtered = useMemo(() => {
    let list = credits
    if (statusFilter !== 'ALL') {
      list = list.filter((credit) => String(credit.status ?? '').toUpperCase() === statusFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((credit) =>
        (credit.creditNumber ?? '').toLowerCase().includes(q) ||
        (credit.vendorName ?? '').toLowerCase().includes(q),
      )
    }
    return list
  }, [credits, search, statusFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => compareCredits(a, b, sortKey, sortDir))
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

  const handleApply = useCallback(async (id: string) => {
    if (!companyId) return
    try {
      await apiClient.post(`/companies/${companyId}/vendor-credits/${id}/apply`)
      toast.success('Credit applied')
      await fetchCredits()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to apply credit')
    }
  }, [companyId, fetchCredits, toast])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])
  const fmtDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return d
    }
  }

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
        accessorKey: 'creditNumber',
        header: makeHeader('Credit #', 'creditNumber', widths.creditNumber),
        meta: { align: 'left', style: { width: widths.creditNumber, minWidth: widths.creditNumber, maxWidth: widths.creditNumber } },
      },
      {
        accessorKey: 'vendorName',
        header: makeHeader('Vendor', 'vendorName', widths.vendorName),
        meta: { align: 'left', style: { width: widths.vendorName, minWidth: widths.vendorName, maxWidth: widths.vendorName } },
      },
      {
        accessorKey: 'issueDate',
        header: makeHeader('Issue Date', 'issueDate', widths.issueDate),
        meta: { align: 'left', style: { width: widths.issueDate, minWidth: widths.issueDate, maxWidth: widths.issueDate } },
        cell: ({ getValue }) => <span>{fmtDate(String(getValue() ?? ''))}</span>,
      },
      {
        accessorKey: 'status',
        header: makeHeader('Status', 'status', widths.status),
        meta: { align: 'left', style: { width: widths.status, minWidth: widths.status, maxWidth: widths.status } },
        cell: ({ getValue }) => <StatusBadge status={String(getValue() ?? 'Open')} domain="generic" />,
      },
      {
        accessorKey: 'amount',
        header: makeHeader('Amount', 'amount', widths.amount),
        meta: { align: 'right', style: { width: widths.amount, minWidth: widths.amount, maxWidth: widths.amount } },
        cell: ({ getValue }) => <span className="font-semibold text-emerald-800 tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'availableAmount',
        header: makeHeader('Available', 'availableAmount', widths.availableAmount),
        meta: { align: 'right', style: { width: widths.availableAmount, minWidth: widths.availableAmount, maxWidth: widths.availableAmount } },
        cell: ({ getValue }) => <span className="font-semibold text-amber-700 tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'id',
        header: 'Actions',
        meta: { align: 'right', style: { width: 120, minWidth: 120, maxWidth: 120 } },
        cell: ({ row }) => {
          const credit = row.original as VendorCredit
          const available = Number(credit.availableAmount ?? 0)
          return (
            <div className="flex items-center justify-end gap-1">
              {available > 0 && (
                <button onClick={() => handleApply(credit.id)} className="p-1 rounded hover:bg-emerald-100 text-emerald-600" data-no-row-toggle title="Apply credit"><Check size={14} /></button>
              )}
            </div>
          )
        },
      },
    ]
  }, [fmt, handleApply, saveWidths, sortDir, sortKey, widths])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))

  return (
    <DataPage
      title="Vendor Credits"
      subtitle={`${sorted.length} credits`}
      primaryActionLabel="New Credit"
      onPrimaryAction={() => toast.info('Coming soon')}
      filters={(
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              placeholder="Search vendor credits..."
              className="w-full pl-9 pr-3 py-2 border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
            aria-label="Filter vendor credits by status"
            className="w-full max-w-xs px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="PARTIALLY_USED">Partially Used</option>
            <option value="APPLIED">Applied</option>
            <option value="VOIDED">Voided</option>
          </select>
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
      emptyTitle="No vendor credits found"
      emptyDescription="Try a different search or create a credit note."
      emptyPrimaryAction="New Credit"
      onEmptyPrimaryAction={() => toast.info('Coming soon')}
    />
  )
}
