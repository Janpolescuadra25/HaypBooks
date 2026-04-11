'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, ChevronDown, Clock, Search } from 'lucide-react'
import { auditLog, type AuditLogEntry } from '../mockGLState'

type ActivityFilter =
  | 'all'
  | 'categorized'
  | 'matched'
  | 'split'
  | 'transfer'
  | 'excluded'
  | 'rules'
  | 'undo'
  | 'edits'
  | 'reconciliations'
  | 'manual'
  | 'deleted'

const PAGE_SIZE = 50
const FILTERS: Array<{ value: ActivityFilter; label: string }> = [
  { value: 'all', label: 'All Activity' },
  { value: 'categorized', label: 'Categorized' },
  { value: 'matched', label: 'Matched' },
  { value: 'split', label: 'Split' },
  { value: 'transfer', label: 'Transfers' },
  { value: 'excluded', label: 'Excluded' },
  { value: 'rules', label: 'Rules' },
  { value: 'undo', label: 'Undo' },
  { value: 'edits', label: 'Edits' },
  { value: 'reconciliations', label: 'Reconciliations' },
  { value: 'manual', label: 'Manual Entries' },
  { value: 'deleted', label: 'Deleted' },
]

function timeAgo(timestamp: string): string {
  const diffMs = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(timestamp).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatAction(action: AuditLogEntry['action']): string {
  return action
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

function matchesFilter(entry: AuditLogEntry, filter: ActivityFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'rules') return entry.action.startsWith('rule')
  if (filter === 'undo') return ['unmatched', 'unsplitted', 'untransferred', 'unexcluded'].includes(entry.action)
  if (filter === 'transfer') return entry.action === 'transferred' || entry.action === 'untransferred'
  if (filter === 'edits') return entry.action === 'edited'
  if (filter === 'reconciliations') return entry.action === 'reconciled' || entry.action === 'unreconciled'
  if (filter === 'manual') return entry.action === 'manual_entry'
  if (filter === 'deleted') return entry.action === 'deleted'
  return entry.action === filter || entry.action === `${filter}d`
}

function getDotClass(action: AuditLogEntry['action']): string {
  if (action === 'categorized') return 'bg-emerald-500'
  if (action === 'matched') return 'bg-blue-500'
  if (action === 'edited') return 'bg-sky-500'
  if (action === 'split' || action === 'unsplitted') return 'bg-violet-500'
  if (action === 'transferred' || action === 'untransferred') return 'bg-amber-500'
  if (action === 'reconciled') return 'bg-emerald-600'
  if (action === 'unreconciled') return 'bg-orange-500'
  if (action === 'manual_entry') return 'bg-slate-500'
  if (action === 'rule_created' || action === 'rule_applied') return 'bg-fuchsia-500'
  if (action === 'rule_updated') return 'bg-indigo-500'
  if (action === 'rule_deleted' || action === 'deleted') return 'bg-rose-500'
  return 'bg-slate-400'
}

function getBadgeClass(action: AuditLogEntry['action']): string {
  if (action === 'categorized') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (action === 'matched') return 'bg-blue-50 text-blue-700 border-blue-200'
  if (action === 'edited') return 'bg-sky-50 text-sky-700 border-sky-200'
  if (action === 'split' || action === 'unsplitted') return 'bg-violet-50 text-violet-700 border-violet-200'
  if (action === 'transferred' || action === 'untransferred') return 'bg-amber-50 text-amber-700 border-amber-200'
  if (action === 'reconciled' || action === 'unreconciled') return 'bg-lime-50 text-lime-700 border-lime-200'
  if (action === 'rule_created' || action === 'rule_applied' || action === 'rule_updated') return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200'
  if (action === 'rule_deleted' || action === 'deleted') return 'bg-rose-50 text-rose-700 border-rose-200'
  return 'bg-slate-50 text-slate-700 border-slate-200'
}

export default function ActivityPage() {
  const router = useRouter()
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all')
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [activityFilter, search])

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase()

    return [...auditLog]
      .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
      .filter(entry => matchesFilter(entry, activityFilter))
      .filter(entry => {
        if (!query) return true
        return [
          entry.action,
          entry.entityDescription,
          entry.details,
          entry.oldValue ?? '',
          entry.newValue ?? '',
          entry.userName,
          entry.entityId,
        ].some(value => value.toLowerCase().includes(query))
      })
  }, [activityFilter, search])

  const visibleEntries = filteredEntries.slice(0, visibleCount)
  const latestEntry = filteredEntries[0] ?? null
  const ruleActivityCount = filteredEntries.filter(entry => entry.action.startsWith('rule')).length
  const reconciliationCount = filteredEntries.filter(entry => entry.action === 'reconciled' || entry.action === 'unreconciled').length

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <button
            onClick={() => router.back()}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Banking & Cash / Bank Transactions</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">Activity Log</h1>
              <p className="mt-1 text-sm text-slate-500">A full audit trail for categorizations, matches, rules, edits, reconciliation, and register changes.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => router.push('/banking-cash/transactions')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Clock className="h-4 w-4" />
                Bank Transactions
              </button>
              <button
                onClick={() => router.push('/banking-cash/transactions/register')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <BookOpen className="h-4 w-4" />
                Bank Register
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-4 px-6 py-6">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_180px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              aria-label="Search activity log"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search description, details, user, or value changes..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 shadow-sm outline-none ring-0"
            />
          </label>

          <label className="relative block">
            <select
              aria-label="Filter activity log"
              value={activityFilter}
              onChange={event => setActivityFilter(event.target.value as ActivityFilter)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm text-slate-700 shadow-sm outline-none ring-0"
            >
              {FILTERS.map(filter => (
                <option key={filter.value} value={filter.value}>{filter.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </label>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Showing</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{visibleEntries.length} / {filteredEntries.length}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Current Filter</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{FILTERS.find(filter => filter.value === activityFilter)?.label}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Rule Activity</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{ruleActivityCount} entries</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Latest Update</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{latestEntry ? timeAgo(latestEntry.timestamp) : 'No activity'}</p>
            <p className="mt-1 text-xs text-slate-400">{reconciliationCount} reconciliation events in view</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {visibleEntries.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-medium text-slate-500">No activity matches the current filters.</p>
              <p className="mt-1 text-xs text-slate-400">Try clearing the search or switching to a broader activity filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {visibleEntries.map(entry => (
                <div key={entry.id} className="px-6 py-5">
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${getDotClass(entry.action)}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getBadgeClass(entry.action)}`}>
                          {formatAction(entry.action)}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">{entry.entityDescription}</span>
                      </div>

                      <p className="mt-2 text-sm text-slate-700">{entry.details}</p>

                      {(entry.oldValue || entry.newValue) && (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {entry.oldValue && (
                            <span className="rounded-full bg-rose-50 px-2.5 py-1 font-medium text-rose-700">
                              From: {entry.oldValue}
                            </span>
                          )}
                          {entry.newValue && (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                              To: {entry.newValue}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span>{entry.userName}</span>
                        <span>{timeAgo(entry.timestamp)}</span>
                        <span>{new Date(entry.timestamp).toLocaleString('en-PH')}</span>
                        <span>ID: {entry.entityId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredEntries.length > visibleEntries.length && (
            <div className="border-t border-slate-100 px-6 py-4 text-center">
              <button
                onClick={() => setVisibleCount(current => current + PAGE_SIZE)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Load 50 More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}