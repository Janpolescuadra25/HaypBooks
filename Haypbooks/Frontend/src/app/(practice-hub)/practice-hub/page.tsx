'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Building2,
  FileText,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'

interface PracticeStats {
  activeClients: number
  openTasks: number
  pendingReviews: number
  completedMtd: number
}

interface ActivityItem {
  id: string
  client: string
  action: string
  time: string
  status: 'done' | 'warn' | 'info' | string
}

interface DeadlineItem {
  id: string
  label: string
  date: string
  urgent: boolean
}

interface ClientItem {
  id: string
  companyId: string
  companyName: string
  engagementName: string
  type: string
  startDate: string
  endDate: string | null
}

interface DashboardResponse {
  practiceName: string
  stats: PracticeStats
  activity: ActivityItem[]
  deadlines: DeadlineItem[]
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatRelativeDays(value: string) {
  const then = new Date(value)
  const now = new Date()
  const diff = Math.ceil((then.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'Overdue'
  if (diff === 0) return 'Today'
  return `${diff} day${diff === 1 ? '' : 's'}`
}

function statusBadge(status: string) {
  if (status === 'done') return 'bg-emerald-100 text-emerald-700'
  if (status === 'warn') return 'bg-amber-100 text-amber-700'
  return 'bg-slate-100 text-slate-700'
}

function deadlineColor(date: string, urgent: boolean) {
  const then = new Date(date)
  const now = new Date()
  const diff = (then.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (diff < 1 || urgent) return 'text-rose-600 bg-rose-50'
  if (diff < 3) return 'text-amber-700 bg-amber-50'
  return 'text-emerald-700 bg-emerald-50'
}

export default function PracticeHubPage() {
  const router = useRouter()
  const [stats, setStats] = useState<PracticeStats | null>(null)
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([])
  const [clients, setClients] = useState<ClientItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const [dashboardRes, statsRes, activityRes, deadlinesRes, clientsRes] = await Promise.all([
        apiClient.get<DashboardResponse>('/api/practice-hub/dashboard'),
        apiClient.get<PracticeStats>('/api/practice-hub/stats'),
        apiClient.get<ActivityItem[]>('/api/practice-hub/activity'),
        apiClient.get<DeadlineItem[]>('/api/practice-hub/deadlines'),
        apiClient.get<ClientItem[]>('/api/practice-hub/clients'),
      ])

      setDashboard(dashboardRes.data)
      setStats(statsRes.data)
      setActivity(activityRes.data)
      setDeadlines(deadlinesRes.data)
      setClients(clientsRes.data.slice(0, 5))
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Unable to load practice hub data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const hasData = !!dashboard || !!stats

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[28px] border border-emerald-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Practice Hub</p>
              <h1 className="mt-3 text-4xl font-bold text-slate-950">
                Welcome back{dashboard?.practiceName ? `, ${dashboard.practiceName}` : ''}
              </h1>
              <p className="mt-3 text-sm text-slate-500">Here's your practice overview with tasks, deadlines, and client activity.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={loadData}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={() => {}}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Practice Settings
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-3xl border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">Unable to load dashboard</p>
                <p className="mt-1 text-slate-700">{error}</p>
              </div>
              <button
                type="button"
                onClick={loadData}
                className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {['Active Clients', 'Open Tasks', 'Pending Reviews', 'Completed This Month'].map((label, index) => {
            const cardData = {
              'Active Clients': {
                icon: Users,
                value: stats?.activeClients ?? dashboard?.stats.activeClients ?? 0,
                sub: 'Total active client engagements',
              },
              'Open Tasks': {
                icon: ClipboardCheck,
                value: stats?.openTasks ?? dashboard?.stats.openTasks ?? 0,
                sub: 'Tasks still in progress',
              },
              'Pending Reviews': {
                icon: AlertCircle,
                value: stats?.pendingReviews ?? dashboard?.stats.pendingReviews ?? 0,
                sub: 'Items awaiting review',
              },
              'Completed This Month': {
                icon: CheckCircle2,
                value: stats?.completedMtd ?? dashboard?.stats.completedMtd ?? 0,
                sub: 'Tasks finished this month',
              },
            }[label]

            const Icon = cardData.icon
            const value = cardData.value
            return (
              <motion.div
                key={label}
                whileHover={{ y: -4 }}
                className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                    <Icon size={20} />
                  </div>
                </div>
                <p className="mt-6 text-4xl font-bold text-slate-950">{loading ? '—' : value}</p>
                <p className="mt-3 text-sm text-slate-500">{cardData.sub}</p>
              </motion.div>
            )
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Recent Activity</h2>
                <p className="text-sm text-slate-500">Latest practice tasks and client updates.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {activity.length} items
              </span>
            </div>

            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse rounded-3xl border border-slate-100 bg-slate-50 p-5">
                    <div className="h-4 w-1/3 rounded-full bg-slate-200" />
                    <div className="mt-4 h-3 w-2/3 rounded-full bg-slate-200" />
                    <div className="mt-3 h-3 w-1/2 rounded-full bg-slate-200" />
                  </div>
                ))
              ) : activity.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                  <p className="text-sm font-semibold">No recent activity</p>
                  <p className="mt-2 text-xs">Check back once tasks or client work starts arriving.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activity.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{item.action}</p>
                          <p className="mt-1 text-sm text-slate-500">{item.client}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{formatDate(item.time)}</span>
                          <span className={`rounded-full px-2 py-1 ${statusBadge(item.status)}`}>
                            {item.status === 'done' ? 'Completed' : item.status === 'warn' ? 'Review' : 'Active'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Upcoming Deadlines</h2>
                <p className="text-sm text-slate-500">Stay ahead of important practice milestones.</p>
              </div>
              <Calendar size={20} className="text-emerald-600" />
            </div>

            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse rounded-3xl border border-slate-100 bg-slate-50 p-5" />
                ))
              ) : deadlines.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                  <p className="text-sm font-semibold">No upcoming deadlines</p>
                  <p className="mt-2 text-xs">You're clear for now. Keep tracking progress from the dashboard.</p>
                </div>
              ) : (
                deadlines.map((deadline) => (
                  <div key={deadline.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{deadline.label}</p>
                        <p className="mt-1 text-sm text-slate-500">{formatDate(deadline.date)}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${deadlineColor(deadline.date, deadline.urgent)}`}>
                        {formatRelativeDays(deadline.date)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Your Clients</h2>
              <p className="text-sm text-slate-500">A quick view of active engagements in your practice.</p>
            </div>
            <button
              type="button"
              onClick={() => {}}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
            >
              View All <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="animate-pulse rounded-3xl border border-slate-100 bg-slate-50 p-5 h-40" />
              ))
            ) : clients.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500 col-span-full">
                <p className="text-sm font-semibold">No active clients found</p>
                <p className="mt-2 text-xs">Once you connect clients, they will appear here for quick access.</p>
              </div>
            ) : (
              clients.map((client) => (
                <div key={client.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-slate-950">{client.companyName}</p>
                      <p className="mt-1 text-sm text-slate-500">{client.engagementName}</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                      Active
                    </div>
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-emerald-500" />
                      <span>{client.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-slate-400" />
                      <span>Started {formatDate(client.startDate)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
