'use client'

import { useMemo, useState } from 'react'
import {
  ArrowRight,
  ArrowRightLeft,
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Pencil,
  Plus,
  Send,
  Trash2,
  Undo2,
  type LucideIcon,
} from 'lucide-react'

export interface ActivityActor {
  id?: string
  name?: string | null
  email?: string | null
}

export interface ActivityChangeLine {
  id?: string
  fieldName?: string
  field?: string
  oldValue?: unknown
  newValue?: unknown
  changeType?: string
  isSensitive?: boolean
}

export interface ActivityLogItem {
  id: string
  action?: string | null
  tableName?: string | null
  recordId?: string | null
  createdAt?: string | null
  user?: ActivityActor | null
  changes?: Record<string, unknown> | null
  lines?: ActivityChangeLine[] | null
}

interface ActivityLogEntryProps {
  entry: ActivityLogItem
  showEntityBadge?: boolean
  onNavigate?: (entry: ActivityLogItem) => void
}

type ChangeRow = {
  field: string
  before?: unknown
  after?: unknown
}

type ActionStyle = {
  label: string
  icon: LucideIcon
  iconWrapClassName: string
  badgeClassName: string
}

const DEFAULT_ACTION_STYLE: ActionStyle = {
  label: 'Activity',
  icon: Clock3,
  iconWrapClassName: 'bg-slate-100 text-slate-600',
  badgeClassName: 'bg-slate-100 text-slate-700',
}

const ACTION_STYLES: Record<string, ActionStyle> = {
  CREATE: {
    label: 'Created',
    icon: Plus,
    iconWrapClassName: 'bg-emerald-100 text-emerald-700',
    badgeClassName: 'bg-emerald-100 text-emerald-700',
  },
  UPDATE: {
    label: 'Updated',
    icon: Pencil,
    iconWrapClassName: 'bg-blue-100 text-blue-700',
    badgeClassName: 'bg-blue-100 text-blue-700',
  },
  DELETE: {
    label: 'Deleted',
    icon: Trash2,
    iconWrapClassName: 'bg-red-100 text-red-700',
    badgeClassName: 'bg-red-100 text-red-700',
  },
  SEND: {
    label: 'Sent',
    icon: Send,
    iconWrapClassName: 'bg-indigo-100 text-indigo-700',
    badgeClassName: 'bg-indigo-100 text-indigo-700',
  },
  VOID: {
    label: 'Voided',
    icon: Ban,
    iconWrapClassName: 'bg-slate-200 text-slate-700',
    badgeClassName: 'bg-slate-200 text-slate-700',
  },
  CONVERT: {
    label: 'Converted',
    icon: ArrowRightLeft,
    iconWrapClassName: 'bg-violet-100 text-violet-700',
    badgeClassName: 'bg-violet-100 text-violet-700',
  },
  APPROVE: {
    label: 'Approved',
    icon: CheckCircle2,
    iconWrapClassName: 'bg-emerald-100 text-emerald-700',
    badgeClassName: 'bg-emerald-100 text-emerald-700',
  },
  UNDO: {
    label: 'Undone',
    icon: Undo2,
    iconWrapClassName: 'bg-amber-100 text-amber-700',
    badgeClassName: 'bg-amber-100 text-amber-700',
  },
}

function normalizeAction(action?: string | null): string {
  return String(action ?? 'ACTIVITY').trim().toUpperCase() || 'ACTIVITY'
}

function toTitleWords(input: string): string {
  return input
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ')
}

function parsePotentialJson(value: unknown): unknown {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (!trimmed) return ''
  const looksLikeJson =
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  if (!looksLikeJson) return value
  try {
    return JSON.parse(trimmed)
  } catch {
    return value
  }
}

function toFieldLabel(field: string): string {
  return field
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase())
}

export function formatEntityLabel(tableName?: string | null): string {
  if (!tableName) return 'Record'
  return toFieldLabel(tableName)
}

function formatValueInternal(value: unknown, depth: number): string {
  if (value === null || value === undefined || value === '') return '--'
  if (typeof value === 'string') {
    const parsed = parsePotentialJson(value)
    if (parsed !== value) return formatValueInternal(parsed, depth + 1)
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return 'None'
    if (depth > 1) return `${value.length} values`
    const visible = value.slice(0, 3).map((item) => formatValueInternal(item, depth + 1))
    const suffix = value.length > 3 ? ` (+${value.length - 3} more)` : ''
    return `${visible.join(', ')}${suffix}`
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const preferredKeys = ['name', 'label', 'title', 'code', 'id', 'email', 'status']
    for (const key of preferredKeys) {
      const candidate = record[key]
      if (typeof candidate === 'string' && candidate.trim()) return candidate
    }

    const keys = Object.keys(record)
    if (keys.length === 0) return 'No value'
    if (depth > 1) return `${keys.length} fields`

    if (keys.length <= 2) {
      return keys
        .map((key) => `${toFieldLabel(key)}: ${formatValueInternal(record[key], depth + 1)}`)
        .join(' | ')
    }

    return `${keys.length} fields updated`
  }

  return String(value)
}

export function formatActivityValue(value: unknown): string {
  return formatValueInternal(value, 0)
}

function extractRecipient(changes: Record<string, unknown> | null | undefined): string | null {
  if (!changes) return null
  const recipient =
    changes.recipientEmail ??
    changes.recipient ??
    changes.email ??
    changes.to
  if (typeof recipient === 'string' && recipient.trim()) return recipient
  return null
}

function describeActivity(entry: ActivityLogItem, action: string, actionLabel: string, rowCount: number): string {
  const entity = formatEntityLabel(entry.tableName)
  if (action === 'CREATE') return `${entity} created`
  if (action === 'UPDATE') {
    return rowCount > 0 ? `${entity} updated (${rowCount} changes)` : `${entity} updated`
  }
  if (action === 'DELETE') return `${entity} deleted`
  if (action === 'VOID') return `${entity} voided`
  if (action === 'CONVERT') return `${entity} converted`
  if (action === 'APPROVE') return `${entity} approved`
  if (action === 'SEND') {
    const recipient = extractRecipient(entry.changes)
    return recipient ? `${entity} sent to ${recipient}` : `${entity} sent`
  }

  const suffix = actionLabel.toLowerCase()
  return `${entity} ${suffix}`
}

function buildRowsFromChanges(entry: ActivityLogItem, action: string): ChangeRow[] {
  const rows: ChangeRow[] = []

  if (Array.isArray(entry.lines) && entry.lines.length > 0) {
    for (const line of entry.lines) {
      const field = toFieldLabel(line.fieldName || line.field || 'Field')
      const before = line.isSensitive ? 'Hidden' : parsePotentialJson(line.oldValue)
      const after = line.isSensitive ? 'Hidden' : parsePotentialJson(line.newValue)
      rows.push({ field, before, after })
    }
    return rows
  }

  if (!entry.changes || typeof entry.changes !== 'object') return rows

  for (const [fieldName, rawValue] of Object.entries(entry.changes)) {
    const field = toFieldLabel(fieldName)
    let before: unknown
    let after: unknown

    if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
      const record = rawValue as Record<string, unknown>
      const hasPair =
        'old' in record ||
        'new' in record ||
        'before' in record ||
        'after' in record ||
        'from' in record ||
        'to' in record ||
        'previous' in record ||
        'current' in record

      if (hasPair) {
        before =
          record.old ??
          record.before ??
          record.from ??
          record.previous
        after =
          record.new ??
          record.after ??
          record.to ??
          record.current
      } else if (action === 'DELETE') {
        before = rawValue
      } else {
        after = rawValue
      }
    } else if (action === 'DELETE') {
      before = rawValue
    } else {
      after = rawValue
    }

    rows.push({ field, before, after })
  }

  return rows
}

function formatTimestamp(timestamp?: string | null): string {
  if (!timestamp) return '--'
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleString()
}

export default function ActivityLogEntry({ entry, showEntityBadge = false, onNavigate }: ActivityLogEntryProps) {
  const [expanded, setExpanded] = useState(false)
  const action = normalizeAction(entry.action)
  const style = ACTION_STYLES[action] ?? {
    ...DEFAULT_ACTION_STYLE,
    label: toTitleWords(action),
  }
  const Icon = style.icon

  const rows = useMemo(() => buildRowsFromChanges(entry, action), [entry, action])
  const actor = entry.user?.name || entry.user?.email || 'System'
  const description = useMemo(
    () => describeActivity(entry, action, style.label, rows.length),
    [entry, action, style.label, rows.length],
  )

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.iconWrapClassName}`}>
          <Icon size={14} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{description}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>by {actor}</span>
                <span className="text-slate-300">|</span>
                <span>{formatTimestamp(entry.createdAt)}</span>
                {showEntityBadge && (
                  <>
                    <span className="text-slate-300">|</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {formatEntityLabel(entry.tableName)}
                    </span>
                  </>
                )}
              </div>
            </div>

            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${style.badgeClassName}`}>
              {style.label}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            {rows.length > 0 && (
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-800"
              >
                {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                {expanded ? 'Hide details' : 'View details'}
              </button>
            )}

            {onNavigate && entry.recordId && (
              <button
                type="button"
                onClick={() => onNavigate(entry)}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
              >
                Open record <ArrowRight size={12} />
              </button>
            )}
          </div>

          {expanded && rows.length > 0 && (
            <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="px-3 py-2 text-left font-semibold">Field</th>
                    <th className="px-3 py-2 text-left font-semibold">Before</th>
                    <th className="px-3 py-2 text-left font-semibold">After</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={`${entry.id}-${row.field}`} className="border-t border-slate-100 align-top">
                      <td className="bg-slate-50 px-3 py-2 font-medium text-slate-600">{row.field}</td>
                      <td className="px-3 py-2 text-slate-600">{formatActivityValue(row.before)}</td>
                      <td className="px-3 py-2 text-slate-800">{formatActivityValue(row.after)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
