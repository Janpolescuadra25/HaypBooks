import { getClosedThrough } from './periods'

/**
 * Compute closed-period violation for a requested date.
 * Returns null when open; otherwise returns closedThrough and requestedDate (YYYY-MM-DD).
 */
export function isDateInClosedPeriod(dateIso?: string | null): { closedThrough: string; requestedDate: string } | null {
  const closed = getClosedThrough()
  if (!closed) return null
  const requestedDate = (typeof dateIso === 'string' && dateIso.length >= 10) ? dateIso.slice(0, 10) : new Date().toISOString().slice(0, 10)
  const d = new Date(requestedDate + 'T00:00:00Z')
  const c = new Date(closed + 'T00:00:00Z')
  if (!isNaN(d.valueOf()) && !isNaN(c.valueOf()) && d.getTime() <= c.getTime()) {
    return { closedThrough: closed, requestedDate }
  }
  return null
}

/**
 * Build a conservative error payload preserving legacy `error` field while adding structured data.
 * Keep message text stable to avoid breaking tests that may assert substrings.
 */
export function buildClosedPeriodErrorPayload(closedThrough: string, requestedDate: string) {
  const legacy = `Date is in closed period (closeDate=${closedThrough}). Choose a later date or reopen period.`
  return {
    ok: false,
    code: 'PERIOD_CLOSED',
    message: `Date ${requestedDate} is in a closed period (closeDate=${closedThrough})`,
    closeDate: closedThrough,
    requestedDate,
    error: legacy,
  }
}
