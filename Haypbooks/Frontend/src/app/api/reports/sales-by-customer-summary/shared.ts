export type Row = {
  customer: string
  transactions: number
  qty: number
  amount: number
}

// Deterministic mock row generator seeded by as-of date. Range params are
// accepted for signature parity with other reports (no-op in this mock).
export function generateRows(asOfIso: string, _start?: string | null, _end?: string | null): Row[] {
  const seed = Number(asOfIso.slice(-2)) || 15
  const aTx = 2 + (seed % 3)
  const bTx = 1 + (seed % 2)
  const aQty = 7 + (seed % 4)
  const bQty = 3 + (seed % 3)
  const aAmt = 1500 + (seed % 5) * 100
  const bAmt = 900 + (seed % 4) * 120
  return [
    { customer: 'Customer A', transactions: aTx, qty: aQty, amount: aAmt },
    { customer: 'Customer B', transactions: bTx, qty: bQty, amount: bAmt },
  ]
}

// Deterministic tag-based filter to simulate dimension filtering in mocks.
// Keeps a subset of rows based on a simple hash of the tag id to ensure
// stable but varied results. Guarantees at least one row remains.
export function filterRowsByTag(rows: Row[], tag?: string) {
  if (!tag) return rows
  const hash = Array.from(tag).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const filtered = rows.filter((_, idx) => ((hash + idx) % 2) === 0)
  return filtered.length > 0 ? filtered : rows.slice(0, 1)
}
