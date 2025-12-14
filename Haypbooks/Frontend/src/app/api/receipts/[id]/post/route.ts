import { NextRequest, NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded, postJournal } from '@/mock/db'
import { logEvent } from '@/lib/audit'
import { findReceipt, mutateReceipt } from '../../store'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = params?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const receipt = findReceipt(id)
  if (!receipt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (receipt.status && !['matched','posted'].includes(receipt.status)) return NextResponse.json({ error: 'Invalid lifecycle for post' }, { status: 400 })
  // Create a mock journal entry for this receipt and link it
  try {
    const dateIso = (receipt.date || new Date().toISOString()).slice(0,10)
    const memo = `Receipt ${receipt.vendor || ''} ${dateIso}`
    // Treat receipts as vendor-paid expense: DR Expense (6000), CR Cash (1000)
    const jeId = postJournal([
      { accountNumber: '6000', debit: Number(receipt.amount || 0), memo },
      { accountNumber: '1000', credit: Number(receipt.amount || 0), memo },
    ], dateIso, { type: 'payment', id: receipt.id })
  mutateReceipt(id, (rec) => { (rec as any).status = 'posted'; (rec as any).postedAt = new Date().toISOString(); (rec as any).postedJournalId = jeId })
  try { logEvent({ userId: role || 'system', action: 'receipt.post', entity: 'receipt', entityId: id, meta: { journalId: jeId, amount: receipt.amount } }) } catch {}
  return NextResponse.json({ receipt: findReceipt(id) })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || 'Post failed') }, { status: 500 })
  }
}
