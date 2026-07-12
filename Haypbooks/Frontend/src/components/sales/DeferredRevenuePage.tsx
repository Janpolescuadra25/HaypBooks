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

interface DeferredRevenueRow {
  id: string
  contractId: string
  customer: string
  description: string
  totalDeferredAmount: number
  recognizedAmount: number
  remainingDeferred: number
  startDate: string
  endDate: string
  nextRecognitionDate: string
  journalEntryId?: string | null
  frequency: 'Monthly' | 'Quarterly' | 'Annual' | 'One-Time'
  status: 'Active' | 'Completed' | 'Cancelled'
  [key: string]: any
}

interface NewDeferredForm {
  contractId: string
  description: string
  totalDeferredAmount: string
  startDate: string
  endDate: string
  frequency: string
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
  Cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
}

const statusFilters: HaypFilterOption[] = [
  { value: 'ALL', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
]

const frequencyOptions = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUAL', label: 'Annual' },
  { value: 'ONE_TIME', label: 'One-Time' },
]

const defaultFormData: NewDeferredForm = {
  contractId: '',
  description: '',
  totalDeferredAmount: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  frequency: 'MONTHLY',
}

export default function DeferredRevenuePage() {
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [items, setItems] = useState<DeferredRevenueRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [recognizing, setRecognizing] = useState(false)
  const [recognizingId, setRecognizingId] = useState<string | null>(null)
  const [drawerSchedule, setDrawerSchedule] = useState<DeferredRevenueRow | null>(null)
  const [drawerTab, setDrawerTab] = useState<'details' | 'activity'>('details')
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [form, setForm] = useState<NewDeferredForm>(defaultFormData)

  const fetchItems = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const response = await salesService.listDeferredRevenue(companyId)
      const data = response.data
      setItems(Array.isArray(data) ? data : data?.items ?? data?.schedules ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load deferred revenue schedules')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const activeCount = useMemo(() => items.filter((r) => r.status === 'Active').length, [items])
  const completedCount = useMemo(() => items.filter((r) => r.status === 'Completed').length, [items])
  const totalDeferred = useMemo(
    () => items.filter((r) => r.status === 'Active').reduce((sum, row) => sum + Number(row.remainingDeferred ?? 0), 0),
    [items],
  )
  const totalRecognized = useMemo(
    () => items.reduce((sum, row) => sum + Number(row.recognizedAmount ?? 0), 0),
    [items],
  )

  const handleRecognize = useCallback(async (id: string) => {
    if (!companyId || recognizingId) return
    setRecognizingId(id)
    try {
      await salesService.recognizeDeferredRevenue(companyId, id)
      toast.success('Deferred revenue recognized')
      await fetchItems()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Recognition failed')
    } finally {
      setRecognizingId(null)
    }
  }, [companyId, fetchItems, recognizingId, toast])

  const handleBatchRecognize = useCallback(async () => {
    if (!companyId) return
    const activeRows = items.filter((row) => row.status === 'Active' && row.remainingDeferred > 0)
    if (!activeRows.length) return

    setRecognizing(true)
    try {
      await Promise.all(activeRows.map((row) => salesService.recognizeDeferredRevenue(companyId, row.id)))
      toast.success('Deferred revenue recognition completed')
      await fetchItems()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Batch recognition failed')
    } finally {
      setRecognizing(false)
    }
  }, [companyId, fetchItems, items, toast])

  const handleCreate = useCallback(async () => {
    if (!companyId) return
    const total = Number(form.totalDeferredAmount)
    if (!form.description.trim()) {
      toast.error('Description is required')
      return
    }
    if (!Number.isFinite(total) || total <= 0) {
      toast.error('Total deferred amount must be greater than 0')
      return
    }

    setCreating(true)
    try {
      await salesService.createDeferredRevenue(companyId, {
        contractId: form.contractId || undefined,
        description: form.description,
        totalDeferredAmount: total,
        startDate: form.startDate,
        endDate: form.endDate,
        frequency: form.frequency,
      })
      toast.success('Schedule created')
      setShowCreate(false)
      setForm(defaultFormData)
      await fetchItems()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create schedule')
    } finally {
      setCreating(false)
    }
  }, [companyId, form, fetchItems, toast])

  const loadActivity = useCallback(async (scheduleId: string) => {
    if (!companyId) return
    setActivityLoading(true)
    try {
      const response = await salesService.getDeferredRevenueActivity(companyId, scheduleId)
      const data = response.data
      setActivity(Array.isArray(data) ? data : data?.items ?? data?.data ?? [])
    } catch {
      setActivity([])
    } finally {
      setActivityLoading(false)
    }
  }, [companyId])

  const columns = useMemo<HaypColumn<DeferredRevenueRow>[]>(() => [
    { id: 'contractId', header: 'Contract ID', accessorKey: 'contractId', size: 120, render: (value) => <span className="font-medium">{value}</span> },
    { id: 'customer', header: 'Customer', accessorKey: 'customer', size: 160 },
    { id: 'description', header: 'Description', accessorKey: 'description', size: 180, render: (value) => <span className="truncate max-w-[180px] block">{value}</span> },
    { id: 'frequency', header: 'Frequency', accessorKey: 'frequency', size: 110 },
    { id: 'totalDeferredAmount', header: 'Total Deferred', accessorKey: 'totalDeferredAmount', size: 140, align: 'right', render: (value) => <span className="font-semibold">{formatCurrency(Number(value), currency)}</span> },
    { id: 'recognizedAmount', header: 'Recognized', accessorKey: 'recognizedAmount', size: 120, align: 'right', render: (_value, row) => {
      const pct = row.totalDeferredAmount > 0 ? Math.round((row.recognizedAmount / row.totalDeferredAmount) * 100) : 0
      return (
        <div>
          <div className="font-semibold">{formatCurrency(row.recognizedAmount, currency)}</div>
          <div className="text-xs text-slate-400">{pct}%</div>
        </div>
      )
    } },
    { id: 'remainingDeferred', header: 'Remaining', accessorKey: 'remainingDeferred', size: 120, align: 'right', render: (value) => <span className="font-semibold text-amber-700">{formatCurrency(Number(value), currency)}</span> },
    { id: 'nextRecognitionDate', header: 'Next Recognition', accessorKey: 'nextRecognitionDate', size: 140 },
    { id: 'status', header: 'Status', accessorKey: 'status', size: 100, render: (value) => <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_STYLES[value] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>{value}</span> },
  ], [currency])

  const actions = useMemo<HaypActionItem[]>(() => [
    { label: 'Recognize', icon: <RotateCcw size={14} />, show: (row) => row.status === 'Active' && row.remainingDeferred > 0, onClick: (_rowId, row) => { void handleRecognize(row.id) } },
  ], [handleRecognize])

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={fetchItems} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700">
        <RefreshCw size={14} /> Refresh
      </button>
      <button type="button" onClick={handleBatchRecognize} disabled={recognizing || loading} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
        {recognizing ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Process Recognition
      </button>
      <button type="button" onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">
        <Plus size={14} /> New Schedule
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
              <p className="text-xs text-slate-500 uppercase tracking-wide">Active Schedules</p>
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
              <p className="text-xs text-slate-500 uppercase tracking-wide">Total Deferred (Active)</p>
              <p className="text-xl font-bold mt-1 text-emerald-700">{formatCurrency(totalDeferred, currency)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3 text-slate-900">
            <TrendingUp size={16} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Total Recognized</p>
              <p className="text-xl font-bold mt-1 text-emerald-700">{formatCurrency(totalRecognized, currency)}</p>
            </div>
          </div>
        </div>
      </div>

      <HaypDataTable
        data={items}
        columns={columns}
        tableId="deferred-revenue"
        title="Deferred Revenue"
        description="Track unearned revenue and recognition schedules"
        loading={loading || cidLoading}
        searchPlaceholder="Search deferred revenue..."
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        filters={statusFilters}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        primaryAction={
          <button
            type="button"
            onClick={handleBatchRecognize}
            disabled={recognizing || loading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {recognizing ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Process Recognition
          </button>
        }
        actions={actions}
        onRowClick={(row) => setDrawerSchedule(row)}
        onRefresh={fetchItems}
        emptyTitle="No deferred revenue schedules found"
        emptySubtitle="Create a schedule to begin tracking deferred revenue"
      />

      {drawerSchedule && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setDrawerSchedule(null)} />
          <div className="flex w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{drawerSchedule.contractId || 'Deferred Revenue Schedule'}</h2>
                <p className="mt-0.5 text-sm text-slate-500">{drawerSchedule.customer}</p>
              </div>
              <button onClick={() => setDrawerSchedule(null)} aria-label="Close" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="flex border-b border-slate-200 bg-slate-50 px-5">
              {(['details', 'activity'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setDrawerTab(tab)
                    if (tab === 'activity' && activity.length === 0) {
                      loadActivity(drawerSchedule.id)
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
                      <p className="font-semibold text-slate-800">{drawerSchedule.description}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Frequency</p>
                      <p className="font-semibold text-slate-800">{drawerSchedule.frequency}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Total Deferred</p>
                      <p className="font-semibold text-slate-800">{formatCurrency(drawerSchedule.totalDeferredAmount, currency)}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Recognized</p>
                      <p className="font-semibold text-emerald-700">{formatCurrency(drawerSchedule.recognizedAmount, currency)}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Remaining</p>
                      <p className="font-bold text-xl text-amber-700">{formatCurrency(drawerSchedule.remainingDeferred, currency)}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Next Recognition</p>
                      <p className="font-semibold text-slate-800">{drawerSchedule.nextRecognitionDate}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Start Date</p>
                      <p className="font-semibold text-slate-800">{drawerSchedule.startDate}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">End Date</p>
                      <p className="font-semibold text-slate-800">{drawerSchedule.endDate}</p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_STYLES[drawerSchedule.status] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {drawerSchedule.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 border-t border-slate-200 px-5 py-4">
                  <button
                    onClick={() => void handleRecognize(drawerSchedule.id)}
                    disabled={drawerSchedule.status !== 'Active' || drawerSchedule.remainingDeferred <= 0 || recognizingId === drawerSchedule.id}
                    className="flex-1 rounded-lg border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                  >
                    Recognize Now
                  </button>
                  <button
                    onClick={() => setDrawerSchedule(null)}
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
              <h2 className="text-lg font-semibold text-slate-900">New Deferred Revenue Schedule</h2>
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
                Frequency
                <select
                  value={form.frequency}
                  onChange={(e) => setForm((cur) => ({ ...cur, frequency: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  {frequencyOptions.map((option) => (
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
                Total Deferred Amount
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.totalDeferredAmount}
                  onChange={(e) => setForm((cur) => ({ ...cur, totalDeferredAmount: e.target.value }))}
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
                {creating ? 'Creating…' : 'Create Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
