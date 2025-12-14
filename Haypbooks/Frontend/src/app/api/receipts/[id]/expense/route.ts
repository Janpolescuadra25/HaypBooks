import { NextRequest, NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded, postJournal } from '@/mock/db'
import { findReceipt, mutateReceipt } from '../../store'

// Convert a posted receipt into an expense entry (mock). Assumes initial posting journal already exists.
// If not posted yet, requires lifecycle completion first.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = params?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const receipt = findReceipt(id)
  if (!receipt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (receipt.status !== 'posted') return NextResponse.json({ error: 'Receipt must be posted before converting' }, { status: 400 })
  if (receipt.expenseId) return NextResponse.json({ error: 'Already converted', expenseId: receipt.expenseId }, { status: 409 })

  const body = await req.json().catch(() => ({}))
  // Normalize provided/previous account number; default to '6000'
  const acctRaw = (body.expenseAccountNumber ?? (receipt as any).expenseAccountNumber ?? '6000')
  const acct = String(acctRaw).trim()
  const dateIso = (receipt.date || new Date().toISOString()).slice(0,10)
  // Post an expense journal only if original posting did not already use the expense account. For simplicity we reuse existing journal and just attach an expense id.
  // Future enhancement: create a distinct expense entity table; here we simulate with id only.
  const expenseId = `exp_${id}`
  // If original journal used a generic account different from acct, create adjustment journal. For now assume original was 6000 so skip.
  if (acct !== '6000') {
    try {
      postJournal([
        { accountNumber: acct, debit: Number(receipt.amount || 0), memo: `Expense conversion for receipt ${id}` },
        { accountNumber: '6000', credit: Number(receipt.amount || 0), memo: `Expense conversion for receipt ${id}` },
  ], dateIso, { type: 'payment', id })
    } catch (e: any) {
      return NextResponse.json({ error: String(e?.message || 'Journal post failed') }, { status: 500 })
    }
  }
  mutateReceipt(id, (rec) => { (rec as any).expenseId = expenseId; (rec as any).expenseAccountNumber = acct })
  return NextResponse.json({ receipt: findReceipt(id) })
}
