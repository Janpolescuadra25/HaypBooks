import { GET as GET_JSON } from '@/app/api/reports/open-credits/route'
import { seedIfNeeded, db, createCreditMemo, createVendorCredit } from '@/mock/db'

const mkReq = (url: string) => new Request(url)

describe('Open Credits JSON API', () => {
  test('responds (RBAC may deny)', async () => {
    try { seedIfNeeded() } catch {}
    const res: any = await GET_JSON(mkReq('http://localhost/api/reports/open-credits'))
    if (res.status === 403) {
      const body = await res.json()
      expect(body).toEqual({ error: 'Forbidden' })
    } else {
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(Array.isArray(body.rows)).toBe(true)
    }
  })

  test('lists AR/AP credits with filters; aggregates totals', async () => {
    try { seedIfNeeded() } catch {}
    // Create a couple of credit memos and vendor credits in 2025
    const custA = db.customers[0]?.id!
    const custB = db.customers[1]?.id!
    const venA = db.vendors[0]?.id!
    const venB = db.vendors[1]?.id!
    if (custA) createCreditMemo({ customerId: custA, date: '2025-01-10', lines: [{ description: 'Adj A', amount: 120 }] })
    if (custB) createCreditMemo({ customerId: custB, date: '2025-05-05', lines: [{ description: 'Adj B', amount: 80 }] })
    if (venA) createVendorCredit({ vendorId: venA, date: '2025-02-12', lines: [{ description: 'Allow A', amount: 75 }] })
    if (venB) createVendorCredit({ vendorId: venB, date: '2025-06-18', lines: [{ description: 'Allow B', amount: 40 }] })

  // All rows in range for the year
  let res: any = await GET_JSON(mkReq('http://localhost/api/reports/open-credits?start=2025-01-01&end=2025-12-31'))
    expect(res.status).toBe(200)
    let body = await res.json()
    expect(Array.isArray(body.rows)).toBe(true)
    expect(body).toHaveProperty('totals')
    const sumOrig = body.rows.reduce((s: number, r: any) => s + Number(r.total || 0), 0)
    const sumRem = body.rows.reduce((s: number, r: any) => s + Number(r.remaining || 0), 0)
    const sumApp = body.rows.reduce((s: number, r: any) => s + Number(r.applied || 0), 0)
    expect(Number(body.totals.original).toFixed(2)).toBe(Number(sumOrig).toFixed(2))
    expect(Number(body.totals.remaining).toFixed(2)).toBe(Number(sumRem).toFixed(2))
    expect(Number(body.totals.applied).toFixed(2)).toBe(Number(sumApp).toFixed(2))

    // Type filter: AR only
  res = await GET_JSON(mkReq('http://localhost/api/reports/open-credits?type=ar&start=2025-01-01&end=2025-12-31'))
    expect(res.status).toBe(200)
    body = await res.json()
    expect(body.rows.find((r: any) => r.side === 'ap')).toBeUndefined()
    expect(body.rows.find((r: any) => r.side === 'ar')).toBeDefined()

    // Type filter: AP only
  res = await GET_JSON(mkReq('http://localhost/api/reports/open-credits?type=ap&start=2025-01-01&end=2025-12-31'))
    expect(res.status).toBe(200)
    body = await res.json()
    expect(body.rows.find((r: any) => r.side === 'ar')).toBeUndefined()
    expect(body.rows.find((r: any) => r.side === 'ap')).toBeDefined()

    // Customer scoping
    if (custA) {
  res = await GET_JSON(mkReq(`http://localhost/api/reports/open-credits?type=ar&customerId=${encodeURIComponent(custA)}&start=2025-01-01&end=2025-12-31`))
      expect(res.status).toBe(200)
      body = await res.json()
      const onlyCustA = body.rows.every((r: any) => r.side === 'ar' && r.entityId === custA)
      expect(onlyCustA).toBe(true)
    }

    // Vendor scoping
    if (venB) {
  res = await GET_JSON(mkReq(`http://localhost/api/reports/open-credits?type=ap&vendorId=${encodeURIComponent(venB)}&start=2025-01-01&end=2025-12-31`))
      expect(res.status).toBe(200)
      body = await res.json()
      const onlyVenB = body.rows.every((r: any) => r.side === 'ap' && r.entityId === venB)
      expect(onlyVenB).toBe(true)
    }

    // Date filter: narrow to after March should exclude January/February items
  res = await GET_JSON(mkReq('http://localhost/api/reports/open-credits?start=2025-03-01&end=2025-12-31'))
    expect(res.status).toBe(200)
    body = await res.json()
    expect(body.rows.find((r: any) => r.date < '2025-03-01')).toBeUndefined()
  })
})
