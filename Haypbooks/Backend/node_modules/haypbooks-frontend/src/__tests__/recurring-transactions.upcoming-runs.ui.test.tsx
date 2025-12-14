import { render, screen } from '@testing-library/react'
import RecurringTransactionsPage from '@/app/transactions/recurring-transactions/page'

describe('Recurring Transactions Page - Upcoming runs column', () => {
  it('shows the Upcoming column', async () => {
    render(<RecurringTransactionsPage />)
    const table = await screen.findByRole('table', { name: /recurring templates/i })
    // Header contains Upcoming
    expect(await screen.findByText(/upcoming/i)).toBeInTheDocument()
    expect(table).toBeInTheDocument()
  })
})
