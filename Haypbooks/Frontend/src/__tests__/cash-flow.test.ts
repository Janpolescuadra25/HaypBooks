import { mockApi } from '@/lib/mock-api'

describe('Cash Flow mock', () => {
  test('returns sections and net change equals sum', async () => {
    const data = await mockApi<any>('/api/reports/cash-flow?period=YTD')
    expect(data.sections).toBeTruthy()
    const { operations, investing, financing } = data.sections
    expect(data.netChange).toBe(operations + investing + financing)
  })

  test('compare adds prev', async () => {
    const data = await mockApi<any>('/api/reports/cash-flow?period=YTD&compare=1')
    expect(data.prev).toBeTruthy()
  })
})
