import { mockApi } from '@/lib/mock-api'

function iso(y:number,m:number,d:number){return new Date(Date.UTC(y,m-1,d)).toISOString().slice(0,10)}

describe('Adjusted Trial Balance aliasing', () => {
  test('ThisQuarter behaves like QTD (derived start at quarter, end respected)', async () => {
    const data = await mockApi<any>(`/api/reports/adjusted-trial-balance?period=ThisQuarter&end=2025-09-15`)
    expect(data).toHaveProperty('start')
    expect(data).toHaveProperty('end','2025-09-15')
    // Q3 start is 2025-07-01
    expect(data.start).toBe('2025-07-01')
    expect(data.asOf).toBe('2025-09-15')
    expect(data.balanced).toBe(true)
  })

  test('ThisMonth behaves like MTD when no end provided', async () => {
    const today = new Date()
    const todayIso = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())).toISOString().slice(0,10)
    const firstOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)).toISOString().slice(0,10)
    const data = await mockApi<any>(`/api/reports/adjusted-trial-balance?period=ThisMonth`)
    expect(data.start).toBe(firstOfMonth)
    expect(data.end).toBe(todayIso)
    expect(data.asOf).toBe(todayIso)
    expect(data.balanced).toBe(true)
  })
})
