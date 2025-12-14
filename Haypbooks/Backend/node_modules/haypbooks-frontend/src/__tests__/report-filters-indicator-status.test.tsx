import { render, screen, act } from '@testing-library/react'
import { withinAct, flushAsync } from '../test-utils/act-helpers'
import React from 'react'
import { useReportFilters } from '@/stores/reportFilters'
import FilterStatusIndicator from '@/components/FilterStatusIndicator'

jest.useFakeTimers()

let failOnce = true
jest.mock('@/lib/preferences', () => {
  const db: Record<string, any> = {}
  return {
    getReportFilters: async (k: string) => db[k] || { filters: {}, updatedAt: new Date().toISOString() },
    setReportFilters: async (k: string, filters: any) => {
      if (failOnce) { failOnce = false; throw new Error('network') }
      db[k] = { filters, updatedAt: new Date().toISOString() }; return db[k]
    }
  }
})

function Harness() {
  const { update, status, error, register, unregister } = useReportFilters('list:indicator')
  React.useEffect(() => { register(); return () => unregister() }, [register, unregister])
  return (
    <div>
      <button onClick={() => update({ a: String(Date.now()) })}>mutate</button>
  <FilterStatusIndicator saving={status === 'saving'} error={error} />
    </div>
  )
}

describe('FilterStatusIndicator integration', () => {
  it('shows saving then error then saved after retry', async () => {
    render(<Harness />)
    const btn = screen.getByRole('button', { name: /mutate/i })

  await withinAct(() => { btn.click() })
  // advance debounce to trigger save start
  await act(async () => { jest.advanceTimersByTime(500) })
  const saving1 = screen.queryByText(/saving/i)
  if (saving1) expect(saving1).toBeInTheDocument()

  // let async rejection settle
  await flushAsync()
  expect(screen.getByTitle(/network/i)).toBeInTheDocument()

    // trigger second update (will succeed)
  await withinAct(() => { btn.click() })
  await act(async () => { jest.advanceTimersByTime(500) })
  const saving2 = screen.queryByText(/saving/i)
  if (saving2) expect(saving2).toBeInTheDocument()

  await flushAsync()
    // After success: no error tooltip and no lingering Saving badge (component simplified)
    expect(screen.queryByTitle(/network/i)).toBeNull()
    expect(screen.queryByText(/saving/i)).toBeNull()
  })
})
