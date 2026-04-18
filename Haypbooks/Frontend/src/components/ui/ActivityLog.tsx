'use client'

import { Loader2 } from 'lucide-react'
import ActivityLogEntry, {
  type ActivityLogItem,
  formatActivityValue,
  formatEntityLabel,
} from './ActivityLogEntry'

interface ActivityLogProps {
  entries: ActivityLogItem[]
  loading?: boolean
  emptyMessage?: string
  className?: string
  showEntityBadge?: boolean
  onEntryNavigate?: (entry: ActivityLogItem) => void
}

export type { ActivityLogItem }
export { formatActivityValue, formatEntityLabel }

export default function ActivityLog({
  entries,
  loading = false,
  emptyMessage = 'No activity recorded yet.',
  className,
  showEntityBadge = false,
  onEntryNavigate,
}: ActivityLogProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-slate-500">
        <Loader2 size={18} className="mr-2 animate-spin" /> Loading activity...
      </div>
    )
  }

  if (entries.length === 0) {
    return <div className="py-10 text-center text-sm text-slate-400">{emptyMessage}</div>
  }

  return (
    <div className={`space-y-3 ${className ?? ''}`}>
      {entries.map((entry, index) => (
        <ActivityLogEntry
          key={entry.id || `${entry.recordId ?? 'entry'}-${index}`}
          entry={entry}
          showEntityBadge={showEntityBadge}
          onNavigate={onEntryNavigate}
        />
      ))}
    </div>
  )
}
