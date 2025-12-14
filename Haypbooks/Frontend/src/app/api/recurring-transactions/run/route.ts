import { NextRequest, NextResponse } from 'next/server'
import { advanceNextRun, findTemplate, addHistory, computeTemplateAmount } from '../store'
import { isDateInClosedPeriod, buildClosedPeriodErrorPayload } from '@/lib/period-lock'
import { db, postJournal, createInvoice, updateInvoice, createBill } from '@/mock/db'

function requireRole(req: NextRequest, role: string) {
  const r = req.headers.get('x-role') || req.cookies.get('role')?.value || 'viewer'
  const order = ['viewer','user','admin']
  return order.indexOf(r) >= order.indexOf(role)
}

// Minimal materialization helpers (mock layer) – journal/invoice/bill posting simulation.
function materializeTemplate(t: any) {
  const today = t.nextRunDate || new Date().toISOString().slice(0,10)
  const lineTotal = t.lines.reduce((sum: number, l: any) => sum + (typeof l.amount === 'number' ? l.amount : ((l.debit || 0) - (l.credit || 0))), 0)
  if (t.kind === 'journal') {
    // Map template lines to posting lines; prefer explicit debit/credit, fallback to amount as debit
    const postLines = (t.lines || []).map((l: any) => ({
      accountNumber: l.account || '6000',
      debit: typeof l.debit === 'number' ? l.debit : (typeof l.amount === 'number' && l.amount > 0 ? l.amount : 0),
      credit: typeof l.credit === 'number' ? l.credit : (typeof l.amount === 'number' && l.amount < 0 ? Math.abs(l.amount) : 0),
      memo: t.memo || t.name,
    }))
  const jeId = postJournal(postLines, today)
    return { type: 'journal', id: jeId, date: today, total: Math.abs(lineTotal) }
  }
  if (t.kind === 'invoice') {
    const number = 'INV-' + Math.floor(Math.random()*9000 + 1000)
    const inv = createInvoice({ number, customerId: t.customerId || 'c_unknown', date: today, lines: (t.lines || []).map((l: any) => ({ description: l.description || t.name, amount: Number(l.amount || l.debit || 0) })) })
    updateInvoice(inv.id, { status: 'sent' })
    return { type: 'invoice', id: inv.id, number: inv.number, date: today, total: inv.total }
  }
  if (t.kind === 'bill') {
    const number = 'BILL-' + Math.floor(Math.random()*9000 + 1000)
    const bill = createBill({ number, vendorId: t.vendorId || 'v_unknown', billDate: today, lines: (t.lines || []).map((l: any) => ({ description: l.description || t.name, amount: Number(l.amount || l.debit || 0) })) })
    return { type: 'bill', id: bill.id, number: bill.number, date: today, total: bill.total }
  }
  return { type: 'unknown', date: today }
}

export async function POST(req: NextRequest) {
  if (!requireRole(req, 'user')) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const body = await req.json()
  const { id } = body
  const t = findTemplate(id)
  if (!t) return NextResponse.json({ error: 'not-found' }, { status: 404 })
  if (t.status !== 'active') return NextResponse.json({ error: 'inactive' }, { status: 409 })
  // End-date guard: prevent runs beyond endDate
  if (t.endDate && t.nextRunDate > t.endDate) {
    return NextResponse.json({ error: 'ended', message: 'Template end date reached' }, { status: 409 })
  }
  // Closed-period guard: block if nextRunDate (posting date) is in closed period.
  const violation = isDateInClosedPeriod(t.nextRunDate)
  if (violation) {
    return NextResponse.json(buildClosedPeriodErrorPayload(violation.closedThrough, violation.requestedDate), { status: 400 })
  }
  // Materialize first (using current nextRunDate as posting date) then advance schedule for future runs.
  const materialized = materializeTemplate(t)
  // Log run history (append-only)
  try {
    addHistory({
      templateId: t.id,
      runDate: t.nextRunDate,
      artifactType: materialized.type,
      artifactId: materialized.id,
      amount: Number(materialized.total ?? computeTemplateAmount(t) ?? 0),
      status: 'posted',
    })
  } catch {}
  advanceNextRun(t)
  return NextResponse.json({ data: t, materialized })
}
