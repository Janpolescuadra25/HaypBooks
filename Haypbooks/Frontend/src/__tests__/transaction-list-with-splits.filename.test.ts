import { GET as CSV } from '@/app/api/reports/transaction-list-with-splits/export/route'

const mk = (u: string) => new Request(u)

describe('Transaction List with Splits – filename patterns', () => {
  it('as-of when only end provided', async () => {
    const end = '2025-09-30'
    const res: any = await CSV(mk(`http://localhost/api/reports/transaction-list-with-splits/export?end=${end}`))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain(`transaction-list-with-splits-asof-${end}`)
  })

  it('range when both start and end provided', async () => {
    const start = '2025-09-01'
    const end = '2025-09-30'
    const res: any = await CSV(mk(`http://localhost/api/reports/transaction-list-with-splits/export?start=${start}&end=${end}`))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain(`transaction-list-with-splits-${start}_to_${end}`)
  })

  it('period mode when period provided', async () => {
    const start = '2025-09-01'
    const end = '2025-09-30'
    const res: any = await CSV(mk(`http://localhost/api/reports/transaction-list-with-splits/export?period=Custom&start=${start}&end=${end}`))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain(`transaction-list-with-splits-Custom_${start}_to_${end}`)
  })
})
