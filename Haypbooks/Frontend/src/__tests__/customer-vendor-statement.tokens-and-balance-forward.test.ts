import { GET as CUST_EXPORT } from '@/app/api/customers/[id]/statement/export/route'
import { GET as VEND_EXPORT } from '@/app/api/vendors/[id]/statement/export/route'
import { seedIfNeeded, db } from '@/mock/db'

const req = (url: string) => new Request(url)

describe('Statements CSV tokens and balance-forward line', () => {
  beforeAll(() => { seedIfNeeded() })

  test('customer export filename contains type and from tokens when filters provided', async () => {
    const cust = db.customers[0]
    const asOf = '2025-02-15'
    const start = '2025-01-01'
    const type = 'transaction'
    const url = `http://local/api/customers/${cust.id}/statement/export?asOf=${asOf}&start=${start}&type=${type}`
    const res: any = await CUST_EXPORT(req(url), { params: { id: cust.id } } as any)
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') || ''
    expect(cd).toContain(`type-${type}`)
    expect(cd).toContain(`from-${start}`)
  })

  test('vendor export filename contains type and from tokens when filters provided', async () => {
    const ven = db.vendors[0]
    const asOf = '2025-02-15'
    const start = '2025-01-01'
    const type = 'balance-forward'
    const url = `http://local/api/vendors/${ven.id}/statement/export?asOf=${asOf}&start=${start}&type=${type}`
    const res: any = await VEND_EXPORT(req(url), { params: { id: ven.id } } as any)
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') || ''
    expect(cd).toContain(`type-${type}`)
    expect(cd).toContain(`from-${start}`)
  })

  test('customer balance-forward adds opening line and running balance starts at opening', async () => {
    const cust = db.customers[1]
    const asOf = '2025-02-15'
    const start = '2025-01-05'
    const url = `http://local/api/customers/${cust.id}/statement/export?asOf=${asOf}&start=${start}&type=balance-forward`
    const res: any = await CUST_EXPORT(req(url), { params: { id: cust.id } } as any)
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    // Skip caption and blank and header
    const firstDetail = lines[3]
    // First detail should be Balance Forward on start date
    expect(firstDetail).toContain(start)
    expect(firstDetail).toContain('Balance Forward')
    const cols = firstDetail.split(',')
    const openingAmt = Number(cols[3])
    const openingRun = Number(cols[4])
    expect(openingRun).toBe(openingAmt)
  })

  test('vendor balance-forward adds opening line and running balance starts at opening', async () => {
    const ven = db.vendors[1]
    const asOf = '2025-02-15'
    const start = '2025-01-05'
    const url = `http://local/api/vendors/${ven.id}/statement/export?asOf=${asOf}&start=${start}&type=balance-forward`
    const res: any = await VEND_EXPORT(req(url), { params: { id: ven.id } } as any)
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    const firstDetail = lines[3]
    expect(firstDetail).toContain(start)
    expect(firstDetail).toContain('Balance Forward')
    const cols = firstDetail.split(',')
    const openingAmt = Number(cols[3])
    const openingRun = Number(cols[4])
    expect(openingRun).toBe(openingAmt)
  })
})
