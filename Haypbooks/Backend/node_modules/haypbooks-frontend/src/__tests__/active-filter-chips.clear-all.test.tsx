/** @jest-environment jsdom */
import { render, screen, fireEvent } from '@testing-library/react'

import ActiveFilterChips from '@/components/ActiveFilterChips'

// Provide a controllable mock of next/navigation
let query = ''
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
  usePathname: () => '/reports/standard/retail-sales-by-channel',
  useSearchParams: () => ({ toString: () => query }),
}))

describe('ActiveFilterChips Clear All', () => {
  afterEach(() => { query = ''; jest.clearAllMocks(); jest.resetModules() })

  it('renders Clear all when multiple filters and clears them', () => {
    // Arrange: two filters active
    query = 'channel=Online&minMargin=20'
    const pushes: string[] = []
    const nav = require('next/navigation')
    nav.useRouter = () => ({
      push: (path: string) => { pushes.push(path) },
      replace: jest.fn(), back: jest.fn(), refresh: jest.fn(),
    })

    render(<ActiveFilterChips slug="retail-sales-by-channel" />)

    expect(screen.getByText('Channel: Online')).toBeInTheDocument()
    expect(screen.getByText('Min margin %: 20')).toBeInTheDocument()
    const clearAll = screen.getByRole('button', { name: /Clear all filters/i })

    // Act
    fireEvent.click(clearAll)

    // Assert: only non-filter params remain in URL; in this test there are none
    expect(pushes[0]).toBe('/reports/standard/retail-sales-by-channel')
  })

  it('does not render Clear all when single filter', () => {
    query = 'channel=POS'
    render(<ActiveFilterChips slug="retail-sales-by-channel" />)
    expect(screen.queryByRole('button', { name: /Clear all filters/i })).toBeNull()
  })
})
