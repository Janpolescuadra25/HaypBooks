// Simple in-memory store for mock invoice state across API calls during dev

export type Invoice = {
  id: string
  number: string
  customer: string
  status: 'draft' | 'sent' | 'paid'
  total: number
  date: string
  items?: Array<{ description: string; amount: number }>
  payments?: Array<{ id: string; date: string; amount: number }>
  // Optional tags to support filtering when mock layer is disabled
  tags?: string[]
}

const invoices = new Map<string, Invoice>()

export function upsertInvoice(inv: Invoice) {
  invoices.set(inv.id, inv)
  return inv
}

export function getInvoice(id: string): Invoice | undefined {
  return invoices.get(id)
}

export function listInvoices(): Invoice[] {
  return Array.from(invoices.values())
}

export function seedInvoices(rows: Invoice[]) {
  if (invoices.size === 0) rows.forEach((r) => invoices.set(r.id, r))
}