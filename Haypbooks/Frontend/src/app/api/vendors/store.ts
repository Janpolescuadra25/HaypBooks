export type Vendor = { id: string; name: string; terms?: string; email?: string; phone?: string }

let vendors: Vendor[] = []

export function seedVendors(seed: Vendor[]) {
  const byId = new Map(vendors.map((v) => [v.id, v]))
  for (const v of seed) {
    if (!byId.has(v.id)) vendors.push(v)
  }
}

export function listVendors(): Vendor[] { return vendors }

export function addVendor(v: Vendor): Vendor { vendors.push(v); return v }

export function updateVendor(id: string, patch: Partial<Vendor>): Vendor | null {
  const idx = vendors.findIndex((v) => v.id === id)
  if (idx === -1) return null
  vendors[idx] = { ...vendors[idx], ...patch }
  return vendors[idx]
}

export function ensureSampleVendors(count = 8) {
  if (vendors.length === 0) {
    seedVendors(Array.from({ length: count }, (_, i) => ({
      id: `ven_${i + 1}`,
      name: `Vendor ${i + 1}`,
      terms: ['Net 15','Net 30','Due on receipt'][i % 3],
      email: `vendor${i + 1}@example.com`,
      phone: `555-02${(i + 1).toString().padStart(2, '0')}`,
    })))
  }
}
