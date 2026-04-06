'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Loader2, AlertCircle, Plus, Search, RefreshCw,
  Banknote, CheckCircle2, Clock, Ban, ExternalLink, X,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'

// ─── Types ────────────────────────────────────────────────────────────────────

type DepositStatus = 'DRAFT' | 'POSTED' | 'VOID'

interface BankAccount {
  id: string
  name: string
  accountNumber?: string
}

interface UndepositedPayment {
  id: string
  date: string
  customerName: string
  invoiceNumber?: string
  amount: number
  paymentMethod?: string
}

interface BankDeposit {
  id: string
  depositNumber?: string
  date: string
  bankAccountId: string
  bankAccountName?: string
  amount: number
  status: DepositStatus
  reference?: string
  memo?: string
  items?: UndepositedPayment[]
  journalEntryId?: string
}

const STATUS_META: Record<DepositStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  DRAFT:  { label: 'Draft',  cls: 'bg-amber-50 text-amber-700 border-amber-200',     icon: <Clock size={11} /> },
  POSTED: { label: 'Posted', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={11} /> },
  VOID:   { label: 'Void',   cls: 'bg-slate-100 text-slate-400 border-slate-200',    icon: <Ban size={11} /> },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BankDepositsPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const [deposits, setDeposits] = useState<BankDeposit[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [undepositedFunds, setUndepositedFunds] = useState<UndepositedPayment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<DepositStatus | 'ALL'>('ALL')
  const [selectedDeposit, setSelectedDeposit] = useState<BankDeposit | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [actionLoading, setActionLoading] = useState('')
  const [toast, setToast] = useState('')

  // Create form state
  const [form, setForm] = useState({
    bankAccountId: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    memo: '',
  })
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500) }

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const [depsRes, accsRes, fundsRes] = await Promise.allSettled([
        apiClient.get(`/companies/${companyId}/banking/deposits`),
        apiClient.get(`/companies/${companyId}/banking/accounts`),
        apiClient.get(`/companies/${companyId}/banking/undeposited-funds`),
      ])
      if (depsRes.status === 'fulfilled') {
        const d = depsRes.value.data
        setDeposits(Array.isArray(d) ? d : d.items ?? d.deposits ?? [])
      }
      if (accsRes.status === 'fulfilled') {
        const a = accsRes.value.data
        setBankAccounts(Array.isArray(a) ? a : a.accounts ?? [])
      }
      if (fundsRes.status === 'fulfilled') {
        const f = fundsRes.value.data
        setUndepositedFunds(Array.isArray(f) ? f : f.items ?? f.payments ?? [])
      }
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load deposits')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Filtering ─────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = deposits
    if (statusFilter !== 'ALL') list = list.filter(d => d.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(d =>
        (d.depositNumber ?? '').toLowerCase().includes(q) ||
        (d.bankAccountName ?? '').toLowerCase().includes(q) ||
        (d.reference ?? '').toLowerCase().includes(q) ||
        (d.memo ?? '').toLowerCase().includes(q),
      )
    }
    return list
  }, [deposits, statusFilter, search])

  const totalAmount = filtered.reduce((s, d) => s + d.amount, 0)
  const selectedPaymentTotal = undepositedFunds
    .filter(p => selectedPayments.has(p.id))
    .reduce((s, p) => s + p.amount, 0)

  // ── Actions ───────────────────────────────────────────────────────────────

  const openDetail = async (dep: BankDeposit) => {
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/banking/deposits/${dep.id}`)
      setSelectedDeposit(data)
    } catch {
      setSelectedDeposit(dep)
    }
  }

  const handlePost = async (depositId: string) => {
    setActionLoading(depositId)
    try {
      await apiClient.post(`/companies/${companyId}/banking/deposits/${depositId}/post`)
      showToast('Deposit posted to General Ledger')
      setSelectedDeposit(null)
      fetchAll()
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? 'Failed to post deposit')
    } finally {
      setActionLoading('')
    }
  }

  const handleVoid = async (depositId: string) => {
    if (!confirm('Void this deposit? This cannot be undone.')) return
    setActionLoading(depositId)
    try {
      await apiClient.post(`/companies/${companyId}/banking/deposits/${depositId}/void`)
      showToast('Deposit voided')
      setSelectedDeposit(null)
      fetchAll()
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? 'Failed to void deposit')
    } finally {
      setActionLoading('')
    }
  }

  const handleCreate = async () => {
    if (!form.bankAccountId) return
    setSubmitting(true)
    try {
      await apiClient.post(`/companies/${companyId}/banking/deposits`, {
        bankAccountId: form.bankAccountId,
        date: form.date,
        reference: form.reference || undefined,
        memo: form.memo || undefined,
        paymentIds: Array.from(selectedPayments),
      })
      showToast('Deposit created successfully')
      setShowCreateModal(false)
      setForm({ bankAccountId: '', date: new Date().toISOString().split('T')[0], reference: '', memo: '' })
      setSelectedPayments(new Set())
      fetchAll()
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? 'Failed to create deposit')
    } finally {
      setSubmitting(false)
    }
  }

  const togglePayment = (id: string) => {
    const next = new Set(selectedPayments)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelectedPayments(next)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (cidLoading) return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      <span className="ml-2 text-emerald-700">Loading…</span>
    </div>
  )
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  return (
    <div className="p-4 sm:p-6 space-y-4">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-emerald-700 text-white text-sm rounded-lg shadow-lg animate-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Banking & Cash</p>
          <h1 className="text-2xl font-bold text-slate-900">Bank Deposits</h1>
          <p className="text-sm text-slate-500 mt-0.5">Bundle received payments into bank deposits</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={fetchAll} title="Refresh"
            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus size={14} /> New Deposit
          </button>
        </div>
      </div>

      {/* ── Summary bar ── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2 bg-white rounded-lg border border-slate-200 text-sm">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Summary</span>
        <span className="text-slate-500 text-xs">Total: <span className="font-semibold text-emerald-700 tabular-nums">{fmt(totalAmount)}</span></span>
        <span className="text-slate-300 text-xs hidden sm:inline">|</span>
        <span className="text-slate-500 text-xs">All: <span className="font-semibold">{deposits.length}</span></span>
        <span className="text-slate-300 text-xs hidden sm:inline">|</span>
        <span className="text-slate-500 text-xs">Posted: <span className="font-semibold text-emerald-700">{deposits.filter(d => d.status === 'POSTED').length}</span></span>
        <span className="text-slate-300 text-xs hidden sm:inline">|</span>
        <span className="text-slate-500 text-xs">Draft: <span className="font-semibold text-amber-600">{deposits.filter(d => d.status === 'DRAFT').length}</span></span>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deposits…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>
          <select
            aria-label="Filter by status"
            value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="POSTED">Posted</option>
            <option value="VOID">Void</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {error && (
          <div className="flex items-center gap-2 p-4 text-red-600 bg-red-50 border-b border-red-100 text-sm">
            <AlertCircle size={15} /> {error}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="ml-2 text-slate-500">Loading deposits…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Banknote size={36} className="mb-3 text-slate-200" />
            <p className="font-medium text-slate-500">No deposits found</p>
            <p className="text-sm mt-1">
              {deposits.length > 0 ? 'Try adjusting your filters.' : 'Create your first deposit to bundle received payments.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Plus size={14} /> New Deposit
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3 whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 whitespace-nowrap">Deposit #</th>
                  <th className="px-4 py-3">Bank Account</th>
                  <th className="px-4 py-3">Reference / Memo</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Amount</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(d => (
                  <tr
                    key={d.id}
                    onClick={() => openDetail(d)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-mono text-slate-700">{d.depositNumber ?? '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-800">{d.bankAccountName ?? '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-500 max-w-[180px] truncate">{d.reference ?? d.memo ?? '—'}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_META[d.status].cls}`}>
                        {STATUS_META[d.status].icon} {STATUS_META[d.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-emerald-700 tabular-nums">
                      {fmt(d.amount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.status === 'DRAFT' && (
                          <>
                            <button
                              onClick={e => { e.stopPropagation(); handlePost(d.id) }}
                              disabled={actionLoading === d.id}
                              className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === d.id ? <Loader2 size={10} className="animate-spin" /> : 'Post'}
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); handleVoid(d.id) }}
                              disabled={actionLoading === d.id}
                              className="px-2 py-1 text-xs border border-red-200 text-red-500 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              Void
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200">
                  <td colSpan={5} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">
                    Total ({filtered.length})
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700 tabular-nums">
                    {fmt(totalAmount)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ── Detail modal ── */}
      {selectedDeposit && (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4" onClick={() => setSelectedDeposit(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="font-bold text-slate-900">
                  Deposit {selectedDeposit.depositNumber ?? `#${selectedDeposit.id.slice(-6).toUpperCase()}`}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(selectedDeposit.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_META[selectedDeposit.status].cls}`}>
                  {STATUS_META[selectedDeposit.status].icon} {STATUS_META[selectedDeposit.status].label}
                </span>
                <button onClick={() => setSelectedDeposit(null)} title="Close" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Bank Account</p>
                  <p className="font-medium text-slate-800">{selectedDeposit.bankAccountName ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Total Amount</p>
                  <p className="font-bold text-emerald-700 tabular-nums text-lg">{fmt(selectedDeposit.amount)}</p>
                </div>
                {selectedDeposit.reference && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Reference</p>
                    <p className="text-slate-700">{selectedDeposit.reference}</p>
                  </div>
                )}
                {selectedDeposit.memo && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Memo</p>
                    <p className="text-slate-700">{selectedDeposit.memo}</p>
                  </div>
                )}
              </div>

              {selectedDeposit.journalEntryId && (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-xs">
                  <CheckCircle2 size={13} />
                  <span>Posted to General Ledger</span>
                  <ExternalLink size={11} />
                </div>
              )}

              {selectedDeposit.items && selectedDeposit.items.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Included Payments ({selectedDeposit.items.length})
                  </p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {selectedDeposit.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg text-sm">
                        <div>
                          <span className="font-medium text-slate-700">{item.customerName ?? '—'}</span>
                          {item.invoiceNumber && (
                            <span className="text-xs text-slate-400 ml-2">{item.invoiceNumber}</span>
                          )}
                        </div>
                        <span className="font-mono font-semibold text-emerald-700 tabular-nums">{fmt(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {selectedDeposit.status === 'DRAFT' && (
              <div className="flex items-center gap-2 px-6 py-4 border-t border-slate-100">
                <button
                  onClick={() => handlePost(selectedDeposit.id)}
                  disabled={actionLoading === selectedDeposit.id}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === selectedDeposit.id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <CheckCircle2 size={14} />}
                  Post to General Ledger
                </button>
                <button
                  onClick={() => handleVoid(selectedDeposit.id)}
                  disabled={actionLoading === selectedDeposit.id}
                  className="px-4 py-2 border border-red-200 text-red-500 text-sm rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Void
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Create modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="font-bold text-slate-900">New Bank Deposit</h2>
              <button onClick={() => setShowCreateModal(false)} title="Close" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
              {/* Bank account */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Destination Bank Account <span className="text-red-500">*</span>
                </label>
                <select
                  aria-label="Destination Bank Account"
                  value={form.bankAccountId}
                  onChange={e => setForm(f => ({ ...f, bankAccountId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="">Select bank account…</option>
                  {bankAccounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name}{a.accountNumber ? ` — ${a.accountNumber}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Reference */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                  <input
                    type="date" value={form.date}
                    aria-label="Deposit Date"
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Reference #</label>
                  <input
                    type="text" value={form.reference}
                    onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
                    placeholder="Optional"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Memo */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Memo</label>
                <input
                  type="text" value={form.memo}
                  onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
                  placeholder="Optional notes"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* Payments to include */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Include Payments</label>
                  {selectedPayments.size > 0 && (
                    <span className="text-xs font-semibold text-emerald-700 tabular-nums">
                      {fmt(selectedPaymentTotal)} selected
                    </span>
                  )}
                </div>
                {undepositedFunds.length === 0 ? (
                  <div className="py-4 text-center text-sm text-slate-400 border border-slate-200 rounded-lg">
                    No undeposited payments available
                  </div>
                ) : (
                  <div className="space-y-1 max-h-52 overflow-y-auto border border-slate-200 rounded-lg p-2">
                    {undepositedFunds.map(p => (
                      <label key={p.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedPayments.has(p.id)}
                            onChange={() => togglePayment(p.id)}
                            className="rounded border-slate-300 accent-emerald-600"
                          />
                          <div>
                            <span className="text-sm font-medium text-slate-700">{p.customerName}</span>
                            {p.invoiceNumber && (
                              <span className="text-xs text-slate-400 ml-1.5">{p.invoiceNumber}</span>
                            )}
                            <span className="text-xs text-slate-400 ml-1.5">
                              {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-mono font-semibold text-emerald-700 tabular-nums">
                          {fmt(p.amount)}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 px-6 py-4 border-t border-slate-100">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting || !form.bankAccountId}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {submitting ? 'Creating…' : `Create Deposit${selectedPaymentTotal > 0 ? ` · ${fmt(selectedPaymentTotal)}` : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
