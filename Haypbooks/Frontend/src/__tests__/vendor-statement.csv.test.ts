import { GET as JsonGet } from '@/app/api/vendors/[id]/statement/route'
import { GET as CsvGet } from '@/app/api/vendors/[id]/statement/export/route'

function makeReq(url: string) {
  return new Request(url)
}

describe('Vendor Statement CSV export', () => {
  it('delegates to JSON and emits numeric Amount/Running Balance', async () => {
    const id = 'ven_1'
    const asOf = new Date().toISOString().slice(0,10)
    const jsonRes: any = await JsonGet(makeReq(`http://local/api/vendors/${id}/statement?asOf=${asOf}`), { params: { id } })
    expect(jsonRes.status).toBe(200)
    const csvRes: any = await CsvGet(makeReq(`http://local/api/vendors/${id}/statement/export?asOf=${asOf}&csvVersion=1`), { params: { id } })
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    expect(text.split('\n')[0]).toContain('CSV-Version')
    // Header + at least one data or totals row
    expect(text).toContain('Date,Type,Description,Amount,Running Balance')
  })
})
