'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Eye, Check, Ban, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import DataPage from '@/components/shared/DataPage'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import ColumnResizer from '@/components/ColumnResizer'
import { StatusBadge } from '@/components/shared/StatusBadgeSet'
import { useToast } from '@/components/ui/Toast'

interface Bill {
  id: string
  billNumber?: string
  vendorId?: string
  vendorName?: string
  date: string
  dueDate: string
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'PARTIALLY_PAID' | 'PAID' | 'VOIDED'
  total: number
  amountDue?: number
}

type SortKey = 'billNumber' | 'vendorName' | 'date' | 'status' | 'total'

const BILL_TABLE_ORDER: SortKey[] = ['billNumber', 'vendorName', 'date', 'status', 'total']
const DEFAULT_BILL_COL_WIDTHS: Record<SortKey, number> = {
  billNumber: 130,
  vendorName: 180,
  date: 120,
  status: 150,
  total: 130,
}
const BILL_COLUMNS_STORAGE_KEY = 'bills-page-column-widths-v3'

const SAMPLE_BILLS: Bill[] = [
  { id: 'bill-001', billNumber: 'BILL-001', vendorName: 'Luzon Supplies', date: '2026-04-05', dueDate: '2026-04-20', status: 'PENDING', total: 25000, amountDue: 25000 },
  { id: 'bill-002', billNumber: 'BILL-002', vendorName: 'MNL Office Solutions', date: '2026-03-20', dueDate: '2026-04-20', status: 'PARTIALLY_PAID', total: 18000, amountDue: 8000 },
  { id: 'bill-003', billNumber: 'BILL-003', vendorName: 'Cebu Transport Co.', date: '2026-03-10', dueDate: '2026-04-10', status: 'PAID', total: 9200, amountDue: 0 },
]

function loadBillWidthMap(): Record<string, number> {
  try {
    const saved = localStorage.getItem(BILL_COLUMNS_STORAGE_KEY)
    if (!saved) return DEFAULT_BILL_COL_WIDTHS
    const parsed = JSON.parse(saved) as Record<string, number>
    return {
      ...DEFAULT_BILL_COL_WIDTHS,
      ...Object.fromEntries(Object.entries(parsed).filter(([key]) => BILL_TABLE_ORDER.includes(key as SortKey))),
    }
  } catch {
    return DEFAULT_BILL_COL_WIDTHS
  }
}

function compareBills(a: Bill, b: Bill, key: SortKey, dir: 'asc' | 'desc') {
  const left = a[key] ?? ''
  const right = b[key] ?? ''
  if (key === 'total') {
    return dir === 'asc' ? Number(left) - Number(right) : Number(right) - Number(left)
  }
  return dir === 'asc'
    ? String(left).toLowerCase().localeCompare(String(right).toLowerCase())
    : String(right).toLowerCase().localeCompare(String(left).toLowerCase())
}

export default function BillsPage() {
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [bills, setBills] = useState<Bill[]>(SAMPLE_BILLS)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [widths, setWidths] = useState<Record<string, number>>(() => loadBillWidthMap())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const saveWidths = useCallback((next: Record<string, number>) => {
    setWidths(next)
    try {
      localStorage.setItem(BILL_COLUMNS_STORAGE_KEY, JSON.stringify(next))
    } catch {
    }
  }, [])

  const fetchBills = useCallback(async () => {
    if (!companyId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/bills`)
      setBills(Array.isArray(data) ? data : data.bills ?? [])
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to load bills')
    } finally {
      setLoading(false)
    }
  }, [companyId, toast])

  useEffect(() => { fetchBills() }, [fetchBills])

  const filtered = useMemo(() => {
    let list = bills
    if (statusFilter !== 'ALL') list = list.filter((b) => b.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((b) => (b.billNumber ?? '').toLowerCase().includes(q) || (b.vendorName ?? '').toLowerCase().includes(q))
    }
    return list
  }, [bills, search, statusFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => compareBills(a, b, sortKey, sortDir))
  }, [filtered, sortKey, sortDir])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, pageSize, sorted.length])

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, currentPage, pageSize])

  const handleApprove = useCallback(async (id: string) => {
    if (!companyId) return
    try {
      await apiClient.post(`/companies/${companyId}/bills/${id}/approve`)
      setBills((prev) => prev.map((bill) => bill.id === id ? { ...bill, status: 'APPROVED' } : bill))
      toast.success('Bill approved')
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to approve bill')
    }
  }, [companyId, toast])

  const handleVoid = useCallback(async (id: string) => {
    if (!companyId) return
    try {
      await apiClient.post(`/companies/${companyId}/bills/${id}/void`)
      setBills((prev) => prev.map((bill) => bill.id === id ? { ...bill, status: 'VOIDED' } : bill))
      toast.success('Bill voided')
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to void bill')
    }
  }, [companyId, toast])

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
        accessorKey: 'billNumber',
        header: makeHeader('Bill #', 'billNumber', widths.billNumber),
        meta: { align: 'left', style: { width: widths.billNumber, minWidth: widths.billNumber, maxWidth: widths.billNumber } },
      },
      {
        accessorKey: 'vendorName',
        header: makeHeader('Vendor', 'vendorName', widths.vendorName),
        meta: { align: 'left', style: { width: widths.vendorName, minWidth: widths.vendorName, maxWidth: widths.vendorName } },
      },
      {
        accessorKey: 'date',
        header: makeHeader('Date', 'date', widths.date),
        meta: { align: 'left', style: { width: widths.date, minWidth: widths.date, maxWidth: widths.date } },
        cell: ({ getValue }) => <span>{fmtDate(String(getValue() ?? ''))}</span>,
      },
      {
        accessorKey: 'status',
        header: makeHeader('Status', 'status', widths.status),
        meta: { align: 'left', style: { width: widths.status, minWidth: widths.status, maxWidth: widths.status } },
        cell: ({ getValue }) => <StatusBadge status={String(getValue() ?? 'Draft')} domain="generic" />,
      },
      {
        accessorKey: 'total',
        header: makeHeader('Total', 'total', widths.total),
        meta: { align: 'right', style: { width: widths.total, minWidth: widths.total, maxWidth: widths.total } },
        cell: ({ getValue }) => <span className="font-semibold text-emerald-800 tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'id',
        header: 'Actions',
        meta: { align: 'right', style: { width: 128, minWidth: 128, maxWidth: 128 } },
        cell: ({ row }) => {
          const bill = row.original as Bill
          return (
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => toast.info('Coming soon')} className="p-1 rounded hover:bg-slate-100 text-slate-600" data-no-row-toggle title="View bill"><Eye size={14} /></button>
              {(bill.status === 'DRAFT' || bill.status === 'PENDING') && <button onClick={() => handleApprove(bill.id)} className="p-1 rounded hover:bg-emerald-100 text-emerald-600" data-no-row-toggle title="Approve bill"><Check size={14} /></button>}
              {bill.status !== 'VOIDED' && bill.status !== 'PAID' && <button onClick={() => handleVoid(bill.id)} className="p-1 rounded hover:bg-red-100 text-red-500" data-no-row-toggle title="Void bill"><Ban size={14} /></button>}
            </div>
          )
        },
      },
    ]
  }, [fmt, handleApprove, handleVoid, saveWidths, sortDir, sortKey, toast, widths])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))

  return (
    <DataPage
      title="Bills"
      subtitle={`${sorted.length} bills`}
      primaryActionLabel="New Bill"
      onPrimaryAction={() => toast.info('Coming soon')}
      filters={(
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              placeholder="Search bills..."
              className="w-full pl-9 pr-3 py-2 border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
            aria-label="Filter bills by status"
            className="w-full max-w-xs px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PAID">Paid</option>
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
      emptyTitle="No bills found"
      emptyDescription="Try a different search or add a new bill."
      emptyPrimaryAction="New Bill"
      onEmptyPrimaryAction={() => toast.info('Coming soon')}
    />
  )
}
