export type Row = {
  date: string
  type: string
  number: string
  customer: string
  item: string
  qty: number
  rate: number
  amount: number
}

export function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  const seed = Number(asOfIso.slice(-2)) || 15
  const day = (offset: number) => {
    const d = new Date((end || asOfIso) + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() - offset)
    return d.toISOString().slice(0, 10)
  }
  // Deterministic mock rows for two customers across a few items
  const rows: Row[] = [
    { date: day(0), type: 'Invoice', number: `INV-${1000 + (seed % 50)}`, customer: 'Customer A', item: 'Consulting', qty: 5, rate: 200, amount: 1000 },
    { date: day(1), type: 'Invoice', number: `INV-${1001 + (seed % 50)}`, customer: 'Customer A', item: 'Support', qty: 2, rate: 250, amount: 500 },
    { date: day(2), type: 'Invoice', number: `INV-${1100 + (seed % 50)}`, customer: 'Customer B', item: 'Implementation', qty: 3, rate: 300, amount: 900 },
    { date: day(3), type: 'Sales Receipt', number: `SR-${4000 + (seed % 50)}`, customer: 'Customer B', item: 'Training', qty: 1, rate: 400, amount: 400 },
  ]
  const sIso = start || null
  const eIso = end || null
  return rows.filter(r => {
    if (sIso && r.date < sIso) return false
    if (eIso && r.date > eIso) return false
    return true
  })
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
