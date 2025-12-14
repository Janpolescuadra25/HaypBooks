import { GET as LIST_GET, POST as LIST_POST } from '@/app/api/estimates/route'
import { GET as DETAIL_GET, PUT as DETAIL_PUT, DELETE as DETAIL_DELETE } from '@/app/api/estimates/[id]/route'
import { POST as CONVERT_POST } from '@/app/api/estimates/[id]/convert/route'

function mkReq(url: string, init?: any) { return new Request(url, { headers: { cookie: 'role=admin' }, ...init }) }

describe('Estimates API', () => {
  test('create, list, update, convert, delete', async () => {
    // Create
    const body = { number: 'EST-1001', customerId: 'cust_1', date: '2025-09-01', lines: [{ description: 'Consulting', amount: 300 }] }
    const resCreate = await LIST_POST(mkReq('http://localhost/api/estimates', { method: 'POST', body: JSON.stringify(body) }))
    expect(resCreate.status).toBe(200)
    const jCreate = await resCreate.json() as any
    const id = jCreate.estimate.id

    // List
    const resList = await LIST_GET(mkReq('http://localhost/api/estimates?page=1&limit=10'))
    const jList = await resList.json() as any
    expect(jList.estimates.find((e: any) => e.id === id)).toBeTruthy()

    // Update
    const resPut = await DETAIL_PUT(
      mkReq(`http://localhost/api/estimates/${id}`, { method: 'PUT', body: JSON.stringify({ terms: 'Net 30' }) }),
      { params: { id } }
    )
    expect(resPut.status).toBe(200)
    const jPut = await resPut.json() as any
    expect(jPut.estimate.terms).toBe('Net 30')

    // Convert
    const resConv = await CONVERT_POST(
      mkReq(`http://localhost/api/estimates/${id}/convert`, { method: 'POST', body: JSON.stringify({}) }),
      { params: { id } }
    )
    expect(resConv.status).toBe(200)
    const jConv = await resConv.json() as any
    expect(jConv.invoice).toBeTruthy()
    expect(jConv.estimate.status).toBe('converted')

    // Delete
    const resDel = await DETAIL_DELETE(
      mkReq(`http://localhost/api/estimates/${id}`, { method: 'DELETE' }),
      { params: { id } }
    )
    expect(resDel.status).toBe(200)
    const jDel = await resDel.json() as any
    expect(jDel.ok).toBe(true)
  })
})
