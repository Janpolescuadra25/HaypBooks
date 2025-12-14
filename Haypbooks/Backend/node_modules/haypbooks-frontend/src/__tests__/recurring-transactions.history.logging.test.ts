import { POST as RUN } from '@/app/api/recurring-transactions/run/route'
import { GET as HISTORY } from '@/app/api/recurring-transactions/history/route'
import { addTemplate } from '@/app/api/recurring-transactions/store'

function makeReq(url: string, body: any, role: string = 'user') {
  return new Request(url, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'x-role': role } }) as any
}

function makeGet(url: string, role: string = 'user') {
  const r = new Request(url, { method: 'GET', headers: { 'x-role': role } }) as any
  return r
}

describe('Recurring Transactions run history logging', () => {
  test('history increments after a run', async () => {
    const today = '2025-01-31'
    const t = addTemplate({ kind: 'invoice', name: 'History Test', status: 'active', startDate: today, frequency: 'monthly', lines: [{ description: 'x', amount: 10 }] })
    const resRun: any = await RUN(makeReq('http://test/api/recurring-transactions/run', { id: t.id }))
    expect(resRun.status).toBe(200)
    const resHist: any = await HISTORY(makeGet('http://test/api/recurring-transactions/history?templateId=' + t.id))
    expect(resHist.status).toBe(200)
    const data = await resHist.json()
    expect(Array.isArray(data.data)).toBe(true)
    const mine = data.data.filter((h: any) => h.templateId === t.id)
    expect(mine.length).toBeGreaterThanOrEqual(1)
    expect(mine[0]).toMatchObject({ templateId: t.id, artifactType: 'invoice', status: 'posted' })
  })
})
