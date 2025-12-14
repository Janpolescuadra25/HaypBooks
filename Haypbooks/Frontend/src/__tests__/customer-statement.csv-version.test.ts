import { GET as STMT_EXPORT } from '@/app/api/customers/[id]/statement/export/route'
import { seedIfNeeded, db } from '@/mock/db'

const mk = (u: string) => new Request(u)

describe('Customer Statement CSV-Version opt-in', () => {
  test('omits by default and includes when opted-in', async () => {
    seedIfNeeded()
    const custId = db.customers[0].id
    const asOf = '2025-09-20'
    const base = `http://localhost/api/customers/${custId}/statement/export?asOf=${asOf}`

    const no: any = await STMT_EXPORT(mk(base), { params: { id: custId } } as any)
    expect(no.status).toBe(200)
    const noBody = await no.text()
    const noFirst = noBody.split('\n', 1)[0]
    expect(noFirst.startsWith('CSV-Version')).toBe(false)

    const yes: any = await STMT_EXPORT(mk(base + '&csvVersion=1'), { params: { id: custId } } as any)
    expect(yes.status).toBe(200)
    const yesBody = await yes.text()
    const yesLines = yesBody.split('\n')
    expect(yesLines[0]).toBe('CSV-Version,1')
    expect(yesLines[1]).toContain('As of') // caption
    expect(yesLines[2]).toBe('') // spacer
    expect(yesLines[3]).toBe('Date,Type,Description,Amount,Running Balance')
  })
})
