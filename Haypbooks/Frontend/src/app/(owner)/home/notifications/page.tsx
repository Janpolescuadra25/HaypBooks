'use client'

import { useState, useEffect } from 'react'
import { Eye, RefreshCw, Loader2 } from 'lucide-react'
import { homeService } from '@/services/home.service'
import { useCompanyId } from '@/hooks/useCompanyId'

const PRIORITY_BADGE: Record<string, string> = {
  High: 'bg-rose-50 text-rose-700',
  Medium: 'bg-amber-50 text-amber-700',
  Low: 'bg-blue-50 text-blue-700',
}

const STATUS_BADGE: Record<string, string> = {
  Unread: 'bg-emerald-50 text-emerald-700',
  Read: 'bg-slate-100 text-slate-600',
}

const FILTER_OPTIONS = ['All', 'Unread', 'Read']

export default function NotificationsPage() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchData = async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await homeService.getNotifications(companyId)
      setNotifications(Array.isArray(response.data) ? response.data : response.data?.data ?? [])
      setFeedback(null)
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to load notifications' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [companyId])

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), 3000)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const filteredNotifications = filter === 'All' ? notifications : notifications.filter((item) => item.status === filter)

  const handleMarkAll = async () => {
    if (!companyId) return
    setLoading(true)
    try {
      await homeService.markAllAsRead(companyId)
      setFeedback({ type: 'success', message: 'All notifications marked as read' })
      setNotifications((current) => current.map((item) => ({ ...item, status: 'Read' })))
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to mark all as read' })
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (item: any) => {
    if (!companyId) return
    setLoading(true)
    try {
      await homeService.markAsRead(companyId, item.id)
      setFeedback({ type: 'success', message: 'Notification marked as read' })
      setNotifications((current) => current.map((notification) => notification.id === item.id ? { ...notification, status: 'Read' } : notification))
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to mark as read' })
    } finally {
      setLoading(false)
    }
  }

  if (companyIdError) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {companyIdError}
        </div>
      </div>
    )
  }

  if (companyIdLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Eye className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Notifications</h2>
            <p className="mt-1 text-sm text-slate-500">View and manage your notifications</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleMarkAll}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`rounded-2xl border p-3 text-sm ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          {feedback.message}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">SUBJECT</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">MESSAGE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">PRIORITY</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">STATUS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">TIMESTAMP</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                  No notifications found.
                </td>
              </tr>
            ) : (
              filteredNotifications.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.subject || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600"><div className="truncate max-w-[320px]">{item.message || '—'}</div></td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_BADGE[item.priority] || 'bg-slate-100 text-slate-600'}`}>
                      {item.priority || 'Low'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[item.status] || 'bg-slate-100 text-slate-600'}`}>
                      {item.status || 'Unread'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{item.timestamp ? new Date(item.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {item.status === 'Unread' ? (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(item)}
                        className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Eye size={16} />
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
