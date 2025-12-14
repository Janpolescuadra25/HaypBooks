import { GET as CSV } from '@/app/api/recurring-transactions/history/export/route'
import { addTemplate, addHistory } from '@/app/api/recurring-transactions/store'

function makeReq(url: string) {
  const r = new Request(url, { method: 'GET' }) as any
  return r
}

describe('Recurring history CSV export', () => {
  test('CSV-Version prelude optional', async () => {
    const t = addTemplate({ kind: 'journal', name: 'Seed', status: 'active', startDate: '2025-01-31', frequency: 'monthly', lines: [{ description: 'l', amount: 5 }] })
    addHistory({ templateId: t.id, runDate: '2025-01-31', artifactType: 'journal', artifactId: 'J1', amount: 5, status: 'posted' })
    const res1: any = await CSV(makeReq('http://test/api/recurring-transactions/history/export'))
    const body1 = await res1.text()
    expect(body1.startsWith('CSV-Version')).toBe(false)
    const res2: any = await CSV(makeReq('http://test/api/recurring-transactions/history/export?csvVersion=1'))
    const body2 = await res2.text()
    expect(body2.startsWith('CSV-Version,1')).toBe(true)
  })
})
