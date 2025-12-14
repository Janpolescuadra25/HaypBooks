import React from 'react'
import { render, screen } from '@testing-library/react'
import TransactionsNav from '@/components/TransactionsNav'

// Mock next/navigation to control pathname
jest.mock('next/navigation', () => ({
  usePathname: () => '/transactions/chart-of-accounts/details',
}))

describe('TransactionsNav active state', () => {
  it('marks parent link active for nested paths', () => {
    render(<TransactionsNav />)
    const link = screen.getByRole('link', { name: /chart of accounts/i })
    expect(link.className).toMatch(/btn-primary/)
  })
})
