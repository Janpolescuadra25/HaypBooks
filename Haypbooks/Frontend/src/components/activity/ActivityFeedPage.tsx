'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FilterX,
  RefreshCw,
  Search,
  Download,
} from 'lucide-react'
import ActivityLog, { type ActivityLogItem, formatEntityLabel } from '@/components/ui/ActivityLog'
import { useActivityLog } from '@/hooks/useActivityLog'
import { useCompanyId } from '@/hooks/useCompanyId'

type DateRange = '24h' | '7d' | '30d' | 'all'

type Option = {
  value: string
  label: string
}

const DATE_RANGES: Array<{ value: DateRange; label: string }> = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
]

const DEFAULT_TABLE_OPTIONS: Option[] = [
  { value: 'Invoice', label: 'Invoices' },
  { value: 'Quote', label: 'Quotes' },
  { value: 'SalesOrder', label: 'Sales Orders' },
  { value: 'CreditNote', label: 'Credit Notes' },
  { value: 'Customer', label: 'Customers' },
  { value: 'PaymentReceived', label: 'Customer Payments' },
  { value: 'Item', label: 'Products and Services' },
  { value: 'BankAccount', label: 'Bank Accounts' },
  { value: 'Bill', label: 'Bills' },
  { value: 'Vendor', label: 'Vendors' },
  { value: 'JournalEntry', label: 'Journal Entries' },
]

function normalizeAction(action?: string | null): string {
  return String(action ?? '').trim().toUpperCase()
}

function getFromDate(range: DateRange): string | undefined {
  if (range === 'all') return undefined
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  if (range === '24h') return new Date(now - dayMs).toISOString()
  if (range === '7d') return new Date(now - 7 * dayMs).toISOString()
  return new Date(now - 30 * dayMs).toISOString()
}

function formatTimestamp(timestamp?: string | null): string {
  if (!timestamp) return '--'
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleString()
}

function buildActivityCsv(entries: ActivityLogItem[]): string {
  const rows = [
    ['Timestamp', 'Entity', 'Action', 'User', 'Details'],
    ...entries.map((entry) => [
      formatTimestamp(entry.createdAt),
      formatEntityLabel(entry.tableName),
      normalizeAction(entry.action).replace(/_/g, ' '),
      entry.user?.name || entry.user?.email || 'System',
      typeof entry.changes === 'object' ? JSON.stringify(entry.changes) : String(entry.changes ?? ''),
    ]),
  ]
  return rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n')
}

function normalizeTable(tableName?: string | null): string {
  return String(tableName ?? '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
}

function getEntryPath(entry: ActivityLogItem): string {
  const table = normalizeTable(entry.tableName)

  const target = (() => {
    if (table === 'INVOICE') return '/sales/billing/invoices'
    if (table === 'QUOTE') return '/sales/sales/quotes'
    if (table === 'SALESORDER') return '/sales/sales/orders'
    if (table === 'CREDITNOTE') return '/sales/revenue/credit-notes'
    if (table === 'CUSTOMER' || table === 'CONTACT') return '/sales/customers'
    if (table === 'PAYMENTRECEIVED' || table === 'CUSTOMERPAYMENT' || table === 'PAYMENT') return '/sales/collections/payments'
    if (table === 'ITEM' || table === 'INVENTORYITEM' || table === 'PRODUCT') return '/sales/sales/products-services'
    if (table === 'BANKACCOUNT') return '/banking-cash/transactions'
    if (table === 'BILL') return '/expenses/payables/bills'
    if (table === 'VENDOR') return '/expenses/purchasing/vendors'
    if (table === 'JOURNALENTRY') return '/accounting/core-accounting/journal-entries'
    return '/activity'
  })()

  if (!entry.recordId) return target
  const suffix = `recordId=${encodeURIComponent(entry.recordId)}`
  return `${target}?${suffix}`
}

export default function ActivityFeedPage() {
  const router = useRouter()
  const { companyId, loading: companyLoading, error: companyError } = useCompanyId()

  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [tableFilter, setTableFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const {
    entries,
    loading,
    error,
    page,
    hasMore,
    setPage,
    patchFilters,
    resetFilters,
    refetch,
  } = useActivityLog({
    companyId,
    pageSize: 40,
    initialFilters: { from: getFromDate('30d') },
  })

  useEffect(() => {
    patchFilters({
      tableName: tableFilter || undefined,
      userId: userFilter || undefined,
      from: getFromDate(dateRange),
      to: undefined,
    })
  }, [tableFilter, userFilter, dateRange, patchFilters])

  const tableOptions = useMemo(() => {
    const options = [...DEFAULT_TABLE_OPTIONS]
    const seen = new Set(options.map((option) => option.value.toLowerCase()))
    for (const entry of entries) {
      if (!entry.tableName) continue
      const key = entry.tableName.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      options.push({
        value: entry.tableName,
        label: formatEntityLabel(entry.tableName),
      })
    }
    return options
  }, [entries])

  const actionOptions = useMemo(() => {
    const actions = Array.from(new Set(entries.map((entry) => normalizeAction(entry.action)).filter(Boolean)))
      .sort()
    return ['ALL', ...actions]
  }, [entries])

  const userOptions = useMemo(() => {
    const byId = new Map<string, string>()
    for (const entry of entries) {
      const id = entry.user?.id
      if (!id) continue
      const label = entry.user?.name || entry.user?.email || id
      byId.set(id, label)
    }
    return Array.from(byId.entries()).map(([id, label]) => ({ id, label }))
  }, [entries])

  const visibleEntries = useMemo(() => {
    const query = search.trim().toLowerCase()
    return entries.filter((entry) => {
      if (actionFilter !== 'ALL' && normalizeAction(entry.action) !== actionFilter) return false
      if (!query) return true

      const actor = `${entry.user?.name ?? ''} ${entry.user?.email ?? ''}`.toLowerCase()
      const entity = formatEntityLabel(entry.tableName).toLowerCase()
      const action = normalizeAction(entry.action).replace(/_/g, ' ').toLowerCase()
      const fields = entry.changes && typeof entry.changes === 'object'
        ? Object.keys(entry.changes).join(' ').toLowerCase()
        : ''

      return (
        actor.includes(query) ||
        entity.includes(query) ||
        action.includes(query) ||
        fields.includes(query)
      )
    })
  }, [entries, actionFilter, search])

  const clearFilters = () => {
    setSearch('')
    setActionFilter('ALL')
    setTableFilter('')
    setUserFilter('')
    setDateRange('30d')
    setPage(1)
    resetFilters()
    patchFilters({ from: getFromDate('30d') })
  }

  const handleExport = (type: 'csv' | 'pdf') => {
    setShowExportOptions(false)
    if (type === 'csv') {
      const csv = buildActivityCsv(visibleEntries)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `activity-log-${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setToastMessage('Activity log exported as CSV')
    } else {
      setToastMessage('PDF export is not available yet')
    }
  }

  useEffect(() => {
    if (!toastMessage) return
    const timer = window.setTimeout(() => setToastMessage(''), 3000)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  if (companyLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[320px] text-slate-500">
        <RefreshCw size={16} className="mr-2 animate-spin" /> Loading activity feed...
      </div>
    )
  }

  if (companyError) {
    return <div className="p-6 text-red-600">{companyError}</div>
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-900"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-emerald-900">
            <Clock3 size={22} className="text-emerald-600" /> Audit Trail
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review changes across invoices, customers, payments, products, and accounting records.
          </p>
        </div>
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportOptions((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              <Download size={14} /> Export
            </button>
            {showExportOptions && (
              <div className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                <button onClick={() => handleExport('csv')}
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">Export CSV</button>
                <button onClick={() => handleExport('pdf')}
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">Export PDF</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search action, entity, user, or field"
              className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
            />
          </div>

          <select
            value={tableFilter}
            onChange={(event) => setTableFilter(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
            aria-label="Filter by entity"
          >
            <option value="">All entities</option>
            {tableOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
            aria-label="Filter by action"
          >
            {actionOptions.map((action) => (
              <option key={action} value={action}>
                {action === 'ALL' ? 'All actions' : action.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(event) => setDateRange(event.target.value as DateRange)}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
              aria-label="Filter by date range"
            >
              {DATE_RANGES.map((range) => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-600 hover:bg-slate-50"
              title="Reset filters"
            >
              <FilterX size={13} /> Reset
            </button>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-5">
          <div className="md:col-span-2" />
          <div className="md:col-span-2">
            <select
              value={userFilter}
              onChange={(event) => setUserFilter(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
              aria-label="Filter by user"
            >
              <option value="">All users</option>
              {userOptions.map((user) => (
                <option key={user.id} value={user.id}>{user.label}</option>
              ))}
            </select>
          </div>
          <div className="text-right text-xs text-slate-500 md:pt-2.5">
            Showing {visibleEntries.length} entries on page {page}
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {toastMessage}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <ActivityLog
        entries={visibleEntries}
        loading={loading}
        showEntityBadge
        emptyMessage="No activity matches your filters."
        onEntryNavigate={(entry) => router.push(getEntryPath(entry))}
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Page {page}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || loading}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={!hasMore || loading}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
