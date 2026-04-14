import { extractItems, extractTotal } from '@/components/sales/ProductsServicesPage'

describe('ProductsServicesPage list response helpers', () => {
  it('returns array payload directly', () => {
    const payload = [{ id: '1', name: 'Test Item' }]
    expect(extractItems(payload as any)).toEqual(payload)
    expect(extractTotal(payload as any)).toBe(1)
  })

  it('extracts items from paginated data response', () => {
    const payload = { data: [{ id: '2', name: 'Another Item' }], total: 1 }
    expect(extractItems(payload)).toEqual(payload.data)
    expect(extractTotal(payload)).toBe(1)
  })

  it('extracts items from items response shape', () => {
    const payload = { items: [{ id: '3', name: 'Third Item' }] }
    expect(extractItems(payload)).toEqual(payload.items)
    expect(extractTotal(payload)).toBe(1)
  })

  it('returns empty array for unsupported payload shapes', () => {
    expect(extractItems(null)).toEqual([])
    expect(extractTotal(null)).toBe(0)
  })
})
