'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { History, RefreshCw, Search } from 'lucide-react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { payrollService } from '@/services/payroll.service'
import { formatCurrency } from '@/lib/format'

export default function PayrollHistoryPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [paychecks, setPaychecks] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const [paychecksRes, summaryRes] = await Promise.all([
        payrollService.listPaychecks(companyId),
        payrollService.getSummary(companyId),
      ])
      const pcData = Array.isArray(paychecksRes.data) ? paychecksRes.data : (paychecksRes.data?.data ?? [])
      setPaychecks(pcData)
      setSummary(summaryRes.data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load payroll history')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const kpis = useMemo(
    () => ({
      totalGross: summary?.totalGross ?? 0,
      totalNet: summary?.totalNet ?? 0,
      totalDeductions: summary?.totalDeductions ?? 0,
      paycheckCount: summary?.paycheckCount ?? 0,
    }),
    [summary],
  )

  const filtered = useMemo(() => {
    if (!search) return paychecks
    const q = search.toLowerCase()
    return paychecks.filter((p: any) => {
      const empName = `${p.employee?.firstName || ''} ${p.employee?.lastName || ''}`.toLowerCase().trim()
      return empName.includes(q) || p.checkNumber?.toLowerCase().includes(q)
    })
  }, [paychecks, search])

  if (companyLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Payroll History</h2>
        </div>
        <button
          type="button"
          onClick={() => fetchData()}
          disabled={loading}
          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-500 mb-1">Total Gross</p>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(kpis.totalGross, currency)}</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-500 mb-1">Total Net</p>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(kpis.totalNet, currency)}</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-500 mb-1">Total Deductions</p>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(kpis.totalDeductions, currency)}</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-500 mb-1">Paychecks</p>
          <p className="text-xl font-bold text-slate-800">{kpis.paycheckCount.toLocaleString()}</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by employee name or check number..."
          className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">EMPLOYEE NAME</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">CHECK #</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">DATE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">GROSS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">DEDUCTIONS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">NET</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">LINES</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">POSTED</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                  No paycheck records found
                </td>
              </tr>
            ) : (
              filtered.map((p: any) => {
                const employeeName = `${p.employee?.firstName || ''} ${p.employee?.lastName || ''}`.trim() || '—'
                const gross = Number(p.grossAmount || 0)
                const net = Number(p.netAmount || 0)
                const deductions = gross - net
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">{employeeName}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{p.checkNumber || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{format(new Date(p.date), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(gross, currency)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(deductions, currency)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(net, currency)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{p.paycheckLines?.length || 0}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${p.postedAt ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {p.postedAt ? 'Posted' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
