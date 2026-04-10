'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'

type CaseStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed'
type CasePriority = 'Low' | 'Medium' | 'High'

type CaseRow = {
  id: string
  caseNumber: string
  customer: string
  amount: number
  ageDays: number
  collector: string
  priority: CasePriority
  status: CaseStatus
  notes?: string
}

const STATUS_TABS: { value: CaseStatus | 'All'; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Open', label: 'Open' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Closed', label: 'Closed' },
]

const PRIORITY_COLOR: Record<CasePriority, string> = {
  Low: 'text-slate-500 bg-slate-100',
  Medium: 'text-amber-700 bg-amber-100',
  High: 'text-rose-700 bg-rose-100',
}

const STATUS_COLOR: Record<CaseStatus, string> = {
  Open: 'text-emerald-700',
  'In Progress': 'text-amber-700',
  Resolved: 'text-blue-700',
  Closed: 'text-slate-500',
}

export default function CollectionsCenterPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [items, setItems] = useState<CaseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState<CaseStatus | 'All'>('All')
  const [helpOpen, setHelpOpen] = useState(false)
  const [newCaseOpen, setNewCaseOpen] = useState(false)

  // New Case form state
  const [nc, setNc] = useState({ customer: '', amount: '', priority: 'Medium' as CasePriority, collector: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/collections`)
      const raw = Array.isArray(data) ? data : data?.items || data?.records || []
      setItems(raw.map((r: any) => ({
        id: r.id,
        caseNumber: r.caseNumber || r.case_number || `COL-${r.id}`,
        customer: r.customer || r.customerName || r.contact || '',
        amount: Number(r.amount || r.balance || 0),
        ageDays: Number(r.ageDays || r.age_days || 0),
        collector: r.collector || r.assignedTo || r.assigned_to || '',
        priority: r.priority || 'Medium',
        status: r.status || 'Open',
        notes: r.notes || '',
      })))
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load collections data')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchData() }, [fetchData])

  const summary = useMemo(() => {
    const total = items.reduce((s, r) => s + r.amount, 0)
    const inCollection = items.filter(r => r.status === 'Open' || r.status === 'In Progress').length
    const resolved = items.filter(r => r.status === 'Resolved').length
    const high = items.filter(r => r.priority === 'High').length
    return [
      { label: 'Total Outstanding', value: fmt(total) },
      { label: 'In Collection', value: String(inCollection) },
      { label: 'Resolved', value: String(resolved) },
      { label: 'High Priority', value: String(high) },
    ]
  }, [items, fmt])

  const filtered = useMemo(() => {
    let rows = items
    if (statusTab !== 'All') rows = rows.filter(r => r.status === statusTab)
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(r =>
        r.caseNumber.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.collector.toLowerCase().includes(q)
      )
    }
    return rows
  }, [items, statusTab, search])

  async function submitNewCase(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId) return
    setSaving(true)
    setSaveError('')
    try {
      await apiClient.post(`/companies/${companyId}/ar/collections`, {
        customer: nc.customer,
        amount: parseFloat(nc.amount),
        priority: nc.priority,
        collector: nc.collector,
        notes: nc.notes,
      })
      setNewCaseOpen(false)
      setNc({ customer: '', amount: '', priority: 'Medium', collector: '', notes: '' })
      fetchData()
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Failed to create case')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Collections Center</h1>
            <p className="text-sm text-slate-500 mt-1">Centralized workflow for collections activities</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNewCaseOpen(true)}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              New Collection Case
            </button>
            <button
              onClick={() => setHelpOpen(cur => !cur)}
              type="button"
              aria-label="Open documentation for Collections Center"
              className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold"
            >
              ?
            </button>
          </div>
        </div>

        {/* Summary cards */}
        {!loading && !error && (
          <div className="px-6 pb-4 grid gap-3 sm:grid-cols-4">
            {summary.map((item) => (
              <div key={item.label} className="bg-white rounded-lg border border-slate-200 p-3">
                <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                <p className="text-lg font-bold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Status tabs + search */}
        <div className="px-6 pb-3 flex flex-wrap items-center gap-3">
          <div className="flex gap-1">
            {STATUS_TABS.map(t => (
              <button
                key={t.value}
                onClick={() => setStatusTab(t.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  statusTab === t.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            placeholder="Search by case #, customer, collector…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-72"
          />
        </div>
      </div>

      {/* Table */}
      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left px-4 py-3">Case #</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Age</th>
                <th className="text-left px-4 py-3">Collector</th>
                <th className="text-left px-4 py-3">Priority</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
                    Loading…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <p className="text-rose-500 font-medium">{error}</p>
                    <button onClick={fetchData} className="mt-2 text-sm text-emerald-600 hover:underline">Try again</button>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">No collection cases found.</td>
                </tr>
              ) : (
                filtered.map(row => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.caseNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{row.customer}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700 font-medium">{fmt(row.amount)}</td>
                    <td className="px-4 py-3 text-slate-600">{row.ageDays}d</td>
                    <td className="px-4 py-3 text-slate-600">{row.collector}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_COLOR[row.priority]}`}>
                        {row.priority}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold ${STATUS_COLOR[row.status]}`}>
                      {row.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Case Modal */}
      {newCaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">New Collection Case</h2>
              <button onClick={() => setNewCaseOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <form onSubmit={submitNewCase} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer *</label>
                <input
                  required
                  value={nc.customer}
                  onChange={e => setNc(p => ({ ...p, customer: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={nc.amount}
                  onChange={e => setNc(p => ({ ...p, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={nc.priority}
                    onChange={e => setNc(p => ({ ...p, priority: e.target.value as CasePriority }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
                  <input
                    value={nc.collector}
                    onChange={e => setNc(p => ({ ...p, collector: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="Collector name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={nc.notes}
                  onChange={e => setNc(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                  placeholder="Collection notes…"
                />
              </div>
              {saveError && <p className="text-sm text-rose-500">{saveError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setNewCaseOpen(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60">
                  {saving ? 'Saving…' : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">Collections Center Documentation</h2>
              <button onClick={() => setHelpOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-4 text-sm text-slate-700 space-y-3">
              <p>Centralize and coordinate collections activities across team cases.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create, assign, and track collection case workflows.</li>
                <li>Prioritize high-risk accounts and overdue balances.</li>
                <li>Manage status transitions and record collector actions.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
