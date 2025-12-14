import React from 'react'
import { render, screen } from '@testing-library/react'
import DashboardTopBar from '@/components/DashboardTopBar'

jest.mock('next/navigation', () => ({ usePathname: () => '/dashboard/overview' }))

describe('DashboardTopBar', () => {
  it('renders and sets Overview active for /dashboard/overview', () => {
    render(<DashboardTopBar />)
    const overviewBtn = screen.getByRole('link', { name: /Go to Overview/i })
    expect(overviewBtn).toBeInTheDocument()
    // check for primary class (active) when path is /dashboard/overview
    expect(overviewBtn.className).toMatch(/btn-primary/)
  })
})
