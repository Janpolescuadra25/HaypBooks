'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Search, X, AlertCircle, Loader2, CreditCard, Ban, Eye, Check, FileText, Clock, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import DataPage from '@/components/shared/DataPage'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useFixedWidthResizableMap } from '@/hooks/useFixedWidthTableResize'
import ColumnResizer from '@/components/ColumnResizer'

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
  items?: { description: string; quantity: number; unitPrice: number; amount: number }[]
}

interface LineSplit { id: string; departmentId?: string; projectId?: string; amount: number; percentage: number }
interface BillItem { description: string; quantity: number; unitPrice: number; amount: number; splits?: LineSplit[] }
interface Vendor { id: string; name: string }

type SortKey = 'billNumber' | 'vendorName' | 'date' | 'status' | 'total'

const BILL_TABLE_ORDER: SortKey[] = ['billNumber', 'vendorName', 'date', 'status', 'total']
const DEFAULT_BILL_COL_WIDTHS: Record<SortKey, number> = {
  billNumber: 130,
  vendorName: 180,
  date: 120,
  status: 120,
  total: 130,
}
const BILL_COLUMNS_STORAGE_KEY = 'bills-page-column-widths-v1'

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-gray-50 text-gray-700 border-gray-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-blue-50 text-blue-700 border-blue-200',
  PARTIALLY_PAID: 'bg-orange-50 text-orange-700 border-orange-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  VOIDED: 'bg-gray-50 text-gray-500 border-gray-200',
}

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

function normalizeBillStatus(value?: string) {
  return String(value ?? 'DRAFT').replace(/_/g, ' ')
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
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [widths, setWidths] = useState<Record<string, number>>(() => loadBillWidthMap())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [showForm, setShowForm] = useState(false)
  const [viewBill, setViewBill] = useState<Bill | null>(null)
  const [viewTab, setViewTab] = useState<'details' | 'activity'>('details')
  const [billActivity, setBillActivity] = useState<any[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [duplicateWarning, setDuplicateWarning] = useState<Bill[] | null>(null)
  const [ignoreDuplicate, setIgnoreDuplicate] = useState(false)
  const [splitEditor, setSplitEditor] = useState<{ lineIndex: number; splits: LineSplit[] } | null>(null)
  const widthsRef = useRef(widths)

  useEffect(() => { widthsRef.current = widths }, [widths])

  const saveWidths = useCallback((next: Record<string, number>) => {
    setWidths(next)
    try { localStorage.setItem(BILL_COLUMNS_STORAGE_KEY, JSON.stringify(next)) } catch { }
  }, [])

  const { containerRef } = useFixedWidthResizableMap({
    widths,
    widthsRef,
    order: BILL_TABLE_ORDER,
    saveWidths,
    fixedWidth: 80,
    minWidth: 100,
    fallbackMinWidth: 100,
  })

  const fetchBills = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/bills`)
      setBills(Array.isArray(data) ? data : data.bills ?? [])
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load bills')
    } finally {
      setLoading(false)
    }
  }, [companyId])

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
      fetchBills()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to approve')
    }
  }, [companyId, fetchBills])

  const handleVoid = useCallback(async (id: string) => {
    if (!companyId) return
    try {
      await apiClient.post(`/companies/${companyId}/bills/${id}/void`)
      fetchBills()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to void')
    }
  }, [companyId, fetchBills])

  const openViewBill = useCallback((bill: Bill) => {
    setViewBill(bill)
    setViewTab('details')
    setBillActivity([])
  }, [])

  useEffect(() => {
    if (viewTab !== 'activity' || !viewBill?.id || !companyId) return
    setActivityLoading(true)
    apiClient.get(`/companies/${companyId}/ap/bills/${viewBill.id}/activity`)
      .then(({ data }) => setBillActivity(data.data ?? []))
      .catch(() => setBillActivity([]))
      .finally(() => setActivityLoading(false))
  }, [viewTab, viewBill?.id, companyId])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])
  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d }
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
        <ColumnResizer colKey={key} width={width} onChange={(_, next) => setWidths((prev) => ({ ...prev, [key]: next }))} min={80} />
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
        cell: ({ getValue }) => <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${statusStyles[String(getValue() ?? '')] ?? ''}`}>{normalizeBillStatus(String(getValue() ?? ''))}</span>,
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
              <button onClick={() => openViewBill(bill)} className="p-1 rounded hover:bg-emerald-100 text-emerald-600" data-no-row-toggle><Eye size={14} /></button>
              {(bill.status === 'DRAFT' || bill.status === 'PENDING') && <button onClick={() => handleApprove(bill.id)} className="p-1 rounded hover:bg-emerald-100 text-emerald-600" data-no-row-toggle><Check size={14} /></button>}
              {bill.status !== 'VOIDED' && bill.status !== 'PAID' && <button onClick={() => handleVoid(bill.id)} className="p-1 rounded hover:bg-red-100 text-red-400" data-no-row-toggle><Ban size={14} /></button>}
            </div>
          )
        },
      },
    ]
  }, [fmt, handleApprove, handleVoid, openViewBill, sortKey, sortDir, widths])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))

  if (cidLoading || (loading && bills.length === 0)) {
    return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /><span className="ml-2 text-emerald-700">Loading bills…</span></div>
  }

  if (cidError) {
    return <div className="p-6 text-center text-red-600">{cidError}</div>
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-emerald-900">Bills</h1><p className="text-sm text-emerald-600/70 mt-0.5">{sorted.length} bills</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"><Plus size={16} /> New Bill</button>
      </div>

      <div className="bg-white rounded-xl border border-emerald-100 p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input type="text" placeholder="Search bills…" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} className="w-full pl-9 pr-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }} className="px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
          <option value="ALL">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="PAID">Paid</option>
          <option value="VOIDED">Voided</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <DataPage
        title="Bills"
        subtitle={`${sorted.length} bills`}
        primaryActionLabel="New Bill"
        onPrimaryAction={() => setShowForm(true)}
        filters={(
          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                placeholder="Search bills…"
                className="w-full pl-9 pr-3 py-2 border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
              className="w-full max-w-xs px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="ALL">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="PAID">Paid</option>
              <option value="VOIDED">Voided</option>
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
        selectedIds={[]}
        onSelectionChange={() => {}}
        getRowId={(row) => row.id}
        emptyTitle="No bills found"
        emptyDescription="Try a different search or add a new bill."
        emptyPrimaryAction="New Bill"
        onEmptyPrimaryAction={() => setShowForm(true)}
      />

      <AnimatePresence>
        {viewBill && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setViewBill(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
              <div className="px-6 pt-4 pb-0 border-b border-emerald-100">
                <div className="flex justify-between mb-3">
                  <h2 className="text-lg font-bold text-emerald-900">Bill #{viewBill.billNumber ?? viewBill.id.slice(0, 8)}</h2>
                  <button onClick={() => setViewBill(null)} className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-500"><X size={18} /></button>
                </div>
                <div className="flex gap-1">
                  {(['details', 'activity'] as const).map((tab) => (
                    <button key={tab} onClick={() => setViewTab(tab)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${viewTab === tab ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-emerald-400 hover:text-emerald-600'}`}>
                      {tab === 'details' ? 'Details' : 'Activity'}
                    </button>
                  ))}
                </div>
              </div>
              {viewTab === 'details' ? (
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div><span className="text-emerald-600/60">Vendor:</span> <span className="font-medium">{viewBill.vendorName}</span></div>
                    <div><span className="text-emerald-600/60">Status:</span> <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${statusStyles[viewBill.status]}`}>{normalizeBillStatus(viewBill.status)}</span></div>
                    <div><span className="text-emerald-600/60">Date:</span> {viewBill.date}</div>
                    <div><span className="text-emerald-600/60">Due:</span> {viewBill.dueDate}</div>
                  </div>
                  <p className="text-2xl font-bold text-emerald-800 text-center">{fmt(viewBill.total)}</p>
                </div>
              ) : (
                <div className="p-6 max-h-[50vh] overflow-y-auto">
                  {activityLoading ? (
                    <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-emerald-500" /></div>
                  ) : billActivity.length === 0 ? (
                    <div className="text-center py-8 text-emerald-400"><Clock size={24} className="mx-auto mb-2 opacity-50" /><p className="text-sm">No activity recorded yet.</p></div>
                  ) : (
                    <div className="space-y-2">
                      {billActivity.map((entry: any) => (
                        <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5"><Clock size={13} className="text-emerald-600" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-emerald-900">{entry.action}</p>
                            <p className="text-xs text-emerald-500 mt-0.5">{entry.user?.name ?? entry.user?.email ?? 'System'} · {new Date(entry.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
        {showForm && <BillFormModal companyId={companyId!} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); fetchBills() }} />}
      </AnimatePresence>
    </div>
  )
}

function BillFormModal({ companyId, onClose, onSaved }: { companyId: string; onClose: () => void; onSaved: () => void }) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorId, setVendorId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0] })
  const [items, setItems] = useState<BillItem[]>([{ description: '', quantity: 1, unitPrice: 0, amount: 0 }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [duplicateWarning, setDuplicateWarning] = useState<Bill[] | null>(null)
  const [ignoreDuplicate, setIgnoreDuplicate] = useState(false)
  const [splitEditor, setSplitEditor] = useState<{ lineIndex: number; splits: LineSplit[] } | null>(null)
  const [availableBills, setAvailableBills] = useState<Bill[]>([])
  const [departments] = useState([{ id: 'dept-1', name: 'Operations' }, { id: 'dept-2', name: 'Sales' }, { id: 'dept-3', name: 'Finance' }])
  const [projects] = useState([{ id: 'proj-1', name: 'Project A' }, { id: 'proj-2', name: 'Project B' }, { id: 'proj-3', name: 'Project C' }])

  useEffect(() => {
    apiClient.get(`/companies/${companyId}/vendors`).then(({ data }) => setVendors(Array.isArray(data) ? data : data.vendors ?? [])).catch(() => {})
    apiClient.get(`/companies/${companyId}/bills`).then(({ data }) => setAvailableBills(Array.isArray(data) ? data : data.bills ?? [])).catch(() => {})
  }, [companyId])

  const updateItem = (i: number, f: string, v: any) => setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [f]: v, amount: f === 'quantity' || f === 'unitPrice' ? Number((f === 'quantity' ? v : item.quantity)) * Number((f === 'unitPrice' ? v : item.unitPrice)) : item.amount } : item))
  const addItem = () => setItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: 0, amount: 0 }])
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i))

  const { currency } = useCompanyCurrency()
  const total = items.reduce((sum, it) => sum + Number(it.quantity) * Number(it.unitPrice), 0)
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])
  const fmtDate = (d: string) => { try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d } }

  const duplicateCandidates = useMemo(() => {
    if (!vendorId || !date || total <= 0) return []
    const tolerance = total * 0.05
    const target = new Date(date).getTime()
    return availableBills.filter((bill) => {
      if (!bill.vendorId || bill.vendorId !== vendorId) return false
      if (Math.abs(bill.total - total) > tolerance) return false
      const billTime = new Date(bill.date).getTime()
      return Math.abs(billTime - target) <= 3 * 24 * 60 * 60 * 1000
    })
  }, [availableBills, vendorId, total, date])

  useEffect(() => {
    if (duplicateCandidates.length > 0 && !ignoreDuplicate) {
      setDuplicateWarning(duplicateCandidates)
    } else {
      setDuplicateWarning(null)
    }
  }, [duplicateCandidates, ignoreDuplicate])

  const openSplitEditor = (lineIndex: number) => {
    const item = items[lineIndex]
    const maybeSplits = item.splits?.length ? item.splits : [{ id: `split-${Date.now()}`, amount: item.amount, percentage: 100 }]
    setSplitEditor({ lineIndex, splits: maybeSplits })
  }

  const updateSplit = (index: number, field: keyof LineSplit, value: string | number) => {
    setSplitEditor((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        splits: prev.splits.map((split, idx) => idx === index ? { ...split, [field]: value } : split),
      }
    })
  }

  const applySplit = () => {
    if (!splitEditor) return
    const line = items[splitEditor.lineIndex]
    const totalSplit = splitEditor.splits.reduce((sum, split) => sum + Number(split.amount || 0), 0)
    if (Math.abs(totalSplit - line.amount) > 0.01) { setError('Split totals must equal the line amount.'); return }
    setItems((prev) => prev.map((item, idx) => idx === splitEditor.lineIndex ? { ...item, splits: splitEditor.splits } : item))
    setSplitEditor(null)
    setError('')
  }

  const handleSave = async () => {
    if (!vendorId) { setError('Select a vendor.'); return }
    const validItems = items.filter((it) => it.description.trim())
    if (validItems.length === 0) { setError('Add at least one item.'); return }
    if (duplicateWarning && !ignoreDuplicate) { setError('Potential duplicate bill detected. Review the warning before saving or click Save Anyway.'); return }
    setSaving(true); setError('')
    try {
      await apiClient.post(`/companies/${companyId}/ap/bills`, {
        vendorId,
        date,
        dueDate,
        items: validItems.map((it) => ({
          description: it.description,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          amount: Number(it.quantity) * Number(it.unitPrice),
          splits: it.splits?.map((split) => ({ departmentId: split.departmentId, projectId: split.projectId, amount: split.amount, percentage: split.percentage })) ?? undefined,
        })),
      })
      onSaved()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to create bill')
    } finally {
      setSaving(false)
    }
  }

  const splitTotalAmount = splitEditor?.splits.reduce((sum, split) => sum + Number(split.amount || 0), 0) ?? 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">New Bill</h2>
          <button onClick={onClose} className="p-2 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          {duplicateWarning && duplicateWarning.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
              <p className="font-semibold">⚠️ Possible duplicate bill detected. Similar bills:</p>
              <ul className="mt-2 space-y-2">
                {duplicateWarning.map((bill) => (
                  <li key={bill.id} className="border border-amber-100 rounded-lg p-3 bg-amber-50">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{bill.billNumber ?? bill.id.slice(0, 8)}</span>
                      <span>{fmt(bill.total)}</span>
                    </div>
                    <div className="text-xs text-amber-600">{bill.vendorName} · {fmtDate(bill.date)}</div>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => { setIgnoreDuplicate(true); setError(''); handleSave() }} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors">Save Anyway</button>
                <button type="button" onClick={() => setDuplicateWarning(null)} className="px-4 py-2 border border-amber-200 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors">Cancel</button>
              </div>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vendor *</label>
              <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm">
                <option value="">Select vendor…</option>
                {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-3 py-2 text-left">Description</th>
                  <th className="px-3 py-2 text-right w-20">Qty</th>
                  <th className="px-3 py-2 text-right w-28">Price</th>
                  <th className="px-3 py-2 text-right w-28">Amount</th>
                  <th className="px-3 py-2 text-right w-28">Split</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2"><input value={it.description} onChange={(e) => updateItem(i, 'description', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Item description" /></td>
                    <td className="px-3 py-2"><input type="number" min="1" value={it.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} className="w-full px-2 py-1.5 text-sm text-right border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" /></td>
                    <td className="px-3 py-2"><input type="number" min="0" step="0.01" value={it.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))} className="w-full px-2 py-1.5 text-sm text-right border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" /></td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-900">{fmt(Number(it.quantity) * Number(it.unitPrice))}</td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" onClick={() => openSplitEditor(i)} className="px-2 py-1 text-xs border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors">
                        Split{it.splits?.length ? ` (${it.splits.length})` : ''}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" onClick={() => removeItem(i)} className="text-rose-500 hover:text-rose-700 text-sm">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <button type="button" onClick={addItem} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">Add line</button>
            <div className="text-sm text-slate-600">Total: <span className="font-semibold text-slate-900">{fmt(total)}</span></div>
          </div>

          {splitEditor && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Split line amount</p>
                  <p className="text-xs text-slate-500">Total split amount: {fmt(splitTotalAmount)}</p>
                </div>
                <button type="button" onClick={() => setSplitEditor(null)} className="px-3 py-1 text-sm rounded-lg border border-slate-200 hover:bg-slate-100">Close</button>
              </div>
              <div className="grid gap-3">
                {splitEditor.splits.map((split, index) => (
                  <div key={split.id} className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-5">
                      <label className="text-xs text-slate-600">Department</label>
                      <select value={split.departmentId} onChange={(e) => updateSplit(index, 'departmentId', e.target.value)} className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                        <option value="">None</option>
                        {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                      </select>
                    </div>
                    <div className="col-span-5">
                      <label className="text-xs text-slate-600">Amount</label>
                      <input type="number" value={split.amount} onChange={(e) => updateSplit(index, 'amount', Number(e.target.value))} className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                    </div>
                    <div className="col-span-2 text-right">
                      <label className="text-xs text-slate-600">%</label>
                      <input type="number" value={split.percentage} onChange={(e) => updateSplit(index, 'percentage', Number(e.target.value))} className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                    </div>
                  </div>
                ))}
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setSplitEditor(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-100">Cancel</button>
                  <button type="button" onClick={applySplit} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">Apply</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
