import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const accountNum = url.searchParams.get('account') || '1000'
  const account = { number: accountNum, name: accountNum === '1000' ? 'Cash' : 'Account ' + accountNum }
  const period = url.searchParams.get('period') || undefined
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  // Align with core statements: ThisMonth->MTD, ThisQuarter->QTD
  const alias = period === 'ThisMonth' ? 'MTD' : period === 'ThisQuarter' ? 'QTD' : period
  const r = deriveRange(alias, start, end)
  start = r.start || start
  end = r.end || end
  const asOf = (end ? new Date(end + 'T00:00:00Z') : new Date()).toISOString()
  const base = 100
  let balance = 0
  const rows = Array.from({ length: 8 }, (_, i) => {
    const debit = i % 2 === 0 ? base + i * 10 : 0
    const credit = i % 2 === 1 ? base + i * 5 : 0
    balance += debit - credit
    const d = new Date(Date.now() - i * 86400000)
    const iso = d.toISOString()
    const isoDay = iso.slice(0,10)
    if (start && isoDay < start) return null
    if (end && isoDay > end) return null
    return {
      date: iso,
      memo: `Txn ${i + 1}`,
      debit,
      credit,
      balance,
    }
  }).filter(Boolean) as any[]
  return NextResponse.json({ account, rows, asOf })
}
