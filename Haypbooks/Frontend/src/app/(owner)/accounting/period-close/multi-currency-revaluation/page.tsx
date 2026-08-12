'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, FileText, Globe, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { accountingService } from '@/services/accounting.service'
import { formatCurrency } from '@/lib/format'

interface FxLine {
  debit?: number | string
  credit?: number | string
}

interface FxEntry {
  id: string
  currency?: string
  date?: string
  description?: string
  exchangeRate?: number | string
  lines?: FxLine[]
  entryNumber?: string
  createdAt?: string
}

interface RevaluationData {
  entries?: FxEntry[]
  generatedAt?: string
}

function formatDate(date?: string) {
  if (!date) return '—'
  return format(new Date(date), 'MMM d, yyyy')
}

export default function MultiCurrencyRevaluationPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [from, setFrom] = useState(() => `${new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)}`)
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [reval, setReval] = useState<RevaluationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRevaluation = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await accountingService.getMultiCurrencyRevaluation(companyId, { from, to })
      setReval(data)
    } catch (err: unknown) {
      const apiErr = err as { message?: string }
      setError(apiErr?.message || 'Failed to load multi-currency revaluation data')
    } finally {
      setLoading(false)
    }
  }, [companyId, from, to])

  useEffect(() => {
    if (companyLoading) return
    if (!companyId) {
      setLoading(false)
      return
    }
    fetchRevaluation()
  }, [companyId, companyLoading, fetchRevaluation])

  const fxEntries = useMemo(() => {
    const entries = reval?.entries ?? [] as FxEntry[]
    return entries.filter((entry) => Boolean(entry.currency))
  }, [reval])

  const sortedEntries = useMemo(() => {
    return [...fxEntries].sort((a, b) => new Date(b.date ?? '').getTime() - new Date(a.date ?? '').getTime())
  }, [fxEntries])

  const currenciesCount = useMemo(() => {
    return new Set(fxEntries.map((entry) => entry.currency)).size
  }, [fxEntries])

  const totalDebit = useMemo(() => {
    return fxEntries.reduce((sum: number, entry) => {
      return sum + (entry.lines ?? []).reduce((lineSum: number, line) => lineSum + Number(line.debit || 0), 0)
    }, 0)
  }, [fxEntries])

  const totalCredit = useMemo(() => {
    return fxEntries.reduce((sum: number, entry) => {
      return sum + (entry.lines ?? []).reduce((lineSum: number, line) => lineSum + Number(line.credit || 0), 0)
    }, 0)
  }, [fxEntries])

  if (companyLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Multi-Currency Revaluation</h2>
        </div>
        <button
          type="button"
          onClick={fetchRevaluation}
          disabled={loading}
          title="Refresh"
          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>
        <button
          type="button"
          onClick={fetchRevaluation}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Filter
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-50 p-3 text-slate-700"><FileText className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">FX Entries</p>
              <p className="text-2xl font-bold text-slate-900">{fxEntries.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-blue-50 p-5 text-blue-700">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/80 p-3 text-blue-700"><Globe className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-medium">Currencies</p>
              <p className="text-2xl font-bold">{currenciesCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-emerald-50 p-5 text-emerald-700">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/80 p-3 text-emerald-700"><ArrowUpRight className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-medium">Total Debit</p>
              <p className="text-2xl font-bold">{formatCurrency(totalDebit, currency)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-rose-50 p-5 text-rose-700">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/80 p-3 text-rose-700"><ArrowDownRight className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-medium">Total Credit</p>
              <p className="text-2xl font-bold">{formatCurrency(totalCredit, currency)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Entry No.</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Date</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Description</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Currency</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Exchange Rate</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Total Debit</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Total Credit</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Lines</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedEntries.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">No items found.</td>
              </tr>
            ) : (
              sortedEntries.map((entry) => {
                const entryDebit = (entry.lines ?? []).reduce((sum: number, line) => sum + Number(line.debit || 0), 0)
                const entryCredit = (entry.lines ?? []).reduce((sum: number, line) => sum + Number(line.credit || 0), 0)
                return (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold font-mono text-slate-600">{entry.entryNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(entry.date)}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 truncate max-w-[200px]">{entry.description}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold font-mono text-blue-700">{entry.currency}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-slate-700">{entry.exchangeRate ? Number(entry.exchangeRate).toFixed(4) : '—'}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(entryDebit, currency)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(entryCredit, currency)}</td>
                    <td className="px-4 py-3 text-slate-700">{(entry.lines ?? []).length} lines</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
          Generated at: {reval?.generatedAt ? format(new Date(reval.generatedAt), 'MMM d, yyyy') : '—'}
        </div>
      </div>
    </div>
  )
}
