'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Download, Eye, Check, Ban, X, ListOrdered, Clock, Banknote, Loader2, Trash2 } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import CustomerPickerField from './CustomerPickerField'
import QuickAddCustomerModal from './QuickAddCustomerModal'
import { InvoicePickerField } from './pickers'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypColumn, HaypActionItem, HaypBulkAction, HaypStat } from '@/components/shared/HaypDataTable.types'
import { fmtDate, csvDownload, StatusPill } from './_helpers'

const CREDIT_REASONS = ['Returned Goods', 'Price Adjustment', 'Overpayment', 'Billing Error', 'Discount Applied', 'Writing Off Bad Debt', 'Other']
const REFUND_METHODS = ['Check', 'ACH', 'Credit Card', 'Cash']
const STATUS_OPTIONS = ['', 'DRAFT', 'ISSUED', 'APPLIED', 'VOID']
const OPEN_INVOICE_STATUSES = 'SENT,PARTIAL,PARTIALLY_PAID,OVERDUE'

type CreditNoteType = 'credit' | 'refund'

interface InvoiceApplyRow {
  invoiceId: string
  invoiceNumber: string
  balanceDue: number
  amountToApply: string
}

interface CreditNoteRow {
  id: string
  creditNoteNumber: string
  customer: string
  customerId: string
  invoiceId: string | null
  invoiceNumber: string | null
  date: string | null
  amount: number
  status: string
  memo: string
  reasonCode: string
  reasonDetails?: string
  type: CreditNoteType
  appliedAmount: number
  unappliedAmount: number
}

interface CustomerOption { id: string; name: string }
interface InvoiceOption { id: string; invoiceNumber: string; balance: number; date?: string }

interface EnrichedCN extends CreditNoteRow {
  _unapplied: number
}

function normalizeCN(cn: any): EnrichedCN {
  const amount = Number(cn.amount ?? cn.totalAmount ?? 0)
  const appliedAmount = Number(cn.appliedAmount ?? cn.applied ?? 0)
  return {
    id: cn.id,
    creditNoteNumber: cn.creditNoteNumber ?? `CN-${cn.id?.slice(0, 8)}`,
    customer: cn.customer ?? cn.customerName ?? '—',
    customerId: cn.customerId ?? '',
    invoiceId: cn.invoiceId ?? null,
    invoiceNumber: cn.invoiceNumber ?? null,
    date: cn.date ?? cn.issuedAt ?? null,
    amount,
    status: cn.status ?? 'DRAFT',
    memo: cn.reasonDetails ?? cn.memo ?? '',
    reasonCode: cn.reasonCode ?? cn.reason ?? 'Other',
    reasonDetails: cn.reasonDetails ?? '',
    type: cn.type === 'refund' ? 'refund' : 'credit',
    appliedAmount,
    unappliedAmount: Number(cn.unappliedAmount ?? Math.max(0, amount - appliedAmount)),
    _unapplied: Math.max(0, amount - appliedAmount),
  }
}

function statusBadge(status: string) {
  switch (status) {
    case 'ISSUED': return 'text-sky-700 bg-sky-50 border-sky-200'
    case 'APPLIED': return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    case 'VOID': return 'text-rose-700 bg-rose-50 border-rose-200'
    default: return 'text-slate-600 bg-slate-50 border-slate-200'
  }
}

function parseApplyAmount(value: string): number {
  const normalized = String(value ?? '').replace(/,/g, '').trim()
  if (!normalized) return Number.NaN
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function formatApplyAmount(value: string | number): string {
  const parsed = typeof value === 'number' ? value : parseApplyAmount(value)
  if (!Number.isFinite(parsed)) return ''
  return parsed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function parsePickerDueAmount(value?: string): number | null {
  if (!value) return null
  const normalized = value.replace(/[^\d.,-]/g, '').replace(/,/g, '')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}


export default function CreditNotesPage() {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [items, setItems] = useState<CreditNoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [toast, setToast] = useState('')
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)

  // Detail drawer
  const [drawerCN, setDrawerCN] = useState<CreditNoteRow | null>(null)
  const [drawerTab, setDrawerTab] = useState<'details' | 'activity'>('details')
  const [cnActivity, setCnActivity] = useState<any[]>([])
  const [cnActivityLoading, setCnActivityLoading] = useState(false)

  // Create modal
  const [newOpen, setNewOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [custLoading, setCustLoading] = useState(false)
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false)
  const [invoices, setInvoices] = useState<InvoiceOption[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [nc, setNc] = useState({
    customerId: '',
    invoiceId: '',
    totalAmount: '',
    reasonCode: CREDIT_REASONS[0],
    reasonDetails: '',
    creditType: 'credit' as CreditNoteType,
    refundMethod: REFUND_METHODS[0],
    refundDate: new Date().toISOString().split('T')[0],
    refundReference: '',
    bankAccountId: '',
  })
  const [appliedInvoices, setAppliedInvoices] = useState<InvoiceApplyRow[]>([])
  const [bankAccounts, setBankAccounts] = useState<{ id: string; name: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [duplicateWarning, setDuplicateWarning] = useState<CreditNoteRow[] | null>(null)
  const [filterReason, setFilterReason] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  // Apply to Invoice modal
  const [applyOpen, setApplyOpen] = useState(false)
  const [applyingCN, setApplyingCN] = useState<CreditNoteRow | null>(null)
  const [applyForm, setApplyForm] = useState({ invoiceId: '', amount: '' })
  const [applyInvoiceBalance, setApplyInvoiceBalance] = useState<number | null>(null)
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState('')
  const [applyAmountFocused, setApplyAmountFocused] = useState(false)
  const [newAmountFocused, setNewAmountFocused] = useState(false)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3500) }

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true); setError('')
    try {
      const params: Record<string, string> = {}
      if (statusFilter) params.status = statusFilter
      const { data } = await apiClient.get(`/companies/${companyId}/ar/credit-notes`, { params })
      const raw: any[] = Array.isArray(data) ? data : data?.items || []
      setItems(raw.map(normalizeCN))
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load credit notes')
    } finally {
      setLoading(false)
    }
  }, [companyId, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  // ─── Batch ops ────────────────────────────────────────────────────────────

  const handleBatchDelete = useCallback(async (ids: string[]) => {
    if (!companyId || ids.length === 0) return
    if (!window.confirm(`Delete ${ids.length} credit note(s)?`)) return
    setBatchLoading(true)
    try {
      await apiClient.post(`/companies/${companyId}/ar/credit-notes/batch/delete`, { ids })
      fetchData()
      showToast(`Deleted ${ids.length} credit note(s)`)
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Batch delete failed')
    } finally {
      setBatchLoading(false)
    }
  }, [companyId, fetchData, showToast])

  // ─── Export ───────────────────────────────────────────────────────────────

  const handleExport = useCallback(async () => {
    if (!companyId) return
    setExportLoading(true)
    try {
      const params: Record<string, string> = {}
      if (statusFilter) params.status = statusFilter
      const { data } = await apiClient.get(`/companies/${companyId}/ar/credit-notes/export`, { params })
      const blob = new Blob([data], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'credit-notes-export.csv'
      a.click()
      URL.revokeObjectURL(url)
      showToast('Export downloaded')
    } catch {
      showToast('Export failed')
    } finally {
      setExportLoading(false)
    }
  }, [companyId, statusFilter, showToast])

  const handleExportSelected = useCallback((ids: string[], selectedRows: EnrichedCN[]) => {
    if (ids.length === 0) return
    const headers = ['CN #', 'Customer', 'Type', 'Invoice #', 'Date', 'Amount', 'Applied', 'Unapplied', 'Reason', 'Status']
    const rows = selectedRows.map((row) => [
      row.creditNoteNumber,
      row.customer,
      row.type === 'refund' ? 'Refund' : 'Credit',
      row.invoiceNumber ?? '',
      fmtDate(row.date),
      formatCurrency(row.amount, currency),
      formatCurrency(row.appliedAmount, currency),
      formatCurrency(row._unapplied, currency),
      row.reasonCode,
      row.status,
    ])
    csvDownload('credit-notes-selected', headers, rows)
    showToast('Selected credit notes exported')
  }, [currency, showToast])

  const tableData = useMemo<EnrichedCN[]>(() => {
    let list = items.map((cn) => ({ ...cn, _unapplied: Math.max(0, (cn.amount || 0) - (cn.appliedAmount || 0)) }))
    if (filterReason) list = list.filter((cn) => cn.reasonCode === filterReason)
    if (filterType) list = list.filter((cn) => cn.type === filterType)
    if (filterDateFrom) list = list.filter((cn) => cn.date && cn.date >= filterDateFrom)
    if (filterDateTo) list = list.filter((cn) => cn.date && cn.date <= filterDateTo)
    return list
  }, [items, filterReason, filterType, filterDateFrom, filterDateTo])

  const columns = useMemo<HaypColumn<EnrichedCN>[]>(() => [
    {
      id: 'creditNoteNumber',
      header: 'CN #',
      accessorKey: 'creditNoteNumber',
      size: 140,
      render: (value) => <span className="font-mono text-xs text-gray-800">{value}</span>,
    },
    {
      id: 'customer',
      header: 'Customer',
      accessorKey: 'customer',
      size: 200,
      render: (value) => <span className="font-medium text-gray-700 truncate">{value || '—'}</span>,
    },
    {
      id: 'type',
      header: 'Type',
      accessorKey: 'type',
      size: 110,
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${value === 'refund' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {value === 'refund' ? 'Refund' : 'Credit'}
        </span>
      ),
    },
    {
      id: 'invoiceNumber',
      header: 'Invoice #',
      accessorKey: 'invoiceNumber',
      size: 130,
      render: (value) => value ? <span className="text-emerald-600 text-xs">{value}</span> : <span className="text-slate-400">—</span>,
    },
    {
      id: 'date',
      header: 'Date',
      accessorKey: 'date',
      size: 120,
      render: (value) => <span className="text-slate-600">{fmtDate(value)}</span>,
    },
    {
      id: 'amount',
      header: 'Amount',
      accessorKey: 'amount',
      size: 130,
      align: 'right',
      isSummable: true,
      render: (value) => <span className="font-semibold text-emerald-800 tabular-nums">{formatCurrency(value, currency)}</span>,
    },
    {
      id: 'appliedAmount',
      header: 'Applied',
      accessorKey: 'appliedAmount',
      size: 130,
      align: 'right',
      isSummable: true,
      render: (value) => <span className="font-semibold tabular-nums text-gray-800">{formatCurrency(value, currency)}</span>,
    },
    {
      id: 'unappliedAmount',
      header: 'Unapplied',
      accessorKey: '_unapplied',
      size: 130,
      align: 'right',
      isSummable: true,
      render: (value) => <span className={`font-semibold tabular-nums ${value > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{value > 0 ? formatCurrency(value, currency) : '—'}</span>,
    },
    {
      id: 'reasonCode',
      header: 'Reason',
      accessorKey: 'reasonCode',
      size: 160,
      render: (value) => <span className="text-xs text-gray-600 truncate" title={value}>{value || '—'}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      size: 120,
      render: (value) => <StatusPill status={value} />,
    },
  ], [currency])

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'Edit Credit Note',
      icon: <Eye size={13} />,
      onClick: (_id, row) => openEditCN(row),
    },
    { label: '', divider: true, onClick: () => {} },
    {
      label: 'Apply to Invoice',
      icon: <Check size={13} />,
      show: (row) => !['VOID', 'APPLIED'].includes(row.status),
      onClick: (_id, row) => openApplyModal(row),
    },
    {
      label: 'Void',
      icon: <Ban size={13} />,
      danger: true,
      show: (row) => !['VOID', 'APPLIED'].includes(row.status),
      onClick: (id) => handleVoid(id),
    },
  ], [handleVoid])

  const bulkActions = useMemo<HaypBulkAction[]>(() => [
    {
      label: 'Export Selected',
      icon: <Download size={14} />,
      onClick: handleExportSelected,
    },
    {
      label: 'Delete Selected',
      icon: <Trash2 size={14} />,
      variant: 'danger',
      onClick: handleBatchDelete,
    },
  ], [handleBatchDelete, handleExportSelected])

  const fmt = useCallback((value: number) => formatCurrency(value, currency), [currency])

  const stats = useMemo<HaypStat[]>(() => [
    { icon: ListOrdered, label: 'Total Credit Notes', value: String(items.length), color: 'blue' },
    { icon: Check, label: 'Issued', value: String(items.filter(r => r.status === 'ISSUED').length), color: 'emerald' },
    { icon: Clock, label: 'Applied', value: String(items.filter(r => r.status === 'APPLIED').length), color: 'amber' },
    { icon: Banknote, label: 'Total Credit Value', value: fmt(items.reduce((sum, row) => sum + (row.amount || 0), 0)), color: 'rose' },
  ], [fmt, items])

  const statusFilterOptions = useMemo(() => [
    { value: '', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'ISSUED', label: 'Issued' },
    { value: 'APPLIED', label: 'Applied' },
    { value: 'VOID', label: 'Void' },
  ], [])

  // ─── Void ─────────────────────────────────────────────────────────────────

  async function handleVoid(cnId: string) {
    if (!companyId) return
    if (!window.confirm('Void this credit note? This will reverse the GL entry.')) return
    setActioningId(cnId)
    try {
      await apiClient.post(`/companies/${companyId}/ar/credit-notes/${cnId}/void`)
      fetchData()
      setDrawerCN(null)
      showToast('Credit note voided')
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to void credit note')
    } finally {
      setActioningId(null)
    }
  }

  // ─── Apply to Invoice ─────────────────────────────────────────────────────

  function openApplyModal(cn: CreditNoteRow) {
    setApplyingCN(cn)
    setApplyForm({ invoiceId: cn.invoiceId ?? '', amount: String(cn.amount ?? '') })
    setApplyInvoiceBalance(null)
    setApplyAmountFocused(false)
    setApplyError('')
    setApplyOpen(true)
    loadInvoicesForCustomer(cn.customerId, cn.invoiceId ?? '')
  }

  const loadInvoicesForCustomer = async (customerId: string, preferredInvoiceId = '') => {
    if (!companyId || !customerId) return
    setInvoicesLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/invoices`, {
        params: { customerId, openOnly: true, limit: 50 },
      })
      const raw: any[] = Array.isArray(data) ? data : data?.items || []
      const openInvoices = raw.map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber ?? inv.id?.slice(0, 8),
        balance: Number(inv.balance ?? inv.amountDue ?? inv.amount ?? 0),
        date: inv.date ?? inv.issueDate ?? inv.createdAt ?? null,
      }))
      setInvoices(openInvoices)
      setAppliedInvoices(openInvoices.map((inv) => ({
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        balanceDue: inv.balance,
        amountToApply: '',
      })))
      const selectedInvoice = openInvoices.find((inv) => inv.id === preferredInvoiceId)
      setApplyInvoiceBalance(selectedInvoice ? selectedInvoice.balance : null)
      setApplyForm((prev) => ({
        ...prev,
        invoiceId: openInvoices.some((inv) => inv.id === (preferredInvoiceId || prev.invoiceId))
          ? (preferredInvoiceId || prev.invoiceId)
          : '',
      }))
    } catch {
      setInvoices([])
      setApplyForm((prev) => ({ ...prev, invoiceId: '' }))
      setApplyInvoiceBalance(null)
    } finally {
      setInvoicesLoading(false)
    }
  }

  async function submitApply(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId || !applyingCN) return
    if (!applyForm.invoiceId) { setApplyError('Select an invoice'); return }
    const applyAmount = parseApplyAmount(applyForm.amount)
    if (!Number.isFinite(applyAmount) || applyAmount <= 0) { setApplyError('Enter a valid amount'); return }
    setApplying(true); setApplyError('')
    try {
      await apiClient.post(`/companies/${companyId}/ar/credit-notes/${applyingCN.id}/apply`, {
        invoiceId: applyForm.invoiceId,
        amount: applyAmount,
      })
      setApplyOpen(false)
      fetchData()
      showToast('Credit note applied to invoice')
    } catch (err: any) {
      setApplyError(err?.response?.data?.message || 'Failed to apply credit note')
    } finally {
      setApplying(false)
    }
  }

  // ─── Load customers ───────────────────────────────────────────────────────

  const loadCustomers = useCallback(async () => {
    if (!companyId) return
    setCustLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/customers`)
      const raw: any[] = Array.isArray(data) ? data : data?.data ?? data?.items ?? []
      setCustomers(raw.map((c: any) => ({ id: c.id || c.contactId, name: c.name || c.displayName || '—' })))
    } catch { /* non-blocking */ }
    finally { setCustLoading(false) }
  }, [companyId])

  const loadBankAccounts = useCallback(async () => {
    if (!companyId) return
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/chart-of-accounts`, { params: { type: 'bank', limit: 50 } })
      const raw: any[] = Array.isArray(data) ? data : data?.items ?? data?.accounts ?? []
      setBankAccounts(raw.map((account: any) => ({ id: account.id, name: account.name || account.accountNumber || 'Bank Account' })))
    } catch { setBankAccounts([]) }
  }, [companyId])

  function openModal() {
    setEditingId(null)
    setNc({
      customerId: '',
      invoiceId: '',
      totalAmount: '',
      reasonCode: CREDIT_REASONS[0],
      reasonDetails: '',
      creditType: 'credit',
      refundMethod: REFUND_METHODS[0],
      refundDate: new Date().toISOString().split('T')[0],
      refundReference: '',
      bankAccountId: '',
    })
    setAppliedInvoices([])
    setDuplicateWarning(null)
    setSaveError('')
    setNewOpen(true)
    loadCustomers()
    loadBankAccounts()
  }

  function openEditCN(row: CreditNoteRow) {
    setEditingId(row.id)
    setNc({
      customerId: row.customerId ?? '',
      invoiceId: row.invoiceId ?? '',
      totalAmount: row.amount ? String(row.amount) : '',
      reasonCode: row.reasonCode || CREDIT_REASONS[0],
      reasonDetails: row.reasonDetails ?? '',
      creditType: row.type ?? 'credit',
      refundMethod: row.type === 'refund' ? REFUND_METHODS[0] : REFUND_METHODS[0],
      refundDate: new Date().toISOString().split('T')[0],
      refundReference: '',
      bankAccountId: '',
    })
    setAppliedInvoices([])
    setDuplicateWarning(null)
    setSaveError('')
    setNewOpen(true)
    loadCustomers()
    loadBankAccounts()
    if (row.customerId) loadInvoicesForCustomer(row.customerId, row.invoiceId ?? '')
  }

  async function submitNewCreditNote(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId) return
    if (!nc.customerId) { setSaveError('Select a customer'); return }
    if (!nc.reasonCode) { setSaveError('Select a reason code'); return }
    if (nc.reasonCode === 'Other' && !nc.reasonDetails.trim()) { setSaveError('Provide details for Other reason'); return }
    if (nc.creditType === 'refund' && !nc.refundMethod) { setSaveError('Select a refund method'); return }
    if (nc.creditType === 'refund' && !nc.bankAccountId) { setSaveError('Select a bank account'); return }

    const newAmount = parseApplyAmount(nc.totalAmount)
    if (!Number.isFinite(newAmount) || newAmount <= 0) { setSaveError('Enter a valid amount'); return }

    const appliedTotal = appliedInvoices.reduce((total, row) => {
      const amount = parseApplyAmount(row.amountToApply)
      return total + (Number.isFinite(amount) ? amount : 0)
    }, 0)
    if (appliedTotal > newAmount) { setSaveError('Applied amount cannot exceed credit total'); return }
    for (const invoice of appliedInvoices) {
      const amount = parseApplyAmount(invoice.amountToApply)
      if (!invoice.amountToApply) continue
      if (!Number.isFinite(amount) || amount < 0) { setSaveError('Enter valid apply amounts'); return }
      if (amount > invoice.balanceDue) { setSaveError(`Amount on invoice ${invoice.invoiceNumber} cannot exceed balance due`); return }
    }

    setSaving(true); setSaveError('')
    const payload: any = {
      customerId: nc.customerId,
      invoiceId: nc.invoiceId || undefined,
      totalAmount: newAmount,
      reason: nc.reasonCode === 'Other' ? nc.reasonDetails.trim() : nc.reasonCode,
      type: nc.creditType,
      appliedInvoices: appliedInvoices
        .filter(row => parseApplyAmount(row.amountToApply) > 0)
        .map(row => ({ invoiceId: row.invoiceId, amount: parseApplyAmount(row.amountToApply) })),
    }
    if (nc.reasonCode === 'Other') {
      payload.memo = nc.reasonDetails.trim()
    }
    if (nc.creditType === 'refund') {
      payload.refundMethod = nc.refundMethod
      payload.refundDate = nc.refundDate
      payload.refundReference = nc.refundReference
      payload.bankAccountId = nc.bankAccountId
    }

    try {
      if (editingId) {
        await apiClient.put(`/companies/${companyId}/ar/credit-notes/${editingId}`, payload)
        setNewOpen(false)
        fetchData()
        showToast('Credit note updated')
        setEditingId(null)
      } else {
        await apiClient.post(`/companies/${companyId}/ar/credit-notes`, payload)
        setNewOpen(false)
        fetchData()
        showToast('Credit note created')
      }
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Failed to save credit note')
    } finally {
      setSaving(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {toast && (
        <div className="fixed top-4 right-4 z-[100] bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">{toast}</div>
      )}

      {/* Header */}
      <div className="px-6 py-5 flex-1">
        <HaypDataTable
          data={tableData}
          columns={columns}
          tableId="credit-notes"
          title="Credit Notes"
          stats={stats}
          headerActions={
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterReason}
                onChange={e => setFilterReason(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Reasons</option>
                {CREDIT_REASONS.map(reason => <option key={reason} value={reason}>{reason}</option>)}
              </select>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Types</option>
                <option value="credit">Credit</option>
                <option value="refund">Refund</option>
              </select>
              <input
                type="date"
                value={filterDateFrom}
                onChange={e => setFilterDateFrom(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="date"
                value={filterDateTo}
                onChange={e => setFilterDateTo(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={openModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
              >
                <Plus size={14} /> New Credit Note
              </button>
            </div>
          }
          globalFilter={search}
          onGlobalFilterChange={setSearch}
          searchPlaceholder="Search credit notes..."
          filters={statusFilterOptions}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
          filterLabel="Status"
          actions={actions}
          bulkActions={bulkActions}
          totals={{ enabled: true, sumColumns: ['amount', 'appliedAmount', '_unapplied'], formatValue: (value) => fmt(Number(value)) }}
          onRefresh={fetchData}
          onExport={handleExport}
          onActivityLog={() => router.push('/sales/revenue/credit-notes/activity')}
          onRowClick={(row) => { setDrawerCN(row); setDrawerTab('details'); setCnActivity([]) }}
          loading={loading}
          emptyTitle="No credit notes yet"
          emptySubtitle="Create your first credit note to get started"
        />
      </div>

      {/* Detail Drawer */}
      {drawerCN && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setDrawerCN(null)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{drawerCN.creditNoteNumber}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{drawerCN.customer}</p>
              </div>
              <button onClick={() => setDrawerCN(null)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>
            {/* Tabs */}
            <div className="flex border-b border-slate-200 px-5 bg-slate-50">
              {(['details', 'activity'] as const).map(tab => (
                <button key={tab} type="button" onClick={() => {
                  setDrawerTab(tab)
                  if (tab === 'activity' && cnActivity.length === 0 && companyId) {
                    setCnActivityLoading(true)
                    apiClient.get(`/companies/${companyId}/ar/credit-notes/${drawerCN.id}/activity`)
                      .then(r => setCnActivity(r.data.data ?? []))
                      .catch(() => {})
                      .finally(() => setCnActivityLoading(false))
                  }
                }}
                  className={`px-4 py-2.5 text-sm font-semibold capitalize border-b-2 transition-colors ${
                    drawerTab === tab ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}>
                  {tab === 'activity' ? <span className="flex items-center gap-1"><Clock size={13} />Activity</span> : 'Details'}
                </button>
              ))}
            </div>
            {drawerTab === 'activity' ? (
              <div className="px-5 py-4 space-y-3">
                {cnActivityLoading ? (
                  <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-slate-400" /></div>
                ) : cnActivity.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No activity recorded yet.</p>
                ) : cnActivity.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <Clock size={13} className="mt-0.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-700">{log.action}</span>
                      {log.user && <span className="text-slate-500"> by {log.user.name ?? log.user.email}</span>}
                      <span className="text-slate-400 ml-2">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <>
            <div className="px-5 py-4 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Date</p>
                  <p className="font-semibold text-slate-800">{fmtDate(drawerCN.date)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Amount</p>
                  <p className="font-bold text-xl text-slate-900">{formatCurrency(drawerCN.amount, currency)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Status</p>
                  <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${statusBadge(drawerCN.status)}`}>{drawerCN.status}</span>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Invoice #</p>
                  <p className="font-semibold text-slate-800">{drawerCN.invoiceNumber ?? '—'}</p>
                </div>
              </div>
              {drawerCN.memo && (
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Reason</p>
                  <p className="text-sm text-slate-700">{drawerCN.memo}</p>
                </div>
              )}
            </div>
            {drawerCN.status !== 'VOID' && drawerCN.status !== 'APPLIED' && (
              <div className="px-5 py-4 border-t border-slate-200 flex gap-2">
                <button
                  onClick={() => { openApplyModal(drawerCN); setDrawerCN(null) }}
                  className="flex-1 px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  Apply to Invoice
                </button>
                <button
                  onClick={() => handleVoid(drawerCN.id)}
                  disabled={actioningId === drawerCN.id}
                  className="px-4 py-2 text-sm font-semibold border border-rose-300 text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-50"
                >
                  Void
                </button>
              </div>
            )}
            </>
            )}
          </div>
        </div>
      )}

      {/* Apply to Invoice Modal */}
      {applyOpen && applyingCN && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setApplyOpen(false)}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Apply Credit Note</h2>
              <button onClick={() => setApplyOpen(false)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"><X size={16} /></button>
            </div>
            <form onSubmit={submitApply} className="p-4 space-y-4">
              <p className="text-sm text-slate-600">Applying <strong>{applyingCN.creditNoteNumber}</strong> ({formatCurrency(applyingCN.amount, currency)}) to an invoice.</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Invoice *</label>
                <InvoicePickerField
                  companyId={companyId || ''}
                  customerId={applyingCN.customerId}
                  statuses={OPEN_INVOICE_STATUSES}
                  value={applyForm.invoiceId || null}
                  placeholder={invoicesLoading ? 'Loading invoices…' : 'Search open invoices...'}
                  onChange={(id, option) => {
                    const matched = invoices.find((inv) => inv.id === id)
                    setApplyForm((f) => ({ ...f, invoiceId: id }))
                    setApplyInvoiceBalance(
                      id
                        ? (matched?.balance ?? parsePickerDueAmount(option.tertiaryLabel))
                        : null,
                    )
                  }}
                />
                {applyInvoiceBalance != null && (
                  <p className="mt-1 text-xs text-slate-500">Balance due: {formatCurrency(applyInvoiceBalance, currency)}</p>
                )}
                {!invoicesLoading && invoices.length === 0 && (
                  <p className="mt-1 text-xs text-slate-500">No open invoices for this customer</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount to Apply *</label>
                <input
                  required
                  type="text"
                  inputMode="decimal"
                  aria-label="Amount to apply"
                  value={applyAmountFocused ? applyForm.amount : formatApplyAmount(applyForm.amount)}
                  onFocus={() => setApplyAmountFocused(true)}
                  onBlur={() => setApplyAmountFocused(false)}
                  onChange={e => {
                    const normalized = e.target.value.replace(/,/g, '').replace(/[^\d.]/g, '')
                    if ((normalized.match(/\./g) ?? []).length > 1) return
                    setApplyForm(f => ({ ...f, amount: normalized }))
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              {applyError && <p className="text-sm text-rose-500">{applyError}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setApplyOpen(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={applying} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60">
                  {applying ? 'Applying…' : 'Apply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {newOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setNewOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">New Credit Note</h2>
              <button onClick={() => setNewOpen(false)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <form onSubmit={submitNewCreditNote} className="p-4 space-y-4">
              <CustomerPickerField
                label="Customer *"
                value={nc.customerId}
                customers={customers}
                loading={custLoading}
                placeholder="Select customer..."
                createLabel="Create New Customer"
                onOpen={loadCustomers}
                onChange={(id) => {
                  setNc((p) => ({ ...p, customerId: id }))
                  loadInvoicesForCustomer(id)
                }}
                onCreateNew={() => setShowQuickAddCustomer(true)}
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2 rounded-full bg-white p-1">
                  {(['credit', 'refund'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNc((prev) => ({ ...prev, creditType: type }))}
                      className={`flex-1 px-3 py-2 text-sm font-semibold rounded-full transition-colors ${nc.creditType === type ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      {type === 'credit' ? 'Issue Credit' : 'Issue Refund'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reason *</label>
                  <select
                    required
                    value={nc.reasonCode}
                    onChange={e => setNc(p => ({ ...p, reasonCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  >
                    {CREDIT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                {nc.reasonCode === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Reason details *</label>
                    <input
                      value={nc.reasonDetails}
                      onChange={e => setNc(p => ({ ...p, reasonDetails: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      placeholder="Enter details"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount *</label>
                  <input
                    required
                    type="text"
                    inputMode="decimal"
                    value={newAmountFocused ? nc.totalAmount : formatApplyAmount(nc.totalAmount)}
                    onFocus={() => setNewAmountFocused(true)}
                    onBlur={() => setNewAmountFocused(false)}
                    onChange={e => {
                      const normalized = e.target.value.replace(/,/g, '').replace(/[^0-9.]/g, '')
                      if ((normalized.match(/\./g) ?? []).length > 1) return
                      setNc(p => ({ ...p, totalAmount: normalized }))
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {nc.creditType === 'refund' && (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Refund Method</label>
                      <select
                        value={nc.refundMethod}
                        onChange={e => setNc(p => ({ ...p, refundMethod: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      >
                        {REFUND_METHODS.map(method => <option key={method} value={method}>{method}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Refund Date</label>
                      <input
                        type="date"
                        value={nc.refundDate}
                        onChange={e => setNc(p => ({ ...p, refundDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Refund Reference</label>
                      <input
                        value={nc.refundReference}
                        onChange={e => setNc(p => ({ ...p, refundReference: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        placeholder="Reference #"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Bank Account</label>
                      <select
                        value={nc.bankAccountId}
                        onChange={e => setNc(p => ({ ...p, bankAccountId: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      >
                        <option value="">Select an account</option>
                        {bankAccounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-800">Apply to Invoices</p>
                  <p className="text-sm text-slate-500">Remaining Unapplied: {formatCurrency(Math.max(0, parseApplyAmount(nc.totalAmount) - appliedInvoices.reduce((sum, row) => sum + (parseApplyAmount(row.amountToApply) || 0), 0)), currency)}</p>
                </div>
                {invoicesLoading ? (
                  <p className="text-sm text-slate-500">Loading open invoices…</p>
                ) : appliedInvoices.length === 0 ? (
                  <p className="text-sm text-slate-500">Select a customer to view open invoices.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse" style={{ tableLayout: 'fixed' }}>
                      <thead>
                        <tr className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider font-semibold">
                          <th className="px-3 py-2 text-left">Invoice #</th>
                          <th className="px-3 py-2 text-left">Date</th>
                          <th className="px-3 py-2 text-right">Original</th>
                          <th className="px-3 py-2 text-right">Balance Due</th>
                          <th className="px-3 py-2 text-right">Amount to Apply</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appliedInvoices.map((invoice) => (
                          <tr key={invoice.invoiceId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-3 py-2 truncate">{invoice.invoiceNumber}</td>
                            <td className="px-3 py-2 text-slate-600">{fmtDate(invoices.find(i => i.id === invoice.invoiceId)?.date ?? null)}</td>
                            <td className="px-3 py-2 text-right text-slate-700">{formatCurrency(invoice.balanceDue, currency)}</td>
                            <td className="px-3 py-2 text-right text-slate-700">{formatCurrency(invoice.balanceDue, currency)}</td>
                            <td className="px-3 py-2 text-right">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={invoice.amountToApply}
                                onChange={e => {
                                  const normalized = e.target.value.replace(/,/g, '').replace(/[^0-9.]/g, '')
                                  if ((normalized.match(/\./g) ?? []).length > 1) return
                                  setAppliedInvoices(prev => prev.map((row) => row.invoiceId === invoice.invoiceId ? { ...row, amountToApply: normalized } : row))
                                }}
                                className="w-full px-2 py-1 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-right"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {saveError && <p className="text-sm text-rose-500">{saveError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setNewOpen(false)} className="px-4 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50">
                  {saving ? 'Saving…' : 'Create Credit Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQuickAddCustomer && companyId && (
        <QuickAddCustomerModal
          companyId={companyId}
          onClose={() => setShowQuickAddCustomer(false)}
          onCreated={(customer) => {
            const next = { id: customer.contactId, name: customer.name }
            setCustomers((prev) => [next, ...prev.filter((p) => p.id !== next.id)])
            setNc((prev) => ({ ...prev, customerId: next.id }))
            setShowQuickAddCustomer(false)
          }}
        />
      )}
    </div>
  )
}

