'use client'
import { useState, useMemo } from 'react'
import { X, ListChecks, ChevronDown, ChevronRight, Search } from 'lucide-react'
import { navigationData, NavItem } from './ownerNavConfig'

// ─── Pages with real content (auto-detected / hardcoded) ─────────────────────
const BUILT_PATHS = new Set([
  '/home/dashboard',
  '/accounting/core-accounting/chart-of-accounts',
  '/banking-cash/cash-accounts/bank-accounts',
  '/sales/customers/customers',
  '/sales/billing/invoices',
  '/sales/collections/customer-payments',
])

// ─── Recommended build priority order ────────────────────────────────────────
const PRIORITY_ORDER = [
  'HOME',
  'ACCOUNTING',
  'BANKING & CASH',
  'SALES',
  'EXPENSES',
  'REPORTING',
  'TASKS & APPROVALS',
  'ORGANIZATION',
  'INVENTORY',
  'PROJECTS',
  'TIME',
  'PAYROLL & WORKFORCE',
  'TAXES',
  'COMPLIANCE',
  'AUTOMATION',
  'MY ACCOUNTANT',
  'APPS',
  'AI & ANALYTICS',
  'SETTINGS',
]

// ─── Leaf item type ───────────────────────────────────────────────────────────
interface LeafItem {
  title: string
  path: string
  breadcrumb: string // parent group chain (excludes leaf title itself)
}

// Recursively collect all leaf items (items with a path)
function flattenLeaves(items: NavItem[] | undefined, parentCrumb = ''): LeafItem[] {
  const result: LeafItem[] = []
  if (!items?.length) return result
  for (const item of items) {
    if (item.path) {
      result.push({ title: item.title, path: item.path, breadcrumb: parentCrumb })
    }
    if (item.items?.length) {
      const crumb = parentCrumb ? `${parentCrumb} › ${item.title}` : item.title
      result.push(...flattenLeaves(item.items, crumb))
    }
  }
  return result
}

// ─── Types ───────────────────────────────────────────────────────────────────
type Filter = 'all' | 'built' | 'pending'

interface Props {
  open: boolean
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function OwnerProgressChecklist({ open, onClose }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  // Sort sections by recommended priority
  const orderedSections = useMemo(() => {
    return [...navigationData].sort((a, b) => {
      const ia = PRIORITY_ORDER.indexOf(a.title)
      const ib = PRIORITY_ORDER.indexOf(b.title)
      if (ia === -1 && ib === -1) return 0
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
  }, [])

  const totalLeaves = useMemo(
    () => orderedSections.reduce((sum, s) => {
      const fromItems = flattenLeaves(s.items)
      const fromGroups = s.groups?.flatMap((g) => flattenLeaves(g.items)) || []
      return sum + fromItems.length + fromGroups.length
    }, 0),
    [orderedSections],
  )

  const builtCount = BUILT_PATHS.size
  const progressPct = totalLeaves > 0 ? Math.round((builtCount / totalLeaves) * 100) : 0

  function toggleSection(title: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-emerald-950 text-white px-6 py-4 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <ListChecks size={20} className="text-emerald-400 shrink-0" />
                <h2 className="text-lg font-black tracking-tight">Development Checklist</h2>
              </div>
              <p className="text-xs text-emerald-400 mb-3">
                {builtCount} of {totalLeaves} pages have content · {progressPct}% complete
              </p>
              {/* Progress bar */}
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 mt-0.5 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
              aria-label="Close checklist"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Filter Tabs + Search ── */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50 shrink-0 space-y-2">
          <div className="flex items-center gap-1 flex-wrap">
            {(['all', 'built', 'pending'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === f
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? 'All' : f === 'built' ? '🟢 Has Content' : '⚫ No Content'}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search pages or paths…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
            />
          </div>
        </div>

        {/* ── Section List ── */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {orderedSections.map((section, idx) => {
            const fromItems = flattenLeaves(section.items)
            const fromGroups = section.groups?.flatMap((g) => flattenLeaves(g.items)) || []
            const allLeaves = [...fromItems, ...fromGroups]
            const q = search.toLowerCase()
            const filteredLeaves = allLeaves.filter((leaf) => {
              const isBuilt = BUILT_PATHS.has(leaf.path)
              if (filter === 'built' && !isBuilt) return false
              if (filter === 'pending' && isBuilt) return false
              if (q && !leaf.title.toLowerCase().includes(q) && !leaf.path.toLowerCase().includes(q)) return false
              return true
            })
            if (filteredLeaves.length === 0) return null

            const sectionBuiltCount = allLeaves.filter((l) => BUILT_PATHS.has(l.path)).length
            const isCollapsed = collapsed.has(section.title)
            const priority = idx + 1

            return (
              <div key={section.title} className="border border-slate-200 rounded-xl overflow-hidden">

                {/* Section header row */}
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                >
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black flex items-center justify-center shrink-0">
                    {priority}
                  </span>
                  <span className="font-bold text-sm text-slate-800 flex-1 truncate">{section.title}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {sectionBuiltCount}/{allLeaves.length}
                  </span>
                  {isCollapsed
                    ? <ChevronRight size={14} className="text-slate-400 shrink-0" />
                    : <ChevronDown size={14} className="text-slate-400 shrink-0" />
                  }
                </button>

                {/* Page rows */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-100">
                    {filteredLeaves.map((leaf) => {
                      const isBuilt = BUILT_PATHS.has(leaf.path)
                      return (
                        <div key={leaf.path} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50/60">
                          {/* Status dot */}
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${isBuilt ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            title={isBuilt ? 'Has Content' : 'No Content'}
                          />

                          {/* Title + breadcrumb + path */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold truncate ${isBuilt ? 'text-slate-800' : 'text-slate-500'}`}>
                              {leaf.title}
                            </p>
                            {leaf.breadcrumb && (
                              <p className="text-[10px] text-slate-400 truncate">{leaf.breadcrumb}</p>
                            )}
                            <p className="text-[10px] text-slate-300 font-mono truncate">{leaf.path}</p>
                          </div>

                          {/* Status pill */}
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${
                              isBuilt
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-400'
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
        <div className="px-6 py-2.5 border-t border-slate-100 bg-slate-50 shrink-0 text-center">
          <p className="text-[10px] text-slate-400">Status is auto-detected · Read-only view</p>
        </div>

      </div>
    </div>
  )
}
