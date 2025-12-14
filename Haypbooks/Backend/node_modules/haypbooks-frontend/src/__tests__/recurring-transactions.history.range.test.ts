import { addTemplate, addHistory } from '@/app/api/recurring-transactions/store'
import { GET as HISTORY } from '@/app/api/recurring-transactions/history/route'

function makeGet(url: string, role: string = 'user') {
  const r = new Request(url, { method: 'GET', headers: { 'x-role': role } }) as any
  return r
}

describe('Recurring Transactions run history range filters', () => {
  test('start/end filters narrow results', async () => {
    const t = addTemplate({ kind: 'journal', name: 'Range Test', status: 'active', startDate: '2025-01-01', frequency: 'monthly', lines:[{ description:'l', amount:1 }] })
    // Seed history entries spanning a range
    addHistory({ templateId: t.id, runDate: '2025-01-05', artifactType: 'journal', artifactId: 'J1', amount: 1, status: 'posted' })
    addHistory({ templateId: t.id, runDate: '2025-01-15', artifactType: 'journal', artifactId: 'J2', amount: 1, status: 'posted' })
    addHistory({ templateId: t.id, runDate: '2025-02-01', artifactType: 'journal', artifactId: 'J3', amount: 1, status: 'posted' })

    const allRes: any = await HISTORY(makeGet('http://test/api/recurring-transactions/history?templateId=' + t.id))
    const allData = await allRes.json()
    expect(allData.data.length).toBe(3)

    const midRes: any = await HISTORY(makeGet(`http://test/api/recurring-transactions/history?templateId=${t.id}&start=2025-01-10&end=2025-01-31`))
    const midData = await midRes.json()
    expect(midData.data.length).toBe(1)
    expect(midData.data[0].runDate).toBe('2025-01-15')

    const lateRes: any = await HISTORY(makeGet(`http://test/api/recurring-transactions/history?templateId=${t.id}&start=2025-02-01`))
    const lateData = await lateRes.json()
    expect(lateData.data.length).toBe(1)
    expect(lateData.data[0].runDate).toBe('2025-02-01')
  })
})
