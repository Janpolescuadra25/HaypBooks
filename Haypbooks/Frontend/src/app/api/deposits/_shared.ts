import { db, seedIfNeeded } from '@/mock/db'

export type DepositPayment = {
  id: string
  invoiceId: string
  invoiceNumber: string
  amount: number
  date: string
}

export type DepositDetail = {
  id: string
  date: string
  total: number
  memo?: string
  reversingEntryId?: string
  voidedAt?: string
  journalEntryId?: string
  depositToAccount?: { number: string; name: string }
  payments: DepositPayment[]
}

export function getDepositDetail(id: string): DepositDetail | null {
  try { seedIfNeeded() } catch {}
  const dep = (db.deposits || []).find(d => d.id === id)
  if (!dep) return null

  // Assemble payments attached to this deposit
  const payments: DepositPayment[] = []
  for (const inv of db.invoices) {
    for (const p of inv.payments) {
      if (dep.paymentIds.includes(p.id)) {
        payments.push({ id: p.id, invoiceId: inv.id, invoiceNumber: inv.number, amount: p.amount, date: p.date })
      }
    }
  }

  // Derive deposit-to account (from original JE debit line)
  const je = dep.journalEntryId ? (db.journalEntries || []).find(j => j.id === dep.journalEntryId) : undefined
  let depositToAccount: { number: string; name: string } | undefined
  if (je) {
    const debitLine = je.lines.find(l => (l.debit || 0) > 0)
    if (debitLine) {
      const acc = (db.accounts || []).find(a => a.id === debitLine.accountId)
      if (acc) depositToAccount = { number: acc.number, name: acc.name }
    }
  }

  const reversingEntryId = (dep as any).reversingEntryId as string | undefined
  const voidedAt = (dep as any).voidedAt as string | undefined

  return {
    id: dep.id,
    date: dep.date,
    total: dep.total,
    memo: (dep as any).memo as string | undefined,
    reversingEntryId,
    voidedAt,
    journalEntryId: dep.journalEntryId,
    depositToAccount,
    payments,
  }
}
