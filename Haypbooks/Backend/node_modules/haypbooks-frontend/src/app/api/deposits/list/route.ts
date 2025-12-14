import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded, listDeposits as dbListDeposits } from '@/mock/db'

export async function GET(req: Request) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') || '').toLowerCase()
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')
  const deposits = dbListDeposits()
  const rows = deposits.map((d: any) => {
    const je = d.journalEntryId ? (db.journalEntries || []).find(j => j.id === d.journalEntryId) : undefined
    let depositTo = ''
    if (je) {
      const debitLine = je.lines.find((l: any) => (l.debit || 0) > 0)
      if (debitLine) {
        const acc = (db.accounts || []).find((a: any) => a.id === debitLine.accountId)
        if (acc) depositTo = `${acc.number} - ${acc.name}`
      }
    }
    return {
      date: d.date.slice(0,10),
      id: d.id,
      depositTo,
      memo: d.memo || '',
      payments: (d.paymentIds || []).length,
      total: d.total,
    }
  })
  .filter(r => !start || r.date >= start!)
  .filter(r => !end || r.date <= end!)
  .filter(r => !q || r.id.toLowerCase().includes(q) || r.depositTo.toLowerCase().includes(q) || r.memo.toLowerCase().includes(q))
  return NextResponse.json({ rows })
}
