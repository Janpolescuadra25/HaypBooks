import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { writeOffInvoice, seedIfNeeded } from '@/mock/db'
import { getClosedThrough } from '@/lib/periods'

export async function POST(req: Request) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  const canWrite = hasPermission(role, 'journal:write') || hasPermission(role, 'invoices:write' as any)
  if (!canWrite) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => null) as { items?: Array<{ id: string; amount?: number }>; date?: string; expenseAccountNumber?: string; memoPrefix?: string } | null
  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'No items provided' }, { status: 400 })
  }
  const effectiveDate = body.date && /\d{4}-\d{2}-\d{2}/.test(body.date) ? body.date : undefined
  if (effectiveDate) {
    const closed = getClosedThrough()
    if (closed && effectiveDate <= closed) {
      return NextResponse.json({ error: `Accounting period is closed through ${closed}. Choose a later date.` }, { status: 400 })
    }
  }

  const results: Array<{ id: string; ok: boolean; error?: string; journalEntryId?: string; newBalance?: number }> = []
  for (const it of body.items) {
    try {
      const res = writeOffInvoice({ invoiceId: String(it.id), amount: it.amount, date: effectiveDate, expenseAccountNumber: body.expenseAccountNumber, memo: body.memoPrefix ? `${body.memoPrefix} write-off` : undefined })
      results.push({ id: res.invoice.id, ok: true, journalEntryId: res.journalEntryId, newBalance: res.invoice.balance })
    } catch (e: any) {
      const msg = String(e?.message || 'Failed')
      results.push({ id: String(it.id), ok: false, error: msg })
    }
  }
  const okCount = results.filter(r => r.ok).length
  return NextResponse.json({ ok: okCount, failed: results.length - okCount, results })
}
