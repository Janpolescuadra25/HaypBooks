'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Download, X, Eye, Check, Ban, ListOrdered, Clock, Send,
} from 'lucide-react'
import { expensesService } from '@/services/expenses.service'
import RejectionReasonModal from '@/components/shared/RejectionReasonModal'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypBulkAction, HaypColumn, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
import { fmtDate, csvDownload, StatusPill } from './_helpers'

interface Bill {
  id: string
  billNumber?: string
  vendorId?: string
  vendorName?: string
  date: string
  dueDate: string
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIALLY_PAID' | 'PAID' | 'VOIDED' | 'OVERDUE'
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

const STATUSES = ['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PARTIALLY_PAID', 'PAID', 'VOIDED']

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
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedRejectBillId, setSelectedRejectBillId] = useState<string | null>(null)

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

  const handleSubmitBill = useCallback(async (id: string) => {
    if (!companyId) return
    try {
      await expensesService.submitBill(companyId, id)
      setRows((p) => p.map((r) => r.id === id ? { ...r, status: 'PENDING' } : r))
      showToast('Bill submitted')
    } catch {
      showToast('Failed to submit bill')
    }
  }, [companyId, showToast])

  const handleReject = useCallback(async (id: string, reason: string) => {
    if (!companyId) return
    try {
      await expensesService.rejectBill(companyId, id, { reason })
      setRows((p) => p.map((r) => r.id === id ? { ...r, status: 'REJECTED' } : r))
      showToast('Bill rejected')
      setRejectModalOpen(false)
      setSelectedRejectBillId(null)
    } catch {
      showToast('Failed to reject bill')
    }
  }, [companyId, showToast])

  const handleUnapprove = useCallback(async (id: string) => {
    if (!companyId) return
    try {
      await expensesService.unapproveBill(companyId, id)
      setRows((p) => p.map((r) => r.id === id ? { ...r, status: 'DRAFT' } : r))
      showToast('Bill unapproved')
    } catch {
      showToast('Failed to unapprove bill')
    }
  }, [companyId, showToast])

  const handleResubmit = useCallback(async (id: string) => {
    if (!companyId) return
    try {
      await expensesService.submitBill(companyId, id)
      setRows((p) => p.map((r) => r.id === id ? { ...r, status: 'PENDING' } : r))
      showToast('Bill resubmitted')
    } catch {
      showToast('Failed to resubmit bill')
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
    return list
  }, [rows, statusFilter])

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
      await Promise.all(selectedIds.map((id) => {
        const bill = rows.find((r) => r.id === id)
        return expensesService.recordBillPaymentForBill(companyId, id, {
          amount: bill?.amountDue ?? bill?.total ?? 0,
          method: 'CASH',
        })
      }))
      setRows((prev) => prev.map((row) => selectedIds.includes(row.id) ? { ...row, status: 'PAID' } : row))
      showToast(`${selectedIds.length} selected bill${selectedIds.length !== 1 ? 's' : ''} marked as paid`)
    } catch {
      showToast('Failed to mark selected bills as paid')
    }
  }, [companyId, rows, showToast])

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
      label: 'Submit Bill',
      icon: <Send size={14} className="mr-2.5 opacity-70" />,
      onClick: (id, row) => handleSubmitBill(id),
      show: (row) => row.status === 'DRAFT',
    },
    {
      label: 'Approve Bill',
      icon: <Check size={14} className="mr-2.5 opacity-70" />,
      onClick: (id, row) => handleApprove(id),
      show: (row) => row.status === 'PENDING',
    },
    {
      label: 'Reject Bill',
      icon: <X size={14} className="mr-2.5 opacity-70" />,
      danger: true,
      onClick: (id, row) => {
        setSelectedRejectBillId(id)
        setRejectModalOpen(true)
      },
      show: (row) => row.status === 'PENDING',
    },
    {
      label: 'Unapprove Bill',
      icon: <Ban size={14} className="mr-2.5 opacity-70" />,
      danger: true,
      onClick: (id, row) => handleUnapprove(id),
      show: (row) => row.status === 'APPROVED' && !(row.amountPaid ?? 0),
    },
    {
      label: 'Resubmit Bill',
      icon: <Send size={14} className="mr-2.5 opacity-70" />,
      onClick: (id, row) => handleResubmit(id),
      show: (row) => row.status === 'REJECTED',
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
  ], [handleApprove, handleSubmitBill, handleReject, handleUnapprove, handleResubmit, handleDeleteBill, handleVoid, router, isVoidableStatus])

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

  const columns: HaypColumn<Bill>[] = useMemo(() => [
    {
      id: 'billNumber',
      header: 'Bill #',
      accessorKey: 'billNumber',
      size: 130,
      minSize: 100,
      render: (value) => <span className="font-semibold text-gray-800">{value ?? '—'}</span>,
    },
    {
      id: 'vendorName',
      header: 'Vendor',
      accessorKey: 'vendorName',
      size: 200,
      minSize: 140,
      render: (value) => <span className="text-gray-700 truncate">{value ?? '—'}</span>,
    },
    {
      id: 'date',
      header: 'Date',
      accessorKey: 'date',
      size: 115,
      minSize: 100,
      render: (value) => <span className="text-gray-500">{fmtDate(value)}</span>,
    },
    {
      id: 'dueDate',
      header: 'Due Date',
      accessorKey: 'dueDate',
      size: 115,
      minSize: 100,
      render: (value) => <span className="text-gray-500">{fmtDate(value)}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      size: 130,
      minSize: 110,
      render: (value) => <StatusPill status={value as Bill['status']} />,
    },
    {
      id: 'amountDue',
      header: 'Amount Due',
      accessorKey: 'amountDue',
      size: 120,
      minSize: 100,
      align: 'right',
      isSummable: true,
      render: (value) => <span className="font-semibold text-rose-700 tabular-nums">{fmt(value ?? 0)}</span>,
    },
    {
      id: 'amountPaid',
      header: 'Amount Paid',
      accessorKey: 'amountPaid',
      size: 120,
      minSize: 100,
      align: 'right',
      isSummable: true,
      render: (value) => <span className="font-semibold text-sky-700 tabular-nums">{fmt(value ?? 0)}</span>,
    },
    {
      id: 'total',
      header: 'Total',
      accessorKey: 'total',
      size: 130,
      minSize: 110,
      align: 'right',
      isSummable: true,
      render: (value) => <span className="font-semibold text-emerald-800 tabular-nums">{fmt(value ?? 0)}</span>,
    },
  ], [fmt])

  const totals = useMemo<HaypTotalsConfig>(() => ({
    enabled: true,
    sumColumns: ['amountDue', 'amountPaid', 'total'],
    formatValue: (value) => fmt(Number(value ?? 0)),
  }), [fmt])

  const handleExportCSV = useCallback(() => {
    csvDownload(`bills-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Bill #', 'Vendor', 'Date', 'Due Date', 'Status', 'Amount Due', 'Amount Paid', 'Total'],
      filtered.map(r => [r.billNumber ?? '', r.vendorName ?? '', r.date, r.dueDate, r.status, String(r.amountDue ?? 0), String(r.amountPaid ?? 0), String(r.total)]))
    showToast('CSV exported')
  }, [filtered, showToast])

  const stats = useMemo(() => [
    { icon: ListOrdered, label: 'Total Bills', value: rows.length, color: 'blue' },
    { icon: Clock, label: 'Draft Bills', value: rows.filter(r => r.status === 'DRAFT').length, color: 'amber' },
    { icon: Check, label: 'Paid Bills', value: rows.filter(r => r.status === 'PAID').length, color: 'emerald' },
    { icon: X, label: 'Voided Bills', value: rows.filter(r => r.status === 'VOIDED').length, color: 'rose' },
  ], [rows])

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-slate-50/30 custom-scrollbar">
      <div className="min-h-full min-w-0 overflow-visible">
        <HaypDataTable
          data={filtered}
          columns={columns}
          tableId="bills"
          title="Bills"
          description="Manage your vendor bills and track payment status."
          stats={stats}
          headerActions={
            <button
              onClick={() => router.push('/expenses/bills/new')}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-emerald text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={18} />
              New Bill
            </button>
          }
          globalFilter={search}
          onGlobalFilterChange={setSearch}
          filters={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'DRAFT', label: 'Draft' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
            { value: 'PAID', label: 'Paid' },
            { value: 'VOIDED', label: 'Voided' },
          ]}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
          filterLabel="All Statuses"
          actions={actions}
          bulkActions={bulkActions}
          totals={totals}
          onRefresh={fetchBills}
          onExport={handleExportCSV}
          exportLabel="Export"
          onActivityLog={() => router.push('/expenses/bills-payments/bills/activity')}
          onRowClick={(row) => router.push(`/expenses/bills/${row.id}/edit`)}
          emptyTitle="No bills found"
          emptySubtitle="Adjust your search or filter to see results"
          loading={loading}
        />
      </div>

      <RejectionReasonModal
        open={rejectModalOpen}
        title="Reject Bill"
        description="Provide the reason for rejecting this bill. This reason will be recorded with the bill."
        onClose={() => {
          setRejectModalOpen(false)
          setSelectedRejectBillId(null)
        }}
        onConfirm={(reason) => {
          if (selectedRejectBillId) {
            handleReject(selectedRejectBillId, reason)
          }
        }}
      />

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             {toast}
          </div>
        </div>
      )}
    </div>
  )
}



