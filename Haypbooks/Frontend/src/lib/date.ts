export function formatAsOf(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00Z') : date
  if (isNaN(d.valueOf())) return ''
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function todayIso(): string {
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  return today.toISOString().slice(0, 10)
}

export function formatDateRange(startIso: string, endIso: string): string {
  if (!startIso || !endIso) return ''
  const s = new Date(startIso + 'T00:00:00Z')
  const e = new Date(endIso + 'T00:00:00Z')
  if (isNaN(s.valueOf()) || isNaN(e.valueOf())) return ''
  // Same day -> return single full date
  if (s.getUTCFullYear() === e.getUTCFullYear() && s.getUTCMonth() === e.getUTCMonth() && s.getUTCDate() === e.getUTCDate()) {
    return s.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
  }
  const sameYear = s.getUTCFullYear() === e.getUTCFullYear()
  const sameMonth = sameYear && s.getUTCMonth() === e.getUTCMonth()
  const fmtFull = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
  const fmtMonthDay = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })
  const fmtDay = (d: Date) => d.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' })
  if (sameYear && sameMonth) {
    // Example: August 10-25, 2025
    return `${fmtMonthDay(s)}-${fmtDay(e)}, ${s.getUTCFullYear()}`
  }
    if (sameYear) {
      // Example: August 10, 2025 – September 10, 2025
      return `${fmtFull(s)} \u2013 ${fmtFull(e)}`
  }
  // Different years
    return `${fmtFull(s)} \u2013 ${fmtFull(e)}`
}

// Formats a date to MM/DD/YYYY for consistent table display
export function formatMMDDYYYY(date: string | Date): string {
  if (!date) return ''
  let d: Date
  if (typeof date === 'string') {
    const s = date.trim()
    // If already looks like YYYY-MM-DD or ISO, construct in UTC to avoid TZ shifts
    if (/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(s)) {
      d = new Date(s.includes('T') ? s : `${s}T00:00:00Z`)
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
      // Already formatted as MM/DD/YYYY
      return s
    } else {
      d = new Date(s)
    }
  } else {
    d = date
  }
  if (isNaN(d.valueOf())) return ''
  return d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' })
}