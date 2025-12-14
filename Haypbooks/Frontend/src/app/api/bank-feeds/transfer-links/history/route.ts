import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'

// GET /api/bank-feeds/transfer-links/history?start=YYYY-MM-DD&end=YYYY-MM-DD&accountNumber=...&txnId=...&transferId=...
// Data source: audit events when a bank transaction is linked/unlinked to an existing bank transfer
//   include actions 'bank-match:apply' (Link) and 'bank-match:undo' (Unlink) where meta.kind = 'transfer'
export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'audit:read') || !hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  seedIfNeeded()

  const url = new URL(req.url)
  const start = url.searchParams.get('start') || null
  const end = url.searchParams.get('end') || null
  const accountNumber = url.searchParams.get('accountNumber') || null
  const txnIdFilter = url.searchParams.get('txnId') || null
  const transferIdFilter = url.searchParams.get('transferId') || null

  const events = (db.auditEvents || []).filter((e: any) => (e?.action === 'bank-match:apply' || e?.action === 'bank-match:undo') && e?.meta?.kind === 'transfer') as any[]
  const rows: any[] = []
  for (const ev of events) {
    const ts: string = ev.ts
    const date = (ts || '').slice(0,10)
    if (start && (!date || date < start)) continue
    if (end && (!date || date > end)) continue

    const txnId: string = ev.entityId
    if (txnIdFilter && txnId !== txnIdFilter) continue
    const txn = (db.transactions || []).find((t: any) => t.id === txnId)
    const txnDate = txn ? String(txn.date || '').slice(0,10) : null
    const txnAmount = txn ? Number(txn.amount || 0) : (typeof ev.meta?.amount === 'number' ? Number(ev.meta.amount) : null)
    const acc = txn ? (db.accounts || []).find((a: any) => a.id === txn.accountId) : null
    const accNumber = acc?.number || null
    if (accountNumber && accNumber !== accountNumber) continue

    const transferId: string | null = ev.meta?.targetId || null
    if (transferIdFilter && transferId !== transferIdFilter) continue
    const transfer = (db.transfers || []).find((x: any) => x.id === transferId)
    rows.push({
      ts,
      date,
      action: ev.action === 'bank-match:undo' ? 'Unlink' : 'Link',
      txnId,
      txnDate,
      txnAmount,
      accountNumber: accNumber,
      transferId,
      fromAccountNumber: transfer?.fromAccountNumber || null,
      toAccountNumber: transfer?.toAccountNumber || null,
      transferDate: transfer?.date || null,
      transferAmount: transfer ? Number(transfer.amount || 0) : null,
      memo: transfer?.memo || null,
    })
  }
  rows.sort((a,b)=> (b.ts||'').localeCompare(a.ts||''))
  return NextResponse.json({ history: { start, end, accountNumber, txnId: txnIdFilter, transferId: transferIdFilter, count: rows.length, rows } })
}
