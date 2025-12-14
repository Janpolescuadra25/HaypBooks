/** @jest-environment jsdom */
import { render } from '@testing-library/react'

jest.mock('next/navigation', () => {
  let q = ''
  return {
    __setQuery: (v: string) => { q = v },
    useSearchParams: () => ({ toString: () => q }),
    // Provide minimal router + pathname needed by ActiveFilterChips
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
    usePathname: () => '/reports/standard/retail-sales-by-channel',
  }
})

// Do not render the chip component in this test; we only verify the bar's conditional wrapper
jest.mock('@/components/ActiveFilterChips', () => ({ __esModule: true, default: () => null }))

describe('ActiveFilterBar', () => {
  afterEach(() => { jest.resetModules(); jest.clearAllMocks() })

  it('does not render when no filters', async () => {
    const { default: ActiveFilterBar } = await import('@/components/ActiveFilterBar')
    const { container } = render(<ActiveFilterBar slug="retail-sales-by-channel" />)
    expect(container.querySelector('.glass-card')).toBeNull()
  })

  it('renders when at least one filter is present', async () => {
    const nav = require('next/navigation')
    nav.__setQuery('channel=Online')
    const { default: ActiveFilterBar } = await import('@/components/ActiveFilterBar')
    const { container } = render(<ActiveFilterBar slug="retail-sales-by-channel" />)
    expect(container.querySelector('.glass-card')).not.toBeNull()
  })
})
