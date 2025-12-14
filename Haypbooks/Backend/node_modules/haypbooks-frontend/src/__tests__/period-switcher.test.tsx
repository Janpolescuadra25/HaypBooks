import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PeriodSwitcher from '../components/PeriodSwitcher'

// Mock next/navigation so we can capture push() and provide search params
let pushed: string | null = null
let search = ''
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: (p: string) => { pushed = p }, prefetch: jest.fn(), refresh: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(search),
}))

describe('PeriodSwitcher', () => {
  beforeEach(() => { pushed = null; search = '' })

  it('renders correct aria-pressed states', () => {
    render(<PeriodSwitcher current="YTD" />)
    // Active button YTD
    expect(screen.getByRole('button', { name: 'YTD' })).toHaveAttribute('aria-pressed', 'true')
    // Inactive button MTD
    expect(screen.getByRole('button', { name: 'MTD' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('updates URL query on click', async () => {
    const user = userEvent.setup()
    render(<PeriodSwitcher current="YTD" />)

    await user.click(screen.getByRole('button', { name: 'MTD' }))
    expect(pushed).toMatch(/^\/\?/) // starts with root and query
    expect(pushed).toContain('period=MTD')
  })

  it('preserves existing search params and sets period', async () => {
    const user = userEvent.setup()
    search = 'foo=bar'
    render(<PeriodSwitcher current="YTD" />)

    await user.click(screen.getByRole('button', { name: 'Last Q' }))
    expect(pushed).toBe('/?foo=bar&period=LastQuarter')
  })
})
