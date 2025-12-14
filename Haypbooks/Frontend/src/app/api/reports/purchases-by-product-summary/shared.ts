export type Row = {
  item: string
  transactions: number
  qty: number
  amount: number
}

// Deterministic mock row generator seeded by as-of date. Accepts range params
// to mirror other report signatures (no-op for this mock).
export function generateRows(asOfIso: string, _start?: string | null, _end?: string | null): Row[] {
  const seed = Number(asOfIso.slice(-2)) || 15
  const base = (n: number) => (seed % 10) + n
  const rows: Row[] = [
    { item: 'Paper', transactions: 2 + (base(1) % 3), qty: 10 + (base(2) % 5), amount: -(50 + (base(3) * 2)) },
    { item: 'Ink', transactions: 1 + (base(4) % 2), qty: 3 + (base(5) % 4), amount: -(105 + (base(6) * 3)) },
    { item: 'Hosting', transactions: 1, qty: 1 + (base(7) % 2), amount: -(120 + (base(8) * 5)) },
    { item: 'Fuel', transactions: 1 + (base(9) % 2), qty: 8 + (base(10) % 3), amount: -(36 + (base(11) * 2)) },
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
