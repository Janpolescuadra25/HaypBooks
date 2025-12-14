import { NextRequest, NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded } from '@/mock/db'
import { findReceipt, mutateReceipt } from '../../store'

// Lightweight update endpoint to allow editing vendor/date/amount before matching/posting.
// RBAC: journal:write. Only allowed while status is uploaded or parsed.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = params?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const receipt = findReceipt(id)
  if (!receipt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (receipt.status && !['uploaded','parsed'].includes(receipt.status)) {
    return NextResponse.json({ error: 'Cannot edit after match/post' }, { status: 409 })
  }
  const body = await req.json().catch(() => ({}))
  const vendor = typeof body.vendor === 'string' ? body.vendor.trim() : receipt.vendor
  const date = typeof body.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : receipt.date
  const amount = (typeof body.amount === 'number' && !isNaN(body.amount)) ? Number(body.amount) : receipt.amount
  mutateReceipt(id, (r) => {
    r.vendor = vendor
    r.date = date
    r.amount = amount
    // Reset suggested match if edits could invalidate it
    if (r.suggestedMatchTransactionId) delete (r as any).suggestedMatchTransactionId
    if (r.status === 'parsed') {
      // Mark needs re-scan if user changed vendor/amount significantly? Simple heuristic: if amount diff > 0.01 or vendor changed.
      if ((Math.abs(amount - receipt.amount) > 0.01) || vendor !== receipt.vendor) {
        ;(r as any).ocrExtract = { ...(r.ocrExtract||{}), vendor: vendor, amount }
      }
    }
  })
  return NextResponse.json({ receipt: findReceipt(id) })
}
