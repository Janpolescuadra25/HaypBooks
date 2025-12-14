import { NextRequest, NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded } from '@/mock/db'
import { findReceipt, mutateReceipt } from '../../store'
import { db } from '@/mock/db'
import { logEvent } from '@/lib/audit'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = params?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const receipt = findReceipt(id)
  if (!receipt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (receipt.status && !['uploaded','parsed'].includes(receipt.status)) return NextResponse.json({ error: 'Invalid lifecycle for parse' }, { status: 400 })
  // Deterministic OCR stub: infer vendor/date tokens and synthesize amount in a repeatable way.
  // This avoids random test flakiness while remaining brand-neutral.
  const name = receipt.attachment?.name || receipt.vendor || 'receipt.jpg'
  let ocrVendor: string | undefined
  let ocrDate: string | undefined
  let ocrAmount: number | undefined
  try {
    const stem = name.replace(/\.[^.]+$/, '')
    // Extract date token if present (YYYYMMDD or YYYY-MM-DD or YYYY_MM_DD)
    const dateMatch = stem.match(/(20\d{2})[-_]?(\d{2})[-_]?(\d{2})/)
    if (dateMatch) ocrDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
    // Vendor: first token not numeric
    const tokens = stem.split(/[-_]/).filter(Boolean)
    const vendorToken = tokens.find(t => !/^\d+$/.test(t))
    if (vendorToken && vendorToken.length >= 2) ocrVendor = vendorToken
    // Deterministic amount: hash stem chars → sum char codes mod a range, scaled to two decimals
    const base = stem.split('').reduce((s,ch)=> s + ch.charCodeAt(0), 0)
    const scaled = (base % 5000) / 100 // up to 50.00
    ocrAmount = Number(scaled.toFixed(2))
  } catch {}

  // Auto-match heuristic (single candidate suggestion):
  // Try to locate one open invoice (inflow) or open bill (outflow) whose remaining balance
  // approximately equals the receipt amount (within tolerance) and whose name token matches
  // a prefix of the OCR vendor or original vendor. If exactly one candidate is found, store
  // its id on suggestedMatchTransactionId. This remains brand-neutral and does not alter posting.
  let suggested: string | undefined
  try {
    const amt = typeof ocrAmount === 'number' && !isNaN(ocrAmount) ? ocrAmount : receipt.amount
    const vendorToken = (ocrVendor || receipt.vendor || '').toLowerCase().split(/\s|[-_]/).filter(Boolean)[0]
    const tol = 0.01
    const isInflow = amt > 0
    if (amt > 0) {
      // Candidate invoices (open / partial / sent) with positive remaining balance
      const candidates = (db.invoices || [])
        .filter(inv => ['draft','void'].indexOf(inv.status as any) === -1) // exclude draft/void
        .map(inv => {
          const paid = inv.payments.reduce((s,p)=> s + p.amount, 0)
          const remaining = Number((inv.total - paid).toFixed(2))
          return { inv, remaining }
        })
        .filter(r => r.remaining > 0 && Math.abs(r.remaining - amt) <= tol)
        .filter(r => {
          if (!vendorToken) return true
          const cust = db.customers.find(c => c.id === r.inv.customerId)
          const name = (cust?.name || '').toLowerCase()
          return vendorToken && name.startsWith(vendorToken)
        })
      if (candidates.length === 1) suggested = candidates[0].inv.id
    } else {
      // Outflow scenario (negative receipt amounts rarely occur; if they do treat as expense/bill)
      const absAmt = Math.abs(amt)
      const candidates = (db.bills || [])
        .filter(b => b.status !== 'void')
        .map(b => {
          const paid = b.payments.reduce((s,p)=> s + p.amount, 0)
          const remaining = Number((b.total - paid).toFixed(2))
          return { bill: b, remaining }
        })
        .filter(r => r.remaining > 0 && Math.abs(r.remaining - absAmt) <= tol)
        .filter(r => {
          if (!vendorToken) return true
            const ven = db.vendors.find(v => v.id === r.bill.vendorId)
            const name = (ven?.name || '').toLowerCase()
            return vendorToken && name.startsWith(vendorToken)
        })
      if (candidates.length === 1) suggested = candidates[0].bill.id
    }
  } catch { /* heuristic best-effort; never fatal */ }

  mutateReceipt(id, (rec) => {
    rec.status = 'parsed'
    ;(rec as any).ocrExtract = {
      vendor: ocrVendor || rec.vendor,
      date: ocrDate || rec.date,
      amount: typeof ocrAmount === 'number' && !isNaN(ocrAmount) ? ocrAmount : (typeof rec.amount === 'number' ? rec.amount : 0),
    }
    if (suggested) (rec as any).suggestedMatchTransactionId = suggested
  })
  try { logEvent({ userId: role || 'system', action: 'receipt.parse', entity: 'receipt', entityId: id, meta: { method: receipt.method } }) } catch {}
  return NextResponse.json({ receipt: findReceipt(id) })
}
