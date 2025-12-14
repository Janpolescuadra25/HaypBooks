// Simple in-memory store for mock bill state across API calls during dev
// Note: This is not persisted; server restarts will reset it.

export type Bill = {
  id: string
  number: string
  vendor: string
  status: 'open' | 'scheduled' | 'paid' | 'pending_approval' | 'approved' | 'rejected'
  total: number
  dueDate: string
  items?: Array<{ description: string; amount: number }>
  payments?: Array<{ id: string; date: string; amount: number }>
  scheduledDate?: string | null
  approval?: { status: 'pending' | 'approved' | 'rejected'; by?: string; at?: string; note?: string }
  // Optional tags to support filtering when mock layer is disabled
  tags?: string[]
}

const bills = new Map<string, Bill>()

export function upsertBill(bill: Bill) {
  bills.set(bill.id, bill)
  return bill
}

export function getBill(id: string): Bill | undefined {
  return bills.get(id)
}

export function listBills(): Bill[] {
  return Array.from(bills.values())
}

export function seedIfEmpty(rows: Bill[]) {
  if (bills.size === 0) rows.forEach((b) => bills.set(b.id, b))
}
