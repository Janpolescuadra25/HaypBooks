'use client'
import { useState, useMemo } from 'react'
import { X, ListChecks, ChevronDown, ChevronRight, Search } from 'lucide-react'

// ─── Practice Hub NAV structure (mirrors page.tsx NAV) ────────────────────────
interface NavItem { key: string; label: string }
interface NavSection { key: string; label: string; items: NavItem[] }

const PRACTICE_NAV: NavSection[] = [
  {
    key: 'home', label: 'Home',
    items: [
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'practice-health', label: 'Practice Health' },
      { key: 'performance', label: 'Performance' },
      { key: 'deadlines-home', label: 'Deadlines' },
      { key: 'shortcuts', label: 'Shortcuts' },
      { key: 'setup-center', label: 'Setup Center' },
      { key: 'notifications', label: 'Notifications Inbox' },
      { key: 'help', label: 'Help & Support' },
    ],
  },
  {
    key: 'clients', label: 'Clients',
    items: [
      { key: 'client-list', label: 'My Clients' },
      { key: 'client-onboarding', label: 'Client Onboarding' },
      { key: 'client-documents', label: 'Client Documents' },
      { key: 'client-portal', label: 'Client Portal' },
      { key: 'client-crm', label: 'Client CRM' },
      { key: 'client-groups', label: 'Client Groups' },
      { key: 'client-transitions', label: 'Client Transitions' },
      { key: 'communications', label: 'Communications' },
    ],
  },
  {
    key: 'work', label: 'Work Mgmt',
    items: [
      { key: 'work-queue', label: 'Work Queue' },
      { key: 'monthly-close', label: 'Monthly Close' },
      { key: 'annual-engagements', label: 'Annual Engagements' },
      { key: 'work-in-progress', label: 'WIP Ledger' },
      { key: 'calendar', label: 'Calendar' },
      { key: 'deadline-tracker', label: 'Deadline Tracker' },
    ],
  },
  {
    key: 'accountant', label: 'Workspace',
    items: [
      { key: 'books-review', label: 'Books Review' },
      { key: 'reconciliation', label: 'Reconciliation Hub' },
      { key: 'adjusting', label: 'Adjusting Entries' },
      { key: 'client-requests', label: 'Client Requests' },
      { key: 'audit-trail', label: 'Audit Trail' },
      { key: 'period-close', label: 'Period Close' },
      { key: 'expert-help', label: 'Expert Help' },
    ],
  },
  {
    key: 'billing', label: 'Billing',
    items: [
      { key: 'invoice-generation', label: 'Generate Invoices' },
      { key: 'invoice-list', label: 'Invoice List' },
      { key: 'recurring-billing', label: 'Recurring Billing' },
      { key: 'payment-tracking', label: 'Payment Tracking' },
      { key: 'rate-cards', label: 'Rate Cards' },
      { key: 'retainers', label: 'Retainers' },
      { key: 'collections', label: 'Collections' },
      { key: 'write-offs', label: 'Write-offs' },
    ],
  },
  {
    key: 'analytics', label: 'Analytics',
    items: [
      { key: 'practice-overview', label: 'Practice Overview' },
      { key: 'client-analytics', label: 'Client Analytics' },
      { key: 'staff-reports', label: 'Staff Reports' },
      { key: 'billing-reports', label: 'Billing Reports' },
      { key: 'work-reports', label: 'Work Reports' },
      { key: 'financial-reports', label: 'Financial Reports' },
    ],
  },
  {
    key: 'team', label: 'Team',
    items: [
      { key: 'team-members', label: 'Team Members' },
      { key: 'time-off', label: 'Time Off' },
      { key: 'schedule', label: 'Schedule' },
      { key: 'team-performance', label: 'Performance' },
      { key: 'team-capacity', label: 'Capacity View' },
    ],
  },
  {
    key: 'communication', label: 'Communication',
    items: [
      { key: 'team-chat', label: 'Team Chat' },
      { key: 'client-communication', label: 'Client Messages' },
      { key: 'announcements', label: 'Announcements' },
      { key: 'document-collab', label: 'Document Collaboration' },
      { key: 'comm-settings', label: 'Comm Settings' },
    ],
  },
  {
    key: 'settings', label: 'Settings',
    items: [
      { key: 'profile', label: 'Practice Profile' },
      { key: 'team-management', label: 'Team Management' },
      { key: 'templates', label: 'Templates' },
      { key: 'automation', label: 'Automation' },
      { key: 'integrations', label: 'Integrations' },
      { key: 'subscriptions', label: 'Subscriptions' },
      { key: 'security', label: 'Security' },
      { key: 'data-management', label: 'Data Management' },
      { key: 'localization', label: 'Localization' },
    ],
  },
]

// ─── Pages with real content (key format: "sectionKey:itemKey") ───────────────
const BUILT_KEYS = new Set([
  'home:dashboard',
  'clients:client-list',
])

// ─── Recommended build priority order ────────────────────────────────────────
const PRIORITY_ORDER = [
  'home',
  'clients',
  'work',
  'accountant',
  'billing',
  'analytics',
  'team',
  'communication',
  'settings',
]

// ─── Types ───────────────────────────────────────────────────────────────────
type Filter = 'all' | 'built' | 'pending'

interface Props {
  open: boolean
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PracticeProgressChecklist({ open, onClose }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const orderedSections = useMemo(() => {
    return [...PRACTICE_NAV].sort((a, b) => {
      const ia = PRIORITY_ORDER.indexOf(a.key)
      const ib = PRIORITY_ORDER.indexOf(b.key)
      return ia - ib
    })
  }, [])

  const totalPages = useMemo(
    () => orderedSections.reduce((sum, s) => sum + s.items.length, 0),
    [orderedSections],
  )

  const builtCount = BUILT_KEYS.size
  const progressPct = totalPages > 0 ? Math.round((builtCount / totalPages) * 100) : 0

  function toggleSection(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <ListChecks size={20} className="text-green-400 shrink-0" />
                <h2 className="text-lg font-black tracking-tight text-white">Development Checklist</h2>
                <span className="text-[9px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full uppercase tracking-widest">Practice Hub</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                {builtCount} of {totalPages} pages have content · {progressPct}% complete
              </p>
              {/* Progress bar */}
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div
                  className="bg-green-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 mt-0.5 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
              aria-label="Close checklist"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Filter Tabs + Search ── */}
        <div className="px-6 py-3 border-b border-slate-700 bg-slate-800/50 shrink-0 space-y-2">
          <div className="flex items-center gap-1 flex-wrap">
            {(['all', 'built', 'pending'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === f
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All' : f === 'built' ? '🟢 Has Content' : '⚫ No Content'}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search pages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
            />
          </div>
        </div>

        {/* ── Section List ── */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {orderedSections.map((section, idx) => {
            const q = search.toLowerCase()
            const filteredItems = section.items.filter((item) => {
              const compositeKey = `${section.key}:${item.key}`
              const isBuilt = BUILT_KEYS.has(compositeKey)
              if (filter === 'built' && !isBuilt) return false
              if (filter === 'pending' && isBuilt) return false
              if (q && !item.label.toLowerCase().includes(q) && !item.key.toLowerCase().includes(q)) return false
              return true
            })
            if (filteredItems.length === 0) return null

            const sectionBuiltCount = section.items.filter((i) => BUILT_KEYS.has(`${section.key}:${i.key}`)).length
            const isCollapsed = collapsed.has(section.key)
            const priority = idx + 1

            return (
              <div key={section.key} className="border border-slate-700 rounded-xl overflow-hidden">

                {/* Section header */}
                <button
                  onClick={() => toggleSection(section.key)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-700/60 transition-colors text-left"
                >
                  <span className="w-6 h-6 bg-green-500/20 text-green-400 rounded-full text-[10px] font-black flex items-center justify-center shrink-0">
                    {priority}
                  </span>
                  <span className="font-bold text-sm text-white flex-1 truncate">{section.label}</span>
                  <span className="text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {sectionBuiltCount}/{section.items.length}
                  </span>
                  {isCollapsed
                    ? <ChevronRight size={13} className="text-slate-500 shrink-0" />
                    : <ChevronDown size={13} className="text-slate-500 shrink-0" />
                  }
                </button>

                {/* Page rows */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-700/60">
                    {filteredItems.map((item) => {
                      const compositeKey = `${section.key}:${item.key}`
                      const isBuilt = BUILT_KEYS.has(compositeKey)
                      return (
                        <div key={compositeKey} className="flex items-center gap-3 px-4 py-2.5 bg-slate-900 hover:bg-slate-800/40 transition-colors">
                          {/* Status dot */}
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${isBuilt ? 'bg-green-400' : 'bg-slate-600'}`}
                            title={isBuilt ? 'Has Content' : 'No Content'}
                          />

                          {/* Label + key */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold truncate ${isBuilt ? 'text-white' : 'text-slate-400'}`}>
                              {item.label}
                            </p>
                            <p className="text-[10px] text-slate-600 font-mono truncate">{compositeKey}</p>
                          </div>

                          {/* Status pill */}
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${
                              isBuilt
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-slate-700 text-slate-500 border border-slate-600'
                            }`}
                          >
                            {isBuilt ? '🟢 Has Content' : '⚫ Pending'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-2 border-t border-slate-700 bg-slate-800/50 shrink-0 text-center">
          <p className="text-[10px] text-slate-600">Status is auto-detected · Read-only view</p>
        </div>

      </div>
    </div>
  )
}
