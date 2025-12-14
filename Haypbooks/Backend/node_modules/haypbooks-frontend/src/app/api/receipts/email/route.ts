import { NextRequest, NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded } from '@/mock/db'
import { addReceipt } from '../store'
import { logEvent } from '@/lib/audit'

// Simulate inbound emailed receipt ingestion.
// Body: { fileName: string; size?: number; subject?: string; amountHint?: number; dateHint?: string }
// Derives vendor from subject or fileName stem.
export async function POST(req: NextRequest) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => null)
  if (!body || !body.fileName) return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  const id = `rc_${Math.random().toString(36).slice(2,8)}`
  const now = new Date().toISOString()
  const stem = String(body.fileName).replace(/\.[^.]+$/, '')
  const vendorRaw = (body.subject || stem).split(/[-_]/)[0]
  const vendor = vendorRaw && vendorRaw.length > 1 ? vendorRaw : 'Vendor'
  const dateIso = (body.dateHint || now.slice(0,10))
  const amount = typeof body.amountHint === 'number' ? body.amountHint : Number((Math.random()*150+25).toFixed(2))
  const receipt = {
    id,
    date: dateIso,
    vendor,
    amount,
    currency: 'USD',
    method: 'email' as const,
    status: 'uploaded' as const,
    attachment: { name: body.fileName, size: Number(body.size || 0) },
    createdBy: role || 'system',
    createdAt: now,
    expenseAccountNumber: '6000'
  }
  addReceipt(receipt as any)
  try { logEvent({ userId: role || 'system', action: 'receipt.email_ingest', entity: 'receipt', entityId: id, meta: { vendor, amount } }) } catch {}
  return NextResponse.json({ receipt }, { status: 201 })
}
