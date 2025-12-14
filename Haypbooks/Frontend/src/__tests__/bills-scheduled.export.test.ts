import { GET as BillsList } from '@/app/api/bills/route'
import { GET as ScheduledExport } from '@/app/api/bills/scheduled/export/route'
import { POST as ScheduleBill } from '@/app/api/bills/[id]/schedule/route'
import { db, seedIfNeeded } from '@/mock/db'

function makeReq(url: string, init?: any): Request { return new Request(url, init) }

describe('Scheduled Bills CSV export', () => {
  beforeAll(() => { try { seedIfNeeded() } catch {} })

  test('returns caption-first CSV with Scheduled Date column and rows', async () => {
    // Pick an open bill and schedule it
    const open = db.bills.find(b => b.status === 'open')
    expect(open).toBeTruthy()
    if (!open) return
    const scheduleUrl = `http://localhost/api/bills/${open.id}/schedule`
    const scheduleRes: any = await ScheduleBill(
      makeReq(scheduleUrl, { method: 'POST', body: JSON.stringify({ date: '2025-01-20' }) }),
      { params: { id: open.id } } as any
    )
    expect(scheduleRes.status).toBe(200)

  const url = 'http://localhost/api/bills/scheduled/export'
    const res: any = await ScheduledExport(makeReq(url))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/csv')
    const text = await res.text()
    // First line is caption; then a blank; then header with Scheduled Date
    expect(text).toMatch(/\n\nBill #,Vendor,Due Date,Scheduled Date,Total,Balance/)
    // Contains the scheduled date we used
    expect(text).toContain('2025-01-20')
  })
})
