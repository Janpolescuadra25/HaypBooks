import { NextRequest, NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded, db } from '@/mock/db'
import { findReceipt } from '../../store'

// Lightweight Levenshtein distance (non-optimized) for short vendor strings
function levenshtein(a: string, b: string) {
  if (a === b) return 0
  const al = a.length, bl = b.length
  if (al === 0) return bl
  if (bl === 0) return al
  const dp: number[] = Array(bl + 1)
  for (let j = 0; j <= bl; j++) dp[j] = j
  for (let i = 1; i <= al; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= bl; j++) {
      const tmp = dp[j]
      if (a[i - 1] === b[j - 1]) dp[j] = prev
      else dp[j] = Math.min(prev + 1, dp[j] + 1, dp[j - 1] + 1)
      prev = tmp
    }
  }
  return dp[bl]
}

function similarity(aRaw: string, bRaw: string) {
  const a = (aRaw || '').trim().toLowerCase()
  const b = (bRaw || '').trim().toLowerCase()
  if (!a || !b) return 0
  if (a === b) return 1
  // Prefix boost
  const prefixBoost = (b.startsWith(a) || a.startsWith(b)) ? 0.15 : 0
  const dist = levenshtein(a, b)
  const maxLen = Math.max(a.length, b.length)
  const base = 1 - dist / maxLen
  return Math.max(0, Math.min(1, base + prefixBoost))
}

// GET /api/receipts/:id/suggestions
// Returns ranked candidate documents (invoices or bills) that could match a receipt by remaining balance and vendor prefix/date proximity.
// RBAC: reports:read (read-only advisory endpoint; does not mutate state)
// Query params:
//   limit (optional, default 5)
//   includeBills (optional boolean) – when false, only invoices for positive amounts
// Response shape: { suggestions: [ { kind, id, number, name, remaining, amountDifference, dateDifferenceDays, vendorSimilarity, score } ] }
// Brand-neutral; does not use external platform terminology.

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = params?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const receipt = findReceipt(id)
  if (!receipt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const url = new URL(req.url)
  const limitRaw = url.searchParams.get('limit')
  const limit = Math.min(Math.max(Number(limitRaw || 5) || 5, 1), 25)
  const includeBillsParam = url.searchParams.get('includeBills')
  const includeBills = includeBillsParam == null ? true : ['1','true','yes'].includes(includeBillsParam.toLowerCase())

  const amount = Number(receipt.amount || receipt.ocrExtract?.amount || 0)
  const vendorFull = (receipt.vendor || receipt.ocrExtract?.vendor || '').trim()
  const vendorToken = vendorFull.toLowerCase().split(/\s|[-_]/).filter(Boolean)[0] || ''
  const receiptDate = (receipt.date || receipt.ocrExtract?.date || '').slice(0,10)
  const receiptDateObj = receiptDate ? new Date(receiptDate + 'T00:00:00Z') : null
  const tol = 1 // broader tolerance for suggestions list (±1 currency unit)

  type Candidate = { kind: 'invoice' | 'bill'; id: string; number?: string; name: string; remaining: number; amountDifference: number; dateDifferenceDays: number; vendorSimilarity: number; score: number }
  const suggestions: Candidate[] = []

  try {
    if (amount >= 0) {
      // Inflow style (expenses paid): look at invoices first
      for (const inv of (db.invoices || [])) {
        if (['draft','void'].includes(String(inv.status))) continue
        const paid = inv.payments.reduce((s,p)=> s + p.amount, 0)
        const remaining = Number((inv.total - paid).toFixed(2))
        if (remaining <= 0) continue
        if (Math.abs(remaining - amount) > tol) continue
        const cust = db.customers.find(c => c.id === inv.customerId)
        const name = (cust?.name || '').trim()
        const nameToken = name.toLowerCase().split(/\s|[-_]/).filter(Boolean)[0] || ''
        if (vendorToken && nameToken && !nameToken.startsWith(vendorToken)) continue
        let dateDiffDays = 9999
        try {
          if (receiptDateObj) {
            const invDateObj = new Date((inv.dueDate || inv.date || '').slice(0,10) + 'T00:00:00Z')
            dateDiffDays = Math.abs(Math.round((invDateObj.getTime() - receiptDateObj.getTime()) / 86400000))
          }
        } catch {}
        const vendorSim = similarity(vendorFull, name)
        const amtDiff = Math.abs(remaining - amount)
        const amountScore = Math.max(0, 1 - (amtDiff / Math.max(1, Math.abs(amount))))
        const dateScore = dateDiffDays === 9999 ? 0 : Math.max(0, 1 - (dateDiffDays / 30))
        const kindBias = 0.05 // slight preference for invoices in tie cases
        const composite = vendorSim * 0.5 + amountScore * 0.3 + dateScore * 0.15 + kindBias
        suggestions.push({ kind: 'invoice', id: inv.id, number: inv.number, name, remaining, amountDifference: amtDiff, dateDifferenceDays: dateDiffDays, vendorSimilarity: vendorSim, score: Number(composite.toFixed(6)) })
      }
      if (includeBills) {
        for (const bill of (db.bills || [])) {
          if (bill.status === 'void') continue
          const paid = bill.payments.reduce((s,p)=> s + p.amount, 0)
          const remaining = Number((bill.total - paid).toFixed(2))
          if (remaining <= 0) continue
          if (Math.abs(remaining - amount) > tol) continue
          const ven = db.vendors.find(v => v.id === bill.vendorId)
          const name = (ven?.name || '').trim()
          const nameToken = name.toLowerCase().split(/\s|[-_]/).filter(Boolean)[0] || ''
          if (vendorToken && nameToken && !nameToken.startsWith(vendorToken)) continue
          let dateDiffDays = 9999
          try {
            if (receiptDateObj) {
              const billDateObj = new Date((bill.billDate || bill.dueDate || '').slice(0,10) + 'T00:00:00Z')
              dateDiffDays = Math.abs(Math.round((billDateObj.getTime() - receiptDateObj.getTime()) / 86400000))
            }
          } catch {}
          const vendorSim = similarity(vendorFull, name)
          const amtDiff = Math.abs(remaining - amount)
          const amountScore = Math.max(0, 1 - (amtDiff / Math.max(1, Math.abs(amount))))
          const dateScore = dateDiffDays === 9999 ? 0 : Math.max(0, 1 - (dateDiffDays / 30))
          const kindBias = 0 // no bias for bills here (inflows path)
          const composite = vendorSim * 0.5 + amountScore * 0.3 + dateScore * 0.15 + kindBias
          suggestions.push({ kind: 'bill', id: bill.id, number: bill.number, name, remaining, amountDifference: amtDiff, dateDifferenceDays: dateDiffDays, vendorSimilarity: vendorSim, score: Number(composite.toFixed(6)) })
        }
      }
    } else {
      // Negative amounts (rare for receipts) — treat as outflow and look primarily at bills
      const absAmt = Math.abs(amount)
      for (const bill of (db.bills || [])) {
        if (bill.status === 'void') continue
        const paid = bill.payments.reduce((s,p)=> s + p.amount, 0)
        const remaining = Number((bill.total - paid).toFixed(2))
        if (remaining <= 0) continue
        if (Math.abs(remaining - absAmt) > tol) continue
        const ven = db.vendors.find(v => v.id === bill.vendorId)
        const name = (ven?.name || '').trim()
        const nameToken = name.toLowerCase().split(/\s|[-_]/).filter(Boolean)[0] || ''
        if (vendorToken && nameToken && !nameToken.startsWith(vendorToken)) continue
        let dateDiffDays = 9999
        try {
          if (receiptDateObj) {
            const billDateObj = new Date((bill.billDate || bill.dueDate || '').slice(0,10) + 'T00:00:00Z')
            dateDiffDays = Math.abs(Math.round((billDateObj.getTime() - receiptDateObj.getTime()) / 86400000))
          }
        } catch {}
        const vendorSim = similarity(vendorFull, name)
        const amtDiff = Math.abs(remaining - absAmt)
        const amountScore = Math.max(0, 1 - (amtDiff / Math.max(1, Math.abs(absAmt))))
        const dateScore = dateDiffDays === 9999 ? 0 : Math.max(0, 1 - (dateDiffDays / 30))
        // Outflow bill-only path: no kind bias
        const composite = vendorSim * 0.55 + amountScore * 0.3 + dateScore * 0.15
  suggestions.push({ kind: 'bill', id: bill.id, number: bill.number, name, remaining, amountDifference: amtDiff, dateDifferenceDays: dateDiffDays, vendorSimilarity: vendorSim, score: Number(composite.toFixed(6)) })
      }
    }
  } catch { /* best-effort */ }

  // Rank: highest composite score, then smaller amountDifference, then smaller dateDifferenceDays, then kind (invoice first), then id
  suggestions.sort((a,b) => {
    if (b.score !== a.score) return b.score - a.score
    if (a.amountDifference !== b.amountDifference) return a.amountDifference - b.amountDifference
    if (a.dateDifferenceDays !== b.dateDifferenceDays) return a.dateDifferenceDays - b.dateDifferenceDays
    if (a.kind !== b.kind) return a.kind === 'invoice' ? -1 : 1
    return a.id.localeCompare(b.id)
  })

  return NextResponse.json({ suggestions: suggestions.slice(0, limit) })
}
