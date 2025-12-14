import { formatAsOf, formatDateRange, todayIso } from './date'

export type DerivedRange = { start: string | null; end: string | null }

// Centralized date-range derivation logic shared by many report routes
export function deriveRange(period?: string | null, start?: string | null, end?: string | null): DerivedRange {
  // If both explicitly provided, honor them
  if (start && end) return { start, end }

  // Establish anchor dates: prefer provided end when present, else today
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const parseIso = (s?: string | null) => (s ? new Date(s + 'T00:00:00Z') : null)
  const anchorEnd = parseIso(end) || today
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  const endOfMonth = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0))

  // When no period supplied, just pass through whatever we have
  if (!period) return { start: start || null, end: end || null }

  const anchorYear = anchorEnd.getUTCFullYear()
  const anchorMonth = anchorEnd.getUTCMonth()
  const startOfQuarterMonth = Math.floor(anchorMonth / 3) * 3

  switch (period) {
    case 'Today': {
      const e = end ? anchorEnd : today
      return { start: iso(e), end: iso(e) }
    }
    case 'Yesterday': {
      const e = end ? anchorEnd : today
      const y = new Date(e.getTime() - 86400000)
      return { start: iso(y), end: iso(y) }
    }
    case 'ThisWeek': {
      const e = end ? anchorEnd : today
      const wd = e.getUTCDay()
      const delta = (wd + 6) % 7
      const s = new Date(e.getTime() - delta * 86400000)
      return { start: iso(s), end: iso(e) }
    }
    case 'LastWeek': {
      const eRef = end ? anchorEnd : today
      const wd = eRef.getUTCDay()
      const delta = (wd + 6) % 7
      const startThisWeek = new Date(eRef.getTime() - delta * 86400000)
      const e = new Date(startThisWeek.getTime() - 86400000)
      const s = new Date(e.getTime() - 6 * 86400000)
      return { start: iso(s), end: iso(e) }
    }
    case 'Last2Weeks': {
      const e = end ? anchorEnd : today
      return { start: iso(new Date(e.getTime() - 13 * 86400000)), end: iso(e) }
    }
    case 'ThisMonth': {
      const e = end ? anchorEnd : endOfMonth(anchorYear, anchorMonth)
      const s = new Date(Date.UTC(anchorYear, anchorMonth, 1))
      return { start: iso(s), end: iso(e) }
    }
    case 'LastMonth': {
      const ref = end ? anchorEnd : today
      const firstThisMonth = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), 1))
      const e = new Date(firstThisMonth.getTime() - 86400000)
      const s = new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), 1))
      return { start: iso(s), end: iso(e) }
    }
    case 'Last30': {
      const e = end ? anchorEnd : today
      return { start: iso(new Date(e.getTime() - 29 * 86400000)), end: iso(e) }
    }
    case 'MTD': {
      const e = end ? anchorEnd : today
      const s = new Date(Date.UTC(anchorYear, anchorMonth, 1))
      return { start: iso(s), end: iso(e) }
    }
    case 'ThisQuarter': {
      const s = new Date(Date.UTC(anchorYear, startOfQuarterMonth, 1))
      const e = end ? anchorEnd : endOfMonth(anchorYear, startOfQuarterMonth + 2)
      return { start: iso(s), end: iso(e) }
    }
    case 'LastQuarter': {
      const ref = end ? anchorEnd : today
      const q = Math.floor(ref.getUTCMonth() / 3)
      const startQ = new Date(Date.UTC(ref.getUTCFullYear(), q * 3, 1))
      const e = new Date(startQ.getTime() - 86400000)
      const s = new Date(Date.UTC(e.getUTCFullYear(), Math.floor(e.getUTCMonth() / 3) * 3, 1))
      return { start: iso(s), end: iso(e) }
    }
    case 'QTD': {
      const e = end ? anchorEnd : today
      const s = new Date(Date.UTC(anchorYear, startOfQuarterMonth, 1))
      return { start: iso(s), end: iso(e) }
    }
    case 'ThisYear': {
      const s = new Date(Date.UTC(anchorYear, 0, 1))
      const e = end ? anchorEnd : new Date(Date.UTC(anchorYear, 11, 31))
      return { start: iso(s), end: iso(e) }
    }
    case 'LastYear': {
      const refY = end ? anchorYear : today.getUTCFullYear() - 1
      const s = new Date(Date.UTC(refY, 0, 1))
      const e = new Date(Date.UTC(refY, 11, 31))
      return { start: iso(s), end: iso(e) }
    }
    case 'YTD': {
      const e = end ? anchorEnd : today
      const s = new Date(Date.UTC(anchorYear, 0, 1))
      return { start: iso(s), end: iso(e) }
    }
    case 'YearToLastMonth': {
      const ref = end ? anchorEnd : today
      const prevMonth = ref.getUTCMonth() - 1
      if (prevMonth < 0) {
        const y = ref.getUTCFullYear() - 1
        return { start: iso(new Date(Date.UTC(y, 0, 1))), end: iso(new Date(Date.UTC(y, 11, 31))) }
      }
      return { start: iso(new Date(Date.UTC(anchorYear, 0, 1))), end: iso(endOfMonth(anchorYear, prevMonth)) }
    }
    case 'Last12': {
      const e = end ? anchorEnd : today
      return { start: iso(new Date(e.getTime() - 364 * 86400000)), end: iso(e) }
    }
    default:
      return { start: start || null, end: end || null }
  }
}

// CSV caption builder: first row with either an explicit date range or As of label
export function buildCsvCaption(start?: string | null, end?: string | null, asOf?: string | null): string {
  if (start && end) return formatDateRange(start, end)
  const iso = asOf || todayIso()
  return `As of ${formatAsOf(iso)}`
}

// CSV caption builder variant: returns a date range or a bare ISO date when only end/start provided.
// Falls back to 'As of <ISO>' when neither start nor end is provided.
// This preserves parity with legacy/simple list exports whose first line equals 'YYYY-MM-DD' when an end is passed.
export function buildCsvRangeOrDate(start?: string | null, end?: string | null, asOf?: string | null): string {
  const s = start || ''
  const e = end || ''
  if (s && e) return `${s} - ${e}`
  if (e) return e
  if (s) return s
  const iso = asOf || todayIso()
  return `As of ${iso}`
}
