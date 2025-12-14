import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = {
  id: string
  date: string
  memo: string
  debits: number
  credits: number
}


export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end

  const asOf = (end ? new Date(end + 'T00:00:00Z') : new Date()).toISOString()

  const daySpan = start && end ? Math.max(1, Math.ceil((new Date(end + 'T00:00:00Z').getTime() - new Date(start + 'T00:00:00Z').getTime()) / 86400000) + 1) : 30
  const count = Math.min(20, Math.max(8, Math.floor(daySpan / 2)))

  const rows: Row[] = Array.from({ length: count }, (_, i) => {
    const seq = i + 1
    const id = `JE-${String(10000 + seq)}`
    const d = new Date(Date.UTC(2025, 7, 1))
    d.setUTCDate(d.getUTCDate() + i)
    const isoDate = d.toISOString().slice(0, 10)
    const base = 150 + (i % 5) * 25
    const deb = base + Math.floor(daySpan / 10) * 10
    const cr = deb // force balanced entry
    return { id, date: isoDate, memo: `Journal Entry ${seq}`, debits: deb, credits: cr }
  }).filter(r => {
    if (start && r.date < start) return false
    if (end && r.date > end) return false
    return true
  })

  const totals = rows.reduce((acc, r) => {
    acc.debits += r.debits
    acc.credits += r.credits
    return acc
  }, { debits: 0, credits: 0 })

  return NextResponse.json({ rows, totals, asOf, start: start || null, end: end || null })
}
