import React from 'react'
import { render, screen, within } from '@testing-library/react'
import BankTransactionsLayout from '@/app/bank-transactions/layout'

// Mock next/navigation to keep pathname stable and avoid router actions
jest.mock('next/navigation', () => ({
  usePathname: () => '/bank-transactions',
}))

describe('BankTransactionsLayout sub-nav render', () => {
  it('renders Transactions sub-nav once with key links', () => {
    render(
      <BankTransactionsLayout>
        <div>Child</div>
      </BankTransactionsLayout>
    )
    // It should include Chart of accounts link
    const chartLink = screen.getByRole('link', { name: /chart of accounts/i })
    expect(chartLink).toBeInTheDocument()
    // Count Transactions sub-nav containers by the presence of a known link
    const allChartLinks = screen.getAllByRole('link', { name: /chart of accounts/i })
    // Only one instance from the sub-nav should be present
    expect(allChartLinks.length).toBe(1)
  })
})
