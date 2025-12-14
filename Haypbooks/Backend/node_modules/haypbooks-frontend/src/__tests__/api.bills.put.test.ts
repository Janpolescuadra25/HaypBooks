import { NextRequest } from 'next/server'
import { PUT as billsPutHandler } from '@/app/api/bills/[id]/route'
import { POST as billsPostHandler } from '@/app/api/bills/route'
import { readFileSync } from 'fs'
import path from 'path'

// Helper to build a NextRequest-like object
function buildReq(body: any): Request {
  return new Request('http://localhost/api', { method: 'PUT', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } })
}

function buildPostReq(body: any): Request {
  return new Request('http://localhost/api', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } })
}

describe('PUT /api/bills/:id billDate/terms recompute dueDate', () => {
  test('updates bill with new billDate+terms recomputes dueDate when not provided', async () => {
    // First create a bill with billDate 2025-01-10 and terms Net 15 → due 2025-01-25
    const createRes = await billsPostHandler(buildPostReq({ vendorId: 'ven_seed_fallback', lines: [{ description: 'x', amount: 100 }], billDate: '2025-01-10', terms: 'Net 15' })) as any
    const created = await createRes.json()
    expect(createRes.status).toBe(200)
    const bill = created.bill
    expect(bill.dueDate.slice(0,10)).toBe('2025-01-25')

    // Now update billDate to 2025-01-20 and terms Net 30 without passing dueDate
    const putRes = await billsPutHandler(buildReq({ billDate: '2025-01-20', terms: 'Net 30' }) as any, { params: { id: bill.id } } as any) as any
    expect(putRes.status).toBe(200)
    const updated = await putRes.json()
    expect(updated.bill.dueDate.slice(0,10)).toBe('2025-02-19')
  })

  test('respects provided dueDate override on update', async () => {
    const createRes = await billsPostHandler(buildPostReq({ vendorId: 'ven_seed_fallback', lines: [{ description: 'y', amount: 50 }], billDate: '2025-01-05', terms: 'Net 15' })) as any
    const created = await createRes.json()
    const bill = created.bill
    const putRes = await billsPutHandler(buildReq({ dueDate: '2025-03-10' }) as any, { params: { id: bill.id } } as any) as any
    const updated = await putRes.json()
    expect(updated.bill.dueDate.slice(0,10)).toBe('2025-03-10')
  })
})
