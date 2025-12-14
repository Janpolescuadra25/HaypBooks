import { GET as OpenInvoicesJSON } from '@/app/api/reports/open-invoices/route'
import { GET as OpenInvoicesCSV } from '@/app/api/reports/open-invoices/export/route'

const makeReq = (url: string) => new Request(url)

describe('Open Invoices CSV-Version opt-in', () => {
	it('omits CSV-Version by default (no flag)', async () => {
		// Ensure JSON works and CSV can be generated
		const jsonRes: any = await OpenInvoicesJSON(makeReq('http://test/api/reports/open-invoices'))
		expect(jsonRes.status).toBe(200)
		const csvRes: any = await OpenInvoicesCSV(makeReq('http://test/api/reports/open-invoices/export'))
		expect(csvRes.status).toBe(200)
		const body = await csvRes.text()
		const firstLine = body.split('\n', 1)[0]
		expect(firstLine.startsWith('CSV-Version')).toBe(false)
	})

	it('includes CSV-Version,1 when csvVersion flag is present', async () => {
		const csvRes: any = await OpenInvoicesCSV(makeReq('http://test/api/reports/open-invoices/export?csvVersion=1'))
		expect(csvRes.status).toBe(200)
		const body = await csvRes.text()
		const lines = body.split('\n')
		expect(lines[0]).toBe('CSV-Version,1')
		// Next line should be the caption, then a blank spacer, then header
		expect(lines[1]).toBeTruthy()
		expect(lines[2]).toBe('')
		expect(lines[3].startsWith('Customer,')).toBe(true)
	})
})

