'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Search, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import DataPage from '@/components/shared/DataPage'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useFixedWidthResizableMap } from '@/hooks/useFixedWidthTableResize'
import ColumnResizer from '@/components/ColumnResizer'
import { useToast } from '@/components/ui/Toast'

type VendorCreditRow = {
  id: string
  creditNumber: string
  vendor: string
  billNumber: string
  date: string
  amount: number
  appliedAmount: number
  remainingCredit: number
  reason: string
  status: 'Open' | 'Applied' | 'Partially Applied' | 'Void'
}

type SortKey =
  | 'creditNumber'
  | 'vendor'
  | 'billNumber'
  | 'date'
  | 'amount'
  | 'appliedAmount'
  | 'remainingCredit'
  | 'reason'
  | 'status'

const STATUS_STYLES: Record<string, string> = {
  Open: 'bg-blue-50 text-blue-700 border-blue-200',
  Applied: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Partially Applied': 'bg-amber-50 text-amber-700 border-amber-200',
  Void: 'bg-gray-50 text-gray-500 border-gray-200',
}

const VENDOR_CREDITS_COL_WIDTHS_KEY = 'vendor-credits-cols-v1'
const DEFAULT_VENDOR_CREDITS_COL_WIDTHS: Record<SortKey, number> = {
  creditNumber: 140,
  vendor: 200,
  billNumber: 140,
  date: 120,
  amount: 120,
  appliedAmount: 120,
  remainingCredit: 130,
  reason: 220,
  status: 130,
}

function loadVendorCreditWidths(): Record<string, number> {
  if (typeof window === 'undefined') return DEFAULT_VENDOR_CREDITS_COL_WIDTHS
  try {
    return {
      ...DEFAULT_VENDOR_CREDITS_COL_WIDTHS,
      ...JSON.parse(localStorage.getItem(VENDOR_CREDITS_COL_WIDTHS_KEY) ?? '{}'),
    }
  } catch {
    return DEFAULT_VENDOR_CREDITS_COL_WIDTHS
  }
}

const SAMPLE_VENDOR_CREDITS: VendorCreditRow[] = [
  { id: 'vc-001', creditNumber: 'CR-1001', vendor: 'Luzon Supplies', billNumber: 'BILL-001', date: '2026-04-06', amount: 4000, appliedAmount: 0, remainingCredit: 4000, reason: 'Overpayment', status: 'Open' },
  { id: 'vc-002', creditNumber: 'CR-1002', vendor: 'MNL Office Solutions', billNumber: 'BILL-002', date: '2026-03-28', amount: 1200, appliedAmount: 600, remainingCredit: 600, reason: 'Price adjustment', status: 'Partially Applied' },
  { id: 'vc-003', creditNumber: 'CR-1003', vendor: 'Cebu Transport Co.', billNumber: 'BILL-003', date: '2026-03-18', amount: 500, appliedAmount: 500, remainingCredit: 0, reason: 'Return credit', status: 'Applied' },
]

function compareVendorCredits(a: VendorCreditRow, b: VendorCreditRow, key: SortKey, dir: 'asc' | 'desc') {
  const left = a[key] ?? ''
  const right = b[key] ?? ''
  if (key === 'amount' || key === 'appliedAmount' || key === 'remainingCredit') {
    return dir === 'asc' ? Number(left) - Number(right) : Number(right) - Number(left)
  }
  return dir === 'asc'
    ? String(left).toLowerCase().localeCompare(String(right).toLowerCase())
    : String(right).toLowerCase().localeCompare(String(left).toLowerCase())
}

export default function VendorCreditsPage() {
  const router = useRouter()
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [items, setItems] = useState<VendorCreditRow[]>(SAMPLE_VENDOR_CREDITS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => loadVendorCreditWidths())
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const colWidthsRef = useRef(colWidths)

  useEffect(() => { colWidthsRef.current = colWidths }, [colWidths])

  const saveColWidths = useCallback((next: Record<string, number>) => {
    setColWidths(next)
    try { localStorage.setItem(VENDOR_CREDITS_COL_WIDTHS_KEY, JSON.stringify(next)) } catch { }
  }, [])

  const { containerRef: creditsTableRef, isOverflowing: creditsTableOverflowing } = useFixedWidthResizableMap({
    widths: colWidths,
    widthsRef: colWidthsRef,
    order: ['creditNumber', 'vendor', 'billNumber', 'date', 'amount', 'appliedAmount', 'remainingCredit', 'reason', 'status'],
    saveWidths: saveColWidths,
    minWidth: {
      creditNumber: 110,
      vendor: 130,
      billNumber: 110,
      date: 100,
      amount: 100,
      appliedAmount: 100,
      remainingCredit: 110,
      reason: 150,
      status: 110,
    },
  })

  const fetchData = useCallback(async () => {
    if (!companyId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ap/vendor-credits`)
      setItems(Array.isArray(data) ? data : data?.items ?? data?.vendorCredits ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load vendor credits')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = useMemo(() => {
    let list = items
    if (statusFilter !== 'ALL') list = list.filter((v) => v.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((v) =>
        v.creditNumber.toLowerCase().includes(q) ||
        v.vendor.toLowerCase().includes(q) ||
        v.billNumber.toLowerCase().includes(q) ||
        v.reason.toLowerCase().includes(q)
      )
    }
    return list
  }, [items, search, statusFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => compareVendorCredits(a, b, sortKey, sortDir))
  }, [filtered, sortKey, sortDir])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, pageSize, sorted.length])

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, currentPage, pageSize])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const totalAvailable = useMemo(
    () => items.filter((v) => v.status === 'Open' || v.status === 'Partially Applied').reduce((sum, v) => sum + (v.remainingCredit ?? 0), 0),
    [items],
  )

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
        <ColumnResizer colKey={key} width={width} onChange={(_, next) => setColWidths((prev) => ({ ...prev, [key]: next }))} min={80} />
      </div>
    )

    return [
      {
        accessorKey: 'creditNumber',
        header: makeHeader('Credit #', 'creditNumber', colWidths.creditNumber),
        meta: { align: 'left', style: { width: colWidths.creditNumber, minWidth: colWidths.creditNumber, maxWidth: colWidths.creditNumber } },
      },
      {
        accessorKey: 'vendor',
        header: makeHeader('Vendor', 'vendor', colWidths.vendor),
        meta: { align: 'left', style: { width: colWidths.vendor, minWidth: colWidths.vendor, maxWidth: colWidths.vendor } },
      },
      {
        accessorKey: 'billNumber',
        header: makeHeader('Bill #', 'billNumber', colWidths.billNumber),
        meta: { align: 'left', style: { width: colWidths.billNumber, minWidth: colWidths.billNumber, maxWidth: colWidths.billNumber } },
      },
      {
        accessorKey: 'date',
        header: makeHeader('Date', 'date', colWidths.date),
        meta: { align: 'left', style: { width: colWidths.date, minWidth: colWidths.date, maxWidth: colWidths.date } },
      },
      {
        accessorKey: 'amount',
        header: makeHeader('Amount', 'amount', colWidths.amount),
        meta: { align: 'right', style: { width: colWidths.amount, minWidth: colWidths.amount, maxWidth: colWidths.amount } },
        cell: ({ getValue }) => <span className="font-semibold text-emerald-800 tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'appliedAmount',
        header: makeHeader('Applied', 'appliedAmount', colWidths.appliedAmount),
        meta: { align: 'right', style: { width: colWidths.appliedAmount, minWidth: colWidths.appliedAmount, maxWidth: colWidths.appliedAmount } },
        cell: ({ getValue }) => <span className="font-semibold text-slate-900 tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'remainingCredit',
        header: makeHeader('Remaining', 'remainingCredit', colWidths.remainingCredit),
        meta: { align: 'right', style: { width: colWidths.remainingCredit, minWidth: colWidths.remainingCredit, maxWidth: colWidths.remainingCredit } },
        cell: ({ getValue }) => <span className="font-semibold text-indigo-700 tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'reason',
        header: makeHeader('Reason', 'reason', colWidths.reason),
        meta: { align: 'left', style: { width: colWidths.reason, minWidth: colWidths.reason, maxWidth: colWidths.reason } },
      },
      {
        accessorKey: 'status',
        header: makeHeader('Status', 'status', colWidths.status),
        meta: { align: 'left', style: { width: colWidths.status, minWidth: colWidths.status, maxWidth: colWidths.status } },
        cell: ({ getValue }) => <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border ${STATUS_STYLES[String(getValue() ?? '')]}`}>
          {String(getValue() ?? '')}
        </span>,
      },
    ]
  }, [colWidths, fmt, sortDir, sortKey])

  const handleDeleteSelected = useCallback(async () => {
    if (!companyId || selectedIds.length === 0) return
    setLoading(true)
    setError('')
    try {
      await Promise.all(selectedIds.map((id) => apiClient.delete(`/companies/${companyId}/ap/vendor-credits/${id}`)))
      setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)))
      toast.success(`${selectedIds.length} selected credit${selectedIds.length === 1 ? '' : 's'} deleted`)
      setSelectedIds([])
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to delete selected credits'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [companyId, selectedIds, toast])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vendor Credits</h1>
            <p className="text-sm text-slate-500 mt-1">Manage credits received from vendors</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                Delete Selected ({selectedIds.length})
              </button>
            )}
            <button
              onClick={() => router.push('/expenses/bills-payments/vendor-credits/activity')}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg shadow-sm"
            >
              <Clock size={15} /> Activity Log
            </button>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">
              New Vendor Credit
            </button>
          </div>
        </div>

        <div className="px-6 pb-3 flex gap-2 flex-wrap">
          {(['ALL', 'Open', 'Partially Applied', 'Applied', 'Void'] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setCurrentPage(1) }}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
              }`}
            >
              {s === 'ALL' ? 'All' : s}
              {s !== 'ALL' && (
                <span className="ml-1 opacity-70">({items.filter((v) => v.status === s).length})</span>
              )}
            </button>
          ))}
        </div>

        <div className="px-6 pb-4">
          <input
            placeholder="Search by credit #, vendor, bill, or reason"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
            className="w-full max-w-sm px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex-1 px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Credits', value: items.length },
            { label: 'Open', value: items.filter((v) => v.status === 'Open').length },
            { label: 'Partially Applied', value: items.filter((v) => v.status === 'Partially Applied').length },
            { label: 'Available Credit', value: formatCurrency(totalAvailable, currency), isAmount: true },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">{c.label}</p>
              <p className={`text-xl font-bold mt-1 ${c.isAmount ? 'text-indigo-700' : 'text-slate-900'}`}>
                {c.value}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div ref={creditsTableRef} className={creditsTableOverflowing ? 'overflow-x-auto' : 'overflow-x-hidden'}>
            <DataPage
              title="Vendor Credits"
              subtitle={`${sorted.length} credits`}
              primaryActionLabel="New Vendor Credit"
              onPrimaryAction={() => toast.info('Coming soon')}
              secondaryActions={(
                <button
                  type="button"
                  onClick={() => router.push('/expenses/bills-payments/vendor-credits/activity')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Clock size={15} /> Activity Log
                </button>
              )}
              filters={(
                <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                      placeholder="Search vendor credits…"
                      className="w-full pl-9 pr-3 py-2 border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
                    className="w-full max-w-xs px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    <option value="ALL">All Status</option>
                    <option value="Open">Open</option>
                    <option value="Partially Applied">Partially Applied</option>
                    <option value="Applied">Applied</option>
                    <option value="Void">Void</option>
                  </select>
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
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              getRowId={(row) => row.id}
              bulkActions={[{ label: 'Delete selected', onClick: handleDeleteSelected, variant: 'destructive' }]}
              emptyTitle="No vendor credits found"
              emptyDescription="Try a different search or apply a different filter."
              emptyPrimaryAction="New Vendor Credit"
              onEmptyPrimaryAction={() => toast.info('Coming soon')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
