'use client'

import React, { useCallback, useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { currencyService, type CurrencyDefinition } from '@/services/currency.service'

interface TrialBalanceRow {
  accountId: string
  accountCode: string
  accountName: string
  accountType: string
  totalDebit: number
  totalCredit: number
  netBalance: number
}

interface TrialBalanceResult {
  asOf: string
  generatedAt: string
  accounts: TrialBalanceRow[]
  totals: {
    totalDebit: number
    totalCredit: number
    netBalance: number
  }
}

export default function Page() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency: companyCurrency } = useCompanyCurrency()
  const [report, setReport] = useState<TrialBalanceResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10))
  const [displayCurrency, setDisplayCurrency] = useState<string>(companyCurrency)
  const [currencyOptions, setCurrencyOptions] = useState<CurrencyDefinition[]>([])
  const [currencyLoading, setCurrencyLoading] = useState(true)
  const [currencyError, setCurrencyError] = useState('')

  const fetchReport = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get('/reporting/trial-balance', { params: { companyId, asOf, displayCurrency } })
      setReport(data)
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load trial balance')
    } finally {
      setLoading(false)
    }
  }, [companyId, asOf, displayCurrency])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  useEffect(() => {
    if (!companyCurrency) return
    setDisplayCurrency((current) => current || companyCurrency)
  }, [companyCurrency])

  useEffect(() => {
    let cancelled = false
    setCurrencyLoading(true)
    currencyService.listCurrencies()
      .then((response) => {
        if (cancelled) return
        setCurrencyOptions(response.data)
        setCurrencyError('')
      })
      .catch(() => {
        if (cancelled) return
        setCurrencyError('Unable to load currencies')
      })
      .finally(() => {
        if (cancelled) return
        setCurrencyLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const fmt = useCallback((n: number) => formatCurrency(n, displayCurrency || companyCurrency), [displayCurrency, companyCurrency])

  if (cidLoading || loading) {
    return <div className="p-6 text-center">Loading trial balance…</div>
  }
  if (cidError) {
    return <div className="p-6 text-center text-red-600">{cidError}</div>
  }
  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>
  }
  if (!report) {
    return <div className="p-6 text-center text-slate-600">No trial balance data found.</div>
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Trial Balance</h1>
          <p className="text-sm text-emerald-600/80">As of {report?.asOf ? new Date(report.asOf).toLocaleDateString() : new Date(asOf).toLocaleDateString()}</p>
          <p className="text-sm text-slate-500">Generated: {report?.generatedAt ? new Date(report.generatedAt).toLocaleString() : '—'}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">As of</label>
            <input
              type="date"
              value={asOf}
              onChange={(e) => setAsOf(e.target.value)}
              className="border border-emerald-200 rounded-lg px-3 py-1.5 text-sm text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Report currency</label>
            <select
              value={displayCurrency}
              onChange={(event) => setDisplayCurrency(event.target.value)}
              className="border border-emerald-200 rounded-lg px-3 py-1.5 text-sm text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {currencyOptions.map((option) => (
                <option key={option.code} value={option.code}>{option.code} - {option.name}</option>
              ))}
            </select>
            {currencyError ? <p className="text-xs text-rose-600 mt-1">{currencyError}</p> : null}
          </div>
          <button onClick={() => fetchReport()} className="px-4 py-2 border border-emerald-200 rounded-lg text-emerald-700 hover:bg-emerald-50">Refresh</button>
        </div>
      </div>

      <div className="overflow-auto bg-white rounded-xl border border-emerald-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-emerald-50 border-b border-emerald-100 text-emerald-700">
              <th className="px-4 py-2">Account</th>
              <th className="px-4 py-2 hidden md:table-cell">Code</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2 text-right">Debit</th>
              <th className="px-4 py-2 text-right">Credit</th>
              <th className="px-4 py-2 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {(report?.accounts ?? []).map((row) => (
              <tr key={row.accountId} className="border-b border-emerald-50 hover:bg-emerald-50/30">
                <td className="px-4 py-2">{row.accountName}</td>
                <td className="px-4 py-2 hidden md:table-cell">{row.accountCode}</td>
                <td className="px-4 py-2">{row.accountType}</td>
                <td className="px-4 py-2 text-right">{fmt(row.totalDebit)}</td>
                <td className="px-4 py-2 text-right">{fmt(row.totalCredit)}</td>
                <td className="px-4 py-2 text-right">{fmt(row.netBalance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-emerald-200 font-semibold">
              <td className="px-4 py-2" colSpan={3}>Totals</td>
              <td className="px-4 py-2 text-right">{fmt(report?.totals?.totalDebit ?? 0)}</td>
              <td className="px-4 py-2 text-right">{fmt(report?.totals?.totalCredit ?? 0)}</td>
              <td className="px-4 py-2 text-right">{fmt(report?.totals?.netBalance ?? 0)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className={`text-sm ${Math.abs(report?.totals?.netBalance ?? 0) < 0.005 ? 'text-emerald-700' : 'text-red-600'}`}>
        Books are {Math.abs(report?.totals?.netBalance ?? 0) < 0.005 ? 'balanced' : 'not balanced'}.
      </div>
    </div>
  )
}
