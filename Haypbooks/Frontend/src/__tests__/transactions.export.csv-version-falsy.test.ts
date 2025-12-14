import { GET as TxCSV } from '@/app/api/transactions/export/route'

const mk = (u: string) => new Request(u)

describe('Transactions CSV-Version falsy flag handling', () => {
  const falsy = ['0','false','no','off','FALSE','No']
  for (const f of falsy) {
    it(`treats ${f} as disabled`, async () => {
      const res: any = await TxCSV(mk(`http://test/api/transactions/export?csvVersion=${encodeURIComponent(f)}`))
      expect(res.status).toBe(200)
      const first = (await res.text()).split('\n',1)[0]
      expect(first.startsWith('CSV-Version')).toBe(false)
    })
  }
})
