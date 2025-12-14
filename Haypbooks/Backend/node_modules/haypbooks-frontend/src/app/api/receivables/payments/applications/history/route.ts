import { NextResponse } from 'next/server'
import { db, seedIfNeeded } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type HistoryRow = {
  date: string
  customerId: string
  customer: string
  invoiceId: string
  invoice: string
  paymentId: string
  amount: number
  remainingBalance: number
  method?: string
  batchId?: string
}

export async function GET(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'audit:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  const startParam = url.searchParams.get('start') || undefined
  const endParam = url.searchParams.get('end') || undefined
  const { start, end } = deriveRange(period, startParam ?? null, endParam ?? null)
  const startIso = start || undefined
  const endIso = end || undefined
  const filterCustomerId = url.searchParams.get('customerId') || undefined

  // Build rows from audit events that represent invoice payment applications
  const payEvents = (db.auditEvents || []).filter(e => e.action === 'invoice:payment')
  const rows: HistoryRow[] = payEvents.map(ev => {
    const after: any = ev.after || {}
    const invoiceId: string = String(after.invoiceId || ev.entityId || '')
    const paymentId: string = String(after.paymentId || '')
    const customerId: string = String(after.customerId || '')
    const date: string = String(after.date || '').slice(0, 10)
    const amount: number = Number(after.amount || 0)
    const remainingBalance: number = Number(after.remainingBalance || 0)
    const inv = db.invoices.find(i => i.id === invoiceId)
    const customer = db.customers.find(c => c.id === (inv?.customerId || customerId))
    // Locate underlying Payment to infer batch and fund source
    let pmt: any | undefined
    for (const inv2 of db.invoices) {
      const found = (inv2.payments || []).find((p: any) => p.id === paymentId)
      if (found) { pmt = found; break }
    }
    // Derive batch id via deposit linkage
    const batchId: string | undefined = pmt?.depositId || (db.deposits || []).find(d => (d.paymentIds || []).includes(paymentId))?.id
    // Prefer method on event.after; else from customer payment or payment fundSource
    let method: string | undefined = after.method
    if (!method) {
      // If created via CustomerPayment, grab method from that record
      const cp = (db.customerPayments || []).find(cp => (cp.paymentIds || []).includes(paymentId))
      method = cp?.method || pmt?.fundSource
    }
    return {
      date,
      customerId: customer?.id || customerId,
      customer: customer?.name || (customerId || ''),
      invoiceId: inv?.id || invoiceId,
      invoice: inv?.number || (invoiceId || ''),
      paymentId,
      amount,
      remainingBalance,
      method,
      batchId,
    }
  })
  // Filter by date range and customer
  let filtered = rows
  if (startIso) filtered = filtered.filter(r => (r.date || '') >= startIso)
  if (endIso) filtered = filtered.filter(r => (r.date || '') <= endIso)
  if (filterCustomerId) filtered = filtered.filter(r => r.customerId === filterCustomerId)
  // Stable sort by date then invoice/payment ids
  filtered = filtered.slice().sort((a, b) => a.date.localeCompare(b.date) || a.invoiceId.localeCompare(b.invoiceId) || a.paymentId.localeCompare(b.paymentId))

  return NextResponse.json({
    start: startIso || null,
    end: endIso || null,
    history: { count: filtered.length, rows: filtered },
  })
}

