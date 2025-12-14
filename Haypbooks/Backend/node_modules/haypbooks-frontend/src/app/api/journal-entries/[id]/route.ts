import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db } from '@/mock/db'
import '@/mock/seed'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const id = params.id
  const je = (db.journalEntries || []).find(j => String(j.id) === String(id))
  if (!je) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const totals = (je.lines || []).reduce((acc: any, l: any) => { acc.debit += Number(l.debit||0); acc.credit += Number(l.credit||0); return acc }, { debit: 0, credit: 0 })
  // JournalEntry type does not include a top-level memo; individual lines carry memos.
  return NextResponse.json({
    id: je.id,
    date: je.date,
    memo: null,
    adjusting: !!je.adjusting,
    reversing: !!je.reversing,
    lines: je.lines.map((l: any) => {
      const acc = db.accounts.find(a => a.id === l.accountId)
      return { accountId: l.accountId, accountNumber: acc?.number || '', accountName: acc?.name || l.accountId, debit: Number(l.debit||0), credit: Number(l.credit||0), memo: l.memo || null }
    }),
    totals,
    balanced: Math.abs(totals.debit - totals.credit) < 0.01,
    generatedAt: new Date().toISOString(),
  })
}
