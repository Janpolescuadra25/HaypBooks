export type Row = {
  date: string
  type: string
  number: string
  product: string
  customer: string
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
  const rows: Row[] = [
    { date: day(0), type: 'Invoice', number: `INV-${2000 + (seed % 50)}`, product: 'Consulting', customer: 'Customer A', qty: 4, rate: 220, amount: 880 },
    { date: day(1), type: 'Invoice', number: `INV-${2001 + (seed % 50)}`, product: 'Support', customer: 'Customer A', qty: 3, rate: 150, amount: 450 },
    { date: day(2), type: 'Invoice', number: `INV-${2100 + (seed % 50)}`, product: 'Implementation', customer: 'Customer B', qty: 2, rate: 500, amount: 1000 },
    { date: day(3), type: 'Sales Receipt', number: `SR-${5000 + (seed % 50)}`, product: 'Training', customer: 'Customer B', qty: 1, rate: 400, amount: 400 },
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
