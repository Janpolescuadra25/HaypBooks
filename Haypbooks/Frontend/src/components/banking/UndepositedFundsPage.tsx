'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2, AlertCircle, Banknote, Clock, Search, RefreshCw,
  CheckSquare, Square, ArrowRight,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UndepositedPayment {
  id: string
  date: string
  customerName: string
  invoiceNumber?: string
  invoiceId?: string
  amount: number
  paymentMethod?: string
  reference?: string
  daysPending?: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function UndepositedFundsPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const router = useRouter()
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const [payments, setPayments] = useState<UndepositedPayment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const fetchPayments = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/banking/undeposited-funds`)
      const items: UndepositedPayment[] = Array.isArray(data) ? data : data.items ?? data.payments ?? []
      const now = Date.now()
      setPayments(items.map(p => ({
        ...p,
        daysPending: p.daysPending ?? Math.floor((now - new Date(p.date).getTime()) / 86400000),
      })))
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load undeposited funds')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const filtered = useMemo(() => {
    let list = payments
    if (from) list = list.filter(p => p.date >= from)
    if (to) list = list.filter(p => p.date <= to)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        (p.customerName ?? '').toLowerCase().includes(q) ||
        (p.invoiceNumber ?? '').toLowerCase().includes(q) ||
        (p.reference ?? '').toLowerCase().includes(q),
      )
    }
    return list
  }, [payments, from, to, search])

  const totalAmount = filtered.reduce((s, p) => s + p.amount, 0)
  const selectedAmount = filtered.filter(p => selected.has(p.id)).reduce((s, p) => s + p.amount, 0)

  const toggleAll = () => {
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(p => p.id)))
  }

  const toggle = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const goToDeposit = (ids: string[]) => {
    router.push(`/banking-cash/transactions/deposits?paymentIds=${ids.join(',')}`)
  }

  if (cidLoading) return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      <span className="ml-2 text-emerald-700">Loading…</span>
    </div>
  )
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  return (
    <div className="p-4 sm:p-6 space-y-4">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Banking & Cash</p>
          <h1 className="text-2xl font-bold text-slate-900">Undeposited Funds</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Payments received and waiting to be deposited to a bank account
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={fetchPayments}
            title="Refresh"
            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          {selected.size > 0 && (
            <button
              onClick={() => goToDeposit(Array.from(selected))}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Banknote size={14} />
              Deposit Selected ({selected.size})
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Summary bar ── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-4 py-3 bg-white rounded-lg border border-slate-200 text-sm">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Summary</span>
        <span className="text-slate-600 text-xs">
          <span className="font-semibold text-emerald-700 tabular-nums">{fmt(totalAmount)}</span>
          {' '}across <span className="font-semibold">{filtered.length}</span> payments waiting to be deposited
        </span>
        {selected.size > 0 && (
          <>
            <span className="text-slate-300 text-xs hidden sm:inline">|</span>
            <span className="text-slate-600 text-xs">
              Selected:{' '}
              <span className="font-semibold text-emerald-700 tabular-nums">{fmt(selectedAmount)}</span>
              {' '}({selected.size} payments)
            </span>
          </>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by customer, invoice…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 whitespace-nowrap">From</label>
            <input
              type="date" value={from} onChange={e => setFrom(e.target.value)}
              aria-label="From date"
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 whitespace-nowrap">To</label>
            <input
              type="date" value={to} onChange={e => setTo(e.target.value)}
              aria-label="To date"
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>
          {(from || to || search) && (
            <button
              onClick={() => { setSearch(''); setFrom(''); setTo('') }}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              Clear
            </button>
          )}
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
            <span className="ml-2 text-slate-500">Loading undeposited funds…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Banknote size={36} className="mb-3 text-slate-200" />
            <p className="font-medium text-slate-500">No undeposited funds</p>
            <p className="text-sm mt-1">
              {payments.length > 0
                ? 'Try adjusting your filters.'
                : 'All payments have been deposited or no payments received yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3 w-10">
                    <button onClick={toggleAll} className="text-slate-400 hover:text-emerald-600 transition-colors">
                      {selected.size === filtered.length && filtered.length > 0
                        ? <CheckSquare size={15} className="text-emerald-600" />
                        : <Square size={15} />}
                    </button>
                  </th>
                  <th className="px-4 py-3 whitespace-nowrap">Date</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3 whitespace-nowrap">Invoice #</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Days Pending</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Amount</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50 transition-colors ${selected.has(p.id) ? 'bg-emerald-50/50' : ''}`}
                  >
                    <td className="px-4 py-3.5">
                      <button onClick={() => toggle(p.id)} className="text-slate-400 hover:text-emerald-600 transition-colors">
                        {selected.has(p.id)
                          ? <CheckSquare size={15} className="text-emerald-600" />
                          : <Square size={15} />}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-slate-800">{p.customerName ?? '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-500 font-mono">{p.invoiceNumber ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 capitalize">
                        {p.paymentMethod ?? 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        (p.daysPending ?? 0) > 30 ? 'bg-red-50 text-red-600' :
                        (p.daysPending ?? 0) > 7  ? 'bg-amber-50 text-amber-600' :
                        'bg-emerald-50 text-emerald-700'
                      }`}>
                        <Clock size={10} />
                        {p.daysPending ?? 0}d
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-emerald-700 tabular-nums">
                      {fmt(p.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => goToDeposit([p.id])}
                        className="text-xs px-2 py-1 border border-emerald-200 text-emerald-700 rounded hover:bg-emerald-50 transition-colors whitespace-nowrap"
                      >
                        Deposit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200">
                  <td colSpan={6} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">
                    Total ({filtered.length} payments)
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
    </div>
  )
}
