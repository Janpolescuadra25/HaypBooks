'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Calculator, Play, PackageOpen, DollarSign, Shield, TrendingDown, TrendingUp, BarChart3 } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useToast } from '@/components/ToastProvider'
import { inventoryService } from '@/services/inventory.service'
import { formatCurrency } from '@/lib/format'

const METHOD_LABELS: Record<string, string> = {
  STRAIGHT_LINE: 'Straight Line',
  DECLINING_BALANCE: 'Declining Balance',
  DOUBLE_DECLINING_BALANCE: 'Double Declining',
  SUM_OF_YEARS_DIGITS: 'Sum of Years',
  UNITS_OF_PRODUCTION: 'Units of Production',
}

export default function DepreciationPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [assets, setAssets] = useState<any[]>([])
  const [selectedAssetId, setSelectedAssetId] = useState('')
  const [schedule, setSchedule] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [runningDepreciation, setRunningDepreciation] = useState(false)
  const [error, setError] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')

  const fetchAssets = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await inventoryService.getFixedAssets(companyId)
      setAssets(Array.isArray(data) ? data : (data?.data ?? []))
    } catch (err: any) {
      setError(err?.message || 'Failed to load fixed assets')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  const fetchSchedule = useCallback(async () => {
    if (!companyId || !selectedAssetId) return
    setScheduleLoading(true)
    try {
      const { data: scheduleData } = await inventoryService.getDepreciationSchedule(companyId, selectedAssetId)
      setSchedule(scheduleData)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load depreciation schedule')
    } finally {
      setScheduleLoading(false)
    }
  }, [companyId, selectedAssetId, toast])

  const handleRunDepreciation = async () => {
    if (!periodStart || !periodEnd) {
      toast.error('Both period start and end dates are required')
      return
    }
    if (new Date(periodEnd) <= new Date(periodStart)) {
      toast.error('Period end must be after period start')
      return
    }
    if (!companyId || !selectedAssetId) return

    setRunningDepreciation(true)
    try {
      const { data: result } = await inventoryService.runDepreciation(companyId, selectedAssetId, { periodStart, periodEnd })
      if (result?.message) {
        toast.info(result.message)
      } else {
        toast.success('Depreciation entry posted successfully')
      }
      setPeriodStart('')
      setPeriodEnd('')
      fetchSchedule()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to run depreciation')
    } finally {
      setRunningDepreciation(false)
    }
  }

  useEffect(() => {
    if (companyLoading) return
    if (!companyId) {
      setLoading(false)
      return
    }
    fetchAssets()
  }, [companyId, companyLoading, fetchAssets])

  useEffect(() => {
    if (!selectedAssetId) return
    fetchSchedule()
  }, [companyId, selectedAssetId, fetchSchedule])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Depreciation</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track depreciation schedules and run periodic entries</p>
        </div>
        <button
          type="button"
          onClick={fetchAssets}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="min-w-[240px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          >
            <option value="" disabled>Select an asset...</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}{a.assetCode ? ` (${a.assetCode})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedAssetId ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 text-center text-slate-500">
          <Calculator className="mb-4 h-12 w-12 text-slate-300" />
          <p className="text-sm">Select an asset to view its depreciation schedule</p>
        </div>
      ) : scheduleLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-24">
          <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : !schedule ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 text-center text-slate-500">
          <PackageOpen className="mb-4 h-12 w-12 text-slate-300" />
          <p className="text-sm">No depreciation schedule available for the selected asset</p>
        </div>
      ) : (
        <>
          <div className="text-sm text-slate-500">
            {schedule.name} — {METHOD_LABELS[schedule.depreciationMethod] ?? schedule.depreciationMethod}
            {schedule.usefulLifeMonths ? ` — ${schedule.usefulLifeMonths} months` : ''}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-500"><DollarSign className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Asset Cost</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(Number(schedule.cost || 0), currency)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-500"><Shield className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Salvage Value</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(Number(schedule.salvageValue || 0), currency)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-500"><BarChart3 className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Depreciable Base</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(schedule.depreciableBase, currency)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-500"><TrendingDown className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Monthly Depreciation</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(schedule.monthlyDepreciation, currency)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-rose-50 p-3 text-rose-500"><TrendingUp className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Depreciated</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(schedule.totalDepreciated, currency)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-500"><DollarSign className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Remaining Value</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(schedule.depreciableBase - schedule.totalDepreciated, currency)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4">
              <h2 className="text-sm font-medium text-slate-900">Run Depreciation</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
              />
              <span className="text-slate-400 text-lg">→</span>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
              />
              <button
                type="button"
                onClick={handleRunDepreciation}
                disabled={runningDepreciation || !periodStart || !periodEnd}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${runningDepreciation || !periodStart || !periodEnd ? 'bg-emerald-400 cursor-not-allowed text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
              >
                {runningDepreciation ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Run
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3">
              <h2 className="text-sm font-medium text-slate-900">Posted Depreciation Entries</h2>
            </div>
            {schedule?.posted?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Period Start</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Period End</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Posted On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.posted.map((entry: any) => (
                      <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-slate-700">{new Date(entry.periodStart).toLocaleDateString()}</td>
                        <td className="px-5 py-3 text-slate-700">{new Date(entry.periodEnd).toLocaleDateString()}</td>
                        <td className="px-5 py-3 text-slate-900 font-medium">{formatCurrency(Number(entry.amount || 0), currency)}</td>
                        <td className="px-5 py-3 text-slate-700">{new Date(entry.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <PackageOpen className="mb-4 h-12 w-12 text-slate-300" />
                <p className="text-sm">No depreciation entries posted yet</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
