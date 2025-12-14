/** @jest-environment jsdom */
import { render, screen, fireEvent } from '@testing-library/react'
import ActiveFilterChips from '@/components/ActiveFilterChips'

// Base mock matching project conventions
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
  usePathname: () => '/reports/standard/retail-sales-by-channel',
  useSearchParams: () => ({ toString: () => '' }),
}))

describe('ActiveFilterChips', () => {
  const originalModules = { }
  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  test('renders chips and clears individual filters', () => {
    const pushes: string[] = []
    const mod = require('next/navigation')
    mod.useRouter = () => ({
      push: (path: string) => { pushes.push(path) },
      replace: jest.fn(), back: jest.fn(), refresh: jest.fn(),
    })
    mod.usePathname = () => '/reports/standard/retail-sales-by-channel'
    mod.useSearchParams = () => ({ toString: () => 'channel=POS&minMargin=50' })

    render(<ActiveFilterChips slug="retail-sales-by-channel" />)

    expect(screen.getByText('Channel: POS')).toBeInTheDocument()
    expect(screen.getByText('Min margin %: 50')).toBeInTheDocument()

    const clearBtns = screen.getAllByRole('button')
    fireEvent.click(clearBtns[0])
    expect(pushes[0]).toBe('/reports/standard/retail-sales-by-channel?minMargin=50')
  })
})
