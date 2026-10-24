'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarRange,
  ChevronRight,
  CircleHelp,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react'
import apiClient from '@/lib/api-client'

const primaryGroups = ['Home', 'Clients', 'Work Mgmt', 'Workspace', 'Billing', 'Team', 'Analytics', 'Settings'] as const

const normalizePrimaryGroupButton = (group: string) => group.trim()

const navItemsByGroup: Record<string, Array<{ title: string }>> = {
  Home: [
    { title: 'Practice Dashboard' },
    { title: 'Practice Health' },
    { title: 'Shortcuts' },
  ],
  Clients: [
    { title: 'My Clients' },
    { title: 'Client Onboarding' },
    { title: 'Client Documents' },
    { title: 'Client Relationships' },
    { title: 'Communications' },
  ],
  'Work Mgmt': [
    { title: 'Work Queue' },
    { title: 'Work in Progress (WIP)' },
    { title: 'Calendar' },
  ],
  Workspace: [
    { title: 'Books Review' },
    { title: 'Reconciliation Hub' },
    { title: 'Adjusting Entries' },
    { title: 'Client Requests' },
  ],
  Billing: [
    { title: 'Invoice List' },
    { title: 'Rate Cards' },
  ],
  Team: [{ title: 'Team Members' }],
  Analytics: [{ title: 'Client Reports' }],
  Settings: [
    { title: 'Details' },
    { title: 'Subscriptions' },
    { title: 'Templates' },
    { title: 'Integrations' },
  ],
}

const getDocumentationTitle = (itemTitle: string) => {
  switch (itemTitle) {
    case 'Client Relationships':
      return 'Client CRM & Leads'
    case 'Work in Progress (WIP)':
      return 'WIP Ledger'
    case 'Details':
      return 'Practice Profile'
    case 'Client Reports':
      return 'Client Analytics'
    default:
      return itemTitle
  }
}

function PracticeHubPage() {
  const [selectedGroup, setSelectedGroup] = useState<string>('Home')
  const [selectedItem, setSelectedItem] = useState<string>('Practice Dashboard')
  const [isSecondaryVisible, setIsSecondaryVisible] = useState(true)
  const [helpModal, setHelpModal] = useState<null | 'dashboard' | 'clients' | 'documentation'>(null)
  const [documentationTitle, setDocumentationTitle] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    activeClients: 0,
    openTasks: 0,
    pendingReviews: 0,
    completedMtd: 0,
  })
  const [clients, setClients] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [deadlines, setDeadlines] = useState<any[]>([])

  const activeItems = useMemo(() => navItemsByGroup[selectedGroup] ?? navItemsByGroup.Home, [selectedGroup])
  const currentItem = useMemo(
    () => activeItems.find((item) => item.title === selectedItem) ?? activeItems[0],
    [activeItems, selectedItem],
  )

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const [dashboardRes, statsRes, activityRes, deadlinesRes, clientsRes] = await Promise.all([
        apiClient.get('/api/practice-hub/dashboard'),
        apiClient.get('/api/practice-hub/stats'),
        apiClient.get('/api/practice-hub/activity'),
        apiClient.get('/api/practice-hub/deadlines'),
        apiClient.get('/api/practice-hub/clients'),
      ])

      setStats((statsRes?.data ?? {}) as typeof stats)
      setActivity(activityRes?.data ?? [])
      setDeadlines(deadlinesRes?.data ?? [])
      setClients((clientsRes?.data ?? []).slice(0, 5))
      if (dashboardRes?.data?.practiceName) {
        setSelectedItem('Practice Dashboard')
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Unable to load practice hub data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const sectionHeading =
    selectedGroup === 'Clients' && currentItem.title === 'My Clients' ? 'Clients' : currentItem.title

  const handleGroupSelect = (group: string) => {
    setSelectedGroup(group)
    const nextItem = navItemsByGroup[group]?.[0]?.title ?? 'Practice Dashboard'
    setSelectedItem(nextItem)
  }

  const primarySidebar = (
    <aside className="w-[260px] shrink-0 border-r border-slate-200 bg-slate-50 p-3">
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
            <LayoutDashboard size={16} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Workspace</p>
          </div>
        </div>
        <button
          type="button"
          title="Close panel"
          aria-label="Close panel"
          onClick={() => setIsSecondaryVisible(false)}
          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:bg-slate-100"
        >
          <ChevronRight size={16} className="rotate-180" />
        </button>
      </div>

      <nav className="space-y-2" aria-label="Practice hub navigation">
        {primaryGroups.map((group) => {
          const isActive = selectedGroup === group
          return (
            <div key={group}>
              <button
                type="button"
                title={normalizePrimaryGroupButton(group)}
                aria-label={normalizePrimaryGroupButton(group)}
                onClick={() => handlePrimaryGroupHeaderClick(group)}
                className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left transition ${
                  isActive
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-[0.24em]">{group}</span>
                <ChevronRight
                  size={14}
                  className={isActive ? 'rotate-90 text-emerald-700' : 'text-slate-400'}
                />
              </button>

              {isActive && (
                <div className="mt-2 space-y-1 pl-3">
                  {navItemsByGroup[group].map((item) => {
                    const active = item.title === currentItem.title
                    return (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => setSelectedItem(item.title)}
                        className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                          active ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {item.title}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )

  const renderDashboardCards = () => {
    const cards = [
      {
        label: 'Active Clients',
        value: stats.activeClients,
        icon: Users,
        sub: 'Total active client engagements',
      },
      {
        label: 'Open Tasks',
        value: stats.openTasks,
        icon: BriefcaseBusiness,
        sub: 'Tasks still in progress',
      },
      {
        label: 'Pending Reviews',
        value: stats.pendingReviews,
        icon: CircleHelp,
        sub: 'Items awaiting review',
      },
      {
        label: 'Completed This Month',
        value: stats.completedMtd,
        icon: Sparkles,
        sub: 'Tasks finished this month',
      },
    ]

    return (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, icon: Icon, value, sub }) => (
          <motion.div
            key={label}
            whileHover={{ y: -2 }}
            className="rounded-[24px] border border-emerald-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{label}</span>
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                <Icon size={18} />
              </div>
            </div>
            <p className="mt-5 text-4xl font-bold text-slate-950">{loading ? '—' : value}</p>
            <p className="mt-2 text-sm text-slate-500">{sub}</p>
          </motion.div>
        ))}
      </section>
    )
  }

  const renderDashboardContent = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">Practice Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">A quick view of service health, work, and client momentum.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Refresh dashboard"
            title="Refresh dashboard"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Refresh dashboard
          </button>
          <button
            type="button"
            aria-label="Refresh clients"
            title="Refresh clients"
            className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Refresh clients
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      )}

      {renderDashboardCards()}

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-950">Recent activity</h3>
              <p className="text-sm text-slate-500">Latest practice tasks and client updates.</p>
            </div>
            <button
              type="button"
              aria-label="Open dashboard help"
              title="Open dashboard help"
              onClick={() => setHelpModal('dashboard')}
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              Help
            </button>
          </div>

          {activity.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              <p className="text-sm font-semibold">No recent activity</p>
              <p className="mt-2 text-xs">Check back once tasks or client work starts arriving.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activity.map((item) => (
                <div key={item.id ?? item.action} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.action}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.client}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                      {item.status ?? 'Active'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-950">Upcoming deadlines</h3>
              <p className="text-sm text-slate-500">Stay ahead of important milestones.</p>
            </div>
            <CalendarRange size={18} className="text-emerald-600" />
          </div>

          {deadlines.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              <p className="text-sm font-semibold">No upcoming deadlines</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deadlines.map((item) => (
                <div key={item.id ?? item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-sm text-slate-500">{item.date}</span>
                    {item.urgent && (
                      <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-700">
                        Urgent
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">My Clients</h3>
            <p className="text-sm text-slate-500">A quick view of active engagements in your practice.</p>
          </div>
          <button
            type="button"
            aria-label="View all clients"
            title="View all clients"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>

        {clients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
            <p className="text-sm font-semibold">No active clients found</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {clients.map((client) => (
              <div key={client.id ?? client.companyName} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{client.companyName ?? client.company ?? 'Client'}</p>
                    <p className="mt-1 text-sm text-slate-500">{client.engagementName ?? client.type ?? 'Engagement'}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )

  const renderClientList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">Clients</h2>
          <p className="mt-1 text-sm text-slate-500">Track client relationships, onboarding, and work across the practice.</p>
        </div>
        <button
          type="button"
          aria-label="Open client list help"
          title="Open client list help"
          onClick={() => setHelpModal('clients')}
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
        >
          Help
        </button>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-950">My Clients</h3>
          <span className="text-sm text-slate-500">{clients.length} active</span>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
          <p className="text-sm font-semibold">No clients match your filters</p>
          <p className="mt-2 text-xs">Add or invite clients to begin building your active roster.</p>
        </div>
      </div>
    </div>
  )

  const renderDocsView = () => {
    const title = currentItem.title
    const docsTitle = getDocumentationTitle(title)
    const handleDocsHelp = () => {
      setDocumentationTitle(docsTitle)
      setHelpModal('documentation')
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-950">{docsTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">This workspace is currently being prepared for this module.</p>
          </div>
          <button
            type="button"
            aria-label={`Open documentation for ${docsTitle}`}
            title={`Open documentation for ${docsTitle}`}
            onClick={handleDocsHelp}
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            Help
          </button>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-600">Content is coming soon.</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (selectedGroup === 'Home' && currentItem.title === 'Practice Dashboard') {
      return renderDashboardContent()
    }

    if (selectedGroup === 'Clients' && currentItem.title === 'My Clients') {
      return renderClientList()
    }

    return renderDocsView()
  }

  const handlePrimaryGroupHeaderClick = (group: string) => {
    handleGroupSelect(group)
    if (group === 'Clients' && selectedGroup !== 'Clients') {
      setSelectedItem('My Clients')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[30px] border border-emerald-100 bg-white shadow-sm">
        <div className="flex min-h-[780px]">
          {isSecondaryVisible ? primarySidebar : null}

          <main className="flex-1">
            <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
              <div className="flex items-center gap-3">
                {!isSecondaryVisible && (
                  <button
                    type="button"
                    title="Open navigation"
                    aria-label="Open navigation"
                    onClick={() => setIsSecondaryVisible(true)}
                    className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100"
                  >
                    <ChevronRight size={16} className="rotate-180" />
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                    <LayoutDashboard size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.32em] text-slate-400">Haypbooks</p>
                    <h1 className="text-2xl font-bold text-slate-950">Practice Hub</h1>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    aria-label="Search clients, tasks, reports"
                    placeholder="Search clients, tasks, reports"
                    className="w-[280px] rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Support
                </button>
              </div>
            </header>

            <div className="bg-slate-50 p-6">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>

      {helpModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-slate-950">
                {helpModal === 'dashboard'
                  ? 'Practice Dashboard Help'
                  : helpModal === 'clients'
                    ? 'Client List Help'
                    : `Documentation - ${documentationTitle ?? 'Page'}`}
              </h2>
              <button
                type="button"
                aria-label={helpModal === 'documentation' ? 'Close documentation modal' : 'Close'}
                title={helpModal === 'documentation' ? 'Close documentation modal' : 'Close'}
                onClick={() => setHelpModal(null)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {helpModal === 'documentation' ? 'Close documentation modal' : 'Close'}
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-600">
              <p>
                {helpModal === 'dashboard'
                  ? 'Use this dashboard to monitor client activity, open work items, review workflows, and keep your practice on track.'
                  : helpModal === 'clients'
                    ? 'The client list helps you manage active engagements, onboarding tasks, and recent client communications.'
                    : `This documentation panel is a placeholder for ${documentationTitle}.`}
              </p>
              <p>
                {helpModal === 'documentation'
                  ? 'Content will be added here as this workspace is completed.'
                  : 'It is designed to give you a quick operational overview without leaving the page.'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default PracticeHubPage
