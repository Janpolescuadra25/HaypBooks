'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Download, X, Eye, Check, Ban,
} from 'lucide-react'
import { expensesService } from '@/services/expenses.service'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypBulkAction, HaypColumn } from '@/components/shared/HaypDataTable.types'
import { fmtDate, csvDownload, StatusPill } from './_helpers'

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
  amountPaid?: number
}
type SortKey = 'billNumber' | 'vendorName' | 'date' | 'dueDate' | 'status' | 'amountDue' | 'amountPaid' | 'total'
type ColDef = { key: string; label: string; visible: boolean; width: number; align?: 'left' | 'center' | 'right' }

const DEFAULT_COLS: ColDef[] = [
  { key: 'billNumber', label: 'Bill #',   visible: true, width: 130 },
  { key: 'vendorName', label: 'Vendor',   visible: true, width: 200 },
  { key: 'date',       label: 'Date',     visible: true, width: 115 },
  { key: 'dueDate',    label: 'Due Date', visible: true, width: 115 },
  { key: 'status',     label: 'Status',   visible: true, width: 130 },
  { key: 'amountDue',  label: 'Amount Due', visible: true, width: 120, align: 'right' },
  { key: 'amountPaid', label: 'Amount Paid', visible: true, width: 120, align: 'right' },
  { key: 'total',      label: 'Total',    visible: true, width: 130, align: 'right' },
]
const STORAGE_KEY = 'bills-cols-v4'

function loadCols(): ColDef[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s) { const saved = JSON.parse(s) as ColDef[]; return DEFAULT_COLS.map(d => { const sc = saved.find(c => c.key === d.key); return sc ? { ...d, width: sc.width, visible: sc.visible } : d }) }
  } catch {}
  return DEFAULT_COLS
}



function compare(a: Bill, b: Bill, key: SortKey, dir: 'asc' | 'desc'): number {
  if (key === 'total') { const d = a.total - b.total; return dir === 'asc' ? d : -d }
  const al = String(a[key] ?? '').toLowerCase(); const bl = String(b[key] ?? '').toLowerCase()
  return dir === 'asc' ? al.localeCompare(bl) : bl.localeCompare(al)
}

const STATUSES = ['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'PARTIALLY_PAID', 'PAID', 'VOIDED']

export default function BillsPage() {
  const router = useRouter()
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [rows, setRows]       = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [search, setSearch]   = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortKey, setSortKey]   = useState<SortKey>('date')
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('desc')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]     = useState('')
  const [cols, setCols] = useState<ColDef[]>(() => loadCols())
  const colsRef = useRef(cols)
  const [toast, setToast] = useState('')

  useEffect(() => { colsRef.current = cols }, [cols])
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }
  const saveCols  = (next: ColDef[]) => { setCols(next); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {} }
  const toggleCol = (key: string)   => saveCols(cols.map(c => c.key === key ? { ...c, visible: !c.visible } : c))

  const visibleCols = cols.filter(c => c.visible)

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const fetchBills = useCallback(async () => {
    if (!companyId) { setLoading(false); return }
    setLoading(true)
    setError('')
    try {
      const res = await expensesService.listBills(companyId)
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.bills ?? [])
    } catch {
      setError('Failed to load bills')
      showToast('Failed to load bills')
    } finally { setLoading(false) }
  }, [companyId])

  useEffect(() => { fetchBills() }, [fetchBills])

  const handleApprove = useCallback(async (id: string) => {
    if (!companyId) return
    try {
      await expensesService.approveBill(companyId, id)
      setRows((p) => p.map((r) => r.id === id ? { ...r, status: 'APPROVED' } : r))
      showToast('Bill approved')
    } catch {
      showToast('Failed to approve bill')
    }
  }, [companyId, showToast])

  const isVoidableStatus = useCallback((status?: Bill['status']) => {
    return status === 'PENDING' || status === 'APPROVED' || status === 'PAID' || status === 'PARTIALLY_PAID'
  }, [])

  const handleDeleteBill = useCallback(async (id: string) => {
    if (!companyId) return
    if (!confirm('Delete this draft bill? This action cannot be undone.')) return
    try {
      await expensesService.deleteBill(companyId, id)
      setRows((p) => p.filter((r) => r.id !== id))
      showToast('Draft bill deleted')
    } catch {
      showToast('Failed to delete draft bill')
    }
  }, [companyId, showToast])

  const handleVoid = useCallback(async (id: string) => {
    if (!companyId) return
    if (!confirm('Are you sure you want to void this bill?')) return
    try {
      await expensesService.voidBill(companyId, id)
      setRows((p) => p.map((r) => r.id === id ? { ...r, status: 'VOIDED' } : r))
      showToast('Bill voided')
    } catch {
      showToast('Failed to void bill')
    }
  }, [companyId, showToast])

  const filtered = useMemo(() => {
    let list = rows
    if (statusFilter !== 'ALL') list = list.filter((r) => r.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((r) => (r.billNumber ?? '').toLowerCase().includes(q) || (r.vendorName ?? '').toLowerCase().includes(q))
    }
    if (dateFrom) list = list.filter((r) => r.date >= dateFrom)
    if (dateTo) list = list.filter((r) => r.date <= dateTo)
    return list
  }, [rows, statusFilter, search, dateFrom, dateTo])

  const sorted = useMemo(() => [...filtered].sort((a, b) => compare(a, b, sortKey, sortDir)), [filtered, sortKey, sortDir])

  const handleDeleteSelected = useCallback(async (selectedIds: string[]) => {
    if (!companyId || selectedIds.length === 0) return
    const selectedRows = rows.filter((row) => selectedIds.includes(row.id))
    if (!selectedRows.every((row) => row.status === 'DRAFT')) return
    const count = selectedIds.length
    if (!confirm(`Delete ${count} selected bill${count !== 1 ? 's' : ''}?`)) return
    try {
      await Promise.all(selectedIds.map((id) => expensesService.deleteBill(companyId, id)))
      setRows((prev) => prev.filter((row) => !selectedIds.includes(row.id)))
      showToast(`${count} bill${count !== 1 ? 's' : ''} deleted`)
    } catch {
      showToast('Failed to delete selected bills')
    }
  }, [companyId, rows, showToast])

  const handleVoidSelected = useCallback(async (selectedIds: string[]) => {
    if (!companyId || selectedIds.length === 0) return
    const voidableRows = rows.filter((row) => selectedIds.includes(row.id) && isVoidableStatus(row.status))
    if (voidableRows.length === 0) return
    const voidCount = voidableRows.length
    if (!confirm(`Void ${voidCount} selected bill${voidCount !== 1 ? 's' : ''}?`)) return
    try {
      await Promise.all(voidableRows.map((row) => expensesService.voidBill(companyId, row.id)))
      setRows((prev) => prev.map((row) => selectedIds.includes(row.id) && isVoidableStatus(row.status) ? { ...row, status: 'VOIDED' } : row))
      showToast(`${voidCount} selected bill${voidCount !== 1 ? 's' : ''} voided`)
    } catch {
      showToast('Failed to void selected bills')
    }
  }, [companyId, rows, isVoidableStatus, showToast])

  const handleMarkPaidSelected = useCallback(async (selectedIds: string[]) => {
    if (!companyId || selectedIds.length === 0) return
    try {
      await Promise.all(selectedIds.map((id) => expensesService.approveBill(companyId, id)))
      setRows((prev) => prev.map((row) => selectedIds.includes(row.id) ? { ...row, status: 'PAID' } : row))
      showToast(`${selectedIds.length} selected bill${selectedIds.length !== 1 ? 's' : ''} marked as paid`)
    } catch {
      showToast('Failed to mark selected bills as paid')
    }
  }, [companyId, showToast])

  const handleExportSelected = useCallback((selectedIds: string[], selectedRows: Bill[]) => {
    csvDownload(
      `bills-selected-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Bill #', 'Vendor', 'Date', 'Due Date', 'Status', 'Amount Due', 'Amount Paid', 'Total'],
      selectedRows.map((row) => [row.billNumber ?? '', row.vendorName ?? '', row.date, row.dueDate, row.status, String(row.amountDue ?? 0), String(row.amountPaid ?? 0), String(row.total)]),
    )
    showToast('CSV exported')
  }, [showToast])

  const actions: HaypActionItem[] = useMemo(() => [
    {
      label: 'View Bill',
      icon: <Eye className="mr-2.5 h-4 w-4 opacity-70" />,
      onClick: (id, row) => router.push(`/expenses/bills/${id}/edit`),
    },
    {
      label: 'Edit Bill',
      icon: <Eye className="mr-2.5 h-4 w-4 opacity-70" />,
      onClick: (id, row) => router.push(`/expenses/bills/${id}/edit`),
    },
    {
      label: 'Approve Bill',
      icon: <Check size={14} className="mr-2.5 opacity-70" />,
      onClick: (id, row) => handleApprove(id),
      show: (row) => row.status === 'DRAFT' || row.status === 'PENDING',
    },
    {
      label: 'Record Payment',
      icon: <Check size={14} className="mr-2.5 opacity-70" />,
      onClick: (id, row) => router.push(`/expenses/bills-payments/bill-payments/new?billId=${encodeURIComponent(id)}`),
      show: (row) => row.status !== 'PAID' && row.status !== 'VOIDED' && (row.amountDue ?? 0) > 0,
    },
    { divider: true, label: '', onClick: () => {} },
    {
      label: 'Delete Bill',
      icon: <X size={14} className="mr-2.5 opacity-70" />,
      danger: true,
      onClick: (id, row) => handleDeleteBill(id),
      show: (row) => row.status === 'DRAFT',
    },
    {
      label: 'Void Bill',
      icon: <Ban size={14} className="mr-2.5 opacity-70" />,
      danger: true,
      onClick: (id, row) => handleVoid(id),
      show: (row) => isVoidableStatus(row.status),
    },
  ], [handleApprove, handleDeleteBill, handleVoid, router, isVoidableStatus])

  const bulkActions: HaypBulkAction[] = useMemo(() => [
    {
      label: 'Delete Selected',
      icon: <X className="mr-2.5 h-4 w-4 opacity-70" />,
      variant: 'danger',
      onClick: (selectedIds) => handleDeleteSelected(selectedIds),
    },
    {
      label: 'Void Selected',
      icon: <Ban className="mr-2.5 h-4 w-4 opacity-70" />,
      variant: 'danger',
      onClick: (selectedIds) => handleVoidSelected(selectedIds),
    },
    {
      label: 'Mark as Paid',
      icon: <Check className="mr-2.5 h-4 w-4 opacity-70" />,
      variant: 'primary',
      onClick: (selectedIds) => handleMarkPaidSelected(selectedIds),
    },
    {
      label: 'Export Selected',
      icon: <Download className="mr-2.5 h-4 w-4 opacity-70" />,
      onClick: (selectedIds, selectedRows) => handleExportSelected(selectedIds, selectedRows),
    },
  ], [handleDeleteSelected, handleVoidSelected, handleMarkPaidSelected, handleExportSelected])

  const columns = useMemo(() => visibleCols.map((c): HaypColumn<Bill> => {
      switch (c.key) {
        case 'billNumber':
          return {
            id: 'billNumber',
            header: 'Bill #',
            accessorKey: 'billNumber',
            size: c.width,
            minSize: 100,
            render: (value) => <span className="font-semibold text-gray-800">{value ?? '—'}</span>,
          }
        case 'vendorName':
          return {
            id: 'vendorName',
            header: 'Vendor',
            accessorKey: 'vendorName',
            size: c.width,
            minSize: 140,
            render: (value) => <span className="text-gray-700 truncate">{value ?? '—'}</span>,
          }
        case 'date':
          return {
            id: 'date',
            header: 'Date',
            accessorKey: 'date',
            size: c.width,
            minSize: 100,
            render: (value) => <span className="text-gray-500">{fmtDate(value)}</span>,
          }
        case 'dueDate':
          return {
            id: 'dueDate',
            header: 'Due Date',
            accessorKey: 'dueDate',
            size: c.width,
            minSize: 100,
            render: (value) => <span className="text-gray-500">{fmtDate(value)}</span>,
          }
        case 'status':
          return {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            size: c.width,
            minSize: 110,
            render: (value) => <StatusPill status={value as Bill['status']} />,
          }
        case 'amountDue':
          return {
            id: 'amountDue',
            header: 'Amount Due',
            accessorKey: 'amountDue',
            size: c.width,
            minSize: 100,
            align: 'right',
            render: (value) => <span className="font-semibold text-rose-700 tabular-nums">{fmt(value ?? 0)}</span>,
          }
        case 'amountPaid':
          return {
            id: 'amountPaid',
            header: 'Amount Paid',
            accessorKey: 'amountPaid',
            size: c.width,
            minSize: 100,
            align: 'right',
            render: (value) => <span className="font-semibold text-sky-700 tabular-nums">{fmt(value ?? 0)}</span>,
          }
        case 'total':
          return {
            id: 'total',
            header: 'Total',
            accessorKey: 'total',
            size: c.width,
            minSize: 110,
            align: 'right',
            render: (value) => <span className="font-semibold text-emerald-800 tabular-nums">{fmt(value ?? 0)}</span>,
          }
        default:
          return {
            id: c.key,
            header: c.label,
            accessorKey: c.key,
            size: c.width,
            minSize: c.width,
            render: (value) => <span>{value ?? '—'}</span>,
          }
      }
    }), [visibleCols, fmt])

  const handleExportCSV = () => {
    csvDownload(`bills-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Bill #', 'Vendor', 'Date', 'Due Date', 'Status', 'Amount Due', 'Amount Paid', 'Total'],
      sorted.map(r => [r.billNumber ?? '', r.vendorName ?? '', r.date, r.dueDate, r.status, String(r.amountDue ?? 0), String(r.amountPaid ?? 0), String(r.total)]))
    showToast('CSV exported')
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Bills</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">{loading ? 'Loading...' : `${filtered.length} bills`}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => router.push('/expenses/bills/new')} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"><Plus size={15} /> New Bill</button>
          </div>
        </div>
      </div>

      <HaypDataTable
        tableId="bills"
        columns={columns}
        data={filtered}
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        actions={actions}
        bulkActions={bulkActions}
        filters={[
          { value: 'all', label: 'All' },
          { value: 'draft', label: 'Draft' },
          { value: 'pending', label: 'Pending' },
          { value: 'paid', label: 'Paid' },
          { value: 'voided', label: 'Voided' },
        ]}
        activeFilter={statusFilter.toLowerCase()}
        onFilterChange={(value) => setStatusFilter(value.toUpperCase() as typeof STATUSES[number])}
        filterLabel={statusFilter === 'ALL' ? 'Status: All' : `Status: ${statusFilter.replace(/_/g, ' ')}`}
        searchPlaceholder="Search bills..."
        onExport={handleExportCSV}
        exportLabel="Export"
        onRefresh={fetchBills}
        onActivityLog={() => router.push('/expenses/bills-payments/bills/activity')}
        className="mt-4"
      />
    </div>
  )
}



