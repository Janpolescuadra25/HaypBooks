'use client'
export const dynamic = 'force-dynamic'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle2, FileEdit, Ban, FilePlus, User, ChevronDown, ChevronUp } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface ActivityLine {
  id: string
  fieldName: string
  oldValue: string | null
  newValue: string | null
  changeType: 'CREATE' | 'UPDATE' | 'DELETE'
}

interface ActivityEvent {
  id: string
  action: string
  createdAt: string
  user: { id: string; name: string; email?: string } | null
  changes: Record<string, any> | null
  lines: ActivityLine[]
  synthetic?: boolean
}

interface JEEntry {
  id: string
  entryNumber?: string
  date: string
  description?: string
  postingStatus: string
  createdAt: string
  updatedAt?: string
  createdBy?: { id: string; name: string } | null
  updatedBy?: { id: string; name: string } | null
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const ACTION_META: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  CREATE: { label: 'Created', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: FilePlus },
  UPDATE: { label: 'Edited', color: 'bg-blue-100 text-blue-700 border-blue-200', Icon: FileEdit },
  POST:   { label: 'Posted', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  VOID:   { label: 'Voided', color: 'bg-red-100 text-red-600 border-red-200', Icon: Ban },
}

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return d }
}

function initials(name: string) {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

const AVATAR_COLORS = [
  'bg-emerald-500', 'bg-blue-500', 'bg-violet-500',
  'bg-amber-500',   'bg-rose-500',  'bg-cyan-500',
]
function avatarColor(name: string) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length
  return AVATAR_COLORS[h]
}

/* ─── Field diff row ─────────────────────────────────────────────────────── */

function FieldDiff({ line }: { line: ActivityLine }) {
  const fieldLabel: Record<string, string> = {
    postingStatus: 'Status',
    date: 'Date',
    description: 'Memo',
    lines: 'Line items',
  }
  const label = fieldLabel[line.fieldName] ?? line.fieldName

  // parse lines JSON for a nicer table diff
  let oldLines: any[] | null = null
  let newLines: any[] | null = null
  if (line.fieldName === 'lines') {
    try { if (line.oldValue) oldLines = JSON.parse(line.oldValue) } catch {}
    try { if (line.newValue) newLines = JSON.parse(line.newValue) } catch {}
  }

  return (
    <div className="rounded-lg border border-gray-100 overflow-hidden text-xs">
      <div className="bg-gray-50 px-3 py-1.5 font-medium text-gray-600 uppercase tracking-wide text-[10px]">
        {label}
      </div>
      {line.fieldName === 'lines' ? (
        <div className="flex divide-x divide-gray-100">
          {/* Before */}
          <div className="flex-1 p-2">
            <div className="text-[10px] text-red-500 mb-1 font-semibold uppercase">Before</div>
            {oldLines ? (
              <table className="w-full">
                <tbody>
                  {oldLines.map((l, i) => (
                    <tr key={i} className="bg-red-50/60">
                      <td className="py-0.5 pr-2 font-mono text-[10px] text-gray-500">{l.accountId?.slice(0, 8)}</td>
                      <td className="py-0.5 pr-2 tabular-nums text-right text-red-700">{l.debit > 0 ? `Dr ${l.debit}` : ''}</td>
                      <td className="py-0.5 tabular-nums text-right text-red-700">{l.credit > 0 ? `Cr ${l.credit}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <span className="text-gray-300 italic">—</span>}
          </div>
          {/* After */}
          <div className="flex-1 p-2">
            <div className="text-[10px] text-emerald-600 mb-1 font-semibold uppercase">After</div>
            {newLines ? (
              <table className="w-full">
                <tbody>
                  {newLines.map((l, i) => (
                    <tr key={i} className="bg-emerald-50/60">
                      <td className="py-0.5 pr-2 font-mono text-[10px] text-gray-500">{l.accountId?.slice(0, 8)}</td>
                      <td className="py-0.5 pr-2 tabular-nums text-right text-emerald-700">{l.debit > 0 ? `Dr ${l.debit}` : ''}</td>
                      <td className="py-0.5 tabular-nums text-right text-emerald-700">{l.credit > 0 ? `Cr ${l.credit}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <span className="text-gray-300 italic">—</span>}
          </div>
        </div>
      ) : (
        <div className="flex divide-x divide-gray-100">
          {line.oldValue !== null && (
            <div className="flex-1 p-2 bg-red-50/40">
              <span className="text-[10px] text-red-500 font-semibold uppercase block mb-0.5">Before</span>
              <span className="line-through text-red-600">{line.oldValue || '—'}</span>
            </div>
          )}
          {line.newValue !== null && (
            <div className="flex-1 p-2 bg-emerald-50/40">
              <span className="text-[10px] text-emerald-600 font-semibold uppercase block mb-0.5">After</span>
              <span className="text-emerald-700 font-medium">{line.newValue || '—'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Event card ─────────────────────────────────────────────────────────── */

function EventCard({ event, isLast, isActive, onClick }: {
  event: ActivityEvent
  isLast: boolean
  isActive: boolean
  onClick: () => void
}) {
  const meta = ACTION_META[event.action] ?? { label: event.action, color: 'bg-gray-100 text-gray-600 border-gray-200', Icon: Clock }
  const { Icon } = meta
  const userName = event.user?.name ?? 'Unknown'

  return (
    <div className="relative pl-10">
      {/* Timeline dot */}
      <div className={`absolute left-0 top-3 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 ${isActive ? 'bg-emerald-600 text-white' : 'bg-white border-emerald-200'}`}>
        <Icon size={14} className={isActive ? 'text-white' : 'text-emerald-500'} />
      </div>
      {/* Vertical line */}
      {!isLast && <div className="absolute left-4 top-10 bottom-0 w-px bg-emerald-100" />}

      <button
        onClick={onClick}
        className={`w-full text-left rounded-xl border p-3 mb-3 transition-all ${isActive ? 'border-emerald-300 bg-emerald-50 shadow-sm' : 'border-gray-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/30'}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${avatarColor(userName)}`}>
              {initials(userName)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{userName}</p>
              <p className="text-[10px] text-gray-400">{fmtDate(event.createdAt)}</p>
            </div>
          </div>
          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.color}`}>
            {meta.label}
          </span>
        </div>
        {event.synthetic && (
          <p className="mt-1.5 text-[10px] text-gray-400 italic">Derived from record timestamps</p>
        )}
      </button>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function JournalEntryActivityPage() {
  const router = useRouter()
  const params = useParams() as { id?: string }
  const entryId = params.id
  const { companyId } = useCompanyId()

  const [loading, setLoading] = useState(true)
  const [entry, setEntry] = useState<JEEntry | null>(null)
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filterUserId, setFilterUserId] = useState<string | null>(null)
  const [showAllFields, setShowAllFields] = useState(false)

  const load = useCallback(async () => {
    if (!companyId || !entryId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(
        `/companies/${companyId}/accounting/journal-entries/${entryId}/activity`
      )
      setEntry(data.entry)
      const evs: ActivityEvent[] = data.events ?? []
      setEvents(evs)
      if (evs.length > 0) setSelectedId(evs[evs.length - 1].id)
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [companyId, entryId])

  useEffect(() => { load() }, [load])

  const allUsers = Array.from(
    new Map(events.filter(e => e.user).map(e => [e.user!.id, e.user!])).values()
  )

  const visibleEvents = filterUserId
    ? events.filter(e => e.user?.id === filterUserId)
    : events

  const selected = events.find(e => e.id === selectedId) ?? null

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => router.push(`/accounting/core-accounting/journal-entries/${entryId}`)}
          className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Activity Log</h1>
          <p className="text-xs text-gray-400">
            {entry ? `Journal Entry ${entry.entryNumber ?? entry.id.slice(0, 8)}` : ''}
            {entry?.description ? ` · ${entry.description}` : ''}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Person filter pills */}
          {allUsers.length > 1 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 mr-1">Filter:</span>
              <button
                onClick={() => setFilterUserId(null)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${!filterUserId ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-emerald-50'}`}
              >
                All
              </button>
              {allUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => setFilterUserId(filterUserId === u.id ? null : u.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${filterUserId === u.id ? `text-white ${avatarColor(u.name)}` : 'bg-gray-100 text-gray-600 hover:bg-emerald-50'}`}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${avatarColor(u.name)}`}>
                    {initials(u.name)}
                  </div>
                  {u.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Body: timeline left + detail right */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Timeline */}
        <div className="w-72 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-4">
          {visibleEvents.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No activity recorded yet.</p>
          ) : (
            visibleEvents.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                isLast={i === visibleEvents.length - 1}
                isActive={event.id === selectedId}
                onClick={() => setSelectedId(event.id)}
              />
            ))
          )}
        </div>

        {/* Right: Detail panel */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selected ? (
            <div className="h-full flex items-center justify-center text-gray-300 text-sm">
              Select an event to see details
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Header card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${avatarColor(selected.user?.name ?? 'Unknown')}`}>
                    {initials(selected.user?.name ?? '?')}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selected.user?.name ?? 'Unknown User'}</p>
                    <p className="text-xs text-gray-400">{selected.user?.email ?? ''}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-gray-500">{fmtDate(selected.createdAt)}</p>
                    {(() => {
                      const meta = ACTION_META[selected.action] ?? { label: selected.action, color: 'bg-gray-100 text-gray-600 border-gray-200', Icon: Clock }
                      return (
                        <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.color}`}>
                          {meta.label}
                        </span>
                      )
                    })()}
                  </div>
                </div>
                {selected.synthetic && (
                  <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700">
                    This event was synthesised from record timestamps. Detailed field history is recorded for changes made going forward.
                  </div>
                )}
              </div>

              {/* Field diffs */}
              {selected.lines.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Changes ({selected.lines.length} field{selected.lines.length !== 1 ? 's' : ''})
                    </h3>
                    {selected.lines.length > 3 && (
                      <button
                        onClick={() => setShowAllFields(v => !v)}
                        className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                      >
                        {showAllFields ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Show all</>}
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {(showAllFields ? selected.lines : selected.lines.slice(0, 3)).map(line => (
                      <FieldDiff key={line.id} line={line} />
                    ))}
                  </div>
                </div>
              )}

              {/* Changes JSON fallback */}
              {selected.lines.length === 0 && selected.changes && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Summary</h3>
                  <dl className="space-y-2">
                    {Object.entries(selected.changes).map(([k, v]) => (
                      <div key={k} className="flex gap-3 text-xs">
                        <dt className="text-gray-400 w-28 shrink-0 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</dt>
                        <dd className="text-gray-700 font-medium">{String(v ?? '—')}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
