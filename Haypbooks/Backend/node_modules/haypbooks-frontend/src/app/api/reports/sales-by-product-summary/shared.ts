export type Row = {
  product: string
  transactions: number
  qty: number
  amount: number
}

// Deterministic mock row generator seeded by as-of date. Range params are
// accepted for signature parity with other reports (no-op in this mock).
export function generateRows(asOfIso: string, _start?: string | null, _end?: string | null): Row[] {
  const seed = Number(asOfIso.slice(-2)) || 15
  const base = (n: number) => (seed % 10) + n
  const rows: Row[] = [
    { product: 'Consulting', transactions: 5 + (base(1) % 3), qty: 12 + (base(2) % 5), amount: 3200 + (base(3) * 50) },
    { product: 'Support', transactions: 3 + (base(4) % 3), qty: 9 + (base(5) % 4), amount: 1350 + (base(6) * 30) },
    { product: 'Implementation', transactions: 2 + (base(7) % 2), qty: 4 + (base(8) % 3), amount: 2500 + (base(9) * 80) },
    { product: 'Training', transactions: 2 + (base(10) % 2), qty: 2 + (base(11) % 2), amount: 800 + (base(12) * 40) },
  ]
  return rows
}

// Deterministic tag-based filter to simulate dimension filtering in mocks.
// Keeps a subset of rows based on a simple hash of the tag id to ensure
// stable but varied results. Guarantees at least one row remains.
export function filterRowsByTag(rows: Row[], tag: string | undefined): Row[] {
  if (!tag) return rows
  const hash = Array.from(tag).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const filtered = rows.filter((_, idx) => ((hash + idx) % 2) === 0)
  return filtered.length > 0 ? filtered : rows.slice(0, 1)
}
