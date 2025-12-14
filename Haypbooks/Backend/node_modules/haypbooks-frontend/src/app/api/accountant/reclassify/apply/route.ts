import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { createReclassEntry, createAdjustingJournal, seedIfNeeded } from '@/mock/db'
import { getClosedThrough } from '@/lib/periods'

export async function POST(req: Request) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  const canWrite = hasPermission(role, 'journal:write')
  if (!canWrite) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => null) as { fromAccountNumber?: string; toAccountNumber?: string; amount?: number; date?: string; memo?: string; reversing?: boolean } | null
  if (!body || !body.fromAccountNumber || !body.toAccountNumber || !(Number(body.amount) > 0)) {
    return NextResponse.json({ error: 'fromAccountNumber, toAccountNumber, and positive amount are required' }, { status: 400 })
  }
  if (body.fromAccountNumber === body.toAccountNumber) {
    return NextResponse.json({ error: 'From and To accounts must differ' }, { status: 400 })
  }
  const effectiveDate = body.date && /\d{4}-\d{2}-\d{2}/.test(body.date) ? body.date : undefined
  if (effectiveDate) {
    const closed = getClosedThrough()
    if (closed && effectiveDate <= closed) {
      return NextResponse.json({ error: `Accounting period is closed through ${closed}. Choose a later date.` }, { status: 400 })
    }
  }
  try {
    if (body.reversing) {
      // Build lines and delegate to createAdjustingJournal to leverage automatic reversing entry
      const lines = [
        { accountNumber: body.toAccountNumber, debit: Number(body.amount) },
        { accountNumber: body.fromAccountNumber, credit: Number(body.amount) },
      ]
      const { id, reversingId } = createAdjustingJournal({ date: effectiveDate || new Date().toISOString().slice(0,10), lines, reversing: true })
      return NextResponse.json({ ok: true, journalEntryId: id, reversingId })
    } else {
      const id = createReclassEntry({ fromAccountNumber: body.fromAccountNumber, toAccountNumber: body.toAccountNumber, amount: Number(body.amount), date: effectiveDate, memo: body.memo })
      return NextResponse.json({ ok: true, journalEntryId: id })
    }
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || 'Failed to apply reclassification') }, { status: 400 })
  }
}
