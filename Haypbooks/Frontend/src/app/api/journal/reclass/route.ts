import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { createReclassEntry, seedIfNeeded } from '@/mock/db'
import { getClosedThrough } from '@/lib/periods'

export async function POST(req: Request) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => null) as {
    fromAccountNumber?: string
    toAccountNumber?: string
    amount?: number
    date?: string
    memo?: string
  } | null
  if (!body || !body.fromAccountNumber || !body.toAccountNumber || !(Number(body.amount) > 0)) {
    return NextResponse.json({ error: 'fromAccountNumber, toAccountNumber and positive amount are required' }, { status: 400 })
  }
  // Optional pre-check when client provides a specific date in a closed period
  if (body.date && /\d{4}-\d{2}-\d{2}/.test(body.date)) {
    const closed = getClosedThrough()
    if (closed && body.date <= closed) {
      return NextResponse.json({ error: `Accounting period is closed through ${closed}. Choose a later date.` }, { status: 400 })
    }
  }
  try {
    const id = createReclassEntry({
      fromAccountNumber: body.fromAccountNumber!,
      toAccountNumber: body.toAccountNumber!,
      amount: Number(body.amount),
      date: body.date,
      memo: body.memo,
    })
    return NextResponse.json({ journalEntryId: id })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || 'Failed to create reclass entry') }, { status: 400 })
  }
}
