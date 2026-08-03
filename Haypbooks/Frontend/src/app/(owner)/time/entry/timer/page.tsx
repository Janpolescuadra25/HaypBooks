'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ToastProvider'
import { Clock, RefreshCw, Search } from 'lucide-react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { timeService } from '@/services/time.service'

const TIMER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  RUNNING: { label: 'Running', color: 'bg-amber-50 text-amber-600' },
  STOPPED: { label: 'Stopped', color: 'bg-slate-100 text-slate-600' },
}

export default function Page() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const toast = useToast()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)

  const fetchData = useCallback(async () => {
    if (!companyId) return

    setLoading(true)
    setError('')

    try {
      const response = await timeService.getTimerSessions(companyId)
      const normalized = Array.isArray(response.data) ? response.data : (response.data?.data ?? [])
      setData(normalized)
    } catch (err: any) {
      setError(err?.message || 'Failed to load timer sessions')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleStartTimer = async () => {
    if (!companyId) return

    try {
      setIsStarting(true)
      await timeService.startTimer(companyId)
      toast.success('Timer started')
      await fetchData()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to start timer')
    } finally {
      setIsStarting(false)
    }
  }

  const handleStopTimer = async () => {
    if (!companyId) return

    try {
      setIsStopping(true)
      await timeService.stopTimer(companyId)
      toast.success('Timer stopped')
      await fetchData()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to stop timer')
    } finally {
      setIsStopping(false)
    }
  }

  const hasRunningTimer = data.some((s: any) => s.status === 'RUNNING')

  const filteredData = data.filter((item: any) => {
    if (!searchQuery) return true
    return item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (companyLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Timer</h2>
        </div>
        <button
          type="button"
          title="Refresh"
          disabled={loading}
          onClick={() => fetchData()}
          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStartTimer}
            disabled={hasRunningTimer || isStarting || isStopping}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {isStarting ? 'Starting...' : 'Start Timer'}
          </button>
          <button
            type="button"
            onClick={handleStopTimer}
            disabled={!hasRunningTimer || isStopping || isStarting}
            className="inline-flex items-center rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
          >
            {isStopping ? 'Stopping...' : 'Stop Timer'}
          </button>
        </div>

        <div className="relative md:ml-auto max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search timer sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Start Time</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">End Time</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Duration</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">No timer sessions found</td>
              </tr>
            ) : (
              filteredData.map((item: any) => {
                const statusInfo = TIMER_STATUS_LABELS[item.status]
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">{item.description ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.startTime ? format(new Date(item.startTime), 'MMM d, yyyy h:mm a') : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.endTime ? format(new Date(item.endTime), 'MMM d, yyyy h:mm a') : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.durationHours != null ? `${Number(item.durationHours).toFixed(2)} hrs` : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusInfo?.color ?? 'bg-slate-100 text-slate-600'}`}>
                        {statusInfo?.label || item.status}
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
