import { GET as GET_DEPOSITS_EXPORT } from '@/app/api/deposits/export/route'
import { seedIfNeeded } from '@/mock/db'

const mk = (u: string) => new Request(u)

describe('Deposits export CSV-Version opt-in', () => {
  test('omits by default and includes when opted-in', async () => {
    seedIfNeeded()
    const end = '2025-10-01'
    const base = `http://localhost/api/deposits/export?end=${end}`

    const no: any = await GET_DEPOSITS_EXPORT(mk(base))
    expect(no.status).toBe(200)
    const noBody = await no.text()
    const noLines = noBody.split('\n')
    expect(noLines[0].startsWith('CSV-Version')).toBe(false)
    // Caption-first
    expect(noLines[0]).toContain('As of')
    // Header should be the next line
    expect(noLines[1]).toBe('Date,Deposit ID,Deposit To,Memo,Payments,Total')

    const yes: any = await GET_DEPOSITS_EXPORT(mk(base + '&csvVersion=1'))
    expect(yes.status).toBe(200)
    const yesBody = await yes.text()
    const yesLines = yesBody.split('\n')
    expect(yesLines[0]).toBe('CSV-Version,1')
    expect(yesLines[1]).toContain('As of')
    expect(yesLines[2]).toBe('Date,Deposit ID,Deposit To,Memo,Payments,Total')
  })
})
import { GET as DepositsCSV } from '@/app/api/deposits/export/route'

const makeReq = (url: string) => new Request(url)

describe('Deposits CSV-Version opt-in', () => {
  it('omits CSV-Version by default', async () => {
    const res: any = await DepositsCSV(makeReq('http://test/api/deposits/export'))
    expect(res.status).toBe(200)
    const body = await res.text()
    const first = body.split('\n', 1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in', async () => {
    const res: any = await DepositsCSV(makeReq('http://test/api/deposits/export?csvVersion=1'))
    expect(res.status).toBe(200)
    const body = await res.text()
    const lines = body.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toBeTruthy()
  })
})
