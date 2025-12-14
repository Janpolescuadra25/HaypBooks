import { db } from '@/mock/db'

export type Row = {
  date: string
  type: string
  number: string
  item: string
  vendor: string
  qty: number
  rate: number
  amount: number
}

export function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  const sIso = start || null
  const eIso = end || null
  const rows: Row[] = []
  // Bills -> one row per bill line (qty 1, rate = line amount, amount negative to represent expense)
  for (const bill of db.bills) {
    const vendor = (db.vendors.find(v => v.id === bill.vendorId)?.name) || bill.vendorId
    const dateIso = (bill.billDate || bill.dueDate).slice(0,10)
    if (sIso && dateIso < sIso) continue
    if (eIso && dateIso > eIso) continue
    for (const [idx, line] of (bill.lines || []).entries()) {
      const desc = line.description || `Line ${idx+1}`
      const amt = Number(line.amount || 0)
      rows.push({ date: dateIso, type: 'Bill', number: bill.number, item: desc, vendor, qty: 1, rate: amt, amount: -Math.abs(amt) })
    }
    // Include payments as reductions (positive amount rows)
    for (const p of bill.payments) {
      const pDate = p.date.slice(0,10)
      if (sIso && pDate < sIso) continue
      if (eIso && pDate > eIso) continue
      rows.push({ date: pDate, type: 'Bill Payment', number: p.id, item: 'Payment', vendor, qty: 0, rate: 0, amount: Math.abs(p.amount) })
    }
  }
  // Sort stable by date, then vendor, then number
  rows.sort((a,b)=> a.date.localeCompare(b.date) || a.vendor.localeCompare(b.vendor) || a.number.localeCompare(b.number))
  return rows
}

export function filterRowsByTag(rows: Row[], tag?: string) {
  if (!tag) return rows
  const hash = Array.from(tag).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const filtered = rows.filter((_, idx) => ((hash + idx) % 2) === 0)
  return filtered.length > 0 ? filtered : rows.slice(0, 1)
}
