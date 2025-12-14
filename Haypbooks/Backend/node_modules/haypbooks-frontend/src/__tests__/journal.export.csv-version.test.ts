import { GET as JournalJSON } from '@/app/api/reports/journal/route'
import { GET as JournalCSV } from '@/app/api/reports/journal/export/route'

const makeReq = (url: string) => new Request(url)

describe('Journal CSV-Version opt-in', () => {
  it('omits CSV-Version by default', async () => {
    const jsonRes: any = await JournalJSON(makeReq('http://test/api/reports/journal'))
    expect(jsonRes.status).toBe(200)
    const csvRes: any = await JournalCSV(makeReq('http://test/api/reports/journal/export'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const firstLine = text.split('\n',1)[0]
    expect(firstLine.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in', async () => {
    const csvRes: any = await JournalCSV(makeReq('http://test/api/reports/journal/export?csvVersion=1'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const lines = text.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toBeTruthy() // caption
    expect(lines[2]).toBe('') // spacer
    expect(lines[3].startsWith('Journal No,')).toBe(true) // header
  })
})
