import { GET as GLJSON } from '@/app/api/reports/general-ledger-list/route'
import { GET as GLEXPORT } from '@/app/api/reports/general-ledger-list/export/route'

const makeReq = (url: string) => new Request(url)

describe('General Ledger List CSV-Version opt-in', () => {
	it('omits CSV-Version by default', async () => {
		const jsonRes: any = await GLJSON(makeReq('http://test/api/reports/general-ledger-list'))
		expect(jsonRes.status).toBe(200)
		const csvRes: any = await GLEXPORT(makeReq('http://test/api/reports/general-ledger-list/export'))
		expect(csvRes.status).toBe(200)
		const text = await csvRes.text()
		const firstLine = text.split('\n',1)[0]
		expect(firstLine.startsWith('CSV-Version')).toBe(false)
	})

	it('includes CSV-Version,1 when flag present', async () => {
		const csvRes: any = await GLEXPORT(makeReq('http://test/api/reports/general-ledger-list/export?csvVersion=1'))
		expect(csvRes.status).toBe(200)
		const text = await csvRes.text()
		const lines = text.split('\n')
		expect(lines[0]).toBe('CSV-Version,1')
		expect(lines[1]).toBeTruthy() // caption
		expect(lines[2]).toBe('') // spacer
		expect(lines[3].startsWith('Account,')).toBe(true) // header should start the body
	})
})
