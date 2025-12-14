"use client"
import { useEffect, useMemo, useState } from 'react'
import { formatMMDDYYYY } from '@/lib/date'

type Props = {
  date?: string
  onSuggestNextOpenDate?: (date: string) => void
  className?: string
}

function addOneDay(iso: string) {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0,10)
}

export function ClosedThroughBanner({ date, onSuggestNextOpenDate, className }: Props) {
  const [closedThrough, setClosedThrough] = useState<string | null>(null)
  const isBlocked = useMemo(() => !!(closedThrough && date && date.slice(0,10) <= closedThrough), [closedThrough, date])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const r = await fetch('/api/periods', { cache: 'no-store' })
        if (!r.ok) return
        const d = await r.json()
        if (alive) setClosedThrough(d?.closedThrough || null)
      } catch {}
    })()
    return () => { alive = false }
  }, [])

  if (!closedThrough) return null
  return (
    <div className={"rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 " + (className || '')} aria-live="polite">
      Closed through: <strong>{formatMMDDYYYY(closedThrough)}</strong>. Dates on or before this date will be blocked.
      {isBlocked && onSuggestNextOpenDate && (
        <button
          type="button"
          className="ml-2 inline-flex items-center rounded border border-amber-300 bg-amber-100 px-2 py-0.5 text-amber-900 hover:bg-amber-200"
          onClick={() => onSuggestNextOpenDate(addOneDay(closedThrough))}
        >Use next open date</button>
      )}
    </div>
  )
}

export default ClosedThroughBanner
