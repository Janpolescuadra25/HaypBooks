import '@testing-library/jest-dom'
import { withinAct, flushAsync } from '../test-utils/act-helpers'
import { useReportFilterStore } from '@/stores/reportFilters'

// Mock preferences API
jest.mock('@/lib/preferences', () => ({
  getReportFilters: jest.fn(async () => ({ filters: { period: 'YTD', compare: '0' }, updatedAt: new Date(0).toISOString() })),
  setReportFilters: jest.fn(async (_rk: string, filters: Record<string,string>) => ({ filters, updatedAt: new Date().toISOString() })),
}))

beforeEach(() => {
  jest.useFakeTimers()
})
afterEach(() => {
  jest.useRealTimers()
})

describe('reportFilters store', () => {
  it('loads and updates with debounce save', async () => {
    const store = useReportFilterStore.getState()
  await withinAct(() => store.load('period:/reports/profit-loss'))
    expect(useReportFilterStore.getState().entities['period:/reports/profit-loss'].filters.period).toBe('YTD')
  await withinAct(() => store.update('period:/reports/profit-loss', { period: 'Last30' }))
    expect(useReportFilterStore.getState().entities['period:/reports/profit-loss'].filters.period).toBe('Last30')
  jest.advanceTimersByTime(600)
  await flushAsync()
    expect(useReportFilterStore.getState().entities['period:/reports/profit-loss'].status).toBe('idle')
  })
})
