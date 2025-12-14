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

describe('ActiveFilterChips overflow', () => {
  afterEach(() => { query = ''; jest.clearAllMocks(); jest.resetModules() })

  it('shows +N more when more than 3 filters', () => {
    query = 'channel=Online&minMargin=20&minUtil=80&minTurn=2&segment=SMB'
    render(<ActiveFilterChips slug="retail-sales-by-channel" />)

    // First 3 chips visible
    expect(screen.getByText('Channel: Online')).toBeInTheDocument()
    expect(screen.getByText('Min margin %: 20')).toBeInTheDocument()
    expect(screen.getByText('Min util %: 80')).toBeInTheDocument()

    // Overflow control visible with correct count
    const moreBtn = screen.getByRole('button', { name: /Show 2 more filters/i })
    expect(moreBtn).toBeInTheDocument()

    // Hidden chips not yet visible
    expect(screen.queryByText('Min turns: 2')).toBeNull()
    expect(screen.queryByText('Segment: SMB')).toBeNull()

    // Expand
    fireEvent.click(moreBtn)

    // Now hidden chips appear and control swaps to Show less
    expect(screen.getByText('Min turns: 2')).toBeInTheDocument()
    expect(screen.getByText('Segment: SMB')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Show fewer filters/i })).toBeInTheDocument()
  })
})
