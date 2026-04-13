'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { ArrowUpDown } from 'lucide-react'

type DeferredRevenueRow = {
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
}

type NewDeferredForm = {
  contractId: string
  description: string
  totalDeferredAmount: string
  startDate: string
  endDate: string
  frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'ONE_TIME'
}

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Completed: 'bg-blue-50 text-blue-700 border-blue-200',
  Cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
}

function dateISO(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}

type DeferredSortKey = 'contractId' | 'customer' | 'description' | 'frequency' | 'totalDeferredAmount' | 'recognizedAmount' | 'remainingDeferred' | 'nextRecognitionDate' | 'status'
type DeferredSortDir = 'asc' | 'desc'

function compareDeferredRevenue(a: DeferredRevenueRow, b: DeferredRevenueRow, key: DeferredSortKey, dir: DeferredSortDir): number {
  if (key === 'totalDeferredAmount' || key === 'recognizedAmount' || key === 'remainingDeferred') {
    const av = a[key] ?? 0; const bv = b[key] ?? 0
    return dir === 'asc' ? av - bv : bv - av
  }
  if (key === 'nextRecognitionDate') {
    const av = new Date(a[key] ?? '').getTime() || 0; const bv = new Date(b[key] ?? '').getTime() || 0
    return dir === 'asc' ? av - bv : bv - av
  }
  const as = String(a[key] ?? '').toLowerCase(); const bs = String(b[key] ?? '').toLowerCase()
  return dir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as)
}

export default function DeferredRevenuePage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [items, setItems] = useState<DeferredRevenueRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<DeferredSortKey>('contractId')
  const [sortDir, setSortDir] = useState<DeferredSortDir>('asc')
  const toggleSort = (key: DeferredSortKey) => {
    if (sortKey === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc') }
    else { setSortKey(key); setSortDir(key === 'totalDeferredAmount' || key === 'recognizedAmount' || key === 'remainingDeferred' ? 'desc' : 'asc') }
  }
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [recognizing, setRecognizing] = useState(false)
  const [recognizingId, setRecognizingId] = useState<string | null>(null)
  const [form, setForm] = useState<NewDeferredForm>({
    contractId: '',
    description: '',
    totalDeferredAmount: '',
    startDate: dateISO(0),
    endDate: dateISO(30),
    frequency: 'MONTHLY',
  })

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/deferred-revenue`)
      setItems(Array.isArray(data) ? data : data?.items ?? data?.schedules ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load deferred revenue data')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchData() }, [fetchData])

  const recognizeOne = useCallback(async (id: string) => {
    if (!companyId) return
    setRecognizingId(id)
    setError('')
    try {
      await apiClient.post(`/companies/${companyId}/deferred-revenue/${id}/recognize`, {})
      await fetchData()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to process deferred revenue recognition')
    } finally {
      setRecognizingId(null)
    }
  }, [companyId, fetchData])

  const processRecognition = useCallback(async () => {
    if (!companyId) return
    const activeRows = items.filter((row) => row.status === 'Active' && row.remainingDeferred > 0)
    if (!activeRows.length) return

    setRecognizing(true)
    setError('')
    try {
      await Promise.all(activeRows.map((row) => apiClient.post(`/companies/${companyId}/deferred-revenue/${row.id}/recognize`, {})))
      await fetchData()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to process deferred revenue')
    } finally {
      setRecognizing(false)
    }
  }, [companyId, items, fetchData])

  const createSchedule = useCallback(async () => {
    if (!companyId) return
    const total = Number(form.totalDeferredAmount)
    if (!Number.isFinite(total) || total <= 0) {
      setError('Enter a valid deferred amount greater than 0')
      return
    }
    if (!form.description.trim()) {
      setError('Description is required')
      return
    }

    setSaving(true)
    setError('')
    try {
      await apiClient.post(`/companies/${companyId}/deferred-revenue`, {
        contractId: form.contractId || undefined,
        description: form.description,
        totalDeferredAmount: total,
        startDate: form.startDate,
        endDate: form.endDate,
        frequency: form.frequency,
      })
      setShowCreate(false)
      setForm({
        contractId: '',
        description: '',
        totalDeferredAmount: '',
        startDate: dateISO(0),
        endDate: dateISO(30),
        frequency: 'MONTHLY',
      })
      await fetchData()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create deferred revenue schedule')
    } finally {
      setSaving(false)
    }
  }, [companyId, form, fetchData])

  const filtered = useMemo(() => {
    let list = items
    if (statusFilter !== 'ALL') list = list.filter((r) => r.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((r) =>
        r.contractId?.toLowerCase().includes(q) ||
        r.customer?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      )
    }
    return list
  }, [items, search, statusFilter])

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => compareDeferredRevenue(a, b, sortKey, sortDir)),
    [filtered, sortKey, sortDir]
  )

  const totalDeferred = useMemo(() => items.filter((r) => r.status === 'Active').reduce((s, r) => s + (r.remainingDeferred ?? 0), 0), [items])
  const totalRecognized = useMemo(() => items.reduce((s, r) => s + (r.recognizedAmount ?? 0), 0), [items])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Deferred Revenue</h1>
            <p className="text-sm text-slate-500 mt-1">Track unearned revenue and recognition schedules</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={processRecognition}
              disabled={recognizing || loading || !items.some((row) => row.status === 'Active' && row.remainingDeferred > 0)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {recognizing ? 'Processing…' : 'Process Recognition'}
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              New Schedule
            </button>
          </div>
        </div>

        {/* Status filters */}
        <div className="px-6 pb-3 flex gap-2 flex-wrap">
          {(['ALL', 'Active', 'Completed', 'Cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                statusFilter === s
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400'
              }`}
            >
              {s === 'ALL' ? 'All' : s}
              {s !== 'ALL' && (
                <span className="ml-1 opacity-70">({items.filter((r) => r.status === s).length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-6 pb-4">
          <input
            placeholder="Search by contract ID, customer, or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Schedules', value: items.filter((r) => r.status === 'Active').length },
            { label: 'Completed', value: items.filter((r) => r.status === 'Completed').length },
            { label: 'Total Deferred (Active)', value: formatCurrency(totalDeferred, currency), isAmount: true },
            { label: 'Total Recognized', value: formatCurrency(totalRecognized, currency), isAmount: true },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">{c.label}</p>
              <p className={`text-xl font-bold mt-1 ${c.isAmount ? 'text-emerald-700' : 'text-slate-900'}`}>
                {c.value}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading || companyLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
              Loading deferred revenue schedules…
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <p className="text-red-600 text-sm">{error}</p>
              <button onClick={fetchData} className="text-sm text-emerald-600 hover:underline">Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <p className="text-sm">No deferred revenue schedules found</p>
              {search && (
                <button onClick={() => setSearch('')} className="text-xs text-emerald-600 hover:underline">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap border-r border-slate-200"><button onClick={() => toggleSort('contractId')} className="flex items-center gap-1"><span>Contract ID</span><ArrowUpDown size={10} className={sortKey === 'contractId' ? 'text-emerald-600' : 'text-slate-300'} /></button></th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap border-r border-slate-200"><button onClick={() => toggleSort('customer')} className="flex items-center gap-1"><span>Customer</span><ArrowUpDown size={10} className={sortKey === 'customer' ? 'text-emerald-600' : 'text-slate-300'} /></button></th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap border-r border-slate-200"><button onClick={() => toggleSort('description')} className="flex items-center gap-1"><span>Description</span><ArrowUpDown size={10} className={sortKey === 'description' ? 'text-emerald-600' : 'text-slate-300'} /></button></th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap border-r border-slate-200"><button onClick={() => toggleSort('frequency')} className="flex items-center gap-1"><span>Frequency</span><ArrowUpDown size={10} className={sortKey === 'frequency' ? 'text-emerald-600' : 'text-slate-300'} /></button></th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap border-r border-slate-200"><button onClick={() => toggleSort('totalDeferredAmount')} className="flex items-center gap-1"><span>Total Deferred</span><ArrowUpDown size={10} className={sortKey === 'totalDeferredAmount' ? 'text-emerald-600' : 'text-slate-300'} /></button></th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap border-r border-slate-200"><button onClick={() => toggleSort('recognizedAmount')} className="flex items-center gap-1"><span>Recognized</span><ArrowUpDown size={10} className={sortKey === 'recognizedAmount' ? 'text-emerald-600' : 'text-slate-300'} /></button></th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap border-r border-slate-200"><button onClick={() => toggleSort('remainingDeferred')} className="flex items-center gap-1"><span>Remaining</span><ArrowUpDown size={10} className={sortKey === 'remainingDeferred' ? 'text-emerald-600' : 'text-slate-300'} /></button></th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap border-r border-slate-200"><button onClick={() => toggleSort('nextRecognitionDate')} className="flex items-center gap-1"><span>Next Recognition</span><ArrowUpDown size={10} className={sortKey === 'nextRecognitionDate' ? 'text-emerald-600' : 'text-slate-300'} /></button></th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap border-r border-slate-200"><button onClick={() => toggleSort('status')} className="flex items-center gap-1"><span>Status</span><ArrowUpDown size={10} className={sortKey === 'status' ? 'text-emerald-600' : 'text-slate-300'} /></button></th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sorted.map((row) => {
                    const pct = row.totalDeferredAmount > 0
                      ? Math.round((row.recognizedAmount / row.totalDeferredAmount) * 100)
                      : 0
                    return (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800 border-r border-slate-100">{row.contractId}</td>
                        <td className="px-4 py-3 text-slate-700 border-r border-slate-100">{row.customer}</td>
                        <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate border-r border-slate-100">{row.description}</td>
                        <td className="px-4 py-3 text-slate-600 border-r border-slate-100">{row.frequency}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800 border-r border-slate-100">{formatCurrency(row.totalDeferredAmount, currency)}</td>
                        <td className="px-4 py-3 border-r border-slate-100">
                          <div className="flex flex-col gap-1">
                            <span className="text-emerald-700 font-semibold">{formatCurrency(row.recognizedAmount, currency)}</span>
                            <span className="text-xs text-slate-400">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-amber-700 border-r border-slate-100">{formatCurrency(row.remainingDeferred, currency)}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap border-r border-slate-100">{row.nextRecognitionDate}</td>
                        <td className="px-4 py-3 border-r border-slate-100">
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_STYLES[row.status] ?? ''}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => recognizeOne(row.id)}
                            disabled={row.status !== 'Active' || row.remainingDeferred <= 0 || recognizingId === row.id}
                            className="px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-300 rounded-md hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {recognizingId === row.id ? 'Processing…' : 'Recognize'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-xl border border-slate-200 shadow-xl">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">New Deferred Revenue Schedule</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-slate-700">Close</button>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-sm text-slate-700">
                Contract ID (optional)
                <input
                  value={form.contractId}
                  onChange={(e) => setForm((cur) => ({ ...cur, contractId: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </label>
              <label className="text-sm text-slate-700">
                Frequency
                <select
                  value={form.frequency}
                  onChange={(e) => setForm((cur) => ({ ...cur, frequency: e.target.value as NewDeferredForm['frequency'] }))}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUAL">Annual</option>
                  <option value="ONE_TIME">One-Time</option>
                </select>
              </label>
              <label className="text-sm text-slate-700 sm:col-span-2">
                Description
                <input
                  value={form.description}
                  onChange={(e) => setForm((cur) => ({ ...cur, description: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
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
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </label>
              <div />
              <label className="text-sm text-slate-700">
                Start Date
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((cur) => ({ ...cur, startDate: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </label>
              <label className="text-sm text-slate-700">
                End Date
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((cur) => ({ ...cur, endDate: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </label>
            </div>
            <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700">Cancel</button>
              <button
                onClick={createSchedule}
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Create Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
