// In-memory store for transactions during development/testing

export type Transaction = {
  id: string
  date: string
  description: string
  category: 'Income' | 'Expense' | 'Transfer'
  amount: number
  accountId: string
  // Optional fields to support bank-transactions filters when mock is disabled
  bankStatus?: 'imported' | 'for_review' | 'categorized' | 'excluded'
  tags?: string[]
}

const txns = new Map<string, Transaction>()

export function upsertTransaction(t: Transaction) {
  txns.set(t.id, t)
  return t
}

export function getTransaction(id: string): Transaction | undefined {
  return txns.get(id)
}

export function listTransactions(): Transaction[] {
  return Array.from(txns.values())
}

export function deleteTransaction(id: string) {
  txns.delete(id)
}

export function seedTransactions(rows: Transaction[]) {
  if (txns.size === 0) rows.forEach((r) => txns.set(r.id, r))
}
