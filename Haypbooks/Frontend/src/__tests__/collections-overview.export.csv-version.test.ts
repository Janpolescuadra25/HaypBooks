import { GET as GET_EXPORT } from '@/app/api/collections/overview/export/route'

describe('Collections Overview CSV export — CSV-Version prelude', () => {
	it('omits CSV-Version by default; header is first line', async () => {
		const res: any = await GET_EXPORT(new Request('http://local/api/collections/overview/export'))
		expect(res.status).toBe(200)
		const text = await res.text()
		const first = text.trim().split('\n',1)[0]
		expect(first.startsWith('CSV-Version')).toBe(false)
		expect(first.startsWith('Customer,Risk,Open Invoices')).toBe(true)
	})

	it('includes CSV-Version,1 when opted-in via flag aliases', async () => {
		const res: any = await GET_EXPORT(new Request('http://local/api/collections/overview/export?csvVersion=1'))
		expect(res.status).toBe(200)
		const text = await res.text()
		const lines = text.trim().split('\n')
		expect(lines[0]).toBe('CSV-Version,1')
		expect(lines[1].startsWith('Customer,Risk,Open Invoices')).toBe(true)
	})
})

