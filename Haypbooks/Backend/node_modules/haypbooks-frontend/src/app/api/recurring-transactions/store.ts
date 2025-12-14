export type RecurringTemplate = {
  id: string
  kind: 'journal' | 'invoice' | 'bill'
  name: string
  status: 'active' | 'paused'
  startDate: string
  endDate?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  nextRunDate: string
  lastRunDate?: string
  remainingRuns?: number // undefined means indefinite
  totalRuns?: number
  lines: Array<{ description: string; amount: number; account?: string; debit?: number; credit?: number }>
  customerId?: string
  vendorId?: string
  memo?: string
  currency?: string
  mode?: 'scheduled' | 'reminder' | 'unscheduled'
}

const templates: RecurringTemplate[] = []
// Run history entries (append-only for demo; in real system this would page/archive)
export type RecurringRunHistoryEntry = {
  id: string
  templateId: string
  runDate: string
  artifactType: string
  artifactId?: string
  amount: number
  status: 'posted' | 'skipped' | 'error'
  errorCode?: string
}
const history: RecurringRunHistoryEntry[] = []

function makeId() {
  return 'rt_' + Math.random().toString(36).slice(2, 10)
}

export function listTemplates() {
  return templates.slice().sort((a,b)=> a.name.localeCompare(b.name))
}

export function findTemplate(id: string) {
  return templates.find(t => t.id === id)
}

export function addTemplate(partial: Omit<RecurringTemplate,'id'|'nextRunDate'> & { nextRunDate?: string }) {
  const id = makeId()
  const nextRunDate = partial.nextRunDate || partial.startDate
  const t: RecurringTemplate = { ...partial, id, nextRunDate }
  templates.push(t)
  return t
}

export function updateTemplate(id: string, changes: Partial<RecurringTemplate>) {
  const t = findTemplate(id)
  if (!t) return undefined
  Object.assign(t, changes)
  return t
}

export function removeTemplate(id: string) {
  const i = templates.findIndex(t => t.id === id)
  if (i >= 0) templates.splice(i,1)
}

export function listHistory(opts?: { templateId?: string; start?: string; end?: string }) {
  let filtered = opts?.templateId ? history.filter(h => h.templateId === opts.templateId) : history
  if (opts?.start) {
    filtered = filtered.filter(h => h.runDate >= opts.start!)
  }
  if (opts?.end) {
    filtered = filtered.filter(h => h.runDate <= opts.end!)
  }
  // newest first
  return filtered.slice().sort((a,b)=> b.runDate.localeCompare(a.runDate))
}

export function addHistory(entry: Omit<RecurringRunHistoryEntry,'id'>) {
  const id = 'rth_' + Math.random().toString(36).slice(2,10)
  const full: RecurringRunHistoryEntry = { id, ...entry }
  history.push(full)
  return full
}

export function seedIfEmpty() {
  if (templates.length > 0) return
  const today = new Date().toISOString().slice(0,10)
  addTemplate({
    kind: 'journal',
    name: 'Monthly Rent Accrual',
    status: 'active',
    startDate: today,
    frequency: 'monthly',
    lastRunDate: undefined,
    remainingRuns: 12,
    totalRuns: 12,
    lines: [
      { account: '6100 · Rent Expense', description: 'Rent', debit: 2500, amount: 2500 },
      { account: '2100 · Accrued Liabilities', description: 'Accrual', credit: 2500, amount: 2500 },
    ],
    memo: 'Accrue monthly rent',
    currency: 'USD'
  })
  addTemplate({
    kind: 'invoice',
    name: 'Monthly Service Subscription',
    status: 'active',
    startDate: today,
    frequency: 'monthly',
    remainingRuns: undefined,
    totalRuns: undefined,
    lines: [ { description: 'Subscription Fee', amount: 199 } ],
    customerId: 'c_1',
    memo: 'Auto-bill subscription',
    currency: 'USD'
  })
}

export function advanceNextRun(t: RecurringTemplate) {
  // move nextRunDate forward one interval
  const base = t.nextRunDate || t.startDate
  const d = new Date(base + 'T00:00:00Z')
  if (t.frequency === 'daily') d.setDate(d.getDate()+1)
  if (t.frequency === 'weekly') d.setDate(d.getDate()+7)
  if (t.frequency === 'monthly') {
    // Preserve original day intent; if next month is shorter clamp to last day of month
    const origDay = d.getDate()
    const targetMonth = d.getMonth() + 1 // JS month after increment
    const targetYear = d.getFullYear() + (targetMonth > 11 ? 1 : 0)
    // Instead of letting Date auto-rollover (which can skip months), build explicitly
    const yearAfter = d.getFullYear()
    const monthAfter = d.getMonth() + 1
    // Get last day of target month by asking for day 0 of following month
    const lastDayTarget = new Date(Date.UTC(yearAfter, monthAfter + 1, 0)).getDate()
    const clampedDay = Math.min(origDay, lastDayTarget)
    d.setUTCDate(1) // normalize to first to avoid rollover surprises
    d.setUTCMonth(monthAfter)
    d.setUTCDate(clampedDay)
  }
  if (t.frequency === 'yearly') {
    const origDay = d.getUTCDate()
    const origMonth = d.getUTCMonth()
    const targetYear = d.getUTCFullYear() + 1
    // Get last day of target month in target year
    const lastDayTarget = new Date(Date.UTC(targetYear, origMonth + 1, 0)).getUTCDate()
    const clampedDay = Math.min(origDay, lastDayTarget)
    d.setUTCFullYear(targetYear, origMonth, clampedDay)
  }
  t.lastRunDate = t.nextRunDate
  t.nextRunDate = d.toISOString().slice(0,10)
  if (typeof t.remainingRuns === 'number') {
    t.remainingRuns = Math.max(0, t.remainingRuns - 1)
    if (t.remainingRuns === 0) t.status = 'paused'
  }
  // If an endDate is defined and the next run would be after it, pause the template.
  if (t.endDate && t.nextRunDate > t.endDate) {
    t.status = 'paused'
  }
  return t
}

export function computeTemplateAmount(t: RecurringTemplate) {
  return (t.lines || []).reduce((s,l)=> s + Number(l.amount || l.debit || 0) - Number(l.credit || 0),0)
}

export function seedHistoryIfEmpty() {
  // no-op placeholder; history seeds after first run
  return
}

// Compute upcoming run dates without mutating the template
export function computeUpcomingRuns(t: RecurringTemplate, count = 3) {
  if (t.status !== 'active') return [] as string[]
  const dates: string[] = []
  const cap = typeof t.remainingRuns === 'number' ? Math.min(count, Math.max(0, t.remainingRuns)) : count
  let cur = t.nextRunDate || t.startDate
  let runsLeft = cap
  while (runsLeft > 0) {
    if (t.endDate && cur > t.endDate) break
    dates.push(cur)
    // advance local cursor by frequency, clamping like advanceNextRun but without side effects
    const d = new Date(cur + 'T00:00:00Z')
    if (t.frequency === 'daily') d.setUTCDate(d.getUTCDate()+1)
    else if (t.frequency === 'weekly') d.setUTCDate(d.getUTCDate()+7)
    else if (t.frequency === 'monthly') {
      const origDay = d.getUTCDate()
      const monthAfter = d.getUTCMonth() + 1
      const yearAfter = d.getUTCFullYear() + (monthAfter > 11 ? 1 : 0)
      const lastDayTarget = new Date(Date.UTC(yearAfter, (d.getUTCMonth()+1) + 1, 0)).getUTCDate()
      const clampedDay = Math.min(origDay, lastDayTarget)
      d.setUTCDate(1)
      d.setUTCMonth(d.getUTCMonth()+1)
      d.setUTCDate(clampedDay)
    } else if (t.frequency === 'yearly') {
      const origDay = d.getUTCDate()
      const origMonth = d.getUTCMonth()
      const targetYear = d.getUTCFullYear() + 1
      const lastDayTarget = new Date(Date.UTC(targetYear, origMonth + 1, 0)).getUTCDate()
      const clampedDay = Math.min(origDay, lastDayTarget)
      d.setUTCFullYear(targetYear, origMonth, clampedDay)
    }
    cur = d.toISOString().slice(0,10)
    if (t.endDate && cur > t.endDate) break
    runsLeft--
  }
  return dates
}
