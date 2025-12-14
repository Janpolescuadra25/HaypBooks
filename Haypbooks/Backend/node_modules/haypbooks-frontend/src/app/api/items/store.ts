export type Item = {
  id: string
  name: string
  type: 'Service' | 'Non-inventory' | 'Inventory'
  sku?: string
  price?: number
  active?: boolean
}

let items: Item[] = []

export function seedItems(seed: Item[]) {
  const byId = new Map(items.map((i) => [i.id, i]))
  for (const i of seed) {
    if (!byId.has(i.id)) items.push(i)
  }
}

export function listItems(): Item[] { return items }

export function ensureSampleItems(count = 10) {
  if (items.length === 0) {
    const kinds: Item['type'][] = ['Service', 'Non-inventory', 'Inventory']
    const sample = Array.from({ length: count }, (_, i) => ({
      id: `item_${i + 1}`,
      name: `Item ${i + 1}`,
      type: kinds[i % kinds.length],
      sku: `SKU-${(1000 + i).toString()}`,
      price: Number((25 + i * 2.5).toFixed(2)),
      active: true,
    })) as Item[]
    seedItems(sample)
  }
}
