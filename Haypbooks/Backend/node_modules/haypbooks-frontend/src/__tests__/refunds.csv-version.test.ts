import { GET as GET_AR_VENDOR } from '@/app/api/vendors/[id]/refunds/export/route'
import { GET as GET_AR_CUSTOMER } from '@/app/api/customers/[id]/refunds/export/route'
import { seedIfNeeded, db } from '@/mock/db'

const mk = (u: string) => new Request(u)

describe('Refunds exports CSV-Version opt-in', () => {
  test('customer refunds: omits by default and includes when opted-in', async () => {
    seedIfNeeded()
    const custId = db.customers[0].id
    const asOf = '2025-10-01'
    const base = `http://localhost/api/customers/${custId}/refunds/export?asOf=${asOf}`

    const no: any = await GET_AR_CUSTOMER(mk(base), { params: { id: custId } } as any)
    expect(no.status).toBe(200)
    const noBody = await no.text()
    const noFirst = noBody.split('\n', 1)[0]
    expect(noFirst.startsWith('CSV-Version')).toBe(false)

    const yes: any = await GET_AR_CUSTOMER(mk(base + '&csvVersion=1'), { params: { id: custId } } as any)
    expect(yes.status).toBe(200)
    const yesBody = await yes.text()
    const yesLines = yesBody.split('\n')
    expect(yesLines[0]).toBe('CSV-Version,1')
    expect(yesLines[1]).toContain('As of')
    expect(yesLines[2]).toBe('')
    expect(yesLines[3]).toBe('Date,Amount,Method,Reference,Linked Credit')
  })

  test('vendor refunds: omits by default and includes when opted-in', async () => {
    seedIfNeeded()
    const venId = db.vendors[0].id
    const asOf = '2025-10-01'
    const base = `http://localhost/api/vendors/${venId}/refunds/export?asOf=${asOf}`

    const no: any = await GET_AR_VENDOR(mk(base), { params: { id: venId } } as any)
    expect(no.status).toBe(200)
    const noBody = await no.text()
    const noFirst = noBody.split('\n', 1)[0]
    expect(noFirst.startsWith('CSV-Version')).toBe(false)

    const yes: any = await GET_AR_VENDOR(mk(base + '&csvVersion=1'), { params: { id: venId } } as any)
    expect(yes.status).toBe(200)
    const yesBody = await yes.text()
    const yesLines = yesBody.split('\n')
    expect(yesLines[0]).toBe('CSV-Version,1')
    expect(yesLines[1]).toContain('As of')
    expect(yesLines[2]).toBe('')
    expect(yesLines[3]).toBe('Date,Amount,Method,Reference,Linked Credit')
  })
})
