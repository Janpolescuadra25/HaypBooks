import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, findInvoice, postJournal, seedIfNeeded } from '@/mock/db'
import { getClosedThrough } from '@/lib/periods'
import { buildClosedPeriodErrorPayload } from '@/lib/period-lock'

export async function POST(req: Request) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  const canWrite = hasPermission(role, 'journal:write' as any) || hasPermission(role, 'invoices:write' as any)
  if (!canWrite) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => null) as { items?: Array<{ invoiceId: string; amount: number }>; date?: string; incomeAccountNumber?: string; memoPrefix?: string } | null
  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'No items provided' }, { status: 400 })
  }
  const effectiveDate = body.date && /\d{4}-\d{2}-\d{2}/.test(body.date) ? body.date : undefined
  if (effectiveDate) {
    const closed = getClosedThrough()
    if (closed && effectiveDate <= closed) {
      return NextResponse.json(buildClosedPeriodErrorPayload(closed, effectiveDate), { status: 400 })
    }
  }

  const incomeAcc = (body.incomeAccountNumber && /\d{3,6}/.test(body.incomeAccountNumber)) ? body.incomeAccountNumber : '4100'
  const results: Array<{ invoiceId: string; ok: boolean; error?: string; journalEntryId?: string; newBalance?: number }> = []

  for (const it of body.items) {
    try {
      const inv = findInvoice(it.invoiceId)
      if (!inv) throw new Error('Invoice not found')
      const amount = Number(it.amount)
      if (!(amount > 0)) throw new Error('Amount must be > 0')
      const dateIso = effectiveDate || new Date().toISOString().slice(0,10)
      // Post JE: DR 1100 (A/R) / CR Income (default 4100) per spec
      const memo = `${body.memoPrefix ? body.memoPrefix + ' ' : ''}Finance charge on ${inv.number || inv.id}`.trim()
      const jeId = postJournal([
        { accountNumber: '1100', debit: amount, memo },
        { accountNumber: incomeAcc, credit: amount, memo },
      ], dateIso, { type: 'invoice', id: inv.id })
      // Increase invoice total & balance by amount
      inv.total = Number((inv.total + amount).toFixed(2))
      inv.balance = Number((inv.balance + amount).toFixed(2))
      results.push({ invoiceId: inv.id, ok: true, journalEntryId: jeId, newBalance: inv.balance })
    } catch (e: any) {
      results.push({ invoiceId: it.invoiceId, ok: false, error: String(e?.message || 'Failed') })
    }
  }

  const okCount = results.filter(r => r.ok).length
  return NextResponse.json({ ok: okCount, failed: results.length - okCount, results })
}
