import { db } from '@/mock/db'

export type Row = {
  vendor: string
  transactions: number
  qty: number
  amount: number
}

// DB-backed row generator: aggregates Bills by vendor within optional date range.
// transactions = count of bills, qty = total bill line count, amount = sum of line amounts
export function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  const sIso = start || null
  const eIso = end || null
  const byVendor: Record<string, Row> = {}
  for (const bill of db.bills) {
    const vendorName = (db.vendors.find(v => v.id === bill.vendorId)?.name) || bill.vendorId
    const dateIso = (bill.billDate || bill.dueDate).slice(0,10)
    if (sIso && dateIso < sIso) continue
    if (eIso && dateIso > eIso) continue
    if (!byVendor[vendorName]) byVendor[vendorName] = { vendor: vendorName, transactions: 0, qty: 0, amount: 0 }
    const row = byVendor[vendorName]
    row.transactions += 1
    for (const line of (bill.lines || [])) {
      row.qty += 1
      row.amount += Number(line.amount || 0)
    }
  }
  return Object.values(byVendor).sort((a,b)=> a.vendor.localeCompare(b.vendor))
}

// Stable tag-based filter that always returns at least one row
export function filterRowsByTag(rows: Row[], tag?: string) {
  if (!tag) return rows
  const hash = Array.from(tag).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const filtered = rows.filter((_, idx) => ((hash + idx) % 2) === 0)
  return filtered.length > 0 ? filtered : rows.slice(0, 1)
}
