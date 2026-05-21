'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, RotateCcw, RefreshCw, Clock, CheckCircle, DollarSign, TrendingUp, Loader2, AlertCircle, X } from 'lucide-react'
import { salesService } from '@/services/sales.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypColumn, HaypFilterOption } from '@/components/shared/HaypDataTable.types'

interface RecognitionRow {
  id: string
  contractId: string
  customer: string
  description: string
  totalContractValue: number
  recognizedToDate: number
  remaining: number
  startDate: string
  endDate: string
  journalEntryId?: string | null
  method: 'Straight-Line' | 'Milestone' | 'Percentage of Completion' | 'Event-Based'
  status: 'Active' | 'Completed' | 'On Hold'
  [key: string]: any
}

interface NewRecognitionForm {
  contractId: string
  description: string
  totalContractValue: string
  startDate: string
  endDate: string
  method: string
}

interface ActivityEntry {
  id: string
  action: string
  recordId: string
  createdAt: string
  changes?: Record<string, any> | null
  user?: { name?: string | null; email?: string | null } | null
  [key: string]: any
}

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Completed: 'bg-blue-50 text-blue-700 border-blue-200',
  'On Hold': 'bg-amber-50 text-amber-700 border-amber-200',
}

const statusFilters: HaypFilterOption[] = [
  { value: 'ALL', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'Completed', label: 'Completed' },
  { value: 'On Hold', label: 'On Hold' },
]

const methodOptions = [
  { value: 'STRAIGHT_LINE', label: 'Straight-Line' },
  { value: 'MILESTONE', label: 'Milestone' },
  { value: 'PERCENTAGE_OF_COMPLETION', label: 'Percentage of Completion' },
  { value: 'EVENT_BASED', label: 'Event-Based' },
]

const defaultFormData: NewRecognitionForm = {
  contractId: '',
  description: '',
  totalContractValue: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  method: 'STRAIGHT_LINE',
}

export default function RevenueRecognitionPage() {
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [items, setItems] = useState<RecognitionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [recognizing, setRecognizing] = useState(false)
  const [recognizingId, setRecognizingId] = useState<string | null>(null)
  const [drawerContract, setDrawerContract] = useState<RecognitionRow | null>(null)
  const [drawerTab, setDrawerTab] = useState<'details' | 'activity'>('details')
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [form, setForm] = useState<NewRecognitionForm>(defaultFormData)

  const fetchItems = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const response = await salesService.listRevenueRecognition(companyId)
      const data = response.data
      setItems(Array.isArray(data) ? data : data?.items ?? data?.contracts ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load revenue recognition data')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const activeCount = useMemo(() => items.filter((r) => r.status === 'Active').length, [items])
  const completedCount = useMemo(() => items.filter((r) => r.status === 'Completed').length, [items])
  const totalRecognized = useMemo(() => items.reduce((sum, row) => sum + Number(row.recognizedToDate ?? 0), 0), [items])
  const totalRemaining = useMemo(() => items.reduce((sum, row) => sum + Number(row.remaining ?? 0), 0), [items])

  const handleRecognize = useCallback(async (id: string) => {
    if (!companyId || recognizingId) return
    setRecognizingId(id)
    try {
      await salesService.recognizeRevenueRecognition(companyId, id)
      toast.success('Revenue recognition processed')
      await fetchItems()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Recognition failed')
    } finally {
      setRecognizingId(null)
    }
  }, [companyId, fetchItems, recognizingId, toast])

  const handleBatchRecognize = useCallback(async () => {
    if (!companyId) return
    const activeRows = items.filter((row) => row.status === 'Active' && row.remaining > 0)
    if (!activeRows.length) return
    setRecognizing(true)
    try {
      await Promise.all(activeRows.map((row) => salesService.recognizeRevenueRecognition(companyId, row.id)))
      toast.success('Revenue recognition completed')
      await fetchItems()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Batch recognition failed')
    } finally {
      setRecognizing(false)
    }
  }, [companyId, fetchItems, items, toast])

  const handleCreate = useCallback(async () => {
    if (!companyId) return
    const total = Number(form.totalContractValue)
    if (!form.description.trim()) {
      toast.error('Description is required')
      return
    }
    if (!Number.isFinite(total) || total <= 0) {
      toast.error('Total contract value must be greater than 0')
      return
    }

    setCreating(true)
    try {
      await salesService.createRevenueRecognition(companyId, {
        contractId: form.contractId || undefined,
        description: form.description,
        totalContractValue: total,
        startDate: form.startDate,
        endDate: form.endDate,
        method: form.method,
      })
      toast.success('Contract created')
      setShowCreate(false)
      setForm(defaultFormData)
      await fetchItems()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create contract')
    } finally {
      setCreating(false)
    }
  }, [companyId, form, fetchItems, toast])

  const loadActivity = useCallback(async (contractId: string) => {
    if (!companyId) return
    setActivityLoading(true)
    try {
      const response = await salesService.getRevenueRecognitionActivity(companyId, contractId)
      const data = response.data
      setActivity(Array.isArray(data) ? data : data?.items ?? data?.data ?? [])
    } catch {
      setActivity([])
    } finally {
      setActivityLoading(false)
    }
  }, [companyId])

  const columns = useMemo<HaypColumn<RecognitionRow>[]>(() => [
    { id: 'contractId', header: 'Contract ID', accessorKey: 'contractId', size: 120, render: (value) => <span className="font-medium">{value}</span> },
    { id: 'customer', header: 'Customer', accessorKey: 'customer', size: 160 },
    { id: 'description', header: 'Description', accessorKey: 'description', size: 180, render: (value) => <span className="truncate max-w-[200px] block">{value}</span> },
    { id: 'method', header: 'Method', accessorKey: 'method', size: 130, cellClass: 'whitespace-nowrap' },
    { id: 'totalContractValue', header: 'Total Value', accessorKey: 'totalContractValue', size: 130, align: 'right', render: (value) => <span className="font-semibold">{formatCurrency(Number(value), currency)}</span> },
    { id: 'recognizedToDate', header: 'Recognized', accessorKey: 'recognizedToDate', size: 120, align: 'right', render: (_value, row) => {
      const pct = row.totalContractValue > 0 ? Math.round((row.recognizedToDate / row.totalContractValue) * 100) : 0
      return (
        <div>
          <div className="font-semibold">{formatCurrency(row.recognizedToDate, currency)}</div>
          <div className="text-xs text-slate-400">{pct}%</div>
        </div>
      )
    } },
    { id: 'remaining', header: 'Remaining', accessorKey: 'remaining', size: 110, align: 'right', render: (value) => <span className="font-semibold">{formatCurrency(Number(value), currency)}</span> },
    { id: 'period', header: 'Period', accessorKey: 'startDate', size: 110, render: (_value, row) => <span className="text-xs">{row.startDate} – {row.endDate}</span> },
    { id: 'status', header: 'Status', accessorKey: 'status', size: 100, render: (value) => <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_STYLES[value] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>{value}</span> },
  ], [currency])

  const actions = useMemo<HaypActionItem[]>(() => [
    { label: 'Recognize', icon: <RotateCcw size={14} />, show: (row) => row.status === 'Active' && row.remaining > 0, onClick: (_rowId, row) => { void handleRecognize(row.id) } },
  ], [handleRecognize])

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={fetchItems} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700">
        <RefreshCw size={14} /> Refresh
      </button>
      <button type="button" onClick={handleBatchRecognize} disabled={recognizing || loading} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
        {recognizing ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Run Recognition
      </button>
      <button type="button" onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">
        <Plus size={14} /> New Contract
      </button>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3 text-slate-900">
            <Clock size={16} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Active Contracts</p>
              <p className="text-xl font-bold mt-1 text-slate-900">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3 text-slate-900">
            <CheckCircle size={16} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Completed</p>
              <p className="text-xl font-bold mt-1 text-slate-900">{completedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3 text-slate-900">
            <DollarSign size={16} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Recognized to Date</p>
              <p className="text-xl font-bold mt-1 text-emerald-700">{formatCurrency(totalRecognized, currency)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3 text-slate-900">
            <TrendingUp size={16} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Remaining</p>
              <p className="text-xl font-bold mt-1 text-emerald-700">{formatCurrency(totalRemaining, currency)}</p>
            </div>
          </div>
        </div>
      </div>

      <HaypDataTable
        data={items}
        columns={columns}
        tableId="revenue-recognition"
        title="Revenue Recognition"
        description="Manage revenue recognition schedules (ASC 606 / IFRS 15)"
        loading={loading || cidLoading}
        searchPlaceholder="Search revenue recognition..."
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        filters={statusFilters}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        headerActions={headerActions}
        actions={actions}
        onRowClick={(row) => setDrawerContract(row)}
        onRefresh={fetchItems}
        emptyTitle="No contracts found"
        emptySubtitle="Create a revenue recognition contract to get started"
      />

      {drawerContract && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setDrawerContract(null)} />
          <div className="flex w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{drawerContract.contractId || 'Recognition Contract'}</h2>
                <p className="mt-0.5 text-sm text-slate-500">{drawerContract.customer}</p>
              </div>
              <button onClick={() => setDrawerContract(null)} aria-label="Close" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="flex border-b border-slate-200 bg-slate-50 px-5">
              {(['details', 'activity'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setDrawerTab(tab)
                    if (tab === 'activity' && activity.length === 0) {
                      loadActivity(drawerContract.id)
                    }
                  }}
                  className={`border-b-2 px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${drawerTab === tab ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  {tab === 'activity' ? <span className="flex items-center gap-1"><Clock size={13} />Activity</span> : 'Details'}
                </button>
              ))}
            </div>
            {drawerTab === 'activity' ? (
              <div className="space-y-3 px-5 py-4">
                {activityLoading ? (
                  <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-slate-400" /></div>
                ) : activity.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">No activity recorded yet.</p>
                ) : activity.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <Clock size={13} className="mt-0.5 shrink-0 text-slate-400" />
                    <div>
                      <span className="font-semibold text-slate-700">{log.action}</span>
                      {log.user && <span className="text-slate-500"> by {log.user.name ?? log.user.email}</span>}
                      <span className="ml-2 text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-4 px-5 py-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Description</p>
                      <p className="font-semibold text-slate-800">{drawerContract.description}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Method</p>
                      <p className="font-semibold text-slate-800">{drawerContract.method}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Total Value</p>
                      <p className="font-semibold text-slate-800">{formatCurrency(drawerContract.totalContractValue, currency)}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Recognized</p>
                      <p className="font-semibold text-emerald-700">{formatCurrency(drawerContract.recognizedToDate, currency)}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Remaining</p>
                      <p className="font-bold text-xl text-amber-700">{formatCurrency(drawerContract.remaining, currency)}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Period</p>
                      <p className="font-semibold text-slate-800">{drawerContract.startDate} – {drawerContract.endDate}</p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_STYLES[drawerContract.status] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {drawerContract.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 border-t border-slate-200 px-5 py-4">
                  <button
                    onClick={() => void handleRecognize(drawerContract.id)}
                    disabled={drawerContract.status !== 'Active' || drawerContract.remaining <= 0 || recognizingId === drawerContract.id}
                    className="flex-1 rounded-lg border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                  >
                    Recognize Now
                  </button>
                  <button
                    onClick={() => setDrawerContract(null)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-xl bg-white border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-900">New Revenue Recognition Contract</h2>
              <button onClick={() => setShowCreate(false)} aria-label="Close" className="text-slate-500 hover:text-slate-700"><X size={18} /></button>
            </div>
            <div className="p-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-700">
                Contract ID (optional)
                <input
                  value={form.contractId}
                  onChange={(e) => setForm((cur) => ({ ...cur, contractId: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </label>
              <label className="text-sm text-slate-700">
                Method
                <select
                  value={form.method}
                  onChange={(e) => setForm((cur) => ({ ...cur, method: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  {methodOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="sm:col-span-2 text-sm text-slate-700">
                Description
                <input
                  value={form.description}
                  onChange={(e) => setForm((cur) => ({ ...cur, description: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </label>
              <label className="text-sm text-slate-700">
                Total Contract Value
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.totalContractValue}
                  onChange={(e) => setForm((cur) => ({ ...cur, totalContractValue: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </label>
              <label className="text-sm text-slate-700">
                Start Date
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((cur) => ({ ...cur, startDate: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </label>
              <label className="text-sm text-slate-700">
                End Date
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((cur) => ({ ...cur, endDate: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <button onClick={() => setShowCreate(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreate} disabled={creating} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                {creating ? 'Creating…' : 'Create Contract'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
