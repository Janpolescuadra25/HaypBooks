import { GET as EXP } from '@/app/api/reports/statement-list/export/route'

const mk = (u: string) => new Request(u)

describe('Statement List CSV-Version opt-in', () => {
  it('omits by default and includes when opted-in', async () => {
    const end = '2025-09-30'
    const no: any = await EXP(mk(`http://localhost/api/reports/statement-list/export?end=${end}`))
    expect(no.status).toBe(200)
    const noText = await no.text()
    expect(noText.split('\n',1)[0].startsWith('CSV-Version')).toBe(false)

    const yes: any = await EXP(mk(`http://localhost/api/reports/statement-list/export?end=${end}&csvVersion=1`))
    expect(yes.status).toBe(200)
    const yesLines = (await yes.text()).split('\n')
    expect(yesLines[0]).toBe('CSV-Version,1')
    expect(yesLines[1]).toContain('As of')
    expect(yesLines[2]).toBe('')
    expect(yesLines[3]).toBe('Customer,Date,Amount Due,Status')
  })
})
