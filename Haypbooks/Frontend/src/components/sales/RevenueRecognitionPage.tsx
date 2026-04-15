'use client'

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { useFixedWidthResizableColumns } from '@/hooks/useFixedWidthTableResize'
import { ArrowUpDown, Clock, X } from 'lucide-react'

type RecognitionRow = {
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
}

type NewRecognitionForm = {
  contractId: string
  description: string
  totalContractValue: string
  startDate: string
  endDate: string
  method: 'STRAIGHT_LINE' | 'MILESTONE' | 'PERCENTAGE_OF_COMPLETION' | 'EVENT_BASED'
}

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Completed: 'bg-blue-50 text-blue-700 border-blue-200',
  'On Hold': 'bg-amber-50 text-amber-700 border-amber-200',
}

const METHOD_OPTIONS: Array<{ value: NewRecognitionForm['method']; label: RecognitionRow['method'] }> = [
  { value: 'STRAIGHT_LINE', label: 'Straight-Line' },
  { value: 'MILESTONE', label: 'Milestone' },
  { value: 'PERCENTAGE_OF_COMPLETION', label: 'Percentage of Completion' },
  { value: 'EVENT_BASED', label: 'Event-Based' },
]

function dateISO(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}

type RevRecSortKey = 'contractId' | 'customer' | 'description' | 'method' | 'totalContractValue' | 'recognizedToDate' | 'remaining' | 'status'
type RevRecSortDir = 'asc' | 'desc'

function compareRecognition(a: RecognitionRow, b: RecognitionRow, key: RevRecSortKey, dir: RevRecSortDir): number {
  if (key === 'totalContractValue' || key === 'recognizedToDate' || key === 'remaining') {
    const av = a[key] ?? 0; const bv = b[key] ?? 0
    return dir === 'asc' ? av - bv : bv - av
  }
  const as = String(a[key] ?? '').toLowerCase(); const bs = String(b[key] ?? '').toLowerCase()
  return dir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as)
}

interface RevRecColDef { key: string; label: string; visible: boolean; width: number; align?: 'left' | 'right' }
const DEFAULT_REVREC_COLS: RevRecColDef[] = [
  { key: 'contractId', label: 'Contract ID', visible: true, width: 120, align: 'left' },
  { key: 'customer', label: 'Customer', visible: true, width: 160, align: 'left' },
  { key: 'description', label: 'Description', visible: true, width: 180, align: 'left' },
  { key: 'method', label: 'Method', visible: true, width: 130, align: 'left' },
  { key: 'totalContractValue', label: 'Total Value', visible: true, width: 130, align: 'right' },
  { key: 'recognizedToDate', label: 'Recognized', visible: true, width: 120, align: 'right' },
  { key: 'remaining', label: 'Remaining', visible: true, width: 110, align: 'right' },
  { key: 'status', label: 'Status', visible: true, width: 100, align: 'left' },
]
function loadRevRecCols(): RevRecColDef[] {
  try {
    const s = localStorage.getItem('revrec-cols-v1')
    if (s) {
      const saved = JSON.parse(s) as RevRecColDef[]
      return DEFAULT_REVREC_COLS.map(d => { const sc = saved.find(c => c.key === d.key); return sc ? { ...d, width: sc.width } : d })
    }
  } catch { /* ignore */ }
  return DEFAULT_REVREC_COLS
}

export default function RevenueRecognitionPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [items, setItems] = useState<RecognitionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<RevRecSortKey>('contractId')
  const [sortDir, setSortDir] = useState<RevRecSortDir>('asc')
  const toggleSort = (key: RevRecSortKey) => {
    if (sortKey === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc') }
    else { setSortKey(key); setSortDir(key === 'totalContractValue' || key === 'recognizedToDate' || key === 'remaining' ? 'desc' : 'asc') }
  }
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [recognizing, setRecognizing] = useState(false)
  const [recognizingId, setRecognizingId] = useState<string | null>(null)
  const [drawerContract, setDrawerContract] = useState<RecognitionRow | null>(null)
  const [drawerTab, setDrawerTab] = useState<'details' | 'activity'>('details')
  const [recognitionActivity, setRecognitionActivity] = useState<any[]>([])
  const [recognitionActivityLoading, setRecognitionActivityLoading] = useState(false)
  const [form, setForm] = useState<NewRecognitionForm>({
    contractId: '',
    description: '',
    totalContractValue: '',
    startDate: dateISO(0),
    endDate: dateISO(30),
    method: 'STRAIGHT_LINE',
  })

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/revenue-recognition`)
      setItems(Array.isArray(data) ? data : data?.items ?? data?.contracts ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load revenue recognition data')
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
      await apiClient.post(`/companies/${companyId}/revenue-recognition/${id}/recognize`, {})
      await fetchData()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to process recognition')
    } finally {
      setRecognizingId(null)
    }
  }, [companyId, fetchData])

  const recognizeBatch = useCallback(async () => {
    if (!companyId) return
    const activeRows = items.filter((row) => row.status === 'Active' && row.remaining > 0)
    if (!activeRows.length) return

    setRecognizing(true)
    setError('')
    try {
      await Promise.all(activeRows.map((row) => apiClient.post(`/companies/${companyId}/revenue-recognition/${row.id}/recognize`, {})))
      await fetchData()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to run batch recognition')
    } finally {
      setRecognizing(false)
    }
  }, [companyId, items, fetchData])

  const createContract = useCallback(async () => {
    if (!companyId) return
    const total = Number(form.totalContractValue)
    if (!Number.isFinite(total) || total <= 0) {
      setError('Enter a valid contract value greater than 0')
      return
    }
    if (!form.description.trim()) {
      setError('Description is required')
      return
    }

    setSaving(true)
    setError('')
    try {
      await apiClient.post(`/companies/${companyId}/revenue-recognition`, {
        contractId: form.contractId || undefined,
        description: form.description,
        totalContractValue: total,
        startDate: form.startDate,
        endDate: form.endDate,
        method: form.method,
      })
      setShowCreate(false)
      setForm({
        contractId: '',
        description: '',
        totalContractValue: '',
        startDate: dateISO(0),
        endDate: dateISO(30),
        method: 'STRAIGHT_LINE',
      })
      await fetchData()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create revenue recognition contract')
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
    () => [...filtered].sort((a, b) => compareRecognition(a, b, sortKey, sortDir)),
    [filtered, sortKey, sortDir]
  )
  const [revRecCols, setRevRecCols] = useState<RevRecColDef[]>(() => loadRevRecCols())
  const revRecColsRef = useRef(revRecCols)
  useEffect(() => { revRecColsRef.current = revRecCols }, [revRecCols])
  const saveRevRecCols = (next: RevRecColDef[]) => { setRevRecCols(next); try { localStorage.setItem('revrec-cols-v1', JSON.stringify(next)) } catch { /* ignore */ } }
  const { containerRef, startResize: startRevRecResize, isOverflowing: revRecIsOverflowing } = useFixedWidthResizableColumns({
    columns: revRecCols,
    columnsRef: revRecColsRef,
    saveColumns: saveRevRecCols,
    fixedWidth: 190,
  })

  const openDrawer = (row: RecognitionRow) => {
    setDrawerContract(row)
    setDrawerTab('details')
    setRecognitionActivity([])
  }

  const loadRecognitionActivity = useCallback(async (contractId: string) => {
    if (!companyId) return
    setRecognitionActivityLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/revenue-recognition/${contractId}/activity`)
      setRecognitionActivity(Array.isArray(data) ? data : data?.data ?? data?.items ?? [])
    } catch {
      setRecognitionActivity([])
    } finally {
      setRecognitionActivityLoading(false)
    }
  }, [companyId])

  const totalRecognized = useMemo(() => filtered.reduce((s, r) => s + (r.recognizedToDate ?? 0), 0), [filtered])
  const totalRemaining = useMemo(() => filtered.reduce((s, r) => s + (r.remaining ?? 0), 0), [filtered])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Revenue Recognition</h1>
            <p className="text-sm text-slate-500 mt-1">Manage revenue recognition schedules (ASC 606 / IFRS 15)</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={recognizeBatch}
              disabled={recognizing || loading || !items.some((row) => row.status === 'Active' && row.remaining > 0)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {recognizing ? 'Running…' : 'Run Recognition'}
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              New Contract
            </button>
          </div>
        </div>

        {/* Status filters */}
        <div className="px-6 pb-3 flex gap-2 flex-wrap">
          {(['ALL', 'Active', 'Completed', 'On Hold'] as const).map((s) => (
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
            { label: 'Active Contracts', value: items.filter((r) => r.status === 'Active').length },
            { label: 'Completed', value: items.filter((r) => r.status === 'Completed').length },
            { label: 'Recognized to Date', value: formatCurrency(totalRecognized, currency), isAmount: true },
            { label: 'Remaining', value: formatCurrency(totalRemaining, currency), isAmount: true },
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
              Loading revenue recognition data…
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <p className="text-red-600 text-sm">{error}</p>
              <button onClick={fetchData} className="text-sm text-emerald-600 hover:underline">Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <p className="text-sm">No contracts found</p>
              {search && (
                <button onClick={() => setSearch('')} className="text-xs text-emerald-600 hover:underline">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div ref={containerRef} className={`${revRecIsOverflowing ? 'overflow-x-auto' : 'overflow-x-hidden'}`}>
              <table className="w-full text-sm" style={{ tableLayout: 'fixed', width: '100%' }}>
                <colgroup>
                  {revRecCols.map(c => <col key={c.key} style={{ width: c.width }} />)}
                  <col style={{ width: 110 }} />
                  <col style={{ width: 80 }} />
                </colgroup>
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {revRecCols.map(c => (
                      <th key={c.key} className="relative px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide select-none border-r border-slate-200 overflow-hidden" style={{ width: c.width, minWidth: c.width, maxWidth: c.width, textAlign: c.align === 'right' ? 'right' : 'left' }} title={c.label}>
                        <button onClick={() => toggleSort(c.key as RevRecSortKey)} className="flex items-center gap-1 w-full min-w-0 overflow-hidden pr-2" style={{ justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start' }}>
                          <span className="truncate">{c.label}</span><ArrowUpDown size={10} className={`shrink-0 ${sortKey === c.key ? 'text-emerald-600' : 'text-slate-300'}`} />
                        </button>
                        <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startRevRecResize(e, c.key)} />
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap border-r border-slate-200">Period</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sorted.map((row) => {
                    const pct = row.totalContractValue > 0
                      ? Math.round((row.recognizedToDate / row.totalContractValue) * 100)
                      : 0
                    return (
                      <tr key={row.id} onClick={() => openDrawer(row)} className="cursor-pointer transition-colors hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800 border-r border-slate-100">{row.contractId}</td>
                        <td className="px-4 py-3 text-slate-700 border-r border-slate-100">{row.customer}</td>
                        <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate border-r border-slate-100">{row.description}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap border-r border-slate-100">{row.method}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800 border-r border-slate-100">{formatCurrency(row.totalContractValue, currency)}</td>
                        <td className="px-4 py-3 border-r border-slate-100">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-emerald-700">{formatCurrency(row.recognizedToDate, currency)}</span>
                            <span className="text-xs text-slate-400">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 border-r border-slate-100">{formatCurrency(row.remaining, currency)}</td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs border-r border-slate-100">{row.startDate} – {row.endDate}</td>
                        <td className="px-4 py-3 border-r border-slate-100">
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_STYLES[row.status] ?? ''}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => recognizeOne(row.id)}
                            disabled={row.status !== 'Active' || row.remaining <= 0 || recognizingId === row.id}
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

        {drawerContract && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/30" onClick={() => setDrawerContract(null)} />
            <div className="flex w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{drawerContract.contractId || 'Recognition Contract'}</h2>
                  <p className="mt-0.5 text-sm text-slate-500">{drawerContract.customer}</p>
                </div>
                <button onClick={() => setDrawerContract(null)} title="Close details" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
              </div>
              <div className="flex border-b border-slate-200 bg-slate-50 px-5">
                {(['details', 'activity'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setDrawerTab(tab)
                      if (tab === 'activity' && recognitionActivity.length === 0) {
                        loadRecognitionActivity(drawerContract.id)
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
                  {recognitionActivityLoading ? (
                    <div className="flex justify-center py-8"><Clock size={18} className="animate-pulse text-slate-400" /></div>
                  ) : recognitionActivity.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">No activity recorded yet.</p>
                  ) : recognitionActivity.map((log: any) => (
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
                  <div className="flex-1 space-y-4 px-5 py-4">
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
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[drawerContract.status] ?? ''}`}>{drawerContract.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-slate-200 px-5 py-4">
                    <button
                      onClick={() => recognizeOne(drawerContract.id)}
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
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-xl border border-slate-200 shadow-xl">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">New Revenue Recognition Contract</h2>
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
                Method
                <select
                  value={form.method}
                  onChange={(e) => setForm((cur) => ({ ...cur, method: e.target.value as NewRecognitionForm['method'] }))}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {METHOD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
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
                Total Contract Value
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.totalContractValue}
                  onChange={(e) => setForm((cur) => ({ ...cur, totalContractValue: e.target.value }))}
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
                onClick={createContract}
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Create Contract'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
