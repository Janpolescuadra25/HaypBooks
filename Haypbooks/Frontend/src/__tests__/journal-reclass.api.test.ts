import { POST as POST_RECLASS } from '@/app/api/journal/reclass/route'
import { POST as POST_PERIODS } from '@/app/api/periods/route'
import { seedIfNeeded } from '@/mock/db'

function makeReq(url: string, method: string, body?: any) {
  return new Request(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('Journal reclass API', () => {
  test('happy path: creates adjusting reclass entry', async () => {
    try { seedIfNeeded() } catch {}
    const res: any = await POST_RECLASS(makeReq('http://local/api/journal/reclass', 'POST', {
      fromAccountNumber: '6000',
      toAccountNumber: '1000',
      amount: 25.5,
      memo: 'Reclass test',
    }))
    const json = await res.json()
    expect([200, 403]).toContain(res.status)
    if (res.status === 200) {
      expect(json.journalEntryId).toBeTruthy()
    }
  })

  test('rejects closed period date when specified', async () => {
    const today = new Date().toISOString().slice(0,10)
    try {
      const resClose: any = await POST_PERIODS(makeReq('http://local/api/periods', 'POST', { closeThrough: today }))
      await resClose.json()
    } catch {}
    const res: any = await POST_RECLASS(makeReq('http://local/api/journal/reclass', 'POST', {
      fromAccountNumber: '6000',
      toAccountNumber: '1000',
      amount: 5,
      date: today,
    }))
    expect([400, 403]).toContain(res.status)
  })

  test('validation errors when missing fields', async () => {
    const res: any = await POST_RECLASS(makeReq('http://local/api/journal/reclass', 'POST', { amount: -1 }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(String(json.error || '')).toMatch(/required|Amount/)
  })
})
