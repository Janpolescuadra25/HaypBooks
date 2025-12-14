import { NextResponse } from 'next/server'
import { db, seedIfNeeded } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type ReminderRow = {
  date: string
  customerId: string
  customer: string
  invoiceId: string
  invoice: string
  batch?: boolean
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

  const events = (db.auditEvents || []).filter(e => e.action === 'invoice:remind')
  let rows: ReminderRow[] = events.map(ev => {
    const meta: any = ev.meta || {}
    const invoiceId: string = String(ev.entityId || meta.invoiceId || '')
    const inv = db.invoices.find(i => i.id === invoiceId)
    const customer = inv ? db.customers.find(c => c.id === inv.customerId) : undefined
    const date = (ev.ts || '').slice(0, 10)
    return {
      date,
      customerId: customer?.id || (inv?.customerId || ''),
      customer: customer?.name || (inv?.customerId || ''),
      invoiceId: invoiceId,
      invoice: inv?.number || invoiceId,
      batch: !!meta.batch,
    }
  })
  if (startIso) rows = rows.filter(r => (r.date || '') >= startIso)
  if (endIso) rows = rows.filter(r => (r.date || '') <= endIso)
  if (filterCustomerId) rows = rows.filter(r => r.customerId === filterCustomerId)
  rows = rows.slice().sort((a,b) => a.date.localeCompare(b.date) || a.customerId.localeCompare(b.customerId) || a.invoiceId.localeCompare(b.invoiceId))

  return NextResponse.json({ start: startIso || null, end: endIso || null, history: { count: rows.length, rows } })
}
