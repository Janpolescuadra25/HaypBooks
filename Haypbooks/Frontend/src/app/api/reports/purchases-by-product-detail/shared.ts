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

// Deterministic mock row generator seeded by as-of date. Accepts range params
// to mirror other report signatures; range is applied to returned rows.
export function generateRows(asOfIso: string, start?: string | null, end?: string | null): Row[] {
  const seed = Number(asOfIso.slice(-2)) || 15
  const day = (offset: number) => {
    const d = new Date((end || asOfIso) + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() - offset)
    return d.toISOString().slice(0, 10)
  }
  const rows: Row[] = [
    { date: day(0), type: 'Bill', number: `BILL-${4000 + (seed % 50)}`, item: 'Paper', vendor: 'Vendor A', qty: 10, rate: 5, amount: -50 },
    { date: day(1), type: 'Bill', number: `BILL-${4001 + (seed % 50)}`, item: 'Ink', vendor: 'Vendor A', qty: 3, rate: 35, amount: -105 },
    { date: day(2), type: 'Bill', number: `BILL-${4100 + (seed % 50)}`, item: 'Hosting', vendor: 'Vendor B', qty: 1, rate: 120, amount: -120 },
    { date: day(3), type: 'Expense', number: `EXP-${7000 + (seed % 50)}`, item: 'Fuel', vendor: 'Vendor C', qty: 8, rate: 4.5, amount: -36 },
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
