import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { logEvent } from '@/lib/audit'
import { getClosedThrough } from '@/lib/periods'
import { buildClosedPeriodErrorPayload } from '@/lib/period-lock'

type JournalLine = {
  account: string
  name?: string
  memo?: string
  debit?: number
  credit?: number
}

type JournalBody = {
  date: string
  memo?: string
  lines: JournalLine[]
  reversing?: { enabled: boolean; date?: string }
  recurring?: { enabled: boolean; frequency?: 'daily' | 'weekly' | 'monthly'; count?: number }
  attachments?: { name: string; size: number }[]
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

function isBalanced(lines: JournalLine[]) {
  const totals = lines.reduce(
    (acc, l) => {
      return {
        debit: acc.debit + (Number(l.debit) || 0),
        credit: acc.credit + (Number(l.credit) || 0),
      }
    },
    { debit: 0, credit: 0 }
  )
  return { ...totals, balanced: round2(totals.debit - totals.credit) === 0 }
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`
}

function nextDates(startISO: string, frequency: 'daily' | 'weekly' | 'monthly', count: number) {
  const out: string[] = []
  const start = new Date(startISO)
  for (let i = 1; i <= count; i++) {
    const d = new Date(start)
    if (frequency === 'daily') d.setDate(d.getDate() + i)
    if (frequency === 'weekly') d.setDate(d.getDate() + 7 * i)
    if (frequency === 'monthly') d.setMonth(d.getMonth() + i)
    out.push(d.toISOString())
  }
  return out
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = (await req.json().catch(() => null)) as JournalBody | null
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { date, memo, lines, reversing, recurring, attachments } = body

  if (!date || !Array.isArray(lines) || lines.length < 2) {
    return NextResponse.json({ error: 'date and at least two lines are required' }, { status: 400 })
  }

  // Period lock enforcement: cannot post on/before closed-through date
  const closedThrough = getClosedThrough()
  if (closedThrough) {
    const d = new Date(date + 'T00:00:00Z')
    const c = new Date(closedThrough + 'T00:00:00Z')
    if (!isNaN(d.valueOf()) && !isNaN(c.valueOf()) && d.getTime() <= c.getTime()) {
      return NextResponse.json(buildClosedPeriodErrorPayload(closedThrough, date.slice(0,10)), { status: 400 })
    }
  }

  for (const [i, l] of lines.entries()) {
    if (!l.account) {
      return NextResponse.json({ error: `Line ${i + 1}: account is required` }, { status: 400 })
    }
    if ((l.debit || 0) > 0 && (l.credit || 0) > 0) {
      return NextResponse.json({ error: `Line ${i + 1}: only one of debit or credit may be non-zero` }, { status: 400 })
    }
  }

  const totals = isBalanced(lines)
  if (!totals.balanced) {
    return NextResponse.json({ error: 'Debits must equal credits' }, { status: 400 })
  }

  if (reversing?.enabled && !reversing.date) {
    return NextResponse.json({ error: 'Reversing date required when reversing is enabled' }, { status: 400 })
  }

  if (recurring?.enabled && !recurring.frequency) {
    return NextResponse.json({ error: 'Frequency required for recurring entries' }, { status: 400 })
  }

  const id = makeId('je')
  const number = `JE-${Math.floor(Math.random() * 900000 + 100000)}`

  const response: any = {
    journal: {
      id,
      number,
      date,
      memo: memo || '',
      lines: lines.map((l) => ({
        account: l.account,
        name: l.name || '',
        memo: l.memo || '',
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
      })),
      totals: { debit: round2(totals.debit), credit: round2(totals.credit) },
      attachments: Array.isArray(attachments) ? attachments : [],
    },
  }

  if (reversing?.enabled) {
    response.journal.reversing = { ...reversing, reversingEntryId: makeId('je') }
  }

  if (recurring?.enabled) {
    const count = Math.max(0, Math.min(100, Number(recurring.count) || 0))
    response.journal.recurring = {
      enabled: true,
      frequency: recurring.frequency,
      count,
      schedule: count > 0 && recurring.frequency ? nextDates(date, recurring.frequency, count) : [],
    }
  }
  // Audit Log
  const userId = 'u_1'
  logEvent({ userId, action: 'journal.create', entity: 'journal', entityId: id, meta: { number, reversing: !!reversing?.enabled, recurring: !!recurring?.enabled } })
  if (reversing?.enabled) logEvent({ userId, action: 'journal.reversing_set', entity: 'journal', entityId: id, meta: { date: reversing.date } })
  if (recurring?.enabled) logEvent({ userId, action: 'journal.recurring_set', entity: 'journal', entityId: id, meta: { frequency: recurring.frequency, count: response.journal.recurring.count } })

  return NextResponse.json(response)
}

export async function GET() {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  // Minimal sample list to aid UI development
  const sample = Array.from({ length: 5 }, (_, i) => ({
    id: `je_${i + 1}`,
    number: `JE-10${i + 1}`,
    date: new Date(Date.now() - i * 86400000).toISOString(),
    memo: `Sample journal ${i + 1}`,
  reversing: i === 1 ? { enabled: true, date: new Date(Date.now() + 86400000).toISOString() } : undefined,
  recurring: i === 2 ? { enabled: true, frequency: 'monthly', count: 3 } : undefined,
    totals: { debit: 100 + i * 10, credit: 100 + i * 10 },
    lines: [
      { account: '1000 · Cash', debit: 100 + i * 10, credit: 0 },
      { account: '4000 · Sales Revenue', debit: 0, credit: 100 + i * 10 },
    ],
  }))
  return NextResponse.json({ journals: sample, total: sample.length })
}
