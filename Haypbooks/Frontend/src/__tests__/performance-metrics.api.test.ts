import { GET } from '@/app/api/performance/metrics/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Performance metrics API', () => {
	it('returns series arrays with equal lengths', async () => {
		const res: any = await GET(makeReq('http://localhost/api/performance/metrics'))
		expect(res.status).toBe(200)
		const body = await res.json()
		const len = body.months.length
		expect(Array.isArray(body.revenue)).toBe(true)
		expect(body.revenue.length).toBe(len)
		expect(body.grossMargin.length).toBe(len)
		expect(body.cash.length).toBe(len)
		expect(body.mrr.length).toBe(len)
		expect(body.churn.length).toBe(len)
		expect(body.arDays.length).toBe(len)
		expect(body.apDays.length).toBe(len)
	})

	it('respects period range and returns corresponding number of months', async () => {
		const res: any = await GET(makeReq('http://localhost/api/performance/metrics?period=Last12'))
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body.months.length).toBeGreaterThanOrEqual(12)
		const res2: any = await GET(makeReq('http://localhost/api/performance/metrics?period=LastMonth'))
		const body2 = await res2.json()
		expect(body2.months.length).toBe(1)
	})

	it('compare=1 includes prev series matching lengths', async () => {
		const res: any = await GET(makeReq('http://localhost/api/performance/metrics?period=YTD&compare=1'))
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body.prev).toBeTruthy()
		const len = body.months.length
		expect(body.prev.revenue.length).toBe(len)
		expect(body.prev.grossMargin.length).toBe(len)
		expect(body.prev.cash.length).toBe(len)
		expect(body.prev.mrr.length).toBe(len)
		expect(body.prev.churn.length).toBe(len)
		expect(body.prev.arDays.length).toBe(len)
		expect(body.prev.apDays.length).toBe(len)
	})
})
