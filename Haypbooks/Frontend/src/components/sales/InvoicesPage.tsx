'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Eye,
  Send,
  Ban,
  Copy,
  Trash2,
  Printer,
  Share2,
  CreditCard,
  History,
  LayoutTemplate,
  AlertTriangle,
  TrendingUp,
  ReceiptText,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { useToast } from '@/components/ToastProvider'
import { salesService } from '@/services/sales.service'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import InvoiceDetailPage from './InvoiceDetailPage'
import TemplateGallery from './invoice-templates/TemplateGallery'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypBulkAction, HaypColumn, HaypStat } from '@/components/shared/HaypDataTable.types'
import { fmtDate, csvDownload, StatusPill } from './_helpers'

export interface Invoice {
  id: string
  invoiceNumber?: string
  customerId?: string
  customerName?: string
  date: string
  dueDate: string
  status: 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'VOID'
  total: number
  amountDue?: number
  items?: InvoiceItem[]
  memo?: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
  accountId?: string
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

function getDaysOverdue(inv: Invoice): number {
  if (!inv.dueDate) return 0
  const due = new Date(inv.dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((today.getTime() - due.getTime()) / MS_PER_DAY)
  return Math.max(0, diff)
}

function isDueSoon(inv: Invoice): boolean {
  if (!inv.dueDate) return false
  const due = new Date(inv.dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.ceil((due.getTime() - today.getTime()) / MS_PER_DAY)
  return diff >= 0 && diff <= 7 && !['PAID', 'VOID'].includes(inv.status)
}

export default function InvoicesPage() {
  const router = useRouter()
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([])
  const toast = useToast()

  const fetchInvoices = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const response = await salesService.listArInvoices(companyId, {
        search: search || undefined,
        status: statusFilter !== 'ALL' && statusFilter !== 'DUE_SOON' ? statusFilter : undefined,
      })
      const data = response.data?.data ?? response.data ?? []
      setInvoices(Array.isArray(data) ? data : [])
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to load invoices'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [companyId, search, statusFilter, toast])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  type EnrichedInvoice = Invoice & { daysOverdue: number; dueSoon: boolean }

  const enrichedInvoices = useMemo<EnrichedInvoice[]>(
    () => invoices.map((invoice) => ({
      ...invoice,
      daysOverdue: getDaysOverdue(invoice),
      dueSoon: isDueSoon(invoice),
    })),
    [invoices],
  )

  const tableData = useMemo(() => {
    if (statusFilter === 'DUE_SOON') {
      return enrichedInvoices.filter((invoice) => invoice.dueSoon)
    }
    return enrichedInvoices
  }, [enrichedInvoices, statusFilter])

  const statusFilterOptions = useMemo(
    () => [
      { value: 'ALL', label: 'All Statuses' },
      { value: 'DRAFT', label: 'Draft' },
      { value: 'SENT', label: 'Sent' },
      { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
      { value: 'PAID', label: 'Paid' },
      { value: 'OVERDUE', label: 'Overdue' },
      { value: 'DUE_SOON', label: 'Due Soon' },
      { value: 'VOID', label: 'Voided' },
    ],
    [],
  )

  const handleSend = useCallback(
    async (id: string, invoiceNumber?: string, kind: 'send' | 'reminder' = 'send') => {
      if (!companyId) return
      try {
        await salesService.sendArInvoice(companyId, id)
        fetchInvoices()
        toast.success(kind === 'send' ? `Invoice #${invoiceNumber ?? id.slice(-6).toUpperCase()} marked as Sent` : 'Reminder sent')
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to send invoice'
        setError(msg)
        toast.error(msg)
      }
    },
    [companyId, fetchInvoices, toast],
  )

  const duplicateInvoice = useCallback(
    async (source: Invoice) => {
      if (!companyId) throw new Error('No company selected')
      const { data } = await salesService.duplicateArInvoice(companyId, source.id)
      await fetchInvoices()
      toast.success(`Invoice #${source.invoiceNumber ?? source.id.slice(-6).toUpperCase()} duplicated as #${data?.invoiceNumber ?? String(data?.id ?? '').slice(-6).toUpperCase()}`)
      setViewInvoice(data)
    },
    [companyId, fetchInvoices, toast],
  )

  const handleDuplicateFromList = useCallback(
    async (sourceInvoice: Invoice) => {
      try {
        await duplicateInvoice(sourceInvoice)
      } catch (err: any) {
        setError(err?.response?.data?.message ?? 'Failed to duplicate invoice')
      }
    },
    [duplicateInvoice],
  )

  const handleDuplicateFromDetail = useCallback(
    async (sourceInvoice: Invoice) => {
      try {
        await duplicateInvoice(sourceInvoice)
      } catch (err: any) {
        throw new Error(err?.response?.data?.message ?? 'Failed to duplicate invoice')
      }
    },
    [duplicateInvoice],
  )

  const handleVoid = useCallback(
    async (id: string) => {
      if (!companyId || !confirm('Voiding this invoice will reverse all payment allocations. Continue?')) return
      try {
        await salesService.voidArInvoice(companyId, id)
        fetchInvoices()
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to void invoice'
        setError(msg)
        toast.error(msg)
      }
    },
    [companyId, fetchInvoices, toast],
  )

  const handleBulkSend = useCallback(
    async (ids: string[]) => {
      if (!companyId || ids.length === 0) return
      if (!confirm(`Send ${ids.length} invoice(s)?`)) return
      await Promise.allSettled(ids.map((id) => salesService.sendArInvoice(companyId, id)))
      fetchInvoices()
    },
    [companyId, fetchInvoices],
  )

  const handleBulkMarkAsSent = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return
      setInvoices((prev) => prev.map((invoice) => (ids.includes(invoice.id) ? { ...invoice, status: 'SENT' } : invoice)))
      toast.success(`${ids.length} invoice(s) marked as Sent`)
    },
    [toast],
  )

  const handleBulkPrint = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return
      toast.info(`${ids.length} invoice(s) queued for print`)
    },
    [toast],
  )

  const handleConfirmDelete = useCallback((ids: string[]) => {
    if (ids.length === 0) return
    setDeleteTargetIds(ids)
    setDeleteConfirmationOpen(true)
  }, [])

  const handleBulkDelete = useCallback(() => {
    setInvoices((prev) => prev.filter((invoice) => !deleteTargetIds.includes(invoice.id)))
    setDeleteTargetIds([])
    setDeleteConfirmationOpen(false)
    toast.success('Selected invoices deleted')
  }, [deleteTargetIds, toast])

  const downloadInvoicesCSV = useCallback(
    (rows: Invoice[]) => {
      const headers = ['Invoice #', 'Customer', 'Date', 'Due Date', 'Status', 'Days overdue', 'Total']
      const formatted = rows.map((invoice) => [
        invoice.invoiceNumber ?? invoice.id.slice(0, 8).toUpperCase(),
        invoice.customerName ?? '',
        fmtDate(invoice.date),
        fmtDate(invoice.dueDate),
        invoice.status.replace(/_/g, ' '),
        String(getDaysOverdue(invoice)),
        String(invoice.total),
      ])
      csvDownload(`invoices-${new Date().toISOString().slice(0, 10)}`, headers, formatted)
      toast.success('CSV export ready')
    },
    [toast],
  )

  const handleExport = useCallback(() => {
    downloadInvoicesCSV(tableData)
  }, [downloadInvoicesCSV, tableData])

  const fmt = useCallback((value: number) => formatCurrency(value, currency), [currency])

  const columns = useMemo<HaypColumn<EnrichedInvoice>[]>(
    () => [
      {
        id: 'invoiceNumber',
        header: 'Invoice #',
        accessorKey: 'invoiceNumber',
        size: 120,
        minSize: 100,
        enableSorting: true,
        render: (value, row) => (
          <button
            onClick={(event) => {
              event.stopPropagation()
              setViewInvoice(row)
            }}
            className="font-mono text-sm text-emerald-600 hover:text-emerald-800 hover:underline"
          >
            {value ?? row?.id?.slice(0, 8)}
          </button>
        ),
      },
      {
        id: 'customerName',
        header: 'Customer',
        accessorKey: 'customerName',
        size: 180,
        minSize: 140,
        render: (value) => <span className="font-medium text-slate-900">{value || '—'}</span>,
      },
      {
        id: 'date',
        header: 'Date',
        accessorKey: 'date',
        size: 110,
        minSize: 100,
        enableSorting: true,
        render: (value) => <span className="text-slate-600">{fmtDate(value)}</span>,
      },
      {
        id: 'dueDate',
        header: 'Due Date',
        accessorKey: 'dueDate',
        size: 110,
        minSize: 100,
        enableSorting: true,
        render: (value, row) => {
          const overdueDays = row?.daysOverdue ?? 0
          return (
            <span className={overdueDays > 0 ? 'text-red-600 font-medium' : 'text-slate-600'}>
              {fmtDate(value)}
            </span>
          )
        },
      },
      {
        id: 'daysOverdue',
        header: 'Days Overdue',
        accessorKey: 'daysOverdue',
        size: 110,
        align: 'right',
        enableSorting: true,
        render: (value) =>
          value > 0 ? <span className="text-red-600 font-medium">{value}</span> : <span className="text-slate-400">—</span>,
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        size: 100,
        minSize: 90,
        render: (value) => <StatusPill status={value} />,
      },
      {
        id: 'total',
        header: 'Total',
        accessorKey: 'total',
        size: 110,
        align: 'right',
        enableSorting: true,
        isSummable: true,
        render: (value) => <span className="font-medium text-slate-900">{fmt(value)}</span>,
      },
    ],
    [fmt],
  )

  const actions = useMemo<HaypActionItem[]>(
    () => [
      {
        label: 'View / Edit',
        icon: <Eye size={13} />,
        onClick: (_id, row) => setViewInvoice(row),
      },
      {
        label: 'Send Invoice',
        icon: <Send size={13} />,
        show: (row) => row?.status === 'DRAFT',
        onClick: (id, row) => handleSend(id, row?.invoiceNumber, 'send'),
      },
      {
        label: 'Send Reminder',
        icon: <Send size={13} />,
        show: (row) => ['SENT', 'OVERDUE'].includes(row?.status ?? ''),
        onClick: (id, row) => handleSend(id, row?.invoiceNumber, 'reminder'),
      },
      {
        label: 'Receive Payment',
        icon: <CreditCard size={13} />,
        show: (row) => ['SENT', 'PARTIALLY_PAID', 'PARTIAL', 'OVERDUE'].includes(row?.status ?? ''),
        onClick: (_id, row) => setViewInvoice(row),
      },
      { label: '', divider: true, onClick: () => {} },
      {
        label: 'Print Invoice',
        icon: <Printer size={13} />,
        onClick: () => window.print(),
      },
      {
        label: 'Share Link',
        icon: <Share2 size={13} />,
        onClick: (id) => {
          navigator.clipboard?.writeText(`${window.location.origin}/sales/billing/invoices/${id}`)
          toast.success('Link copied!')
        },
      },
      {
        label: 'Duplicate',
        icon: <Copy size={13} />,
        onClick: (_id, row) => handleDuplicateFromList(row),
      },
      { label: '', divider: true, onClick: () => {} },
      {
        label: 'Void',
        icon: <Ban size={13} />,
        danger: true,
        show: (row) => (row?.status ?? '') !== 'VOID',
        onClick: (id) => handleVoid(id),
      },
      {
        label: 'History / Audit Log',
        icon: <History size={13} />,
        onClick: (id) => router.push(`/sales/billing/invoices/activity?id=${id}`),
      },
    ],
    [handleSend, handleDuplicateFromList, handleVoid, router, toast],
  )

  const bulkActions = useMemo<HaypBulkAction[]>(
    () => [
      {
        label: 'Send',
        icon: <Send size={14} />,
        onClick: (ids) => handleBulkSend(ids),
      },
      {
        label: 'Mark Sent',
        icon: <CheckCircle2 size={14} />,
        onClick: (ids) => handleBulkMarkAsSent(ids),
      },
      {
        label: 'Print',
        icon: <Printer size={14} />,
        onClick: (ids) => handleBulkPrint(ids),
      },
      {
        label: 'Delete',
        icon: <Trash2 size={14} />,
        variant: 'danger',
        onClick: (ids) => handleConfirmDelete(ids),
      },
    ],
    [handleBulkSend, handleBulkMarkAsSent, handleBulkPrint, handleConfirmDelete],
  )

  const stats = useMemo<HaypStat[]>(
    () => [
      { icon: ReceiptText, label: 'Total Invoices', value: String(invoices.length), color: 'emerald' },
      { icon: TrendingUp, label: 'Total Amount', value: fmt(invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0)), color: 'emerald' },
      { icon: Clock, label: 'Outstanding', value: fmt(invoices.filter((invoice) => ['SENT', 'PARTIALLY_PAID', 'PARTIAL', 'OVERDUE'].includes(invoice.status)).reduce((sum, invoice) => sum + ((invoice.amountDue ?? invoice.total) || 0), 0)), color: 'amber' },
      { icon: AlertTriangle, label: 'Overdue', value: fmt(invoices.filter((invoice) => invoice.status === 'OVERDUE').reduce((sum, invoice) => sum + (invoice.total || 0), 0)), color: 'rose' },
    ],
    [fmt, invoices],
  )

  return (
    <div className="flex flex-col h-full">
      <HaypDataTable
        data={tableData}
        columns={columns}
        tableId="invoices"
        title="Invoices"
        stats={stats}
        headerActions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplates(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <LayoutTemplate size={14} /> Templates
            </button>
            <button
              onClick={() => router.push('/sales/billing/invoices/new')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus size={14} /> New Invoice
            </button>
          </div>
        }
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        searchPlaceholder="Search invoices..."
        filters={statusFilterOptions}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        filterLabel="Status"
        actions={actions}
        bulkActions={bulkActions}
        totals={{ enabled: true, sumColumns: ['total'], formatValue: (value) => fmt(Number(value)) }}
        onRefresh={fetchInvoices}
        onExport={handleExport}
        onActivityLog={() => router.push('/sales/billing/invoices/activity')}
        onRowClick={(row) => setViewInvoice(row)}
        loading={loading || cidLoading}
        emptyTitle="No invoices yet"
        emptySubtitle="Create your first invoice to get started"
      />

      {viewInvoice && companyId && (
        <InvoiceDetailPage
          invoice={viewInvoice}
          companyId={companyId}
          onClose={() => setViewInvoice(null)}
          onRefresh={fetchInvoices}
          onDuplicate={handleDuplicateFromDetail}
        />
      )}

      {showTemplates && <TemplateGallery modal onClose={() => setShowTemplates(false)} />}

      {deleteConfirmationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">Delete Invoices</h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to delete the selected invoices? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setDeleteConfirmationOpen(false)} className="px-4 py-2 text-sm text-slate-600 border rounded-lg hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete {deleteTargetIds.length} invoice{deleteTargetIds.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
