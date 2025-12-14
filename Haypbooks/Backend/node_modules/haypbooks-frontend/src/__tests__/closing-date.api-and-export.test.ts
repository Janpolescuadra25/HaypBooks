import { GET as GET_JSON } from '@/app/api/reports/closing-date/route'
import { GET as GET_EXPORT } from '@/app/api/reports/closing-date/export/route'

function makeReq(url: string) {
  return new Request(url)
}

describe('Closing Date report', () => {
  test('JSON shape returns closed-through row', async () => {
    const res: any = await GET_JSON(makeReq('http://localhost/api/reports/closing-date'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toMatchObject({ period: 'AsOf', columns: ['Setting','Value'] })
    expect(Array.isArray(data.rows)).toBe(true)
    expect(data.rows[0][0]).toBe('Closed through')
  })

  test('CSV export caption and header; CSV-Version opt-in', async () => {
    const res: any = await GET_EXPORT(makeReq('http://localhost/api/reports/closing-date/export?csvVersion=true'))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1].startsWith('As of ')).toBe(true)
    expect(lines.includes('Setting,Value')).toBe(true)
    // Row contains Closed through with value or em dash
  const row = lines.find((l: string) => /^Closed through,/.test(l))
    expect(row).toBeTruthy()
  })
})
