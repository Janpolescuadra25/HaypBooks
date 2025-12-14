// Shared terms utilities for calculating due dates and listing common options

export type Terms = 'Due on receipt' | 'Net 15' | 'Net 30' | 'Net 45' | 'Net 60'

export const TERMS_OPTIONS: Terms[] = [
  'Due on receipt',
  'Net 15',
  'Net 30',
  'Net 45',
  'Net 60',
]

// Returns YYYY-MM-DD computed from a base date and terms (UTC-safe)
export function calculateDueDate(baseDateIso: string, terms: string): string {
  if (!baseDateIso) return ''
  const m = /Net\s+(\d+)/i.exec(terms || '')
  const add = m ? parseInt(m[1], 10) : 0
  const d = new Date(baseDateIso + 'T00:00:00Z')
  if (isNaN(d.valueOf())) return baseDateIso
  const due = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + add))
  return due.toISOString().slice(0, 10)
}
