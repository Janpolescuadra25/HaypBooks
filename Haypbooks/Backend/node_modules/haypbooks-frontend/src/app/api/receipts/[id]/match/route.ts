import { NextRequest, NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded } from '@/mock/db'
import { findReceipt, mutateReceipt } from '../../store'
import { logEvent } from '@/lib/audit'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = params?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const receipt = findReceipt(id)
  if (!receipt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (receipt.status && !['uploaded','parsed','matched'].includes(receipt.status)) return NextResponse.json({ error: 'Invalid lifecycle for match' }, { status: 400 })
  const body = await req.json().catch(() => null)
  let txnId = body?.transactionId || body?.matchedTransactionId || receipt.suggestedMatchTransactionId
  if (!txnId) return NextResponse.json({ error: 'transactionId required' }, { status: 400 })
  mutateReceipt(id, (rec) => { rec.matchedTransactionId = txnId; rec.status = 'matched' })
  try { logEvent({ userId: role || 'system', action: 'receipt.match', entity: 'receipt', entityId: id, meta: { txnId } }) } catch {}
  return NextResponse.json({ receipt: findReceipt(id) })
}
