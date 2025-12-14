import { GET as PROJ_LIST, POST as PROJ_POST } from '@/app/api/projects/route'
import { GET as PROJ_GET, PUT as PROJ_PUT, DELETE as PROJ_DELETE } from '@/app/api/projects/[id]/route'
import { GET as TE_LIST, POST as TE_POST } from '@/app/api/time/entries/route'
import { GET as TE_GET, PUT as TE_PUT, DELETE as TE_DELETE } from '@/app/api/time/entries/[id]/route'
import { GET as UNBILLED_GET } from '@/app/api/time/unbilled/route'
import { POST as TIME_INVOICE_POST } from '@/app/api/time/invoice/route'

function mkReq(url: string, init?: any) { return new Request(url, { headers: { cookie: 'role=admin' }, ...init }) }

describe('Time Tracking API', () => {
  test('project + time entry CRUD, unbilled list, invoice conversion', async () => {
    // Create a project for a known seeded customer
    const projectBody = { name: 'Proj Alpha', customerId: 'cust_1', hourlyRate: 150 }
    const resProjCreate = await PROJ_POST(mkReq('http://localhost/api/projects', { method: 'POST', body: JSON.stringify(projectBody) }))
    expect(resProjCreate.status).toBe(200)
    const jProjCreate = await resProjCreate.json() as any
    const projectId = jProjCreate.project.id

    // Get project detail
    const resProjGet = await PROJ_GET(mkReq(`http://localhost/api/projects/${projectId}`), { params: { id: projectId } })
    expect(resProjGet.status).toBe(200)
    const jProjGet = await resProjGet.json() as any
    expect(jProjGet.project.name).toBe('Proj Alpha')

    // Update project
    const resProjPut = await PROJ_PUT(mkReq(`http://localhost/api/projects/${projectId}`, { method: 'PUT', body: JSON.stringify({ hourlyRate: 175 }) }), { params: { id: projectId } })
    expect(resProjPut.status).toBe(200)
    const jProjPut = await resProjPut.json() as any
    expect(jProjPut.project.hourlyRate).toBe(175)

    // Create time entries (billable)
    const te1 = { customerId: 'cust_1', projectId, date: '2025-01-10', hours: 2, description: 'Work 1' }
    const te2 = { customerId: 'cust_1', projectId, date: '2025-01-11', hours: 3, description: 'Work 2' }
    const resTe1 = await TE_POST(mkReq('http://localhost/api/time/entries', { method: 'POST', body: JSON.stringify(te1) }))
    const resTe2 = await TE_POST(mkReq('http://localhost/api/time/entries', { method: 'POST', body: JSON.stringify(te2) }))
    const jTe1 = await resTe1.json() as any
    const jTe2 = await resTe2.json() as any
    expect(jTe1.timeEntry.amount).toBeCloseTo(2 * 175)
    expect(jTe2.timeEntry.amount).toBeCloseTo(3 * 175)

    // List unbilled via endpoint
  const resUnb = await UNBILLED_GET(mkReq('http://localhost/api/time/unbilled'))
    const jUnb = await resUnb.json() as any
    const ids = jUnb.items.map((x: any) => x.id)
    expect(ids).toEqual(expect.arrayContaining([jTe1.timeEntry.id, jTe2.timeEntry.id]))

    // Invoice these entries
    const resInv = await TIME_INVOICE_POST(mkReq('http://localhost/api/time/invoice', { method: 'POST', body: JSON.stringify({ entryIds: [jTe1.timeEntry.id, jTe2.timeEntry.id] }) }))
    expect(resInv.status).toBe(200)
    const jInv = await resInv.json() as any
    expect(jInv.invoice.total).toBeCloseTo((2*175) + (3*175))

    // Fetch a time entry detail and ensure now billed
    const resTeGet = await TE_GET(mkReq(`http://localhost/api/time/entries/${jTe1.timeEntry.id}`), { params: { id: jTe1.timeEntry.id } })
    const jTeGet = await resTeGet.json() as any
    expect(jTeGet.timeEntry.status).toBe('billed')

    // Attempt editing billed should error
  const resTePut = await TE_PUT(mkReq(`http://localhost/api/time/entries/${jTe1.timeEntry.id}`, { method: 'PUT', body: JSON.stringify({ hours: 5 }) }), { params: { id: jTe1.timeEntry.id } })
  expect(resTePut.status).toBe(400)

    // Delete billed should surface ok=false or error; our API returns ok true only for success, db would throw -> expect 400
  const resTeDel = await TE_DELETE(mkReq(`http://localhost/api/time/entries/${jTe1.timeEntry.id}`, { method: 'DELETE' }), { params: { id: jTe1.timeEntry.id } })
  expect(resTeDel.status).toBe(400)

    // Clean up project
    const resProjDel = await PROJ_DELETE(mkReq(`http://localhost/api/projects/${projectId}`, { method: 'DELETE' }), { params: { id: projectId } })
    expect(resProjDel.status).toBe(200)
  })
})
