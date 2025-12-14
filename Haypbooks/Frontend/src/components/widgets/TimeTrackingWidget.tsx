"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

type TimeEntry = {
  id: string
  employee: string
  hours: number
  date: string
  project?: string
  billable: boolean
}

type TimeSummary = {
  totalHours: number
  unbilledHours: number
  entries: TimeEntry[]
}

export default function TimeTrackingWidget() {
  const [summary, setSummary] = useState<TimeSummary>({
    totalHours: 0,
    unbilledHours: 0,
    entries: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await api<{ summary: TimeSummary }>('/api/dashboard/time-tracking')
        setSummary(data.summary || { totalHours: 0, unbilledHours: 0, entries: [] })
      } catch (err) {
        console.error('Failed to load time tracking', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="animate-pulse bg-slate-100 rounded h-32" />
  }

  return (
    <div className="glass-card !shadow-none border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Time Tracking</h3>
        <Link href="/time/time-entries" className="btn-primary btn-xs">
          + Log time
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg text-white">
          <p className="text-sm opacity-90 mb-1">Total Hours (Week)</p>
          <p className="text-3xl font-bold">{summary.totalHours.toFixed(1)}</p>
        </div>
        
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-700 mb-1">Unbilled Hours</p>
          <p className="text-3xl font-bold text-amber-900">{summary.unbilledHours.toFixed(1)}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-slate-500 uppercase">Recent Entries</h4>
        {summary.entries.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No time entries</p>
        ) : (
          summary.entries.slice(0, 5).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{entry.employee}</p>
                <div className="flex items-center gap-2 mt-1">
                  {entry.project && (
                    <span className="text-xs text-slate-600">{entry.project}</span>
                  )}
                  {entry.billable && (
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                      Billable
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right ml-2">
                <p className="text-sm font-semibold text-slate-900">{entry.hours}h</p>
                <p className="text-xs text-slate-500">{entry.date}</p>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200 flex gap-3 text-sm">
        <Link href="/time" className="text-sky-600 hover:text-sky-700 font-medium">
          View all
        </Link>
        <Link href="/reports/unbilled-time" className="text-sky-600 hover:text-sky-700 font-medium">Reports</Link>
      </div>
    </div>
  )
}
