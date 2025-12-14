// Accounting period-lock utilities bridged to the mock DB state
import { db, closePeriod as dbClosePeriod, reopenPeriodWithAudit as dbReopenWithAudit } from '@/mock/db'

export type Period = {
  id: string
  start: string // ISO date (YYYY-MM-DD)
  end: string   // ISO date (YYYY-MM-DD)
  status: 'open' | 'closed'
}

function isoOnly(dateISO: string): string {
  const d = new Date(dateISO + 'T00:00:00Z')
  if (isNaN(d.valueOf())) return dateISO
  return d.toISOString().slice(0, 10)
}

export function getClosedThrough(): string | null {
  return (db.settings?.closeDate as string | null) || null
}

export function getPeriods(): Period[] {
  const closed = getClosedThrough()
  if (!closed) return []
  return [{ id: 'per_closed', start: '1900-01-01', end: closed, status: 'closed' }]
}

export function closeThrough(endISO: string): Period {
  const end = isoOnly(endISO)
  const closed = dbClosePeriod(end)
  return { id: 'per_closed', start: '1900-01-01', end: closed, status: 'closed' }
}

export function reopenThrough(): void {
  dbReopenWithAudit()
}

export function isDateAllowed(dateISO: string): boolean {
  const closed = getClosedThrough()
  if (!closed) return true
  const d = new Date(dateISO + 'T00:00:00Z')
  const c = new Date(closed + 'T00:00:00Z')
  if (isNaN(d.valueOf()) || isNaN(c.valueOf())) return true
  return d.getTime() > c.getTime()
}
