import { render, screen, fireEvent, act } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import React from 'react'
import { ReportPeriodSelect } from '@/components/ReportPeriodSelect'

jest.mock('next/navigation', () => {
  const params = new URLSearchParams()
  let currentPath = '/reports/profit-and-loss'
  return {
    useRouter: () => ({
      push: (href: string) => {
        const [path, qs] = href.split('?')
        currentPath = path
        params.forEach((_, k) => params.delete(k))
        if (qs) new URLSearchParams(qs).forEach((v, k) => params.set(k, v))
      },
      replace: (href: string) => {
        const [path, qs] = href.split('?')
        currentPath = path
        params.forEach((_, k) => params.delete(k))
        if (qs) new URLSearchParams(qs).forEach((v, k) => params.set(k, v))
      }
    }),
    usePathname: () => currentPath,
    useSearchParams: () => params,
  }
})

// Basic in-memory stubs for preferences
jest.mock('@/lib/preferences', () => {
  const store: Record<string, any> = {}
  return {
    getReportFilters: async (key: string) => store[key] || { filters: {}, updatedAt: new Date().toISOString() },
    setReportFilters: async (key: string, filters: any) => {
      store[key] = { filters, updatedAt: new Date().toISOString() }
      return store[key]
    }
  }
})

describe('ReportPeriodSelect custom range persistence', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })
  it('persists and rehydrates a custom date range', async () => {
    render(<ReportPeriodSelect showCompare={true} />)

    // Choose Custom
    const select = screen.getByLabelText('Period') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'Custom' } })

    const startInput = await screen.findByLabelText('Start', { selector: 'input' })
    const endInput = await screen.findByLabelText('End', { selector: 'input' })

    fireEvent.change(startInput, { target: { value: '2025-02-01' } })
    fireEvent.change(endInput, { target: { value: '2025-02-28' } })

    const applyBtn = screen.getByRole('button', { name: 'Apply' })
    expect(applyBtn).not.toBeDisabled()
    fireEvent.click(applyBtn)

    // Advance timers to flush debounce persistence
    act(() => { jest.advanceTimersByTime(600) })

    // Re-render to simulate navigation/reload
    render(<ReportPeriodSelect showCompare={true} />)

    // Should still have Custom selected and inputs populated
    const select2 = screen.getByLabelText('Period') as HTMLSelectElement
    expect(select2.value).toBe('Custom')
    const start2 = await screen.findByLabelText('Start', { selector: 'input' })
    const end2 = await screen.findByLabelText('End', { selector: 'input' })
    expect((start2 as HTMLInputElement).value).toBe('2025-02-01')
    expect((end2 as HTMLInputElement).value).toBe('2025-02-28')
  })
})
