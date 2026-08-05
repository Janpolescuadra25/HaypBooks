'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { RefreshCw, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { taxService } from '@/services/tax.service'

function formatDueDate(date: string) {
  return format(new Date(date), 'MMM d, yyyy')
}

function getStatus(dueDate: string) {
  const today = new Date()
  const due = new Date(dueDate)
  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'overdue'
  if (diffDays <= 7) return 'upcoming'
  return 'scheduled'
}

function getStatusStyles(status: string) {
  switch (status) {
    case 'overdue':
      return 'bg-rose-100 text-rose-700'
    case 'upcoming':
      return 'bg-amber-100 text-amber-700'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

function getDaysRemainingLabel(dueDate: string) {
  const today = new Date()
  const due = new Date(dueDate)
  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} days overdue`
  }
  if (diffDays === 0) {
    return 'Today'
  }
  return `${diffDays} days`
}

function getDaysRemainingClasses(dueDate: string) {
  const today = new Date()
  const due = new Date(dueDate)
  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'text-rose-600 font-medium'
  if (diffDays === 0) return 'text-amber-600 font-medium'
  if (diffDays <= 7) return 'text-amber-600'
  return 'text-slate-500'
}

export default function TaxCalendarPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [calendar, setCalendar] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCalendar = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const { data: calendarData } = await taxService.getCalendar(companyId, year)
      setCalendar(calendarData)
    } catch (err: any) {
      setError(err?.message || 'Failed to load tax calendar')
    } finally {
      setLoading(false)
    }
  }, [companyId, year])

  useEffect(() => {
    if (companyLoading) return
    if (!companyId) {
      setLoading(false)
      return
    }
    fetchCalendar()
  }, [companyLoading, companyId, fetchCalendar])

  const deadlines = useMemo(() => {
    if (!calendar?.deadlines) return []
    return [...calendar.deadlines].sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }, [calendar])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Tax Calendar</h2>
        </div>
        <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
          <button
            type="button"
            onClick={() => setYear((prev) => prev - 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-lg font-bold text-slate-900">{year}</span>
          <button
            type="button"
            onClick={() => setYear((prev) => prev + 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Deadlines</h2>
        </div>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Form Type</th>
                <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Description</th>
                <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Due Date</th>
                <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Days Remaining</th>
                <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!deadlines.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">No filing deadlines for {year}</td>
                </tr>
              ) : (
                deadlines.map((deadline: any) => {
                  const status = getStatus(deadline.dueDate)
                  return (
                    <tr key={`${deadline.formType}-${deadline.dueDate}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold font-mono text-slate-600">
                          {deadline.formType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{deadline.description}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDueDate(deadline.dueDate)}</td>
                      <td className={`px-4 py-3 ${getDaysRemainingClasses(deadline.dueDate)}`}>
                        {getDaysRemainingLabel(deadline.dueDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusStyles(status)}`}>
                          {status === 'overdue' ? 'Overdue' : status === 'upcoming' ? 'Upcoming' : 'Scheduled'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
