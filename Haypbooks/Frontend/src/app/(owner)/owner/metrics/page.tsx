'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { BarChart3, PieChart, RefreshCw, Building2, Users } from 'lucide-react'
import apiClient from '@/lib/api-client'
import OwnerPageTemplate from '@/components/owner/OwnerPageTemplate'

interface PlanDistributionEntry {
  planName: string
  planType: string
  monthlyPrice: number | null
  count: number
}

interface PlanDistributionResponse {
  plans: PlanDistributionEntry[]
  unsubscribedCompanies: number
  totalCompanies: number
  totalActiveSubscriptions: number
}

interface MetricsSnapshot {
  id: number
  totalCompanies: number
  totalUsers: number
  totalDbStorageMb: number
  totalR2StorageMb: number
  recordedAt: string
}

interface MetricsHistoryResponse {
  snapshots: MetricsSnapshot[]
  range: { days: number; from: string; to: string }
  totalSnapshots: number
}

const formatDate = (value: string) => {
  const date = new Date(value)
  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
}

const formatMb = (mb: number) => `${mb.toLocaleString()} MB`

export default function OwnerMetricsPage() {
  const [planData, setPlanData] = useState<PlanDistributionResponse | null>(null)
  const [historyData, setHistoryData] = useState<MetricsHistoryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [snapshotLoading, setSnapshotLoading] = useState(false)
  const [error, setError] = useState('')
  const [days, setDays] = useState(30)

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [planRes, historyRes] = await Promise.all([
        apiClient.get<PlanDistributionResponse>('/api/owner/metrics/plan-distribution'),
        apiClient.get<MetricsHistoryResponse>(`/api/owner/metrics/history?days=${days}`),
      ])
      setPlanData(planRes.data)
      setHistoryData(historyRes.data)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [days])

  const handleSnapshot = async () => {
    setSnapshotLoading(true)
    setError('')
    try {
      await apiClient.post('/api/owner/metrics/snapshot')
      await fetchData()
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to record snapshot')
    } finally {
      setSnapshotLoading(false)
    }
  }

  const maxR2 = useMemo(() => {
    if (!historyData || historyData.snapshots.length === 0) return 0
    return Math.max(...historyData.snapshots.map((snapshot) => snapshot.totalR2StorageMb), 1)
  }, [historyData])

  const totalSubscriptions = planData ? Math.max(1, planData.totalActiveSubscriptions) : 1

  const chartSummary = useMemo(() => {
    if (!historyData || historyData.snapshots.length === 0) return null
    const first = historyData.snapshots[0]
    const last = historyData.snapshots[historyData.snapshots.length - 1]
    return {
      count: historyData.totalSnapshots,
      days: days,
      from: first.totalR2StorageMb,
      to: last.totalR2StorageMb,
      startDate: formatDate(first.recordedAt),
      endDate: formatDate(last.recordedAt),
    }
  }, [historyData, days])

  return (
    <OwnerPageTemplate
      title="Platform Metrics"
      description="Monitor plan distribution and storage growth trends across the HaypBooks platform."
      section="Owner"
      icon={<BarChart3 size={20} />}
      columns={[]}
      data={[]}
      loading={loading}
      searchable={false}
      searchableFields={[]}
      summaryCards={[]}
      showCreate={false}
      showExport={false}
    >
      <div className="p-6 space-y-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Platform Analytics</p>
            <h1 className="text-3xl font-bold text-slate-950">Platform Metrics</h1>
            <p className="mt-2 text-sm text-slate-500">View plan distribution, active subscriptions, and storage growth over time.</p>
          </div>
          <button
            onClick={handleSnapshot}
            disabled={snapshotLoading}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} />
            {snapshotLoading ? 'Recording...' : 'Record Snapshot'}
          </button>
        </header>

        {error && (
          <div className="rounded-3xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <motion.div whileHover={{ y: -4 }} className="rounded-[24px] border border-emerald-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><Building2 size={20} /></div>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Total Companies</span>
            </div>
            <p className="mt-6 text-4xl font-bold text-slate-950">{planData?.totalCompanies ?? '—'}</p>
            <p className="mt-2 text-sm text-slate-500">Companies on the platform</p>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="rounded-[24px] border border-emerald-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><PieChart size={20} /></div>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Active Subscriptions</span>
            </div>
            <p className="mt-6 text-4xl font-bold text-slate-950">{planData?.totalActiveSubscriptions ?? '—'}</p>
            <p className="mt-2 text-sm text-slate-500">Companies currently subscribed</p>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="rounded-[24px] border border-emerald-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><Users size={20} /></div>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Unsubscribed</span>
            </div>
            <p className="mt-6 text-4xl font-bold text-slate-950">{planData?.unsubscribedCompanies ?? '—'}</p>
            <p className="mt-2 text-sm text-slate-500">Companies without an active plan</p>
          </motion.div>
        </div>

        <section className="rounded-[24px] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Plan Distribution</h2>
              <p className="text-sm text-slate-500">How many companies are on each subscription plan.</p>
            </div>
            <div className="text-sm text-slate-500">{planData?.totalCompanies ?? '—'} total companies</div>
          </div>

          <div className="space-y-4">
            {planData?.plans.map((plan) => {
              const width = Math.round((plan.count / totalSubscriptions) * 100)
              return (
                <div key={plan.planName} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">{plan.planName}</div>
                      <div className="text-xs text-slate-500">{plan.planType}</div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="font-semibold">{plan.count}</span>
                      {plan.monthlyPrice !== null && (
                        <span className="text-slate-500">${plan.monthlyPrice.toFixed(2)}/mo</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 rounded-full bg-slate-100 h-3 overflow-hidden">
                    <div className="h-3 rounded-full bg-emerald-600 transition-all" style={{ width: `${width}%` }} />
                  </div>
                </div>
              )
            })}

            {planData && planData.unsubscribedCompanies > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-950">No Plan</div>
                    <div className="text-xs text-slate-500">Companies without an active subscription</div>
                  </div>
                  <div className="text-sm font-semibold">{planData.unsubscribedCompanies}</div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[24px] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Storage Growth Trend</h2>
              <p className="text-sm text-slate-500">Track daily storage snapshots over the selected range.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[7, 30, 90].map((candidate) => (
                <button
                  key={candidate}
                  onClick={() => setDays(candidate)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${days === candidate ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  {candidate} days
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            {loading ? (
              <div className="space-y-4">
                <div className="h-48 rounded-2xl bg-slate-200 animate-pulse" />
                <div className="h-4 w-2/3 rounded-full bg-slate-200 animate-pulse" />
              </div>
            ) : historyData?.snapshots.length ? (
              <div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="mb-4 flex items-center justify-between gap-4 text-sm text-slate-500">
                      <span>{historyData.totalSnapshots} snapshots over {days} days</span>
                      <span>{historyData.range.from.slice(0, 10)} → {historyData.range.to.slice(0, 10)}</span>
                    </div>
                    <div className="flex items-end gap-1 h-48 border-b border-l border-slate-200 px-2 pb-2">
                      {historyData.snapshots.map((snapshot) => {
                        const height = Math.max(6, (snapshot.totalR2StorageMb / maxR2) * 100)
                        return (
                          <div key={snapshot.id} className="flex-1">
                            <div
                              title={`Date: ${new Date(snapshot.recordedAt).toLocaleDateString()}\nR2: ${formatMb(snapshot.totalR2StorageMb)}\nUsers: ${snapshot.totalUsers}`}
                              className="relative mx-0.5 overflow-hidden rounded-t-xl bg-emerald-500 transition-colors hover:bg-emerald-600"
                              style={{ height: `${height}%` }}
                            />
                            <div className="mt-2 text-[10px] text-slate-500 text-center truncate">{formatDate(snapshot.recordedAt)}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="w-32 space-y-2 text-xs text-slate-500">
                    <div>Max {formatMb(maxR2)}</div>
                    <div className="mt-12">Mid</div>
                    <div className="mt-14">Min 0 MB</div>
                  </div>
                </div>
                {chartSummary && (
                  <div className="mt-6 rounded-3xl bg-white p-4 text-sm text-slate-600 border border-slate-200">
                    Storage grew from <span className="font-semibold">{formatMb(chartSummary.from)}</span> on {chartSummary.startDate} to <span className="font-semibold">{formatMb(chartSummary.to)}</span> on {chartSummary.endDate}.
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                <p className="text-sm font-semibold">No snapshots recorded yet.</p>
                <p className="mt-2">Click "Record Snapshot" to start tracking storage growth over time.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </OwnerPageTemplate>
  )
}
