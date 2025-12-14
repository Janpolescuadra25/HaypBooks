/** @jest-environment node */

function parseCsv(text: string): string[][] {
	return text.split('\n').map(line => line.split(','))
}

describe('Tax exports structure – header/columns/totals', () => {
	beforeAll(() => {
		jest.useFakeTimers().setSystemTime(new Date('2025-09-14T12:00:00Z'))
	})
	afterAll(() => jest.useRealTimers())

	it('tax-detail: caption, spacer, header, rows, totals', async () => {
		const { GET } = await import('@/app/api/reports/tax-detail/export/route')
		const res = await GET(new Request('http://localhost/api/reports/tax-detail/export?period=Today'))
		expect(res.status).toBe(200)
		const body = await res.text()
		const lines = body.split('\n')
		// 1) Caption (single-cell date), 2) spacer, 3) header
		expect(lines[0]).toContain('September 14, 2025')
		expect(lines[1]).toBe('')
		const header = lines[2]
		expect(header).toBe('Date,Doc #,Customer,Tax Agency,Rate Name,Rate %,Taxable,Tax Amount')
		// Totals row should exist and begin with Totals
		const last = lines[lines.length - 1]
		expect(last.startsWith('Totals')).toBe(true)
	})

	it('tax-summary: caption, spacer, header, rows, totals', async () => {
		const { GET } = await import('@/app/api/reports/tax-summary/export/route')
		const res = await GET(new Request('http://localhost/api/reports/tax-summary/export?period=Today'))
		expect(res.status).toBe(200)
		const body = await res.text()
		const lines = body.split('\n')
		expect(lines[0]).toContain('September 14, 2025')
		expect(lines[1]).toBe('')
		expect(lines[2]).toBe('Tax Agency,Rate Name,Rate %,Taxable Sales,Non-taxable Sales,Tax Amount')
		const last = lines[lines.length - 1]
		expect(last.startsWith('Totals')).toBe(true)
	})

	it('tax-liability: caption, spacer, header, rows, totals', async () => {
		const { GET } = await import('@/app/api/reports/tax-liability/export/route')
		const res = await GET(new Request('http://localhost/api/reports/tax-liability/export?period=Today'))
		expect(res.status).toBe(200)
		const body = await res.text()
		const lines = body.split('\n')
		expect(lines[0]).toContain('September 14, 2025')
		expect(lines[1]).toBe('')
		expect(lines[2]).toBe('Tax Agency,Rate Name,Rate %,Taxable Sales,Non-taxable Sales,Tax Amount')
		const last = lines[lines.length - 1]
		expect(last.startsWith('Totals')).toBe(true)
	})
})
