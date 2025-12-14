import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'
import { getClosedThrough } from '@/lib/periods'

export async function POST(req: Request) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  const canRead = hasPermission(role, 'journal:read')
  if (!canRead) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => null) as { fromAccountNumber?: string; toAccountNumber?: string; amount?: number; date?: string; memo?: string; reversing?: boolean } | null
  if (!body || !body.fromAccountNumber || !body.toAccountNumber || !(Number(body.amount) > 0)) {
    return NextResponse.json({ error: 'fromAccountNumber, toAccountNumber, and positive amount are required' }, { status: 400 })
  }
  if (body.fromAccountNumber === body.toAccountNumber) {
    return NextResponse.json({ error: 'From and To accounts must differ' }, { status: 400 })
  }
  const from = (db.accounts || []).find(a => a.number === body.fromAccountNumber)
  const to = (db.accounts || []).find(a => a.number === body.toAccountNumber)
  if (!from) return NextResponse.json({ error: 'From account not found' }, { status: 404 })
  if (!to) return NextResponse.json({ error: 'To account not found' }, { status: 404 })

  const effectiveDate = body.date && /\d{4}-\d{2}-\d{2}/.test(body.date) ? body.date : new Date().toISOString().slice(0,10)
  const closed = getClosedThrough()
  if (closed && effectiveDate <= closed) {
    return NextResponse.json({ error: `Accounting period is closed through ${closed}. Choose a later date.` }, { status: 400 })
  }

  const amount = Number(body.amount)
  const memo = body.memo || `Reclass ${from.number} → ${to.number}`
  const lines = [
    { accountNumber: to.number, debit: amount, credit: 0, memo },
    { accountNumber: from.number, debit: 0, credit: amount, memo },
  ]
  let reversalDate: string | undefined
  if (body.reversing) {
    const d = new Date(effectiveDate + 'T00:00:00Z')
    const nextMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))
    reversalDate = nextMonth.toISOString().slice(0,10)
  }
  return NextResponse.json({ date: effectiveDate, lines, reversing: !!body.reversing, reversalDate })
}
